import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Wifi, Bluetooth, Radio, Zap, Thermometer, Lightbulb, Lock,
  Camera, Speaker, Tv, Fan, AirVent, Droplets, Gauge, Power, Settings,
  Plus, Search, RefreshCw, Signal, Check, X, AlertTriangle, Eye,
  ChevronDown, MoreVertical, Loader2, Brain, Shield, Clock, Calendar,
  Smartphone, Globe, Server, Database, Link, Unlink, Play, Pause,
  Sun, Moon, Volume2, VolumeX, ThermometerSun, Snowflake, Flame,
  BarChart3, Folder, Activity, Map, LayoutGrid, List, Mic, QrCode,
  GitBranch, PanelTop, Bell, Cpu, Plug
} from 'lucide-react';
import DeviceGroups from '@/components/smarthome/DeviceGroups';
import DevicePerformance from '@/components/smarthome/DevicePerformance';
import AutomationBuilder from '@/components/smarthome/AutomationBuilder';
import EnergyAnalytics from '@/components/smarthome/EnergyAnalytics';
import DeviceDiscovery from '@/components/smarthome/DeviceDiscovery';
import VoiceAssistant from '@/components/smarthome/VoiceAssistant';
import PlatformIntegration from '@/components/smarthome/PlatformIntegration';
import AdvancedAutomationBuilder from '@/components/smarthome/AdvancedAutomationBuilder';
import WorkflowBuilder from '@/components/smarthome/WorkflowBuilder';
import AdvancedDataAnalytics from '@/components/smarthome/AdvancedDataAnalytics';
import CustomDashboardBuilder from '@/components/smarthome/CustomDashboardBuilder';
import MatterProtocolManager from '@/components/smarthome/MatterProtocolManager';
import LearningFlows from '@/components/smarthome/LearningFlows';
import EnergyManagement from '@/components/smarthome/EnergyManagement';
import AutomationTemplates from '@/components/smarthome/AutomationTemplates';
import SmartNotifications from '@/components/smarthome/SmartNotifications';
import UserPermissions from '@/components/smarthome/UserPermissions';
import RemoteAccessManager from '@/components/smarthome/RemoteAccessManager';
import SceneManager from '@/components/smarthome/SceneManager';
import AIAutomationAssistant from '@/components/smarthome/AIAutomationAssistant';
import AIReportGenerator from '@/components/smarthome/AIReportGenerator';
import EnhancedDeviceManagement from '@/components/smarthome/EnhancedDeviceManagement';
import IntegrationsHub from '@/components/smarthome/IntegrationsHub';
import PredictiveAnalytics from '@/components/smarthome/PredictiveAnalytics';
import SimplifiedAutomationBuilder from '@/components/smarthome/SimplifiedAutomationBuilder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Tuya Protocols
const tuyaProtocols = [
  { id: 'wifi', name: 'WiFi', icon: Wifi, color: 'cyan', description: 'اتصال لاسلكي مباشر', port: '6668' },
  { id: 'bluetooth', name: 'Bluetooth', icon: Bluetooth, color: 'blue', description: 'اتصال قصير المدى', port: '-' },
  { id: 'zigbee', name: 'Zigbee 3.0', icon: Radio, color: 'green', description: 'شبكة منخفضة الطاقة', port: '-' },
  { id: 'zwave', name: 'Z-Wave', icon: Signal, color: 'purple', description: 'بروتوكول المنزل الذكي', port: '-' },
  { id: 'thread', name: 'Thread', icon: Globe, color: 'amber', description: 'شبكة IP منخفضة الطاقة', port: '-' },
  { id: 'matter', name: 'Matter', icon: Link, color: 'pink', description: 'معيار موحد للمنزل الذكي', port: '5540' },
  { id: 'mqtt', name: 'MQTT', icon: Server, color: 'red', description: 'بروتوكول الرسائل', port: '1883' },
  { id: 'coap', name: 'CoAP', icon: Database, color: 'indigo', description: 'بروتوكول التطبيقات المقيدة', port: '5683' },
];

