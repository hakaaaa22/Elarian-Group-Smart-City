import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Settings, Search, Filter, Archive, Trash2, Check, X,
  Clock, AlertTriangle, Shield, Users, Camera, Car, Building2,
  Star, StarOff, Eye, MoreVertical, ChevronDown, Layers, Volume2,
  VolumeX, Mail, MessageSquare, Smartphone, Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const notificationTypes = {
  security: { icon: Shield, color: 'red', label: 'أمني' },
  visitor: { icon: Users, color: 'cyan', label: 'زوار' },
  workflow: { icon: Clock, color: 'amber', label: 'سير العمل' },
  system: { icon: Settings, color: 'blue', label: 'النظام' },
  camera: { icon: Camera, color: 'pink', label: 'كاميرات' },
  vehicle: { icon: Car, color: 'purple', label: 'مركبات' },
};

const mockNotifications = [
  { id: 1, type: 'security', priority: 'critical', title: 'محاولة دخول غير مصرح', message: 'تم رصد محاولة دخول لمنطقة محظورة من الزائر #4521', timestamp: '2025-01-15 14:30', read: false, starred: true, zone: 'المستودعات', grouped: false },
  { id: 2, type: 'visitor', priority: 'high', title: 'تجاوز وقت الخروج', message: 'الزائر سارة خالد تجاوز وقت الخروج المسموح', timestamp: '2025-01-15 14:25', read: false, starred: false, zone: 'الاستقبال', grouped: false },
  { id: 3, type: 'workflow', priority: 'medium', title: '3 تصاريح بانتظار الموافقة', message: 'لديك 3 طلبات تصاريح جديدة تحتاج موافقتك', timestamp: '2025-01-15 14:20', read: false, starred: false, grouped: true, groupCount: 3 },
  { id: 4, type: 'camera', priority: 'high', title: 'كشف وجه غير مسجل', message: 'تم رصد شخص غير معروف في كاميرا البوابة', timestamp: '2025-01-15 14:15', read: true, starred: false, zone: 'البوابة الرئيسية', grouped: false },
  { id: 5, type: 'system', priority: 'low', title: 'تحديث النظام', message: 'تم تحديث قاعدة بيانات الزوار بنجاح', timestamp: '2025-01-15 14:10', read: true, starred: false, grouped: false },
  { id: 6, type: 'vehicle', priority: 'medium', title: '5 مركبات جديدة', message: 'تم تسجيل 5 مركبات جديدة اليوم', timestamp: '2025-01-15 13:00', read: true, starred: false, grouped: true, groupCount: 5 },
];

const archivedNotifications = [
  { id: 101, type: 'security', priority: 'high', title: 'تنبيه أمني سابق', message: 'تم حل التنبيه الأمني', timestamp: '2025-01-14 10:00', archivedAt: '2025-01-14 12:00', zone: 'المستودعات' },
  { id: 102, type: 'workflow', priority: 'medium', title: 'تصريح تمت الموافقة عليه', message: 'تمت الموافقة على التصريح P-2024-085', timestamp: '2025-01-13 15:30', archivedAt: '2025-01-13 16:00', zone: 'الاستقبال' },
  { id: 103, type: 'visitor', priority: 'low', title: 'زيارة مكتملة', message: 'غادر الزائر أحمد محمد المنشأة بنجاح', timestamp: '2025-01-12 14:00', archivedAt: '2025-01-12 15:00', zone: 'البوابة الرئيسية' },
];

const zones = [
  { id: 'all', name: 'جميع المناطق' },
  { id: 'main_gate', name: 'البوابة الرئيسية' },
  { id: 'reception', name: 'الاستقبال' },
  { id: 'warehouse', name: 'المستودعات' },
  { id: 'offices', name: 'المكاتب' },
  { id: 'parking', name: 'مواقف السيارات' },
];

const defaultPreferences = {
  channels: { app: true, email: true, sms: false, push: true },
  priorities: { critical: true, high: true, medium: true, low: false },
  types: { security: true, visitor: true, workflow: true, system: false, camera: true, vehicle: true },
  zones: ['all'],
  quietHours: { enabled: false, start: '22:00', end: '07:00' },
  groupSimilar: true,
  soundEnabled: true,
  autoArchiveDays: 30,
};

