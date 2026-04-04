import React from 'react';

const SHORTCUTS = [
  { keys: ['Ctrl', 'K'], desc: 'Open AI panel' },
  { keys: ['Ctrl', 'B'], desc: 'Add to bundle' },
  { keys: ['Ctrl', 'S'], desc: 'Download current YAML' },
  { keys: ['Ctrl', 'D'], desc: 'Download entire bundle' },
  { keys: ['Ctrl', '?'], desc: 'Show this help' },
  { keys: ['Enter'], desc: 'Send AI message' },
  { keys: ['Shift', '+', 'Enter'], desc: 'New line in AI input' },
];

export default function KeyboardShortcuts({ onClose, theme }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'var(--bg-overlay)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 150ms ease',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)', padding: '28px 32px',
        maxWidth: 480, width: 'calc(100% - 40px)',
        boxShadow: 'var(--shadow-xl)', animation: 'fadeInScale 200ms ease',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>
            ⌨️ Keyboard Shortcuts
          </h3>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: 20, padding: 4,
          }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SHORTCUTS.map(s => (
            <div key={s.keys.join('+')} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 12px', borderRadius: 8, background: 'var(--bg-card)',
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{s.desc}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {s.keys.map((k, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span style={{ color: 'var(--text-dim)', fontSize: 12, margin: '0 2px' }}>+</span>}
                    <kbd style={{
                      background: 'var(--bg-input)', border: '1px solid var(--border-default)',
                      borderRadius: 4, padding: '2px 8px', fontSize: 11,
                      fontFamily: 'var(--font-mono)', color: 'var(--text-primary)',
                    }}>{k}</kbd>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
