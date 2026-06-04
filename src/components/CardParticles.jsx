import { useState } from 'react'
import '../styles/CardParticles.css'

// Floating + twinkling particles, revealed on card hover.
// Positions/drift/timing are randomised once per mount.
export default function CardParticles({ count = 12 }) {
  const [particles] = useState(() =>
    Array.from({ length: count }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 2 + Math.random() * 3,
      dx: (Math.random() - 0.5) * 80,
      dy: (Math.random() - 0.5) * 80,
      dur: 2.3 + Math.random() * 2,
      del: Math.random() * 0.8,
    }))
  )

  return (
    <div className="card-particles" aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className="card-particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
            '--dur': `${p.dur}s`,
            '--del': `${p.del}s`,
          }}
        />
      ))}
    </div>
  )
}
