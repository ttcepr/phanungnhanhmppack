import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { dashboardStats } from '../services/mockData';
import { IconDocument, IconAlert, IconCheckCircle, IconPlus, IconPrinter } from './Icons';

const dataLine = [
  { name: 'T2', hoSo: 120 }, { name: 'T3', hoSo: 135 }, { name: 'T4', hoSo: 110 },
  { name: 'T5', hoSo: 155 }, { name: 'T6', hoSo: 140 }, { name: 'T7', hoSo: 180 }, { name: 'CN', hoSo: 95 }
];

const StatCard = ({ title, count, subtitle, icon, colorClass, trend }: { title: string, count: number, subtitle?: string, icon?: React.ReactNode, colorClass: string, trend?: string }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${colorClass}`}>{count}</span>
            {trend && <span className="text-xs text-green-500 font-medium">{trend}</span>}
        </div>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
    <div className={`p-3 rounded-xl ${colorClass.replace('text-', 'bg-').replace('600', '50').replace('500', '50')}`}>
        {icon}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleExportPdf = () => {
      setIsGeneratingPdf(true);
      setTimeout(() => {
          setIsGeneratingPdf(false);
          alert("MÔ PHỎNG: Đã xuất báo cáo PDF thành công!");
      }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 overflow-y-auto no-scrollbar pb-20 fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Tổng quan Hệ thống</h1>
            <p className="text-sm text-gray-500 mt-1">Cập nhật lúc {new Date().toLocaleTimeString()}</p>
        </div>
        <button 
            onClick={handleExportPdf}
            disabled={isGeneratingPdf}
            className={`bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition ${isGeneratingPdf ? 'opacity-50' : ''}`}
        >
            {isGeneratingPdf ? 'Đang tạo PDF...' : <><IconPrinter className="w-4 h-4 text-gray-600" /> Xuất Báo cáo PDF</>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Tổng số Hồ sơ" count={dashboardStats.totalRecords} subtitle="+12% so với tháng trước" colorClass="text-blue-600" icon={<IconDocument className="w-6 h-6 text-blue-600" />} />
        <StatCard title="Hồ sơ Mới" count={dashboardStats.newRecords} trend="+5" colorClass="text-indigo-600" icon={<IconPlus className="w-6 h-6 text-indigo-600" />} />
        <StatCard title="Cảnh báo / Lỗi" count={dashboardStats.errorStats.reduce((a, b) => a + b.errors, 0)} colorClass="text-red-500" icon={<IconAlert className="w-6 h-6 text-red-500" />} />
        <StatCard title="Chờ phê duyệt" count={dashboardStats.pending} colorClass="text-orange-500" icon={<IconCheckCircle className="w-6 h-6 text-orange-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-6">Lưu lượng xử lý (Bộ phận Sản xuất)</h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dataLine}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="hoSo" stroke="#2563EB" strokeWidth={3} dot={{r: 4}} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
             <h3 className="font-bold text-gray-800 mb-6">Trạng thái Phê duyệt</h3>
             <div className="flex-1 min-h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={dashboardStats.approvalStats} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {dashboardStats.approvalStats.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" />
                    </PieChart>
                 </ResponsiveContainer>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;