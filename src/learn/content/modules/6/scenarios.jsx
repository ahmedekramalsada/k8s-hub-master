import React, { useState } from 'react';

function CodeBlock({ command, desc }) {
    const [copied, setCopied] = useState(false);
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '10px 16px', borderRadius: 6, marginBottom: 8, border: '1px solid var(--border-subtle)' }}>
            <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{desc}</div>
                <code style={{ fontFamily: 'var(--font-mono)', color: '#a0f0c0', fontSize: 13 }}>$ {command}</code>
            </div>
            <button 
                onClick={() => { navigator.clipboard.writeText(command); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--color-primary-light)', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 11, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
            >
                {copied ? '✓ COPIED' : 'COPY'}
            </button>
        </div>
    );
}

export default function ScenariosContent() {
    return (
        <section className="content-block" style={{ maxWidth: 900 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 24 }}>🎯</span> Real-World Scenarios</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Practical troubleshooting scenarios for Kubernetes Package Management.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-rose)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Scenario 1: Helm "cannot re-use a name that is still in use"</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                        <strong>Symptom:</strong> You run `helm install my-app` and get `Error: INSTALLATION FAILED: cannot re-use a name that is still in use`.<br/>
                        <strong>Cause:</strong> You probably ran `helm install` previously and it either succeeded or failed halfway through. Helm tracks every release in hidden cluster Secrets. You cannot use the same name twice in the same namespace unless you explicitly upgrade it.
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8 }}>
                        <div style={{ color: 'var(--color-emerald)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SOLUTION</div>
                        <CodeBlock desc="Option 1: Uninstall the broken old release completely" command="helm uninstall my-app" />
                        <CodeBlock desc="Option 2: Use upgrade instead of install for updates" command="helm upgrade --install my-app ./chart" />
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '12px 0 0 0' }}>The `--install` flag acts as an upsert: it installs if missing, or upgrades if it already exists. It is industry standard for CI/CD pipelines.</p>
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-yellow)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Scenario 2: The Template Rendering Error</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                        <strong>Symptom:</strong> `Error: parse error at (my-chart/templates/deployment.yaml:12): function "toYaml" not defined` or `nil pointer evaluating interface {}`.<br/>
                        <strong>Cause:</strong> You made a syntax error in your Helm Go Templates or `values.yaml` is missing a key that a template tried to read blindly without checking if it existed using `default`.
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8 }}>
                        <div style={{ color: 'var(--color-emerald)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SOLUTION</div>
                        <CodeBlock desc="Run template generation locally with debug flag" command="helm template my-app ./chart --debug" />
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '12px 0 0' }}>Unlike `kubectl` which validates API specs against the server, `helm template` tests if your Go logic compiles offline.</p>
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-blue)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Scenario 3: Kustomize apply fails on "resource not found"</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                        <strong>Symptom:</strong> You run `kubectl apply -k .` and get an error that a resource defined in your `patchesStrategicMerge` doesn't exist.<br/>
                        <strong>Cause:</strong> Your patch contains an incorrect `apiVersion`, `kind`, or `name`. Kustomize requires the exact identity to match what is defined in the `bases` or it will reject the patch.
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8 }}>
                        <div style={{ color: 'var(--color-emerald)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SOLUTION</div>
                        <CodeBlock desc="Render the output locally without server validation to debug" command="kubectl kustomize ." />
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '12px 0 0 0' }}>Open your patch file and ensure `kind`, `metadata.name` exactly match the base file you are trying to alter.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
