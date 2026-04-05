import React, { useState, useRef, useCallback, useEffect } from 'react';

/**
 * ResizablePanel — A panel with a draggable resize handle
 * Props: children, initialWidth, minWidth, maxWidth, onResize
 */
export function ResizablePanel({ children, initialWidth = 400, minWidth = 320, maxWidth = 600, onResize }) {
  const [width, setWidth] = useState(initialWidth);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = useCallback((e) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  }, [width]);

  const handleTouchStart = useCallback((e) => {
    isDragging.current = true;
    startX.current = e.touches[0].clientX;
    startWidth.current = width;
    e.preventDefault();
  }, [width]);

  useEffect(() => {
    const handleMove = (clientX) => {
      if (!isDragging.current) return;
      const delta = clientX - startX.current;
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth.current + delta));
      setWidth(newWidth);
      if (onResize) onResize(newWidth);
    };

    const onMouseMove = (e) => handleMove(e.clientX);
    const onTouchMove = (e) => handleMove(e.touches[0].clientX);

    const handleUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [minWidth, maxWidth, onResize]);

  return (
    <div style={{ width, minWidth, maxWidth, flexShrink: 0, position: 'relative', display: 'flex' }}>
      {children}
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{
          position: 'absolute',
          right: -3,
          top: 0,
          bottom: 0,
          width: 6,
          cursor: 'col-resize',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{
          width: 2,
          height: 40,
          borderRadius: 1,
          background: 'rgba(99,102,241,0.3)',
          transition: 'background 150ms ease, height 150ms ease',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.7)'; e.currentTarget.style.height = '60px'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.3)'; e.currentTarget.style.height = '40px'; }}
        />
      </div>
    </div>
  );
}

/**
 * MobileTabSwitcher — Tab bar for mobile to switch between Form/YAML/Bundle
 */
export function MobileTabSwitcher({ activeTab, onChange, theme }) {
  const tabs = [
    { id: 'form', label: '📝 Form' },
    { id: 'yaml', label: '📄 YAML' },
    { id: 'bundle', label: '📦 Bundle' },
  ];

  return (
    <div className="show-mobile" style={{
      display: 'none',
      position: 'sticky',
      bottom: 0,
      zIndex: 100,
      background: theme.bgCard,
      borderTop: `1px solid ${theme.border}`,
      padding: '4px 8px',
    }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              flex: 1,
              padding: '10px 8px',
              background: activeTab === tab.id ? 'rgba(99,102,241,0.15)' : 'transparent',
              border: activeTab === tab.id ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
              borderRadius: 8,
              color: activeTab === tab.id ? 'var(--color-primary-light)' : theme.textMuted,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontFamily: "'JetBrains Mono', monospace",
              transition: 'all 150ms ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
