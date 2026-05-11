import ComingSoon from '@/components/coming_soon/ComingSoon'

export const metadata = {
  title: 'Torch | Lemnisca',
}

export default function TorchPage() {
  return (
    <ComingSoon
      product="Torch"
      tagline="Stop scaling up your fermentation process in the dark. Carry your Torch along. Full product launching soon."
      palette={{
        base: '#0A0306',
        orbs: ['#C73578', '#8B1E5C', '#F0A8C7'],
        accent: '#F0A8C7',
      }}
    />
  )
}
