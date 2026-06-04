import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import '../styles/GlowButton.css'

const MotionLink = motion.create(Link)

// Premium glass pill with a rotating conic-gradient glow ring.
// `as="link"` renders a react-router Link (pass `to`), otherwise a <button>.
export default function GlowButton({ as = 'button', animated = true, className = '', children, ...props }) {
  const Comp = as === 'link' ? MotionLink : motion.button

  return (
    <Comp
      className={`glow-btn${animated ? '' : ' glow-btn--static'}${className ? ` ${className}` : ''}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...props}
    >
      <span className="glow-btn-ring" aria-hidden="true" />
      <span className="glow-btn-body">{children}</span>
    </Comp>
  )
}
