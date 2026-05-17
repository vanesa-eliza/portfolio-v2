import { useEffect, useRef } from 'react'

const PORTRAIT_SIZE = 400
const GAP = 7

function hash(x, y, z) {
  const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.3) * 43758.545
  return h - Math.floor(h)
}
function surfaceNoise(x, y, z) {
  const n1 = hash(x * 1.8, y * 2.1, z * 1.5) * 2 - 1
  const n2 = hash(x * 3.7 + 1.3, y * 4.1 - 0.9, z * 3.2 + 2.1) * 2 - 1
  return n1 * 0.65 + n2 * 0.35
}

function buildSpherePositions(n) {
  const phi = Math.PI * (3 - Math.sqrt(5))
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = phi * i
    const ux = Math.cos(theta) * r
    const uy = y
    const uz = Math.sin(theta) * r
    const warp = surfaceNoise(ux, uy, uz) * 0.22
    return [ux * (1 + warp), uy * 0.9 * (1 + warp), uz * 0.85 * (1 + warp)]
  })
}

function processPortrait(img) {
  const off = document.createElement('canvas')
  off.width = PORTRAIT_SIZE
  off.height = PORTRAIT_SIZE
  const ctx = off.getContext('2d')
  const aspect = img.naturalWidth / img.naturalHeight
  let dw = PORTRAIT_SIZE * 0.88
  let dh = dw / aspect
  if (dh > PORTRAIT_SIZE * 0.88) {
    dh = PORTRAIT_SIZE * 0.88
    dw = dh * aspect
  }
  ctx.drawImage(img, (PORTRAIT_SIZE - dw) / 2, (PORTRAIT_SIZE - dh) / 2, dw, dh)
  const { data } = ctx.getImageData(0, 0, PORTRAIT_SIZE, PORTRAIT_SIZE)
  const raw = []
  for (let y = 0; y < PORTRAIT_SIZE; y += GAP) {
    for (let x = 0; x < PORTRAIT_SIZE; x += GAP) {
      const idx = (y * PORTRAIT_SIZE + x) * 4
      if (data[idx + 3] > 30) {
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / (3 * 255)
        raw.push({ x, y, alpha: 0.15 + brightness * 0.85 })
      }
    }
  }
  return raw
}

function buildParticles(raw) {
  const spherePos = buildSpherePositions(raw.length)
  return raw.map((p, i) => ({
    sphere: spherePos[i],
    localX: p.x,
    localY: p.y,
    baseAlpha: p.alpha,
    px: p.x,
    py: p.y,
    vx: 0,
    vy: 0,
    phase: Math.random() * Math.PI * 2,
    phaseY: Math.random() * Math.PI * 2,
    speed: 0.35 + Math.random() * 0.45,
  }))
}

