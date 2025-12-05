import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Shield, AlertTriangle, CheckCircle, Clock, Users, Zap,
  Plus, Settings, Eye, Bell, Target, Navigation, Radio, Wifi
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const geofences = [
  { id: 1, name: 'البوابة الرئيسية', type: 'entry', radius: 50, status: 'active', autoCheckin: true, visitors: 3, color: '#22c55e' },
  { id: 2, name: 'منطقة الاستقبال', type: 'zone', radius: 30, status: 'active', autoCheckin: false, visitors: 5, color: '#06b6d4' },
  { id: 3, name: 'المنطقة المحظورة A', type: 'restricted', radius: 100, status: 'active', autoCheckin: false, visitors: 0, color: '#ef4444' },
  { id: 4, name: 'موقف الزوار', type: 'parking', radius: 80, status: 'active', autoCheckin: true, visitors: 8, color: '#8b5cf6' },
  { id: 5, name: 'المستودعات', type: 'restricted', radius: 60, status: 'inactive', autoCheckin: false, visitors: 0, color: '#f59e0b' },
];

const geofenceEvents = [
  { id: 1, visitor: 'أحمد محمد', zone: 'البوابة الرئيسية', event: 'دخول', time: '10:30', action: 'تسجيل دخول تلقائي', status: 'success' },
  { id: 2, visitor: 'سارة خالد', zone: 'المنطقة المحظورة A', event: 'محاولة دخول', time: '10:25', action: 'تنبيه أمني', status: 'alert' },
  { id: 3, visitor: 'محمد علي', zone: 'منطقة الاستقبال', event: 'خروج', time: '10:20', action: 'تسجيل', status: 'info' },
  { id: 4, visitor: 'خالد أحمد', zone: 'موقف الزوار', event: 'دخول', time: '10:15', action: 'تسجيل دخول تلقائي', status: 'success' },
];

const activeVisitors = [
  { id: 1, name: 'أحمد محمد', zone: 'منطقة الاستقبال', duration: '15 دقيقة', status: 'normal' },
  { id: 2, name: 'سارة خالد', zone: 'المكاتب الإدارية', duration: '45 دقيقة', status: 'warning' },
  { id: 3, name: 'محمد علي', zone: 'موقف الزوار', duration: '5 دقائق', status: 'normal' },
];

const zoneTypes = [
  { id: 'entry', name: 'نقطة دخول', color: 'green' },
  { id: 'zone', name: 'منطقة عامة', color: 'cyan' },
  { id: 'restricted', name: 'منطقة محظورة', color: 'red' },
  { id: 'parking', name: 'موقف سيارات', color: 'purple' },
  { id: 'vip', name: 'منطقة VIP', color: 'amber' },
];

