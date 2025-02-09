<template>
  <div :class="{'dark': isDarkTheme}">
    <div class="min-h-screen bg-white dark:bg-surface text-gray-900 dark:text-white">
      <SessionManager 
        @show-about="showAbout = true"
        :language="language"
      />
      
      <!-- About Modal -->
      <div v-if="showAbout" class="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div class="bg-surface p-6 rounded-lg max-w-md">
          <h2 class="text-xl font-bold mb-4">About BubbleChat</h2>
          <p class="text-gray-300 mb-4">
            A ChatGPT-like chat interface built with Vue 3 and TailwindCSS.
          </p>
          <button 
            @click="showAbout = false"
            class="bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, provide } from 'vue';
import SessionManager from './components/SessionManager.vue';

const showAbout = ref(false);
const language = ref(localStorage.getItem('app-language') || 'en');
const isDarkTheme = ref(localStorage.getItem('app-theme') !== 'light');

// Watch for settings changes
watch([language, isDarkTheme], ([newLang, newIsDark]) => {
  localStorage.setItem('app-language', newLang);
  localStorage.setItem('app-theme', newIsDark ? 'dark' : 'light');
});

// Handle settings updates from SettingsModal
const handleSettingsUpdate = (settings) => {
  if (settings.commonSettings) {
    language.value = settings.commonSettings.language;
    isDarkTheme.value = settings.commonSettings.theme === 'dark';
  }
};

// Provide settings update handler to SessionManager
provide('onSettingsUpdate', handleSettingsUpdate);

// Initialize theme
onMounted(() => {
  // Apply initial theme
  document.documentElement.classList.toggle('dark', isDarkTheme.value);
});
</script>
