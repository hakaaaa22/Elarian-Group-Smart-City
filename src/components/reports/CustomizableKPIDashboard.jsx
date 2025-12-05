import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  LayoutGrid, Plus, Settings, Save, Share2, Trash2, Move, Eye,
  BarChart3, TrendingUp, Users, Shield, Camera, Clock, AlertTriangle,
  CheckCircle, PieChart, LineChart as LineChartIcon, Grid3X3, Columns,
  Rows, Maximize2, Minimize2, Copy, Download, Upload, Lock, Unlock,
  FileText, Image
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';

const availableWidgets = [
  { id: 'visitors_today', name: 'زوار اليوم', type: 'stat', icon: Users, color: 'cyan', size: 'small' },
  { id: 'security_alerts', name: 'تنبيهات أمنية', type: 'stat', icon: AlertTriangle, color: 'red', size: 'small' },
  { id: 'active_permits', name: 'تصاريح نشطة', type: 'stat', icon: CheckCircle, color: 'green', size: 'small' },
  { id: 'cameras_online', name: 'كاميرات نشطة', type: 'stat', icon: Camera, color: 'pink', size: 'small' },
  { id: 'avg_duration', name: 'متوسط المدة', type: 'stat', icon: Clock, color: 'purple', size: 'small' },
  { id: 'risk_score', name: 'مستوى الخطر', type: 'stat', icon: Shield, color: 'amber', size: 'small' },
  { id: 'visitor_trend', name: 'اتجاه الزوار', type: 'chart', chartType: 'area', size: 'medium' },
  { id: 'alerts_chart', name: 'توزيع التنبيهات', type: 'chart', chartType: 'pie', size: 'medium' },
  { id: 'hourly_traffic', name: 'الحركة بالساعة', type: 'chart', chartType: 'bar', size: 'medium' },
  { id: 'zone_heatmap', name: 'خريطة المناطق', type: 'chart', chartType: 'bar', size: 'large' },
];

const layoutOptions = [
  { id: 'grid', name: 'شبكة', icon: Grid3X3, cols: 4 },
  { id: 'columns', name: 'أعمدة', icon: Columns, cols: 3 },
  { id: 'rows', name: 'صفوف', icon: Rows, cols: 1 },
];

const sampleData = {
  trend: [
    { day: 'السبت', value: 180 }, { day: 'الأحد', value: 220 }, { day: 'الإثنين', value: 280 },
    { day: 'الثلاثاء', value: 250 }, { day: 'الأربعاء', value: 300 }, { day: 'الخميس', value: 270 },
  ],
  pie: [
    { name: 'أمني', value: 35, color: '#ef4444' },
    { name: 'زوار', value: 40, color: '#06b6d4' },
    { name: 'نظام', value: 25, color: '#8b5cf6' },
  ],
  bar: [
    { hour: '08:00', count: 45 }, { hour: '10:00', count: 78 }, { hour: '12:00', count: 55 },
    { hour: '14:00', count: 92 }, { hour: '16:00', count: 68 }, { hour: '18:00', count: 35 },
  ],
};

const savedDashboards = [
  { id: 1, name: 'لوحة الأمان', owner: 'خالد العريان', shared: true, widgets: 6 },
  { id: 2, name: 'تحليل الزوار', owner: 'أحمد محمد', shared: false, widgets: 4 },
];

const sharedUsers = [
  { id: 1, name: 'أحمد محمد', email: 'ahmed@company.com', permission: 'view' },
  { id: 2, name: 'سارة خالد', email: 'sara@company.com', permission: 'edit' },
];

const widgetSizes = [
  { id: 'small', name: 'صغير', cols: 1 },
  { id: 'medium', name: 'متوسط', cols: 2 },
  { id: 'large', name: 'كبير', cols: 4 },
];

