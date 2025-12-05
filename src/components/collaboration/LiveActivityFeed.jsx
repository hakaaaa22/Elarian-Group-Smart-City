import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, LayoutGrid, MessageSquare, Settings, Move, Plus, Trash2, Bell } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const activityIcons = {
  layout_change: LayoutGrid,
  widget_add: Plus,
  widget_remove: Trash2,
  widget_move: Move,
  comment: MessageSquare,
  settings: Settings,
  alert: Bell,
};

const activityColors = {
  layout_change: 'text-purple-400',
  widget_add: 'text-green-400',
  widget_remove: 'text-red-400',
  widget_move: 'text-cyan-400',
  comment: 'text-amber-400',
  settings: 'text-blue-400',
  alert: 'text-orange-400',
};

export default function LiveActivityFeed({ onActivityClick }) {
  const [activities, setActivities] = useState([
    { id: '1', type: 'widget_add', user: 'أحمد محمد', message: 'أضاف ويدجت تحليل المشاعر', timestamp: new Date(Date.now() - 60000) },
    { id: '2', type: 'comment', user: 'سارة علي', message: 'علقت على تنبيه الشذوذ #45', timestamp: new Date(Date.now() - 120000) },
    { id: '3', type: 'widget_move', user: 'خالد العريان', message: 'أعاد ترتيب الويدجات', timestamp: new Date(Date.now() - 180000) },
    { id: '4', type: 'layout_change', user: 'أحمد محمد', message: 'غير تخطيط لوحة التحكم', timestamp: new Date(Date.now() - 300000) },
  ]);

  useEffect(() => {
    // Simulate new activities
    const interval = setInterval(() => {
      const newActivity = {
        id: Date.now().toString(),
        type: ['widget_add', 'comment', 'widget_move', 'settings', 'alert'][Math.floor(Math.random() * 5)],
        user: ['أحمد محمد', 'سارة علي', 'خالد العريان'][Math.floor(Math.random() * 3)],
        message: [
          'أضاف ويدجت جديد',
          'علق على تقرير',
          'عدل إعدادات الويدجت',
          'أعاد ترتيب الويدجات',
          'استجاب لتنبيه'
        ][Math.floor(Math.random() * 5)],
        timestamp: new Date(),
      };
      setActivities(prev => [newActivity, ...prev].slice(0, 20));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return 'الآن';
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    return `منذ ${Math.floor(diff / 86400)} يوم`;
  };

  return (
    <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-3">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-cyan-400" />
        <span className="text-white text-sm font-medium">النشاط المباشر</span>
        <Badge className="bg-green-500/20 text-green-400 text-xs animate-pulse">مباشر</Badge>
      </div>
      
      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          <AnimatePresence>
            {activities.map((activity, index) => {
              const Icon = activityIcons[activity.type] || Activity;
              const colorClass = activityColors[activity.type] || 'text-slate-400';
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onActivityClick?.(activity)}
                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-700/30 cursor-pointer transition-colors"
                >
                  <div className={`p-1.5 rounded-lg bg-slate-700/50 ${colorClass}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 text-xs truncate">
                      <span className="text-white font-medium">{activity.user}</span>
                      {' '}{activity.message}
                    </p>
                    <p className="text-slate-500 text-[10px]">{formatTime(activity.timestamp)}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}