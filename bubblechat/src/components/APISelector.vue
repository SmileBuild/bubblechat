<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-surface dark:bg-surface-dark rounded-lg p-6 w-[800px] max-w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">Select API Provider & Model</h2>
        <button @click="close" class="text-gray-400 hover:text-white">
          <span class="material-icons">close</span>
        </button>
      </div>

      <!-- Content -->
      <div class="flex flex-1 overflow-hidden">
        <!-- Left side - Provider Selection -->
        <div class="w-64 border-r border-gray-200 dark:border-gray-700 pr-4 overflow-y-auto">
          <h3 class="text-lg font-medium mb-4">API Provider</h3>
          <div class="space-y-2">
            <button
              v-for="provider in providers"
              :key="provider.id"
              @click="selectProvider(provider)"
              :class="[
                'p-4 rounded-lg border text-left transition-colors',
                selectedProvider?.id === provider.id
                  ? 'bg-primary border-primary'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
              ]"
            >
              <div class="font-medium">{{ provider.name }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">{{ provider.description }}</div>
            </button>
          </div>
        </div>

        <!-- Right side - Settings Form -->
        <div class="flex-1 pl-6 overflow-y-auto">
          <!-- Model Selection -->
          <div v-if="selectedProvider">
            <h3 class="text-lg font-medium mb-4">Model Selection</h3>
            <div class="grid grid-cols-2 gap-4 mb-6">
              <button
                v-for="model in selectedProvider.models"
                :key="model.id"
                @click="selectModel(model)"
                :class="[
                  'p-4 rounded-lg border text-left transition-colors',
                  selectedModel?.id === model.id
                    ? 'bg-primary border-primary'
                    : 'border-gray-700 hover:border-primary/50'
                ]"
              >
                <div class="font-medium">{{ model.name }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ model.description }}</div>
              </button>
            </div>

            <!-- API Documentation Link -->
            <div class="mb-6">
              <a 
                :href="selectedProvider.docUrl"
                target="_blank"
                rel="noopener"
                class="text-primary hover:text-primary/90 dark:text-primary/90 dark:hover:text-primary flex items-center gap-2 text-sm"
              >
                <span class="material-icons text-sm">open_in_new</span>
                View API Documentation
              </a>
            </div>

            <!-- API Settings -->
            <div class="space-y-4">
              <!-- API Key -->
              <div class="space-y-1">
                <label class="block text-sm font-medium">API Key</label>
                <input 
                  type="password"
                  v-model="apiSettings[selectedProvider.id].apiKey"
                  placeholder="Enter API Key"
                  class="w-full bg-surface-light dark:bg-surface-light-dark rounded px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:border-primary focus:outline-none"
                />
              </div>

              <!-- Base URL -->
              <div class="space-y-1">
                <label class="block text-sm font-medium">Base URL</label>
                <input 
                  type="text"
                  v-model="apiSettings[selectedProvider.id].baseUrl"
                  :placeholder="selectedProvider.defaultBaseUrl"
                  class="w-full bg-surface-light dark:bg-surface-light-dark rounded px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <!-- Test Connection Button -->
            <div class="mt-6">
              <button
                type="button"
                @click="handleConnectionTest"
                :disabled="testingConnection || !canTestConnection"
                class="w-full px-4 py-2 text-sm bg-surface-light dark:bg-surface-light-dark hover:bg-surface-light/90 dark:hover:bg-surface-light-dark/90 rounded mb-4 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 dark:text-gray-100"
              >
                <span v-if="testingConnection">Testing...</span>
                <span v-else>Test Connection</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button 
          @click="close"
          class="px-4 py-2 text-sm rounded text-gray-800 dark:text-gray-200 hover:bg-surface-light dark:hover:bg-surface-light-dark"
        >
          Cancel
        </button>
        <button 
          @click="save"
          :disabled="!canSave"
          class="px-4 py-2 text-sm bg-primary hover:bg-primary/90 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save
        </button>
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
  },
  currentProvider: {
    type: String,
    default: ''
  },
  currentModel: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'save']);

