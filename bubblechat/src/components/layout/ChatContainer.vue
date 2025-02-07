<template>
  <main class="flex-1 flex flex-col h-screen bg-background overflow-hidden">
    <!-- Chat Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messagesContainer">
      <div v-for="message in messages" :key="message.id" 
           :class="['flex', message.sender === 'user' ? 'justify-end' : 'justify-start']">
        <div :class="['max-w-3xl p-4 rounded-lg', 
                      message.sender === 'user' 
                      ? 'bg-primary text-white' 
                      : 'bg-surface text-gray-100']">
          {{ message.content }}
        </div>
      </div>
      <div v-if="isLoading" class="flex justify-start">
        <div class="bg-surface text-gray-100 max-w-3xl p-4 rounded-lg">
          <div class="flex gap-2">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Input -->
    <div class="border-t border-gray-700 p-4">
      <form @submit.prevent="sendMessage" class="flex gap-2">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type your message..."
          class="flex-1 bg-surface text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          :disabled="!newMessage.trim()"
          class="bg-primary hover:bg-primary/90 disabled:bg-gray-600 text-white rounded-lg px-6 py-2"
        >
          Send
        </button>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['send-message']);

const newMessage = ref('');
const messagesContainer = ref(null);

const sendMessage = () => {
  const message = newMessage.value.trim();
  if (message) {
    emit('send-message', message);
    newMessage.value = '';
  }
};

// Auto scroll to bottom when new messages arrive
watch(() => props.messages.length, () => {
  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  }, 0);
});
</script>
