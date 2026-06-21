import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import '../../styles/Admin.css'

// Certificates are stored in the `about` key/value table under the
// `certificates` key, as a JSON array of { title, issuer, date, image, url }.
// Uploaded images live in their own `certificates` storage bucket.
const BUCKET = 'certificates'

function blankCert() {
  return { title: '', issuer: '', date: '', image: '', url: '' }
}

// Extract the in-bucket path (e.g. "123.png") from a public URL.
// Returns null for URLs that aren't from this bucket.
function storagePathFromUrl(src) {
  const marker = `/${BUCKET}/`
  const i = src.indexOf(marker)
  return i === -1 ? null : src.slice(i + marker.length)
}

export default function CertificatesEditor() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState({})
  const [error, setError] = useState('')
  // Image URLs present when the page loaded, so we can delete from storage any
  // that get dropped or replaced on save.
  const originalImages = useRef([])

  useEffect(() => {
    supabase
      .from('about')
      .select('value')
      .eq('key', 'certificates')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          const parsed = JSON.parse(data.value)
          setItems(parsed)
          originalImages.current = parsed.map((c) => c.image).filter(Boolean)
        }
        setLoading(false)
      })
  }, [])

  function setField(index, key, value) {
    setItems((prev) => prev.map((c, i) => (i === index ? { ...c, [key]: value } : c)))
  }

  function addCert() {
    setItems((prev) => [...prev, blankCert()])
  }

  function removeCert(index) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function uploadImage(index, file) {
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}.${ext}`
    setUploading((prev) => ({ ...prev, [index]: true }))
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true })
    if (uploadErr) {
      setError(uploadErr.message)
      setUploading((prev) => ({ ...prev, [index]: false }))
      return
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    setField(index, 'image', data.publicUrl)
    setUploading((prev) => ({ ...prev, [index]: false }))
  }

  async function handleSave() {
    setError('')
    setSaving(true)

    const cleaned = items
      .map((c) => ({
        title: c.title.trim(),
        issuer: c.issuer.trim(),
        date: c.date.trim(),
        image: c.image.trim(),
        url: c.url.trim(),
      }))
      .filter((c) => c.title || c.image)

    const { error: err } = await supabase
      .from('about')
      .upsert(
        { key: 'certificates', value: JSON.stringify(cleaned), updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )

    if (err) {
      setSaving(false)
      setError(err.message)
      return
    }

    // Delete storage files for images that were removed or replaced. Only touch
    // files we uploaded (their URL contains the bucket path).
    const savedImages = new Set(cleaned.map((c) => c.image))
    const removedPaths = originalImages.current
      .filter((src) => !savedImages.has(src))
      .map(storagePathFromUrl)
      .filter(Boolean)
    if (removedPaths.length > 0) {
      await supabase.storage.from(BUCKET).remove(removedPaths)
    }

    setSaving(false)
    navigate('/#certificates')
  }

  if (loading) return null

  return (
    <div className="admin-page">
      <h1 className="admin-title">Edit certificates</h1>
      <p className="admin-subtitle">Each certificate shows its image in a grid. Click a card on the site to view the full-size scan.</p>

      <div className="admin-form">
        {items.map((c, i) => (
          <div key={i} className="admin-cert-row">
            <div className="admin-form-row">
              <div className="admin-field admin-field--grow">
                <label className="admin-field-label">
                  Title
                  <span className="admin-field-note">optional</span>
                </label>
                <input
                  className="admin-input"
                  value={c.title}
                  onChange={(e) => setField(i, 'title', e.target.value)}
                />
              </div>
              <div className="admin-field">
                <label className="admin-field-label">Date</label>
                <input
                  className="admin-input admin-input--short"
                  placeholder="2024"
                  value={c.date}
                  onChange={(e) => setField(i, 'date', e.target.value)}
                />
              </div>
            </div>

            <div className="admin-field">
              <label className="admin-field-label">Issuer</label>
              <input
                className="admin-input"
                placeholder="e.g. Amazon Web Services"
                value={c.issuer}
                onChange={(e) => setField(i, 'issuer', e.target.value)}
              />
            </div>

            <div className="admin-field">
              <label className="admin-field-label">
                Credential URL
                <span className="admin-field-note">optional verification link</span>
              </label>
              <input
                className="admin-input"
                value={c.url}
                onChange={(e) => setField(i, 'url', e.target.value)}
              />
            </div>

            <div className="admin-field">
              <label className="admin-field-label">Image</label>
              <div className="admin-image-row">
                <input
                  className="admin-input"
                  placeholder="URL or upload"
                  value={c.image}
                  onChange={(e) => setField(i, 'image', e.target.value)}
                />
                <label className={`admin-btn-cancel admin-btn-sm${uploading[i] ? ' admin-btn-disabled' : ''}`}>
                  {uploading[i] ? 'Uploading…' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    className="admin-file-input"
                    disabled={uploading[i]}
                    onChange={(e) => e.target.files[0] && uploadImage(i, e.target.files[0])}
                  />
                </label>
              </div>
              {c.image && <img src={c.image} alt="" className="admin-cert-preview" />}
            </div>

            <button
              type="button"
              className="admin-btn-cancel admin-btn-sm admin-btn-danger"
              onClick={() => removeCert(i)}
            >
              Remove certificate
            </button>
          </div>
        ))}

        <button type="button" className="admin-btn-cancel admin-btn-sm" onClick={addCert}>
          Add certificate
        </button>

        {error && <p className="admin-error">{error}</p>}

        <div className="admin-actions">
          <button className="admin-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button className="admin-btn-cancel" type="button" onClick={() => navigate('/#certificates')}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
