import { useState } from 'react'
import { useAuth } from '../../lib/useAuth'
import { useNavigate } from 'react-router-dom'
import '../../styles/Admin.css'

export default function Login() {
  const { user, loading: authLoading, signIn, signOut } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signIn(email, password)
    if (error) setError(error.message)
    else navigate('/writing')
    setLoading(false)
  }

  if (authLoading) return null

  if (user) {
    return (
      <div className="admin-wrap">
        <div className="admin-card">
          <h1 className="admin-title">Admin</h1>
          <p className="admin-subtitle">You are signed in as {user.email}.</p>
          <div className="admin-actions">
            <button className="admin-btn" onClick={() => signOut().then(() => navigate('/'))}>Sign out</button>
            <button className="admin-btn-cancel" onClick={() => navigate('/')}>Home</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-wrap">
      <div className="admin-card">
        <h1 className="admin-title">Admin</h1>
        <p className="admin-subtitle">Sign in to manage your content.</p>

        <form onSubmit={handleSubmit} className="admin-form">
          <input
            className="admin-input"
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="admin-input"
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="admin-error">{error}</p>}
          <button className="admin-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
