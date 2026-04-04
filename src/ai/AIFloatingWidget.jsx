import React from 'react';
import { useAI } from './AIContext.jsx';
import ReactMarkdown from 'react-markdown';

export default function AIFloatingWidget() {
  const { messages, loading, input, setInput, scrollRef, send, clear, panelOpen, setPanelOpen, model, setModel, enabled, exportChat } = useAI();

  if (!enabled) return null;

  const renderMessage = (content) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const code = part.replace(/^```\w*\n?/, '').replace(/```$/, '');
        return <pre key={i} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '10px 14px', margin: '8px 0', fontSize: 11.5, color: '#a0f0c0', overflow: 'auto', fontFamily: 'var(--font-mono)' }}>{code}</pre>;
      }
      return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
    });
  };

  return (
    <>
      {/* Floating button */}
      <div
        onClick={() => setPanelOpen(!panelOpen)}
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 9999, width: 56, height: 56,
          background: 'var(--color-primary)', borderRadius: '50%',
          boxShadow: '0 10px 30px rgba(99,102,241,0.5)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, color: 'white', transition: 'transform 0.2s ease',
          transform: panelOpen ? 'scale(0)' : 'scale(1)',
        }}
      >🐾</div>

      {/* Chat panel */}
      <div style={{
        position: 'fixed', top: 70, bottom: 20, right: panelOpen ? 20 : -440,
        width: 420, maxWidth: 'calc(100vw - 40px)', zIndex: 10000,
        background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)', boxShadow: '-10px 0 40px rgba(0,0,0,0.4)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        transition: 'right 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Header */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card)' }}>
          <span style={{ fontSize: 20 }}>🐾</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-primary-light)', fontSize: 15 }}>Karamela AI</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button onClick={exportChat} title="Export chat" style={{ background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, padding: '3px 8px' }}>📥</button>
            <button onClick={clear} title="Clear chat" style={{ background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, padding: '3px 8px' }}>🗑️</button>
            <button onClick={() => setPanelOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20, lineHeight: 0.8 }}>×</button>
          </div>
        </div>

        {/* Model selector */}
        <div style={{ padding: '6px 18px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
          <select value={model} onChange={e => setModel(e.target.value)} style={{
            width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
            borderRadius: 6, color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)',
            padding: '4px 8px', outline: 'none',
          }}>
            <option value="google/gemma-3-27b-it:free">Gemma 3 27B (Free)</option>
            <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 70B (Free)</option>
            <option value="mistralai/mistral-small-3.1-24b-instruct:free">Mistral Small 3.1 (Free)</option>
            <option value="qwen/qwen2.5-72b-instruct">Qwen 2.5 72B</option>
            <option value="anthropic/claude-3.5-haiku">Claude 3.5 Haiku</option>
          </select>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: msg.role === 'user' ? 'rgba(99,102,241,0.15)' : 'var(--bg-card)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.3)' : 'var(--border-subtle)'}`,
                  color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.6,
                }}>
                  {msg.role === 'user' ? msg.content : renderMessage(msg.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex' }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px 12px 12px 2px', padding: '12px 16px', display: 'flex', gap: 5 }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', animation: `pulse 1s ${i * 0.2}s infinite` }} />)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick prompts */}
        {messages.length < 3 && (
          <div style={{ padding: '0 16px 8px', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {['What is an Ingress?', 'Explain CrashLoopBackOff', 'Write a Deployment for nginx', 'How to scale Pods?'].map(p => (
              <button key={p} onClick={() => send(p)} style={{
                background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 20,
                color: 'var(--text-muted)', cursor: 'pointer', fontSize: 10.5, padding: '4px 10px',
                fontFamily: 'var(--font-mono)', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >{p}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask about Kubernetes... (Enter to send)"
            style={{
              flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
              borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
              fontSize: 12.5, padding: '8px 12px', outline: 'none', resize: 'none', height: 44,
            }}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{
            background: loading || !input.trim() ? 'var(--border-subtle)' : 'var(--color-primary)',
            border: 'none', borderRadius: 8, color: 'white', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: 16, padding: '0 14px',
          }}>➤</button>
        </div>
      </div>
    </>
  );
}
