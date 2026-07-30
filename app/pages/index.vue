<template>
  <div class="min-h-screen bg-dark overflow-hidden">
    <!-- Nav -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-md border-b border-surface-500/50">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-gold/15 flex items-center justify-center">
            <Icon icon="lucide:sparkles" class="w-4.5 h-4.5 text-gold" />
          </div>
          <span class="text-xl font-bold text-text tracking-tight">Aura<span class="text-gold">Invest</span></span>
        </div>
        <div class="flex items-center gap-4">
          <NuxtLink to="/login" class="flex items-center gap-1.5 text-text-600 hover:text-text transition-colors text-sm">
            <Icon icon="lucide:log-in" class="w-4 h-4" />
            Connexion
          </NuxtLink>
          <NuxtLink to="/register" class="flex items-center gap-1.5 px-4 py-2 bg-gold text-dark font-semibold rounded-lg hover:bg-gold-400 transition-colors text-sm">
            <Icon icon="lucide:user-plus" class="w-4 h-4" />
            S'inscrire
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="pt-32 pb-24 px-6 relative overflow-hidden min-h-[90vh] flex items-center">
      <!-- Animated background orbs -->
      <div class="absolute top-0 right-0 w-[700px] h-[700px] rounded-full pointer-events-none" ref="orb1" style="background: radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%); filter: blur(80px);" />
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none" ref="orb2" style="background: radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%); filter: blur(80px);" />
      <div class="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full pointer-events-none" ref="orb3" style="background: radial-gradient(circle, rgba(168,85,247,0.03) 0%, transparent 70%); filter: blur(60px);" />

      <!-- Grid pattern overlay -->
      <div class="absolute inset-0 opacity-[0.03] pointer-events-none" ref="gridRef"
        style="background-image: linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px); background-size: 60px 60px;" />

      <!-- Animated floating icons -->
      <div ref="floatingIcons" class="absolute inset-0 pointer-events-none overflow-hidden">
        <div v-for="(item, i) in floatingItems" :key="i" class="absolute" :style="{ left: item.x + '%', top: item.y + '%' }" :ref="el => { if (el) floatRefs[i] = el }">
          <div class="p-2.5 rounded-xl bg-surface/50 backdrop-blur-sm border border-surface-500/30">
            <Icon :icon="item.icon" class="w-5 h-5" :class="item.color" />
          </div>
        </div>
      </div>

      <div class="max-w-4xl mx-auto text-center relative z-10 w-full" ref="heroRef">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/5 text-gold text-xs font-medium mb-8" ref="badgeRef">
          <Icon icon="lucide:zap" class="w-3.5 h-3.5" />
          Plateforme de suivi patrimonial
        </div>

        <!-- Headline - split for animation -->
        <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold text-text leading-tight mb-6 tracking-tight" ref="headlineRef">
          <span class="inline-block" ref="word1">Suivez.</span><br class="md:hidden" />
          <span class="inline-block text-gold" ref="word2">Optimisez.</span><br class="md:hidden" />
          <span class="inline-block" ref="word3">Investissez.</span>
        </h1>

        <p class="text-text-600 text-lg max-w-2xl mx-auto mb-10" ref="subRef">
          La plateforme qui centralise tous vos investissements. Suivez votre patrimoine, analysez vos performances et prenez de meilleures décisions.
        </p>

        <!-- CTAs -->
        <div class="flex items-center justify-center gap-4 mb-14" ref="ctaBtnsRef">
          <NuxtLink to="/register" class="group relative flex items-center gap-2 px-8 py-4 bg-gold text-dark font-bold rounded-xl hover:bg-gold-400 transition-all text-base shadow-lg shadow-gold/20 overflow-hidden">
            <span class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
            <Icon icon="lucide:rocket" class="w-5 h-5 relative z-10" />
            <span class="relative z-10">Démarrer gratuitement</span>
          </NuxtLink>
          <NuxtLink to="/login" class="flex items-center gap-2 px-8 py-4 border border-surface-500 text-text rounded-xl hover:border-text-700 transition-all text-base">
            <Icon icon="lucide:log-in" class="w-5 h-5" />
            Se connecter
          </NuxtLink>
        </div>

        <!-- Stats -->
        <div class="flex items-center justify-center gap-8 md:gap-12 text-sm" ref="statsRef">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
              <Icon icon="lucide:layers" class="w-4 h-4 text-gold" />
            </div>
            <div class="text-left leading-tight">
              <div class="text-text font-bold text-lg tabular-nums">8</div>
              <div class="text-text-700 text-[11px]">catégories</div>
            </div>
          </div>
          <div class="w-px h-8 bg-surface-500 hidden sm:block" />
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
              <Icon icon="lucide:shield-check" class="w-4 h-4 text-green-400" />
            </div>
            <div class="text-left leading-tight">
              <div class="text-text font-bold text-lg">100%</div>
              <div class="text-text-700 text-[11px]">gratuit</div>
            </div>
          </div>
          <div class="w-px h-8 bg-surface-500 hidden sm:block" />
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Icon icon="lucide:lock" class="w-4 h-4 text-blue-400" />
            </div>
            <div class="text-left leading-tight">
              <div class="text-text font-bold text-lg">Chiffré</div>
              <div class="text-text-700 text-[11px]">AES-256</div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- How it works -->
    <section class="py-24 px-6 relative overflow-hidden">
      <!-- Background line -->
      <div class="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-surface-500 to-transparent hidden lg:block" ref="lineRef" />

      <div class="max-w-6xl mx-auto relative">
        <div class="text-center mb-16">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-500 text-text-600 text-xs font-medium mb-5">
            <Icon icon="lucide:zap" class="w-3.5 h-3.5 text-gold" />
            Comment ça marche
          </div>
          <h2 class="text-3xl md:text-4xl font-bold text-text mb-3">Simple comme jamais</h2>
          <p class="text-text-600 text-lg max-w-lg mx-auto">Trois étapes pour prendre le contrôle de vos investissements.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8" ref="stepsRef">
          <div v-for="(step, i) in steps" :key="i" class="relative group">
            <!-- Card -->
            <div class="glass p-8 h-full text-center relative z-10 group-hover:border-gold/20 transition-all duration-500 group-hover:-translate-y-1">
              <!-- Step number -->
              <div class="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center relative"
                :class="step.bg">
                <Icon :icon="step.icon" class="w-6 h-6" :class="step.iconColor" />
                <span class="absolute -top-2 -right-2 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center border-2 border-dark"
                  :class="step.numBg + ' ' + step.numColor">
                  {{ i + 1 }}
                </span>
              </div>

              <h3 class="text-lg font-bold text-text mb-3">{{ step.title }}</h3>
              <p class="text-text-600 text-sm leading-relaxed">{{ step.desc }}</p>

              <!-- Arrow connector (desktop, between cards) -->
              <div class="hidden lg:flex absolute top-1/2 -right-5 -translate-y-1/2 z-20" v-if="i < 2">
                <div class="w-10 h-10 rounded-full bg-surface border border-surface-500 flex items-center justify-center">
                  <Icon icon="lucide:arrow-right" class="w-4 h-4 text-gold" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-20 px-6 bg-surface/30">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-text text-center mb-4">Tout votre patrimoine,<br/>en un seul endroit</h2>
        <p class="text-text-600 text-center max-w-xl mx-auto mb-14">Suivez tous vos investissements, des actions aux objets de collection.</p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" ref="featuresRef">
          <div v-for="(feat, i) in features" :key="i" class="glass group hover:border-gold/20 transition-all duration-300 p-6">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
              :class="feat.iconBg">
              <Icon :icon="feat.icon" class="w-5.5 h-5.5" :class="feat.iconColor" />
            </div>
            <h3 class="font-semibold text-text mb-2 text-[15px]">{{ feat.title }}</h3>
            <p class="text-text-600 text-[13px] leading-relaxed">{{ feat.desc }}</p>
            <div class="mt-4 flex items-center gap-1.5 text-xs text-gold/60 group-hover:text-gold transition-colors">
              <Icon icon="lucide:arrow-right" class="w-3 h-3" />
              <span>En savoir plus</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories preview -->
    <section class="py-20 px-6">
      <div class="max-w-6xl mx-auto text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-500 text-text-600 text-xs font-medium mb-4">
          <Icon icon="lucide:layers" class="w-3.5 h-3.5" />
          Classes d'actifs
        </div>
        <h2 class="text-3xl font-bold text-text mb-4">Toutes vos classes d'actifs</h2>
        <p class="text-text-600 max-w-xl mx-auto mb-10">Actions, crypto, immobilier, métaux, objets de collection — catégorisez tout.</p>
        <div class="flex flex-wrap justify-center gap-3" ref="pillsRef">
          <div v-for="cat in defaultCategories" :key="cat.name"
            class="flex items-center gap-2 px-4 py-2.5 rounded-full border border-surface-500 text-text-600 text-sm hover:border-gold/30 hover:text-text transition-all group cursor-default">
            <Icon :icon="cat.icon" class="w-4 h-4 group-hover:text-gold transition-colors" />
            {{ cat.name }}
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonial / Trust -->
    <section class="py-20 px-6 bg-surface/30">
      <div class="max-w-4xl mx-auto text-center">
        <div class="flex items-center justify-center gap-1 mb-4">
          <Icon v-for="i in 5" :key="i" icon="lucide:star" class="w-5 h-5 text-gold fill-gold" />
        </div>
        <blockquote class="text-xl md:text-2xl text-text font-medium italic mb-6 max-w-2xl mx-auto">
          "Enfin une plateforme simple pour suivre tous mes investissements au même endroit. Fini les Excel !"
        </blockquote>
        <div class="flex items-center justify-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
            <Icon icon="lucide:user" class="w-5 h-5 text-gold" />
          </div>
          <div class="text-left">
            <div class="text-sm font-medium text-text">Investisseur particulier</div>
            <div class="text-xs text-text-700">Beta testeur AuraInvest</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20 px-6">
      <div class="max-w-2xl mx-auto text-center glass-lg p-12 relative overflow-hidden" ref="ctaRef">
        <div class="absolute top-0 right-0 w-[300px] h-[300px] bg-gold/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <div class="relative z-10">
          <div class="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-6">
            <Icon icon="lucide:sparkles" class="w-7 h-7 text-gold" />
          </div>
          <h2 class="text-3xl font-bold text-text mb-4">Prenez le contrôle de vos investissements</h2>
          <p class="text-text-600 mb-8">Gratuit. Simple. Puissant.</p>
          <NuxtLink to="/register" class="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-dark font-bold rounded-xl hover:bg-gold-400 transition-all text-base shadow-lg shadow-gold/20">
            <Icon icon="lucide:arrow-right" class="w-5 h-5" />
            Créer mon compte gratuitement
          </NuxtLink>
          <p class="text-text-700 text-xs mt-4 flex items-center justify-center gap-1.5">
            <Icon icon="lucide:shield-check" class="w-3.5 h-3.5" />
            Sans engagement. Sans carte bancaire.
          </p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-surface-500 py-10 px-6">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div class="flex items-center gap-2 mb-3">
              <Icon icon="lucide:sparkles" class="w-5 h-5 text-gold" />
              <span class="font-bold text-text">Aura<span class="text-gold">Invest</span></span>
            </div>
            <p class="text-text-700 text-sm leading-relaxed">Plateforme de suivi patrimonial pour investisseurs particuliers.</p>
          </div>
          <div>
            <div class="text-xs font-semibold text-text-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Icon icon="lucide:compass" class="w-3.5 h-3.5" />Produit
            </div>
            <div class="space-y-2">
              <NuxtLink to="/login" class="block text-sm text-text-700 hover:text-text transition-colors">Tableau de bord</NuxtLink>
              <NuxtLink to="/login" class="block text-sm text-text-700 hover:text-text transition-colors">Investissements</NuxtLink>
              <NuxtLink to="/login" class="block text-sm text-text-700 hover:text-text transition-colors">Rapports</NuxtLink>
            </div>
          </div>
          <div>
            <div class="text-xs font-semibold text-text-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Icon icon="lucide:book-open" class="w-3.5 h-3.5" />Ressources
            </div>
            <div class="space-y-2">
              <a href="#" class="block text-sm text-text-700 hover:text-text transition-colors">Guide investisseur</a>
              <a href="#" class="block text-sm text-text-700 hover:text-text transition-colors">FAQ</a>
              <a href="#" class="block text-sm text-text-700 hover:text-text transition-colors">Blog</a>
            </div>
          </div>
          <div>
            <div class="text-xs font-semibold text-text-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Icon icon="lucide:mail" class="w-3.5 h-3.5" />Contact
            </div>
            <div class="space-y-2">
              <a href="#" class="flex items-center gap-1.5 text-sm text-text-700 hover:text-text transition-colors">
                <Icon icon="lucide:twitter" class="w-4 h-4" />Twitter
              </a>
              <a href="#" class="flex items-center gap-1.5 text-sm text-text-700 hover:text-text transition-colors">
                <Icon icon="lucide:github" class="w-4 h-4" />GitHub
              </a>
              <a href="#" class="flex items-center gap-1.5 text-sm text-text-700 hover:text-text transition-colors">
                <Icon icon="lucide:send" class="w-4 h-4" />Email
              </a>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between pt-6 border-t border-surface-500 text-text-700 text-xs">
          <div class="flex items-center gap-1.5">
            <Icon icon="lucide:sparkles" class="w-3.5 h-3.5 text-gold/50" />
            <span>© 2026 AuraInvest. Tous droits réservés.</span>
          </div>
          <div class="flex items-center gap-4">
            <a href="#" class="hover:text-text transition-colors">Confidentialité</a>
            <a href="#" class="hover:text-text transition-colors">CGU</a>
            <a href="#" class="hover:text-text transition-colors flex items-center gap-1">
              <Icon icon="lucide:shield" class="w-3 h-3" />Sécurité
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'

