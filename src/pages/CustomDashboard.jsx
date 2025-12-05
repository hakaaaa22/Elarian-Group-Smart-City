import React from 'react';
import RoleBasedDashboardBuilder from '@/components/dashboard/RoleBasedDashboardBuilder';

export default function CustomDashboard() {
  return (
    <div className="min-h-screen p-4 lg:p-6">
      <RoleBasedDashboardBuilder />
    </div>
  );
}