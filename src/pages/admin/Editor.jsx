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
  const [sentAt, setSentAt] = useState(null)
  const [sendStatus, setSendStatus] = useState('idle') // idle | sending | done | error
  const [sendMsg, setSendMsg] = useState('')

  useEffect(() => {
    if (isNew) return
    supabase
      .from('posts')
      .select('slug, title, excerpt, body, published, newsletter_sent_at')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else if (data) {
          const { newsletter_sent_at, ...rest } = data
          setForm(rest)
          setSentAt(newsletter_sent_at)
        }
        setLoading(false)
      })
  }, [id, isNew])

  async function handleSendNewsletter() {
    const force = !!sentAt
    const confirmMsg = force
      ? `This post was already emailed on ${new Date(sentAt).toLocaleString()}.\n\nResend to ALL subscribers?`
      : 'Send this post to all subscribers now?\n\n(Make sure your latest changes are saved first.)'
    if (!confirm(confirmMsg)) return

    setSendStatus('sending')
    setSendMsg('')
    const { data, error } = await supabase.functions.invoke('send-newsletter', {
      body: { postId: id, force },
    })

    if (error) {
      setSendStatus('error')
      setSendMsg(error.message || 'Failed to send.')
      return
    }

    setSentAt(new Date().toISOString())
    setSendStatus('done')
    const failed = data?.failures?.length ?? 0
    setSendMsg(
      `Sent to ${data.sent} of ${data.total} subscriber${data.total === 1 ? '' : 's'}.` +
        (failed ? ` ${failed} failed.` : '')
    )
  }

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
      <h1 className="admin-title admin-title--spaced">
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

      {!isNew && (
        <div className="admin-newsletter">
          <span className="admin-field-label">Newsletter</span>
          {!form.published ? (
            <p className="admin-field-note">Publish and save the post to enable sending.</p>
          ) : (
            <p className="admin-field-note">
              {sentAt ? `Last emailed ${new Date(sentAt).toLocaleString()}.` : 'Not sent yet.'}
            </p>
          )}
          <button
            type="button"
            className="admin-btn-cancel admin-btn-sm"
            disabled={!form.published || sendStatus === 'sending'}
            onClick={handleSendNewsletter}
          >
            {sendStatus === 'sending'
              ? 'Sending…'
              : sentAt
                ? 'Resend to subscribers'
                : 'Send to subscribers'}
          </button>
          {sendStatus === 'done' && <p className="admin-newsletter-status">{sendMsg}</p>}
          {sendStatus === 'error' && <p className="admin-error">{sendMsg}</p>}
        </div>
      )}
    </div>
  )
}