const providers = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: 'smart_toy',
    description: 'Advanced AI model for chat and reasoning',
    docUrl: 'https://platform.deepseek.com/docs',
    defaultBaseUrl: 'https://api.deepseek.com',
    models: [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        description: 'General purpose chat model'
      },
      {
        id: 'deepseek-reasoner',
        name: 'DeepSeek Reasoner',
        description: 'Advanced reasoning capabilities'
      }
    ]
  },
  {
    id: 'siliconflow',
    name: 'Siliconflow',
    icon: 'smart_toy',
    description: 'Deepseek API services via Siliconflow',
    models: [
      {
        id: 'deepseek-ai/DeepSeek-V3',
        name: 'DeepSeek V3',
        description: 'Latest version of DeepSeek model'
      },
      {
        id: 'deepseek-ai/DeepSeek-R1',
        name: 'DeepSeek R1',
        description: 'Advanced reasoning model'
      }
    ]
  },
  {
    id: 'aliyun',
    name: 'Aliyun',
    icon: 'smart_toy',
    description: 'Aliyun AI services with DeepSeek models',
    docUrl: 'https://help.aliyun.com/document_detail/613695.html',
    defaultBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    models: [
      {
        id: 'deepseek-v3',
        name: 'deepseek-v3',
        description: 'Advanced language model for general purpose tasks'
      },
      {
        id: 'deepseek-r1',
        name: 'deepseek-r1',
        description: 'Specialized model for reasoning tasks'
      }
    ]
  }
];

// API Settings state
const apiSettings = ref({});
const testingConnection = ref(false);

// Initialize apiSettings for each provider
providers.forEach(provider => {
  if (!apiSettings.value[provider.id]) {
    apiSettings.value[provider.id] = {
      apiKey: '',
      baseUrl: provider.defaultBaseUrl
    };
  }
});

const selectedProvider = ref(providers[0]);
const selectedModel = ref(providers[0].models[0]);

// Load saved settings and initialize selected provider/model on mount
onMounted(() => {
  // Load API settings
  const savedSettings = localStorage.getItem('api-settings');
  if (savedSettings) {
    const parsed = JSON.parse(savedSettings);
    Object.keys(parsed).forEach(providerId => {
      if (apiSettings.value[providerId]) {
        apiSettings.value[providerId] = {
          ...apiSettings.value[providerId],
          ...parsed[providerId]
        };
      }
    });
  }

  // Validate and set provider
  const validProvider = providers.find(p => p.id === props.currentProvider);
  if (validProvider) {
    selectedProvider.value = validProvider;
    
    // Validate and set model for the selected provider
    const validModel = validProvider.models.find(m => m.id === props.currentModel);
    if (validModel) {
      selectedModel.value = validModel;
    }
  }
});

const canTestConnection = computed(() => {
  if (!selectedProvider.value) return false;
  const settings = apiSettings.value[selectedProvider.value.id];
  return !!(settings?.apiKey && settings?.baseUrl);
});

const canSave = computed(() => {
  if (!selectedProvider.value || !selectedModel.value) return false;
  const settings = apiSettings.value[selectedProvider.value.id];
  return !!(settings?.apiKey && settings?.baseUrl);
});

const selectProvider = (provider) => {
  selectedProvider.value = provider;
  selectedModel.value = provider.models[0];
};

const selectModel = (model) => {
  selectedModel.value = model;
};

const handleConnectionTest = async () => {
  if (!selectedProvider.value || !canTestConnection.value) return;

  const settings = apiSettings.value[selectedProvider.value.id];
  testingConnection.value = true;
  
  try {
    const response = await fetch(settings.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: selectedModel.value.id,
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

const save = () => {
  if (!canSave.value) return;
  
  // Save API settings
  localStorage.setItem('api-settings', JSON.stringify(apiSettings.value));
  
  // Emit selected provider/model and settings
  emit('save', {
    selection: {
      provider: selectedProvider.value.id,
      model: selectedModel.value.id
    },
    settings: apiSettings.value
  });
  
  close();
};

const close = () => {
  emit('close');
};
</script>
