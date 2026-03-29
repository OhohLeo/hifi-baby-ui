import type { Component } from 'vue'
import { mount, type MountingOptions } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import vuetify from '@/plugins/vuetify'
import { testI18n } from './test-i18n'

type MountWithPluginsOptions = Omit<MountingOptions<Component>, 'global'> & {
  global?: MountingOptions<Component>['global']
}

/**
 * Mount a component with the same stack used in production (Pinia, Vuetify,
 * router, i18n). Pass extra `global.plugins` or `global.stubs` as needed.
 */
export function mountWithPlugins(
  component: Component,
  options: MountWithPluginsOptions = {},
) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', name: 'home', component: { template: '<div />' } }],
  })

  const pinia = createPinia()
  const userGlobal = options.global ?? {}
  const basePlugins = [pinia, vuetify, router, testI18n]
  const extra = userGlobal.plugins
  const plugins = [
    ...basePlugins,
    ...(Array.isArray(extra) ? extra : extra != null ? [extra] : []),
  ]

  return mount(component, {
    ...options,
    global: {
      ...userGlobal,
      plugins,
    },
  })
}
