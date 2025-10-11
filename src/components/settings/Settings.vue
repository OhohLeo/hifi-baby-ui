<template>
  <v-dialog
    v-model="settingsModal.isOpen.value"
    max-width="1200"
    persistent
    transition="dialog-bottom-transition"
  >
    <v-card class="settings-modal">
      <v-card-title class="text-h5 pa-6 d-flex align-center">
        <v-icon
          class="mr-3"
          size="large"
        >
          mdi-cog
        </v-icon>
        {{ $t('settings.title') }}
      </v-card-title>

      <v-divider />

      <v-card-text
        class="pa-0"
        style="min-height: 500px;"
      >
        <v-container fluid>
          <v-row>
            <v-col
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

            <v-divider vertical />

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

      <v-divider />

      <v-card-actions class="pa-4">
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
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { shallowRef, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsModal } from '@/composables/useSettingsModal'
import Network from '@/components/settings/Network.vue'
import Audio from '@/components/settings/Audio.vue'
import Bluetooth from '@/components/settings/Bluetooth.vue'
import Tags from '@/components/settings/Tags.vue'
import Interface from '@/components/settings/Interface.vue'

const { t } = useI18n()
const settingsModal = useSettingsModal()

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
  settingsModal.closeModal()
}

// Handle validate - save and close modal
function handleValidate() {
  // TODO: Implement save logic for each setting component
  settingsModal.closeModal()
}
</script>

<style scoped lang="scss">
.settings-modal {
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
