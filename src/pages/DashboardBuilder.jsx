import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Plus, Save, Trash2, Edit, Copy, Settings, Eye, EyeOff,
  Palette, Grid, Rows, Columns, Maximize2, ChevronDown, MoreVertical,
  X, Check, RefreshCw, Download, Upload, Star, Lock, Unlock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import WidgetLibrary, { widgetCatalog } from '@/components/widgets/WidgetLibrary';
import WidgetRenderer from '@/components/widgets/WidgetRenderer';

const colorPresets = [
  { name: 'سماوي', primary: '#22d3ee', secondary: '#0891b2' },
  { name: 'بنفسجي', primary: '#a855f7', secondary: '#7c3aed' },
  { name: 'أخضر', primary: '#10b981', secondary: '#059669' },
  { name: 'برتقالي', primary: '#f59e0b', secondary: '#d97706' },
  { name: 'أحمر', primary: '#ef4444', secondary: '#dc2626' },
  { name: 'وردي', primary: '#ec4899', secondary: '#db2777' },
];

const defaultDashboards = [
  { id: 'd1', name: 'لوحة القيادة الرئيسية', widgets: [], isDefault: true, columns: 4, theme: colorPresets[0] },
  { id: 'd2', name: 'مراقبة الأسطول', widgets: [], isDefault: false, columns: 4, theme: colorPresets[1] },
];

