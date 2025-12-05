import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, Camera, Server, Settings, Play, Pause, Maximize2, Grid,
  HardDrive, Wifi, WifiOff, AlertTriangle, Clock, Download, Search,
  Plus, Trash2, Edit, CheckCircle, XCircle, RefreshCw, Eye, Database,
  Shield, Lock, Unlock, Volume2, VolumeX, RotateCcw, FastForward, Rewind
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// VMS Systems Configuration
const vmsProviders = [
  { 
    id: 'milestone', 
    name: 'Milestone XProtect', 
    logo: '🎯',
    defaultPort: 80,
    protocol: 'HTTP/HTTPS',
    features: ['بث مباشر', 'تسجيل', 'كشف الحركة', 'التحليلات']
  },
  { 
    id: 'genetec', 
    name: 'Genetec Security Center', 
    logo: '🔷',
    defaultPort: 443,
    protocol: 'HTTPS',
    features: ['بث مباشر', 'تسجيل', 'LPR', 'التحكم بالوصول']
  },
  { 
    id: 'axis', 
    name: 'Axis Camera Station', 
    logo: '📹',
    defaultPort: 55752,
    protocol: 'HTTP',
    features: ['بث مباشر', 'تسجيل', 'تحليلات متقدمة']
  },
  { 
    id: 'hikvision', 
    name: 'Hikvision iVMS', 
    logo: '🔴',
    defaultPort: 8000,
    protocol: 'SDK',
    features: ['بث مباشر', 'تسجيل', 'AI', 'التعرف على الوجوه']
  },
  { 
    id: 'dahua', 
    name: 'Dahua DSS', 
    logo: '🟠',
    defaultPort: 37777,
    protocol: 'SDK',
    features: ['بث مباشر', 'تسجيل', 'ANPR', 'تحليلات']
  },
];

// Mock connected systems
const defaultConnectedSystems = [
  {
    id: 'sys-1',
    provider: 'milestone',
    name: 'خادم المقر الرئيسي',
    ip: '192.168.1.100',
    port: 80,
    status: 'connected',
    cameras: 24,
    recording: true,
    storage: { used: 2.4, total: 8 }
  },
  {
    id: 'sys-2',
    provider: 'hikvision',
    name: 'فرع الشمال',
    ip: '192.168.2.50',
    port: 8000,
    status: 'connected',
    cameras: 16,
    recording: true,
    storage: { used: 1.8, total: 4 }
  },
  {
    id: 'sys-3',
    provider: 'axis',
    name: 'المستودع',
    ip: '10.0.0.25',
    port: 55752,
    status: 'disconnected',
    cameras: 8,
    recording: false,
    storage: { used: 0.5, total: 2 }
  },
];

// Mock cameras from connected systems
const mockCameras = [
  { id: 'cam-1', name: 'البوابة الرئيسية', system: 'sys-1', status: 'online', recording: true, quality: '4K', ptz: true },
  { id: 'cam-2', name: 'موقف السيارات A', system: 'sys-1', status: 'online', recording: true, quality: '1080p', ptz: false },
  { id: 'cam-3', name: 'الردهة', system: 'sys-1', status: 'online', recording: true, quality: '1080p', ptz: true },
  { id: 'cam-4', name: 'غرفة الخوادم', system: 'sys-2', status: 'online', recording: true, quality: '720p', ptz: false },
  { id: 'cam-5', name: 'المخرج الخلفي', system: 'sys-2', status: 'offline', recording: false, quality: '1080p', ptz: false },
  { id: 'cam-6', name: 'منطقة التحميل', system: 'sys-3', status: 'offline', recording: false, quality: '1080p', ptz: true },
];

