import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  Settings, Keyboard, Bell, Palette, Monitor, Volume2, VolumeX, Save,
  RefreshCw, Plus, Trash2, Edit, Check, X, Sun, Moon, Type, Contrast,
  Layout, Layers, Clock, Mail, MessageSquare, Users, Share2, Zap,
  AlertTriangle, Info, CheckCircle, Filter, Eye, EyeOff, Smartphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// اختصارات لوحة المفاتيح الافتراضية
const defaultShortcuts = [
  { id: 's1', action: 'فتح البحث', keys: 'Ctrl+K', category: 'navigation' },
  { id: 's2', action: 'الانتقال للوحة التحكم', keys: 'Ctrl+D', category: 'navigation' },
  { id: 's3', action: 'فتح الإشعارات', keys: 'Ctrl+N', category: 'navigation' },
  { id: 's4', action: 'تحديث البيانات', keys: 'Ctrl+R', category: 'actions' },
  { id: 's5', action: 'إنشاء تقرير جديد', keys: 'Ctrl+Shift+R', category: 'actions' },
  { id: 's6', action: 'تبديل المظهر', keys: 'Ctrl+T', category: 'appearance' },
  { id: 's7', action: 'إغلاق النافذة', keys: 'Escape', category: 'general' },
  { id: 's8', action: 'حفظ التغييرات', keys: 'Ctrl+S', category: 'actions' },
];

// إعدادات الإشعارات الافتراضية
const defaultNotificationSettings = {
  enabled: true,
  sound: true,
  desktop: true,
  grouping: 'smart',
  groupingInterval: 5,
  priorities: {
    critical: { enabled: true, sound: true, desktop: true, email: true },
    high: { enabled: true, sound: true, desktop: true, email: false },
    medium: { enabled: true, sound: false, desktop: true, email: false },
    low: { enabled: true, sound: false, desktop: false, email: false },
  },
  quietHours: { enabled: false, start: '22:00', end: '07:00' },
  categories: {
    alerts: true,
    insights: true,
    tasks: true,
    system: true,
    collaboration: true,
  }
};

// إعدادات المظهر الافتراضية
const defaultAppearanceSettings = {
  theme: 'dark',
  accentColor: '#22d3ee',
  fontFamily: 'Tajawal',
  fontSize: 14,
  contrast: 'normal',
  animations: true,
  compactMode: false,
  sidebarCollapsed: false,
  borderRadius: 8,
  cardStyle: 'glass',
};

const fontOptions = [
  { value: 'Tajawal', label: 'Tajawal' },
  { value: 'Cairo', label: 'Cairo' },
  { value: 'Almarai', label: 'Almarai' },
  { value: 'IBM Plex Sans Arabic', label: 'IBM Plex Sans Arabic' },
];

const accentColors = [
  { value: '#22d3ee', name: 'سماوي' },
  { value: '#a855f7', name: 'بنفسجي' },
  { value: '#22c55e', name: 'أخضر' },
  { value: '#f59e0b', name: 'برتقالي' },
  { value: '#ef4444', name: 'أحمر' },
  { value: '#3b82f6', name: 'أزرق' },
  { value: '#ec4899', name: 'وردي' },
];

