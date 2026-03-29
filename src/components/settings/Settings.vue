<template>
  <v-card
    class="settings-view text-body-1"
    variant="flat"
  >
    <!-- Native div: avoids VCardText + useDisplay() racing on theme/resize (Vue patch __vnode null) -->
    <div class="settings-scroll-area pa-0">
      <div
        class="settings-layout"
        :class="{ 'settings-layout--mobile': isMobileLayout }"
      >
        <!-- Desktop sidebar -->
        <aside
          v-if="!isMobileLayout"
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
              <v-list-item-title class="text-body-1">
                {{ item.title }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </aside>

        <v-divider
          v-if="!isMobileLayout"
          vertical
          class="settings-layout__divider"
        />

        <div class="settings-main">
          <!-- Mobile section picker -->
          <div
            v-if="isMobileLayout"
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
              :menu-props="{ contentClass: 'settings-v-select-menu' }"
            >
              <!-- Vuetify 3: slot `item` is already the raw row ({ title, icon, component }), not wrapped in .raw -->
              <template #selection="{ item }">
                <v-icon
                  v-if="item"
                  :icon="item.icon"
                  class="mr-2"
                />
                <span class="text-body-1">{{ item?.title }}</span>
              </template>
              <template #item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :prepend-icon="item?.icon"
                  :title="item?.title"
                />
              </template>
            </v-select>
          </div>

          <div class="settings-panel-body text-body-1 px-4 px-sm-6 pt-2">
            <component
              :is="selectedSetting?.component"
              v-if="selectedSetting"
            />
          </div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { shallowRef, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMatchMaxWidth } from '@/composables/useMatchMaxWidth'
import Connect from '@/components/settings/Connect.vue'
import Audio from '@/components/settings/Audio.vue'
import Tags from '@/components/settings/Tags.vue'
import Interface from '@/components/settings/Interface.vue'

const { t } = useI18n()

// Same as Vuetify default `mobile` (width below lg / 1145px). Avoids useDisplay → updateSize racing Vue patch on theme toggle.
const isMobileLayout = useMatchMaxWidth(1144)

const menuItems = computed(() => [
  { title: t('settings.connect'), icon: 'mdi-wifi', component: Connect },
  { title: t('settings.audio'), icon: 'mdi-volume-high', component: Audio },
  { title: t('settings.interface'), icon: 'mdi-overscan', component: Interface },
  { title: t('settings.tags'), icon: 'mdi-tag', component: Tags }
])

const selectedSetting = shallowRef(menuItems.value[0])

watch(menuItems, (items) => {
  if (!items.length) {
    return
  }
  const stillValid = items.some((i) => i.title === selectedSetting.value?.title)
  if (!stillValid) {
    selectedSetting.value = items[0]
  }
})

function selectSetting(item) {
  selectedSetting.value = item
}
</script>

<style scoped lang="scss">
.settings-view {
  flex: 1 1 auto;
  min-height: 0;
  max-height: min(100%, var(--settings-panel-max-height));
  width: 100%;
  border-radius: var(--radius-2xl) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgb(var(--v-theme-surface));
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.settings-layout {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
}

@media (min-width: 960px) {
  .settings-layout:not(.settings-layout--mobile) {
    flex-direction: row;
    align-items: stretch;
    min-height: 0;
    flex: 1 1 auto;
  }
}

.settings-nav {
  flex: 0 0 220px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 12px 0 0;
}

.settings-nav__list {
  padding: 4px 8px 0 0;
  flex: 1 1 auto;
}

.settings-nav__item {
  margin-bottom: 2px;
  align-items: center;
  transition: color 0.15s ease;

  :deep(.v-list-item__overlay) {
    opacity: 0 !important;
  }

  :deep(.v-list-item__underlay) {
    opacity: 0 !important;
  }

  /* Vertically center icon + label (avoids icon sitting slightly high) */
  :deep(.v-list-item__prepend) {
    align-self: center;
  }

  :deep(.v-list-item__content) {
    align-self: center;
  }

  :deep(.v-list-item-title) {
    line-height: 1.5rem;
  }
}

.settings-nav__item--active {
  background: transparent !important;
  color: rgb(var(--v-theme-accent)) !important;

  :deep(.v-icon) {
    color: rgb(var(--v-theme-accent)) !important;
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
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  padding-bottom: 0;
}

@media (max-width: 959px) {
  .settings-panel-body {
    max-width: none;
  }
}

.settings-scroll-area {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Match playlist track title typography (text-body-1) for all settings panel copy */
.settings-panel-body {
  :deep(.text-subtitle-1),
  :deep(.text-subtitle-2),
  :deep(.text-body-2),
  :deep(.text-caption),
  :deep(.text-overline) {
    font-size: inherit !important;
    line-height: inherit !important;
    letter-spacing: 0.009375em !important;
  }

  :deep(.v-card-title) {
    font-size: inherit !important;
    line-height: inherit !important;
    letter-spacing: 0.009375em !important;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    font-size: inherit !important;
    line-height: inherit !important;
  }

  :deep(.v-label),
  :deep(.v-field__input),
  :deep(.v-input__details),
  :deep(.v-messages),
  :deep(.v-alert__content) {
    font-size: inherit !important;
  }

  :deep(.v-btn .v-btn__content) {
    font-size: inherit !important;
  }
}
</style>

<!-- Teleported v-select menu: scoped styles do not apply -->
<style lang="scss">
.settings-v-select-menu .v-list-item-title {
  font-size: 1rem !important;
  line-height: 1.5rem !important;
  letter-spacing: 0.009375em !important;
}
</style>
