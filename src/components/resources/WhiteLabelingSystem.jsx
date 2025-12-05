import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Palette, Upload, Eye, Save, RefreshCw, Check, Building2,
  Image, Type, Paintbrush, Layout, Globe, Shield, Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const presetThemes = [
  { id: 'default', name: 'الافتراضي', primary: '#8B5CF6', secondary: '#06B6D4', accent: '#EC4899' },
  { id: 'government', name: 'حكومي', primary: '#059669', secondary: '#0D9488', accent: '#14B8A6' },
  { id: 'royal', name: 'ملكي', primary: '#7C3AED', secondary: '#8B5CF6', accent: '#A78BFA' },
  { id: 'corporate', name: 'مؤسسي', primary: '#1D4ED8', secondary: '#3B82F6', accent: '#60A5FA' },
  { id: 'modern', name: 'عصري', primary: '#F59E0B', secondary: '#EAB308', accent: '#FCD34D' },
];

const mockOrganizations = [
  { id: 1, name: 'أمانة منطقة الرياض', domain: 'riyadh.gov.sa', logo: null, theme: 'government', active: true },
  { id: 2, name: 'وزارة الداخلية', domain: 'moi.gov.sa', logo: null, theme: 'royal', active: true },
  { id: 3, name: 'هيئة النقل', domain: 'transport.gov.sa', logo: null, theme: 'corporate', active: false },
];

