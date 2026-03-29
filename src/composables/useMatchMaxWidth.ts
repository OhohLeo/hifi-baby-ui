import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Tracks (max-width: Npx) without Vuetify's useDisplay().
 * Avoids coupling Settings layout to display.updateSize() (resize/theme churn) which can race Vue's patch cycle.
 */
export function useMatchMaxWidth(maxPx: number) {
  const matches = ref(false)
  let mq: MediaQueryList | null = null

  const sync = () => {
    if (mq) {
      matches.value = mq.matches
    }
  }

  onMounted(() => {
    if (typeof window === 'undefined') {
      return
    }
    mq = window.matchMedia(`(max-width: ${maxPx}px)`)
    matches.value = mq.matches
    mq.addEventListener('change', sync)
  })

  onUnmounted(() => {
    mq?.removeEventListener('change', sync)
    mq = null
  })

  return matches
}
