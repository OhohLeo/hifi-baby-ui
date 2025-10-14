<template>
  <v-card class="settings-view">
    <v-card-title class="text-h5 pa-4 d-flex align-center">
      <v-icon
        class="mr-3"
        size="large"
      >
        mdi-cog
      </v-icon>
      {{ $t('settings.title') }}
      <v-spacer />
      <v-btn
        variant="text"
        @click="handleCancel"
      >
        {{ $t('settings.cancel') }}
      </v-btn>
      <v-btn
        color="accent"
        variant="flat"
        @click="handleValidate"
      >
        {{ $t('settings.validate') }}
      </v-btn>
    </v-card-title>

    <v-divider />

    <v-card-text
      class="pa-0"
      :style="{ 'min-height': isMobile ? 'calc(100vh - 128px)' : '500px' }"
    >
      <v-container fluid>
        <v-row>
          <!-- Desktop Menu -->
          <v-col
            v-if="!isMobile"
            cols="12"
            md="3"
          >
            <v-list density="compact">
              <v-list-item
                v-for="item in menuItems"
                :key="item.title"
                :active="selectedSetting?.title === item.title"
                class="cursor-pointer"
                @click="selectSetting(item)"
              >
                <template #prepend>
                  <v-icon>{{ item.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-col>

          <v-divider
            v-if="!isMobile"
            vertical
          />

          <!-- Mobile Menu -->
          <v-col
            v-if="isMobile"
            cols="12"
            class="pb-0"
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
          </v-col>

          <v-col
            cols="12"
            md="9"
          >
            <component
              :is="selectedSetting?.component"
              v-if="selectedSetting"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { shallowRef, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { useSettingsView } from '@/composables/useSettingsView'
import Network from '@/components/settings/Network.vue'
import Audio from '@/components/settings/Audio.vue'
import Bluetooth from '@/components/settings/Bluetooth.vue'
import Tags from '@/components/settings/Tags.vue'
import Interface from '@/components/settings/Interface.vue'

const { t } = useI18n()
const settingsView = useSettingsView()
const { mobile } = useDisplay()

const isMobile = computed(() => mobile.value)

const menuItems = computed(() => [
  { title: t('settings.network'), icon: 'mdi-wifi', component: Network },
  { title: t('settings.audio'), icon: 'mdi-volume-high', component: Audio },
  { title: t('settings.bluetooth'), icon: 'mdi-bluetooth', component: Bluetooth },
  { title: t('settings.interface'), icon: 'mdi-overscan', component: Interface },
  { title: t('settings.tags'), icon: 'mdi-tag', component: Tags }
])

// Set Network as default
const selectedSetting = shallowRef(menuItems.value[0])

// Function to select a setting
function selectSetting(item) {
  selectedSetting.value = item
}

// Handle cancel - close modal without saving
function handleCancel() {
  settingsView.closeSettings()
}

// Handle validate - save and close modal
function handleValidate() {
  // TODO: Implement save logic for each setting component
  settingsView.closeSettings()
}
</script>

<style scoped lang="scss">
.settings-view {
  border-radius: var(--radius-2xl) !important;
}

.cursor-pointer {
  cursor: pointer;
}

// Ensure proper scrolling for modal content
:deep(.v-card-text) {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