export default function ParticleSphere() {
  const canvasRef = useRef(null)
  const particlesRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0, hovered: false })
  const scaleRef = useRef(1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    let animId

    let rotX = 0, rotY = 0
    let velX = 0, velY = 0.004
    let blend = 0

    const getRect = () => canvas.getBoundingClientRect()

    const resize = () => {
      const rect = getRect()
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      scaleRef.current = rect.width < 768
        ? Math.min(rect.width, rect.height) / PORTRAIT_SIZE
        : 1
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const img = new Image()
    img.src = '/ME.png'
    img.onload = () => {
      particlesRef.current = buildParticles(processPortrait(img))
    }

    const onMouseMove = (e) => {
      const rect = getRect()
      const W = rect.width
      const H = rect.height
      const cx = W * (W < 768 ? 0.5 : 0.75)
      const cy = H * 0.5
      const dx = e.clientX - rect.left - cx
      const dy = e.clientY - rect.top - cy
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
      // hover zone covers both sphere and portrait footprint
      const ps = scaleRef.current
      mouseRef.current.hovered =
        Math.abs(dx) < PORTRAIT_SIZE * ps * 0.55 && Math.abs(dy) < PORTRAIT_SIZE * ps * 0.55
    }
    const onMouseLeave = () => { mouseRef.current.hovered = false }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)

    const draw = () => {
      animId = requestAnimationFrame(draw)
      const { width: W, height: H } = getRect()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      const particles = particlesRef.current
      if (!particles) return

      const { hovered } = mouseRef.current
      blend += ((hovered ? 1 : 0) - blend) * (hovered ? 0.04 : 0.025)
      const ease =
        blend < 0.5
          ? 2 * blend * blend
          : 1 - Math.pow(-2 * blend + 2, 2) / 2

      // Sphere rotation slows to a stop while portrait is visible
      velY += ((1 - ease) * 0.004 - velY) * 0.06
      velX += (0 - velX) * 0.06
      if (!hovered) rotX *= 0.95
      rotY += velY
      rotX += velX

      const ps = scaleRef.current
      const radius = Math.min(W, H) * 0.21
      const spX = W * (W < 768 ? 0.5 : 0.75)
      const spY = H * 0.5
      const fov = Math.min(W, H) * 1.1
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX)
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY)
      const offsetX = spX - (PORTRAIT_SIZE * ps) / 2
      const offsetY = spY - (PORTRAIT_SIZE * ps) / 2

      // Glow fades out as portrait takes over
      const glowA = 0.06 * (1 - ease)
      if (glowA > 0.002) {
        const glowR = radius * 1.15
        const grd = ctx.createRadialGradient(spX, spY, 0, spX, spY, glowR)
        grd.addColorStop(0, `rgba(139,34,82,${(glowA + 0.02).toFixed(3)})`)
        grd.addColorStop(0.5, `rgba(139,34,82,${glowA.toFixed(3)})`)
        grd.addColorStop(1, 'rgba(139,34,82,0)')
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(spX, spY, glowR, 0, Math.PI * 2)
        ctx.fill()
      }

      const t = performance.now() / 1000
      const proj = []
      for (const p of particles) {
        const [hx, hy, hz] = p.sphere
        const x1 = hx * cosY + hz * sinY
        const z1 = -hx * sinY + hz * cosY
        const y2 = hy * cosX - z1 * sinX
        const z2 = hy * sinX + z1 * cosX
        const scale = fov / (fov + z2)
        const depth = Math.min(1, Math.max(0, (z2 + radius) / (2 * radius)))

        const sphereX = x1 * scale * radius + spX
        const sphereY = y2 * scale * radius + spY

        // Portrait target with per-particle breathing offset
        const breathAmp = 3.5 * ease
        const breathX = Math.sin(t * p.speed + p.phase) * breathAmp
        const breathY = Math.cos(t * p.speed * 0.75 + p.phaseY) * breathAmp
        const portraitX = p.localX * ps + offsetX + breathX
        const portraitY = p.localY * ps + offsetY + breathY

        // Spring target blends sphere → portrait
        const targetX = sphereX + (portraitX - sphereX) * ease
        const targetY = sphereY + (portraitY - sphereY) * ease

        // Spring: tight in sphere mode, loose in portrait mode
        const stiffness = 0.18 - ease * 0.1
        const damping = 0.84 + ease * 0.08
        p.vx += (targetX - p.px) * stiffness
        p.vy += (targetY - p.py) * stiffness
        p.vx *= damping
        p.vy *= damping
        p.px += p.vx
        p.py += p.vy

        proj.push({ x: p.px, y: p.py, z: z2, depth, scale, baseAlpha: p.baseAlpha })
      }

      proj.sort((a, b) => a.z - b.z)

      for (const { x, y, depth, scale, baseAlpha } of proj) {
        const sphereAlpha = 0.07 + depth * 0.93
        const alpha = sphereAlpha + (baseAlpha - sphereAlpha) * ease

        const sphereSize = Math.max(0.3, scale * 1.7)
        const portraitSize = Math.max(0.4, (0.4 + baseAlpha * 1.3) * ps)
        const size = sphereSize + (portraitSize - sphereSize) * ease

        const w = Math.max(0, depth - 0.62) * (1 - ease)
        const rr = Math.round(240 - w * 28)
        const gg = Math.round(237 - w * 48)
        const bb = Math.round(232 - w * 38)

        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${rr},${gg},${bb},${alpha.toFixed(2)})`
        ctx.fill()
      }
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', pointerEvents: 'none', width: '100%', height: '100%' }}
    />
  )
}
