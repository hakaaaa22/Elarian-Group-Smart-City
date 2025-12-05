import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Wifi, WifiOff, AlertCircle, CheckCircle, Smartphone, Home, Thermometer,
  Lightbulb, Lock, Camera, Zap, Signal, Battery, RefreshCw, Bell, BellRing,
  Filter, Layers, Grid3X3, List, Search, Settings, Eye, Power, Cpu
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

const deviceCategories = [
  { id: 'all', name: 'جميع الأجهزة', icon: Cpu, color: 'slate' },
  { id: 'lighting', name: 'الإضاءة', icon: Lightbulb, color: 'amber' },
  { id: 'climate', name: 'التحكم بالمناخ', icon: Thermometer, color: 'cyan' },
  { id: 'security', name: 'الأمان', icon: Lock, color: 'red' },
  { id: 'sensors', name: 'المستشعرات', icon: Signal, color: 'green' },
];

export default function EnhancedDeviceManagement({ devices = [], onDeviceUpdate }) {
  const [viewMode, setViewMode] = useState('grid');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('none');
  const [notifications, setNotifications] = useState(true);
  const [lastNotification, setLastNotification] = useState(null);

  // Monitor device status changes
  useEffect(() => {
    const interval = setInterval(() => {
      devices.forEach(device => {
        // Simulate random disconnection for demo
        if (Math.random() < 0.01 && device.status === 'online' && notifications) {
          toast.error(`تنبيه: انقطع اتصال ${device.name}`, {
            description: 'الجهاز غير متصل بالشبكة',
            action: {
              label: 'عرض',
              onClick: () => {}
            }
          });
          setLastNotification({ device: device.name, type: 'disconnect', time: new Date() });
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [devices, notifications]);

  // Filter and group devices
  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      const matchesCategory = categoryFilter === 'all' || d.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      const matchesRoom = roomFilter === 'all' || d.room === roomFilter;
      const matchesSearch = !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesStatus && matchesRoom && matchesSearch;
    });
  }, [devices, categoryFilter, statusFilter, roomFilter, searchQuery]);

  const groupedDevices = useMemo(() => {
    if (groupBy === 'none') return { 'all': filteredDevices };
    
    return filteredDevices.reduce((acc, device) => {
      const key = groupBy === 'category' ? device.category : 
                  groupBy === 'room' ? device.room : 
                  device.status;
      if (!acc[key]) acc[key] = [];
      acc[key].push(device);
      return acc;
    }, {});
  }, [filteredDevices, groupBy]);

  const stats = useMemo(() => ({
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    offline: devices.filter(d => d.status === 'offline').length,
    error: devices.filter(d => d.status === 'error').length,
    lowBattery: devices.filter(d => d.state?.battery && d.state.battery < 20).length
  }), [devices]);

  const rooms = [...new Set(devices.map(d => d.room))];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'online': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'offline': return <WifiOff className="w-4 h-4 text-red-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-amber-400" />;
      default: return <Wifi className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            إدارة الأجهزة المتقدمة
          </h3>
          <p className="text-slate-400 text-sm">مراقبة وتحكم شامل بجميع الأجهزة</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-slate-600" onClick={() => setNotifications(!notifications)}>
            {notifications ? <BellRing className="w-4 h-4 ml-2 text-amber-400" /> : <Bell className="w-4 h-4 ml-2 text-slate-400" />}
            {notifications ? 'الإشعارات مفعلة' : 'الإشعارات معطلة'}
          </Button>
          <Button variant="outline" className="border-cyan-500/50 text-cyan-400">
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 text-center">
            <Cpu className="w-6 h-6 text-slate-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-slate-400 text-xs">إجمالي الأجهزة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-400">{stats.online}</p>
            <p className="text-slate-400 text-xs">متصل</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 text-center">
            <WifiOff className="w-6 h-6 text-red-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-400">{stats.offline}</p>
            <p className="text-slate-400 text-xs">غير متصل</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 text-center">
            <AlertCircle className="w-6 h-6 text-amber-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-amber-400">{stats.error}</p>
            <p className="text-slate-400 text-xs">أخطاء</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 text-center">
            <Battery className="w-6 h-6 text-red-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-400">{stats.lowBattery}</p>
            <p className="text-slate-400 text-xs">بطارية منخفضة</p>
          </CardContent>
        </Card>
      </div>

      {/* Last Notification */}
      {lastNotification && (
        <Card className="glass-card border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-white font-medium">آخر تنبيه</p>
                <p className="text-slate-400 text-sm">{lastNotification.device} - {lastNotification.type === 'disconnect' ? 'انقطاع اتصال' : 'خطأ في الأداء'}</p>
              </div>
            </div>
            <p className="text-slate-500 text-xs">{lastNotification.time.toLocaleTimeString('ar-SA')}</p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="بحث في الأجهزة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {deviceCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="online">متصل</SelectItem>
                <SelectItem value="offline">غير متصل</SelectItem>
                <SelectItem value="error">خطأ</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roomFilter} onValueChange={setRoomFilter}>
              <SelectTrigger className="w-36 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">جميع الغرف</SelectItem>
                {rooms.map(room => (
                  <SelectItem key={room} value={room}>{room}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-36 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="none">بدون تجميع</SelectItem>
                <SelectItem value="category">حسب النوع</SelectItem>
                <SelectItem value="room">حسب الغرفة</SelectItem>
                <SelectItem value="status">حسب الحالة</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1 border border-slate-700 rounded-lg p-1 bg-slate-800/50">
              <Button 
                size="icon" 
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                className={`h-8 w-8 ${viewMode === 'grid' ? 'bg-cyan-500/20' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button 
                size="icon" 
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                className={`h-8 w-8 ${viewMode === 'list' ? 'bg-cyan-500/20' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grouped Devices Display */}
      <div className="space-y-6">
        {Object.entries(groupedDevices).map(([groupName, devicesInGroup]) => (
          <div key={groupName}>
            {groupBy !== 'none' && (
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h4 className="text-white font-medium capitalize">{groupName}</h4>
                <Badge className="bg-slate-700 text-slate-300 text-xs">{devicesInGroup.length} أجهزة</Badge>
              </div>
            )}

            {viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {devicesInGroup.map((device, i) => {
                  const category = deviceCategories.find(c => c.id === device.category);
                  const Icon = category?.icon || Smartphone;
                  return (
                    <motion.div
                      key={device.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Card className={`glass-card transition-all hover:border-cyan-500/50 ${
                        device.status === 'online' ? 'border-indigo-500/20 bg-[#0f1629]/80' :
                        device.status === 'error' ? 'border-amber-500/50 bg-amber-500/5' :
                        'border-slate-700 bg-slate-800/30 opacity-70'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className={`p-3 rounded-xl bg-${category?.color || 'slate'}-500/20`}>
                              <Icon className={`w-6 h-6 text-${category?.color || 'slate'}-400`} />
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge className={`text-xs ${
                                device.status === 'online' ? 'bg-green-500/20 text-green-400' :
                                device.status === 'error' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {getStatusIcon(device.status)}
                                {device.status === 'online' ? 'متصل' : device.status === 'error' ? 'خطأ' : 'غير متصل'}
                              </Badge>
                              {device.state?.battery !== undefined && (
                                <Badge className={`text-xs ${device.state.battery < 20 ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                  <Battery className="w-3 h-3 ml-1" />
                                  {device.state.battery}%
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <h4 className="text-white font-medium mb-1">{device.name}</h4>
                          <p className="text-slate-400 text-xs mb-3">{device.room}</p>

                          {device.status === 'online' && device.state?.on !== undefined && (
                            <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded mb-2">
                              <span className="text-slate-300 text-xs">الحالة</span>
                              <Switch checked={device.state.on} />
                            </div>
                          )}

                          {device.state?.signal && (
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="text-slate-400">قوة الإشارة</span>
                              <div className="flex items-center gap-1">
                                <Signal className={`w-3 h-3 ${
                                  device.state.signal > 70 ? 'text-green-400' :
                                  device.state.signal > 40 ? 'text-amber-400' : 'text-red-400'
                                }`} />
                                <span className="text-white">{device.state.signal}%</span>
                              </div>
                            </div>
                          )}

                          {device.status === 'error' && (
                            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded">
                              <p className="text-amber-400 text-xs">
                                <AlertCircle className="w-3 h-3 inline ml-1" />
                                خطأ في الاتصال - يحتاج فحص
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {devicesInGroup.map(device => {
                  const category = deviceCategories.find(c => c.id === device.category);
                  const Icon = category?.icon || Smartphone;
                  return (
                    <Card key={device.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg bg-${category?.color || 'slate'}-500/20`}>
                            <Icon className={`w-5 h-5 text-${category?.color || 'slate'}-400`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{device.name}</h4>
                            <p className="text-slate-400 text-xs">{device.room}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {device.state?.battery !== undefined && (
                              <div className="text-center">
                                <p className={`text-sm font-bold ${device.state.battery < 20 ? 'text-red-400' : 'text-slate-400'}`}>
                                  {device.state.battery}%
                                </p>
                                <p className="text-slate-500 text-xs">بطارية</p>
                              </div>
                            )}
                            <Badge className={`${
                              device.status === 'online' ? 'bg-green-500/20 text-green-400' :
                              device.status === 'error' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {getStatusIcon(device.status)}
                              {device.status === 'online' ? 'متصل' : device.status === 'error' ? 'خطأ' : 'غير متصل'}
                            </Badge>
                            {device.status === 'online' && device.state?.on !== undefined && (
                              <Switch checked={device.state.on} />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredDevices.length === 0 && (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">لا توجد أجهزة مطابقة للفلاتر</p>
        </div>
      )}
    </div>
  );
}