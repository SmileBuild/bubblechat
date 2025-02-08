<template>
  <div class="flex min-h-screen bg-background">
    <Sidebar 
      :sessions="sessions"
      :activeSessionId="activeSessionId"
      @new-chat="createNewChat"
      @select-session="selectSession"
      @show-about="$emit('show-about')"
      @update-session="updateSession"
      @update-settings="handleSettingsSave"
      @update-api="handleAPIChange"
    />
    <ChatContainer 
      :messages="currentMessages"
      :isLoading="isLoading"
      :provider="currentAPI.provider"
      :model="currentAPI.model"
      :settings="apiSettings"
      @send-message="handleSendMessage"
      @error="handleError"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import Sidebar from './layout/Sidebar.vue';
import ChatContainer from './layout/ChatContainer.vue';

// Settings helper
const getAPISettings = (providerId) => {
  try {
    const settings = localStorage.getItem('api-settings');
    if (!settings) return null;
    return JSON.parse(settings)?.[providerId];
  } catch (error) {
    console.error('Error loading API settings:', error);
    return null;
  }
};

// API State
const currentAPI = ref({
  provider: 'deepseek',
  model: 'deepseek-chat'
});

// Load saved API selection
onMounted(() => {
  const savedAPI = localStorage.getItem('current-api');
  if (savedAPI) {
    currentAPI.value = JSON.parse(savedAPI);
  }
});

// Get API settings for current provider
const apiSettings = computed(() => {
  return getAPISettings(currentAPI.value.provider);
});

// State
const STORAGE_KEY = 'bubblechat-sessions';
const sessions = ref([]);
const activeSessionId = ref('1');
const isLoading = ref(false);

const emit = defineEmits(['show-about', 'error']);

// Storage methods
const loadSessions = () => {
  try {
    const savedSessions = localStorage.getItem(STORAGE_KEY);
    return savedSessions ? JSON.parse(savedSessions) : [];
  } catch (error) {
    console.error('Error loading sessions:', error);
    return [];
  }
};

const saveSessions = (newSessions) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
  } catch (error) {
    console.error('Error saving sessions:', error);
  }
};

const updateStorageSession = (currentSessions, sessionId, updates) => {
  try {
    const sessionIndex = currentSessions.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) return null;

    const updatedSessions = [...currentSessions];
    updatedSessions[sessionIndex] = {
      ...updatedSessions[sessionIndex],
      ...updates
    };

    saveSessions(updatedSessions);
    return updatedSessions;
  } catch (error) {
    console.error('Error updating session:', error);
    return null;
  }
};

const deleteStorageSession = (currentSessions, sessionId) => {
  try {
    const updatedSessions = currentSessions.filter(session => session.id !== sessionId);
    saveSessions(updatedSessions);
    return updatedSessions;
  } catch (error) {
    console.error('Error deleting session:', error);
    return currentSessions;
  }
};

// Computed
const currentMessages = computed(() => {
  const session = sessions.value.find(s => s.id === activeSessionId.value);
  return session ? session.messages : [];
});

// Load sessions on mount
onMounted(() => {
  const savedSessions = loadSessions();
  if (savedSessions.length > 0) {
    sessions.value = savedSessions;
    activeSessionId.value = savedSessions[0].id;
  } else {
    createNewChat();
  }
});

// Watch for sessions changes
watch(sessions, (newSessions) => {
  saveSessions(newSessions);
}, { deep: true });

// Methods
const createNewChat = () => {
  const newSession = {
    id: Date.now().toString(),
    title: 'New Chat',
    timestamp: new Date(),
    messages: []
  };
  sessions.value.unshift(newSession);
  activeSessionId.value = newSession.id;
};

const updateSession = (update) => {
  const updatedSessions = updateStorageSession(sessions.value, update.id, {
    title: update.title,
    timestamp: new Date()
  });
  if (updatedSessions) {
    sessions.value = updatedSessions;
  }
};

const removeSession = (sessionId) => {
  sessions.value = deleteStorageSession(sessions.value, sessionId);
  if (activeSessionId.value === sessionId) {
    activeSessionId.value = sessions.value[0]?.id;
  }
};

const selectSession = (id) => {
  activeSessionId.value = id;
};

const handleAPIChange = (selection) => {
  currentAPI.value = selection;
  localStorage.setItem('current-api', JSON.stringify(selection));
};

const handleSettingsSave = (settings) => {
  // Settings are already saved to localStorage by SettingsModal
};

const addMessage = (sessionId, message) => {
  const sessionIndex = sessions.value.findIndex(s => s.id === sessionId);
  if (sessionIndex === -1) return;

  const newMessage = {
    id: Date.now().toString(),
    ...message,
    timestamp: new Date()
  };

  sessions.value[sessionIndex].messages.push(newMessage);

  // Update session title if it's the first message
  if (sessions.value[sessionIndex].messages.length === 1 && message.sender === 'user') {
    const newTitle = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
    sessions.value = updateStorageSession(sessions.value, sessionId, {
      title: newTitle,
      timestamp: new Date()
    });
  }
};

const handleSendMessage = (message, response) => {
  if (!activeSessionId.value) return;

  if (!response) {
    // Initial user message
    addMessage(activeSessionId.value, {
      content: message,
      sender: 'user'
    });
    isLoading.value = true;
  } else {
    // API response
    addMessage(activeSessionId.value, response);
    isLoading.value = false;
  }
};

const handleError = (errorMessage) => {
  isLoading.value = false;
  addMessage(activeSessionId.value, {
    content: `Error: ${errorMessage}`,
    sender: 'error'
  });
};
</script>
