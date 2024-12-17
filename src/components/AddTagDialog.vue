<template>
  <v-dialog v-model="dialog" max-width="500" @update:model-value="close">
    <v-card>
      <v-card-item>
        <v-card-title>Add Tag</v-card-title>
        <v-spacer></v-spacer>
        <v-card-text>
          <v-text-field label="Label" variant="outlined"></v-text-field>
        </v-card-text>
      </v-card-item>
      <v-alert v-if="message" type="error">
        {{ message }}
      </v-alert>
      <v-card-actions>
        <v-btn class="mt-3" color="primary" variant="text" @click="submit">
          Submit
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const dialog = ref(false)
const message = ref('')
const props = defineProps({
  isOpen: Boolean,
})
const emit = defineEmits(['update:isOpen'])

watch(
  () => props.isOpen,
  (newValue) => {
    dialog.value = newValue
    message.value = ''
  }
)

const selectedFile = ref(null)
const submit = async () => {
  if (!selectedFile.value) {
    message.value = 'Select an audio file.'
    return
  }

  try {
    // const response = await audioService.addTag(selectedFile.value)
    // if (response.status == 201) {
    //   tagStore.fetchTags()
    //   close()
    // } else {
    //   console.error(response)
    //   message.value = 'Issue when downloading audio file'
    // }
  } catch (error) {
    console.error(error)
    message.value = 'Issue when sending audio file.'
  }
}
const close = () => {
  dialog.value = false
  message.value = ''
  emit('update:isOpen', false)
}
</script>
