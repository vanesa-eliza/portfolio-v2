import { useState, useEffect, useLayoutEffect, lazy, Suspense } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import PageTransition from '../components/PageTransition'
import FadeIn from '../components/FadeIn'
import GlowButton from '../components/GlowButton'
import Typewriter from '../components/Typewriter'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/useAuth'

const ParticleSphere = lazy(() => import('../components/ParticleSphere'))
import '../styles/Home.css'
import '../styles/About.css'
import '../styles/Admin.css'

const DEFAULT_SUBTITLE = 'CS & AI student at Queen Mary University of London. I learn by building fun projects from data-driven tools to interactive apps, with a growing interest in making AI-powered products.'

const DEFAULT_SKILLS = {
  Languages: ['Python', 'Java', 'C++', 'SQL', 'JavaScript'],
  'Frameworks & Libraries': ['React', 'Keras', 'TensorFlow', 'Pandas'],
  'Databases & Data': ['MySQL', 'Oracle APEX'],
  Tools: ['Git', 'GitHub', 'VS Code', 'Jupyter'],
}

const education = [
  {
    period: '2024 – 2027',
    title: 'BSc Computer Science and Artificial Intelligence',
    institution: 'Queen Mary University of London',
    detail: [
      'First year average: 83.01%.',
      'Year 1: Procedural Programming, Computer Systems and Networks, Fundamentals of Web Technology, Automata, Object-Oriented Programming, Logic and Discrete Structures, Probability and Matrices.',
      'Year 2: Algorithms and Data Structures, Introduction to AI, Introduction to Robotics, Probabilities and Matrices, AI for Decision Making, Generative Deep Learning, Operating Systems, AI Project.',
    ],
  },
  {
    period: '2018 – 2022',
    title: 'High School',
    institution: '"Ștefan Odobleja" High School, Bucharest, Romania',
    detail: '',
  },
]

const experience = [
  {
    period: 'Jan – Apr 2026',
    title: 'Demonstrator',
    context: 'Queen Mary University of London',
    detail:
      'Supported ~25 undergraduate students weekly in lab sessions for Fundamentals of Web Technology. Assisted with debugging and explained core technical concepts in HTML, CSS, JavaScript, and PHP.',
  },
  {
    period: 'Apr 2026',
    title: 'London Marathon Volunteer',
    context: 'QMSU Baggage Drop · Finish Line',
    detail:
      'Part of the finish-line baggage team responsible for organising thousands of numbered bags across a lorry before the first finishers arrived. Relied on fast, clear communication to locate and hand off bags the moment runners crossed the line — no waiting, no fuss.',
  },
  {
    period: 'Sep 2025',
    title: 'Welcome Week Volunteer',
    context: 'Queen Mary University of London',
    detail:
      'Guided new students around campus and assisted with move-in queries. Collaborated with staff and fellow volunteers during high-traffic induction periods.',
  },
  {
    period: 'Mar 2023 – Present',
    title: 'Sales Assistant',
    context: 'JD Sports Fashion PLC',
    detail:
      'Maintained accurate stock records and worked effectively in a fast-paced customer-facing environment.',
  },
]

