import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, AlertTriangle, Wrench, Package, Zap, X, Check,
  ChevronRight, Clock, Eye, Settings, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// تنبيهات تجريبية
const mockNotifications = [
  {
    id: 1,
    type: 'maintenance',
    priority: 'critical',
    title: 'صيانة عاجلة مطلوبة',
    message: 'مكيف غرفة النوم - صحة الجهاز 32%',
    time: '5 دقائق',
    read: false,
    actionUrl: 'MaintenanceTracker',
    icon: Wrench
  },
  {
    id: 2,
    type: 'inventory',
    priority: 'high',
    title: 'مخزون منخفض',
    message: 'بطارية كاميرا - باقي 2 قطعة فقط',
    time: '15 دقيقة',
    read: false,
    actionUrl: 'InventoryManagement',
    icon: Package
  },
  {
    id: 3,
    type: 'energy',
    priority: 'medium',
    title: 'استهلاك مرتفع',
    message: 'ارتفاع 25% في استهلاك الطاقة',
    time: '30 دقيقة',
    read: false,
    actionUrl: 'SmartHome',
    icon: Zap
  },
  {
    id: 4,
    type: 'maintenance',
    priority: 'medium',
    title: 'صيانة وقائية قريبة',
    message: 'سيارة النقل #3 - تغيير زيت بعد 500 كم',
    time: '1 ساعة',
    read: true,
    actionUrl: 'MaintenanceTracker',
    icon: Wrench
  },
  {
    id: 5,
    type: 'inventory',
    priority: 'low',
    title: 'طلب جاهز للاستلام',
    message: 'وصول طلب قطع الغيار #1234',
    time: '2 ساعة',
    read: true,
    actionUrl: 'InventoryManagement',
    icon: Package
  }
];

const priorityColors = {
  critical: 'border-red-500/50 bg-red-500/10',
  high: 'border-amber-500/50 bg-amber-500/10',
  medium: 'border-yellow-500/50 bg-yellow-500/10',
  low: 'border-blue-500/50 bg-blue-500/10'
};

const priorityBadgeColors = {
  critical: 'bg-red-500/20 text-red-400',
  high: 'bg-amber-500/20 text-amber-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-blue-500/20 text-blue-400'
};

const priorityLabels = {
  critical: 'حرج',
  high: 'عالي',
  medium: 'متوسط',
  low: 'منخفض'
};

export default function DashboardNotifications({ compact = false }) {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    maintenance: true,
    inventory: true,
    energy: true,
    criticalOnly: false
  });

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter !== 'all') return n.type === filter;
    return true;
  }).filter(n => {
    if (!settings[n.type]) return false;
    if (settings.criticalOnly && n.priority !== 'critical') return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (compact) {
    return (
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" />
              التنبيهات
              {unreadCount > 0 && (
                <Badge className="bg-red-500/20 text-red-400">{unreadCount}</Badge>
              )}
            </CardTitle>
            <Link to={createPageUrl('Notifications')}>
              <Button size="sm" variant="ghost" className="text-slate-400 h-7">
                <Eye className="w-3 h-3 ml-1" />
                الكل
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredNotifications.slice(0, 3).map(notification => {
              const Icon = notification.icon;
              return (
                <div 
                  key={notification.id} 
                  className={`p-2 rounded-lg border ${priorityColors[notification.priority]} ${!notification.read ? 'opacity-100' : 'opacity-60'}`}
                >
                  <div className="flex items-start gap-2">
                    <Icon className={`w-4 h-4 mt-0.5 ${
                      notification.priority === 'critical' ? 'text-red-400' :
                      notification.priority === 'high' ? 'text-amber-400' :
                      'text-yellow-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{notification.title}</p>
                      <p className="text-slate-400 text-xs truncate">{notification.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            تنبيهات لوحة التحكم
            {criticalCount > 0 && (
              <Badge className="bg-red-500/20 text-red-400 animate-pulse">{criticalCount} حرج</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-slate-400 h-7"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-3 h-3" />
            </Button>
            {unreadCount > 0 && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-cyan-400 h-7"
                onClick={markAllAsRead}
              >
                <Check className="w-3 h-3 ml-1" />
                قراءة الكل
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="p-3 bg-slate-800/50 rounded-lg space-y-2">
                <p className="text-slate-400 text-xs font-medium mb-2">إعدادات التنبيهات</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'maintenance', label: 'الصيانة', icon: Wrench },
                    { key: 'inventory', label: 'المخزون', icon: Package },
                    { key: 'energy', label: 'الطاقة', icon: Zap },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                      <div className="flex items-center gap-2">
                        <item.icon className="w-3 h-3 text-slate-400" />
                        <span className="text-white text-xs">{item.label}</span>
                      </div>
                      <Switch
                        checked={settings[item.key]}
                        onCheckedChange={(v) => setSettings(prev => ({ ...prev, [item.key]: v }))}
                        className="scale-75"
                      />
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-2 bg-red-500/10 border border-red-500/30 rounded">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      <span className="text-white text-xs">الحرجة فقط</span>
                    </div>
                    <Switch
                      checked={settings.criticalOnly}
                      onCheckedChange={(v) => setSettings(prev => ({ ...prev, criticalOnly: v }))}
                      className="scale-75"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
          {[
            { key: 'all', label: 'الكل' },
            { key: 'unread', label: 'غير مقروءة' },
            { key: 'maintenance', label: 'الصيانة' },
            { key: 'inventory', label: 'المخزون' },
            { key: 'energy', label: 'الطاقة' },
          ].map(f => (
            <Button
              key={f.key}
              size="sm"
              variant={filter === f.key ? 'default' : 'ghost'}
              className={`h-7 text-xs ${filter === f.key ? 'bg-cyan-600' : 'text-slate-400'}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          <AnimatePresence>
            {filteredNotifications.map(notification => {
              const Icon = notification.icon;
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-3 rounded-lg border transition-all ${priorityColors[notification.priority]} ${!notification.read ? 'opacity-100' : 'opacity-60'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      notification.priority === 'critical' ? 'bg-red-500/20' :
                      notification.priority === 'high' ? 'bg-amber-500/20' :
                      notification.priority === 'medium' ? 'bg-yellow-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        notification.priority === 'critical' ? 'text-red-400' :
                        notification.priority === 'high' ? 'text-amber-400' :
                        notification.priority === 'medium' ? 'text-yellow-400' :
                        'text-blue-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white text-sm font-medium">{notification.title}</span>
                        <Badge className={`text-xs ${priorityBadgeColors[notification.priority]}`}>
                          {priorityLabels[notification.priority]}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-xs">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-slate-500 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {notification.time}
                        </span>
                        <Link to={createPageUrl(notification.actionUrl)}>
                          <Button size="sm" variant="ghost" className="h-6 text-xs text-cyan-400">
                            عرض
                            <ChevronRight className="w-3 h-3 mr-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {!notification.read && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0 text-green-400"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0 text-slate-400"
                        onClick={() => dismissNotification(notification.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredNotifications.length === 0 && (
            <div className="text-center py-8">
              <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">لا توجد تنبيهات</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}