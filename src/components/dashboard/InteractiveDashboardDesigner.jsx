import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  LayoutDashboard, Plus, Save, Share2, Settings, BarChart3, LineChart,
  PieChart, Activity, Map, Table, Gauge, Target, Trash2, Edit, Copy,
  Maximize2, Minimize2, Eye, Grid3X3, Layers, Car, Package, Phone, Cpu,
  Building2, RefreshCw, Download, Lock, Unlock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  LineChart as ReLineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'];

// وحدات التطبيق المتاحة
const modules = [
  { id: 'smartcity', name: 'المدينة الذكية', icon: Building2, color: 'cyan' },
  { id: 'fleet', name: 'الأسطول', icon: Car, color: 'purple' },
  { id: 'callcenter', name: 'مركز الاتصال', icon: Phone, color: 'green' },
  { id: 'waste', name: 'النفايات', icon: Package, color: 'amber' },
  { id: 'devices', name: 'الأجهزة', icon: Cpu, color: 'red' },
];

// عناصر التصور المتاحة
const widgetTypes = [
  { id: 'bar', name: 'رسم عمودي', icon: BarChart3, category: 'charts' },
  { id: 'line', name: 'رسم خطي', icon: LineChart, category: 'charts' },
  { id: 'area', name: 'رسم مساحة', icon: Activity, category: 'charts' },
  { id: 'pie', name: 'رسم دائري', icon: PieChart, category: 'charts' },
  { id: 'gauge', name: 'مقياس', icon: Gauge, category: 'kpis' },
  { id: 'kpi', name: 'مؤشر أداء', icon: Target, category: 'kpis' },
  { id: 'table', name: 'جدول', icon: Table, category: 'data' },
  { id: 'map', name: 'خريطة', icon: Map, category: 'advanced' },
  { id: 'report', name: 'تقرير مضمن', icon: Layers, category: 'advanced' },
];

// بيانات تجريبية
const sampleData = [
  { name: 'يناير', value: 85, target: 90 },
  { name: 'فبراير', value: 92, target: 90 },
  { name: 'مارس', value: 78, target: 90 },
  { name: 'أبريل', value: 95, target: 90 },
];

const pieData = [
  { name: 'نشط', value: 65 },
  { name: 'صيانة', value: 20 },
  { name: 'معطل', value: 15 },
];

// لوحات محفوظة
const savedDashboards = [
  { id: 'd1', name: 'لوحة الأداء الرئيسية', widgets: 6, shared: true },
  { id: 'd2', name: 'مراقبة الأسطول', widgets: 4, shared: false },
  { id: 'd3', name: 'تحليل النفايات', widgets: 5, shared: true },
];

