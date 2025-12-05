import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Check, CheckCheck, Trash2, Filter, Search, Clock, AlertTriangle,
  Info, CheckCircle, XCircle, Settings, Volume2, VolumeX, Archive,
  MailOpen, Mail, Star, StarOff, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Mock Notifications
const mockNotifications = [
  { id: 1, type: 'alert', title: 'تنبيه أمني', message: 'تم اكتشاف محاولة دخول غير مصرح بها', time: '5 دقائق', read: false, starred: true, category: 'security' },
  { id: 2, type: 'info', title: 'تحديث النظام', message: 'سيتم إجراء صيانة مجدولة الليلة', time: '15 دقيقة', read: false, starred: false, category: 'system' },
  { id: 3, type: 'success', title: 'اكتملت المهمة', message: 'تم إنجاز صيانة المكيف بنجاح', time: '30 دقيقة', read: true, starred: false, category: 'tasks' },
  { id: 4, type: 'warning', title: 'انخفاض المخزون', message: 'فلاتر المكيف وصلت للحد الأدنى', time: '1 ساعة', read: false, starred: true, category: 'inventory' },
  { id: 5, type: 'info', title: 'رسالة جديدة', message: 'لديك رسالة من العميل أحمد محمد', time: '2 ساعة', read: true, starred: false, category: 'messages' },
  { id: 6, type: 'alert', title: 'مهمة متأخرة', message: 'صيانة طارئة تجاوزت الوقت المحدد', time: '3 ساعات', read: false, starred: false, category: 'tasks' },
  { id: 7, type: 'success', title: 'تقرير جاهز', message: 'تقرير الأداء الشهري جاهز للتحميل', time: '4 ساعات', read: true, starred: false, category: 'reports' },
  { id: 8, type: 'info', title: 'موعد قادم', message: 'اجتماع فريق الصيانة غداً الساعة 10', time: '5 ساعات', read: true, starred: true, category: 'calendar' },
];

const typeConfig = {
  alert: { icon: AlertTriangle, color: 'red', label: 'تنبيه' },
  warning: { icon: AlertTriangle, color: 'amber', label: 'تحذير' },
  info: { icon: Info, color: 'blue', label: 'معلومات' },
  success: { icon: CheckCircle, color: 'green', label: 'نجاح' },
  error: { icon: XCircle, color: 'red', label: 'خطأ' },
};

const categories = [
  { id: 'all', name: 'الكل' },
  { id: 'security', name: 'الأمان' },
  { id: 'system', name: 'النظام' },
  { id: 'tasks', name: 'المهام' },
  { id: 'inventory', name: 'المخزون' },
  { id: 'messages', name: 'الرسائل' },
  { id: 'reports', name: 'التقارير' },
  { id: 'calendar', name: 'المواعيد' },
];

export default function NotificationCenter({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [desktopEnabled, setDesktopEnabled] = useState(true);

  const stats = useMemo(() => ({
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    starred: notifications.filter(n => n.starred).length,
    alerts: notifications.filter(n => n.type === 'alert' && !n.read).length,
  }), [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchesSearch = n.title.includes(searchQuery) || n.message.includes(searchQuery);
      const matchesType = filterType === 'all' || n.type === filterType;
      const matchesCategory = filterCategory === 'all' || n.category === filterCategory;
      const matchesTab = activeTab === 'all' || 
        (activeTab === 'unread' && !n.read) || 
        (activeTab === 'starred' && n.starred);
      return matchesSearch && matchesType && matchesCategory && matchesTab;
    });
  }, [notifications, searchQuery, filterType, filterCategory, activeTab]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('تم تعليم الكل كمقروء');
  };

  const toggleStar = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, starred: !n.starred } : n));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast.success('تم حذف الإشعار');
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success('تم مسح جميع الإشعارات');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="absolute left-0 top-0 h-full w-full max-w-lg bg-[#0f1629] border-r border-slate-700"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-cyan-400" />
              مركز الإشعارات
            </h2>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => setShowSettings(true)}>
                <Settings className="w-4 h-4 text-slate-400" />
              </Button>
              <Button size="icon" variant="ghost" onClick={onClose}>
                <XCircle className="w-5 h-5 text-slate-400" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="text-center p-2 bg-slate-800/50 rounded">
              <p className="text-white font-bold">{stats.total}</p>
              <p className="text-slate-500 text-xs">الكل</p>
            </div>
            <div className="text-center p-2 bg-cyan-500/10 rounded">
              <p className="text-cyan-400 font-bold">{stats.unread}</p>
              <p className="text-slate-500 text-xs">غير مقروء</p>
            </div>
            <div className="text-center p-2 bg-amber-500/10 rounded">
              <p className="text-amber-400 font-bold">{stats.starred}</p>
              <p className="text-slate-500 text-xs">مميز</p>
            </div>
            <div className="text-center p-2 bg-red-500/10 rounded">
              <p className="text-red-400 font-bold">{stats.alerts}</p>
              <p className="text-slate-500 text-xs">تنبيهات</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-slate-800/50">
              <TabsTrigger value="all" className="flex-1">الكل</TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">غير مقروء</TabsTrigger>
              <TabsTrigger value="starred" className="flex-1">مميز</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search & Filter */}
          <div className="flex gap-2 mt-3">
            <div className="relative flex-1">
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="بحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8 bg-slate-800/50 border-slate-700 text-white h-8"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-28 bg-slate-800/50 border-slate-700 text-white h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions */}
        <div className="p-2 border-b border-slate-700 flex gap-2">
          <Button size="sm" variant="ghost" className="text-cyan-400 text-xs" onClick={markAllAsRead}>
            <CheckCheck className="w-3 h-3 ml-1" />
            تعليم الكل مقروء
          </Button>
          <Button size="sm" variant="ghost" className="text-red-400 text-xs" onClick={clearAll}>
            <Trash2 className="w-3 h-3 ml-1" />
            مسح الكل
          </Button>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="p-2 space-y-2">
            <AnimatePresence>
              {filteredNotifications.map((notification, i) => {
                const config = typeConfig[notification.type] || typeConfig.info;
                const Icon = config.icon;
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.02 }}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      notification.read ? 'bg-slate-800/30' : 'bg-slate-800/60 border-r-2 border-cyan-500'
                    } hover:bg-slate-800/50`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-${config.color}-500/20 mt-1`}>
                        <Icon className={`w-4 h-4 text-${config.color}-400`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm font-medium ${notification.read ? 'text-slate-300' : 'text-white'}`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); toggleStar(notification.id); }}>
                              {notification.starred ? <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> : <StarOff className="w-3 h-3 text-slate-500" />}
                            </Button>
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-slate-400 text-xs truncate">{notification.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`text-xs bg-${config.color}-500/20 text-${config.color}-400`}>{config.label}</Badge>
                          <span className="text-slate-500 text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {notification.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredNotifications.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">لا توجد إشعارات</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="bg-[#0f1629] border-slate-700 max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400" />
                إعدادات الإشعارات
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-green-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                  <Label className="text-white">الأصوات</Label>
                </div>
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <Label className="text-white">إشعارات سطح المكتب</Label>
                </div>
                <Switch checked={desktopEnabled} onCheckedChange={setDesktopEnabled} />
              </div>
              <Button className="w-full" onClick={() => { setShowSettings(false); toast.success('تم حفظ الإعدادات'); }}>
                حفظ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </motion.div>
  );
}