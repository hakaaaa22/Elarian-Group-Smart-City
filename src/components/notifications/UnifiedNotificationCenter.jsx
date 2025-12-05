import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Filter, Search, CheckCircle, AlertTriangle, Clock, X,
  Settings, Trash2, Eye, ChevronDown, Calendar, Shield, Users,
  Car, Camera, Building2, Zap, RefreshCw, Check, MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const notificationTypes = {
  alert: { icon: AlertTriangle, color: 'red', label: 'تنبيه أمني' },
  workflow: { icon: Clock, color: 'amber', label: 'سير العمل' },
  system: { icon: Settings, color: 'blue', label: 'النظام' },
  visitor: { icon: Users, color: 'cyan', label: 'زوار' },
  vehicle: { icon: Car, color: 'purple', label: 'مركبات' },
  camera: { icon: Camera, color: 'pink', label: 'كاميرات' },
};

const mockNotifications = [
  { id: 1, type: 'alert', priority: 'critical', title: 'تجاوز وقت الخروج', message: 'الزائر أحمد محمد تجاوز وقت الخروج المسموح بساعتين', timestamp: '2025-01-15 10:30', read: false, linkedCamera: 'cam1' },
  { id: 2, type: 'workflow', priority: 'high', title: 'تصريح بانتظار الموافقة', message: 'طلب تصريح جديد من شركة التقنية بانتظار موافقتك', timestamp: '2025-01-15 10:25', read: false },
  { id: 3, type: 'camera', priority: 'high', title: 'كشف وجه غير مسجل', message: 'تم رصد شخص غير مسجل في منطقة الاستقبال', timestamp: '2025-01-15 10:20', read: false, linkedCamera: 'cam2' },
  { id: 4, type: 'visitor', priority: 'medium', title: 'وصول زائر VIP', message: 'الزائر م. خالد العريان وصل للبوابة الرئيسية', timestamp: '2025-01-15 10:15', read: true },
  { id: 5, type: 'system', priority: 'low', title: 'تحديث النظام', message: 'تم تحديث قاعدة بيانات الزوار بنجاح', timestamp: '2025-01-15 10:10', read: true },
  { id: 6, type: 'vehicle', priority: 'medium', title: 'لوحة مركبة جديدة', message: 'تم تسجيل لوحة المركبة ABC 1234 للزائر محمد علي', timestamp: '2025-01-15 10:05', read: true },
  { id: 7, type: 'alert', priority: 'high', title: 'محاولة دخول غير مصرح', message: 'محاولة دخول لمنطقة محظورة من الزائر سارة أحمد', timestamp: '2025-01-15 09:55', read: false, linkedCamera: 'cam3' },
  { id: 8, type: 'workflow', priority: 'medium', title: 'تصريح منتهي', message: '5 تصاريح ستنتهي صلاحيتها اليوم', timestamp: '2025-01-15 09:00', read: true },
];

export default function UnifiedNotificationCenter() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filteredNotifications = notifications.filter(n => {
    const matchesType = filterType === 'all' || n.type === filterType;
    const matchesPriority = filterPriority === 'all' || n.priority === filterPriority;
    const matchesSearch = n.title.includes(searchQuery) || n.message.includes(searchQuery);
    const matchesUnread = !showUnreadOnly || !n.read;
    return matchesType && matchesPriority && matchesSearch && matchesUnread;
  });

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('تم تحديد الكل كمقروء');
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('تم حذف الإشعار');
  };

  const getPriorityBadge = (priority) => {
    const config = {
      critical: { color: 'bg-red-500/20 text-red-400', label: 'حرج' },
      high: { color: 'bg-amber-500/20 text-amber-400', label: 'عالي' },
      medium: { color: 'bg-blue-500/20 text-blue-400', label: 'متوسط' },
      low: { color: 'bg-green-500/20 text-green-400', label: 'منخفض' },
    };
    return <Badge className={config[priority]?.color}>{config[priority]?.label}</Badge>;
  };

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    critical: notifications.filter(n => n.priority === 'critical' && !n.read).length,
  };

  return (
    <Card className="bg-slate-800/30 border-slate-700/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            مركز الإشعارات الموحد
            {stats.unread > 0 && (
              <Badge className="bg-red-500 text-white">{stats.unread}</Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="text-slate-400" onClick={markAllAsRead}>
              <Check className="w-4 h-4 ml-1" />
              تحديد الكل كمقروء
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-9 bg-slate-900/50 border-slate-700 text-white"
            />
          </div>
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
          <div className="flex items-center gap-2">
            <Checkbox
              id="unread"
              checked={showUnreadOnly}
              onCheckedChange={setShowUnreadOnly}
              className="border-slate-600"
            />
            <label htmlFor="unread" className="text-slate-400 text-sm cursor-pointer">
              غير مقروءة فقط
            </label>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-900/50 rounded-lg text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-slate-500 text-xs">الإجمالي</p>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-lg text-center">
            <p className="text-2xl font-bold text-cyan-400">{stats.unread}</p>
            <p className="text-slate-500 text-xs">غير مقروء</p>
          </div>
          <div className="p-3 bg-red-500/10 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
            <p className="text-slate-500 text-xs">حرج</p>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            <AnimatePresence>
              {filteredNotifications.map((notification) => {
                const typeConfig = notificationTypes[notification.type];
                const Icon = typeConfig?.icon || Bell;
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      notification.read 
                        ? 'bg-slate-900/30 border-slate-700/30' 
                        : 'bg-slate-900/50 border-slate-700/50 hover:border-cyan-500/30'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-${typeConfig?.color}-500/20 flex-shrink-0`}>
                        <Icon className={`w-4 h-4 text-${typeConfig?.color}-400`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium ${notification.read ? 'text-slate-400' : 'text-white'}`}>
                            {notification.title}
                          </span>
                          {!notification.read && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                          {getPriorityBadge(notification.priority)}
                        </div>
                        <p className="text-slate-500 text-sm truncate">{notification.message}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-slate-600 text-xs">{notification.timestamp}</span>
                          {notification.linkedCamera && (
                            <Badge variant="outline" className="border-pink-500/50 text-pink-400 text-xs">
                              <Camera className="w-3 h-3 ml-1" />
                              كاميرا مرتبطة
                            </Badge>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-slate-800 border-slate-700">
                          <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                            <Eye className="w-4 h-4 ml-2" />
                            تحديد كمقروء
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteNotification(notification.id)} className="text-red-400">
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}