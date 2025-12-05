import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Home, Smartphone, Speaker, Globe, Link, Unlink, Check, X, Settings,
  RefreshCw, Loader2, Shield, Zap, Radio, Wifi, ChevronRight, Key,
  AlertTriangle, ExternalLink, QrCode
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from '@/components/ui/accordion';
import { toast } from 'sonner';

const platforms = [
  {
    id: 'homekit',
    name: 'Apple HomeKit',
    icon: '🏠',
    color: 'slate',
    description: 'تحكم بأجهزتك عبر تطبيق المنزل وSiri',
    features: ['التحكم الصوتي عبر Siri', 'المشاركة العائلية', 'الأتمتة المتقدمة', 'التحكم عن بُعد'],
    requirements: ['Apple TV أو HomePod كـ Hub', 'iOS 15 أو أحدث'],
    syncedDevices: 15,
    status: 'connected'
  },
  {
    id: 'google',
    name: 'Google Home',
    icon: '🔴',
    color: 'red',
    description: 'تكامل مع مساعد Google وأجهزة Nest',
    features: ['التحكم الصوتي عبر Google Assistant', 'الروتين الذكي', 'التحكم عبر التلفزيون', 'المشاركة المنزلية'],
    requirements: ['حساب Google', 'تطبيق Google Home'],
    syncedDevices: 12,
    status: 'connected'
  },
  {
    id: 'alexa',
    name: 'Amazon Alexa',
    icon: '🔵',
    color: 'blue',
    description: 'تحكم عبر أجهزة Echo ومساعد Alexa',
    features: ['المهارات المخصصة', 'الروتين', 'التحكم الصوتي', 'المجموعات الذكية'],
    requirements: ['حساب Amazon', 'جهاز Echo أو تطبيق Alexa'],
    syncedDevices: 0,
    status: 'disconnected'
  },
  {
    id: 'smartthings',
    name: 'SmartThings',
    icon: '⚡',
    color: 'cyan',
    description: 'منصة سامسونج للمنزل الذكي',
    features: ['دعم Zigbee و Z-Wave', 'الأتمتة المتقدمة', 'المشاهد', 'التنبيهات'],
    requirements: ['حساب Samsung', 'SmartThings Hub (اختياري)'],
    syncedDevices: 8,
    status: 'connected'
  },
  {
    id: 'matter',
    name: 'Matter',
    icon: '🌐',
    color: 'purple',
    description: 'البروتوكول الموحد الجديد للمنزل الذكي',
    features: ['توافق عالمي', 'أمان محسّن', 'إعداد سهل', 'عمل محلي'],
    requirements: ['جهاز يدعم Matter', 'وحدة تحكم Matter'],
    syncedDevices: 5,
    status: 'connected'
  },
  {
    id: 'tuya',
    name: 'Tuya Smart',
    icon: '🟢',
    color: 'green',
    description: 'منصة Tuya للأجهزة الذكية',
    features: ['دعم واسع للأجهزة', 'API مفتوح', 'المشاهد', 'المشاركة'],
    requirements: ['حساب Tuya', 'مفاتيح API'],
    syncedDevices: 20,
    status: 'connected'
  }
];

const matterDeviceTypes = [
  { type: 'light', name: 'إضاءة', supported: true },
  { type: 'switch', name: 'مفتاح', supported: true },
  { type: 'thermostat', name: 'منظم حرارة', supported: true },
  { type: 'lock', name: 'قفل', supported: true },
  { type: 'sensor', name: 'مستشعر', supported: true },
  { type: 'camera', name: 'كاميرا', supported: false },
  { type: 'speaker', name: 'مكبر صوت', supported: false },
];