export default function DashboardBuilder() {
  const [dashboards, setDashboards] = useState(defaultDashboards);
  const [selectedDashboard, setSelectedDashboard] = useState(dashboards[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewDashboard, setShowNewDashboard] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState('');
  const [draggedWidget, setDraggedWidget] = useState(null);

  const addWidget = (widget) => {
    const newWidget = {
      id: `w-${Date.now()}`,
      widgetId: widget.id,
      x: 0,
      y: selectedDashboard.widgets.length,
      w: widget.defaultSize.w,
      h: widget.defaultSize.h,
      config: { title: widget.name }
    };
    
    setSelectedDashboard(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget]
    }));
    
    setDashboards(prev => prev.map(d => 
      d.id === selectedDashboard.id 
        ? { ...d, widgets: [...d.widgets, newWidget] }
        : d
    ));
    
    toast.success(`تم إضافة "${widget.name}"`);
    setShowWidgetLibrary(false);
  };

  const removeWidget = (widgetInstanceId) => {
    setSelectedDashboard(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetInstanceId)
    }));
    
    setDashboards(prev => prev.map(d => 
      d.id === selectedDashboard.id 
        ? { ...d, widgets: d.widgets.filter(w => w.id !== widgetInstanceId) }
        : d
    ));
  };

  const createDashboard = () => {
    if (!newDashboardName.trim()) return;
    
    const newDashboard = {
      id: `d-${Date.now()}`,
      name: newDashboardName,
      widgets: [],
      isDefault: false,
      columns: 4,
      theme: colorPresets[0]
    };
    
    setDashboards(prev => [...prev, newDashboard]);
    setSelectedDashboard(newDashboard);
    setNewDashboardName('');
    setShowNewDashboard(false);
    toast.success('تم إنشاء لوحة القيادة');
  };

  const deleteDashboard = (id) => {
    if (dashboards.length <= 1) {
      toast.error('لا يمكن حذف آخر لوحة قيادة');
      return;
    }
    setDashboards(prev => prev.filter(d => d.id !== id));
    if (selectedDashboard.id === id) {
      setSelectedDashboard(dashboards.find(d => d.id !== id));
    }
    toast.success('تم حذف لوحة القيادة');
  };

  const updateDashboardSettings = (updates) => {
    setSelectedDashboard(prev => ({ ...prev, ...updates }));
    setDashboards(prev => prev.map(d => 
      d.id === selectedDashboard.id ? { ...d, ...updates } : d
    ));
  };

  const saveDashboard = () => {
    toast.success('تم حفظ لوحة القيادة');
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-cyan-400" />
              منشئ لوحات القيادة
            </h1>
            <p className="text-slate-400 mt-1">تصميم وتخصيص لوحات القيادة الخاصة بك</p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" className="border-slate-600" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4 ml-2" />
                  إلغاء
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={saveDashboard}>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="border-slate-600" onClick={() => setShowSettings(true)}>
                  <Settings className="w-4 h-4 ml-2" />
                  إعدادات
                </Button>
                <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 ml-2" />
                  تعديل
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Dashboard Tabs */}
      <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
        {dashboards.map(dashboard => (
          <div
            key={dashboard.id}
            onClick={() => setSelectedDashboard(dashboard)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all whitespace-nowrap ${
              selectedDashboard.id === dashboard.id
                ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{dashboard.name}</span>
            {dashboard.isDefault && <Star className="w-3 h-3 text-amber-400" />}
            {isEditing && dashboards.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); deleteDashboard(dashboard.id); }}
                className="ml-2 text-red-400 hover:text-red-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <Dialog open={showNewDashboard} onOpenChange={setShowNewDashboard}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-slate-400">
              <Plus className="w-4 h-4 ml-1" />
              جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0f1629] border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">إنشاء لوحة قيادة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-slate-300">اسم لوحة القيادة</Label>
                <Input
                  value={newDashboardName}
                  onChange={(e) => setNewDashboardName(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  placeholder="مثال: مراقبة الأسطول"
                />
              </div>
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={createDashboard}>
                <Plus className="w-4 h-4 ml-2" />
                إنشاء
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Dashboard Canvas */}
        <div className="flex-1">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 min-h-[600px]">
            <CardHeader className="border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">{selectedDashboard.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className="bg-slate-700 text-slate-300">
                    {selectedDashboard.widgets.length} أداة
                  </Badge>
                  <Badge className="bg-slate-700 text-slate-300">
                    {selectedDashboard.columns} أعمدة
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {selectedDashboard.widgets.length === 0 ? (
                <div className="h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl">
                  <LayoutDashboard className="w-16 h-16 text-slate-600 mb-4" />
                  <p className="text-slate-400 mb-4">لا توجد أدوات في هذه اللوحة</p>
                  {isEditing && (
                    <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowWidgetLibrary(true)}>
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة أداة
                    </Button>
                  )}
                </div>
              ) : (
                <div 
                  className="grid gap-4"
                  style={{ gridTemplateColumns: `repeat(${selectedDashboard.columns}, 1fr)` }}
                >
                  {selectedDashboard.widgets.map((widgetInstance) => {
                    const widgetDef = widgetCatalog.find(w => w.id === widgetInstance.widgetId);
                    if (!widgetDef) return null;
                    
                    return (
                      <div
                        key={widgetInstance.id}
                        style={{
                          gridColumn: `span ${widgetInstance.w}`,
                          gridRow: `span ${widgetInstance.h}`,
                          minHeight: widgetInstance.h * 150
                        }}
                      >
                        <WidgetRenderer
                          widget={widgetDef}
                          config={widgetInstance.config}
                          isEditing={isEditing}
                          onRemove={() => removeWidget(widgetInstance.id)}
                          onConfigure={() => {}}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
              
              {isEditing && selectedDashboard.widgets.length > 0 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" className="border-slate-600" onClick={() => setShowWidgetLibrary(true)}>
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة أداة أخرى
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Widget Library Dialog */}
      <Dialog open={showWidgetLibrary} onOpenChange={setShowWidgetLibrary}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">مكتبة الأدوات</DialogTitle>
          </DialogHeader>
          <WidgetLibrary onAddWidget={addWidget} onClose={() => setShowWidgetLibrary(false)} />
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-[#0f1629] border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">إعدادات لوحة القيادة</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div>
              <Label className="text-slate-300">اسم لوحة القيادة</Label>
              <Input
                value={selectedDashboard.name}
                onChange={(e) => updateDashboardSettings({ name: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
              />
            </div>
            
            <div>
              <Label className="text-slate-300">عدد الأعمدة: {selectedDashboard.columns}</Label>
              <Slider
                value={[selectedDashboard.columns]}
                onValueChange={([v]) => updateDashboardSettings({ columns: v })}
                min={2}
                max={6}
                step={1}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label className="text-slate-300 mb-2 block">نظام الألوان</Label>
              <div className="grid grid-cols-3 gap-2">
                {colorPresets.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => updateDashboardSettings({ theme: preset })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedDashboard.theme?.name === preset.name
                        ? 'border-white'
                        : 'border-transparent hover:border-slate-600'
                    }`}
                    style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})` }}
                  >
                    <span className="text-white text-xs">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-slate-300">تعيين كافتراضي</Label>
              <Switch
                checked={selectedDashboard.isDefault}
                onCheckedChange={(v) => {
                  if (v) {
                    setDashboards(prev => prev.map(d => ({ ...d, isDefault: d.id === selectedDashboard.id })));
                  }
                  updateDashboardSettings({ isDefault: v });
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}