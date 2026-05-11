import SiteHeader from '@/components/SiteHeader'

export const metadata = {
  title: 'Tune — Lemnisca',
}

export default function TunePage() {
  return (
    <div className="page_shell">
      <SiteHeader />
      <main className="page_shell_main" />
    </div>
  )
}
