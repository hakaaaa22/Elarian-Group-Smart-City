import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Palette, Sun, Moon, Monitor, Check, Sparkles, Eye, Sliders,
  LayoutGrid, Type, Droplets, Save, RotateCcw, Download, Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

// Pre-defined themes
const themes = [
  { id: 'default', name: 'افتراضي', primary: '#6366f1', secondary: '#22d3ee', bg: '#0a0e1a', card: '#0f1629' },
  { id: 'ocean', name: 'محيطي', primary: '#0ea5e9', secondary: '#14b8a6', bg: '#0c1222', card: '#0f172a' },
  { id: 'sunset', name: 'غروب', primary: '#f97316', secondary: '#eab308', bg: '#1a0f0a', card: '#291a10' },
  { id: 'forest', name: 'غابة', primary: '#22c55e', secondary: '#84cc16', bg: '#0a1a0f', card: '#102916' },
  { id: 'royal', name: 'ملكي', primary: '#a855f7', secondary: '#ec4899', bg: '#150a1a', card: '#1f1029' },
  { id: 'midnight', name: 'منتصف الليل', primary: '#3b82f6', secondary: '#8b5cf6', bg: '#020617', card: '#0f172a' },
  { id: 'warm', name: 'دافئ', primary: '#ef4444', secondary: '#f59e0b', bg: '#1a0a0a', card: '#291010' },
  { id: 'cyber', name: 'سايبر', primary: '#00ff88', secondary: '#00d4ff', bg: '#000a0a', card: '#001515' },
];

const fontSizes = [
  { id: 'small', name: 'صغير', value: 14 },
  { id: 'medium', name: 'متوسط', value: 16 },
  { id: 'large', name: 'كبير', value: 18 },
  { id: 'xlarge', name: 'كبير جداً', value: 20 },
];

const defaultSettings = {
  theme: 'default',
  mode: 'dark',
  fontSize: 'medium',
  borderRadius: 12,
  animationsEnabled: true,
  glassEffect: true,
  compactMode: false,
  highContrast: false,
  customPrimary: '#6366f1',
  customSecondary: '#22d3ee',
  sidebarWidth: 260,
  cardOpacity: 80,
};

