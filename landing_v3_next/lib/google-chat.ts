interface LeadData {
  name: string
  email: string
  organisation: string
  heardFrom: string
  message: string | null
  createdAt: Date
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function buildGmailBody(data: LeadData): string {
  const received = data.createdAt.toUTCString()
  const messageBlock = data.message ?? '(no message)'

  return [
    '',
    '',
    '',
    '<----- Original form submission ----->',
    `Received: ${received}`,
    `From: ${data.name} <${data.email}>`,
    `Organisation: ${data.organisation}`,
    `Heard from: ${data.heardFrom}`,
    '',
    'Message:',
    messageBlock,
    '<----- End ----->',
  ].join('\n')
}

function buildCard(data: LeadData) {
  const timestamp =
    data.createdAt.toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
  const gmailCompose =
    'https://mail.google.com/mail/?view=cm&fs=1' +
    `&to=${encodeURIComponent(data.email)}` +
    `&su=${encodeURIComponent('Re: Lemnisca inquiry')}` +
    `&body=${encodeURIComponent(buildGmailBody(data))}`

  const widgets: unknown[] = [
    {
      decoratedText: {
        topLabel: 'Name',
        text: escapeHtml(data.name),
        startIcon: { knownIcon: 'PERSON' },
      },
    },
    {
      decoratedText: {
        topLabel: 'Email',
        text: escapeHtml(data.email),
        startIcon: { knownIcon: 'EMAIL' },
      },
    },
    {
      decoratedText: {
        topLabel: 'Organisation',
        text: escapeHtml(data.organisation),
      },
    },
    {
      decoratedText: {
        topLabel: 'Heard from',
        text: escapeHtml(data.heardFrom),
      },
    },
  ]

  if (data.message) {
    widgets.push({
      textParagraph: {
        text: `<b>Message:</b><br>${escapeHtml(data.message).replace(/\n/g, '<br>')}`,
      },
    })
  }

  widgets.push({
    buttonList: {
      buttons: [
        {
          text: 'Reply via Gmail',
          onClick: { openLink: { url: gmailCompose } },
        },
      ],
    },
  })

  return {
    cardsV2: [
      {
        cardId: 'contact-form-lead',
        card: {
          header: {
            title: 'New Lead — Lemnisca',
            subtitle: timestamp,
          },
          sections: [{ widgets }],
        },
      },
    ],
  }
}

export async function notifyNewLead(data: LeadData): Promise<void> {
  const url = process.env.GOOGLE_CHAT_WEBHOOK_URL
  if (!url) return

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(buildCard(data)),
    })
    if (!res.ok) {
      console.error(
        'Google Chat webhook non-2xx:',
        res.status,
        await res.text().catch(() => '')
      )
    }
  } catch (err) {
    console.error('Google Chat webhook failed:', err)
  }
}
