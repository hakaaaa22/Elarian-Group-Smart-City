import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Cloud, CloudSun, Wind, Droplets, Building2, Download, Upload, FileJson,
  FileSpreadsheet, Check, X, Loader2, RefreshCw, Settings, Link, Unlink,
  Activity, TrendingUp, Thermometer, Sun, AlertTriangle, Zap, Database,
  Smartphone, Home, Globe, Key, User, Lock, ExternalLink, Wifi, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Smart Home Platforms
const smartHomePlatforms = [
  {
    id: 'tuya',
    name: 'Tuya Smart',
    logo: '🏠',
    color: 'orange',
    status: 'disconnected',
    description: 'ربط مع أجهزة Tuya الذكية باستخدام حسابك',
    features: ['إضاءة', 'مكيفات', 'أقفال', 'كاميرات', 'مستشعرات'],
    authType: 'oauth',
    regions: ['الصين', 'أوروبا', 'أمريكا', 'الهند']
  },
  {
    id: 'smartthings',
    name: 'Samsung SmartThings',
    logo: '📱',
    color: 'blue',
    status: 'disconnected',
    description: 'ربط مع أجهزة Samsung SmartThings',
    features: ['Samsung', 'Zigbee', 'Z-Wave', 'WiFi'],
    authType: 'oauth'
  },
  {
    id: 'homeassistant',
    name: 'Home Assistant',
    logo: '🏡',
    color: 'cyan',
    status: 'disconnected',
    description: 'ربط مع سيرفر Home Assistant المحلي',
    features: ['تكامل شامل', 'أتمتة متقدمة', 'مفتوح المصدر'],
    authType: 'token'
  },
  {
    id: 'googlehome',
    name: 'Google Home',
    logo: '🔊',
    color: 'red',
    status: 'disconnected',
    description: 'ربط مع أجهزة Google Home و Nest',
    features: ['Nest', 'مساعد صوتي', 'Chromecast'],
    authType: 'oauth'
  },
  {
    id: 'alexa',
    name: 'Amazon Alexa',
    logo: '🔵',
    color: 'indigo',
    status: 'disconnected',
    description: 'ربط مع أجهزة Amazon Alexa و Echo',
    features: ['Echo', 'مساعد صوتي', 'Ring'],
    authType: 'oauth'
  },
  {
    id: 'homekit',
    name: 'Apple HomeKit',
    logo: '🍎',
    color: 'slate',
    status: 'disconnected',
    description: 'ربط مع أجهزة Apple HomeKit',
    features: ['Siri', 'أجهزة Apple', 'HomeKit'],
    authType: 'pairing'
  }
];

const integrations = [
  {
    id: 'weather',
    name: 'خدمة الطقس',
    icon: CloudSun,
    color: 'cyan',
    status: 'disconnected',
    description: 'ربط مع بيانات الطقس لتحسين تنبؤات الطاقة',
    features: ['درجة الحرارة', 'الرطوبة', 'سرعة الرياح', 'التنبؤات'],
    apiKey: ''
  },
  {
    id: 'bms',
    name: 'نظام إدارة المباني (BMS)',
    icon: Building2,
    color: 'purple',
    status: 'disconnected',
    description: 'التكامل مع أنظمة BMS للمباني الكبيرة',
    features: ['HVAC', 'الإضاءة', 'الأمان', 'إدارة الطاقة'],
    apiUrl: ''
  },
  {
    id: 'cloud_backup',
    name: 'النسخ الاحتياطي السحابي',
    icon: Cloud,
    color: 'blue',
    status: 'connected',
    description: 'نسخ احتياطي تلقائي للإعدادات والبيانات',
    features: ['نسخ تلقائي', 'استعادة', 'تشفير', 'مزامنة'],
    connected: true
  }
];

