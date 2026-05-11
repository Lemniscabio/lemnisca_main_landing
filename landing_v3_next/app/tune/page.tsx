import ComingSoon from '@/components/coming_soon/ComingSoon'

export const metadata = {
  title: 'Tune | Lemnisca',
}

export default function TunePage() {
  return (
    <ComingSoon
      product="Tune"
      tagline="Move promising molecules from shake flask to pilot fermenters, faster. Full product launching soon."
      palette={{
        base: '#050a1f',
        orbs: ['#2A55E0', '#0A2A6B', '#F4E26B'],
        accent: '#F4E26B',
      }}
    />
  )
}
