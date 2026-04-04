import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { DEFAULT_MODEL } from './prompts.js';
import { storage } from '../utils/storage.js';
import { API } from '../utils/constants.js';

const AIContext = createContext(null);

export function useAI() {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAI must be used within an AIProvider');
  return ctx;
}

export function AIProvider({ children, enabled = false }) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = storage.get('ai_history_full');
      if (saved && saved.length) return saved;
    } catch {}
    return [{
      role: 'assistant',
      content: `👋 Hi! I'm Karamela, your K8s AI assistant.\n\nI can help you:\n• 🔍 Review your YAML for issues\n• 🛡️ Security audit your configs\n• 💡 Suggest best practices\n• 🔧 Debug deployment problems\n• 📚 Explain any Kubernetes concept\n\nType a question or click a quick prompt below!`,
    }];
  });

  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(() => storage.get('ai_model', DEFAULT_MODEL));
  const [panelOpen, setPanelOpen] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    storage.set('ai_history_full', messages);
  }, [messages]);

  useEffect(() => {
    storage.set('ai_model', model);
  }, [model]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = useCallback(async (customPrompt, contextData = {}) => {
    const msg = (customPrompt || input).trim();
    if (!msg || loading) return;

    if (!customPrompt) setInput('');
    setMessages(m => [...m, { role: 'user', content: msg }]);
    setLoading(true);

    const systemPrompt = contextData.systemPrompt || `You are Karamela, an expert Kubernetes DevOps assistant built into K8s Hub — a Kubernetes YAML Generator & Learning Platform.

Current resource type: ${contextData.resourceType || 'N/A'}
Current YAML:
\`\`\`yaml
${contextData.currentYaml || 'N/A'}
\`\`\`

Help with: YAML review, security audits, best practices, troubleshooting. Be concise and practical. Use code blocks for YAML. If asked in Arabic, respond in Arabic.`;

    try {
      const res = await fetch(API.aiChat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.filter((_, i) => i > 0).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: msg },
          ],
          max_tokens: 1500,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data.content || data.reply || 'Sorry, no response received.';
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages(m => [...m, {
        role: 'assistant',
        content: `❌ Error: ${e.message}\n\nCheck your API key and model in settings.`,
      }]);
    }
    setLoading(false);
  }, [input, loading, model, messages]);

  const clear = useCallback(() => {
    setMessages([{
      role: 'assistant',
      content: `Chat cleared. How can I help?`,
    }]);
  }, []);

  const exportChat = useCallback(() => {
    const text = messages.map(m => `**${m.role.toUpperCase()}**:\n${m.content}`).join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `k8s-hub-chat-${Date.now()}.md`;
    a.click();
  }, [messages]);

  return (
    <AIContext.Provider value={{
      messages,
      loading,
      model,
      setModel,
      panelOpen,
      setPanelOpen,
      input,
      setInput,
      scrollRef,
      send,
      clear,
      exportChat,
      enabled,
    }}>
      {children}
    </AIContext.Provider>
  );
}
