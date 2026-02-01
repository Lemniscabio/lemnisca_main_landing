import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FlaskConical, FlaskConicalOff, TrendingUp, TrendingDown, Target, CircleAlert, Linkedin } from 'lucide-react'
import './App.css'
import logo from "../src/assets/logo.svg"
import shilpaPhoto from '../src/assets/team/shilpa.png'
import pushkarPhoto from '../src/assets/team/pushkar.png'
import LogoMarquee from './components/LogoMarquee'
import Threads from './components/hero_bg/Threads'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const mainRef = useRef<HTMLDivElement>(null)
  const [failedBoxes, setFailedBoxes] = useState<number[]>([])

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

      // Solution section - flow animation
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

      gsap.fromTo('.platform_flow > *', 
        { opacity: 0, x: -30 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.platform_flow',
            start: 'top 80%',
          }
        }
      )

      gsap.fromTo('.solution_card', 
        { opacity: 0, y: 50, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.solution_details',
            start: 'top 85%',
          }
        }
      )

      // Stats section - number count up effect
      gsap.fromTo('.stat_item', 
        { opacity: 0, y: 40 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.stats',
            start: 'top 80%',
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

      gsap.fromTo('.team_member', 
        { opacity: 0, y: 60 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.team_grid',
            start: 'top 85%',
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
          <button>Enter the loop</button>
        </div>

        <div className='hero_main'>
          <div className='hero_content'>
            <span className='hero_eyebrow'>FROM LAB TO PRODUCTION</span>
            <h1 className='hero_main_text_heading'>
              <span className='hero_word'>Right-first-time</span>
              <span className='hero_word'>scale-up</span>
              <span className='hero_word'>for biomanufacturing</span>
            </h1>
            <p className='hero_main_text_subheading'>A science-first system where design, data, and fabrication feed back into each other — locally, continuously, endlessly.</p>
            <div className='hero_footer'>
              <button className='btn-primary'>Explore →</button>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className='problem'>
        <div className='problem_intro'>
          <p className='problem_label'>Traditional scale-up follows the same path</p>
          <h2 className='problem_heading'>But it <span className='highlight'>falters</span> at every stage</h2>
        </div>
        <div className='problem_cards'>
          <div className='problem_card' data-card="1">
            <div className={`problem_icon ${failedBoxes.includes(1) ? 'failed' : ''}`}>
              <span className="icon-normal"><FlaskConical strokeWidth={1} /></span>
              <span className="icon-failed"><FlaskConicalOff strokeWidth={1} /></span>
            </div>
            <h3>Low adaptability in the lab</h3>
            <p>Manual processes can't keep pace with the complexity of modern bioprocesses</p>
          </div>
          
          <div className='problem_card' data-card="2">
            <div className={`problem_icon ${failedBoxes.includes(2) ? 'failed' : ''}`}>
              <span className="icon-normal"><TrendingUp strokeWidth={1} /></span>
              <span className="icon-failed"><TrendingDown strokeWidth={1} /></span>
            </div>
            <h3>Inability to maintain performance at scale</h3>
            <p>What works in the lab rarely translates directly to production environments</p>
          </div>
          
          <div className='problem_card' data-card="3">
            <div className={`problem_icon ${failedBoxes.includes(3) ? 'failed' : ''}`}>
              <span className="icon-normal"><Target strokeWidth={1} /></span>
              <span className="icon-failed"><CircleAlert strokeWidth={1} /></span>
            </div>
            <h3>Drift & variability at scale</h3>
            <p>Production processes drift over time without continuous optimization</p>
          </div>
        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section className='solution'>
        <div className='solution_header'>
          <span className='solution_eyebrow'>Our Approach</span>
          <h2 className='solution_tagline'>Connecting R&D, scale-up and operations into one unified platform</h2>
        </div>
        <div className='solution_platform'>
          <div className='platform_flow'>
            <div className='platform_item'>
              <span className='platform_label'>Bioprocess as a Service</span>
            </div>
            <div className='platform_arrow'>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
            <div className='platform_group'>
              <div className='platform_box wet'>Wet lab</div>
              <div className='platform_box digital'>Digital twin</div>
            </div>
            <div className='platform_arrow'>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
            <div className='platform_group'>
              <div className='platform_box scaleup-box'>Scale-up prediction</div>
              <div className='platform_box operations'>Operations</div>
            </div>
          </div>
        </div>
        <div className='solution_details'>
          <div className='solution_card'>
            <div className='solution_card_number'>01</div>
            <h3>Wet Lab Integration</h3>
            <p>Automated data capture from your existing lab equipment and processes</p>
          </div>
          <div className='solution_card'>
            <div className='solution_card_number'>02</div>
            <h3>Digital Twin</h3>
            <p>Physics-informed models that learn and adapt to your specific bioprocess</p>
          </div>
          <div className='solution_card'>
            <div className='solution_card_number'>03</div>
            <h3>Scale-up Prediction</h3>
            <p>AI-driven predictions for optimal scale-up parameters and conditions</p>
          </div>
          <div className='solution_card'>
            <div className='solution_card_number'>04</div>
            <h3>Operations</h3>
            <p>Real-time optimization and monitoring for production environments</p>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className='stats'>
        <div className='stats_header'>
          <span className='stats_eyebrow'>Impact</span>
          <h2 className='stats_title'>Measurable results from day one</h2>
        </div>
        <div className='stats_grid'>
          <div className='stat_item'>
            <span className='stat_number'>3x</span>
            <span className='stat_label'>Faster development cycles</span>
            <span className='stat_desc'>Accelerate your path from lab to production</span>
          </div>
          <div className='stat_divider'></div>
          <div className='stat_item'>
            <span className='stat_number'>4 weeks</span>
            <span className='stat_label'>Average time to first prediction</span>
            <span className='stat_desc'>Start seeing insights almost immediately</span>
          </div>
          <div className='stat_divider'></div>
          <div className='stat_item'>
            <span className='stat_number'>80%</span>
            <span className='stat_label'>Reduction in failed batches</span>
            <span className='stat_desc'>Minimize waste and maximize yield</span>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className='cta'>
        <div className='cta_content'>
          <div className='cta_text'>
            <span className='cta_eyebrow'>Partner With Us</span>
            <h2>Ready to transform your bioprocess scale-up?</h2>
            <p>Let's discuss how we can accelerate your path from lab to production.</p>
          </div>
          <button className='btn-primary'>Book a call →</button>
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
                <ul className='member_bio'>
                  <li>PhD in Chemical Engineering</li>
                  <li>12+ years in manufacturing & R&D</li>
                  <li>Led manufacturing AI projects delivering &gt;$3M annual savings</li>
                  <li>Industry 4.0 consulting with Fortune 500 manufacturers</li>
                </ul>
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
                <ul className='member_bio'>
                  <li>PhD in Chemical Engineering</li>
                  <li>12+ years in R&D, manufacturing & business development</li>
                  <li>Built APAC office of Yokogawa Insilico Biotechnology</li>
                  <li>Scaled team 0→5 people, $0→$250K revenue in 3 years</li>
                </ul>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* SUPPORTED BY SECTION */}
      <LogoMarquee />

      {/* PREDICTION SECTION */}
      <section className='prediction'>
        <div className='prediction_wrapper'>
          <div className='prediction_content'>
            <span className='prediction_eyebrow'>Our Vision</span>
            <h2>We're building the future of bioprocess scale-up</h2>
            <div className='prediction_stat'>
              <span className='prediction_from'>From 10x to</span>
              <span className='big-number'>100x</span>
            </div>
            <p className='prediction_cta_text'>Interested in transforming your bioprocess? Join us as an early partner and shape the future of manufacturing.</p>
          </div>
          <div className='prediction_form'>
            <h3>Get early access</h3>
            <form>
              <input type="text" placeholder="First Name" />
              <input type="text" placeholder="Last Name" />
              <div className='form_row'>
                <input type="email" placeholder="Email" />
                <input type="tel" placeholder="Phone Number" />
              </div>
              <input type="text" placeholder="Organisation" />
              <textarea placeholder="Your message" rows={4}></textarea>
              <select defaultValue="">
                <option value="" disabled>How did you hear about us?</option>
                <option value="linkedin">LinkedIn</option>
                <option value="referral">Referral</option>
                <option value="search">Search Engine</option>
                <option value="event">Event/Conference</option>
                <option value="other">Other</option>
              </select>
              <button type="submit" className='btn-submit'>Let's collaborate</button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className='footer'>
        <div className='footer_content'>
          <div className='footer_bottom'>
            <p>© {new Date().getFullYear()} Lemnisca. All rights reserved.</p>
            <div className='footer_legal_links'>
              <a href="#contact">Book a call</a>
              <a href="#explore">Explore</a>
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
