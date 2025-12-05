import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  LayoutGrid, Plus, Save, Eye, Trash2, GripVertical, Settings, RefreshCw,
  BarChart3, Activity, Users, Car, Package, AlertTriangle, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Widget Types Available
const widgetTypes = [
  { id: 'stat', name: 'إحصائية', icon: BarChart3, color: 'cyan' },
  { id: 'chart', name: 'رسم بياني', icon: Activity, color: 'purple' },
  { id: 'list', name: 'قائمة', icon: Users, color: 'green' },
  { id: 'map', name: 'خريطة', icon: Car, color: 'amber' },
  { id: 'alert', name: 'تنبيهات', icon: AlertTriangle, color: 'red' },
  { id: 'progress', name: 'تقدم', icon: TrendingUp, color: 'pink' },
];

// Data Sources
const dataSources = [
  { id: 'fleet', name: 'بيانات الأسطول' },
  { id: 'cameras', name: 'الكاميرات' },
  { id: 'devices', name: 'الأجهزة' },
  { id: 'waste', name: 'النفايات' },
  { id: 'energy', name: 'الطاقة' },
  { id: 'water', name: 'المياه' },
  { id: 'patients', name: 'المرضى' },
  { id: 'visitors', name: 'الزوار' },
];

const defaultWidgets = [
  { id: 'w1', type: 'stat', title: 'إجمالي المركبات', dataSource: 'fleet', size: 'small', position: 0 },
  { id: 'w2', type: 'chart', title: 'استهلاك الوقود', dataSource: 'fleet', size: 'medium', position: 1 },
  { id: 'w3', type: 'alert', title: 'التنبيهات النشطة', dataSource: 'cameras', size: 'medium', position: 2 },
];

export default function CustomDashboardBuilder() {
  const [widgets, setWidgets] = useState(defaultWidgets);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);
  const [newWidget, setNewWidget] = useState({ type: 'stat', title: '', dataSource: 'fleet', size: 'medium' });

  useEffect(() => {
    const loadLayout = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.dashboard_layout) {
          setWidgets(user.dashboard_layout);
        }
      } catch (e) {}
    };
    loadLayout();
  }, []);

  const saveLayout = useMutation({
    mutationFn: async () => {
      await base44.auth.updateMe({ dashboard_layout: widgets });
      return true;
    },
    onSuccess: () => {
      toast.success('تم حفظ تخطيط اللوحة');
    }
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setWidgets(items.map((item, index) => ({ ...item, position: index })));
  };

  const addWidget = () => {
    if (!newWidget.title) {
      toast.error('يرجى إدخال عنوان');
      return;
    }
    setWidgets([...widgets, { ...newWidget, id: `w${Date.now()}`, position: widgets.length }]);
    setShowAddWidget(false);
    setNewWidget({ type: 'stat', title: '', dataSource: 'fleet', size: 'medium' });
    toast.success('تم إضافة العنصر');
  };

  const removeWidget = (id) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
    toast.success('تم حذف العنصر');
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-cyan-400" />
          منشئ اللوحات المخصصة
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" className="border-cyan-500 text-cyan-400" onClick={() => setShowAddWidget(true)}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة عنصر
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => saveLayout.mutate()}>
            <Save className="w-4 h-4 ml-2" />
            حفظ
          </Button>
        </div>
      </div>

      {/* Widget Types */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">أنواع العناصر المتاحة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {widgetTypes.map(type => (
              <div key={type.id} className={`p-3 bg-${type.color}-500/10 border border-${type.color}-500/30 rounded-lg text-center cursor-pointer hover:bg-${type.color}-500/20`}>
                <type.icon className={`w-5 h-5 text-${type.color}-400 mx-auto mb-1`} />
                <p className="text-white text-xs">{type.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Widgets Canvas */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="widgets">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="grid md:grid-cols-3 gap-4">
              {widgets.sort((a, b) => a.position - b.position).map((widget, index) => {
                const widgetType = widgetTypes.find(t => t.id === widget.type);
                return (
                  <Draggable key={widget.id} draggableId={widget.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${widget.size === 'large' ? 'md:col-span-3' : widget.size === 'medium' ? 'md:col-span-2' : ''}`}
                      >
                        <Card className={`glass-card ${snapshot.isDragging ? 'border-cyan-500' : 'border-slate-700'} bg-[#0f1629]/80`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="w-4 h-4 text-slate-500 cursor-grab" />
                                </div>
                                {widgetType && <widgetType.icon className={`w-4 h-4 text-${widgetType.color}-400`} />}
                                <span className="text-white font-medium text-sm">{widget.title}</span>
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setEditingWidget(widget)}>
                                  <Settings className="w-3 h-3 text-slate-400" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-400" onClick={() => removeWidget(widget.id)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="h-24 bg-slate-900/50 rounded flex items-center justify-center">
                              {widgetType && <widgetType.icon className="w-8 h-8 text-slate-600" />}
                            </div>
                            <Badge className="bg-slate-700 text-slate-300 text-xs mt-2">{widget.dataSource}</Badge>
                          </CardContent>
                        </Card>
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
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">إضافة عنصر جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-400">عنوان العنصر</Label>
              <Input value={newWidget.title} onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-2" />
            </div>
            <div>
              <Label className="text-slate-400">نوع العنصر</Label>
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
    </div>
  );
}