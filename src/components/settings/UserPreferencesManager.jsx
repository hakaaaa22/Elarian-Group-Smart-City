import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Settings, Bell, Globe, Layout, Shield, Zap, Clock, Eye, Volume2,
  VolumeX, Mail, MessageSquare, Smartphone, Save, RotateCcw, User,
  Moon, Sun, Monitor, Keyboard, MousePointer, Accessibility, Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

const defaultPreferences = {
  // Notifications
  notifications: {
    enabled: true,
    sound: true,
    desktop: true,
    email: true,
    sms: false,
    push: true,
    quietHours: { enabled: false, start: '22:00', end: '07:00' },
    types: {
      alerts: true,
      updates: true,
      reports: true,
      system: true,
      marketing: false,
    },
    frequency: 'realtime',
  },
  // Display
  display: {
    language: 'ar',
    timezone: 'Asia/Riyadh',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    defaultDashboard: 'main',
    autoRefresh: true,
    refreshInterval: 30,
    tableRowsPerPage: 25,
  },
  // Behavior
  behavior: {
    confirmDelete: true,
    autoSave: true,
    autoSaveInterval: 5,
    keepSessionAlive: true,
    sessionTimeout: 30,
    rememberFilters: true,
    defaultView: 'grid',
  },
  // Accessibility
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    screenReader: false,
    keyboardNavigation: true,
  },
  // Privacy
  privacy: {
    activityTracking: true,
    analytics: true,
    personalizedAds: false,
    shareData: false,
    twoFactorAuth: false,
  },
};

