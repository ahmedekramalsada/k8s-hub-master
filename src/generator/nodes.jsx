import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Box, Server, Database, Globe, Network, Shield } from 'lucide-react';

const ICON_MAP = {
  Deployment: <Box size={16} />,
  Pod: <Box size={16} />,
  Service: <Network size={16} />,
  Ingress: <Globe size={16} />,
  ConfigMap: <Database size={16} />,
  Secret: <Shield size={16} />,
  StatefulSet: <Server size={16} />
};

export const K8sNode = ({ data, selected }) => {
  const { kind, formData } = data;
  const icon = ICON_MAP[kind] || <Box size={16} />;
  
  // Dynamic color coding based on type
  const color = kind === 'Deployment' || kind === 'Pod' ? '#818cf8' 
              : kind === 'Service' || kind === 'Ingress' ? '#34d399' 
              : '#fbbf24';
              
  const bg = `${color}10`; // very transparent
  
  return (
    <div style={{
      background: '#0f172a',
      border: `2px solid ${selected ? color : '#1e293b'}`,
      boxShadow: selected ? `0 0 15px ${color}40` : '0 4px 6px -1px rgb(0 0 0 / 0.5)',
      borderRadius: '12px',
      minWidth: '220px',
      color: '#f8fafc',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Top Handle (Incoming) */}
      <Handle type="target" position={Position.Top} style={{ background: color, width: '12px', height: '12px', top: '-6px' }} />
      
      {/* Node Header */}
      <div style={{
        background: bg,
        padding: '12px 16px',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        borderBottom: `1px solid #1e293b`,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{ color }}>{icon}</div>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#94a3b8' }}>
            {kind}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>
            {formData?.name || 'Unnamed Resource'}
          </div>
        </div>
      </div>

      {/* Node Body Details */}
      <div style={{ padding: '12px 16px', fontSize: '12px', color: '#cbd5e1' }}>
        {kind === 'Deployment' && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Replicas:</span>
            <span style={{ color }}>{formData?.replicas || 1}</span>
          </div>
        )}
        {kind === 'Service' && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Type:</span>
            <span style={{ color }}>{formData?.serviceType || 'ClusterIP'}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          <span>Namespace:</span>
          <span>{formData?.namespace || 'default'}</span>
        </div>
      </div>
      
      {/* Bottom Handle (Outgoing) */}
      <Handle type="source" position={Position.Bottom} style={{ background: color, width: '12px', height: '12px', bottom: '-6px' }} />
    </div>
  );
};
