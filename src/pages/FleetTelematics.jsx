import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Car, MapPin, Gauge, Battery, Clock, User, AlertTriangle, CheckCircle, 
  Search, Filter, Video, HardDrive, Wifi, WifiOff, Thermometer, Play,
  Pause, Settings, Plus, Trash2, Edit, Camera, Route, Shield, Bell,
  Fuel, Activity, Map, Radio, Smartphone, Server, Database, Eye,
  BarChart3, TrendingUp, Calendar, Wrench, Navigation, Signal, Brain
} from 'lucide-react';
import FleetMap from '@/components/fleet/FleetMap';
import DriverBehaviorAI from '@/components/fleet/DriverBehaviorAI';
import VMSIntegration from '@/components/fleet/VMSIntegration';
import ForensicVideoAnalysis from '@/components/fleet/ForensicVideoAnalysis';
import AdvancedReporting from '@/components/fleet/AdvancedReporting';
import SmartAlerting from '@/components/fleet/SmartAlerting';
import PredictiveMaintenance from '@/components/fleet/PredictiveMaintenance';
import ProtocolManager from '@/components/fleet/ProtocolManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Sample data with full VMS/CMS/MDVR features
const vehicles = [
  { 
    id: 'VH-001', plate: 'ABC-1234', type: 'patrol_car', status: 'moving', 
    driver: 'أحمد محمد', zone: 'المنطقة 3-م', speed: 45, fuel: 78, mileage: 45230,
    coordinates: { lat: 24.7136, lng: 46.6753 },
    mdvr: { device_id: 'MDVR-001', channels: 8, recording: true, storage_used: 256, storage_total: 1024, online: true },
    sensors: { door: false, engine: true, seatbelt: true, temp: 24, harsh_brake: false, harsh_accel: false },
    cameras: [
      { id: 1, name: 'أمامي', status: 'recording', quality: '1080p' },
      { id: 2, name: 'خلفي', status: 'recording', quality: '1080p' },
      { id: 3, name: 'داخلي', status: 'recording', quality: '720p' },
      { id: 4, name: 'جانبي أيمن', status: 'offline', quality: '720p' },
    ],
    alerts: ['تجاوز السرعة في الساعة 14:30'],
    lastMaintenance: '2024-10-15', nextMaintenance: '2025-01-15'
  },
  { 
    id: 'VH-002', plate: 'DEF-5678', type: 'suv', status: 'parked', 
    driver: 'سارة أحمد', zone: 'المنطقة 1-أ', speed: 0, fuel: 92, mileage: 32100,
    coordinates: { lat: 24.7236, lng: 46.6853 },
    mdvr: { device_id: 'MDVR-002', channels: 4, recording: false, storage_used: 128, storage_total: 512, online: true },
    sensors: { door: false, engine: false, seatbelt: false, temp: 22, harsh_brake: false, harsh_accel: false },
    cameras: [
      { id: 1, name: 'أمامي', status: 'standby', quality: '1080p' },
      { id: 2, name: 'خلفي', status: 'standby', quality: '1080p' },
    ],
    alerts: [],
    lastMaintenance: '2024-11-01', nextMaintenance: '2025-02-01'
  },
  { 
    id: 'VH-003', plate: 'GHI-9012', type: 'bus', status: 'moving', 
    driver: 'محمد علي', zone: 'المنطقة 5-ب', speed: 62, fuel: 45, mileage: 120500,
    coordinates: { lat: 24.7036, lng: 46.6653 },
    mdvr: { device_id: 'MDVR-003', channels: 12, recording: true, storage_used: 800, storage_total: 2048, online: true },
    sensors: { door: true, engine: true, seatbelt: true, temp: 26, harsh_brake: false, harsh_accel: true },
    cameras: [
      { id: 1, name: 'أمامي', status: 'recording', quality: '1080p' },
      { id: 2, name: 'خلفي', status: 'recording', quality: '1080p' },
      { id: 3, name: 'داخلي 1', status: 'recording', quality: '720p' },
      { id: 4, name: 'داخلي 2', status: 'recording', quality: '720p' },
      { id: 5, name: 'باب أمامي', status: 'recording', quality: '720p' },
      { id: 6, name: 'باب خلفي', status: 'recording', quality: '720p' },
    ],
    alerts: ['تسارع مفاجئ', 'باب مفتوح أثناء الحركة'],
    lastMaintenance: '2024-09-20', nextMaintenance: '2024-12-20'
  },
  { 
    id: 'VH-004', plate: 'JKL-3456', type: 'truck', status: 'alert', 
    driver: 'خالد عبدالله', zone: 'المنطقة 2-ج', speed: 85, fuel: 34, mileage: 89000,
    coordinates: { lat: 24.7336, lng: 46.6953 },
    mdvr: { device_id: 'MDVR-004', channels: 8, recording: true, storage_used: 450, storage_total: 1024, online: true },
    sensors: { door: false, engine: true, seatbelt: false, temp: 28, harsh_brake: true, harsh_accel: false },
    cameras: [
      { id: 1, name: 'أمامي', status: 'recording', quality: '1080p' },
      { id: 2, name: 'خلفي', status: 'recording', quality: '1080p' },
      { id: 3, name: 'صندوق', status: 'recording', quality: '720p' },
    ],
    alerts: ['تجاوز السرعة المسموحة!', 'حزام الأمان غير مربوط', 'فرملة قوية'],
    lastMaintenance: '2024-08-10', nextMaintenance: '2024-11-10'
  },
  { 
    id: 'VH-005', plate: 'MNO-7890', type: 'ambulance', status: 'moving', 
    driver: 'فاطمة حسن', zone: 'المنطقة 4-د', speed: 95, fuel: 67, mileage: 55000,
    coordinates: { lat: 24.7436, lng: 46.7053 },
    mdvr: { device_id: 'MDVR-005', channels: 6, recording: true, storage_used: 300, storage_total: 1024, online: true },
    sensors: { door: false, engine: true, seatbelt: true, temp: 20, harsh_brake: false, harsh_accel: false },
    cameras: [
      { id: 1, name: 'أمامي', status: 'recording', quality: '1080p' },
      { id: 2, name: 'خلفي', status: 'recording', quality: '1080p' },
      { id: 3, name: 'حجرة المريض', status: 'recording', quality: '720p' },
    ],
    alerts: ['مهمة طوارئ نشطة'],
    lastMaintenance: '2024-11-15', nextMaintenance: '2025-02-15'
  },
  { 
    id: 'VH-006', plate: 'PQR-1234', type: 'van', status: 'offline', 
    driver: 'عمر يوسف', zone: 'المستودع', speed: 0, fuel: 100, mileage: 28000,
    coordinates: { lat: 24.7136, lng: 46.6553 },
    mdvr: { device_id: 'MDVR-006', channels: 4, recording: false, storage_used: 50, storage_total: 512, online: false },
    sensors: { door: false, engine: false, seatbelt: false, temp: 18, harsh_brake: false, harsh_accel: false },
    cameras: [
      { id: 1, name: 'أمامي', status: 'offline', quality: '1080p' },
      { id: 2, name: 'خلفي', status: 'offline', quality: '1080p' },
    ],
    alerts: [],
    lastMaintenance: '2024-10-01', nextMaintenance: '2025-01-01'
  },
];

