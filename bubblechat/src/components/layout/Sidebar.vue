<template>
  <aside class="h-screen w-64 bg-surface flex flex-col border-r border-gray-700">
    <!-- New Chat Button -->
    <div class="p-4">
      <button @click="$emit('new-chat')" class="w-full bg-primary hover:bg-primary/90 text-white rounded-lg py-2 px-4 flex items-center justify-center gap-2">
        <span class="material-icons text-xl">add</span>
        New Chat
      </button>
    </div>

    <!-- Chat Sessions List -->
    <div class="flex-grow overflow-y-auto">
      <div v-for="session in sessions" :key="session.id" 
           @click="$emit('select-session', session.id)"
           :class="['p-3 cursor-pointer hover:bg-surface-light', 
                    session.id === activeSessionId ? 'bg-surface-light' : '']">
        <div class="text-sm truncate">{{ session.title || 'New Chat' }}</div>
        <div class="text-xs text-gray-400">{{ formatDate(session.timestamp) }}</div>
      </div>
    </div>

    <!-- About Button -->
    <div class="p-4 border-t border-gray-700">
      <button @click="$emit('show-about')" class="w-full text-gray-400 hover:text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2">
        <span class="material-icons text-xl">info</span>
        About
      </button>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  sessions: {
    type: Array,
    default: () => []
  },
  activeSessionId: {
    type: String,
    default: null
  }
});

defineEmits(['new-chat', 'select-session', 'show-about']);

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString();
};
</script>
