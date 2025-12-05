import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Camera, Radio, Wifi, Signal, Globe, RefreshCw, Download,
  Upload, Check, AlertTriangle, Zap, Monitor, Server, Lock, Key,
  Eye, EyeOff, Save, RotateCcw, Play, Pause, Terminal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// البروتوكولات المدعومة
const protocols = [
  { id: 'gprs', name: 'GPRS', description: 'General Packet Radio Service', icon: Signal },
  { id: 'sms', name: 'SMS', description: 'رسائل قصيرة للتحكم', icon: Radio },
  { id: 'ota', name: 'OTA', description: 'Over-The-Air Updates', icon: Download },
  { id: 'mqtt', name: 'MQTT', description: 'Message Queuing Telemetry Transport', icon: Server },
  { id: 'coap', name: 'CoAP', description: 'Constrained Application Protocol', icon: Globe },
  { id: 'lorawan', name: 'LoRaWAN', description: 'Long Range Wide Area Network', icon: Wifi },
  { id: 'rtsp', name: 'RTSP', description: 'Real Time Streaming Protocol', icon: Camera },
  { id: 'onvif', name: 'ONVIF', description: 'Open Network Video Interface', icon: Monitor },
];

// الأجهزة المتصلة
const connectedDevices = [
  { id: 1, name: 'كاميرا البوابة الرئيسية', type: 'camera', protocol: 'rtsp', ip: '192.168.1.101', status: 'online', firmware: 'v2.4.1', lastUpdate: '2024-12-01' },
  { id: 2, name: 'حساس الحركة - المستودع', type: 'sensor', protocol: 'mqtt', ip: '192.168.1.102', status: 'online', firmware: 'v1.2.0', lastUpdate: '2024-11-15' },
  { id: 3, name: 'تتبع مركبة #12', type: 'tracker', protocol: 'gprs', ip: '-', status: 'online', firmware: 'v3.1.0', lastUpdate: '2024-12-03' },
  { id: 4, name: 'باب ذكي - المدخل', type: 'lock', protocol: 'mqtt', ip: '192.168.1.103', status: 'offline', firmware: 'v1.0.5', lastUpdate: '2024-10-20' },
  { id: 5, name: 'كاميرا PTZ - الموقف', type: 'camera', protocol: 'onvif', ip: '192.168.1.104', status: 'online', firmware: 'v4.0.2', lastUpdate: '2024-11-28' },
];

// قوالب الإعدادات
const configTemplates = [
  { id: 1, name: 'كاميرا HD قياسية', type: 'camera', settings: { resolution: '1080p', fps: 30, codec: 'H.264' } },
  { id: 2, name: 'كاميرا 4K عالية الدقة', type: 'camera', settings: { resolution: '4K', fps: 25, codec: 'H.265' } },
  { id: 3, name: 'تتبع GPS أساسي', type: 'tracker', settings: { interval: 30, mode: 'standard' } },
  { id: 4, name: 'تتبع GPS مكثف', type: 'tracker', settings: { interval: 5, mode: 'intensive' } },
];

