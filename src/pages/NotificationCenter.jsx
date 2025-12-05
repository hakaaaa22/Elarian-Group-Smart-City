import React from 'react';
import AdvancedNotificationSystem from '@/components/notifications/AdvancedNotificationSystem';

export default function NotificationCenterPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <AdvancedNotificationSystem />
      </div>
    </div>
  );
}