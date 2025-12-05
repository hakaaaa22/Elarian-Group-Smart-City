import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DoorOpen, DoorClosed, Shield, Camera, Car, Users, AlertTriangle, CheckCircle,
  XCircle, Clock, Activity, Settings, Lock, Unlock, Eye, Radio, Wifi, Signal,
  QrCode, CreditCard, Fingerprint, ScanLine, Zap, RefreshCw, Bell, MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// أنواع البوابات
const gateTypes = [
  { id: 'vehicle_barrier', name: 'حاجز مركبات', icon: Car, description: 'بوابة رفع للمركبات' },
  { id: 'turnstile', name: 'بوابة دوارة', icon: Users, description: 'للمشاة - شخص واحد' },
  { id: 'swing_gate', name: 'بوابة متأرجحة', icon: DoorOpen, description: 'بوابة عريضة للمعدات' },
  { id: 'sliding_gate', name: 'بوابة منزلقة', icon: DoorClosed, description: 'للمداخل الكبيرة' },
  { id: 'speed_gate', name: 'بوابة سريعة', icon: Zap, description: 'للحركة المكثفة' },
  { id: 'mantrap', name: 'غرفة أمان', icon: Shield, description: 'للمناطق الحساسة' },
];

// طرق التحقق
const authMethods = [
  { id: 'qr_code', name: 'رمز QR', icon: QrCode },
  { id: 'rfid_card', name: 'بطاقة RFID', icon: CreditCard },
  { id: 'fingerprint', name: 'بصمة الإصبع', icon: Fingerprint },
  { id: 'face_recognition', name: 'التعرف على الوجه', icon: ScanLine },
  { id: 'pin_code', name: 'رمز PIN', icon: Lock },
  { id: 'license_plate', name: 'لوحة المركبة', icon: Car },
];

// بيانات البوابات
const gatesData = [
  {
    id: 'G1',
    name: 'البوابة الرئيسية',
    type: 'vehicle_barrier',
    location: 'المدخل الشمالي',
    status: 'open',
    mode: 'auto',
    health: 98,
    todayEntries: 245,
    todayExits: 198,
    lastActivity: '2024-12-04 10:30',
    authMethods: ['qr_code', 'rfid_card', 'license_plate'],
    cameras: ['CAM-01', 'CAM-02'],
    alerts: 0,
    queueLength: 3,
  },
  {
    id: 'G2',
    name: 'بوابة الموظفين',
    type: 'turnstile',
    location: 'المبنى الإداري',
    status: 'active',
    mode: 'auto',
    health: 100,
    todayEntries: 456,
    todayExits: 320,
    lastActivity: '2024-12-04 10:28',
    authMethods: ['rfid_card', 'fingerprint', 'face_recognition'],
    cameras: ['CAM-03'],
    alerts: 0,
    queueLength: 0,
  },
  {
    id: 'G3',
    name: 'بوابة الشحن',
    type: 'sliding_gate',
    location: 'المنطقة الصناعية',
    status: 'closed',
    mode: 'manual',
    health: 85,
    todayEntries: 45,
    todayExits: 38,
    lastActivity: '2024-12-04 09:45',
    authMethods: ['qr_code', 'rfid_card'],
    cameras: ['CAM-04', 'CAM-05'],
    alerts: 1,
    queueLength: 2,
  },
  {
    id: 'G4',
    name: 'بوابة VIP',
    type: 'speed_gate',
    location: 'المبنى الرئيسي',
    status: 'active',
    mode: 'auto',
    health: 100,
    todayEntries: 28,
    todayExits: 22,
    lastActivity: '2024-12-04 10:15',
    authMethods: ['face_recognition', 'fingerprint'],
    cameras: ['CAM-06'],
    alerts: 0,
    queueLength: 0,
  },
  {
    id: 'G5',
    name: 'بوابة الطوارئ',
    type: 'swing_gate',
    location: 'الجانب الغربي',
    status: 'locked',
    mode: 'emergency',
    health: 100,
    todayEntries: 0,
    todayExits: 0,
    lastActivity: '2024-12-01 08:00',
    authMethods: ['pin_code'],
    cameras: ['CAM-07'],
    alerts: 0,
    queueLength: 0,
  },
  {
    id: 'G6',
    name: 'غرفة الأمان',
    type: 'mantrap',
    location: 'مركز البيانات',
    status: 'active',
    mode: 'high_security',
    health: 100,
    todayEntries: 12,
    todayExits: 10,
    lastActivity: '2024-12-04 10:20',
    authMethods: ['face_recognition', 'fingerprint', 'pin_code'],
    cameras: ['CAM-08', 'CAM-09'],
    alerts: 0,
    queueLength: 1,
  },
];