// Device Categories
const deviceCategories = [
  { id: 'lighting', name: 'الإضاءة', icon: Lightbulb, color: 'amber' },
  { id: 'climate', name: 'التحكم بالمناخ', icon: Thermometer, color: 'cyan' },
  { id: 'security', name: 'الأمان', icon: Shield, color: 'red' },
  { id: 'entertainment', name: 'الترفيه', icon: Tv, color: 'purple' },
  { id: 'appliances', name: 'الأجهزة المنزلية', icon: Zap, color: 'green' },
  { id: 'sensors', name: 'المستشعرات', icon: Gauge, color: 'blue' },
];

// Mock Tuya Devices
const mockDevices = [
  { id: 'dev-1', name: 'إضاءة غرفة المعيشة', category: 'lighting', protocol: 'wifi', status: 'online', state: { on: true, brightness: 80, color: '#FFD700' }, room: 'غرفة المعيشة' },
  { id: 'dev-2', name: 'مكيف الهواء', category: 'climate', protocol: 'wifi', status: 'online', state: { on: true, mode: 'cool', temp: 22, fan: 'auto' }, room: 'غرفة النوم' },
  { id: 'dev-3', name: 'كاميرا المدخل', category: 'security', protocol: 'wifi', status: 'online', state: { recording: true, motion: false }, room: 'المدخل' },
  { id: 'dev-4', name: 'قفل الباب الذكي', category: 'security', protocol: 'zigbee', status: 'online', state: { locked: true, battery: 85 }, room: 'المدخل' },
  { id: 'dev-5', name: 'مستشعر الحركة', category: 'sensors', protocol: 'zigbee', status: 'online', state: { motion: false, battery: 92 }, room: 'الممر' },
  { id: 'dev-6', name: 'مستشعر درجة الحرارة', category: 'sensors', protocol: 'zigbee', status: 'online', state: { temp: 24.5, humidity: 55, battery: 78 }, room: 'غرفة المعيشة' },
  { id: 'dev-7', name: 'سماعة ذكية', category: 'entertainment', protocol: 'wifi', status: 'online', state: { playing: false, volume: 50 }, room: 'غرفة المعيشة' },
  { id: 'dev-8', name: 'مقبس ذكي', category: 'appliances', protocol: 'wifi', status: 'online', state: { on: true, power: 150, today: 2.4 }, room: 'المطبخ' },
  { id: 'dev-9', name: 'مروحة السقف', category: 'climate', protocol: 'wifi', status: 'offline', state: { on: false, speed: 0 }, room: 'غرفة النوم' },
  { id: 'dev-10', name: 'ستائر ذكية', category: 'appliances', protocol: 'zigbee', status: 'online', state: { position: 75 }, room: 'غرفة المعيشة' },
  { id: 'dev-11', name: 'جرس الباب', category: 'security', protocol: 'wifi', status: 'online', state: { battery: 95, lastRing: '10:30' }, room: 'المدخل' },
  { id: 'dev-12', name: 'مستشعر تسرب المياه', category: 'sensors', protocol: 'zigbee', status: 'online', state: { leak: false, battery: 88 }, room: 'الحمام' },
];

// Rooms
const rooms = ['غرفة المعيشة', 'غرفة النوم', 'المطبخ', 'الحمام', 'المدخل', 'الممر', 'المكتب'];

// Scenes
const mockScenes = [
  { id: 's1', name: 'صباح الخير', icon: Sun, color: 'amber', devices: 4, actions: ['فتح الستائر', 'إضاءة 50%', 'تشغيل المكيف'] },
  { id: 's2', name: 'مساء الخير', icon: Moon, color: 'indigo', devices: 3, actions: ['إضاءة دافئة', 'إغلاق الستائر', 'تشغيل الموسيقى'] },
  { id: 's3', name: 'مغادرة المنزل', icon: Lock, color: 'red', devices: 6, actions: ['إغلاق جميع الأجهزة', 'قفل الأبواب', 'تفعيل الكاميرات'] },
  { id: 's4', name: 'وضع السينما', icon: Tv, color: 'purple', devices: 4, actions: ['إطفاء الإضاءة', 'إغلاق الستائر', 'تشغيل التلفاز'] },
];

