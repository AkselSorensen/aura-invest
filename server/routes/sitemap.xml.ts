export default defineEventHandler(() => {
  const baseUrl = 'https://aura-invest-theta.vercel.app'
  const pages = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/login', priority: '0.6', changefreq: 'monthly' },
    { loc: '/register', priority: '0.6', changefreq: 'monthly' },
    { loc: '/onboarding', priority: '0.5', changefreq: 'monthly' },
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${baseUrl}${p.loc}</loc>
    <priority>${p.priority}</priority>
    <changefreq>${p.changefreq}</changefreq>
  </url>`).join('\n')}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  })
})
