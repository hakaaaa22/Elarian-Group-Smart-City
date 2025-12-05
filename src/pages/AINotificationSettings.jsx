import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Brain, Battery, Signal, AlertTriangle, Settings, Save,
  Mail, Smartphone, MessageSquare, Clock, Volume2, VolumeX,
  Check, X, ChevronRight, Zap, Shield, Wrench, Package,
  TrendingDown, Activity, Filter, Eye, EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

const defaultSettings = {
  // عتبات التنبيه
  thresholds: {
    batteryLow: 20,
    batteryVeryLow: 10,
    signalWeak: 30,
    signalVeryWeak: 15,
    deviceHealthCritical: 40,
    deviceHealthWarning: 60,
    inventoryLow: 20,
    energySpike: 30
  },
  // أنواع التنبيهات
  alertTypes: {
    criticalFailures: true,
    highPriorityWarnings: true,
    mediumWarnings: false,
    lowPriorityInfo: false,
    predictiveMaintenance: true,
    inventoryAlerts: true,
    energyAlerts: true,
    securityAlerts: true
  },
  // قنوات الإشعارات
  channels: {
    inApp: true,
    email: true,
    sms: false,
    push: true,
    whatsapp: false
  },
  // تكرار الإشعارات
  frequency: {
    mode: 'smart', // smart, immediate, batched, quiet
    batchInterval: 30, // minutes
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    maxPerHour: 10,
    repeatInterval: 60 // minutes before repeat
  },
  // تصنيف الأولويات
  priorities: {
    deviceOffline: 'high',
    lowBattery: 'medium',
    weakSignal: 'low',
    maintenanceNeeded: 'high',
    inventoryLow: 'medium',
    energySpike: 'medium'
  }
};

const alertCategories = [
  { id: 'criticalFailures', label: 'أعطال حرجة', description: 'توقف كامل للأجهزة', icon: AlertTriangle, color: 'red', priority: 'critical' },
  { id: 'highPriorityWarnings', label: 'تحذيرات عالية', description: 'مشاكل تحتاج اهتمام فوري', icon: Shield, color: 'amber', priority: 'high' },
  { id: 'mediumWarnings', label: 'تحذيرات متوسطة', description: 'مشاكل يمكن معالجتها لاحقاً', icon: Activity, color: 'yellow', priority: 'medium' },
  { id: 'lowPriorityInfo', label: 'معلومات عامة', description: 'تحديثات وإشعارات عامة', icon: Bell, color: 'blue', priority: 'low' },
  { id: 'predictiveMaintenance', label: 'صيانة تنبؤية', description: 'تنبيهات AI للصيانة المستقبلية', icon: Brain, color: 'purple', priority: 'medium' },
  { id: 'inventoryAlerts', label: 'تنبيهات المخزون', description: 'انخفاض أو نفاد المخزون', icon: Package, color: 'cyan', priority: 'medium' },
  { id: 'energyAlerts', label: 'تنبيهات الطاقة', description: 'استهلاك غير طبيعي', icon: Zap, color: 'green', priority: 'low' },
  { id: 'securityAlerts', label: 'تنبيهات الأمان', description: 'أحداث أمنية', icon: Shield, color: 'red', priority: 'critical' }
];

const channelOptions = [
  { id: 'inApp', label: 'داخل التطبيق', icon: Bell, description: 'إشعارات فورية في التطبيق' },
  { id: 'email', label: 'البريد الإلكتروني', icon: Mail, description: 'إرسال بريد إلكتروني' },
  { id: 'sms', label: 'رسائل SMS', icon: MessageSquare, description: 'رسائل نصية قصيرة' },
  { id: 'push', label: 'إشعارات الدفع', icon: Smartphone, description: 'إشعارات الهاتف' },
  { id: 'whatsapp', label: 'واتساب', icon: MessageSquare, description: 'رسائل واتساب' }
];

