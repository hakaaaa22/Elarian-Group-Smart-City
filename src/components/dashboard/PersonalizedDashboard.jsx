import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  LayoutDashboard, Plus, Settings, Eye, EyeOff, GripVertical, X,
  BarChart3, Users, Wrench, AlertTriangle, CheckCircle, Clock,
  TrendingUp, Activity, Package, Car, Phone, Calendar, Target,
  Save, RotateCcw, Palette, Maximize2, Minimize2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

// Widget Templates by Role
const widgetTemplates = {
  technician: [
    { id: 'active_tasks', name: 'المهام النشطة', icon: Wrench, size: 'medium', color: 'amber' },
    { id: 'schedule', name: 'الجدول اليومي', icon: Calendar, size: 'large', color: 'cyan' },
    { id: 'parts_inventory', name: 'قطع الغيار', icon: Package, size: 'small', color: 'purple' },
    { id: 'route_map', name: 'خريطة المسار', icon: Car, size: 'large', color: 'green' },
  ],
  manager: [
    { id: 'team_performance', name: 'أداء الفريق', icon: Users, size: 'large', color: 'cyan' },
    { id: 'kpis', name: 'مؤشرات الأداء', icon: TrendingUp, size: 'medium', color: 'green' },
    { id: 'alerts', name: 'التنبيهات', icon: AlertTriangle, size: 'small', color: 'red' },
    { id: 'reports', name: 'التقارير', icon: BarChart3, size: 'medium', color: 'purple' },
  ],
  operator: [
    { id: 'call_queue', name: 'قائمة الانتظار', icon: Phone, size: 'medium', color: 'green' },
    { id: 'active_calls', name: 'المكالمات النشطة', icon: Activity, size: 'small', color: 'cyan' },
    { id: 'tickets', name: 'التذاكر', icon: Target, size: 'large', color: 'amber' },
    { id: 'satisfaction', name: 'رضا العملاء', icon: CheckCircle, size: 'small', color: 'green' },
  ],
  admin: [
    { id: 'system_health', name: 'صحة النظام', icon: Activity, size: 'medium', color: 'green' },
    { id: 'user_activity', name: 'نشاط المستخدمين', icon: Users, size: 'large', color: 'cyan' },
    { id: 'security_alerts', name: 'تنبيهات أمنية', icon: AlertTriangle, size: 'small', color: 'red' },
    { id: 'usage_stats', name: 'إحصائيات الاستخدام', icon: BarChart3, size: 'medium', color: 'purple' },
  ],
};

// All Available Widgets
const allWidgets = [
  { id: 'active_tasks', name: 'المهام النشطة', icon: Wrench, color: 'amber', category: 'tasks' },
  { id: 'schedule', name: 'الجدول اليومي', icon: Calendar, color: 'cyan', category: 'schedule' },
  { id: 'parts_inventory', name: 'قطع الغيار', icon: Package, color: 'purple', category: 'inventory' },
  { id: 'route_map', name: 'خريطة المسار', icon: Car, color: 'green', category: 'fleet' },
  { id: 'team_performance', name: 'أداء الفريق', icon: Users, color: 'cyan', category: 'performance' },
  { id: 'kpis', name: 'مؤشرات الأداء', icon: TrendingUp, color: 'green', category: 'analytics' },
  { id: 'alerts', name: 'التنبيهات', icon: AlertTriangle, color: 'red', category: 'alerts' },
  { id: 'reports', name: 'التقارير', icon: BarChart3, color: 'purple', category: 'analytics' },
  { id: 'call_queue', name: 'قائمة الانتظار', icon: Phone, color: 'green', category: 'calls' },
  { id: 'active_calls', name: 'المكالمات النشطة', icon: Activity, color: 'cyan', category: 'calls' },
  { id: 'tickets', name: 'التذاكر', icon: Target, color: 'amber', category: 'support' },
  { id: 'satisfaction', name: 'رضا العملاء', icon: CheckCircle, color: 'green', category: 'analytics' },
  { id: 'system_health', name: 'صحة النظام', icon: Activity, color: 'green', category: 'system' },
  { id: 'user_activity', name: 'نشاط المستخدمين', icon: Users, color: 'cyan', category: 'users' },
  { id: 'security_alerts', name: 'تنبيهات أمنية', icon: AlertTriangle, color: 'red', category: 'security' },
  { id: 'usage_stats', name: 'إحصائيات الاستخدام', icon: BarChart3, color: 'purple', category: 'analytics' },
  { id: 'maintenance_summary', name: 'ملخص الصيانة', icon: Wrench, color: 'amber', category: 'maintenance' },
  { id: 'fleet_status', name: 'حالة الأسطول', icon: Car, color: 'blue', category: 'fleet' },
  { id: 'pending_approvals', name: 'الموافقات المعلقة', icon: Clock, color: 'amber', category: 'workflow' },
];

// Mock Widget Data
const getWidgetData = (widgetId) => {
  const data = {
    active_tasks: { value: 8, trend: '+2', details: '3 عاجلة' },
    schedule: { value: 5, trend: '', details: 'مهام اليوم' },
    team_performance: { value: '94%', trend: '+5%', details: 'الأداء العام' },
    kpis: { value: 12, trend: '+3', details: 'مؤشرات خضراء' },
    alerts: { value: 3, trend: '-1', details: 'تنبيهات نشطة' },
    call_queue: { value: 7, trend: '+2', details: 'في الانتظار' },
    system_health: { value: '99.9%', trend: '', details: 'وقت التشغيل' },
    security_alerts: { value: 0, trend: '', details: 'لا تهديدات' },
  };
  return data[widgetId] || { value: '-', trend: '', details: '' };
};

