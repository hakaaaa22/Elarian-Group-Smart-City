import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { Bell, X, AlertTriangle, Shield, Camera, Car, Plane, Activity, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const typeIcons = {
  incident: AlertTriangle,
  system: Activity,
  security: Shield,
  traffic: Car,
  camera: Camera,
  drone: Plane,
};

const typeColors = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date', 20),
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 relative hover:bg-slate-800/50 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 bg-[#0f1629]/95 backdrop-blur-xl border border-indigo-500/20 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-white font-semibold">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAllReadMutation.mutate()}
                      className="text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Mark all read
                    </Button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    No notifications yet
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notification) => {
                    const Icon = typeIcons[notification.category] || Activity;
                    return (
                      <div
                        key={notification.id}
                        onClick={() => !notification.is_read && markAsReadMutation.mutate(notification.id)}
                        className={`p-3 border-b border-slate-700/50 hover:bg-slate-800/50 cursor-pointer transition-colors ${
                          !notification.is_read ? 'bg-slate-800/30' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-lg ${typeColors[notification.type]} h-fit`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-white text-sm font-medium truncate">
                                {notification.title}
                              </p>
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-slate-500 text-xs mt-1">
                              {format(new Date(notification.created_date), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-2 border-t border-slate-700">
                <Link to={createPageUrl('Notifications')} onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full text-cyan-400 hover:text-cyan-300">
                    View All Notifications
                  </Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}