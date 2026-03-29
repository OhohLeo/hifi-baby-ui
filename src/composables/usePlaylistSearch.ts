import { ref } from 'vue'

/** Shared search query for the track list (driven from the app bar). */
const searchQuery = ref('')
const searchVisible = ref(false)

export function usePlaylistSearch() {
  function toggleSearch() {
    searchVisible.value = !searchVisible.value
    if (!searchVisible.value) {
      searchQuery.value = ''
    }
  }

  function openSearch() {
    searchVisible.value = true
  }

  function closeSearch() {
    searchVisible.value = false
    searchQuery.value = ''
  }

  return {
    searchQuery,
    searchVisible,
    toggleSearch,
    openSearch,
    closeSearch,
  }
}
