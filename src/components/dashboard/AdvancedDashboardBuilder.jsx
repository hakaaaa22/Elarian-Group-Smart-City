import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, Plus, Save, Eye, Trash2, GripVertical, Settings, RefreshCw,
  BarChart3, Activity, Users, Car, Package, AlertTriangle, TrendingUp, Copy,
  Share2, Download, Upload, Palette, Lock, Unlock, Maximize2, Minimize2, X,
  PieChart, LineChart, Map, Table, Gauge, Target, Clock, Bell
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  LineChart as RechartsLine, Line, AreaChart, Area, BarChart, Bar,
  PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// أنواع العناصر
const widgetTypes = [
  { id: 'stat', name: 'إحصائية', icon: BarChart3, category: 'basic' },
  { id: 'lineChart', name: 'خط بياني', icon: LineChart, category: 'charts' },
  { id: 'barChart', name: 'أعمدة', icon: BarChart3, category: 'charts' },
  { id: 'pieChart', name: 'دائري', icon: PieChart, category: 'charts' },
  { id: 'areaChart', name: 'مساحة', icon: TrendingUp, category: 'charts' },
  { id: 'gauge', name: 'مقياس', icon: Gauge, category: 'charts' },
  { id: 'map', name: 'خريطة حرارية', icon: Map, category: 'advanced' },
  { id: 'table', name: 'جدول', icon: Table, category: 'basic' },
  { id: 'tasks', name: 'مهام', icon: Target, category: 'basic' },
  { id: 'alerts', name: 'تنبيهات', icon: Bell, category: 'basic' },
  { id: 'activity', name: 'نشاط', icon: Activity, category: 'basic' },
  { id: 'clock', name: 'ساعة', icon: Clock, category: 'basic' },
];

// مصادر البيانات
const dataSources = [
  { id: 'fleet', name: 'الأسطول', color: 'green' },
  { id: 'cameras', name: 'الكاميرات', color: 'cyan' },
  { id: 'devices', name: 'الأجهزة', color: 'purple' },
  { id: 'waste', name: 'النفايات', color: 'amber' },
  { id: 'energy', name: 'الطاقة', color: 'yellow' },
  { id: 'water', name: 'المياه', color: 'blue' },
  { id: 'patients', name: 'المرضى', color: 'red' },
  { id: 'traffic', name: 'المرور', color: 'orange' },
];

// قوالب جاهزة
const dashboardTemplates = [
  { id: 't1', name: 'مدير العمليات', description: 'لوحة شاملة للعمليات', widgets: 6, color: 'cyan' },
  { id: 't2', name: 'مدير الأسطول', description: 'تتبع المركبات والصيانة', widgets: 5, color: 'green' },
  { id: 't3', name: 'مسؤول الأمان', description: 'مراقبة الكاميرات والتنبيهات', widgets: 7, color: 'red' },
  { id: 't4', name: 'محلل البيانات', description: 'رسوم بيانية وتحليلات', widgets: 8, color: 'purple' },
];

// بيانات تجريبية
const sampleChartData = [
  { name: 'يناير', value: 400, value2: 240 },
  { name: 'فبراير', value: 300, value2: 139 },
  { name: 'مارس', value: 200, value2: 980 },
  { name: 'أبريل', value: 278, value2: 390 },
  { name: 'مايو', value: 189, value2: 480 },
];

const COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'];

