<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-surface dark:bg-surface-dark rounded-lg p-6 w-[800px] max-w-full max-h-[90vh] flex flex-col">
      <!-- Common Settings -->
      <div class="border-b border-gray-200 dark:border-gray-700 mb-4 pb-4">
        <h3 class="text-lg font-medium mb-4">{{ t('settings.commonSettings') }}</h3>
        
        <!-- Language Selection -->
        <div class="space-y-1 mb-4">
          <label class="block text-sm font-medium">{{ t('settings.language') }}</label>
          <select
            v-model="commonSettings.language"
            class="w-full bg-surface-light dark:bg-surface-light-dark rounded px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:border-primary focus:outline-none"
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </div>

        <!-- Theme Selection -->
        <div class="space-y-1">
          <label class="block text-sm font-medium">{{ t('settings.theme') }}</label>
          <select
            v-model="commonSettings.theme"
            class="w-full bg-surface-light dark:bg-surface-light-dark rounded px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:border-primary focus:outline-none"
          >
            <option value="light">{{ t('settings.light') }}</option>
            <option value="dark">{{ t('settings.dark') }}</option>
          </select>
        </div>
      </div>

      <!-- Provider Settings Container -->
      <div class="flex flex-1 overflow-hidden">
        <!-- Left side - Provider List -->
        <div class="w-64 border-r border-gray-200 dark:border-gray-700 pr-4 overflow-y-auto">
          <h3 class="text-lg font-medium mb-4">{{ t('settings.apiProviders') }}</h3>
          <div class="space-y-2">
            <button
              v-for="provider in providers"
              :key="provider.id"
              @click="handleProviderSelect(provider)"
              :class="[
                'w-full px-4 py-2 text-left rounded text-sm',
                activeProvider?.id === provider.id
                  ? 'bg-primary text-white'
                  : 'hover:bg-surface-light dark:hover:bg-surface-light-dark'
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
              {{ activeProvider ? `${activeProvider.name} Settings` : t('common.settings') }}
            </h2>
            <button @click="close" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
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
                class="text-primary hover:text-primary/90 dark:text-primary/90 dark:hover:text-primary flex items-center gap-2 text-sm"
              >
                <span class="material-icons text-sm">open_in_new</span>
                {{ t('settings.viewApiDocs') }}
              </a>
            </div>

            <!-- Form Fields -->
            <div class="space-y-4">
              <!-- API Key -->
              <div class="space-y-1">
                <label class="block text-sm font-medium">{{ t('settings.apiKey') }}</label>
                <input 
                  type="password"
                  v-model="currentSettings.apiKey"
                  :placeholder="t('settings.apiKey')"
                  class="w-full bg-surface-light dark:bg-surface-light-dark rounded px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:border-primary focus:outline-none"
                />
              </div>

              <!-- Base URL -->
              <div class="space-y-1">
                <label class="block text-sm font-medium">{{ t('settings.apiUrl') }}</label>
                <input 
                  type="text"
                  v-model="currentSettings.baseUrl"
                  :placeholder="activeProvider.defaultBaseUrl"
                  class="w-full bg-surface-light dark:bg-surface-light-dark rounded px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:border-primary focus:outline-none"
                />
              </div>

              <!-- Model Selection -->
              <div class="space-y-1">
                <label class="block text-sm font-medium">{{ t('settings.model') }}</label>
                <select
                  v-model="currentSettings.model"
                  class="w-full bg-surface-light dark:bg-surface-light-dark rounded px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:border-primary focus:outline-none"
                >
                  <option value="">{{ t('settings.selectModel') }}</option>
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
                class="w-full px-4 py-2 text-sm bg-surface-light dark:bg-surface-light-dark hover:bg-surface-light/90 dark:hover:bg-surface-light-dark/90 rounded mb-4 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 dark:text-gray-100"
              >
                <span v-if="testingConnection">{{ t('settings.testing') }}</span>
                <span v-else>{{ t('settings.testConnection') }}</span>
              </button>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                type="button"
                @click="close"
                class="px-4 py-2 text-sm rounded text-gray-800 dark:text-gray-200 hover:bg-surface-light dark:hover:bg-surface-light-dark"
              >
                {{ t('common.cancel') }}
              </button>
              <button 
                type="submit"
                :disabled="!isFormValid"
                class="px-4 py-2 text-sm bg-primary hover:bg-primary/90 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ t('common.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useTranslations } from '../i18n/translations';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    required: true
  }
});

// Translation helper
const t = computed(() => useTranslations(props.language));

const emit = defineEmits(['close', 'save']);

// Provider Configuration
const providers = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    docUrl: 'https://platform.deepseek.com/docs',
    defaultBaseUrl: 'https://api.deepseek.com',
    models: ['deepseek-chat', 'deepseek-reasoner']
  },
  {
    id: 'siliconflow',
    name: 'Siliconflow',
    docUrl: 'https://docs.siliconflow.cn/api-reference/chat-completions/chat-completions',
    defaultBaseUrl: 'https://api.siliconflow.cn/v1/chat/completions',
    models: ['deepseek-ai/DeepSeek-V3', 'deepseek-ai/DeepSeek-R1']
  }
];

// State
const commonSettings = ref({
  language: localStorage.getItem('app-language') || 'en',
  theme: localStorage.getItem('app-theme') || 'dark'
});
const settings = ref({});
const activeProvider = ref(providers[0]);
const testingConnection = ref(false);

// Watch for common settings changes
watch(commonSettings, (newSettings) => {
  localStorage.setItem('app-language', newSettings.language);
  localStorage.setItem('app-theme', newSettings.theme);
}, { deep: true });

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
    const response = await fetch(currentSettings.value.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentSettings.value.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: currentSettings.value.model,
        messages: [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Hello!"}
        ],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format');
    }

    alert('Connection successful!');
  } catch (error) {
    alert(`Error testing connection: ${error.message}`);
  } finally {
    testingConnection.value = false;
  }
};

const handleSettingsSave = () => {
  if (!isFormValid.value) return;
  
  localStorage.setItem('api-settings', JSON.stringify(settings.value));
  emit('save', {
    apiSettings: settings.value,
    commonSettings: commonSettings.value
  });
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
