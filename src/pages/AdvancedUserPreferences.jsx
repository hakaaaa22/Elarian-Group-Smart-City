import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Settings, Palette, Bell, Keyboard, Layout, Zap, Save, RefreshCw,
  Moon, Sun, Monitor, Volume2, Eye, Clock, Star, Filter, Type, Maximize2,
  Minimize2, Sparkles, CheckCircle, Accessibility
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

// Predefined Themes
const predefinedThemes = [
  { id: 'default', name: 'الافتراضي', primary: '#22d3ee', secondary: '#a855f7', bg: '#0a0e1a', mode: 'dark' },
  { id: 'ocean', name: 'المحيط', primary: '#0ea5e9', secondary: '#06b6d4', bg: '#0c1929', mode: 'dark' },
  { id: 'forest', name: 'الغابة', primary: '#22c55e', secondary: '#84cc16', bg: '#0a1a0f', mode: 'dark' },
  { id: 'sunset', name: 'الغروب', primary: '#f97316', secondary: '#ef4444', bg: '#1a0f0a', mode: 'dark' },
  { id: 'royal', name: 'ملكي', primary: '#8b5cf6', secondary: '#ec4899', bg: '#0f0a1a', mode: 'dark' },
  { id: 'high-contrast', name: 'تباين عالي', primary: '#ffffff', secondary: '#ffff00', bg: '#000000', mode: 'dark', accessibility: true },
  { id: 'accessibility', name: 'سهولة الوصول', primary: '#0066cc', secondary: '#009900', bg: '#ffffff', mode: 'light', accessibility: true },
  { id: 'light-clean', name: 'فاتح نظيف', primary: '#3b82f6', secondary: '#8b5cf6', bg: '#f8fafc', mode: 'light' },
];

// Font Families
const fontFamilies = [
  { id: 'default', name: 'الافتراضي', value: 'system-ui, sans-serif', nameAr: 'النظام' },
  { id: 'cairo', name: 'Cairo', value: '"Cairo", sans-serif', nameAr: 'القاهرة' },
  { id: 'tajawal', name: 'Tajawal', value: '"Tajawal", sans-serif', nameAr: 'تجوال' },
  { id: 'almarai', name: 'Almarai', value: '"Almarai", sans-serif', nameAr: 'المراعي' },
  { id: 'ibm-plex', name: 'IBM Plex', value: '"IBM Plex Sans Arabic", sans-serif', nameAr: 'IBM بلكس' },
  { id: 'roboto', name: 'Roboto', value: '"Roboto", sans-serif', nameAr: 'روبوتو' },
  { id: 'inter', name: 'Inter', value: '"Inter", sans-serif', nameAr: 'إنتر' },
];

// Density Options
const densityOptions = [
  { id: 'compact', name: 'مضغوط', spacing: 0.75, padding: 'p-2', gap: 'gap-2' },
  { id: 'comfortable', name: 'مريح', spacing: 1, padding: 'p-4', gap: 'gap-4' },
  { id: 'spacious', name: 'فسيح', spacing: 1.25, padding: 'p-6', gap: 'gap-6' },
];

const defaultShortcuts = {
  globalSearch: 'ctrl+k',
  quickCommand: 'ctrl+j',
  newTask: 'ctrl+n',
  dashboard: 'ctrl+h',
  notifications: 'ctrl+shift+n',
  aiAssistant: 'ctrl+space',
  reports: 'ctrl+r',
  settings: 'ctrl+,',
};

