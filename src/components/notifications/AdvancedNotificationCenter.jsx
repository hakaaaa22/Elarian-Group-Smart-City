import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Bell, Settings, Filter, Search, CheckCircle, AlertTriangle, Info,
  Trash2, Eye, EyeOff, Mail, Clock, Calendar, Zap, Brain, TrendingUp,
  Volume2, VolumeX, RefreshCw, Download, BarChart3, X, Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// إعدادات الإشعارات الافتراضية
const defaultNotificationSettings = {
  predictive: { enabled: true, push: true, email: false, dailySummary: true },
  alerts: { enabled: true, push: true, email: true, dailySummary: false },
  insights: { enabled: true, push: false, email: false, dailySummary: true },
  system: { enabled: true, push: true, email: false, dailySummary: false },
  maintenance: { enabled: true, push: true, email: true, dailySummary: true },
};

// سجل الإشعارات
const notificationHistory = [
  { id: 1, type: 'predictive', title: 'توقع ارتفاع النفايات', message: 'زيادة متوقعة 25% الأسبوع القادم', status: 'read', timestamp: '2024-12-04 10:30', action: 'viewed' },
  { id: 2, type: 'alert', title: 'صيانة عاجلة', message: 'شاحنة TRK-003 تحتاج صيانة فورية', status: 'unread', timestamp: '2024-12-04 09:45', action: 'pending' },
  { id: 3, type: 'insight', title: 'فرصة تحسين', message: 'يمكن توفير 15% من الوقود بتحسين المسارات', status: 'read', timestamp: '2024-12-04 08:00', action: 'applied' },
  { id: 4, type: 'system', title: 'تحديث النظام', message: 'تم تحديث نماذج AI بنجاح', status: 'read', timestamp: '2024-12-03 18:00', action: 'completed' },
  { id: 5, type: 'maintenance', title: 'صيانة مجدولة', message: '5 أجهزة تحتاج صيانة هذا الأسبوع', status: 'unread', timestamp: '2024-12-03 14:00', action: 'scheduled' },
];

const typeConfig = {
  predictive: { label: 'تنبؤي', icon: TrendingUp, color: 'purple' },
  alert: { label: 'تنبيه', icon: AlertTriangle, color: 'red' },
  insight: { label: 'رؤية', icon: Brain, color: 'cyan' },
  system: { label: 'نظام', icon: Settings, color: 'slate' },
  maintenance: { label: 'صيانة', icon: Zap, color: 'amber' },
};

