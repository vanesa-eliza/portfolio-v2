import PageTransition from '../components/PageTransition'
import FadeIn from '../components/FadeIn'
import '../styles/Contact.css'

export default function Contact() {
  return (
    <PageTransition>
      <div className="contact-page">
        <FadeIn className="contact-header">
          <div className="contact-eyebrow">
            <div className="contact-line" />
            <span className="contact-label">Contact</span>
          </div>
          <h1 className="contact-title">Let&apos;s talk.</h1>
          <p className="contact-intro">
            I&apos;m currently open to new opportunities — full-time roles, internships, and
            interesting problems worth working on together.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="contact-email-section">
            <a href="mailto:chetruscav@yahoo.com" className="contact-email-link">
              <span className="contact-email-text">chetruscav@yahoo.com</span>
              <div className="contact-email-line" />
            </a>
          </div>
        </FadeIn>

        <FadeIn delay={0.18}>
          <p className="contact-elsewhere-label">Find me elsewhere</p>
          <div className="social-links">
            <a
              href="https://github.com/vanesa-eliza"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <span className="social-link-label">GitHub</span>
              <span className="social-link-arrow">→</span>
            </a>
            <a
              href="https://linkedin.com/in/vanesa-eliza-chetrusca"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <span className="social-link-label">LinkedIn</span>
              <span className="social-link-arrow">→</span>
            </a>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  )
}