export default function AdvancedUserPreferences() {
  const [preferences, setPreferences] = useState({
    theme: {
      mode: 'dark',
      preset: 'default',
      primaryColor: '#22d3ee',
      secondaryColor: '#a855f7',
      backgroundColor: '#0a0e1a',
      fontSize: 14,
      fontFamily: 'default',
      borderRadius: 8,
      density: 'comfortable',
      animations: true,
      animationSpeed: 'normal',
      reducedMotion: false,
      highContrast: false,
      largeText: false
    },
    keyboard_shortcuts: defaultShortcuts,
    notification_preferences: {
      email: true,
      push: true,
      sms: false,
      sound: true,
      desktop: true,
      priorities: { critical: true, high: true, medium: true, low: false },
      quiet_hours: { enabled: false, start: '22:00', end: '08:00' },
      grouping: true,
      auto_read_after: 30
    },
    sidebar_collapsed: false,
    language: 'ar'
  });

  const applyPresetTheme = (presetId) => {
    const preset = predefinedThemes.find(t => t.id === presetId);
    if (preset) {
      setPreferences(prev => ({
        ...prev,
        theme: {
          ...prev.theme,
          preset: presetId,
          primaryColor: preset.primary,
          secondaryColor: preset.secondary,
          backgroundColor: preset.bg,
          mode: preset.mode,
          highContrast: preset.accessibility || false
        }
      }));
      toast.success(`تم تطبيق ثيم "${preset.name}"`);
    }
  };

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.preferences) {
          setPreferences(prev => ({ ...prev, ...user.preferences }));
        }
      } catch (e) {}
    };
    loadPreferences();
  }, []);

  const savePreferences = useMutation({
    mutationFn: async () => {
      await base44.auth.updateMe({ preferences });
      return true;
    },
    onSuccess: () => {
      toast.success('تم حفظ التفضيلات');
    }
  });

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Settings className="w-8 h-8 text-cyan-400" />
              الإعدادات المتقدمة
            </h1>
            <p className="text-slate-400 mt-1">تخصيص شامل لتجربتك</p>
          </div>
          <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => savePreferences.mutate()}>
            <Save className="w-4 h-4 ml-2" />
            حفظ التغييرات
          </Button>
        </div>
      </motion.div>

      <Tabs defaultValue="theme">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="theme"><Palette className="w-4 h-4 ml-1" />المظهر</TabsTrigger>
          <TabsTrigger value="shortcuts"><Keyboard className="w-4 h-4 ml-1" />الاختصارات</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 ml-1" />الإشعارات</TabsTrigger>
          <TabsTrigger value="interface"><Layout className="w-4 h-4 ml-1" />الواجهة</TabsTrigger>
        </TabsList>

        {/* Theme Tab */}
        <TabsContent value="theme" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Predefined Themes */}
            <Card className="glass-card border-purple-500/20 bg-[#0f1629]/80 lg:col-span-2">
              <CardHeader><CardTitle className="text-white text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400" />الثيمات الجاهزة</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {predefinedThemes.map(theme => (
                    <div
                      key={theme.id}
                      onClick={() => applyPresetTheme(theme.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${preferences.theme.preset === theme.id ? 'border-cyan-500 ring-2 ring-cyan-500/30' : 'border-slate-700 hover:border-slate-600'}`}
                      style={{ backgroundColor: theme.bg }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.secondary }} />
                        {theme.accessibility && <Accessibility className="w-4 h-4 text-amber-400" />}
                      </div>
                      <p className="text-white text-sm">{theme.name}</p>
                      <Badge className={`mt-1 text-xs ${theme.mode === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                        {theme.mode === 'dark' ? 'داكن' : 'فاتح'}
                      </Badge>
                      {preferences.theme.preset === theme.id && <CheckCircle className="w-4 h-4 text-cyan-400 mt-2" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Colors */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader><CardTitle className="text-white text-sm flex items-center gap-2"><Palette className="w-4 h-4 text-cyan-400" />الألوان المخصصة</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300">الوضع</Label>
                  <Select value={preferences.theme.mode} onValueChange={(v) => setPreferences(prev => ({ ...prev, theme: { ...prev.theme, mode: v } }))}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark"><Moon className="w-4 h-4 inline ml-1" />داكن</SelectItem>
                      <SelectItem value="light"><Sun className="w-4 h-4 inline ml-1" />فاتح</SelectItem>
                      <SelectItem value="auto"><Monitor className="w-4 h-4 inline ml-1" />تلقائي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">اللون الأساسي</Label>
                  <div className="flex gap-2 mt-2">
                    <Input type="color" value={preferences.theme.primaryColor} onChange={(e) => setPreferences(prev => ({ ...prev, theme: { ...prev.theme, primaryColor: e.target.value, preset: 'custom' } }))} className="w-12 h-10 p-1 bg-slate-800/50 border-slate-700" />
                    <Input value={preferences.theme.primaryColor} onChange={(e) => setPreferences(prev => ({ ...prev, theme: { ...prev.theme, primaryColor: e.target.value, preset: 'custom' } }))} className="bg-slate-800/50 border-slate-700 text-white" />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">اللون الثانوي</Label>
                  <div className="flex gap-2 mt-2">
                    <Input type="color" value={preferences.theme.secondaryColor} onChange={(e) => setPreferences(prev => ({ ...prev, theme: { ...prev.theme, secondaryColor: e.target.value, preset: 'custom' } }))} className="w-12 h-10 p-1 bg-slate-800/50 border-slate-700" />
                    <Input value={preferences.theme.secondaryColor} onChange={(e) => setPreferences(prev => ({ ...prev, theme: { ...prev.theme, secondaryColor: e.target.value, preset: 'custom' } }))} className="bg-slate-800/50 border-slate-700 text-white" />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">نصف قطر الحواف: {preferences.theme.borderRadius}px</Label>
                  <Slider value={[preferences.theme.borderRadius]} onValueChange={([v]) => setPreferences(prev => ({ ...prev, theme: { ...prev.theme, borderRadius: v } }))} min={0} max={20} step={2} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            {/* Typography */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader><CardTitle className="text-white text-sm flex items-center gap-2"><Type className="w-4 h-4 text-green-400" />الخطوط</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300">نوع الخط</Label>
                  <Select value={preferences.theme.fontFamily} onValueChange={(v) => setPreferences(prev => ({ ...prev, theme: { ...prev.theme, fontFamily: v } }))}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map(font => (
                        <SelectItem key={font.id} value={font.id} style={{ fontFamily: font.value }}>
                          {font.nameAr} ({font.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">حجم الخط: {preferences.theme.fontSize}px</Label>
                  <Slider value={[preferences.theme.fontSize]} onValueChange={([v]) => setPreferences(prev => ({ ...prev, theme: { ...prev.theme, fontSize: v } }))} min={12} max={20} step={1} className="mt-2" />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">نص كبير</Label>
                    <p className="text-slate-500 text-xs">زيادة حجم النص للقراءة السهلة</p>
                  </div>
                  <Switch checked={preferences.theme.largeText} onCheckedChange={(v) => setPreferences(prev => ({ ...prev, theme: { ...prev.theme, largeText: v, fontSize: v ? 18 : 14 } }))} />
                </div>
              </CardContent>
            </Card>

            {/* Density & Spacing */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader><CardTitle className="text-white text-sm flex items-center gap-2"><Layout className="w-4 h-4 text-amber-400" />الكثافة والمسافات</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300 mb-3 block">كثافة العرض</Label>
                  <RadioGroup value={preferences.theme.density} onValueChange={(v) => setPreferences(prev => ({ ...prev, theme: { ...prev.theme, density: v } }))}>
                    {densityOptions.map(option => (
                      <div key={option.id} className="flex items-center space-x-2 space-x-reverse p-3 bg-slate-800/50 rounded-lg mb-2">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="flex items-center gap-2 cursor-pointer flex-1">
                          {option.id === 'compact' && <Minimize2 className="w-4 h-4 text-cyan-400" />}
                          {option.id === 'comfortable' && <Layout className="w-4 h-4 text-green-400" />}
                          {option.id === 'spacious' && <Maximize2 className="w-4 h-4 text-purple-400" />}
                          <span className="text-white">{option.name}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Animations */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader><CardTitle className="text-white text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" />الحركات والتأثيرات</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">تفعيل الحركات</Label>
                    <p className="text-slate-500 text-xs">التأثيرات البصرية والانتقالات</p>
                  </div>
                  <Switch checked={preferences.theme.animations} onCheckedChange={(v) => setPreferences(prev => ({ ...prev, theme: { ...prev.theme, animations: v } }))} />
                </div>
                {preferences.theme.animations && (
                  <div>
                    <Label className="text-slate-300">سرعة الحركات</Label>
                    <Select value={preferences.theme.animationSpeed} onValueChange={(v) => setPreferences(prev => ({ ...prev, theme: { ...prev.theme, animationSpeed: v } }))}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slow">بطيء</SelectItem>
                        <SelectItem value="normal">عادي</SelectItem>
                        <SelectItem value="fast">سريع</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">تقليل الحركة</Label>
                    <p className="text-slate-500 text-xs">للمستخدمين الحساسين للحركة</p>
                  </div>
                  <Switch checked={preferences.theme.reducedMotion} onCheckedChange={(v) => setPreferences(prev => ({ ...prev, theme: { ...prev.theme, reducedMotion: v, animations: !v } }))} />
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div>
                    <Label className="text-amber-300 flex items-center gap-2">
                      <Accessibility className="w-4 h-4" />
                      تباين عالي
                    </Label>
                    <p className="text-slate-500 text-xs">تحسين الرؤية للمستخدمين</p>
                  </div>
                  <Switch checked={preferences.theme.highContrast} onCheckedChange={(v) => setPreferences(prev => ({ ...prev, theme: { ...prev.theme, highContrast: v } }))} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Shortcuts Tab */}
        <TabsContent value="shortcuts" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader><CardTitle className="text-white text-sm">اختصارات لوحة المفاتيح</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(defaultShortcuts).map(([key, defaultValue]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <Label className="text-slate-300">{key === 'globalSearch' ? 'البحث العام' : key === 'quickCommand' ? 'الأوامر السريعة' : key === 'newTask' ? 'مهمة جديدة' : key === 'dashboard' ? 'لوحة التحكم' : key === 'notifications' ? 'الإشعارات' : key === 'aiAssistant' ? 'مساعد AI' : key === 'reports' ? 'التقارير' : 'الإعدادات'}</Label>
                  <Input value={preferences.keyboard_shortcuts[key] || defaultValue} onChange={(e) => setPreferences(prev => ({ ...prev, keyboard_shortcuts: { ...prev.keyboard_shortcuts, [key]: e.target.value } }))} className="w-32 bg-slate-900 border-slate-700 text-white text-center" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader><CardTitle className="text-white text-sm">قنوات الإشعارات</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { key: 'email', label: 'البريد الإلكتروني', icon: Bell },
                  { key: 'push', label: 'إشعارات الدفع', icon: Zap },
                  { key: 'sms', label: 'رسائل SMS', icon: Bell },
                  { key: 'sound', label: 'الصوت', icon: Volume2 },
                  { key: 'desktop', label: 'سطح المكتب', icon: Monitor },
                ].map(channel => (
                  <div key={channel.key} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <channel.icon className="w-4 h-4 text-cyan-400" />
                      <Label className="text-slate-300">{channel.label}</Label>
                    </div>
                    <Switch checked={preferences.notification_preferences[channel.key]} onCheckedChange={(v) => setPreferences(prev => ({ ...prev, notification_preferences: { ...prev.notification_preferences, [channel.key]: v } }))} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader><CardTitle className="text-white text-sm">الأولويات</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {['critical', 'high', 'medium', 'low'].map(priority => (
                  <div key={priority} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <Label className="text-slate-300">{priority === 'critical' ? 'حرج' : priority === 'high' ? 'عالي' : priority === 'medium' ? 'متوسط' : 'منخفض'}</Label>
                    <Switch checked={preferences.notification_preferences.priorities[priority]} onCheckedChange={(v) => setPreferences(prev => ({ ...prev, notification_preferences: { ...prev.notification_preferences, priorities: { ...prev.notification_preferences.priorities, [priority]: v } } }))} />
                  </div>
                ))}
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-slate-300">ساعات الهدوء</Label>
                    <Switch checked={preferences.notification_preferences.quiet_hours.enabled} onCheckedChange={(v) => setPreferences(prev => ({ ...prev, notification_preferences: { ...prev.notification_preferences, quiet_hours: { ...prev.notification_preferences.quiet_hours, enabled: v } } }))} />
                  </div>
                  {preferences.notification_preferences.quiet_hours.enabled && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Input type="time" value={preferences.notification_preferences.quiet_hours.start} onChange={(e) => setPreferences(prev => ({ ...prev, notification_preferences: { ...prev.notification_preferences, quiet_hours: { ...prev.notification_preferences.quiet_hours, start: e.target.value } } }))} className="bg-slate-900 border-slate-700 text-white" />
                      <Input type="time" value={preferences.notification_preferences.quiet_hours.end} onChange={(e) => setPreferences(prev => ({ ...prev, notification_preferences: { ...prev.notification_preferences, quiet_hours: { ...prev.notification_preferences.quiet_hours, end: e.target.value } } }))} className="bg-slate-900 border-slate-700 text-white" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}