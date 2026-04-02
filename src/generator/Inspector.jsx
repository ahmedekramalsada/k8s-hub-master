import React, { useState } from 'react';
import { useKubeStore } from './store.js';
import { nameSchema, namespaceSchema, replicaSchema, imageSchema } from './schemas.js';

const ValidatedInput = ({ label, value, schema, onChange, type = "text" }) => {
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const val = e.target.value;
    const result = schema ? schema.safeParse(val) : { success: true };
    if (!result.success) {
      setError(result.error.issues[0].message);
    } else {
      setError(null);
    }
    onChange(val);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>
        {label}
      </label>
      <input 
        type={type}
        value={value || ''} 
        onChange={handleChange}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: '#0f172a',
          border: `1px solid ${error ? '#ef4444' : '#334155'}`,
          borderRadius: 8,
          color: '#f8fafc',
          outline: 'none',
          fontSize: 14,
          fontFamily: "'Inter', sans-serif",
          transition: 'all 0.2s'
        }}
        onFocus={(e) => e.target.style.borderColor = error ? '#ef4444' : '#818cf8'}
        onBlur={(e) => e.target.style.borderColor = error ? '#ef4444' : '#334155'}
      />
      {error && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{error}</div>}
    </div>
  );
};

export function Inspector() {
  const { nodes, selectedNodeId, updateNodeData } = useKubeStore();
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: 14 }}>
        Select a node on the canvas to inspect its properties.
      </div>
    );
  }

  const { formData, kind } = selectedNode.data;
  const update = (key, val) => updateNodeData(selectedNodeId, { [key]: val });

  return (
    <div style={{ padding: '24px', color: '#f8fafc', overflowY: 'auto', height: '100%' }}>
      <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #1e293b' }}>
        {kind} Editor
      </div>
      
      <ValidatedInput label="Name" value={formData.name} schema={nameSchema} onChange={v => update('name', v)} />
      <ValidatedInput label="Namespace" value={formData.namespace} schema={namespaceSchema} onChange={v => update('namespace', v)} />
      
      {['Deployment', 'Pod'].includes(kind) && (
        <>
          <ValidatedInput label="Image" value={formData.image} schema={imageSchema} onChange={v => update('image', v)} />
          {kind === 'Deployment' && (
             <ValidatedInput label="Replicas" type="number" value={formData.replicas} schema={replicaSchema} onChange={v => update('replicas', v)} />
          )}
        </>
      )}

      {/* Extra settings can go here */}
      <div style={{ marginTop: 24, fontSize: 13, color: '#94a3b8', background: '#0f172a', padding: 16, borderRadius: 8, border: '1px solid #1e293b' }}>
        <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: 8 }}>Internal Node ID</div>
        <code style={{ fontFamily: 'monospace', color: '#818cf8', wordBreak: 'break-all' }}>{selectedNodeId}</code>
      </div>
    </div>
  );
}
