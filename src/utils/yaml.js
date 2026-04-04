export function downloadFile(content, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

export function yamlToFilename(resourceType) {
  return resourceType
    .toLowerCase()
    .replace(/[\s&]/g, '-')
    .replace(/[^a-z0-9-]/g, '') + '.yaml';
}

export function bundleToYamlString(bundle, generators) {
  const entries = Object.entries(bundle);
  if (!entries.length) return '';

  return entries.map(([type, f]) => {
    try {
      if (f._isImported) {
        const yamlStr = f._rawYaml || rawYamlToString(f._rawDoc);
        return `# ===== ${f._kind || type} =====\n${yamlStr}`;
      }
      return `# ===== ${type} =====\n${generators[type]?.(f) || ''}`;
    } catch {
      return `# Error generating ${type}`;
    }
  }).join('\n\n---\n\n');
}
