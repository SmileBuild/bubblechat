<template>
  <aside class="h-screen w-64 bg-surface flex flex-col border-r border-gray-700">
    <SettingsModal 
      :is-open="isSettingsOpen"
      @close="isSettingsOpen = false"
      @save="handleSettingsSave"
    />
    
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
           class="group p-3 hover:bg-surface-light relative"
           :class="[session.id === activeSessionId ? 'bg-surface-light' : '']">
        <!-- Session Content -->
        <div class="flex items-center gap-2">
          <div class="flex-grow" @click="$emit('select-session', session.id)">
            <div v-if="editingSessionId === session.id" class="flex items-center gap-2" @click.stop>
              <input 
                :ref="el => { if (el) inputRefs[session.id] = el }"
                v-model="editTitles[session.id]"
                @blur="saveSessionTitle(session)"
                @keyup.enter="saveSessionTitle(session)"
                @keyup.esc="cancelEditing"
                class="bg-surface-light rounded px-2 py-1 text-sm w-full"
                :placeholder="session.title || 'New Chat'"
              />
            </div>
            <div v-else class="text-sm truncate cursor-pointer">
              {{ session.title || 'New Chat' }}
            </div>
            <div class="text-xs text-gray-400">{{ formatDate(session.timestamp) }}</div>
          </div>
        </div>
        
        <!-- Action Icons -->
        <div class="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-2" @click.stop>
          <button 
            @click.stop="startEditing(session)"
            class="text-gray-400 hover:text-white p-1"
            title="Rename"
          >
            <span class="material-icons text-sm">edit</span>
          </button>
          <button 
            @click.stop="$emit('remove-session', session.id)"
            class="text-gray-400 hover:text-red-500 p-1"
            title="Delete"
          >
            <span class="material-icons text-sm">delete</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Footer Buttons -->
    <div class="mt-auto p-4 border-t border-gray-700 flex flex-col gap-2">
      <button @click="isSettingsOpen = true" class="w-full text-gray-400 hover:text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2">
        <span class="material-icons text-xl">settings</span>
        Settings
      </button>
      <button @click="$emit('show-about')" class="w-full text-gray-400 hover:text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2">
        <span class="material-icons text-xl">info</span>
        About
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import SettingsModal from '../SettingsModal.vue';

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

const emit = defineEmits(['new-chat', 'select-session', 'show-about', 'remove-session', 'update-session', 'update-settings']);

const isSettingsOpen = ref(false);
const editingSessionId = ref(null);
const editTitles = ref({});
const inputRefs = ref({});

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString();
};

const handleSettingsSave = (settings) => {
  emit('update-settings', settings);
};

const startEditing = (session) => {
  editingSessionId.value = session.id;
  editTitles.value[session.id] = session.title || '';
  // Focus the input after the next DOM update
  setTimeout(() => {
    inputRefs.value[session.id]?.focus();
  });
};

const saveSessionTitle = (session) => {
  const newTitle = editTitles.value[session.id]?.trim();
  if (newTitle) {
    emit('update-session', {
      id: session.id,
      title: newTitle
    });
  }
  cancelEditing();
};

const cancelEditing = () => {
  editingSessionId.value = null;
  editTitles.value = {};
};
</script>
