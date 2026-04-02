import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Link, useParams, useLocation, Navigate } from 'react-router-dom';
import { getModule } from '../config/modules.js';

const loadContent = (id, tab) => {
    return lazy(() => 
        import(`../content/modules/${id}/${tab}.jsx`)
            .catch(() => ({ default: () => <div style={{padding: 'var(--sp-10)', textAlign: 'center'}}><h2>Content not found</h2></div> }))
    );
};

export default function ModulePage() {
    const { id } = useParams();
    const location = useLocation();
    const [contentKey, setContentKey] = useState(Date.now());
    
    const moduleId = parseInt(id, 10);
    const mod = getModule(moduleId);
    
    // Smooth transition on tab change
    useEffect(() => {
        setContentKey(Date.now());
    }, [location.pathname]);
    
    if (!mod) return <Navigate to="/learn" />;
    
    const pathParts = location.pathname.split('/');
    const activeTab = pathParts[pathParts.length - 1] || 'theory';
    
    // Level-based styling
    const levelColor = mod.level === 'Beginner' ? 'var(--color-emerald)' : 
                       mod.level === 'Intermediate' ? 'var(--color-primary-light)' : 
                       'var(--color-secondary-light)';
    const levelBg = mod.level === 'Beginner' ? 'rgba(16,185,129,0.05)' : 
                    mod.level === 'Intermediate' ? 'rgba(99,102,241,0.05)' : 
                    'rgba(139,92,246,0.05)';

    const tabs = [
        { id: 'theory', label: 'Theory', icon: '📖' },
        { id: 'labs', label: 'Labs', icon: '🧪' },
        { id: 'quiz', label: 'Quiz', icon: '❓' },
        { id: 'cheatsheet', label: 'Cheatsheet', icon: '📋' },
        { id: 'scenarios', label: 'Scenarios', icon: '🎯' },
    ];

    const ContentComponent = loadContent(moduleId, activeTab);

    // Save history
    useEffect(() => {
        localStorage.setItem('k8s_last_module', moduleId.toString());
    }, [moduleId]);

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* ── Header ────────────────────────────────────────────── */}
            <div style={{ 
                padding: 'var(--sp-8) var(--sp-10) var(--sp-6)', 
                background: `linear-gradient(135deg, ${levelBg}, transparent)`,
                borderBottom: '1px solid var(--border-subtle)',
                position: 'relative'
            }}>
                <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: 24 }}>{mod.emoji}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Module {mod.id}</span>
                    <span>•</span>
                    <span style={{ color: levelColor, background: `${levelColor}20`, padding: '2px 8px', borderRadius: 'var(--radius-full)', border: `1px solid ${levelColor}40` }}>{mod.level}</span>
                    <span>•</span>
                    <span>{mod.labCount} Labs</span>
                    <span>•</span>
                    <span>~{mod.estTimeMin}m</span>
                </div>
                
                <h1 className="animate-in delay-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-3xl)', marginBottom: 'var(--sp-2)' }}>
                    {mod.title}
                </h1>
                <p className="animate-in delay-2" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', maxWidth: 800, lineHeight: 1.6 }}>
                    {mod.description}
                </p>

                {/* ── Tabs ──────────────────────────────────────── */}
                <div className="animate-in delay-3" style={{ display: 'flex', gap: 'var(--sp-6)', marginTop: 'var(--sp-8)', position: 'relative' }}>
                    {tabs.map(tab => {
                        const active = activeTab === tab.id;
                        return (
                            <Link 
                                key={tab.id} 
                                to={`/learn/modules/${moduleId}/${tab.id}`} 
                                style={{ 
                                    textDecoration: 'none',
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    paddingBottom: 'var(--sp-3)',
                                    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                                    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)',
                                    fontWeight: active ? 600 : 400,
                                    position: 'relative',
                                    transition: 'color var(--duration-fast) ease'
                                }}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                                {active && (
                                    <div style={{ 
                                        position: 'absolute', bottom: -1, left: 0, right: 0, 
                                        height: 2, background: 'var(--color-primary-light)',
                                        borderRadius: 'var(--radius-full)',
                                        boxShadow: '0 -2px 10px rgba(129,140,248,0.5)',
                                        animation: 'fadeInScale var(--duration-fast) var(--ease-out-expo)' 
                                    }} />
                                )}
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* ── Content Area ────────────────────────────────────────── */}
            <div key={contentKey} className="animate-fade" style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-8) var(--sp-10)' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <Suspense fallback={
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', padding: 'var(--sp-10) 0' }}>
                            <div className="skeleton" style={{ height: 40, width: '60%' }} />
                            <div className="skeleton" style={{ height: 20, width: '100%' }} />
                            <div className="skeleton" style={{ height: 20, width: '90%' }} />
                            <div className="skeleton" style={{ height: 20, width: '95%' }} />
                            <div className="skeleton" style={{ height: 200, width: '100%', marginTop: 'var(--sp-6)' }} />
                        </div>
                    }>
                        <ContentComponent />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
