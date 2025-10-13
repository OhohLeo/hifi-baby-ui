/**
 * Platform detection composable
 * Detects the current platform (web, iOS, Android) and provides helper utilities
 */
import { Capacitor } from '@capacitor/core'
import { computed, type ComputedRef } from 'vue'
import type { PlatformType } from '@/types/capabilities'

export interface UsePlatformReturn {
  platform: PlatformType
  isWeb: ComputedRef<boolean>
  isIOS: ComputedRef<boolean>
  isAndroid: ComputedRef<boolean>
  isNative: ComputedRef<boolean>
  canUseNativeAPI: (pluginName: string) => boolean
}

export function usePlatform(): UsePlatformReturn {
  const platform = Capacitor.getPlatform() as PlatformType

  const isWeb = computed(() => platform === 'web')
  const isIOS = computed(() => platform === 'ios')
  const isAndroid = computed(() => platform === 'android')
  const isNative = computed(() => Capacitor.isNativePlatform())

  const canUseNativeAPI = (pluginName: string): boolean => {
    return Capacitor.isPluginAvailable(pluginName)
  }

  return {
    platform,
    isWeb,
    isIOS,
    isAndroid,
    isNative,
    canUseNativeAPI
  }
}
