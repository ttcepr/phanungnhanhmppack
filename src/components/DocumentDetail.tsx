import React, { useState, useEffect, useRef } from 'react';
import { DocumentData, ChatMessage, DeptType, DocStatus } from '../types';
import { IconSend, IconImage, IconTransfer, IconBox, IconWave, IconInk, IconScissor, IconWarehouse, IconDatabase, IconCalendar } from './Icons';
import { compressImage } from '../utils/helpers';
import ImageViewer from './ImageViewer';

interface DocumentDetailProps {
  document: DocumentData | null;
  onSave: (doc: DocumentData) => void;
}

const tabs = ['Tổng quan', 'TCKT', 'Chát online', 'Duyệt'];
const deptOptions: DeptType[] = ['SÓNG', 'IN', 'THÀNH PHẨM', 'KHO'];

const DocumentDetail: React.FC<DocumentDetailProps> = ({ document, onSave }) => {
  const [activeTab, setActiveTab] = useState('Tổng quan');
  const [formData, setFormData] = useState<DocumentData | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (document) {
      setFormData({ ...document });
      setActiveTab('Tổng quan');
    }
  }, [document]);

  if (!formData) return <div className="flex flex-col h-full items-center justify-center text-gray-400">Chọn hồ sơ để xem chi tiết</div>;

  const handleSendChat = () => {
      if(!chatInput.trim()) return;
      const newMsg: ChatMessage = { id: Date.now().toString(), user: 'Admin', avatar: '', message: chatInput, timestamp: new Date().toLocaleTimeString(), isMe: true };
      const updatedHistory = [...(formData.history || []), newMsg];
      setFormData(prev => prev ? {...prev, history: updatedHistory} : null);
      setChatInput('');
  };

  const handleExportToSheet = () => {
      setIsExporting(true);
      setTimeout(() => {
          setIsExporting(false);
          alert("MÔ PHỎNG: Xuất file Google Sheet thành công!");
      }, 1500);
  };

  const renderDeptIcon = (dept: DeptType) => {
      switch(dept) {
          case 'SÓNG': return <IconWave className="w-4 h-4 text-orange-500" />;
          case 'IN': return <IconInk className="w-4 h-4 text-cyan-500" />;
          case 'THÀNH PHẨM': return <IconScissor className="w-4 h-4 text-purple-500" />;
          case 'KHO': return <IconWarehouse className="w-4 h-4 text-green-500" />;
      }
  }

  return (
    <div className="flex flex-col h-full bg-white relative w-full overflow-hidden fade-in">
      {viewImage && <ImageViewer src={viewImage} onClose={() => setViewImage(null)} />}
      
      {/* Header */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white sticky top-0 z-10 shadow-sm flex-shrink-0">
          <div>
              <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2 truncate">{formData.title}</h2>
              <div className="text-xs text-gray-500 flex gap-2"><span>{formData.clientName}</span> | <span>{formData.brandName}</span></div>
          </div>
          <button onClick={handleExportToSheet} disabled={isExporting} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-green-700 transition">
              {isExporting ? 'Đang tạo...' : <><IconDatabase className="w-4 h-4"/> Xuất Sheet</>}
          </button>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b bg-gray-50/50 flex gap-8 flex-shrink-0 overflow-x-auto">
          {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`py-4 text-sm font-bold border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500'}`}>{tab}</button>
          ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-100/50">
          {activeTab === 'Tổng quan' && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div><label className="text-xs font-bold text-gray-500 block mb-1">Mã SP</label><input type="text" readOnly value={formData.docNumber} className="w-full bg-gray-100 border rounded p-2 text-sm"/></div>
                      <div><label className="text-xs font-bold text-gray-500 block mb-1">Tên SP</label><input type="text" readOnly value={formData.title} className="w-full bg-gray-100 border rounded p-2 text-sm"/></div>
                      <div><label className="text-xs font-bold text-blue-600 block mb-1">Phiếu SX</label><input type="text" value={formData.productionOrder || ''} onChange={(e) => setFormData(prev => prev ? {...prev, productionOrder: e.target.value} : null)} className="w-full border border-blue-300 rounded p-2 text-sm font-bold"/></div>
                  </div>
                  <div className="mt-6 border-t pt-4">
                      <h3 className="font-bold text-gray-800 mb-2">Thông số kỹ thuật</h3>
                      <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto">{JSON.stringify(formData.specs, null, 2)}</pre>
                  </div>
              </div>
          )}
          
          {activeTab === 'Chát online' && (
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col max-w-3xl mx-auto">
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                      {(formData.history || []).map((msg, idx) => (
                          <div key={idx} className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                              <div className={`p-3 rounded-2xl max-w-[80%] text-sm shadow-sm ${msg.isMe ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                  {msg.message}
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="p-4 border-t flex gap-2 bg-gray-50">
                      <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChat()} className="flex-1 border rounded-full px-4 py-2 text-sm outline-none" placeholder="Nhập tin nhắn..." />
                      <button onClick={handleSendChat} className="bg-blue-600 text-white p-2 rounded-full"><IconSend className="w-5 h-5"/></button>
                  </div>
               </div>
          )}

          {activeTab === 'Duyệt' && (
               <div className="space-y-6">
                   <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                       <h4 className="font-bold text-gray-800 flex items-center gap-2 text-lg"><IconTransfer className="w-6 h-6 text-blue-600" />Phê duyệt & Ghi nhận Lỗi</h4>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {deptOptions.map((dept) => (
                           <div key={dept} className="bg-white border rounded-xl p-4 shadow-sm">
                               <div className="flex items-center gap-2 font-bold text-gray-700 mb-3">{renderDeptIcon(dept)}{dept}</div>
                               <input type="text" placeholder="Nội dung lỗi..." className="w-full text-sm border border-gray-200 rounded p-2 mb-2 outline-none"/>
                               <input type="text" placeholder="Cách khắc phục..." className="w-full text-sm border border-gray-200 rounded p-2 outline-none"/>
                               <button className="w-full mt-2 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold">Lưu {dept}</button>
                           </div>
                       ))}
                   </div>
               </div>
          )}
          
          {activeTab === 'TCKT' && (
              <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <IconCalendar className="w-12 h-12 mx-auto mb-2 opacity-20"/>
                  <p>Chưa có dữ liệu TCKT. Hãy chat với cú pháp "TCKT: ..." để thêm mới.</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default DocumentDetail;