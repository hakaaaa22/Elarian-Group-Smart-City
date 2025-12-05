import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, Plus, Settings, Save, Share2, Trash2, Copy, Eye,
  GripVertical, Maximize2, Minimize2, X, Check, Edit, Zap, Thermometer,
  Droplets, Lightbulb, Lock, Camera, Activity, Gauge, BarChart3,
  PieChart, LineChart, Clock, Bell, Wifi, Battery, Signal, Home,
  Users, Link, Globe, Download, Upload, Play, Palette, MousePointer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  LineChart as ReLineChart, Line, AreaChart, Area, ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';

// Widget Types
const widgetTypes = [
  { id: 'device_status', name: 'حالة الجهاز', icon: Zap, color: 'cyan', sizes: ['sm', 'md'], interactive: false },
  { id: 'temperature', name: 'درجة الحرارة', icon: Thermometer, color: 'red', sizes: ['sm', 'md'], interactive: false },
  { id: 'humidity', name: 'الرطوبة', icon: Droplets, color: 'blue', sizes: ['sm'], interactive: false },
  { id: 'energy_chart', name: 'رسم الطاقة', icon: LineChart, color: 'amber', sizes: ['md', 'lg'], interactive: false },
  { id: 'room_overview', name: 'نظرة على الغرفة', icon: Home, color: 'purple', sizes: ['md', 'lg'], interactive: true },
  { id: 'security_status', name: 'حالة الأمان', icon: Lock, color: 'green', sizes: ['sm', 'md'], interactive: true },
  { id: 'camera_feed', name: 'بث الكاميرا', icon: Camera, color: 'slate', sizes: ['md', 'lg'], interactive: false },
  { id: 'protocol_status', name: 'حالة البروتوكولات', icon: Wifi, color: 'indigo', sizes: ['sm', 'md'], interactive: false },
  { id: 'alerts', name: 'التنبيهات', icon: Bell, color: 'red', sizes: ['sm', 'md', 'lg'], interactive: true },
  { id: 'quick_actions', name: 'إجراءات سريعة', icon: Activity, color: 'pink', sizes: ['sm', 'md'], interactive: true },
  { id: 'gauge', name: 'مقياس', icon: Gauge, color: 'emerald', sizes: ['sm'], interactive: false },
  { id: 'statistics', name: 'إحصائيات', icon: BarChart3, color: 'orange', sizes: ['md', 'lg'], interactive: false },
  { id: 'device_control', name: 'تحكم بالجهاز', icon: Zap, color: 'cyan', sizes: ['sm', 'md'], interactive: true },
  { id: 'scene_button', name: 'زر سيناريو', icon: Play, color: 'green', sizes: ['sm'], interactive: true },
  { id: 'analytics_summary', name: 'ملخص التحليلات', icon: BarChart3, color: 'purple', sizes: ['md', 'lg'], interactive: false },
  { id: 'learning_insights', name: 'رؤى التعلم', icon: Eye, color: 'pink', sizes: ['md'], interactive: false },
  { id: 'energy_comparison', name: 'مقارنة الطاقة', icon: BarChart3, color: 'emerald', sizes: ['md', 'lg'], interactive: false },
  { id: 'forecast_widget', name: 'توقعات الاستهلاك', icon: Activity, color: 'cyan', sizes: ['md', 'lg'], interactive: false },
  { id: 'report_summary', name: 'ملخص التقارير', icon: Eye, color: 'amber', sizes: ['md', 'lg'], interactive: false },
  { id: 'device_health', name: 'صحة الأجهزة', icon: Activity, color: 'red', sizes: ['md'], interactive: true },
];

// Widget color options
const widgetColors = ['cyan', 'purple', 'amber', 'green', 'red', 'pink', 'indigo', 'blue', 'emerald', 'orange'];

// Widget icons
const widgetIcons = [Zap, Thermometer, Droplets, Home, Lock, Camera, Wifi, Bell, Activity, Gauge, BarChart3, Eye];

