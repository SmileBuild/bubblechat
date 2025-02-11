<template>
  <main class="flex-1 flex flex-col h-screen overflow-hidden bg-background dark:bg-background-dark">
    <!-- Chat Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messagesContainer">
      <div v-for="message in messages" :key="message.id" 
           :class="['flex', messageTypes[message.sender].align]">
        <div class="flex gap-3 items-start max-w-3xl w-full" :class="[message.sender === 'user' ? 'flex-row-reverse' : 'flex-row']">
          <!-- Avatar -->
          <div class="w-8 h-8 shrink-0">
            <img :src="messageTypes[message.sender].avatar" :alt="message.sender" class="w-full h-full">
          </div>
          
          <!-- Message Content Column -->
          <div class="flex-1 group relative">
            <!-- Name + Metadata Row -->
            <div class="flex items-center gap-2 mb-1 text-gray-600 dark:text-gray-400" 
                 :class="[message.sender === 'user' ? 'flex-row-reverse' : 'flex-row']">
              <span class="font-medium text-gray-900 dark:text-white">{{ messageTypes[message.sender].name }}</span>
              <span class="text-sm">{{ formatTime(message.timestamp) }}</span>
              <span v-if="message.tokens" class="text-sm">{{ message.tokens }} tokens</span>
            </div>
            
            <!-- Message Content -->
            <div :class="[
              'p-4 rounded-lg relative',
              messageTypes[message.sender].class
            ]">
              <div v-if="message.sender === 'assistant'" v-html="renderMarkdown(message.content)" />
              <div v-else>{{ message.content }}</div>
            </div>

            <!-- Copy Button -->
            <button
              class="absolute transition-all p-1.5 rounded bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 top-9"
              :class="[message.sender === 'user' ? '-left-10' : '-right-10']"
              @click="copyMessageContent(message)"
              :title="t('chat.copy')"
            >
              <svg class="w-4 h-4 text-primary dark:text-primary/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div v-if="isLoading" class="flex justify-start">
        <div class="max-w-3xl p-4 rounded-lg bg-surface dark:bg-surface-dark text-gray-800 dark:text-gray-100">
          <div class="flex gap-2">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Input -->
    <div class="border-t p-4 border-gray-200 dark:border-gray-700">
      <form @submit.prevent="sendMessage" class="flex gap-2">
        <input
          v-model="newMessage"
          type="text"
          :placeholder="t('chat.inputPlaceholder')"
          class="flex-1 rounded-lg px-4 py-2 bg-surface dark:bg-surface-dark text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          :disabled="!newMessage.trim() || isLoading"
          class="bg-primary hover:bg-primary/90 disabled:bg-gray-600 text-white rounded-lg px-6 py-2"
        >
          {{ t('chat.sendButton') }}
        </button>
      </form>
    </div>

    <!-- Copy Success Alert -->
    <div v-if="showCopyAlert"
         class="fixed inset-0 flex items-center justify-center z-50">
      <div class="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-out flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>{{ t('chat.copySuccess') }}</span>
      </div>
    </div>
  </main>
</template>

<script setup>
const showCopyAlert = ref(false);

import { ref, watch, onMounted, computed, inject } from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { useTranslations } from '../../i18n/translations';
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
  language: {
    type: String,
    required: true
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

const t = computed(() => {
  return useTranslations(props.language);
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
        }))
        
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
        }))
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
    name: 'you',
    avatar: '/avatars/user.svg',
    class: 'bg-primary text-white shadow-sm',
    align: 'justify-end'
  },
  assistant: {
    name: 'assistant',
    avatar: '/avatars/assistant.svg',
    class: 'markdown-body bg-surface dark:bg-surface-dark text-gray-800 dark:text-gray-100 shadow-sm',
    align: 'justify-start'
  },
  error: {
    name: 'system',
    avatar: '/avatars/assistant.svg',
    class: 'bg-red-500/20 text-red-500 dark:text-red-300',
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

// Copy message content
const copyMessageContent = async (message) => {
  try {
    let textToCopy = message.content;
    if (message.sender === 'assistant') {
      // For assistant messages, we need to strip HTML tags since the content is markdown
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = renderMarkdown(message.content);
      textToCopy = tempDiv.textContent || tempDiv.innerText;
    }
    await navigator.clipboard.writeText(textToCopy);
    
    // Show and auto-hide copy success alert
    showCopyAlert.value = true;
    setTimeout(() => {
      showCopyAlert.value = false;
    }, 3000);
  } catch (error) {
    console.error('Failed to copy message:', error);
  }
};

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
  /* Colors handled by Tailwind classes in template */
}

.markdown-body pre {
  background-color: #f8f9fa; /* Light mode */
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
}

.dark .markdown-body pre {
  background-color: #1f2937; /* Dark mode - gray-800 */
}

.markdown-body code {
  background-color: #f3f4f6; /* Light mode - gray-100 */
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.dark .markdown-body code {
  background-color: #374151; /* Dark mode - gray-700 */
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
  border-left: 4px solid #e5e7eb; /* Light mode - gray-200 */
  margin: 1rem 0;
  padding-left: 1rem;
  color: #6b7280; /* Light mode - gray-500 */
}

.dark .markdown-body blockquote {
  border-left: 4px solid #4b5563; /* Dark mode - gray-600 */
  color: #9ca3af; /* Dark mode - gray-400 */
}

.markdown-body h1, .markdown-body h2, .markdown-body h3, 
.markdown-body h4, .markdown-body h5, .markdown-body h6 {
  margin: 1.5rem 0 1rem;
  font-weight: 600;
}
</style>
