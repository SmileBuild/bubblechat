<template>
  <div class="flex min-h-screen bg-background">
    <Sidebar 
      :sessions="sessions"
      :activeSessionId="activeSessionId"
      @new-chat="createNewChat"
      @select-session="selectSession"
      @show-about="$emit('show-about')"
      @update-session="updateSession"
      @remove-session="removeSession"
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

const handleSendMessage = async (content) => {
  const sessionIndex = sessions.value.findIndex(s => s.id === activeSessionId.value);
  if (sessionIndex === -1) return;

  // Add user message
  const userMessage = {
    id: Date.now().toString(),
    content,
    sender: 'user',
    timestamp: new Date()
  };
  sessions.value[sessionIndex].messages.push(userMessage);

  // Simulate bot response
  isLoading.value = true;
  setTimeout(() => {
    const botMessage = {
      id: Date.now().toString(),
      content: 'This is a simulated response from the AI bot.',
      sender: 'bot',
      timestamp: new Date()
    };
    sessions.value[sessionIndex].messages.push(botMessage);
    isLoading.value = false;

    // Update session title if it's the first message
    if (sessions.value[sessionIndex].messages.length === 2) {
      const newTitle = content.slice(0, 30) + (content.length > 30 ? '...' : '');
      sessions.value = updateStorageSession(sessions.value, activeSessionId.value, {
        title: newTitle,
        timestamp: new Date()
      });
    }
  }, 1000);
};
</script>
