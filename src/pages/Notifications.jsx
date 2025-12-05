import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Bell, AlertTriangle, Shield, Camera, Car, Plane, Activity,
  Check, Trash2, Filter, Search, Settings, Mail, MessageSquare,
  Smartphone, Volume2, VolumeX, Clock, Calendar, RefreshCw,
  ChevronDown, Download, Archive, Eye, EyeOff, Zap, Thermometer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const typeIcons = {
  incident: AlertTriangle,
  system: Activity,
  security: Shield,
  traffic: Car,
  camera: Camera,
  drone: Plane,
  sensor: Thermometer,
  device: Zap,
};

const typeColors = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const notificationCategories = [
  { id: 'incident', name: 'الحوادث', icon: AlertTriangle },
  { id: 'security', name: 'الأمان', icon: Shield },
  { id: 'device', name: 'الأجهزة', icon: Zap },
  { id: 'sensor', name: 'المستشعرات', icon: Thermometer },
  { id: 'camera', name: 'الكاميرات', icon: Camera },
  { id: 'traffic', name: 'المرور', icon: Car },
  { id: 'drone', name: 'الطائرات', icon: Plane },
  { id: 'system', name: 'النظام', icon: Activity },
];

const defaultPreferences = {
  channels: {
    inApp: true,
    email: true,
    sms: false,
    whatsapp: false,
  },
  categories: {
    incident: { enabled: true, critical: true, warning: true, info: true },
    security: { enabled: true, critical: true, warning: true, info: false },
    device: { enabled: true, critical: true, warning: true, info: false },
    sensor: { enabled: true, critical: true, warning: false, info: false },
    camera: { enabled: true, critical: true, warning: true, info: false },
    traffic: { enabled: false, critical: true, warning: false, info: false },
    drone: { enabled: true, critical: true, warning: true, info: false },
    system: { enabled: true, critical: true, warning: true, info: true },
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00',
  },
  soundEnabled: true,
};

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('realtime');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [showPreferences, setShowPreferences] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date', 200),
    refetchInterval: 10000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('تم تحديد جميع الإشعارات كمقروءة');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  // Real-time notification effect
  useEffect(() => {
    const unread = notifications.filter(n => !n.is_read);
    if (unread.length > 0 && preferences.soundEnabled) {
      // Play notification sound for critical alerts
      const critical = unread.find(n => n.type === 'critical');
      if (critical) {
        // Sound would be played here
      }
    }
  }, [notifications, preferences.soundEnabled]);

  const filteredNotifications = notifications.filter(n => {
    const matchesType = typeFilter === 'all' || n.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || n.category === categoryFilter;
    const matchesSearch = n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         n.message?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = (!dateRange.from || new Date(n.created_date) >= new Date(dateRange.from)) &&
                       (!dateRange.to || new Date(n.created_date) <= new Date(dateRange.to));
    return matchesType && matchesCategory && matchesSearch && matchesDate;
  });

  const realtimeNotifications = filteredNotifications.filter(n => {
    const date = new Date(n.created_date);
    const now = new Date();
    const hoursDiff = (now - date) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  });

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.is_read).length,
    critical: notifications.filter(n => n.type === 'critical').length,
    today: notifications.filter(n => {
      const today = new Date();
      const created = new Date(n.created_date);
      return created.toDateString() === today.toDateString();
    }).length,
  };

  const savePreferences = () => {
    toast.success('تم حفظ تفضيلات الإشعارات');
    setShowPreferences(false);
  };

  const exportNotifications = () => {
    const csv = filteredNotifications.map(n => 
      `${n.created_date},${n.type},${n.category},${n.title},${n.message}`
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notifications.csv';
    a.click();
    toast.success('تم تصدير الإشعارات');
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-cyan-400" />
            مركز الإشعارات
          </h1>
          <p className="text-slate-400 mt-1">إدارة الإشعارات وتخصيص التفضيلات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-600" onClick={exportNotifications}>
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-600 hover:bg-cyan-700">
                <Settings className="w-4 h-4 ml-2" />
                التفضيلات
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">تفضيلات الإشعارات</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                {/* Notification Channels */}
                <div>
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    قنوات الإشعارات
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'inApp', label: 'داخل التطبيق', icon: Bell },
                      { key: 'email', label: 'البريد الإلكتروني', icon: Mail },
                      { key: 'sms', label: 'رسائل SMS', icon: Smartphone },
                      { key: 'whatsapp', label: 'واتساب', icon: MessageSquare },
                    ].map(channel => (
                      <div key={channel.key} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <channel.icon className="w-4 h-4 text-slate-400" />
                          <span className="text-white text-sm">{channel.label}</span>
                        </div>
                        <Switch
                          checked={preferences.channels[channel.key]}
                          onCheckedChange={(v) => setPreferences({
                            ...preferences,
                            channels: { ...preferences.channels, [channel.key]: v }
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Preferences */}
                <div>
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-purple-400" />
                    تفضيلات الفئات
                  </h3>
                  <div className="space-y-2">
                    {notificationCategories.map(cat => (
                      <div key={cat.id} className="p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <cat.icon className="w-4 h-4 text-slate-400" />
                            <span className="text-white text-sm">{cat.name}</span>
                          </div>
                          <Switch
                            checked={preferences.categories[cat.id]?.enabled}
                            onCheckedChange={(v) => setPreferences({
                              ...preferences,
                              categories: {
                                ...preferences.categories,
                                [cat.id]: { ...preferences.categories[cat.id], enabled: v }
                              }
                            })}
                          />
                        </div>
                        {preferences.categories[cat.id]?.enabled && (
                          <div className="flex gap-3 mt-2 mr-6">
                            {['critical', 'warning', 'info'].map(level => (
                              <label key={level} className="flex items-center gap-1 cursor-pointer">
                                <Checkbox
                                  checked={preferences.categories[cat.id]?.[level]}
                                  onCheckedChange={(v) => setPreferences({
                                    ...preferences,
                                    categories: {
                                      ...preferences.categories,
                                      [cat.id]: { ...preferences.categories[cat.id], [level]: v }
                                    }
                                  })}
                                  className="border-slate-600"
                                />
                                <span className={`text-xs ${
                                  level === 'critical' ? 'text-red-400' :
                                  level === 'warning' ? 'text-amber-400' : 'text-blue-400'
                                }`}>{level === 'critical' ? 'حرج' : level === 'warning' ? 'تحذير' : 'معلومة'}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quiet Hours */}
                <div>
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    أوقات الهدوء
                  </h3>
                  <div className="p-3 bg-slate-800/50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">تفعيل أوقات الهدوء</span>
                      <Switch
                        checked={preferences.quietHours.enabled}
                        onCheckedChange={(v) => setPreferences({
                          ...preferences,
                          quietHours: { ...preferences.quietHours, enabled: v }
                        })}
                      />
                    </div>
                    {preferences.quietHours.enabled && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-slate-400 text-xs">من</Label>
                          <Input
                            type="time"
                            value={preferences.quietHours.start}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              quietHours: { ...preferences.quietHours, start: e.target.value }
                            })}
                            className="bg-slate-900 border-slate-700 text-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-400 text-xs">إلى</Label>
                          <Input
                            type="time"
                            value={preferences.quietHours.end}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              quietHours: { ...preferences.quietHours, end: e.target.value }
                            })}
                            className="bg-slate-900 border-slate-700 text-white mt-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sound */}
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {preferences.soundEnabled ? <Volume2 className="w-4 h-4 text-green-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                    <span className="text-white text-sm">أصوات الإشعارات</span>
                  </div>
                  <Switch
                    checked={preferences.soundEnabled}
                    onCheckedChange={(v) => setPreferences({ ...preferences, soundEnabled: v })}
                  />
                </div>

                <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={savePreferences}>
                  حفظ التفضيلات
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'الإجمالي', value: stats.total, icon: Bell, color: 'cyan' },
          { label: 'غير مقروء', value: stats.unread, icon: Eye, color: 'purple' },
          { label: 'حرج', value: stats.critical, icon: AlertTriangle, color: 'red' },
          { label: 'اليوم', value: stats.today, icon: Calendar, color: 'green' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-500/20`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="realtime" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Zap className="w-4 h-4 ml-2" />
            الوقت الفعلي ({realtimeNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Archive className="w-4 h-4 ml-2" />
            السجل ({notifications.length})
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 mt-4">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="بحث في الإشعارات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9 bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="critical">حرج</SelectItem>
                  <SelectItem value="warning">تحذير</SelectItem>
                  <SelectItem value="info">معلومة</SelectItem>
                  <SelectItem value="success">نجاح</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="الفئة" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  {notificationCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {stats.unread > 0 && (
                <Button 
                  variant="outline" 
                  className="border-cyan-500/50 text-cyan-400"
                  onClick={() => markAllReadMutation.mutate()}
                >
                  <Check className="w-4 h-4 ml-2" />
                  تحديد الكل كمقروء
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <TabsContent value="realtime" className="space-y-3 mt-4">
          {realtimeNotifications.length === 0 ? (
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">لا توجد إشعارات في الوقت الفعلي</p>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence>
              {realtimeNotifications.map((notification, i) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  index={i}
                  onMarkRead={() => markAsReadMutation.mutate(notification.id)}
                  onDelete={() => deleteMutation.mutate(notification.id)}
                />
              ))}
            </AnimatePresence>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-3 mt-4">
          {/* Date Range Filter for History */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                <div>
                  <Label className="text-slate-400 text-xs">من تاريخ</Label>
                  <Input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-slate-400 text-xs">إلى تاريخ</Label>
                  <Input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {filteredNotifications.length === 0 ? (
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-8 text-center">
                <Archive className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">لا توجد إشعارات في السجل</p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification, i) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                index={i}
                onMarkRead={() => markAsReadMutation.mutate(notification.id)}
                onDelete={() => deleteMutation.mutate(notification.id)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationCard({ notification, index, onMarkRead, onDelete }) {
  const Icon = typeIcons[notification.category] || Activity;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.02 }}
    >
      <Card className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 ${
        !notification.is_read ? 'border-r-2 border-r-cyan-500' : ''
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${typeColors[notification.type]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-medium">{notification.title}</h3>
                    <Badge className={`${typeColors[notification.type]} border text-xs`}>
                      {notification.type === 'critical' ? 'حرج' : 
                       notification.type === 'warning' ? 'تحذير' : 
                       notification.type === 'info' ? 'معلومة' : 'نجاح'}
                    </Badge>
                    {notification.category && (
                      <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                        {notificationCategories.find(c => c.id === notification.category)?.name || notification.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{notification.message}</p>
                  <p className="text-slate-500 text-xs mt-2">
                    {format(new Date(notification.created_date), 'dd MMMM yyyy - HH:mm')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onMarkRead}
                      className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDelete}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}