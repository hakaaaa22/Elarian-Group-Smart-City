import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Brain, Plus, Trash2, Play, Pause, Clock, Calendar, Thermometer,
  Sun, Moon, Battery, Wifi, MapPin, User, Zap, AlertTriangle,
  ChevronDown, ChevronRight, Settings, Copy, Check, X, GripVertical,
  Lightbulb, Lock, Camera, Speaker, Fan, Power, Bell, Mail, Smartphone,
  RefreshCw, Timer, Repeat, ArrowRight, CircleDot
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const triggerTypes = [
  { id: 'time', name: 'وقت محدد', icon: Clock, color: 'cyan', category: 'schedule' },
  { id: 'sunrise', name: 'شروق الشمس', icon: Sun, color: 'amber', category: 'schedule' },
  { id: 'sunset', name: 'غروب الشمس', icon: Moon, color: 'purple', category: 'schedule' },
  { id: 'recurring', name: 'متكرر', icon: Repeat, color: 'green', category: 'schedule' },
  { id: 'temperature', name: 'درجة الحرارة', icon: Thermometer, color: 'red', category: 'sensor' },
  { id: 'humidity', name: 'الرطوبة', icon: Zap, color: 'blue', category: 'sensor' },
  { id: 'motion', name: 'كشف حركة', icon: User, color: 'pink', category: 'sensor' },
  { id: 'door', name: 'فتح/إغلاق باب', icon: Lock, color: 'orange', category: 'sensor' },
  { id: 'device_state', name: 'حالة جهاز', icon: Power, color: 'slate', category: 'device' },
  { id: 'battery_low', name: 'بطارية منخفضة', icon: Battery, color: 'red', category: 'device' },
  { id: 'device_offline', name: 'جهاز غير متصل', icon: Wifi, color: 'gray', category: 'device' },
  { id: 'location', name: 'الموقع', icon: MapPin, color: 'emerald', category: 'location' },
];

const actionTypes = [
  { id: 'light_on', name: 'تشغيل الإضاءة', icon: Lightbulb, color: 'amber' },
  { id: 'light_off', name: 'إطفاء الإضاءة', icon: Lightbulb, color: 'slate' },
  { id: 'set_brightness', name: 'ضبط السطوع', icon: Sun, color: 'yellow' },
  { id: 'set_temperature', name: 'ضبط الحرارة', icon: Thermometer, color: 'red' },
  { id: 'lock', name: 'قفل', icon: Lock, color: 'green' },
  { id: 'unlock', name: 'فتح القفل', icon: Lock, color: 'amber' },
  { id: 'fan_on', name: 'تشغيل المروحة', icon: Fan, color: 'cyan' },
  { id: 'fan_off', name: 'إيقاف المروحة', icon: Fan, color: 'slate' },
  { id: 'notify', name: 'إرسال إشعار', icon: Bell, color: 'purple' },
  { id: 'email', name: 'إرسال بريد', icon: Mail, color: 'blue' },
  { id: 'scene', name: 'تفعيل مشهد', icon: Play, color: 'pink' },
  { id: 'delay', name: 'انتظار', icon: Timer, color: 'orange' },
];

const logicOperators = [
  { id: 'and', name: 'و (AND)', description: 'جميع الشروط يجب أن تتحقق' },
  { id: 'or', name: 'أو (OR)', description: 'أي شرط يتحقق' },
];

const recurringOptions = [
  { id: 'daily', name: 'يومياً' },
  { id: 'weekly', name: 'أسبوعياً' },
  { id: 'monthly', name: 'شهرياً' },
  { id: 'custom', name: 'مخصص' },
];

const weekDays = [
  { id: 'sun', name: 'الأحد' },
  { id: 'mon', name: 'الإثنين' },
  { id: 'tue', name: 'الثلاثاء' },
  { id: 'wed', name: 'الأربعاء' },
  { id: 'thu', name: 'الخميس' },
  { id: 'fri', name: 'الجمعة' },
  { id: 'sat', name: 'السبت' },
];

