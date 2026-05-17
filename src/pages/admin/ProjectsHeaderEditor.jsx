import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import '../../styles/Admin.css'

const DEFAULT = "A selection of academic and personal projects. Each one taught me something I didn't expect to learn."

export default function ProjectsHeaderEditor() {
  const navigate = useNavigate()
  const [value, setValue] = useState(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('about')
      .select('value')
      .eq('key', 'projects_description')
      .single()
      .then(({ data }) => {
        if (data) setValue(data.value)
        setLoading(false)
      })
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { error } = await supabase
      .from('about')
      .upsert({ key: 'projects_description', value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) { setError(error.message); setSaving(false) }
    else navigate('/projects')
  }

  if (loading) return null

  return (
    <div className="admin-page">
      <h1 className="admin-title">Edit projects subtitle</h1>
      <p className="admin-subtitle">Plain text. This appears below the Projects heading.</p>

      <form onSubmit={handleSave} className="admin-form">
        <textarea
          className="admin-input admin-textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          placeholder="Write the projects page subtitle…"
        />

        {error && <p className="admin-error">{error}</p>}

        <div className="admin-actions">
          <button className="admin-btn" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button className="admin-btn-cancel" type="button" onClick={() => navigate('/projects')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
