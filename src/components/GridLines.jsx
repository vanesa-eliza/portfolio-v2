import '../styles/GridLines.css'

// Animated grid lines with a pulsing band of opacity that travels along each line.
// Ported from a Framer component to plain React (keyframes live in GridLines.css).
export default function GridLines({
  color = 'var(--accent)',
  lineWidth = 1,
  showVertical = true,
  showHorizontal = true,
  numVertical = 4,
  numHorizontal = 4,
  speed = 5,
  animationOn = true,
  reverse = true,
  sequential = true,
}) {
  const animDuration = Math.max(0.5, speed)
  const direction = reverse ? 'reverse' : 'normal'

  const verticalLines = showVertical && numVertical > 0 ? Array.from({ length: numVertical }, (_, i) => i) : []
  const horizontalLines = showHorizontal && numHorizontal > 0 ? Array.from({ length: numHorizontal }, (_, i) => i) : []

  return (
    <div className="grid-lines" aria-hidden="true">
      {verticalLines.map((i) => {
        const x = ((i + 0.5) / numVertical) * 100
        const delay = sequential ? (i / numVertical) * animDuration : 0
        return (
          <div
            key={`v-${i}`}
            className="grid-line grid-line-vertical"
            style={{
              left: `${x}%`,
              width: lineWidth,
              backgroundImage: `linear-gradient(to bottom, transparent 0%, ${color} 23%, ${color} 42%, transparent 59%, transparent 100%)`,
              animation: animationOn ? `grid-flow-vertical ${animDuration}s linear infinite` : undefined,
              animationDelay: animationOn ? `-${delay}s` : undefined,
              animationDirection: direction,
            }}
          />
        )
      })}

      {horizontalLines.map((i) => {
        const y = ((i + 0.5) / numHorizontal) * 100
        const delay = sequential ? (i / numHorizontal) * animDuration : 0
        return (
          <div
            key={`h-${i}`}
            className="grid-line grid-line-horizontal"
            style={{
              top: `${y}%`,
              height: lineWidth,
              backgroundImage: `linear-gradient(to right, transparent 0%, ${color} 23%, ${color} 42%, transparent 59%, transparent 100%)`,
              animation: animationOn ? `grid-flow-horizontal ${animDuration}s linear infinite` : undefined,
              animationDelay: animationOn ? `-${delay}s` : undefined,
              animationDirection: direction,
            }}
          />
        )
      })}
    </div>
  )
}
