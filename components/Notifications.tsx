import React from 'react';
import { mockDocuments } from '../services/mockData';
import { DocStatus } from '../types';
import { IconBell, IconCheckCircle, IconAlert } from './Icons';

const Notifications: React.FC = () => {
  // Filter for items that need attention (Pending, Waiting, Urgent)
  const pendingDocs = mockDocuments.filter(doc => 
      doc.status === DocStatus.WAITING || 
      doc.status === DocStatus.PENDING ||
      doc.status === DocStatus.URGENT
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6 overflow-y-auto">
        <div className="mb-8 flex items-center gap-3">
             <div className="bg-red-100 p-3 rounded-xl text-red-600">
                <IconBell className="w-8 h-8" />
             </div>
             <div>
                 <h1 className="text-2xl font-bold text-gray-800">Thông báo Xét duyệt</h1>
                 <p className="text-sm text-gray-500">Danh sách các hồ sơ đang chờ Admin xử lý ({pendingDocs.length})</p>
             </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
                {pendingDocs.length > 0 ? (
                    pendingDocs.map(doc => (
                        <div key={doc.id} className="p-5 hover:bg-gray-50 transition flex items-start gap-4">
                            <div className={`mt-1 p-2 rounded-full ${doc.status === DocStatus.URGENT ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                {doc.status === DocStatus.URGENT ? <IconAlert className="w-5 h-5" /> : <IconBell className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-800">{doc.title}</h3>
                                    <span className="text-xs text-gray-400">{doc.arrivalDate}</span>
                                </div>
                                <p className="text-sm text-blue-600 font-medium mt-0.5">{doc.clientName} - {doc.brandName}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Mã: {doc.docNumber} • Trạng thái: 
                                    <span className={`ml-1 font-bold ${doc.status === DocStatus.URGENT ? 'text-red-600' : 'text-yellow-600'}`}>
                                        {doc.status}
                                    </span>
                                </p>
                            </div>
                            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition">
                                Xem chi tiết
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center">
                        <IconCheckCircle className="w-16 h-16 mx-auto text-green-200 mb-4" />
                        <h3 className="text-lg font-bold text-gray-400">Không có thông báo mới</h3>
                        <p className="text-gray-400">Tất cả hồ sơ đã được xử lý.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Notifications;