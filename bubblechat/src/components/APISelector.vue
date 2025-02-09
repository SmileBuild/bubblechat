<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-surface dark:bg-surface-dark rounded-lg p-6 w-[800px] max-w-full max-h-[90vh]">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">Select API Provider & Model</h2>
        <button @click="close" class="text-gray-400 hover:text-white">
          <span class="material-icons">close</span>
        </button>
      </div>

      <!-- Content -->
      <div class="space-y-6">
        <!-- Provider Selection -->
        <div>
          <h3 class="text-lg font-medium mb-4">API Provider</h3>
          <div class="grid grid-cols-2 gap-4">
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
              <div class="flex items-center gap-3">
                <span class="material-icons text-2xl">{{ provider.icon }}</span>
                <div>
                  <div class="font-medium">{{ provider.name }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">{{ provider.description }}</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Model Selection -->
        <div v-if="selectedProvider">
          <h3 class="text-lg font-medium mb-4">Model Selection</h3>
          <div class="grid grid-cols-2 gap-4">
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
import { ref, computed } from 'vue';

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
  }
];

const selectedProvider = ref(providers.find(p => p.id === props.currentProvider) || providers[0]);
const selectedModel = ref(
  selectedProvider.value.models.find(m => m.id === props.currentModel) || 
  selectedProvider.value.models[0]
);

const canSave = computed(() => {
  return selectedProvider.value && selectedModel.value;
});

const selectProvider = (provider) => {
  selectedProvider.value = provider;
  selectedModel.value = provider.models[0];
};

const selectModel = (model) => {
  selectedModel.value = model;
};

const save = () => {
  if (!canSave.value) return;
  emit('save', {
    provider: selectedProvider.value.id,
    model: selectedModel.value.id
  });
  close();
};

const close = () => {
  emit('close');
};
</script>
