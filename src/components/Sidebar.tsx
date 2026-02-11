import React from 'react';
import { IconDashboard, IconFolder, IconBell, IconUsers, IconSettings } from './Icons';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const menuItems = [
    { id: 'dashboard', icon: <IconDashboard className="w-6 h-6" />, label: 'Dashboard' },
    { id: 'documents', icon: <IconFolder className="w-6 h-6" />, label: 'Khách hàng' },
    { id: 'notifications', icon: <IconBell className="w-6 h-6" />, label: 'Thông báo' },
    { id: 'employees', icon: <IconUsers className="w-6 h-6" />, label: 'Nhân viên' },
    { id: 'settings', icon: <IconSettings className="w-6 h-6" />, label: 'Thiết lập' },
  ];

  return (
    <div className="w-20 bg-[#0060B6] flex flex-col items-center py-6 text-white shrink-0 h-full shadow-lg z-20">
      <div className="mb-8 p-2 bg-white/10 rounded-xl">
         <IconDashboard className="w-8 h-8"/>
      </div>
      <div className="flex-1 flex flex-col gap-4 w-full items-center px-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`p-3 rounded-2xl w-full flex justify-center transition-all ${
              currentView === item.id 
                ? 'bg-white text-[#0060B6] shadow-lg scale-105' 
                : 'text-white/80 hover:bg-white/20'
            }`}
            title={item.label}
          >
            {item.icon}
          </button>
        ))}
      </div>
      <div className="mb-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">A</div>
      </div>
    </div>
  );
};

export default Sidebar;