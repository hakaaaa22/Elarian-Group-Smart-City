import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  LayoutGrid, Settings, Save, Keyboard, Bell, Target, BarChart3, Clock,
  Phone, Users, Star, TrendingUp, Zap, Eye, GripVertical, Plus, X,
  Volume2, VolumeX, Palette, RefreshCw, CheckCircle, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

const defaultWidgets = [
  { id: 'calls', name: 'المكالمات', icon: Phone, size: 'small', visible: true, order: 0 },
  { id: 'satisfaction', name: 'رضا العملاء', icon: Star, size: 'small', visible: true, order: 1 },
  { id: 'performance', name: 'الأداء', icon: TrendingUp, size: 'medium', visible: true, order: 2 },
  { id: 'goals', name: 'الأهداف', icon: Target, size: 'medium', visible: true, order: 3 },
  { id: 'queue', name: 'قائمة الانتظار', icon: Users, size: 'small', visible: true, order: 4 },
  { id: 'response_time', name: 'وقت الاستجابة', icon: Clock, size: 'small', visible: true, order: 5 },
  { id: 'alerts', name: 'التنبيهات', icon: Bell, size: 'large', visible: false, order: 6 },
  { id: 'trends', name: 'الاتجاهات', icon: BarChart3, size: 'large', visible: false, order: 7 },
];

const defaultShortcuts = [
  { id: 'answer', key: 'A', action: 'الرد على المكالمة', enabled: true },
  { id: 'hold', key: 'H', action: 'تعليق', enabled: true },
  { id: 'transfer', key: 'T', action: 'تحويل', enabled: true },
  { id: 'note', key: 'N', action: 'ملاحظة', enabled: true },
  { id: 'close', key: 'C', action: 'إغلاق', enabled: true },
  { id: 'escalate', key: 'E', action: 'تصعيد', enabled: false },
];

const defaultAlertSettings = {
  visual: true,
  sound: true,
  vibrate: false,
  performanceAlerts: true,
  goalAlerts: true,
  queueAlerts: true,
  thresholds: {
    lowPerformance: 70,
    highQueue: 10,
    goalProgress: 80,
  }
};

