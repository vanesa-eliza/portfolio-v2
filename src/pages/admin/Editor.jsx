import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import '../../styles/Admin.css'

const defaultForm = { slug: '', title: '', excerpt: '', body: '', published: false }

export default function Editor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id

  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isNew) return
    supabase
      .from('posts')
      .select('slug, title, excerpt, body, published')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else if (data) setForm(data)
        setLoading(false)
      })
  }, [id, isNew])

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = { ...form, updated_at: new Date().toISOString() }
    const { error } = isNew
      ? await supabase.from('posts').insert(payload)
      : await supabase.from('posts').update(payload).eq('id', id)

    if (error) { setError(error.message); setSaving(false) }
    else navigate('/writing')
  }

  if (loading) return null

  return (
    <div className="admin-page">
      <h1 className="admin-title" style={{ marginBottom: '2rem' }}>
        {isNew ? 'New post' : 'Edit post'}
      </h1>

      <form onSubmit={handleSave} className="admin-form">
        <label className="admin-field">
          <span className="admin-field-label">Slug</span>
          <input className="admin-input" value={form.slug} onChange={set('slug')} required placeholder="my-post-slug" />
        </label>

        <label className="admin-field">
          <span className="admin-field-label">Title</span>
          <input className="admin-input" value={form.title} onChange={set('title')} required placeholder="Post title" />
        </label>

        <label className="admin-field">
          <span className="admin-field-label">Excerpt</span>
          <input className="admin-input" value={form.excerpt} onChange={set('excerpt')} placeholder="Short description shown on the listing page" />
        </label>

        <label className="admin-field">
          <span className="admin-field-label">Body (markdown)</span>
          <textarea
            className="admin-input admin-textarea admin-textarea--tall"
            value={form.body}
            onChange={set('body')}
            required
            placeholder="Write in markdown…"
          />
        </label>

        <label className="admin-checkbox-row">
          <input type="checkbox" checked={form.published} onChange={set('published')} />
          <span>Published</span>
        </label>

        {error && <p className="admin-error">{error}</p>}

        <div className="admin-actions">
          <button className="admin-btn" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button className="admin-btn-cancel" type="button" onClick={() => navigate('/writing')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
