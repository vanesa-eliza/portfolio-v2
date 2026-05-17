import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) return <Navigate to="/admin/login" replace />

  return children
}
