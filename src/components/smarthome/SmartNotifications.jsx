import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, BellOff, Settings, AlertTriangle, Check, X, Clock, Zap,
  Thermometer, Lock, Camera, Shield, Smartphone, Mail, MessageSquare,
  Volume2, VolumeX, Moon, Sun, Filter, Trash2, Eye, EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const notificationCategories = [
  { id: 'security', name: 'الأمان', icon: Shield, color: 'red', enabled: true, priority: 'high' },
  { id: 'energy', name: 'الطاقة', icon: Zap, color: 'amber', enabled: true, priority: 'medium' },
  { id: 'climate', name: 'المناخ', icon: Thermometer, color: 'cyan', enabled: true, priority: 'low' },
  { id: 'devices', name: 'الأجهزة', icon: Zap, color: 'purple', enabled: true, priority: 'medium' },
  { id: 'automation', name: 'الأتمتة', icon: Settings, color: 'green', enabled: false, priority: 'low' },
];

const mockNotifications = [
  { id: 1, category: 'security', title: 'تم فتح الباب الرئيسي', time: '2 دقيقة', priority: 'high', read: false },
  { id: 2, category: 'energy', title: 'استهلاك مرتفع للطاقة', time: '15 دقيقة', priority: 'medium', read: false },
  { id: 3, category: 'climate', title: 'درجة الحرارة أعلى من المعتاد', time: '30 دقيقة', priority: 'low', read: true },
  { id: 4, category: 'devices', title: 'الكاميرا غير متصلة', time: '1 ساعة', priority: 'high', read: true },
  { id: 5, category: 'automation', title: 'تم تنفيذ سيناريو الصباح', time: '3 ساعات', priority: 'low', read: true },
];

const deliveryChannels = [
  { id: 'push', name: 'إشعارات التطبيق', icon: Smartphone, enabled: true },
  { id: 'email', name: 'البريد الإلكتروني', icon: Mail, enabled: false },
  { id: 'sms', name: 'رسائل SMS', icon: MessageSquare, enabled: false },
  { id: 'sound', name: 'الصوت', icon: Volume2, enabled: true },
];

export default function SmartNotifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [categories, setCategories] = useState(notificationCategories);
  const [channels, setChannels] = useState(deliveryChannels);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [quietHours, setQuietHours] = useState({ enabled: true, start: '23:00', end: '07:00' });
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleCategory = (categoryId) => {
    setCategories(categories.map(c => 
      c.id === categoryId ? { ...c, enabled: !c.enabled } : c
    ));
  };

  const toggleChannel = (channelId) => {
    setChannels(channels.map(ch => 
      ch.id === channelId ? { ...ch, enabled: !ch.enabled } : ch
    ));
  };

  const markAsRead = (notificationId) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('تم تعيين جميع الإشعارات كمقروءة');
  };

  const deleteNotification = (notificationId) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
    toast.success('تم حذف الإشعار');
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.category === filter;
  });

  const getCategoryConfig = (categoryId) => categories.find(c => c.id === categoryId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            الإشعارات الذكية
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
            )}
          </h3>
          <p className="text-slate-400 text-sm">إدارة وتخصيص إشعارات المنزل الذكي</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-600" onClick={markAllAsRead}>
            <Check className="w-4 h-4 ml-2" />
            قراءة الكل
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowSettingsDialog(true)}>
            <Settings className="w-4 h-4 ml-2" />
            الإعدادات
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.slice(0, 4).map(cat => {
          const count = notifications.filter(n => n.category === cat.id).length;
          const unread = notifications.filter(n => n.category === cat.id && !n.read).length;
          return (
            <Card key={cat.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <cat.icon className={`w-5 h-5 text-${cat.color}-400`} />
                  {unread > 0 && <Badge className="bg-red-500 text-white text-xs">{unread}</Badge>}
                </div>
                <p className="text-white font-bold">{count}</p>
                <p className="text-slate-400 text-xs">{cat.name}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          size="sm"
          variant={filter === 'all' ? 'default' : 'outline'}
          className={filter === 'all' ? 'bg-cyan-600' : 'border-slate-600'}
          onClick={() => setFilter('all')}
        >
          الكل
        </Button>
        <Button
          size="sm"
          variant={filter === 'unread' ? 'default' : 'outline'}
          className={filter === 'unread' ? 'bg-red-600' : 'border-slate-600'}
          onClick={() => setFilter('unread')}
        >
          غير مقروء ({unreadCount})
        </Button>
        {categories.map(cat => (
          <Button
            key={cat.id}
            size="sm"
            variant={filter === cat.id ? 'default' : 'outline'}
            className={filter === cat.id ? `bg-${cat.color}-600` : 'border-slate-600'}
            onClick={() => setFilter(cat.id)}
          >
            <cat.icon className="w-3 h-3 ml-1" />
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredNotifications.map((notification, i) => {
            const category = getCategoryConfig(notification.category);
            const Icon = category?.icon || Bell;
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 ${
                  !notification.read ? 'border-r-4 border-r-cyan-500' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg bg-${category?.color || 'slate'}-500/20`}>
                        <Icon className={`w-5 h-5 text-${category?.color || 'slate'}-400`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className={`font-medium ${notification.read ? 'text-slate-300' : 'text-white'}`}>
                              {notification.title}
                            </h4>
                            <p className="text-slate-500 text-xs mt-1">{notification.time}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${
                              notification.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              notification.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>
                              {notification.priority === 'high' ? 'عالي' :
                               notification.priority === 'medium' ? 'متوسط' : 'منخفض'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {!notification.read && (
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => markAsRead(notification.id)}>
                            <Eye className="w-3 h-3 text-cyan-400" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteNotification(notification.id)}>
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredNotifications.length === 0 && (
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-8 text-center">
              <BellOff className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">لا توجد إشعارات</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">إعدادات الإشعارات</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* Categories */}
            <div>
              <h4 className="text-white font-medium mb-3">الفئات</h4>
              <div className="space-y-2">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <cat.icon className={`w-4 h-4 text-${cat.color}-400`} />
                      <span className="text-white text-sm">{cat.name}</span>
                    </div>
                    <Switch checked={cat.enabled} onCheckedChange={() => toggleCategory(cat.id)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Channels */}
            <div>
              <h4 className="text-white font-medium mb-3">قنوات الإرسال</h4>
              <div className="space-y-2">
                {channels.map(ch => (
                  <div key={ch.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ch.icon className="w-4 h-4 text-cyan-400" />
                      <span className="text-white text-sm">{ch.name}</span>
                    </div>
                    <Switch checked={ch.enabled} onCheckedChange={() => toggleChannel(ch.id)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Quiet Hours */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  ساعات الهدوء
                </h4>
                <Switch 
                  checked={quietHours.enabled} 
                  onCheckedChange={(v) => setQuietHours({ ...quietHours, enabled: v })} 
                />
              </div>
              {quietHours.enabled && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-slate-400 text-xs">من</Label>
                    <Input 
                      type="time" 
                      value={quietHours.start}
                      onChange={(e) => setQuietHours({ ...quietHours, start: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs">إلى</Label>
                    <Input 
                      type="time" 
                      value={quietHours.end}
                      onChange={(e) => setQuietHours({ ...quietHours, end: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    />
                  </div>
                </div>
              )}
            </div>

            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={() => { setShowSettingsDialog(false); toast.success('تم حفظ الإعدادات'); }}>
              <Check className="w-4 h-4 ml-2" />
              حفظ الإعدادات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}