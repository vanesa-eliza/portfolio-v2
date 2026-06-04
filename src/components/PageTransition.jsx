import { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function PageTransition({ children }) {
  // Each route mounts a fresh PageTransition (Routes is keyed on pathname),
  // so reset the scroll to the top on navigation. A hash (e.g. /#about) means
  // the destination is a section, so leave that to the section scroll.
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