// سجل الأحداث
const recentEvents = [
  { id: 1, gate: 'G1', type: 'entry', visitor: 'أحمد محمد', method: 'qr_code', time: '10:30', status: 'success' },
  { id: 2, gate: 'G2', type: 'entry', visitor: 'سارة خالد', method: 'fingerprint', time: '10:28', status: 'success' },
  { id: 3, gate: 'G3', type: 'exit', visitor: 'شاحنة #12', method: 'license_plate', time: '10:25', status: 'success' },
  { id: 4, gate: 'G1', type: 'entry', visitor: 'زائر غير معروف', method: 'qr_code', time: '10:22', status: 'denied' },
  { id: 5, gate: 'G4', type: 'entry', visitor: 'المدير العام', method: 'face_recognition', time: '10:15', status: 'success' },
];

export default function SmartGatesModule() {
  const [gates, setGates] = useState(gatesData);
  const [selectedGate, setSelectedGate] = useState(null);
  const [showGateControl, setShowGateControl] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    totalGates: gates.length,
    activeGates: gates.filter(g => g.status === 'active' || g.status === 'open').length,
    todayEntries: gates.reduce((s, g) => s + g.todayEntries, 0),
    todayExits: gates.reduce((s, g) => s + g.todayExits, 0),
    alerts: gates.reduce((s, g) => s + g.alerts, 0),
    avgHealth: Math.round(gates.reduce((s, g) => s + g.health, 0) / gates.length),
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'open': return { label: 'مفتوحة', color: 'green', icon: DoorOpen };
      case 'closed': return { label: 'مغلقة', color: 'amber', icon: DoorClosed };
      case 'active': return { label: 'نشطة', color: 'cyan', icon: Activity };
      case 'locked': return { label: 'مقفلة', color: 'red', icon: Lock };
      case 'error': return { label: 'خطأ', color: 'red', icon: AlertTriangle };
      default: return { label: status, color: 'slate', icon: Activity };
    }
  };

  const getTypeConfig = (typeId) => gateTypes.find(t => t.id === typeId) || gateTypes[0];

  const controlGate = (gateId, action) => {
    setGates(prev => prev.map(g => {
      if (g.id === gateId) {
        let newStatus = g.status;
        if (action === 'open') newStatus = 'open';
        if (action === 'close') newStatus = 'closed';
        if (action === 'lock') newStatus = 'locked';
        if (action === 'unlock') newStatus = 'active';
        return { ...g, status: newStatus };
      }
      return g;
    }));
    toast.success(`تم تنفيذ الأمر: ${action}`);
  };

  const toggleGateMode = (gateId, mode) => {
    setGates(prev => prev.map(g => g.id === gateId ? { ...g, mode } : g));
    toast.success(`تم تغيير وضع البوابة إلى: ${mode}`);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between flex-wrap gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DoorOpen className="w-6 h-6 text-cyan-400" />
            نظام البوابات الذكية
          </h2>
          <p className="text-slate-400 text-sm">إدارة ومراقبة جميع البوابات ونقاط الدخول</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-green-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm">مباشر</span>
          </div>
          <span className="text-slate-400 text-sm">{liveTime.toLocaleTimeString('ar-SA')}</span>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'البوابات', value: stats.totalGates, icon: DoorOpen, color: 'cyan' },
          { label: 'نشطة', value: stats.activeGates, icon: Activity, color: 'green' },
          { label: 'دخول اليوم', value: stats.todayEntries, icon: Users, color: 'purple' },
          { label: 'خروج اليوم', value: stats.todayExits, icon: Users, color: 'blue' },
          { label: 'تنبيهات', value: stats.alerts, icon: AlertTriangle, color: stats.alerts > 0 ? 'red' : 'slate' },
          { label: 'صحة النظام', value: `${stats.avgHealth}%`, icon: Activity, color: 'green' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`glass-card border-${stat.color}-500/30 bg-${stat.color}-500/5`}>
              <CardContent className="p-3 text-center">
                <stat.icon className={`w-5 h-5 text-${stat.color}-400 mx-auto mb-1`} />
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-slate-400">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="live">البث المباشر</TabsTrigger>
          <TabsTrigger value="events">سجل الأحداث</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gates.map((gate, i) => {
              const statusConfig = getStatusConfig(gate.status);
              const typeConfig = getTypeConfig(gate.type);
              const StatusIcon = statusConfig.icon;
              
              return (
                <motion.div
                  key={gate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className={`glass-card border-${statusConfig.color}-500/30 bg-[#0f1629]/80 cursor-pointer`}
                    onClick={() => { setSelectedGate(gate); setShowGateControl(true); }}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-${statusConfig.color}-500/20`}>
                            <typeConfig.icon className={`w-5 h-5 text-${statusConfig.color}-400`} />
                          </div>
                          <div>
                            <p className="text-white font-medium">{gate.name}</p>
                            <p className="text-slate-500 text-xs">{gate.location}</p>
                          </div>
                        </div>
                        <Badge className={`bg-${statusConfig.color}-500/20 text-${statusConfig.color}-400`}>
                          <StatusIcon className="w-3 h-3 ml-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center p-2 bg-slate-800/50 rounded">
                          <p className="text-green-400 font-bold">{gate.todayEntries}</p>
                          <p className="text-slate-500 text-[10px]">دخول</p>
                        </div>
                        <div className="text-center p-2 bg-slate-800/50 rounded">
                          <p className="text-blue-400 font-bold">{gate.todayExits}</p>
                          <p className="text-slate-500 text-[10px]">خروج</p>
                        </div>
                        <div className="text-center p-2 bg-slate-800/50 rounded">
                          <p className={`font-bold ${gate.queueLength > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                            {gate.queueLength}
                          </p>
                          <p className="text-slate-500 text-[10px]">انتظار</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {gate.authMethods.slice(0, 3).map(method => {
                            const authConfig = authMethods.find(a => a.id === method);
                            return authConfig && (
                              <div key={method} className="p-1 bg-slate-800/50 rounded" title={authConfig.name}>
                                <authConfig.icon className="w-3 h-3 text-slate-400" />
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Camera className="w-3 h-3 text-slate-500" />
                            <span className="text-slate-500 text-xs">{gate.cameras.length}</span>
                          </div>
                          <Progress value={gate.health} className="w-12 h-1.5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="live" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {gates.slice(0, 4).map(gate => (
              <Card key={gate.id} className="glass-card border-slate-700 bg-[#0f1629]/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center justify-between">
                    <span>{gate.name}</span>
                    <Badge className="bg-green-500/20 text-green-400">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />
                      مباشر
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center mb-3">
                    <Camera className="w-12 h-12 text-slate-700" />
                  </div>
                  <div className="flex justify-between">
                    <Button size="sm" variant="outline" className="border-green-500 text-green-400" onClick={() => controlGate(gate.id, 'open')}>
                      <Unlock className="w-3 h-3 ml-1" />فتح
                    </Button>
                    <Button size="sm" variant="outline" className="border-amber-500 text-amber-400" onClick={() => controlGate(gate.id, 'close')}>
                      <Lock className="w-3 h-3 ml-1" />إغلاق
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-500 text-red-400" onClick={() => controlGate(gate.id, 'lock')}>
                      <Shield className="w-3 h-3 ml-1" />قفل
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">سجل الأحداث الأخير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentEvents.map(event => (
                  <div key={event.id} className={`p-3 rounded-lg flex items-center justify-between ${event.status === 'success' ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${event.status === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {event.status === 'success' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                      </div>
                      <div>
                        <p className="text-white text-sm">{event.visitor}</p>
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                          <span>{gates.find(g => g.id === event.gate)?.name}</span>
                          <span>•</span>
                          <span>{event.type === 'entry' ? 'دخول' : 'خروج'}</span>
                          <span>•</span>
                          <span>{authMethods.find(a => a.id === event.method)?.name}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-slate-400 text-sm">{event.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">أنواع البوابات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {gateTypes.map(type => (
                  <div key={type.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <type.icon className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-white text-sm">{type.name}</p>
                      <p className="text-slate-500 text-xs">{type.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">طرق التحقق</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {authMethods.map(method => (
                  <div key={method.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <method.icon className="w-5 h-5 text-purple-400" />
                      <span className="text-white text-sm">{method.name}</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Gate Control Dialog */}
      <Dialog open={showGateControl} onOpenChange={setShowGateControl}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-cyan-400" />
              التحكم في البوابة - {selectedGate?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedGate && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-400">{selectedGate.todayEntries}</p>
                  <p className="text-slate-500 text-xs">دخول اليوم</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-400">{selectedGate.todayExits}</p>
                  <p className="text-slate-500 text-xs">خروج اليوم</p>
                </div>
              </div>

              <div>
                <p className="text-slate-400 text-sm mb-2">وضع التشغيل</p>
                <Select value={selectedGate.mode} onValueChange={(v) => toggleGateMode(selectedGate.id, v)}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">تلقائي</SelectItem>
                    <SelectItem value="manual">يدوي</SelectItem>
                    <SelectItem value="high_security">أمان عالي</SelectItem>
                    <SelectItem value="emergency">طوارئ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => { controlGate(selectedGate.id, 'open'); setShowGateControl(false); }}>
                  <Unlock className="w-4 h-4 ml-2" />فتح البوابة
                </Button>
                <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => { controlGate(selectedGate.id, 'close'); setShowGateControl(false); }}>
                  <Lock className="w-4 h-4 ml-2" />إغلاق البوابة
                </Button>
                <Button variant="outline" className="border-red-500 text-red-400" onClick={() => { controlGate(selectedGate.id, 'lock'); setShowGateControl(false); }}>
                  <Shield className="w-4 h-4 ml-2" />قفل طوارئ
                </Button>
                <Button variant="outline" className="border-cyan-500 text-cyan-400">
                  <Eye className="w-4 h-4 ml-2" />عرض الكاميرات
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}