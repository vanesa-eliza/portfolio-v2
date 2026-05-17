import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import '../../styles/Admin.css'

function blankForm() {
  return {
    slug: '',
    title: '',
    year: '',
    subtitle: '',
    summary: '',
    description: '',
    highlights: '',
    tech: '',
    tags: '',
    github: '',
    images: [],
  }
}

function projectToForm(p) {
  return {
    slug: p.slug ?? '',
    title: p.title ?? '',
    year: p.year ?? '',
    subtitle: p.subtitle ?? '',
    summary: p.summary ?? '',
    description: p.description ?? '',
    highlights: Array.isArray(p.highlights) ? p.highlights.join('\n') : (p.highlights ?? ''),
    tech: Array.isArray(p.tech) ? p.tech.join(', ') : (p.tech ?? ''),
    tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags ?? ''),
    github: p.github ?? '',
    images: Array.isArray(p.images) ? p.images.map((img) => ({ ...img })) : [],
  }
}

function formToProject(form) {
  return {
    slug: form.slug.trim(),
    title: form.title.trim(),
    year: form.year.trim(),
    subtitle: form.subtitle.trim(),
    summary: form.summary.trim(),
    description: form.description.trim(),
    highlights: form.highlights
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    tech: form.tech
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    tags: form.tags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    github: form.github.trim(),
    images: form.images.filter((img) => img.src && img.src.trim()),
  }
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function ProjectEditor() {
  const { slug } = useParams()
  const isNew = !slug
  const navigate = useNavigate()

  const [form, setForm] = useState(blankForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    if (isNew) return
    supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        if (data) setForm(projectToForm(data))
      })
  }, [slug, isNew])

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleTitleChange(e) {
    const title = e.target.value
    setForm((prev) => ({
      ...prev,
      title,
      slug: isNew ? slugify(title) : prev.slug,
    }))
  }

  function setImageField(index, key, value) {
    setForm((prev) => {
      const images = prev.images.map((img, i) =>
        i === index ? { ...img, [key]: value } : img
      )
      return { ...prev, images }
    })
  }

  function addImage() {
    setForm((prev) => ({ ...prev, images: [...prev.images, { src: '', caption: '' }] }))
  }

  function removeImage(index) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  async function uploadImage(index, file) {
    if (!form.slug) {
      setError('Set a slug before uploading images')
      return
    }
    const ext = file.name.split('.').pop()
    const path = `${form.slug}/${Date.now()}.${ext}`
    setUploading((prev) => ({ ...prev, [index]: true }))
    const { error: uploadErr } = await supabase.storage
      .from('project-images')
      .upload(path, file, { upsert: true })
    if (uploadErr) {
      setError(uploadErr.message)
      setUploading((prev) => ({ ...prev, [index]: false }))
      return
    }
    const { data } = supabase.storage.from('project-images').getPublicUrl(path)
    setImageField(index, 'src', data.publicUrl)
    setUploading((prev) => ({ ...prev, [index]: false }))
  }

  async function handleSave() {
    setError('')
    setSaving(true)

    const project = formToProject(form)

    const { error: err } = await supabase
      .from('projects')
      .upsert(
        { ...project, updated_at: new Date().toISOString() },
        { onConflict: 'slug' }
      )

    setSaving(false)

    if (err) {
      setError(err.message)
    } else {
      navigate('/admin/projects')
    }
  }

  return (
    <div className="admin-page">
      <h1 className="admin-title">{isNew ? 'New project' : 'Edit project'}</h1>

      <div className="admin-form">
        {/* Title + Year */}
        <div className="admin-form-row">
          <div className="admin-field admin-field--grow">
            <label className="admin-field-label">Title</label>
            <input
              className="admin-input"
              value={form.title}
              onChange={handleTitleChange}
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Year</label>
            <input
              className="admin-input admin-input--short"
              value={form.year}
              onChange={(e) => setField('year', e.target.value)}
            />
          </div>
        </div>

        {/* Slug */}
        <div className="admin-field">
          <label className="admin-field-label">
            Slug
            {!isNew && (
              <span className="admin-field-note">(changing breaks existing URLs)</span>
            )}
          </label>
          <input
            className="admin-input"
            value={form.slug}
            onChange={(e) => setField('slug', e.target.value)}
          />
        </div>

        {/* Subtitle */}
        <div className="admin-field">
          <label className="admin-field-label">
            Subtitle
            <span className="admin-field-note">card tagline e.g. Python · React · etc</span>
          </label>
          <input
            className="admin-input"
            value={form.subtitle}
            onChange={(e) => setField('subtitle', e.target.value)}
          />
        </div>

        {/* Summary */}
        <div className="admin-field">
          <label className="admin-field-label">
            Summary
            <span className="admin-field-note">short description shown on card</span>
          </label>
          <textarea
            className="admin-input admin-textarea admin-textarea--short"
            value={form.summary}
            onChange={(e) => setField('summary', e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="admin-field">
          <label className="admin-field-label">
            Description
            <span className="admin-field-note">full detail page text</span>
          </label>
          <textarea
            className="admin-input admin-textarea admin-textarea--tall"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
          />
        </div>

        {/* Highlights */}
        <div className="admin-field">
          <label className="admin-field-label">
            Highlights
            <span className="admin-field-note">one bullet point per line</span>
          </label>
          <textarea
            className="admin-input admin-textarea"
            value={form.highlights}
            onChange={(e) => setField('highlights', e.target.value)}
          />
        </div>

        {/* Tech stack */}
        <div className="admin-field">
          <label className="admin-field-label">
            Tech stack
            <span className="admin-field-note">comma-separated e.g. Python, React</span>
          </label>
          <input
            className="admin-input"
            value={form.tech}
            onChange={(e) => setField('tech', e.target.value)}
          />
        </div>

        {/* Tags */}
        <div className="admin-field">
          <label className="admin-field-label">
            Tags
            <span className="admin-field-note">comma-separated</span>
          </label>
          <input
            className="admin-input"
            value={form.tags}
            onChange={(e) => setField('tags', e.target.value)}
          />
        </div>

        {/* GitHub URL */}
        <div className="admin-field">
          <label className="admin-field-label">GitHub URL</label>
          <input
            type="text"
            className="admin-input"
            value={form.github}
            onChange={(e) => setField('github', e.target.value)}
          />
        </div>

        {/* Images */}
        <div className="admin-field">
          <label className="admin-field-label">Images</label>
          {form.images.map((img, i) => (
            <div key={i} className="admin-image-row">
              <input
                className="admin-input"
                placeholder="URL or upload below"
                value={img.src}
                onChange={(e) => setImageField(i, 'src', e.target.value)}
              />
              <input
                className="admin-input"
                placeholder="Caption"
                value={img.caption}
                onChange={(e) => setImageField(i, 'caption', e.target.value)}
              />
              <label className={`admin-btn-cancel admin-btn-sm${uploading[i] ? ' admin-btn-disabled' : ''}`}>
                {uploading[i] ? 'Uploading…' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  disabled={uploading[i]}
                  onChange={(e) => e.target.files[0] && uploadImage(i, e.target.files[0])}
                />
              </label>
              <button
                type="button"
                className="admin-btn-cancel admin-btn-sm admin-btn-danger"
                onClick={() => removeImage(i)}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="admin-btn-cancel admin-btn-sm" onClick={addImage}>
            Add image
          </button>
        </div>

        {error && <p className="admin-error">{error}</p>}

        <div className="admin-actions">
          <button className="admin-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            className="admin-btn-cancel"
            onClick={() => navigate('/admin/projects')}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
