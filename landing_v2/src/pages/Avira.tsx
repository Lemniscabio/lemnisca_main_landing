import { useState } from 'react'
import './Avira.css'
import cta from '../assets/Avira_assets/automate.png'

function Avira() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setEmail('')
    }
  }

  return (
    <div className="avira-page">

      {/* NAV */}
      <nav className="avira-nav">
        <a href="/" className="avira-nav-logo">lemnisca</a>
        <span className="avira-nav-badge">avira</span>
      </nav>

      {/* HERO */}
      <section className="avira-hero">
        <div className="avira-hero-content">
          <p className="avira-eyebrow">For scientists, not dashboards</p>
          <h1 className="avira-headline">
            You don't need another tool.<br />
            <span className="avira-headline-accent">You need a second brain for experiments.</span>
          </h1>
          <p className="avira-subheadline">
            An AI research partner that remembers your decisions, designs better experiments, 
            and prevents the mistakes you discover three weeks later.
          </p>
          <p className="avira-supporting">For individual scientists working with real data.</p>

          {/* WAITLIST CTA */}
          <div className="avira-waitlist">
            {submitted ? (
              <div className="avira-waitlist-success">
                <p>You're in. We'll be in touch.</p>
              </div>
            ) : (
              <form className="avira-waitlist-form" id="avira-waitlist-form" onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="avira-waitlist-input"
                />
              </form>
            )}
            <p className="avira-waitlist-note">Waitlist opens in waves. No spam, ever.</p>
          </div>
        </div>
      </section>

      {/* FOOTER — untouched placement */}
      <footer className="avira-footer">
        <div className="footer-cta">
          <div className="logo-container">
            <div className="circle-bg"></div>
            <img src={cta} className="logo" alt="cta" />
            <button type="submit" form="avira-waitlist-form" className="avira-automate-btn avira-automate-btn--overlay">
              <span className="avira-automate-btn-text">Automate</span>
            </button>
          </div>
        </div>

        <div className="footer-bar">
          <p className="footer-copy">&copy; 2026 Lemnisca. All rights reserved.</p>
          <nav className="footer-links">
            <a href="#">Book a call</a>
            <a href="#">Explore</a>
            <a href="#">Enter the loop</a>
          </nav>
        </div>

        <div className="footer-big-brand">
          <p className="footer-brand">AVIRA</p>
          <p className="footer-sub">A product of <a href="https://lemnisca.bio" target="_blank" rel="noopener noreferrer">Lemnisca.bio</a></p>
        </div>
      </footer>
    </div>
  )
}

export default Avira
