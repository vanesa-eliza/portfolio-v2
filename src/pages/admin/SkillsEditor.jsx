import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import '../../styles/Admin.css'

const DEFAULT_SKILLS = {
  Languages: ['Python', 'Java', 'C++', 'SQL', 'JavaScript'],
  'Frameworks & Libraries': ['React', 'Keras', 'TensorFlow', 'Pandas'],
  'Databases & Data': ['MySQL', 'Oracle APEX'],
  Tools: ['Git', 'GitHub', 'VS Code', 'Jupyter'],
}

export default function SkillsEditor() {
  const navigate = useNavigate()
  const [skills, setSkills] = useState(DEFAULT_SKILLS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [newTag, setNewTag] = useState({})
  const [newCategory, setNewCategory] = useState('')
  const [projectTechs, setProjectTechs] = useState([])

  useEffect(() => {
    Promise.all([
      supabase.from('about').select('value').eq('key', 'skills').single(),
      supabase.from('projects').select('tech'),
    ]).then(([{ data: skillsData }, { data: projectsData }]) => {
      if (skillsData) setSkills(JSON.parse(skillsData.value))
      if (projectsData) {
        const seen = new Set()
        for (const p of projectsData) for (const t of (p.tech ?? [])) seen.add(t)
        setProjectTechs([...seen].sort())
      }
      setLoading(false)
    })
  }, [])

  function addTag(category, tag) {
    const trimmed = tag.trim()
    if (!trimmed) return
    setSkills((prev) => ({
      ...prev,
      [category]: prev[category].includes(trimmed) ? prev[category] : [...prev[category], trimmed],
    }))
    setNewTag((prev) => ({ ...prev, [category]: '' }))
  }

  function removeTag(category, tag) {
    setSkills((prev) => ({ ...prev, [category]: prev[category].filter((t) => t !== tag) }))
  }

  function addCategory() {
    const trimmed = newCategory.trim()
    if (!trimmed || skills[trimmed]) return
    setSkills((prev) => ({ ...prev, [trimmed]: [] }))
    setNewCategory('')
  }

  function removeCategory(category) {
    if (!confirm(`Remove the "${category}" category and all its tags?`)) return
    setSkills((prev) => {
      const next = { ...prev }
      delete next[category]
      return next
    })
  }

  const usedTags = new Set(Object.values(skills).flat())
  const unusedProjectTechs = projectTechs.filter((t) => !usedTags.has(t))

  async function handleSave() {
    setSaving(true)
    setError(null)
    const { error } = await supabase
      .from('about')
      .upsert({ key: 'skills', value: JSON.stringify(skills), updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) { setError(error.message); setSaving(false) }
    else navigate('/about')
  }

  if (loading) return null

  return (
    <div className="admin-page">
      <h1 className="admin-title">Edit skills</h1>
      <p className="admin-subtitle">Add or remove tags per category. Use the project panel below to pull in techs you've already listed in your projects.</p>

      {Object.entries(skills).map(([category, tags]) => (
        <div key={category} className="admin-skills-category">
          <div className="admin-skills-category-header">
            <span className="admin-field-label">{category}</span>
            <button
              className="admin-btn-cancel admin-btn-xs admin-btn-danger"
              type="button"
              onClick={() => removeCategory(category)}
            >
              Remove category
            </button>
          </div>
          <div className="admin-skills-tags">
            {tags.map((tag) => (
              <span key={tag} className="admin-skill-tag">
                {tag}
                <button className="admin-skill-tag-remove" onClick={() => removeTag(category, tag)}>×</button>
              </span>
            ))}
          </div>
          <div className="admin-inline-row">
            <input
              className="admin-input admin-input--short"
              placeholder="Add tag…"
              value={newTag[category] ?? ''}
              onChange={(e) => setNewTag((prev) => ({ ...prev, [category]: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(category, newTag[category] ?? ''))}
            />
            <button className="admin-btn-cancel admin-btn-sm" type="button" onClick={() => addTag(category, newTag[category] ?? '')}>Add</button>
          </div>
        </div>
      ))}

      <div className="admin-new-category">
        <span className="admin-field-label">New category</span>
        <div className="admin-inline-row">
          <input
            className="admin-input admin-input--short"
            placeholder="Category name…"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
          />
          <button className="admin-btn-cancel admin-btn-sm" type="button" onClick={addCategory}>Add category</button>
        </div>
      </div>

      {unusedProjectTechs.length > 0 && (
        <div className="admin-project-techs">
          <p className="admin-subtitle">From your projects — not yet in skills:</p>
          <div className="admin-skills-tags">
            {unusedProjectTechs.map((tech) => (
              <button
                key={tech}
                className="admin-btn-cancel admin-btn-sm"
                type="button"
                onClick={() => {
                  const category = prompt(`Add "${tech}" to which category?\n\n${Object.keys(skills).join(', ')}`)
                  if (category && skills[category] !== undefined) addTag(category, tech)
                  else if (category) alert('Category not found. Check the spelling.')
                }}
              >
                + {tech}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="admin-error">{error}</p>}
      <div className="admin-actions">
        <button className="admin-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button className="admin-btn-cancel" type="button" onClick={() => navigate('/about')}>Cancel</button>
      </div>
    </div>
  )
}
