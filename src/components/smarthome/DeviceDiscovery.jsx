import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi, Bluetooth, Radio, Search, Plus, QrCode, Settings, Check, X,
  Loader2, Signal, RefreshCw, Smartphone, Router, Zap, Eye, Link,
  AlertTriangle, ChevronRight, Globe, Server, Cpu, Home
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

const networkProtocols = [
  { id: 'wifi', name: 'Wi-Fi', icon: Wifi, color: 'cyan', description: 'اكتشاف عبر الشبكة المحلية' },
  { id: 'bluetooth', name: 'Bluetooth', icon: Bluetooth, color: 'blue', description: 'أجهزة BLE القريبة' },
  { id: 'zigbee', name: 'Zigbee', icon: Radio, color: 'green', description: 'عبر وحدة التحكم Zigbee' },
  { id: 'zwave', name: 'Z-Wave', icon: Signal, color: 'purple', description: 'عبر وحدة التحكم Z-Wave' },
  { id: 'matter', name: 'Matter', icon: Globe, color: 'amber', description: 'البروتوكول الموحد الجديد' },
  { id: 'thread', name: 'Thread', icon: Server, color: 'rose', description: 'شبكة Thread mesh' },
];

const mockDiscoveredDevices = [
  { id: 'd1', name: 'Philips Hue Bridge', type: 'bridge', protocol: 'wifi', ip: '192.168.1.45', mac: 'AA:BB:CC:DD:EE:01', signal: 95, status: 'new' },
  { id: 'd2', name: 'Smart Thermostat', type: 'thermostat', protocol: 'zigbee', signal: 78, status: 'new' },
  { id: 'd3', name: 'Motion Sensor', type: 'sensor', protocol: 'zwave', signal: 82, status: 'new' },
  { id: 'd4', name: 'Smart Lock Pro', type: 'lock', protocol: 'bluetooth', signal: 90, status: 'new' },
  { id: 'd5', name: 'Eve Energy', type: 'plug', protocol: 'thread', signal: 88, status: 'new' },
  { id: 'd6', name: 'Nanoleaf Shapes', type: 'light', protocol: 'matter', signal: 85, status: 'new' },
];

const deviceTypeIcons = {
  bridge: Router,
  thermostat: Zap,
  sensor: Eye,
  lock: Home,
  plug: Zap,
  light: Zap,
  camera: Eye,
  speaker: Smartphone,
};