export default function WhiteLabelingSystem() {
  const [organizations, setOrganizations] = useState(mockOrganizations);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [activeTab, setActiveTab] = useState('branding');
  const [customization, setCustomization] = useState({
    name: '',
    domain: '',
    logo: null,
    favicon: null,
    theme: 'default',
    colors: {
      primary: '#8B5CF6',
      secondary: '#06B6D4',
      accent: '#EC4899',
      background: '#0A0E1A',
      surface: '#0F1629',
    },
    typography: {
      fontFamily: 'Cairo',
      headingSize: 'default',
      bodySize: 'default',
    },
    layout: {
      sidebarPosition: 'right',
      sidebarStyle: 'default',
      headerStyle: 'default',
      borderRadius: 'medium',
    },
    features: {
      showLogo: true,
      showOrgName: true,
      customLogin: false,
      customFooter: false,
    }
  });

  const handleThemeSelect = (themeId) => {
    const theme = presetThemes.find(t => t.id === themeId);
    if (theme) {
      setCustomization({
        ...customization,
        theme: themeId,
        colors: {
          ...customization.colors,
          primary: theme.primary,
          secondary: theme.secondary,
          accent: theme.accent,
        }
      });
    }
  };

  const saveCustomization = () => {
    toast.success('تم حفظ إعدادات العلامة البيضاء');
  };

  const exportConfig = () => {
    const config = JSON.stringify(customization, null, 2);
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'white-label-config.json';
    a.click();
    toast.success('تم تصدير الإعدادات');
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20">
            <Palette className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">نظام العلامة البيضاء</h3>
            <p className="text-slate-400 text-xs">تخصيص واجهة التطبيق للجهات الحكومية</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-700" onClick={exportConfig}>
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Button className="bg-pink-600 hover:bg-pink-700" onClick={saveCustomization}>
            <Save className="w-4 h-4 ml-2" />
            حفظ
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Organizations List */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              الجهات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {organizations.map(org => (
              <div
                key={org.id}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedOrg?.id === org.id ? 'bg-pink-500/20 border border-pink-500/50' : 'bg-slate-800/50 hover:bg-slate-700/50'
                }`}
                onClick={() => setSelectedOrg(org)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium text-sm">{org.name}</p>
                    <p className="text-slate-500 text-xs">{org.domain}</p>
                  </div>
                  <Badge className={org.active ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}>
                    {org.active ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full border-dashed border-slate-600 text-slate-400">
              <Building2 className="w-4 h-4 ml-2" />
              إضافة جهة
            </Button>
          </CardContent>
        </Card>

        {/* Customization Panel */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 border border-slate-700 mb-4">
              <TabsTrigger value="branding" className="data-[state=active]:bg-pink-500/20">
                <Image className="w-4 h-4 ml-1" />
                العلامة التجارية
              </TabsTrigger>
              <TabsTrigger value="colors" className="data-[state=active]:bg-purple-500/20">
                <Paintbrush className="w-4 h-4 ml-1" />
                الألوان
              </TabsTrigger>
              <TabsTrigger value="typography" className="data-[state=active]:bg-cyan-500/20">
                <Type className="w-4 h-4 ml-1" />
                الخطوط
              </TabsTrigger>
              <TabsTrigger value="layout" className="data-[state=active]:bg-green-500/20">
                <Layout className="w-4 h-4 ml-1" />
                التخطيط
              </TabsTrigger>
            </TabsList>

            {/* Branding Tab */}
            <TabsContent value="branding">
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">اسم الجهة</Label>
                      <Input
                        value={customization.name}
                        onChange={(e) => setCustomization({ ...customization, name: e.target.value })}
                        className="bg-slate-800/50 border-slate-700 text-white mt-1"
                        placeholder="اسم الجهة الحكومية"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">النطاق</Label>
                      <Input
                        value={customization.domain}
                        onChange={(e) => setCustomization({ ...customization, domain: e.target.value })}
                        className="bg-slate-800/50 border-slate-700 text-white mt-1"
                        placeholder="example.gov.sa"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">الشعار</Label>
                      <div className="mt-1 border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-pink-500/50 transition-colors">
                        <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                        <p className="text-slate-400 text-sm">رفع الشعار</p>
                        <p className="text-slate-500 text-xs">PNG, SVG (200x200)</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-300">أيقونة المتصفح</Label>
                      <div className="mt-1 border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-pink-500/50 transition-colors">
                        <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                        <p className="text-slate-400 text-sm">رفع الأيقونة</p>
                        <p className="text-slate-500 text-xs">ICO, PNG (32x32)</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { key: 'showLogo', label: 'عرض الشعار', desc: 'إظهار شعار الجهة في الواجهة' },
                      { key: 'showOrgName', label: 'عرض اسم الجهة', desc: 'إظهار اسم الجهة في الشريط الجانبي' },
                      { key: 'customLogin', label: 'صفحة دخول مخصصة', desc: 'تخصيص صفحة تسجيل الدخول' },
                      { key: 'customFooter', label: 'تذييل مخصص', desc: 'إضافة معلومات الجهة في التذييل' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div>
                          <p className="text-white font-medium text-sm">{item.label}</p>
                          <p className="text-slate-500 text-xs">{item.desc}</p>
                        </div>
                        <Switch
                          checked={customization.features[item.key]}
                          onCheckedChange={(v) => setCustomization({
                            ...customization,
                            features: { ...customization.features, [item.key]: v }
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Colors Tab */}
            <TabsContent value="colors">
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-4 space-y-4">
                  {/* Preset Themes */}
                  <div>
                    <Label className="text-slate-300 mb-2 block">السمات الجاهزة</Label>
                    <div className="flex gap-2 flex-wrap">
                      {presetThemes.map(theme => (
                        <motion.button
                          key={theme.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`p-3 rounded-lg border transition-all ${
                            customization.theme === theme.id ? 'border-pink-500 bg-pink-500/10' : 'border-slate-700 bg-slate-800/50'
                          }`}
                          onClick={() => handleThemeSelect(theme.id)}
                        >
                          <div className="flex gap-1 mb-2">
                            <div className="w-4 h-4 rounded-full" style={{ background: theme.primary }} />
                            <div className="w-4 h-4 rounded-full" style={{ background: theme.secondary }} />
                            <div className="w-4 h-4 rounded-full" style={{ background: theme.accent }} />
                          </div>
                          <p className="text-white text-xs">{theme.name}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'primary', label: 'اللون الأساسي' },
                      { key: 'secondary', label: 'اللون الثانوي' },
                      { key: 'accent', label: 'لون التمييز' },
                      { key: 'background', label: 'لون الخلفية' },
                      { key: 'surface', label: 'لون السطح' },
                    ].map(color => (
                      <div key={color.key}>
                        <Label className="text-slate-300">{color.label}</Label>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="color"
                            value={customization.colors[color.key]}
                            onChange={(e) => setCustomization({
                              ...customization,
                              colors: { ...customization.colors, [color.key]: e.target.value }
                            })}
                            className="w-10 h-10 rounded cursor-pointer"
                          />
                          <Input
                            value={customization.colors[color.key]}
                            onChange={(e) => setCustomization({
                              ...customization,
                              colors: { ...customization.colors, [color.key]: e.target.value }
                            })}
                            className="flex-1 bg-slate-800/50 border-slate-700 text-white font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Typography Tab */}
            <TabsContent value="typography">
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Label className="text-slate-300">نوع الخط</Label>
                    <Select
                      value={customization.typography.fontFamily}
                      onValueChange={(v) => setCustomization({
                        ...customization,
                        typography: { ...customization.typography, fontFamily: v }
                      })}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="Cairo">Cairo</SelectItem>
                        <SelectItem value="Tajawal">Tajawal</SelectItem>
                        <SelectItem value="IBM Plex Sans Arabic">IBM Plex Sans Arabic</SelectItem>
                        <SelectItem value="Noto Sans Arabic">Noto Sans Arabic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">حجم العناوين</Label>
                      <Select
                        value={customization.typography.headingSize}
                        onValueChange={(v) => setCustomization({
                          ...customization,
                          typography: { ...customization.typography, headingSize: v }
                        })}
                      >
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="small">صغير</SelectItem>
                          <SelectItem value="default">افتراضي</SelectItem>
                          <SelectItem value="large">كبير</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-300">حجم النص</Label>
                      <Select
                        value={customization.typography.bodySize}
                        onValueChange={(v) => setCustomization({
                          ...customization,
                          typography: { ...customization.typography, bodySize: v }
                        })}
                      >
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="small">صغير</SelectItem>
                          <SelectItem value="default">افتراضي</SelectItem>
                          <SelectItem value="large">كبير</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent value="layout">
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">موضع الشريط الجانبي</Label>
                      <Select
                        value={customization.layout.sidebarPosition}
                        onValueChange={(v) => setCustomization({
                          ...customization,
                          layout: { ...customization.layout, sidebarPosition: v }
                        })}
                      >
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="right">يمين</SelectItem>
                          <SelectItem value="left">يسار</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-300">نمط الزوايا</Label>
                      <Select
                        value={customization.layout.borderRadius}
                        onValueChange={(v) => setCustomization({
                          ...customization,
                          layout: { ...customization.layout, borderRadius: v }
                        })}
                      >
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="none">حادة</SelectItem>
                          <SelectItem value="small">صغيرة</SelectItem>
                          <SelectItem value="medium">متوسطة</SelectItem>
                          <SelectItem value="large">كبيرة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Preview */}
          <Card className="bg-slate-800/30 border-slate-700/50 mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                معاينة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="h-48 rounded-lg p-4"
                style={{ background: customization.colors.background }}
              >
                <div className="flex gap-4 h-full">
                  <div 
                    className="w-16 rounded-lg"
                    style={{ background: customization.colors.surface }}
                  />
                  <div className="flex-1 space-y-2">
                    <div 
                      className="h-8 rounded"
                      style={{ background: customization.colors.surface }}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      {[customization.colors.primary, customization.colors.secondary, customization.colors.accent].map((color, i) => (
                        <div key={i} className="h-20 rounded" style={{ background: color }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}