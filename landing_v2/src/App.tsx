import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FlaskConical, FlaskConicalOff, TrendingUp, TrendingDown, Target, CircleAlert, Linkedin } from 'lucide-react'
import './App.css'
import logo from "../src/assets/logo.svg"
import heroGraphic from '../src/assets/hero_loop1.gif'
import shilpaPhoto from '../src/assets/team/shilpa.png'
import pushkarPhoto from '../src/assets/team/pushkar.png'
import LogoMarquee from './components/LogoMarquee'

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
      gsap.set('.hero_word', { opacity: 0, y: 80, rotateX: -40 })
      gsap.set('.hero_main_text_subheading', { opacity: 0, y: 30 })
      gsap.set('.hero_footer', { opacity: 0, y: 20 })
      gsap.set('.hero_main_graphic', { opacity: 0, scale: 0.9, rotate: -5 })
      
      // Animate header
      heroTl.to('.hero_header', {
        opacity: 1,
        y: 0,
        duration: 0.8,
      })
      
      // Animate heading words with stagger
      .to('.hero_word', {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 1,
        stagger: 0.08,
        ease: 'power4.out',
      }, '-=0.4')
      
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
      
      // Animate graphic with rotation
      .to('.hero_main_graphic', {
        opacity: 1,
        scale: 1,
        rotate: 0,
        duration: 1.4,
        ease: 'power2.out',
      }, '-=1.2')

      // Subtle floating animation for the graphic
      gsap.to('.hero_main_graphic', {
        y: -10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2,
      })

      // Problem section - staggered card reveal
      gsap.fromTo('.problem_intro', 
        { opacity: 0, y: 60 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.problem',
            start: 'top 80%',
          }
        }
      )

      // ========== PROBLEM SECTION LINE ANIMATION ==========
      // Build two parallel trace paths - top and bottom halves tracing box borders
      const buildTracePaths = () => {
        const cards = document.querySelectorAll('.problem_card')
        const wrapper = document.querySelector('.problem_cards_wrapper')
        
        if (!cards.length || !wrapper) return { top: '', bottom: '' }
        
        const wrapperRect = wrapper.getBoundingClientRect()
        const getRelativePos = (el: Element) => {
          const rect = el.getBoundingClientRect()
          return {
            left: rect.left - wrapperRect.left,
            top: rect.top - wrapperRect.top,
            right: rect.right - wrapperRect.left,
            bottom: rect.bottom - wrapperRect.top,
            midY: rect.top - wrapperRect.top + rect.height / 2
          }
        }
        
        const card1 = getRelativePos(cards[0])
        const card2 = getRelativePos(cards[1])
        const card3 = getRelativePos(cards[2])
        
        // Upper path: traces top edges and right sides going down, left sides going up
        // Start left-mid box1 → up → across top → down right → connector → up left box2 → across top → down right → connector → up left box3 → across top → down to mid-right
        const topPath = `
          M ${card1.left} ${card1.midY}
          L ${card1.left} ${card1.top}
          L ${card1.right} ${card1.top}
          L ${card1.right} ${card1.midY}
          L ${card2.left} ${card2.midY}
          L ${card2.left} ${card2.top}
          L ${card2.right} ${card2.top}
          L ${card2.right} ${card2.midY}
          L ${card3.left} ${card3.midY}
          L ${card3.left} ${card3.top}
          L ${card3.right} ${card3.top}
          L ${card3.right} ${card3.midY}
        `
        
        // Lower path: traces bottom edges and right sides going up, left sides going down
        // Start left-mid box1 → down → across bottom → up right → connector → down left box2 → across bottom → up right → connector → down left box3 → across bottom → up to mid-right
        const bottomPath = `
          M ${card1.left} ${card1.midY}
          L ${card1.left} ${card1.bottom}
          L ${card1.right} ${card1.bottom}
          L ${card1.right} ${card1.midY}
          L ${card2.left} ${card2.midY}
          L ${card2.left} ${card2.bottom}
          L ${card2.right} ${card2.bottom}
          L ${card2.right} ${card2.midY}
          L ${card3.left} ${card3.midY}
          L ${card3.left} ${card3.bottom}
          L ${card3.right} ${card3.bottom}
          L ${card3.right} ${card3.midY}
        `
        
        return { top: topPath, bottom: bottomPath }
      }
      
      // Set initial states
      gsap.set('.problem_card', { opacity: 0 })
      gsap.set('.problem_connector', { opacity: 1 })
      
      // Create the scroll trigger
      ScrollTrigger.create({
        trigger: '.problem_cards',
        start: 'top 75%',
        once: true,
        onEnter: () => {
          const paths = buildTracePaths()
          const traceTop = document.querySelector('.trace_top')
          const traceBottom = document.querySelector('.trace_bottom')
          
          if (traceTop && traceBottom && paths.top && paths.bottom) {
            traceTop.setAttribute('d', paths.top)
            traceBottom.setAttribute('d', paths.bottom)
            
            const topLength = (traceTop as SVGPathElement).getTotalLength()
            const bottomLength = (traceBottom as SVGPathElement).getTotalLength()
            
            // Timing settings
            const boxDuration = 1      // Time to trace around a box
            const connectorDuration = 0.4 // Time to cross connector (adjust this for speed)
            const trailExitDuration = 0.5 // Time for trail to exit box
            
            const topTrail = topLength * 0.35
            const bottomTrail = bottomLength * 0.35
            
            // Each box is ~33% of path, connector is the gap between
            const box1End = 0.30      // End of box 1 border
            const conn1End = 0.33     // End of connector 1
            const box2End = 0.63      // End of box 2 border
            const conn2End = 0.66     // End of connector 2
            const box3End = 1.0       // End of box 3 border
            
            // Set initial state
            gsap.set('.trace_top', { strokeDasharray: `${topTrail} ${topLength}`, strokeDashoffset: topTrail })
            gsap.set('.trace_bottom', { strokeDasharray: `${bottomTrail} ${bottomLength}`, strokeDashoffset: bottomTrail })
            
            const traceTl = gsap.timeline()
            
            // === BOX 1 ===
            gsap.set('.problem_card[data-card="1"]', { opacity: 1 })
            traceTl
              // Trace box 1
              .to('.trace_top', { strokeDashoffset: topTrail - (topLength * box1End), duration: boxDuration, ease: 'none' }, 0)
              .to('.trace_bottom', { strokeDashoffset: bottomTrail - (bottomLength * box1End), duration: boxDuration, ease: 'none',
                onComplete: () => setFailedBoxes(prev => prev.includes(1) ? prev : [...prev, 1])
              }, 0)
              // Trail exits box 1 while crossing connector
              .to('.trace_top', { strokeDashoffset: topTrail - (topLength * conn1End), duration: connectorDuration, ease: 'none' })
              .to('.trace_bottom', { strokeDashoffset: bottomTrail - (bottomLength * conn1End), duration: connectorDuration, ease: 'none' }, '<')
              // === BOX 2 ===
              .add(() => { gsap.set('.problem_card[data-card="2"]', { opacity: 1 }) })
              // Trace box 2
              .to('.trace_top', { strokeDashoffset: topTrail - (topLength * box2End), duration: boxDuration, ease: 'none' })
              .to('.trace_bottom', { strokeDashoffset: bottomTrail - (bottomLength * box2End), duration: boxDuration, ease: 'none',
                onComplete: () => setFailedBoxes(prev => prev.includes(2) ? prev : [...prev, 2])
              }, '<')
              // Trail exits box 2 while crossing connector
              .to('.trace_top', { strokeDashoffset: topTrail - (topLength * conn2End), duration: connectorDuration, ease: 'none' })
              .to('.trace_bottom', { strokeDashoffset: bottomTrail - (bottomLength * conn2End), duration: connectorDuration, ease: 'none' }, '<')
              // === BOX 3 ===
              .add(() => { gsap.set('.problem_card[data-card="3"]', { opacity: 1 }) })
              // Trace box 3
              .to('.trace_top', { strokeDashoffset: topTrail - (topLength * box3End), duration: boxDuration, ease: 'none' })
              .to('.trace_bottom', { strokeDashoffset: bottomTrail - (bottomLength * box3End), duration: boxDuration, ease: 'none',
                onComplete: () => setFailedBoxes(prev => prev.includes(3) ? prev : [...prev, 3])
              }, '<')
              // Trail exits completely
              .to('.trace_top', { strokeDashoffset: -topLength, duration: trailExitDuration, ease: 'none' })
              .to('.trace_bottom', { strokeDashoffset: -bottomLength, duration: trailExitDuration, ease: 'none' }, '<')
          }
        }
      })

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
        <div className='hero_header'>
          <img src={logo} alt="lemnisca"/>
          <button>Enter the loop</button>
        </div>

        <div className='hero_main'>
          <div className='hero_main_text'>
            <h1 className='hero_main_text_heading'>
              <span className='hero_word'>Rebuilding</span>
              <span className='hero_word'>manufacturing</span>
              <span className='hero_word'>for a</span>
              <span className='hero_word'>constrained</span>
              <span className='hero_word'>world</span>
            </h1>
            <p className='hero_main_text_subheading'>A science-first system where design, data, and fabrication feed back into each other — locally, continuously, endlessly.</p>
            <div className='hero_footer'>
              <button className='btn-pill'>Explore →</button>
            </div>
          </div>
          <img className='hero_main_graphic' src={heroGraphic} alt="heroGraphic" />
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className='problem'>
        <div className='problem_intro'>
          <p className='problem_label'>Traditional scale-up follows the same path</p>
          <h2 className='problem_heading'>But it <span className='highlight'>falters</span> at every stage</h2>
        </div>
        <div className='problem_cards_wrapper'>
          {/* Two parallel trace paths - top and bottom */}
          <svg className='problem_trace_svg' preserveAspectRatio="none">
            <path className='trace_line trace_top' d="" fill="none" />
            <path className='trace_line trace_bottom' d="" fill="none" />
          </svg>
          
          <div className='problem_cards'>
            <div className='problem_card' data-card="1">
              <div className={`problem_icon ${failedBoxes.includes(1) ? 'failed' : ''}`}>
                <span className="icon-normal"><FlaskConical strokeWidth={1} /></span>
                <span className="icon-failed"><FlaskConicalOff strokeWidth={1} /></span>
              </div>
              <h3>Low adaptability in the lab</h3>
              <p>Manual processes can't keep pace with the complexity of modern bioprocesses</p>
            </div>
            
            <div className='problem_connector' data-connector="1"></div>
            
            <div className='problem_card' data-card="2">
              <div className={`problem_icon ${failedBoxes.includes(2) ? 'failed' : ''}`}>
                <span className="icon-normal"><TrendingUp strokeWidth={1} /></span>
                <span className="icon-failed"><TrendingDown strokeWidth={1} /></span>
              </div>
              <h3>Inability to maintain performance at scale</h3>
              <p>What works in the lab rarely translates directly to production environments</p>
            </div>
            
            <div className='problem_connector' data-connector="2"></div>
            
            <div className='problem_card' data-card="3">
              <div className={`problem_icon ${failedBoxes.includes(3) ? 'failed' : ''}`}>
                <span className="icon-normal"><Target strokeWidth={1} /></span>
                <span className="icon-failed"><CircleAlert strokeWidth={1} /></span>
              </div>
              <h3>Drift & variability at scale</h3>
              <p>Production processes drift over time without continuous optimization</p>
            </div>
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
