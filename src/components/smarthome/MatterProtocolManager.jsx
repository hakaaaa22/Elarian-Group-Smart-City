import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Link, Wifi, Radio, Globe, Server, Shield, Cpu, Check, X,
  Loader2, RefreshCw, Settings, Plus, Search, Zap, Home,
  Smartphone, Lock, Thermometer, Lightbulb, Camera, Speaker,
  ChevronRight, AlertTriangle, Signal, Database, Key, QrCode,
  Activity, Battery, WifiOff, Brain, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Matter Device Types
const matterDeviceTypes = [
  { id: 'light', name: 'إضاءة', icon: Lightbulb, color: 'amber' },
  { id: 'switch', name: 'مفتاح', icon: Zap, color: 'cyan' },
  { id: 'thermostat', name: 'ترموستات', icon: Thermometer, color: 'red' },
  { id: 'lock', name: 'قفل', icon: Lock, color: 'green' },
  { id: 'sensor', name: 'مستشعر', icon: Radio, color: 'blue' },
  { id: 'camera', name: 'كاميرا', icon: Camera, color: 'purple' },
  { id: 'speaker', name: 'سماعة', icon: Speaker, color: 'pink' },
  { id: 'hub', name: 'Hub', icon: Server, color: 'indigo' },
];

// Transport Protocols
const transportProtocols = [
  { id: 'thread', name: 'Thread', icon: Radio, color: 'green', description: 'شبكة mesh منخفضة الطاقة', features: ['IPv6', 'Mesh Network', 'Low Power', 'Self-Healing'] },
  { id: 'wifi', name: 'Wi-Fi', icon: Wifi, color: 'cyan', description: 'اتصال عالي السرعة', features: ['High Bandwidth', 'Wide Range', 'Direct Connection'] },
  { id: 'ethernet', name: 'Ethernet', icon: Globe, color: 'blue', description: 'اتصال سلكي مستقر', features: ['Stable', 'Low Latency', 'High Speed'] },
  { id: 'ble', name: 'BLE', icon: Smartphone, color: 'purple', description: 'للإقران والإعداد', features: ['Setup', 'Commissioning', 'Low Energy'] },
];

// Mock Matter Devices
const mockMatterDevices = [
  { id: 'm1', name: 'مصباح Matter الذكي', type: 'light', transport: 'thread', vendor: 'Philips Hue', status: 'commissioned', fabricId: 'F001', nodeId: '0x0001', signalStrength: 92, lastSeen: '2 دقيقة', hubId: 'hub1', battery: null, uptime: 99.5 },
  { id: 'm2', name: 'ترموستات Nest', type: 'thermostat', transport: 'wifi', vendor: 'Google', status: 'commissioned', fabricId: 'F001', nodeId: '0x0002', signalStrength: 85, lastSeen: '1 دقيقة', hubId: 'hub1', battery: null, uptime: 98.2 },
  { id: 'm3', name: 'قفل Yale الذكي', type: 'lock', transport: 'thread', vendor: 'Yale', status: 'commissioned', fabricId: 'F001', nodeId: '0x0003', signalStrength: 78, lastSeen: '5 دقائق', hubId: 'hub1', battery: 45, uptime: 97.8 },
  { id: 'm4', name: 'مستشعر Eve Motion', type: 'sensor', transport: 'thread', vendor: 'Eve', status: 'offline', fabricId: 'F001', nodeId: '0x0004', signalStrength: 0, lastSeen: '2 ساعة', hubId: null, battery: 12, uptime: 45.0 },
  { id: 'm5', name: 'مفتاح TP-Link', type: 'switch', transport: 'wifi', vendor: 'TP-Link', status: 'commissioned', fabricId: 'F001', nodeId: '0x0005', signalStrength: 95, lastSeen: '30 ثانية', hubId: 'hub1', battery: null, uptime: 99.9 },
  { id: 'm6', name: 'كاميرا Aqara', type: 'camera', transport: 'ethernet', vendor: 'Aqara', status: 'commissioned', fabricId: 'F001', nodeId: '0x0006', signalStrength: 100, lastSeen: 'الآن', hubId: 'hub1', battery: null, uptime: 100 },
  { id: 'm7', name: 'مستشعر الباب', type: 'sensor', transport: 'thread', vendor: 'Aqara', status: 'commissioned', fabricId: 'F001', nodeId: '0x0007', signalStrength: 35, lastSeen: '15 دقيقة', hubId: 'hub1', battery: 22, uptime: 88.5 },
];

