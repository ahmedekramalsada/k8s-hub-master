import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer.jsx';

const MODULES = [
    { id: 0, emoji: "🐳", title: "Docker Fundamentals", level: "Beginner", estTimeMin: 45, labCount: 6 },
    { id: 1, emoji: "📦", title: "Core Concepts", level: "Beginner", estTimeMin: 45, labCount: 5 },
    { id: 2, emoji: "🌐", title: "Networking", level: "Intermediate", estTimeMin: 45, labCount: 4 },
    { id: 3, emoji: "💾", title: "Storage", level: "Intermediate", estTimeMin: 30, labCount: 3 },
    { id: 4, emoji: "🛡️", title: "Security & RBAC", level: "Advanced", estTimeMin: 45, labCount: 4 },
    { id: 5, emoji: "⚙️", title: "Advanced Control", level: "Advanced", estTimeMin: 45, labCount: 4 },
    { id: 6, emoji: "⚓", title: "Helm Fundamentals", level: "Intermediate", estTimeMin: 40, labCount: 5 },
];

const STATS = [
    { value: "7", label: "Modules" },
    { value: "31", label: "Hands-on Labs" },
    { value: "20+", label: "Resource Types" },
    { value: "AI", label: "Powered" },
];

const FEATURES = [
    {
        icon: '⚡', title: 'YAML Generator',
        desc: 'Generate Deployments, Services, Ingress, HPA, Secrets, and 20+ Kubernetes resource types with intelligent defaults and production-ready best practices.',
        color: '#6366f1', link: '/generator',
        gradient: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.03))',
    },
    {
        icon: '📚', title: 'Interactive Learning',
        desc: '7 comprehensive modules from Docker basics to Helm mastery. Theory, hands-on labs, quizzes, cheat sheets, and real-world troubleshooting scenarios.',
        color: '#10b981', link: '/learn',
        gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.03))',
    },
    {
        icon: '🤖', title: 'AI Assistant',
        desc: 'Built-in AI tutor powered by OpenRouter. Review YAML, debug cluster issues, learn concepts — all with context-aware, conversational help.',
        color: '#a78bfa', link: '/chat',
        gradient: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(167,139,250,0.03))',
    },
];

const TECH_STACK = [
    { icon: '☸️', name: 'Kubernetes' },
    { icon: '🐳', name: 'Docker' },
    { icon: '⛵', name: 'Helm' },
    { icon: '🔄', name: 'ArgoCD' },
    { icon: '🛡️', name: 'Vault' },
    { icon: '📊', name: 'Prometheus' },
];

const HOW_IT_WORKS = [
    {
        step: '01',
        icon: '🎯',
        title: 'Choose a Resource',
        desc: 'Pick from 25+ Kubernetes resource types — Deployments, Services, Ingress, HPA, Secrets, and more.',
        color: '#6366f1',
    },
    {
        step: '02',
        icon: '⚙️',
        title: 'Configure with Forms',
        desc: 'Fill in intuitive forms with intelligent defaults, image detection, and real-time validation.',
        color: '#10b981',
    },
    {
        step: '03',
        icon: '🚀',
        title: 'Deploy Your YAML',
        desc: 'Get production-ready YAML with security scoring. Download, bundle, or export as Helm charts.',
        color: '#a78bfa',
    },
];

/* ── Animated Grid Background ──────────────────────────────────────── */
function GridBackground() {
    return (
        <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
            {/* Radial gradient orbs */}
            <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)', top: '-20%', left: '-10%', animation: 'float 25s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 65%)', bottom: '-15%', right: '-5%', animation: 'float-slow 30s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 65%)', top: '35%', right: '15%', animation: 'float 20s ease-in-out infinite 3s' }} />
            {/* Dot grid using CSS gradient */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(rgba(99,102,241,0.08) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                mask: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)',
                WebkitMask: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)',
            }} />
        </div>
    );
}

