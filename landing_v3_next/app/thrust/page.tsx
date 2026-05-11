import SiteHeader from '@/components/SiteHeader'

export const metadata = {
  title: 'Thrust — Lemnisca',
}

export default function ThrustPage() {
  return (
    <div className="page_shell">
      <SiteHeader />
      <main className="page_shell_main" />
    </div>
  )
}
