import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import FadeIn from '../components/FadeIn'
import Typewriter from '../components/Typewriter'
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
          <h1 className="writing-title">
            <Typewriter segments={[{ text: 'Notes & Essays', typed: true }]} startDelay={200} />
          </h1>
          <p className="writing-description">
            Writing is where I slow down and think. These posts are about my takeaway from modules I took, the projects I&apos;ve
            built and the ideas they surfaced.
          </p>
        </FadeIn>
        {user && (
          <FadeIn className="writing-admin-new" delay={0.1}>
            <Link to="/admin/new" className="writing-new-link">+ New post</Link>
          </FadeIn>
        )}

        {loading && <p className="writing-status">Loading…</p>}
        {error && <p className="writing-status">Failed to load posts.</p>}

        <div>
          {posts.map((post, i) => (
            <FadeIn key={post.slug} delay={i * 0.06}>
              <div className="writing-post">
                {user && !post.published && (
                  <span className="writing-draft-badge">Draft</span>
                )}
                <PostCard post={{ ...post, date: post.created_at, readTime: readTime(post.body) }} />
                {user && (
                  <div className="writing-admin-actions">
                    <Link to={`/admin/edit/${post.id}`} className="writing-admin-link">Edit</Link>
                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      className="writing-admin-delete"
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
