/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify, ThemeDefinition } from 'vuetify'

// Premium HiFi Light Theme
const hifiLight: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#F5F5F7',
    surface: '#FFFFFF',
    primary: '#1D1D1F',
    secondary: '#86868B',
    accent: '#0071E3',
    error: '#FF3B30',
    info: '#007AFF',
    success: '#34C759',
    warning: '#FF9500',
    'on-background': '#1D1D1F',
    'on-surface': '#1D1D1F',
    'surface-variant': '#F5F5F7',
    'surface-bright': '#FFFFFF',
  },
}

// Premium HiFi Dark Theme
const hifiDark: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#000000',
    surface: '#1C1C1E',
    primary: '#F5F5F7',
    secondary: '#98989D',
    accent: '#0A84FF',
    error: '#FF453A',
    info: '#0A84FF',
    success: '#32D74B',
    warning: '#FF9F0A',
    'on-background': '#F5F5F7',
    'on-surface': '#F5F5F7',
    'surface-variant': '#2C2C2E',
    'surface-bright': '#3A3A3C',
  },
}

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'hifiDark',
    themes: {
      hifiLight,
      hifiDark,
    },
    variations: {
      colors: ['primary', 'secondary', 'accent'],
      lighten: 2,
      darken: 2,
    },
  },
  defaults: {
    VBtn: {
      style: 'text-transform: none; letter-spacing: 0;',
      elevation: 0,
    },
    VCard: {
      elevation: 0,
    },
  },
})
