<template>
  <main class="flex-1 flex flex-col h-screen bg-background overflow-hidden">
    <!-- Chat Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messagesContainer">
      <div v-for="message in messages" :key="message.id" 
           :class="['flex', messageTypes[message.sender].align]">
        <div class="flex gap-3 max-w-3xl w-full">
          <!-- Avatar -->
          <div class="w-8 h-8 shrink-0">
            <img :src="messageTypes[message.sender].avatar" :alt="message.sender" class="w-full h-full">
          </div>
          
          <!-- Message Content Column -->
          <div class="flex-1">
            <!-- Name + Metadata Row -->
            <div class="flex items-center gap-2 mb-1 text-gray-400">
              <span class="font-medium text-white">{{ messageTypes[message.sender].name }}</span>
              <span class="text-sm">{{ formatTime(message.timestamp) }}</span>
              <span v-if="message.tokens" class="text-sm">{{ message.tokens }} tokens</span>
            </div>
            
            <!-- Message Content -->
            <div :class="[
              'p-4 rounded-lg',
              messageTypes[message.sender].class
            ]">
              <div v-if="message.sender === 'assistant'" v-html="renderMarkdown(message.content)" />
              <div v-else>{{ message.content }}</div>
            </div>
          </div>
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
          :disabled="!newMessage.trim() || isLoading"
          class="bg-primary hover:bg-primary/90 disabled:bg-gray-600 text-white rounded-lg px-6 py-2"
        >
          Send
        </button>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';
import 'highlight.js/styles/github-dark.css';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  provider: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  settings: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['send-message', 'error']);

// Format relative time
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  return dayjs(timestamp).fromNow();
};

// Chat API functionality
const sendDeepseekMessage = async (content, messageHistory, settings, model) => {
  const response = await fetch(`${settings.baseUrl}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        ...messageHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: 'user', content }
      ],
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('response data: ',data)
  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Invalid response format');
  }
  console.log('return: ', data)
  return {
    content: data.choices?.[0]?.message?.content,
    sender: 'assistant',
  };
};

const sendSiliconflowMessage = async (content, messageHistory, settings, model) => {
  const response = await fetch(settings.baseUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        ...messageHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: 'user', content }
      ],
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Invalid response format');
  }

  return {
    content: data.choices?.[0]?.message?.content,
    sender: 'assistant',
  };
};

const newMessage = ref('');
const messagesContainer = ref(null);

// Message type styling configuration
const messageTypes = {
  user: {
    name: 'You',
    avatar: '/avatars/user.svg',
    class: 'bg-primary text-white',
    align: 'justify-end'
  },
  assistant: {
    name: 'Assistant',
    avatar: '/avatars/assistant.svg',
    class: 'bg-surface text-gray-100 markdown-body',
    align: 'justify-start'
  },
  error: {
    name: 'System',
    avatar: '/avatars/assistant.svg',
    class: 'bg-red-500/20 text-red-300',
    align: 'justify-center'
  }
};

// Configure marked with syntax highlighting
onMounted(() => {
  marked.setOptions({
    highlight: function(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
    langPrefix: 'hljs language-'
  });
});

// Render markdown with syntax highlighting and sanitization
const renderMarkdown = (content) => {
  try {
    const html = marked(content);
    return DOMPurify.sanitize(html);
  } catch (error) {
    console.error('Markdown rendering error:', error);
    return content;
  }
};

const sendMessage = async () => {
  const message = newMessage.value.trim();
  if (message && !props.isLoading) {
    try {
      newMessage.value = '';
      emit('send-message',message);
      
      // Get API response
      let response;
      if (props.provider === 'deepseek') {
        response = await sendDeepseekMessage(message, props.messages, props.settings, props.model);
      } else if (props.provider === 'siliconflow') {
        response = await sendSiliconflowMessage(message, props.messages, props.settings, props.model);
      } else {
        throw new Error('Unknown provider');
      }
      
      console.error('Message Error:', message);
      
      console.error('response Error:', response);
      // Emit response back with timestamp
      emit('send-message', message, response);
    } catch (error) {
      console.error('API Error:', error);
      emit('error', {
        content: error.message,
        sender: 'error'
      });
    }
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

<style>
/* Markdown styling */
.markdown-body {
  color: #e5e7eb; /* text-gray-200 */
}

.markdown-body pre {
  background-color: #1f2937; /* gray-800 */
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
}

.markdown-body code {
  background-color: #374151; /* gray-700 */
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.markdown-body pre code {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
}

.markdown-body p {
  margin: 1rem 0;
}

.markdown-body ul, .markdown-body ol {
  margin: 1rem 0;
  padding-left: 2rem;
}

.markdown-body li {
  margin: 0.5rem 0;
}

.markdown-body blockquote {
  border-left: 4px solid #4b5563; /* gray-600 */
  margin: 1rem 0;
  padding-left: 1rem;
  color: #9ca3af; /* gray-400 */
}

.markdown-body h1, .markdown-body h2, .markdown-body h3, 
.markdown-body h4, .markdown-body h5, .markdown-body h6 {
  margin: 1.5rem 0 1rem;
  font-weight: 600;
}
</style>
