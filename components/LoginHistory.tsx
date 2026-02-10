
import React from 'react';
import { LoginLog, Employee } from '../types';
import { IconHistory, IconSearch, IconCheckCircle, IconAlert } from './Icons';

interface LoginHistoryProps {
    currentUser: Employee;
    logs: LoginLog[];
}

const LoginHistory: React.FC<LoginHistoryProps> = ({ currentUser, logs }) => {
    // If admin, show all logs. If user, show only their logs.
    const displayLogs = currentUser.isAdmin 
        ? logs 
        : logs.filter(log => log.userId === currentUser.id);

    return (
        <div className="flex flex-col h-full bg-gray-50 p-6 overflow-y-auto">
            <div className="mb-8 flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                    <IconHistory className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Lịch sử Đăng nhập</h1>
                    <p className="text-sm text-gray-500">
                        {currentUser.isAdmin 
                            ? 'Kiểm soát toàn bộ hoạt động đăng nhập của hệ thống' 
                            : 'Danh sách các lần bạn đã truy cập hệ thống'}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Simple Toolbar */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <div className="relative w-64">
                         <IconSearch className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                         <input type="text" placeholder="Tìm kiếm..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500" />
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                        Hiển thị {displayLogs.length} bản ghi
                    </div>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                        <tr>
                            <th className="p-4">Thời gian</th>
                            <th className="p-4">Người dùng</th>
                            <th className="p-4">Thiết bị / IP</th>
                            <th className="p-4 text-right">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {displayLogs.length > 0 ? (
                            displayLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 whitespace-nowrap text-gray-600 font-mono">
                                        {new Date(log.timestamp).toLocaleString('vi-VN')}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800">{log.userName}</div>
                                        {currentUser.isAdmin && (
                                            <div className="text-xs text-gray-400 font-mono">{log.userId}</div>
                                        )}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {log.deviceInfo}
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                            log.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {log.status === 'Success' ? <IconCheckCircle className="w-3 h-3"/> : <IconAlert className="w-3 h-3"/>}
                                            {log.status === 'Success' ? 'Thành công' : 'Thất bại'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                                    Chưa có dữ liệu lịch sử.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LoginHistory;
