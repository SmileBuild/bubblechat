<template>
  <SessionManager @show-about="showAbout = true" />
  
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
</template>

<script setup>
import { ref } from 'vue';
import SessionManager from './components/SessionManager.vue';

const showAbout = ref(false);
</script>
