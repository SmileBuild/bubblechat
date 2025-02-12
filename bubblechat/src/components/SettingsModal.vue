<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-surface dark:bg-surface-dark rounded-lg p-6 w-[800px] max-w-full max-h-[90vh] flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">{{ t('settings.commonSettings') }}</h2>
        <button @click="close" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
          <span class="material-icons">close</span>
        </button>
      </div>

      <!-- Settings Form -->
      <div class="space-y-6">
        
        <!-- Language Selection -->
        <div class="space-y-1 mb-4">
          <label class="block text-sm font-medium">{{ t('settings.language') }}</label>
          <select
            v-model="settings.language"
            class="w-full bg-surface-light dark:bg-surface-light-dark rounded px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:border-primary focus:outline-none"
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </div>

        <!-- Theme Selection -->
        <div class="space-y-1">
          <label class="block text-sm font-medium">{{ t('settings.theme') }}</label>
          <select
            v-model="settings.theme"
            class="w-full bg-surface-light dark:bg-surface-light-dark rounded px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:border-primary focus:outline-none"
          >
            <option value="light">{{ t('settings.light') }}</option>
            <option value="dark">{{ t('settings.dark') }}</option>
          </select>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button 
          type="button"
          @click="close"
          class="px-4 py-2 text-sm rounded text-gray-800 dark:text-gray-200 hover:bg-surface-light dark:hover:bg-surface-light-dark"
        >
          {{ t('common.cancel') }}
        </button>
        <button 
          @click="save"
          class="px-4 py-2 text-sm bg-primary hover:bg-primary/90 rounded"
        >
          {{ t('common.save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useTranslations } from '../i18n/translations';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    required: true
  }
});

// Translation helper
const t = computed(() => useTranslations(props.language));

const emit = defineEmits(['close', 'save']);

const settings = ref({
  language: localStorage.getItem('app-language') || 'en',
  theme: localStorage.getItem('app-theme') || 'dark'
});

const save = () => {
  // Wrap settings in the expected structure
  emit('save', {
    commonSettings: settings.value
  });
  
  // Update localStorage
  localStorage.setItem('app-language', settings.value.language);
  localStorage.setItem('app-theme', settings.value.theme);
  
  close();
};

// Initialize settings on mount
onMounted(() => {
  settings.value = {
    language: localStorage.getItem('app-language') || 'en',
    theme: localStorage.getItem('app-theme') || 'dark'
  };
});

const close = () => {
  emit('close');
};
</script>
