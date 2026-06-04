// Shared by the navbar (as icons) and the footer (as text links).
export const socialLinks = [
  { label: 'Email', href: 'mailto:chetruscav@yahoo.com' },
  { label: 'GitHub', href: 'https://github.com/vanesa-eliza' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/vanesa-eliza-chetrusca/' },
]

export const isExternal = (href) => !href.startsWith('mailto:')
