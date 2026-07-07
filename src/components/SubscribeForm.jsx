import { useState } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/SubscribeForm.css'

// Lets visitors subscribe to the writing newsletter. Inserts straight into the
// `subscribers` table (public INSERT is allowed by RLS; the list itself stays
// private). A duplicate email is treated as success so we never reveal whether
// an address is already on the list.
export default function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | done | error
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return

    setStatus('sending')
    const { error } = await supabase.from('subscribers').insert({ email: trimmed })

    if (error && error.code !== '23505') {
      // 23505 = unique violation (already subscribed) — treat as success.
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
      return
    }

    setStatus('done')
    setMessage("You're on the list — thanks for subscribing!")
    setEmail('')
  }

  return (
    <div className="subscribe">
      <div className="subscribe-text">
        <h2 className="subscribe-title">Get new posts by email</h2>
        <p className="subscribe-subtitle">
          Occasional notes on what I&apos;m building and learning. No spam, unsubscribe anytime.
        </p>
      </div>

      {status === 'done' ? (
        <p className="subscribe-success">{message}</p>
      ) : (
        <form className="subscribe-form" onSubmit={handleSubmit}>
          <input
            type="email"
            className="subscribe-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Email address"
            disabled={status === 'sending'}
          />
          <button type="submit" className="subscribe-btn" disabled={status === 'sending'}>
            {status === 'sending' ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>
      )}

      {status === 'error' && <p className="subscribe-error">{message}</p>}
    </div>
  )
}
