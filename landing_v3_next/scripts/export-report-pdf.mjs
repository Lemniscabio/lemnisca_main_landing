import { readFile, writeFile } from 'node:fs/promises'

const APP_URL = process.env.REPORT_APP_URL || 'http://127.0.0.1:3002'
const DEBUG_URL = process.env.CHROME_DEBUG_URL || 'http://127.0.0.1:9224'
const OUTPUT = process.env.REPORT_PDF_OUTPUT || 'lemnisca-fermentation-report.pdf'

function parseEnv(source) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=')
        const key = line.slice(0, separator)
        const value = line.slice(separator + 1).replace(/^(["'])(.*)\1$/, '$2')
        return [key, value]
      })
  )
}

const env = { ...parseEnv(await readFile('.env.local', 'utf8')), ...process.env }
const authResponse = await fetch(`${APP_URL}/api/reports/auth`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ username: env.REPORT_USERNAME, password: env.REPORT_PASSWORD }),
})

if (!authResponse.ok) {
  throw new Error(`Report authentication failed with status ${authResponse.status}`)
}

const cookieHeader = authResponse.headers.get('set-cookie')
const cookieMatch = cookieHeader?.match(/^([^=]+)=([^;]+)/)
if (!cookieMatch) throw new Error('Report authentication did not return a cookie')

const targets = await fetch(`${DEBUG_URL}/json/list`).then((response) => response.json())
const target = targets.find((item) => item.type === 'page')
if (!target?.webSocketDebuggerUrl) throw new Error('No headless Chrome page target found')

const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})

let nextId = 1
const pending = new Map()
const eventWaiters = new Map()

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) reject(new Error(message.error.message))
    else resolve(message.result)
    return
  }

  const waiters = eventWaiters.get(message.method)
  if (waiters?.length) waiters.shift()(message.params)
})

function command(method, params = {}) {
  const id = nextId++
  socket.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }))
}

function waitForEvent(method) {
  return new Promise((resolve) => {
    const waiters = eventWaiters.get(method) || []
    waiters.push(resolve)
    eventWaiters.set(method, waiters)
  })
}

await command('Network.enable')
await command('Page.enable')
await command('Network.setCookie', {
  name: cookieMatch[1],
  value: cookieMatch[2],
  url: APP_URL,
})

const loaded = waitForEvent('Page.loadEventFired')
await command('Page.navigate', { url: `${APP_URL}/reports/${env.REPORT_ID}` })
await loaded
await new Promise((resolve) => setTimeout(resolve, 2500))

await command('Runtime.evaluate', {
  expression: "window.dispatchEvent(new Event('beforeprint'))",
})
await new Promise((resolve) => setTimeout(resolve, 2500))

const { data } = await command('Page.printToPDF', {
  printBackground: true,
  preferCSSPageSize: true,
  displayHeaderFooter: false,
})

await writeFile(OUTPUT, Buffer.from(data, 'base64'))
socket.close()
console.log(OUTPUT)
