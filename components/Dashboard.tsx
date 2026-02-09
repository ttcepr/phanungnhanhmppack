import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';
import { dashboardStats } from '../services/mockData';
import { IconDocument, IconAlert, IconCheckCircle, IconPlus } from './Icons';

const dataLine = [
  { name: 'T2', p21: 60, p22: 40, p81: 20 },
  { name: 'T3', p21: 65, p22: 30, p81: 35 },
  { name: 'T4', p21: 68, p22: 38, p81: 40 },
  { name: 'T5', p21: 75, p22: 48, p81: 42 },
  { name: 'T6', p21: 78, p22: 52, p81: 40 },
  { name: 'T7', p21: 85, p22: 60, p81: 62 },
  { name: 'CN', p21: 90, p22: 55, p81: 60 },
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
  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 overflow-y-auto no-scrollbar pb-20">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Tổng quan Hệ thống</h1>
            <p className="text-sm text-gray-500 mt-1">Cập nhật lúc {new Date().toLocaleTimeString()}</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition">
             <IconPlus className="w-4 h-4" /> Báo cáo nhanh
        </button>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
            title="Tổng số Hồ sơ" 
            count={dashboardStats.totalRecords} 
            subtitle="+12% so với tháng trước" 
            colorClass="text-blue-600" 
            icon={<IconDocument className="w-6 h-6 text-blue-600" />} 
        />
        <StatCard 
            title="Hồ sơ Mới (Hôm nay)" 
            count={dashboardStats.newRecords} 
            trend="+5"
            colorClass="text-indigo-600" 
            icon={<IconPlus className="w-6 h-6 text-indigo-600" />} 
        />
        <StatCard 
            title="Cảnh báo / Lỗi" 
            count={dashboardStats.errorStats.reduce((acc, curr) => acc + curr.errors, 0)} 
            subtitle="Cần kiểm tra ngay" 
            colorClass="text-red-500" 
            icon={<IconAlert className="w-6 h-6 text-red-500" />} 
        />
        <StatCard 
            title="Chờ phê duyệt" 
            count={dashboardStats.pending} 
            subtitle="Đang trong hàng đợi" 
            colorClass="text-orange-500" 
            icon={<IconCheckCircle className="w-6 h-6 text-orange-500" />} 
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Traffic Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800">Lưu lượng Xử lý Hồ sơ</h3>
                <select className="text-sm border-gray-200 rounded-md text-gray-500 bg-gray-50 border p-1 outline-none">
                    <option>Tuần này</option>
                    <option>Tháng này</option>
                </select>
            </div>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataLine}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                    <Line type="monotone" dataKey="p21" name="Phòng HCNS" stroke="#2563EB" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                    <Line type="monotone" dataKey="p22" name="Phòng Kế toán" stroke="#10B981" strokeWidth={3} dot={false} />
                    <Legend iconType="circle" />
                </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Approval Status Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
             <h3 className="font-bold text-gray-800 mb-6">Trạng thái Phê duyệt</h3>
             <div className="flex-1 min-h-[250px] relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={dashboardStats.approvalStats}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {dashboardStats.approvalStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                 </ResponsiveContainer>
                 {/* Center Text */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-8">
                     <div className="text-center">
                         <span className="block text-3xl font-bold text-gray-800">
                             {dashboardStats.approvalStats.reduce((a, b) => a + b.value, 0)}%
                         </span>
                         <span className="text-xs text-gray-500">Hoàn thành</span>
                     </div>
                 </div>
             </div>
        </div>
      </div>

      {/* Charts Row 2: Error Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <div className="w-2 h-6 bg-red-500 rounded-full"></div>
                 Biểu đồ Báo cáo Lỗi Hệ thống
             </h3>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardStats.errorStats} barSize={20}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                        <Tooltip cursor={{fill: '#F3F4F6'}} />
                        <Legend />
                        <Bar dataKey="errors" name="Lỗi nghiêm trọng" fill="#EF4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="warnings" name="Cảnh báo" fill="#FCD34D" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                 Hoạt động Gần đây
             </h3>
             <div className="space-y-4">
                 {[1, 2, 3, 4].map((i) => (
                     <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i % 2 === 0 ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                             {i % 2 === 0 ? <IconDocument className="w-5 h-5"/> : <IconCheckCircle className="w-5 h-5"/>}
                         </div>
                         <div className="flex-1">
                             <h4 className="text-sm font-semibold text-gray-800">Cập nhật hồ sơ nhân sự #{2020 + i}</h4>
                             <p className="text-xs text-gray-500">Vừa xong • Bởi Nguyễn Văn A</p>
                         </div>
                         <span className="text-xs font-medium text-gray-400">10:30 AM</span>
                     </div>
                 ))}
             </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;