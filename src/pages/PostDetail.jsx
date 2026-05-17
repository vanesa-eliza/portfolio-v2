import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import PageTransition from '../components/PageTransition'
import FadeIn from '../components/FadeIn'
import { supabase } from '../lib/supabase'
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

export default function PostDetail() {
  const { slug } = useParams()
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
      </article>
    </PageTransition>
  )
}
