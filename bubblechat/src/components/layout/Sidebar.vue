<template>
  <aside class="h-screen w-64 flex flex-col border-r bg-surface dark:bg-surface-dark border-gray-200 dark:border-gray-700">
    <SettingsModal 
      :is-open="isSettingsOpen"
      :language="language"
      @close="isSettingsOpen = false"
      @save="handleSettingsSave"
    />
    
    <APISelector
      :is-open="isAPISelectorOpen"
      :current-provider="currentAPI.provider"
      :current-model="currentAPI.model"
      @close="isAPISelectorOpen = false"
      @save="handleAPIUpdate"
    />
    
    <!-- New Chat Button -->
    <div class="p-4">
      <button @click="$emit('new-chat')" class="w-full bg-primary hover:bg-primary/90 text-white rounded-lg py-2 px-4 flex items-center justify-center gap-2 shadow-sm">
        <span class="material-icons text-xl">add</span>
        {{ t('common.newChat') }}
      </button>
    </div>

    <!-- Chat Sessions List -->
    <div class="flex-grow overflow-y-auto">
      <div v-for="session in sessions" :key="session.id" 
           class="group p-3 hover:bg-surface-light dark:hover:bg-surface-light-dark relative"
           :class="[session.id === activeSessionId ? 'bg-surface-light dark:bg-surface-light-dark' : '']">
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
                class="bg-surface-light dark:bg-surface-light-dark rounded px-2 py-1 text-sm w-full text-gray-800 dark:text-gray-100"
                :placeholder="t('common.newChat')"
              />
            </div>
            <div v-else class="text-sm truncate cursor-pointer text-gray-800 dark:text-gray-100">
              {{ session.title || t('common.newChat') }}
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">{{ formatDate(session.timestamp) }}</div>
          </div>
        </div>
        
        <!-- Action Icons -->
        <div class="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-2" @click.stop>
          <button 
            @click.stop="startEditing(session)"
            class="text-secondary hover:text-gray-900 dark:text-secondary-dark dark:hover:text-white p-1"
            :title="t('common.rename')"
          >
            <span class="material-icons text-sm">edit</span>
          </button>
          <button 
            @click.stop="$emit('remove-session', session.id)"
            class="text-secondary dark:text-secondary-dark hover:text-red-500 p-1"
            :title="t('common.delete')"
          >
            <span class="material-icons text-sm">delete</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Footer Buttons -->
    <div class="mt-auto p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-2">
      <!-- API Selection Button -->
      <button @click="isAPISelectorOpen = true" class="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-2 px-4 rounded-lg flex items-center">
        <span class="material-icons text-xl mr-2">api</span>
        <span>{{ t('common.api') }}</span>
        <span class="ml-auto text-sm opacity-75">{{ currentAPIDisplay }}</span>
      </button>
      
      <button @click="isSettingsOpen = true" class="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-2 px-4 rounded-lg flex items-center">
        <span class="material-icons text-xl mr-2">settings</span>
        {{ t('common.settings') }}
      </button>
      <button @click="$emit('show-about')" class="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-2 px-4 rounded-lg flex items-center">
        <span class="material-icons text-xl mr-2">info</span>
        {{ t('common.about') }}
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useTranslations } from '../../i18n/translations';
import SettingsModal from '../SettingsModal.vue';
import APISelector from '../APISelector.vue';

const props = defineProps({
  sessions: {
    type: Array,
    default: () => []
  },
  activeSessionId: {
    type: String,
    default: null
  },
  language: {
    type: String,
    required: true
  }
});

// Translation helper
const t = computed(() => useTranslations(props.language));

// Format date helper
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat(props.language, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
};

const emit = defineEmits(['new-chat', 'select-session', 'show-about', 'remove-session', 'update-session', 'update-settings', 'update-api']);

const isSettingsOpen = ref(false);
const isAPISelectorOpen = ref(false);
const editingSessionId = ref(null);
const editTitles = ref({});
const inputRefs = ref({});

// API state management
const currentAPI = ref({
  provider: localStorage.getItem('current-api') 
    ? JSON.parse(localStorage.getItem('current-api')).provider
    : 'deepseek',
  model: localStorage.getItem('current-api')
    ? JSON.parse(localStorage.getItem('current-api')).model
    : 'deepseek-chat'
});

const currentAPIDisplay = computed(() => {
  const provider = currentAPI.value.provider === 'deepseek' ? 'DeepSeek' : 'Siliconflow';
  let model = currentAPI.value.model;
  if (model.includes('/')) {
    model = model.split('/')[1]; // For Siliconflow models
  }
  return `${provider} - ${model}`;
});

const handleAPIUpdate = ({ selection, settings }) => {
  currentAPI.value = selection;
  localStorage.setItem('current-api', JSON.stringify(selection));
  emit('update-api', selection);
  emit('update-settings', { apiSettings: settings });
};

const handleSettingsSave = ({ commonSettings }) => {
  emit('update-settings', { commonSettings });
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
  if (!newTitle) {
    cancelEditing();
    return;
  }

  if (newTitle !== session.title) {
    emit('update-session', {
      id: session.id,
      title: newTitle
    });
  }
  
  // Clear editing state after successful update
  editingSessionId.value = null;
  editTitles.value = {};
};

const cancelEditing = () => {
  editingSessionId.value = null;
  editTitles.value = {};
};

// Watch sessions prop for changes to refresh UI
watch(() => props.sessions, (newSessions) => {
  // If currently editing and the session was updated, clear editing state
  if (editingSessionId.value) {
    const editingSession = newSessions.find(s => s.id === editingSessionId.value);
    if (editingSession && editingSession.title !== editTitles.value[editingSessionId.value]) {
      cancelEditing();
    }
  }
}, { deep: true });
</script>