export default function AdvancedAutomationBuilder({ devices, scenes, onSave }) {
  const [automations, setAutomations] = useState([
    {
      id: 'auto-1',
      name: 'إطفاء الأضواء ليلاً',
      enabled: true,
      triggers: [{ id: 't1', type: 'time', config: { time: '23:00' } }],
      conditions: [],
      actions: [{ id: 'a1', type: 'light_off', config: { target: 'all' } }],
      logic: 'and',
      recurring: { enabled: true, type: 'daily' }
    },
    {
      id: 'auto-2',
      name: 'تنبيه البطارية المنخفضة',
      enabled: true,
      triggers: [{ id: 't1', type: 'battery_low', config: { threshold: 20 } }],
      conditions: [],
      actions: [{ id: 'a1', type: 'notify', config: { message: 'بطارية الجهاز منخفضة' } }],
      logic: 'and',
      recurring: { enabled: false }
    }
  ]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState(null);
  const [currentAutomation, setCurrentAutomation] = useState({
    name: '',
    triggers: [],
    conditions: [],
    actions: [],
    logic: 'and',
    recurring: { enabled: false, type: 'daily', days: [], time: '' }
  });

  const openBuilder = (automation = null) => {
    if (automation) {
      setEditingAutomation(automation.id);
      setCurrentAutomation({ ...automation });
    } else {
      setEditingAutomation(null);
      setCurrentAutomation({
        name: '',
        triggers: [],
        conditions: [],
        actions: [],
        logic: 'and',
        recurring: { enabled: false, type: 'daily', days: [], time: '' }
      });
    }
    setShowBuilder(true);
  };

  const addTrigger = (triggerType) => {
    const trigger = triggerTypes.find(t => t.id === triggerType);
    setCurrentAutomation(prev => ({
      ...prev,
      triggers: [...prev.triggers, {
        id: `t-${Date.now()}`,
        type: triggerType,
        config: {}
      }]
    }));
  };

  const addAction = (actionType) => {
    setCurrentAutomation(prev => ({
      ...prev,
      actions: [...prev.actions, {
        id: `a-${Date.now()}`,
        type: actionType,
        config: {}
      }]
    }));
  };

  const removeTrigger = (triggerId) => {
    setCurrentAutomation(prev => ({
      ...prev,
      triggers: prev.triggers.filter(t => t.id !== triggerId)
    }));
  };

  const removeAction = (actionId) => {
    setCurrentAutomation(prev => ({
      ...prev,
      actions: prev.actions.filter(a => a.id !== actionId)
    }));
  };

  const updateTriggerConfig = (triggerId, config) => {
    setCurrentAutomation(prev => ({
      ...prev,
      triggers: prev.triggers.map(t => 
        t.id === triggerId ? { ...t, config: { ...t.config, ...config } } : t
      )
    }));
  };

  const updateActionConfig = (actionId, config) => {
    setCurrentAutomation(prev => ({
      ...prev,
      actions: prev.actions.map(a => 
        a.id === actionId ? { ...a, config: { ...a.config, ...config } } : a
      )
    }));
  };

  const saveAutomation = () => {
    if (!currentAutomation.name.trim()) {
      toast.error('يرجى إدخال اسم الأتمتة');
      return;
    }
    if (currentAutomation.triggers.length === 0) {
      toast.error('يرجى إضافة مشغّل واحد على الأقل');
      return;
    }
    if (currentAutomation.actions.length === 0) {
      toast.error('يرجى إضافة إجراء واحد على الأقل');
      return;
    }

    if (editingAutomation) {
      setAutomations(prev => prev.map(a => 
        a.id === editingAutomation ? { ...currentAutomation, id: editingAutomation, enabled: a.enabled } : a
      ));
      toast.success('تم تحديث الأتمتة');
    } else {
      const newAutomation = {
        ...currentAutomation,
        id: `auto-${Date.now()}`,
        enabled: true
      };
      setAutomations(prev => [...prev, newAutomation]);
      toast.success('تم إنشاء الأتمتة');
    }
    setShowBuilder(false);
  };

  const toggleAutomation = (automationId) => {
    setAutomations(prev => prev.map(a => 
      a.id === automationId ? { ...a, enabled: !a.enabled } : a
    ));
  };

  const deleteAutomation = (automationId) => {
    setAutomations(prev => prev.filter(a => a.id !== automationId));
    toast.success('تم حذف الأتمتة');
  };

  const duplicateAutomation = (automation) => {
    const newAutomation = {
      ...automation,
      id: `auto-${Date.now()}`,
      name: `${automation.name} (نسخة)`
    };
    setAutomations(prev => [...prev, newAutomation]);
    toast.success('تم نسخ الأتمتة');
  };

  const handleDragEnd = (result, type) => {
    if (!result.destination) return;
    
    const items = type === 'triggers' ? [...currentAutomation.triggers] : [...currentAutomation.actions];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setCurrentAutomation(prev => ({
      ...prev,
      [type]: items
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-pink-400" />
            الأتمتة المتقدمة
          </h3>
          <p className="text-slate-400 text-sm">إنشاء قواعد معقدة مع شروط متعددة (AND/OR)</p>
        </div>
        <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => openBuilder()}>
          <Plus className="w-4 h-4 ml-2" />
          أتمتة جديدة
        </Button>
      </div>

      {/* Automations List */}
      <div className="space-y-3">
        {automations.map((automation, i) => (
          <motion.div
            key={automation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 ${!automation.enabled ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${automation.enabled ? 'bg-pink-500/20' : 'bg-slate-700'}`}>
                      <Brain className={`w-6 h-6 ${automation.enabled ? 'text-pink-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{automation.name}</h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                          {automation.triggers.length} مشغّل
                        </Badge>
                        <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                          {automation.actions.length} إجراء
                        </Badge>
                        {automation.recurring?.enabled && (
                          <Badge className="bg-green-500/20 text-green-400 text-xs">
                            <Repeat className="w-3 h-3 ml-1" />
                            {recurringOptions.find(r => r.id === automation.recurring.type)?.name}
                          </Badge>
                        )}
                        <Badge className="bg-slate-500/20 text-slate-400 text-xs">
                          {logicOperators.find(l => l.id === automation.logic)?.name}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={automation.enabled} onCheckedChange={() => toggleAutomation(automation.id)} />
                    <Button variant="ghost" size="icon" className="text-slate-400" onClick={() => openBuilder(automation)}>
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400" onClick={() => duplicateAutomation(automation)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-400" onClick={() => deleteAutomation(automation.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingAutomation ? 'تعديل الأتمتة' : 'إنشاء أتمتة جديدة'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Name */}
            <div>
              <Label className="text-slate-300">اسم الأتمتة</Label>
              <Input
                value={currentAutomation.name}
                onChange={(e) => setCurrentAutomation(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="مثال: إطفاء الأضواء عند مغادرة المنزل"
              />
            </div>

            {/* Logic Operator */}
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <Label className="text-slate-300 mb-3 block">منطق الشروط</Label>
              <div className="flex gap-3">
                {logicOperators.map(op => (
                  <button
                    key={op.id}
                    onClick={() => setCurrentAutomation(prev => ({ ...prev, logic: op.id }))}
                    className={`flex-1 p-3 rounded-lg border transition-all ${
                      currentAutomation.logic === op.id
                        ? 'bg-pink-500/20 border-pink-500/50 text-white'
                        : 'bg-slate-700/50 border-slate-600 text-slate-400'
                    }`}
                  >
                    <p className="font-medium">{op.name}</p>
                    <p className="text-xs mt-1 opacity-70">{op.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recurring Settings */}
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-slate-300">تكرار الأتمتة</Label>
                <Switch
                  checked={currentAutomation.recurring?.enabled}
                  onCheckedChange={(v) => setCurrentAutomation(prev => ({
                    ...prev,
                    recurring: { ...prev.recurring, enabled: v }
                  }))}
                />
              </div>
              {currentAutomation.recurring?.enabled && (
                <div className="space-y-3">
                  <Select
                    value={currentAutomation.recurring.type}
                    onValueChange={(v) => setCurrentAutomation(prev => ({
                      ...prev,
                      recurring: { ...prev.recurring, type: v }
                    }))}
                  >
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {recurringOptions.map(opt => (
                        <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {currentAutomation.recurring.type === 'weekly' && (
                    <div className="flex gap-2 flex-wrap">
                      {weekDays.map(day => (
                        <button
                          key={day.id}
                          onClick={() => {
                            const days = currentAutomation.recurring.days || [];
                            const newDays = days.includes(day.id)
                              ? days.filter(d => d !== day.id)
                              : [...days, day.id];
                            setCurrentAutomation(prev => ({
                              ...prev,
                              recurring: { ...prev.recurring, days: newDays }
                            }));
                          }}
                          className={`px-3 py-1 rounded-full text-xs ${
                            (currentAutomation.recurring.days || []).includes(day.id)
                              ? 'bg-pink-500 text-white'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {day.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Triggers */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  المشغّلات (Triggers)
                </Label>
              </div>
              
              <DragDropContext onDragEnd={(result) => handleDragEnd(result, 'triggers')}>
                <Droppable droppableId="triggers">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 mb-3">
                      {currentAutomation.triggers.map((trigger, index) => {
                        const triggerType = triggerTypes.find(t => t.id === trigger.type);
                        const Icon = triggerType?.icon || Zap;
                        
                        return (
                          <Draggable key={trigger.id} draggableId={trigger.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="flex items-center gap-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg"
                              >
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="w-4 h-4 text-slate-500" />
                                </div>
                                <div className={`p-2 rounded-lg bg-${triggerType?.color || 'cyan'}-500/20`}>
                                  <Icon className={`w-4 h-4 text-${triggerType?.color || 'cyan'}-400`} />
                                </div>
                                <div className="flex-1">
                                  <p className="text-white text-sm font-medium">{triggerType?.name}</p>
                                  {trigger.type === 'time' && (
                                    <Input
                                      type="time"
                                      value={trigger.config.time || ''}
                                      onChange={(e) => updateTriggerConfig(trigger.id, { time: e.target.value })}
                                      className="bg-slate-700/50 border-slate-600 text-white mt-1 w-32 h-8"
                                    />
                                  )}
                                  {trigger.type === 'battery_low' && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-slate-400 text-xs">أقل من</span>
                                      <Input
                                        type="number"
                                        value={trigger.config.threshold || 20}
                                        onChange={(e) => updateTriggerConfig(trigger.id, { threshold: parseInt(e.target.value) })}
                                        className="bg-slate-700/50 border-slate-600 text-white w-16 h-8"
                                      />
                                      <span className="text-slate-400 text-xs">%</span>
                                    </div>
                                  )}
                                  {trigger.type === 'temperature' && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <Select
                                        value={trigger.config.operator || 'gt'}
                                        onValueChange={(v) => updateTriggerConfig(trigger.id, { operator: v })}
                                      >
                                        <SelectTrigger className="w-24 h-8 bg-slate-700/50 border-slate-600 text-white text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                          <SelectItem value="gt">أكبر من</SelectItem>
                                          <SelectItem value="lt">أقل من</SelectItem>
                                          <SelectItem value="eq">يساوي</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Input
                                        type="number"
                                        value={trigger.config.value || 25}
                                        onChange={(e) => updateTriggerConfig(trigger.id, { value: parseInt(e.target.value) })}
                                        className="bg-slate-700/50 border-slate-600 text-white w-16 h-8"
                                      />
                                      <span className="text-slate-400 text-xs">°C</span>
                                    </div>
                                  )}
                                </div>
                                <Button variant="ghost" size="icon" className="text-red-400" onClick={() => removeTrigger(trigger.id)}>
                                  <X className="w-4 h-4" />
                                </Button>
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

              <div className="flex flex-wrap gap-2">
                {triggerTypes.map(trigger => {
                  const Icon = trigger.icon;
                  return (
                    <button
                      key={trigger.id}
                      onClick={() => addTrigger(trigger.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-full text-xs text-slate-300 transition-colors"
                    >
                      <Icon className="w-3 h-3" />
                      {trigger.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Flow Arrow */}
            {currentAutomation.triggers.length > 0 && currentAutomation.actions.length > 0 && (
              <div className="flex justify-center">
                <ArrowRight className="w-6 h-6 text-slate-500 rotate-90" />
              </div>
            )}

            {/* Actions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Play className="w-4 h-4 text-purple-400" />
                  الإجراءات (Actions)
                </Label>
              </div>
              
              <DragDropContext onDragEnd={(result) => handleDragEnd(result, 'actions')}>
                <Droppable droppableId="actions">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 mb-3">
                      {currentAutomation.actions.map((action, index) => {
                        const actionType = actionTypes.find(a => a.id === action.type);
                        const Icon = actionType?.icon || Zap;
                        
                        return (
                          <Draggable key={action.id} draggableId={action.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg"
                              >
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="w-4 h-4 text-slate-500" />
                                </div>
                                <div className={`p-2 rounded-lg bg-${actionType?.color || 'purple'}-500/20`}>
                                  <Icon className={`w-4 h-4 text-${actionType?.color || 'purple'}-400`} />
                                </div>
                                <div className="flex-1">
                                  <p className="text-white text-sm font-medium">{actionType?.name}</p>
                                  {action.type === 'delay' && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <Input
                                        type="number"
                                        value={action.config.seconds || 5}
                                        onChange={(e) => updateActionConfig(action.id, { seconds: parseInt(e.target.value) })}
                                        className="bg-slate-700/50 border-slate-600 text-white w-16 h-8"
                                      />
                                      <span className="text-slate-400 text-xs">ثانية</span>
                                    </div>
                                  )}
                                  {action.type === 'set_brightness' && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <Slider
                                        value={[action.config.brightness || 100]}
                                        onValueChange={([v]) => updateActionConfig(action.id, { brightness: v })}
                                        max={100}
                                        className="w-24"
                                      />
                                      <span className="text-slate-400 text-xs">{action.config.brightness || 100}%</span>
                                    </div>
                                  )}
                                  {action.type === 'set_temperature' && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <Input
                                        type="number"
                                        value={action.config.temperature || 24}
                                        onChange={(e) => updateActionConfig(action.id, { temperature: parseInt(e.target.value) })}
                                        className="bg-slate-700/50 border-slate-600 text-white w-16 h-8"
                                      />
                                      <span className="text-slate-400 text-xs">°C</span>
                                    </div>
                                  )}
                                  {action.type === 'notify' && (
                                    <Input
                                      value={action.config.message || ''}
                                      onChange={(e) => updateActionConfig(action.id, { message: e.target.value })}
                                      placeholder="نص الإشعار"
                                      className="bg-slate-700/50 border-slate-600 text-white mt-1 h-8"
                                    />
                                  )}
                                </div>
                                <Button variant="ghost" size="icon" className="text-red-400" onClick={() => removeAction(action.id)}>
                                  <X className="w-4 h-4" />
                                </Button>
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

              <div className="flex flex-wrap gap-2">
                {actionTypes.map(action => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => addAction(action.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-full text-xs text-slate-300 transition-colors"
                    >
                      <Icon className="w-3 h-3" />
                      {action.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <Button variant="outline" className="flex-1 border-slate-600" onClick={() => setShowBuilder(false)}>
                إلغاء
              </Button>
              <Button className="flex-1 bg-pink-600 hover:bg-pink-700" onClick={saveAutomation}>
                <Check className="w-4 h-4 ml-2" />
                {editingAutomation ? 'حفظ التغييرات' : 'إنشاء الأتمتة'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}