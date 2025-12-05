import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Radio, Wifi, Satellite, Server, Database, Globe, Link, Unlink,
  Settings, Check, X, Loader2, RefreshCw, Shield, Zap, Activity,
  Monitor, Cpu, HardDrive, Signal, Router, Cloud, Lock, Key,
  AlertTriangle, ChevronRight, Play, Pause, Terminal, Code
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
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from '@/components/ui/accordion';
import { toast } from 'sonner';

// Fleet/Telematics Protocols
const fleetProtocols = [
  {
    id: 'jt808',
    name: 'JT/T 808',
    category: 'telematics',
    icon: Satellite,
    color: 'cyan',
    description: 'بروتوكول GPS القياسي الصيني للمركبات',
    port: 8808,
    features: ['تتبع GPS', 'تنبيهات', 'أوامر عن بُعد', 'تحميل الوسائط'],
    status: 'connected',
    stats: { devices: 45, messages: 12500, uptime: 99.8 }
  },
  {
    id: 'jt1078',
    name: 'JT/T 1078',
    category: 'video',
    icon: Monitor,
    color: 'purple',
    description: 'بروتوكول الفيديو للمركبات (MDVR)',
    port: 1078,
    features: ['بث مباشر', 'تسجيل فيديو', 'استرجاع التسجيلات', 'التحكم بالكاميرا'],
    status: 'connected',
    stats: { devices: 32, streams: 128, bandwidth: '450 Mbps' }
  },
  {
    id: 'gt06',
    name: 'GT06/Concox',
    category: 'telematics',
    icon: Signal,
    color: 'green',
    description: 'بروتوكول أجهزة التتبع الشائعة',
    port: 5023,
    features: ['تتبع GPS', 'حالة المحرك', 'تنبيهات SOS', 'Geofencing'],
    status: 'connected',
    stats: { devices: 78, messages: 8900, uptime: 99.5 }
  },
  {
    id: 'teltonika',
    name: 'Teltonika Codec',
    category: 'telematics',
    icon: Cpu,
    color: 'blue',
    description: 'بروتوكول أجهزة Teltonika',
    port: 5027,
    features: ['Codec 8/8E', 'CAN Bus', 'OBD II', 'BLE Sensors'],
    status: 'connected',
    stats: { devices: 156, messages: 45000, uptime: 99.9 }
  },
  {
    id: 'flespi',
    name: 'Flespi MQTT',
    category: 'gateway',
    icon: Cloud,
    color: 'amber',
    description: 'بوابة Flespi للتكامل السحابي',
    port: 8883,
    features: ['MQTT', 'REST API', 'Webhooks', 'تجميع البروتوكولات'],
    status: 'disconnected',
    stats: { devices: 0, messages: 0, uptime: 0 }
  },
  {
    id: 'wialon',
    name: 'Wialon IPS',
    category: 'platform',
    icon: Globe,
    color: 'red',
    description: 'بروتوكول منصة Wialon',
    port: 20332,
    features: ['تكامل Wialon', 'LBS', 'الرسائل النصية', 'الأوامر'],
    status: 'testing',
    stats: { devices: 12, messages: 890, uptime: 95.2 }
  },
  {
    id: 'mqtt',
    name: 'MQTT IoT',
    category: 'iot',
    icon: Router,
    color: 'pink',
    description: 'بروتوكول MQTT للحساسات وIoT',
    port: 1883,
    features: ['QoS 0/1/2', 'Retain', 'Will Messages', 'TLS'],
    status: 'connected',
    stats: { topics: 234, messages: 78000, clients: 89 }
  },
  {
    id: 'canbus',
    name: 'CAN Bus / J1939',
    category: 'vehicle',
    icon: Zap,
    color: 'orange',
    description: 'بروتوكول شبكة المركبات',
    port: null,
    features: ['OBD II', 'J1939', 'FMS', 'بيانات المحرك'],
    status: 'connected',
    stats: { vehicles: 45, parameters: 156, updates: '1/sec' }
  }
];

