import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FlaskConical, FlaskConicalOff, TrendingUp, TrendingDown, Target, CircleAlert, Linkedin, ArrowRight } from 'lucide-react'
import './App.css'
import logo from "../src/assets/logo.svg"
import shilpaPhoto from '../src/assets/team/shilpa.png'
import pushkarPhoto from '../src/assets/team/pushkar.png'
import LogoMarquee from './components/partners_marquee/LogoMarquee'
import Threads from './components/hero_bg/Threads'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const mainRef = useRef<HTMLDivElement>(null)
  const [failedBoxes, setFailedBoxes] = useState<number[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organisation: '',
    heardFrom: '',
    message: '',
  })
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [formError, setFormError] = useState('')

  const MAX_MESSAGE_LENGTH = 500

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormStatus('loading')
    setFormError('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setFormStatus('success')
        setFormData({ name: '', email: '', organisation: '', heardFrom: '', message: '' })
      } else {
        setFormStatus('error')
        setFormError(data.message || 'Something went wrong')
      }
    } catch {
      setFormStatus('error')
      setFormError('Failed to submit. Please try again.')
    }
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // ========== HERO ENTRANCE ANIMATIONS ==========
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      
      // Set initial states
      gsap.set('.hero_header', { opacity: 0, y: -20 })
      gsap.set('.hero_eyebrow', { opacity: 0, y: 20 })
      gsap.set('.hero_word', { opacity: 0, y: 40 })
      gsap.set('.hero_main_text_subheading', { opacity: 0, y: 30 })
      gsap.set('.hero_footer', { opacity: 0, y: 20 })
      
      // Animate header
      heroTl.to('.hero_header', {
        opacity: 1,
        y: 0,
        duration: 0.8,
      })
      
      // Animate eyebrow
      .to('.hero_eyebrow', {
        opacity: 1,
        y: 0,
        duration: 0.6,
      }, '-=0.3')
      
      // Animate heading words with stagger
      .to('.hero_word', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: 'power4.out',
      }, '-=0.3')
      
      // Animate subheading
      .to('.hero_main_text_subheading', {
        opacity: 1,
        y: 0,
        duration: 0.8,
      }, '-=0.5')
      
      // Animate CTA button
      .to('.hero_footer', {
        opacity: 1,
        y: 0,
        duration: 0.6,
      }, '-=0.4')

      // Problem section - all content fades in together
      gsap.fromTo('.problem_intro, .problem_cards', 
        { opacity: 0, y: 60 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.problem',
            start: 'top 80%',
          },
          onComplete: () => {
            // After content appears, change icons one by one with 1s gap
            setTimeout(() => setFailedBoxes(prev => [...prev, 1]), 500)
            setTimeout(() => setFailedBoxes(prev => [...prev, 2]), 1500)
            setTimeout(() => setFailedBoxes(prev => [...prev, 3]), 2500)
          }
        }
      )

      // Solution section - Radial diagram animation
      gsap.fromTo('.solution_header', 
        { opacity: 0, y: 40 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.solution',
            start: 'top 75%',
          }
        }
      )

      // Loop diagram animation
      gsap.fromTo('.loop_core', 
        { opacity: 0, scale: 0.8 },
        { 
          opacity: 1, 
          scale: 1, 
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.loop_diagram',
            start: 'top 70%',
          }
        }
      )

      gsap.fromTo('.loop_node', 
        { opacity: 0, scale: 0.9 },
        { 
          opacity: 1, 
          scale: 1, 
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.loop_diagram',
            start: 'top 65%',
          }
        }
      )

      gsap.fromTo('.loop_connections', 
        { opacity: 0 },
        { 
          opacity: 1, 
          duration: 1,
          delay: 0.3,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.loop_diagram',
            start: 'top 65%',
          }
        }
      )

      // CTA section
      gsap.fromTo('.cta_content', 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.cta',
            start: 'top 80%',
          }
        }
      )

      // Team section
      gsap.fromTo('.team_heading', 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.team',
            start: 'top 80%',
          }
        }
      )

      gsap.fromTo('.team_card', 
        { opacity: 0, y: 60 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.team_grid',
            start: 'top 90%',
          }
        }
      )

      // Supported by section - fade in
      gsap.fromTo('.supported_label', 
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.supported',
            start: 'top 85%',
          }
        }
      )

      // Prediction section - big number reveal
      gsap.fromTo('.big-number', 
        { opacity: 0, scale: 0.8 },
        { 
          opacity: 1, 
          scale: 1, 
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.prediction',
            start: 'top 70%',
          }
        }
      )

      // Prediction form animation
      gsap.fromTo('.prediction_form', 
        { opacity: 0, x: -40 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.prediction',
            start: 'top 70%',
          }
        }
      )

      // Footer
      gsap.fromTo('.footer > *', 
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.footer',
            start: 'top 90%',
          }
        }
      )

    }, mainRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className='main' ref={mainRef}>

      {/* HERO SECTION */}
      <section className='hero'>
        <div className='hero_background_graphic'>
          <Threads color={[1, 1, 1]} amplitude={1} distance={0} enableMouseInteraction={true} />
        </div>
        <div className='hero_header'>
          <img src={logo} alt="lemnisca"/>
          <a href="#prediction"><button>Enter the loop</button></a>
        </div>

        <div className='hero_main'>
          <div className='hero_content'>
            <span className='hero_eyebrow'>FROM LAB TO PRODUCTION</span>
            <h1 className='hero_main_text_heading'>
              <span className='hero_word'>Right-first-time</span>
              <span className='hero_word'>scale-up</span>
              <span className='hero_word'>for biomanufacturing</span>
            </h1>
            <p className='hero_main_text_subheading'>Biology meets AI to make biomanufacturing predictable.</p>
            <div className='hero_footer'>
              <a href="#problem"><button className='btn-primary'>Explore <ArrowRight size={18} /></button></a>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className='problem' id='problem'>
        <div className='problem_intro'>
          <span className='problem_eyebrow'>The Problem</span>
          <h2 className='problem_heading'>Bioprocesses <span className='highlight'>falter</span> at every stage</h2>
        </div>
        <div className='problem_cards'>
          <div className='problem_card' data-card="1">
            <div className={`problem_icon ${failedBoxes.includes(1) ? 'failed' : ''}`}>
              <span className="icon-normal"><FlaskConical strokeWidth={1} /></span>
              <span className="icon-failed"><FlaskConicalOff strokeWidth={1} /></span>
            </div>
            <h3>R&D</h3>
            <p>Bioprocesses fail to achieve commercially meaningful productivity</p>
          </div>
          
          <div className='problem_card' data-card="2">
            <div className={`problem_icon ${failedBoxes.includes(2) ? 'failed' : ''}`}>
              <span className="icon-normal"><TrendingUp strokeWidth={1} /></span>
              <span className="icon-failed"><TrendingDown strokeWidth={1} /></span>
            </div>
            <h3>Scale-up</h3>
            <p>Bioprocess performance dips at scale</p>
          </div>
          
          <div className='problem_card' data-card="3">
            <div className={`problem_icon ${failedBoxes.includes(3) ? 'failed' : ''}`}>
              <span className="icon-normal"><Target strokeWidth={1} /></span>
              <span className="icon-failed"><CircleAlert strokeWidth={1} /></span>
            </div>
            <h3>Manufacturing</h3>
            <p>Bioprocess performance drifts over time</p>
          </div>
        </div>
      </section>

      {/* SOLUTION SECTION - Radial Loop Diagram */}
      <section className='solution'>
        <div className='solution_header'>
          <span className='solution_eyebrow'>Our Approach</span>
          <h2 className='solution_tagline'>Building flight simulators for bioprocesses</h2>
        </div>
        
        {/* Radial Diagram */}
        <div className='loop_diagram'>
          {/* Curved connection lines SVG */}
          <svg className='loop_connections' viewBox="0 0 1000 580" preserveAspectRatio="xMidYMid meet">
            {/* Base paths - always visible */}
            <path className='connect_curve' d="M 280 120 Q 380 200 430 260" />
            <path className='connect_curve' d="M 720 120 Q 620 200 570 260" />
            <path className='connect_curve' d="M 280 460 Q 380 380 430 320" />
            <path className='connect_curve' d="M 720 460 Q 620 380 570 320" />
            
            {/* Glowing trace paths - animated */}
            <path className='connect_trace connect_trace--1' d="M 280 120 Q 380 200 430 260" />
            <path className='connect_trace connect_trace--2' d="M 720 120 Q 620 200 570 260" />
            <path className='connect_trace connect_trace--3' d="M 280 460 Q 380 380 430 320" />
            <path className='connect_trace connect_trace--4' d="M 720 460 Q 620 380 570 320" />
          </svg>

          {/* Center Core - Digital Twin */}
          <div className='loop_core'>
            <div className='loop_core_rings'>
              <div className='ring ring--outer'></div>
              <div className='ring ring--middle'></div>
              <div className='ring ring--inner'></div>
            </div>
            <div className='loop_core_content'>
              <span className='core_label'>CORE</span>
              <h3>Flight Simulator</h3>
              <p>The flight simulator learns bioprocess behavior from data using AI-ML while being grounded by rules of metabolism and reactor physics</p>
            </div>
          </div>

          {/* Orbital Nodes */}
          <div className='loop_node loop_node--tl' data-connection="tl">
            <div className='node_card'>
              <div className='node_icon'>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 3h6v2H9zM10 5v6l-4 8h12l-4-8V5"/>
                  <circle cx="12" cy="16" r="1"/>
                </svg>
              </div>
              <h4>Wet Lab</h4>
              <p>Every fermentation run produces raw empirical data that feeds directly into the flight simulator.</p>
            </div>
          </div>

          <div className='loop_node loop_node--tr' data-connection="tr">
            <div className='node_card'>
              <div className='node_icon'>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <path d="M8 21h8M12 17v4"/>
                  <path d="M7 8l3 3-3 3M12 14h5"/>
                </svg>
              </div>
              <h4>Virtual R&D lab</h4>
              <p>Discovers the best recipe by running thousands of virtual experiments in minutes.</p>
            </div>
          </div>

          <div className='loop_node loop_node--bl' data-connection="bl">
            <div className='node_card'>
              <div className='node_icon'>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 3v18h18"/>
                  <path d="M7 14l4-4 4 4 5-6"/>
                  <circle cx="20" cy="8" r="2"/>
                </svg>
              </div>
              <h4>Scale-up Guidance</h4>
              <p>Discovers operating ranges that maintain performance at scale.</p>
            </div>
          </div>

          <div className='loop_node loop_node--br' data-connection="br">
            <div className='node_card'>
              <div className='node_icon'>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                </svg>
              </div>
              <h4>Manufacturing support</h4>
              <p>Predicts bioprocess outcomes in real-time to aid control of drifting processes.</p>
            </div>
          </div>
        </div>

        {/* Mobile Bento Grid - visible only on mobile */}
        <div className='mobile_bento_grid'>
          <div className='mobile_bento_card'>
            <span className='mobile_bento_number'>01</span>
            <h3>Wet Lab</h3>
            <span className='mobile_bento_tagline'>High quality data</span>
            <p>Every fermentation run produces raw empirical data that feeds directly into the flight simulator.</p>
          </div>

          <div className='mobile_bento_card mobile_bento_card--core'>
            <span className='mobile_bento_number'>02</span>
            <span className='mobile_bento_badge'>Core</span>
            <h3>Flight Simulator</h3>
            <span className='mobile_bento_tagline'>Predictive model</span>
            <p>The flight simulator learns bioprocess behavior from data using AI-ML while being grounded by rules of metabolism and reactor physics.</p>
          </div>

          <div className='mobile_bento_card'>
            <span className='mobile_bento_number'>03</span>
            <h3>Virtual R&D Lab</h3>
            <span className='mobile_bento_tagline'>Best recipe</span>
            <p>Discovers the best recipe by running thousands of virtual experiments in minutes.</p>
          </div>

          <div className='mobile_bento_card'>
            <span className='mobile_bento_number'>04</span>
            <h3>Scale-up Guidance</h3>
            <span className='mobile_bento_tagline'>De-risk transfer</span>
            <p>Discovers operating ranges that maintain performance at scale.</p>
          </div>

          <div className='mobile_bento_card'>
            <span className='mobile_bento_number'>05</span>
            <h3>Manufacturing Support</h3>
            <span className='mobile_bento_tagline'>Stable production</span>
            <p>Predicts bioprocess outcomes in real-time to aid control of drifting processes.</p>
          </div>
        </div>

      </section>

      {/* CTA SECTION */}
      <section className='cta' id='cta'>
        <div className='cta_content'>
          <div className='cta_text'>
            <span className='cta_eyebrow'>Partner With Us</span>
            <h2>Ready to transform your bioprocess scale-up?</h2>
            <p>Let's discuss how we can accelerate your path from lab to production.</p>
          </div>
          <a href="https://calendly.com/pushkarpendse/30min" target="_blank" rel="noopener noreferrer">
            <button className='btn-primary'>Book a call <ArrowRight size={18} /></button>
          </a>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className='team'>
        <div className='team_header'>
          <span className='team_eyebrow'>Leadership</span>
          <h2 className='team_heading'>Team</h2>
        </div>
        <div className='team_grid'>
          <a href="https://www.linkedin.com/in/pushkar-pendse/" target="_blank" rel="noopener noreferrer" className='team_card'>
            <div className='team_card_image'>
              <img src={pushkarPhoto} alt="Pushkar Pendse" />
            </div>
            <div className='team_card_content'>
              <h3>Pushkar Pendse</h3>
              <p className='member_role'>CEO & Co-founder</p>
              <div className='team_card_hover'>
                <div className='click_indicator'><Linkedin size={20} /></div>
                <p className='member_bio_text'>Dr. Pushkar Pendse is a leader in AI-driven biomanufacturing with over a decade of global experience across pharma, biotech, and advanced manufacturing. A PhD in Complex Systems Modelling, he specializes in hybrid process models that combine first-principles engineering with machine learning. In prior roles, he delivered multi-million-dollar gains through predictive maintenance, process optimization, and digital transformation programs for global manufacturers. Today, he is CEO and Co-founder of Lemnisca Bio, building AI-native digital twins to make precision fermentation scalable, reliable, and production-ready.</p>
              </div>
            </div>
          </a>
          <a href="https://www.linkedin.com/in/shilpa-nargund/" target="_blank" rel="noopener noreferrer" className='team_card'>
            <div className='team_card_image'>
              <img src={shilpaPhoto} alt="Shilpa Nargund" />
            </div>
            <div className='team_card_content'>
              <h3>Shilpa Nargund</h3>
              <p className='member_role'>CTO & Co-founder</p>
              <div className='team_card_hover'>
                <div className='click_indicator'><Linkedin size={20} /></div>
                <p className='member_bio_text'>Dr. Shilpa Nargund is a chemical and metabolic engineer with 16+ years of experience at the intersection of bioprocess engineering and AI-driven modeling. A PhD in Chemical Engineering, she specializes in integrating wet-lab experimentation with data and computation to make biological manufacturing predictable. In a previous leadership role, she built Asia-Pacific operations from the ground up, scaling the team from 0 to 5 and revenue from $0 to $250K. Today, she is CTO and Co-founder of Lemnisca Bio, building an AI-native platform for scalable biomanufacturing.</p>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* SUPPORTED BY SECTION */}
      <LogoMarquee />

      {/* PREDICTION SECTION */}
      <section className='prediction' id='prediction'>
        <div className='prediction_wrapper'>
          <div className='prediction_content'>
            <span className='prediction_eyebrow'>Our Vision</span>
            <div className='prediction_stat'>
              <span className='prediction_from'>From Linear to</span>
              <span className='big-number'>Circular</span>
            </div>
            <h2>Making biology predictable so the circular economy can scale</h2>
            <p className='prediction_cta_text'>Biology is the ultimate manufacturing engine. Lemnisca exists to democratize the biomanufacturing engine by bridging the gap between innovation & industrial reality.</p>
          </div>
          <div className='prediction_form'>
            <h3>Work with us!</h3>
            {formStatus === 'success' ? (
              <div className='form_success'>
                <p>Thank you for reaching out! We'll be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit}>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Name *" 
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email *" 
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                />
                <input 
                  type="text" 
                  name="organisation"
                  placeholder="Organisation *" 
                  value={formData.organisation}
                  onChange={handleFormChange}
                  required
                />
                <textarea 
                  name="message"
                  placeholder="Your message (optional)" 
                  rows={4}
                  value={formData.message}
                  onChange={handleFormChange}
                  maxLength={MAX_MESSAGE_LENGTH}
                ></textarea>
                <div className='message_char_count'>
                  {formData.message.length}/{MAX_MESSAGE_LENGTH}
                </div>
                <select 
                  name="heardFrom"
                  value={formData.heardFrom}
                  onChange={handleFormChange}
                  required
                >
                  <option value="" disabled>How did you hear about us? *</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="referral">Referral</option>
                  <option value="search">Search Engine</option>
                  <option value="event">Event/Conference</option>
                  <option value="other">Other</option>
                </select>
                {formStatus === 'error' && (
                  <p className='form_error'>{formError}</p>
                )}
                <button 
                  type="submit" 
                  className='btn-submit'
                  disabled={formStatus === 'loading'}
                >
                  {formStatus === 'loading' ? 'Submitting...' : "Let's collaborate"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className='footer'>
        <div className='footer_content'>
          <div className='footer_bottom'>
            <p>© {new Date().getFullYear()} Lemnisca. All rights reserved.</p>
            <div className='footer_legal_links'>
              <a href="#cta">Book a call</a>
              <a href="#problem">Explore</a>
              <a href="#prediction">Enter the loop</a>
            </div>
          </div>
        </div>
        <div className='footer_brand_large'>
          <span className='footer_logo_large'>LEMNISCA</span>
        </div>
      </footer>

    </div>
  )
}

export default App