export default function AdvancedNotificationCenter() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notifications, setNotifications] = useState(notificationHistory);
  const [settings, setSettings] = useState(defaultNotificationSettings);
  const [showSettings, setShowSettings] = useState(false);

  const { data: dbNotifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date', 100),
    initialData: []
  });

  // تحميل إعدادات المستخدم
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.notification_settings) {
          setSettings({ ...defaultNotificationSettings, ...user.notification_settings });
        }
      } catch (e) {}
    };
    loadSettings();
  }, []);

  // حفظ الإعدادات
  const saveSettings = async () => {
    try {
      await base44.auth.updateMe({ notification_settings: settings });
      toast.success('تم حفظ إعدادات الإشعارات');
    } catch (e) {
      toast.error('فشل في حفظ الإعدادات');
    }
  };

  // تحديث حالة الإشعار
  const updateNotificationStatus = (id, status) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status } : n));
    toast.success(status === 'read' ? 'تم تحديد كمقروء' : 'تم تحديد كغير مقروء');
  };

  // حذف إشعار
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('تم حذف الإشعار');
  };

  // تحديد الكل كمقروء
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
    toast.success('تم تحديد جميع الإشعارات كمقروءة');
  };

  // فلترة الإشعارات
  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = searchQuery === '' || n.title.includes(searchQuery) || n.message.includes(searchQuery);
    const matchesType = filterType === 'all' || n.type === filterType;
    const matchesStatus = filterStatus === 'all' || n.status === filterStatus;
    const matchesTab = activeTab === 'all' || n.type === activeTab;
    return matchesSearch && matchesType && matchesStatus && matchesTab;
  });

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => n.status === 'unread').length,
    predictive: notifications.filter(n => n.type === 'predictive').length,
    alerts: notifications.filter(n => n.type === 'alert').length,
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-cyan-400" />
          مركز الإشعارات المتقدم
          {stats.unread > 0 && (
            <Badge className="bg-red-500 text-white">{stats.unread}</Badge>
          )}
        </h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="border-green-500 text-green-400" onClick={markAllAsRead}>
            <CheckCircle className="w-4 h-4 ml-1" />
            تحديد الكل مقروء
          </Button>
          <Button size="sm" variant={showSettings ? 'default' : 'outline'} className={showSettings ? 'bg-purple-600' : 'border-purple-500 text-purple-400'} onClick={() => setShowSettings(!showSettings)}>
            <Settings className="w-4 h-4 ml-1" />
            الإعدادات
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-slate-400 text-xs">إجمالي</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.unread}</p>
            <p className="text-red-400 text-xs">غير مقروء</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.predictive}</p>
            <p className="text-purple-400 text-xs">تنبؤي</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.alerts}</p>
            <p className="text-amber-400 text-xs">تنبيهات</p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card className="glass-card border-purple-500/30 bg-purple-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">إعدادات الإشعارات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(typeConfig).map(([type, config]) => (
                    <div key={type} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <config.icon className={`w-4 h-4 text-${config.color}-400`} />
                        <span className="text-white font-medium">{config.label}</span>
                        <Switch 
                          checked={settings[type]?.enabled} 
                          onCheckedChange={(v) => setSettings({ ...settings, [type]: { ...settings[type], enabled: v } })}
                          className="mr-auto"
                        />
                      </div>
                      {settings[type]?.enabled && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-slate-400 text-xs">إشعارات فورية</Label>
                            <Switch checked={settings[type]?.push} onCheckedChange={(v) => setSettings({ ...settings, [type]: { ...settings[type], push: v } })} />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-slate-400 text-xs">بريد إلكتروني</Label>
                            <Switch checked={settings[type]?.email} onCheckedChange={(v) => setSettings({ ...settings, [type]: { ...settings[type], email: v } })} />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-slate-400 text-xs">ملخص يومي</Label>
                            <Switch checked={settings[type]?.dailySummary} onCheckedChange={(v) => setSettings({ ...settings, [type]: { ...settings[type], dailySummary: v } })} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <Button className="mt-4 bg-purple-600 hover:bg-purple-700" onClick={saveSettings}>
                  <Check className="w-4 h-4 ml-2" />
                  حفظ الإعدادات
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="بحث..." className="pr-10 bg-slate-800/50 border-slate-700 text-white" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-28 bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="النوع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {Object.entries(typeConfig).map(([type, config]) => (
              <SelectItem key={type} value={type}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-28 bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="unread">غير مقروء</SelectItem>
            <SelectItem value="read">مقروء</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs & Notifications */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="all" className="data-[state=active]:bg-cyan-500/20">الكل</TabsTrigger>
          {Object.entries(typeConfig).map(([type, config]) => (
            <TabsTrigger key={type} value={type} className={`data-[state=active]:bg-${config.color}-500/20`}>
              <config.icon className="w-4 h-4 ml-1" />
              {config.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 pr-2">
              <AnimatePresence>
                {filteredNotifications.map(notification => {
                  const config = typeConfig[notification.type] || typeConfig.system;
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <Card className={`glass-card border-${config.color}-500/30 ${notification.status === 'unread' ? `bg-${config.color}-500/10` : 'bg-slate-800/30'}`}>
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-${config.color}-500/20`}>
                              <config.icon className={`w-4 h-4 text-${config.color}-400`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-white font-medium text-sm">{notification.title}</p>
                                {notification.status === 'unread' && (
                                  <span className="w-2 h-2 bg-cyan-500 rounded-full" />
                                )}
                              </div>
                              <p className="text-slate-400 text-xs mb-2">{notification.message}</p>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-slate-700 text-slate-300 text-xs">
                                  <Clock className="w-3 h-3 ml-1" />
                                  {notification.timestamp}
                                </Badge>
                                <Badge className={`bg-${config.color}-500/20 text-${config.color}-400 text-xs`}>
                                  {config.label}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" variant="ghost" className="h-6 w-6 p-0 text-slate-400"
                                onClick={() => updateNotificationStatus(notification.id, notification.status === 'read' ? 'unread' : 'read')}
                              >
                                {notification.status === 'read' ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-400" onClick={() => deleteNotification(notification.id)}>
                                <Trash2 className="w-3 h-3" />
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
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">لا توجد إشعارات</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}