const vehicleTypes = {
  patrol_car: { label: 'دورية', icon: '🚔' },
  suv: { label: 'SUV', icon: '🚙' },
  van: { label: 'فان', icon: '🚐' },
  truck: { label: 'شاحنة', icon: '🚛' },
  bus: { label: 'حافلة', icon: '🚌' },
  motorcycle: { label: 'دراجة', icon: '🏍️' },
  ambulance: { label: 'إسعاف', icon: '🚑' },
  fire_truck: { label: 'إطفاء', icon: '🚒' },
};

const statusConfig = {
  moving: { color: 'emerald', label: 'متحرك', icon: Navigation },
  parked: { color: 'cyan', label: 'متوقف', icon: MapPin },
  idle: { color: 'amber', label: 'خامل', icon: Clock },
  alert: { color: 'red', label: 'تنبيه', icon: AlertTriangle },
  maintenance: { color: 'purple', label: 'صيانة', icon: Wrench },
  offline: { color: 'slate', label: 'غير متصل', icon: WifiOff },
};

export default function FleetTelematics() {
  const [selectedVehicle, setSelectedVehicle] = useState(vehicles[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('fleet');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const stats = {
    total: vehicles.length,
    moving: vehicles.filter(v => v.status === 'moving').length,
    parked: vehicles.filter(v => v.status === 'parked').length,
    alerts: vehicles.filter(v => v.status === 'alert').length,
    offline: vehicles.filter(v => v.status === 'offline').length,
    avgFuel: Math.round(vehicles.reduce((s, v) => s + v.fuel, 0) / vehicles.length),
    totalCameras: vehicles.reduce((s, v) => s + v.cameras.length, 0),
    recordingCameras: vehicles.reduce((s, v) => s + v.cameras.filter(c => c.status === 'recording').length, 0),
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.driver.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchesType = typeFilter === 'all' || v.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

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
              <Car className="w-8 h-8 text-cyan-400" />
              إدارة الأسطول و Telematics
            </h1>
            <p className="text-slate-400 mt-1">VMS • CMS • MDVR • تتبع المركبات</p>
          </div>
          <Button className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="w-4 h-4 ml-2" />
            إضافة مركبة
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {[
          { label: 'إجمالي المركبات', value: stats.total, icon: Car, color: 'cyan' },
          { label: 'متحرك', value: stats.moving, icon: Navigation, color: 'emerald' },
          { label: 'متوقف', value: stats.parked, icon: MapPin, color: 'blue' },
          { label: 'تنبيهات', value: stats.alerts, icon: AlertTriangle, color: 'red' },
          { label: 'غير متصل', value: stats.offline, icon: WifiOff, color: 'slate' },
          { label: 'متوسط الوقود', value: `${stats.avgFuel}%`, icon: Fuel, color: 'amber' },
          { label: 'إجمالي الكاميرات', value: stats.totalCameras, icon: Camera, color: 'purple' },
          { label: 'قيد التسجيل', value: stats.recordingCameras, icon: Video, color: 'rose' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-3 text-center">
                <stat.icon className={`w-5 h-5 text-${stat.color}-400 mx-auto mb-1`} />
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-slate-400">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap">
          <TabsTrigger value="fleet" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Car className="w-4 h-4 ml-2" />
            الأسطول
          </TabsTrigger>
          <TabsTrigger value="vms" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Video className="w-4 h-4 ml-2" />
            VMS
          </TabsTrigger>
          <TabsTrigger value="mdvr" className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-400">
            <HardDrive className="w-4 h-4 ml-2" />
            MDVR
          </TabsTrigger>
          <TabsTrigger value="sensors" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Activity className="w-4 h-4 ml-2" />
            الحساسات
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <BarChart3 className="w-4 h-4 ml-2" />
            التحليلات
          </TabsTrigger>
          <TabsTrigger value="map" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <Map className="w-4 h-4 ml-2" />
            الخريطة
          </TabsTrigger>
          <TabsTrigger value="driver-ai" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Brain className="w-4 h-4 ml-2" />
            تحليل السائقين
          </TabsTrigger>
          <TabsTrigger value="vms-integration" className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-400">
            <Video className="w-4 h-4 ml-2" />
            تكامل VMS
          </TabsTrigger>
          <TabsTrigger value="forensic" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
            <Search className="w-4 h-4 ml-2" />
            التحليل الجنائي
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <BarChart3 className="w-4 h-4 ml-2" />
            التقارير
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Bell className="w-4 h-4 ml-2" />
            التنبيهات الذكية
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Wrench className="w-4 h-4 ml-2" />
            الصيانة التنبؤية
          </TabsTrigger>
          <TabsTrigger value="protocols" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Radio className="w-4 h-4 ml-2" />
            البروتوكولات
          </TabsTrigger>
          </TabsList>

        {/* Fleet Tab */}
        <TabsContent value="fleet">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Vehicle List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Filters */}
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="بحث بالوحة أو السائق..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-9 bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue placeholder="الحالة" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">الكل</SelectItem>
                        {Object.entries(statusConfig).map(([key, val]) => (
                          <SelectItem key={key} value={key}>{val.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue placeholder="النوع" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">الكل</SelectItem>
                        {Object.entries(vehicleTypes).map(([key, val]) => (
                          <SelectItem key={key} value={key}>{val.icon} {val.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicles Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {filteredVehicles.map((vehicle, i) => {
                  const status = statusConfig[vehicle.status];
                  const type = vehicleTypes[vehicle.type];
                  const StatusIcon = status.icon;
                  return (
                    <motion.div
                      key={vehicle.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card 
                        className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 cursor-pointer transition-all hover:border-cyan-500/50 ${
                          selectedVehicle?.id === vehicle.id ? 'ring-2 ring-cyan-500/50' : ''
                        }`}
                        onClick={() => setSelectedVehicle(vehicle)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-${status.color}-500/20`}>
                                <span className="text-2xl">{type.icon}</span>
                              </div>
                              <div>
                                <h3 className="text-white font-bold">{vehicle.plate}</h3>
                                <p className="text-slate-400 text-sm">{type.label} • {vehicle.driver}</p>
                              </div>
                            </div>
                            <Badge className={`bg-${status.color}-500/20 text-${status.color}-400 border-${status.color}-500/30 border`}>
                              <StatusIcon className="w-3 h-3 ml-1" />
                              {status.label}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center mb-3">
                            <div className="p-2 bg-slate-800/50 rounded">
                              <Gauge className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                              <p className="text-white text-sm font-medium">{vehicle.speed}</p>
                              <p className="text-slate-500 text-[10px]">كم/س</p>
                            </div>
                            <div className="p-2 bg-slate-800/50 rounded">
                              <Fuel className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                              <p className="text-white text-sm font-medium">{vehicle.fuel}%</p>
                              <p className="text-slate-500 text-[10px]">وقود</p>
                            </div>
                            <div className="p-2 bg-slate-800/50 rounded">
                              <Camera className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                              <p className="text-white text-sm font-medium">{vehicle.cameras.filter(c => c.status === 'recording').length}/{vehicle.cameras.length}</p>
                              <p className="text-slate-500 text-[10px]">كاميرات</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {vehicle.zone}
                            </span>
                            <div className="flex items-center gap-2">
                              {vehicle.mdvr.online ? (
                                <Badge className="bg-green-500/20 text-green-400 text-[10px]">
                                  <Wifi className="w-2 h-2 ml-1" />
                                  متصل
                                </Badge>
                              ) : (
                                <Badge className="bg-slate-500/20 text-slate-400 text-[10px]">
                                  <WifiOff className="w-2 h-2 ml-1" />
                                  غير متصل
                                </Badge>
                              )}
                              {vehicle.mdvr.recording && (
                                <Badge className="bg-red-500/20 text-red-400 text-[10px]">
                                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1" />
                                  تسجيل
                                </Badge>
                              )}
                            </div>
                          </div>

                          {vehicle.alerts.length > 0 && (
                            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded">
                              <p className="text-red-400 text-xs">{vehicle.alerts[0]}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Vehicle Details Panel */}
            <div>
              <AnimatePresence mode="wait">
                {selectedVehicle && (
                  <motion.div
                    key={selectedVehicle.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 sticky top-6">
                      <CardHeader className="border-b border-slate-700/50 pb-4">
                        <CardTitle className="text-white flex items-center justify-between">
                          <span>تفاصيل المركبة</span>
                          <Button variant="ghost" size="icon" className="text-slate-400">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        {/* Plate Display */}
                        <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl text-center border border-slate-700">
                          <p className="text-[10px] text-slate-400 mb-1">لوحة المركبة</p>
                          <p className="text-3xl font-mono font-bold text-white tracking-wider">
                            {selectedVehicle.plate}
                          </p>
                          <p className="text-slate-400 text-sm mt-1">
                            {vehicleTypes[selectedVehicle.type].icon} {vehicleTypes[selectedVehicle.type].label}
                          </p>
                        </div>

                        {/* Driver Info */}
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{selectedVehicle.driver}</p>
                              <p className="text-slate-400 text-sm">السائق</p>
                            </div>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                            <Gauge className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                            <p className="text-white font-bold">{selectedVehicle.speed} كم/س</p>
                            <p className="text-slate-500 text-xs">السرعة</p>
                          </div>
                          <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                            <Route className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                            <p className="text-white font-bold">{selectedVehicle.mileage.toLocaleString()}</p>
                            <p className="text-slate-500 text-xs">كم</p>
                          </div>
                        </div>

                        {/* Fuel Level */}
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm flex items-center gap-1">
                              <Fuel className="w-4 h-4" />
                              مستوى الوقود
                            </span>
                            <span className="text-white font-medium">{selectedVehicle.fuel}%</span>
                          </div>
                          <Progress value={selectedVehicle.fuel} className="h-2" />
                        </div>

                        {/* MDVR Status */}
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm flex items-center gap-1">
                              <HardDrive className="w-4 h-4" />
                              MDVR
                            </span>
                            <Badge className={selectedVehicle.mdvr.online ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
                              {selectedVehicle.mdvr.online ? 'متصل' : 'غير متصل'}
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-400 space-y-1">
                            <div className="flex justify-between">
                              <span>الجهاز:</span>
                              <span className="text-white">{selectedVehicle.mdvr.device_id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>القنوات:</span>
                              <span className="text-white">{selectedVehicle.mdvr.channels}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>التخزين:</span>
                              <span className="text-white">{selectedVehicle.mdvr.storage_used}/{selectedVehicle.mdvr.storage_total} GB</span>
                            </div>
                          </div>
                          <Progress value={(selectedVehicle.mdvr.storage_used / selectedVehicle.mdvr.storage_total) * 100} className="h-1 mt-2" />
                        </div>

                        {/* Cameras */}
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-400 text-sm mb-2 flex items-center gap-1">
                            <Camera className="w-4 h-4" />
                            الكاميرات ({selectedVehicle.cameras.length})
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedVehicle.cameras.map(cam => (
                              <div key={cam.id} className="p-2 bg-slate-900/50 rounded flex items-center justify-between">
                                <span className="text-white text-xs">{cam.name}</span>
                                <Badge className={`text-[10px] ${cam.status === 'recording' ? 'bg-red-500/20 text-red-400' : cam.status === 'standby' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                  {cam.status === 'recording' ? '●' : cam.status === 'standby' ? '○' : '✕'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Sensors */}
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-400 text-sm mb-2 flex items-center gap-1">
                            <Activity className="w-4 h-4" />
                            الحساسات
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { key: 'engine', label: 'المحرك', value: selectedVehicle.sensors.engine },
                              { key: 'door', label: 'الباب', value: selectedVehicle.sensors.door },
                              { key: 'seatbelt', label: 'الحزام', value: selectedVehicle.sensors.seatbelt },
                            ].map(sensor => (
                              <div key={sensor.key} className="p-2 bg-slate-900/50 rounded text-center">
                                <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${sensor.value ? 'bg-green-500' : 'bg-slate-600'}`} />
                                <p className="text-slate-400 text-[10px]">{sensor.label}</p>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between mt-2 text-xs">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Thermometer className="w-3 h-3" />
                              درجة الحرارة
                            </span>
                            <span className="text-white">{selectedVehicle.sensors.temp}°C</span>
                          </div>
                        </div>

                        {/* Maintenance */}
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-400 text-sm mb-2 flex items-center gap-1">
                            <Wrench className="w-4 h-4" />
                            الصيانة
                          </p>
                          <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400">آخر صيانة:</span>
                              <span className="text-white">{selectedVehicle.lastMaintenance}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">الصيانة القادمة:</span>
                              <span className="text-amber-400">{selectedVehicle.nextMaintenance}</span>
                            </div>
                          </div>
                        </div>

                        {/* Alerts */}
                        {selectedVehicle.alerts.length > 0 && (
                          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm mb-2 flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4" />
                              التنبيهات ({selectedVehicle.alerts.length})
                            </p>
                            <div className="space-y-1">
                              {selectedVehicle.alerts.map((alert, i) => (
                                <p key={i} className="text-slate-300 text-xs">• {alert}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </TabsContent>

        {/* VMS Tab */}
        <TabsContent value="vms">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((vehicle, i) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center justify-between">
                      <span>{vehicle.plate}</span>
                      <Badge className={vehicle.mdvr.recording ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'}>
                        {vehicle.mdvr.recording ? 'تسجيل' : 'متوقف'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-2">
                      {vehicle.cameras.map(cam => (
                        <div key={cam.id} className="aspect-video bg-slate-900 rounded-lg relative overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            {cam.status === 'recording' ? (
                              <div className="text-center">
                                <Video className="w-6 h-6 text-red-400 mx-auto animate-pulse" />
                                <p className="text-[10px] text-slate-400 mt-1">{cam.name}</p>
                              </div>
                            ) : cam.status === 'standby' ? (
                              <div className="text-center">
                                <Eye className="w-6 h-6 text-amber-400 mx-auto" />
                                <p className="text-[10px] text-slate-400 mt-1">{cam.name}</p>
                              </div>
                            ) : (
                              <div className="text-center">
                                <WifiOff className="w-6 h-6 text-slate-600 mx-auto" />
                                <p className="text-[10px] text-slate-500 mt-1">{cam.name}</p>
                              </div>
                            )}
                          </div>
                          <div className="absolute top-1 right-1">
                            <Badge className={`text-[8px] ${cam.status === 'recording' ? 'bg-red-500' : 'bg-slate-700'}`}>
                              {cam.quality}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-slate-400 text-xs">{vehicle.mdvr.channels} قنوات</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-7 text-xs border-slate-600">
                          <Play className="w-3 h-3 ml-1" />
                          تشغيل
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs border-slate-600">
                          <Database className="w-3 h-3 ml-1" />
                          أرشيف
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* MDVR Tab */}
        <TabsContent value="mdvr">
          <div className="space-y-4">
            {vehicles.map((vehicle, i) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-rose-500/20">
                          <HardDrive className="w-6 h-6 text-rose-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{vehicle.mdvr.device_id}</h3>
                          <p className="text-slate-400 text-sm">{vehicle.plate} • {vehicle.driver}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-white font-bold">{vehicle.mdvr.channels}</p>
                          <p className="text-slate-500 text-xs">قنوات</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold">{vehicle.cameras.filter(c => c.status === 'recording').length}</p>
                          <p className="text-slate-500 text-xs">تسجيل</p>
                        </div>
                        <div className="w-32">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">التخزين</span>
                            <span className="text-white">{Math.round((vehicle.mdvr.storage_used / vehicle.mdvr.storage_total) * 100)}%</span>
                          </div>
                          <Progress value={(vehicle.mdvr.storage_used / vehicle.mdvr.storage_total) * 100} className="h-2" />
                        </div>
                        <Badge className={vehicle.mdvr.online ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          {vehicle.mdvr.online ? <Wifi className="w-3 h-3 ml-1" /> : <WifiOff className="w-3 h-3 ml-1" />}
                          {vehicle.mdvr.online ? 'متصل' : 'غير متصل'}
                        </Badge>
                        <Badge className={vehicle.mdvr.recording ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'}>
                          {vehicle.mdvr.recording ? '● تسجيل' : '○ متوقف'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Sensors Tab */}
        <TabsContent value="sensors">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((vehicle, i) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">{vehicle.plate} - {vehicle.driver}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'المحرك', value: vehicle.sensors.engine, icon: Settings },
                        { label: 'الباب', value: vehicle.sensors.door, icon: Shield },
                        { label: 'الحزام', value: vehicle.sensors.seatbelt, icon: User },
                        { label: 'فرملة قوية', value: vehicle.sensors.harsh_brake, icon: AlertTriangle, warning: true },
                        { label: 'تسارع مفاجئ', value: vehicle.sensors.harsh_accel, icon: TrendingUp, warning: true },
                        { label: `${vehicle.sensors.temp}°C`, value: vehicle.sensors.temp < 30, icon: Thermometer },
                      ].map((sensor, si) => (
                        <div key={si} className={`p-3 rounded-lg text-center ${sensor.warning && sensor.value ? 'bg-red-500/20' : 'bg-slate-800/50'}`}>
                          <sensor.icon className={`w-5 h-5 mx-auto mb-1 ${
                            sensor.warning 
                              ? (sensor.value ? 'text-red-400' : 'text-slate-500')
                              : (sensor.value ? 'text-green-400' : 'text-slate-500')
                          }`} />
                          <p className="text-slate-400 text-[10px]">{sensor.label}</p>
                          {typeof sensor.value === 'boolean' && (
                            <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${
                              sensor.warning 
                                ? (sensor.value ? 'bg-red-500' : 'bg-slate-600')
                                : (sensor.value ? 'bg-green-500' : 'bg-slate-600')
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4">
                <h3 className="text-white font-medium mb-3">إجمالي المسافة اليوم</h3>
                <p className="text-3xl font-bold text-cyan-400">2,450 كم</p>
                <p className="text-slate-400 text-sm mt-1">↑ 12% من أمس</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4">
                <h3 className="text-white font-medium mb-3">استهلاك الوقود</h3>
                <p className="text-3xl font-bold text-amber-400">340 لتر</p>
                <p className="text-slate-400 text-sm mt-1">↓ 5% من أمس</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4">
                <h3 className="text-white font-medium mb-3">حوادث السرعة</h3>
                <p className="text-3xl font-bold text-red-400">8</p>
                <p className="text-slate-400 text-sm mt-1">3 مركبات</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4">
                <h3 className="text-white font-medium mb-3">ساعات التشغيل</h3>
                <p className="text-3xl font-bold text-green-400">127 س</p>
                <p className="text-slate-400 text-sm mt-1">جميع المركبات</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Map Tab */}
        <TabsContent value="map">
          <FleetMap 
            vehicles={vehicles} 
            selectedVehicle={selectedVehicle}
            onSelectVehicle={setSelectedVehicle}
          />
        </TabsContent>

        {/* Driver AI Analysis Tab */}
        <TabsContent value="driver-ai">
          <DriverBehaviorAI vehicles={vehicles} />
        </TabsContent>

        {/* VMS Integration Tab */}
        <TabsContent value="vms-integration">
          <VMSIntegration vehicles={vehicles} />
        </TabsContent>

        {/* Forensic Analysis Tab */}
        <TabsContent value="forensic">
          <ForensicVideoAnalysis />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <AdvancedReporting vehicles={vehicles} />
        </TabsContent>

        {/* Smart Alerts Tab */}
        <TabsContent value="alerts">
          <SmartAlerting vehicles={vehicles} />
        </TabsContent>

        {/* Predictive Maintenance Tab */}
        <TabsContent value="maintenance">
          <PredictiveMaintenance vehicles={vehicles} />
        </TabsContent>

        {/* Protocols Tab */}
        <TabsContent value="protocols">
          <ProtocolManager vehicles={vehicles} />
        </TabsContent>
        </Tabs>
    </div>
  );
}