
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { mockDocuments } from '../services/mockData';
import { DocumentData, ChatMessage, DraftItem, DeptType, Employee, TCKTRecord } from '../types';
import { IconSearch, IconPlus, IconSend, IconImage, IconBox, IconUsers, IconCheck, IconFolder, IconLogout, IconAt, IconCalendar, IconClock, IconFilter } from './Icons';
import { compressImage } from '../utils/helpers';
import ImageViewer from './ImageViewer';

// Dept options
const deptOptions: DeptType[] = ['SÓNG', 'IN', 'THÀNH PHẨM', 'KHO'];

type FilterTab = 'mine' | 'all';
type DateFilter = 'today' | '3days' | '7days' | 'all';

interface UserChatInterfaceProps {
    user?: Employee;
    onLogout: () => void;
}

const UserChatInterface: React.FC<UserChatInterfaceProps> = ({ user, onLogout }) => {
    // Steps: search (dashboard) -> confirm -> chat
    const [step, setStep] = useState<'search' | 'confirm' | 'chat'>('search');
    
    // Internal user state derived from prop or fallback
    const loggedInUser = user;
    const [userDept, setUserDept] = useState<DeptType>('IN');

    // Search & Filter State
    const [searchCode, setSearchCode] = useState('');
    const [filterTab, setFilterTab] = useState<FilterTab>('mine');
    const [dateFilter, setDateFilter] = useState<DateFilter>('3days');
    
    // Selection State
    const [selectedDoc, setSelectedDoc] = useState<DocumentData | null>(null);
    const [productionOrder, setProductionOrder] = useState('');
    
    // New Document State
    const [newDocInfo, setNewDocInfo] = useState({ title: '', clientName: '' });

    // Chat State
    const [chatInput, setChatInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Image Viewer State
    const [viewImage, setViewImage] = useState<string | null>(null);

    // Local State for Documents
    const [localDocuments, setLocalDocuments] = useState<DocumentData[]>([]);

    useEffect(() => {
        setLocalDocuments(mockDocuments);
        if (loggedInUser && loggedInUser.dept !== 'VĂN PHÒNG') {
            setUserDept(loggedInUser.dept as DeptType);
        }
    }, [loggedInUser]);

    const isUserMentioned = (doc: DocumentData): boolean => {
        if (!loggedInUser || !doc.history) return false;
        const mentionTag = `@${loggedInUser.id}`;
        return doc.history.some(msg => msg.message.includes(mentionTag) && !msg.isMe);
    };

    // --- FILTERING LOGIC ---
    const filteredDocuments = useMemo(() => {
        let docs = [...localDocuments];

        if (searchCode.trim()) {
            return docs.filter(d => 
                d.docNumber.toLowerCase().includes(searchCode.toLowerCase()) || 
                d.productionOrder?.toLowerCase().includes(searchCode.toLowerCase()) ||
                d.title.toLowerCase().includes(searchCode.toLowerCase())
            );
        }

        if (filterTab === 'mine') {
            return docs.filter(d => (d.unreadCount && d.unreadCount > 0) || isUserMentioned(d));
        }

        const today = new Date();
        const cutoffDate = new Date();
        
        if (dateFilter === 'today') {
            cutoffDate.setHours(0,0,0,0);
        } else if (dateFilter === '3days') {
            cutoffDate.setDate(today.getDate() - 3);
            cutoffDate.setHours(0,0,0,0);
        } else if (dateFilter === '7days') {
            cutoffDate.setDate(today.getDate() - 7);
            cutoffDate.setHours(0,0,0,0);
        } else {
            cutoffDate.setFullYear(2000); 
        }

        return docs.filter(d => {
            const arrival = new Date(d.arrivalDate);
            return arrival >= cutoffDate;
        }).sort((a, b) => new Date(b.arrivalDate).getTime() - new Date(a.arrivalDate).getTime());

    }, [localDocuments, searchCode, filterTab, dateFilter, loggedInUser]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [selectedDoc?.history]);


    const handleSearch = () => {
        if (!searchCode.trim()) return;
        if (filteredDocuments.length === 1) {
             const found = filteredDocuments[0];
             setSelectedDoc(found);
             setProductionOrder(found.productionOrder || '');
             setStep('confirm');
        }
    };

    const handleSelectRecent = (doc: DocumentData) => {
        const updatedDocs = localDocuments.map(d => 
            d.id === doc.id ? { ...d, unreadCount: 0 } : d
        );
        setLocalDocuments(updatedDocs);
        
        const updatedDoc = updatedDocs.find(d => d.id === doc.id) || doc;
        setSelectedDoc(updatedDoc);
        setProductionOrder(updatedDoc.productionOrder || '');
        setStep('chat'); 
    };

    const handleStartChat = () => {
        if (!selectedDoc) {
            const newDoc: DocumentData = {
                id: `NEW-${Date.now()}`,
                title: newDocInfo.title || 'Sản phẩm mới',
                clientName: newDocInfo.clientName || 'Khách lẻ',
                brandName: 'New Brand',
                docNumber: searchCode.toUpperCase(),
                productionOrder: productionOrder,
                arrivalDate: new Date().toISOString().split('T')[0],
                status: 'Thiết kế mới' as any,
                unit: 'User Created',
                recipient: '',
                handler: '',
                history: [],
                draftQueue: [],
                savedRecords: [],
                errorLog: [],
                tcktRecords: [], // Init TCKT
                unreadCount: 0
            };
            const newDocsList = [newDoc, ...localDocuments];
            setLocalDocuments(newDocsList);
            setSelectedDoc(newDoc);
        } else {
            selectedDoc.productionOrder = productionOrder;
        }
        setStep('chat');
    };

    const getFullTimestamp = () => {
        const now = new Date();
        const date = now.toLocaleDateString('en-GB'); 
        const time = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        return `${date} ${time}`;
    };

    const handleSendMessage = () => {
        if (!chatInput.trim() || !selectedDoc || !loggedInUser) return;
        
        const timestamp = getFullTimestamp();
        const dateKey = new Date().toISOString().split('T')[0];
        const displayName = `${loggedInUser.name} (${userDept})`;
        const isTCKT = chatInput.toUpperCase().startsWith('TCKT:');

        const newMsg: ChatMessage = {
            id: Date.now().toString(),
            user: displayName,
            avatar: loggedInUser.avatar || 'https://picsum.photos/40/40?random=88',
            message: chatInput,
            timestamp: timestamp,
            isMe: true
        };
        
        const updatedHistory = [...(selectedDoc.history || []), newMsg];
        
        const newDraft: DraftItem = {
             id: `draft-${Date.now()}`,
             type: 'text',
             content: chatInput,
             timestamp: timestamp,
             autoDept: userDept
        };
        const updatedDrafts = [...(selectedDoc.draftQueue || []), newDraft];

        // TCKT Logic
        let updatedTCKT = selectedDoc.tcktRecords || [];
        if (isTCKT) {
            const content = chatInput.substring(5).trim(); 
            updatedTCKT = [...updatedTCKT, {
                id: `tckt-${Date.now()}`,
                timestamp: timestamp,
                date: dateKey,
                productionOrder: selectedDoc.productionOrder || productionOrder || 'N/A',
                user: displayName,
                content: content,
                images: []
            }];
        }

        const updatedDoc = { ...selectedDoc, history: updatedHistory, draftQueue: updatedDrafts, tcktRecords: updatedTCKT };
        setSelectedDoc(updatedDoc);
        setLocalDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
        setChatInput('');
        if(isTCKT) alert('Đã lưu nội dung vào Tiêu Chuẩn Kỹ Thuật (TCKT)');
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && selectedDoc && loggedInUser) {
            const files = Array.from(e.target.files) as File[];
            const timestamp = getFullTimestamp();
            const dateKey = new Date().toISOString().split('T')[0];
            const displayName = `${loggedInUser.name} (${userDept})`;
            const isTCKT = chatInput.toUpperCase().startsWith('TCKT:');

            for (const file of files) {
                try {
                    // Compress image before processing
                    const compressedBase64 = await compressImage(file);
                    
                    const newMsg: ChatMessage = {
                        id: `img-msg-${Date.now()}-${Math.random()}`,
                        user: displayName,
                        avatar: loggedInUser.avatar || 'https://picsum.photos/40/40?random=88',
                        message: isTCKT ? `TCKT Img: ${chatInput}` : 'Đã gửi hình ảnh',
                        image: compressedBase64,
                        timestamp: timestamp,
                        isMe: true
                    };
                    
                    const newDraft: DraftItem = {
                        id: `draft-${Date.now()}-${Math.random()}`,
                        type: 'image',
                        content: compressedBase64,
                        timestamp: timestamp,
                        autoDept: userDept
                    };

                    setSelectedDoc(prev => {
                        if (!prev) return null;
                        let currentTCKT = prev.tcktRecords || [];
                        
                        if (isTCKT) {
                            currentTCKT = [...currentTCKT, {
                                id: `tckt-img-${Date.now()}-${Math.random()}`,
                                timestamp: timestamp,
                                date: dateKey,
                                productionOrder: prev.productionOrder || productionOrder || 'N/A',
                                user: displayName,
                                content: chatInput.substring(5).trim() || 'Hình ảnh TCKT',
                                images: [compressedBase64]
                            }];
                        }

                        const updated = {
                            ...prev,
                            history: [...(prev.history || []), newMsg],
                            draftQueue: [...(prev.draftQueue || []), newDraft],
                            tcktRecords: currentTCKT
                        };
                        setLocalDocuments(docs => docs.map(d => d.id === updated.id ? updated : d));
                        return updated;
                    });
                } catch (error) {
                    console.error("Image processing error", error);
                    alert("Lỗi khi xử lý ảnh");
                }
            }

            if (fileInputRef.current) fileInputRef.current.value = '';
            if (isTCKT) {
                setChatInput(''); 
                alert('Đã lưu hình ảnh vào TCKT');
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-white max-w-md mx-auto shadow-2xl overflow-hidden font-sans relative">
            
            {/* ImageViewer Modal */}
            {viewImage && (
                <ImageViewer src={viewImage} onClose={() => setViewImage(null)} />
            )}

            {/* Header */}
            <div className="bg-[#0060B6] p-4 text-white shadow-md z-10">
                <div className="flex justify-between items-center">
                    <h1 className="text-lg font-bold flex items-center gap-2">
                        <IconBox className="w-5 h-5 text-white/80" />
                        PHẢN ỨNG NHANH
                    </h1>
                    {loggedInUser && (
                        <div className="flex items-center gap-3">
                             <div className="flex items-center gap-2 text-xs bg-white/20 px-2 py-1 rounded">
                                <span className="font-bold">{loggedInUser.name}</span>
                                <span className="opacity-70">|</span>
                                <span className="font-bold text-yellow-300">{userDept}</span>
                            </div>
                            <button onClick={onLogout} className="text-white/80 hover:text-white transition" title="Đăng xuất">
                                <IconLogout className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* STEP 1: SEARCH & FILTER & LIST */}
            {step === 'search' && (
                <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
                    <div className="bg-white p-4 shadow-sm border-b border-gray-100 z-10">
                         <div className="relative mb-4">
                            <input 
                                type="text" 
                                className="w-full bg-gray-100 border-transparent focus:bg-white border border-gray-200 rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-inner"
                                placeholder="Nhập SKU / Tên / Phiếu SX..."
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                            />
                            <IconSearch className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        </div>

                        <div className="flex gap-2 mb-3">
                            <button 
                                onClick={() => setFilterTab('mine')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                    filterTab === 'mine' 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm' 
                                    : 'bg-transparent text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                <IconAt className="w-4 h-4" /> Của tôi 
                                {localDocuments.filter(d => (d.unreadCount && d.unreadCount > 0) || isUserMentioned(d)).length > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                                        {localDocuments.filter(d => (d.unreadCount && d.unreadCount > 0) || isUserMentioned(d)).length}
                                    </span>
                                )}
                            </button>
                            <button 
                                onClick={() => setFilterTab('all')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                    filterTab === 'all' 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm' 
                                    : 'bg-transparent text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                <IconFolder className="w-4 h-4" /> Tất cả
                            </button>
                        </div>

                        {filterTab === 'all' && (
                            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                                {[
                                    { id: 'today', label: 'Hôm nay' },
                                    { id: '3days', label: '3 ngày qua' },
                                    { id: '7days', label: '7 ngày qua' },
                                    { id: 'all', label: 'Toàn bộ' }
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setDateFilter(opt.id as DateFilter)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                                            dateFilter === opt.id
                                            ? 'bg-gray-800 text-white border-gray-800'
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 px-4 py-4 overflow-y-auto">
                        <div className="flex justify-between items-center mb-3">
                             <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                                {filterTab === 'mine' ? 'Cần xử lý & Nhắc tên' : 'Danh sách hồ sơ'}
                                <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{filteredDocuments.length}</span>
                             </h3>
                             {searchCode && (
                                 <button 
                                     onClick={handleSearch}
                                     className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full animate-pulse"
                                 >
                                     + Tạo mới nếu không thấy
                                 </button>
                             )}
                        </div>

                        <div className="space-y-3 pb-20">
                            {filteredDocuments.length > 0 ? (
                                filteredDocuments.map(doc => {
                                    const mentioned = isUserMentioned(doc);
                                    return (
                                        <div 
                                            key={doc.id} 
                                            onClick={() => handleSelectRecent(doc)}
                                            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:scale-95 transition-transform flex items-center gap-3 cursor-pointer relative"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 relative shrink-0">
                                                <IconFolder className="w-5 h-5" />
                                                {doc.unreadCount && doc.unreadCount > 0 ? (
                                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm ring-2 ring-white">
                                                        {doc.unreadCount}
                                                    </span>
                                                ) : null}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h4 className={`font-bold text-sm truncate ${doc.unreadCount ? 'text-black' : 'text-gray-700'}`}>{doc.title}</h4>
                                                    {mentioned && (
                                                        <span className="flex items-center gap-1 bg-orange-100 text-orange-600 text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1">
                                                            <IconAt className="w-3 h-3" />
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <div className="flex gap-2">
                                                        <span className="text-xs text-gray-500 font-mono bg-gray-100 px-1 rounded">{doc.docNumber}</span>
                                                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                            <IconClock className="w-3 h-3"/> {doc.arrivalDate.split('-').reverse().join('/')}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-blue-600 font-semibold">{doc.productionOrder || 'Chưa có phiếu'}</span>
                                                </div>
                                            </div>
                                            <IconCheck className="w-4 h-4 text-gray-300" />
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-10 text-gray-400">
                                    <IconFilter className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Không tìm thấy hồ sơ nào trong khoảng thời gian này.</p>
                                    {filterTab === 'mine' && <p className="text-xs mt-1">Bạn đã xử lý hết việc cần làm!</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2: CONFIRM / CREATE */}
            {step === 'confirm' && (
                <div className="flex-1 flex flex-col p-6 bg-gray-50 overflow-y-auto">
                    <button onClick={() => setStep('search')} className="text-gray-500 text-sm mb-4 flex items-center gap-1">
                        ← Quay lại
                    </button>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-lg font-bold text-gray-800 border-b pb-2">
                            {selectedDoc ? 'Xác nhận Hồ sơ' : 'Thiết lập Hồ sơ Mới'}
                        </h2>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mã Code (SKU)</label>
                            <input type="text" value={searchCode.toUpperCase()} readOnly className="w-full bg-gray-100 border border-gray-200 rounded p-2 text-gray-600 font-mono" />
                        </div>

                        {selectedDoc ? (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên Sản Phẩm</label>
                                    <div className="font-medium text-gray-800">{selectedDoc.title}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Khách hàng</label>
                                    <div className="text-sm text-gray-600">{selectedDoc.clientName}</div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên Sản Phẩm</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 outline-none"
                                        placeholder="Nhập tên sản phẩm..."
                                        value={newDocInfo.title}
                                        onChange={(e) => setNewDocInfo({...newDocInfo, title: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên Khách hàng</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 outline-none"
                                        placeholder="Nhập tên khách hàng..."
                                        value={newDocInfo.clientName}
                                        onChange={(e) => setNewDocInfo({...newDocInfo, clientName: e.target.value})}
                                    />
                                </div>
                            </>
                        )}

                        <div className="pt-2">
                             <label className="block text-xs font-bold text-blue-600 uppercase mb-1">Số Phiếu Sản Xuất (Bắt buộc)</label>
                             <input 
                                type="text" 
                                className="w-full border-2 border-blue-100 rounded p-3 text-lg font-semibold text-blue-800 focus:border-blue-500 outline-none"
                                placeholder="Nhập số phiếu SX..."
                                value={productionOrder}
                                onChange={(e) => setProductionOrder(e.target.value)}
                             />
                             <p className="text-[10px] text-gray-400 mt-1">Tin nhắn sẽ được gắn với phiếu SX này</p>
                        </div>

                        <button 
                            onClick={handleStartChat}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition mt-4 shadow-lg"
                        >
                            Vào Giao Diện Chat
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3: CHAT */}
            {step === 'chat' && selectedDoc && (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm flex justify-between items-center z-10">
                        <div className="overflow-hidden">
                            <h3 className="font-bold text-gray-800 text-sm truncate w-56">{selectedDoc.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                <span className="font-mono bg-gray-100 px-1 rounded">{selectedDoc.docNumber}</span>
                                <span className="text-blue-600 font-bold bg-blue-50 px-1 rounded">{productionOrder || 'N/A'}</span>
                            </div>
                        </div>
                        <button onClick={() => setStep('search')} className="text-xs text-red-500 border border-red-100 bg-red-50 px-3 py-1.5 rounded-lg font-medium">Thoát</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100" ref={chatContainerRef}>
                        {selectedDoc.history && selectedDoc.history.length > 0 ? (
                            selectedDoc.history.map(chat => (
                                <div key={chat.id} className={`flex gap-2 ${chat.isMe ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm overflow-hidden ${chat.isMe ? 'bg-blue-500' : 'bg-gray-400'}`}>
                                        {chat.avatar ? (
                                            <img src={chat.avatar} alt="avt" className="w-full h-full object-cover" />
                                        ) : (
                                            chat.user.charAt(0)
                                        )}
                                    </div>
                                    <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${chat.isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                                        <div className={`text-[10px] mb-1 flex justify-between gap-4 border-b pb-1 ${chat.isMe ? 'border-blue-500/50 text-blue-100' : 'border-gray-100 text-gray-400'}`}>
                                            <span className="font-bold">{chat.user}</span>
                                            <span>{chat.timestamp}</span>
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap">{chat.message}</p>
                                        {chat.image && (
                                            <img 
                                                src={chat.image} 
                                                className="mt-2 rounded-lg border border-white/20 w-full object-cover max-h-64 cursor-zoom-in hover:opacity-90 transition-opacity" 
                                                alt="sent" 
                                                onClick={() => setViewImage(chat.image!)}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 mt-10">
                                <IconSend className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>Chưa có tin nhắn nào</p>
                                <p className="text-xs">Bắt đầu trao đổi về phiếu {productionOrder}</p>
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 shadow-inner">
                         <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
                            title="Gửi ảnh (Gõ 'TCKT:' để lưu TCKT)"
                        >
                            <IconImage className="w-7 h-7" />
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                        
                        <input 
                            type="text" 
                            className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            placeholder="Nhập... (Gõ 'TCKT:' để lưu kỹ thuật)"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button 
                            onClick={handleSendMessage}
                            className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md transition active:scale-95"
                        >
                            <IconSend className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserChatInterface;
