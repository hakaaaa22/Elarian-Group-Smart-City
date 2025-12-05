import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Settings, Layout, Keyboard, Palette, Save, RotateCcw, GripVertical,
  Sun, Moon, Monitor, ChevronUp, ChevronDown, Eye, EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const defaultModules = [
  { id: 'conversation', name: 'المحادثة', visible: true },
  { id: 'customer', name: 'معلومات العميل', visible: true },
  { id: 'knowledge', name: 'قاعدة المعرفة', visible: true },
  { id: 'tasks', name: 'المهام', visible: true },
  { id: 'history', name: 'السجل', visible: true },
  { id: 'notes', name: 'الملاحظات', visible: true },
];

const defaultShortcuts = [
  { key: 'R', action: 'رد سريع', editable: true },
  { key: 'T', action: 'تحويل', editable: true },
  { key: 'H', action: 'تعليق', editable: true },
  { key: 'C', action: 'إغلاق', editable: true },
  { key: 'N', action: 'ملاحظة', editable: true },
  { key: 'K', action: 'قاعدة المعرفة', editable: true },
];

export default function AgentWorkspaceCustomizer({ open, onOpenChange, onSave }) {
  const [activeTab, setActiveTab] = useState('layout');
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    fontSize: 'medium',
    modules: defaultModules,
    shortcuts: defaultShortcuts,
    notifications: { sound: true, visual: true, desktop: true },
  });
  const [editingShortcut, setEditingShortcut] = useState(null);

  const queryClient = useQueryClient();

  const { data: savedPrefs } = useQuery({
    queryKey: ['agentPreferences'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const prefs = await base44.entities.AgentPreferences.filter({ agent_email: user.email });
      return prefs[0] || null;
    },
  });

  useEffect(() => {
    if (savedPrefs) {
      setPreferences({
        theme: savedPrefs.theme || 'dark',
        fontSize: savedPrefs.font_size || 'medium',
        modules: savedPrefs.layout_order ? savedPrefs.layout_order.map((id, i) => ({
          id,
          name: defaultModules.find(m => m.id === id)?.name || id,
          visible: !savedPrefs.collapsed_panels?.includes(id),
        })) : defaultModules,
        shortcuts: savedPrefs.custom_shortcuts ? Object.entries(savedPrefs.custom_shortcuts).map(([key, action]) => ({
          key, action, editable: true
        })) : defaultShortcuts,
        notifications: savedPrefs.notification_settings || { sound: true, visual: true, desktop: true },
      });
    }
  }, [savedPrefs]);

  const savePreferences = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const data = {
        agent_email: user.email,
        theme: preferences.theme,
        font_size: preferences.fontSize,
        layout_order: preferences.modules.map(m => m.id),
        collapsed_panels: preferences.modules.filter(m => !m.visible).map(m => m.id),
        custom_shortcuts: Object.fromEntries(preferences.shortcuts.map(s => [s.key, s.action])),
        notification_settings: preferences.notifications,
      };
      
      if (savedPrefs?.id) {
        return base44.entities.AgentPreferences.update(savedPrefs.id, data);
      } else {
        return base44.entities.AgentPreferences.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentPreferences'] });
      toast.success('تم حفظ التفضيلات');
      onSave?.(preferences);
      onOpenChange(false);
    }
  });

  const moveModule = (index, direction) => {
    const newModules = [...preferences.modules];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newModules.length) return;
    [newModules[index], newModules[newIndex]] = [newModules[newIndex], newModules[index]];
    setPreferences({ ...preferences, modules: newModules });
  };

  const toggleModuleVisibility = (index) => {
    const newModules = [...preferences.modules];
    newModules[index].visible = !newModules[index].visible;
    setPreferences({ ...preferences, modules: newModules });
  };

  const updateShortcut = (index, key) => {
    const newShortcuts = [...preferences.shortcuts];
    newShortcuts[index].key = key.toUpperCase();
    setPreferences({ ...preferences, shortcuts: newShortcuts });
    setEditingShortcut(null);
  };

  const resetToDefaults = () => {
    setPreferences({
      theme: 'dark',
      fontSize: 'medium',
      modules: defaultModules,
      shortcuts: defaultShortcuts,
      notifications: { sound: true, visual: true, desktop: true },
    });
    toast.info('تم إعادة التعيين للإعدادات الافتراضية');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            تخصيص واجهة العمل
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/50 border border-slate-700 w-full">
            <TabsTrigger value="layout" className="flex-1">
              <Layout className="w-4 h-4 ml-1" />
              التخطيط
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="flex-1">
              <Keyboard className="w-4 h-4 ml-1" />
              الاختصارات
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex-1">
              <Palette className="w-4 h-4 ml-1" />
              المظهر
            </TabsTrigger>
          </TabsList>

          {/* Layout Tab */}
          <TabsContent value="layout" className="mt-4 space-y-4">
            <p className="text-slate-400 text-sm">اسحب لإعادة ترتيب الوحدات أو إخفائها</p>
            <div className="space-y-2">
              {preferences.modules.map((module, i) => (
                <div key={module.id} className={`flex items-center gap-2 p-3 rounded-lg ${module.visible ? 'bg-slate-800/50' : 'bg-slate-800/20 opacity-50'}`}>
                  <GripVertical className="w-4 h-4 text-slate-500 cursor-grab" />
                  <span className="text-white flex-1">{module.name}</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveModule(i, 'up')} disabled={i === 0}>
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveModule(i, 'down')} disabled={i === preferences.modules.length - 1}>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleModuleVisibility(i)}>
                      {module.visible ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Shortcuts Tab */}
          <TabsContent value="shortcuts" className="mt-4 space-y-4">
            <p className="text-slate-400 text-sm">اضغط على المفتاح لتغيير الاختصار</p>
            <div className="space-y-2">
              {preferences.shortcuts.map((shortcut, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-white">{shortcut.action}</span>
                  {editingShortcut === i ? (
                    <Input
                      autoFocus
                      className="w-16 text-center bg-cyan-500/20 border-cyan-500 text-cyan-400"
                      maxLength={1}
                      onKeyDown={(e) => {
                        if (e.key.length === 1) {
                          updateShortcut(i, e.key);
                        }
                      }}
                      onBlur={() => setEditingShortcut(null)}
                    />
                  ) : (
                    <Button
                      variant="outline"
                      className="border-slate-600 w-16"
                      onClick={() => setEditingShortcut(i)}
                    >
                      <kbd className="text-cyan-400">Ctrl+{shortcut.key}</kbd>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Theme Tab */}
          <TabsContent value="theme" className="mt-4 space-y-4">
            {/* Theme Selection */}
            <div>
              <Label className="text-slate-300 mb-2 block">سمة العرض</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'dark', label: 'داكن', icon: Moon },
                  { value: 'light', label: 'فاتح', icon: Sun },
                  { value: 'auto', label: 'تلقائي', icon: Monitor },
                ].map(theme => (
                  <Button
                    key={theme.value}
                    variant={preferences.theme === theme.value ? 'default' : 'outline'}
                    className={`flex-col h-auto py-3 ${preferences.theme === theme.value ? 'bg-cyan-600' : 'border-slate-600'}`}
                    onClick={() => setPreferences({ ...preferences, theme: theme.value })}
                  >
                    <theme.icon className="w-5 h-5 mb-1" />
                    {theme.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <Label className="text-slate-300 mb-2 block">حجم الخط</Label>
              <Select value={preferences.fontSize} onValueChange={(v) => setPreferences({ ...preferences, fontSize: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="small">صغير</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="large">كبير</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notifications */}
            <div>
              <Label className="text-slate-300 mb-2 block">الإشعارات</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">صوت</span>
                  <Switch
                    checked={preferences.notifications.sound}
                    onCheckedChange={(v) => setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, sound: v }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">مرئي</span>
                  <Switch
                    checked={preferences.notifications.visual}
                    onCheckedChange={(v) => setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, visual: v }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">سطح المكتب</span>
                  <Switch
                    checked={preferences.notifications.desktop}
                    onCheckedChange={(v) => setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, desktop: v }
                    })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="border-slate-600 flex-1" onClick={resetToDefaults}>
            <RotateCcw className="w-4 h-4 ml-1" />
            إعادة تعيين
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-700 flex-1" onClick={() => savePreferences.mutate()} disabled={savePreferences.isPending}>
            <Save className="w-4 h-4 ml-1" />
            {savePreferences.isPending ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}