import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Plus, Save, Share2, Trash2, Eye, Settings, GripVertical,
  Shield, Building2, Car, Radio, Camera, Trash, Activity, Users, Bell, 
  BarChart3, LineChart, PieChart, Map, Clock, AlertTriangle, Heart, Zap,
  RefreshCw, Maximize, Minimize, X, Check, ChevronDown, Copy, Lock, Unlock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// قوالب الأدوار
const roleTemplates = {
  security_operator: {
    name: 'مشغل الأمن',
    icon: Shield,
    color: 'red',
    description: 'لوحة تحكم متخصصة لفرق الأمن والمراقبة',
    widgets: [
      { id: 'w1', type: 'ai_alerts', module: 'ai_vision', title: 'تنبيهات AI الأمنية', size: 'large' },
      { id: 'w2', type: 'camera_grid', module: 'ai_vision', title: 'شبكة الكاميرات', size: 'large' },
      { id: 'w3', type: 'threat_map', module: 'ai_vision', title: 'خريطة التهديدات', size: 'medium' },
      { id: 'w4', type: 'incident_list', module: 'ai_vision', title: 'الحوادث النشطة', size: 'medium' },
    ]
  },
  municipal_manager: {
    name: 'مدير البلدية',
    icon: Building2,
    color: 'cyan',
    description: 'لوحة شاملة لإدارة خدمات البلدية',
    widgets: [
      { id: 'w1', type: 'waste_overview', module: 'municipality', title: 'نظرة عامة على النفايات', size: 'large' },
      { id: 'w2', type: 'bin_status', module: 'municipality', title: 'حالة الحاويات', size: 'medium' },
      { id: 'w3', type: 'fleet_tracking', module: 'fleet', title: 'تتبع الأسطول', size: 'medium' },
      { id: 'w4', type: 'citizen_reports', module: 'municipality', title: 'بلاغات المواطنين', size: 'medium' },
    ]
  },
  hospital_admin: {
    name: 'مدير المستشفى',
    icon: Heart,
    color: 'pink',
    description: 'لوحة تحكم لإدارة عمليات المستشفى',
    widgets: [
      { id: 'w1', type: 'bed_occupancy', module: 'hospital', title: 'إشغال الأسرة', size: 'large' },
      { id: 'w2', type: 'er_flow', module: 'hospital', title: 'تدفق الطوارئ', size: 'medium' },
      { id: 'w3', type: 'surgery_schedule', module: 'hospital', title: 'جدول العمليات', size: 'medium' },
      { id: 'w4', type: 'pharmacy_alerts', module: 'hospital', title: 'تنبيهات الصيدلية', size: 'small' },
    ]
  },
  tower_operator: {
    name: 'مشغل الأبراج',
    icon: Radio,
    color: 'green',
    description: 'مراقبة وصيانة أبراج الاتصالات',
    widgets: [
      { id: 'w1', type: 'tower_status', module: 'towers', title: 'حالة الأبراج', size: 'large' },
      { id: 'w2', type: 'signal_map', module: 'towers', title: 'خريطة الإشارة', size: 'medium' },
      { id: 'w3', type: 'maintenance_alerts', module: 'towers', title: 'تنبيهات الصيانة', size: 'medium' },
      { id: 'w4', type: 'performance_chart', module: 'towers', title: 'أداء الأبراج', size: 'medium' },
    ]
  },
  executive: {
    name: 'المدير التنفيذي',
    icon: BarChart3,
    color: 'purple',
    description: 'نظرة شاملة على جميع الأنظمة',
    widgets: [
      { id: 'w1', type: 'kpi_overview', module: 'global', title: 'مؤشرات الأداء', size: 'large' },
      { id: 'w2', type: 'system_health', module: 'global', title: 'صحة الأنظمة', size: 'medium' },
      { id: 'w3', type: 'alerts_summary', module: 'global', title: 'ملخص التنبيهات', size: 'medium' },
      { id: 'w4', type: 'trend_analysis', module: 'global', title: 'تحليل الاتجاهات', size: 'medium' },
    ]
  }
};

