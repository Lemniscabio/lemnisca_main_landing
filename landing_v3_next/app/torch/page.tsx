import SiteHeader from '@/components/SiteHeader'

export const metadata = {
  title: 'Torch — Lemnisca',
}

export default function TorchPage() {
  return (
    <div className="page_shell">
      <SiteHeader />
      <main className="page_shell_main" />
    </div>
  )
}
