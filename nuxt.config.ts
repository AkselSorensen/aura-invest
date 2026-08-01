import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      titleTemplate: '%s — AuraInvest',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0A0A0F' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'AuraInvest' },
        { name: 'description', content: 'AuraInvest — Pilotez votre patrimoine en toute simplicité. Suivez vos actions, ETF, private equity, immobilier et objets de collection avec des outils pro.' },
        { name: 'keywords', content: 'investissement, patrimoine, bourse, actions, etf, private equity, immobilier, dividendes, trading, gestion patrimoine, suivi investissement' },
        { name: 'author', content: 'AuraInvest' },
        { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'AuraInvest' },
        { property: 'og:title', content: 'AuraInvest — Pilotez votre patrimoine' },
        { property: 'og:description', content: 'Suivez vos actions, ETF, private equity, immobilier et objets de collection avec des outils professionnels.' },
        { property: 'og:image', content: '/icons/512.svg' },
        { property: 'og:locale', content: 'fr_FR' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'AuraInvest — Pilotez votre patrimoine' },
        { name: 'twitter:description', content: 'Suivez vos actions, ETF, private equity, immobilier et objets de collection avec des outils professionnels.' },
        { name: 'twitter:image', content: '/icons/512.svg' },
      ],
      link: [
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'apple-touch-icon', href: '/icons/192.svg' },
        { rel: 'canonical', href: 'https://aura-invest-theta.vercel.app' },
        { rel: 'icon', type: 'image/svg+xml', href: '/icons/192.svg' },
      ],
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'AuraInvest',
            url: 'https://aura-invest-theta.vercel.app',
            description: 'Plateforme de pilotage de patrimoine — actions, ETF, private equity, immobilier, objets de collection.',
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
          })
        }
      ]
    }
  },
  vite: {
    plugins: [tailwindcss()]
  },
  nitro: {
    preset: 'vercel',
  }
})
