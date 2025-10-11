/**
 * composables/useSettingsModal.ts
 *
 * Global state management for Settings modal
 */

import { ref } from 'vue'

const isOpen = ref(false)

export function useSettingsModal() {
  const openModal = () => {
    isOpen.value = true
  }

  const closeModal = () => {
    isOpen.value = false
  }

  return {
    isOpen,
    openModal,
    closeModal,
  }
}
