import React, { useState, useRef, useEffect } from 'react';

export default function Terminal({ isVisible, toggleVisibility }) {
    const [size, setSize] = useState('half'); // 'half' | 'full'
    const [isFocused, setIsFocused] = useState(false);
    
    const [history, setHistory] = useState([
        { type: 'output', text: 'K8s Hub Terminal v2.0 (Mock Environment)' },
        { type: 'output', text: 'Type "help" for a list of mock commands.' }
    ]);
    const [input, setInput] = useState('');
    
    const inputRef = useRef(null);
    const bottomRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [history, isVisible, size]);

    // Keep focus when clicking anywhere in the terminal body
    const handleTerminalClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
            setIsFocused(true);
        }
    };

    const handleCommand = (e) => {
        if (e.key === 'Enter') {
            const cmd = input.trim();
            if (!cmd) {
                setHistory(prev => [...prev, { type: 'prompt', text: '' }]);
                return;
            }
            
            // Add user command to history
            setHistory(prev => [...prev, { type: 'prompt', text: cmd }]);
            setInput('');
            
            // Mock responses
            setTimeout(() => {
                let response = '';
                const c = cmd.toLowerCase();
                if (c === 'clear') {
                    setHistory([]);
                    return;
                } else if (c === 'help') {
                    response = 'Available mock commands: kubectl get pods, kubectl get nodes, clear, help';
                } else if (c.startsWith('kubectl get pods')) {
                    response = "NAME                               READY   STATUS    RESTARTS   AGE\nnginx-deployment-7fb96c846b-8x2zx  1/1     Running   0          12m\nnginx-deployment-7fb96c846b-m4qw9  1/1     Running   0          12m\nnginx-deployment-7fb96c846b-v9tl2  1/1     Running   2          12m";
                } else if (c.startsWith('kubectl get nodes')) {
                    response = "NAME           STATUS   ROLES           AGE   VERSION\nk8s-master-1   Ready    control-plane   45d   v1.28.2\nk8s-worker-1   Ready    <none>          45d   v1.28.2\nk8s-worker-2   Ready    <none>          45d   v1.28.2";
                } else if (c.startsWith('kubectl')) {
                    response = `Mock environment: Kubernetes API intercepted command '${cmd}'. No further generation.`;
                } else if (c.startsWith('docker')) {
                    response = "Mock environment: Docker daemon is responding via local socket.";
                } else {
                    response = `bash: ${cmd}: command not found`;
                }
                
                setHistory(prev => [...prev, { type: 'output', text: response }]);
            }, 300);
        }
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: size === 'full' ? '100%' : '45%',
            background: 'rgba(5, 5, 10, 0.95)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex', flexDirection: 'column',
            zIndex: 50,
            boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
            transition: 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            fontFamily: 'var(--font-mono)'
        }}>
            {/* Terminal Header Bar */}
            <div style={{
                height: 36, background: '#11111a', borderBottom: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 16px', flexShrink: 0
            }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                        onClick={toggleVisibility}
                        style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56', border: 'none', cursor: 'pointer', padding: 0 }}
                        title="Close"
                    />
                    <button 
                        style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e', border: 'none', cursor: 'pointer', padding: 0 }}
                        title="Minimize"
                    />
                    <button 
                        onClick={() => setSize(size === 'full' ? 'half' : 'full')}
                        style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f', border: 'none', cursor: 'pointer', padding: 0 }}
                        title={size === 'full' ? "Restore Down" : "Maximize"}
                    />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    user@k8s-hub:~
                </div>
                <div style={{ width: 44 }}></div> {/* Spacer for symmetry */}
            </div>
            
            {/* Terminal Content Area */}
            <div 
                style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', cursor: 'text' }}
                onClick={handleTerminalClick}
            >
                {history.map((line, idx) => (
                    <div key={idx} style={{ marginBottom: 4 }}>
                        {line.type === 'prompt' ? (
                            <div style={{ display: 'flex', gap: 10 }}>
                                <span style={{ color: 'var(--color-emerald)', fontWeight: 600 }}>➜</span>
                                <span style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>~</span>
                                <span style={{ color: '#fff' }}>{line.text}</span>
                            </div>
                        ) : (
                            <pre style={{ 
                                margin: 0, color: 'var(--text-muted)', whiteSpace: 'pre-wrap', 
                                wordBreak: 'break-all', fontSize: 13, lineHeight: 1.5
                            }}>
                                {line.text}
                            </pre>
                        )}
                    </div>
                ))}
                
                {/* Active Input Line */}
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <span style={{ color: 'var(--color-emerald)', fontWeight: 600 }}>➜</span>
                    <span style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>~</span>
                    <input 
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleCommand}
                        onBlur={() => setIsFocused(false)}
                        autoFocus
                        style={{
                            background: 'transparent', border: 'none', outline: 'none',
                            color: '#fff', flex: 1, fontFamily: 'var(--font-mono)',
                            fontSize: 13, padding: 0, caretColor: 'var(--color-primary)'
                        }}
                        spellCheck="false"
                        autoComplete="off"
                    />
                </div>
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
