import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { socialLinks, isExternal } from '../lib/socials'
import '../styles/Navbar.css'

// Text links to home-page sections.
const sections = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'education', label: 'Education' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
]

// Icon links opposite the sections: Writing (internal route) plus the shared socials.
const iconFor = { Email: EmailIcon, GitHub: GitHubIcon, LinkedIn: LinkedInIcon }
const navIcons = [
  { label: 'Writing', to: '/writing', Icon: WritingIcon },
  ...socialLinks.map((s) => ({ ...s, Icon: iconFor[s.label] })),
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const onHome = location.pathname === '/'
    const handler = () => {
      setScrolled(window.scrollY > 24)
      if (!onHome) return
      // The last section whose top has crossed the line becomes active.
      const line = window.innerHeight * 0.35
      let current = 'home'
      for (const { id } of sections) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      setActiveSection(current)
    }
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isActive = (id) => location.pathname === '/' && activeSection === id

  const goToSection = (id) => {
    setMenuOpen(false)
    // Set the hash; Home scrolls (smooth in-page, instant when arriving).
    navigate(`/#${id}`)
  }

  const renderIcon = ({ label, to, href, Icon }) =>
    to ? (
      <Link key={label} to={to} className="navbar-icon" aria-label={label} title={label} onClick={() => setMenuOpen(false)}>
        <Icon />
      </Link>
    ) : (
      <a
        key={label}
        href={href}
        className="navbar-icon"
        aria-label={label}
        title={label}
        {...(isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        <Icon />
      </a>
    )

  return (
    <header className={`navbar${scrolled || menuOpen ? ' navbar--scrolled' : ''}`}>
      <nav className="navbar-inner">
        <div className="navbar-left">
          <span className="navbar-logo">Vanesa Chetrusca</span>

          <LayoutGroup>
            <ul className="navbar-links">
              {sections.map(({ id, label }) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => goToSection(id)}
                    className={`navbar-link${isActive(id) ? ' navbar-link--active' : ''}`}
                  >
                    {label}
                    {isActive(id) && (
                      <motion.span layoutId="nav-indicator" className="nav-indicator" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </LayoutGroup>
        </div>

        <div className="navbar-socials">
          {navIcons.map(renderIcon)}
        </div>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="navbar-hamburger"
          aria-label="Toggle navigation"
        >
          <motion.span
            animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.25 }}
            className="navbar-bar"
          />
          <motion.span
            animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.2 }}
            className="navbar-bar"
          />
          <motion.span
            animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.25 }}
            className="navbar-bar"
          />
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="navbar-mobile-dropdown"
          >
            <ul className="navbar-mobile-list">
              {sections.map(({ id, label }) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => goToSection(id)}
                    className={`navbar-mobile-link${isActive(id) ? ' navbar-mobile-link--active' : ''}`}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="navbar-mobile-socials">
              {navIcons.map(renderIcon)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

// Icons are sized via CSS and use currentColor so hover styles apply.
function WritingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.65-5.49 5.95.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.29 0 .32.22.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  )
}