export default function InteractiveDashboardDesigner() {
  const [activeTab, setActiveTab] = useState('designer');
  const [widgets, setWidgets] = useState([
    { id: 'w1', type: 'bar', title: 'أداء الأسطول', module: 'fleet', size: 'medium', locked: false },
    { id: 'w2', type: 'pie', title: 'حالة الأجهزة', module: 'devices', size: 'small', locked: false },
    { id: 'w3', type: 'kpi', title: 'كفاءة الجمع', module: 'waste', size: 'small', locked: false },
  ]);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [selectedModule, setSelectedModule] = useState('all');
  const [newWidget, setNewWidget] = useState({ type: 'bar', title: '', module: 'fleet', size: 'medium' });

  const handleDragEnd = (result) => {
    if (!result.destination || !editMode) return;
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setWidgets(items);
  };

  const addWidget = () => {
    if (!newWidget.title) {
      toast.error('يرجى إدخال عنوان العنصر');
      return;
    }
    setWidgets([...widgets, { ...newWidget, id: `w${Date.now()}`, locked: false }]);
    setShowAddWidget(false);
    setNewWidget({ type: 'bar', title: '', module: 'fleet', size: 'medium' });
    toast.success('تم إضافة العنصر');
  };

  const removeWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const toggleLock = (id) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, locked: !w.locked } : w));
  };

  const duplicateWidget = (widget) => {
    setWidgets([...widgets, { ...widget, id: `w${Date.now()}`, title: `${widget.title} (نسخة)` }]);
  };

  const saveDashboard = () => {
    toast.success('تم حفظ اللوحة بنجاح');
  };

  const renderWidget = (widget) => {
    switch (widget.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Bar dataKey="value" fill="#22d3ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} />
            </ReLineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} label>
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        );
      case 'kpi':
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-cyan-400">94%</p>
              <p className="text-slate-400 text-sm">الكفاءة</p>
              <Badge className="mt-2 bg-green-500/20 text-green-400">+5%</Badge>
            </div>
          </div>
        );
      case 'gauge':
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full border-4 border-cyan-500 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-white">87</span>
              </div>
              <p className="text-slate-400 text-sm mt-2">من 100</p>
            </div>
          </div>
        );
      case 'report':
        return (
          <div className="h-full flex items-center justify-center bg-slate-800/30 rounded">
            <div className="text-center text-slate-500">
              <Layers className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">تقرير مضمن</p>
            </div>
          </div>
        );
      default:
        return <div className="h-full flex items-center justify-center text-slate-500">جدول</div>;
    }
  };

  const filteredWidgets = selectedModule === 'all' ? widgets : widgets.filter(w => w.module === selectedModule);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-cyan-400" />
          مصمم لوحات المعلومات التفاعلية
        </h3>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-1">
            <Label className="text-slate-400 text-sm">وضع التحرير</Label>
            <Switch checked={editMode} onCheckedChange={setEditMode} />
          </div>
          <Button size="sm" variant="outline" className="border-purple-500 text-purple-400" onClick={() => setShowShareDialog(true)}>
            <Share2 className="w-4 h-4 ml-1" />
            مشاركة
          </Button>
          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700" onClick={saveDashboard}>
            <Save className="w-4 h-4 ml-1" />
            حفظ
          </Button>
        </div>
      </div>

      {/* Module Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant={selectedModule === 'all' ? 'default' : 'outline'}
          className={selectedModule === 'all' ? 'bg-cyan-600' : 'border-slate-600'}
          onClick={() => setSelectedModule('all')}
        >
          الكل
        </Button>
        {modules.map(mod => (
          <Button
            key={mod.id}
            size="sm"
            variant={selectedModule === mod.id ? 'default' : 'outline'}
            className={selectedModule === mod.id ? `bg-${mod.color}-600` : 'border-slate-600'}
            onClick={() => setSelectedModule(mod.id)}
          >
            <mod.icon className="w-4 h-4 ml-1" />
            {mod.name}
          </Button>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="designer" className="data-[state=active]:bg-cyan-500/20">
            <Grid3X3 className="w-4 h-4 ml-1" />
            المصمم
          </TabsTrigger>
          <TabsTrigger value="widgets" className="data-[state=active]:bg-purple-500/20">
            <Layers className="w-4 h-4 ml-1" />
            العناصر
          </TabsTrigger>
          <TabsTrigger value="saved" className="data-[state=active]:bg-green-500/20">
            <Save className="w-4 h-4 ml-1" />
            المحفوظة
          </TabsTrigger>
        </TabsList>

        {/* Designer Tab */}
        <TabsContent value="designer" className="mt-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="dashboard">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[400px]">
                  {filteredWidgets.map((widget, index) => (
                    <Draggable key={widget.id} draggableId={widget.id} index={index} isDragDisabled={!editMode || widget.locked}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={widget.size === 'large' ? 'md:col-span-2' : ''}
                        >
                          <Card className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 h-full ${snapshot.isDragging ? 'ring-2 ring-cyan-500' : ''} ${widget.locked ? 'opacity-75' : ''}`}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-white text-sm">{widget.title}</CardTitle>
                                  {widget.locked && <Lock className="w-3 h-3 text-amber-400" />}
                                </div>
                                {editMode && (
                                  <div className="flex gap-1">
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-slate-400" onClick={() => toggleLock(widget.id)}>
                                      {widget.locked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-slate-400" onClick={() => duplicateWidget(widget)}>
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-400" onClick={() => removeWidget(widget.id)}>
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <Badge className="bg-slate-700 text-slate-300 w-fit">{modules.find(m => m.id === widget.module)?.name}</Badge>
                            </CardHeader>
                            <CardContent>
                              <div className="h-40">
                                {renderWidget(widget)}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  
                  {editMode && (
                    <div
                      onClick={() => setShowAddWidget(true)}
                      className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-cyan-500/50 transition-colors"
                    >
                      <Plus className="w-8 h-8 text-slate-500 mb-2" />
                      <p className="text-slate-500">إضافة عنصر</p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </TabsContent>

        {/* Widgets Tab */}
        <TabsContent value="widgets" className="mt-4">
          <div className="grid md:grid-cols-4 gap-3">
            {widgetTypes.map(widget => (
              <div
                key={widget.id}
                onClick={() => { setNewWidget({ ...newWidget, type: widget.id }); setShowAddWidget(true); }}
                className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 cursor-pointer hover:border-cyan-500/50 transition-all"
              >
                <widget.icon className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-white text-center">{widget.name}</p>
                <Badge className="mt-2 mx-auto block w-fit bg-slate-700 text-slate-300">{widget.category}</Badge>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Saved Tab */}
        <TabsContent value="saved" className="mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            {savedDashboards.map(dashboard => (
              <Card key={dashboard.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">{dashboard.name}</h4>
                    {dashboard.shared && <Badge className="bg-green-500/20 text-green-400">مشترك</Badge>}
                  </div>
                  <p className="text-slate-400 text-sm mb-3">{dashboard.widgets} عناصر</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                      <Eye className="w-3 h-3 ml-1" />
                      فتح
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-400">
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
              <Label className="text-slate-400">نوع العنصر</Label>
              <Select value={newWidget.type} onValueChange={(v) => setNewWidget({ ...newWidget, type: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {widgetTypes.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-400">الوحدة</Label>
              <Select value={newWidget.module} onValueChange={(v) => setNewWidget({ ...newWidget, module: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modules.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
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
            <Button variant="outline" className="border-slate-600 text-slate-400" onClick={() => setShowAddWidget(false)}>إلغاء</Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={addWidget}>إضافة</Button>
          </DialogFooter>
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
              <Label className="text-slate-400">مشاركة مع</Label>
              <Input placeholder="البريد الإلكتروني" className="bg-slate-800/50 border-slate-700 text-white mt-2" />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <Label className="text-slate-400">إنشاء رابط عام</Label>
              <Switch />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <Label className="text-slate-400">السماح بالتحرير</Label>
              <Switch />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="border-slate-600 text-slate-400" onClick={() => setShowShareDialog(false)}>إلغاء</Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => { toast.success('تمت المشاركة'); setShowShareDialog(false); }}>مشاركة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}