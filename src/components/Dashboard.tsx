
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';
import { dashboardStats } from '../services/mockData';
import { IconDocument, IconAlert, IconCheckCircle, IconPlus, IconPrinter, IconX } from './Icons';

// Cập nhật dữ liệu: Chỉ còn 1 dòng dữ liệu cho Bộ phận Sản xuất (số lượng hồ sơ)
const dataLine = [
  { name: 'T2', hoSo: 120 },
  { name: 'T3', hoSo: 135 },
  { name: 'T4', hoSo: 110 },
  { name: 'T5', hoSo: 155 },
  { name: 'T6', hoSo: 140 },
  { name: 'T7', hoSo: 180 },
  { name: 'CN', hoSo: 95 },
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

// Preview Modal Component
const ReportPreviewModal = ({ onClose, onDownload, isDownloading }: { onClose: () => void, onDownload: () => void, isDownloading: boolean }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 fade-in">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-bounce-small">
            {/* Toolbar */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                    <IconPrinter className="w-5 h-5 text-blue-600"/>
                    <h3 className="font-bold text-gray-800">Xem trước Báo cáo</h3>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">
                    <IconX className="w-6 h-6"/>
                </button>
            </div>
            
            {/* Scrollable Content (A4 style simulation) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-100/50">
                <div className="bg-white p-8 md:p-12 shadow-lg mx-auto max-w-[210mm] min-h-[297mm] border border-gray-200 text-gray-800">
                    <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-blue-800 uppercase tracking-wide">MPPACK</h2>
                            <p className="text-xs text-gray-500 font-medium mt-1">HỆ THỐNG QUẢN LÝ SẢN XUẤT</p>
                        </div>
                        <div className="text-right">
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 uppercase">Báo Cáo Tổng Hợp</h1>
                            <p className="text-sm text-gray-500 italic mt-1">Ngày xuất: {new Date().toLocaleDateString('vi-VN')}</p>
                        </div>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-8 mb-10">
                        <div>
                            <h4 className="font-bold text-gray-700 border-b border-gray-200 pb-2 mb-3 text-sm uppercase">Tổng quan Hồ sơ</h4>
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Tổng số lượng:</td><td className="font-bold text-right text-lg">{dashboardStats.totalRecords}</td></tr>
                                    <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Mới tiếp nhận:</td><td className="font-bold text-right text-blue-600">{dashboardStats.newRecords}</td></tr>
                                    <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Chờ phê duyệt:</td><td className="font-bold text-right text-orange-500">{dashboardStats.pending}</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-700 border-b border-gray-200 pb-2 mb-3 text-sm uppercase">Tiến độ Xử lý</h4>
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Hoàn thành (Duyệt SX):</td><td className="font-bold text-green-600 text-right">70%</td></tr>
                                    <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Đang chỉnh sửa:</td><td className="font-bold text-yellow-600 text-right">20%</td></tr>
                                    <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Hủy / Tạm dừng:</td><td className="font-bold text-red-500 text-right">10%</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Detailed Stats */}
                    <div className="mb-12">
                        <h4 className="font-bold text-gray-700 border-b border-gray-200 pb-2 mb-4 text-sm uppercase">Chi tiết Lỗi & Cảnh báo (7 ngày qua)</h4>
                        <table className="w-full text-sm text-left border-collapse border border-gray-200">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="border border-gray-200 p-3 font-semibold">Thời gian</th>
                                    <th className="border border-gray-200 p-3 text-center font-bold text-red-600">Lỗi nghiêm trọng</th>
                                    <th className="border border-gray-200 p-3 text-center font-bold text-yellow-600">Cảnh báo</th>
                                    <th className="border border-gray-200 p-3 text-right font-semibold">Tổng cộng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardStats.errorStats.map((stat, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}>
                                        <td className="border border-gray-200 p-2 pl-3 font-medium">{stat.name}</td>
                                        <td className="border border-gray-200 p-2 text-center text-red-500">{stat.errors > 0 ? stat.errors : '-'}</td>
                                        <td className="border border-gray-200 p-2 text-center text-yellow-500">{stat.warnings > 0 ? stat.warnings : '-'}</td>
                                        <td className="border border-gray-200 p-2 text-right pr-3 font-bold text-gray-700">{stat.errors + stat.warnings}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-20 flex justify-between items-start text-sm">
                        <div className="text-center w-40">
                            <p className="font-bold mb-16 text-gray-800 uppercase">Người lập biểu</p>
                            <div className="border-t border-gray-300 w-full mx-auto"></div>
                            <p className="mt-2 text-gray-500">Nguyễn Văn A</p>
                        </div>
                        <div className="text-center w-40">
                            <p className="font-bold mb-16 text-gray-800 uppercase">Giám đốc sản xuất</p>
                            <div className="border-t border-gray-300 w-full mx-auto"></div>
                            <p className="mt-2 text-gray-500">(Ký & Đóng dấu)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3">
                <button 
                    onClick={onClose} 
                    className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition"
                    disabled={isDownloading}
                >
                    Hủy bỏ
                </button>
                <button 
                    onClick={onDownload} 
                    disabled={isDownloading}
                    className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition disabled:opacity-70"
                >
                    {isDownloading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            <IconPrinter className="w-5 h-5"/> Xác nhận Tải về
                        </>
                    )}
                </button>
            </div>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // 1. Click button -> Show Modal
  const handleOpenPreview = () => {
      setShowPreview(true);
  };

  // 2. Click Download inside Modal -> Run logic
  const handleConfirmDownload = () => {
      setIsGeneratingPdf(true);
      
      // Môi trường Vercel / Demo: Luôn chạy Simulation
      setTimeout(() => {
          setIsGeneratingPdf(false);
          setShowPreview(false);
          alert("Đã tải báo cáo PDF thành công!");
      }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 overflow-y-auto no-scrollbar pb-20 fade-in">
      
      {/* Report Preview Modal */}
      {showPreview && (
          <ReportPreviewModal 
              onClose={() => setShowPreview(false)} 
              onDownload={handleConfirmDownload}
              isDownloading={isGeneratingPdf}
          />
      )}

      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Tổng quan Hệ thống</h1>
            <p className="text-sm text-gray-500 mt-1">Cập nhật lúc {new Date().toLocaleTimeString()}</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleOpenPreview}
                className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition"
            >
                <IconPrinter className="w-4 h-4 text-gray-600" /> Xuất Báo cáo PDF
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition">
                <IconPlus className="w-4 h-4" /> Báo cáo nhanh
            </button>
        </div>
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
        {/* Main Traffic Chart - Single Line for Production Dept */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800">Lưu lượng xử lý (Bộ phận Sản xuất)</h3>
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
                    <Line type="monotone" dataKey="hoSo" name="Số lượng Hồ sơ" stroke="#2563EB" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
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
