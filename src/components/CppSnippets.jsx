import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../styles/CppSnippets.css'

export default function CppSnippets({ snippets }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const [flipped, setFlipped] = useState(new Set())
  const isExpanded = activeIndex === null

  function handleClick(i) {
    const next = new Set(flipped)
    if (activeIndex === i) {
      next.delete(i)
      setFlipped(next)
      setActiveIndex(null)
    } else {
      if (activeIndex !== null) next.delete(activeIndex)
      next.add(i)
      setFlipped(next)
      setActiveIndex(i)
    }
  }

  return (
    <div className={`cpp-outer${isExpanded ? '' : ' cpp-outer--active'}`}>
      <motion.div className="cpp-cards" layout transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
        {snippets.map((s, i) => (
          <motion.div
            key={i}
            layout
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
          >
            <SnippetCard
              snippet={s}
              isFlipped={flipped.has(i)}
              isActive={activeIndex === i}
              onClick={() => handleClick(i)}
            />
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.p
            key="hint"
            className="cpp-empty-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            Click a card to view the solution.
          </motion.p>
        ) : (
          <motion.div
            key="panel"
            className="cpp-panel-slot"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <CodePanel snippet={snippets[activeIndex]} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SnippetCard({ snippet, isFlipped, isActive, onClick }) {
  const displayName = snippet.toggle ? snippet.toggle.primary.label : snippet.name

  return (
    <div
      className={`snippet-card${isFlipped ? ' snippet-card--flipped' : ''}${isActive ? ' snippet-card--active' : ''}`}
      onClick={onClick}
    >
      <div className="snippet-card-inner">
        <div className="snippet-card-front">
          <span className="snippet-card-category">{snippet.category}</span>
          <span className="snippet-card-name">{displayName}</span>
        </div>
        <div className="snippet-card-back">
          <span className="snippet-card-back-label">Solution</span>
          <span className="snippet-card-back-name">{displayName}</span>
        </div>
      </div>
    </div>
  )
}

function CodePanel({ snippet }) {
  const [variant, setVariant] = useState('primary')

  if (snippet.toggle) {
    const isPrimary = variant === 'primary'
    const cur = isPrimary ? snippet.toggle.primary : snippet.toggle.secondary

    return (
      <div className="code-panel">
        <div className="code-panel-header">
          <h3 className="code-panel-title">{cur.label}</h3>
          <span className="code-panel-compare-hint">click highlighted to compare</span>
        </div>
        <pre className="code-block"><code>{cur.codeBefore}<span className="code-highlight" onClick={() => setVariant(isPrimary ? 'secondary' : 'primary')}>{cur.codeHighlight}</span>{cur.codeAfter}</code></pre>
        <p className="code-explanation">{cur.explanation}</p>
      </div>
    )
  }

  return (
    <div className="code-panel">
      <h3 className="code-panel-title">{snippet.name}</h3>
      <pre className="code-block"><code>{snippet.code}</code></pre>
      <p className="code-explanation">{snippet.explanation}</p>
    </div>
  )
}