// Integration APIs
const integrationAPIs = [
  {
    id: 'rest_api',
    name: 'REST API',
    icon: Code,
    color: 'cyan',
    endpoints: 42,
    status: 'active',
    version: 'v2.1',
    auth: 'JWT + API Key'
  },
  {
    id: 'graphql',
    name: 'GraphQL',
    icon: Database,
    color: 'pink',
    endpoints: 1,
    status: 'active',
    version: 'v1.0',
    auth: 'JWT'
  },
  {
    id: 'websocket',
    name: 'WebSocket',
    icon: Activity,
    color: 'green',
    endpoints: 5,
    status: 'active',
    version: 'v1.2',
    auth: 'Token'
  },
  {
    id: 'webhook',
    name: 'Webhooks',
    icon: Link,
    color: 'amber',
    endpoints: 18,
    status: 'active',
    version: 'v1.0',
    auth: 'HMAC'
  }
];

// External Systems Integration
const externalSystems = [
  { id: 'soc', name: 'SOC Dashboard', icon: Shield, status: 'integrated', dataFlow: 'bidirectional' },
  { id: 'incidents', name: 'Incident Center', icon: AlertTriangle, status: 'integrated', dataFlow: 'push' },
  { id: 'cameras', name: 'Camera Health', icon: Monitor, status: 'integrated', dataFlow: 'pull' },
  { id: 'ai', name: 'AI Analytics', icon: Cpu, status: 'integrated', dataFlow: 'bidirectional' },
  { id: 'notifications', name: 'Notification Center', icon: Activity, status: 'integrated', dataFlow: 'push' },
  { id: 'smarthome', name: 'Smart Home', icon: Router, status: 'available', dataFlow: 'none' },
];

