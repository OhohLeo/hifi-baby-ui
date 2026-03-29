import { describe, it, expect, beforeEach } from 'vitest'
import { defineComponent, onMounted } from 'vue'
import { mount } from '@vue/test-utils'
import { usePlaylistSearch } from '@/composables/usePlaylistSearch'

/** The composable keeps module-level refs; reset before each test. */
function resetPlaylistSearchState() {
  const Reset = defineComponent({
    setup() {
      const { closeSearch } = usePlaylistSearch()
      onMounted(() => {
        closeSearch()
      })
      return () => null
    },
  })
  const w = mount(Reset)
  w.unmount()
}

describe('usePlaylistSearch', () => {
  beforeEach(() => {
    resetPlaylistSearchState()
  })

  it('toggles search visibility and clears query when closing', async () => {
    const Host = defineComponent({
      setup() {
        return usePlaylistSearch()
      },
      template: '<div />',
    })
    const wrapper = mount(Host)
    const vm = wrapper.vm as unknown as {
      searchVisible: boolean
      searchQuery: string
      toggleSearch: () => void
    }

    expect(vm.searchVisible).toBe(false)
    vm.toggleSearch()
    expect(vm.searchVisible).toBe(true)
    vm.searchQuery = 'abc'
    vm.toggleSearch()
    expect(vm.searchVisible).toBe(false)
    expect(vm.searchQuery).toBe('')
  })

  it('openSearch shows the search field', () => {
    const Host = defineComponent({
      setup() {
        return usePlaylistSearch()
      },
      template: '<div />',
    })
    const wrapper = mount(Host)
    const vm = wrapper.vm as unknown as {
      searchVisible: boolean
      openSearch: () => void
    }

    vm.openSearch()
    expect(vm.searchVisible).toBe(true)
  })
})
