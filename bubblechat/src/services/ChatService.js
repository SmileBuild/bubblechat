export class ChatService {
  constructor(provider, model, settings) {
    this.provider = provider;
    this.model = model;
    this.settings = settings;
  }

  async sendMessage(content, messageHistory = []) {
    if (!this.settings?.apiKey || !this.settings?.baseUrl) {
      throw new Error('API settings not configured');
    }

    if (this.provider === 'deepseek') {
      return this.sendDeepseekMessage(content, messageHistory);
    } else if (this.provider === 'anthropic') {
      return this.sendAnthropicMessage(content, messageHistory);
    }

    throw new Error('Unknown provider');
  }

  async sendDeepseekMessage(content, messageHistory) {
    const response = await fetch(`${this.settings.baseUrl}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.settings.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
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
      content: data.choices[0].message.content,
      sender: 'assistant'
    };
  }

  async sendAnthropicMessage(content, messageHistory) {
    const response = await fetch(`${this.settings.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': this.settings.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          ...messageHistory.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          { role: 'user', content }
        ],
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.content) {
      throw new Error('Invalid response format');
    }

    return {
      content: data.content,
      sender: 'assistant'
    };
  }
}
