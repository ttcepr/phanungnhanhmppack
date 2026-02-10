
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DocumentManager from './components/DocumentManager';
import Notifications from './components/Notifications';
import EmployeeManager from './components/EmployeeManager';
import UserChatInterface from './components/UserChatInterface';
import Settings from './components/Settings';
import LoginHistory from './components/LoginHistory';
import AdminChat from './components/AdminChat';
import { Employee, AppSettings, LoginLog, DocumentData } from './types';
import { mockEmployees, mockLoginLogs, mockDocuments } from './services/mockData';
import { IconUsers, IconBox, IconLock } from './components/Icons';

const App: React.FC = () => {
  // Global Auth State
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // App Data State
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>(mockLoginLogs);
  const [documents, setDocuments] = useState<DocumentData[]>(mockDocuments);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  
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

  // --- CHECK LOCAL STORAGE ON MOUNT ---
  useEffect(() => {
      const savedUser = localStorage.getItem('codx_user');
      if (savedUser) {
          try {
              const userObj = JSON.parse(savedUser);
              // Update status to Online immediately on auto-login
              setEmployees(prev => prev.map(e => e.id === userObj.id ? {...e, status: 'Online'} : e));
              setCurrentUser(userObj);
              if(!userObj.isAdmin) setCurrentView('chat-user');
          } catch(e) {
              localStorage.removeItem('codx_user');
          }
      }
  }, []);

  // --- LOGIN LOGIC ---
  const handleLogin = () => {
      if (!loginId.trim() || !loginPassword.trim()) {
          alert("Vui lòng nhập đầy đủ Mã Nhân Viên và Mật khẩu");
          return;
      }
      
      const foundUser = employees.find(e => e.id.toLowerCase() === loginId.trim().toLowerCase());
      
      if (foundUser) {
          if (foundUser.password === loginPassword) {
            // Success
            const loggedInUser = {...foundUser, status: 'Online' as const};
            setCurrentUser(loggedInUser);
            
            // Update Global Employee List Status
            setEmployees(prev => prev.map(e => e.id === foundUser.id ? {...e, status: 'Online'} : e));
            
            // Log History
            const newLog: LoginLog = {
                id: `log-${Date.now()}`,
                userId: foundUser.id,
                userName: foundUser.name,
                timestamp: new Date().toISOString(),
                deviceInfo: navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Browser',
                status: 'Success'
            };
            setLoginLogs(prev => [newLog, ...prev]);

            // Handle Remember Me
            if (rememberMe) {
                localStorage.setItem('codx_user', JSON.stringify(loggedInUser));
            } else {
                localStorage.removeItem('codx_user');
            }

            // Redirect based on role
            if (!foundUser.isAdmin) {
                setCurrentView('chat-user');
            } else {
                setCurrentView('dashboard');
            }
          } else {
             alert("Mật khẩu không đúng!");
          }
      } else {
          alert("Mã nhân viên không tồn tại (Thử 'thai' / 'admin', 'NV001' / '123')");
      }
  };

  const handleLogout = () => {
      if(currentUser) {
          // Update status to offline
          setEmployees(prev => prev.map(e => e.id === currentUser.id ? {...e, status: 'Offline'} : e));
      }
      setCurrentUser(null);
      setLoginId('');
      setLoginPassword('');
      setRememberMe(false);
      localStorage.removeItem('codx_user');
      setCurrentView('dashboard');
  };

  // Function to save document changes (passed to children)
  const handleSaveDocument = (updatedDoc: DocumentData) => {
      setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
      // Call Google Script if needed
      // google.script.run.saveDocumentData(updatedDoc);
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
      setSettings(prev => ({ ...prev, lastSyncTime: now }));
  };

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
                            <div className="relative">
                                <IconUsers className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input 
                                    type="text" 
                                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-lg font-bold tracking-widest focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase text-gray-700"
                                    placeholder="VD: NV001"
                                    value={loginId}
                                    onChange={(e) => setLoginId(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && document.getElementById('pass-input')?.focus()}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mật khẩu</label>
                            <div className="relative">
                                <IconLock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input 
                                    id="pass-input"
                                    type="password" 
                                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700"
                                    placeholder="••••••"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input 
                                id="remember-me" 
                                type="checkbox" 
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label htmlFor="remember-me" className="ml-2 text-sm font-medium text-gray-900 select-none cursor-pointer">Ghi nhớ đăng nhập</label>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-700">
                            <p className="font-bold mb-1">Gợi ý đăng nhập (Demo):</p>
                            <ul className="list-disc list-inside">
                                <li>NV001 / 123 (Công nhân)</li>
                                <li>thai / admin (Quản lý)</li>
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

  // 2. EMPLOYEE VIEW
  if (!currentUser.isAdmin) {
      if (currentView === 'history') {
          return (
             <div className="h-screen w-screen bg-gray-100 relative flex flex-col">
                  <div className="bg-[#0060B6] p-4 text-white flex justify-between items-center shadow-md">
                      <button onClick={() => setCurrentView('chat-user')} className="flex items-center gap-1 font-bold text-sm">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                          Quay lại
                      </button>
                      <span className="font-bold">Lịch sử của tôi</span>
                      <div className="w-16"></div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                      <LoginHistory currentUser={currentUser} logs={loginLogs} />
                  </div>
             </div>
          )
      }

      return (
          <div className="h-screen w-screen bg-gray-100 overflow-hidden relative">
              <UserChatInterface 
                  user={currentUser} 
                  onLogout={handleLogout} 
              />
              <button 
                onClick={() => setCurrentView('history')}
                className="absolute bottom-4 left-4 bg-white p-3 rounded-full shadow-lg border border-gray-200 text-gray-600 z-50 hover:text-blue-600"
                title="Xem lịch sử đăng nhập"
              >
                  <IconBox className="w-6 h-6" />
              </button>
          </div>
      );
  }

  // 3. ADMIN VIEW
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
            ) : currentView === 'history' ? (
                <LoginHistory currentUser={currentUser} logs={loginLogs} />
            ) : currentView === 'settings' ? (
                <Settings settings={settings} onSaveSettings={setSettings} />
            ) : currentView === 'admin-chat' ? (
                <AdminChat 
                    currentUser={currentUser} 
                    employees={employees} 
                    documents={documents}
                    onSaveDocument={handleSaveDocument}
                />
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