export default function DeviceConfiguration() {
  const [activeTab, setActiveTab] = useState('devices');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showOTADialog, setShowOTADialog] = useState(false);

  // إعدادات الكاميرا
  const [cameraConfig, setCameraConfig] = useState({
    streamUrl: 'rtsp://192.168.1.101:554/stream1',
    username: 'admin',
    password: '',
    resolution: '1080p',
    fps: 30,
    codec: 'H.264',
    ptz: true,
    audio: true,
    nightVision: true,
  });

  const saveConfig = () => {
    toast.success('تم حفظ الإعدادات بنجاح');
    setShowConfigDialog(false);
  };

  const sendOTA = (device) => {
    toast.success(`جاري إرسال التحديث إلى ${device.name}...`);
    setShowOTADialog(false);
  };

  const sendSMSCommand = (device, command) => {
    toast.success(`تم إرسال أمر SMS: ${command}`);
  };

  const openCameraWeb = (device) => {
    window.open(`http://${device.ip}`, '_blank');
    toast.info('جاري فتح واجهة الكاميرا...');
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Settings className="w-8 h-8 text-cyan-400" />
              إعدادات الأجهزة والبروتوكولات
            </h1>
            <p className="text-slate-400 mt-1">GPRS, SMS, OTA, RTSP, ONVIF, MQTT, CoAP, LoRaWAN</p>
          </div>
        </div>
      </motion.div>

      {/* Supported Protocols */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">البروتوكولات المدعومة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {protocols.map(proto => {
              const Icon = proto.icon;
              return (
                <div key={proto.id} className="p-3 bg-slate-800/30 rounded-lg text-center hover:bg-slate-800/50 transition-all cursor-pointer">
                  <Icon className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <p className="text-white font-medium text-sm">{proto.name}</p>
                  <p className="text-slate-500 text-[10px]">{proto.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap">
          <TabsTrigger value="devices" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Monitor className="w-4 h-4 ml-1" />
            الأجهزة
          </TabsTrigger>
          <TabsTrigger value="camera" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Camera className="w-4 h-4 ml-1" />
            إعدادات الكاميرا
          </TabsTrigger>
          <TabsTrigger value="ota" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Download className="w-4 h-4 ml-1" />
            OTA Updates
          </TabsTrigger>
          <TabsTrigger value="sms" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Radio className="w-4 h-4 ml-1" />
            أوامر SMS
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <Settings className="w-4 h-4 ml-1" />
            القوالب
          </TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4 mt-4">
          <div className="space-y-3">
            {connectedDevices.map(device => (
              <Card key={device.id} className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 ${device.status === 'offline' ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${device.status === 'online' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {device.type === 'camera' ? <Camera className={`w-6 h-6 ${device.status === 'online' ? 'text-green-400' : 'text-red-400'}`} /> :
                         device.type === 'sensor' ? <Radio className={`w-6 h-6 ${device.status === 'online' ? 'text-green-400' : 'text-red-400'}`} /> :
                         device.type === 'tracker' ? <Signal className={`w-6 h-6 ${device.status === 'online' ? 'text-green-400' : 'text-red-400'}`} /> :
                         <Lock className={`w-6 h-6 ${device.status === 'online' ? 'text-green-400' : 'text-red-400'}`} />}
                      </div>
                      <div>
                        <p className="text-white font-bold">{device.name}</p>
                        <div className="flex items-center gap-3 text-slate-400 text-sm">
                          <span>IP: {device.ip}</span>
                          <Badge className="bg-cyan-500/20 text-cyan-400">{device.protocol.toUpperCase()}</Badge>
                          <span>Firmware: {device.firmware}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={device.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {device.status === 'online' ? 'متصل' : 'غير متصل'}
                      </Badge>
                      {device.type === 'camera' && device.status === 'online' && (
                        <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-400" onClick={() => openCameraWeb(device)}>
                          <Globe className="w-3 h-3 ml-1" />
                          فتح Web
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="border-slate-600" onClick={() => { setSelectedDevice(device); setShowConfigDialog(true); }}>
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="camera" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">إعدادات البث المباشر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">رابط البث (RTSP/ONVIF)</Label>
                  <Input
                    value={cameraConfig.streamUrl}
                    onChange={(e) => setCameraConfig({...cameraConfig, streamUrl: e.target.value})}
                    className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    dir="ltr"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-slate-300">اسم المستخدم</Label>
                    <Input
                      value={cameraConfig.username}
                      onChange={(e) => setCameraConfig({...cameraConfig, username: e.target.value})}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">كلمة المرور</Label>
                    <Input
                      type="password"
                      value={cameraConfig.password}
                      onChange={(e) => setCameraConfig({...cameraConfig, password: e.target.value})}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-slate-300">الدقة</Label>
                  <Select value={cameraConfig.resolution} onValueChange={(v) => setCameraConfig({...cameraConfig, resolution: v})}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="720p">720p HD</SelectItem>
                      <SelectItem value="1080p">1080p Full HD</SelectItem>
                      <SelectItem value="4K">4K Ultra HD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">معدل الإطارات (FPS)</Label>
                  <Select value={String(cameraConfig.fps)} onValueChange={(v) => setCameraConfig({...cameraConfig, fps: Number(v)})}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="15">15 FPS</SelectItem>
                      <SelectItem value="25">25 FPS</SelectItem>
                      <SelectItem value="30">30 FPS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">ترميز الفيديو</Label>
                  <Select value={cameraConfig.codec} onValueChange={(v) => setCameraConfig({...cameraConfig, codec: v})}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="H.264">H.264</SelectItem>
                      <SelectItem value="H.265">H.265 (HEVC)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                  <Label className="text-white">PTZ Control</Label>
                  <Switch checked={cameraConfig.ptz} onCheckedChange={(v) => setCameraConfig({...cameraConfig, ptz: v})} />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                  <Label className="text-white">صوت</Label>
                  <Switch checked={cameraConfig.audio} onCheckedChange={(v) => setCameraConfig({...cameraConfig, audio: v})} />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                  <Label className="text-white">رؤية ليلية</Label>
                  <Switch checked={cameraConfig.nightVision} onCheckedChange={(v) => setCameraConfig({...cameraConfig, nightVision: v})} />
                </div>
              </div>

              <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={saveConfig}>
                <Save className="w-4 h-4 ml-2" />
                حفظ الإعدادات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ota" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Download className="w-4 h-4 text-green-400" />
                تحديثات OTA (Over-The-Air)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {connectedDevices.filter(d => d.status === 'online').map(device => (
                  <div key={device.id} className="p-4 bg-slate-800/30 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{device.name}</p>
                      <p className="text-slate-400 text-sm">الإصدار الحالي: {device.firmware}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/20 text-green-400">تحديث متاح: v{device.firmware.replace('v', '').split('.')[0]}.{parseInt(device.firmware.split('.')[1]) + 1}.0</Badge>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => sendOTA(device)}>
                        <Download className="w-3 h-3 ml-1" />
                        تحديث
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400" />
                أوامر SMS للتحكم عن بعد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {connectedDevices.filter(d => d.protocol === 'gprs').map(device => (
                  <div key={device.id} className="p-4 bg-slate-800/30 rounded-lg">
                    <p className="text-white font-medium mb-3">{device.name}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" className="border-green-500/50 text-green-400" onClick={() => sendSMSCommand(device, 'STATUS')}>
                        حالة الجهاز
                      </Button>
                      <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-400" onClick={() => sendSMSCommand(device, 'LOCATION')}>
                        الموقع
                      </Button>
                      <Button size="sm" variant="outline" className="border-amber-500/50 text-amber-400" onClick={() => sendSMSCommand(device, 'RESTART')}>
                        إعادة تشغيل
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-500/50 text-red-400" onClick={() => sendSMSCommand(device, 'SHUTDOWN')}>
                        إيقاف
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {configTemplates.map(template => (
              <Card key={template.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-bold">{template.name}</h3>
                    <Badge className="bg-cyan-500/20 text-cyan-400">{template.type}</Badge>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded font-mono text-xs text-slate-300 mb-3">
                    {JSON.stringify(template.settings, null, 2)}
                  </div>
                  <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                    تطبيق القالب
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Config Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              إعدادات الجهاز
            </DialogTitle>
          </DialogHeader>
          {selectedDevice && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-white font-medium">{selectedDevice.name}</p>
                <p className="text-slate-400 text-sm">Protocol: {selectedDevice.protocol.toUpperCase()}</p>
              </div>
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={saveConfig}>
                <Save className="w-4 h-4 ml-2" />
                حفظ
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}