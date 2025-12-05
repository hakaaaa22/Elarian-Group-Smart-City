import React, { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  FileText, Plus, Download, Share2, Save, Settings, BarChart3, LineChart,
  PieChart, Activity, Map, Table, Grid3X3, Layers, RefreshCw, Copy, Trash2,
  Edit, Eye, Link2, Users, MessageSquare, Send, X, Check, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  ScatterChart, Scatter, LineChart as ReLineChart, Line, BarChart, Bar,
  AreaChart, Area, PieChart as RePieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// أنواع التصورات المتقدمة
const visualizationTypes = [
  { id: 'bar', name: 'عمودي', icon: BarChart3, category: 'basic' },
  { id: 'line', name: 'خطي', icon: LineChart, category: 'basic' },
  { id: 'area', name: 'مساحة', icon: Activity, category: 'basic' },
  { id: 'pie', name: 'دائري', icon: PieChart, category: 'basic' },
  { id: 'scatter', name: 'انتشار', icon: Grid3X3, category: 'advanced' },
  { id: 'heatmap', name: 'خريطة حرارية', icon: Map, category: 'advanced' },
  { id: 'table', name: 'جدول', icon: Table, category: 'basic' },
  { id: 'kpi', name: 'مؤشر أداء', icon: Activity, category: 'advanced' },
];

// مصادر البيانات
const dataSources = [
  { id: 'fleet', name: 'بيانات الأسطول', icon: '🚛' },
  { id: 'waste', name: 'بيانات النفايات', icon: '♻️' },
  { id: 'devices', name: 'بيانات الأجهزة', icon: '📡' },
  { id: 'incidents', name: 'الحوادث', icon: '⚠️' },
  { id: 'maintenance', name: 'الصيانة', icon: '🔧' },
  { id: 'callcenter', name: 'مركز الاتصال', icon: '📞' },
];

// بيانات تجريبية
const sampleData = {
  fleet: [
    { name: 'يناير', value: 85, target: 90 },
    { name: 'فبراير', value: 88, target: 90 },
    { name: 'مارس', value: 92, target: 90 },
    { name: 'أبريل', value: 87, target: 90 },
  ],
  scatter: [
    { x: 100, y: 200, z: 200 },
    { x: 120, y: 100, z: 260 },
    { x: 170, y: 300, z: 400 },
    { x: 140, y: 250, z: 280 },
    { x: 150, y: 400, z: 500 },
  ],
  heatmap: [
    { day: 'السبت', hour: '8', value: 30 },
    { day: 'السبت', hour: '12', value: 80 },
    { day: 'الأحد', hour: '8', value: 45 },
    { day: 'الأحد', hour: '12', value: 90 },
  ],
};

const COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#6366f1'];

// قوالب التقارير
const reportTemplates = [
  { id: 't1', name: 'تقرير أداء الأسطول', widgets: 4, category: 'fleet' },
  { id: 't2', name: 'تقرير النفايات الأسبوعي', widgets: 6, category: 'waste' },
  { id: 't3', name: 'تقرير الصيانة الشهري', widgets: 5, category: 'maintenance' },
];

export default function EnhancedReportBuilder() {
  const [activeTab, setActiveTab] = useState('builder');
  const [widgets, setWidgets] = useState([
    { id: 'w1', type: 'bar', title: 'أداء الأسطول', dataSource: 'fleet', size: 'medium', interactive: true },
    { id: 'w2', type: 'scatter', title: 'تحليل الارتباط', dataSource: 'fleet', size: 'medium', interactive: true },
  ]);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [newWidget, setNewWidget] = useState({ type: 'bar', title: '', dataSource: 'fleet', size: 'medium', interactive: true });
  const [shareSettings, setShareSettings] = useState({ users: [], link: false, editable: false });
  const [linkedModules, setLinkedModules] = useState(['fleet', 'maintenance']);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
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
    setWidgets([...widgets, { ...newWidget, id: `w${Date.now()}` }]);
    setShowAddWidget(false);
    setNewWidget({ type: 'bar', title: '', dataSource: 'fleet', size: 'medium', interactive: true });
    toast.success('تم إضافة العنصر');
  };

  const removeWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
    toast.success('تم حذف العنصر');
  };

  const duplicateWidget = (widget) => {
    setWidgets([...widgets, { ...widget, id: `w${Date.now()}`, title: `${widget.title} (نسخة)` }]);
    toast.success('تم نسخ العنصر');
  };

  const saveAsTemplate = () => {
    toast.success('تم حفظ القالب بنجاح');
    setShowTemplateDialog(false);
  };

  const shareReport = () => {
    toast.success('تم مشاركة التقرير');
    setShowShareDialog(false);
  };

  const renderChart = (widget) => {
    const data = sampleData.fleet;
    
    switch (widget.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Bar dataKey="value" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} />
              <Line type="monotone" dataKey="target" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" />
            </ReLineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" dataKey="x" name="X" stroke="#94a3b8" fontSize={10} />
              <YAxis type="number" dataKey="y" name="Y" stroke="#94a3b8" fontSize={10} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Scatter name="البيانات" data={sampleData.scatter} fill="#a855f7">
                {sampleData.scatter.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                {data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        );
      case 'heatmap':
        return (
          <div className="h-full flex items-center justify-center">
            <div className="grid grid-cols-4 gap-1">
              {sampleData.heatmap.map((cell, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: `rgba(34, 211, 238, ${cell.value / 100})` }}
                >
                  {cell.value}
                </div>
              ))}
            </div>
          </div>
        );
      case 'kpi':
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl font-bold text-cyan-400">87%</p>
              <p className="text-slate-400 text-sm">متوسط الأداء</p>
              <Badge className="mt-2 bg-green-500/20 text-green-400">+5% من الشهر السابق</Badge>
            </div>
          </div>
        );
      default:
        return <div className="h-full flex items-center justify-center text-slate-500">جدول</div>;
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" />
          منشئ التقارير المتقدم
        </h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="border-cyan-500 text-cyan-400" onClick={() => setShowTemplateDialog(true)}>
            <Save className="w-4 h-4 ml-1" />
            حفظ كقالب
          </Button>
          <Button size="sm" variant="outline" className="border-purple-500 text-purple-400" onClick={() => setShowShareDialog(true)}>
            <Share2 className="w-4 h-4 ml-1" />
            مشاركة
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 ml-1" />
            تصدير
          </Button>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowAddWidget(true)}>
            <Plus className="w-4 h-4 ml-1" />
            إضافة عنصر
          </Button>
        </div>
      </div>

      {/* Linked Modules */}
      <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-cyan-400" />
              <span className="text-white text-sm">ربط البيانات عبر الوحدات:</span>
              <div className="flex gap-2">
                {dataSources.map(source => (
                  <Button
                    key={source.id}
                    size="sm"
                    variant={linkedModules.includes(source.id) ? 'default' : 'outline'}
                    className={linkedModules.includes(source.id) ? 'bg-cyan-600 h-7' : 'border-slate-600 h-7'}
                    onClick={() => setLinkedModules(prev => 
                      prev.includes(source.id) ? prev.filter(m => m !== source.id) : [...prev, source.id]
                    )}
                  >
                    <span className="ml-1">{source.icon}</span>
                    {source.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="builder" className="data-[state=active]:bg-purple-500/20">
            <Layers className="w-4 h-4 ml-1" />
            المُنشئ
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-cyan-500/20">
            <Grid3X3 className="w-4 h-4 ml-1" />
            القوالب
          </TabsTrigger>
          <TabsTrigger value="visualizations" className="data-[state=active]:bg-green-500/20">
            <BarChart3 className="w-4 h-4 ml-1" />
            التصورات
          </TabsTrigger>
        </TabsList>

        {/* Builder Tab */}
        <TabsContent value="builder" className="mt-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="widgets">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="grid md:grid-cols-2 gap-4">
                  {widgets.map((widget, index) => (
                    <Draggable key={widget.id} draggableId={widget.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${widget.size === 'large' ? 'md:col-span-2' : ''}`}
                        >
                          <Card className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 ${snapshot.isDragging ? 'ring-2 ring-purple-500' : ''}`}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-white text-sm">{widget.title}</CardTitle>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-slate-400" onClick={() => duplicateWidget(widget)}>
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-slate-400">
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-400" onClick={() => removeWidget(widget.id)}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Badge className="bg-slate-700 text-slate-300 text-xs">{widget.type}</Badge>
                                <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">{widget.dataSource}</Badge>
                                {widget.interactive && <Badge className="bg-purple-500/20 text-purple-400 text-xs">تفاعلي</Badge>}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="h-48">
                                {renderChart(widget)}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {widgets.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 bg-slate-800/30 rounded-lg border-2 border-dashed border-slate-700">
              <Layers className="w-12 h-12 mb-3 opacity-50" />
              <p>اسحب وأفلت العناصر هنا</p>
              <Button size="sm" variant="outline" className="mt-3 border-slate-600" onClick={() => setShowAddWidget(true)}>
                <Plus className="w-4 h-4 ml-1" />
                إضافة عنصر
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            {reportTemplates.map(template => (
              <Card key={template.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80 cursor-pointer hover:border-cyan-500/50">
                <CardContent className="p-4">
                  <h4 className="text-white font-medium mb-2">{template.name}</h4>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-slate-700 text-slate-300">{template.widgets} عناصر</Badge>
                    <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">استخدام</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Visualizations Tab */}
        <TabsContent value="templates" className="mt-4">
          <div className="grid md:grid-cols-4 gap-3">
            {visualizationTypes.map(viz => (
              <div
                key={viz.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-cyan-500/50 ${viz.category === 'advanced' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-slate-800/50 border-slate-700'}`}
                onClick={() => { setNewWidget({ ...newWidget, type: viz.id }); setShowAddWidget(true); }}
              >
                <viz.icon className={`w-8 h-8 mx-auto mb-2 ${viz.category === 'advanced' ? 'text-purple-400' : 'text-cyan-400'}`} />
                <p className="text-white text-center">{viz.name}</p>
                {viz.category === 'advanced' && <Badge className="mt-2 mx-auto block w-fit bg-purple-500/20 text-purple-400">متقدم</Badge>}
              </div>
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
              <Label className="text-slate-400">نوع التصور</Label>
              <Select value={newWidget.type} onValueChange={(v) => setNewWidget({ ...newWidget, type: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visualizationTypes.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
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
                  {dataSources.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.icon} {s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <Label className="text-slate-400">عنصر تفاعلي</Label>
              <Switch checked={newWidget.interactive} onCheckedChange={(v) => setNewWidget({ ...newWidget, interactive: v })} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="border-slate-600 text-slate-400" onClick={() => setShowAddWidget(false)}>إلغاء</Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={addWidget}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-purple-400" />
              مشاركة التقرير
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-400">مشاركة مع مستخدمين</Label>
              <Input placeholder="البريد الإلكتروني أو @اسم المستخدم" className="bg-slate-800/50 border-slate-700 text-white mt-2" />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <Label className="text-slate-400">إنشاء رابط مشاركة</Label>
              <Switch checked={shareSettings.link} onCheckedChange={(v) => setShareSettings({ ...shareSettings, link: v })} />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <Label className="text-slate-400">السماح بالتحرير التعاوني</Label>
              <Switch checked={shareSettings.editable} onCheckedChange={(v) => setShareSettings({ ...shareSettings, editable: v })} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="border-slate-600 text-slate-400" onClick={() => setShowShareDialog(false)}>إلغاء</Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={shareReport}>مشاركة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">حفظ كقالب</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-400">اسم القالب</Label>
              <Input className="bg-slate-800/50 border-slate-700 text-white mt-2" placeholder="تقرير الأداء الشهري" />
            </div>
            <div>
              <Label className="text-slate-400">الوصف</Label>
              <Textarea className="bg-slate-800/50 border-slate-700 text-white mt-2" placeholder="وصف القالب..." />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <Label className="text-slate-400">قالب عام (متاح للجميع)</Label>
              <Switch />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="border-slate-600 text-slate-400" onClick={() => setShowTemplateDialog(false)}>إلغاء</Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={saveAsTemplate}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}