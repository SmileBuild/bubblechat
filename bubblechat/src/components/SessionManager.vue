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
      @send-message="handleSendMessage"
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
const loadCurrentAPI = () => {
  const savedAPI = localStorage.getItem('current-api');
  if (savedAPI) {
    currentAPI.value = JSON.parse(savedAPI);
  }
};

// State
const STORAGE_KEY = 'bubblechat-sessions';
const sessions = ref([]);
const activeSessionId = ref('1');
const isLoading = ref(false);

const emit = defineEmits(['show-about']);

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
  loadCurrentAPI();
  const savedSessions = loadSessions();
  if (savedSessions.length > 0) {
    sessions.value = savedSessions;
    activeSessionId.value = savedSessions[0].id;
  } else {
    createNewChat(); // Create initial chat if no saved sessions
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
};

const handleSettingsSave = (settings) => {
  // Settings are already saved to localStorage by SettingsModal
};

const handleSendMessage = async (content) => {
  const sessionIndex = sessions.value.findIndex(s => s.id === activeSessionId.value);
  if (sessionIndex === -1) return;

  const settings = getAPISettings(currentAPI.value.provider);
  if (!settings?.apiKey || !settings?.baseUrl) {
    alert('Please configure your API settings first');
    return;
  }

  // Add user message
  const userMessage = {
    id: Date.now().toString(),
    content,
    sender: 'user',
    timestamp: new Date()
  };
  sessions.value[sessionIndex].messages.push(userMessage);

  // Get bot response
  isLoading.value = true;
  try {
    const requestBody = {
      messages: [{ role: "user", content }],
      model: currentAPI.value.model,
      stream: false
    };

    let headers = {
      'Content-Type': 'application/json'
    };

    // Set provider-specific headers and endpoints
    if (currentAPI.value.provider === 'deepseek') {
      headers['Authorization'] = `Bearer ${settings.apiKey}`;
      const response = await fetch(`${settings.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const botMessage = {
        id: Date.now().toString(),
        content: data.choices[0].message.content,
        sender: 'bot',
        timestamp: new Date()
      };
      sessions.value[sessionIndex].messages.push(botMessage);
    } else if (currentAPI.value.provider === 'anthropic') {
      headers['x-api-key'] = settings.apiKey;
      headers['anthropic-version'] = '2023-06-01';
      const response = await fetch(`${settings.baseUrl}/v1/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...requestBody,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const botMessage = {
        id: Date.now().toString(),
        content: data.content,
        sender: 'bot',
        timestamp: new Date()
      };
      sessions.value[sessionIndex].messages.push(botMessage);
    }

    // Update session title if it's the first message
    if (sessions.value[sessionIndex].messages.length === 2) {
      const newTitle = content.slice(0, 30) + (content.length > 30 ? '...' : '');
      sessions.value = updateStorageSession(sessions.value, activeSessionId.value, {
        title: newTitle,
        timestamp: new Date()
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    alert(`Error: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};
</script>
