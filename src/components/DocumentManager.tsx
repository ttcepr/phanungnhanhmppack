import React, { useState } from 'react';
import DocumentList from './DocumentList';
import DocumentDetail from './DocumentDetail';
import { mockDocuments } from '../services/mockData';
import { DocumentData } from '../types';

const DocumentManager: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentData | null>(mockDocuments[0]);

  return (
    <div className="flex h-full overflow-hidden bg-gray-100">
      <div className="w-full md:w-[350px] lg:w-[400px] flex-shrink-0 h-full border-r border-gray-200 bg-white">
        <DocumentList 
          documents={mockDocuments} 
          selectedId={selectedDoc?.id || null} 
          onSelect={setSelectedDoc} 
        />
      </div>
      <div className="flex-1 h-full bg-gray-50 overflow-hidden hidden md:block">
        <DocumentDetail 
          document={selectedDoc} 
          onSave={(doc) => console.log('Saving', doc)} 
        />
      </div>
    </div>
  );
};

export default DocumentManager;