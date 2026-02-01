import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './App.css'
import logo from "../src/assets/logo.svg"
import heroGraphic from '../src/assets/hero_loop1.gif'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const mainRef = useRef<HTMLDivElement>(null)

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

      gsap.fromTo('.problem_card', 
        { opacity: 0, y: 80 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.problem_cards',
            start: 'top 85%',
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

      // Backed by section
      gsap.fromTo('.backed_logos span', 
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.backed',
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

      // Final CTA
      gsap.fromTo('.final-cta_content', 
        { opacity: 0, y: 40 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.final-cta',
            start: 'top 80%',
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
        <div className='problem_cards'>
          <div className='problem_card'>
            <div className='problem_icon'>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h3>Low adaptability in the lab</h3>
            <p>Manual processes can't keep pace with the complexity of modern bioprocesses</p>
          </div>
          <div className='problem_card'>
            <div className='problem_icon'>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M3 3v18h18" />
                <path d="M7 16l4-4 4 4 5-6" />
              </svg>
            </div>
            <h3>Inability to maintain performance at scale</h3>
            <p>What works in the lab rarely translates directly to production environments</p>
          </div>
          <div className='problem_card'>
            <div className='problem_icon'>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
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
            <span className='cta_eyebrow'>Get Started</span>
            <h2>From months to days — make your bioprocess work for you.</h2>
            <p>Design your scale-up today.</p>
          </div>
          <button className='btn-primary'>Get started →</button>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className='team'>
        <div className='team_header'>
          <span className='team_eyebrow'>Leadership</span>
          <h2 className='team_heading'>Team</h2>
        </div>
        <div className='team_grid'>
          <div className='team_member'>
            <div className='member_photo'></div>
            <h3>Dr. Sarah Chen</h3>
            <p className='member_role'>CEO & Co-founder</p>
            <p className='member_bio'>Former Head of Bioprocess at Genentech. PhD in Chemical Engineering from MIT.</p>
          </div>
          <div className='team_member'>
            <div className='member_photo'></div>
            <h3>Dr. Marcus Webb</h3>
            <p className='member_role'>CTO & Co-founder</p>
            <p className='member_bio'>Ex-Google DeepMind. Pioneered ML applications in bioprocess optimization.</p>
          </div>
          <div className='team_member'>
            <div className='member_photo'></div>
            <h3>Dr. Elena Rodriguez</h3>
            <p className='member_role'>Chief Science Officer</p>
            <p className='member_bio'>20+ years in pharmaceutical manufacturing. Led scale-up at Novartis.</p>
          </div>
        </div>
      </section>

      {/* BACKED BY SECTION */}
      <section className='backed'>
        <p className='backed_label'>Backed by</p>
        <div className='backed_logos'>
          <span>Theia</span>
          <span>Pointone</span>
          <span>Scaler</span>
          <span>BBC</span>
          <span>Govt of KA</span>
          <span>IIIT DEF</span>
        </div>
      </section>

      {/* PREDICTION SECTION */}
      <section className='prediction'>
        <div className='prediction_content'>
          <span className='prediction_eyebrow'>Our Vision</span>
          <h2>We are working to integrate scale-up prediction</h2>
          <div className='prediction_stat'>
            <span className='prediction_from'>From 10x to</span>
            <span className='big-number'>100x</span>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className='final-cta'>
        <div className='final-cta_header'>
          <img src={logo} alt="lemnisca"/>
        </div>
        <div className='final-cta_content'>
          <h2>From months to days — make your bioprocess work for you.</h2>
          <div className='final-cta_visual'>
            <div className='visual_box'>
              <div className='visual_input'>
                <span className='visual_label'>Input</span>
                <span className='visual_text'>Parameters</span>
              </div>
              <div className='visual_arrow'>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
              <div className='visual_output'>
                <span className='visual_label'>Output</span>
                <span className='visual_text'>Optimized</span>
              </div>
            </div>
          </div>
          <button className='btn-secondary'>Start your journey →</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className='footer'>
        <div className='footer_main'>
          <div className='footer_brand'>
            <span className='footer_logo'>LEMNISCA</span>
            <p className='footer_tagline'>Rebuilding manufacturing for a constrained world.</p>
          </div>
        </div>
        <div className='footer_bottom'>
          <p>© {new Date().getFullYear()} Lemnisca. All rights reserved.</p>
          <div className='footer_legal_links'>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default App
