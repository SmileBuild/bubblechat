<template>
  <div class="flex min-h-screen bg-background">
    <Sidebar 
      :sessions="sessions"
      :activeSessionId="activeSessionId"
      :language="language"
      @new-chat="createNewChat"
      @select-session="selectSession"
      @show-about="$emit('show-about')"
      @update-session="updateSession"
      @update-settings="handleSettingsSave"
      @update-api="handleAPIChange"
      @remove-session="removeSession"
    />
    <ChatContainer 
      :messages="currentMessages"
      :language="language"
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
import { ref, computed, onMounted, watch, inject } from 'vue';
import Sidebar from './layout/Sidebar.vue';
import ChatContainer from './layout/ChatContainer.vue';


// API State
const apiSettings = ref({});
const currentAPI = ref({
  provider: 'deepseek',
  model: 'deepseek-chat'
});

// State
const STORAGE_KEY = 'bubblechat-sessions';
const sessions = ref([]);
const activeSessionId = ref('1');
const isLoading = ref(false);

const props = defineProps({
  language: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['show-about', 'error']);

// Get settings update handler from parent
const onSettingsUpdate = inject('onSettingsUpdate');

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

// Load sessions and API settings on mount
onMounted(() => {
  // Load saved sessions
  const savedSessions = loadSessions();
  if (savedSessions.length > 0) {
    sessions.value = savedSessions;
    activeSessionId.value = savedSessions[0].id;
  } else {
    createNewChat();
  }

  // Load saved API settings
  const savedApiSettings = localStorage.getItem('api-settings');
  if (savedApiSettings) {
    const parsedSettings = JSON.parse(savedApiSettings);
    // Initialize apiSettings with the current provider's settings if they exist
    apiSettings.value = parsedSettings[currentAPI.value.provider] || {};
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

const handleSettingsSave = (settings) => {
  // Handle common settings update
  if (settings.commonSettings && onSettingsUpdate) {
    onSettingsUpdate(settings);
  }
  
  // Handle API settings update
  if (settings.apiSettings) {
    apiSettings.value = settings.apiSettings[currentAPI.value.provider] || {};
  }
};

const handleAPIChange = (selection) => {
  currentAPI.value = selection;
  // Update the active API settings based on the new provider
  apiSettings.value = localStorage.getItem('api-settings') ? 
    JSON.parse(localStorage.getItem('api-settings'))[selection.provider] || {} :
    {};
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
  console.log('handlesendmsg:',message);
  console.log('handlesendmsg:',response);
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
  console.log('errormsg',errorMessage)
  addMessage(activeSessionId.value, {
    content: `Error: ${errorMessage}`,
    sender: 'error'
  });
};
</script>
