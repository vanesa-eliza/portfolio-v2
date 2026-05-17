import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import '../../styles/Admin.css'

export default function ProjectsAdmin() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    supabase
      .from('projects')
      .select('slug, title, year, subtitle')
      .order('year', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) setItems(data)
      })
  }, [])

  async function handleDelete(slug) {
    const { error: err } = await supabase
      .from('projects')
      .delete()
      .eq('slug', slug)
    if (err) setError(err.message)
    else setItems((prev) => prev.filter((p) => p.slug !== slug))
  }

  return (
    <div className="admin-page">
      <h1 className="admin-title">Projects</h1>

      <div className="admin-actions">
        <button className="admin-btn" onClick={() => navigate('/admin/projects/new')}>
          Add project
        </button>
        <button className="admin-btn-cancel" onClick={() => navigate('/projects')}>
          Back to projects
        </button>
      </div>

      {error && <p className="admin-error">{error}</p>}

      {items.length === 0 ? (
        <p className="admin-empty">No projects yet.</p>
      ) : (
        <div className="admin-list">
          {items.map((project) => (
            <div key={project.slug} className="admin-list-item">
              <div>
                <div className="admin-list-item-meta">{project.year}</div>
                <div className="admin-list-item-title">{project.title}</div>
                <div className="admin-list-item-sub">{project.subtitle}</div>
              </div>
              <div className="admin-list-item-actions">
                <Link
                  to={`/admin/projects/${project.slug}/edit`}
                  className="admin-btn-cancel admin-btn-sm"
                >
                  Edit
                </Link>
                <button
                  className="admin-btn-cancel admin-btn-sm admin-btn-danger"
                  onClick={() => handleDelete(project.slug)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
