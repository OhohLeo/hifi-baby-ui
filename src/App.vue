<template>
  <v-app>
    <v-main class="app-main-shell">
      <router-view v-slot="{ Component, route }">
        <transition
          :name="(route.meta.transition as string) || 'fade'"
          mode="out-in"
        >
          <div
            :key="route.path"
            class="route-view-flex"
          >
            <component :is="Component" />
          </div>
        </transition>
      </router-view>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { watch, onMounted, onUnmounted } from 'vue'
import { usePlaylistSearch } from '@/composables/usePlaylistSearch'
// Import global styles
import './styles/settings.scss'

const { searchVisible } = usePlaylistSearch()

/** Extra v-main padding when the search line is open below the app bar. */
function syncSearchRibbonLayout(visible: boolean) {
  if (typeof document === 'undefined') {
    return
  }
  document.documentElement.classList.toggle('search-ribbon-open', visible)
  document.documentElement.style.setProperty(
    '--search-ribbon-offset',
    visible ? 'var(--search-ribbon-height, 62px)' : '0px'
  )
}

onMounted(() => {
  syncSearchRibbonLayout(searchVisible.value)
})
watch(searchVisible, syncSearchRibbonLayout)
onUnmounted(() => {
  syncSearchRibbonLayout(false)
})
</script>

<style lang="scss">
// Fill the shell under the fixed app bar so nested layouts can use column flex + scroll
// (avoids relying on position:fixed for the mini-player, which breaks when an ancestor
// creates a new containing block — common on tablets/mobile with transforms / compositing).
.app-main-shell {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1 1 auto;
}

.route-view-flex {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

// Page transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all var(--transition-base);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
