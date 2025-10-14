import { ref } from 'vue'

const isSettingsOpen = ref(false)

export function useSettingsView() {
  const openSettings = () => {
    isSettingsOpen.value = true
  }

  const closeSettings = () => {
    isSettingsOpen.value = false
  }

  return {
    isSettingsOpen,
    openSettings,
    closeSettings,
  }
}
