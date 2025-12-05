import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Palette, Upload, Image, Link, Globe, Mail, Languages, Menu, Edit,
  HelpCircle, Save, RefreshCw, Eye, Plus, Trash2, GripVertical, Check,
  Moon, Sun, Monitor, Smartphone, X, Copy, Download, Settings, Layout,
  Type, Paintbrush, Code, FileText, Bell, Lock, Shield, Sparkles
} from 'lucide-react';
import SecurityCenter from '@/components/security/SecurityCenter';
import APIIntegrationHub from '@/components/integrations/APIIntegrationHub';
import SmartRecommendations from '@/components/user/SmartRecommendations';
import WhiteLabelingSystem from '@/components/resources/WhiteLabelingSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'sonner';

// قوالب المظاهر الجاهزة
const themePresets = [
  { id: 'dark-blue', name: 'أزرق داكن', primary: '#22d3ee', secondary: '#6366f1', bg: '#0a0e1a', card: '#0f1629' },
  { id: 'purple-night', name: 'أرجواني ليلي', primary: '#a855f7', secondary: '#ec4899', bg: '#0f0520', card: '#1a0a30' },
  { id: 'ocean-green', name: 'أخضر محيطي', primary: '#10b981', secondary: '#06b6d4', bg: '#0a1a15', card: '#0f2920' },
  { id: 'sunset-orange', name: 'غروب برتقالي', primary: '#f59e0b', secondary: '#ef4444', bg: '#1a0f0a', card: '#2a1510' },
  { id: 'light-modern', name: 'فاتح عصري', primary: '#0891b2', secondary: '#7c3aed', bg: '#f8fafc', card: '#ffffff' },
  { id: 'corporate-blue', name: 'أزرق مؤسسي', primary: '#2563eb', secondary: '#1d4ed8', bg: '#f1f5f9', card: '#ffffff' },
];

// عناصر القائمة الافتراضية
const defaultMenuItems = [
  { id: 'm1', name: 'لوحة التحكم', icon: 'LayoutDashboard', path: 'Home', visible: true },
  { id: 'm2', name: 'الأجهزة', icon: 'Cpu', path: 'DeviceManagement', visible: true },
  { id: 'm3', name: 'التقارير', icon: 'BarChart3', path: 'ReportsDashboard', visible: true },
  { id: 'm4', name: 'الإعدادات', icon: 'Settings', path: 'Settings', visible: true },
];

// قوالب البريد
const emailTemplates = [
  { id: 'welcome', name: 'ترحيب بالمستخدم الجديد', subject: 'مرحباً بك في {{app_name}}', active: true },
  { id: 'reset', name: 'إعادة تعيين كلمة المرور', subject: 'إعادة تعيين كلمة المرور', active: true },
  { id: 'invite', name: 'دعوة مستخدم', subject: 'دعوة للانضمام إلى {{app_name}}', active: true },
  { id: 'alert', name: 'تنبيه النظام', subject: 'تنبيه: {{alert_type}}', active: true },
  { id: 'report', name: 'إرسال تقرير', subject: 'تقرير {{report_name}} - {{date}}', active: false },
];