export default function EnhancedPersonalizedDashboard({ agentId }) {
  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem(`agent_widgets_${agentId}`);
    return saved ? JSON.parse(saved) : defaultWidgets;
  });
  const [shortcuts, setShortcuts] = useState(() => {
    const saved = localStorage.getItem(`agent_shortcuts_${agentId}`);
    return saved ? JSON.parse(saved) : defaultShortcuts;
  });
  const [alertSettings, setAlertSettings] = useState(() => {
    const saved = localStorage.getItem(`agent_alerts_${agentId}`);
    return saved ? JSON.parse(saved) : defaultAlertSettings;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState(null);
  const [theme, setTheme] = useState('dark');

  // Real-time data simulation
  const [realtimeData, setRealtimeData] = useState({
    calls: 24, satisfaction: 92, performance: 87, goals: 75,
    queue: 5, responseTime: '1:45', alerts: 2
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData(prev => ({
        ...prev,
        calls: prev.calls + Math.floor(Math.random() * 2),
        satisfaction: Math.min(100, prev.satisfaction + (Math.random() > 0.5 ? 1 : -1)),
        queue: Math.max(0, prev.queue + (Math.random() > 0.6 ? 1 : -1)),
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Check alerts
  useEffect(() => {
    if (alertSettings.performanceAlerts && realtimeData.performance < alertSettings.thresholds.lowPerformance) {
      if (alertSettings.visual) toast.warning('تنبيه: انخفاض في الأداء!');
    }
    if (alertSettings.queueAlerts && realtimeData.queue > alertSettings.thresholds.highQueue) {
      if (alertSettings.visual) toast.info('تنبيه: قائمة انتظار طويلة!');
    }
  }, [realtimeData, alertSettings]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(widgets);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    const updated = items.map((item, index) => ({ ...item, order: index }));
    setWidgets(updated);
  };

  const toggleWidget = (id) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const changeWidgetSize = (id, size) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, size } : w));
  };

  const updateShortcut = (id, newKey) => {
    setShortcuts(prev => prev.map(s => s.id === id ? { ...s, key: newKey.toUpperCase() } : s));
    setEditingShortcut(null);
  };

  const saveAllSettings = () => {
    localStorage.setItem(`agent_widgets_${agentId}`, JSON.stringify(widgets));
    localStorage.setItem(`agent_shortcuts_${agentId}`, JSON.stringify(shortcuts));
    localStorage.setItem(`agent_alerts_${agentId}`, JSON.stringify(alertSettings));
    toast.success('تم حفظ الإعدادات');
    setShowSettings(false);
  };

  const getWidgetContent = (widget) => {
    const data = realtimeData[widget.id] || 0;
    switch (widget.id) {
      case 'calls':
        return <><p className="text-3xl font-bold text-white">{data}</p><p className="text-slate-400 text-xs">مكالمة اليوم</p></>;
      case 'satisfaction':
        return <><p className="text-3xl font-bold text-green-400">{data}%</p><Progress value={data} className="h-2 mt-2" /></>;
      case 'performance':
        return <><p className="text-3xl font-bold text-cyan-400">{data}%</p><Progress value={data} className="h-2 mt-2" /></>;
      case 'goals':
        return <><p className="text-3xl font-bold text-purple-400">{data}%</p><p className="text-slate-400 text-xs">نحو الهدف اليومي</p></>;
      case 'queue':
        return <><p className="text-3xl font-bold text-amber-400">{data}</p><p className="text-slate-400 text-xs">في الانتظار</p></>;
      case 'response_time':
        return <><p className="text-3xl font-bold text-blue-400">{data}</p><p className="text-slate-400 text-xs">متوسط الاستجابة</p></>;
      default:
        return <p className="text-slate-400">لا توجد بيانات</p>;
    }
  };

  const visibleWidgets = widgets.filter(w => w.visible).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
            <LayoutGrid className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-white font-bold">لوحة التحكم الشخصية</h4>
            <p className="text-slate-400 text-xs">تخصيص كامل • اختصارات • تنبيهات ذكية</p>
          </div>
        </div>
        <Button variant="outline" className="border-slate-600" onClick={() => setShowSettings(true)}>
          <Settings className="w-4 h-4 ml-2" />
          تخصيص
        </Button>
      </div>

      {/* Keyboard Shortcuts Bar */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-3">
          <div className="flex items-center gap-4 overflow-x-auto">
            <Keyboard className="w-4 h-4 text-slate-400 flex-shrink-0" />
            {shortcuts.filter(s => s.enabled).map(shortcut => (
              <div key={shortcut.id} className="flex items-center gap-1 flex-shrink-0">
                <kbd className="bg-slate-700 px-2 py-1 rounded text-cyan-400 text-xs">Ctrl+{shortcut.key}</kbd>
                <span className="text-slate-400 text-xs">{shortcut.action}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Draggable Widgets */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="widgets" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
            >
              {visibleWidgets.map((widget, index) => (
                <Draggable key={widget.id} draggableId={widget.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`${widget.size === 'large' ? 'col-span-2' : ''}`}
                    >
                      <Card className={`bg-slate-800/50 border-slate-700/50 ${
                        snapshot.isDragging ? 'ring-2 ring-cyan-500' : ''
                      }`}>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="w-4 h-4 text-slate-500 cursor-grab" />
                            </div>
                            <widget.icon className="w-4 h-4 text-cyan-400" />
                            <span className="text-white text-sm">{widget.name}</span>
                          </div>
                        </CardHeader>
                        <CardContent className="text-center">
                          {getWidgetContent(widget)}
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

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              تخصيص لوحة التحكم
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="widgets" className="mt-4">
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
              <TabsTrigger value="widgets" className="data-[state=active]:bg-cyan-500/20">
                <LayoutGrid className="w-4 h-4 ml-1" />
                الوحدات
              </TabsTrigger>
              <TabsTrigger value="shortcuts" className="data-[state=active]:bg-purple-500/20">
                <Keyboard className="w-4 h-4 ml-1" />
                الاختصارات
              </TabsTrigger>
              <TabsTrigger value="alerts" className="data-[state=active]:bg-amber-500/20">
                <Bell className="w-4 h-4 ml-1" />
                التنبيهات
              </TabsTrigger>
            </TabsList>

            {/* Widgets Tab */}
            <TabsContent value="widgets" className="mt-4">
              <div className="space-y-3">
                {widgets.map(widget => (
                  <div key={widget.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Switch checked={widget.visible} onCheckedChange={() => toggleWidget(widget.id)} />
                      <widget.icon className="w-4 h-4 text-cyan-400" />
                      <span className="text-white">{widget.name}</span>
                    </div>
                    <Select value={widget.size} onValueChange={(v) => changeWidgetSize(widget.id, v)}>
                      <SelectTrigger className="w-24 h-8 bg-slate-900 border-slate-700 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="small">صغير</SelectItem>
                        <SelectItem value="medium">متوسط</SelectItem>
                        <SelectItem value="large">كبير</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Shortcuts Tab */}
            <TabsContent value="shortcuts" className="mt-4">
              <div className="space-y-3">
                {shortcuts.map(shortcut => (
                  <div key={shortcut.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={shortcut.enabled} 
                        onCheckedChange={(v) => setShortcuts(prev => 
                          prev.map(s => s.id === shortcut.id ? { ...s, enabled: v } : s)
                        )} 
                      />
                      <span className="text-white">{shortcut.action}</span>
                    </div>
                    {editingShortcut === shortcut.id ? (
                      <Input
                        autoFocus
                        maxLength={1}
                        className="w-16 h-8 bg-slate-900 border-cyan-500 text-white text-center"
                        onKeyDown={(e) => {
                          if (e.key.length === 1) updateShortcut(shortcut.id, e.key);
                        }}
                        onBlur={() => setEditingShortcut(null)}
                      />
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 h-8"
                        onClick={() => setEditingShortcut(shortcut.id)}
                      >
                        <kbd className="bg-slate-700 px-2 py-0.5 rounded text-cyan-400">Ctrl+{shortcut.key}</kbd>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Alerts Tab */}
            <TabsContent value="alerts" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <Label className="text-white">تنبيهات مرئية</Label>
                  </div>
                  <Switch 
                    checked={alertSettings.visual} 
                    onCheckedChange={(v) => setAlertSettings(prev => ({ ...prev, visual: v }))} 
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    <Label className="text-white">تنبيهات صوتية</Label>
                  </div>
                  <Switch 
                    checked={alertSettings.sound} 
                    onCheckedChange={(v) => setAlertSettings(prev => ({ ...prev, sound: v }))} 
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg space-y-3">
                <h5 className="text-white font-medium">أنواع التنبيهات</h5>
                <div className="space-y-2">
                  {[
                    { key: 'performanceAlerts', label: 'انخفاض الأداء', threshold: 'lowPerformance' },
                    { key: 'goalAlerts', label: 'تقدم الأهداف', threshold: 'goalProgress' },
                    { key: 'queueAlerts', label: 'طول قائمة الانتظار', threshold: 'highQueue' },
                  ].map(alert => (
                    <div key={alert.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={alertSettings[alert.key]} 
                          onCheckedChange={(v) => setAlertSettings(prev => ({ ...prev, [alert.key]: v }))} 
                        />
                        <Label className="text-slate-300">{alert.label}</Label>
                      </div>
                      <Input
                        type="number"
                        value={alertSettings.thresholds[alert.threshold]}
                        onChange={(e) => setAlertSettings(prev => ({
                          ...prev,
                          thresholds: { ...prev.thresholds, [alert.threshold]: Number(e.target.value) }
                        }))}
                        className="w-20 h-8 bg-slate-900 border-slate-700 text-white text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 pt-4 border-t border-slate-700 mt-4">
            <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={saveAllSettings}>
              <Save className="w-4 h-4 ml-2" />
              حفظ الإعدادات
            </Button>
            <Button variant="outline" className="border-slate-600" onClick={() => setShowSettings(false)}>
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}