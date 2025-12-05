import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu, Plus, Search, RefreshCw, Download, Edit, Trash2, Wifi, WifiOff,
  CheckCircle, XCircle, Clock, Filter, MoreVertical, Activity, Database,
  Settings, ChevronDown, ArrowUpDown, Eye, Power, Thermometer, Gauge,
  Battery, Signal, AlertTriangle, Camera, Calendar, History, Image,
  Upload, Shield, Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import EnhancedPredictiveMaintenance from '@/components/predictive/EnhancedPredictiveMaintenance';

const mockDevices = [
  { id: 'd1', name: 'Temperature Sensor 01', type: 'sensor', profile: 'Temperature & Humidity', status: 'active', lastActivity: '2 min ago', data: { temp: 24.5, humidity: 65 }, image: null, battery: 85, signal: 92, warranty_expiry: '2025-06-15', serial_number: 'TS-2024-001', custom_fields: { location_detail: 'غرفة الخوادم' }, status_history: [{ status: 'active', date: '2024-12-01', note: 'تشغيل أولي' }] },
  { id: 'd2', name: 'Smart Gateway', type: 'gateway', profile: 'Gateway', status: 'active', lastActivity: '1 min ago', data: { connected: 12, uptime: '99.9%' }, image: null, battery: null, signal: 98, warranty_expiry: '2025-12-01', serial_number: 'GW-2024-001', custom_fields: {}, status_history: [{ status: 'active', date: '2024-11-15', note: 'تركيب' }] },
  { id: 'd3', name: 'Fleet Tracker A', type: 'tracker', profile: 'GPS Tracker', status: 'active', lastActivity: '30 sec ago', data: { lat: 24.7136, lng: 46.6753 }, image: null, battery: 45, signal: 75, warranty_expiry: '2024-12-20', serial_number: 'FT-2024-001', custom_fields: { vehicle: 'أ ب ج 1234' }, status_history: [{ status: 'active', date: '2024-12-01' }, { status: 'inactive', date: '2024-11-28', note: 'انقطاع الاتصال' }] },
  { id: 'd4', name: 'HVAC Controller', type: 'controller', profile: 'HVAC', status: 'inactive', lastActivity: '1 hour ago', data: { mode: 'cooling', setpoint: 22 }, image: null, battery: null, signal: 0, warranty_expiry: '2025-03-10', serial_number: 'HC-2024-001', custom_fields: {}, status_history: [{ status: 'inactive', date: '2024-12-04', note: 'عطل فني' }, { status: 'active', date: '2024-10-01' }] },
  { id: 'd5', name: 'Water Level Sensor', type: 'sensor', profile: 'Level Sensor', status: 'active', lastActivity: '5 min ago', data: { level: 78, flow: 12.5 }, image: null, battery: 15, signal: 88, warranty_expiry: '2025-08-20', serial_number: 'WL-2024-001', custom_fields: { tank_capacity: '5000 لتر' }, status_history: [{ status: 'active', date: '2024-11-01' }] },
  { id: 'd6', name: 'Power Meter', type: 'meter', profile: 'Energy Meter', status: 'active', lastActivity: '1 min ago', data: { power: 2450, voltage: 220 }, image: null, battery: null, signal: 95, warranty_expiry: '2026-01-15', serial_number: 'PM-2024-001', custom_fields: { phase: '3-phase' }, status_history: [{ status: 'active', date: '2024-09-15' }] },
];

const deviceProfiles = [
  { id: 'temp', name: 'Temperature & Humidity', count: 45 },
  { id: 'gateway', name: 'Gateway', count: 8 },
  { id: 'tracker', name: 'GPS Tracker', count: 120 },
  { id: 'hvac', name: 'HVAC Controller', count: 15 },
  { id: 'level', name: 'Level Sensor', count: 22 },
  { id: 'energy', name: 'Energy Meter', count: 34 },
];