export default function ThemeCustomizer({ onSettingsChange }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('theme_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  const [showCustomColors, setShowCustomColors] = useState(false);

  useEffect(() => {
    applyTheme(settings);
    localStorage.setItem('theme_settings', JSON.stringify(settings));
    onSettingsChange?.(settings);
  }, [settings]);

  const applyTheme = (s) => {
    const theme = themes.find(t => t.id === s.theme) || themes[0];
    const root = document.documentElement;
    
    root.style.setProperty('--primary-color', s.customPrimary || theme.primary);
    root.style.setProperty('--secondary-color', s.customSecondary || theme.secondary);
    root.style.setProperty('--bg-primary', theme.bg);
    root.style.setProperty('--bg-card', theme.card);
    root.style.setProperty('--border-radius', `${s.borderRadius}px`);
    root.style.setProperty('--font-size-base', `${fontSizes.find(f => f.id === s.fontSize)?.value || 16}px`);
    root.style.setProperty('--card-opacity', `${s.cardOpacity / 100}`);
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    toast.success('تم إعادة التعيين للإعدادات الافتراضية');
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme_settings.json';
    a.click();
    toast.success('تم تصدير الإعدادات');
  };

  const importSettings = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          setSettings({ ...defaultSettings, ...imported });
          toast.success('تم استيراد الإعدادات');
        } catch {
          toast.error('ملف غير صالح');
        }
      };
      reader.readAsText(file);
    }
  };

  const selectedTheme = themes.find(t => t.id === settings.theme) || themes[0];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Palette className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">تخصيص المظهر</h3>
            <p className="text-slate-400 text-sm">تخصيص الألوان والسمات والتخطيط</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-600" onClick={resetToDefaults}>
            <RotateCcw className="w-4 h-4 ml-2" />
            إعادة تعيين
          </Button>
          <Button variant="outline" className="border-slate-600" onClick={exportSettings}>
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <label>
            <Button variant="outline" className="border-slate-600" asChild>
              <span>
                <Upload className="w-4 h-4 ml-2" />
                استيراد
              </span>
            </Button>
            <input type="file" accept=".json" className="hidden" onChange={importSettings} />
          </label>
        </div>
      </div>

      {/* Theme Selection */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            السمات الجاهزة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {themes.map(theme => (
              <motion.div
                key={theme.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  settings.theme === theme.id 
                    ? 'ring-2 ring-purple-500 bg-slate-800/50' 
                    : 'bg-slate-900/50 hover:bg-slate-800/30'
                }`}
                onClick={() => updateSetting('theme', theme.id)}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 rounded-full" style={{ background: theme.primary }} />
                  <div className="w-4 h-4 rounded-full" style={{ background: theme.secondary }} />
                  {settings.theme === theme.id && (
                    <Check className="w-4 h-4 text-green-400 mr-auto" />
                  )}
                </div>
                <p className="text-white text-sm font-medium">{theme.name}</p>
                <div className="flex gap-1 mt-2">
                  <div className="w-full h-2 rounded" style={{ background: theme.bg }} />
                  <div className="w-full h-2 rounded" style={{ background: theme.card }} />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Colors */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              ألوان مخصصة
            </CardTitle>
            <Switch
              checked={showCustomColors}
              onCheckedChange={setShowCustomColors}
            />
          </div>
        </CardHeader>
        {showCustomColors && (
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-sm mb-2 block">اللون الأساسي</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.customPrimary}
                    onChange={(e) => updateSetting('customPrimary', e.target.value)}
                    className="w-12 h-10 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.customPrimary}
                    onChange={(e) => updateSetting('customPrimary', e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <Label className="text-slate-300 text-sm mb-2 block">اللون الثانوي</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.customSecondary}
                    onChange={(e) => updateSetting('customSecondary', e.target.value)}
                    className="w-12 h-10 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.customSecondary}
                    onChange={(e) => updateSetting('customSecondary', e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Display Settings */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Type className="w-4 h-4 text-amber-400" />
              الخط والحجم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-300 text-sm mb-2 block">حجم الخط</Label>
              <Select value={settings.fontSize} onValueChange={(v) => updateSetting('fontSize', v)}>
                <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {fontSizes.map(fs => (
                    <SelectItem key={fs.id} value={fs.id}>{fs.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300 text-sm mb-2 block">
                استدارة الحواف: {settings.borderRadius}px
              </Label>
              <Slider
                value={[settings.borderRadius]}
                onValueChange={([v]) => updateSetting('borderRadius', v)}
                max={24}
                min={0}
                step={2}
                className="w-full"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm mb-2 block">
                شفافية البطاقات: {settings.cardOpacity}%
              </Label>
              <Slider
                value={[settings.cardOpacity]}
                onValueChange={([v]) => updateSetting('cardOpacity', v)}
                max={100}
                min={20}
                step={5}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-green-400" />
              خيارات العرض
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">الرسوم المتحركة</Label>
              <Switch
                checked={settings.animationsEnabled}
                onCheckedChange={(v) => updateSetting('animationsEnabled', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">تأثير الزجاج</Label>
              <Switch
                checked={settings.glassEffect}
                onCheckedChange={(v) => updateSetting('glassEffect', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">الوضع المضغوط</Label>
              <Switch
                checked={settings.compactMode}
                onCheckedChange={(v) => updateSetting('compactMode', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">تباين عالي</Label>
              <Switch
                checked={settings.highContrast}
                onCheckedChange={(v) => updateSetting('highContrast', v)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-pink-400" />
            معاينة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="p-6 rounded-xl"
            style={{ 
              background: selectedTheme.bg,
              borderRadius: `${settings.borderRadius}px`
            }}
          >
            <div 
              className="p-4 rounded-lg mb-4"
              style={{ 
                background: selectedTheme.card,
                opacity: settings.cardOpacity / 100,
                borderRadius: `${settings.borderRadius}px`
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: selectedTheme.primary + '30' }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: selectedTheme.primary }} />
                </div>
                <div>
                  <p className="text-white font-medium">عنوان البطاقة</p>
                  <p className="text-slate-400 text-sm">وصف توضيحي</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  className="px-4 py-2 rounded-lg text-white text-sm"
                  style={{ 
                    background: selectedTheme.primary,
                    borderRadius: `${settings.borderRadius / 2}px`
                  }}
                >
                  زر أساسي
                </button>
                <button 
                  className="px-4 py-2 rounded-lg text-sm border"
                  style={{ 
                    borderColor: selectedTheme.secondary,
                    color: selectedTheme.secondary,
                    borderRadius: `${settings.borderRadius / 2}px`
                  }}
                >
                  زر ثانوي
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}