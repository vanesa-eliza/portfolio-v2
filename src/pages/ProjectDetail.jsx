import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import FadeIn from '../components/FadeIn'
import CppSnippets from '../components/CppSnippets'
import { supabase } from '../lib/supabase'
import '../styles/ProjectDetail.css'

function ImageCarousel({ images, title }) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  function go(next) {
    setDirection(next > index ? 1 : -1)
    setIndex(next)
  }

  function prev() { go((index - 1 + images.length) % images.length) }
  function next() { go((index + 1) % images.length) }

  return (
    <div className="carousel">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.img
          key={index}
          src={images[index].src ?? images[index]}
          alt={`${title} screenshot ${index + 1}`}
          custom={direction}
          variants={{
            enter: (d) => ({ x: d * 40, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d) => ({ x: d * -40, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="carousel-image"
        />
      </AnimatePresence>

      <button onClick={prev} className="carousel-btn carousel-btn--prev">←</button>
      <button onClick={next} className="carousel-btn carousel-btn--next">→</button>

      {images[index].caption && (
        <div className="carousel-caption">{images[index].caption}</div>
      )}
      <div className="carousel-counter">{index + 1} / {images.length}</div>

      <div className="carousel-dots">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`carousel-dot${i === index ? ' carousel-dot--active' : ''}`}
          />
        ))}
      </div>
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
