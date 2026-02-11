import React, { useState, useMemo } from 'react';
import { DocumentData, DocStatus } from '../types';
import { IconSearch, IconFilter, IconFolder, IconChevronDown, IconBox } from './Icons';

interface DocumentListProps {
  documents: DocumentData[];
  selectedId: string | null;
  onSelect: (doc: DocumentData) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, selectedId, onSelect }) => {
  const [expandedClients, setExpandedClients] = useState<Record<string, boolean>>({});

  const groupedDocs = useMemo(() => {
    const groups: Record<string, DocumentData[]> = {};
    documents.forEach(doc => {
      if (!groups[doc.clientName]) groups[doc.clientName] = [];
      groups[doc.clientName].push(doc);
    });
    return groups;
  }, [documents]);

  const toggleClient = (clientName: string) => {
    setExpandedClients(prev => ({ ...prev, [clientName]: !prev[clientName] }));
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-xl z-10">
      <div className="p-4 border-b border-gray-100 bg-white">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-gray-800 text-lg">Danh sách Khách hàng</h2>
            <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{Object.keys(groupedDocs).length} Đối tác</span>
          </div>
          <div className="relative mt-3">
             <input type="text" placeholder="Tìm kiếm..." className="w-full bg-gray-50 pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none" />
             <IconSearch className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-2 bg-gray-50/50">
        {Object.entries(groupedDocs).map(([clientName, clientDocs]) => (
          <div key={clientName} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div onClick={() => toggleClient(clientName)} className="flex items-center justify-between p-3 cursor-pointer hover:bg-blue-50 transition-colors select-none">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><IconFolder className="w-5 h-5" /></div>
                <div>
                    <h3 className="font-bold text-gray-800 text-sm">{clientName}</h3>
                </div>
              </div>
              <IconChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedClients[clientName] ? 'rotate-180' : ''}`} />
            </div>

            {expandedClients[clientName] && (
              <div className="bg-gray-50 border-t border-gray-100">
                {clientDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => onSelect(doc)}
                    className={`pl-4 pr-3 py-3 border-l-4 cursor-pointer transition-all hover:bg-white flex items-start gap-3 ${selectedId === doc.id ? 'border-blue-600 bg-white shadow-inner' : 'border-transparent'}`}
                  >
                     <div className={`mt-1 ${selectedId === doc.id ? 'text-blue-600' : 'text-gray-400'}`}><IconBox className="w-4 h-4" /></div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h4 className={`text-sm font-bold truncate ${selectedId === doc.id ? 'text-blue-700' : 'text-gray-700'}`}>{doc.brandName}</h4>
                            <span className={`w-2 h-2 rounded-full mt-1.5 ${doc.status === DocStatus.URGENT ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{doc.title}</p>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;