<template>
  <!-- Added bg-background class to test Tailwind -->
  <div class="flex min-h-screen bg-background">
    <Sidebar 
      :sessions="sessions"
      :activeSessionId="activeSessionId"
      @new-chat="createNewChat"
      @select-session="selectSession"
      @show-about="showAbout = true"
    />
    <ChatContainer 
      :messages="currentMessages"
      :isLoading="isLoading"
      @send-message="handleSendMessage"
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
</template>

<script setup>
import { ref, computed } from 'vue';
import Sidebar from './components/layout/Sidebar.vue';
import ChatContainer from './components/layout/ChatContainer.vue';

// State
const sessions = ref([
  {
    id: '1',
    title: 'First Chat',
    timestamp: new Date(),
    messages: []
  }
]);
const activeSessionId = ref('1');
const isLoading = ref(false);
const showAbout = ref(false);

// Computed
const currentMessages = computed(() => {
  const session = sessions.value.find(s => s.id === activeSessionId.value);
  return session ? session.messages : [];
});

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
      sessions.value[sessionIndex].title = content.slice(0, 30) + (content.length > 30 ? '...' : '');
    }
  }, 1000);
};
</script>
