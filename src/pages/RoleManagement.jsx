import React from 'react';
import RoleManagementComponent from '@/components/admin/RoleManagement';
import { Shield } from 'lucide-react';

export default function RoleManagement() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] p-4 md:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="w-7 h-7 text-purple-400" />
            إدارة الأدوار والصلاحيات
          </h1>
          <p className="text-slate-400 mt-1">تحكم في صلاحيات الوصول للمستخدمين</p>
        </div>
        <RoleManagementComponent />
      </div>
    </div>
  );
}