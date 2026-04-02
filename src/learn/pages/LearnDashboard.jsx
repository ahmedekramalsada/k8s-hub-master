import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MODULES } from '../config/modules.js';

export default function LearnDashboard() {
    const [progress, setProgress] = useState(0);
    const [recentModule, setRecentModule] = useState(0);

    // Mock progress from localStorage
    useEffect(() => {
        try {
            const history = JSON.parse(localStorage.getItem('k8s_learn_history') || '{}');
            const completed = Object.keys(history).length;
            const total = MODULES.reduce((acc, mod) => acc + mod.labCount + 1, 0); // +1 for theory
            setProgress(Math.min(100, Math.round((completed / total) * 100)) || 0);

            const last = localStorage.getItem('k8s_last_module');
            if (last) setRecentModule(parseInt(last));
        } catch (e) {
            console.error(e);
        }
    }, []);

    const recentModInfo = MODULES.find(m => m.id === recentModule) || MODULES[0];

    return (
        <div style={{ padding: 'var(--sp-8)', maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            {/* ── Welcome Banner ──────────────────────────────────────── */}
            <div className="glass-panel animate-in" style={{
                padding: 'var(--sp-8)',
                marginBottom: 'var(--sp-8)',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(124,58,237,0.05))',
                border: '1px solid rgba(99,102,241,0.2)',
                display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-6)', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-3xl)', marginBottom: 'var(--sp-2)' }}>
                        Welcome back! 👋
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', maxWidth: 500 }}>
                        You're making great progress on your Kubernetes journey. Keep it up!
                    </p>
                </div>
                
                <div style={{ background: 'var(--bg-card)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', minWidth: 240 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 600 }}>Overall Progress</span>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-light)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{progress}%</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <Link to={`/learn/modules/${recentModInfo.id}/theory`} className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--sp-4)' }}>
                        Continue: {recentModInfo.title}
                    </Link>
                </div>
            </div>

            {/* ── Path Visualization (Mock) ─────────────────────────── */}
            <div className="animate-in delay-1" style={{ marginBottom: 'var(--sp-8)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-4)' }}>Learning Path</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--sp-5)' }}>
                    {MODULES.map((mod, i) => {
                        const levelColor = mod.level === 'Beginner' ? 'var(--color-emerald)' : mod.level === 'Intermediate' ? 'var(--color-primary-light)' : 'var(--color-secondary-light)';
                        const levelBg = mod.level === 'Beginner' ? 'rgba(16,185,129,0.1)' : mod.level === 'Intermediate' ? 'rgba(99,102,241,0.1)' : 'rgba(139,92,246,0.1)';
                        const isActive = mod.id === recentModule;
                        
                        return (
                            <Link key={mod.id} to={`/learn/modules/${mod.id}/theory`} style={{ textDecoration: 'none' }}>
                                <div className={`card card-interactive ${isActive ? 'card-glow' : ''} animate-in delay-${Math.min(i + 2, 8)}`} style={{ 
                                    height: '100%', display: 'flex', flexDirection: 'column',
                                    borderColor: isActive ? 'rgba(99,102,241,0.3)' : 'var(--border-subtle)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-3)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                                            <div style={{ 
                                                width: 48, height: 48, borderRadius: 'var(--radius-md)', 
                                                background: 'var(--bg-panel)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 24, border: '1px solid var(--border-default)'
                                            }}>{mod.emoji}</div>
                                            <div>
                                                <div style={{ color: 'var(--text-dim)', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)' }}>Module {mod.id}</div>
                                                <div style={{ color: levelColor, background: levelBg, padding: '2px 6px', borderRadius: 'var(--radius-full)', fontSize: 10, fontFamily: 'var(--font-mono)', display: 'inline-block', marginTop: 2 }}>{mod.level}</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <h3 style={{ color: 'var(--text-primary)', fontSize: 'var(--text-lg)', marginBottom: 'var(--sp-2)', fontWeight: 600 }}>{mod.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', flex: 1, marginBottom: 'var(--sp-4)', lineHeight: 1.5 }}>{mod.description}</p>
                                    
                                    <div style={{ display: 'flex', gap: 'var(--sp-4)', borderTop: '1px solid var(--border-default)', paddingTop: 'var(--sp-3)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>⏱️ {mod.estTimeMin}m</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>🧪 {mod.labCount} Labs</span>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
