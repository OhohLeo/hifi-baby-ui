/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import PlayList from '@/components/PlayList.vue'
import Tags from '@/components/Tags.vue'
import Settings from '@/components/Settings.vue'
import DefaultLayout from '@/layouts/default.vue'

const routes = [
  {
    path: '/',
    component: DefaultLayout, // Utilisation du layout par défaut
    children: [
      {
        path: '/',
        name: 'Playlist',
        component: PlayList,
      },
      {
        path: '/tags',
        name: 'Tags',
        component: Tags,
      },
      {
        path: '/settings',
        name: 'Settings',
        component: Settings,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
