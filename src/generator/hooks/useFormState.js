import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useLocalStorage — persisted state with debounce
 */
function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch { /* storage full */ }
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [key, value]);

  return [value, setValue];
}

/**
 * useFormState — manages all form data with undo support
 */
export function useFormState() {
  const [forms, setForms] = useLocalStorage('k8s_forms', {});
  const [selected, setSelected] = useState('Deployment');
  const [history, setHistory] = useState([]);

  const updateField = useCallback((type, field, value) => {
    setForms(prev => {
      const current = prev[type] || {};
      setHistory(h => [...h.slice(-19), { type, field, prevValue: current[field] }]);
      return { ...prev, [type]: { ...current, [field]: value } };
    });
  }, []);

  const updateForm = useCallback((type, newForm) => {
    setForms(prev => ({ ...prev, [type]: newForm }));
  }, []);

  const resetForm = useCallback((type) => {
    setForms(prev => {
      const next = { ...prev };
      delete next[type];
      return next;
    });
  }, []);

  const deleteForm = useCallback((type) => {
    setForms(prev => {
      const next = { ...prev };
      delete next[type];
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setHistory(h => {
      if (h.length === 0) return h;
      const last = h[h.length - 1];
      setForms(prev => {
        const current = prev[last.type] || {};
        return { ...prev, [last.type]: { ...current, [last.field]: last.prevValue } };
      });
      return h.slice(0, -1);
    });
  }, []);

  const form = forms[selected] || {};

  return {
    forms,
    selected,
    setSelected,
    form,
    updateField,
    updateForm,
    resetForm,
    deleteForm,
    undo,
    canUndo: history.length > 0,
  };
}

/**
 * useBundle — bundle management
 */
export function useBundle(forms) {
  const [bundle, setBundle] = useLocalStorage('k8s_bundle', {});

  const addToBundle = useCallback((type) => {
    setBundle(prev => {
      if (prev[type]) return prev;
      return { ...prev, [type]: forms[type] || {} };
    });
  }, [forms]);

  const removeFromBundle = useCallback((type) => {
    setBundle(prev => {
      const next = { ...prev };
      delete next[type];
      return next;
    });
  }, []);

  const toggleInBundle = useCallback((type) => {
    setBundle(prev => {
      if (prev[type]) {
        const next = { ...prev };
        delete next[type];
        return next;
      }
      return { ...prev, [type]: forms[type] || {} };
    });
  }, [forms]);

  const clearBundle = useCallback(() => {
    setBundle({});
  }, []);

  const bundleCount = Object.keys(bundle).length;

  return {
    bundle,
    setBundle,
    addToBundle,
    removeFromBundle,
    toggleInBundle,
    clearBundle,
    bundleCount,
  };
}

/**
 * useSnippets — saved configurations
 */
export function useSnippets() {
  const [snippets, setSnippets] = useLocalStorage('k8s_snippets', []);

  const saveSnippet = useCallback((name, type, yaml, form) => {
    if (!name.trim()) return;
    setSnippets(prev => [{
      id: Date.now(),
      name: name.trim(),
      type,
      yaml,
      form,
      createdAt: new Date().toISOString(),
    }, ...prev]);
  }, []);

  const deleteSnippet = useCallback((id) => {
    setSnippets(prev => prev.filter(s => s.id !== id));
  }, []);

  return { snippets, saveSnippet, deleteSnippet };
}

export { useLocalStorage };
