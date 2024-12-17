export function useSettingsProps() {
  return {
    settings: {
      type: Object,
      required: true
    },
    settingsOk: {
      type: Boolean,
      required: true
    }
  }
}