export default function WhiteLabeling() {
  const [activeTab, setActiveTab] = useState('branding');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [showPreview, setShowPreview] = useState(false);
  const [showEmailEditor, setShowEmailEditor] = useState(null);
  const [menuItems, setMenuItems] = useState(defaultMenuItems);
  
  const [settings, setSettings] = useState({
    // Branding
    appName: 'VisionAI Cyber SOC',
    tagline: 'منصة إدارة المدينة الذكية',
    logo: '',
    logoLight: '',
    favicon: '',
    // Colors
    primaryColor: '#22d3ee',
    secondaryColor: '#a855f7',
    accentColor: '#22c55e',
    backgroundColor: '#0a0e1a',
    cardColor: '#0f1629',
    textColor: '#ffffff',
    // Login
    loginBackground: '',
    loginLogo: '',
    loginTitle: 'مرحباً بك',
    loginSubtitle: 'سجل دخولك للمتابعة',
    loginFooter: '© 2024 جميع الحقوق محفوظة',
    // Advanced
    customCSS: '',
    customJS: '',
    showPoweredBy: true,
    enableAnimations: true,
    rtlSupport: true,
    // Typography
    fontFamily: 'Tajawal',
    fontSize: 14,
    borderRadius: 8,
  });

  // تحميل الإعدادات المحفوظة
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.white_label_settings) {
          setSettings(prev => ({ ...prev, ...user.white_label_settings }));
        }
        if (user?.custom_menu) {
          setMenuItems(user.custom_menu);
        }
      } catch (e) {}
    };
    loadSettings();
  }, []);

  // حفظ الإعدادات
  const saveSettings = async () => {
    try {
      await base44.auth.updateMe({ 
        white_label_settings: settings,
        custom_menu: menuItems
      });
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (e) {
      toast.error('فشل في حفظ الإعدادات');
    }
  };

  // تطبيق قالب مظهر
  const applyThemePreset = (preset) => {
    setSettings(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      backgroundColor: preset.bg,
      cardColor: preset.card
    }));
    toast.success(`تم تطبيق مظهر "${preset.name}"`);
  };

  // رفع الصورة
  const handleImageUpload = async (field, file) => {
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setSettings(prev => ({ ...prev, [field]: file_url }));
      toast.success('تم رفع الصورة بنجاح');
    } catch (e) {
      toast.error('فشل في رفع الصورة');
    }
  };

  // إعادة ترتيب القائمة
  const handleMenuDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(menuItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setMenuItems(items);
  };

  // تبديل رؤية عنصر القائمة
  const toggleMenuItemVisibility = (id) => {
    setMenuItems(prev => prev.map(item => 
      item.id === id ? { ...item, visible: !item.visible } : item
    ));
  };

  // إعادة التعيين
  const resetToDefaults = () => {
    setSettings({
      appName: 'VisionAI Cyber SOC',
      tagline: 'منصة إدارة المدينة الذكية',
      logo: '',
      logoLight: '',
      favicon: '',
      primaryColor: '#22d3ee',
      secondaryColor: '#a855f7',
      accentColor: '#22c55e',
      backgroundColor: '#0a0e1a',
      cardColor: '#0f1629',
      textColor: '#ffffff',
      loginBackground: '',
      loginLogo: '',
      loginTitle: 'مرحباً بك',
      loginSubtitle: 'سجل دخولك للمتابعة',
      loginFooter: '© 2024 جميع الحقوق محفوظة',
      customCSS: '',
      customJS: '',
      showPoweredBy: true,
      enableAnimations: true,
      rtlSupport: true,
      fontFamily: 'Tajawal',
      fontSize: 14,
      borderRadius: 8,
    });
    setMenuItems(defaultMenuItems);
    toast.success('تم إعادة التعيين للإعدادات الافتراضية');
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Palette className="w-8 h-8 text-cyan-400" />
              العلامة البيضاء
            </h1>
            <p className="text-slate-400 mt-1">تخصيص كامل لمظهر وهوية التطبيق</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-amber-500 text-amber-400" onClick={resetToDefaults}>
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة تعيين
            </Button>
            <Button variant="outline" className="border-slate-600" onClick={() => setShowPreview(true)}>
              <Eye className="w-4 h-4 ml-2" />
              معاينة
            </Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={saveSettings}>
              <Save className="w-4 h-4 ml-2" />
              حفظ التغييرات
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Advanced System */}
      <WhiteLabelingSystem />

      {/* Main Content */}
      <div className="grid lg:grid-cols-4 gap-6 mt-6">
        {/* Settings Panel */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap">
              <TabsTrigger value="branding" className="data-[state=active]:bg-cyan-500/20">
                <Paintbrush className="w-4 h-4 ml-2" />
                الهوية
              </TabsTrigger>
              <TabsTrigger value="colors" className="data-[state=active]:bg-purple-500/20">
                <Palette className="w-4 h-4 ml-2" />
                الألوان
              </TabsTrigger>
              <TabsTrigger value="login" className="data-[state=active]:bg-green-500/20">
                <Lock className="w-4 h-4 ml-2" />
                تسجيل الدخول
              </TabsTrigger>
              <TabsTrigger value="typography" className="data-[state=active]:bg-amber-500/20">
                <Type className="w-4 h-4 ml-2" />
                الخطوط
              </TabsTrigger>
              <TabsTrigger value="menu" className="data-[state=active]:bg-rose-500/20">
                <Menu className="w-4 h-4 ml-2" />
                القائمة
              </TabsTrigger>
              <TabsTrigger value="email" className="data-[state=active]:bg-blue-500/20">
                <Mail className="w-4 h-4 ml-2" />
                البريد
              </TabsTrigger>
              <TabsTrigger value="advanced" className="data-[state=active]:bg-slate-500/20">
                <Code className="w-4 h-4 ml-2" />
                متقدم
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-red-500/20">
                <Shield className="w-4 h-4 ml-2" />
                الأمان
              </TabsTrigger>
              <TabsTrigger value="integrations" className="data-[state=active]:bg-green-500/20">
                <Globe className="w-4 h-4 ml-2" />
                التكاملات
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-purple-500/20">
                <Sparkles className="w-4 h-4 ml-2" />
                التوصيات الذكية
              </TabsTrigger>
            </TabsList>

            {/* Branding Tab */}
            <TabsContent value="branding" className="mt-4">
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader>
                  <CardTitle className="text-white">الهوية والعلامة التجارية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-slate-300">اسم التطبيق</Label>
                      <Input
                        value={settings.appName}
                        onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                        className="bg-slate-800/50 border-slate-700 text-white mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">الشعار النصي</Label>
                      <Input
                        value={settings.tagline}
                        onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                        className="bg-slate-800/50 border-slate-700 text-white mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Logo Dark */}
                    <div>
                      <Label className="text-slate-300">الشعار (الوضع الداكن)</Label>
                      <div className="mt-2">
                        <div className="w-full h-32 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center bg-slate-900/50 mb-2">
                          {settings.logo ? (
                            <img src={settings.logo} alt="Logo" className="max-h-24 max-w-full object-contain" />
                          ) : (
                            <Image className="w-10 h-10 text-slate-500" />
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 border-slate-600" asChild>
                            <label>
                              <Upload className="w-4 h-4 ml-1" />
                              رفع
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files[0] && handleImageUpload('logo', e.target.files[0])} />
                            </label>
                          </Button>
                          {settings.logo && (
                            <Button size="sm" variant="ghost" className="text-red-400" onClick={() => setSettings({ ...settings, logo: '' })}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Logo Light */}
                    <div>
                      <Label className="text-slate-300">الشعار (الوضع الفاتح)</Label>
                      <div className="mt-2">
                        <div className="w-full h-32 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center bg-white mb-2">
                          {settings.logoLight ? (
                            <img src={settings.logoLight} alt="Logo Light" className="max-h-24 max-w-full object-contain" />
                          ) : (
                            <Image className="w-10 h-10 text-slate-400" />
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 border-slate-600" asChild>
                            <label>
                              <Upload className="w-4 h-4 ml-1" />
                              رفع
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files[0] && handleImageUpload('logoLight', e.target.files[0])} />
                            </label>
                          </Button>
                          {settings.logoLight && (
                            <Button size="sm" variant="ghost" className="text-red-400" onClick={() => setSettings({ ...settings, logoLight: '' })}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Favicon */}
                    <div>
                      <Label className="text-slate-300">أيقونة الموقع (Favicon)</Label>
                      <div className="mt-2">
                        <div className="w-full h-32 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center bg-slate-900/50 mb-2">
                          {settings.favicon ? (
                            <img src={settings.favicon} alt="Favicon" className="w-16 h-16 object-contain" />
                          ) : (
                            <Globe className="w-10 h-10 text-slate-500" />
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 border-slate-600" asChild>
                            <label>
                              <Upload className="w-4 h-4 ml-1" />
                              رفع
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files[0] && handleImageUpload('favicon', e.target.files[0])} />
                            </label>
                          </Button>
                          {settings.favicon && (
                            <Button size="sm" variant="ghost" className="text-red-400" onClick={() => setSettings({ ...settings, favicon: '' })}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Colors Tab */}
            <TabsContent value="colors" className="mt-4">
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader>
                  <CardTitle className="text-white">الألوان والمظهر</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme Presets */}
                  <div>
                    <Label className="text-slate-300 mb-3 block">قوالب جاهزة</Label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {themePresets.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => applyThemePreset(preset)}
                          className="p-3 rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-colors text-center"
                          style={{ background: `linear-gradient(135deg, ${preset.bg} 0%, ${preset.card} 100%)` }}
                        >
                          <div className="flex justify-center gap-1 mb-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.secondary }} />
                          </div>
                          <span className="text-white text-xs">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Colors */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <Label className="text-slate-300">اللون الأساسي</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                          className="w-12 h-10 p-1 bg-slate-800/50 border-slate-700 cursor-pointer"
                        />
                        <Input
                          value={settings.primaryColor}
                          onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-300">اللون الثانوي</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="color"
                          value={settings.secondaryColor}
                          onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                          className="w-12 h-10 p-1 bg-slate-800/50 border-slate-700 cursor-pointer"
                        />
                        <Input
                          value={settings.secondaryColor}
                          onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-300">لون التمييز</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="color"
                          value={settings.accentColor}
                          onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                          className="w-12 h-10 p-1 bg-slate-800/50 border-slate-700 cursor-pointer"
                        />
                        <Input
                          value={settings.accentColor}
                          onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-300">لون الخلفية</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="color"
                          value={settings.backgroundColor}
                          onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                          className="w-12 h-10 p-1 bg-slate-800/50 border-slate-700 cursor-pointer"
                        />
                        <Input
                          value={settings.backgroundColor}
                          onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-300">لون البطاقات</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="color"
                          value={settings.cardColor}
                          onChange={(e) => setSettings({ ...settings, cardColor: e.target.value })}
                          className="w-12 h-10 p-1 bg-slate-800/50 border-slate-700 cursor-pointer"
                        />
                        <Input
                          value={settings.cardColor}
                          onChange={(e) => setSettings({ ...settings, cardColor: e.target.value })}
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-300">لون النص</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="color"
                          value={settings.textColor}
                          onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                          className="w-12 h-10 p-1 bg-slate-800/50 border-slate-700 cursor-pointer"
                        />
                        <Input
                          value={settings.textColor}
                          onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Login Tab */}
            <TabsContent value="login" className="mt-4">
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader>
                  <CardTitle className="text-white">تخصيص صفحة تسجيل الدخول</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-slate-300">صورة الخلفية</Label>
                      <div className="mt-2">
                        <div className="w-full h-40 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center bg-slate-900/50 mb-2 overflow-hidden">
                          {settings.loginBackground ? (
                            <img src={settings.loginBackground} alt="Background" className="w-full h-full object-cover" />
                          ) : (
                            <Image className="w-12 h-12 text-slate-500" />
                          )}
                        </div>
                        <Button size="sm" variant="outline" className="w-full border-slate-600" asChild>
                          <label>
                            <Upload className="w-4 h-4 ml-2" />
                            رفع صورة خلفية
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files[0] && handleImageUpload('loginBackground', e.target.files[0])} />
                          </label>
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-slate-300">عنوان الصفحة</Label>
                        <Input
                          value={settings.loginTitle}
                          onChange={(e) => setSettings({ ...settings, loginTitle: e.target.value })}
                          className="bg-slate-800/50 border-slate-700 text-white mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">النص الفرعي</Label>
                        <Input
                          value={settings.loginSubtitle}
                          onChange={(e) => setSettings({ ...settings, loginSubtitle: e.target.value })}
                          className="bg-slate-800/50 border-slate-700 text-white mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">نص الذيل</Label>
                        <Input
                          value={settings.loginFooter}
                          onChange={(e) => setSettings({ ...settings, loginFooter: e.target.value })}
                          className="bg-slate-800/50 border-slate-700 text-white mt-2"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Typography Tab */}
            <TabsContent value="typography" className="mt-4">
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader>
                  <CardTitle className="text-white">الخطوط والطباعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-slate-300">نوع الخط</Label>
                      <Select value={settings.fontFamily} onValueChange={(v) => setSettings({ ...settings, fontFamily: v })}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tajawal">Tajawal</SelectItem>
                          <SelectItem value="Cairo">Cairo</SelectItem>
                          <SelectItem value="Almarai">Almarai</SelectItem>
                          <SelectItem value="IBM Plex Sans Arabic">IBM Plex Sans Arabic</SelectItem>
                          <SelectItem value="Inter">Inter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-300">حجم الخط الأساسي: {settings.fontSize}px</Label>
                      <Slider
                        value={[settings.fontSize]}
                        onValueChange={([v]) => setSettings({ ...settings, fontSize: v })}
                        min={12}
                        max={18}
                        step={1}
                        className="mt-4"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">نصف قطر الحواف: {settings.borderRadius}px</Label>
                      <Slider
                        value={[settings.borderRadius]}
                        onValueChange={([v]) => setSettings({ ...settings, borderRadius: v })}
                        min={0}
                        max={20}
                        step={2}
                        className="mt-4"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Menu Tab */}
            <TabsContent value="menu" className="mt-4">
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader>
                  <CardTitle className="text-white">تخصيص القائمة الجانبية</CardTitle>
                </CardHeader>
                <CardContent>
                  <DragDropContext onDragEnd={handleMenuDragEnd}>
                    <Droppable droppableId="menu-items">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                          {menuItems.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex items-center gap-3 p-3 rounded-lg border ${snapshot.isDragging ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 bg-slate-800/50'}`}
                                >
                                  <div {...provided.dragHandleProps} className="cursor-grab">
                                    <GripVertical className="w-4 h-4 text-slate-500" />
                                  </div>
                                  <Menu className="w-4 h-4 text-slate-400" />
                                  <span className="text-white flex-1">{item.name}</span>
                                  <Badge className="bg-slate-700 text-slate-300">{item.path}</Badge>
                                  <Switch checked={item.visible} onCheckedChange={() => toggleMenuItemVisibility(item.id)} />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                  <Button className="mt-4 bg-cyan-600 hover:bg-cyan-700">
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة عنصر
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Tab */}
            <TabsContent value="email" className="mt-4">
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader>
                  <CardTitle className="text-white">قوالب البريد الإلكتروني</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {emailTemplates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className={`w-5 h-5 ${template.active ? 'text-cyan-400' : 'text-slate-500'}`} />
                          <div>
                            <p className="text-white font-medium">{template.name}</p>
                            <p className="text-slate-400 text-sm">{template.subject}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={template.active} />
                          <Button size="sm" variant="outline" className="border-slate-600" onClick={() => setShowEmailEditor(template)}>
                            <Edit className="w-4 h-4 ml-1" />
                            تعديل
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="mt-4">
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader>
                  <CardTitle className="text-white">إعدادات متقدمة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">إظهار "Powered by"</p>
                        <p className="text-slate-400 text-sm">عرض نص مدعوم من في أسفل الصفحة</p>
                      </div>
                      <Switch checked={settings.showPoweredBy} onCheckedChange={(v) => setSettings({ ...settings, showPoweredBy: v })} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">تفعيل الحركات</p>
                        <p className="text-slate-400 text-sm">تأثيرات الانتقال والحركة</p>
                      </div>
                      <Switch checked={settings.enableAnimations} onCheckedChange={(v) => setSettings({ ...settings, enableAnimations: v })} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">دعم RTL</p>
                        <p className="text-slate-400 text-sm">دعم الكتابة من اليمين لليسار</p>
                      </div>
                      <Switch checked={settings.rtlSupport} onCheckedChange={(v) => setSettings({ ...settings, rtlSupport: v })} />
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300">CSS مخصص</Label>
                    <Textarea
                      value={settings.customCSS}
                      onChange={(e) => setSettings({ ...settings, customCSS: e.target.value })}
                      placeholder=".custom-class { ... }"
                      className="bg-slate-800/50 border-slate-700 text-white mt-2 font-mono h-32"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-4">
              <SecurityCenter />
            </TabsContent>

            {/* Integrations Tab */}
            <TabsContent value="integrations" className="mt-4">
              <APIIntegrationHub />
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="mt-4">
              <SmartRecommendations />
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview Sidebar */}
        <div className="hidden lg:block">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 sticky top-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center justify-between">
                معاينة مباشرة
                <div className="flex gap-1">
                  <Button size="sm" variant={previewMode === 'desktop' ? 'default' : 'ghost'} className="h-6 w-6 p-0" onClick={() => setPreviewMode('desktop')}>
                    <Monitor className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant={previewMode === 'mobile' ? 'default' : 'ghost'} className="h-6 w-6 p-0" onClick={() => setPreviewMode('mobile')}>
                    <Smartphone className="w-3 h-3" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className={`${previewMode === 'mobile' ? 'w-48 mx-auto' : 'w-full'} h-64 rounded-lg overflow-hidden border border-slate-700`}
                style={{ backgroundColor: settings.backgroundColor }}
              >
                <div className="h-8 flex items-center px-2 border-b" style={{ backgroundColor: settings.cardColor, borderColor: settings.primaryColor + '30' }}>
                  {settings.logo ? (
                    <img src={settings.logo} alt="Logo" className="h-5" />
                  ) : (
                    <div className="text-xs font-bold" style={{ color: settings.primaryColor }}>{settings.appName}</div>
                  )}
                </div>
                <div className="p-2 space-y-2">
                  <div className="h-12 rounded" style={{ backgroundColor: settings.cardColor, borderColor: settings.primaryColor + '30', borderWidth: 1 }} />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-8 rounded" style={{ backgroundColor: settings.primaryColor + '20' }} />
                    <div className="h-8 rounded" style={{ backgroundColor: settings.secondaryColor + '20' }} />
                  </div>
                </div>
              </div>
              <p className="text-slate-500 text-xs text-center mt-2">معاينة تقريبية</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Email Editor Dialog */}
      <Dialog open={!!showEmailEditor} onOpenChange={() => setShowEmailEditor(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-cyan-400" />
              تعديل قالب: {showEmailEditor?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">عنوان البريد</Label>
              <Input defaultValue={showEmailEditor?.subject} className="bg-slate-800/50 border-slate-700 text-white mt-2" />
            </div>
            <div>
              <Label className="text-slate-300">محتوى الرسالة (HTML)</Label>
              <Textarea className="bg-slate-800/50 border-slate-700 text-white mt-2 font-mono h-48" placeholder="<html>..." />
            </div>
            <p className="text-slate-500 text-xs">المتغيرات المتاحة: {'{{app_name}}'}, {'{{user_name}}'}, {'{{date}}'}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-600" onClick={() => setShowEmailEditor(null)}>إلغاء</Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Save className="w-4 h-4 ml-2" />
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}