export default function VMSIntegration({ vehicles }) {
  const [connectedSystems, setConnectedSystems] = useState(defaultConnectedSystems);
  const [cameras, setCameras] = useState(mockCameras);
  const [showAddSystem, setShowAddSystem] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid, single, quad
  const [activeTab, setActiveTab] = useState('live');
  const [newSystem, setNewSystem] = useState({
    provider: '',
    name: '',
    ip: '',
    port: '',
    username: '',
    password: '',
  });

  // Camera settings state
  const [cameraSettings, setCameraSettings] = useState({
    motionDetection: true,
    motionSensitivity: 70,
    recordOnMotion: true,
    recordAlways: false,
    audioEnabled: false,
    nightVision: true,
    wdr: true,
    zones: [],
  });

  const handleAddSystem = () => {
    if (!newSystem.provider || !newSystem.ip) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const provider = vmsProviders.find(p => p.id === newSystem.provider);
    const system = {
      id: `sys-${Date.now()}`,
      ...newSystem,
      port: newSystem.port || provider?.defaultPort,
      status: 'connecting',
      cameras: 0,
      recording: false,
      storage: { used: 0, total: 0 }
    };

    setConnectedSystems([...connectedSystems, system]);
    setShowAddSystem(false);
    setNewSystem({ provider: '', name: '', ip: '', port: '', username: '', password: '' });

    // Simulate connection
    setTimeout(() => {
      setConnectedSystems(prev => prev.map(s => 
        s.id === system.id 
          ? { ...s, status: 'connected', cameras: Math.floor(Math.random() * 20) + 5 }
          : s
      ));
      toast.success(`تم الاتصال بـ ${system.name}`);
    }, 2000);
  };

  const handleTestConnection = (system) => {
    toast.info(`جاري اختبار الاتصال بـ ${system.name}...`);
    setTimeout(() => {
      toast.success('الاتصال ناجح!');
    }, 1500);
  };

  const handleDisconnect = (systemId) => {
    setConnectedSystems(prev => prev.map(s =>
      s.id === systemId ? { ...s, status: 'disconnected' } : s
    ));
    toast.info('تم قطع الاتصال');
  };

  const getProviderInfo = (providerId) => vmsProviders.find(p => p.id === providerId);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-500/20">
            <Video className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">تكامل أنظمة VMS/CMS</h2>
            <p className="text-slate-400 text-sm">Milestone • Genetec • Axis • Hikvision • Dahua</p>
          </div>
        </div>
        <Button onClick={() => setShowAddSystem(true)} className="bg-rose-600 hover:bg-rose-700">
          <Plus className="w-4 h-4 ml-2" />
          إضافة نظام VMS
        </Button>
      </div>

      {/* Connected Systems */}
      <div className="grid md:grid-cols-3 gap-4">
        {connectedSystems.map((system, i) => {
          const provider = getProviderInfo(system.provider);
          return (
            <motion.div
              key={system.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{provider?.logo}</span>
                      <div>
                        <CardTitle className="text-white text-sm">{system.name}</CardTitle>
                        <p className="text-slate-400 text-xs">{provider?.name}</p>
                      </div>
                    </div>
                    <Badge className={`${
                      system.status === 'connected' ? 'bg-green-500/20 text-green-400' :
                      system.status === 'connecting' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {system.status === 'connected' ? (
                        <><Wifi className="w-3 h-3 ml-1" /> متصل</>
                      ) : system.status === 'connecting' ? (
                        <><RefreshCw className="w-3 h-3 ml-1 animate-spin" /> جاري الاتصال</>
                      ) : (
                        <><WifiOff className="w-3 h-3 ml-1" /> غير متصل</>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-slate-800/50 rounded">
                      <p className="text-slate-400">IP</p>
                      <p className="text-white font-mono">{system.ip}:{system.port}</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded">
                      <p className="text-slate-400">الكاميرات</p>
                      <p className="text-white font-bold">{system.cameras}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">التخزين</span>
                      <span className="text-white">{system.storage.used} / {system.storage.total} TB</span>
                    </div>
                    <Progress value={(system.storage.used / system.storage.total) * 100} className="h-1.5" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={system.recording ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'}>
                      {system.recording ? '● تسجيل' : '○ متوقف'}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleTestConnection(system)}
                      >
                        <RefreshCw className="w-3 h-3 text-slate-400" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => setSelectedSystem(system)}
                      >
                        <Settings className="w-3 h-3 text-slate-400" />
                      </Button>
                      {system.status === 'connected' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => handleDisconnect(system.id)}
                        >
                          <XCircle className="w-3 h-3 text-red-400" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main VMS Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="live" className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-400">
            <Video className="w-4 h-4 ml-2" />
            البث المباشر
          </TabsTrigger>
          <TabsTrigger value="playback" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Clock className="w-4 h-4 ml-2" />
            التسجيلات
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Settings className="w-4 h-4 ml-2" />
            إعدادات الكاميرا
          </TabsTrigger>
        </TabsList>

        {/* Live View Tab */}
        <TabsContent value="live" className="space-y-4">
          {/* View Mode Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'quad' ? 'default' : 'ghost'}
                onClick={() => setViewMode('quad')}
              >
                2×2
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'single' ? 'default' : 'ghost'}
                onClick={() => setViewMode('single')}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="بحث عن كاميرا..."
                className="w-48 bg-slate-800/50 border-slate-700 text-white text-sm"
              />
            </div>
          </div>

          {/* Camera Grid */}
          <div className={`grid gap-3 ${
            viewMode === 'single' ? 'grid-cols-1' :
            viewMode === 'quad' ? 'grid-cols-2' :
            'grid-cols-2 lg:grid-cols-4'
          }`}>
            {cameras.slice(0, viewMode === 'single' ? 1 : viewMode === 'quad' ? 4 : cameras.length).map((camera, i) => (
              <motion.div
                key={camera.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={viewMode === 'single' ? 'aspect-video' : 'aspect-video'}
              >
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 h-full overflow-hidden">
                  <div className="relative h-full bg-slate-900 flex items-center justify-center">
                    {camera.status === 'online' ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Video className="w-12 h-12 text-slate-700" />
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <Badge className="bg-green-500/80 text-white text-[10px]">LIVE</Badge>
                          {camera.recording && (
                            <Badge className="bg-red-500/80 text-white text-[10px]">
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse ml-1" />
                              REC
                            </Badge>
                          )}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white text-xs font-medium">{camera.name}</p>
                              <p className="text-slate-400 text-[10px]">{camera.quality}</p>
                            </div>
                            <div className="flex gap-1">
                              {camera.ptz && (
                                <Button size="icon" variant="ghost" className="h-6 w-6">
                                  <RotateCcw className="w-3 h-3 text-white" />
                                </Button>
                              )}
                              <Button size="icon" variant="ghost" className="h-6 w-6">
                                <Maximize2 className="w-3 h-3 text-white" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <WifiOff className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">{camera.name}</p>
                        <p className="text-slate-600 text-xs">غير متصل</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Playback Tab */}
        <TabsContent value="playback" className="space-y-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <Select>
                  <SelectTrigger className="w-48 bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="اختر الكاميرا" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {cameras.map(cam => (
                      <SelectItem key={cam.id} value={cam.id}>{cam.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input type="date" className="w-40 bg-slate-800/50 border-slate-700 text-white" />
                <Input type="time" className="w-32 bg-slate-800/50 border-slate-700 text-white" />
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Search className="w-4 h-4 ml-2" />
                  بحث
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4">
              <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                <Video className="w-16 h-16 text-slate-700" />
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost">
                  <Rewind className="w-4 h-4" />
                </Button>
                <Button size="icon" className="bg-purple-600 hover:bg-purple-700">
                  <Play className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost">
                  <FastForward className="w-4 h-4" />
                </Button>
                <div className="flex-1 mx-4">
                  <Slider defaultValue={[0]} max={100} step={1} />
                </div>
                <span className="text-white text-sm">00:00 / 01:00:00</span>
                <Button size="sm" variant="outline" className="border-slate-600">
                  <Download className="w-4 h-4 ml-1" />
                  تحميل
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Camera Selection */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">اختر الكاميرا</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                {cameras.map(camera => (
                  <div
                    key={camera.id}
                    onClick={() => setSelectedCamera(camera)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedCamera?.id === camera.id 
                        ? 'bg-cyan-500/20 border border-cyan-500/50' 
                        : 'bg-slate-800/50 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Camera className={`w-4 h-4 ${camera.status === 'online' ? 'text-green-400' : 'text-slate-500'}`} />
                        <span className="text-white text-sm">{camera.name}</span>
                      </div>
                      <Badge className="text-[10px]">{camera.quality}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Camera Settings */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">
                  إعدادات {selectedCamera?.name || 'الكاميرا'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">كشف الحركة</Label>
                    <Switch
                      checked={cameraSettings.motionDetection}
                      onCheckedChange={(v) => setCameraSettings({ ...cameraSettings, motionDetection: v })}
                    />
                  </div>

                  {cameraSettings.motionDetection && (
                    <div>
                      <Label className="text-slate-300 text-sm">حساسية الكشف</Label>
                      <Slider
                        value={[cameraSettings.motionSensitivity]}
                        onValueChange={([v]) => setCameraSettings({ ...cameraSettings, motionSensitivity: v })}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                      <p className="text-slate-500 text-xs mt-1">{cameraSettings.motionSensitivity}%</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">التسجيل عند الحركة</Label>
                    <Switch
                      checked={cameraSettings.recordOnMotion}
                      onCheckedChange={(v) => setCameraSettings({ ...cameraSettings, recordOnMotion: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">التسجيل المستمر</Label>
                    <Switch
                      checked={cameraSettings.recordAlways}
                      onCheckedChange={(v) => setCameraSettings({ ...cameraSettings, recordAlways: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">الصوت</Label>
                    <Switch
                      checked={cameraSettings.audioEnabled}
                      onCheckedChange={(v) => setCameraSettings({ ...cameraSettings, audioEnabled: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">الرؤية الليلية التلقائية</Label>
                    <Switch
                      checked={cameraSettings.nightVision}
                      onCheckedChange={(v) => setCameraSettings({ ...cameraSettings, nightVision: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">WDR (النطاق الديناميكي الواسع)</Label>
                    <Switch
                      checked={cameraSettings.wdr}
                      onCheckedChange={(v) => setCameraSettings({ ...cameraSettings, wdr: v })}
                    />
                  </div>
                </div>

                <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={() => toast.success('تم حفظ الإعدادات')}>
                  <CheckCircle className="w-4 h-4 ml-2" />
                  حفظ الإعدادات
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add System Dialog */}
      <Dialog open={showAddSystem} onOpenChange={setShowAddSystem}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-white">إضافة نظام VMS جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">نوع النظام</Label>
              <Select value={newSystem.provider} onValueChange={(v) => {
                const provider = vmsProviders.find(p => p.id === v);
                setNewSystem({ ...newSystem, provider: v, port: provider?.defaultPort?.toString() || '' });
              }}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                  <SelectValue placeholder="اختر نظام VMS" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {vmsProviders.map(provider => (
                    <SelectItem key={provider.id} value={provider.id}>
                      <span className="flex items-center gap-2">
                        <span>{provider.logo}</span>
                        <span>{provider.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300">اسم النظام</Label>
              <Input
                value={newSystem.name}
                onChange={(e) => setNewSystem({ ...newSystem, name: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1"
                placeholder="مثال: خادم المقر الرئيسي"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300">عنوان IP</Label>
                <Input
                  value={newSystem.ip}
                  onChange={(e) => setNewSystem({ ...newSystem, ip: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                  placeholder="192.168.1.100"
                />
              </div>
              <div>
                <Label className="text-slate-300">المنفذ</Label>
                <Input
                  value={newSystem.port}
                  onChange={(e) => setNewSystem({ ...newSystem, port: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                  placeholder="80"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300">اسم المستخدم</Label>
              <Input
                value={newSystem.username}
                onChange={(e) => setNewSystem({ ...newSystem, username: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1"
                placeholder="admin"
              />
            </div>

            <div>
              <Label className="text-slate-300">كلمة المرور</Label>
              <Input
                type="password"
                value={newSystem.password}
                onChange={(e) => setNewSystem({ ...newSystem, password: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1"
                placeholder="••••••••"
              />
            </div>

            {newSystem.provider && (
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400 text-xs mb-2">الميزات المدعومة:</p>
                <div className="flex flex-wrap gap-1">
                  {vmsProviders.find(p => p.id === newSystem.provider)?.features.map((f, i) => (
                    <Badge key={i} className="bg-cyan-500/20 text-cyan-400 text-[10px]">{f}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-slate-600" onClick={() => setShowAddSystem(false)}>
                إلغاء
              </Button>
              <Button className="flex-1 bg-rose-600 hover:bg-rose-700" onClick={handleAddSystem}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة النظام
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}