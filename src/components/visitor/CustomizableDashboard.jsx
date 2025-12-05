import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  LayoutGrid, Plus, X, GripVertical, Settings, Save, RefreshCw,
  BarChart3, PieChart, LineChart, Map, Users, Clock, AlertTriangle,
  CheckCircle, Car, Building2, TrendingUp, Activity, Eye, Calendar,
  Maximize2, Minimize2, Trash2, Edit, Copy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  AreaChart, Area, BarChart as RechartsBar, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart as RechartsLine, Line
} from 'recharts';
import { toast } from 'sonner';

// Widget Library
const widgetLibrary = [
  { id: 'visitors_today', name: 'زوار اليوم', type: 'stat', icon: Users, color: 'cyan', size: 'small' },
  { id: 'active_visitors', name: 'زوار حاليون', type: 'stat', icon: Eye, color: 'green', size: 'small' },
  { id: 'critical_alerts', name: 'تنبيهات حرجة', type: 'stat', icon: AlertTriangle, color: 'red', size: 'small' },
  { id: 'pending_permits', name: 'تصاريح معلقة', type: 'stat', icon: Clock, color: 'amber', size: 'small' },
  { id: 'vehicles_today', name: 'مركبات اليوم', type: 'stat', icon: Car, color: 'purple', size: 'small' },
  { id: 'avg_duration', name: 'متوسط مدة الزيارة', type: 'stat', icon: Clock, color: 'blue', size: 'small' },
  { id: 'hourly_traffic', name: 'حركة الزوار بالساعة', type: 'chart', chartType: 'area', size: 'medium' },
  { id: 'visitor_types', name: 'أنواع الزوار', type: 'chart', chartType: 'pie', size: 'medium' },
  { id: 'weekly_trend', name: 'الاتجاه الأسبوعي', type: 'chart', chartType: 'bar', size: 'medium' },
  { id: 'gate_usage', name: 'استخدام البوابات', type: 'chart', chartType: 'bar', size: 'medium' },
  { id: 'zone_heatmap', name: 'كثافة المناطق', type: 'heatmap', size: 'large' },
  { id: 'live_activity', name: 'النشاط المباشر', type: 'feed', size: 'medium' },
];

// Mock Data
const mockData = {
  visitors_today: 156,
  active_visitors: 42,
  critical_alerts: 3,
  pending_permits: 12,
  vehicles_today: 89,
  avg_duration: '2.5 ساعة',
  hourly_traffic: [
    { hour: '6', visitors: 12 }, { hour: '8', visitors: 45 }, { hour: '10', visitors: 78 },
    { hour: '12', visitors: 65 }, { hour: '14', visitors: 82 }, { hour: '16', visitors: 55 },
    { hour: '18', visitors: 28 }, { hour: '20', visitors: 15 },
  ],
  visitor_types: [
    { name: 'زائر', value: 45, color: '#06B6D4' },
    { name: 'متعاقد', value: 25, color: '#F59E0B' },
    { name: 'عميل', value: 20, color: '#8B5CF6' },
    { name: 'توصيل', value: 10, color: '#22C55E' },
  ],
  weekly_trend: [
    { day: 'السبت', visits: 120 }, { day: 'الأحد', visits: 145 },
    { day: 'الاثنين', visits: 180 }, { day: 'الثلاثاء', visits: 165 },
    { day: 'الأربعاء', visits: 190 }, { day: 'الخميس', visits: 155 },
    { day: 'الجمعة', visits: 80 },
  ],
  gate_usage: [
    { gate: 'الرئيسية', usage: 450 }, { gate: 'الموظفين', usage: 280 },
    { gate: 'الشحن', usage: 120 }, { gate: 'الطوارئ', usage: 15 },
  ],
  live_activity: [
    { id: 1, action: 'دخول', visitor: 'أحمد محمد', time: '10:30', gate: 'الرئيسية' },
    { id: 2, action: 'خروج', visitor: 'سارة أحمد', time: '10:28', gate: 'الموظفين' },
    { id: 3, action: 'دخول', visitor: 'محمد علي', time: '10:25', gate: 'الشحن' },
    { id: 4, action: 'تنبيه', visitor: 'خالد سعيد', time: '10:20', gate: 'الرئيسية' },
  ],
};

const defaultWidgets = [
  { id: 'w1', widgetId: 'visitors_today', x: 0, y: 0 },
  { id: 'w2', widgetId: 'active_visitors', x: 1, y: 0 },
  { id: 'w3', widgetId: 'critical_alerts', x: 2, y: 0 },
  { id: 'w4', widgetId: 'pending_permits', x: 3, y: 0 },
  { id: 'w5', widgetId: 'hourly_traffic', x: 0, y: 1 },
  { id: 'w6', widgetId: 'visitor_types', x: 2, y: 1 },
];

