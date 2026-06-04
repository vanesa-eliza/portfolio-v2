import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, animate, useMotionValue, useTransform, useMotionValueEvent } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import FadeIn from '../components/FadeIn'
import CppSnippets from '../components/CppSnippets'
import { supabase } from '../lib/supabase'
import '../styles/ProjectDetail.css'

// Wrap a relative offset into the shortest signed distance on a ring of `len`
// items, so item positions flow infinitely in either direction.
function wrapRel(rel, len) {
  if (len <= 0) return 0
  const half = len / 2
  return ((rel + half) % len + len) % len - half
}

// A single media tile positioned in 3D space. Its transform is derived live
// from the shared `pos` motion value, so dragging/animating `pos` makes every
// tile scale, rotate, and reposition based on its distance from centre.
function CarouselCard({ image, alt, i, pos, len, spacing }) {
  const src = image.src ?? image
  const rel = useTransform(pos, (p) => wrapRel(i - p, len))

  const x = useTransform(rel, (r) => r * spacing)
  const rotateY = useTransform(rel, (r) => -Math.max(-2, Math.min(2, r)) * 38)
  const z = useTransform(rel, (r) => -Math.abs(r) * 260)
  const scale = useTransform(rel, (r) => Math.max(0.55, 1 - Math.abs(r) * 0.22))
  const opacity = useTransform(rel, (r) => (Math.abs(r) > 2.6 ? 0 : Math.max(0, 1 - Math.abs(r) * 0.34)))
  const filter = useTransform(rel, (r) => `brightness(${Math.max(0.45, 1 - Math.abs(r) * 0.3)})`)
  const zIndex = useTransform(rel, (r) => Math.round(100 - Math.abs(r) * 10))

  return (
    <motion.div
      className="carousel-card"
      style={{ x, rotateY, z, scale, opacity, filter, zIndex }}
      aria-hidden="true"
    >
      <img src={src} alt={alt} className="carousel-card-image" draggable={false} />
    </motion.div>
  )
}