export default function AINotificationSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [activeTab, setActiveTab] = useState('thresholds');
  const [hasChanges, setHasChanges] = useState(false);

  const updateThreshold = (key, value) => {
    setSettings(prev => ({
      ...prev,
      thresholds: { ...prev.thresholds, [key]: value }
    }));
    setHasChanges(true);
  };

  const updateAlertType = (key, value) => {
    setSettings(prev => ({
      ...prev,
      alertTypes: { ...prev.alertTypes, [key]: value }
    }));
    setHasChanges(true);
  };

  const updateChannel = (key, value) => {
    setSettings(prev => ({
      ...prev,
      channels: { ...prev.channels, [key]: value }
    }));
    setHasChanges(true);
  };

  const updateFrequency = (key, value) => {
    setSettings(prev => ({
      ...prev,
      frequency: { ...prev.frequency, [key]: value }
    }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    // حفظ الإعدادات
    toast.success('تم حفظ إعدادات الإشعارات');
    setHasChanges(false);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    toast.info('تم إعادة الإعدادات للقيم الافتراضية');
    setHasChanges(true);
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-400" />
              إعدادات إشعارات الذكاء الاصطناعي
            </h1>
            <p className="text-slate-400 mt-1">تخصيص التنبيهات والإشعارات التنبؤية</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-600" onClick={resetSettings}>
              إعادة تعيين
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700" 
              onClick={saveSettings}
              disabled={!hasChanges}
            >
              <Save className="w-4 h-4 ml-2" />
              حفظ الإعدادات
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Settings Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-purple-500/30 bg-purple-500/5">
          <CardContent className="p-4 text-center">
            <Bell className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {Object.values(settings.alertTypes).filter(Boolean).length}/{Object.keys(settings.alertTypes).length}
            </p>
            <p className="text-slate-400 text-xs">أنواع التنبيهات</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
          <CardContent className="p-4 text-center">
            <Smartphone className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {Object.values(settings.channels).filter(Boolean).length}/{Object.keys(settings.channels).length}
            </p>
            <p className="text-slate-400 text-xs">قنوات الإشعارات</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 text-center">
            <Battery className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{settings.thresholds.batteryLow}%</p>
            <p className="text-slate-400 text-xs">عتبة البطارية</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white capitalize">{settings.frequency.mode}</p>
            <p className="text-slate-400 text-xs">وضع التكرار</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap">
          <TabsTrigger value="thresholds" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Activity className="w-4 h-4 ml-2" />
            عتبات التنبيه
          </TabsTrigger>
          <TabsTrigger value="types" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Filter className="w-4 h-4 ml-2" />
            أنواع التنبيهات
          </TabsTrigger>
          <TabsTrigger value="channels" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Bell className="w-4 h-4 ml-2" />
            قنوات الإشعارات
          </TabsTrigger>
          <TabsTrigger value="frequency" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Clock className="w-4 h-4 ml-2" />
            التكرار والجدولة
          </TabsTrigger>
        </TabsList>

        {/* Thresholds Tab */}
        <TabsContent value="thresholds" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Battery className="w-4 h-4 text-amber-400" />
                عتبات البطارية والإشارة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Battery Low */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white">تنبيه البطارية المنخفضة</Label>
                  <span className="text-amber-400 font-bold">{settings.thresholds.batteryLow}%</span>
                </div>
                <Slider
                  value={[settings.thresholds.batteryLow]}
                  onValueChange={([v]) => updateThreshold('batteryLow', v)}
                  max={50}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <p className="text-slate-500 text-xs">تنبيه عند انخفاض البطارية تحت هذا المستوى</p>
              </div>

              {/* Battery Very Low */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white">تنبيه البطارية الحرجة</Label>
                  <span className="text-red-400 font-bold">{settings.thresholds.batteryVeryLow}%</span>
                </div>
                <Slider
                  value={[settings.thresholds.batteryVeryLow]}
                  onValueChange={([v]) => updateThreshold('batteryVeryLow', v)}
                  max={30}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <p className="text-slate-500 text-xs">تنبيه عاجل عند وصول البطارية لهذا المستوى</p>
              </div>

              {/* Signal Weak */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white">تنبيه الإشارة الضعيفة</Label>
                  <span className="text-amber-400 font-bold">{settings.thresholds.signalWeak}%</span>
                </div>
                <Slider
                  value={[settings.thresholds.signalWeak]}
                  onValueChange={([v]) => updateThreshold('signalWeak', v)}
                  max={50}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Signal Very Weak */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white">تنبيه الإشارة الحرجة</Label>
                  <span className="text-red-400 font-bold">{settings.thresholds.signalVeryWeak}%</span>
                </div>
                <Slider
                  value={[settings.thresholds.signalVeryWeak]}
                  onValueChange={([v]) => updateThreshold('signalVeryWeak', v)}
                  max={30}
                  min={5}
                  step={5}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                عتبات الصيانة التنبؤية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Device Health Critical */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white">صحة الجهاز الحرجة</Label>
                  <span className="text-red-400 font-bold">{settings.thresholds.deviceHealthCritical}%</span>
                </div>
                <Slider
                  value={[settings.thresholds.deviceHealthCritical]}
                  onValueChange={([v]) => updateThreshold('deviceHealthCritical', v)}
                  max={60}
                  min={20}
                  step={5}
                  className="w-full"
                />
                <p className="text-slate-500 text-xs">تنبيه عاجل عند انخفاض صحة الجهاز تحت هذا المستوى</p>
              </div>

              {/* Device Health Warning */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white">تحذير صحة الجهاز</Label>
                  <span className="text-amber-400 font-bold">{settings.thresholds.deviceHealthWarning}%</span>
                </div>
                <Slider
                  value={[settings.thresholds.deviceHealthWarning]}
                  onValueChange={([v]) => updateThreshold('deviceHealthWarning', v)}
                  max={80}
                  min={40}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Inventory Low */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white">تنبيه المخزون المنخفض</Label>
                  <span className="text-amber-400 font-bold">{settings.thresholds.inventoryLow}%</span>
                </div>
                <Slider
                  value={[settings.thresholds.inventoryLow]}
                  onValueChange={([v]) => updateThreshold('inventoryLow', v)}
                  max={50}
                  min={10}
                  step={5}
                  className="w-full"
                />
                <p className="text-slate-500 text-xs">نسبة من الحد الأدنى</p>
              </div>

              {/* Energy Spike */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white">تنبيه ارتفاع الاستهلاك</Label>
                  <span className="text-amber-400 font-bold">+{settings.thresholds.energySpike}%</span>
                </div>
                <Slider
                  value={[settings.thresholds.energySpike]}
                  onValueChange={([v]) => updateThreshold('energySpike', v)}
                  max={100}
                  min={10}
                  step={10}
                  className="w-full"
                />
                <p className="text-slate-500 text-xs">تنبيه عند زيادة الاستهلاك عن المعدل بهذه النسبة</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alert Types Tab */}
        <TabsContent value="types" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-400" />
                تخصيص أنواع التنبيهات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertCategories.map(category => {
                  const Icon = category.icon;
                  return (
                    <div key={category.id} className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                      settings.alertTypes[category.id] 
                        ? `bg-${category.color}-500/10 border border-${category.color}-500/30` 
                        : 'bg-slate-800/50 border border-slate-700/50 opacity-60'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg bg-${category.color}-500/20`}>
                          <Icon className={`w-5 h-5 text-${category.color}-400`} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{category.label}</p>
                          <p className="text-slate-400 text-xs">{category.description}</p>
                        </div>
                        <Badge className={`text-xs ${
                          category.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                          category.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                          category.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {category.priority === 'critical' ? 'حرج' : category.priority === 'high' ? 'عالي' : category.priority === 'medium' ? 'متوسط' : 'منخفض'}
                        </Badge>
                      </div>
                      <Switch
                        checked={settings.alertTypes[category.id]}
                        onCheckedChange={(checked) => updateAlertType(category.id, checked)}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                قنوات الإشعارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {channelOptions.map(channel => {
                  const Icon = channel.icon;
                  return (
                    <div key={channel.id} className={`p-4 rounded-xl transition-all ${
                      settings.channels[channel.id] 
                        ? 'bg-cyan-500/10 border border-cyan-500/30' 
                        : 'bg-slate-800/50 border border-slate-700/50 opacity-60'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${settings.channels[channel.id] ? 'bg-cyan-500/20' : 'bg-slate-700'}`}>
                            <Icon className={`w-5 h-5 ${settings.channels[channel.id] ? 'text-cyan-400' : 'text-slate-400'}`} />
                          </div>
                          <div>
                            <p className="text-white font-medium">{channel.label}</p>
                            <p className="text-slate-400 text-xs">{channel.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.channels[channel.id]}
                          onCheckedChange={(checked) => updateChannel(channel.id, checked)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Frequency Tab */}
        <TabsContent value="frequency" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-400" />
                وضع الإشعارات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-4 gap-3">
                {[
                  { id: 'smart', label: 'ذكي', desc: 'AI يحدد التوقيت الأمثل', icon: Brain },
                  { id: 'immediate', label: 'فوري', desc: 'كل تنبيه فور حدوثه', icon: Zap },
                  { id: 'batched', label: 'مجمّع', desc: 'تجميع كل فترة', icon: Package },
                  { id: 'quiet', label: 'هادئ', desc: 'الحرجة فقط', icon: VolumeX },
                ].map(mode => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => updateFrequency('mode', mode.id)}
                      className={`p-4 rounded-xl text-center transition-all ${
                        settings.frequency.mode === mode.id
                          ? 'bg-green-500/20 border-2 border-green-500/50'
                          : 'bg-slate-800/50 border border-slate-700/50 hover:border-green-500/30'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${settings.frequency.mode === mode.id ? 'text-green-400' : 'text-slate-400'}`} />
                      <p className="text-white font-medium text-sm">{mode.label}</p>
                      <p className="text-slate-400 text-xs">{mode.desc}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-400" />
                إعدادات إضافية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Batch Interval */}
              {settings.frequency.mode === 'batched' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">فترة التجميع</Label>
                    <span className="text-cyan-400 font-bold">{settings.frequency.batchInterval} دقيقة</span>
                  </div>
                  <Slider
                    value={[settings.frequency.batchInterval]}
                    onValueChange={([v]) => updateFrequency('batchInterval', v)}
                    max={120}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                </div>
              )}

              {/* Max Per Hour */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white">الحد الأقصى في الساعة</Label>
                  <span className="text-cyan-400 font-bold">{settings.frequency.maxPerHour}</span>
                </div>
                <Slider
                  value={[settings.frequency.maxPerHour]}
                  onValueChange={([v]) => updateFrequency('maxPerHour', v)}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-slate-500 text-xs">لتجنب الإزعاج من كثرة الإشعارات</p>
              </div>

              {/* Repeat Interval */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white">فترة إعادة التنبيه</Label>
                  <span className="text-cyan-400 font-bold">{settings.frequency.repeatInterval} دقيقة</span>
                </div>
                <Slider
                  value={[settings.frequency.repeatInterval]}
                  onValueChange={([v]) => updateFrequency('repeatInterval', v)}
                  max={240}
                  min={15}
                  step={15}
                  className="w-full"
                />
                <p className="text-slate-500 text-xs">الوقت قبل إعادة إرسال تنبيه لم يُعالج</p>
              </div>

              {/* Quiet Hours */}
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <VolumeX className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-white font-medium">ساعات الهدوء</p>
                      <p className="text-slate-400 text-xs">إيقاف الإشعارات غير الحرجة</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.frequency.quietHoursEnabled}
                    onCheckedChange={(checked) => updateFrequency('quietHoursEnabled', checked)}
                  />
                </div>
                {settings.frequency.quietHoursEnabled && (
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700/50">
                    <div>
                      <Label className="text-slate-400 text-xs">من</Label>
                      <Input
                        type="time"
                        value={settings.frequency.quietHoursStart}
                        onChange={(e) => updateFrequency('quietHoursStart', e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">إلى</Label>
                      <Input
                        type="time"
                        value={settings.frequency.quietHoursEnd}
                        onChange={(e) => updateFrequency('quietHoursEnd', e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}