import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, User, Bell, Monitor, Shield,
  Globe, Palette, Save, ChevronRight, Users, Lock, Eye,
  Home, Map, Car, Plane, Camera, Brain, AlertTriangle,
  Phone, Headphones, Database, Wifi, Server, Cloud,
  Zap, BarChart3, FileText, Building2, Radio, Cpu,
  Network, Key, Mail, MessageSquare, Smartphone, Clock,
  CalendarDays, Volume2, Languages, Moon, Sun, Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const users = [
  { id: 1, name: 'Andrea Barrett', email: 'andrea@example.com', role: 'Admin', status: 'active' },
  { id: 2, name: 'Jason Fischer', email: 'jason@example.com', role: 'User', status: 'active' },
  { id: 3, name: 'Elaine May', email: 'elaine@example.com', role: 'User', status: 'active' },
  { id: 4, name: 'Robert Chen', email: 'robert@example.com', role: 'Operator', status: 'inactive' },
];

// Module configurations
const moduleConfigs = {
  smartHome: {
    name: 'المنزل الذكي',
    icon: Home,
    color: 'cyan',
    settings: [
      { id: 'auto_discovery', label: 'اكتشاف تلقائي للأجهزة', type: 'switch', default: true },
      { id: 'energy_tracking', label: 'تتبع استهلاك الطاقة', type: 'switch', default: true },
      { id: 'voice_control', label: 'التحكم الصوتي', type: 'switch', default: false },
      { id: 'default_room', label: 'الغرفة الافتراضية', type: 'select', options: ['غرفة المعيشة', 'غرفة النوم', 'المطبخ'] },
      { id: 'temp_unit', label: 'وحدة الحرارة', type: 'select', options: ['سلسيوس', 'فهرنهايت'] },
    ]
  },
  smartCity: {
    name: 'المدينة الذكية',
    icon: Map,
    color: 'emerald',
    settings: [
      { id: 'map_style', label: 'نمط الخريطة', type: 'select', options: ['قمر صناعي', 'خريطة عادية', 'ثلاثي الأبعاد', 'ليلي'] },
      { id: 'traffic_layer', label: 'طبقة حركة المرور', type: 'switch', default: true },
      { id: 'incident_alerts', label: 'تنبيهات الحوادث', type: 'switch', default: true },
      { id: 'weather_overlay', label: 'طبقة الطقس', type: 'switch', default: false },
      { id: 'refresh_interval', label: 'معدل التحديث', type: 'select', options: ['5 ثواني', '10 ثواني', '30 ثانية', 'دقيقة'] },
      { id: 'zone_alerts', label: 'تنبيهات المناطق', type: 'switch', default: true },
    ]
  },
  callCenter: {
    name: 'مركز الاتصال',
    icon: Headphones,
    color: 'purple',
    settings: [
      { id: 'auto_answer', label: 'رد تلقائي', type: 'switch', default: false },
      { id: 'call_recording', label: 'تسجيل المكالمات', type: 'switch', default: true },
      { id: 'queue_alerts', label: 'تنبيهات الانتظار', type: 'switch', default: true },
      { id: 'max_queue_time', label: 'أقصى وقت انتظار', type: 'select', options: ['1 دقيقة', '3 دقائق', '5 دقائق', '10 دقائق'] },
      { id: 'priority_routing', label: 'توجيه حسب الأولوية', type: 'switch', default: true },
      { id: 'after_hours_mode', label: 'وضع خارج الدوام', type: 'select', options: ['رسالة صوتية', 'تحويل', 'إغلاق'] },
      { id: 'sentiment_analysis', label: 'تحليل المشاعر AI', type: 'switch', default: true },
    ]
  },
  fleet: {
    name: 'إدارة الأسطول',
    icon: Car,
    color: 'amber',
    settings: [
      { id: 'gps_tracking', label: 'تتبع GPS', type: 'switch', default: true },
      { id: 'speed_alerts', label: 'تنبيهات السرعة', type: 'switch', default: true },
      { id: 'speed_limit', label: 'حد السرعة (كم/س)', type: 'select', options: ['80', '100', '120', '140'] },
      { id: 'fuel_monitoring', label: 'مراقبة الوقود', type: 'switch', default: true },
      { id: 'maintenance_alerts', label: 'تنبيهات الصيانة', type: 'switch', default: true },
      { id: 'geofence_alerts', label: 'تنبيهات السياج الجغرافي', type: 'switch', default: true },
      { id: 'driver_behavior', label: 'تحليل سلوك السائق', type: 'switch', default: true },
    ]
  },
  drones: {
    name: 'الطائرات المسيرة',
    icon: Plane,
    color: 'blue',
    settings: [
      { id: 'auto_return', label: 'عودة تلقائية', type: 'switch', default: true },
      { id: 'battery_alert', label: 'تنبيه البطارية', type: 'select', options: ['20%', '30%', '40%'] },
      { id: 'flight_zone', label: 'منطقة الطيران', type: 'switch', default: true },
      { id: 'collision_avoid', label: 'تجنب الاصطدام', type: 'switch', default: true },
      { id: 'stream_quality', label: 'جودة البث', type: 'select', options: ['720p', '1080p', '4K'] },
      { id: 'night_vision', label: 'الرؤية الليلية', type: 'switch', default: false },
    ]
  },
  cameras: {
    name: 'الكاميرات والمراقبة',
    icon: Camera,
    color: 'red',
    settings: [
      { id: 'motion_detection', label: 'كشف الحركة', type: 'switch', default: true },
      { id: 'face_recognition', label: 'التعرف على الوجوه', type: 'switch', default: false },
      { id: 'recording_quality', label: 'جودة التسجيل', type: 'select', options: ['720p', '1080p', '4K'] },
      { id: 'retention_days', label: 'مدة الاحتفاظ', type: 'select', options: ['7 أيام', '14 يوم', '30 يوم', '90 يوم'] },
      { id: 'night_mode', label: 'الوضع الليلي التلقائي', type: 'switch', default: true },
      { id: 'audio_recording', label: 'تسجيل الصوت', type: 'switch', default: false },
    ]
  },
  ai: {
    name: 'الذكاء الاصطناعي',
    icon: Brain,
    color: 'pink',
    settings: [
      { id: 'predictive_analytics', label: 'التحليلات التنبؤية', type: 'switch', default: true },
      { id: 'auto_learning', label: 'التعلم التلقائي', type: 'switch', default: true },
      { id: 'anomaly_detection', label: 'كشف الشذوذ', type: 'switch', default: true },
      { id: 'model_updates', label: 'تحديث النماذج تلقائياً', type: 'switch', default: false },
      { id: 'confidence_threshold', label: 'حد الثقة', type: 'select', options: ['70%', '80%', '90%', '95%'] },
      { id: 'gpu_acceleration', label: 'تسريع GPU', type: 'switch', default: true },
    ]
  },
  incidents: {
    name: 'إدارة الحوادث',
    icon: AlertTriangle,
    color: 'orange',
    settings: [
      { id: 'auto_assign', label: 'تعيين تلقائي', type: 'switch', default: true },
      { id: 'escalation', label: 'التصعيد التلقائي', type: 'switch', default: true },
      { id: 'escalation_time', label: 'وقت التصعيد', type: 'select', options: ['15 دقيقة', '30 دقيقة', '1 ساعة', '2 ساعة'] },
      { id: 'priority_rules', label: 'قواعد الأولوية', type: 'switch', default: true },
      { id: 'sla_tracking', label: 'تتبع SLA', type: 'switch', default: true },
      { id: 'auto_close', label: 'إغلاق تلقائي', type: 'switch', default: false },
    ]
  },
  integrations: {
    name: 'التكاملات',
    icon: Wifi,
    color: 'indigo',
    settings: [
      { id: 'api_enabled', label: 'تفعيل API', type: 'switch', default: true },
      { id: 'webhook_enabled', label: 'Webhooks', type: 'switch', default: false },
      { id: 'sync_interval', label: 'معدل المزامنة', type: 'select', options: ['فوري', 'كل دقيقة', 'كل 5 دقائق', 'كل ساعة'] },
      { id: 'bms_integration', label: 'تكامل BMS', type: 'switch', default: false },
      { id: 'erp_sync', label: 'مزامنة ERP', type: 'switch', default: false },
    ]
  },
  backup: {
    name: 'النسخ الاحتياطي',
    icon: Cloud,
    color: 'slate',
    settings: [
      { id: 'auto_backup', label: 'نسخ احتياطي تلقائي', type: 'switch', default: true },
      { id: 'backup_frequency', label: 'تكرار النسخ', type: 'select', options: ['يومي', 'أسبوعي', 'شهري'] },
      { id: 'retention_period', label: 'مدة الاحتفاظ', type: 'select', options: ['30 يوم', '90 يوم', '1 سنة', 'دائم'] },
      { id: 'encryption', label: 'تشفير النسخ', type: 'switch', default: true },
      { id: 'cloud_sync', label: 'مزامنة سحابية', type: 'switch', default: true },
    ]
  }
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account');
  const [activeModuleTab, setActiveModuleTab] = useState('smartHome');
  const [currentUser, setCurrentUser] = useState(null);
  const [moduleSettings, setModuleSettings] = useState({});
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    incidents: true,
    reports: true,
  });

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
    // Initialize module settings
    const initialSettings = {};
    Object.entries(moduleConfigs).forEach(([key, config]) => {
      initialSettings[key] = {};
      config.settings.forEach(setting => {
        initialSettings[key][setting.id] = setting.default || (setting.options ? setting.options[0] : '');
      });
    });
    setModuleSettings(initialSettings);
  }, []);

  const updateModuleSetting = (module, settingId, value) => {
    setModuleSettings(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [settingId]: value
      }
    }));
  };

  const saveModuleSettings = (module) => {
    toast.success(`تم حفظ إعدادات ${moduleConfigs[module].name}`);
  };

  const settingsSections = [
    { id: 'account', label: 'الحساب', icon: User },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'display', label: 'العرض', icon: Monitor },
    { id: 'security', label: 'الأمان', icon: Shield },
    { id: 'modules', label: 'إعدادات الوحدات', icon: Layers },
    { id: 'users', label: 'المستخدمون', icon: Users },
    { id: 'system', label: 'النظام', icon: Server },
  ];

  const renderModuleSettings = (moduleKey) => {
    const config = moduleConfigs[moduleKey];
    const settings = moduleSettings[moduleKey] || {};
    const Icon = config.icon;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-${config.color}-500/20`}>
              <Icon className={`w-6 h-6 text-${config.color}-400`} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{config.name}</h3>
              <p className="text-slate-400 text-sm">{config.settings.length} إعدادات</p>
            </div>
          </div>
          <Button 
            className={`bg-${config.color}-600 hover:bg-${config.color}-700`}
            onClick={() => saveModuleSettings(moduleKey)}
          >
            <Save className="w-4 h-4 ml-2" />
            حفظ
          </Button>
        </div>

        <div className="grid gap-3">
          {config.settings.map((setting) => (
            <div 
              key={setting.id} 
              className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800/70 transition-colors"
            >
              <div>
                <p className="text-white font-medium">{setting.label}</p>
              </div>
              {setting.type === 'switch' ? (
                <Switch
                  checked={settings[setting.id] ?? setting.default}
                  onCheckedChange={(checked) => updateModuleSetting(moduleKey, setting.id, checked)}
                />
              ) : (
                <Select
                  value={settings[setting.id] || setting.options[0]}
                  onValueChange={(value) => updateModuleSetting(moduleKey, setting.id, value)}
                >
                  <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {setting.options.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-slate-400" />
          الإعدادات
        </h1>
        <p className="text-slate-400 mt-1">إدارة حسابك وإعدادات النظام والوحدات</p>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Settings Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-2">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === section.id
                      ? 'bg-indigo-500/20 text-cyan-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span>{section.label}</span>
                  <ChevronRight className="w-4 h-4 mr-auto" />
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4"
        >
          {activeTab === 'account' && (
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="border-b border-slate-700/50">
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-cyan-400" />
                  إعدادات الحساب
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                    <span className="text-3xl text-white font-bold">
                      {currentUser?.full_name?.[0] || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-semibold">{currentUser?.full_name || 'User'}</h3>
                    <p className="text-slate-400">{currentUser?.email}</p>
                    <Badge className="mt-2 bg-cyan-500/20 text-cyan-400 border-cyan-500/30 border">
                      {currentUser?.role || 'Operator'}
                    </Badge>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-400">الاسم الكامل</Label>
                    <Input 
                      defaultValue={currentUser?.full_name}
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400">البريد الإلكتروني</Label>
                    <Input 
                      defaultValue={currentUser?.email}
                      disabled
                      className="bg-slate-800/50 border-slate-700 text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400">الهاتف</Label>
                    <Input 
                      placeholder="+966 5XX XXX XXXX"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400">القسم</Label>
                    <Input 
                      placeholder="عمليات الأمن"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <Button className="bg-cyan-500 hover:bg-cyan-600">
                  <Save className="w-4 h-4 ml-2" />
                  حفظ التغييرات
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="border-b border-slate-700/50">
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400" />
                  إعدادات الإشعارات
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {[
                  { key: 'email', label: 'إشعارات البريد', desc: 'تلقي تنبيهات عبر البريد', icon: Mail },
                  { key: 'push', label: 'إشعارات الدفع', desc: 'تنبيهات المتصفح الفورية', icon: Bell },
                  { key: 'sms', label: 'رسائل SMS', desc: 'تنبيهات الحوادث الحرجة', icon: MessageSquare },
                  { key: 'incidents', label: 'تنبيهات الحوادث', desc: 'إشعارات الحوادث الجديدة', icon: AlertTriangle },
                  { key: 'reports', label: 'التقارير', desc: 'التقارير الأسبوعية والشهرية', icon: FileText },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-white font-medium">{item.label}</p>
                        <p className="text-slate-400 text-sm">{item.desc}</p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications[item.key]}
                      onCheckedChange={(checked) => setNotifications({...notifications, [item.key]: checked})}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === 'display' && (
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="border-b border-slate-700/50">
                <CardTitle className="text-white flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-purple-400" />
                  إعدادات العرض
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { icon: Moon, label: 'السمة', options: ['داكن', 'فاتح', 'تلقائي'] },
                    { icon: Languages, label: 'اللغة', options: ['العربية', 'English', 'Français'] },
                    { icon: Monitor, label: 'تخطيط اللوحة', options: ['مضغوط', 'موسع', 'كامل'] },
                    { icon: Map, label: 'نمط الخريطة', options: ['قمر صناعي', 'عادي', 'ثلاثي الأبعاد'] },
                    { icon: Clock, label: 'تنسيق الوقت', options: ['24 ساعة', '12 ساعة'] },
                    { icon: CalendarDays, label: 'تنسيق التاريخ', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-slate-800/50 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <item.icon className="w-5 h-5 text-slate-400" />
                        <span className="text-white font-medium">{item.label}</span>
                      </div>
                      <Select defaultValue={item.options[0]}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {item.options.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="border-b border-slate-700/50">
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  إعدادات الأمان
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <h3 className="text-white font-medium mb-4">تغيير كلمة المرور</h3>
                  <div className="space-y-3">
                    <Input type="password" placeholder="كلمة المرور الحالية" className="bg-slate-700 border-slate-600 text-white" />
                    <Input type="password" placeholder="كلمة المرور الجديدة" className="bg-slate-700 border-slate-600 text-white" />
                    <Input type="password" placeholder="تأكيد كلمة المرور" className="bg-slate-700 border-slate-600 text-white" />
                    <Button className="bg-emerald-500 hover:bg-emerald-600">تحديث كلمة المرور</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-white font-medium">المصادقة الثنائية</p>
                      <p className="text-slate-400 text-sm">إضافة طبقة أمان إضافية</p>
                    </div>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-white font-medium">انتهاء الجلسة</p>
                      <p className="text-slate-400 text-sm">تسجيل خروج تلقائي</p>
                    </div>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="15">15 دقيقة</SelectItem>
                      <SelectItem value="30">30 دقيقة</SelectItem>
                      <SelectItem value="60">ساعة</SelectItem>
                      <SelectItem value="240">4 ساعات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'modules' && (
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="border-b border-slate-700/50">
                <CardTitle className="text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  إعدادات الوحدات
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700/50 pb-4">
                  {Object.entries(moduleConfigs).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setActiveModuleTab(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          activeModuleTab === key
                            ? `bg-${config.color}-500/20 text-${config.color}-400 border border-${config.color}-500/50`
                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{config.name}</span>
                      </button>
                    );
                  })}
                </div>
                {renderModuleSettings(activeModuleTab)}
              </CardContent>
            </Card>
          )}

          {activeTab === 'users' && (
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="border-b border-slate-700/50">
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    المستخدمون والأدوار
                  </span>
                  <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600">
                    إضافة مستخدم
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-slate-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${
                          user.role === 'Admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {user.role}
                        </Badge>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'system' && (
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="border-b border-slate-700/50">
                <CardTitle className="text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-slate-400" />
                  إعدادات النظام
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* System Status */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                    <Server className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-green-400 font-bold">متصل</p>
                    <p className="text-slate-400 text-xs">حالة الخادم</p>
                  </div>
                  <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-center">
                    <Database className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                    <p className="text-cyan-400 font-bold">85%</p>
                    <p className="text-slate-400 text-xs">سعة التخزين</p>
                  </div>
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                    <Cpu className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-amber-400 font-bold">42%</p>
                    <p className="text-slate-400 text-xs">استخدام المعالج</p>
                  </div>
                </div>

                {/* System Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-white font-medium">حجم قاعدة البيانات</p>
                        <p className="text-slate-400 text-sm">إجمالي البيانات المخزنة</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-white font-bold">2.4 GB</p>
                      <Progress value={85} className="w-24 h-2" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Network className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-white font-medium">عنوان API</p>
                        <p className="text-slate-400 text-sm">نقطة الاتصال الرئيسية</p>
                      </div>
                    </div>
                    <code className="text-cyan-400 bg-slate-900 px-3 py-1 rounded text-sm">api.elarian.com</code>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-white font-medium">المنطقة الزمنية</p>
                        <p className="text-slate-400 text-sm">توقيت النظام</p>
                      </div>
                    </div>
                    <Select defaultValue="asia_riyadh">
                      <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="asia_riyadh">Asia/Riyadh (GMT+3)</SelectItem>
                        <SelectItem value="asia_dubai">Asia/Dubai (GMT+4)</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                  مسح ذاكرة التخزين المؤقت
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}