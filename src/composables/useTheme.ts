/**
 * composables/useTheme.ts
 *
 * Theme management composable with localStorage persistence
 */

import { ref, watch, nextTick } from 'vue'
import { useTheme as useVuetifyTheme } from 'vuetify'

const THEME_STORAGE_KEY = 'hifi-baby-theme'

export function useTheme() {
  const vuetifyTheme = useVuetifyTheme()

  // Initialize from localStorage or current theme
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  const initialTheme = savedTheme || (vuetifyTheme.global.current.value.dark ? 'hifiDark' : 'hifiLight')
  const isDark = ref(initialTheme === 'hifiDark')

  // Apply theme from localStorage on mount (without triggering watcher)
  if (savedTheme && typeof window !== 'undefined') {
    const themeName = savedTheme === 'hifiDark' ? 'hifiDark' : 'hifiLight'
    // Use Vuetify's internal theme property directly without .value
    vuetifyTheme.change(themeName)
  }

  // Watch for theme changes and persist to localStorage
  watch(isDark, async (newValue) => {
    const themeName = newValue ? 'hifiDark' : 'hifiLight'
    // Defer one tick so Vue finishes the current patch before Vuetify mutates theme/layout
    await nextTick()
    vuetifyTheme.change(themeName)
    localStorage.setItem(THEME_STORAGE_KEY, themeName)
  })

  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  const getCurrentThemeName = () => {
    return isDark.value ? 'hifiDark' : 'hifiLight'
  }

  return {
    isDark,
    toggleTheme,
    currentTheme: getCurrentThemeName(),
  }
}