definePageMeta({ layout: false })

const heroRef = ref<HTMLElement | null>(null)
const badgeRef = ref<HTMLElement | null>(null)
const headlineRef = ref<HTMLElement | null>(null)
const word1 = ref<HTMLElement | null>(null)
const word2 = ref<HTMLElement | null>(null)
const word3 = ref<HTMLElement | null>(null)
const subRef = ref<HTMLElement | null>(null)
const ctaBtnsRef = ref<HTMLElement | null>(null)
const statsRef = ref<HTMLElement | null>(null)
const orb1 = ref<HTMLElement | null>(null)
const orb2 = ref<HTMLElement | null>(null)
const orb3 = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)
const floatRefs = ref<HTMLElement[]>([])
const featuresRef = ref<HTMLElement | null>(null)
const pillsRef = ref<HTMLElement | null>(null)
const ctaRef = ref<HTMLElement | null>(null)
const stepsRef = ref<HTMLElement[]>([])

const floatingItems = [
  { icon: 'lucide:bitcoin', color: 'text-orange-400/60', x: 85, y: 15 },
  { icon: 'lucide:trending-up', color: 'text-green-400/50', x: 8, y: 20 },
  { icon: 'lucide:building', color: 'text-blue-400/50', x: 90, y: 70 },
  { icon: 'lucide:gem', color: 'text-purple-400/50', x: 12, y: 65 },
  { icon: 'lucide:pie-chart', color: 'text-cyan-400/40', x: 75, y: 45 },
]