export default function SmartHome() {
  const [activeTab, setActiveTab] = useState('devices');
  const [devices, setDevices] = useState(mockDevices);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [protocolFilter, setProtocolFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showProtocolConfig, setShowProtocolConfig] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [tuyaConfig, setTuyaConfig] = useState({
    accessId: '',
    accessSecret: '',
    region: 'eu',
    deviceId: '',
  });

  const stats = {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    offline: devices.filter(d => d.status === 'offline').length,
    protocols: [...new Set(devices.map(d => d.protocol))].length,
  };

  const filteredDevices = devices.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || d.category === categoryFilter;
    const matchesProtocol = protocolFilter === 'all' || d.protocol === protocolFilter;
    const matchesRoom = roomFilter === 'all' || d.room === roomFilter;
    return matchesSearch && matchesCategory && matchesProtocol && matchesRoom;
  });

  const toggleDevice = (deviceId) => {
    setDevices(devices.map(d => {
      if (d.id === deviceId) {
        return { ...d, state: { ...d.state, on: !d.state.on } };
      }
      return d;
    }));
    toast.success('تم تحديث حالة الجهاز');
  };

  const updateDeviceState = (deviceId, key, value) => {
    setDevices(devices.map(d => {
      if (d.id === deviceId) {
        return { ...d, state: { ...d.state, [key]: value } };
      }
      return d;
    }));
  };

  const runScene = (scene) => {
    toast.success(`جاري تنفيذ سيناريو "${scene.name}"...`);
  };

  const testConnection = () => {
    toast.success('جاري اختبار الاتصال...');
    setTimeout(() => toast.success('تم الاتصال بنجاح!'), 2000);
  };

  const discoverDevices = () => {
    toast.success('جاري البحث عن أجهزة Tuya...');
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
              <Home className="w-8 h-8 text-cyan-400" />
              المنزل الذكي - Tuya Integration
            </h1>
            <p className="text-slate-400 mt-1">إدارة جميع أجهزة Tuya الذكية بجميع البروتوكولات</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-600" onClick={discoverDevices}>
              <Search className="w-4 h-4 ml-2" />
              اكتشاف الأجهزة
            </Button>
            <Dialog open={showAddDevice} onOpenChange={setShowAddDevice}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة جهاز
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-white">إضافة جهاز Tuya جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-slate-300">Access ID</Label>
                    <Input
                      value={tuyaConfig.accessId}
                      onChange={(e) => setTuyaConfig({ ...tuyaConfig, accessId: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                      placeholder="Tuya Cloud Access ID"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Access Secret</Label>
                    <Input
                      type="password"
                      value={tuyaConfig.accessSecret}
                      onChange={(e) => setTuyaConfig({ ...tuyaConfig, accessSecret: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                      placeholder="Tuya Cloud Access Secret"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">المنطقة</Label>
                    <Select value={tuyaConfig.region} onValueChange={(v) => setTuyaConfig({ ...tuyaConfig, region: v })}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="eu">أوروبا (EU)</SelectItem>
                        <SelectItem value="us">أمريكا (US)</SelectItem>
                        <SelectItem value="cn">الصين (CN)</SelectItem>
                        <SelectItem value="in">الهند (IN)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-300">Device ID (اختياري)</Label>
                    <Input
                      value={tuyaConfig.deviceId}
                      onChange={(e) => setTuyaConfig({ ...tuyaConfig, deviceId: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                      placeholder="معرف الجهاز"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 border-slate-600" onClick={testConnection}>
                      اختبار الاتصال
                    </Button>
                    <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={() => { setShowAddDevice(false); toast.success('تم إضافة الجهاز'); }}>
                      إضافة
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'إجمالي الأجهزة', value: stats.total, icon: Home, color: 'cyan' },
          { label: 'متصل', value: stats.online, icon: Wifi, color: 'green' },
          { label: 'غير متصل', value: stats.offline, icon: Signal, color: 'red' },
          { label: 'البروتوكولات', value: stats.protocols, icon: Radio, color: 'purple' },
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap">
          <TabsTrigger value="devices" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Home className="w-4 h-4 ml-2" />
            الأجهزة
          </TabsTrigger>
          <TabsTrigger value="protocols" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Radio className="w-4 h-4 ml-2" />
            البروتوكولات
          </TabsTrigger>
          <TabsTrigger value="scenes" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Zap className="w-4 h-4 ml-2" />
            السيناريوهات
          </TabsTrigger>
          <TabsTrigger value="rooms" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Lightbulb className="w-4 h-4 ml-2" />
            الغرف
          </TabsTrigger>
          <TabsTrigger value="automation" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
            <Brain className="w-4 h-4 ml-2" />
            الأتمتة المتقدمة
          </TabsTrigger>
          <TabsTrigger value="groups" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
            <Folder className="w-4 h-4 ml-2" />
            المجموعات
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Activity className="w-4 h-4 ml-2" />
            الأداء
          </TabsTrigger>
          <TabsTrigger value="energy" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
            <BarChart3 className="w-4 h-4 ml-2" />
            تحليل الطاقة
          </TabsTrigger>
          <TabsTrigger value="discovery" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <Search className="w-4 h-4 ml-2" />
            اكتشاف الأجهزة
          </TabsTrigger>
          <TabsTrigger value="platforms" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Globe className="w-4 h-4 ml-2" />
            المنصات
          </TabsTrigger>
          <TabsTrigger value="workflows" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400">
            <GitBranch className="w-4 h-4 ml-2" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
            <BarChart3 className="w-4 h-4 ml-2" />
            التحليلات المتقدمة
          </TabsTrigger>
          <TabsTrigger value="dashboards" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
            <PanelTop className="w-4 h-4 ml-2" />
            لوحات التحكم
          </TabsTrigger>
          <TabsTrigger value="matter" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
            <Link className="w-4 h-4 ml-2" />
            Matter
          </TabsTrigger>
          <TabsTrigger value="learning" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Brain className="w-4 h-4 ml-2" />
            التعلم الذكي
          </TabsTrigger>
          <TabsTrigger value="energy-mgmt" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
            <Zap className="w-4 h-4 ml-2" />
            إدارة الطاقة
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Lightbulb className="w-4 h-4 ml-2" />
            القوالب
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
            <Bell className="w-4 h-4 ml-2" />
            الإشعارات
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Camera className="w-4 h-4 ml-2" />
            المستخدمون
          </TabsTrigger>
          <TabsTrigger value="remote-access" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Lock className="w-4 h-4 ml-2" />
            الوصول عن بُعد
          </TabsTrigger>
          <TabsTrigger value="scenes" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Zap className="w-4 h-4 ml-2" />
            المشاهد
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
            <Brain className="w-4 h-4 ml-2" />
            مساعد AI
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Lightbulb className="w-4 h-4 ml-2" />
            التقارير الذكية
          </TabsTrigger>
          <TabsTrigger value="device-mgmt" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Cpu className="w-4 h-4 ml-2" />
            إدارة الأجهزة
          </TabsTrigger>
          <TabsTrigger value="integrations-hub" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Plug className="w-4 h-4 ml-2" />
            التكاملات
          </TabsTrigger>
          <TabsTrigger value="predictive" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Brain className="w-4 h-4 ml-2" />
            التنبؤات
          </TabsTrigger>
          <TabsTrigger value="simple-automation" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Zap className="w-4 h-4 ml-2" />
            أتمتة سهلة
          </TabsTrigger>
          </TabsList>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-4">
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
                  <SelectTrigger className="w-36 bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="الفئة" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    {deviceCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={protocolFilter} onValueChange={setProtocolFilter}>
                  <SelectTrigger className="w-36 bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="البروتوكول" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">جميع البروتوكولات</SelectItem>
                    {tuyaProtocols.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={roomFilter} onValueChange={setRoomFilter}>
                  <SelectTrigger className="w-36 bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="الغرفة" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">جميع الغرف</SelectItem>
                    {rooms.map(room => (
                      <SelectItem key={room} value={room}>{room}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Devices Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDevices.map((device, i) => {
              const category = deviceCategories.find(c => c.id === device.category);
              const protocol = tuyaProtocols.find(p => p.id === device.protocol);
              const CategoryIcon = category?.icon || Zap;
              
              return (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card 
                    className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 cursor-pointer transition-all hover:border-cyan-500/50 ${
                      device.status === 'offline' ? 'opacity-60' : ''
                    }`}
                    onClick={() => setSelectedDevice(device)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-3 rounded-xl bg-${category?.color || 'slate'}-500/20`}>
                          <CategoryIcon className={`w-6 h-6 text-${category?.color || 'slate'}-400`} />
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${
                            device.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {device.status === 'online' ? 'متصل' : 'غير متصل'}
                          </Badge>
                        </div>
                      </div>
                      
                      <h3 className="text-white font-medium mb-1">{device.name}</h3>
                      <p className="text-slate-400 text-xs mb-3">{device.room}</p>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={`border-${protocol?.color || 'slate'}-500/50 text-${protocol?.color || 'slate'}-400 text-xs`}>
                          {protocol?.name || device.protocol}
                        </Badge>
                        
                        {device.state.on !== undefined && (
                          <Switch
                            checked={device.state.on}
                            onCheckedChange={() => toggleDevice(device.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                      </div>

                      {/* Device-specific info */}
                      <div className="mt-3 pt-3 border-t border-slate-700/50">
                        {device.category === 'lighting' && device.state.brightness !== undefined && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">السطوع</span>
                            <span className="text-white">{device.state.brightness}%</span>
                          </div>
                        )}
                        {device.category === 'climate' && device.state.temp !== undefined && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">درجة الحرارة</span>
                            <span className="text-cyan-400">{device.state.temp}°C</span>
                          </div>
                        )}
                        {device.state.battery !== undefined && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">البطارية</span>
                            <span className={device.state.battery > 20 ? 'text-green-400' : 'text-red-400'}>{device.state.battery}%</span>
                          </div>
                        )}
                        {device.state.power !== undefined && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">الاستهلاك</span>
                            <span className="text-amber-400">{device.state.power}W</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Protocols Tab */}
        <TabsContent value="protocols" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tuyaProtocols.map((protocol, i) => {
              const deviceCount = devices.filter(d => d.protocol === protocol.id).length;
              return (
                <motion.div
                  key={protocol.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card 
                    className="glass-card border-indigo-500/20 bg-[#0f1629]/80 cursor-pointer hover:border-cyan-500/50 transition-all"
                    onClick={() => { setSelectedProtocol(protocol); setShowProtocolConfig(true); }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-3 rounded-xl bg-${protocol.color}-500/20`}>
                          <protocol.icon className={`w-6 h-6 text-${protocol.color}-400`} />
                        </div>
                        <Badge className="bg-slate-700 text-slate-300">{deviceCount} جهاز</Badge>
                      </div>
                      <h3 className="text-white font-bold">{protocol.name}</h3>
                      <p className="text-slate-400 text-sm mt-1">{protocol.description}</p>
                      {protocol.port !== '-' && (
                        <p className="text-slate-500 text-xs mt-2">المنفذ: {protocol.port}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Protocol Configuration */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">إعدادات Tuya Cloud API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Tuya IoT Platform URL</Label>
                  <Input
                    defaultValue="https://openapi.tuyaeu.com"
                    className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">API Version</Label>
                  <Select defaultValue="v2.0">
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="v1.0">v1.0</SelectItem>
                      <SelectItem value="v2.0">v2.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-slate-300">Local Key Discovery</Label>
                  <Select defaultValue="auto">
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="auto">تلقائي</SelectItem>
                      <SelectItem value="manual">يدوي</SelectItem>
                      <SelectItem value="cloud">من السحابة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">Protocol Version</Label>
                  <Select defaultValue="3.4">
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="3.1">3.1</SelectItem>
                      <SelectItem value="3.2">3.2</SelectItem>
                      <SelectItem value="3.3">3.3</SelectItem>
                      <SelectItem value="3.4">3.4</SelectItem>
                      <SelectItem value="3.5">3.5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">Encryption</Label>
                  <Select defaultValue="aes">
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="aes">AES-128-ECB</SelectItem>
                      <SelectItem value="aes-gcm">AES-GCM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scenes Tab */}
        <TabsContent value="scenes" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockScenes.map((scene, i) => (
              <motion.div
                key={scene.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-xl bg-${scene.color}-500/20`}>
                        <scene.icon className={`w-6 h-6 text-${scene.color}-400`} />
                      </div>
                      <Badge className="bg-slate-700 text-slate-300">{scene.devices} أجهزة</Badge>
                    </div>
                    <h3 className="text-white font-bold mb-2">{scene.name}</h3>
                    <div className="space-y-1 mb-3">
                      {scene.actions.map((action, j) => (
                        <p key={j} className="text-slate-400 text-xs flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-400" />
                          {action}
                        </p>
                      ))}
                    </div>
                    <Button 
                      className={`w-full bg-${scene.color}-600 hover:bg-${scene.color}-700`}
                      onClick={() => runScene(scene)}
                    >
                      <Play className="w-4 h-4 ml-2" />
                      تشغيل
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mockScenes.length * 0.05 }}
            >
              <Card className="glass-card border-dashed border-2 border-slate-700 bg-transparent h-full min-h-[200px] flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all">
                <CardContent className="text-center">
                  <Plus className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400">إضافة سيناريو جديد</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room, i) => {
              const roomDevices = devices.filter(d => d.room === room);
              const onlineCount = roomDevices.filter(d => d.status === 'online').length;
              return (
                <motion.div
                  key={room}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold text-lg">{room}</h3>
                        <Badge className="bg-cyan-500/20 text-cyan-400">{roomDevices.length} أجهزة</Badge>
                      </div>
                      <div className="space-y-2">
                        {roomDevices.slice(0, 3).map(device => {
                          const category = deviceCategories.find(c => c.id === device.category);
                          const Icon = category?.icon || Zap;
                          return (
                            <div key={device.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 text-${category?.color || 'slate'}-400`} />
                                <span className="text-white text-sm">{device.name}</span>
                              </div>
                              <div className={`w-2 h-2 rounded-full ${device.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                            </div>
                          );
                        })}
                        {roomDevices.length > 3 && (
                          <p className="text-slate-400 text-xs text-center">+{roomDevices.length - 3} أجهزة أخرى</p>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs">
                        <span className="text-slate-400">{onlineCount}/{roomDevices.length} متصل</span>
                        <Button variant="ghost" size="sm" className="text-cyan-400 h-7">
                          <Settings className="w-3 h-3 ml-1" />
                          إدارة
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation">
          <AdvancedAutomationBuilder devices={devices} scenes={mockScenes} />
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups">
          <DeviceGroups 
            devices={devices} 
            onToggleDevice={(id, state) => {
              setDevices(devices.map(d => 
                d.id === id ? { ...d, state: { ...d.state, on: state } } : d
              ));
            }} 
          />
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <DevicePerformance devices={devices} />
        </TabsContent>

        {/* Energy Analytics Tab */}
        <TabsContent value="energy">
          <EnergyAnalytics devices={devices} />
        </TabsContent>

        {/* Device Discovery Tab */}
        <TabsContent value="discovery">
          <DeviceDiscovery onDeviceAdded={(device) => {
            setDevices(prev => [...prev, {
              ...device,
              id: device.id || `dev-${Date.now()}`,
              category: device.type === 'thermostat' ? 'climate' : device.type === 'sensor' ? 'sensors' : device.type === 'lock' ? 'security' : 'appliances',
              status: 'online',
              state: { on: false },
              room: 'غرفة المعيشة'
            }]);
          }} />
        </TabsContent>

        {/* Platform Integration Tab */}
        <TabsContent value="platforms">
          <PlatformIntegration devices={devices} />
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows">
          <WorkflowBuilder devices={devices} />
        </TabsContent>

        {/* Advanced Analytics Tab */}
        <TabsContent value="analytics">
          <AdvancedDataAnalytics devices={devices} />
        </TabsContent>

        {/* Custom Dashboards Tab */}
        <TabsContent value="dashboards">
          <CustomDashboardBuilder devices={devices} />
        </TabsContent>

        {/* Matter Protocol Tab */}
        <TabsContent value="matter">
          <MatterProtocolManager onDeviceAdded={(device) => {
            setDevices(prev => [...prev, {
              ...device,
              id: device.id || `matter-${Date.now()}`,
              status: 'online',
              state: { on: false }
            }]);
          }} />
        </TabsContent>

        {/* Learning Flows Tab */}
        <TabsContent value="learning">
          <LearningFlows devices={devices} />
        </TabsContent>

        {/* Energy Management Tab */}
        <TabsContent value="energy-mgmt">
          <EnergyManagement devices={devices} />
        </TabsContent>

        {/* Automation Templates Tab */}
        <TabsContent value="templates">
          <AutomationTemplates onApplyTemplate={(template) => {
            toast.success(`تم تطبيق قالب "${template.name}"`);
          }} />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <SmartNotifications />
        </TabsContent>

        {/* User Permissions Tab */}
        <TabsContent value="users">
          <UserPermissions />
        </TabsContent>

        {/* Remote Access Tab */}
        <TabsContent value="remote-access">
          <RemoteAccessManager />
        </TabsContent>

        {/* Scenes Tab */}
        <TabsContent value="scenes">
          <SceneManager 
            devices={devices}
            onSceneActivate={(scene) => {
              toast.success(`جاري تنفيذ "${scene.name}"...`);
            }} 
          />
        </TabsContent>

        {/* AI Automation Assistant Tab */}
        <TabsContent value="ai-assistant">
          <AIAutomationAssistant devices={devices} />
        </TabsContent>

        {/* AI Reports Tab */}
        <TabsContent value="reports">
          <AIReportGenerator devices={devices} automations={[]} />
        </TabsContent>

        {/* Enhanced Device Management Tab */}
        <TabsContent value="device-mgmt">
          <EnhancedDeviceManagement devices={devices} onDeviceUpdate={(id, updates) => {
            setDevices(devices.map(d => d.id === id ? { ...d, ...updates } : d));
          }} />
        </TabsContent>

        {/* Integrations Hub Tab */}
        <TabsContent value="integrations-hub">
          <IntegrationsHub devices={devices} />
        </TabsContent>

        {/* Predictive Analytics Tab */}
        <TabsContent value="predictive">
          <PredictiveAnalytics devices={devices} />
        </TabsContent>

        {/* Simplified Automation Tab */}
        <TabsContent value="simple-automation">
          <SimplifiedAutomationBuilder devices={devices} />
        </TabsContent>
        </Tabs>

      {/* Voice Assistant */}
      <VoiceAssistant 
        devices={devices} 
        onCommand={(result) => {
          if (result.action_type === 'control_device' && result.target_devices) {
            result.target_devices.forEach(targetName => {
              const device = devices.find(d => d.name.includes(targetName));
              if (device) {
                if (result.action === 'on' || result.action === 'off') {
                  toggleDevice(device.id);
                }
              }
            });
          }
        }}
      />

      {/* Device Detail Dialog */}
      <Dialog open={!!selectedDevice} onOpenChange={() => setSelectedDevice(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedDevice?.name}</DialogTitle>
          </DialogHeader>
          {selectedDevice && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">الحالة</span>
                <Badge className={selectedDevice.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                  {selectedDevice.status === 'online' ? 'متصل' : 'غير متصل'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">البروتوكول</span>
                <span className="text-white">{tuyaProtocols.find(p => p.id === selectedDevice.protocol)?.name}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">الغرفة</span>
                <span className="text-white">{selectedDevice.room}</span>
              </div>

              {/* Device Controls */}
              {selectedDevice.state.on !== undefined && (
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400">التشغيل</span>
                  <Switch
                    checked={selectedDevice.state.on}
                    onCheckedChange={() => toggleDevice(selectedDevice.id)}
                  />
                </div>
              )}

              {selectedDevice.state.brightness !== undefined && (
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">السطوع</span>
                    <span className="text-white">{selectedDevice.state.brightness}%</span>
                  </div>
                  <Slider
                    value={[selectedDevice.state.brightness]}
                    onValueChange={([v]) => updateDeviceState(selectedDevice.id, 'brightness', v)}
                    max={100}
                    step={1}
                  />
                </div>
              )}

              {selectedDevice.category === 'climate' && selectedDevice.state.temp !== undefined && (
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">درجة الحرارة</span>
                    <span className="text-cyan-400">{selectedDevice.state.temp}°C</span>
                  </div>
                  <Slider
                    value={[selectedDevice.state.temp]}
                    onValueChange={([v]) => updateDeviceState(selectedDevice.id, 'temp', v)}
                    min={16}
                    max={30}
                    step={1}
                  />
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant={selectedDevice.state.mode === 'cool' ? 'default' : 'outline'} className={selectedDevice.state.mode === 'cool' ? 'bg-cyan-600' : 'border-slate-600'}>
                      <Snowflake className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant={selectedDevice.state.mode === 'heat' ? 'default' : 'outline'} className={selectedDevice.state.mode === 'heat' ? 'bg-red-600' : 'border-slate-600'}>
                      <Flame className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant={selectedDevice.state.mode === 'auto' ? 'default' : 'outline'} className={selectedDevice.state.mode === 'auto' ? 'bg-green-600' : 'border-slate-600'}>
                      <ThermometerSun className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}