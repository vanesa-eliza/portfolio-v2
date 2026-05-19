import { useState, useEffect, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import FadeIn from '../components/FadeIn'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/useAuth'

const ParticleSphere = lazy(() => import('../components/ParticleSphere'))
import '../styles/Home.css'
import '../styles/Admin.css'

const DEFAULT_SUBTITLE = 'CS & AI student at Queen Mary University of London. I learn by building fun projects from data-driven tools to interactive apps, with a growing interest in making AI-powered products.'

export default function Home() {
  const { user } = useAuth()
  const [subtitle, setSubtitle] = useState(DEFAULT_SUBTITLE)
  const [featuredProjects, setFeaturedProjects] = useState([])

  useEffect(() => {
    supabase
      .from('about')
      .select('value')
      .eq('key', 'home_subtitle')
      .single()
      .then(({ data }) => { if (data) setSubtitle(data.value) })

    supabase
      .from('projects')
      .select('slug, title, year')
      .order('year', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setFeaturedProjects(data.map((p) => ({ title: p.title, year: p.year, path: `/projects/${p.slug}` })))
      })
  }, [])

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
              hi, Vanesa
              <br />
              <em>here</em>
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
              <Link to="/about" className="btn-secondary">About Me</Link>
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