const steps = [
  { icon: 'lucide:user-plus', iconColor: 'text-blue-400', bg: 'bg-blue-500/10', numBg: 'bg-blue-500', numColor: 'text-white', title: 'Créez votre compte', desc: 'Inscrivez-vous en 30 secondes et complétez votre profil investisseur.' },
  { icon: 'lucide:wallet', iconColor: 'text-gold', bg: 'bg-gold/10', numBg: 'bg-gold', numColor: 'text-dark', title: 'Ajoutez vos actifs', desc: 'Saisissez vos investissements par catégorie avec prix d\'achat et valeur actuelle.' },
  { icon: 'lucide:bar-chart-3', iconColor: 'text-green-400', bg: 'bg-green-500/10', numBg: 'bg-green-500', numColor: 'text-white', title: 'Suivez vos performances', desc: 'Visualisez votre patrimoine, vos gains et votre diversification en un clin d\'œil.' },
]

const features = [
  { icon: 'lucide:layout-dashboard', iconColor: 'text-blue-400', iconBg: 'bg-blue-500/10', title: 'Dashboard intelligent', desc: 'Visualisez tout votre patrimoine en un coup d\'œil avec des graphiques clairs.' },
  { icon: 'lucide:layers', iconColor: 'text-purple-400', iconBg: 'bg-purple-500/10', title: 'Catégories personnalisées', desc: 'Classez vos investissements : actions, crypto, immobilier, objets...' },
  { icon: 'lucide:camera', iconColor: 'text-pink-400', iconBg: 'bg-pink-500/10', title: 'Photos & documents', desc: 'Ajoutez des images pour vos investissements physiques et objets de collection.' },
  { icon: 'lucide:shield-check', iconColor: 'text-green-400', iconBg: 'bg-green-500/10', title: '100% sécurisé', desc: 'Données chiffrées, hébergement européen. Vous seul y avez accès.' },
]

