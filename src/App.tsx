import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DocumentManager from './components/DocumentManager';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      <main className="flex-1 h-full overflow-hidden relative flex flex-col">
        <div className="flex-1 overflow-hidden">
            {currentView === 'dashboard' && <Dashboard />}
            {currentView === 'documents' && <DocumentManager />}
            {currentView === 'notifications' && <div className="p-10 text-center text-gray-400">Chức năng Thông báo đang phát triển</div>}
            {currentView === 'employees' && <div className="p-10 text-center text-gray-400">Chức năng Nhân viên đang phát triển</div>}
            {currentView === 'settings' && <div className="p-10 text-center text-gray-400">Chức năng Thiết lập đang phát triển</div>}
        </div>
      </main>
    </div>
  );
};

export default App;