// Sample Dashboards
const sampleDashboards = [
  {
    id: 'dash1',
    name: 'نظرة عامة على المنزل',
    description: 'لوحة رئيسية لمراقبة جميع الأجهزة',
    isDefault: true,
    shared: false,
    widgets: [
      { id: 'w1', type: 'device_status', size: 'sm', position: { x: 0, y: 0 }, config: { deviceCount: 12, online: 10 } },
      { id: 'w2', type: 'temperature', size: 'sm', position: { x: 1, y: 0 }, config: { value: 24, room: 'غرفة المعيشة' } },
      { id: 'w3', type: 'energy_chart', size: 'md', position: { x: 2, y: 0 }, config: {} },
      { id: 'w4', type: 'security_status', size: 'sm', position: { x: 0, y: 1 }, config: { armed: true, cameras: 4 } },
      { id: 'w5', type: 'alerts', size: 'sm', position: { x: 1, y: 1 }, config: { count: 3 } },
    ]
  },
  {
    id: 'dash2',
    name: 'مراقبة الطاقة',
    description: 'تتبع استهلاك الطاقة',
    isDefault: false,
    shared: true,
    widgets: [
      { id: 'w1', type: 'energy_chart', size: 'lg', position: { x: 0, y: 0 }, config: {} },
      { id: 'w2', type: 'gauge', size: 'sm', position: { x: 0, y: 1 }, config: { value: 65, label: 'الاستهلاك الحالي' } },
      { id: 'w3', type: 'statistics', size: 'md', position: { x: 1, y: 1 }, config: {} },
    ]
  },
  {
    id: 'dash3',
    name: 'الأمان والمراقبة',
    description: 'مراقبة الكاميرات والأمان',
    isDefault: false,
    shared: false,
    widgets: [
      { id: 'w1', type: 'camera_feed', size: 'lg', position: { x: 0, y: 0 }, config: { camera: 'المدخل' } },
      { id: 'w2', type: 'security_status', size: 'md', position: { x: 0, y: 1 }, config: {} },
      { id: 'w3', type: 'alerts', size: 'md', position: { x: 1, y: 1 }, config: {} },
    ]
  }
];

// Sample chart data
const chartData = [
  { time: '00', value: 20, predicted: 22 },
  { time: '04', value: 15, predicted: 18 },
  { time: '08', value: 35, predicted: 32 },
  { time: '12', value: 45, predicted: 48 },
  { time: '16', value: 55, predicted: 52 },
  { time: '20', value: 40, predicted: 38 },
];

// Comparison data for widgets
const comparisonData = {
  energy: {
    current: 45.2,
    predicted: 48.5,
    yesterday: 52.1,
    lastWeek: 49.8,
    average: 47.2
  },
  cost: {
    current: 28,
    predicted: 32,
    yesterday: 35,
    budget: 40
  }
};