export default function UserPreferencesManager() {
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('user_preferences');
    return saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences;
  });
  const [activeTab, setActiveTab] = useState('notifications');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user_preferences');
    if (saved) {
      const savedPrefs = JSON.parse(saved);
      setHasChanges(JSON.stringify(savedPrefs) !== JSON.stringify(preferences));
    }
  }, [preferences]);

  const savePreferences = () => {
    localStorage.setItem('user_preferences', JSON.stringify(preferences));
    toast.success('تم حفظ التفضيلات');
    setHasChanges(false);
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    toast.success('تم إعادة التعيين');
  };

  const updatePreference = (section, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const updateNestedPreference = (section, parent, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parent]: {
          ...prev[section][parent],
          [key]: value
        }
      }
    }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
            <Settings className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">تفضيلات المستخدم</h3>
            <p className="text-slate-400 text-sm">إدارة الإشعارات والعرض والسلوك</p>
          </div>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Badge className="bg-amber-500/20 text-amber-400 animate-pulse">
              تغييرات غير محفوظة
            </Badge>
          )}
          <Button variant="outline" className="border-slate-600" onClick={resetPreferences}>
            <RotateCcw className="w-4 h-4 ml-2" />
            إعادة تعيين
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={savePreferences}>
            <Save className="w-4 h-4 ml-2" />
            حفظ
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="notifications" className="data-[state=active]:bg-cyan-500/20">
            <Bell className="w-4 h-4 ml-1" />
            الإشعارات
          </TabsTrigger>
          <TabsTrigger value="display" className="data-[state=active]:bg-purple-500/20">
            <Layout className="w-4 h-4 ml-1" />
            العرض
          </TabsTrigger>
          <TabsTrigger value="behavior" className="data-[state=active]:bg-green-500/20">
            <Zap className="w-4 h-4 ml-1" />
            السلوك
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="data-[state=active]:bg-amber-500/20">
            <Accessibility className="w-4 h-4 ml-1" />
            إمكانية الوصول
          </TabsTrigger>
          <TabsTrigger value="privacy" className="data-[state=active]:bg-red-500/20">
            <Shield className="w-4 h-4 ml-1" />
            الخصوصية
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">قنوات الإشعارات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { key: 'enabled', label: 'تفعيل الإشعارات', icon: Bell },
                  { key: 'sound', label: 'الأصوات', icon: preferences.notifications.sound ? Volume2 : VolumeX },
                  { key: 'desktop', label: 'إشعارات سطح المكتب', icon: Monitor },
                  { key: 'email', label: 'البريد الإلكتروني', icon: Mail },
                  { key: 'sms', label: 'رسائل SMS', icon: MessageSquare },
                  { key: 'push', label: 'Push Notifications', icon: Smartphone },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-slate-400" />
                      <span className="text-white">{item.label}</span>
                    </div>
                    <Switch
                      checked={preferences.notifications[item.key]}
                      onCheckedChange={(v) => updatePreference('notifications', item.key, v)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">أنواع الإشعارات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'alerts', label: 'التنبيهات', desc: 'إشعارات عاجلة ومهمة' },
                { key: 'updates', label: 'التحديثات', desc: 'تحديثات على العناصر المتابعة' },
                { key: 'reports', label: 'التقارير', desc: 'التقارير المجدولة' },
                { key: 'system', label: 'النظام', desc: 'تحديثات وصيانة النظام' },
                { key: 'marketing', label: 'التسويق', desc: 'عروض ورسائل ترويجية' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{item.label}</p>
                    <p className="text-slate-400 text-sm">{item.desc}</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.types[item.key]}
                    onCheckedChange={(v) => updateNestedPreference('notifications', 'types', item.key, v)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                ساعات الهدوء
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">تفعيل ساعات الهدوء</span>
                <Switch
                  checked={preferences.notifications.quietHours.enabled}
                  onCheckedChange={(v) => updateNestedPreference('notifications', 'quietHours', 'enabled', v)}
                />
              </div>
              {preferences.notifications.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300 text-sm mb-1 block">من</Label>
                    <Input
                      type="time"
                      value={preferences.notifications.quietHours.start}
                      onChange={(e) => updateNestedPreference('notifications', 'quietHours', 'start', e.target.value)}
                      className="bg-slate-900/50 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-sm mb-1 block">إلى</Label>
                    <Input
                      type="time"
                      value={preferences.notifications.quietHours.end}
                      onChange={(e) => updateNestedPreference('notifications', 'quietHours', 'end', e.target.value)}
                      className="bg-slate-900/50 border-slate-700 text-white"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Tab */}
        <TabsContent value="display" className="mt-4 space-y-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300 text-sm mb-2 block">اللغة</Label>
                  <Select 
                    value={preferences.display.language} 
                    onValueChange={(v) => updatePreference('display', 'language', v)}
                  >
                    <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300 text-sm mb-2 block">المنطقة الزمنية</Label>
                  <Select 
                    value={preferences.display.timezone} 
                    onValueChange={(v) => updatePreference('display', 'timezone', v)}
                  >
                    <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="Asia/Riyadh">الرياض (GMT+3)</SelectItem>
                      <SelectItem value="Asia/Dubai">دبي (GMT+4)</SelectItem>
                      <SelectItem value="Africa/Cairo">القاهرة (GMT+2)</SelectItem>
                      <SelectItem value="Europe/London">لندن (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300 text-sm mb-2 block">تنسيق التاريخ</Label>
                  <Select 
                    value={preferences.display.dateFormat} 
                    onValueChange={(v) => updatePreference('display', 'dateFormat', v)}
                  >
                    <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300 text-sm mb-2 block">تنسيق الوقت</Label>
                  <Select 
                    value={preferences.display.timeFormat} 
                    onValueChange={(v) => updatePreference('display', 'timeFormat', v)}
                  >
                    <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="12h">12 ساعة (AM/PM)</SelectItem>
                      <SelectItem value="24h">24 ساعة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-medium">التحديث التلقائي</p>
                    <p className="text-slate-400 text-sm">تحديث البيانات تلقائياً</p>
                  </div>
                  <Switch
                    checked={preferences.display.autoRefresh}
                    onCheckedChange={(v) => updatePreference('display', 'autoRefresh', v)}
                  />
                </div>
                {preferences.display.autoRefresh && (
                  <div>
                    <Label className="text-slate-300 text-sm mb-2 block">
                      فترة التحديث: {preferences.display.refreshInterval} ثانية
                    </Label>
                    <Slider
                      value={[preferences.display.refreshInterval]}
                      onValueChange={([v]) => updatePreference('display', 'refreshInterval', v)}
                      min={10}
                      max={120}
                      step={10}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="mt-4 space-y-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4 space-y-4">
              {[
                { key: 'confirmDelete', label: 'تأكيد الحذف', desc: 'طلب تأكيد قبل حذف العناصر' },
                { key: 'autoSave', label: 'الحفظ التلقائي', desc: 'حفظ التغييرات تلقائياً' },
                { key: 'keepSessionAlive', label: 'إبقاء الجلسة نشطة', desc: 'منع انتهاء الجلسة تلقائياً' },
                { key: 'rememberFilters', label: 'تذكر الفلاتر', desc: 'حفظ آخر فلاتر مستخدمة' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{item.label}</p>
                    <p className="text-slate-400 text-sm">{item.desc}</p>
                  </div>
                  <Switch
                    checked={preferences.behavior[item.key]}
                    onCheckedChange={(v) => updatePreference('behavior', item.key, v)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accessibility Tab */}
        <TabsContent value="accessibility" className="mt-4 space-y-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4 space-y-4">
              {[
                { key: 'reducedMotion', label: 'تقليل الحركة', desc: 'تعطيل الرسوم المتحركة', icon: Eye },
                { key: 'highContrast', label: 'تباين عالي', desc: 'زيادة التباين للقراءة', icon: Sun },
                { key: 'largeText', label: 'نص كبير', desc: 'تكبير حجم الخط', icon: Eye },
                { key: 'keyboardNavigation', label: 'التنقل بلوحة المفاتيح', desc: 'تفعيل اختصارات لوحة المفاتيح', icon: Keyboard },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.accessibility[item.key]}
                    onCheckedChange={(v) => updatePreference('accessibility', item.key, v)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="mt-4 space-y-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4 space-y-4">
              {[
                { key: 'activityTracking', label: 'تتبع النشاط', desc: 'السماح بتتبع نشاطك لتحسين التجربة' },
                { key: 'analytics', label: 'التحليلات', desc: 'المساهمة في تحليلات الاستخدام' },
                { key: 'personalizedAds', label: 'إعلانات مخصصة', desc: 'عرض إعلانات بناءً على اهتماماتك' },
                { key: 'shareData', label: 'مشاركة البيانات', desc: 'مشاركة بيانات مجهولة مع شركاء' },
                { key: 'twoFactorAuth', label: 'التحقق بخطوتين', desc: 'تفعيل أمان إضافي للحساب' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{item.label}</p>
                    <p className="text-slate-400 text-sm">{item.desc}</p>
                  </div>
                  <Switch
                    checked={preferences.privacy[item.key]}
                    onCheckedChange={(v) => updatePreference('privacy', item.key, v)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}