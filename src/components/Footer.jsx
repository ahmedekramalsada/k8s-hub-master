import React from 'react';
import { Link } from 'react-router-dom';

const FOOTER_LINKS = {
  Product: [
    { label: 'Generator', href: '/generator' },
    { label: 'Templates', href: '/generator/templates' },
    { label: 'AI Assistant', href: '/chat' },
    { label: 'Learn', href: '/learn' },
  ],
  Resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Kubernetes Docs', href: 'https://kubernetes.io/docs/', external: true },
    { label: 'K3s Docs', href: 'https://docs.k3s.io/', external: true },
    { label: 'ArgoCD Docs', href: 'https://argo-cd.readthedocs.io/', external: true },
  ],
  Community: [
    { label: 'GitHub', href: 'https://github.com/ahmedekramalsada/k8s-hub-master', external: true },
    { label: 'Report a Bug', href: 'https://github.com/ahmedekramalsada/k8s-hub-master/issues', external: true },
    { label: 'Request a Feature', href: 'https://github.com/ahmedekramalsada/k8s-hub-master/issues', external: true },
  ],
};

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      background: 'var(--bg-surface)',
      padding: '48px 24px 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr repeat(3, 1fr)',
          gap: 40,
          marginBottom: 40,
        }}>
          {/* Brand */}
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(99,102,241,0.15)',
                border: '2px solid var(--color-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>☸</div>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18,
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary-light))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>K8s Hub</span>
            </div>
            <p style={{
              color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.7, maxWidth: 300,
            }}>
              Build production-ready Kubernetes manifests in minutes.
              Generate, validate, and deploy with confidence.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
                color: 'var(--text-primary)', marginBottom: 16,
                letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>{title}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {links.map(link => (
                  <li key={link.label} style={{ marginBottom: 10 }}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" style={{
                        color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none',
                        transition: 'color 150ms ease',
                      }}
                        onMouseEnter={e => e.target.style.color = 'var(--color-primary-light)'}
                        onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                      >
                        {link.label} ↗
                      </a>
                    ) : (
                      <Link to={link.href} style={{
                        color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none',
                        transition: 'color 150ms ease',
                      }}
                        onMouseEnter={e => e.target.style.color = 'var(--color-primary-light)'}
                        onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>
            Built with ❤️ for the Kubernetes community
          </span>
          <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>
            Open source — MIT License
          </span>
        </div>
      </div>
    </footer>
  );
}
