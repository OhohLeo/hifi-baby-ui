import { describe, it, expect } from 'vitest'
import App from '@/App.vue'
import { mountWithPlugins } from '../../helpers/mount-with-plugins'

describe('App', () => {
  it('renders the root shell with router outlet stubbed', () => {
    const wrapper = mountWithPlugins(App, {
      global: {
        stubs: {
          RouterView: {
            template: '<div data-testid="router-view-stub" />',
          },
        },
      },
    })
    expect(wrapper.find('.v-application').exists()).toBe(true)
    expect(wrapper.find('[data-testid="router-view-stub"]').exists()).toBe(true)
  })
})
