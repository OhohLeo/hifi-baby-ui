<template>
  <div class="connect-connection-status">
    <div class="connect-status-grid">
      <span class="connect-status-label">{{ $t('settings.connectPanel.statusLabel') }}:</span>
      <v-chip
        :color="connectionStatusColor"
        size="x-small"
        variant="flat"
        :class="['connect-status-chip', 'connect-status-chip--paired', connectionStatusChipTone]"
      >
        {{ connectionStatusLabel }}
      </v-chip>

      <template v-if="isConnected">
        <span class="connect-status-label">{{ $t('settings.connectPanel.typeLabel') }}:</span>
        <v-chip
          :color="activeTransport === 'bluetooth' ? 'success' : 'info'"
          size="x-small"
          variant="flat"
          :class="['connect-status-chip', 'connect-status-chip--paired', transportChipTone]"
        >
          <v-icon
            start
            size="14"
          >
            {{ activeTransport === 'bluetooth' ? 'mdi-bluetooth' : 'mdi-wifi' }}
          </v-icon>
          {{ transportDisplayName }}
        </v-chip>
      </template>

      <template v-if="connectionInfo.name">
        <span class="connect-status-label">{{ $t('settings.connectPanel.deviceLabel') }}:</span>
        <span class="connect-status-value connect-status-value--primary">{{ connectionInfo.name }}</span>
      </template>
      <template v-if="connectionInfo.address">
        <span class="connect-status-label">{{ $t('settings.connectPanel.addressLabel') }}:</span>
        <span
          class="connect-status-value connect-status-value--address"
          :class="{ 'connect-status-value--connected': isConnected }"
        >{{ connectionInfo.address }}</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConnection } from '@/composables/useConnection'

const { t } = useI18n()
const {
  isConnected,
  activeTransport,
  connectionInfo,
} = useConnection()

const connectionStatusLabel = computed(() =>
  t(`settings.connectPanel.status.${connectionInfo.value.status}`)
)

const connectionStatusChipTone = computed(() => {
  const s = connectionInfo.value.status
  if (s === 'connected') {
    return 'connect-status-chip--on-success'
  }
  if (s === 'disconnected' || s === 'error') {
    return 'connect-status-chip--on-error'
  }
  return 'connect-status-chip--on-warning'
})

const transportChipTone = computed(() =>
  activeTransport.value === 'bluetooth'
    ? 'connect-status-chip--on-success'
    : 'connect-status-chip--on-info'
)

const transportDisplayName = computed(() => {
  if (!activeTransport.value) {
    return ''
  }
  return t(`settings.connectPanel.transportNames.${activeTransport.value}`)
})

const connectionStatusColor = computed(() => {
  switch (connectionInfo.value.status) {
    case 'connected':
      return 'success'
    case 'connecting':
    case 'reconnecting':
      return 'warning'
    case 'error':
    case 'disconnected':
    default:
      return 'error'
  }
})
</script>

<style scoped lang="scss">
.connect-status-grid {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  align-items: center;
  column-gap: 0.75rem;
  row-gap: 0.5rem;
}

.connect-status-label {
  white-space: nowrap;
  color: rgba(var(--v-theme-on-surface), 0.45);
  font-weight: 500;
  font-size: inherit;
}

.connect-status-value {
  min-width: 0;
  word-break: break-word;
}

.connect-status-value--primary {
  color: rgba(var(--v-theme-on-surface), 0.92);
}

.connect-status-value--address {
  color: rgba(var(--v-theme-on-surface), 0.92);
}

.connect-status-value--address.connect-status-value--connected {
  color: rgb(var(--v-theme-success));
}

.connect-status-chip {
  font-weight: 600;
}

.connect-status-chip--paired {
  display: inline-flex;
  justify-content: center;
  justify-self: start;
  min-width: 6.75rem;
  max-width: 100%;
  box-sizing: border-box;
  font-weight: 600;
}

.connect-status-chip--on-error {
  color: rgb(var(--v-theme-on-error)) !important;
}

.connect-status-chip--on-success {
  color: rgb(var(--v-theme-on-success)) !important;
}

.connect-status-chip--on-warning {
  color: rgb(var(--v-theme-on-warning)) !important;
}

.connect-status-chip--on-info {
  color: rgb(var(--v-theme-on-info)) !important;
}
</style>