export default function CustomizableKPIDashboard() {
  const [widgets, setWidgets] = useState([
    { ...availableWidgets[0], position: 0 },
    { ...availableWidgets[1], position: 1 },
    { ...availableWidgets[2], position: 2 },
    { ...availableWidgets[3], position: 3 },
    { ...availableWidgets[6], position: 4 },
    { ...availableWidgets[7], position: 5 },
  ]);
  const [layout, setLayout] = useState('grid');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [dashboardName, setDashboardName] = useState('لوحتي المخصصة');
  const [shareEmail, setShareEmail] = useState('');
  const [sharedWith, setSharedWith] = useState(sharedUsers);
  const [showExport, setShowExport] = useState(false);

  const currentLayout = layoutOptions.find(l => l.id === layout);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(widgets);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setWidgets(items.map((w, i) => ({ ...w, position: i })));
  };

  const addWidget = (widget) => {
    if (widgets.find(w => w.id === widget.id)) {
      toast.error('هذا العنصر موجود بالفعل');
      return;
    }
    setWidgets([...widgets, { ...widget, position: widgets.length }]);
    toast.success('تم إضافة العنصر');
  };

  const removeWidget = (widgetId) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
    toast.success('تم حذف العنصر');
  };

  const saveDashboard = () => {
    toast.success('تم حفظ لوحة التحكم');
    setIsEditing(false);
  };

  const addSharedUser = () => {
    if (!shareEmail.trim() || !shareEmail.includes('@')) {
      toast.error('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    const newUser = {
      id: Date.now(),
      name: shareEmail.split('@')[0],
      email: shareEmail,
      permission: 'view'
    };
    setSharedWith([...sharedWith, newUser]);
    setShareEmail('');
    toast.success('تم إضافة المستخدم');
  };

  const removeSharedUser = (userId) => {
    setSharedWith(sharedWith.filter(u => u.id !== userId));
    toast.success('تم إزالة المستخدم');
  };

  const updatePermission = (userId, permission) => {
    setSharedWith(sharedWith.map(u => u.id === userId ? { ...u, permission } : u));
  };

  const exportDashboard = (format) => {
    toast.success(`جاري تصدير اللوحة بصيغة ${format}`);
    setShowExport(false);
  };

  const duplicateDashboard = () => {
    toast.success('تم نسخ لوحة التحكم');
  };

  const renderWidget = (widget, index) => {
    const Icon = widget.icon;
    const sizeClass = widget.size === 'small' ? 'col-span-1' : widget.size === 'medium' ? 'col-span-2' : 'col-span-4';

    if (widget.type === 'stat') {
      return (
        <Card className={`bg-${widget.color}-500/10 border-${widget.color}-500/30 ${isEditing ? 'cursor-move' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${widget.color}-500/20`}>
                  <Icon className={`w-5 h-5 text-${widget.color}-400`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{Math.floor(Math.random() * 200) + 50}</p>
                  <p className="text-slate-500 text-sm">{widget.name}</p>
                </div>
              </div>
              {isEditing && (
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeWidget(widget.id)}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (widget.type === 'chart') {
      return (
        <Card className={`bg-slate-800/30 border-slate-700/50 ${sizeClass} ${isEditing ? 'cursor-move' : ''}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm">{widget.name}</CardTitle>
              {isEditing && (
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeWidget(widget.id)}>
                  <Trash2 className="w-3 h-3 text-red-400" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                {widget.chartType === 'area' ? (
                  <AreaChart data={sampleData.trend}>
                    <defs>
                      <linearGradient id={`gradient-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="value" stroke="#06b6d4" fill={`url(#gradient-${widget.id})`} />
                  </AreaChart>
                ) : widget.chartType === 'pie' ? (
                  <RechartsPie>
                    <Pie data={sampleData.pie} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                      {sampleData.pie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  </RechartsPie>
                ) : (
                  <BarChart data={sampleData.bar}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
            <LayoutGrid className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            {isEditing ? (
              <Input
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-white font-bold text-lg h-9 w-64"
              />
            ) : (
              <h3 className="text-xl font-bold text-white">{dashboardName}</h3>
            )}
            <p className="text-slate-500 text-sm">لوحة تحكم قابلة للتخصيص</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Layout Selector */}
          <div className="flex bg-slate-800/50 rounded-lg p-1">
            {layoutOptions.map(opt => (
              <Button
                key={opt.id}
                size="sm"
                variant={layout === opt.id ? 'default' : 'ghost'}
                className={layout === opt.id ? 'bg-indigo-600' : ''}
                onClick={() => setLayout(opt.id)}
              >
                <opt.icon className="w-4 h-4" />
              </Button>
            ))}
          </div>
          
          {isEditing ? (
            <>
              <Button variant="outline" className="border-slate-600" onClick={() => setShowAddWidget(true)}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة عنصر
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={saveDashboard}>
                <Save className="w-4 h-4 ml-2" />
                حفظ
              </Button>
              <Button variant="outline" className="border-slate-600" onClick={() => setIsEditing(false)}>
                إلغاء
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="border-slate-600" onClick={() => setShowExport(true)}>
                <Download className="w-4 h-4 ml-2" />
                تصدير
              </Button>
              <Button variant="outline" className="border-slate-600" onClick={() => setShowShare(true)}>
                <Share2 className="w-4 h-4 ml-2" />
                مشاركة
              </Button>
              <Button variant="outline" className="border-slate-600" onClick={duplicateDashboard}>
                <Copy className="w-4 h-4 ml-2" />
                نسخ
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsEditing(true)}>
                <Settings className="w-4 h-4 ml-2" />
                تخصيص
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Widgets Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="widgets" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`grid gap-4 ${
                layout === 'grid' ? 'grid-cols-2 lg:grid-cols-4' :
                layout === 'columns' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'
              }`}
            >
              {widgets.map((widget, index) => (
                <Draggable key={widget.id} draggableId={widget.id} index={index} isDragDisabled={!isEditing}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`${widget.size === 'medium' ? 'col-span-2' : widget.size === 'large' ? 'col-span-4' : ''} ${
                        snapshot.isDragging ? 'opacity-70' : ''
                      }`}
                    >
                      {renderWidget(widget, index)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Saved Dashboards */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Save className="w-4 h-4 text-green-400" />
            لوحات التحكم المحفوظة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedDashboards.map(dashboard => (
              <div key={dashboard.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-indigo-500/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{dashboard.name}</h4>
                  <Badge variant="outline" className={dashboard.shared ? 'border-green-500/50 text-green-400' : 'border-slate-600 text-slate-400'}>
                    {dashboard.shared ? <Unlock className="w-3 h-3 ml-1" /> : <Lock className="w-3 h-3 ml-1" />}
                    {dashboard.shared ? 'مشترك' : 'خاص'}
                  </Badge>
                </div>
                <p className="text-slate-500 text-sm mb-3">
                  {dashboard.widgets} عناصر • {dashboard.owner}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-slate-600 h-8 flex-1">
                    <Eye className="w-3 h-3 ml-1" />
                    عرض
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-600 h-8 flex-1">
                    <Copy className="w-3 h-3 ml-1" />
                    نسخ
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Widget Dialog */}
      <Dialog open={showAddWidget} onOpenChange={setShowAddWidget}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              إضافة عنصر جديد
            </DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-3 mt-4">
            {availableWidgets.map(widget => {
              const Icon = widget.icon;
              const isAdded = widgets.find(w => w.id === widget.id);
              return (
                <div
                  key={widget.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isAdded ? 'bg-slate-800/30 border-slate-700/30 opacity-50' : 'bg-slate-900/50 border-slate-700/50 hover:border-indigo-500/50'
                  }`}
                  onClick={() => !isAdded && addWidget(widget)}
                >
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className={`w-5 h-5 text-${widget.color || 'slate'}-400`} />}
                    <div>
                      <p className="text-white font-medium">{widget.name}</p>
                      <p className="text-slate-500 text-xs">{widget.type === 'stat' ? 'إحصائية' : 'رسم بياني'} • {widget.size}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShare} onOpenChange={setShowShare}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-cyan-400" />
              مشاركة لوحة التحكم
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-slate-400 text-sm mb-2 block">إضافة مستخدم</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="البريد الإلكتروني..." 
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white" 
                />
                <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={addSharedUser}>إضافة</Button>
              </div>
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-2 block">المستخدمون الحاليون ({sharedWith.length})</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {sharedWith.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-sm">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white text-sm">{user.name}</p>
                        <p className="text-slate-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={user.permission} onValueChange={(v) => updatePermission(user.id, v)}>
                        <SelectTrigger className="w-20 h-8 bg-slate-900/50 border-slate-700 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="view">عرض</SelectItem>
                          <SelectItem value="edit">تعديل</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeSharedUser(user.id)}>
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">رابط المشاركة</span>
                <Button size="sm" variant="ghost" className="h-7 text-cyan-400" onClick={() => { navigator.clipboard.writeText(`https://app.com/dashboard/${dashboardName}`); toast.success('تم نسخ الرابط'); }}>
                  <Copy className="w-3 h-3 ml-1" />نسخ
                </Button>
              </div>
              <p className="text-slate-500 text-xs mt-1 truncate">https://app.com/dashboard/{dashboardName}</p>
            </div>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={() => { setShowShare(false); toast.success('تم تحديث المشاركة'); }}>
              حفظ التغييرات
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExport} onOpenChange={setShowExport}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-cyan-400" />
              تصدير لوحة التحكم
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <Button variant="outline" className="w-full border-slate-600 justify-start" onClick={() => exportDashboard('PDF')}>
              <FileText className="w-4 h-4 ml-2 text-red-400" />
              تصدير PDF
            </Button>
            <Button variant="outline" className="w-full border-slate-600 justify-start" onClick={() => exportDashboard('PNG')}>
              <Image className="w-4 h-4 ml-2 text-green-400" />
              تصدير صورة PNG
            </Button>
            <Button variant="outline" className="w-full border-slate-600 justify-start" onClick={() => exportDashboard('JSON')}>
              <Settings className="w-4 h-4 ml-2 text-purple-400" />
              تصدير إعدادات JSON
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}