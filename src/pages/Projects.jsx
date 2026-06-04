import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import FadeIn from '../components/FadeIn'
import Typewriter from '../components/Typewriter'
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
      supabase.from('about').select('value').eq('key', 'projects_description').maybeSingle(),
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
          <h1 className="projects-title">
            <Typewriter segments={[{ text: 'Projects', typed: true }]} startDelay={200} />
          </h1>
          <p className="projects-description">{description}</p>
        </FadeIn>
        {user && (
          <div className="admin-actions">
            <Link to="/admin/projects" className="admin-edit-link">Edit projects</Link>
            <Link to="/admin/projects-subtitle" className="admin-edit-link">Edit subtitle</Link>
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