const weatherMockData = {
  current: { temp: 35, humidity: 45, windSpeed: 12, condition: 'مشمس' },
  forecast: [
    { day: 'غداً', temp: 38, condition: 'حار', energyImpact: '+15%' },
    { day: 'بعد غد', temp: 36, condition: 'مشمس', energyImpact: '+8%' },
    { day: 'الأربعاء', temp: 32, condition: 'غائم جزئياً', energyImpact: '-5%' },
  ],
  recommendations: [
    'ارتفاع درجات الحرارة غداً - شغّل المكيف مسبقاً',
    'الرطوبة منخفضة - قلل استخدام المرطب',
    'رياح قوية متوقعة - تحقق من الأبواب والنوافذ'
  ]
};

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function IntegrationsHub({ devices = [], onDevicesImported }) {
  const [activeIntegrations, setActiveIntegrations] = useState(integrations);
  const [activePlatforms, setActivePlatforms] = useState(smartHomePlatforms);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showWeatherDialog, setShowWeatherDialog] = useState(false);
  const [showPlatformDialog, setShowPlatformDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [weatherData, setWeatherData] = useState(weatherMockData);
  const [importData, setImportData] = useState('');
  const [platformCredentials, setPlatformCredentials] = useState({
    email: '',
    password: '',
    region: 'eu',
    serverUrl: '',
    accessToken: ''
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState([]);

  const connectWeatherMutation = useMutation({
    mutationFn: async (apiKey) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `قم بمحاكاة ربط خدمة طقس والحصول على بيانات الطقس الحالية والتنبؤات لتحسين استهلاك الطاقة في المنزل الذكي.`,
        response_json_schema: {
          type: 'object',
          properties: {
            current: {
              type: 'object',
              properties: {
                temp: { type: 'number' },
                humidity: { type: 'number' },
                windSpeed: { type: 'number' },
                condition: { type: 'string' }
              }
            },
            forecast: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'string' },
                  temp: { type: 'number' },
                  condition: { type: 'string' },
                  energyImpact: { type: 'string' }
                }
              }
            },
            recommendations: { type: 'array', items: { type: 'string' } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setWeatherData(data);
      setActiveIntegrations(activeIntegrations.map(i => 
        i.id === 'weather' ? { ...i, status: 'connected', connected: true } : i
      ));
      setShowConfigDialog(false);
      toast.success('تم الربط مع خدمة الطقس');
    },
    onError: () => toast.error('فشل الاتصال بخدمة الطقس')
  });

  const exportDevicesMutation = useMutation({
    mutationFn: async (format) => {
      const devicesData = devices.map(d => ({
        name: d.name,
        category: d.category,
        room: d.room,
        status: d.status,
        protocol: d.protocol,
        state: d.state
      }));

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(devicesData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `devices-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
      } else {
        const csv = "الاسم,النوع,الغرفة,الحالة,البروتوكول\n" + 
          devicesData.map(d => `${d.name},${d.category},${d.room},${d.status},${d.protocol}`).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `devices-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
      }
      return { success: true, format };
    },
    onSuccess: (data) => {
      toast.success(`تم تصدير الأجهزة بصيغة ${data.format.toUpperCase()}`);
    }
  });

  const importDevicesMutation = useMutation({
    mutationFn: async (data) => {
      try {
        const parsed = JSON.parse(data);
        return { success: true, devices: parsed };
      } catch (e) {
        throw new Error('Invalid JSON format');
      }
    },
    onSuccess: (data) => {
      toast.success(`تم استيراد ${data.devices.length} جهاز`);
      setShowImportDialog(false);
      setImportData('');
      onDevicesImported?.(data.devices);
    },
    onError: () => toast.error('فشل استيراد البيانات - تحقق من الصيغة')
  });

  const connectPlatformMutation = useMutation({
    mutationFn: async ({ platform, credentials }) => {
      // Simulate OAuth/API connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock fetched devices based on platform
      const mockDevices = [
        { id: `${platform.id}-1`, name: 'إضاءة غرفة المعيشة', type: 'light', platform: platform.id },
        { id: `${platform.id}-2`, name: 'مكيف غرفة النوم', type: 'ac', platform: platform.id },
        { id: `${platform.id}-3`, name: 'قفل الباب الرئيسي', type: 'lock', platform: platform.id },
      ];
      
      return { success: true, platform: platform.id, devices: mockDevices, deviceCount: mockDevices.length };
    },
    onSuccess: (data) => {
      setActivePlatforms(activePlatforms.map(p => 
        p.id === data.platform ? { ...p, status: 'connected', deviceCount: data.deviceCount } : p
      ));
      setConnectedDevices(prev => [...prev, ...data.devices]);
      setShowPlatformDialog(false);
      setPlatformCredentials({ email: '', password: '', region: 'eu', serverUrl: '', accessToken: '' });
      toast.success(`تم الربط بنجاح! تم اكتشاف ${data.deviceCount} جهاز`);
    },
    onError: () => toast.error('فشل الاتصال - تحقق من بيانات الحساب')
  });

  const disconnectPlatform = (platformId) => {
    setActivePlatforms(activePlatforms.map(p => 
      p.id === platformId ? { ...p, status: 'disconnected', deviceCount: 0 } : p
    ));
    setConnectedDevices(connectedDevices.filter(d => d.platform !== platformId));
    toast.success('تم قطع الاتصال');
  };

  const handlePlatformConnect = (platform) => {
    setSelectedPlatform(platform);
    setShowPlatformDialog(true);
  };

  const submitPlatformConnection = () => {
    if (selectedPlatform.authType === 'oauth' && (!platformCredentials.email || !platformCredentials.password)) {
      toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    if (selectedPlatform.authType === 'token' && !platformCredentials.accessToken) {
      toast.error('يرجى إدخال رمز الوصول');
      return;
    }
    connectPlatformMutation.mutate({ platform: selectedPlatform, credentials: platformCredentials });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Link className="w-5 h-5 text-cyan-400" />
            مركز التكاملات
          </h3>
          <p className="text-slate-400 text-sm">ربط مع خدمات خارجية واستيراد/تصدير البيانات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-green-500/50 text-green-400" onClick={() => setShowImportDialog(true)}>
            <Upload className="w-4 h-4 ml-2" />
            استيراد
          </Button>
          <Button variant="outline" className="border-cyan-500/50 text-cyan-400" onClick={() => exportDevicesMutation.mutate('json')}>
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      <Tabs defaultValue="platforms" className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1 mb-4">
          <TabsTrigger value="platforms" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
            <Smartphone className="w-3 h-3 ml-1" />
            منصات المنزل الذكي
          </TabsTrigger>
          <TabsTrigger value="services" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Globe className="w-3 h-3 ml-1" />
            خدمات أخرى
          </TabsTrigger>
          <TabsTrigger value="data" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Database className="w-3 h-3 ml-1" />
            البيانات
          </TabsTrigger>
        </TabsList>

        {/* Smart Home Platforms Tab */}
        <TabsContent value="platforms" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePlatforms.map((platform, i) => (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`glass-card transition-all hover:border-${platform.color}-500/50 ${
                  platform.status === 'connected' ? `border-green-500/50 bg-green-500/5` : 'border-indigo-500/20 bg-[#0f1629]/80'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{platform.logo}</span>
                        <div>
                          <h4 className="text-white font-bold">{platform.name}</h4>
                          {platform.status === 'connected' && (
                            <p className="text-green-400 text-xs flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              متصل - {platform.deviceCount || 0} جهاز
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge className={`${
                        platform.status === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {platform.status === 'connected' ? 'متصل' : 'غير متصل'}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{platform.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {platform.features.slice(0, 4).map((feature, fi) => (
                        <Badge key={fi} variant="outline" className="border-slate-600 text-slate-400 text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      className={`w-full ${
                        platform.status === 'connected' 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : `bg-${platform.color}-600 hover:bg-${platform.color}-700`
                      }`}
                      size="sm"
                      onClick={() => platform.status === 'connected' 
                        ? disconnectPlatform(platform.id) 
                        : handlePlatformConnect(platform)
                      }
                    >
                      {platform.status === 'connected' ? (
                        <><Unlink className="w-3 h-3 ml-1" /> قطع الاتصال</>
                      ) : (
                        <><User className="w-3 h-3 ml-1" /> تسجيل الدخول</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Connected Devices from Platforms */}
          {connectedDevices.length > 0 && (
            <Card className="glass-card border-green-500/30 bg-green-500/5">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-green-400" />
                  الأجهزة المتصلة من المنصات ({connectedDevices.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-2">
                  {connectedDevices.map(device => {
                    const platform = activePlatforms.find(p => p.id === device.platform);
                    return (
                      <div key={device.id} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
                        <span>{platform?.logo}</span>
                        <div className="flex-1">
                          <p className="text-white text-sm">{device.name}</p>
                          <p className="text-slate-500 text-xs">{platform?.name}</p>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 text-xs">متصل</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
      {/* Integrations */}
      <div className="grid md:grid-cols-3 gap-4">
        {activeIntegrations.map((integration, i) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 hover:border-cyan-500/50 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-xl bg-${integration.color}-500/20`}>
                    <integration.icon className={`w-6 h-6 text-${integration.color}-400`} />
                  </div>
                  <Badge className={`${
                    integration.status === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
                  }`}>
                    {integration.status === 'connected' ? 'متصل' : 'غير متصل'}
                  </Badge>
                </div>
                <h4 className="text-white font-bold mb-1">{integration.name}</h4>
                <p className="text-slate-400 text-sm mb-3">{integration.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {integration.features.map((feature, fi) => (
                    <Badge key={fi} variant="outline" className="border-slate-600 text-slate-400 text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
                <Button 
                  className={`w-full ${
                    integration.status === 'connected' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                  size="sm"
                  onClick={() => {
                    if (integration.status === 'connected') {
                      setActiveIntegrations(activeIntegrations.map(i => 
                        i.id === integration.id ? { ...i, status: 'disconnected', connected: false } : i
                      ));
                      toast.success('تم قطع الاتصال');
                    } else {
                      if (integration.id === 'weather') {
                        setShowWeatherDialog(true);
                      } else {
                        setSelectedIntegration(integration);
                        setShowConfigDialog(true);
                      }
                    }
                  }}
                >
                  {integration.status === 'connected' ? (
                    <><Unlink className="w-3 h-3 ml-1" /> قطع الاتصال</>
                  ) : (
                    <><Link className="w-3 h-3 ml-1" /> ربط</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Weather Data */}
      {activeIntegrations.find(i => i.id === 'weather')?.connected && (
        <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-cyan-400" />
              بيانات الطقس والتأثير على الطاقة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-slate-300 text-sm font-medium mb-3">الطقس الحالي</h5>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <Thermometer className="w-5 h-5 text-red-400 mx-auto mb-1" />
                    <p className="text-xl font-bold text-white">{weatherData.current.temp}°C</p>
                    <p className="text-slate-400 text-xs">حرارة</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <Droplets className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-xl font-bold text-white">{weatherData.current.humidity}%</p>
                    <p className="text-slate-400 text-xs">رطوبة</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <Wind className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <p className="text-xl font-bold text-white">{weatherData.current.windSpeed}</p>
                    <p className="text-slate-400 text-xs">رياح km/h</p>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-slate-300 text-sm font-medium mb-3">التنبؤات والتأثير</h5>
                <div className="space-y-2">
                  {weatherData.forecast.map((day, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-amber-400" />
                        <div>
                          <p className="text-white text-sm">{day.day}</p>
                          <p className="text-slate-400 text-xs">{day.temp}°C - {day.condition}</p>
                        </div>
                      </div>
                      <Badge className={`text-xs ${
                        day.energyImpact.includes('+') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        <Zap className="w-3 h-3 ml-1" />
                        {day.energyImpact}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {weatherData.recommendations?.length > 0 && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <h5 className="text-amber-300 text-sm font-medium mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  توصيات بناءً على الطقس
                </h5>
                <div className="space-y-1">
                  {weatherData.recommendations.map((rec, i) => (
                    <p key={i} className="text-white text-xs">• {rec}</p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-4">
      {/* Import/Export */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            استيراد وتصدير البيانات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-slate-300 text-sm font-medium mb-3">تصدير</h5>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full border-cyan-500/50 text-cyan-400"
                  onClick={() => exportDevicesMutation.mutate('json')}
                  disabled={exportDevicesMutation.isPending}
                >
                  <FileJson className="w-4 h-4 ml-2" />
                  تصدير JSON
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-green-500/50 text-green-400"
                  onClick={() => exportDevicesMutation.mutate('csv')}
                  disabled={exportDevicesMutation.isPending}
                >
                  <FileSpreadsheet className="w-4 h-4 ml-2" />
                  تصدير CSV
                </Button>
              </div>
            </div>
            <div>
              <h5 className="text-slate-300 text-sm font-medium mb-3">استيراد</h5>
              <Button 
                variant="outline" 
                className="w-full border-purple-500/50 text-purple-400"
                onClick={() => setShowImportDialog(true)}
              >
                <Upload className="w-4 h-4 ml-2" />
                استيراد JSON/CSV
              </Button>
              <p className="text-slate-500 text-xs mt-2">يدعم ملفات JSON و CSV</p>
            </div>
          </div>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>

      {/* Weather Config Dialog */}
      <Dialog open={showWeatherDialog} onOpenChange={setShowWeatherDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-cyan-400" />
              ربط خدمة الطقس
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">API Key</Label>
              <Input
                placeholder="أدخل مفتاح API"
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">الموقع</Label>
              <Input
                defaultValue="الرياض، السعودية"
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
              />
            </div>
            <Button 
              className="w-full bg-cyan-600 hover:bg-cyan-700"
              onClick={() => connectWeatherMutation.mutate('demo-key')}
              disabled={connectWeatherMutation.isPending}
            >
              {connectWeatherMutation.isPending ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Link className="w-4 h-4 ml-2" />}
              ربط
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* BMS Config Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedIntegration?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">API URL</Label>
              <Input
                placeholder="https://api.example.com"
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">مفتاح API</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
              />
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => { setShowConfigDialog(false); toast.success('تم حفظ الإعدادات'); }}>
              <Check className="w-4 h-4 ml-2" />
              حفظ
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-400" />
              استيراد بيانات الأجهزة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">البيانات (JSON)</Label>
              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder='[{"name": "جهاز 1", "category": "lighting", "room": "غرفة المعيشة"}]'
                className="bg-slate-800/50 border-slate-700 text-white mt-1 h-32 font-mono text-xs"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={() => importDevicesMutation.mutate(importData)}
                disabled={importDevicesMutation.isPending || !importData.trim()}
              >
                {importDevicesMutation.isPending ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Upload className="w-4 h-4 ml-2" />}
                استيراد
              </Button>
              <Button variant="outline" className="border-slate-600" onClick={() => setShowImportDialog(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Platform Login Dialog */}
      <Dialog open={showPlatformDialog} onOpenChange={setShowPlatformDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-3">
              <span className="text-2xl">{selectedPlatform?.logo}</span>
              ربط {selectedPlatform?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedPlatform && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-300 text-sm">{selectedPlatform.description}</p>
              </div>

              {/* OAuth Login (Tuya, SmartThings, Google, Alexa) */}
              {selectedPlatform.authType === 'oauth' && (
                <>
                  <div>
                    <Label className="text-slate-300">البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      value={platformCredentials.email}
                      onChange={(e) => setPlatformCredentials({ ...platformCredentials, email: e.target.value })}
                      placeholder="email@example.com"
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">كلمة المرور</Label>
                    <Input
                      type="password"
                      value={platformCredentials.password}
                      onChange={(e) => setPlatformCredentials({ ...platformCredentials, password: e.target.value })}
                      placeholder="••••••••"
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    />
                  </div>
                  {selectedPlatform.id === 'tuya' && (
                    <div>
                      <Label className="text-slate-300">المنطقة</Label>
                      <Select 
                        value={platformCredentials.region} 
                        onValueChange={(v) => setPlatformCredentials({ ...platformCredentials, region: v })}
                      >
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="cn">الصين</SelectItem>
                          <SelectItem value="eu">أوروبا</SelectItem>
                          <SelectItem value="us">أمريكا</SelectItem>
                          <SelectItem value="in">الهند</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-300">
                    <AlertTriangle className="w-3 h-3 inline ml-1" />
                    سيتم توجيهك لتسجيل الدخول بشكل آمن عبر {selectedPlatform.name}
                  </div>
                </>
              )}

              {/* Token Auth (Home Assistant) */}
              {selectedPlatform.authType === 'token' && (
                <>
                  <div>
                    <Label className="text-slate-300">عنوان السيرفر</Label>
                    <Input
                      value={platformCredentials.serverUrl}
                      onChange={(e) => setPlatformCredentials({ ...platformCredentials, serverUrl: e.target.value })}
                      placeholder="http://homeassistant.local:8123"
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">رمز الوصول طويل الأمد</Label>
                    <Input
                      type="password"
                      value={platformCredentials.accessToken}
                      onChange={(e) => setPlatformCredentials({ ...platformCredentials, accessToken: e.target.value })}
                      placeholder="eyJ0eXAiOiJKV1QiLCJhbGc..."
                      className="bg-slate-800/50 border-slate-700 text-white mt-1 font-mono text-xs"
                    />
                  </div>
                  <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs text-cyan-300">
                    يمكنك إنشاء رمز الوصول من: الملف الشخصي → رموز الوصول طويلة الأمد
                  </div>
                </>
              )}

              {/* Pairing (HomeKit) */}
              {selectedPlatform.authType === 'pairing' && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Home className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-300 mb-2">افتح تطبيق Home على جهاز Apple</p>
                  <p className="text-slate-400 text-sm">وامسح رمز QR أو أدخل رمز الإقران</p>
                  <div className="mt-4 p-4 bg-slate-800 rounded-lg">
                    <p className="text-2xl font-mono text-white tracking-widest">123-45-678</p>
                  </div>
                </div>
              )}

              <Button 
                className={`w-full bg-${selectedPlatform.color}-600 hover:bg-${selectedPlatform.color}-700`}
                onClick={submitPlatformConnection}
                disabled={connectPlatformMutation.isPending}
              >
                {connectPlatformMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 ml-2 animate-spin" />جاري الاتصال...</>
                ) : (
                  <><Link className="w-4 h-4 ml-2" />ربط الحساب</>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}