export default function PlatformIntegration({ devices }) {
  const [platformStatus, setPlatformStatus] = useState(
    platforms.reduce((acc, p) => ({ ...acc, [p.id]: p.status }), {})
  );
  const [syncingPlatform, setSyncingPlatform] = useState(null);
  const [showConnectDialog, setShowConnectDialog] = useState(null);
  const [showMatterSetup, setShowMatterSetup] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '', apiKey: '' });

  const connectPlatform = async (platformId) => {
    setSyncingPlatform(platformId);
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    setPlatformStatus(prev => ({ ...prev, [platformId]: 'connected' }));
    setSyncingPlatform(null);
    setShowConnectDialog(null);
    toast.success(`تم الربط مع ${platforms.find(p => p.id === platformId)?.name} بنجاح`);
  };

  const disconnectPlatform = (platformId) => {
    setPlatformStatus(prev => ({ ...prev, [platformId]: 'disconnected' }));
    toast.success('تم إلغاء الربط');
  };

  const syncDevices = async (platformId) => {
    setSyncingPlatform(platformId);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSyncingPlatform(null);
    toast.success('تمت مزامنة الأجهزة بنجاح');
  };

  const connectedPlatforms = platforms.filter(p => platformStatus[p.id] === 'connected');
  const totalSyncedDevices = connectedPlatforms.reduce((sum, p) => sum + p.syncedDevices, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-400" />
            تكامل المنصات
          </h3>
          <p className="text-slate-400 text-sm">ربط وإدارة منصات المنزل الذكي المختلفة</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-500/20 text-green-400">
            {connectedPlatforms.length} منصة متصلة
          </Badge>
          <Badge className="bg-cyan-500/20 text-cyan-400">
            {totalSyncedDevices} جهاز مُزامَن
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 text-center">
            <Link className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{connectedPlatforms.length}</p>
            <p className="text-slate-400 text-xs">منصات متصلة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 text-center">
            <Smartphone className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{totalSyncedDevices}</p>
            <p className="text-slate-400 text-xs">أجهزة مُزامَنة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 text-center">
            <Speaker className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">3</p>
            <p className="text-slate-400 text-xs">مساعدات صوتية</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">100%</p>
            <p className="text-slate-400 text-xs">آمن</p>
          </CardContent>
        </Card>
      </div>

      {/* Platforms Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform, i) => {
          const isConnected = platformStatus[platform.id] === 'connected';
          const isSyncing = syncingPlatform === platform.id;
          
          return (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 ${isConnected ? 'ring-1 ring-green-500/30' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{platform.icon}</span>
                      <div>
                        <h4 className="text-white font-medium">{platform.name}</h4>
                        <p className="text-slate-500 text-xs">{platform.description}</p>
                      </div>
                    </div>
                    <Badge className={isConnected ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
                      {isConnected ? 'متصل' : 'غير متصل'}
                    </Badge>
                  </div>

                  {isConnected && (
                    <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">الأجهزة المُزامَنة</span>
                        <span className="text-white font-medium">{platform.syncedDevices}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {isConnected ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-slate-600"
                          onClick={() => syncDevices(platform.id)}
                          disabled={isSyncing}
                        >
                          {isSyncing ? (
                            <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4 ml-1" />
                          )}
                          مزامنة
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          onClick={() => disconnectPlatform(platform.id)}
                        >
                          <Unlink className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="w-full bg-cyan-600 hover:bg-cyan-700"
                        size="sm"
                        onClick={() => setShowConnectDialog(platform)}
                      >
                        <Link className="w-4 h-4 ml-1" />
                        ربط
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Matter Protocol Details */}
      <Card className="glass-card border-purple-500/30 bg-[#0f1629]/80">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-400" />
            بروتوكول Matter
            <Badge className="bg-purple-500/20 text-purple-400 mr-auto">الجيل الجديد</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm mb-4">
            Matter هو البروتوكول الموحد الجديد للمنزل الذكي الذي يدعمه Apple و Google و Amazon و Samsung وغيرهم.
          </p>
          
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="supported" className="border-slate-700">
              <AccordionTrigger className="text-white hover:no-underline">
                الأجهزة المدعومة
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {matterDeviceTypes.map(device => (
                    <div key={device.type} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                      <span className="text-white text-sm">{device.name}</span>
                      {device.supported ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <X className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="thread" className="border-slate-700">
              <AccordionTrigger className="text-white hover:no-underline">
                شبكة Thread
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2 space-y-3">
                  <p className="text-slate-400 text-sm">
                    Thread هي شبكة mesh لاسلكية منخفضة الطاقة تعمل مع Matter لتوفير اتصال موثوق.
                  </p>
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <Radio className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-white text-sm font-medium">Thread Border Router</p>
                      <p className="text-green-400 text-xs">متصل • 5 أجهزة</p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700" onClick={() => setShowMatterSetup(true)}>
            <Settings className="w-4 h-4 ml-2" />
            إعداد Matter
          </Button>
        </CardContent>
      </Card>

      {/* Connect Platform Dialog */}
      <Dialog open={!!showConnectDialog} onOpenChange={() => setShowConnectDialog(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <span className="text-2xl">{showConnectDialog?.icon}</span>
              ربط {showConnectDialog?.name}
            </DialogTitle>
          </DialogHeader>
          {showConnectDialog && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="text-white font-medium mb-2">المتطلبات:</h4>
                <ul className="space-y-1">
                  {showConnectDialog.requirements.map((req, i) => (
                    <li key={i} className="text-slate-400 text-sm flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {showConnectDialog.id === 'tuya' ? (
                <>
                  <div>
                    <Label className="text-slate-300">Access ID</Label>
                    <Input
                      value={credentials.apiKey}
                      onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                      placeholder="أدخل Access ID"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Access Secret</Label>
                    <Input
                      type="password"
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                      placeholder="أدخل Access Secret"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-slate-300">البريد الإلكتروني</Label>
                    <Input
                      value={credentials.email}
                      onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">كلمة المرور</Label>
                    <Input
                      type="password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <Shield className="w-5 h-5 text-amber-400" />
                <p className="text-amber-200 text-xs">بياناتك مشفرة وآمنة</p>
              </div>

              <Button
                className="w-full bg-cyan-600 hover:bg-cyan-700"
                onClick={() => connectPlatform(showConnectDialog.id)}
                disabled={syncingPlatform === showConnectDialog.id}
              >
                {syncingPlatform === showConnectDialog.id ? (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                ) : (
                  <Link className="w-4 h-4 ml-2" />
                )}
                ربط الحساب
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Matter Setup Dialog */}
      <Dialog open={showMatterSetup} onOpenChange={setShowMatterSetup}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">إعداد Matter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                <QrCode className="w-10 h-10 text-purple-400" />
              </div>
              <p className="text-white font-medium">امسح رمز QR الموجود على جهاز Matter</p>
              <p className="text-slate-400 text-sm mt-2">أو أدخل رمز الإعداد يدوياً</p>
            </div>

            <div>
              <Label className="text-slate-300">رمز الإعداد</Label>
              <Input
                className="bg-slate-800/50 border-slate-700 text-white mt-1 text-center font-mono text-lg tracking-widest"
                placeholder="XXXX-XXX-XXXX"
              />
            </div>

            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              <Zap className="w-4 h-4 ml-2" />
              إضافة جهاز Matter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}