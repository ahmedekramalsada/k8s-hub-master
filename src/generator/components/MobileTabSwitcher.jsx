function MobileTabSwitcher({ activeTab, onChange, theme }) {
  const tabs = ['form', 'yaml', 'bundle']

  return (
    <div
      className="show-mobile"
      style={{
        display: 'none',
        display: 'flex',
        width: '100%',
        border: `1px solid ${theme.border}`,
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: theme.bgCard,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              borderBottom: isActive ? `2px solid ${theme.border}` : 'none',
              backgroundColor: isActive ? theme.bgCard : 'transparent',
              color: isActive ? theme.textMuted : theme.textMuted,
              fontWeight: isActive ? '600' : '400',
              cursor: 'pointer',
              textTransform: 'capitalize',
              fontSize: '14px',
              outline: 'none',
            }}
          >
            {tab}
          </button>
        )
      })}
    </div>
  )
}

export { MobileTabSwitcher }