/* ── Kubernetes Wheel SVG ──────────────────────────────────────────── */
function K8sWheel() {
    return (
        <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 32px' }}>
            <svg viewBox="0 0 120 120" width="120" height="120" style={{ animation: 'rotate-slow 40s linear infinite' }}>
                {/* Outer ring */}
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="1.5" />
                <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="1" strokeDasharray="4 6" />
                {/* Center K8s wheel hub */}
                <circle cx="60" cy="60" r="14" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5" />
                <circle cx="60" cy="60" r="4" fill="#6366f1" />
                {/* 7 spokes */}
                {[0,1,2,3,4,5,6].map(i => {
                    const angle = (i * 360 / 7 - 90) * Math.PI / 180;
                    const x1 = 60 + Math.cos(angle) * 16;
                    const y1 = 60 + Math.sin(angle) * 16;
                    const x2 = 60 + Math.cos(angle) * 40;
                    const y2 = 60 + Math.sin(angle) * 40;
                    const cx = 60 + Math.cos(angle) * 44;
                    const cy = 60 + Math.sin(angle) * 44;
                    return (
                        <g key={i}>
                            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" />
                            <circle cx={cx} cy={cy} r="5" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.35)" strokeWidth="1" />
                        </g>
                    );
                })}
            </svg>
            {/* Orbiting dot */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                width: 6, height: 6, borderRadius: '50%',
                background: '#818cf8', boxShadow: '0 0 12px rgba(129,140,248,0.6)',
                animation: 'orbit 8s linear infinite',
                transformOrigin: '0 0',
            }} />
        </div>
    );
}

/* ── Counter Animation Hook ────────────────────────────────────────── */
function useCountUp(target, duration = 1500) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started) setStarted(true);
        }, { threshold: 0.5 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [started]);

    useEffect(() => {
        if (!started) return;
        const num = parseInt(target);
        if (isNaN(num)) { setCount(target); return; }
        let start = 0;
        const step = Math.ceil(num / (duration / 16));
        const timer = setInterval(() => {
            start += step;
            if (start >= num) { setCount(num); clearInterval(timer); }
            else setCount(start);
        }, 16);
        return () => clearInterval(timer);
    }, [started, target, duration]);

    return [ref, typeof count === 'number' ? count : count];
}

