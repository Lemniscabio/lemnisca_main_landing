import Marquee from 'react-fast-marquee'
import './LogoMarquee.css'

// Partner logos
import logoTheia from '../../assets/Landing_assets/partners_logo/theia.webp'
import logoPointOne from '../../assets/Landing_assets/partners_logo/pointOne.png'
import logoScaler from '../../assets/Landing_assets/partners_logo/scaler2.png'
import logoBbc from '../../assets/Landing_assets/partners_logo/bbc2.jpg'
import logoItbt from '../../assets/Landing_assets/partners_logo/itbt.jpg'
import logoYokogawa from '../../assets/Landing_assets/partners_logo/yokogawa.png'

function LogoMarquee() {
  return (
    <section className='supported'>
      <p className='supported_label'>Supported By</p>
      <Marquee
        speed={100}
        gradient={true}
        gradientColor="white"
        gradientWidth={100}
        // pauseOnHover={true}
      >
        <img src={logoTheia} alt="Theia" className='logo-theia' />
        <img src={logoPointOne} alt="PointOne" className='logo-pointone' />
        <img src={logoScaler} alt="Scaler" className='logo-scaler' />
        <img src={logoBbc} alt="BBC" className='logo-bbc' />
        <img src={logoItbt} alt="ITBT" className='logo-itbt' />
        <img src={logoYokogawa} alt="Yokogawa" className='logo-yokogawa' />
        
        <img src={logoTheia} alt="Theia" className='logo-theia' />
        <img src={logoPointOne} alt="PointOne" className='logo-pointone' />
        <img src={logoScaler} alt="Scaler" className='logo-scaler' />
        <img src={logoBbc} alt="BBC" className='logo-bbc' />
        <img src={logoItbt} alt="ITBT" className='logo-itbt' />
        <img src={logoYokogawa} alt="Yokogawa" className='logo-yokogawa' />
        
        <img src={logoTheia} alt="Theia" className='logo-theia' />
        <img src={logoPointOne} alt="PointOne" className='logo-pointone' />
        <img src={logoScaler} alt="Scaler" className='logo-scaler' />
        <img src={logoBbc} alt="BBC" className='logo-bbc' />
        <img src={logoItbt} alt="ITBT" className='logo-itbt' />
        <img src={logoYokogawa} alt="Yokogawa" className='logo-yokogawa' />
        
        <img src={logoTheia} alt="Theia" className='logo-theia' />
        <img src={logoPointOne} alt="PointOne" className='logo-pointone' />
        <img src={logoScaler} alt="Scaler" className='logo-scaler' />
        <img src={logoBbc} alt="BBC" className='logo-bbc' />
        <img src={logoItbt} alt="ITBT" className='logo-itbt' />
        <img src={logoYokogawa} alt="Yokogawa" className='logo-yokogawa' />

      </Marquee>
    </section>
  )
}

export default LogoMarquee
