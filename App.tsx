
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DocumentManager from './components/DocumentManager';
import Notifications from './components/Notifications';
import EmployeeManager from './components/EmployeeManager';
import UserChatInterface from './components/UserChatInterface';
import Settings from './components/Settings';
import { Employee, AppSettings } from './types';
import { mockEmployees } from './services/mockData';
import { IconUsers, IconBox } from './components/Icons';

const App: React.FC = () => {
  // Global Auth State
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [loginId, setLoginId] = useState('');
  
  // App View State
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle

  // Settings & Backup State
  const [settings, setSettings] = useState<AppSettings>({
      enableLocalBackup: true,
      syncIntervalMinutes: 60,
      googleDriveFolder: 'CoDX_App_Images',
      lastSyncTime: '',
      autoSaveToSheet: true
  });
  
  // Timer Ref
  const syncTimerRef = useRef<any>(null);

  // --- LOGIN LOGIC ---
  const handleLogin = () => {
      if (!loginId.trim()) {
          alert("Vui lòng nhập Mã Nhân Viên");
          return;
      }
      
      const foundUser = mockEmployees.find(e => e.id.toLowerCase() === loginId.trim().toLowerCase());
      if (foundUser) {
          setCurrentUser(foundUser);
          // Redirect based on role
          if (!foundUser.isAdmin) {
              setCurrentView('chat-user');
          } else {
              setCurrentView('dashboard');
          }
      } else {
          alert("Mã nhân viên không tồn tại (Thử 'thai' cho Admin, 'NV001' cho NV)");
      }
  };

  const handleLogout = () => {
      setCurrentUser(null);
      setLoginId('');
      setCurrentView('dashboard');
  };

  // --- BACKUP & SYNC LOGIC ---

  // 1. Initialize Sync Timer based on Settings
  useEffect(() => {
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);

      if (settings.autoSaveToSheet && settings.syncIntervalMinutes > 0) {
          const ms = settings.syncIntervalMinutes * 60 * 1000;
          syncTimerRef.current = setInterval(() => {
              performPeriodicSync();
          }, ms);
          console.log(`[System] Sync timer set for every ${settings.syncIntervalMinutes} minutes.`);
      }

      return () => {
          if (syncTimerRef.current) clearInterval(syncTimerRef.current);
      };
  }, [settings.syncIntervalMinutes, settings.autoSaveToSheet]);

  // 2. Mock Periodic Sync Function
  const performPeriodicSync = () => {
      const now = new Date().toLocaleTimeString();
      console.log(`[System] Auto-syncing to Google Sheets at ${now}...`);
      
      // In a real app, you might batch-save pending changes here.
      // Since our saveDocumentData saves instantly, this serves as a redundancy check or full refresh.
      
      setSettings(prev => ({ ...prev, lastSyncTime: now }));
  };

  // 3. Local Backup Logic (Mock)
  useEffect(() => {
      if (settings.enableLocalBackup) {
          // In a real browser environment, we would save to localStorage here
          // whenever data changes. For now, we simulate the "Backup Parallel"
          // concept by logging readiness.
          // localStorage.setItem('codx_backup', JSON.stringify(appData));
      }
  }, [settings.enableLocalBackup]);


  // --- VIEW RENDERING ---
  
  // 1. LOGIN SCREEN (If not logged in)
  if (!currentUser) {
      return (
          <div className="h-screen w-screen bg-gray-50 flex flex-col justify-center items-center p-4">
              <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 text-center space-y-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600 mb-4 animate-bounce">
                        <IconUsers className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">PHẢN ỨNG NHANH - MPPACK</h1>
                    <p className="text-gray-500 text-sm">Hệ thống Quản lý Sản xuất & Hồ sơ</p>
                    
                    <div className="space-y-4 text-left">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mã Nhân Viên</label>
                            <input 
                                type="text" 
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg font-bold text-center tracking-widest focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                                placeholder="VD: NV001"
                                value={loginId}
                                onChange={(e) => setLoginId(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            />
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-700">
                            <p className="font-bold mb-1">Gợi ý đăng nhập (Demo):</p>
                            <ul className="list-disc list-inside">
                                <li>NV001 - Công nhân (Vào Chat)</li>
                                <li>thai - Quản lý (Vào Admin)</li>
                            </ul>
                        </div>
                    </div>

                    <button 
                        onClick={handleLogin}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg"
                    >
                        Đăng Nhập
                    </button>
              </div>
          </div>
      );
  }

  // 2. EMPLOYEE VIEW (Chat Interface ONLY)
  if (!currentUser.isAdmin) {
      return (
          <div className="h-screen w-screen bg-gray-100 overflow-hidden relative">
              <UserChatInterface 
                  user={currentUser} 
                  onLogout={handleLogout} 
              />
          </div>
      );
  }

  // 3. ADMIN VIEW (Dashboard + Sidebar)
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100 relative">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar - Responsive */}
      <div className={`
          fixed md:relative z-50 h-full transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
          <Sidebar currentView={currentView} onChangeView={(view) => { setCurrentView(view); setIsSidebarOpen(false); }} onLogout={handleLogout} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-hidden relative flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden bg-[#0060B6] p-4 text-white flex justify-between items-center shadow-md">
            <button onClick={() => setIsSidebarOpen(true)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="font-bold text-lg">MPPACK Manager</span>
            <div className="w-6"></div> {/* Spacer */}
        </div>

        <div className="flex-1 overflow-hidden">
            {currentView === 'dashboard' ? (
                <Dashboard />
            ) : currentView === 'notifications' ? (
                <Notifications />
            ) : currentView === 'employees' ? (
                <EmployeeManager />
            ) : currentView === 'settings' ? (
                <Settings settings={settings} onSaveSettings={setSettings} />
            ) : currentView === 'chat-user' ? (
                <div className="h-full w-full flex items-center justify-center bg-gray-200 p-4">
                    <div className="w-full max-w-md h-full rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-300">
                            <UserChatInterface user={currentUser} onLogout={() => setCurrentView('dashboard')} />
                    </div>
                </div>
            ) : currentView === 'new-document' ? (
                <DocumentManager initialMode="create" />
            ) : (
                <DocumentManager initialMode="list" />
            )}
        </div>
      </main>
    </div>
  );
};

export default App;