export default function DeviceManagement() {
  const [devices, setDevices] = useState(mockDevices);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showDeviceDetail, setShowDeviceDetail] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showPredictive, setShowPredictive] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: '', profile: '', description: '', serial_number: '', warranty_expiry: '', custom_fields: {}
  });

  // تنبيهات البطارية والإشارة
  const alerts = devices.filter(d => (d.battery && d.battery < 20) || (d.signal && d.signal < 30) || (d.warranty_expiry && new Date(d.warranty_expiry) < new Date()));

  const addDevice = () => {
    if (!newDevice.name) {
      toast.error('يرجى إدخال اسم الجهاز');
      return;
    }
    const device = {
      ...newDevice,
      id: `d${Date.now()}`,
      status: 'inactive',
      lastActivity: 'جديد',
      data: {},
      battery: null,
      signal: 0,
      image: null,
      custom_fields: {},
      status_history: [{ status: 'inactive', date: new Date().toISOString().split('T')[0], note: 'إضافة جديدة' }]
    };
    setDevices([device, ...devices]);
    setShowAddDevice(false);
    setNewDevice({ name: '', profile: '', description: '', serial_number: '', warranty_expiry: '', custom_fields: {} });
    toast.success('تم إضافة الجهاز');
  };

  const updateDeviceStatus = (deviceId, newStatus) => {
    setDevices(devices.map(d => {
      if (d.id === deviceId) {
        const history = [...(d.status_history || []), { status: newStatus, date: new Date().toISOString().split('T')[0] }];
        return { ...d, status: newStatus, status_history: history };
      }
      return d;
    }));
    toast.success('تم تحديث حالة الجهاز');
  };

  const filteredDevices = devices.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.profile.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: devices.length,
    active: devices.filter(d => d.status === 'active').length,
    inactive: devices.filter(d => d.status === 'inactive').length,
  };

  const toggleDeviceSelection = (id) => {
    setSelectedDevices(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Cpu className="w-8 h-8 text-cyan-400" />
              إدارة الأجهزة
            </h1>
            <p className="text-slate-400 mt-1">إدارة ومراقبة جميع أجهزة IoT</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-600">
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
            <Dialog open={showAddDevice} onOpenChange={setShowAddDevice}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة جهاز
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">إضافة جهاز جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-slate-300">صورة الجهاز</Label>
                  <div className="mt-1 p-6 border-2 border-dashed border-slate-600 rounded-lg text-center cursor-pointer hover:border-cyan-500/50 transition-all">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">اسحب صورة أو انقر للاختيار</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">اسم الجهاز *</Label>
                    <Input value={newDevice.name} onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="مثال: Temperature Sensor 01" />
                  </div>
                  <div>
                    <Label className="text-slate-300">الرقم التسلسلي</Label>
                    <Input value={newDevice.serial_number} onChange={(e) => setNewDevice({ ...newDevice, serial_number: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="SN-XXXX" />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">ملف التعريف</Label>
                  <Select value={newDevice.profile} onValueChange={(v) => setNewDevice({ ...newDevice, profile: v })}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue placeholder="اختر ملف التعريف" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {deviceProfiles.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">تاريخ انتهاء الضمان</Label>
                  <Input type="date" value={newDevice.warranty_expiry} onChange={(e) => setNewDevice({ ...newDevice, warranty_expiry: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-slate-300">الوصف</Label>
                  <Input value={newDevice.description} onChange={(e) => setNewDevice({ ...newDevice, description: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="وصف اختياري..." />
                </div>
                <div className="p-4 bg-slate-800/30 rounded-lg">
                  <Label className="text-slate-300 block mb-2">حقول مخصصة</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="اسم الحقل" className="bg-slate-800/50 border-slate-700 text-white text-sm" />
                    <Input placeholder="القيمة" className="bg-slate-800/50 border-slate-700 text-white text-sm" />
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2 text-cyan-400">
                    <Plus className="w-3 h-3 ml-1" />
                    إضافة حقل
                  </Button>
                </div>
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={addDevice}>
                  إضافة الجهاز
                </Button>
              </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="glass-card border-amber-500/30 bg-amber-500/5 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Bell className="w-5 h-5 text-amber-400" />
              <span className="text-amber-300 font-medium">تنبيهات الأجهزة ({alerts.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {alerts.slice(0, 5).map(device => (
                <Badge key={device.id} className="bg-amber-500/20 text-amber-400 cursor-pointer" onClick={() => { setSelectedDevice(device); setShowDeviceDetail(true); }}>
                  {device.name}
                  {device.battery && device.battery < 20 && <Battery className="w-3 h-3 mr-1" />}
                  {device.signal && device.signal < 30 && <Signal className="w-3 h-3 mr-1" />}
                  {device.warranty_expiry && new Date(device.warranty_expiry) < new Date() && <Shield className="w-3 h-3 mr-1" />}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Predictive Maintenance Alert */}
      {alerts.length > 0 && (
        <Card className="glass-card border-purple-500/30 bg-purple-500/5 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-purple-400" />
                <div>
                  <span className="text-purple-300 font-medium">الصيانة التنبؤية</span>
                  <p className="text-slate-400 text-xs">{alerts.length} جهاز يحتاج انتباه</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="border-purple-500/50 text-purple-400"
                onClick={() => setShowPredictive(!showPredictive)}
              >
                <Activity className="w-4 h-4 ml-2" />
                {showPredictive ? 'إخفاء التحليل' : 'عرض التحليل'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Predictive Maintenance Component */}
      {showPredictive && (
        <div className="mb-6">
          <EnhancedPredictiveMaintenance 
            devices={devices}
            onScheduleMaintenance={(device) => toast.success(`جدولة صيانة لـ ${device.name}`)}
            onOrderParts={(device) => toast.success(`طلب قطع غيار لـ ${device.name}`)}
            onCallTechnician={(device) => toast.success(`استدعاء فني لـ ${device.name}`)}
          />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/20">
              <Cpu className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-slate-400 text-sm">إجمالي الأجهزة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/20">
              <Wifi className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
              <p className="text-slate-400 text-sm">متصل</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-slate-500/20">
              <WifiOff className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.inactive}</p>
              <p className="text-slate-400 text-sm">غير متصل</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              الكل
            </TabsTrigger>
            <TabsTrigger value="profiles" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              ملفات التعريف
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="بحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 w-64 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <Button variant="ghost" size="icon" className="text-slate-400">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="all">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="p-4 text-right">
                        <Checkbox 
                          checked={selectedDevices.length === filteredDevices.length}
                          onCheckedChange={(checked) => setSelectedDevices(checked ? filteredDevices.map(d => d.id) : [])}
                          className="border-slate-600"
                        />
                      </th>
                      <th className="p-4 text-right text-slate-400 text-sm font-medium">الاسم</th>
                      <th className="p-4 text-right text-slate-400 text-sm font-medium">ملف التعريف</th>
                      <th className="p-4 text-right text-slate-400 text-sm font-medium">الحالة</th>
                      <th className="p-4 text-right text-slate-400 text-sm font-medium">آخر نشاط</th>
                      <th className="p-4 text-right text-slate-400 text-sm font-medium">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDevices.map((device, i) => (
                      <motion.tr
                        key={device.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-slate-700/30 hover:bg-slate-800/30"
                      >
                        <td className="p-4">
                          <Checkbox 
                            checked={selectedDevices.includes(device.id)}
                            onCheckedChange={() => toggleDeviceSelection(device.id)}
                            className="border-slate-600"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setSelectedDevice(device); setShowDeviceDetail(true); }}>
                            <div className="p-2 rounded-lg bg-cyan-500/20 relative">
                              <Cpu className="w-4 h-4 text-cyan-400" />
                              {device.battery && device.battery < 20 && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                              )}
                            </div>
                            <div>
                              <span className="text-white font-medium">{device.name}</span>
                              {device.battery && (
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                  <Battery className={`w-3 h-3 ${device.battery < 20 ? 'text-red-400' : 'text-green-400'}`} />
                                  {device.battery}%
                                  {device.signal && <><Signal className="w-3 h-3 mr-2" />{device.signal}%</>}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className="bg-purple-500/20 text-purple-400">{device.profile}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={device.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
                            {device.status === 'active' ? <Wifi className="w-3 h-3 ml-1" /> : <WifiOff className="w-3 h-3 ml-1" />}
                            {device.status === 'active' ? 'متصل' : 'غير متصل'}
                          </Badge>
                        </td>
                        <td className="p-4 text-slate-400 text-sm">{device.lastActivity}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-slate-700/50 flex items-center justify-between">
                <span className="text-slate-400 text-sm">عرض {filteredDevices.length} من {devices.length}</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-slate-600">السابق</Button>
                  <Button variant="outline" size="sm" className="border-slate-600">التالي</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deviceProfiles.map((profile, i) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 hover:border-cyan-500/50 cursor-pointer transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                          <Settings className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{profile.name}</p>
                          <p className="text-slate-400 text-sm">{profile.count} جهاز</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-slate-400">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Device Detail Dialog */}
      <Dialog open={showDeviceDetail} onOpenChange={setShowDeviceDetail}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              تفاصيل الجهاز
            </DialogTitle>
          </DialogHeader>
          {selectedDevice && (
            <div className="space-y-4 mt-4">
              {/* صورة الجهاز */}
              <div className="w-full h-32 bg-slate-800/50 rounded-lg flex items-center justify-center">
                {selectedDevice.image ? (
                  <img src={selectedDevice.image} alt={selectedDevice.name} className="h-full object-cover rounded-lg" />
                ) : (
                  <div className="text-center">
                    <Image className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-slate-500 text-xs">لا توجد صورة</p>
                  </div>
                )}
              </div>

              {/* المعلومات الأساسية */}
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h3 className="text-white font-bold text-lg">{selectedDevice.name}</h3>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div><span className="text-slate-400">النوع:</span> <span className="text-white">{selectedDevice.profile}</span></div>
                  <div><span className="text-slate-400">الحالة:</span> <Badge className={selectedDevice.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>{selectedDevice.status === 'active' ? 'متصل' : 'غير متصل'}</Badge></div>
                  {selectedDevice.serial_number && <div><span className="text-slate-400">الرقم التسلسلي:</span> <span className="text-white font-mono">{selectedDevice.serial_number}</span></div>}
                  {selectedDevice.warranty_expiry && (
                    <div>
                      <span className="text-slate-400">الضمان:</span> 
                      <span className={`${new Date(selectedDevice.warranty_expiry) < new Date() ? 'text-red-400' : 'text-green-400'}`}>
                        {selectedDevice.warranty_expiry}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* البطارية والإشارة */}
              {(selectedDevice.battery !== null || selectedDevice.signal) && (
                <div className="grid grid-cols-2 gap-3">
                  {selectedDevice.battery !== null && (
                    <div className={`p-3 rounded-lg ${selectedDevice.battery < 20 ? 'bg-red-500/10 border border-red-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400 text-xs">البطارية</span>
                        <Battery className={`w-4 h-4 ${selectedDevice.battery < 20 ? 'text-red-400' : 'text-green-400'}`} />
                      </div>
                      <Progress value={selectedDevice.battery} className="h-2" />
                      <p className={`text-sm font-bold mt-1 ${selectedDevice.battery < 20 ? 'text-red-400' : 'text-green-400'}`}>{selectedDevice.battery}%</p>
                    </div>
                  )}
                  {selectedDevice.signal && (
                    <div className={`p-3 rounded-lg ${selectedDevice.signal < 30 ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-cyan-500/10 border border-cyan-500/30'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400 text-xs">الإشارة</span>
                        <Signal className={`w-4 h-4 ${selectedDevice.signal < 30 ? 'text-amber-400' : 'text-cyan-400'}`} />
                      </div>
                      <Progress value={selectedDevice.signal} className="h-2" />
                      <p className={`text-sm font-bold mt-1 ${selectedDevice.signal < 30 ? 'text-amber-400' : 'text-cyan-400'}`}>{selectedDevice.signal}%</p>
                    </div>
                  )}
                </div>
              )}

              {/* الحقول المخصصة */}
              {selectedDevice.custom_fields && Object.keys(selectedDevice.custom_fields).length > 0 && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-purple-300 font-medium mb-2 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    حقول مخصصة
                  </p>
                  {Object.entries(selectedDevice.custom_fields).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-slate-400">{key}:</span>
                      <span className="text-white">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* سجل تغيير الحالة */}
              {selectedDevice.status_history && selectedDevice.status_history.length > 0 && (
                <div>
                  <p className="text-white font-medium mb-2 flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-400" />
                    سجل تغيير الحالة
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedDevice.status_history.slice().reverse().map((entry, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-800/30 rounded text-sm">
                        <div className="flex items-center gap-2">
                          <Badge className={entry.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
                            {entry.status === 'active' ? 'متصل' : 'غير متصل'}
                          </Badge>
                          {entry.note && <span className="text-slate-400 text-xs">{entry.note}</span>}
                        </div>
                        <span className="text-slate-500 text-xs">{entry.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* أزرار الإجراءات */}
              <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                <Button 
                  className={`flex-1 ${selectedDevice.status === 'active' ? 'bg-slate-600 hover:bg-slate-700' : 'bg-green-600 hover:bg-green-700'}`}
                  onClick={() => { updateDeviceStatus(selectedDevice.id, selectedDevice.status === 'active' ? 'inactive' : 'active'); setShowDeviceDetail(false); }}
                >
                  <Power className="w-4 h-4 ml-2" />
                  {selectedDevice.status === 'active' ? 'إيقاف' : 'تشغيل'}
                </Button>
                <Button variant="outline" className="border-amber-500/50 text-amber-400">
                  <Edit className="w-4 h-4 ml-2" />
                  تعديل
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}