export default function GeofencingModule() {
  const [zones, setZones] = useState(geofences);
  const [showAddZone, setShowAddZone] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);

  const getTypeConfig = (type) => zoneTypes.find(t => t.id === type) || zoneTypes[0];

  const toggleZone = (id) => {
    setZones(zones.map(z => z.id === id ? { ...z, status: z.status === 'active' ? 'inactive' : 'active' } : z));
    toast.success('تم تحديث حالة المنطقة');
  };

  const stats = {
    activeZones: zones.filter(z => z.status === 'active').length,
    totalVisitors: zones.reduce((acc, z) => acc + z.visitors, 0),
    alerts: geofenceEvents.filter(e => e.status === 'alert').length,
    autoCheckins: geofenceEvents.filter(e => e.action.includes('تلقائي')).length
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-cyan-500/20"
          >
            <Navigation className="w-7 h-7 text-green-400" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-white">السياج الجغرافي الذكي</h3>
            <p className="text-slate-500 text-sm">تتبع الزوار وإطلاق الإجراءات التلقائية</p>
          </div>
        </div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowAddZone(true)}>
          <Plus className="w-4 h-4 ml-2" />
          منطقة جديدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Radio className="w-6 h-6 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-green-400">{stats.activeZones}</p>
              <p className="text-slate-500 text-sm">منطقة نشطة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="w-6 h-6 text-cyan-400" />
            <div>
              <p className="text-2xl font-bold text-cyan-400">{stats.totalVisitors}</p>
              <p className="text-slate-500 text-sm">زائر متتبع</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <div>
              <p className="text-2xl font-bold text-red-400">{stats.alerts}</p>
              <p className="text-slate-500 text-sm">تنبيهات</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Zap className="w-6 h-6 text-purple-400" />
            <div>
              <p className="text-2xl font-bold text-purple-400">{stats.autoCheckins}</p>
              <p className="text-slate-500 text-sm">تسجيل تلقائي</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Geofences List */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="text-white font-medium">المناطق المُعدة</h4>
          {zones.map(zone => {
            const typeConfig = getTypeConfig(zone.type);
            return (
              <motion.div key={zone.id} whileHover={{ scale: 1.01 }}>
                <Card className={`bg-slate-800/30 border-slate-700/50 ${zone.status === 'inactive' ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${zone.color}20` }}>
                            <MapPin className="w-6 h-6" style={{ color: zone.color }} />
                          </div>
                          {zone.status === 'active' && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-white font-bold">{zone.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`bg-${typeConfig.color}-500/20 text-${typeConfig.color}-400`}>
                              {typeConfig.name}
                            </Badge>
                            <span className="text-slate-500 text-xs">نطاق: {zone.radius}م</span>
                            {zone.visitors > 0 && (
                              <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                                <Users className="w-3 h-3 ml-1" />{zone.visitors}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {zone.autoCheckin && (
                          <Badge className="bg-green-500/20 text-green-400">
                            <Zap className="w-3 h-3 ml-1" />تسجيل تلقائي
                          </Badge>
                        )}
                        <Switch
                          checked={zone.status === 'active'}
                          onCheckedChange={() => toggleZone(zone.id)}
                        />
                        <Button size="icon" variant="ghost" onClick={() => setSelectedZone(zone)}>
                          <Settings className="w-4 h-4 text-slate-400" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Active Visitors & Events */}
        <div className="space-y-6">
          {/* Active Visitors */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                الزوار النشطون
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeVisitors.map(visitor => (
                <div key={visitor.id} className={`p-3 rounded-lg border ${
                  visitor.status === 'warning' ? 'bg-amber-500/5 border-amber-500/30' : 'bg-slate-900/50 border-slate-700/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-xs">{visitor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white text-sm">{visitor.name}</p>
                        <p className="text-slate-500 text-xs">{visitor.zone}</p>
                      </div>
                    </div>
                    <Badge className={visitor.status === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}>
                      {visitor.duration}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                الأحداث الأخيرة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {geofenceEvents.slice(0, 4).map(event => (
                <div key={event.id} className={`p-2 rounded-lg ${
                  event.status === 'alert' ? 'bg-red-500/10' : event.status === 'success' ? 'bg-green-500/10' : 'bg-slate-900/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm">{event.visitor}</p>
                      <p className="text-slate-500 text-xs">{event.zone} • {event.event}</p>
                    </div>
                    <div className="text-left">
                      <Badge className={`text-xs ${
                        event.status === 'alert' ? 'bg-red-500/20 text-red-400' : 
                        event.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {event.action}
                      </Badge>
                      <p className="text-slate-600 text-xs mt-1">{event.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Zone Dialog */}
      <Dialog open={showAddZone} onOpenChange={setShowAddZone}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-400" />
              إضافة منطقة جديدة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-400">اسم المنطقة</Label>
              <Input className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="مثال: منطقة الاستقبال" />
            </div>
            <div>
              <Label className="text-slate-400">نوع المنطقة</Label>
              <Select>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {zoneTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-400">نطاق التغطية (متر)</Label>
              <Input type="number" className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="50" />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div>
                <p className="text-white font-medium">تسجيل دخول تلقائي</p>
                <p className="text-slate-500 text-xs">تسجيل الزائر عند دخول المنطقة</p>
              </div>
              <Switch />
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => { setShowAddZone(false); toast.success('تم إضافة المنطقة'); }}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة المنطقة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}