// Calculate device health score
const calculateHealthScore = (device) => {
  if (device.status === 'offline' || device.status === 'pending') return 0;
  
  let score = 0;
  let factors = 0;
  
  // Signal strength (0-100)
  if (device.signalStrength !== undefined) {
    score += device.signalStrength;
    factors++;
  }
  
  // Battery level (0-100)
  if (device.battery !== null && device.battery !== undefined) {
    score += device.battery;
    factors++;
  }
  
  // Uptime (0-100)
  if (device.uptime !== undefined) {
    score += device.uptime;
    factors++;
  }
  
  // Last seen penalty
  const lastSeenPenalty = device.lastSeen === 'الآن' ? 0 : 
    device.lastSeen.includes('ثانية') ? 2 :
    device.lastSeen.includes('دقيقة') ? 5 :
    device.lastSeen.includes('ساعة') ? 20 : 40;
  
  if (factors === 0) return 100 - lastSeenPenalty;
  return Math.max(0, Math.min(100, Math.round(score / factors) - lastSeenPenalty));
};

// Health alerts
const getHealthAlerts = (devices) => {
  const alerts = [];
  devices.forEach(device => {
    if (device.status === 'offline') {
      alerts.push({ device, type: 'offline', severity: 'critical', message: `${device.name} غير متصل` });
    }
    if (device.battery !== null && device.battery < 20) {
      alerts.push({ device, type: 'low_battery', severity: device.battery < 10 ? 'critical' : 'warning', message: `بطارية ${device.name} منخفضة (${device.battery}%)` });
    }
    if (device.signalStrength > 0 && device.signalStrength < 40) {
      alerts.push({ device, type: 'low_signal', severity: 'warning', message: `إشارة ${device.name} ضعيفة (${device.signalStrength}%)` });
    }
  });
  return alerts.sort((a, b) => (a.severity === 'critical' ? -1 : 1));
};

// Troubleshooting guides
const troubleshootingGuides = {
  offline: [
    'تحقق من أن الجهاز متصل بالكهرباء',
    'أعد تشغيل الجهاز',
    'تحقق من اتصال الـ Hub',
    'أعد إضافة الجهاز للشبكة'
  ],
  low_battery: [
    'استبدل البطارية في أقرب وقت',
    'تحقق من نوع البطارية المطلوب',
    'فعّل وضع توفير الطاقة'
  ],
  low_signal: [
    'قرّب الجهاز من الـ Hub',
    'أضف Range Extender',
    'أزل العوائق بين الجهاز والـ Hub',
    'تحقق من عدم وجود تداخل لاسلكي'
  ]
};

// Hubs
const mockHubs = [
  { id: 'hub1', name: 'Hub الرئيسي', type: 'border_router', status: 'online', devices: 5, protocols: ['thread', 'wifi', 'ble'], ip: '192.168.1.100' },
  { id: 'hub2', name: 'Hub الطابق العلوي', type: 'range_extender', status: 'online', devices: 2, protocols: ['thread'], ip: '192.168.1.101' },
];

// Fabrics (Multi-Admin)
const mockFabrics = [
  { 
    id: 'F001', name: 'ELARIAN Fabric', admin: 'ELARIAN GROUP', devices: 5, status: 'active',
    permissions: ['full_control', 'add_devices', 'remove_devices', 'manage_users'],
    users: [
      { email: 'admin@elarian.com', role: 'admin', access: 'full' },
      { email: 'user1@elarian.com', role: 'user', access: 'control' },
    ]
  },
  { 
    id: 'F002', name: 'Apple Home', admin: 'Apple HomeKit', devices: 3, status: 'active',
    permissions: ['control', 'view'],
    users: [{ email: 'user@icloud.com', role: 'owner', access: 'full' }]
  },
  { 
    id: 'F003', name: 'Google Home', admin: 'Google', devices: 2, status: 'active',
    permissions: ['control', 'view'],
    users: [{ email: 'user@gmail.com', role: 'owner', access: 'full' }]
  },
];

