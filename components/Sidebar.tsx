
import React from 'react';
import { IconDashboard, IconChart, IconFolder, IconBell, IconUsers, IconSettings, IconSend, IconLogout } from './Icons';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onLogout }) => {
  const bgColor = 'bg-[#0060B6]';

  const menuItems = [
    { id: 'dashboard', icon: <IconDashboard className="w-6 h-6" />, label: 'Dashboard' },
    { id: 'documents', icon: <IconFolder className="w-6 h-6" />, label: 'Khách hàng' },
    { id: 'notifications', icon: <IconBell className="w-6 h-6" />, label: 'Thông báo' },
    { id: 'reports', icon: <IconChart className="w-6 h-6" />, label: 'Báo cáo' },
    { id: 'employees', icon: <IconUsers className="w-6 h-6" />, label: 'Nhân viên' },
    { id: 'chat-user', icon: <IconSend className="w-6 h-6" />, label: 'Chat User Demo' }, 
    { id: 'settings', icon: <IconSettings className="w-6 h-6" />, label: 'Thiết lập' },
  ];

  return (
    <div className={`w-20 flex-shrink-0 flex flex-col items-center py-6 ${bgColor} text-white h-full shadow-xl`}>
      <div className="mb-8 p-2 bg-white/10 rounded-xl">
         <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
      </div>

      <div className="flex-1 flex flex-col gap-4 w-full items-center px-2 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`group relative flex items-center justify-center p-3 rounded-2xl transition-all duration-200 w-full ${
              currentView === item.id 
                ? 'bg-white text-[#0060B6] shadow-lg scale-105' 
                : 'text-white/80 hover:bg-white/20 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none transition-opacity shadow-lg">
                {item.label}
            </span>
            {item.id === 'notifications' && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse"></span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-auto pt-4 flex flex-col gap-2 border-t border-white/20 w-full items-center">
        <button 
            onClick={() => onChangeView('settings')}
            className={`p-3 rounded-xl transition ${currentView === 'settings' ? 'bg-white text-blue-600' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
        >
          <IconSettings className="w-6 h-6" />
        </button>
        <button 
            onClick={onLogout}
            className="p-3 text-red-200 hover:text-white rounded-xl hover:bg-red-500/20 transition" 
            title="Đăng xuất"
        >
          <IconLogout className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
