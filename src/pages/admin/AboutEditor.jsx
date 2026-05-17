import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import '../../styles/Admin.css'

export default function AboutEditor() {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('about')
      .select('value')
      .eq('key', 'bio')
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
      .upsert({ key: 'bio', value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) { setError(error.message); setSaving(false) }
    else navigate('/about')
  }

  if (loading) return null

  return (
    <div className="admin-page">
      <h1 className="admin-title">Edit bio</h1>
      <p className="admin-subtitle">Markdown supported. This appears in the About page bio section.</p>

      <form onSubmit={handleSave} className="admin-form">
        <textarea
          className="admin-input admin-textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          placeholder="Write your bio in markdown…"
        />

        {error && <p className="admin-error">{error}</p>}

        <div className="admin-actions">
          <button className="admin-btn" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button className="admin-btn-cancel" type="button" onClick={() => navigate('/about')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
