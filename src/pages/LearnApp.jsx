import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../learn/components/Sidebar.jsx';
import Navbar from '../learn/components/Navbar.jsx';
import Terminal from '../learn/components/Terminal.jsx';

import LearnDashboard from '../learn/pages/LearnDashboard.jsx';
import ModulePage from '../learn/pages/ModulePage.jsx';

import ResourcesPage from '../learn/pages/ResourcesPage.jsx';

export default function LearnApp() {
    const [termVisible, setTermVisible] = useState(false);

    return (
        <div style={{ 
            height: 'calc(100vh - 64px)', /* subtract GlobalNav height */
            display: 'flex', 
            overflow: 'hidden', 
            background: 'var(--bg-app)' 
        }}>
            <Sidebar />
            
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minWidth: 0 }}>
                <Navbar 
                    termVisible={termVisible} 
                    toggleTerm={() => setTermVisible(!termVisible)}
                />
                
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <Routes>
                        <Route index element={<LearnDashboard />} />
                        <Route path="modules/:id/*" element={<ModulePage />} />
                        <Route path="resources" element={<ResourcesPage />} />
                        <Route path="*" element={<Navigate to="/learn" replace />} />
                    </Routes>
                    
                    <Terminal 
                        isVisible={termVisible} 
                        toggleVisibility={() => setTermVisible(false)} 
                    />
                </div>
            </main>
        </div>
    );
}
