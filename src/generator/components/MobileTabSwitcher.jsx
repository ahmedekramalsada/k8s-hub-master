function MobileTabSwitcher({ activeTab, onChange, theme }) {
  const tabs = [
    { id: 'form', label: '📝 Form' },
    { id: 'yaml', label: '📄 YAML' },
    { id: 'bundle', label: '📦 Bundle' },
  ];

  return (
    <div
      className="show-mobile"
      style={{
        display: 'flex',
        width: '100%',
        borderTop: `1px solid ${theme.border}`,
        backgroundColor: theme.bgCard,
        padding: '4px 8px',
        gap: 4,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              flex: 1,
              padding: '10px 0',
              border: isActive ? `1px solid rgba(99,102,241,0.3)` : '1px solid transparent',
              borderRadius: 8,
              backgroundColor: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: isActive ? '#818cf8' : theme.textMuted,
              fontWeight: isActive ? 700 : 500,
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              transition: 'all 150ms ease',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export { MobileTabSwitcher };
