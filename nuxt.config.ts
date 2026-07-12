// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  devServer: { port: 8040 },
  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },
      title: 'Text Partitioner',
      meta: [
        { name: 'description', content: 'Split long text into clean, paragraph-like chunks in your browser.' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'alternate icon', href: '/favicon.ico' },
      ],
    },
  },
})
