import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MessageSquare, Activity, ChevronLeft, ChevronRight, 
  Bell, Settings, Video, Phone, Share2, Lock, Unlock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import PresenceIndicator from './PresenceIndicator';
import LiveActivityFeed from './LiveActivityFeed';
import CommentSystem from './CommentSystem';

export default function CollaborationPanel({ 
  dashboardId, 
  currentUser,
  onLayoutChange,
  isCollaborationEnabled = true,
  onToggleCollaboration
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('activity');
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: '1', type: 'comment', message: 'علق أحمد على تنبيه #45', unread: true },
    { id: '2', type: 'layout', message: 'قام خالد بتغيير التخطيط', unread: true },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleActivityClick = (activity) => {
    if (activity.type === 'comment') {
      setSelectedEntity({ type: 'alert', id: '45', title: 'تنبيه شذوذ' });
      setCommentDialogOpen(true);
    }
  };

  const openComments = (entityType, entityId, entityTitle) => {
    setSelectedEntity({ type: entityType, id: entityId, title: entityTitle });
    setCommentDialogOpen(true);
  };

  return (
    <>
      {/* Floating Collaboration Button (when collapsed) */}
      {!isExpanded && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-20 left-4 z-40"
        >
          <Button
            onClick={() => setIsExpanded(true)}
            className="h-14 w-14 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 shadow-lg shadow-cyan-500/30"
          >
            <Users className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
        </motion.div>
      )}

      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-4 left-4 z-40 w-80 bg-[#0f1629]/95 backdrop-blur-xl rounded-xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 overflow-hidden"
          >
            {/* Header */}
            <div className="p-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-b border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <span className="text-white font-bold">التعاون المباشر</span>
                  <Badge className="bg-green-500/20 text-green-400 text-xs animate-pulse">متصل</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(false)}
                  className="h-7 w-7 text-slate-400 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Presence Indicator */}
              <PresenceIndicator dashboardId={dashboardId} currentUser={currentUser} />
            </div>

            {/* Collaboration Toggle */}
            <div className="p-3 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isCollaborationEnabled ? (
                    <Unlock className="w-4 h-4 text-green-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                  <Label className="text-slate-300 text-sm">
                    {isCollaborationEnabled ? 'التحرير المشترك مفعل' : 'التحرير المشترك معطل'}
                  </Label>
                </div>
                <Switch 
                  checked={isCollaborationEnabled} 
                  onCheckedChange={onToggleCollaboration}
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="w-full bg-slate-800/50 rounded-none border-b border-slate-700/50 p-1">
                <TabsTrigger value="activity" className="flex-1 data-[state=active]:bg-cyan-500/20 text-xs">
                  <Activity className="w-3 h-3 ml-1" />
                  النشاط
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex-1 data-[state=active]:bg-cyan-500/20 text-xs relative">
                  <Bell className="w-3 h-3 ml-1" />
                  الإشعارات
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 right-0 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex-1 data-[state=active]:bg-cyan-500/20 text-xs">
                  <Settings className="w-3 h-3 ml-1" />
                  الإعدادات
                </TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="p-3 m-0">
                <LiveActivityFeed onActivityClick={handleActivityClick} />
              </TabsContent>

              <TabsContent value="notifications" className="p-3 m-0">
                <div className="space-y-2">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                        notif.unread 
                          ? 'bg-cyan-500/10 border-cyan-500/30' 
                          : 'bg-slate-800/30 border-slate-700/30'
                      }`}
                      onClick={() => {
                        setNotifications(notifications.map(n => 
                          n.id === notif.id ? { ...n, unread: false } : n
                        ));
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {notif.type === 'comment' ? (
                          <MessageSquare className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Activity className="w-4 h-4 text-cyan-400" />
                        )}
                        <span className="text-slate-300 text-xs">{notif.message}</span>
                        {notif.unread && (
                          <span className="w-2 h-2 bg-cyan-400 rounded-full mr-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="p-3 m-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300 text-xs">إشعارات التغييرات</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300 text-xs">إشعارات التعليقات</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300 text-xs">صوت الإشعارات</Label>
                    <Switch />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Quick Actions */}
            <div className="p-3 border-t border-slate-700/50 flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 border-slate-600 text-xs"
                onClick={() => openComments('dashboard', dashboardId, 'لوحة التحكم')}
              >
                <MessageSquare className="w-3 h-3 ml-1" />
                مناقشة
              </Button>
              <Button size="sm" variant="outline" className="border-slate-600 text-xs">
                <Share2 className="w-3 h-3 ml-1" />
                مشاركة
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment Dialog */}
      <CommentSystem
        entityType={selectedEntity?.type}
        entityId={selectedEntity?.id}
        entityTitle={selectedEntity?.title}
        isOpen={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
      />
    </>
  );
}