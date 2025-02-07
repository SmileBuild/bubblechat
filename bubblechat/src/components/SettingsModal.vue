<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-surface rounded-lg p-6 w-96 max-w-full">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Settings</h2>
        <button @click="close" class="text-gray-400 hover:text-white">
          <span class="material-icons">close</span>
        </button>
      </div>

      <form @submit.prevent="saveSettings">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">OpenAI API Key</label>
            <input 
              type="password"
              v-model="settings.openaiKey"
              class="w-full bg-surface-light rounded px-3 py-2 text-sm border border-gray-700 focus:border-primary focus:outline-none"
              placeholder="Enter OpenAI API key"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">DeepSeek API Key</label>
            <input 
              type="password"
              v-model="settings.deepseekKey"
              class="w-full bg-surface-light rounded px-3 py-2 text-sm border border-gray-700 focus:border-primary focus:outline-none"
              placeholder="Enter DeepSeek API key"
            />
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button 
            type="button"
            @click="close"
            class="px-4 py-2 text-sm rounded hover:bg-surface-light"
          >
            Cancel
          </button>
          <button 
            type="submit"
            class="px-4 py-2 text-sm bg-primary hover:bg-primary/90 rounded"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'save']);

const settings = ref({
  openaiKey: '',
  deepseekKey: ''
});

onMounted(() => {
  // Load saved settings from localStorage
  const savedSettings = localStorage.getItem('api-settings');
  if (savedSettings) {
    settings.value = JSON.parse(savedSettings);
  }
});

const saveSettings = () => {
  // Save to localStorage
  localStorage.setItem('api-settings', JSON.stringify(settings.value));
  emit('save', settings.value);
  close();
};

const close = () => {
  emit('close');
};
</script>
