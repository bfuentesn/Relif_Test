import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { ClientsView } from './components/ClientsView';
import { AssistantSettings } from './components/AssistantSettings';
import './App.css';

type ViewType = 'dashboard' | 'clients' | 'settings';

function App() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <ClientsView />;
      case 'settings':
        return <AssistantSettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      <div className="app-layout">
        <Navigation activeView={activeView} onViewChange={setActiveView} />
        <main className="main-content">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
