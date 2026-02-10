
import React, { useState, useEffect, useRef } from 'react';
import { Employee, DocumentData, ChatMessage } from '../types';
import { IconSearch, IconSend, IconImage, IconDot, IconBox } from './Icons';
import { compressImage } from '../utils/helpers';
import ImageViewer from './ImageViewer';

interface AdminChatProps {
    currentUser: Employee;
    employees: Employee[];
    documents: DocumentData[];
    onSaveDocument: (doc: DocumentData) => void;
}

const AdminChat: React.FC<AdminChatProps> = ({ currentUser, employees, documents, onSaveDocument }) => {
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [chatInput, setChatInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [viewImage, setViewImage] = useState<string | null>(null);

    // Initial select
    useEffect(() => {
        if (!selectedDocId && documents.length > 0) {
            setSelectedDocId(documents[0].id);
        }
    }, [documents]);

    const activeDoc = documents.find(d => d.id === selectedDocId);

    // Scroll to bottom on message
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [activeDoc?.history]);

    // Filter documents
    const filteredDocs = documents.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.docNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
        doc.productionOrder?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const onlineEmployees = employees.filter(e => e.status === 'Online' && e.id !== currentUser.id);

    // Send Message
    const handleSendMessage = () => {
        if (!chatInput.trim() || !activeDoc) return;

        const now = new Date();
        const timestamp = `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

        const newMsg: ChatMessage = {
            id: Date.now().toString(),
            user: currentUser.name,
            avatar: currentUser.avatar || 'https://ui-avatars.com/api/?background=random',
            message: chatInput,
            timestamp: timestamp,
            isMe: true
        };

        const updatedDoc = {
            ...activeDoc,
            history: [...(activeDoc.history || []), newMsg],
            unreadCount: 0 // Reset unread when admin replies
        };

        onSaveDocument(updatedDoc);
        setChatInput('');
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && activeDoc) {
            const file = e.target.files[0];
            try {
                // Compress image before sending
                const resultStr = await compressImage(file);
                
                const now = new Date();
                const timestamp = `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                
                const newMsg: ChatMessage = {
                    id: Date.now().toString(),
                    user: currentUser.name,
                    avatar: currentUser.avatar || 'https://ui-avatars.com/api/?background=random',
                    message: 'Đã gửi một ảnh',
                    image: resultStr,
                    timestamp: timestamp,
                    isMe: true
                };
                
                const updatedDoc = {
                    ...activeDoc,
                    history: [...(activeDoc.history || []), newMsg]
                };
                onSaveDocument(updatedDoc);
            } catch (error) {
                console.error("Error compressing image", error);
                alert("Lỗi xử lý ảnh");
            }
        }
    }

    return (
        <div className="flex h-full bg-gray-100 overflow-hidden relative">
            {/* Image Viewer */}
            {viewImage && <ImageViewer src={viewImage} onClose={() => setViewImage(null)} />}

            {/* LEFT COLUMN: CONTACTS & DOCS */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Chat Hệ Thống</h2>
                    
                    {/* Search */}
                    <div className="relative bg-gray-100 rounded-full">
                        <IconSearch className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            className="w-full bg-transparent pl-9 pr-4 py-2 text-sm focus:outline-none"
                            placeholder="Tìm kiếm phiếu, SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Active Users (Stories style) */}
                <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex gap-3 overflow-x-auto no-scrollbar">
                        {/* Current User */}
                        <div className="flex flex-col items-center flex-shrink-0 relative opacity-50">
                            <div className="w-10 h-10 rounded-full border-2 border-gray-200 p-0.5">
                                <img src={currentUser.avatar} className="w-full h-full rounded-full object-cover" alt="Me" />
                            </div>
                            <span className="text-[10px] mt-1 text-gray-500 font-medium truncate w-14 text-center">Tôi</span>
                            <div className="absolute bottom-4 right-0 bg-green-500 border-2 border-white w-3 h-3 rounded-full"></div>
                        </div>

                        {onlineEmployees.length > 0 ? onlineEmployees.map(emp => (
                            <div key={emp.id} className="flex flex-col items-center flex-shrink-0 relative cursor-pointer hover:opacity-80">
                                <div className="w-10 h-10 rounded-full border-2 border-blue-100 p-0.5">
                                    <img src={emp.avatar} className="w-full h-full rounded-full object-cover" alt={emp.name} />
                                </div>
                                <span className="text-[10px] mt-1 text-gray-600 font-medium truncate w-14 text-center">{emp.name.split(' ').pop()}</span>
                                <div className="absolute bottom-4 right-0 bg-green-500 border-2 border-white w-3 h-3 rounded-full"></div>
                            </div>
                        )) : (
                            <span className="text-xs text-gray-400 flex items-center h-14">Không có ai online</span>
                        )}
                    </div>
                </div>

                {/* Document List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredDocs.map(doc => {
                        const lastMsg = doc.history && doc.history.length > 0 ? doc.history[doc.history.length - 1] : null;
                        const isSelected = selectedDocId === doc.id;
                        
                        return (
                            <div 
                                key={doc.id}
                                onClick={() => setSelectedDocId(doc.id)}
                                className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
                            >
                                <div className="relative flex-shrink-0">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${doc.status === 'Gấp' ? 'bg-red-500' : 'bg-blue-500'}`}>
                                        <IconBox className="w-6 h-6" />
                                    </div>
                                    {doc.unreadCount && doc.unreadCount > 0 ? (
                                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                            {doc.unreadCount}
                                        </div>
                                    ) : null}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className={`text-sm truncate ${isSelected ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                                            {doc.title}
                                        </h4>
                                        <span className="text-[10px] text-gray-400">{lastMsg ? lastMsg.timestamp.split(' ')[1] : ''}</span>
                                    </div>
                                    <p className={`text-xs truncate ${isSelected ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                                        {lastMsg ? `${lastMsg.user}: ${lastMsg.message}` : 'Chưa có tin nhắn'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* RIGHT COLUMN: CHAT WINDOW */}
            <div className="flex-1 flex flex-col bg-white">
                {activeDoc ? (
                    <>
                        {/* Header */}
                        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <IconBox className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{activeDoc.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-mono">{activeDoc.docNumber}</span>
                                        <span className="text-blue-600 font-bold">{activeDoc.productionOrder || 'Chưa có phiếu'}</span>
                                        <span className="text-gray-300">|</span>
                                        <span className="flex items-center gap-1 text-green-600">
                                            <IconDot className="w-2 h-2" /> Đang hoạt động
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* Extra info actions can go here */}
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50" ref={chatContainerRef}>
                            {activeDoc.history && activeDoc.history.length > 0 ? (
                                activeDoc.history.map((msg, i) => (
                                    <div key={msg.id || i} className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                                        <div className="flex-shrink-0 self-end">
                                            <img src={msg.avatar || 'https://ui-avatars.com/api/?background=random'} className="w-8 h-8 rounded-full shadow-sm" alt="ava" />
                                        </div>
                                        <div className={`max-w-[70%] ${msg.isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                            <div className={`px-4 py-2 shadow-sm text-sm ${msg.isMe 
                                                ? 'bg-blue-600 text-white rounded-2xl rounded-br-none' 
                                                : 'bg-white text-gray-800 rounded-2xl rounded-bl-none border border-gray-200'}`}>
                                                {msg.message}
                                            </div>
                                            {msg.image && (
                                                <div className="mt-2">
                                                    <img 
                                                        src={msg.image} 
                                                        className="max-w-[200px] rounded-xl border border-gray-200 cursor-zoom-in hover:opacity-90 transition-opacity" 
                                                        alt="sent" 
                                                        onClick={() => setViewImage(msg.image!)}
                                                    />
                                                </div>
                                            )}
                                            <span className="text-[10px] text-gray-400 mt-1 px-1">
                                                {msg.user} • {msg.timestamp}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <IconBox className="w-16 h-16 opacity-20 mb-4" />
                                    <p>Bắt đầu cuộc trò chuyện cho hồ sơ này</p>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-3">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition"
                            >
                                <IconImage className="w-6 h-6" />
                            </button>
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
                            
                            <div className="flex-1 relative">
                                <input 
                                    type="text" 
                                    className="w-full bg-gray-100 border-none rounded-full px-5 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="Nhập tin nhắn..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                            </div>
                            
                            <button 
                                onClick={handleSendMessage}
                                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md transition transform active:scale-95"
                            >
                                <IconSend className="w-5 h-5" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
                        Chọn một hội thoại để bắt đầu
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChat;
