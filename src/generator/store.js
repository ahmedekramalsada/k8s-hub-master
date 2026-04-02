import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import yaml from 'js-yaml';
import { RESOURCE_META } from './generators.js';

// Global state for bidirectional K8s Node sync
export const useKubeStore = create((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  
  // React Flow Handlers
  onNodesChange: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) }),
  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),
  onConnect: (connection) => {
    // Basic illegal connection check: can't connect node to itself
    if (connection.source === connection.target) return;
    set({ edges: addEdge({ ...connection, animated: true, type: 'smoothstep', style: { strokeDasharray: '5,5', stroke: '#818cf8', strokeWidth: 2 } }, get().edges) });
  },

  // UI Handlers
  setSelectedNode: (id) => set({ selectedNodeId: id }),
  
  // Add a new node to canvas
  addNode: (type, title, position = { x: 200, y: 200 }) => {
    const meta = RESOURCE_META[type] || {};
    const newNode = {
      id: `${type}-${Date.now()}`,
      type: 'k8sNode',
      position,
      data: {
        kind: type,
        title: title || type,
        // Insert default structured payload based on type
        formData: {
          name: `${type.toLowerCase()}-app`,
          namespace: 'default',
          image: type === 'Deployment' || type === 'Pod' ? 'nginx:latest' : '',
          replicas: type === 'Deployment' ? 1 : undefined,
          ports: [{ port: 80, name: 'http', protocol: 'TCP' }],
        }
      }
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  // Inspector updates form details
  updateNodeData: (id, newFormData) => {
    set({
      nodes: get().nodes.map(node => 
        node.id === id ? { ...node, data: { ...node.data, formData: { ...node.data.formData, ...newFormData } } } : node
      )
    });
  },

  // Converts graph to full YAML Document Stream (--- separated)
  generateYAML: () => {
    const { nodes, edges } = get();
    if (!nodes.length) return "# Canvas is empty. Drag a resource here to begin.";

    try {
      const manifests = nodes.map(node => {
        const { kind, formData } = node.data;
        const base = {
          apiVersion: RESOURCE_META[kind]?.api || 'v1',
          kind: kind,
          metadata: { name: formData.name, namespace: formData.namespace }
        };

        if (formData.labels?.length) {
          base.metadata.labels = {};
          formData.labels.forEach(l => { if (l.k) base.metadata.labels[l.k] = l.v; });
        }

        if (kind === 'Deployment') {
          base.spec = {
            replicas: Number(formData.replicas || 1),
            selector: { matchLabels: { app: formData.name } },
            template: {
              metadata: { labels: { app: formData.name } },
              spec: {
                containers: [{
                  name: formData.name,
                  image: formData.image,
                  ports: (formData.ports || []).map(p => ({ containerPort: Number(p.port), name: p.name || undefined, protocol: p.protocol || 'TCP' }))
                }]
              }
            }
          };
        } else if (kind === 'Service') {
          // Look for incoming connections to map targetSelector automatically
          const incomingEdges = edges.filter(e => e.target === node.id);
          const sourceNodes = nodes.filter(n => incomingEdges.some(e => e.source === n.id));
          
          let selector = { app: formData.name }; // default fallback
          if (sourceNodes.length > 0) {
            selector = { app: sourceNodes[0].data.formData.name }; // dynamically snap to what it targets
          }

          base.spec = {
            selector,
            type: formData.serviceType || 'ClusterIP',
            ports: (formData.ports || []).map(p => ({
              port: Number(p.port), targetPort: Number(p.targetPort || p.port), protocol: p.protocol || 'TCP', name: p.name || undefined
            }))
          };
        }
        return base;
      });

      return manifests.map(m => yaml.dump(m, { noRefs: true, sortKeys: false })).join("\n---\n");
    } catch (e) {
      return `# Error generating YAML: ${e.message}`;
    }
  },

  // Dangerously forces nodes directly from pure YAML typing (js-yaml -> Canvas)
  forceGraphFromYaml: (yamlString) => {
    // To implement later for the ultimate "Bidirectional sync". 
    // Right now, visual flow generates code. Code to visual requires building layout algorithms.
  }
}));