export default function CustomizableDashboard() {
  const [widgets, setWidgets] = useState(defaultWidgets);
  const [editMode, setEditMode] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setWidgets(items);
  };

  const addWidget = (widgetId) => {
    const newWidget = {
      id: `w${Date.now()}`,
      widgetId,
      x: 0,
      y: widgets.length,
    };
    setWidgets([...widgets, newWidget]);
    toast.success('تم إضافة الويدجت');
  };

  const removeWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
    toast.success('تم إزالة الويدجت');
  };

  const renderWidget = (widget, index) => {
    const config = widgetLibrary.find(w => w.id === widget.widgetId);
    if (!config) return null;

    return (
      <Draggable key={widget.id} draggableId={widget.id} index={index} isDragDisabled={!editMode}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`${config.size === 'small' ? 'col-span-1' : config.size === 'medium' ? 'col-span-2' : 'col-span-4'}`}
          >
            <Card className={`bg-slate-800/30 border-slate-700/50 h-full ${snapshot.isDragging ? 'border-cyan-500 shadow-lg shadow-cyan-500/20' : ''} ${editMode ? 'border-dashed' : ''}`}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  {config.icon && <config.icon className={`w-4 h-4 text-${config.color}-400`} />}
                  {config.name}
                </CardTitle>
                <div className="flex items-center gap-1">
                  {editMode && (
                    <>
                      <div {...provided.dragHandleProps} className="cursor-grab p-1">
                        <GripVertical className="w-4 h-4 text-slate-500" />
                      </div>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeWidget(widget.id)}>
                        <X className="w-3 h-3 text-red-400" />
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {config.type === 'stat' && (
                  <div className="text-center py-2">
                    <p className={`text-3xl font-bold text-${config.color}-400`}>
                      {mockData[config.id]}
                    </p>
                  </div>
                )}
                {config.type === 'chart' && config.chartType === 'area' && (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockData.hourly_traffic}>
                        <defs>
                          <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} />
                        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="visitors" stroke="#06B6D4" fill="url(#colorVisitors)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {config.type === 'chart' && config.chartType === 'pie' && (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie data={mockData.visitor_types} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                          {mockData.visitor_types.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                )}
                {config.type === 'chart' && config.chartType === 'bar' && (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBar data={config.id === 'weekly_trend' ? mockData.weekly_trend : mockData.gate_usage}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey={config.id === 'weekly_trend' ? 'day' : 'gate'} stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} />
                        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                        <Bar dataKey={config.id === 'weekly_trend' ? 'visits' : 'usage'} fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                      </RechartsBar>
                    </ResponsiveContainer>
                  </div>
                )}
                {config.type === 'feed' && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {mockData.live_activity.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg text-sm">
                        <div className="flex items-center gap-2">
                          <Badge className={item.action === 'دخول' ? 'bg-green-500/20 text-green-400' : item.action === 'خروج' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}>
                            {item.action}
                          </Badge>
                          <span className="text-white">{item.visitor}</span>
                        </div>
                        <span className="text-slate-500 text-xs">{item.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-cyan-400" />
          لوحة التحكم القابلة للتخصيص
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-slate-600" onClick={() => setShowLibrary(true)}>
            <Plus className="w-4 h-4 ml-1" />
            إضافة ويدجت
          </Button>
          <Button
            variant={editMode ? 'default' : 'outline'}
            size="sm"
            className={editMode ? 'bg-cyan-600' : 'border-slate-600'}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? <Save className="w-4 h-4 ml-1" /> : <Edit className="w-4 h-4 ml-1" />}
            {editMode ? 'حفظ' : 'تعديل'}
          </Button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="grid grid-cols-4 gap-4"
            >
              {widgets.map((widget, index) => renderWidget(widget, index))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Widget Library Dialog */}
      <Dialog open={showLibrary} onOpenChange={setShowLibrary}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-cyan-400" />
              مكتبة الويدجت
            </DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-3 gap-3 mt-4 max-h-[60vh] overflow-y-auto">
            {widgetLibrary.map(widget => (
              <motion.div
                key={widget.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg border border-slate-700 bg-slate-800/50 cursor-pointer hover:border-${widget.color || 'cyan'}-500/50 transition-all`}
                onClick={() => { addWidget(widget.id); setShowLibrary(false); }}
              >
                <div className="flex items-center gap-3 mb-2">
                  {widget.icon && <widget.icon className={`w-5 h-5 text-${widget.color || 'cyan'}-400`} />}
                  <span className="text-white font-medium text-sm">{widget.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                    {widget.type === 'stat' ? 'إحصائية' : widget.type === 'chart' ? 'رسم بياني' : widget.type === 'feed' ? 'تغذية' : 'خريطة'}
                  </Badge>
                  <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                    {widget.size === 'small' ? 'صغير' : widget.size === 'medium' ? 'متوسط' : 'كبير'}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}