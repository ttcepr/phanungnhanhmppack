
import React, { useState, useEffect, useRef } from 'react';
import { DocumentData, ChatMessage, SavedRecord, DeptType, ProductionError, DraftItem, TCKTRecord, DocStatus } from '../types';
import { IconSave, IconSend, IconUpload, IconCheck, IconImage, IconTransfer, IconBox, IconWave, IconInk, IconScissor, IconWarehouse, IconPlus, IconSettings, IconUsers, IconCalendar, IconDatabase } from './Icons';
import { compressImage } from '../utils/helpers';
import ImageViewer from './ImageViewer';

interface DocumentDetailProps {
  document: DocumentData | null;
  onSave: (doc: DocumentData) => void;
}

const tabs = ['Tổng quan', 'TCKT', 'Chát online', 'Duyệt'];

// Dept options
const deptOptions: DeptType[] = ['SÓNG', 'IN', 'THÀNH PHẨM', 'KHO'];

// Type for storing form data per department
type DeptReviewData = {
    content: string;
    solution: string;
}

const DocumentDetail: React.FC<DocumentDetailProps> = ({ document, onSave }) => {
  const [activeTab, setActiveTab] = useState('Tổng quan');
  const [formData, setFormData] = useState<DocumentData | null>(null);
  
  // Simulated Current User Role
  const [currentUserDept, setCurrentUserDept] = useState<DeptType>('IN');

  const [chatInput, setChatInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Review/Approval Form States - Now Per Department
  const [deptForms, setDeptForms] = useState<Record<DeptType, DeptReviewData>>({
      'SÓNG': { content: '', solution: '' },
      'IN': { content: '', solution: '' },
      'THÀNH PHẨM': { content: '', solution: '' },
      'KHO': { content: '', solution: '' }
  });
  
  // Editing State
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  
  // Image Viewer State
  const [viewImage, setViewImage] = useState<string | null>(null);
  
  // Export State
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (document) {
      setFormData({ ...document });
      // Reset form states
      setDeptForms({
          'SÓNG': { content: '', solution: '' },
          'IN': { content: '', solution: '' },
          'THÀNH PHẨM': { content: '', solution: '' },
          'KHO': { content: '', solution: '' }
      });
      setEditingRecordId(null);
      setActiveTab('Tổng quan');
    }
  }, [document]);

  if (!formData) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gray-50 text-gray-400">
        <IconBox className="w-20 h-20 mb-4 opacity-20" />
        <p className="font-medium text-lg">Chọn một Hồ sơ Nhãn hàng để xem chi tiết</p>
        <p className="text-sm">Danh sách khách hàng ở cột bên trái</p>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  // --- EXPORT TO SHEET LOGIC ---
  const handleExportToSheet = () => {
      if (!formData) return;
      
      const confirmMsg = "Bạn có chắc chắn muốn duyệt và tạo hồ sơ Google Sheet không?\nHệ thống sẽ tạo 1 file riêng và upload toàn bộ hình ảnh lên đó.";
      if (!confirm(confirmMsg)) return;

      setIsExporting(true);
      
      // Update status locally first
      const updatedDoc = {
          ...formData,
          status: DocStatus.APPROVED
      };
      setFormData(updatedDoc);
      
      // Call Google Script
      // @ts-ignore
      if (typeof google !== 'undefined' && google.script) {
          // @ts-ignore
          google.script.run
            .withSuccessHandler((response: any) => {
                setIsExporting(false);
                if (response.success) {
                    const finalDoc = { ...updatedDoc, spreadsheetUrl: response.url };
                    setFormData(finalDoc);
                    onSave(finalDoc);
                    alert(`Đã xuất hồ sơ thành công!\nFile: ${response.name}`);
                    window.open(response.url, '_blank');
                } else {
                    alert('Lỗi khi xuất file: ' + response.error);
                }
            })
            .withFailureHandler((err: any) => {
                setIsExporting(false);
                alert('Lỗi hệ thống: ' + err);
            })
            .createDocumentSpreadsheet(updatedDoc);
      } else {
          // Fallback for local dev
          setTimeout(() => {
              setIsExporting(false);
              alert("Chức năng này cần chạy trên môi trường Google Apps Script.");
          }, 1000);
      }
  };

  // --- CHAT LOGIC ---
  const handleSendChat = () => {
      if(!chatInput.trim() || !formData.history) return;
      
      const now = new Date();
      const timestamp = `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
      const dateKey = now.toISOString().split('T')[0];
      const isTCKT = chatInput.toUpperCase().startsWith('TCKT:');

      const newMsg: ChatMessage = {
          id: Date.now().toString(),
          user: `Nhân viên ${currentUserDept}`,
          avatar: 'https://picsum.photos/40/40?random=99',
          message: chatInput,
          timestamp: timestamp,
          isMe: true
      };
      
      const updatedHistory = [...formData.history, newMsg];
      
      // Auto transfer to Persistent Draft Queue
      const newDraft: DraftItem = {
          id: `draft-${Date.now()}`,
          type: 'text',
          content: chatInput,
          timestamp: timestamp,
          autoDept: currentUserDept
      };
      const updatedDrafts = [...(formData.draftQueue || []), newDraft];

      // Logic TCKT: If text starts with TCKT:
      let updatedTCKT = formData.tcktRecords || [];
      if (isTCKT) {
          const tcktContent = chatInput.substring(5).trim();
          const newTCKT: TCKTRecord = {
              id: `tckt-${Date.now()}`,
              timestamp: timestamp,
              date: dateKey,
              productionOrder: formData.productionOrder || 'N/A',
              user: `Nhân viên ${currentUserDept}`,
              content: tcktContent,
              images: []
          };
          updatedTCKT = [...updatedTCKT, newTCKT];
      }

      setFormData(prev => prev ? { ...prev, history: updatedHistory, draftQueue: updatedDrafts, tcktRecords: updatedTCKT } : null);
      onSave({ ...formData, history: updatedHistory, draftQueue: updatedDrafts, tcktRecords: updatedTCKT });
      
      if(isTCKT) alert("Đã lưu vào Tiêu Chuẩn Kỹ Thuật (TCKT)");
      setChatInput('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && formData.history) {
          const file = e.target.files[0];
          const isTCKT = chatInput.toUpperCase().startsWith('TCKT:'); // Check input box for TCKT tag

          compressImage(file).then(resultStr => {
             const now = new Date();
             const timestamp = `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
             const dateKey = now.toISOString().split('T')[0];

             const newMsg: ChatMessage = {
                id: Date.now().toString(),
                user: `Nhân viên ${currentUserDept}`,
                avatar: 'https://picsum.photos/40/40?random=99',
                message: isTCKT ? `TCKT Image: ${chatInput}` : 'Đã gửi một hình ảnh',
                image: resultStr,
                timestamp: timestamp,
                isMe: true
            };
            
            const updatedHistory = [...(formData.history || []), newMsg];
            
            const newDraft: DraftItem = {
                id: `draft-${Date.now()}`,
                type: 'image',
                content: resultStr,
                timestamp: timestamp,
                autoDept: currentUserDept
            };
            const updatedDrafts = [...(formData.draftQueue || []), newDraft];

            // TCKT Logic for Image
            let updatedTCKT = formData.tcktRecords || [];
            if (isTCKT) {
                const tcktContent = chatInput.substring(5).trim() || 'Hình ảnh TCKT';
                const newTCKT: TCKTRecord = {
                    id: `tckt-${Date.now()}`,
                    timestamp: timestamp,
                    date: dateKey,
                    productionOrder: formData.productionOrder || 'N/A',
                    user: `Nhân viên ${currentUserDept}`,
                    content: tcktContent,
                    images: [resultStr]
                };
                updatedTCKT = [...updatedTCKT, newTCKT];
                setChatInput(''); // Clear input if it was used for TCKT tag
            }

            setFormData(prev => prev ? { ...prev, history: updatedHistory, draftQueue: updatedDrafts, tcktRecords: updatedTCKT } : null);
            onSave({ ...formData, history: updatedHistory, draftQueue: updatedDrafts, tcktRecords: updatedTCKT });
            
            if (isTCKT) alert(`Đã lưu hình ảnh vào TCKT`);
            else alert(`Đã chuyển ảnh sang tab 'Duyệt' vào bộ phận ${currentUserDept}`);
          }).catch(err => {
              console.error("Image compression error", err);
              alert("Lỗi khi xử lý hình ảnh");
          });
      }
  };

  // --- REVIEW TAB LOGIC ---
  const updateDeptForm = (dept: DeptType, field: keyof DeptReviewData, value: string) => {
      setDeptForms(prev => ({
          ...prev,
          [dept]: { ...prev[dept], [field]: value }
      }));
  };

  const handleSaveDept = (dept: DeptType) => {
      if (!formData) return;
      
      const form = deptForms[dept];
      const todayStr = new Date().toLocaleDateString('en-GB'); 
      const currentPO = formData.productionOrder || 'N/A';

      const relevantDrafts = (formData.draftQueue || []).filter(d => d.autoDept === dept);
      const images = relevantDrafts.filter(d => d.type === 'image').map(d => d.content);
      const textDrafts = relevantDrafts.filter(d => d.type === 'text').map(d => d.content).join('\n');
      
      const finalContent = form.content || textDrafts || `Ghi nhận tại bộ phận ${dept}`;

      if (!finalContent && images.length === 0 && !form.solution) {
          alert(`Vui lòng nhập nội dung hoặc có hình ảnh cho bộ phận ${dept}`);
          return;
      }

      const record: SavedRecord = {
          id: `REC-${dept}-${Date.now()}`,
          timestamp: todayStr, 
          productionOrder: currentPO, 
          source: 'Chat',
          dept: dept,
          content: finalContent,
          solution: form.solution,
          images: images
      };

      const errorLog: ProductionError = {
          id: `ERR-${dept}-${Date.now()}`,
          date: todayStr,
          productionOrder: currentPO,
          dept: dept,
          errorContent: finalContent,
          solution: form.solution
      };
      
      const updatedSavedRecords = [record, ...(formData.savedRecords || [])];
      const updatedErrorLogs = [...(formData.errorLog || []), errorLog];
      
      const usedDraftIds = relevantDrafts.map(d => d.id);
      const remainingDrafts = (formData.draftQueue || []).filter(d => !usedDraftIds.includes(d.id));

      setFormData({
          ...formData,
          savedRecords: updatedSavedRecords,
          errorLog: updatedErrorLogs,
          draftQueue: remainingDrafts
      });
      
      setDeptForms(prev => ({
          ...prev,
          [dept]: { content: '', solution: '' }
      }));
      
      onSave({...formData, savedRecords: updatedSavedRecords, errorLog: updatedErrorLogs, draftQueue: remainingDrafts});
      alert(`Đã lưu cho ${dept} (Phiếu: ${currentPO})!`);
  };

  // --- OVERVIEW TAB LOGIC ---
  const getGroupedRecords = () => {
      const groups: Record<string, Record<string, { saved?: SavedRecord, error?: ProductionError }[]>> = {};
      
      const processItem = (date: string, po: string, type: 'saved' | 'error', item: any) => {
          if (!groups[date]) groups[date] = {};
          if (!groups[date][po]) groups[date][po] = [];
      };

      formData?.savedRecords?.forEach(r => {
          const date = r.timestamp.split(' ')[0];
          const po = r.productionOrder || 'N/A';
          processItem(date, po, 'saved', r);
      });

      formData?.errorLog?.forEach(e => {
          const po = e.productionOrder || formData.productionOrder || 'N/A'; 
          processItem(e.date, po, 'error', e);
      });

      if (Object.keys(groups).length === 0) {
          const today = new Date().toLocaleDateString('en-GB');
          groups[today] = { [formData?.productionOrder || 'N/A']: [] };
      }

      return Object.entries(groups)
        .sort((a, b) => b[0].localeCompare(a[0])) 
        .map(([date, poMap]) => ({
            date,
            pos: Object.keys(poMap).sort()
        }));
  };

  // --- TCKT GROUPING LOGIC ---
  const getGroupedTCKT = () => {
      const records = formData.tcktRecords || [];
      const grouped: Record<string, Record<string, TCKTRecord[]>> = {};

      records.forEach(rec => {
          const date = rec.date; // YYYY-MM-DD
          const po = rec.productionOrder || 'N/A';
          if (!grouped[date]) grouped[date] = {};
          if (!grouped[date][po]) grouped[date][po] = [];
          grouped[date][po].push(rec);
      });

      return Object.entries(grouped)
          .sort((a, b) => b[0].localeCompare(a[0]))
          .map(([date, poMap]) => ({
              date,
              pos: Object.entries(poMap).map(([po, items]) => ({ po, items }))
          }));
  };

  const renderDeptIcon = (dept: DeptType) => {
      switch(dept) {
          case 'SÓNG': return <IconWave className="w-4 h-4 text-orange-500" />;
          case 'IN': return <IconInk className="w-4 h-4 text-cyan-500" />;
          case 'THÀNH PHẨM': return <IconScissor className="w-4 h-4 text-purple-500" />;
          case 'KHO': return <IconWarehouse className="w-4 h-4 text-green-500" />;
      }
  }

  const getDeptColor = (dept: DeptType) => {
       switch(dept) {
          case 'SÓNG': return 'text-orange-700 bg-orange-50 border-orange-200';
          case 'IN': return 'text-cyan-700 bg-cyan-50 border-cyan-200';
          case 'THÀNH PHẨM': return 'text-purple-700 bg-purple-50 border-purple-200';
          case 'KHO': return 'text-green-700 bg-green-50 border-green-200';
      }
  }

  const groupedData = getGroupedRecords();
  const tcktData = getGroupedTCKT();

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Image Viewer */}
      {viewImage && <ImageViewer src={viewImage} onClose={() => setViewImage(null)} />}

      {/* Detail Header / Toolbar */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex flex-col min-w-0">
             <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-0.5">
                 <span>{formData.clientName}</span>
                 <span className="text-gray-300">/</span>
                 <span>{formData.brandName}</span>
             </div>
             <h2 className="font-bold text-gray-800 text-lg truncate flex items-center gap-2">
                <IconBox className="w-5 h-5 text-gray-500" />
                {formData.title}
                {formData.spreadsheetUrl && (
                    <a href={formData.spreadsheetUrl} target="_blank" rel="noreferrer" title="Mở Google Sheet" className="text-green-600 hover:text-green-700">
                        <IconDatabase className="w-5 h-5" />
                    </a>
                )}
             </h2>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
             <button 
                onClick={handleExportToSheet}
                disabled={isExporting}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition shadow-sm ${isExporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
             >
                {isExporting ? (
                    <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang tạo file...
                    </>
                ) : (
                    <>
                        <IconDatabase className="w-4 h-4" />
                        Duyệt & Xuất Sheet
                    </>
                )}
             </button>
             <div className="flex items-center bg-gray-100 rounded-lg px-2 py-1 border border-gray-200">
                <IconUsers className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-xs text-gray-500 mr-2 hidden md:inline">Admin View</span>
             </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-gray-200 bg-gray-50/50">
        <div className="flex gap-8 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-100/50">

        {activeTab === 'Tổng quan' && (
            <div className="space-y-6 max-w-6xl mx-auto">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Thông tin Sản Xuất</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Mã Sản Phẩm</label>
                            <input type="text" readOnly value={formData.docNumber} className="w-full bg-gray-100 border border-gray-200 text-gray-600 rounded-lg p-2.5 font-mono cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Tên Sản Phẩm</label>
                            <input type="text" readOnly value={formData.title} className="w-full bg-gray-100 border border-gray-200 text-gray-600 rounded-lg p-2.5 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-blue-600 mb-1">Phiếu Sản Xuất</label>
                            <input 
                                type="text" 
                                name="productionOrder"
                                value={formData.productionOrder || ''} 
                                onChange={handleInputChange}
                                className="w-full bg-white border border-blue-300 text-gray-800 rounded-lg p-2.5 outline-none font-bold" 
                            />
                        </div>
                    </div>
                </div>

                {/* Error Logs Matrix */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Nhật Ký Lỗi & Khắc Phục</h3>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase">
                                    <th className="p-3 border-r border-gray-200 w-24 text-center">Ngày</th>
                                    <th className="p-3 border-r border-gray-200 w-32 text-center text-blue-700">Phiếu SX</th>
                                    <th className="p-3 border-r border-gray-200 w-[40%]">Chi tiết Lỗi</th>
                                    <th className="p-3 w-[40%]">Khắc phục</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {groupedData.map((group) => (
                                    <React.Fragment key={group.date}>
                                        {group.pos.map((po, poIndex) => (
                                            <React.Fragment key={`${group.date}-${po}`}>
                                                {deptOptions.map((dept, deptIndex) => {
                                                    const record = formData.savedRecords?.find(r => 
                                                        r.timestamp.includes(group.date) && 
                                                        (r.productionOrder === po || (!r.productionOrder && po === 'N/A')) &&
                                                        r.dept === dept
                                                    );
                                                    const errLog = !record ? formData.errorLog?.find(e => 
                                                        e.date === group.date && 
                                                        (e.productionOrder === po || (!e.productionOrder && po === 'N/A')) &&
                                                        e.dept === dept
                                                    ) : null;

                                                    const content = record?.content || errLog?.errorContent || '';
                                                    const solution = record?.solution || errLog?.solution || '';
                                                    const images = record?.images || [];
                                                    const dateRowSpan = group.pos.length * 4;

                                                    return (
                                                        <tr key={`${group.date}-${po}-${dept}`} className="border-b border-gray-100 hover:bg-gray-50">
                                                            {poIndex === 0 && deptIndex === 0 && (
                                                                <td rowSpan={dateRowSpan} className="p-3 border-r border-gray-200 align-top bg-white font-bold text-gray-700 text-center">
                                                                    {group.date}
                                                                </td>
                                                            )}
                                                            {deptIndex === 0 && (
                                                                <td rowSpan={4} className="p-3 border-r border-gray-200 align-top bg-gray-50 font-mono font-bold text-blue-700 text-center text-xs">
                                                                    {po}
                                                                </td>
                                                            )}
                                                            <td className="p-3 border-r border-gray-200 align-top">
                                                                <div className="flex gap-3">
                                                                    <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 border ${getDeptColor(dept)}`}>
                                                                        {renderDeptIcon(dept)}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="font-bold text-xs text-gray-500 uppercase mb-1">{dept}</div>
                                                                        {content ? (
                                                                            <>
                                                                                <p className="text-gray-800 mb-2">{content}</p>
                                                                                {images.length > 0 && (
                                                                                    <div className="flex gap-2 flex-wrap">
                                                                                        {images.map((img, i) => (
                                                                                            <img 
                                                                                                key={i} 
                                                                                                src={img} 
                                                                                                className="w-16 h-16 object-cover rounded border border-gray-200 bg-white shadow-sm cursor-zoom-in" 
                                                                                                alt="Err" 
                                                                                                onClick={() => setViewImage(img)}
                                                                                            />
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        ) : (
                                                                            <span className="text-gray-300 italic text-xs">Không có ghi nhận</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-3 align-top">
                                                                {solution ? (
                                                                    <p className="text-green-700 bg-green-50 p-2 rounded border border-green-100 text-xs">{solution}</p>
                                                                ) : (
                                                                    <span className="text-gray-300 italic text-xs">---</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </React.Fragment>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'TCKT' && (
            <div className="space-y-6 max-w-5xl mx-auto">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Tiêu Chuẩn Kỹ Thuật (TCKT)</h3>
                    <p className="text-sm text-gray-500 mb-6">Lưu trữ hình ảnh và ghi chú kỹ thuật theo ngày và phiếu sản xuất.</p>

                    <div className="space-y-8">
                        {tcktData.map(dayGroup => (
                            <div key={dayGroup.date} className="relative border-l-2 border-blue-200 pl-6 pb-2">
                                <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                                <h4 className="font-bold text-blue-800 mb-4 text-lg flex items-center gap-2">
                                    <IconCalendar className="w-5 h-5"/> {dayGroup.date}
                                </h4>
                                
                                {dayGroup.pos.map(poGroup => (
                                    <div key={poGroup.po} className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                                            <span className="bg-white px-2 py-1 rounded border border-gray-300 text-sm">Phiếu: {poGroup.po}</span>
                                        </div>
                                        <div className="space-y-3">
                                            {poGroup.items.map(record => (
                                                <div key={record.id} className="bg-white p-3 rounded border border-gray-100 shadow-sm flex gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="font-bold text-xs text-blue-600">{record.user}</span>
                                                            <span className="text-[10px] text-gray-400">{record.timestamp}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-800">{record.content}</p>
                                                        {record.images && record.images.length > 0 && (
                                                            <div className="mt-2 flex gap-2 overflow-x-auto">
                                                                {record.images.map((img, i) => (
                                                                    <img 
                                                                        key={i} 
                                                                        src={img} 
                                                                        className="h-24 rounded border border-gray-200 cursor-zoom-in" 
                                                                        alt="tckt" 
                                                                        onClick={() => setViewImage(img)}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                        
                        {tcktData.length === 0 && (
                            <div className="text-center text-gray-400 py-10 border-2 border-dashed border-gray-200 rounded-xl">
                                <p>Chưa có dữ liệu TCKT. Hãy chat với cú pháp "TCKT: ..." để thêm mới.</p>
                            </div>
                        )}
                    </div>
                 </div>
            </div>
        )}

        {activeTab === 'Chát online' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col max-w-4xl mx-auto">
                <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-700">Trao đổi nội bộ - {formData.brandName}</h3>
                    <div className="flex items-center gap-2">
                         <span className="text-xs text-gray-500">Giao diện Admin Chat</span>
                    </div>
                </div>
                <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-white">
                    {formData.history && formData.history.length > 0 ? (
                        formData.history.map(chat => (
                            <div key={chat.id} className={`flex gap-3 ${chat.isMe ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white ${chat.isMe ? 'bg-blue-500' : 'bg-gray-400'}`}>
                                    {chat.user.charAt(0)}
                                </div>
                                <div className={`max-w-[70%] rounded-2xl p-3 shadow-sm relative group cursor-pointer select-none transition-transform active:scale-95 ${chat.isMe ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                    <div className="h-full w-full">
                                        <div className={`flex justify-between items-baseline mb-1 ${chat.isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                                            <span className="font-bold text-xs mr-2">{chat.user}</span>
                                            <span className="text-[10px] opacity-80">{chat.timestamp}</span>
                                        </div>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{chat.message}</p>
                                        {chat.image && (
                                            <div className="mt-3 relative">
                                                <img 
                                                    src={chat.image} 
                                                    alt="attachment" 
                                                    className="rounded-lg max-h-48 object-cover border-2 border-white/20 cursor-zoom-in" 
                                                    onClick={() => setViewImage(chat.image!)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                             <IconSend className="w-12 h-12 mb-3 opacity-10" />
                             <p>Bắt đầu cuộc thảo luận về mẫu này...</p>
                        </div>
                    )}
                </div>
                
                {/* Chat Input Area */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex gap-3 items-center">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-200 transition"
                        title="Gửi ảnh (Gõ 'TCKT:' để lưu vào TCKT)"
                    >
                        <IconImage className="w-6 h-6" />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                    
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                        placeholder={`Nhập nội dung (gõ "TCKT: ..." để lưu TCKT)`}
                        className="flex-1 border-gray-300 border rounded-full px-5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white shadow-sm"
                    />
                    <button onClick={handleSendChat} className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 shadow-md transition transform active:scale-95">
                        <IconSend className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )}
        
        {activeTab === 'Duyệt' && (
             <div className="space-y-8 max-w-6xl mx-auto" id="review-form">
                 {!editingRecordId && (
                     <div className="space-y-6">
                         <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                             <h4 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                                <IconTransfer className="w-6 h-6 text-blue-600" />
                                Phê duyệt & Ghi nhận Lỗi
                             </h4>
                             <div className="text-sm font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
                                 Phiếu SX: {formData.productionOrder || 'Chưa nhập'}
                             </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {deptOptions.map((dept) => {
                                 const relevantDrafts = (formData.draftQueue || []).filter(d => d.autoDept === dept);
                                 const hasDrafts = relevantDrafts.length > 0;
                                 const form = deptForms[dept];
                                 const isActive = form.content || form.solution || hasDrafts;

                                 return (
                                     <div key={dept} className={`border rounded-xl p-4 transition-all duration-300 ${isActive ? 'bg-white shadow-md border-gray-300' : 'bg-gray-50 border-gray-200 opacity-90'}`}>
                                         <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                                             <div className="flex items-center gap-2 font-bold text-gray-700">
                                                 {renderDeptIcon(dept)}
                                                 {dept}
                                             </div>
                                             {hasDrafts && (
                                                 <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                                                     {relevantDrafts.length} ảnh/tin
                                                 </span>
                                             )}
                                         </div>

                                         {hasDrafts && (
                                             <div className="flex gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
                                                 {relevantDrafts.map((d) => (
                                                     <div key={d.id} className="relative flex-shrink-0 group cursor-pointer">
                                                         {d.type === 'image' ? (
                                                             <img 
                                                                src={d.content} 
                                                                className="h-16 w-16 object-cover rounded border border-gray-200" 
                                                                alt="draft" 
                                                                onClick={() => setViewImage(d.content)}
                                                             />
                                                         ) : (
                                                             <div className="h-16 w-24 bg-gray-100 p-1 text-[10px] overflow-hidden rounded border border-gray-200">
                                                                 {d.content}
                                                             </div>
                                                         )}
                                                     </div>
                                                 ))}
                                             </div>
                                         )}

                                         <div className="space-y-3">
                                             <input 
                                                 type="text" 
                                                 placeholder="Nội dung lỗi..." 
                                                 className="w-full text-sm border border-gray-200 rounded p-2 focus:ring-1 focus:ring-blue-300 outline-none"
                                                 value={form.content}
                                                 onChange={(e) => updateDeptForm(dept, 'content', e.target.value)}
                                             />
                                             <input 
                                                 type="text" 
                                                 placeholder="Cách khắc phục..." 
                                                 className="w-full text-sm border border-gray-200 rounded p-2 focus:ring-1 focus:ring-blue-300 outline-none"
                                                 value={form.solution}
                                                 onChange={(e) => updateDeptForm(dept, 'solution', e.target.value)}
                                             />
                                         </div>
                                         
                                         <button 
                                            onClick={() => handleSaveDept(dept)}
                                            className="w-full mt-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-sm font-bold hover:bg-blue-600 hover:text-white transition-colors"
                                         >
                                             Lưu {dept}
                                         </button>
                                     </div>
                                 );
                             })}
                         </div>
                     </div>
                 )}
             </div>
        )}

      </div>
    </div>
  );
};

export default DocumentDetail;