export default function ProtocolManager({ vehicles }) {
  const [activeTab, setActiveTab] = useState('protocols');
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [protocolStatus, setProtocolStatus] = useState(
    fleetProtocols.reduce((acc, p) => ({ ...acc, [p.id]: p.status }), {})
  );
  const [testingProtocol, setTestingProtocol] = useState(null);
  const [standaloneMode, setStandaloneMode] = useState(false);

  const connectProtocol = async (protocolId) => {
    setTestingProtocol(protocolId);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProtocolStatus(prev => ({ ...prev, [protocolId]: 'connected' }));
    setTestingProtocol(null);
    toast.success('تم الاتصال بنجاح');
  };

  const disconnectProtocol = (protocolId) => {
    setProtocolStatus(prev => ({ ...prev, [protocolId]: 'disconnected' }));
    toast.success('تم قطع الاتصال');
  };

  const testProtocol = async (protocolId) => {
    setTestingProtocol(protocolId);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTestingProtocol(null);
    toast.success('اختبار الاتصال ناجح');
  };

  const connectedProtocols = fleetProtocols.filter(p => protocolStatus[p.id] === 'connected');
  const totalDevices = connectedProtocols.reduce((sum, p) => sum + (p.stats.devices || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            مدير البروتوكولات والتكامل
          </h3>
          <p className="text-slate-400 text-sm">إدارة بروتوكولات الاتصال وواجهات API</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
            <span className="text-slate-400 text-sm">وضع مستقل</span>
            <Switch checked={standaloneMode} onCheckedChange={setStandaloneMode} />
          </div>
          <Badge className="bg-green-500/20 text-green-400">
            {connectedProtocols.length} متصل
          </Badge>
          <Badge className="bg-cyan-500/20 text-cyan-400">
            {totalDevices} جهاز
          </Badge>
        </div>
      </div>

      {/* Standalone Mode Notice */}
      {standaloneMode && (
        <Card className="glass-card border-amber-500/30 bg-amber-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-amber-200 font-medium">الوضع المستقل مُفعّل</p>
              <p className="text-amber-300/70 text-sm">الموديول يعمل بشكل منفصل عن باقي النظام. البيانات لن تُزامَن مع الموديولات الأخرى.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'البروتوكولات النشطة', value: connectedProtocols.length, icon: Radio, color: 'cyan' },
          { label: 'الأجهزة المتصلة', value: totalDevices, icon: Cpu, color: 'green' },
          { label: 'واجهات API', value: integrationAPIs.filter(a => a.status === 'active').length, icon: Code, color: 'purple' },
          { label: 'الأنظمة المتكاملة', value: externalSystems.filter(s => s.status === 'integrated').length, icon: Link, color: 'amber' },
        ].map((stat, i) => (
          <Card key={stat.label} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="protocols" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Radio className="w-4 h-4 ml-2" />
            البروتوكولات
          </TabsTrigger>
          <TabsTrigger value="api" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Code className="w-4 h-4 ml-2" />
            واجهات API
          </TabsTrigger>
          <TabsTrigger value="integration" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Link className="w-4 h-4 ml-2" />
            التكامل
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
            <Shield className="w-4 h-4 ml-2" />
            الأمان
          </TabsTrigger>
        </TabsList>

        {/* Protocols Tab */}
        <TabsContent value="protocols" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fleetProtocols.map((protocol, i) => {
              const status = protocolStatus[protocol.id];
              const Icon = protocol.icon;
              const isTesting = testingProtocol === protocol.id;
              
              return (
                <motion.div
                  key={protocol.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 ${
                    status === 'connected' ? 'ring-1 ring-green-500/30' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-${protocol.color}-500/20`}>
                            <Icon className={`w-5 h-5 text-${protocol.color}-400`} />
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{protocol.name}</h4>
                            <p className="text-slate-500 text-xs">{protocol.category}</p>
                          </div>
                        </div>
                        <Badge className={`text-xs ${
                          status === 'connected' ? 'bg-green-500/20 text-green-400' :
                          status === 'testing' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {status === 'connected' ? 'متصل' : status === 'testing' ? 'اختبار' : 'غير متصل'}
                        </Badge>
                      </div>

                      <p className="text-slate-400 text-xs mb-3">{protocol.description}</p>

                      {protocol.port && (
                        <div className="flex items-center gap-2 mb-3 text-xs">
                          <span className="text-slate-500">المنفذ:</span>
                          <code className="px-2 py-0.5 bg-slate-800 rounded text-cyan-400">{protocol.port}</code>
                        </div>
                      )}

                      {status === 'connected' && protocol.stats && (
                        <div className="grid grid-cols-3 gap-2 mb-3 p-2 bg-slate-800/50 rounded-lg">
                          {Object.entries(protocol.stats).slice(0, 3).map(([key, value]) => (
                            <div key={key} className="text-center">
                              <p className="text-white text-sm font-medium">{value}</p>
                              <p className="text-slate-500 text-[10px]">{key}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        {status === 'connected' ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-slate-600"
                              onClick={() => testProtocol(protocol.id)}
                              disabled={isTesting}
                            >
                              {isTesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-slate-600"
                              onClick={() => { setSelectedProtocol(protocol); setShowConfig(true); }}
                            >
                              <Settings className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500/50 text-red-400"
                              onClick={() => disconnectProtocol(protocol.id)}
                            >
                              <Unlink className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full bg-cyan-600 hover:bg-cyan-700"
                            onClick={() => connectProtocol(protocol.id)}
                            disabled={isTesting}
                          >
                            {isTesting ? <Loader2 className="w-3 h-3 ml-1 animate-spin" /> : <Link className="w-3 h-3 ml-1" />}
                            اتصال
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

        {/* API Tab */}
        <TabsContent value="api" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {integrationAPIs.map((api, i) => {
              const Icon = api.icon;
              return (
                <Card key={api.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${api.color}-500/20`}>
                          <Icon className={`w-5 h-5 text-${api.color}-400`} />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{api.name}</h4>
                          <p className="text-slate-500 text-xs">{api.version}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400">{api.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-2 bg-slate-800/50 rounded">
                        <span className="text-slate-400">Endpoints:</span>
                        <span className="text-white mr-2">{api.endpoints}</span>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded">
                        <span className="text-slate-400">Auth:</span>
                        <span className="text-white mr-2">{api.auth}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3 border-slate-600">
                      <Terminal className="w-3 h-3 ml-1" />
                      عرض التوثيق
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* API Endpoints Sample */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">نماذج Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-xs">
                {[
                  { method: 'GET', path: '/api/v2/vehicles', desc: 'قائمة المركبات' },
                  { method: 'GET', path: '/api/v2/vehicles/:id/location', desc: 'موقع مركبة' },
                  { method: 'POST', path: '/api/v2/vehicles/:id/command', desc: 'إرسال أمر' },
                  { method: 'GET', path: '/api/v2/alerts', desc: 'التنبيهات' },
                  { method: 'WS', path: '/ws/v1/tracking', desc: 'تتبع مباشر' },
                ].map((endpoint, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-slate-800/50 rounded">
                    <Badge className={`text-[10px] ${
                      endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                      endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>{endpoint.method}</Badge>
                    <code className="text-cyan-400 flex-1">{endpoint.path}</code>
                    <span className="text-slate-500">{endpoint.desc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Tab */}
        <TabsContent value="integration" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center justify-between">
                <span>التكامل مع موديولات النظام</span>
                {!standaloneMode && <Badge className="bg-green-500/20 text-green-400">متكامل</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {externalSystems.map((system, i) => {
                  const Icon = system.icon;
                  const isIntegrated = system.status === 'integrated' && !standaloneMode;
                  
                  return (
                    <div key={system.id} className={`flex items-center justify-between p-3 rounded-lg ${
                      isIntegrated ? 'bg-green-500/10 border border-green-500/30' : 'bg-slate-800/50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isIntegrated ? 'text-green-400' : 'text-slate-500'}`} />
                        <div>
                          <p className="text-white font-medium">{system.name}</p>
                          <p className="text-slate-500 text-xs">
                            تدفق البيانات: {
                              system.dataFlow === 'bidirectional' ? 'ثنائي الاتجاه' :
                              system.dataFlow === 'push' ? 'إرسال' :
                              system.dataFlow === 'pull' ? 'استقبال' : 'لا يوجد'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isIntegrated ? (
                          <>
                            <Badge className="bg-green-500/20 text-green-400 text-xs">متكامل</Badge>
                            <Button size="sm" variant="ghost" className="text-slate-400">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline" className="border-slate-600" disabled={standaloneMode}>
                            <Link className="w-3 h-3 ml-1" />
                            ربط
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Data Flow Diagram */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">تدفق البيانات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-4 py-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-2">
                    <Satellite className="w-8 h-8 text-cyan-400" />
                  </div>
                  <p className="text-white text-sm">GPS/MDVR</p>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-500" />
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center mb-2">
                    <Server className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-white text-sm">Fleet Module</p>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-500" />
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-amber-500/20 flex items-center justify-center mb-2">
                    <Database className="w-8 h-8 text-amber-400" />
                  </div>
                  <p className="text-white text-sm">Core System</p>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-500" />
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-green-500/20 flex items-center justify-center mb-2">
                    <Globe className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-white text-sm">Dashboard</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-red-400" />
                  التشفير
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'TLS 1.3', status: 'enabled', desc: 'اتصالات مشفرة' },
                  { name: 'AES-256', status: 'enabled', desc: 'تشفير البيانات' },
                  { name: 'HMAC-SHA256', status: 'enabled', desc: 'توقيع الرسائل' },
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

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  المصادقة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'JWT Tokens', status: 'active', desc: 'API Authentication' },
                  { name: 'Device Certificates', status: 'active', desc: 'mTLS للأجهزة' },
                  { name: 'API Keys', status: 'active', desc: 'Third-party access' },
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
          </div>
        </TabsContent>
      </Tabs>

      {/* Protocol Config Dialog */}
      <Dialog open={showConfig} onOpenChange={setShowConfig}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">إعدادات {selectedProtocol?.name}</DialogTitle>
          </DialogHeader>
          {selectedProtocol && (
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-slate-300">عنوان الخادم</Label>
                <Input defaultValue="0.0.0.0" className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
              <div>
                <Label className="text-slate-300">المنفذ</Label>
                <Input defaultValue={selectedProtocol.port} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-white">تفعيل TLS</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-white">تسجيل الرسائل</span>
                <Switch />
              </div>
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                <Check className="w-4 h-4 ml-2" />
                حفظ الإعدادات
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}