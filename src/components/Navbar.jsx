import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import '../styles/Navbar.css'

const links = [
  { path: '/', label: 'Home' },
  { path: '/projects', label: 'Projects' },
  { path: '/writing', label: 'Writing' },
  { path: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const onHome = location.pathname === '/'
    const handler = () => {
      setScrolled(window.scrollY > 24)
      if (!onHome) return
      const about = document.getElementById('about')
      const reachedAbout = about && about.getBoundingClientRect().top <= window.innerHeight * 0.5
      setActiveSection(reachedAbout ? 'about' : 'home')
    }
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isActive = (link) => {
    if (location.pathname === '/') {
      return link.hash ? activeSection === 'about' : link.path === '/' && activeSection === 'home'
    }
    if (link.path === '/') return false
    return location.pathname.startsWith(link.path)
  }

  const handleNavClick = (e, link) => {
    setMenuOpen(false)

    // Home: scroll back to top when already on the home page.
    if (link.path === '/' && location.pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <header className={`navbar${scrolled || menuOpen ? ' navbar--scrolled' : ''}`}>
      <nav className="navbar-inner">
        <Link to="/" className="navbar-logo">Vanesa Chetrusca</Link>

        <LayoutGroup>
          <ul className="navbar-links">
            {links.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  onClick={(e) => handleNavClick(e, link)}
                  className={`navbar-link${isActive(link) ? ' navbar-link--active' : ''}`}
                >
                  {link.label}
                  {isActive(link) && (
                    <motion.span layoutId="nav-indicator" className="nav-indicator" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </LayoutGroup>

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
              {links.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={(e) => handleNavClick(e, link)}
                    className={`navbar-mobile-link${isActive(link) ? ' navbar-mobile-link--active' : ''}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
