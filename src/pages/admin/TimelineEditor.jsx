import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import '../../styles/Admin.css'

const CONFIG = {
  education: {
    label: 'Education',
    contextField: 'institution',
    contextPlaceholder: 'Institution name',
    detailIsArray: true,
    detailPlaceholder: 'One bullet per line',
  },
  experience: {
    label: 'Experience',
    contextField: 'context',
    contextPlaceholder: 'Company / org name',
    detailIsArray: false,
    detailPlaceholder: 'Description',
  },
}

function blankForm(contextField) {
  return { period: '', title: '', [contextField]: '', detail: '' }
}

function entryToForm(entry, contextField, detailIsArray) {
  return {
    period: entry.period ?? '',
    title: entry.title ?? '',
    [contextField]: entry[contextField] ?? '',
    detail: detailIsArray && Array.isArray(entry.detail)
      ? entry.detail.join('\n')
      : entry.detail ?? '',
  }
}

function formToEntry(form, contextField, detailIsArray) {
  return {
    period: form.period,
    title: form.title,
    [contextField]: form[contextField] ?? '',
    detail: detailIsArray
      ? form.detail.split('\n').map((s) => s.trim()).filter(Boolean)
      : form.detail,
  }
}

export default function TimelineEditor() {
  const { type } = useParams()
  const navigate = useNavigate()
  const cfg = CONFIG[type]

  const [items, setItems] = useState([])
  const [editingIdx, setEditingIdx] = useState(null)
  const [form, setForm] = useState(blankForm(cfg?.contextField))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!cfg) return
    supabase
      .from('about')
      .select('value')
      .eq('key', type)
      .single()
      .then(({ data }) => {
        if (data) setItems(JSON.parse(data.value))
        setLoading(false)
      })
  }, [type, cfg])

  if (!cfg) return <p className="admin-error-page">Unknown section.</p>

  function setField(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function startEdit(idx) {
    setEditingIdx(idx)
    setForm(entryToForm(items[idx], cfg.contextField, cfg.detailIsArray))
  }

  function cancelEdit() {
    setEditingIdx(null)
    setForm(blankForm(cfg.contextField))
  }

  function commitEntry(e) {
    e.preventDefault()
    const entry = formToEntry(form, cfg.contextField, cfg.detailIsArray)
    setItems((prev) => {
      if (editingIdx === null) return [...prev, entry]
      return prev.map((item, i) => (i === editingIdx ? entry : item))
    })
    setEditingIdx(null)
    setForm(blankForm(cfg.contextField))
  }

  function deleteEntry(idx) {
    if (!confirm('Delete this entry?')) return
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    const { error } = await supabase
      .from('about')
      .upsert({ key: type, value: JSON.stringify(items), updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) { setError(error.message); setSaving(false) }
    else navigate('/about')
  }

  if (loading) return null

  const isEditing = editingIdx !== null

  return (
    <div className="admin-page">
      <h1 className="admin-title">{isEditing ? `Edit ${cfg.label} entry` : `Add ${cfg.label} entry`}</h1>

      <form onSubmit={commitEntry} className="admin-form admin-form--section">
        <label className="admin-field">
          <span className="admin-field-label">Period</span>
          <input className="admin-input" value={form.period} onChange={setField('period')} required placeholder="yyyy – yyyy" />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Title</span>
          <input className="admin-input" value={form.title} onChange={setField('title')} required placeholder="Role or degree title" />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">{cfg.contextField === 'institution' ? 'Institution' : 'Context'}</span>
          <input className="admin-input" value={form[cfg.contextField] ?? ''} onChange={setField(cfg.contextField)} placeholder={cfg.contextPlaceholder} />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Detail{cfg.detailIsArray ? ' (one bullet per line)' : ''}</span>
          <textarea
            className="admin-input admin-textarea"
            value={form.detail}
            onChange={setField('detail')}
            placeholder={cfg.detailPlaceholder}
          />
        </label>
        <div className="admin-actions">
          <button className="admin-btn" type="submit">{isEditing ? 'Update entry' : 'Add entry'}</button>
          {isEditing && (
            <button className="admin-btn-cancel" type="button" onClick={cancelEdit}>Cancel edit</button>
          )}
        </div>
      </form>

      <h2 className="admin-title admin-subtitle--section">Current entries</h2>
      {items.length === 0 && <p className="admin-empty">No entries yet.</p>}
      <div className="admin-list">
        {items.map((item, i) => (
          <div key={i} className="admin-list-item">
            <div>
              <div className="admin-list-item-meta">{item.period}</div>
              <div className="admin-list-item-title">{item.title}</div>
              <div className="admin-list-item-sub">{item[cfg.contextField]}</div>
            </div>
            <div className="admin-list-item-actions">
              <button className="admin-btn-cancel admin-btn-sm" type="button" onClick={() => startEdit(i)}>Edit</button>
              <button className="admin-btn-cancel admin-btn-sm admin-btn-danger" type="button" onClick={() => deleteEntry(i)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

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
