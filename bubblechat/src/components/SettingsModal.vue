<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-surface rounded-lg p-6 w-[800px] max-w-full max-h-[90vh] flex">
      <!-- Left side - Provider List -->
      <div class="w-64 border-r border-gray-700 pr-4 overflow-y-auto">
        <h3 class="text-lg font-medium mb-4">API Providers</h3>
        <div class="space-y-2">
          <button
            v-for="provider in providers"
            :key="provider.id"
            @click="handleProviderSelect(provider)"
            :class="[
              'w-full px-4 py-2 text-left rounded text-sm',
              activeProvider?.id === provider.id
                ? 'bg-primary text-white'
                : 'hover:bg-surface-light'
            ]"
          >
            {{ provider.name }}
          </button>
        </div>
      </div>

      <!-- Right side - Settings Form -->
      <div class="flex-1 pl-6 overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">
            {{ activeProvider ? `${activeProvider.name} Settings` : 'Settings' }}
          </h2>
          <button @click="close" class="text-gray-400 hover:text-white">
            <span class="material-icons">close</span>
          </button>
        </div>

        <form v-if="activeProvider" @submit.prevent="handleSettingsSave" class="space-y-6">
          <!-- API Documentation Link -->
          <div class="mb-6">
            <a 
              :href="activeProvider.docUrl"
              target="_blank"
              rel="noopener"
              class="text-primary hover:text-primary/90 flex items-center gap-2 text-sm"
            >
              <span class="material-icons text-sm">open_in_new</span>
              View API Documentation
            </a>
          </div>

          <!-- Form Fields -->
          <div class="space-y-4">
            <!-- API Key -->
            <div class="space-y-1">
              <label class="block text-sm font-medium">API Key</label>
              <input 
                type="password"
                v-model="currentSettings.apiKey"
                placeholder="Enter API key"
                class="w-full bg-surface-light rounded px-3 py-2 text-sm border border-gray-700 focus:border-primary focus:outline-none"
              />
            </div>

            <!-- Base URL -->
            <div class="space-y-1">
              <label class="block text-sm font-medium">API URL</label>
              <input 
                type="text"
                v-model="currentSettings.baseUrl"
                :placeholder="activeProvider.defaultBaseUrl"
                class="w-full bg-surface-light rounded px-3 py-2 text-sm border border-gray-700 focus:border-primary focus:outline-none"
              />
            </div>

            <!-- Model Selection -->
            <div class="space-y-1">
              <label class="block text-sm font-medium">Model</label>
              <select
                v-model="currentSettings.model"
                class="w-full bg-surface-light rounded px-3 py-2 text-sm border border-gray-700 focus:border-primary focus:outline-none"
              >
                <option value="">Select a model</option>
                <option 
                  v-for="model in activeProvider.models" 
                  :key="model"
                  :value="model"
                >
                  {{ model }}
                </option>
              </select>
            </div>
          </div>

          <!-- Test Connection Button -->
          <div>
            <button
              type="button"
              @click="handleConnectionTest"
              :disabled="testingConnection || !canTestConnection"
              class="w-full px-4 py-2 text-sm bg-surface-light hover:bg-surface-light/90 rounded mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="testingConnection">Testing...</span>
              <span v-else>Test Connection</span>
            </button>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button 
              type="button"
              @click="close"
              class="px-4 py-2 text-sm rounded hover:bg-surface-light"
            >
              Cancel
            </button>
            <button 
              type="submit"
              :disabled="!isFormValid"
              class="px-4 py-2 text-sm bg-primary hover:bg-primary/90 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'save']);

// Provider Configuration
const providers = [
  {
    id: 'openai',
    name: 'OpenAI',
    docUrl: 'https://platform.openai.com/docs/api-reference',
    defaultBaseUrl: 'https://api.openai.com/v1',
    models: ['gpt-3.5-turbo', 'gpt-4'],
    testEndpoint: '/models'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    docUrl: 'https://platform.deepseek.com/docs',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-coder'],
    testEndpoint: '/models'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    docUrl: 'https://docs.anthropic.com/claude/reference',
    defaultBaseUrl: 'https://api.anthropic.com',
    models: ['claude-2', 'claude-instant-1'],
    testEndpoint: '/v1/models'
  }
];

// State
const settings = ref({});
const activeProvider = ref(providers[0]);
const testingConnection = ref(false);

// Initialize settings structure for a provider
const initializeProviderSettings = (provider) => {
  if (!settings.value[provider.id]) {
    settings.value[provider.id] = {
      apiKey: '',
      baseUrl: provider.defaultBaseUrl,
      model: ''
    };
  }
};

// Initialize all providers
providers.forEach(initializeProviderSettings);

// Computed Properties
const currentSettings = computed(() => {
  return activeProvider.value ? settings.value[activeProvider.value.id] : null;
});

const canTestConnection = computed(() => {
  if (!currentSettings.value) return false;
  return !!(currentSettings.value.apiKey && currentSettings.value.baseUrl);
});

const isFormValid = computed(() => {
  if (!currentSettings.value) return false;
  return !!(
    currentSettings.value.apiKey &&
    currentSettings.value.baseUrl &&
    currentSettings.value.model
  );
});

// Methods
const handleProviderSelect = (provider) => {
  activeProvider.value = provider;
  initializeProviderSettings(provider);
};

const handleConnectionTest = async () => {
  if (!activeProvider.value || !currentSettings.value || !canTestConnection.value) return;

  testingConnection.value = true;
  try {
    const response = await fetch(
      `${currentSettings.value.baseUrl}${activeProvider.value.testEndpoint}`,
      {
        headers: {
          'Authorization': `Bearer ${currentSettings.value.apiKey}`
        }
      }
    );
    
    if (response.ok) {
      alert('Connection successful!');
    } else {
      alert(`Connection failed: ${response.statusText}`);
    }
  } catch (error) {
    alert(`Error testing connection: ${error.message}`);
  } finally {
    testingConnection.value = false;
  }
};

const handleSettingsSave = () => {
  if (!isFormValid.value) return;
  
  localStorage.setItem('api-settings', JSON.stringify(settings.value));
  emit('save', settings.value);
  close();
};

// Load saved settings on mount
onMounted(() => {
  const savedSettings = localStorage.getItem('api-settings');
  if (savedSettings) {
    const parsed = JSON.parse(savedSettings);
    Object.keys(parsed).forEach(providerId => {
      if (settings.value[providerId]) {
        settings.value[providerId] = {
          ...settings.value[providerId],
          ...parsed[providerId]
        };
      }
    });
  }
});

const close = () => {
  emit('close');
};
</script>
