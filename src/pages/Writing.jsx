import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import FadeIn from '../components/FadeIn'
import PostCard from '../components/PostCard'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/useAuth'
import '../styles/Writing.css'

function readTime(body) {
  const words = body?.trim().split(/\s+/).length ?? 0
  return `${Math.max(1, Math.ceil(words / 200))} min read`
}

export default function Writing() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('posts')
      .select('id, slug, title, excerpt, body, created_at, published')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setPosts(data ?? [])
        setLoading(false)
      })
  }, [])

  async function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"?`)) return
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) alert(error.message)
    else setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <PageTransition>
      <div className="page-md">
        <FadeIn className="writing-header">
          <div className="writing-eyebrow">
            <div className="writing-line" />
            <span className="writing-label">Writing</span>
          </div>
          <h1 className="writing-title">Notes &amp; Essays</h1>
          <p className="writing-description">
            Writing is where I slow down and think. These posts are about my takeaway from modules I took, the projects I&apos;ve
            built and the ideas they surfaced.
          </p>
        </FadeIn>
        {user && (
          <div style={{ marginTop: '-4rem', marginBottom: '1.5rem' }}>
            <Link
              to="/admin/new"
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                textDecoration: 'none',
              }}
            >
              + New post
            </Link>
          </div>
        )}

        {loading && <p style={{ color: 'var(--muted)' }}>Loading…</p>}
        {error && <p style={{ color: 'var(--muted)' }}>Failed to load posts.</p>}

        <div>
          {posts.map((post, i) => (
            <FadeIn key={post.slug} delay={i * 0.06}>
              <div style={{ position: 'relative' }}>
                {user && !post.published && (
                  <span style={{
                    position: 'absolute',
                    top: '1rem',
                    right: 0,
                    fontSize: '0.65rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                    border: '1px solid var(--border)',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '2px',
                  }}>
                    Draft
                  </span>
                )}
                <PostCard post={{ ...post, date: post.created_at, readTime: readTime(post.body) }} />
                {user && (
                  <div style={{ display: 'flex', gap: '1rem', paddingBottom: '0.5rem' }}>
                    <Link
                      to={`/admin/edit/${post.id}`}
                      style={{ fontSize: '0.75rem', color: 'var(--muted)', textDecoration: 'none', letterSpacing: '0.1em' }}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--muted)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        letterSpacing: '0.1em',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
