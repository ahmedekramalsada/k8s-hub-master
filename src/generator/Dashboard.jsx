import React, { useState } from 'react';
import { RESOURCE_META, CATEGORIES } from './generators.js';

// Category colors for consistent theming
const CAT_COLORS = {
  Beginner: '#4ade80',
  Workloads: '#818cf8',
  Networking: '#22d399',
  Config: '#a855f7',
  Storage: '#f97316',
  Security: '#f59e0b',
  Cluster: '#64748b',
  GitOps: '#818cf8',
  Observability: '#e879f9',
};

export default function Dashboard({ onSelect, onQuickCreate, recentResources = [], bundle = {} }) {
  const [search, setSearch] = useState('');

  const searchLower = search.toLowerCase();

  // Group resources by category
  const grouped = CATEGORIES.map(cat => {
    const items = Object.entries(RESOURCE_META).filter(([name, m]) => {
      if (m.cat !== cat) return false;
      if (!searchLower) return true;
      return name.toLowerCase().includes(searchLower) || (m.desc && m.desc.toLowerCase().includes(searchLower));
    });
    return { cat, items, color: CAT_COLORS[cat] || '#6366f1' };
  }).filter(g => g.items.length > 0);

  // Recent resources (last 5)
  const recent = recentResources.slice(0, 5);

  return (
    <div style={{
      flex: 1, overflow: 'auto', padding: '32px',
      display: 'flex', flexDirection: 'column', gap: 28,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, margin: 0,
            background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-secondary-light))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            What do you want to deploy?
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 6 }}>
            Pick a resource type to start building your Kubernetes config
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: 340 }}>
          <span style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            fontSize: 16, opacity: 0.5,
          }}>🔍</span>
          <input
            className="input"
            placeholder="Search resources... (e.g. deploy, service, ingress)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              height: 48, paddingLeft: 44, fontSize: 15,
              borderRadius: 'var(--radius-lg)', borderWidth: 2,
              fontFamily: 'var(--font-body)',
            }}
          />
        </div>
      </div>

      {/* Recently Used */}
      {recent.length > 0 && !search && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: 'var(--text-dim)',
            letterSpacing: '0.1em', textTransform: 'uppercase', paddingLeft: 4,
          }}>Recently Used</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {recent.map(name => {
              const m = RESOURCE_META[name];
              if (!m) return null;
              return (
                <button
                  key={name}
                  onClick={() => onSelect(name)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 20, padding: '8px 16px',
                    color: 'var(--text-secondary)', cursor: 'pointer',
                    fontSize: 14, fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'all 150ms ease',
                    fontFamily: 'var(--font-body)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = m.color + '60'; e.currentTarget.style.color = m.color; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <span style={{ fontSize: 16 }}>{m.icon}</span> {name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Sections */}
      {grouped.map(({ cat, items, color }) => (
        <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Category header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            paddingLeft: 4,
          }}>
            <span style={{
              fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.12em', color: 'var(--text-dim)',
            }}>{cat}</span>
            <span style={{
              background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
              borderRadius: 20, padding: '2px 10px', fontSize: 11,
              color: 'var(--text-muted)', fontWeight: 600,
            }}>{items.length}</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          </div>

          {/* Card grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 14,
          }}>
            {items.map(([name, m]) => (
              <ResourceCard
                key={name}
                name={name}
                meta={m}
                catColor={color}
                inBundle={!!bundle[name]}
                onSelect={() => onSelect(name)}
                onQuickCreate={onQuickCreate}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ResourceCard({ name, meta, catColor, inBundle, onSelect, onQuickCreate }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: `2px solid ${hovered ? meta.color + '50' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '22px 20px',
        cursor: 'pointer',
        transition: 'all 250ms var(--ease-out-expo)',
        display: 'flex', flexDirection: 'column', gap: 10,
        position: 'relative', overflow: 'hidden',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 30px rgba(0,0,0,0.3)' : 'var(--shadow-sm)',
      }}
    >
      {/* Top color bar on hover */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: meta.color,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 250ms ease',
      }} />

      {/* In-bundle indicator */}
      {inBundle && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          width: 24, height: 24, borderRadius: '50%',
          background: 'rgba(34,197,94,0.15)',
          border: '1.5px solid var(--color-success)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, color: 'var(--color-success)',
        }}>✓</div>
      )}

      {/* Icon */}
      <div style={{
        fontSize: 36, lineHeight: 1,
        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
      }}>{meta.icon}</div>

      {/* Name */}
      <div style={{
        fontSize: 17, fontWeight: 700, color: 'var(--text-primary)',
      }}>{name}</div>

      {/* Description */}
      <div style={{
        fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5,
      }}>{meta.desc}</div>

      {/* Category tag */}
      <div style={{ marginTop: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 11, padding: '3px 10px', borderRadius: 20,
          background: meta.color + '15',
          border: `1px solid ${meta.color}30`,
          color: meta.color, fontWeight: 500,
        }}>{meta.cat}</span>
      </div>

      {/* Action buttons — visible on hover */}
      <div style={{
        display: 'flex', gap: 8, marginTop: 6,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 200ms ease',
      }}>
        <button
          onClick={e => { e.stopPropagation(); onSelect(); }}
          style={{
            flex: 1, padding: '10px 16px',
            background: meta.color, color: 'white',
            border: 'none', borderRadius: 'var(--radius-sm)',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            transition: 'filter 150ms ease',
          }}
          onMouseEnter={e => e.target.style.filter = 'brightness(1.15)'}
          onMouseLeave={e => e.target.style.filter = 'brightness(1)'}
        >Configure →</button>
        {onQuickCreate && (
          <button
            onClick={e => { e.stopPropagation(); onQuickCreate(name); }}
            style={{
              padding: '10px 16px',
              background: 'var(--bg-input)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = meta.color + '60'; e.currentTarget.style.color = meta.color; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >Quick</button>
        )}
      </div>
    </div>
  );
}