export default function PersonalizedDashboard({ userRole = 'manager' }) {
  const [widgets, setWidgets] = useState([]);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load user's saved dashboard or use role template
  useEffect(() => {
    const saved = localStorage.getItem(`dashboard_${userRole}`);
    if (saved) {
      setWidgets(JSON.parse(saved));
    } else {
      setWidgets(widgetTemplates[userRole] || widgetTemplates.manager);
    }
  }, [userRole]);

  // Save dashboard layout
  const saveDashboard = () => {
    localStorage.setItem(`dashboard_${userRole}`, JSON.stringify(widgets));
    toast.success('تم حفظ تخصيص لوحة التحكم');
    setIsEditMode(false);
  };

  // Reset to default
  const resetDashboard = () => {
    setWidgets(widgetTemplates[userRole] || widgetTemplates.manager);
    localStorage.removeItem(`dashboard_${userRole}`);
    toast.success('تم إعادة التعيين للافتراضي');
  };

  // Handle drag end
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setWidgets(items);
  };

  // Add widget
  const addWidget = (widget) => {
    if (widgets.find(w => w.id === widget.id)) {
      toast.error('هذا العنصر موجود بالفعل');
      return;
    }
    setWidgets([...widgets, { ...widget, size: 'medium' }]);
    setShowAddWidget(false);
    toast.success(`تم إضافة ${widget.name}`);
  };

  // Remove widget
  const removeWidget = (widgetId) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
  };

  // Toggle widget visibility
  const toggleWidget = (widgetId) => {
    setWidgets(widgets.map(w => 
      w.id === widgetId ? { ...w, hidden: !w.hidden } : w
    ));
  };

  // Change widget size
  const changeWidgetSize = (widgetId, size) => {
    setWidgets(widgets.map(w => 
      w.id === widgetId ? { ...w, size } : w
    ));
  };

  const getSizeClass = (size) => {
    switch (size) {
      case 'small': return 'col-span-1';
      case 'large': return 'col-span-2 lg:col-span-3';
      default: return 'col-span-1 lg:col-span-2';
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <LayoutDashboard className="w-7 h-7 text-cyan-400" />
            لوحة التحكم الشخصية
          </h1>
          <p className="text-slate-400 text-sm">خصص لوحة التحكم حسب احتياجاتك</p>
        </div>
        <div className="flex gap-2">
          {isEditMode ? (
            <>
              <Button variant="outline" className="border-slate-600" onClick={resetDashboard}>
                <RotateCcw className="w-4 h-4 ml-2" />
                إعادة تعيين
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={saveDashboard}>
                <Save className="w-4 h-4 ml-2" />
                حفظ
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="border-cyan-500/50 text-cyan-400" onClick={() => setShowAddWidget(true)}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة عنصر
              </Button>
              <Button variant="outline" className="border-slate-600" onClick={() => setIsEditMode(true)}>
                <Settings className="w-4 h-4 ml-2" />
                تخصيص
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Widgets Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard" direction="horizontal">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {widgets.filter(w => !w.hidden).map((widget, index) => {
                const Icon = widget.icon;
                const data = getWidgetData(widget.id);
                
                return (
                  <Draggable 
                    key={widget.id} 
                    draggableId={widget.id} 
                    index={index}
                    isDragDisabled={!isEditMode}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${getSizeClass(widget.size)} ${snapshot.isDragging ? 'z-50' : ''}`}
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 h-full ${isEditMode ? 'border-dashed border-cyan-500/50' : ''}`}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {isEditMode && (
                                    <div {...provided.dragHandleProps}>
                                      <GripVertical className="w-4 h-4 text-slate-500 cursor-grab" />
                                    </div>
                                  )}
                                  <Icon className={`w-5 h-5 text-${widget.color}-400`} />
                                  <CardTitle className="text-white text-sm">{widget.name}</CardTitle>
                                </div>
                                {isEditMode && (
                                  <div className="flex gap-1">
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => changeWidgetSize(widget.id, widget.size === 'small' ? 'medium' : widget.size === 'medium' ? 'large' : 'small')}>
                                      {widget.size === 'large' ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={() => removeWidget(widget.id)}>
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="text-center py-4">
                                <p className="text-3xl font-bold text-white">{data.value}</p>
                                {data.trend && (
                                  <Badge className={`mt-2 ${data.trend.startsWith('+') ? 'bg-green-500/20 text-green-400' : data.trend.startsWith('-') ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                    {data.trend}
                                  </Badge>
                                )}
                                <p className="text-slate-400 text-sm mt-2">{data.details}</p>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Widget Dialog */}
      <Dialog open={showAddWidget} onOpenChange={setShowAddWidget}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              إضافة عنصر جديد
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {allWidgets.filter(w => !widgets.find(ww => ww.id === w.id)).map(widget => {
              const Icon = widget.icon;
              return (
                <Button
                  key={widget.id}
                  variant="outline"
                  className={`border-${widget.color}-500/30 h-20 flex-col justify-center`}
                  onClick={() => addWidget(widget)}
                >
                  <Icon className={`w-6 h-6 text-${widget.color}-400 mb-2`} />
                  <span className="text-white text-sm">{widget.name}</span>
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}