import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MODULES } from '../config/modules.js';

const TABS = [
    { key: 'theory', icon: '📖', label: 'Theory' },
    { key: 'labs', icon: '🧪', label: 'Labs' },
    { key: 'quiz', icon: '❓', label: 'Quiz' },
    { key: 'cheatsheet', icon: '📋', label: 'Cheatsheet' },
    { key: 'scenarios', icon: '🎯', label: 'Scenarios' },
];

export default function Sidebar() {
    const location = useLocation();
    const [expanded, setExpanded] = useState(() => {
        // Auto-expand the module that matches the current URL
        const match = location.pathname.match(/\/learn\/modules\/(\d+)/);
        return match ? parseInt(match[1]) : null;
    });

    const isActive = (path) => location.pathname === path;
    const isModuleActive = (modId) => location.pathname.includes(`/modules/${modId}`);

    return (
        <aside style={{
            width: 280, flexShrink: 0,
            background: 'var(--bg-panel)',
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex', flexDirection: 'column',
            height: '100%', overflow: 'hidden',
        }}>
            {/* Dashboard link */}
            <div style={{ padding: 'var(--sp-4) var(--sp-5)' }}>
                <Link
                    to="/learn"
                    style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: 'var(--sp-2) var(--sp-3)',
                        borderRadius: 'var(--radius-sm)',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 600,
                        color: isActive('/learn') ? 'var(--color-primary-light)' : 'var(--text-primary)',
                        background: isActive('/learn') ? 'rgba(99,102,241,0.1)' : 'transparent',
                        transition: 'all var(--duration-fast) ease',
                    }}
                >
                    <span style={{ fontSize: 18 }}>🏠</span>
                    Dashboard
                </Link>
            </div>

            {/* Module label */}
            <div style={{
                padding: '0 var(--sp-5)',
                marginBottom: 'var(--sp-2)',
                color: 'var(--text-dim)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
            }}>
                Modules
            </div>

            {/* Module list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 var(--sp-3) var(--sp-4)' }}>
                {MODULES.map(mod => {
                    const isOpen = expanded === mod.id;
                    const isCurrentModule = isModuleActive(mod.id);
                    const levelColor = mod.level === 'Beginner' ? 'var(--color-emerald)' : mod.level === 'Intermediate' ? 'var(--color-primary-light)' : 'var(--color-secondary-light)';

                    return (
                        <div key={mod.id} style={{ marginBottom: 2 }}>
                            {/* Module header */}
                            <button
                                onClick={() => setExpanded(isOpen ? null : mod.id)}
                                style={{
                                    width: '100%',
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '8px 10px',
                                    border: isCurrentModule ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                                    borderRadius: 'var(--radius-sm)',
                                    background: isCurrentModule ? 'rgba(99,102,241,0.06)' : 'transparent',
                                    color: isCurrentModule ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontFamily: 'var(--font-body)',
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: isCurrentModule ? 600 : 400,
                                    transition: 'all var(--duration-fast) ease',
                                }}
                            >
                                <span style={{ fontSize: 16, flexShrink: 0 }}>{mod.emoji}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {mod.title}
                                    </div>
                                    <div style={{ fontSize: 11, color: levelColor, marginTop: 1, fontFamily: 'var(--font-mono)' }}>
                                        {mod.level}
                                    </div>
                                </div>
                                <span style={{
                                    fontSize: 8, color: 'var(--text-dim)',
                                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform var(--duration-fast) ease',
                                }}>▼</span>
                            </button>

                            {/* Sub-tabs (expandable) */}
                            {isOpen && (
                                <div style={{
                                    paddingLeft: 28,
                                    paddingTop: 2,
                                    paddingBottom: 4,
                                    animation: 'fadeIn var(--duration-fast) ease',
                                }}>
                                    {TABS.map(tab => {
                                        const path = `/learn/modules/${mod.id}/${tab.key}`;
                                        const active = isActive(path);
                                        return (
                                            <Link
                                                key={tab.key}
                                                to={path}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 8,
                                                    padding: '5px 10px',
                                                    borderRadius: 'var(--radius-sm)',
                                                    textDecoration: 'none',
                                                    fontSize: 12,
                                                    fontFamily: 'var(--font-mono)',
                                                    color: active ? 'var(--color-primary-light)' : 'var(--text-muted)',
                                                    background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
                                                    fontWeight: active ? 600 : 400,
                                                    transition: 'all var(--duration-fast) ease',
                                                    marginBottom: 1,
                                                }}
                                            >
                                                <span style={{ fontSize: 12 }}>{tab.icon}</span>
                                                {tab.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Resources / Interview Prep */}
            <div style={{ padding: '0 var(--sp-3) var(--sp-2)' }}>
                <Link
                    to="/learn/resources"
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        textDecoration: 'none',
                        fontSize: 'var(--text-xs)',
                        fontFamily: 'var(--font-body)',
                        fontWeight: isActive('/learn/resources') ? 600 : 400,
                        color: isActive('/learn/resources') ? 'var(--color-primary-light)' : 'var(--text-secondary)',
                        background: isActive('/learn/resources') ? 'rgba(99,102,241,0.06)' : 'transparent',
                        border: isActive('/learn/resources') ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                        transition: 'all var(--duration-fast) ease',
                    }}
                >
                    <span style={{ fontSize: 16 }}>📝</span>
                    <div>
                        <div>Interview Prep</div>
                        <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>Cheatsheet</div>
                    </div>
                </Link>
            </div>

            {/* Back to Hub */}
            <div style={{ padding: 'var(--sp-3) var(--sp-4)', borderTop: '1px solid var(--border-subtle)' }}>
                <Link
                    to="/"
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: 'var(--sp-2) var(--sp-3)',
                        borderRadius: 'var(--radius-sm)',
                        textDecoration: 'none',
                        fontSize: 'var(--text-xs)',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)',
                        transition: 'color var(--duration-fast) ease',
                    }}
                >
                    ← Back to Hub
                </Link>
            </div>
        </aside>
    );
}
