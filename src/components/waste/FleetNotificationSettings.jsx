import React, { useState } from 'react';
import {
  Bell, Settings, Volume2, Mail, MessageSquare, Smartphone, Clock, AlertTriangle,
  Gauge, Fuel, Battery, Route, MapPin, Truck, CheckCircle, Save, RefreshCw,
  Moon, Sun, Calendar, ChevronDown, ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

const alertCategories = [
  {
    id: 'safety',
    name: 'تنبيهات السلامة',
    icon: AlertTriangle,
    color: 'red',
    alerts: [
      { id: 'speeding', name: 'تجاوز السرعة', defaultSeverity: 'high', icon: Gauge },
      { id: 'harsh_driving', name: 'قيادة خطرة', defaultSeverity: 'high', icon: AlertTriangle },
      { id: 'engine_temp', name: 'حرارة المحرك', defaultSeverity: 'critical', icon: AlertTriangle },
    ]
  },
  {
    id: 'operational',
    name: 'تنبيهات التشغيل',
    icon: Truck,
    color: 'cyan',
    alerts: [
      { id: 'route_deviation', name: 'انحراف عن المسار', defaultSeverity: 'medium', icon: Route },
      { id: 'delay_expected', name: 'تأخير متوقع', defaultSeverity: 'medium', icon: Clock },
      { id: 'route_completed', name: 'اكتمال المسار', defaultSeverity: 'low', icon: CheckCircle },
    ]
  },
  {
    id: 'resources',
    name: 'تنبيهات الموارد',
    icon: Fuel,
    color: 'amber',
    alerts: [
      { id: 'low_fuel', name: 'وقود منخفض', defaultSeverity: 'high', icon: Fuel },
      { id: 'battery_critical', name: 'بطارية حرجة', defaultSeverity: 'critical', icon: Battery },
      { id: 'maintenance_due', name: 'موعد صيانة', defaultSeverity: 'medium', icon: Settings },
    ]
  },
  {
    id: 'collection',
    name: 'تنبيهات الجمع',
    icon: MapPin,
    color: 'green',
    alerts: [
      { id: 'priority_bin', name: 'حاوية ذات أولوية', defaultSeverity: 'medium', icon: MapPin },
      { id: 'citizen_report', name: 'بلاغ مواطن جديد', defaultSeverity: 'medium', icon: MessageSquare },
      { id: 'bulk_request', name: 'طلب جمع ضخم', defaultSeverity: 'low', icon: Truck },
    ]
  },
];

const channelIcons = {
  app: Smartphone,
  sms: MessageSquare,
  email: Mail,
  sound: Volume2,
};

const severityLevels = {
  critical: { label: 'حرج', color: 'red', value: 4 },
  high: { label: 'عالي', color: 'amber', value: 3 },
  medium: { label: 'متوسط', color: 'blue', value: 2 },
  low: { label: 'منخفض', color: 'green', value: 1 },
};

export default function FleetNotificationSettings() {
  const [userRole, setUserRole] = useState('manager'); // driver or manager
  const [expandedCategories, setExpandedCategories] = useState(['safety']);
  const [settings, setSettings] = useState(() => {
    const initial = {};
    alertCategories.forEach(cat => {
      cat.alerts.forEach(alert => {
        initial[alert.id] = {
          enabled: true,
          channels: { app: true, sms: alert.defaultSeverity === 'critical', email: false, sound: alert.defaultSeverity !== 'low' },
          severity: alert.defaultSeverity,
          customThreshold: null,
        };
      });
    });
    return initial;
  });

  const [scheduleSettings, setScheduleSettings] = useState({
    enabled: true,
    workDays: ['sat', 'sun', 'mon', 'tue', 'wed'],
    startTime: '06:00',
    endTime: '22:00',
    allowCriticalAnytime: true,
    quietMode: false,
  });

  const [globalSettings, setGlobalSettings] = useState({
    minSeverityLevel: 'low',
    groupNotifications: true,
    groupInterval: 5,
    soundVolume: [70],
    vibration: true,
  });

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]);
  };

  const updateAlertSetting = (alertId, key, value) => {
    setSettings(prev => ({
      ...prev,
      [alertId]: { ...prev[alertId], [key]: value }
    }));
  };

  const updateAlertChannel = (alertId, channel, value) => {
    setSettings(prev => ({
      ...prev,
      [alertId]: { 
        ...prev[alertId], 
        channels: { ...prev[alertId].channels, [channel]: value }
      }
    }));
  };

  const saveSettings = () => {
    toast.success('تم حفظ الإعدادات بنجاح');
  };

  const resetToDefaults = () => {
    toast.info('تم إعادة الإعدادات للافتراضي');
  };

  const days = [
    { id: 'sat', label: 'سبت' },
    { id: 'sun', label: 'أحد' },
    { id: 'mon', label: 'إثنين' },
    { id: 'tue', label: 'ثلاثاء' },
    { id: 'wed', label: 'أربعاء' },
    { id: 'thu', label: 'خميس' },
    { id: 'fri', label: 'جمعة' },
  ];

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            إعدادات الإشعارات المتقدمة
          </h3>
          <p className="text-slate-400 text-sm">تخصيص أنواع وقنوات التنبيهات</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={userRole} onValueChange={setUserRole}>
            <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="driver">سائق</SelectItem>
              <SelectItem value="manager">مدير</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-slate-600" onClick={resetToDefaults}>
            <RefreshCw className="w-4 h-4 ml-1" />
            إعادة ضبط
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={saveSettings}>
            <Save className="w-4 h-4 ml-1" />
            حفظ
          </Button>
        </div>
      </div>

      <Tabs defaultValue="alerts">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="alerts" className="data-[state=active]:bg-cyan-500/20">
            <Bell className="w-4 h-4 ml-1" />
            أنواع التنبيهات
          </TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-purple-500/20">
            <Clock className="w-4 h-4 ml-1" />
            جدولة الإشعارات
          </TabsTrigger>
          <TabsTrigger value="general" className="data-[state=active]:bg-green-500/20">
            <Settings className="w-4 h-4 ml-1" />
            الإعدادات العامة
          </TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="mt-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {alertCategories.map(category => {
                const isExpanded = expandedCategories.includes(category.id);
                const CategoryIcon = category.icon;
                const enabledCount = category.alerts.filter(a => settings[a.id]?.enabled).length;
                
                return (
                  <Card key={category.id} className={`glass-card border-${category.color}-500/30 bg-[#0f1629]/80`}>
                    <CardHeader 
                      className="pb-2 cursor-pointer"
                      onClick={() => toggleCategory(category.id)}
                    >
                      <CardTitle className="text-white text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className={`w-5 h-5 text-${category.color}-400`} />
                          {category.name}
                          <Badge className={`bg-${category.color}-500/20 text-${category.color}-400`}>
                            {enabledCount}/{category.alerts.length}
                          </Badge>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </CardTitle>
                    </CardHeader>
                    
                    {isExpanded && (
                      <CardContent>
                        <div className="space-y-4">
                          {category.alerts.map(alert => {
                            const AlertIcon = alert.icon;
                            const alertSettings = settings[alert.id];
                            
                            return (
                              <div key={alert.id} className={`p-4 rounded-lg ${alertSettings?.enabled ? 'bg-slate-800/50' : 'bg-slate-900/50 opacity-60'}`}>
                                {/* Alert Header */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <AlertIcon className={`w-4 h-4 text-${category.color}-400`} />
                                    <span className="text-white font-medium">{alert.name}</span>
                                  </div>
                                  <Switch
                                    checked={alertSettings?.enabled}
                                    onCheckedChange={(v) => updateAlertSetting(alert.id, 'enabled', v)}
                                  />
                                </div>

                                {alertSettings?.enabled && (
                                  <>
                                    {/* Severity Level */}
                                    <div className="mb-3">
                                      <Label className="text-slate-400 text-xs mb-2 block">مستوى الخطورة</Label>
                                      <div className="flex gap-2">
                                        {Object.entries(severityLevels).map(([key, config]) => (
                                          <Button
                                            key={key}
                                            size="sm"
                                            variant={alertSettings.severity === key ? 'default' : 'outline'}
                                            className={alertSettings.severity === key ? `bg-${config.color}-500 text-white` : 'border-slate-600 text-slate-400'}
                                            onClick={() => updateAlertSetting(alert.id, 'severity', key)}
                                          >
                                            {config.label}
                                          </Button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Channels */}
                                    <div>
                                      <Label className="text-slate-400 text-xs mb-2 block">قنوات الإشعار</Label>
                                      <div className="grid grid-cols-4 gap-2">
                                        {Object.entries(channelIcons).map(([channel, Icon]) => (
                                          <div 
                                            key={channel} 
                                            className={`p-2 rounded-lg border cursor-pointer transition-all ${alertSettings.channels?.[channel] ? 'bg-cyan-500/20 border-cyan-500/50' : 'bg-slate-800/30 border-slate-700'}`}
                                            onClick={() => updateAlertChannel(alert.id, channel, !alertSettings.channels?.[channel])}
                                          >
                                            <div className="flex flex-col items-center gap-1">
                                              <Icon className={`w-4 h-4 ${alertSettings.channels?.[channel] ? 'text-cyan-400' : 'text-slate-500'}`} />
                                              <span className={`text-xs ${alertSettings.channels?.[channel] ? 'text-white' : 'text-slate-500'}`}>
                                                {channel === 'app' ? 'تطبيق' : channel === 'sms' ? 'SMS' : channel === 'email' ? 'بريد' : 'صوت'}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  أيام العمل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-slate-400">تفعيل الجدولة</Label>
                  <Switch
                    checked={scheduleSettings.enabled}
                    onCheckedChange={(v) => setScheduleSettings({...scheduleSettings, enabled: v})}
                  />
                </div>
                
                {scheduleSettings.enabled && (
                  <div className="flex flex-wrap gap-2">
                    {days.map(day => (
                      <Button
                        key={day.id}
                        size="sm"
                        variant={scheduleSettings.workDays.includes(day.id) ? 'default' : 'outline'}
                        className={scheduleSettings.workDays.includes(day.id) ? 'bg-cyan-600' : 'border-slate-600 text-slate-400'}
                        onClick={() => {
                          const newDays = scheduleSettings.workDays.includes(day.id)
                            ? scheduleSettings.workDays.filter(d => d !== day.id)
                            : [...scheduleSettings.workDays, day.id];
                          setScheduleSettings({...scheduleSettings, workDays: newDays});
                        }}
                      >
                        {day.label}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  ساعات العمل
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scheduleSettings.enabled && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-slate-400 text-xs mb-1 block">وقت البداية</Label>
                        <Input
                          type="time"
                          value={scheduleSettings.startTime}
                          onChange={(e) => setScheduleSettings({...scheduleSettings, startTime: e.target.value})}
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-400 text-xs mb-1 block">وقت النهاية</Label>
                        <Input
                          type="time"
                          value={scheduleSettings.endTime}
                          onChange={(e) => setScheduleSettings({...scheduleSettings, endTime: e.target.value})}
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Label className="text-red-400 text-sm">السماح بالتنبيهات الحرجة في أي وقت</Label>
                        <Switch
                          checked={scheduleSettings.allowCriticalAnytime}
                          onCheckedChange={(v) => setScheduleSettings({...scheduleSettings, allowCriticalAnytime: v})}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Moon className="w-4 h-4 text-amber-400" />
                  وضع الهدوء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">تفعيل وضع الهدوء</p>
                    <p className="text-slate-400 text-sm">إيقاف جميع الإشعارات غير الحرجة مؤقتاً</p>
                  </div>
                  <Switch
                    checked={scheduleSettings.quietMode}
                    onCheckedChange={(v) => setScheduleSettings({...scheduleSettings, quietMode: v})}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* General Tab */}
        <TabsContent value="general" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">الحد الأدنى للخطورة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-xs mb-3">استلام التنبيهات من هذا المستوى وأعلى فقط</p>
                <Select value={globalSettings.minSeverityLevel} onValueChange={(v) => setGlobalSettings({...globalSettings, minSeverityLevel: v})}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(severityLevels).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">تجميع الإشعارات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-slate-400 text-sm">تجميع الإشعارات المتشابهة</Label>
                  <Switch
                    checked={globalSettings.groupNotifications}
                    onCheckedChange={(v) => setGlobalSettings({...globalSettings, groupNotifications: v})}
                  />
                </div>
                {globalSettings.groupNotifications && (
                  <div>
                    <Label className="text-slate-400 text-xs mb-2 block">فترة التجميع: {globalSettings.groupInterval} دقائق</Label>
                    <Slider
                      value={[globalSettings.groupInterval]}
                      onValueChange={([v]) => setGlobalSettings({...globalSettings, groupInterval: v})}
                      max={30}
                      min={1}
                      step={1}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-green-400" />
                  إعدادات الصوت
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-400 text-xs mb-2 block">مستوى الصوت: {globalSettings.soundVolume}%</Label>
                    <Slider
                      value={globalSettings.soundVolume}
                      onValueChange={(v) => setGlobalSettings({...globalSettings, soundVolume: v})}
                      max={100}
                      step={10}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-400 text-sm">الاهتزاز</Label>
                    <Switch
                      checked={globalSettings.vibration}
                      onCheckedChange={(v) => setGlobalSettings({...globalSettings, vibration: v})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">معلومات الاتصال</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-slate-400 text-xs mb-1 block">البريد الإلكتروني للإشعارات</Label>
                    <Input placeholder="example@email.com" className="bg-slate-800/50 border-slate-700 text-white" />
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs mb-1 block">رقم الهاتف للـ SMS</Label>
                    <Input placeholder="+966 5x xxx xxxx" className="bg-slate-800/50 border-slate-700 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}