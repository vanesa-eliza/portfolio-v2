import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import PageTransition from '../components/PageTransition'
import FadeIn from '../components/FadeIn'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/useAuth'
import '../styles/PostDetail.css'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function readTime(body) {
  const words = body?.trim().split(/\s+/).length ?? 0
  return `${Math.max(1, Math.ceil(words / 200))} min read`
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="16" height="16">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  )
}

export default function PostDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    supabase
      .from('posts')
      .select('slug, title, body, created_at')
      .eq('slug', slug)
      .eq('published', true)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true)
        else setPost(data)
        setLoading(false)
      })
  }, [slug])

  if (loading) return null

  if (notFound) {
    return (
      <PageTransition>
        <div className="not-found">
          Post not found.{' '}
          <Link to="/writing">Back to writing</Link>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <article className="page-sm">
        <FadeIn>
          <Link to="/writing" className="back-link">← Back to Writing</Link>
        </FadeIn>

        <FadeIn delay={0.08}>
          <div className="post-meta">
            <span>{formatDate(post.created_at)}</span>
            <span className="post-meta-sep">·</span>
            <span>{readTime(post.body)}</span>
          </div>
          <h1 className="post-detail-title">{post.title}</h1>
        </FadeIn>

        <div className="post-separator" />

        <FadeIn delay={0.15}>
          <div className="post-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
          </div>
        </FadeIn>

        {user && (
          <FadeIn delay={0.2}>
            <div className="post-share">
              <span className="post-share-label">Share</span>
              <a
                className="post-share-link"
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share this post on LinkedIn"
              >
                <LinkedInIcon />
                LinkedIn
              </a>
            </div>
          </FadeIn>
        )}
      </article>
    </PageTransition>
  )
}