// أنواع الويدجت المتاحة
const availableWidgets = [
  { id: 'ai_alerts', name: 'تنبيهات AI', module: 'ai_vision', icon: AlertTriangle },
  { id: 'camera_grid', name: 'شبكة الكاميرات', module: 'ai_vision', icon: Camera },
  { id: 'threat_map', name: 'خريطة التهديدات', module: 'ai_vision', icon: Map },
  { id: 'waste_overview', name: 'نظرة النفايات', module: 'municipality', icon: Trash },
  { id: 'bin_status', name: 'حالة الحاويات', module: 'municipality', icon: Trash },
  { id: 'fleet_tracking', name: 'تتبع الأسطول', module: 'fleet', icon: Car },
  { id: 'bed_occupancy', name: 'إشغال الأسرة', module: 'hospital', icon: Heart },
  { id: 'tower_status', name: 'حالة الأبراج', module: 'towers', icon: Radio },
  { id: 'kpi_overview', name: 'مؤشرات الأداء', module: 'global', icon: BarChart3 },
  { id: 'system_health', name: 'صحة الأنظمة', module: 'global', icon: Activity },
  { id: 'user_activity', name: 'نشاط المستخدمين', module: 'global', icon: Users },
  { id: 'real_time_chart', name: 'رسم بياني مباشر', module: 'global', icon: LineChart },
];

