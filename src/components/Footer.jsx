import '../styles/Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-logo">Vanesa Chetrusca</span>
        <div className="footer-links">
          <a href="mailto:chetruscav@yahoo.com" className="footer-link">Email</a>
          <a href="https://github.com/vanesa-eliza" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
          <a href="https://www.linkedin.com/in/vanesa-eliza-chetrusca/" target="_blank" rel="noopener noreferrer" className="footer-link">LinkedIn</a>
        </div>
        <span className="footer-copy">© 2026 · Built by Vanesa Chetrusca</span>
      </div>
    </footer>
  )
}
