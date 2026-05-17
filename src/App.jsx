import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import RequireAuth from './components/RequireAuth'
import Home from './pages/Home'
import About from './pages/About'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Writing from './pages/Writing'
import PostDetail from './pages/PostDetail'
import Contact from './pages/Contact'
import Login from './pages/admin/Login'
import Editor from './pages/admin/Editor'
import AboutEditor from './pages/admin/AboutEditor'
import HomeEditor from './pages/admin/HomeEditor'
import TimelineEditor from './pages/admin/TimelineEditor'
import SkillsEditor from './pages/admin/SkillsEditor'
import ProjectsAdmin from './pages/admin/ProjectsAdmin'
import ProjectEditor from './pages/admin/ProjectEditor'
import ProjectsHeaderEditor from './pages/admin/ProjectsHeaderEditor'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/writing" element={<Writing />} />
        <Route path="/writing/:slug" element={<PostDetail />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/new" element={<RequireAuth><Editor /></RequireAuth>} />
        <Route path="/admin/edit/:id" element={<RequireAuth><Editor /></RequireAuth>} />
        <Route path="/admin/about" element={<RequireAuth><AboutEditor /></RequireAuth>} />
        <Route path="/admin/home" element={<RequireAuth><HomeEditor /></RequireAuth>} />
        <Route path="/admin/timeline/:type" element={<RequireAuth><TimelineEditor /></RequireAuth>} />
        <Route path="/admin/skills" element={<RequireAuth><SkillsEditor /></RequireAuth>} />
        <Route path="/admin/projects" element={<RequireAuth><ProjectsAdmin /></RequireAuth>} />
        <Route path="/admin/projects-subtitle" element={<RequireAuth><ProjectsHeaderEditor /></RequireAuth>} />
        <Route path="/admin/projects/new" element={<RequireAuth><ProjectEditor /></RequireAuth>} />
        <Route path="/admin/projects/:slug/edit" element={<RequireAuth><ProjectEditor /></RequireAuth>} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <AnimatedRoutes />
      </main>
      <Footer />
    </BrowserRouter>
  )
}
