import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import '../styles/Navbar.css'

const links = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/projects', label: 'Projects' },
  { path: '/writing', label: 'Writing' },
  { path: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <header className={`navbar${scrolled || menuOpen ? ' navbar--scrolled' : ''}`}>
      <nav className="navbar-inner">
        <Link to="/" className="navbar-logo">Vanesa Chetrusca</Link>

        <LayoutGroup>
          <ul className="navbar-links">
            {links.map(({ path, label }) => (
              <li key={path}>
                <Link
                  to={path}
                  className={`navbar-link${isActive(path) ? ' navbar-link--active' : ''}`}
                >
                  {label}
                  {isActive(path) && (
                    <motion.span
                      layoutId="nav-indicator"
                      style={{ position: 'absolute', bottom: '-4px', left: 0, right: 0, height: '1px', background: 'var(--accent)' }}
                    />
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
            style={{ overflow: 'hidden' }}
          >
            <ul className="navbar-mobile-list">
              {links.map(({ path, label }) => (
                <li key={path}>
                  <Link
                    to={path}
                    onClick={() => setMenuOpen(false)}
                    className={`navbar-mobile-link${isActive(path) ? ' navbar-mobile-link--active' : ''}`}
                  >
                    {label}
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
