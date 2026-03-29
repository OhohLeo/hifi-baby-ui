<template>
  <v-card
    class="settings-view"
    variant="flat"
  >
    <v-card-text
      class="pa-0 settings-scroll-area"
      :style="settingsScrollMinHeight"
    >
      <div
        class="settings-layout"
        :class="{ 'settings-layout--mobile': isMobile }"
      >
        <!-- Desktop sidebar -->
        <aside
          v-if="!isMobile"
          class="settings-nav"
        >
          <v-list
            density="comfortable"
            class="settings-nav__list"
            nav
          >
            <v-list-item
              v-for="item in menuItems"
              :key="item.title"
              :class="{ 'settings-nav__item--active': selectedSetting?.title === item.title }"
              class="settings-nav__item"
              rounded="0"
              variant="text"
              @click="selectSetting(item)"
            >
              <template #prepend>
                <v-icon>{{ item.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </aside>

        <v-divider
          v-if="!isMobile"
          vertical
          class="settings-layout__divider"
        />

        <div class="settings-main">
          <!-- Mobile section picker -->
          <div
            v-if="isMobile"
            class="settings-main__picker px-4 pt-4 pb-2"
          >
            <v-select
              v-model="selectedSetting"
              :items="menuItems"
              item-title="title"
              item-value="component"
              return-object
              variant="outlined"
              density="comfortable"
              hide-details
            >
              <template #selection="{ item }">
                <v-icon
                  :icon="item.raw.icon"
                  class="mr-2"
                />
                <span>{{ item.raw.title }}</span>
              </template>
              <template #item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :prepend-icon="item.raw.icon"
                  :title="item.raw.title"
                />
              </template>
            </v-select>
          </div>

          <div class="settings-panel-body px-4 px-sm-6 pt-2">
            <component
              :is="selectedSetting?.component"
              v-if="selectedSetting"
            />
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { shallowRef, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import Connect from '@/components/settings/Connect.vue'
import Audio from '@/components/settings/Audio.vue'
import Tags from '@/components/settings/Tags.vue'
import Interface from '@/components/settings/Interface.vue'

const { t } = useI18n()
const { mobile } = useDisplay()

const isMobile = computed(() => mobile.value)

/** Mobile: fill viewport for scroll; desktop: hug content so the layout can vertically center the panel */
const settingsScrollMinHeight = computed(() =>
  isMobile.value ? { minHeight: 'calc(100vh - 128px)' } : {}
)

const menuItems = computed(() => [
  { title: t('settings.connect'), icon: 'mdi-wifi', component: Connect },
  { title: t('settings.audio'), icon: 'mdi-volume-high', component: Audio },
  { title: t('settings.interface'), icon: 'mdi-overscan', component: Interface },
  { title: t('settings.tags'), icon: 'mdi-tag', component: Tags }
])

const selectedSetting = shallowRef(menuItems.value[0])

function selectSetting(item) {
  selectedSetting.value = item
}
</script>

<style scoped lang="scss">
.settings-view {
  flex: 0 0 auto;
  width: 100%;
  border-radius: var(--radius-2xl) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgb(var(--v-theme-surface));
  overflow: hidden;
}

.settings-layout {
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
}

@media (min-width: 960px) {
  .settings-layout:not(.settings-layout--mobile) {
    flex-direction: row;
    align-items: stretch;
    min-height: 360px;
  }
}

.settings-nav {
  flex: 0 0 220px;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 12px 0 0;
}

.settings-nav__list {
  padding: 4px 8px 0 0;
  flex: 1 1 auto;
}

.settings-nav__item {
  margin-bottom: 2px;
  border-left: 3px solid transparent;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;

  :deep(.v-list-item__overlay) {
    opacity: 0 !important;
  }

  :deep(.v-list-item__underlay) {
    opacity: 0 !important;
  }
}

.settings-nav__item--active {
  border-left-color: rgb(var(--v-theme-primary));
  background: transparent !important;
  color: rgb(var(--v-theme-primary)) !important;

  :deep(.v-icon) {
    color: rgb(var(--v-theme-primary)) !important;
  }
}

.settings-layout__divider {
  flex-shrink: 0;
  align-self: stretch;
  margin: 0 !important;
  border-color: rgba(var(--v-theme-on-surface), 0.12) !important;
}

.settings-main {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

@media (min-width: 960px) {
  .settings-main {
    padding: 12px 20px 0 8px;
  }
}

.settings-panel-body {
  width: 100%;
  max-width: 520px;
  margin-inline: 0;
  padding-bottom: clamp(48px, 12vh, 100px);
}

@media (max-width: 959px) {
  .settings-panel-body {
    max-width: none;
  }
}

:deep(.v-card-text) {
  max-height: min(85vh, 100%);
  overflow-y: auto;
}
</style>
