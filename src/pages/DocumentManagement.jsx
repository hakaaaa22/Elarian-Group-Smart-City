import React from 'react';
import DocumentManagement from '@/components/documents/DocumentManagement';

export default function DocumentManagementPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <DocumentManagement />
      </div>
    </div>
  );
}