import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import '../../styles/Admin.css'

export default function HomeEditor() {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('about')
      .select('value')
      .eq('key', 'home_subtitle')
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
      .upsert({ key: 'home_subtitle', value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) { setError(error.message); setSaving(false) }
    else navigate('/')
  }

  if (loading) return null

  return (
    <div className="admin-page">
      <h1 className="admin-title">Edit home subtitle</h1>
      <p className="admin-subtitle">Plain text. This appears below your name on the home page.</p>

      <form onSubmit={handleSave} className="admin-form">
        <textarea
          className="admin-input admin-textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          placeholder="Write the home page subtitle…"
        />

        {error && <p className="admin-error">{error}</p>}

        <div className="admin-actions">
          <button className="admin-btn" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button className="admin-btn-cancel" type="button" onClick={() => navigate('/')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
