import React, { useState, useEffect } from 'react';
import { MODULES } from '../config/modules.js';

import { useNavigate } from 'react-router-dom';

export default function Navbar({ termVisible, toggleTerm }) {
    const [progress, setProgress] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const navigate = useNavigate();

    // Mock progress calculation
    useEffect(() => {
        try {
            const history = JSON.parse(localStorage.getItem('k8s_learn_history') || '{}');
            const completed = Object.keys(history).length;
            const total = MODULES.reduce((acc, mod) => acc + mod.labCount + 1, 0);
            setProgress(Math.min(100, Math.round((completed / total) * 100)) || 0);
        } catch (e) {
            console.error(e);
        }
    }, [/* would depend on history context in real app */]);

    // Compute search results
    const searchResults = searchQuery.trim() === "" ? [] : MODULES.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.shortTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <header style={{ 
            height: 64, 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            padding: '0 var(--sp-6)', 
            borderBottom: '1px solid var(--border-subtle)', 
            background: 'var(--bg-panel)' 
        }}>
            {/* Search Bar (Functional) */}
            <div style={{ position: 'relative', width: 340 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                <input 
                    className="input" 
                    type="text" 
                    placeholder="Search docs, labs, or commands... (Ctrl+K)" 
                    style={{ paddingLeft: 36, background: 'var(--bg-card)', width: '100%' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                />
                
                {/* Search Dropdown Results */}
                {isFocused && searchQuery.trim() !== "" && (
                    <div style={{
                        position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                        background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-lg)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                        zIndex: 100, overflow: 'hidden', animation: 'fadeInDown 0.2s ease'
                    }}>
                        {searchResults.length === 0 ? (
                            <div style={{ padding: 'var(--sp-4)', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
                                No modules or labs found.
                            </div>
                        ) : (
                            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                                {searchResults.map(mod => (
                                    <div 
                                        key={mod.id}
                                        onClick={() => {
                                            navigate(`/learn/modules/${mod.id}/theory`);
                                            setSearchQuery("");
                                            setIsFocused(false);
                                        }}
                                        style={{
                                            padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)',
                                            cursor: 'pointer', transition: 'background 0.2s',
                                            display: 'flex', alignItems: 'flex-start', gap: 10
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <span style={{ fontSize: 18 }}>{mod.emoji}</span>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{mod.title}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                                                {mod.description}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right Actions */}
            <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'center' }}>
                
                {/* Global Progress Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginRight: 'var(--sp-4)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Progress</div>
                    <div style={{ width: 100, height: 6, background: 'var(--bg-card)', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--color-primary)', transition: 'width var(--duration-slow) ease' }}></div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-primary-light)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{progress}%</div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--sp-1)' }}>
                    <button 
                        className={`btn ${termVisible ? 'btn-primary' : 'btn-ghost'} btn-icon`}
                        onClick={toggleTerm}
                        title="Toggle Terminal Panel"
                        style={{ fontSize: 18 }}
                    >
                        ⌨️
                    </button>
                </div>
                
                {/* User Avatar mock */}
                <div style={{ 
                    width: 36, height: 36, 
                    borderRadius: 'var(--radius-full)', 
                    background: 'var(--color-secondary-light)', 
                    color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 'var(--text-sm)',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    JD
                </div>
            </div>
        </header>
    );
}