function StatItem({ value, label, delay }) {
    const [ref, count] = useCountUp(value);
    return (
        <div ref={ref} className={`animate-in delay-${delay}`} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 'var(--text-2xl)', color: 'var(--color-primary-light)', lineHeight: 1 }}>
                {typeof count === 'number' ? count : value}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{label}</div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
    const [hovered, setHovered] = useState(null);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)', fontFamily: "var(--font-body)" }}>
            <GridBackground />



            {/* ── Hero ────────────────────────────────────────────── */}
            <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: 'var(--sp-20) var(--sp-10) var(--sp-16)', maxWidth: 950, margin: '0 auto' }}>
                <K8sWheel />

                <div className="badge badge-primary animate-in" style={{ marginBottom: 'var(--sp-6)', padding: '6px 18px' }}>
                    🚀 All-in-one Kubernetes Platform
                </div>

                <h1 className="animate-in delay-1" style={{
                    fontFamily: "var(--font-display)", fontWeight: 800,
                    fontSize: 'var(--text-hero)', lineHeight: 1.08,
                    margin: '0 0 var(--sp-5)',
                }}>
                    <span className="text-gradient">Generate & Learn</span>
                    <br />
                    <span className="text-gradient">Kubernetes</span>
                </h1>

                <p className="animate-in delay-2" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', lineHeight: 1.7, maxWidth: 640, margin: '0 auto var(--sp-10)' }}>
                    Generate production-ready YAML manifests with AI assistance, or master Kubernetes through interactive modules with hands-on labs and real-world scenarios.
                </p>

                <div className="animate-in delay-3" style={{ display: 'flex', gap: 'var(--sp-4)', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Link to="/generator" className="btn btn-primary btn-lg" style={{ boxShadow: '0 4px 24px rgba(99,102,241,0.35)' }}>
                        ⚡ YAML Generator
                    </Link>
                    <Link to="/learn" className="btn btn-ghost btn-lg">
                        📚 Start Learning
                    </Link>
                    <a href="https://github.com/ahmedekramalsada/k8s-hub-master" target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none', padding: '10px 18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', transition: 'all 150ms ease' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        GitHub
                    </a>
                </div>
            </section>

            {/* ── Stats Bar ───────────────────────────────────────── */}
            <section className="container" style={{ position: 'relative', zIndex: 1, marginBottom: 'var(--sp-20)' }}>
                <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--sp-4)', padding: 'var(--sp-6) var(--sp-8)' }}>
                    {STATS.map((s, i) => <StatItem key={s.label} value={s.value} label={s.label} delay={i + 1} />)}
                </div>
            </section>

            {/* ── Feature Cards ────────────────────────────────────── */}
            <section className="container" style={{ position: 'relative', zIndex: 1, marginBottom: 'var(--sp-20)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--sp-5)' }}>
                    {FEATURES.map((card, i) => (
                        <Link key={i} to={card.link} style={{ textDecoration: 'none' }}>
                            <div
                                className={`card card-interactive animate-in delay-${i + 2}`}
                                onMouseEnter={() => setHovered(i)}
                                onMouseLeave={() => setHovered(null)}
                                style={{
                                    background: hovered === i ? card.gradient : 'var(--bg-card)',
                                    borderColor: hovered === i ? `${card.color}30` : 'var(--border-subtle)',
                                    boxShadow: hovered === i ? `0 8px 40px ${card.color}12` : 'none',
                                    height: '100%',
                                }}
                            >
                                <div style={{
                                    width: 48, height: 48, borderRadius: 'var(--radius-md)',
                                    background: `${card.color}12`, border: `1px solid ${card.color}25`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 24, marginBottom: 'var(--sp-4)',
                                    transition: 'all var(--duration-normal) ease',
                                    boxShadow: hovered === i ? `0 0 20px ${card.color}20` : 'none',
                                }}>
                                    {card.icon}
                                </div>
                                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: card.color, fontSize: 'var(--text-lg)', margin: '0 0 var(--sp-2)' }}>
                                    {card.title}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7, margin: 0 }}>
                                    {card.desc}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── How It Works ────────────────────────────────────── */}
            <section className="container" style={{ position: 'relative', zIndex: 1, marginBottom: 'var(--sp-20)' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--sp-10)' }}>
                    <h2 className="text-gradient animate-in" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 'var(--text-3xl)', marginBottom: 'var(--sp-2)' }}>
                        How It Works
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
                        Three steps from zero to production-ready Kubernetes manifests
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-5)', position: 'relative' }}>
                    {HOW_IT_WORKS.map((item, i) => (
                        <div key={item.step} className={`card animate-in delay-${i + 1}`} style={{ position: 'relative', padding: 'var(--sp-8) var(--sp-6)', textAlign: 'center' }}>
                            {/* Step number */}
                            <div style={{
                                position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
                                background: item.color, color: 'white', fontSize: 11, fontWeight: 800,
                                padding: '4px 14px', borderRadius: 'var(--radius-full)',
                                fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
                            }}>{item.step}</div>

                            <div style={{ fontSize: 40, marginBottom: 'var(--sp-4)' }}>{item.icon}</div>
                            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: item.color, fontSize: 'var(--text-lg)', margin: '0 0 var(--sp-2)' }}>
                                {item.title}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7, margin: 0 }}>
                                {item.desc}
                            </p>

                            {/* Arrow connector (hidden on mobile) */}
                            {i < HOW_IT_WORKS.length - 1 && (
                                <div className="hide-mobile" style={{
                                    position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)',
                                    color: 'var(--text-dim)', fontSize: 20, zIndex: 2,
                                }}>→</div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Learning Path Preview ───────────────────────────── */}
            <section className="container" style={{ position: 'relative', zIndex: 1, marginBottom: 'var(--sp-20)' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--sp-10)' }}>
                    <h2 className="text-gradient animate-in" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 'var(--text-3xl)', marginBottom: 'var(--sp-2)' }}>
                        Learning Path
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
                        7 modules • 31 labs • From zero to production-ready
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--sp-4)' }}>
                    {MODULES.map((mod, i) => {
                        const levelColor = mod.level === 'Beginner' ? 'var(--color-emerald)' : mod.level === 'Intermediate' ? 'var(--color-primary-light)' : 'var(--color-secondary-light)';
                        const levelBg = mod.level === 'Beginner' ? 'rgba(16,185,129,0.12)' : mod.level === 'Intermediate' ? 'rgba(99,102,241,0.12)' : 'rgba(139,92,246,0.12)';
                        const levelBorder = mod.level === 'Beginner' ? 'rgba(16,185,129,0.25)' : mod.level === 'Intermediate' ? 'rgba(99,102,241,0.25)' : 'rgba(139,92,246,0.25)';
                        return (
                            <Link key={mod.id} to={`/learn/modules/${mod.id}/theory`} style={{ textDecoration: 'none' }}>
                                <div className={`card card-interactive animate-in delay-${Math.min(i + 1, 8)}`} style={{ padding: 'var(--sp-5)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
                                        <span style={{ fontSize: 24 }}>{mod.emoji}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>{mod.title}</div>
                                            <div style={{ color: 'var(--text-dim)', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)' }}>Module {mod.id}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                                        <span style={{ fontSize: 'var(--text-xs)', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: levelBg, color: levelColor, border: `1px solid ${levelBorder}`, fontFamily: 'var(--font-mono)' }}>
                                            {mod.level}
                                        </span>
                                        <span className="badge" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>
                                            {mod.labCount} labs • {mod.estTimeMin}min
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* ── Tech Stack / Trust Bar ───────────────────────────── */}
            <section className="container" style={{ position: 'relative', zIndex: 1, marginBottom: 'var(--sp-20)' }}>
                <div className="glass-panel" style={{ textAlign: 'center', padding: 'var(--sp-10)' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--text-primary)', marginBottom: 'var(--sp-2)' }}>
                        Built for the Modern Cloud Native Stack
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-8)' }}>
                        Everything you need to master Kubernetes, from containers to production.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-10)', flexWrap: 'wrap' }}>
                        {TECH_STACK.map(t => (
                            <div key={t.name} className="animate-in" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 32, marginBottom: 'var(--sp-2)' }}>{t.icon}</div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{t.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Section ─────────────────────────────────────── */}
            <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: 'var(--sp-16) var(--sp-10)', background: 'linear-gradient(180deg, transparent, rgba(99,102,241,0.04), transparent)' }}>
                <h2 className="text-gradient" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-3xl)', marginBottom: 'var(--sp-4)' }}>
                    Ready to Master Kubernetes?
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', maxWidth: 500, margin: '0 auto var(--sp-8)' }}>
                    Start generating production-ready manifests or dive into interactive learning — both powered by AI.
                </p>
                <div style={{ display: 'flex', gap: 'var(--sp-4)', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Link to="/generator" className="btn btn-primary btn-lg">Get Started Free ⚡</Link>
                    <Link to="/learn" className="btn btn-outline btn-lg">Browse Modules →</Link>
                    <a href="https://github.com/ahmedekramalsada/k8s-hub-master" target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none', padding: '12px 22px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', transition: 'all 150ms ease' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        Star on GitHub
                    </a>
                </div>
            </section>

            {/* ── Footer ──────────────────────────────────────────── */}
            <Footer />
        </div>
    );
}
