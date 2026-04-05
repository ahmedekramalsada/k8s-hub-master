import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'

// Design System
import './styles/design-system.css'
import './styles/animations.css'
import './styles/components.css'

import GlobalNav from './components/GlobalNav.jsx'
import LandingPage from './pages/LandingPage.jsx'
import GeneratorApp from './generator/app.jsx'
import LearnApp from './pages/LearnApp.jsx'
import ChatPage from './pages/ChatPage.jsx'
import DocsPage from './pages/DocsPage.jsx'
import { ToastProvider } from './components/ToastContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { AIProvider } from './ai/AIContext.jsx'
import AIFloatingWidget from './ai/AIFloatingWidget.jsx'

function NotFound404() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 64 }}>🔍</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-3xl)' }}>404</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>Page not found</p>
      <Link to="/" className="btn btn-primary">← Back to Home</Link>
    </div>
  );
}

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, info: null }
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }
    componentDidCatch(error, info) {
        this.setState({ info })
        console.error('ErrorBoundary caught:', error, info)
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ background: '#060610', color: '#f87171', fontFamily: 'monospace', padding: 40, minHeight: '100vh' }}>
                    <h1 style={{ color: '#818cf8', marginBottom: 16 }}>⚠️ Application Error</h1>
                    <pre style={{ background: '#0a0a18', padding: 20, borderRadius: 8, color: '#fca5a5', overflow: 'auto', fontSize: 13, lineHeight: 1.6 }}>
                        {this.state.error?.toString()}
                        {'\n\nComponent stack:'}
                        {this.state.info?.componentStack}
                    </pre>
                    <button onClick={() => window.location.reload()} style={{ marginTop: 20, background: '#6366f1', border: 'none', borderRadius: 8, color: 'white', padding: '10px 24px', cursor: 'pointer', fontSize: 14 }}>
                        🔄 Reload
                    </button>
                </div>
            )
        }
        return this.props.children
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <ErrorBoundary>
        <ThemeProvider>
            <AIProviderWrapper>
                <ToastProvider>
                    <BrowserRouter>
                        <GlobalNav />
                        <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/generator/*" element={<GeneratorApp />} />
                            <Route path="/learn/*" element={<LearnApp />} />
                            <Route path="/chat" element={<ChatPage />} />
                            <Route path="/docs" element={<DocsPage />} />
                            <Route path="*" element={<NotFound404 />} />
                        </Routes>
                        <AIFloatingWidget />
                    </BrowserRouter>
                </ToastProvider>
            </AIProviderWrapper>
        </ThemeProvider>
    </ErrorBoundary>
)

function AIProviderWrapper({ children }) {
    const [aiEnabled, setAiEnabled] = React.useState(false);

    React.useEffect(() => {
        fetch('/api/config?t=' + Date.now())
            .then(res => res.ok ? res.json() : null)
            .then(data => setAiEnabled(data?.aiEnabled || false))
            .catch(() => setAiEnabled(false));
    }, []);

    return <AIProvider enabled={aiEnabled}>{children}</AIProvider>;
}