export default function AdvancedDashboardBuilder() {
  const [activeTab, setActiveTab] = useState('builder');
  const [widgets, setWidgets] = useState([]);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);
  const [dashboardName, setDashboardName] = useState('لوحة التحكم الرئيسية');
  const [isLocked, setIsLocked] = useState(false);
  const [newWidget, setNewWidget] = useState({ type: 'stat', title: '', dataSource: 'fleet', size: 'medium', color: 'cyan' });

  // تحميل اللوحات المحفوظة
  const { data: savedDashboards = [] } = useQuery({
    queryKey: ['savedDashboards'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return user?.saved_dashboards || [];
    },
    initialData: []
  });

  // حفظ اللوحة
  const saveDashboard = useMutation({
    mutationFn: async () => {
      await base44.auth.updateMe({
        saved_dashboards: [...savedDashboards, { name: dashboardName, widgets, createdAt: new Date().toISOString() }]
      });
    },
    onSuccess: () => toast.success('تم حفظ اللوحة')
  });

  const handleDragEnd = (result) => {
    if (!result.destination || isLocked) return;
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setWidgets(items);
  };

  const addWidget = () => {
    if (!newWidget.title) {
      toast.error('يرجى إدخال عنوان');
      return;
    }
    setWidgets([...widgets, { ...newWidget, id: `w${Date.now()}`, locked: false }]);
    setShowAddWidget(false);
    setNewWidget({ type: 'stat', title: '', dataSource: 'fleet', size: 'medium', color: 'cyan' });
    toast.success('تم إضافة العنصر');
  };

  const removeWidget = (id) => {
    if (isLocked) return;
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  const duplicateWidget = (widget) => {
    setWidgets([...widgets, { ...widget, id: `w${Date.now()}`, title: `${widget.title} (نسخة)` }]);
    toast.success('تم نسخ العنصر');
  };

  const applyTemplate = (template) => {
    // محاكاة تطبيق قالب
    toast.success(`تم تطبيق قالب "${template.name}"`);
  };

  // عرض محتوى العنصر
  const renderWidgetContent = (widget) => {
    const WidgetIcon = widgetTypes.find(t => t.id === widget.type)?.icon || BarChart3;
    
    switch (widget.type) {
      case 'lineChart':
        return (
          <ResponsiveContainer width="100%" height={120}>
            <RechartsLine data={sampleChartData}>
              <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} dot={false} />
            </RechartsLine>
          </ResponsiveContainer>
        );
      case 'barChart':
        return (
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={sampleChartData}>
              <Bar dataKey="value" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pieChart':
        return (
          <ResponsiveContainer width="100%" height={120}>
            <RechartsPie>
              <Pie data={sampleChartData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={50}>
                {sampleChartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
            </RechartsPie>
          </ResponsiveContainer>
        );
      case 'areaChart':
        return (
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={sampleChartData}>
              <Area type="monotone" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'stat':
        return (
          <div className="text-center py-4">
            <p className="text-3xl font-bold text-white">1,234</p>
            <p className="text-slate-400 text-sm">{widget.dataSource}</p>
          </div>
        );
      default:
        return (
          <div className="h-24 flex items-center justify-center">
            <WidgetIcon className="w-8 h-8 text-slate-600" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between flex-wrap gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <LayoutGrid className="w-6 h-6 text-cyan-400" />
          <Input
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            className="bg-transparent border-none text-xl font-bold text-white p-0 h-auto focus-visible:ring-0"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" className={`border-slate-600 ${isLocked ? 'text-amber-400' : 'text-slate-400'}`} onClick={() => setIsLocked(!isLocked)}>
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="outline" className="border-purple-500 text-purple-400" onClick={() => setShowShareDialog(true)}>
            <Share2 className="w-4 h-4 ml-1" />
            مشاركة
          </Button>
          <Button size="sm" variant="outline" className="border-cyan-500 text-cyan-400" onClick={() => setShowAddWidget(true)} disabled={isLocked}>
            <Plus className="w-4 h-4 ml-1" />
            إضافة
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => saveDashboard.mutate()}>
            <Save className="w-4 h-4 ml-1" />
            حفظ
          </Button>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="builder">المحرر</TabsTrigger>
          <TabsTrigger value="templates">القوالب</TabsTrigger>
          <TabsTrigger value="saved">المحفوظة</TabsTrigger>
        </TabsList>

        {/* Builder Tab */}
        <TabsContent value="builder" className="mt-4">
          {/* Widget Categories */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 mb-4">
            <CardContent className="p-3">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {widgetTypes.map(type => (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => !isLocked && setNewWidget({ ...newWidget, type: type.id, title: type.name })}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg whitespace-nowrap"
                  >
                    <type.icon className="w-4 h-4 text-cyan-400" />
                    <span className="text-white text-sm">{type.name}</span>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Widgets Canvas */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="widgets" direction="horizontal">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {widgets.map((widget, index) => (
                      <Draggable key={widget.id} draggableId={widget.id} index={index} isDragDisabled={isLocked}>
                        {(provided, snapshot) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={widget.size === 'large' ? 'md:col-span-2' : ''}
                          >
                            <Card className={`glass-card ${snapshot.isDragging ? 'border-cyan-500 shadow-lg shadow-cyan-500/20' : 'border-slate-700'} bg-[#0f1629]/80`}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div {...provided.dragHandleProps}>
                                      <GripVertical className="w-4 h-4 text-slate-500 cursor-grab" />
                                    </div>
                                    <span className="text-white font-medium text-sm">{widget.title}</span>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-slate-400" onClick={() => duplicateWidget(widget)}>
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-slate-400" onClick={() => setEditingWidget(widget)}>
                                      <Settings className="w-3 h-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-400" onClick={() => removeWidget(widget.id)} disabled={isLocked}>
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                                {renderWidgetContent(widget)}
                                <Badge className="bg-slate-700 text-slate-300 text-xs mt-2">{widget.dataSource}</Badge>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                  </AnimatePresence>
                  {provided.placeholder}

                  {/* Empty State */}
                  {widgets.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full"
                    >
                      <Card className="glass-card border-dashed border-slate-600 bg-transparent">
                        <CardContent className="p-12 text-center">
                          <LayoutGrid className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                          <p className="text-slate-400">اسحب العناصر هنا أو انقر على "إضافة" لإنشاء لوحتك</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {dashboardTemplates.map((template, i) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className={`glass-card border-${template.color}-500/30 bg-[#0f1629]/80 cursor-pointer`} onClick={() => applyTemplate(template)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-medium">{template.name}</p>
                        <p className="text-slate-400 text-sm mt-1">{template.description}</p>
                        <Badge className={`bg-${template.color}-500/20 text-${template.color}-400 mt-2`}>
                          {template.widgets} عناصر
                        </Badge>
                      </div>
                      <Button size="sm" className={`bg-${template.color}-600 hover:bg-${template.color}-700`}>
                        تطبيق
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Saved Tab */}
        <TabsContent value="saved" className="mt-4">
          {savedDashboards.length === 0 ? (
            <Card className="glass-card border-slate-700 bg-[#0f1629]/80">
              <CardContent className="p-8 text-center">
                <Save className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">لا توجد لوحات محفوظة</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {savedDashboards.map((dashboard, i) => (
                <Card key={i} className="glass-card border-slate-700 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{dashboard.name}</p>
                        <p className="text-slate-500 text-xs">{dashboard.widgets?.length || 0} عناصر</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-cyan-500 text-cyan-400">
                        تحميل
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Widget Dialog */}
      <Dialog open={showAddWidget} onOpenChange={setShowAddWidget}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">إضافة عنصر جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-400">العنوان</Label>
              <Input value={newWidget.title} onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-2" />
            </div>
            <div>
              <Label className="text-slate-400">النوع</Label>
              <Select value={newWidget.type} onValueChange={(v) => setNewWidget({ ...newWidget, type: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {widgetTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-400">مصدر البيانات</Label>
              <Select value={newWidget.dataSource} onValueChange={(v) => setNewWidget({ ...newWidget, dataSource: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dataSources.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-400">الحجم</Label>
              <Select value={newWidget.size} onValueChange={(v) => setNewWidget({ ...newWidget, size: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">صغير</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="large">كبير</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="border-slate-600" onClick={() => setShowAddWidget(false)}>إلغاء</Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={addWidget}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-purple-400" />
              مشاركة اللوحة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Input value={`https://platform.elarian.com/dashboard/${dashboardName}`} readOnly className="bg-slate-800/50 border-slate-700 text-white" />
              <Button size="sm" onClick={() => { navigator.clipboard.writeText(`https://platform.elarian.com/dashboard/${dashboardName}`); toast.success('تم نسخ الرابط'); }}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-slate-600">
                <Download className="w-4 h-4 ml-2" />
                تصدير JSON
              </Button>
              <Button variant="outline" className="flex-1 border-slate-600">
                <Upload className="w-4 h-4 ml-2" />
                استيراد
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}