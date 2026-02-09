import React from 'react';
import { IconUsers, IconPlus, IconSearch } from './Icons';
import { mockEmployees } from '../services/mockData';

const EmployeeManager: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-gray-50 p-6 overflow-y-auto">
         <div className="flex justify-between items-end mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Nhân viên</h1>
                <p className="text-sm text-gray-500 mt-1">Danh sách nhân sự và phân quyền</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition">
                <IconPlus className="w-4 h-4" /> Thêm nhân viên
            </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             {/* Search Bar */}
             <div className="p-4 border-b border-gray-100 flex gap-2">
                 <div className="relative flex-1">
                    <IconSearch className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Tìm kiếm nhân viên (Tên hoặc Mã NV)..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" />
                 </div>
             </div>

             <table className="w-full text-left">
                 <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                     <tr>
                         <th className="p-4 w-28">Mã NV</th>
                         <th className="p-4">Tên nhân viên</th>
                         <th className="p-4">Chức vụ / Bộ phận</th>
                         <th className="p-4">Trạng thái</th>
                         <th className="p-4 text-right">Hành động</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                     {mockEmployees.map(emp => (
                         <tr key={emp.id} className="hover:bg-gray-50">
                             <td className="p-4 font-mono font-semibold text-blue-600">{emp.id}</td>
                             <td className="p-4 flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                                     <img src={emp.avatar} alt="avatar" className="w-full h-full object-cover" />
                                 </div>
                                 <span className="font-medium text-gray-800">{emp.name}</span>
                             </td>
                             <td className="p-4 text-gray-600">
                                 <div className="flex flex-col">
                                     <span className="font-medium text-sm">{emp.role}</span>
                                     <span className="text-xs text-gray-400">{emp.dept}</span>
                                 </div>
                             </td>
                             <td className="p-4">
                                 <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                     emp.status === 'Online' ? 'bg-green-100 text-green-700' :
                                     emp.status === 'Busy' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                 }`}>
                                     {emp.status}
                                 </span>
                             </td>
                             <td className="p-4 text-right">
                                 <button className="text-gray-400 hover:text-blue-600">Sửa</button>
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
        </div>
    </div>
  );
};

export default EmployeeManager;