export default function EnhancedNotificationSystem() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [archived, setArchived] = useState(archivedNotifications);
  const [activeTab, setActiveTab] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [archiveSearchQuery, setArchiveSearchQuery] = useState('');
  const [filterZone, setFilterZone] = useState('all');

  const filteredNotifications = notifications.filter(n => {
    const matchesPriority = filterPriority === 'all' || n.priority === filterPriority;
    const matchesType = filterType === 'all' || n.type === filterType;
    const matchesSearch = n.title.includes(searchQuery) || n.message.includes(searchQuery);
    const matchesZone = filterZone === 'all' || n.zone?.includes(zones.find(z => z.id === filterZone)?.name || '');
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'unread' && !n.read) || 
      (activeTab === 'starred' && n.starred);
    return matchesPriority && matchesType && matchesSearch && matchesZone && matchesTab;
  });

  const filteredArchived = archived.filter(n => {
    const matchesSearch = n.title.includes(archiveSearchQuery) || n.message.includes(archiveSearchQuery);
    return matchesSearch;
  });

  const markAsRead = (ids) => {
    setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, read: true } : n));
    toast.success('تم التحديث');
  };

  const toggleStar = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, starred: !n.starred } : n));
  };

  const archiveNotifications = (ids) => {
    const toArchive = notifications.filter(n => ids.includes(n.id));
    setArchived(prev => [...prev, ...toArchive.map(n => ({ ...n, archivedAt: new Date().toISOString() }))]);
    setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
    setSelectedNotifications([]);
    toast.success(`تم أرشفة ${ids.length} إشعار`);
  };

  const deleteNotifications = (ids) => {
    setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
    setSelectedNotifications([]);
    toast.success('تم الحذف');
  };

  const getPriorityColor = (priority) => {
    const colors = { critical: 'red', high: 'orange', medium: 'amber', low: 'green' };
    return colors[priority] || 'slate';
  };

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    critical: notifications.filter(n => n.priority === 'critical' && !n.read).length,
    archived: archived.length,
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
            <Bell className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">نظام الإشعارات المتقدم</h3>
            <p className="text-slate-500 text-sm">إشعارات قابلة للتخصيص • أرشفة • تجميع ذكي</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-slate-600" onClick={() => setShowPreferences(true)}>
            <Settings className="w-4 h-4 ml-2" />
            التفضيلات
          </Button>
          <Button variant="outline" className="border-slate-600" onClick={() => markAsRead(notifications.filter(n => !n.read).map(n => n.id))}>
            <Check className="w-4 h-4 ml-2" />
            قراءة الكل
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4 flex items-center gap-3">
            <Bell className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-slate-500 text-sm">الإجمالي</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Eye className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-2xl font-bold text-cyan-400">{stats.unread}</p>
              <p className="text-slate-500 text-sm">غير مقروء</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
              <p className="text-slate-500 text-sm">حرج</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-700/30 border-slate-600/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Archive className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-2xl font-bold text-slate-400">{stats.archived}</p>
              <p className="text-slate-500 text-sm">مؤرشف</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3 flex-1">
              <div className="relative min-w-[200px]">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="بحث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9 bg-slate-900/50 border-slate-700 text-white"
                />
              </div>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32 bg-slate-900/50 border-slate-700 text-white">
                  <SelectValue placeholder="الأولوية" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="critical">حرج</SelectItem>
                  <SelectItem value="high">عالي</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="low">منخفض</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32 bg-slate-900/50 border-slate-700 text-white">
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">الكل</SelectItem>
                  {Object.entries(notificationTypes).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterZone} onValueChange={setFilterZone}>
                <SelectTrigger className="w-36 bg-slate-900/50 border-slate-700 text-white">
                  <SelectValue placeholder="المنطقة" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {zones.map(zone => (
                    <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedNotifications.length > 0 && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-slate-600" onClick={() => archiveNotifications(selectedNotifications)}>
                  <Archive className="w-4 h-4 ml-1" />
                  أرشفة ({selectedNotifications.length})
                </Button>
                <Button size="sm" variant="outline" className="border-red-500/50 text-red-400" onClick={() => deleteNotifications(selectedNotifications)}>
                  <Trash2 className="w-4 h-4 ml-1" />
                  حذف
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="unread">غير مقروء ({stats.unread})</TabsTrigger>
          <TabsTrigger value="starred">مميز</TabsTrigger>
          <TabsTrigger value="archived">الأرشيف</TabsTrigger>
        </TabsList>

        <TabsContent value="archived" className="mt-4">
          <Card className="bg-slate-800/30 border-slate-700/50 mb-4">
            <CardContent className="p-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="بحث في الأرشيف..."
                  value={archiveSearchQuery}
                  onChange={(e) => setArchiveSearchQuery(e.target.value)}
                  className="pr-9 bg-slate-900/50 border-slate-700 text-white"
                />
              </div>
            </CardContent>
          </Card>
          <ScrollArea className="h-[350px]">
            <div className="space-y-2">
              {filteredArchived.map(n => {
                const typeConfig = notificationTypes[n.type];
                const Icon = typeConfig?.icon || Bell;
                return (
                  <motion.div 
                    key={n.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 bg-slate-900/30 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${typeConfig?.color}-500/10`}>
                        <Icon className={`w-4 h-4 text-${typeConfig?.color}-400`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-300 text-sm font-medium">{n.title}</p>
                        <p className="text-slate-500 text-xs">{n.message}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
                          <span>أُرشف: {n.archivedAt}</span>
                          {n.zone && <span>• {n.zone}</span>}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="h-8 text-cyan-400" onClick={() => {
                        setNotifications([...notifications, { ...n, read: true, starred: false }]);
                        setArchived(archived.filter(a => a.id !== n.id));
                        toast.success('تم استعادة الإشعار');
                      }}>
                        استعادة
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
              {filteredArchived.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Archive className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>لا توجد إشعارات مؤرشفة</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <NotificationList 
            notifications={filteredNotifications}
            selectedNotifications={selectedNotifications}
            setSelectedNotifications={setSelectedNotifications}
            markAsRead={markAsRead}
            toggleStar={toggleStar}
            archiveNotifications={archiveNotifications}
            notificationTypes={notificationTypes}
            getPriorityColor={getPriorityColor}
          />
        </TabsContent>
        <TabsContent value="unread" className="mt-4">
          <NotificationList 
            notifications={filteredNotifications}
            selectedNotifications={selectedNotifications}
            setSelectedNotifications={setSelectedNotifications}
            markAsRead={markAsRead}
            toggleStar={toggleStar}
            archiveNotifications={archiveNotifications}
            notificationTypes={notificationTypes}
            getPriorityColor={getPriorityColor}
          />
        </TabsContent>
        <TabsContent value="starred" className="mt-4">
          <NotificationList 
            notifications={filteredNotifications}
            selectedNotifications={selectedNotifications}
            setSelectedNotifications={setSelectedNotifications}
            markAsRead={markAsRead}
            toggleStar={toggleStar}
            archiveNotifications={archiveNotifications}
            notificationTypes={notificationTypes}
            getPriorityColor={getPriorityColor}
          />
        </TabsContent>
      </Tabs>

      {/* Preferences Dialog */}
      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              تفضيلات الإشعارات
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* Channels */}
            <div>
              <h4 className="text-white font-medium mb-3">قنوات الإشعار</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'app', label: 'التطبيق', icon: Bell },
                  { key: 'email', label: 'البريد', icon: Mail },
                  { key: 'sms', label: 'SMS', icon: MessageSquare },
                  { key: 'push', label: 'Push', icon: Smartphone },
                ].map(channel => (
                  <div key={channel.key} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <channel.icon className="w-4 h-4 text-slate-400" />
                      <span className="text-white text-sm">{channel.label}</span>
                    </div>
                    <Switch 
                      checked={preferences.channels[channel.key]} 
                      onCheckedChange={(v) => setPreferences({...preferences, channels: {...preferences.channels, [channel.key]: v}})}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <h4 className="text-white font-medium mb-3">فلتر الأولوية</h4>
              <div className="flex flex-wrap gap-2">
                {['critical', 'high', 'medium', 'low'].map(p => (
                  <Badge 
                    key={p}
                    variant="outline"
                    className={`cursor-pointer ${preferences.priorities[p] ? `border-${getPriorityColor(p)}-500 bg-${getPriorityColor(p)}-500/20 text-${getPriorityColor(p)}-400` : 'border-slate-600 text-slate-500'}`}
                    onClick={() => setPreferences({...preferences, priorities: {...preferences.priorities, [p]: !preferences.priorities[p]}})}
                  >
                    {p === 'critical' ? 'حرج' : p === 'high' ? 'عالي' : p === 'medium' ? 'متوسط' : 'منخفض'}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Zone Preferences */}
            <div>
              <h4 className="text-white font-medium mb-3">فلتر المناطق</h4>
              <div className="flex flex-wrap gap-2">
                {zones.map(zone => (
                  <Badge 
                    key={zone.id}
                    variant="outline"
                    className={`cursor-pointer ${preferences.zones.includes(zone.id) || preferences.zones.includes('all') ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400' : 'border-slate-600 text-slate-500'}`}
                    onClick={() => {
                      if (zone.id === 'all') {
                        setPreferences({...preferences, zones: ['all']});
                      } else {
                        const newZones = preferences.zones.includes(zone.id)
                          ? preferences.zones.filter(z => z !== zone.id)
                          : [...preferences.zones.filter(z => z !== 'all'), zone.id];
                        setPreferences({...preferences, zones: newZones.length ? newZones : ['all']});
                      }
                    }}
                  >
                    {zone.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span className="text-white text-sm">تجميع الإشعارات المتشابهة</span>
                </div>
                <Switch checked={preferences.groupSimilar} onCheckedChange={(v) => setPreferences({...preferences, groupSimilar: v})} />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  {preferences.soundEnabled ? <Volume2 className="w-4 h-4 text-slate-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                  <span className="text-white text-sm">صوت الإشعارات</span>
                </div>
                <Switch checked={preferences.soundEnabled} onCheckedChange={(v) => setPreferences({...preferences, soundEnabled: v})} />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Archive className="w-4 h-4 text-slate-400" />
                  <span className="text-white text-sm">أرشفة تلقائية بعد</span>
                </div>
                <Select value={String(preferences.autoArchiveDays)} onValueChange={(v) => setPreferences({...preferences, autoArchiveDays: parseInt(v)})}>
                  <SelectTrigger className="w-24 h-8 bg-slate-900/50 border-slate-700 text-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="7">7 أيام</SelectItem>
                    <SelectItem value="14">14 يوم</SelectItem>
                    <SelectItem value="30">30 يوم</SelectItem>
                    <SelectItem value="60">60 يوم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={() => { setShowPreferences(false); toast.success('تم حفظ التفضيلات'); }}>
              <Save className="w-4 h-4 ml-2" />
              حفظ التفضيلات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NotificationList({ notifications, selectedNotifications, setSelectedNotifications, markAsRead, toggleStar, archiveNotifications, notificationTypes, getPriorityColor }) {
  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2">
        <AnimatePresence>
          {notifications.map(n => {
            const typeConfig = notificationTypes[n.type];
            const Icon = typeConfig?.icon || Bell;
            const isSelected = selectedNotifications.includes(n.id);
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`p-3 rounded-lg border transition-all ${
                  n.read ? 'bg-slate-900/30 border-slate-700/30' : 'bg-slate-900/50 border-slate-700/50'
                } ${isSelected ? 'ring-2 ring-cyan-500/50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedNotifications([...selectedNotifications, n.id]);
                      else setSelectedNotifications(selectedNotifications.filter(id => id !== n.id));
                    }}
                    className="mt-1"
                  />
                  <div className={`p-2 rounded-lg bg-${typeConfig?.color}-500/20 flex-shrink-0`}>
                    <Icon className={`w-4 h-4 text-${typeConfig?.color}-400`} />
                  </div>
                  <div className="flex-1 min-w-0" onClick={() => markAsRead([n.id])}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${n.read ? 'text-slate-400' : 'text-white'}`}>
                        {n.title}
                      </span>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                      <Badge className={`bg-${getPriorityColor(n.priority)}-500/20 text-${getPriorityColor(n.priority)}-400 text-xs`}>
                        {n.priority === 'critical' ? 'حرج' : n.priority === 'high' ? 'عالي' : n.priority === 'medium' ? 'متوسط' : 'منخفض'}
                      </Badge>
                      {n.grouped && (
                        <Badge variant="outline" className="border-purple-500/50 text-purple-400 text-xs">
                          +{n.groupCount} مجمّع
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-500 text-sm truncate">{n.message}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
                      <span>{n.timestamp}</span>
                      {n.zone && <span>• {n.zone}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toggleStar(n.id)}>
                      {n.starred ? <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> : <StarOff className="w-4 h-4 text-slate-500" />}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-slate-800 border-slate-700">
                        <DropdownMenuItem onClick={() => markAsRead([n.id])}>
                          <Eye className="w-4 h-4 ml-2" />تحديد كمقروء
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => archiveNotifications([n.id])}>
                          <Archive className="w-4 h-4 ml-2" />أرشفة
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}