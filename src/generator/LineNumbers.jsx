import React from 'react';

export default function LineNumbers({ lineCount, theme }) {
  return (
    <div style={{
      width: 40, flexShrink: 0, background: 'var(--yaml-bg)',
      borderRight: '1px solid var(--border-subtle)',
      padding: '12px 0', overflow: 'hidden', userSelect: 'none',
    }}>
      {Array.from({ length: lineCount }, (_, i) => (
        <div key={i} style={{
          height: '1.7em', textAlign: 'right', paddingRight: 10,
          fontSize: 12, fontFamily: 'var(--font-mono)',
          color: 'var(--text-dim)', lineHeight: 1.7,
        }}>
          {i + 1}
        </div>
      ))}
    </div>
  );
}
