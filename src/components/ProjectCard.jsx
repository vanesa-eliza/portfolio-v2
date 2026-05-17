import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import '../styles/ProjectCard.css'

export default function ProjectCard({ project, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/projects/${project.slug}`} className="project-card-link">
        <article className="project-card">
          <div className="card-header">
            <div className="card-tags">
              {project.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="card-tag">{tag}</span>
              ))}
            </div>
            <span className="card-year">{project.year}</span>
          </div>

          <h3 className="card-title">{project.title}</h3>
          <p className="card-subtitle">{project.subtitle}</p>
          <p className="card-summary">{project.summary}</p>

          <motion.div className="card-cta" whileHover="hovered">
            <span>View Project</span>
            <motion.span variants={{ hovered: { x: 3 } }} style={{ display: 'inline-block' }}>→</motion.span>
          </motion.div>
        </article>
      </Link>
    </motion.div>
  )
}
