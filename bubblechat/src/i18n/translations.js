export const translations = {
  en: {
    common: {
      settings: 'Settings',
      api: 'API',
      about: 'About',
      newChat: 'New Chat',
      close: 'Close',
      save: 'Save',
      cancel: 'Cancel',
      rename: 'Rename',
      delete: 'Delete'
    },
    settings: {
      commonSettings: 'Common Settings',
      language: 'Language',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      apiProviders: 'API Providers',
      apiKey: 'API Key',
      apiUrl: 'API URL',
      model: 'Model',
      selectModel: 'Select a model',
      testConnection: 'Test Connection',
      testing: 'Testing...',
      viewApiDocs: 'View API Documentation'
    }
  },
  zh: {
    common: {
      settings: '设置',
      api: 'API',
      about: '关于',
      newChat: '新对话',
      close: '关闭',
      save: '保存',
      cancel: '取消',
      rename: '重命名',
      delete: '删除'
    },
    settings: {
      commonSettings: '通用设置',
      language: '语言',
      theme: '主题',
      light: '浅色',
      dark: '深色',
      apiProviders: 'API 提供商',
      apiKey: 'API 密钥',
      apiUrl: 'API 地址',
      model: '模型',
      selectModel: '选择模型',
      testConnection: '测试连接',
      testing: '测试中...',
      viewApiDocs: '查看 API 文档'
    }
  }
};

export const useTranslations = (language) => {
  return (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value === undefined) break;
      value = value[k];
    }
    
    return value || key;
  };
};
