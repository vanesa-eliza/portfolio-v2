import { socialLinks, isExternal } from '../lib/socials'
import '../styles/Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-logo">Vanesa Chetrusca</span>
        <div className="footer-links">
          {socialLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="footer-link"
              {...(isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {label}
            </a>
          ))}
        </div>
        <span className="footer-copy">© 2026 · Built by Vanesa Chetrusca</span>
      </div>
    </footer>
  )
}
