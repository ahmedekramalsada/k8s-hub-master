import { useMemo } from 'react';
import { GENERATORS, validateYAML, calcSecurityScore, lintResource } from '../generators.js';

/**
 * useYamlGeneration — memoized YAML generation, validation, and scoring.
 * Only recomputes when form data actually changes.
 */
export function useYamlGeneration(forms, selected) {
  const form = forms[selected] || {};

  const yaml = useMemo(() => {
    const generator = GENERATORS[selected];
    if (!generator) return '# Select a resource type';
    try {
      return generator(form);
    } catch (e) {
      return `# Error generating YAML: ${e.message}`;
    }
  }, [form, selected]);

  const validation = useMemo(() => validateYAML(yaml), [yaml]);
  const securityScore = useMemo(() => calcSecurityScore(selected, form), [form, selected]);
  const lintHints = useMemo(() => lintResource(selected, form), [form, selected]);

  return { yaml, validation, securityScore, lintHints };
}
