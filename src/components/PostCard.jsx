import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import '../styles/PostCard.css'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function PostCard({ post }) {
  return (
    <Link to={`/writing/${post.slug}`} className="post-card-link">
      <article className="post-card">
        <div className="post-date">{formatDate(post.date)}</div>
        <div className="post-content">
          <div className="post-content-header">
            <h3 className="post-title">{post.title}</h3>
            <span className="post-read-time">{post.readTime}</span>
          </div>
          <p className="post-excerpt">{post.excerpt}</p>
          <div className="post-date-mobile">{formatDate(post.date)}</div>
          <motion.div className="post-read-link" whileHover="hovered">
            <span>Read Post</span>
            <motion.span variants={{ hovered: { x: 3 } }} style={{ display: 'inline-block' }}>→</motion.span>
          </motion.div>
        </div>
      </article>
    </Link>
  )
}
