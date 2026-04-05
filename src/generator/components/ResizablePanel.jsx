import React, { useState, useRef, useCallback, useEffect } from 'react';

export function ResizablePanel({ children, initialWidth = 400, minWidth = 320, maxWidth = 600 }) {
  const [width, setWidth] = useState(initialWidth);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);
  const panelRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    dragStartX.current = e.clientX;
    dragStartWidth.current = width;
    setIsDragging(true);
  }, [width]);

  const handleTouchStart = useCallback((e) => {
    dragStartX.current = e.touches[0].clientX;
    dragStartWidth.current = width;
    setIsDragging(true);
  }, [width]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const delta = e.clientX - dragStartX.current;
    const newWidth = Math.min(maxWidth, Math.max(minWidth, dragStartWidth.current + delta));
    setWidth(newWidth);
  }, [isDragging, minWidth, maxWidth]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    const delta = e.touches[0].clientX - dragStartX.current;
    const newWidth = Math.min(maxWidth, Math.max(minWidth, dragStartWidth.current + delta));
    setWidth(newWidth);
  }, [isDragging, minWidth, maxWidth]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleMouseUp]);

  return (
    <div ref={panelRef} style={{ width, position: 'relative', flexShrink: 0 }}>
      {children}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '6px',
          height: '100%',
          cursor: 'col-resize',
          backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.5)' : 'transparent',
          transition: 'background-color 0.15s ease',
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          if (!isDragging) e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
        }}
        onMouseLeave={(e) => {
          if (!isDragging) e.currentTarget.style.backgroundColor = 'transparent';
        }}
      />
    </div>
  );
}