export default function MatterProtocolManager({ onDeviceAdded }) {
  const [activeTab, setActiveTab] = useState('devices');
  const [devices, setDevices] = useState(mockMatterDevices);
  const [fabrics, setFabrics] = useState(mockFabrics);
  const [hubs, setHubs] = useState(mockHubs);
  const [showCommissionDialog, setShowCommissionDialog] = useState(false);
  const [showFabricDialog, setShowFabricDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [showTroubleshootDialog, setShowTroubleshootDialog] = useState(false);
  const [showAiDiagnostics, setShowAiDiagnostics] = useState(false);
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [commissioningDevice, setCommissioningDevice] = useState(null);
  const [commissionStep, setCommissionStep] = useState(0);
  const [setupCode, setSetupCode] = useState('');
  const [scanning, setScanning] = useState(false);

  // Health calculations
  const healthAlerts = getHealthAlerts(devices);
  const deviceHealthScores = devices.map(d => ({ ...d, healthScore: calculateHealthScore(d) }));
  const homeHealthScore = Math.round(deviceHealthScores.reduce((sum, d) => sum + d.healthScore, 0) / devices.length);

  const stats = {
    total: devices.length,
    commissioned: devices.filter(d => d.status === 'commissioned').length,
    thread: devices.filter(d => d.transport === 'thread').length,
    wifi: devices.filter(d => d.transport === 'wifi').length,
  };

  const startCommissioning = async () => {
    if (!setupCode) {
      toast.error('يرجى إدخال رمز الإعداد');
      return;
    }
    setCommissionStep(1);
    await new Promise(r => setTimeout(r, 2000));
    setCommissionStep(2);
    await new Promise(r => setTimeout(r, 2000));
    setCommissionStep(3);
    await new Promise(r => setTimeout(r, 1500));
    setCommissionStep(4);
    toast.success('تم إضافة الجهاز بنجاح!');
    setShowCommissionDialog(false);
    setCommissionStep(0);
    setSetupCode('');
  };

  const scanForDevices = async () => {
    setScanning(true);
    toast.success('جاري البحث عن أجهزة Matter...');
    await new Promise(r => setTimeout(r, 3000));
    setScanning(false);
    toast.success('تم العثور على 2 أجهزة جديدة');
  };

  const removeFromFabric = (deviceId) => {
    setDevices(devices.map(d => 
      d.id === deviceId ? { ...d, status: 'pending', fabricId: null, nodeId: null } : d
    ));
    toast.success('تم إزالة الجهاز من الـ Fabric');
  };

  const aiDiagnosticsMutation = useMutation({
    mutationFn: async () => {
      const deviceSummary = deviceHealthScores.map(d => 
        `${d.name}: صحة ${d.healthScore}/100، إشارة ${d.signalStrength}%، ${d.battery !== null ? `بطارية ${d.battery}%` : 'كهرباء مباشرة'}, وقت تشغيل ${d.uptime}%, آخر اتصال ${d.lastSeen}`
      ).join('\n');

      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مساعد ذكي متخصص في تشخيص أجهزة Matter.
        
حالة الأجهزة:
${deviceSummary}

المشاكل المكتشفة:
${healthAlerts.map(a => `- ${a.message} (${a.severity})`).join('\n')}

قم بتحليل شامل وقدم:
1. تشخيص دقيق لكل مشكلة
2. خطوات إصلاح مفصلة ومرتبة حسب الأولوية
3. توصيات لاستبدال الأجهزة الحرجة
4. اقتراحات تحسين عامة للشبكة
5. تنبؤ بالمشاكل المحتملة المستقبلية`,
        response_json_schema: {
          type: 'object',
          properties: {
            overallHealth: { type: 'string' },
            criticalIssues: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  device: { type: 'string' },
                  issue: { type: 'string' },
                  diagnosis: { type: 'string' },
                  priority: { type: 'string' },
                  steps: { type: 'array', items: { type: 'string' } },
                  replacementNeeded: { type: 'boolean' },
                  replacementSuggestion: { type: 'string' }
                }
              }
            },
            networkRecommendations: { type: 'array', items: { type: 'string' } },
            futurePredictions: { type: 'array', items: { type: 'string' } }
          }
        }
      });
    },
    onSuccess: () => {
      setShowAiDiagnostics(true);
    },
    onError: () => toast.error('فشل التحليل الذكي')
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Link className="w-5 h-5 text-pink-400" />
            Matter Protocol Manager
          </h3>
          <p className="text-slate-400 text-sm">إدارة أجهزة Matter عبر Thread و Wi-Fi</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-purple-500/50 text-purple-400"
            onClick={() => aiDiagnosticsMutation.mutate()}
            disabled={aiDiagnosticsMutation.isPending}
          >
            {aiDiagnosticsMutation.isPending ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
            تشخيص ذكي
          </Button>
          <Button variant="outline" className="border-slate-600" onClick={scanForDevices} disabled={scanning}>
            {scanning ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Search className="w-4 h-4 ml-2" />}
            بحث
          </Button>
          <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => setShowCommissionDialog(true)}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة جهاز
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الأجهزة', value: stats.total, icon: Cpu, color: 'pink' },
          { label: 'مُفعّل', value: stats.commissioned, icon: Check, color: 'green' },
          { label: 'Thread', value: stats.thread, icon: Radio, color: 'emerald' },
          { label: 'Wi-Fi', value: stats.wifi, icon: Wifi, color: 'cyan' },
        ].map((stat, i) => (
          <Card key={i} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Matter Info Banner */}
      <Card className="glass-card border-pink-500/30 bg-pink-500/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-pink-500/20">
              <Link className="w-8 h-8 text-pink-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-pink-200 font-bold mb-1">Matter - معيار المنزل الذكي الموحد</h4>
              <p className="text-pink-300/70 text-sm mb-3">
                Matter يوفر قابلية تشغيل بيني بين جميع الأجهزة الذكية من مختلف الشركات المصنعة، مع دعم Multi-Admin للتحكم من عدة منصات.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-white/10 text-white">Apple HomeKit</Badge>
                <Badge className="bg-white/10 text-white">Google Home</Badge>
                <Badge className="bg-white/10 text-white">Amazon Alexa</Badge>
                <Badge className="bg-white/10 text-white">Samsung SmartThings</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="devices" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
            الأجهزة
          </TabsTrigger>
          <TabsTrigger value="transports" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            البروتوكولات
          </TabsTrigger>
          <TabsTrigger value="fabrics" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            Fabrics
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
            الأمان
          </TabsTrigger>
          <TabsTrigger value="health" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
            <Activity className="w-4 h-4 ml-2" />
            صحة الأجهزة
          </TabsTrigger>
        </TabsList>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device, i) => {
              const deviceType = matterDeviceTypes.find(t => t.id === device.type);
              const transport = transportProtocols.find(t => t.id === device.transport);
              const Icon = deviceType?.icon || Cpu;
              
              return (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 ${
                    device.status === 'commissioned' ? 'ring-1 ring-green-500/30' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-${deviceType?.color || 'slate'}-500/20`}>
                            <Icon className={`w-5 h-5 text-${deviceType?.color || 'slate'}-400`} />
                          </div>
                          <div>
                            <h4 className="text-white font-medium text-sm">{device.name}</h4>
                            <p className="text-slate-500 text-xs">{device.vendor}</p>
                          </div>
                        </div>
                        <Badge className={`text-xs ${
                          device.status === 'commissioned' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {device.status === 'commissioned' ? 'مُفعّل' : 'في الانتظار'}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                          <span className="text-slate-400">النقل</span>
                          <div className="flex items-center gap-1">
                            {transport && <transport.icon className={`w-3 h-3 text-${transport.color}-400`} />}
                            <span className="text-white">{transport?.name}</span>
                          </div>
                        </div>
                        {device.signalStrength > 0 && (
                          <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                            <span className="text-slate-400">قوة الإشارة</span>
                            <div className="flex items-center gap-2">
                              <Progress value={device.signalStrength} className="w-16 h-1.5" />
                              <span className={`${device.signalStrength > 70 ? 'text-green-400' : device.signalStrength > 40 ? 'text-amber-400' : 'text-red-400'}`}>
                                {device.signalStrength}%
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                          <span className="text-slate-400">آخر اتصال</span>
                          <span className="text-white">{device.lastSeen}</span>
                        </div>
                        {device.fabricId && (
                          <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                            <span className="text-slate-400">Fabric</span>
                            <span className="text-white">{device.fabricId}</span>
                          </div>
                        )}
                        {device.nodeId && (
                          <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                            <span className="text-slate-400">Node ID</span>
                            <code className="text-cyan-400">{device.nodeId}</code>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-3">
                        {device.status === 'commissioned' ? (
                          <>
                            <Button size="sm" variant="outline" className="flex-1 border-slate-600">
                              <Settings className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-500/50 text-red-400" onClick={() => removeFromFabric(device.id)}>
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" className="w-full bg-pink-600 hover:bg-pink-700" onClick={() => setShowCommissionDialog(true)}>
                            <Plus className="w-3 h-3 ml-1" />
                            تفعيل
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Transport Protocols Tab */}
        <TabsContent value="transports" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {transportProtocols.map((protocol, i) => {
              const deviceCount = devices.filter(d => d.transport === protocol.id).length;
              return (
                <Card key={protocol.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-${protocol.color}-500/20`}>
                        <protocol.icon className={`w-6 h-6 text-${protocol.color}-400`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-bold">{protocol.name}</h4>
                          <Badge className="bg-slate-700 text-slate-300">{deviceCount} جهاز</Badge>
                        </div>
                        <p className="text-slate-400 text-sm mb-3">{protocol.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {protocol.features.map((f, j) => (
                            <Badge key={j} variant="outline" className="border-slate-600 text-slate-300 text-xs">{f}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Thread Network Info */}
          <Card className="glass-card border-green-500/30 bg-green-500/10">
            <CardHeader>
              <CardTitle className="text-green-200 text-sm flex items-center gap-2">
                <Radio className="w-4 h-4" />
                شبكة Thread
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Network Name</p>
                  <p className="text-white font-medium">VisionAI-Thread</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">PAN ID</p>
                  <code className="text-green-400">0x1234</code>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Channel</p>
                  <p className="text-white font-medium">15</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fabrics Tab */}
        <TabsContent value="fabrics" className="space-y-4 mt-4">
          {/* Hubs Section */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                أجهزة Hub / Border Router
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {hubs.map(hub => (
                <div key={hub.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${hub.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="text-white font-medium">{hub.name}</p>
                      <p className="text-slate-500 text-xs">{hub.ip} • {hub.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-slate-700 text-slate-300 text-xs">{hub.devices} أجهزة</Badge>
                    <div className="flex gap-1">
                      {hub.protocols.map(p => (
                        <Badge key={p} variant="outline" className="border-slate-600 text-slate-400 text-[10px]">{p}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Fabrics */}
          <div className="space-y-3">
            {fabrics.map((fabric, i) => (
              <Card key={fabric.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <Database className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{fabric.name}</h4>
                        <p className="text-slate-400 text-xs">Admin: {fabric.admin}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-slate-700 text-slate-300">{fabric.devices} أجهزة</Badge>
                      <Badge className="bg-green-500/20 text-green-400">{fabric.status}</Badge>
                      <Button size="sm" variant="outline" className="border-slate-600" onClick={() => { setSelectedFabric(fabric); setShowPermissionsDialog(true); }}>
                        <Key className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Users */}
                  <div className="pt-3 border-t border-slate-700/50">
                    <p className="text-slate-400 text-xs mb-2">المستخدمون ({fabric.users?.length || 0})</p>
                    <div className="flex flex-wrap gap-2">
                      {fabric.users?.map((user, ui) => (
                        <Badge key={ui} variant="outline" className={`text-xs ${user.role === 'admin' ? 'border-amber-500/50 text-amber-400' : 'border-slate-600 text-slate-300'}`}>
                          {user.email} ({user.role})
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button variant="outline" className="w-full border-dashed border-slate-600" onClick={() => setShowFabricDialog(true)}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة Fabric جديد
          </Button>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health" className="space-y-4 mt-4">
          {/* Home Health Score */}
          <Card className={`glass-card border-2 ${
            homeHealthScore >= 80 ? 'border-green-500/50 bg-green-500/5' :
            homeHealthScore >= 50 ? 'border-amber-500/50 bg-amber-500/5' :
            'border-red-500/50 bg-red-500/5'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">صحة المنزل الإجمالية</h3>
                  <p className="text-slate-400 text-sm">بناءً على حالة جميع الأجهزة المتصلة</p>
                </div>
                <div className="text-center">
                  <div className={`text-5xl font-bold ${
                    homeHealthScore >= 80 ? 'text-green-400' :
                    homeHealthScore >= 50 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {homeHealthScore}
                  </div>
                  <p className="text-slate-400 text-sm">من 100</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Alerts */}
          {healthAlerts.length > 0 && (
            <Card className="glass-card border-red-500/30 bg-red-500/5">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  تنبيهات الصحة ({healthAlerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {healthAlerts.map((alert, i) => (
                  <div 
                    key={i} 
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all hover:bg-slate-700/50 ${
                      alert.severity === 'critical' ? 'bg-red-500/10 border border-red-500/30' : 'bg-amber-500/10 border border-amber-500/30'
                    }`}
                    onClick={() => { setSelectedAlert(alert); setShowTroubleshootDialog(true); }}
                  >
                    <div className="flex items-center gap-3">
                      {alert.type === 'offline' ? <WifiOff className="w-4 h-4 text-red-400" /> :
                       alert.type === 'low_battery' ? <Battery className="w-4 h-4 text-amber-400" /> :
                       <Signal className="w-4 h-4 text-amber-400" />}
                      <div>
                        <p className="text-white text-sm">{alert.message}</p>
                        <p className="text-slate-500 text-xs">{alert.device.vendor}</p>
                      </div>
                    </div>
                    <Badge className={`text-xs ${alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {alert.severity === 'critical' ? 'حرج' : 'تحذير'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Device Health Scores */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">تقييم صحة الأجهزة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deviceHealthScores.sort((a, b) => a.healthScore - b.healthScore).map(device => {
                  const deviceType = matterDeviceTypes.find(t => t.id === device.type);
                  const Icon = deviceType?.icon || Cpu;
                  return (
                    <div key={device.id} className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-lg">
                      <div className={`p-2 rounded-lg bg-${deviceType?.color || 'slate'}-500/20`}>
                        <Icon className={`w-5 h-5 text-${deviceType?.color || 'slate'}-400`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-sm">{device.name}</span>
                          <span className={`font-bold ${
                            device.healthScore >= 80 ? 'text-green-400' :
                            device.healthScore >= 50 ? 'text-amber-400' : 'text-red-400'
                          }`}>{device.healthScore}</span>
                        </div>
                        <Progress value={device.healthScore} className="h-1.5" />
                        <div className="flex gap-4 mt-2 text-xs text-slate-500">
                          {device.signalStrength > 0 && <span>إشارة: {device.signalStrength}%</span>}
                          {device.battery !== null && <span>بطارية: {device.battery}%</span>}
                          <span>وقت التشغيل: {device.uptime}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-400" />
                أمان Matter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Device Attestation', status: 'enabled', desc: 'التحقق من هوية الأجهزة' },
                { name: 'Secure Channel (CASE)', status: 'enabled', desc: 'قنوات اتصال مشفرة' },
                { name: 'Group Messaging', status: 'enabled', desc: 'رسائل جماعية مشفرة' },
                { name: 'Firmware Update', status: 'available', desc: 'تحديثات آمنة للبرامج الثابتة' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-slate-500 text-xs">{item.desc}</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">{item.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Diagnostics Dialog */}
      <Dialog open={showAiDiagnostics} onOpenChange={setShowAiDiagnostics}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              التشخيص الذكي للأجهزة
            </DialogTitle>
          </DialogHeader>
          {aiDiagnosticsMutation.data && (
            <div className="space-y-4 mt-4">
              {/* Overall Health */}
              <Card className="glass-card border-purple-500/30 bg-purple-500/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    <div>
                      <h4 className="text-white font-medium">التقييم العام</h4>
                      <p className="text-slate-300 text-sm">{aiDiagnosticsMutation.data.overallHealth}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Critical Issues */}
              {aiDiagnosticsMutation.data.criticalIssues?.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3">المشاكل الحرجة</h4>
                  <div className="space-y-3">
                    {aiDiagnosticsMutation.data.criticalIssues.map((issue, i) => (
                      <Card key={i} className={`glass-card ${
                        issue.priority === 'critical' ? 'border-red-500/50 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h5 className="text-white font-medium">{issue.device}</h5>
                              <p className="text-slate-400 text-sm">{issue.issue}</p>
                            </div>
                            <Badge className={`text-xs ${
                              issue.priority === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {issue.priority === 'critical' ? 'حرج' : 'تحذير'}
                            </Badge>
                          </div>
                          <p className="text-slate-300 text-sm mb-3">{issue.diagnosis}</p>
                          <div className="space-y-2">
                            {issue.steps?.map((step, si) => (
                              <div key={si} className="flex items-start gap-2 p-2 bg-slate-800/50 rounded">
                                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">{si + 1}</span>
                                <span className="text-white text-sm">{step}</span>
                              </div>
                            ))}
                          </div>
                          {issue.replacementNeeded && (
                            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                              <p className="text-blue-300 text-sm font-medium mb-1">توصية الاستبدال</p>
                              <p className="text-slate-300 text-sm">{issue.replacementSuggestion}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Network Recommendations */}
              {aiDiagnosticsMutation.data.networkRecommendations?.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3">توصيات تحسين الشبكة</h4>
                  <div className="space-y-2">
                    {aiDiagnosticsMutation.data.networkRecommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <Check className="w-4 h-4 text-green-400 mt-0.5" />
                        <p className="text-white text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Future Predictions */}
              {aiDiagnosticsMutation.data.futurePredictions?.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3">تنبؤات مستقبلية</h4>
                  <div className="space-y-2">
                    {aiDiagnosticsMutation.data.futurePredictions.map((pred, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
                        <p className="text-white text-sm">{pred}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Troubleshooting Dialog */}
      <Dialog open={showTroubleshootDialog} onOpenChange={setShowTroubleshootDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">إصلاح المشكلة</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4 mt-4">
              <div className={`p-4 rounded-lg ${
                selectedAlert.severity === 'critical' ? 'bg-red-500/10 border border-red-500/30' : 'bg-amber-500/10 border border-amber-500/30'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  {selectedAlert.type === 'offline' ? <WifiOff className="w-5 h-5 text-red-400" /> :
                   selectedAlert.type === 'low_battery' ? <Battery className="w-5 h-5 text-amber-400" /> :
                   <Signal className="w-5 h-5 text-amber-400" />}
                  <div>
                    <p className="text-white font-medium">{selectedAlert.message}</p>
                    <p className="text-slate-400 text-xs">{selectedAlert.device.vendor} • {selectedAlert.device.transport}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-slate-300 text-sm mb-3">خطوات الإصلاح المقترحة:</p>
                <div className="space-y-2">
                  {troubleshootingGuides[selectedAlert.type]?.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 bg-slate-800/50 rounded-lg">
                      <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <span className="text-white text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
               <Button 
                 className="flex-1 bg-purple-600 hover:bg-purple-700"
                 onClick={() => {
                   setShowTroubleshootDialog(false);
                   aiDiagnosticsMutation.mutate();
                 }}
                 disabled={aiDiagnosticsMutation.isPending}
               >
                 <Brain className="w-4 h-4 ml-2" />
                 تشخيص ذكي
               </Button>
               <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={() => { setShowTroubleshootDialog(false); toast.success('جاري إعادة الاتصال...'); }}>
                 <RefreshCw className="w-4 h-4 ml-2" />
                 إعادة الاتصال
               </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">إدارة صلاحيات Fabric</DialogTitle>
          </DialogHeader>
          {selectedFabric && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-white font-medium">{selectedFabric.name}</p>
                <p className="text-slate-400 text-xs">{selectedFabric.admin}</p>
              </div>
              
              <div>
                <p className="text-slate-300 text-sm mb-2">الصلاحيات</p>
                <div className="space-y-2">
                  {['full_control', 'add_devices', 'remove_devices', 'manage_users', 'view_only'].map(perm => (
                    <div key={perm} className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                      <span className="text-white text-sm">
                        {perm === 'full_control' ? 'تحكم كامل' : 
                         perm === 'add_devices' ? 'إضافة أجهزة' :
                         perm === 'remove_devices' ? 'حذف أجهزة' :
                         perm === 'manage_users' ? 'إدارة المستخدمين' : 'عرض فقط'}
                      </span>
                      <Switch defaultChecked={selectedFabric.permissions?.includes(perm)} />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-slate-300 text-sm mb-2">المستخدمون</p>
                <div className="space-y-2">
                  {selectedFabric.users?.map((user, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                      <div>
                        <p className="text-white text-sm">{user.email}</p>
                        <p className="text-slate-500 text-xs">{user.role}</p>
                      </div>
                      <Select defaultValue={user.access}>
                        <SelectTrigger className="w-24 h-7 bg-slate-800 border-slate-700 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="full">كامل</SelectItem>
                          <SelectItem value="control">تحكم</SelectItem>
                          <SelectItem value="view">عرض</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="outline" className="w-full mt-2 border-dashed border-slate-600">
                  <Plus className="w-3 h-3 ml-1" />
                  إضافة مستخدم
                </Button>
              </div>
              
              <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => { setShowPermissionsDialog(false); toast.success('تم حفظ الصلاحيات'); }}>
                حفظ التغييرات
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Commission Dialog */}
      <Dialog open={showCommissionDialog} onOpenChange={setShowCommissionDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">إضافة جهاز Matter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {commissionStep === 0 && (
              <>
                <div className="text-center p-6 border-2 border-dashed border-slate-700 rounded-xl">
                  <QrCode className="w-16 h-16 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">امسح رمز QR أو أدخل الرمز يدوياً</p>
                </div>
                <div>
                  <Label className="text-slate-300">رمز الإعداد (Setup Code)</Label>
                  <Input
                    value={setupCode}
                    onChange={(e) => setSetupCode(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white mt-1 text-center tracking-widest"
                    placeholder="XXXX-XXX-XXXX"
                  />
                </div>
                <Button className="w-full bg-pink-600 hover:bg-pink-700" onClick={startCommissioning}>
                  بدء التفعيل
                </Button>
              </>
            )}

            {commissionStep > 0 && (
              <div className="space-y-4">
                {[
                  { step: 1, label: 'البحث عن الجهاز', icon: Search },
                  { step: 2, label: 'إنشاء اتصال آمن', icon: Shield },
                  { step: 3, label: 'إضافة إلى Fabric', icon: Database },
                  { step: 4, label: 'اكتمال التفعيل', icon: Check },
                ].map((s) => (
                  <div key={s.step} className={`flex items-center gap-3 p-3 rounded-lg ${
                    commissionStep >= s.step ? 'bg-green-500/10' : 'bg-slate-800/50'
                  }`}>
                    <div className={`p-2 rounded-full ${
                      commissionStep > s.step ? 'bg-green-500' :
                      commissionStep === s.step ? 'bg-pink-500' : 'bg-slate-700'
                    }`}>
                      {commissionStep > s.step ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : commissionStep === s.step ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <s.icon className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <span className={commissionStep >= s.step ? 'text-white' : 'text-slate-500'}>{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}