export default function Home() {
  const { user } = useAuth()
  const location = useLocation()
  const [subtitle, setSubtitle] = useState(DEFAULT_SUBTITLE)
  const [featuredProjects, setFeaturedProjects] = useState([])
  const [bio, setBio] = useState(null)
  const [skills, setSkills] = useState(DEFAULT_SKILLS)
  const [educationItems, setEducationItems] = useState(education)
  const [experienceItems, setExperienceItems] = useState(experience)

  useEffect(() => {
    supabase
      .from('about')
      .select('key, value')
      .in('key', ['home_subtitle', 'bio', 'skills', 'education', 'experience'])
      .then(({ data }) => {
        if (!data) return
        const map = Object.fromEntries(data.map((r) => [r.key, r.value]))
        if (map.home_subtitle) setSubtitle(map.home_subtitle)
        if (map.bio) setBio(map.bio)
        if (map.skills) setSkills(JSON.parse(map.skills))
        if (map.education) setEducationItems(JSON.parse(map.education))
        if (map.experience) setExperienceItems(JSON.parse(map.experience))
      })

    supabase
      .from('projects')
      .select('slug, title, year')
      .order('year', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setFeaturedProjects(data.map((p) => ({ title: p.title, year: p.year, path: `/projects/${p.slug}` })))
      })
  }, [])

  useEffect(() => {
    if (location.hash === '#about') {
      // Defer one frame so the section is laid out before scrolling.
      requestAnimationFrame(() =>
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
      )
    }
  }, [location])

  return (
    <PageTransition>
      <section className="hero">
        <div className="hero-content container-xl">
          <div className="hero-content-inner">
            <div className="hero-eyebrow hero-fade">
              <div className="hero-line" />
              <span className="hero-label">Computer Science & AI Student</span>
            </div>

            <h1 className="hero-title hero-fade hero-delay-1">
              <Typewriter
                anchor="right"
                segments={[{ text: 'hi, ' }, { text: 'Vanesa', typed: true }, { br: true }, { text: 'here', em: true }]}
                ariaLabel="hi, Vanesa here"
              />
            </h1>
          </div>
        </div>

        <div className="hero-sphere sphere-fade">
          <Suspense fallback={null}>
            <ParticleSphere />
          </Suspense>
        </div>

        <div className="hero-content-below container-xl">
          <div className="hero-content-inner">
            <p className="hero-subtitle hero-fade hero-delay-2">{subtitle}</p>
            {user && (
              <Link to="/admin/home" className="admin-edit-link">Edit subtitle</Link>
            )}
          </div>

          <div className="scroll-hint scroll-indicator">
            <span className="scroll-hint-text">Scroll</span>
            <div className="scroll-hint-line scroll-line" />
          </div>

          <div className="hero-content-inner">
            <div className="hero-actions hero-fade hero-delay-3">
              <Link to="/projects" className="btn-primary">View Projects</Link>
              <GlowButton type="button" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>About Me</GlowButton>
            </div>
          </div>
        </div>
      </section>

      <section className="stats container-xl">
        <FadeIn>
          <div className="stats-grid">
            {[
              { label: 'Languages', value: 'Java · Python · SQL · JS · C++' },
              { label: 'Focus Areas', value: 'Web · Systems · ML/AI · Data Engineering' },
              { label: 'Status', value: 'Open to opportunities' },
            ].map(({ label, value }) => (
              <div key={label} className="stats-item">
                <div className="stats-label">{label}</div>
                <div className="stats-value">{value}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      <section id="about" className="page-xl">
        <FadeIn className="about-header">
          <div className="about-eyebrow">
            <div className="about-line" />
            <span className="about-label">About</span>
          </div>
          <h1 className="about-title">
            CS student,
            <br />
            <em>builder at heart.</em>
          </h1>
        </FadeIn>

        <div className="about-grid">
          <FadeIn delay={0.05}>
            <div className="about-bio">
              {user && (
                <Link to="/admin/about" className="admin-edit-link">Edit bio</Link>
              )}
              {bio ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{bio}</ReactMarkdown>
              ) : (
                <>
                  <p>
                    I&apos;m a second-year Computer Science and AI student at Queen Mary University of
                    London, with a first-year average of 83%. I care about building things that are both
                    correct and readable — whether that&apos;s a SQL query, a Java simulation, or a
                    neural network.
                  </p>
                  <p>
                    My projects span OOP in Java, procedural generation in Python, and machine learning
                    with Keras. Working on the Minecraft settlement generator pushed me to pick up
                    several new libraries — NumPy for terrain analysis, GDPC for world interaction —
                    and taught me how much the right tool shapes the solution. I&apos;m drawn to
                    problems where the engineering is inseparable from the thinking.
                  </p>
                  <p>
                    I&apos;ve also worked as a lab demonstrator at QMUL, helping students debug their
                    way through web technology. Outside of code, I&apos;m interested in visual design
                    and how complex systems emerge from simple rules.
                  </p>
                </>
              )}
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="about-skills">
              {user && <Link to="/admin/skills" className="admin-edit-link">Edit skills</Link>}
              {Object.entries(skills).map(([category, items]) => (
                <div key={category}>
                  <div className="skill-label">{category}</div>
                  <div className="skill-tags">
                    {items.map((skill) => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        <FadeIn>
          <div className="about-section">
            <div className="admin-section-header">
              <h2 className="about-section-title">Education</h2>
              {user && <Link to="/admin/timeline/education" className="admin-edit-link">Edit</Link>}
            </div>
            <div>
              {educationItems.map(({ period, title, institution, detail }) => (
                <div key={title} className="timeline-item">
                  <span className="timeline-period">{period}</span>
                  <div className="timeline-content">
                    <h3>{title}</h3>
                    <p className="timeline-institution">{institution}</p>
                    {Array.isArray(detail)
                      ? detail.map((line, i) => <p key={i} className="timeline-detail">{line}</p>)
                      : detail && <p className="timeline-detail">{detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="about-section">
            <div className="admin-section-header">
              <h2 className="about-section-title">Experience</h2>
              {user && <Link to="/admin/timeline/experience" className="admin-edit-link">Edit</Link>}
            </div>
            <div>
              {experienceItems.map(({ period, title, context, detail }) => (
                <div key={title} className="timeline-item">
                  <span className="timeline-period">{period}</span>
                  <div className="timeline-content">
                    <h3>{title}</h3>
                    <p className="timeline-institution">{context}</p>
                    {detail && <p className="timeline-detail">{detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      <section className="selected-work container-xl">
        <FadeIn>
          <div className="selected-work-header">
            <h2 className="selected-work-title">Selected Work</h2>
            <Link to="/projects" className="all-projects-link">All Projects →</Link>
          </div>
        </FadeIn>

        <div>
          {featuredProjects.map(({ title, year, path }, i) => (
            <FadeIn key={title} delay={i * 0.08}>
              <Link to={path} className="work-item">
                <div className="work-item-left">
                  <span className="work-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="work-title">{title}</span>
                </div>
                <div className="work-item-right">
                  <span className="work-year">{year}</span>
                  <span className="work-arrow">→</span>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>
    </PageTransition>
  )
}