export default function CustomDashboardBuilder({ devices = [] }) {
  const [dashboards, setDashboards] = useState(sampleDashboards);
  const [activeDashboard, setActiveDashboard] = useState(sampleDashboards[0]);
  const [editMode, setEditMode] = useState(false);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);
  const [newDashboard, setNewDashboard] = useState({ name: '', description: '' });
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false);
  const [customizingWidget, setCustomizingWidget] = useState(null);

  const createDashboard = () => {
    if (!newDashboard.name.trim()) {
      toast.error('يرجى إدخال اسم اللوحة');
      return;
    }
    const dashboard = {
      id: `dash-${Date.now()}`,
      name: newDashboard.name,
      description: newDashboard.description,
      isDefault: false,
      shared: false,
      widgets: []
    };
    setDashboards([...dashboards, dashboard]);
    setActiveDashboard(dashboard);
    setShowCreateDialog(false);
    setNewDashboard({ name: '', description: '' });
    setEditMode(true);
    toast.success('تم إنشاء اللوحة');
  };

  const addWidget = (widgetType) => {
    if (!activeDashboard) return;
    const newWidget = {
      id: `widget-${Date.now()}`,
      type: widgetType.id,
      size: widgetType.sizes[0],
      position: { x: 0, y: activeDashboard.widgets.length },
      config: {},
      style: { color: widgetType.color, icon: widgetType.id }
    };
    const updated = {
      ...activeDashboard,
      widgets: [...activeDashboard.widgets, newWidget]
    };
    setActiveDashboard(updated);
    setDashboards(dashboards.map(d => d.id === updated.id ? updated : d));
    setShowWidgetPicker(false);
    toast.success('تم إضافة العنصر');
  };

  const updateWidgetStyle = (widgetId, style) => {
    const updated = {
      ...activeDashboard,
      widgets: activeDashboard.widgets.map(w =>
        w.id === widgetId ? { ...w, style: { ...w.style, ...style } } : w
      )
    };
    setActiveDashboard(updated);
    setDashboards(dashboards.map(d => d.id === updated.id ? updated : d));
  };

  const executeWidgetAction = (widget) => {
    if (widget.type === 'scene_button') {
      toast.success(`جاري تشغيل السيناريو: ${widget.config.sceneName || 'سيناريو'}`);
    } else if (widget.type === 'device_control') {
      toast.success(`تم التحكم بالجهاز: ${widget.config.deviceName || 'جهاز'}`);
    } else if (widget.type === 'quick_actions') {
      toast.success('تم تنفيذ الإجراء');
    }
  };

  const removeWidget = (widgetId) => {
    const updated = {
      ...activeDashboard,
      widgets: activeDashboard.widgets.filter(w => w.id !== widgetId)
    };
    setActiveDashboard(updated);
    setDashboards(dashboards.map(d => d.id === updated.id ? updated : d));
    toast.success('تم حذف العنصر');
  };

  const updateWidgetSize = (widgetId, size) => {
    const updated = {
      ...activeDashboard,
      widgets: activeDashboard.widgets.map(w =>
        w.id === widgetId ? { ...w, size } : w
      )
    };
    setActiveDashboard(updated);
    setDashboards(dashboards.map(d => d.id === updated.id ? updated : d));
  };

  const deleteDashboard = (dashboardId) => {
    setDashboards(dashboards.filter(d => d.id !== dashboardId));
    if (activeDashboard?.id === dashboardId) {
      setActiveDashboard(dashboards[0]);
    }
    toast.success('تم حذف اللوحة');
  };

  const duplicateDashboard = (dashboard) => {
    const newDash = {
      ...dashboard,
      id: `dash-${Date.now()}`,
      name: `${dashboard.name} (نسخة)`,
      isDefault: false,
      shared: false
    };
    setDashboards([...dashboards, newDash]);
    toast.success('تم نسخ اللوحة');
  };

  const shareDashboard = () => {
    navigator.clipboard.writeText(`https://app.elariangroup.com/dashboard/${activeDashboard?.id}`);
    toast.success('تم نسخ رابط المشاركة');
    setShowShareDialog(false);
  };

  const setAsDefault = (dashboardId) => {
    setDashboards(dashboards.map(d => ({
      ...d,
      isDefault: d.id === dashboardId
    })));
    toast.success('تم تعيين اللوحة كافتراضية');
  };

  const exportDashboard = (dashboard) => {
    const data = JSON.stringify(dashboard, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard_${dashboard.name}.json`;
    a.click();
    toast.success('تم تصدير اللوحة');
  };

  const importDashboard = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const dashboard = JSON.parse(event.target.result);
          dashboard.id = `dash-${Date.now()}`;
          dashboard.name = `${dashboard.name} (مستورد)`;
          setDashboards([...dashboards, dashboard]);
          toast.success('تم استيراد اللوحة');
        } catch {
          toast.error('فشل في استيراد اللوحة');
        }
      };
      reader.readAsText(file);
    }
  };

  const renderWidget = (widget) => {
    const widgetType = widgetTypes.find(w => w.id === widget.type);
    const Icon = widgetType?.icon || Activity;
    const sizeClasses = {
      sm: 'col-span-1',
      md: 'col-span-2',
      lg: 'col-span-3'
    };

    return (
      <motion.div
        key={widget.id}
        layout
        className={`${sizeClasses[widget.size]} relative group`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 h-full min-h-[120px] ${
          editMode ? 'cursor-move hover:border-cyan-500/50' : ''
        }`}>
          {editMode && (
            <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Button size="icon" variant="ghost" className="h-6 w-6 bg-slate-800" onClick={() => removeWidget(widget.id)}>
                <X className="w-3 h-3 text-red-400" />
              </Button>
              <Select value={widget.size} onValueChange={(v) => updateWidgetSize(widget.id, v)}>
                <SelectTrigger className="h-6 w-16 bg-slate-800 border-none text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {widgetType?.sizes.map(s => (
                    <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <CardContent className="p-4 h-full">
            {/* Widget Content Based on Type */}
            {widget.type === 'device_status' && (
              <div className="h-full flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-cyan-500/20">
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-xl">{widget.config.online || 10}/{widget.config.deviceCount || 12}</p>
                    <p className="text-slate-400 text-xs">أجهزة متصلة</p>
                  </div>
                </div>
                <Progress value={(widget.config.online / widget.config.deviceCount) * 100 || 83} className="h-2" />
              </div>
            )}

            {widget.type === 'temperature' && (
              <div className="h-full flex flex-col justify-center items-center">
                <Thermometer className="w-8 h-8 text-red-400 mb-2" />
                <p className="text-white font-bold text-3xl">{widget.config.value || 24}°C</p>
                <p className="text-slate-400 text-xs">{widget.config.room || 'غرفة المعيشة'}</p>
              </div>
            )}

            {widget.type === 'humidity' && (
              <div className="h-full flex flex-col justify-center items-center">
                <Droplets className="w-8 h-8 text-blue-400 mb-2" />
                <p className="text-white font-bold text-3xl">{widget.config.value || 55}%</p>
                <p className="text-slate-400 text-xs">الرطوبة</p>
              </div>
            )}

            {widget.type === 'energy_chart' && (
              <div className="h-full">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium text-sm">استهلاك الطاقة</p>
                  <Badge className="bg-amber-500/20 text-amber-400 text-xs">اليوم</Badge>
                </div>
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <Area type="monotone" dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {widget.type === 'security_status' && (
              <div className="h-full flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${widget.config.armed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    <Lock className={`w-5 h-5 ${widget.config.armed ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                  <div>
                    <p className="text-white font-medium">{widget.config.armed ? 'مُفعّل' : 'غير مُفعّل'}</p>
                    <p className="text-slate-400 text-xs">{widget.config.cameras || 4} كاميرات نشطة</p>
                  </div>
                </div>
              </div>
            )}

            {widget.type === 'alerts' && (
              <div className="h-full">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-medium text-sm">التنبيهات</p>
                  <Badge className="bg-red-500/20 text-red-400">{widget.config.count || 3}</Badge>
                </div>
                <div className="space-y-2">
                  {[
                    { text: 'باب المدخل مفتوح', time: '5 دقائق' },
                    { text: 'بطارية منخفضة', time: '1 ساعة' },
                  ].map((alert, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 bg-slate-800/50 rounded">
                      <span className="text-white">{alert.text}</span>
                      <span className="text-slate-500">{alert.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {widget.type === 'gauge' && (
              <div className="h-full flex flex-col justify-center items-center">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="35" stroke="#334155" strokeWidth="8" fill="none" />
                    <circle
                      cx="40" cy="40" r="35"
                      stroke="#10b981"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(widget.config.value || 65) * 2.2} 220`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{widget.config.value || 65}%</span>
                  </div>
                </div>
                <p className="text-slate-400 text-xs mt-2">{widget.config.label || 'الكفاءة'}</p>
              </div>
            )}

            {widget.type === 'protocol_status' && (
              <div className="h-full flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <Wifi className="w-5 h-5 text-indigo-400" />
                  <p className="text-white font-medium">البروتوكولات</p>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-green-500/20 text-green-400 text-xs">WiFi</Badge>
                  <Badge className="bg-green-500/20 text-green-400 text-xs">Zigbee</Badge>
                  <Badge className="bg-slate-500/20 text-slate-400 text-xs">Z-Wave</Badge>
                </div>
              </div>
            )}

            {widget.type === 'quick_actions' && (
              <div className="h-full">
                <p className="text-white font-medium text-sm mb-3">إجراءات سريعة</p>
                <div className="grid grid-cols-2 gap-2">
                  {['إضاءة', 'قفل', 'مكيف', 'ستائر'].map((action, i) => (
                    <Button key={i} size="sm" variant="outline" className="border-slate-600 text-xs">
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {widget.type === 'camera_feed' && (
              <div className="h-full">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium text-sm">{widget.config.camera || 'الكاميرا'}</p>
                  <Badge className="bg-red-500/20 text-red-400 text-xs animate-pulse">● مباشر</Badge>
                </div>
                <div className="bg-slate-900 rounded-lg h-32 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-slate-600" />
                </div>
              </div>
            )}

            {widget.type === 'room_overview' && (
              <div className="h-full">
                <p className="text-white font-medium text-sm mb-3">غرفة المعيشة</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Lightbulb, value: 'ON', color: 'amber' },
                    { icon: Thermometer, value: '24°', color: 'red' },
                    { icon: Droplets, value: '55%', color: 'blue' },
                  ].map((item, i) => (
                    <div key={i} className="text-center p-2 bg-slate-800/50 rounded">
                      <item.icon className={`w-4 h-4 text-${item.color}-400 mx-auto mb-1`} />
                      <p className="text-white text-xs">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {widget.type === 'statistics' && (
              <div className="h-full">
                <p className="text-white font-medium text-sm mb-3">إحصائيات اليوم</p>
                <div className="space-y-2">
                  {[
                    { label: 'الاستهلاك', value: '12.5 kWh', change: -8 },
                    { label: 'التكلفة', value: '25 ر.س', change: -12 },
                    { label: 'التوفير', value: '15%', change: 5 },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs">{stat.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm">{stat.value}</span>
                        <Badge className={`text-[10px] ${stat.change > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {stat.change > 0 ? '+' : ''}{stat.change}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Device Control */}
            {widget.type === 'device_control' && (
              <div className="h-full flex flex-col justify-center items-center">
                <Button 
                  className={`w-16 h-16 rounded-full bg-${widget.style?.color || 'cyan'}-500/20 hover:bg-${widget.style?.color || 'cyan'}-500/40`}
                  onClick={() => executeWidgetAction(widget)}
                >
                  <Zap className={`w-8 h-8 text-${widget.style?.color || 'cyan'}-400`} />
                </Button>
                <p className="text-white text-sm mt-2">{widget.config.deviceName || 'تحكم'}</p>
                <p className="text-slate-500 text-xs">اضغط للتبديل</p>
              </div>
            )}

            {/* Scene Button */}
            {widget.type === 'scene_button' && (
              <div className="h-full flex flex-col justify-center items-center">
                <Button 
                  className={`w-full h-full rounded-xl bg-gradient-to-br from-${widget.style?.color || 'green'}-500/30 to-${widget.style?.color || 'green'}-600/10 hover:from-${widget.style?.color || 'green'}-500/50 border border-${widget.style?.color || 'green'}-500/30`}
                  onClick={() => executeWidgetAction(widget)}
                >
                  <div className="text-center">
                    <Play className={`w-8 h-8 text-${widget.style?.color || 'green'}-400 mx-auto mb-1`} />
                    <p className="text-white font-medium">{widget.config.sceneName || 'سيناريو'}</p>
                  </div>
                </Button>
              </div>
            )}

            {/* Analytics Summary */}
            {widget.type === 'analytics_summary' && (
              <div className="h-full">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium text-sm">ملخص التحليلات</p>
                  <Badge className="bg-purple-500/20 text-purple-400 text-xs">مباشر</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="p-2 bg-slate-800/50 rounded text-center">
                    <p className="text-amber-400 font-bold">15.5</p>
                    <p className="text-slate-500 text-[10px]">kWh اليوم</p>
                  </div>
                  <div className="p-2 bg-slate-800/50 rounded text-center">
                    <p className="text-green-400 font-bold">-12%</p>
                    <p className="text-slate-500 text-[10px]">مقارنة بأمس</p>
                  </div>
                </div>
                <div className="h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Learning Insights */}
            {widget.type === 'learning_insights' && (
              <div className="h-full">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium text-sm">رؤى التعلم</p>
                  <Eye className="w-4 h-4 text-pink-400" />
                </div>
                <div className="space-y-2">
                  <div className="p-2 bg-green-500/10 rounded border border-green-500/30">
                    <p className="text-green-400 text-xs">نمط مكتشف: وقت النوم</p>
                    <p className="text-slate-500 text-[10px]">ثقة 89%</p>
                  </div>
                  <div className="p-2 bg-amber-500/10 rounded border border-amber-500/30">
                    <p className="text-amber-400 text-xs">اقتراح: توفير 15%</p>
                    <p className="text-slate-500 text-[10px]">بتفعيل 2 أنماط</p>
                  </div>
                </div>
              </div>
            )}

            {/* Energy Comparison Widget */}
            {widget.type === 'energy_comparison' && (
              <div className="h-full">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-medium text-sm">مقارنة الاستهلاك</p>
                  <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">مباشر</Badge>
                </div>
                <div className="space-y-2">
                  {/* Current vs Predicted */}
                  <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span className="text-slate-400 text-xs">الحالي</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{comparisonData.energy.current} kWh</span>
                      <Badge className={`text-[10px] ${comparisonData.energy.current < comparisonData.energy.predicted ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {comparisonData.energy.current < comparisonData.energy.predicted ? '-7%' : '+7%'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-slate-400 text-xs">المتوقع</span>
                    </div>
                    <span className="text-amber-400 font-bold">{comparisonData.energy.predicted} kWh</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                      <span className="text-slate-400 text-xs">أمس</span>
                    </div>
                    <span className="text-slate-300">{comparisonData.energy.yesterday} kWh</span>
                  </div>
                </div>
                {/* Mini comparison bar */}
                <div className="mt-3 h-3 bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="bg-cyan-500 h-full" style={{ width: `${(comparisonData.energy.current / comparisonData.energy.yesterday) * 100}%` }} />
                </div>
                <p className="text-center text-slate-500 text-[10px] mt-1">
                  توفير {Math.round((1 - comparisonData.energy.current / comparisonData.energy.yesterday) * 100)}% مقارنة بأمس
                </p>
              </div>
            )}

            {/* Forecast Widget */}
            {widget.type === 'forecast_widget' && (
              <div className="h-full">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium text-sm">توقعات الاستهلاك</p>
                  <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">AI</Badge>
                </div>
                <div className="h-20 mb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <Area type="monotone" dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} name="فعلي" />
                      <Area type="monotone" dataKey="predicted" stroke="#f59e0b" fill="none" strokeDasharray="5 5" name="متوقع" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="text-slate-400">فعلي</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-slate-400">متوقع</span>
                  </div>
                  <span className={`font-medium ${comparisonData.energy.current < comparisonData.energy.predicted ? 'text-green-400' : 'text-red-400'}`}>
                    {comparisonData.energy.current < comparisonData.energy.predicted ? 'أفضل من المتوقع ✓' : 'أعلى من المتوقع ⚠'}
                  </span>
                </div>
              </div>
            )}

            {/* Report Summary Widget */}
            {widget.type === 'report_summary' && (
              <div className="h-full">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium text-sm">ملخص التقارير</p>
                  <Eye className="w-4 h-4 text-amber-400" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-green-500/10 rounded border border-green-500/30 text-center">
                    <p className="text-green-400 font-bold text-lg">-12%</p>
                    <p className="text-slate-500 text-[10px]">استهلاك الأسبوع</p>
                  </div>
                  <div className="p-2 bg-cyan-500/10 rounded border border-cyan-500/30 text-center">
                    <p className="text-cyan-400 font-bold text-lg">95%</p>
                    <p className="text-slate-500 text-[10px]">كفاءة الأجهزة</p>
                  </div>
                  <div className="p-2 bg-amber-500/10 rounded border border-amber-500/30 text-center">
                    <p className="text-amber-400 font-bold text-lg">85 ر.س</p>
                    <p className="text-slate-500 text-[10px]">توفير الشهر</p>
                  </div>
                  <div className="p-2 bg-purple-500/10 rounded border border-purple-500/30 text-center">
                    <p className="text-purple-400 font-bold text-lg">3</p>
                    <p className="text-slate-500 text-[10px]">تنبيهات نشطة</p>
                  </div>
                </div>
              </div>
            )}

            {/* Device Health Widget */}
            {widget.type === 'device_health' && (
              <div className="h-full">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium text-sm">صحة الأجهزة</p>
                  <Badge className="bg-red-500/20 text-red-400 text-xs">2 تحذير</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">قفل الباب</span>
                    <div className="flex items-center gap-2">
                      <Progress value={45} className="w-16 h-1.5" />
                      <span className="text-red-400 text-xs font-bold">45%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">المكيف</span>
                    <div className="flex items-center gap-2">
                      <Progress value={72} className="w-16 h-1.5" />
                      <span className="text-amber-400 text-xs font-bold">72%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">الكاميرا</span>
                    <div className="flex items-center gap-2">
                      <Progress value={88} className="w-16 h-1.5" />
                      <span className="text-green-400 text-xs font-bold">88%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customize Button in Edit Mode */}
        {editMode && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute bottom-2 left-2 h-6 w-6 bg-slate-800 opacity-0 group-hover:opacity-100"
            onClick={() => { setCustomizingWidget(widget); setShowCustomizeDialog(true); }}
          >
            <Palette className="w-3 h-3 text-purple-400" />
          </Button>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-cyan-400" />
            لوحات التحكم المخصصة
          </h3>
          <p className="text-slate-400 text-sm">أنشئ وخصص لوحات تحكم حسب احتياجاتك</p>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button variant="outline" className="border-slate-600" onClick={() => setShowWidgetPicker(true)}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة عنصر
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => { setEditMode(false); toast.success('تم الحفظ'); }}>
                <Save className="w-4 h-4 ml-2" />
                حفظ
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="border-slate-600" onClick={() => setEditMode(true)}>
                <Edit className="w-4 h-4 ml-2" />
                تعديل
              </Button>
              <Button variant="outline" className="border-slate-600" onClick={() => setShowShareDialog(true)}>
                <Share2 className="w-4 h-4 ml-2" />
                مشاركة
              </Button>
              <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 ml-2" />
                لوحة جديدة
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {dashboards.map(dashboard => (
          <div key={dashboard.id} className="relative group">
            <button
              onClick={() => { setActiveDashboard(dashboard); setEditMode(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeDashboard?.id === dashboard.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              {dashboard.name}
              {dashboard.isDefault && <Badge className="bg-amber-500/20 text-amber-400 text-[10px]">افتراضي</Badge>}
              {dashboard.shared && <Share2 className="w-3 h-3 text-green-400" />}
            </button>
            {/* Quick Actions Menu */}
            <div className="absolute top-full right-0 mt-1 hidden group-hover:flex flex-col bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 min-w-[140px]">
              <button onClick={() => setAsDefault(dashboard.id)} className="px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 text-right">
                تعيين كافتراضي
              </button>
              <button onClick={() => duplicateDashboard(dashboard)} className="px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 text-right">
                نسخ
              </button>
              <button onClick={() => exportDashboard(dashboard)} className="px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 text-right">
                تصدير
              </button>
              <button onClick={() => deleteDashboard(dashboard.id)} className="px-3 py-2 text-xs text-red-400 hover:bg-slate-700 text-right">
                حذف
              </button>
            </div>
          </div>
        ))}
        {/* Import Button */}
        <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 text-slate-400 border border-dashed border-slate-600 hover:border-slate-500 cursor-pointer">
          <Upload className="w-4 h-4" />
          <span className="text-sm">استيراد</span>
          <input type="file" accept=".json" className="hidden" onChange={importDashboard} />
        </label>
      </div>

      {/* Dashboard Content */}
      {activeDashboard && (
        <div className="grid grid-cols-3 gap-4">
          <AnimatePresence>
            {activeDashboard.widgets.map(widget => renderWidget(widget))}
          </AnimatePresence>

          {editMode && activeDashboard.widgets.length === 0 && (
            <div className="col-span-3 border-2 border-dashed border-slate-700 rounded-xl p-12 text-center">
              <LayoutGrid className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">أضف عناصر إلى اللوحة</p>
              <Button onClick={() => setShowWidgetPicker(true)}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة عنصر
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Widget Picker Dialog */}
      <Dialog open={showWidgetPicker} onOpenChange={setShowWidgetPicker}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">اختر عنصر</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {widgetTypes.map(widget => {
              const Icon = widget.icon;
              return (
                <button
                  key={widget.id}
                  onClick={() => addWidget(widget)}
                  className={`p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-${widget.color}-500/50 transition-all text-center`}
                >
                  <div className={`p-2 rounded-lg bg-${widget.color}-500/20 w-fit mx-auto mb-2`}>
                    <Icon className={`w-5 h-5 text-${widget.color}-400`} />
                  </div>
                  <p className="text-white text-sm">{widget.name}</p>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Dashboard Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">إنشاء لوحة تحكم جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">اسم اللوحة</Label>
              <Input
                value={newDashboard.name}
                onChange={(e) => setNewDashboard({ ...newDashboard, name: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="مثال: مراقبة الطاقة"
              />
            </div>
            <div>
              <Label className="text-slate-300">الوصف</Label>
              <Input
                value={newDashboard.description}
                onChange={(e) => setNewDashboard({ ...newDashboard, description: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="وصف مختصر"
              />
            </div>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={createDashboard}>
              <Plus className="w-4 h-4 ml-2" />
              إنشاء اللوحة
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">مشاركة اللوحة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">رابط المشاركة</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  readOnly
                  value={`https://app.elariangroup.com/dashboard/${activeDashboard?.id}`}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
                <Button onClick={shareDashboard}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-slate-300">مشاركة مع مستخدمين</Label>
              <Input
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="البريد الإلكتروني"
              />
              <div className="flex gap-2 mt-2">
                {['user1@example.com', 'user2@example.com'].map((email, i) => (
                  <Badge key={i} className="bg-slate-700 text-slate-300 text-xs">
                    {email}
                    <X className="w-3 h-3 mr-1 cursor-pointer" />
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-slate-300">صلاحيات المشاركة</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-white text-sm">السماح بالعرض فقط</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-white text-sm">السماح بالتعديل</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-white text-sm">السماح بإعادة المشاركة</span>
                  <Switch />
                </div>
              </div>
            </div>
            <div>
              <Label className="text-slate-300">انتهاء الصلاحية</Label>
              <Select defaultValue="never">
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="never">بدون انتهاء</SelectItem>
                  <SelectItem value="1day">يوم واحد</SelectItem>
                  <SelectItem value="7days">أسبوع</SelectItem>
                  <SelectItem value="30days">شهر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={shareDashboard}>
              <Share2 className="w-4 h-4 ml-2" />
              مشاركة
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customize Widget Dialog */}
      <Dialog open={showCustomizeDialog} onOpenChange={setShowCustomizeDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">تخصيص العنصر</DialogTitle>
          </DialogHeader>
          {customizingWidget && (
            <div className="space-y-4 mt-4">
              {/* Color Selection */}
              <div>
                <Label className="text-slate-300">اللون</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {widgetColors.map(color => (
                    <button
                      key={color}
                      onClick={() => updateWidgetStyle(customizingWidget.id, { color })}
                      className={`w-8 h-8 rounded-full bg-${color}-500 transition-all ${
                        customizingWidget.style?.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Config based on widget type */}
              {customizingWidget.type === 'device_control' && (
                <div>
                  <Label className="text-slate-300">اسم الجهاز</Label>
                  <Input
                    value={customizingWidget.config.deviceName || ''}
                    onChange={(e) => {
                      const updated = {
                        ...activeDashboard,
                        widgets: activeDashboard.widgets.map(w =>
                          w.id === customizingWidget.id ? { ...w, config: { ...w.config, deviceName: e.target.value } } : w
                        )
                      };
                      setActiveDashboard(updated);
                      setDashboards(dashboards.map(d => d.id === updated.id ? updated : d));
                      setCustomizingWidget({ ...customizingWidget, config: { ...customizingWidget.config, deviceName: e.target.value } });
                    }}
                    className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    placeholder="اسم الجهاز"
                  />
                </div>
              )}

              {customizingWidget.type === 'scene_button' && (
                <div>
                  <Label className="text-slate-300">اسم السيناريو</Label>
                  <Input
                    value={customizingWidget.config.sceneName || ''}
                    onChange={(e) => {
                      const updated = {
                        ...activeDashboard,
                        widgets: activeDashboard.widgets.map(w =>
                          w.id === customizingWidget.id ? { ...w, config: { ...w.config, sceneName: e.target.value } } : w
                        )
                      };
                      setActiveDashboard(updated);
                      setDashboards(dashboards.map(d => d.id === updated.id ? updated : d));
                      setCustomizingWidget({ ...customizingWidget, config: { ...customizingWidget.config, sceneName: e.target.value } });
                    }}
                    className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    placeholder="اسم السيناريو"
                  />
                </div>
              )}

              {customizingWidget.type === 'temperature' && (
                <div>
                  <Label className="text-slate-300">الغرفة</Label>
                  <Select 
                    value={customizingWidget.config.room || 'living'}
                    onValueChange={(v) => {
                      const updated = {
                        ...activeDashboard,
                        widgets: activeDashboard.widgets.map(w =>
                          w.id === customizingWidget.id ? { ...w, config: { ...w.config, room: v } } : w
                        )
                      };
                      setActiveDashboard(updated);
                      setDashboards(dashboards.map(d => d.id === updated.id ? updated : d));
                    }}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="living">غرفة المعيشة</SelectItem>
                      <SelectItem value="bedroom">غرفة النوم</SelectItem>
                      <SelectItem value="kitchen">المطبخ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => { setShowCustomizeDialog(false); toast.success('تم حفظ التخصيص'); }}>
                <Check className="w-4 h-4 ml-2" />
                حفظ
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}