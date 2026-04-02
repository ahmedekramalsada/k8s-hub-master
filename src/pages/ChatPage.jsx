import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

const theme = {
    bgApp: "var(--bg-app, #060610)",
    bgCard: "var(--bg-card, #0a0a18)",
    bgInput: "var(--bg-input, #050510)",
    border: "var(--border-subtle, #1a1a2e)",
    text: "var(--text-primary, #e2e8f0)",
    textMuted: "var(--text-muted, #94a3b8)",
    accent: "var(--color-primary, #818cf8)",
    userMsgBg: "rgba(99,102,241,0.15)",
    aiMsgBg: "var(--bg-card, #0a0a18)",
};

const QUICK_PROMPTS = [
    "What is an Ingress controller?",
    "Explain CrashLoopBackOff",
    "Write a Deployment for nginx",
    "How to scale Pods?"
];

export default function ChatPage() {
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem('k8s_ai_history_full');
            if (saved) return JSON.parse(saved);
        } catch (e) { }
        return [{ role: "assistant", content: "Hi! I'm Karamela 🐾, your Kubernetes AI assistant. How can I help you today?" }];
    });

    useEffect(() => {
        localStorage.setItem('k8s_ai_history_full', JSON.stringify(messages));
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

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
        setMessages([{ role: "assistant", content: "Hi! I'm Karamela 🐾, your Kubernetes AI assistant. How can I help you today?" }]);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", background: theme.bgApp, color: theme.text }}>
            
            {/* Header */}
            <header style={{ padding: "16px 32px", borderBottom: `1px solid ${theme.border}`, background: theme.bgCard, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 28 }}>🐾</span>
                    <div>
                        <h1 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 20, color: theme.accent }}>Karamela AI</h1>
                        <span style={{ fontSize: 12, color: theme.textMuted }}>Your intelligent Kubernetes companion</span>
                    </div>
                </div>
                <button className="btn btn-ghost" onClick={onClear}>🗑️ Clear Chat</button>
            </header>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "32px 10%", display: "flex", flexDirection: "column", gap: 24, paddingBottom: 60 }}>
                {messages.map((m, i) => (
                    <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", opacity: 0, animation: "fadeIn 0.3s forwards ease-out" }}>
                        <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: "50%", background: m.role === "user" ? theme.accent : "#222", border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                            {m.role === "user" ? "👤" : "🐾"}
                        </div>
                        <div style={{ flex: 1, maxWidth: "80%" }}>
                            <div style={{ color: theme.textMuted, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                                {m.role === "user" ? "YOU" : "KARAMELA"}
                            </div>
                            <div style={{ 
                                background: m.role === "user" ? theme.userMsgBg : theme.aiMsgBg,
                                border: `1px solid ${m.role === "user" ? theme.accent + "40" : theme.border}`,
                                padding: "16px 20px", 
                                borderRadius: "12px", 
                                fontSize: 14, 
                                lineHeight: 1.6, 
                                fontFamily: "var(--font-sans)",
                                letterSpacing: "-0.01em"
                            }}>
                                {m.role === "user" ? m.content : (
                                    <ReactMarkdown components={{
                                        code({ inline, className, children }) {
                                            return inline ? 
                                                <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: 4, color: "#a0f0c0", fontFamily: "var(--font-mono)", fontSize: "0.9em" }}>{children}</code> : 
                                                <div style={{ position: "relative", marginTop: 12, marginBottom: 12 }}>
                                                    <pre style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${theme.border}`, padding: 16, borderRadius: 8, overflowX: "auto", color: "#a0f0c0", fontFamily: "var(--font-mono)", fontSize: "12px" }}><code>{children}</code></pre>
                                                </div>
                                        }
                                    }}>
                                        {m.content}
                                    </ReactMarkdown>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                
                {loading && (
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", opacity: 0, animation: "fadeIn 0.3s forwards ease-out" }}>
                        <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: "50%", background: "#222", border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🐾</div>
                        <div style={{ flex: 1, maxWidth: "80%" }}>
                            <div style={{ color: theme.textMuted, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>KARAMELA</div>
                            <div style={{ background: theme.aiMsgBg, border: `1px solid ${theme.border}`, padding: "16px 20px", borderRadius: "12px", fontSize: 14, color: theme.textMuted }}>
                                <div style={{ display: "flex", gap: 6 }}>
                                    {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: theme.accent, animation: `pulse 1s ${i * 0.2}s infinite` }} />)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: "0 10%", borderTop: `1px solid ${theme.border}`, background: theme.bgApp, position: "sticky", bottom: 0, paddingBottom: 32, paddingTop: 16 }}>
                {messages.length < 3 && (
                    <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                        {QUICK_PROMPTS.map(p => (
                            <button key={p} onClick={() => onSend(p)} style={{ background: theme.bgCard, border: `1px solid ${theme.accent}40`, color: theme.accent, padding: "8px 16px", borderRadius: 24, cursor: "pointer", fontSize: 13, transition: "all 0.2s" }}
                                onMouseEnter={e => e.currentTarget.style.background = theme.accentSoft}
                                onMouseLeave={e => e.currentTarget.style.background = theme.bgCard}
                            >{p}</button>
                        ))}
                    </div>
                )}
                <form style={{ display: "flex", gap: 12 }} onSubmit={e => { e.preventDefault(); onSend(input); }}>
                    <input 
                        className="input" 
                        placeholder="Type your message here... Ask about manifests, troubleshooting, or K8s concepts" 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        style={{ flex: 1, padding: "16px 24px", fontSize: 15, borderRadius: 24 }} 
                    />
                    <button 
                        className="btn btn-primary" 
                        type="submit" 
                        disabled={loading || !input.trim()} 
                        style={{ width: 56, height: 56, borderRadius: "50%", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                        <span style={{ fontSize: 20 }}>🚀</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
