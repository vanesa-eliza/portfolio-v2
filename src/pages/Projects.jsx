import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import FadeIn from '../components/FadeIn'
import ProjectCard from '../components/ProjectCard'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/useAuth'
import '../styles/Projects.css'
import '../styles/Admin.css'

const DEFAULT_DESCRIPTION = "A selection of academic and personal projects. Each one taught me something I didn't expect to learn."

export default function Projects() {
  const [items, setItems] = useState([])
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION)
  const { user } = useAuth()

  useEffect(() => {
    Promise.all([
      supabase.from('projects').select('*').order('year', { ascending: false }),
      supabase.from('about').select('value').eq('key', 'projects_description').single(),
    ]).then(([{ data: projectsData }, { data: descData }]) => {
      if (projectsData && projectsData.length > 0) setItems(projectsData)
      if (descData) setDescription(descData.value)
    })
  }, [])

  return (
    <PageTransition>
      <div className="page-xl">
        <FadeIn className="projects-header">
          <div className="projects-eyebrow">
            <div className="projects-line" />
            <span className="projects-label">Work</span>
          </div>
          <h1 className="projects-title">Projects</h1>
          <p className="projects-description">{description}</p>
        </FadeIn>
        {user && (
          <div style={{ marginTop: '-4rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
            <Link to="/admin/projects" className="admin-edit-link" style={{ marginBottom: 0 }}>Edit projects</Link>
            <Link to="/admin/projects-subtitle" className="admin-edit-link" style={{ marginBottom: 0 }}>Edit subtitle</Link>
          </div>
        )}

        <div className="projects-grid">
          {items.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