const defaultCategories = [
  { name: 'Actions & ETF', icon: 'lucide:trending-up' },
  { name: 'Crypto', icon: 'lucide:bitcoin' },
  { name: 'Immobilier', icon: 'lucide:building' },
  { name: 'Métaux Précieux', icon: 'lucide:coins' },
  { name: 'Objets de Collection', icon: 'lucide:gem' },
  { name: 'Private Equity', icon: 'lucide:briefcase' },
  { name: 'Épargne', icon: 'lucide:piggy-bank' },
  { name: 'Startups', icon: 'lucide:rocket' },
]

let heroCtx: gsap.Context | null = null

onMounted(() => {
  nextTick(() => {
    heroCtx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // Animate orbs - subtle drift
      gsap.to(orb1.value, { x: -30, y: -20, duration: 20, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to(orb2.value, { x: 20, y: 30, duration: 25, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to(orb3.value, { x: -15, y: -25, duration: 18, repeat: -1, yoyo: true, ease: 'sine.inOut' })

      // Grid pulse
      gsap.to(gridRef.value, { opacity: 0.05, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' })

      // Floating icons entrance + drift
      floatRefs.value.forEach((el, i) => {
        gsap.set(el, { autoAlpha: 0, scale: 0.5 })
        gsap.to(el, {
          autoAlpha: 1, scale: 1, duration: 0.6, delay: 0.8 + i * 0.15, ease: 'back.out(1.5)'
        })
        gsap.to(el, {
          y: gsap.utils.random(-15, 15), x: gsap.utils.random(-10, 10),
          rotation: gsap.utils.random(-5, 5), duration: gsap.utils.random(3, 6),
          repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 0.2
        })
      })

      // Main hero timeline
      tl.fromTo(badgeRef.value, { autoAlpha: 0, y: -20, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5 })
      tl.fromTo(word1.value, { autoAlpha: 0, y: 40, rotationX: -15 }, { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.7 }, '-=0.15')
      tl.fromTo(word2.value, { autoAlpha: 0, y: 40, rotationX: -15 }, { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.7 }, '-=0.4')
      tl.fromTo(word3.value, { autoAlpha: 0, y: 40, rotationX: -15 }, { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.7 }, '-=0.4')
      tl.fromTo(subRef.value, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5 }, '-=0.15')
      tl.fromTo(ctaBtnsRef.value?.children || [], { autoAlpha: 0, y: 16, scale: 0.95 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.1 }, '-=0.1')
      tl.fromTo(statsRef.value?.children || [], { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08 }, '-=0.1')

      // Scroll-triggered animations
      if (featuresRef.value) {
        gsap.fromTo(featuresRef.value.children, { autoAlpha: 0, y: 30 }, {
          autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: featuresRef.value, start: 'top 82%', toggleActions: 'play none none none' }
        })
      }

      if (stepsRef.value.length > 0) {
        gsap.fromTo(stepsRef.value, { autoAlpha: 0, y: 24 }, {
          autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: stepsRef.value[0], start: 'top 82%', toggleActions: 'play none none none' }
        })
      }

      if (pillsRef.value) {
        gsap.fromTo(pillsRef.value.children, { autoAlpha: 0, y: 15 }, {
          autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power3.out',
          scrollTrigger: { trigger: pillsRef.value, start: 'top 88%', toggleActions: 'play none none none' }
        })
      }

      if (ctaRef.value) {
        gsap.fromTo(ctaRef.value, { autoAlpha: 0, y: 30, scale: 0.95 }, {
          autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: ctaRef.value, start: 'top 85%', toggleActions: 'play none none none' }
        })
      }
    })
  })
})

onUnmounted(() => {
  heroCtx?.revert()
})
</script>
