import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

// Helper styles (matching Generator AI Theme)
const theme = {
  bgApp: "var(--bg-app, #060610)",
  bgCard: "var(--bg-card, #0a0a18)",
  bgInput: "var(--bg-input, #050510)",
  border: "var(--border-subtle, #1a1a2e)",
  text: "var(--text-primary, #e2e8f0)",
  textMuted: "var(--text-muted, #94a3b8)",
  textDim: "var(--text-dim, #64748b)",
  accent: "var(--color-primary, #818cf8)",
  accentSoft: "var(--color-primary-light, rgba(99,102,241,0.15))",
  userMsgBg: "rgba(99,102,241,0.15)",
  aiMsgBg: "rgba(30,41,59,0.5)",
};

const QUICK_PROMPTS = [
  "What is an Ingress controller?",
  "Explain CrashLoopBackOff",
  "Write a Deployment for nginx",
  "How to scale Pods?"
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('k8s_ai_history');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return [{ role: "assistant", content: "Hi! I'm Karamela 🐾, your K8s AI. Ask me about resources, errors, or commands!" }];
  });

  useEffect(() => {
    localStorage.setItem('k8s_ai_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, loading]);

  const onSend = async (text) => {
    if (!text.trim() || loading) return;
    const newMsg = { role: "user", content: text };
    setMessages(p => [...p, newMsg]);
    setInput("");
    setLoading(true);

    try {
      const msgHistory = [...messages.slice(-10), newMsg].map(m => ({ role: m.role, content: m.content }));
      msgHistory.unshift({ role: "system", content: "You are Karamela, a helpful Kubernetes AI assistant. Use markdown." });

      const res = await fetch("/api/ai/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgHistory })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages(p => [...p, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(p => [...p, { role: "assistant", content: "⚠️ Network error connecting to AI API." }]);
    } finally {
      setLoading(false);
    }
  };

  const onClear = () => {
    setMessages([{ role: "assistant", content: "Hi! I'm Karamela 🐾, your K8s AI. Ask me about resources, errors, or commands!" }]);
  };

  return (
    <>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed", bottom: 20, right: 20, zIndex: 9999, width: 56, height: 56,
          background: theme.accent, borderRadius: "50%", boxShadow: "0 10px 30px rgba(99,102,241,0.5)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
          transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)", transform: isOpen ? "scale(0)" : "scale(1)"
        }}
      >🐾</div>

      <div style={{
        position: "fixed", top: 20, bottom: 20, right: isOpen ? 20 : -420, width: 400, zIndex: 10000,
        background: theme.bgApp, border: `1px solid ${theme.border}`, borderRadius: "var(--radius-xl)",
        boxShadow: "-10px 0 40px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", overflow: "hidden",
        transition: "right 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: theme.bgCard }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24, filter: "drop-shadow(0 2px 4px rgba(99,102,241,0.4))" }}>🐾</span>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, color: theme.accent, fontSize: 16, letterSpacing: "-0.02em" }}>Karamela AI</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClear} title="Clear Chat" style={{ background: "transparent", border: "none", color: theme.textMuted, cursor: "pointer", fontSize: 16 }}>🗑️</button>
            <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", color: theme.textMuted, cursor: "pointer", fontSize: 24, lineHeight: 0.8 }}>×</button>
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
              <div style={{ color: m.role === "user" ? theme.accent : theme.textMuted, fontSize: 10, fontWeight: 700, marginBottom: 4, marginLeft: 2 }}>{m.role === "user" ? "YOU" : "KARAMELA"}</div>
              <div style={{ background: m.role === "user" ? theme.userMsgBg : theme.aiMsgBg, border: `1px solid ${m.role === "user" ? theme.accent + "40" : theme.border}`, borderRadius: m.role === "user" ? "12px 12px 0 12px" : "12px 12px 12px 0", padding: "10px 14px", color: theme.text, fontSize: 13, lineHeight: 1.6, fontFamily: "var(--font-sans)", whiteSpace: "pre-wrap" }}>
                {m.role === "user" ? m.content : (
                  <ReactMarkdown components={{
                    code({ inline, className, children }) {
                      return inline ? 
                        <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 5px", borderRadius: 4, color: "#a0f0c0", fontFamily: "var(--font-mono)", fontSize: "0.9em" }}>{children}</code> : 
                        <pre style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${theme.border}`, padding: 12, borderRadius: 8, overflowX: "auto", color: "#a0f0c0", fontFamily: "var(--font-mono)", fontSize: "11.5px", marginTop: 8, marginBottom: 8 }}><code>{children}</code></pre>
                    }
                  }}>
                    {m.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
              <div style={{ background: theme.aiMsgBg, border: `1px solid ${theme.border}`, borderRadius: "12px 12px 12px 0", padding: "10px 14px", color: theme.textMuted, fontSize: 13 }}>🐾 Typing...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length < 3 && (
          <div style={{ padding: "0 20px 12px", display: "flex", flexWrap: "wrap", gap: 6 }}>
            {QUICK_PROMPTS.map(p => (
              <button key={p} onClick={() => onSend(p)} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, color: theme.textMuted, fontSize: 10.5, padding: "5px 10px", borderRadius: 20, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = theme.accent; e.currentTarget.style.borderColor = theme.accent + "60"; }}
                onMouseLeave={e => { e.currentTarget.style.color = theme.textMuted; e.currentTarget.style.borderColor = theme.border; }}
              >{p}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${theme.border}`, background: theme.bgCard }}>
          <form style={{ display: "flex", gap: 10 }} onSubmit={e => { e.preventDefault(); onSend(input); }}>
            <input className="input" placeholder="Ask about Kubernetes..." value={input} onChange={e => setInput(e.target.value)} style={{ flex: 1 }} />
            <button className="btn btn-primary" type="submit" disabled={loading || !input.trim()} style={{ width: 44, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 16 }}>🚀</span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