export default function DeviceDiscovery({ onDeviceAdded }) {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [activeProtocols, setActiveProtocols] = useState(['wifi', 'bluetooth']);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [manualDevice, setManualDevice] = useState({
    name: '', ip: '', mac: '', protocol: 'wifi', type: 'light'
  });
  const [configuringDevice, setConfiguringDevice] = useState(null);
  const [hubStatus, setHubStatus] = useState({
    zigbee: { connected: true, devices: 12 },
    zwave: { connected: false, devices: 0 },
    thread: { connected: true, devices: 5 },
  });

  const startScan = () => {
    setScanning(true);
    setScanProgress(0);
    setDiscoveredDevices([]);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanning(false);
          // Simulate discovered devices
          const filtered = mockDiscoveredDevices.filter(d => activeProtocols.includes(d.protocol));
          setDiscoveredDevices(filtered);
          toast.success(`تم اكتشاف ${filtered.length} أجهزة جديدة`);
          return 100;
        }
        // Add devices progressively
        if (prev === 30 || prev === 50 || prev === 70 || prev === 85) {
          const filtered = mockDiscoveredDevices.filter(d => activeProtocols.includes(d.protocol));
          const count = Math.floor((prev / 100) * filtered.length) + 1;
          setDiscoveredDevices(filtered.slice(0, count));
        }
        return prev + 2;
      });
    }, 100);
  };

  const toggleProtocol = (protocolId) => {
    setActiveProtocols(prev => 
      prev.includes(protocolId) 
        ? prev.filter(p => p !== protocolId)
        : [...prev, protocolId]
    );
  };

  const addDevice = (device) => {
    toast.success(`تمت إضافة ${device.name} بنجاح`);
    setDiscoveredDevices(prev => prev.filter(d => d.id !== device.id));
    if (onDeviceAdded) onDeviceAdded(device);
  };

  const addManualDevice = () => {
    if (!manualDevice.name) {
      toast.error('يرجى إدخال اسم الجهاز');
      return;
    }
    const device = {
      id: `manual-${Date.now()}`,
      ...manualDevice,
      signal: 100,
      status: 'configured'
    };
    toast.success(`تمت إضافة ${device.name} يدوياً`);
    if (onDeviceAdded) onDeviceAdded(device);
    setShowManualAdd(false);
    setManualDevice({ name: '', ip: '', mac: '', protocol: 'wifi', type: 'light' });
  };

  const simulateQRScan = () => {
    setShowQRScanner(false);
    toast.success('تم مسح الباركود - جاري إضافة الجهاز...');
    setTimeout(() => {
      const device = {
        id: `qr-${Date.now()}`,
        name: 'Smart Device (QR)',
        type: 'light',
        protocol: 'wifi',
        signal: 100,
        status: 'configured'
      };
      if (onDeviceAdded) onDeviceAdded(device);
      toast.success('تمت إضافة الجهاز بنجاح');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Search className="w-5 h-5 text-cyan-400" />
            اكتشاف الأجهزة
          </h3>
          <p className="text-slate-400 text-sm">اكتشف وأضف أجهزة ذكية جديدة إلى منزلك</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-600" onClick={() => setShowQRScanner(true)}>
            <QrCode className="w-4 h-4 ml-2" />
            مسح QR
          </Button>
          <Button variant="outline" className="border-slate-600" onClick={() => setShowManualAdd(true)}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة يدوية
          </Button>
          <Button 
            className="bg-cyan-600 hover:bg-cyan-700"
            onClick={startScan}
            disabled={scanning || activeProtocols.length === 0}
          >
            {scanning ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Search className="w-4 h-4 ml-2" />
            )}
            {scanning ? 'جاري البحث...' : 'بدء البحث'}
          </Button>
        </div>
      </div>

      {/* Protocol Selection */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm">بروتوكولات الاتصال</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {networkProtocols.map(protocol => {
              const Icon = protocol.icon;
              const isActive = activeProtocols.includes(protocol.id);
              const hub = hubStatus[protocol.id];
              
              return (
                <button
                  key={protocol.id}
                  onClick={() => toggleProtocol(protocol.id)}
                  className={`p-4 rounded-xl border transition-all text-center ${
                    isActive 
                      ? `bg-${protocol.color}-500/20 border-${protocol.color}-500/50` 
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${isActive ? `text-${protocol.color}-400` : 'text-slate-500'}`} />
                  <p className={`font-medium text-sm ${isActive ? 'text-white' : 'text-slate-400'}`}>{protocol.name}</p>
                  <p className="text-slate-500 text-xs mt-1">{protocol.description}</p>
                  {hub && (
                    <Badge className={`mt-2 text-[10px] ${hub.connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {hub.connected ? `${hub.devices} جهاز` : 'غير متصل'}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Scanning Progress */}
      {scanning && (
        <Card className="glass-card border-cyan-500/30 bg-[#0f1629]/80">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-cyan-500/30 flex items-center justify-center">
                  <Wifi className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">جاري البحث عن الأجهزة...</p>
                <p className="text-slate-400 text-sm">البحث عبر: {activeProtocols.map(p => networkProtocols.find(np => np.id === p)?.name).join('، ')}</p>
                <Progress value={scanProgress} className="h-2 mt-2" />
              </div>
              <p className="text-cyan-400 font-bold text-2xl">{scanProgress}%</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discovered Devices */}
      {discoveredDevices.length > 0 && (
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center justify-between">
              <span>الأجهزة المكتشفة ({discoveredDevices.length})</span>
              <Button variant="ghost" size="sm" className="text-cyan-400" onClick={startScan}>
                <RefreshCw className="w-4 h-4 ml-1" />
                إعادة البحث
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence>
                {discoveredDevices.map((device, i) => {
                  const protocol = networkProtocols.find(p => p.id === device.protocol);
                  const ProtocolIcon = protocol?.icon || Wifi;
                  const DeviceIcon = deviceTypeIcons[device.type] || Zap;
                  
                  return (
                    <motion.div
                      key={device.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-${protocol?.color || 'cyan'}-500/20`}>
                          <DeviceIcon className={`w-6 h-6 text-${protocol?.color || 'cyan'}-400`} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{device.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge className={`bg-${protocol?.color || 'cyan'}-500/20 text-${protocol?.color || 'cyan'}-400 text-xs`}>
                              <ProtocolIcon className="w-3 h-3 ml-1" />
                              {protocol?.name}
                            </Badge>
                            {device.ip && (
                              <span className="text-slate-500 text-xs">{device.ip}</span>
                            )}
                            <div className="flex items-center gap-1 text-slate-400 text-xs">
                              <Signal className="w-3 h-3" />
                              {device.signal}%
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400"
                          onClick={() => setConfiguringDevice(device)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => addDevice(device)}
                        >
                          <Plus className="w-4 h-4 ml-1" />
                          إضافة
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hub Controllers Status */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader>
          <CardTitle className="text-white text-sm">وحدات التحكم (Hubs)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(hubStatus).map(([protocol, status]) => {
              const protocolInfo = networkProtocols.find(p => p.id === protocol);
              const Icon = protocolInfo?.icon || Radio;
              
              return (
                <div key={protocol} className={`p-4 rounded-xl border ${status.connected ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${status.connected ? 'text-green-400' : 'text-slate-500'}`} />
                      <span className="text-white font-medium">{protocolInfo?.name} Hub</span>
                    </div>
                    <Badge className={status.connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {status.connected ? 'متصل' : 'غير متصل'}
                    </Badge>
                  </div>
                  {status.connected ? (
                    <p className="text-slate-400 text-sm">{status.devices} جهاز مرتبط</p>
                  ) : (
                    <Button size="sm" variant="outline" className="w-full border-slate-600 mt-2">
                      <Link className="w-4 h-4 ml-1" />
                      ربط وحدة التحكم
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Manual Add Dialog */}
      <Dialog open={showManualAdd} onOpenChange={setShowManualAdd}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">إضافة جهاز يدوياً</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">اسم الجهاز</Label>
              <Input
                value={manualDevice.name}
                onChange={(e) => setManualDevice({ ...manualDevice, name: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="مثال: مصباح غرفة النوم"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">البروتوكول</Label>
                <Select value={manualDevice.protocol} onValueChange={(v) => setManualDevice({ ...manualDevice, protocol: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {networkProtocols.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">نوع الجهاز</Label>
                <Select value={manualDevice.type} onValueChange={(v) => setManualDevice({ ...manualDevice, type: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="light">إضاءة</SelectItem>
                    <SelectItem value="thermostat">منظم حرارة</SelectItem>
                    <SelectItem value="sensor">مستشعر</SelectItem>
                    <SelectItem value="lock">قفل</SelectItem>
                    <SelectItem value="camera">كاميرا</SelectItem>
                    <SelectItem value="plug">مقبس ذكي</SelectItem>
                    <SelectItem value="speaker">مكبر صوت</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-slate-300">عنوان IP (اختياري)</Label>
              <Input
                value={manualDevice.ip}
                onChange={(e) => setManualDevice({ ...manualDevice, ip: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="192.168.1.100"
              />
            </div>
            <div>
              <Label className="text-slate-300">عنوان MAC (اختياري)</Label>
              <Input
                value={manualDevice.mac}
                onChange={(e) => setManualDevice({ ...manualDevice, mac: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="AA:BB:CC:DD:EE:FF"
              />
            </div>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={addManualDevice}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة الجهاز
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Scanner Dialog */}
      <Dialog open={showQRScanner} onOpenChange={setShowQRScanner}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">مسح رمز QR</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="aspect-square bg-slate-900 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-700">
              <div className="text-center">
                <QrCode className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">وجّه الكاميرا نحو رمز QR الموجود على الجهاز</p>
              </div>
            </div>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={simulateQRScan}>
              محاكاة مسح QR
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Device Configuration Dialog */}
      <Dialog open={!!configuringDevice} onOpenChange={() => setConfiguringDevice(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">تكوين الجهاز</DialogTitle>
          </DialogHeader>
          {configuringDevice && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <p className="text-white font-medium">{configuringDevice.name}</p>
                <p className="text-slate-400 text-sm mt-1">
                  {networkProtocols.find(p => p.id === configuringDevice.protocol)?.name} • 
                  قوة الإشارة: {configuringDevice.signal}%
                </p>
              </div>
              <div>
                <Label className="text-slate-300">الغرفة</Label>
                <Select>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                    <SelectValue placeholder="اختر الغرفة" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="living">غرفة المعيشة</SelectItem>
                    <SelectItem value="bedroom">غرفة النوم</SelectItem>
                    <SelectItem value="kitchen">المطبخ</SelectItem>
                    <SelectItem value="bathroom">الحمام</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-white">تفعيل الإشعارات</span>
                <Switch />
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => {
                addDevice(configuringDevice);
                setConfiguringDevice(null);
              }}>
                <Check className="w-4 h-4 ml-2" />
                حفظ وإضافة
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}