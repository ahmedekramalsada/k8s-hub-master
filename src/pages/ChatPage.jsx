import React from "react";
import { useAI } from "../ai/AIContext.jsx";
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
    const { messages, loading, input, setInput, scrollRef, send, clear, model, setModel, enabled } = useAI();

    if (!enabled) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "calc(100vh - 64px)", background: theme.bgApp, color: theme.text }}>
                <div style={{ textAlign: "center", maxWidth: 400, padding: 40 }}>
                    <div style={{ fontSize: 48, marginBottom: 20 }}>🔒</div>
                    <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, color: theme.accent, marginBottom: 12 }}>AI Not Configured</h2>
                    <p style={{ color: theme.textMuted, fontSize: 13, lineHeight: 1.6 }}>
                        Set <code style={{ color: theme.accent }}>OPENROUTER_API_KEY</code> on the server to enable AI features.
                    </p>
                </div>
            </div>
        );
    }

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
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <select value={model} onChange={e => setModel(e.target.value)} style={{
                        background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8,
                        color: theme.textMuted, fontSize: 12, fontFamily: "var(--font-mono)", padding: "6px 10px",
                    }}>
                        <option value="google/gemma-3-27b-it:free">Gemma 3 27B (Free)</option>
                        <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 70B (Free)</option>
                        <option value="mistralai/mistral-small-3.1-24b-instruct:free">Mistral Small 3.1 (Free)</option>
                        <option value="qwen/qwen2.5-72b-instruct">Qwen 2.5 72B</option>
                        <option value="anthropic/claude-3.5-haiku">Claude 3.5 Haiku</option>
                    </select>
                    <button className="btn btn-ghost" onClick={clear}>🗑️ Clear Chat</button>
                </div>
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
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: "0 10%", borderTop: `1px solid ${theme.border}`, background: theme.bgApp, position: "sticky", bottom: 0, paddingBottom: 32, paddingTop: 16 }}>
                {messages.length < 3 && (
                    <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                        {QUICK_PROMPTS.map(p => (
                            <button key={p} onClick={() => send(p)} style={{ background: theme.bgCard, border: `1px solid ${theme.accent}40`, color: theme.accent, padding: "8px 16px", borderRadius: 24, cursor: "pointer", fontSize: 13, transition: "all 0.2s" }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.15)"}
                                onMouseLeave={e => e.currentTarget.style.background = theme.bgCard}
                            >{p}</button>
                        ))}
                    </div>
                )}
                <form style={{ display: "flex", gap: 12 }} onSubmit={e => { e.preventDefault(); send(); }}>
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