export default function AdvancedSettings() {
  const [activeTab, setActiveTab] = useState('shortcuts');
  const [shortcuts, setShortcuts] = useState(defaultShortcuts);
  const [notificationSettings, setNotificationSettings] = useState(defaultNotificationSettings);
  const [appearanceSettings, setAppearanceSettings] = useState(defaultAppearanceSettings);
  const [editingShortcut, setEditingShortcut] = useState(null);
  const [recordingKeys, setRecordingKeys] = useState(false);
  const [newKeys, setNewKeys] = useState('');

  // تحميل الإعدادات المحفوظة
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.advanced_settings) {
          if (user.advanced_settings.shortcuts) setShortcuts(user.advanced_settings.shortcuts);
          if (user.advanced_settings.notifications) setNotificationSettings(prev => ({ ...prev, ...user.advanced_settings.notifications }));
          if (user.advanced_settings.appearance) setAppearanceSettings(prev => ({ ...prev, ...user.advanced_settings.appearance }));
        }
      } catch (e) {}
    };
    loadSettings();
  }, []);

  // حفظ جميع الإعدادات
  const saveAllSettings = async () => {
    try {
      await base44.auth.updateMe({
        advanced_settings: {
          shortcuts,
          notifications: notificationSettings,
          appearance: appearanceSettings,
        }
      });
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (e) {
      toast.error('فشل في حفظ الإعدادات');
    }
  };

  // تسجيل اختصار جديد
  const startRecordingKeys = (shortcutId) => {
    setEditingShortcut(shortcutId);
    setRecordingKeys(true);
    setNewKeys('');
  };

  useEffect(() => {
    if (!recordingKeys) return;

    const handleKeyDown = (e) => {
      e.preventDefault();
      const keys = [];
      if (e.ctrlKey) keys.push('Ctrl');
      if (e.shiftKey) keys.push('Shift');
      if (e.altKey) keys.push('Alt');
      if (e.key && !['Control', 'Shift', 'Alt'].includes(e.key)) {
        keys.push(e.key.toUpperCase());
      }
      setNewKeys(keys.join('+'));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [recordingKeys]);

  const saveShortcut = () => {
    if (newKeys && editingShortcut) {
      setShortcuts(prev => prev.map(s => 
        s.id === editingShortcut ? { ...s, keys: newKeys } : s
      ));
      setEditingShortcut(null);
      setRecordingKeys(false);
      setNewKeys('');
      toast.success('تم تحديث الاختصار');
    }
  };

  const cancelRecording = () => {
    setEditingShortcut(null);
    setRecordingKeys(false);
    setNewKeys('');
  };

  const resetToDefaults = () => {
    setShortcuts(defaultShortcuts);
    setNotificationSettings(defaultNotificationSettings);
    setAppearanceSettings(defaultAppearanceSettings);
    toast.success('تم إعادة التعيين للإعدادات الافتراضية');
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Settings className="w-8 h-8 text-cyan-400" />
              الإعدادات المتقدمة
            </h1>
            <p className="text-slate-400 mt-1">تخصيص تجربة استخدام التطبيق</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-amber-500 text-amber-400" onClick={resetToDefaults}>
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة تعيين
            </Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={saveAllSettings}>
              <Save className="w-4 h-4 ml-2" />
              حفظ الإعدادات
            </Button>
          </div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap">
          <TabsTrigger value="shortcuts" className="data-[state=active]:bg-cyan-500/20">
            <Keyboard className="w-4 h-4 ml-2" />
            اختصارات لوحة المفاتيح
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-purple-500/20">
            <Bell className="w-4 h-4 ml-2" />
            الإشعارات المتقدمة
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-amber-500/20">
            <Palette className="w-4 h-4 ml-2" />
            المظهر والعرض
          </TabsTrigger>
        </TabsList>

        {/* Keyboard Shortcuts Tab */}
        <TabsContent value="shortcuts" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-cyan-400" />
                اختصارات لوحة المفاتيح
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {['navigation', 'actions', 'appearance', 'general'].map(category => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-slate-400 text-sm font-medium mb-3">
                      {category === 'navigation' ? 'التنقل' : 
                       category === 'actions' ? 'الإجراءات' :
                       category === 'appearance' ? 'المظهر' : 'عام'}
                    </h4>
                    {shortcuts.filter(s => s.category === category).map(shortcut => (
                      <div key={shortcut.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-white">{shortcut.action}</span>
                        <div className="flex items-center gap-2">
                          {editingShortcut === shortcut.id ? (
                            <>
                              <Badge className="bg-cyan-500/20 text-cyan-400 px-3 py-1">
                                {newKeys || 'اضغط المفاتيح...'}
                              </Badge>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-400" onClick={saveShortcut}>
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400" onClick={cancelRecording}>
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Badge className="bg-slate-700 text-slate-300 px-3 py-1 font-mono">
                                {shortcut.keys}
                              </Badge>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-400" onClick={() => startRecordingKeys(shortcut.id)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-4 space-y-4">
          {/* إعدادات عامة */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">إعدادات عامة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-cyan-400" />
                    <span className="text-white">تفعيل الإشعارات</span>
                  </div>
                  <Switch checked={notificationSettings.enabled} onCheckedChange={(v) => setNotificationSettings(prev => ({ ...prev, enabled: v }))} />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-green-400" />
                    <span className="text-white">الأصوات</span>
                  </div>
                  <Switch checked={notificationSettings.sound} onCheckedChange={(v) => setNotificationSettings(prev => ({ ...prev, sound: v }))} />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-purple-400" />
                    <span className="text-white">إشعارات سطح المكتب</span>
                  </div>
                  <Switch checked={notificationSettings.desktop} onCheckedChange={(v) => setNotificationSettings(prev => ({ ...prev, desktop: v }))} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* تجميع الإشعارات */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">تجميع الإشعارات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400">طريقة التجميع</Label>
                  <Select value={notificationSettings.grouping} onValueChange={(v) => setNotificationSettings(prev => ({ ...prev, grouping: v }))}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون تجميع</SelectItem>
                      <SelectItem value="smart">تجميع ذكي</SelectItem>
                      <SelectItem value="type">حسب النوع</SelectItem>
                      <SelectItem value="source">حسب المصدر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-400">فترة التجميع: {notificationSettings.groupingInterval} دقائق</Label>
                  <Slider
                    value={[notificationSettings.groupingInterval]}
                    onValueChange={([v]) => setNotificationSettings(prev => ({ ...prev, groupingInterval: v }))}
                    min={1}
                    max={30}
                    step={1}
                    className="mt-4"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* مستويات الأولوية */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">إعدادات حسب الأولوية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { key: 'critical', label: 'حرج', icon: AlertTriangle, color: 'red' },
                  { key: 'high', label: 'عالي', icon: Zap, color: 'amber' },
                  { key: 'medium', label: 'متوسط', icon: Info, color: 'cyan' },
                  { key: 'low', label: 'منخفض', icon: CheckCircle, color: 'slate' },
                ].map(priority => (
                  <div key={priority.key} className={`p-3 bg-${priority.color}-500/10 border border-${priority.color}-500/30 rounded-lg`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <priority.icon className={`w-4 h-4 text-${priority.color}-400`} />
                        <span className="text-white font-medium">{priority.label}</span>
                      </div>
                      <Switch 
                        checked={notificationSettings.priorities[priority.key].enabled} 
                        onCheckedChange={(v) => setNotificationSettings(prev => ({
                          ...prev,
                          priorities: { ...prev.priorities, [priority.key]: { ...prev.priorities[priority.key], enabled: v } }
                        }))} 
                      />
                    </div>
                    {notificationSettings.priorities[priority.key].enabled && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <label className="flex items-center gap-2 text-slate-400 text-sm">
                          <input 
                            type="checkbox" 
                            checked={notificationSettings.priorities[priority.key].sound}
                            onChange={(e) => setNotificationSettings(prev => ({
                              ...prev,
                              priorities: { ...prev.priorities, [priority.key]: { ...prev.priorities[priority.key], sound: e.target.checked } }
                            }))}
                            className="rounded"
                          />
                          صوت
                        </label>
                        <label className="flex items-center gap-2 text-slate-400 text-sm">
                          <input 
                            type="checkbox" 
                            checked={notificationSettings.priorities[priority.key].desktop}
                            onChange={(e) => setNotificationSettings(prev => ({
                              ...prev,
                              priorities: { ...prev.priorities, [priority.key]: { ...prev.priorities[priority.key], desktop: e.target.checked } }
                            }))}
                            className="rounded"
                          />
                          سطح المكتب
                        </label>
                        <label className="flex items-center gap-2 text-slate-400 text-sm">
                          <input 
                            type="checkbox" 
                            checked={notificationSettings.priorities[priority.key].email}
                            onChange={(e) => setNotificationSettings(prev => ({
                              ...prev,
                              priorities: { ...prev.priorities, [priority.key]: { ...prev.priorities[priority.key], email: e.target.checked } }
                            }))}
                            className="rounded"
                          />
                          بريد إلكتروني
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ساعات الهدوء */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  ساعات الهدوء
                </span>
                <Switch 
                  checked={notificationSettings.quietHours.enabled} 
                  onCheckedChange={(v) => setNotificationSettings(prev => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, enabled: v }
                  }))} 
                />
              </CardTitle>
            </CardHeader>
            {notificationSettings.quietHours.enabled && (
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400">من</Label>
                    <Input
                      type="time"
                      value={notificationSettings.quietHours.start}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, start: e.target.value }
                      }))}
                      className="bg-slate-800/50 border-slate-700 text-white mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400">إلى</Label>
                    <Input
                      type="time"
                      value={notificationSettings.quietHours.end}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, end: e.target.value }
                      }))}
                      className="bg-slate-800/50 border-slate-700 text-white mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="mt-4 space-y-4">
          {/* المظهر الأساسي */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">المظهر الأساسي</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-slate-400">السمة</Label>
                  <div className="flex gap-2 mt-2">
                    {[
                      { value: 'dark', icon: Moon, label: 'داكن' },
                      { value: 'light', icon: Sun, label: 'فاتح' },
                      { value: 'auto', icon: Monitor, label: 'تلقائي' },
                    ].map(theme => (
                      <Button
                        key={theme.value}
                        size="sm"
                        variant={appearanceSettings.theme === theme.value ? 'default' : 'outline'}
                        className={appearanceSettings.theme === theme.value ? 'bg-cyan-600' : 'border-slate-600'}
                        onClick={() => setAppearanceSettings(prev => ({ ...prev, theme: theme.value }))}
                      >
                        <theme.icon className="w-4 h-4 ml-1" />
                        {theme.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-slate-400">نمط البطاقات</Label>
                  <Select value={appearanceSettings.cardStyle} onValueChange={(v) => setAppearanceSettings(prev => ({ ...prev, cardStyle: v }))}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="glass">زجاجي</SelectItem>
                      <SelectItem value="solid">صلب</SelectItem>
                      <SelectItem value="bordered">محدد</SelectItem>
                      <SelectItem value="minimal">بسيط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-400">التباين</Label>
                  <Select value={appearanceSettings.contrast} onValueChange={(v) => setAppearanceSettings(prev => ({ ...prev, contrast: v }))}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">منخفض</SelectItem>
                      <SelectItem value="normal">عادي</SelectItem>
                      <SelectItem value="high">عالي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الألوان */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">اللون المميز</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {accentColors.map(color => (
                  <button
                    key={color.value}
                    onClick={() => setAppearanceSettings(prev => ({ ...prev, accentColor: color.value }))}
                    className={`w-10 h-10 rounded-full transition-all ${appearanceSettings.accentColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={appearanceSettings.accentColor}
                    onChange={(e) => setAppearanceSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                    className="w-10 h-10 p-1 bg-slate-800/50 border-slate-700 cursor-pointer"
                  />
                  <span className="text-slate-400 text-sm">مخصص</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الخطوط */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">الخطوط والحجم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-slate-400">نوع الخط</Label>
                  <Select value={appearanceSettings.fontFamily} onValueChange={(v) => setAppearanceSettings(prev => ({ ...prev, fontFamily: v }))}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map(font => (
                        <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-400">حجم الخط: {appearanceSettings.fontSize}px</Label>
                  <Slider
                    value={[appearanceSettings.fontSize]}
                    onValueChange={([v]) => setAppearanceSettings(prev => ({ ...prev, fontSize: v }))}
                    min={12}
                    max={18}
                    step={1}
                    className="mt-4"
                  />
                </div>
                <div>
                  <Label className="text-slate-400">نصف قطر الحواف: {appearanceSettings.borderRadius}px</Label>
                  <Slider
                    value={[appearanceSettings.borderRadius]}
                    onValueChange={([v]) => setAppearanceSettings(prev => ({ ...prev, borderRadius: v }))}
                    min={0}
                    max={20}
                    step={2}
                    className="mt-4"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* إعدادات إضافية */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">إعدادات إضافية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <span className="text-white">تفعيل الحركات</span>
                    <p className="text-slate-500 text-xs">تأثيرات الانتقال والتحريك</p>
                  </div>
                  <Switch checked={appearanceSettings.animations} onCheckedChange={(v) => setAppearanceSettings(prev => ({ ...prev, animations: v }))} />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <span className="text-white">الوضع المضغوط</span>
                    <p className="text-slate-500 text-xs">تقليل المسافات بين العناصر</p>
                  </div>
                  <Switch checked={appearanceSettings.compactMode} onCheckedChange={(v) => setAppearanceSettings(prev => ({ ...prev, compactMode: v }))} />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <span className="text-white">طي القائمة الجانبية</span>
                    <p className="text-slate-500 text-xs">إخفاء تسميات القائمة</p>
                  </div>
                  <Switch checked={appearanceSettings.sidebarCollapsed} onCheckedChange={(v) => setAppearanceSettings(prev => ({ ...prev, sidebarCollapsed: v }))} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}