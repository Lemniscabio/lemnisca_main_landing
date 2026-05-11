import ComingSoon from '@/components/coming_soon/ComingSoon'

export const metadata = {
  title: 'Thrust | Lemnisca',
}

export default function ThrustPage() {
  return (
    <ComingSoon
      product="Thrust"
      tagline="Move from pilot evidence to industrial-scale confidence. Full product launching soon."
      palette={{
        base: '#050d12',
        orbs: ['#1E4A5C', '#0B1F2A', '#E85D3A'],
        accent: '#E85D3A',
      }}
    />
  )
}
