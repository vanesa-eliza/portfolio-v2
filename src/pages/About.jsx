import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import PageTransition from '../components/PageTransition'
import FadeIn from '../components/FadeIn'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/useAuth'
import '../styles/About.css'
import '../styles/Admin.css'

const DEFAULT_SKILLS = {
  Languages: ['Python', 'Java', 'C++', 'SQL', 'JavaScript'],
  'Frameworks & Libraries': ['React', 'Keras', 'TensorFlow', 'Pandas'],
  'Databases & Data': ['MySQL', 'Oracle APEX'],
  Tools: ['Git', 'GitHub', 'VS Code', 'Jupyter'],
}

const education = [
  {
    period: '2024 – 2027',
    title: 'BSc Computer Science and Artificial Intelligence',
    institution: 'Queen Mary University of London',
    detail: [
      'First year average: 83.01%.',
      'Year 1: Procedural Programming, Computer Systems and Networks, Fundamentals of Web Technology, Automata, Object-Oriented Programming, Logic and Discrete Structures, Probability and Matrices.',
      'Year 2: Algorithms and Data Structures, Introduction to AI, Introduction to Robotics, Probabilities and Matrices, AI for Decision Making, Generative Deep Learning, Operating Systems, AI Project.',
    ],
  },
  {
    period: '2018 – 2022',
    title: 'High School',
    institution: '"Ștefan Odobleja" High School, Bucharest, Romania',
    detail: '',
  },
]

const experience = [
  {
    period: 'Jan – Apr 2026',
    title: 'Demonstrator',
    context: 'Queen Mary University of London',
    detail:
      'Supported ~25 undergraduate students weekly in lab sessions for Fundamentals of Web Technology. Assisted with debugging and explained core technical concepts in HTML, CSS, JavaScript, and PHP.',
  },
  {
    period: 'Apr 2026',
    title: 'London Marathon Volunteer',
    context: 'QMSU Baggage Drop · Finish Line',
    detail:
      'Part of the finish-line baggage team responsible for organising thousands of numbered bags across a lorry before the first finishers arrived. Relied on fast, clear communication to locate and hand off bags the moment runners crossed the line — no waiting, no fuss.',
  },
  {
    period: 'Sep 2025',
    title: 'Welcome Week Volunteer',
    context: 'Queen Mary University of London',
    detail:
      'Guided new students around campus and assisted with move-in queries. Collaborated with staff and fellow volunteers during high-traffic induction periods.',
  },
  {
    period: 'Mar 2023 – Present',
    title: 'Sales Assistant',
    context: 'JD Sports Fashion PLC',
    detail:
      'Maintained accurate stock records and worked effectively in a fast-paced customer-facing environment.',
  },
]

export default function About() {
  const { user } = useAuth()
  const [bio, setBio] = useState(null)
  const [skills, setSkills] = useState(DEFAULT_SKILLS)
  const [educationItems, setEducationItems] = useState(education)
  const [experienceItems, setExperienceItems] = useState(experience)

  useEffect(() => {
    supabase
      .from('about')
      .select('key, value')
      .in('key', ['bio', 'skills', 'education', 'experience'])
      .then(({ data }) => {
        if (!data) return
        const map = Object.fromEntries(data.map((r) => [r.key, r.value]))
        if (map.bio) setBio(map.bio)
        if (map.skills) setSkills(JSON.parse(map.skills))
        if (map.education) setEducationItems(JSON.parse(map.education))
        if (map.experience) setExperienceItems(JSON.parse(map.experience))
      })
  }, [])

  return (
    <PageTransition>
      <div className="page-xl">
        <FadeIn className="about-header">
          <div className="about-eyebrow">
            <div className="about-line" />
            <span className="about-label">About</span>
          </div>
          <h1 className="about-title">
            CS student,
            <br />
            <em>builder at heart.</em>
          </h1>
        </FadeIn>

        <div className="about-grid">
          <FadeIn delay={0.05}>
            <div className="about-bio">
              {user && (
                <Link to="/admin/about" className="admin-edit-link">Edit bio</Link>
              )}
              {bio ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{bio}</ReactMarkdown>
              ) : (
                <>
                  <p>
                    I&apos;m a second-year Computer Science and AI student at Queen Mary University of
                    London, with a first-year average of 83%. I care about building things that are both
                    correct and readable — whether that&apos;s a SQL query, a Java simulation, or a
                    neural network.
                  </p>
                  <p>
                    My projects span OOP in Java, procedural generation in Python, and machine learning
                    with Keras. Working on the Minecraft settlement generator pushed me to pick up
                    several new libraries — NumPy for terrain analysis, GDPC for world interaction —
                    and taught me how much the right tool shapes the solution. I&apos;m drawn to
                    problems where the engineering is inseparable from the thinking.
                  </p>
                  <p>
                    I&apos;ve also worked as a lab demonstrator at QMUL, helping students debug their
                    way through web technology. Outside of code, I&apos;m interested in visual design
                    and how complex systems emerge from simple rules.
                  </p>
                </>
              )}
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="about-skills">
              {user && <Link to="/admin/skills" className="admin-edit-link">Edit skills</Link>}
              {Object.entries(skills).map(([category, items]) => (
                <div key={category}>
                  <div className="skill-label">{category}</div>
                  <div className="skill-tags">
                    {items.map((skill) => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        <FadeIn>
          <div className="about-section">
            <div className="admin-section-header">
              <h2 className="about-section-title">Education</h2>
              {user && <Link to="/admin/timeline/education" className="admin-edit-link">Edit</Link>}
            </div>
            <div>
              {educationItems.map(({ period, title, institution, detail }) => (
                <div key={title} className="timeline-item">
                  <span className="timeline-period">{period}</span>
                  <div className="timeline-content">
                    <h3>{title}</h3>
                    <p className="timeline-institution">{institution}</p>
                    {Array.isArray(detail)
                      ? detail.map((line, i) => <p key={i} className="timeline-detail">{line}</p>)
                      : detail && <p className="timeline-detail">{detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="about-section">
            <div className="admin-section-header">
              <h2 className="about-section-title">Experience</h2>
              {user && <Link to="/admin/timeline/experience" className="admin-edit-link">Edit</Link>}
            </div>
            <div>
              {experienceItems.map(({ period, title, context, detail }) => (
                <div key={title} className="timeline-item">
                  <span className="timeline-period">{period}</span>
                  <div className="timeline-content">
                    <h3>{title}</h3>
                    <p className="timeline-institution">{context}</p>
                    {detail && <p className="timeline-detail">{detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  )
}
