import React, { useState } from 'react';
import { useToast } from '../../components/ToastContext.jsx';

export default function LabRenderer({ title, description, tasks }) {
    const [completed, setCompleted] = useState(new Set());
    const { showToast } = useToast();

    const toggleTask = (id) => {
        setCompleted(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const copyCommand = (cmd) => {
        navigator.clipboard.writeText(cmd);
        showToast("Command copied to clipboard!", "success");
    };

    return (
        <section className="content-block">
            <h2>{title || "Hands-on Labs"}</h2>
            <p>{description}</p>
            
            <div className="task-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                {tasks.map((task, idx) => {
                    const isDone = completed.has(task.id);
                    return (
                        <div 
                            key={task.id} 
                            style={{
                                display: 'flex', gap: '16px', padding: '20px',
                                background: isDone ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card)',
                                border: `1px solid ${isDone ? 'var(--color-emerald)' : 'var(--border-subtle)'}`,
                                borderRadius: 'var(--radius-lg)',
                                transition: 'all 0.2s ease',
                                opacity: isDone ? 0.8 : 1
                            }}
                        >
                            <div 
                                onClick={() => toggleTask(task.id)}
                                style={{
                                    width: 24, height: 24, borderRadius: '50%',
                                    border: `2px solid ${isDone ? 'var(--color-emerald)' : 'var(--text-muted)'}`,
                                    background: isDone ? 'var(--color-emerald)' : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', flexShrink: 0, marginTop: 4, transition: 'all 0.2s'
                                }}
                            >
                                {isDone && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                            </div>
                            
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                                    {task.title}
                                </div>
                                <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                                    {task.description}
                                </div>
                                {task.command && (
                                    <div 
                                        onClick={() => copyCommand(task.command)}
                                        style={{
                                            fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
                                            padding: '10px 14px', background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid var(--border-subtle)', borderRadius: '6px',
                                            color: '#a0f0c0', cursor: 'pointer', display: 'inline-block',
                                            transition: 'background 0.2s', marginBottom: '8px'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
                                        title="Click to copy"
                                    >
                                        $ {task.command}
                                    </div>
                                )}
                                {task.expectedOutput && (
                                    <div style={{ marginTop: 8, padding: 12, background: 'rgba(30, 41, 59, 0.4)', borderRadius: 6, borderLeft: '3px solid var(--color-blue)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <strong style={{ color: 'var(--color-blue)', display: 'block', marginBottom: 4 }}>Verify it worked:</strong>
                                        <div style={{ fontFamily: 'var(--font-mono)' }}>{task.expectedOutput}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {completed.size === tasks.length && tasks.length > 0 && (
                <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--color-emerald)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--color-emerald)', margin: '0 0 8px 0' }}>🎉 All Labs Completed!</h3>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Excellent work. You've mastered this module's hands-on tasks.</p>
                </div>
            )}
        </section>
    );
}
