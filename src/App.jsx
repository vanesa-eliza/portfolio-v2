import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { useEffect, useRef, lazy, Suspense } from 'react'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import GridLines from './components/GridLines'
import RequireAuth from './components/RequireAuth'
import Home from './pages/Home'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Writing from './pages/Writing'
import PostDetail from './pages/PostDetail'

// Admin pages are tooling only the site owner uses, so they are code-split
// out of the initial bundle and loaded on demand when an /admin route is hit.
const Login = lazy(() => import('./pages/admin/Login'))
const Editor = lazy(() => import('./pages/admin/Editor'))
const AboutEditor = lazy(() => import('./pages/admin/AboutEditor'))
const HomeEditor = lazy(() => import('./pages/admin/HomeEditor'))
const TimelineEditor = lazy(() => import('./pages/admin/TimelineEditor'))
const SkillsEditor = lazy(() => import('./pages/admin/SkillsEditor'))
const ProjectsAdmin = lazy(() => import('./pages/admin/ProjectsAdmin'))
const ProjectEditor = lazy(() => import('./pages/admin/ProjectEditor'))
const ProjectsHeaderEditor = lazy(() => import('./pages/admin/ProjectsHeaderEditor'))
const CertificatesEditor = lazy(() => import('./pages/admin/CertificatesEditor'))

function AdminShortcut() {
  const navigate = useNavigate()
  const buffer = useRef('')

  useEffect(() => {
    function handleKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      buffer.current = (buffer.current + e.key).slice(-5)
      if (buffer.current === 'admin') navigate('/admin/login')
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [navigate])

  return null
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={null}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/writing" element={<Writing />} />
        <Route path="/writing/:slug" element={<PostDetail />} />

        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/new" element={<RequireAuth><Editor /></RequireAuth>} />
        <Route path="/admin/edit/:id" element={<RequireAuth><Editor /></RequireAuth>} />
        <Route path="/admin/about" element={<RequireAuth><AboutEditor /></RequireAuth>} />
        <Route path="/admin/home" element={<RequireAuth><HomeEditor /></RequireAuth>} />
        <Route path="/admin/timeline/:type" element={<RequireAuth><TimelineEditor /></RequireAuth>} />
        <Route path="/admin/skills" element={<RequireAuth><SkillsEditor /></RequireAuth>} />
        <Route path="/admin/projects" element={<RequireAuth><ProjectsAdmin /></RequireAuth>} />
        <Route path="/admin/projects-subtitle" element={<RequireAuth><ProjectsHeaderEditor /></RequireAuth>} />
        <Route path="/admin/certificates" element={<RequireAuth><CertificatesEditor /></RequireAuth>} />
        <Route path="/admin/projects/new" element={<RequireAuth><ProjectEditor /></RequireAuth>} />
        <Route path="/admin/projects/:slug/edit" element={<RequireAuth><ProjectEditor /></RequireAuth>} />
      </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <GridLines />
      <AdminShortcut />
      <Navbar />
      <main>
        <AnimatedRoutes />
      </main>
      <Footer />
      <SpeedInsights />
    </BrowserRouter>
  )
}
