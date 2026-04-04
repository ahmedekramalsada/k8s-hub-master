import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext.jsx';

const NAV_SECTIONS = [
    { path: '/', label: 'Home', icon: '🏠', exact: true },
    { path: '/generator', label: 'Generator', icon: '⚡' },
    { path: '/learn', label: 'Learn', icon: '📚' },
    { path: '/chat', label: 'AI Chat', icon: '🤖' },
];

export default function GlobalNav() {
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    const isActive = (section) => {
        if (section.exact) return location.pathname === section.path;
        return location.pathname.startsWith(section.path);
    };

    return (
        <>
            <nav
                style={{
                    position: 'sticky', top: 0, zIndex: 200,
                    height: 60,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                    background: 'var(--bg-nav)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: '1px solid var(--border-subtle)',
                    boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
                    transition: 'box-shadow 300ms ease',
                }}
            >
                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'rgba(99,102,241,0.15)',
                        border: '2px solid var(--color-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18,
                    }}>☸</div>
                    <span className="text-gradient-brand hide-mobile" style={{
                        fontFamily: 'var(--font-display)', fontWeight: 800,
                        fontSize: 'var(--text-xl)',
                    }}>
                        K8s Hub
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hide-mobile" style={{
                    display: 'flex', gap: 6,
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 4,
                    border: '1px solid var(--border-subtle)',
                }}>
                    {NAV_SECTIONS.map(section => (
                        <Link
                            key={section.path}
                            to={section.path}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '7px 18px',
                                borderRadius: 'var(--radius-md)',
                                fontSize: 14,
                                fontWeight: 600,
                                textDecoration: 'none',
                                transition: 'all 200ms ease',
                                background: isActive(section) ? 'rgba(99,102,241,0.15)' : 'transparent',
                                color: isActive(section) ? 'var(--color-primary-light)' : 'var(--text-muted)',
                                border: isActive(section) ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                            }}
                        >
                            <span style={{ fontSize: 16 }}>{section.icon}</span>
                            <span>{section.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: 11,
                        color: 'var(--text-dim)',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '5px 12px',
                    }} className="hide-mobile">
                        Ctrl+K AI · Ctrl+S Save
                    </div>
                    <ThemeToggle />

                    {/* Mobile hamburger */}
                    <button
                        className="show-mobile"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                        style={{
                            background: 'transparent', border: 'none',
                            color: 'var(--text-primary)', fontSize: 22,
                            padding: 4, cursor: 'pointer',
                            display: 'none',
                        }}
                    >
                        {mobileOpen ? '✕' : '☰'}
                    </button>
                </div>
            </nav>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 300,
                    background: 'var(--bg-overlay)',
                    backdropFilter: 'blur(8px)',
                    animation: 'fadeIn 150ms ease',
                }} onClick={() => setMobileOpen(false)}>
                    <div style={{
                        position: 'absolute', top: 0, right: 0,
                        width: 280, height: '100%',
                        background: 'var(--bg-panel)',
                        borderLeft: '1px solid var(--border-subtle)',
                        padding: '32px 20px',
                        display: 'flex', flexDirection: 'column', gap: 12,
                        animation: 'slideInRight 300ms var(--ease-out-expo)',
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{
                            color: 'var(--text-dim)', fontSize: 11, fontWeight: 700,
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                            marginBottom: 8,
                        }}>Navigation</div>
                        {NAV_SECTIONS.map(section => (
                            <Link
                                key={section.path}
                                to={section.path}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '14px 16px',
                                    textDecoration: 'none',
                                    background: isActive(section) ? 'rgba(99,102,241,0.12)' : 'var(--bg-card)',
                                    border: isActive(section) ? '1px solid rgba(99,102,241,0.3)' : '1px solid var(--border-subtle)',
                                    borderRadius: 'var(--radius-lg)',
                                    color: isActive(section) ? 'var(--color-primary-light)' : 'var(--text-primary)',
                                    fontSize: 15, fontWeight: 600,
                                }}
                            >
                                <span style={{ fontSize: 22 }}>{section.icon}</span>
                                {section.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

function ThemeToggle() {
    const { dark, toggle } = useTheme();

    return (
        <button
            onClick={toggle}
            aria-label="Toggle theme"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
                width: 40, height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 150ms ease',
            }}
        >
            {dark ? '☀️' : '🌙'}
        </button>
    );
}
