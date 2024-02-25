const appName = "testing";
const shortAppName = "test";
const appDescription = "testing nuxt pwa";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@vite-pwa/nuxt"],
  // @ts-ignore
  pwa: {
    scope: "/",
    base: "/",
    injectRegister: "auto",
    registerType: "autoUpdate",
    manifest: {
      name: appName,
      short_name: shortAppName,
      description: appDescription,
      theme_color: "#1867c0",
      background_color: "#1867c0",
      icons: [
        {
          src: "pwa-64x64.png",
          sizes: "64x64",
          type: "image/png",
        },
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "maskable-icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    registerWebManifestInRouteRules: true,
    workbox: {
      navigateFallback: undefined,
      cleanupOutdatedCaches: true,
      // globPatterns: [
      //   "**/*.{json,ico,svg,ttf,woff,css,scss,js,html,txt,jpg,png,woff2,mjs,otf,ani}",
      // ],
      runtimeCaching: [
        {
          urlPattern: "/",
          handler: "NetworkFirst",
        },
        {
          urlPattern: /^https:\/\/api\.com\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "defualt-cache",
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
    client: {
      installPrompt: false,
      periodicSyncForUpdates: 20, //seconds
    },
    devOptions: {
      enabled: true,
      suppressWarnings: false,
      navigateFallback: "index.html",
      type: "module",
    },
  },
});
