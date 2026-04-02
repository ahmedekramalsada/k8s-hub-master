import React, { useCallback } from 'react';
import { ReactFlow, ReactFlowProvider, Background, Controls, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useKubeStore } from './store.js';
import { K8sNode } from './nodes.jsx';
import { Inspector } from './Inspector.jsx';
import Editor from '@monaco-editor/react';

const nodeTypes = { k8sNode: K8sNode };

const VisualIDECanvas = ({ theme }) => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setSelectedNode, addNode, generateYAML } = useKubeStore();

  const handlePaneClick = useCallback(() => setSelectedNode(null), [setSelectedNode]);
  const handleNodeClick = useCallback((_, node) => setSelectedNode(node.id), [setSelectedNode]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;

    // We shouldn't depend on the DOM size but we can mock position for now
    const position = { x: event.clientX - 250, y: event.clientY - 100 };
    addNode(type, `${type}-1`, position);
  }, [addNode]);

  const yamlOutput = generateYAML();

  return (
    <div style={{ display: 'flex', width: '100%', height: 'calc(100vh - 64px)', background: theme.bg }}>
      
      {/* Left Sidebar: Node Library */}
      <div style={{ width: '250px', borderRight: `1px solid ${theme.border}`, background: theme.bgCard, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', fontSize: 13, fontWeight: 700, color: theme.textMuted, letterSpacing: '0.1em', borderBottom: `1px solid ${theme.border}` }}>
          RESOURCE LIBRARY
        </div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {['Deployment', 'Service', 'Pod', 'ConfigMap', 'Secret', 'Ingress'].map(type => (
            <div 
              key={type}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('application/reactflow', type)}
              style={{
                background: theme.bgInput,
                border: `1px solid ${theme.border}`,
                padding: '12px 16px',
                borderRadius: '8px',
                color: theme.text,
                fontSize: 14,
                cursor: 'grab',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              <span style={{ marginRight: 8 }}>{type === 'Deployment' || type==='Pod' ? '📦' : type === 'Service' ? '🌐' : '⚙️'}</span>
              {type}
            </div>
          ))}
        </div>
      </div>

      {/* Center Stage: React Flow Canvas */}
      <div style={{ flex: 1, position: 'relative' }} onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid={true}
          snapGrid={[20, 20]}
          colorMode={theme.isDark ? "dark" : "light"}
        >
          <Background color={theme.isDark ? "#334155" : "#cbd5e1"} gap={20} size={1} />
          <Controls />
        </ReactFlow>

        {/* Floating Code Editor */}
        <div style={{ 
          position: 'absolute', bottom: '20px', right: '20px', 
          width: '400px', height: '300px', 
          background: theme.isDark ? '#0f172a' : '#f8fafc', 
          border: `1px solid ${theme.border}`, 
          borderRadius: '12px', overflow: 'hidden',
          boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.5)'
        }}>
          <div style={{ padding: '8px 16px', background: theme.bgCard, borderBottom: `1px solid ${theme.border}`, fontSize: 12, color: theme.textMuted, fontWeight: 600 }}>
            Compiled YAML
          </div>
          <Editor
            height="calc(100% - 33px)"
            language="yaml"
            theme={theme.isDark ? "vs-dark" : "vs-light"}
            value={yamlOutput}
            options={{ minimap: { enabled: false }, readOnly: true, wordWrap: 'on', padding: { top: 16 } }}
          />
        </div>
      </div>

      {/* Right Sidebar: Property Inspector */}
      <div style={{ width: '350px', borderLeft: `1px solid ${theme.border}`, background: theme.bgCard }}>
        <Inspector />
      </div>

    </div>
  );
};

export default function VisualIDE({ theme }) {
  return (
    <ReactFlowProvider>
      <VisualIDECanvas theme={theme} />
    </ReactFlowProvider>
  );
}
