import React, { useState, useEffect } from 'react';
import DocumentList from './DocumentList';
import DocumentDetail from './DocumentDetail';
import { mockDocuments } from '../services/mockData';
import { DocumentData } from '../types';

interface DocumentManagerProps {
    initialMode?: 'list' | 'create';
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ initialMode = 'list' }) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentData | null>(mockDocuments[0]);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  // New empty document template
  const newDocTemplate: DocumentData = {
      id: 'new',
      title: '',
      docNumber: '',
      arrivalDate: new Date().toISOString().split('T')[0],
      unit: '',
      type: 'Công văn',
      pageCount: 0,
      securityLevel: 'Bình thường',
      recipient: '',
      handler: '',
      status: 'Chưa xử lý',
      history: [],
      savedRecords: []
  } as any; // Cast to any to avoid minor type mismatch with enums during init

  useEffect(() => {
      if (initialMode === 'create') {
          setSelectedDoc(newDocTemplate);
          setMobileView('detail');
      } else {
          // Reset to first doc if switching back to list mode naturally
          if (selectedDoc?.id === 'new') {
              setSelectedDoc(mockDocuments[0]);
          }
      }
  }, [initialMode]);

  const handleSelectDoc = (doc: DocumentData) => {
    setSelectedDoc(doc);
    setMobileView('detail');
  };

  const handleBackToList = () => {
    setMobileView('list');
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden bg-gray-100 relative">
      {/* Column 2: Document List */}
      <div className={`
        w-full md:w-[350px] lg:w-[400px] flex-shrink-0 h-full border-r border-gray-200 bg-white
        ${mobileView === 'detail' ? 'hidden md:block' : 'block'}
      `}>
        <DocumentList 
          documents={mockDocuments} 
          selectedId={selectedDoc?.id || null} 
          onSelect={handleSelectDoc} 
        />
      </div>

      {/* Column 3: Detail View */}
      <div className={`
        flex-1 h-full bg-gray-50 overflow-hidden
        ${mobileView === 'list' ? 'hidden md:block' : 'block'}
      `}>
        {/* Mobile Back Button */}
        {mobileView === 'detail' && (
            <div className="md:hidden bg-white border-b p-2 flex items-center text-blue-600 cursor-pointer" onClick={handleBackToList}>
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Quay lại danh sách
            </div>
        )}
        <DocumentDetail 
          document={selectedDoc} 
          onSave={(doc) => console.log('Saving', doc)} 
        />
      </div>
    </div>
  );
};

export default DocumentManager;