function ImageCarousel({ images, title }) {
  const len = images.length
  const containerRef = useRef(null)
  const pos = useMotionValue(0)
  const animRef = useRef(null)
  const posStart = useRef(0)
  const didDrag = useRef(false)
  const [spacing, setSpacing] = useState(320)
  const [activeIndex, setActiveIndex] = useState(0)

  // Keep the rounded active index in sync for caption / counter / dots.
  useMotionValueEvent(pos, 'change', (p) => {
    const idx = ((Math.round(p) % len) + len) % len
    setActiveIndex((prev) => (prev === idx ? prev : idx))
  })

  // Responsive spacing: neighbours peek in from the sides on any width.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setSpacing(el.clientWidth * 0.6)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const goTo = useCallback(
    (target, opts) => {
      animRef.current?.stop()
      animRef.current = animate(pos, target, {
        type: 'spring',
        stiffness: 200,
        damping: 26,
        ...opts,
      })
    },
    [pos]
  )

  const goToNext = useCallback(() => goTo(Math.round(pos.get()) + 1), [goTo, pos])
  const goToPrev = useCallback(() => goTo(Math.round(pos.get()) - 1), [goTo, pos])

  const goToIndex = useCallback(
    (i) => {
      const base = Math.round(pos.get())
      const curMod = ((base % len) + len) % len
      let diff = i - curMod
      if (diff > len / 2) diff -= len
      if (diff < -len / 2) diff += len
      goTo(base + diff)
    },
    [goTo, pos, len]
  )

  // Wheel / trackpad navigation (native listener so we can preventDefault).
  useEffect(() => {
    const el = containerRef.current
    if (!el || len <= 1) return
    let lock = false
    function onWheel(e) {
      // Only hijack horizontal scrolling; let vertical scroll the page.
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      // Swallow every horizontal delta — including the inertia tail — so the
      // browser's swipe-to-go-back/forward gesture never fires over the carousel.
      e.preventDefault()
      if (lock || Math.abs(e.deltaX) < 6) return
      lock = true
      e.deltaX > 0 ? goToNext() : goToPrev()
      setTimeout(() => { lock = false }, 320)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [len, goToNext, goToPrev])

  function onDragStart() {
    didDrag.current = false
    animRef.current?.stop()
    posStart.current = pos.get()
  }
  function onDrag(_, info) {
    if (Math.abs(info.offset.x) > 4) didDrag.current = true
    pos.set(posStart.current - info.offset.x / spacing)
  }
  function onDragEnd(_, info) {
    const velCards = info.velocity.x / spacing
    goTo(Math.round(pos.get() - velCards * 0.18)) // project momentum into a snap target
  }
  function onLayerClick(e) {
    if (didDrag.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    e.clientX - rect.left < rect.width / 2 ? goToPrev() : goToNext()
  }

  const caption = images[activeIndex]?.caption

  return (
    <div className="carousel" ref={containerRef}>
      <div className="carousel-stage">
        {images.map((image, i) => (
          <CarouselCard
            key={i}
            image={image}
            alt={`${title} screenshot ${i + 1}`}
            i={i}
            pos={pos}
            len={len}
            spacing={spacing}
          />
        ))}
      </div>

      {len > 1 && (
        <motion.div
          className="carousel-drag-layer"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.16}
          dragMomentum={false}
          onDragStart={onDragStart}
          onDrag={onDrag}
          onDragEnd={onDragEnd}
          onClick={onLayerClick}
        />
      )}

      {caption && <div className="carousel-caption">{caption}</div>}

      {len > 1 && (
        <>
          <div className="carousel-counter">{activeIndex + 1} / {len}</div>
          <div className="carousel-dots">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goToIndex(i)}
                className={`carousel-dot${i === activeIndex ? ' carousel-dot--active' : ''}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const CPP_SNIPPETS = [
  {
    name: 'Map Coloring',
    category: 'Greedy',
    code: `int cont(int k) {
  for (int i = 1; i < k; i++)
    if (A[i][k] == 1 && X[i] == X[k])
      return 0;
  return 1;
}

int choose(int k) {
  for (int i = 1; i <= 4; i++) {
    X[k] = i;
    if (cont(k)) return i;
  }
  return 0;
}

void paint() {
  for (int i = 1; i <= n; i++)
    X[i] = choose(i);
}`,
    explanation: 'Greedily assigns one of 4 colors to each country so no two neighbors share the same color. For each country, tries colors 1–4 in order and picks the first one that does not conflict with already-colored neighbors.',
  },
  {
    name: 'Football Players',
    category: 'Greedy',
    code: `struct Player { int cost; int nr; } J[100];

void bubbleSort() {
  Player aux;
  for (int i = 1; i < n; i++)
    for (int j = i+1; j <= n; j++)
      if (J[i].cost > J[j].cost) {
        aux = J[i];
        J[i] = J[j];
        J[j] = aux;
      }
}

void greedy() {
  for (int i = 1; i <= n; i++)
    if (J[i].cost <= S) {
      cout << J[i].nr << " ";
      S -= J[i].cost;
    }
}`,
    explanation: 'Buys the maximum number of football players within a budget S. Players are sorted by cost ascending, then greedily selected cheapest-first. The struct pairs each cost with its original index so the right player numbers are printed after sorting.',
  },
  {
    name: 'Travelling Salesman',
    category: 'Backtracking',
    code: `int cont(int k) {
  for (int i = 1; i < k; i++)
    if (x[i] == x[k]) return 0;
  if (!A[x[k-1]][x[k]]) return 0;
  if (k == n && !A[x[k]][x[1]]) return 0;
  return 1;
}

void bkt(int k) {
  k = 1; x[k] = 0;
  while (k > 0) {
    while (x[k] < n) {
      x[k]++;
      if (cont(k)) {
        if (k == n) print(k);
        else { k++; x[k] = 0; }
      }
    }
    k--;
  }
}`,
    explanation: 'Finds all Hamiltonian cycles — routes that visit every city exactly once and return to the start. Uses iterative backtracking: at each step it checks no city is revisited and a road exists between consecutive cities. When all n cities are placed and a return road exists, a solution is printed.',
  },
  {
    name: 'N-Queens',
    category: 'Backtracking',
    code: `int cont(int k) {
  for (int i = 1; i < k; i++)
    if (x[i] == x[k]) return 0;
  for (int i = 1; i < k; i++)
    if (abs(k-i) == abs(x[k]-x[i])) return 0;
  return 1;
}

void bkt(int k) {
  if (k > n) print(k);
  else
    for (int i = 1; i <= n; i++) {
      x[k] = i;
      if (cont(k)) bkt(k+1);
    }
}`,
    explanation: 'Places n queens on an n×n board so none can attack each other. x[k] stores the column of the queen in row k. The constraint check rules out same-column conflicts and diagonal conflicts. Recursive backtracking tries every column for each row.',
  },
  {
    name: `Knight's Tour`,
    category: 'Backtracking',
    code: `int dx[] = { -2,-1, 1, 2, 2, 1,-1,-2 };
int dy[] = { -1,-2,-2,-1, 1, 2, 2, 1 };

int inBounds(int i, int j) {
  return i >= 1 && i <= n && j >= 1 && j <= n;
}

void bkt(int i, int j, int k) {
  board[i][j] = k;
  if (k == n*n) print();
  else
    for (int dir = 0; dir < 8; dir++) {
      int ni = i + dx[dir], nj = j + dy[dir];
      if (inBounds(ni, nj) && board[ni][nj] == 0)
        bkt(ni, nj, k+1);
    }
  board[i][j] = 0;
}`,
    explanation: `Finds a path for a chess knight that visits every square on an n×n board exactly once. All 8 L-shaped moves are encoded as offset arrays. At each step the knight tries every valid unvisited move; if all n² squares are filled a solution is printed. Setting board[i][j] = 0 on the way back enables full backtracking.`,
  },
  {
    category: 'Graph',
    toggle: {
      primary: {
        label: 'Floyd-Warshall',
        codeBefore: `void floydWarshall() {
  for (int k = 1; k <= n; k++)
    for (int i = 1; i <= n; i++)
      for (int j = 1; j <= n; j++)
        `,
        codeHighlight: `if (A[i][j] > A[i][k] + A[k][j])
          A[i][j] = A[i][k] + A[k][j];`,
        codeAfter: `
}`,
        explanation: 'Finds the shortest path between every pair of nodes in a weighted graph. For each intermediate node k, if routing through k gives a cheaper path from i to j, the distance is updated. The highlighted condition is the relaxation step — the single line that makes Floyd-Warshall work.',
      },
      secondary: {
        label: 'Warshall',
        codeBefore: `void warshall() {
  for (int k = 1; k <= n; k++)
    for (int i = 1; i <= n; i++)
      for (int j = 1; j <= n; j++)
        `,
        codeHighlight: `if (i != j && D[i][j] == 0)
          D[i][j] = D[i][k] * D[k][j];`,
        codeAfter: `
}`,
        explanation: 'Determines whether any path exists between every pair of nodes. Same triple loop, different inner condition: multiplication is used so D[i][k] * D[k][j] is 1 only when both segments exist, recording an indirect path where no direct path was known.',
      },
    },
  },
]

export default function ProjectDetail() {
  const { slug } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        if (data) setProject(data)
        setLoading(false)
      })
  }, [slug])

  if (loading) return null

  if (!project) {
    return (
      <PageTransition>
        <div className="not-found">
          Project not found.{' '}
          <Link to="/projects">Back to projects</Link>
        </div>
      </PageTransition>
    )
  }

  if (project.slug === 'cpp-explorations') {
    return (
      <PageTransition>
        <article className="page-xl">
          <FadeIn>
            <Link to="/projects" className="back-link">← Back to Projects</Link>
          </FadeIn>
          <FadeIn delay={0.08}>
            <div className="project-tags">
              {project.tags.map((tag) => (
                <span key={tag} className="project-tag">{tag}</span>
              ))}
              <span className="project-tag">{project.year}</span>
            </div>
            <h1 className="project-title">{project.title}</h1>
            <p className="project-subtitle">{project.subtitle}</p>
          </FadeIn>
          <div className="project-divider" />
          <FadeIn delay={0.15}>
            <CppSnippets snippets={CPP_SNIPPETS} />
          </FadeIn>
        </article>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <article className="page-md">
        <FadeIn>
          <Link to="/projects" className="back-link">← Back to Projects</Link>
        </FadeIn>

        <FadeIn delay={0.08}>
          <div className="project-tags">
            {project.tags.map((tag) => (
              <span key={tag} className="project-tag">{tag}</span>
            ))}
            <span className="project-tag">{project.year}</span>
          </div>
          <h1 className="project-title">{project.title}</h1>
          <p className="project-subtitle">{project.subtitle}</p>
        </FadeIn>

        <div className="project-divider" />

        <FadeIn delay={0.15}>
          <div className="project-body">
            {project.description.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </FadeIn>

        {project.images && project.images.length > 0 && (
          <FadeIn delay={0.2}>
            <div className="project-section">
              <ImageCarousel images={project.images} title={project.title} />
            </div>
          </FadeIn>
        )}

        <FadeIn delay={0.22}>
          <div className="project-section">
            <h2 className="project-section-title">Highlights</h2>
            <ul className="project-highlights">
              {project.highlights.map((h, i) => (
                <li key={i} className="highlight-item">
                  <span className="highlight-bullet">—</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>

        <FadeIn delay={0.28}>
          <div className="project-section">
            <h2 className="project-section-title">Tech Stack</h2>
            <div className="tech-tags">
              {project.tech.map((t) => (
                <span key={t} className="tech-tag">{t}</span>
              ))}
            </div>
          </div>
        </FadeIn>

        {project.github && (
          <FadeIn delay={0.34}>
            <div className="project-section">
              <a href={project.github} target="_blank" rel="noopener noreferrer" className="github-link">
                View on GitHub →
              </a>
            </div>
          </FadeIn>
        )}
      </article>
    </PageTransition>
  )
}