// مكون الويدجت
function WidgetCard({ widget, onRemove, onEdit, isEditing }) {
  const Icon = availableWidgets.find(w => w.id === widget.type)?.icon || Activity;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`${widget.size === 'large' ? 'col-span-2 row-span-2' : widget.size === 'medium' ? 'col-span-1 row-span-2' : 'col-span-1 row-span-1'}`}
    >
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 h-full group">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              {isEditing && <GripVertical className="w-4 h-4 text-slate-500 cursor-move" />}
              <Icon className="w-4 h-4 text-cyan-400" />
              {widget.title}
            </CardTitle>
            {isEditing && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onEdit(widget)}>
                  <Settings className="w-3 h-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={() => onRemove(widget.id)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-full min-h-[100px] flex items-center justify-center">
            {/* Placeholder content */}
            <div className="text-center">
              <Icon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-xs">{widget.type}</p>
              <Badge className="mt-2 bg-slate-700 text-slate-400 text-[10px]">{widget.module}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function RoleBasedDashboardBuilder() {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentDashboard, setCurrentDashboard] = useState({
    name: 'لوحتي المخصصة',
    widgets: []
  });
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  const queryClient = useQueryClient();

  // Load user dashboards
  const { data: savedDashboards } = useQuery({
    queryKey: ['userDashboards'],
    queryFn: () => base44.entities.UserDashboard.list(),
    initialData: []
  });

  // Save dashboard mutation
  const saveMutation = useMutation({
    mutationFn: async (dashboard) => {
      const user = await base44.auth.me();
      return base44.entities.UserDashboard.create({
        user_email: user.email,
        dashboard_name: dashboard.name,
        widgets: dashboard.widgets,
        role_template: selectedTemplate || 'custom'
      });
    },
    onSuccess: () => {
      toast.success('تم حفظ اللوحة بنجاح');
      queryClient.invalidateQueries(['userDashboards']);
    }
  });

  const applyTemplate = (templateKey) => {
    const template = roleTemplates[templateKey];
    setCurrentDashboard({
      name: `لوحة ${template.name}`,
      widgets: template.widgets
    });
    setSelectedTemplate(templateKey);
    setShowTemplates(false);
    toast.success(`تم تطبيق قالب ${template.name}`);
  };

  const addWidget = (widgetType) => {
    const widgetInfo = availableWidgets.find(w => w.id === widgetType);
    const newWidget = {
      id: `w${Date.now()}`,
      type: widgetType,
      module: widgetInfo.module,
      title: widgetInfo.name,
      size: 'medium'
    };
    setCurrentDashboard(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget]
    }));
    setShowAddWidget(false);
  };

  const removeWidget = (widgetId) => {
    setCurrentDashboard(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId)
    }));
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-cyan-400" />
            منشئ لوحات التحكم المخصصة
          </h2>
          <p className="text-slate-400 text-sm">أنشئ لوحة تحكم مخصصة لدورك</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-purple-500/50 text-purple-400" onClick={() => setShowTemplates(true)}>
            <Copy className="w-4 h-4 ml-2" />
            قوالب جاهزة
          </Button>
          <Button variant="outline" className="border-slate-600" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? <Lock className="w-4 h-4 ml-2" /> : <Unlock className="w-4 h-4 ml-2" />}
            {isEditing ? 'قفل' : 'تعديل'}
          </Button>
          {isEditing && (
            <>
              <Button variant="outline" className="border-cyan-500/50 text-cyan-400" onClick={() => setShowAddWidget(true)}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة ويدجت
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => saveMutation.mutate(currentDashboard)}>
                <Save className="w-4 h-4 ml-2" />
                حفظ
              </Button>
            </>
          )}
          <Button variant="outline" className="border-slate-600" onClick={() => setShowShareDialog(true)}>
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Dashboard Name */}
      {isEditing && (
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-slate-400 text-sm">اسم اللوحة</label>
                <Input 
                  value={currentDashboard.name}
                  onChange={(e) => setCurrentDashboard(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-800 border-slate-700 mt-1"
                />
              </div>
              {selectedTemplate && (
                <Badge className={`bg-${roleTemplates[selectedTemplate].color}-500/20 text-${roleTemplates[selectedTemplate].color}-400`}>
                  قالب: {roleTemplates[selectedTemplate].name}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Widgets Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[150px]">
        <AnimatePresence>
          {currentDashboard.widgets.map(widget => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              onRemove={removeWidget}
              onEdit={() => {}}
              isEditing={isEditing}
            />
          ))}
        </AnimatePresence>
        
        {currentDashboard.widgets.length === 0 && (
          <div className="col-span-full row-span-2 flex items-center justify-center">
            <div className="text-center">
              <LayoutDashboard className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">لوحتك فارغة. ابدأ بإضافة ويدجت أو اختر قالباً جاهزاً</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setShowTemplates(true)}>
                  <Copy className="w-4 h-4 ml-2" />
                  اختر قالباً
                </Button>
                <Button variant="outline" onClick={() => { setIsEditing(true); setShowAddWidget(true); }}>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة ويدجت
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">قوالب لوحات التحكم الجاهزة</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {Object.entries(roleTemplates).map(([key, template]) => {
              const Icon = template.icon;
              return (
                <Card key={key} className={`glass-card border-${template.color}-500/30 bg-${template.color}-500/5 cursor-pointer hover:scale-[1.02] transition-transform`}
                      onClick={() => applyTemplate(key)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-xl bg-${template.color}-500/20`}>
                        <Icon className={`w-6 h-6 text-${template.color}-400`} />
                      </div>
                      <div>
                        <p className="text-white font-medium">{template.name}</p>
                        <p className="text-slate-400 text-sm mt-1">{template.description}</p>
                        <p className="text-slate-500 text-xs mt-2">{template.widgets.length} ويدجت</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Widget Dialog */}
      <Dialog open={showAddWidget} onOpenChange={setShowAddWidget}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">إضافة ويدجت جديد</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {availableWidgets.map(widget => {
              const Icon = widget.icon;
              return (
                <Button key={widget.id} variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 border-slate-700 hover:border-cyan-500/50"
                        onClick={() => addWidget(widget.id)}>
                  <Icon className="w-6 h-6 text-cyan-400" />
                  <span className="text-white text-sm">{widget.name}</span>
                  <Badge className="bg-slate-700 text-slate-400 text-[10px]">{widget.module}</Badge>
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-cyan-400" />
              مشاركة اللوحة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-slate-400 text-sm">مشاركة مع</label>
              <Input className="bg-slate-800 border-slate-700 mt-1" placeholder="أدخل البريد الإلكتروني" />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">السماح بالتعديل</span>
              <Switch />
            </div>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
              <Share2 className="w-4 h-4 ml-2" />
              مشاركة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}