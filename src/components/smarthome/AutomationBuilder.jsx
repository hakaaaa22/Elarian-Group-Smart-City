import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Brain, Plus, Trash2, Play, Pause, Clock, Sun, Moon, Thermometer,
  MapPin, Wifi, Calendar, ChevronDown, ChevronRight, GripVertical,
  Zap, Lightbulb, Lock, Camera, Speaker, Settings, ArrowRight,
  AlertTriangle, Check, X, Copy, Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Trigger types
const triggerTypes = [
  { id: 'time', name: 'وقت محدد', icon: Clock, color: 'cyan', fields: ['time'] },
  { id: 'schedule', name: 'جدول زمني', icon: Calendar, color: 'blue', fields: ['days', 'time'] },
  { id: 'temperature', name: 'درجة الحرارة', icon: Thermometer, color: 'amber', fields: ['operator', 'value'] },
  { id: 'location', name: 'الموقع', icon: MapPin, color: 'green', fields: ['action'] },
  { id: 'sunset', name: 'غروب الشمس', icon: Sun, color: 'orange', fields: ['offset'] },
  { id: 'sunrise', name: 'شروق الشمس', icon: Sun, color: 'yellow', fields: ['offset'] },
  { id: 'device', name: 'حالة جهاز', icon: Zap, color: 'purple', fields: ['device', 'state'] },
];

// Action types
const actionTypes = [
  { id: 'light', name: 'تحكم بالإضاءة', icon: Lightbulb, color: 'amber', fields: ['device', 'action', 'brightness'] },
  { id: 'climate', name: 'تحكم بالمناخ', icon: Thermometer, color: 'cyan', fields: ['device', 'action', 'temp'] },
  { id: 'lock', name: 'تحكم بالقفل', icon: Lock, color: 'red', fields: ['device', 'action'] },
  { id: 'camera', name: 'تحكم بالكاميرا', icon: Camera, color: 'purple', fields: ['device', 'action'] },
  { id: 'speaker', name: 'تحكم بالسماعة', icon: Speaker, color: 'green', fields: ['device', 'action', 'volume'] },
  { id: 'scene', name: 'تشغيل سيناريو', icon: Play, color: 'blue', fields: ['scene'] },
  { id: 'notification', name: 'إرسال إشعار', icon: AlertTriangle, color: 'pink', fields: ['message'] },
  { id: 'delay', name: 'تأخير', icon: Clock, color: 'slate', fields: ['duration'] },
];

// Condition operators
const operators = [
  { id: 'gt', name: 'أكبر من', symbol: '>' },
  { id: 'lt', name: 'أصغر من', symbol: '<' },
  { id: 'eq', name: 'يساوي', symbol: '=' },
  { id: 'gte', name: 'أكبر من أو يساوي', symbol: '≥' },
  { id: 'lte', name: 'أصغر من أو يساوي', symbol: '≤' },
];

const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

export default function AutomationBuilder({ devices, scenes }) {
  const [automations, setAutomations] = useState([
    {
      id: 'auto-1',
      name: 'إطفاء الأضواء عند مغادرة المنزل',
      active: true,
      triggers: [{ id: 't1', type: 'location', config: { action: 'leave' } }],
      conditions: [],
      actions: [
        { id: 'a1', type: 'light', config: { device: 'all', action: 'off' } },
        { id: 'a2', type: 'lock', config: { device: 'all', action: 'lock' } }
      ]
    },
    {
      id: 'auto-2',
      name: 'تشغيل المكيف عند ارتفاع الحرارة',
      active: true,
      triggers: [{ id: 't1', type: 'temperature', config: { operator: 'gt', value: 28 } }],
      conditions: [{ id: 'c1', type: 'time', config: { start: '08:00', end: '22:00' } }],
      actions: [{ id: 'a1', type: 'climate', config: { device: 'dev-2', action: 'on', temp: 22 } }]
    },
  ]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState(null);
  const [currentAutomation, setCurrentAutomation] = useState({
    name: '',
    triggers: [],
    conditions: [],
    actions: []
  });

  const resetBuilder = () => {
    setCurrentAutomation({ name: '', triggers: [], conditions: [], actions: [] });
    setEditingAutomation(null);
  };

  const openBuilder = (automation = null) => {
    if (automation) {
      setCurrentAutomation({ ...automation });
      setEditingAutomation(automation.id);
    } else {
      resetBuilder();
    }
    setShowBuilder(true);
  };

  const addTrigger = (type) => {
    const newTrigger = {
      id: `t-${Date.now()}`,
      type,
      config: {}
    };
    setCurrentAutomation({
      ...currentAutomation,
      triggers: [...currentAutomation.triggers, newTrigger]
    });
  };

  const addCondition = () => {
    const newCondition = {
      id: `c-${Date.now()}`,
      type: 'time',
      config: { start: '08:00', end: '22:00' }
    };
    setCurrentAutomation({
      ...currentAutomation,
      conditions: [...currentAutomation.conditions, newCondition]
    });
  };

  const addAction = (type) => {
    const newAction = {
      id: `a-${Date.now()}`,
      type,
      config: {}
    };
    setCurrentAutomation({
      ...currentAutomation,
      actions: [...currentAutomation.actions, newAction]
    });
  };

  const removeTrigger = (id) => {
    setCurrentAutomation({
      ...currentAutomation,
      triggers: currentAutomation.triggers.filter(t => t.id !== id)
    });
  };

  const removeCondition = (id) => {
    setCurrentAutomation({
      ...currentAutomation,
      conditions: currentAutomation.conditions.filter(c => c.id !== id)
    });
  };

  const removeAction = (id) => {
    setCurrentAutomation({
      ...currentAutomation,
      actions: currentAutomation.actions.filter(a => a.id !== id)
    });
  };

  const updateTriggerConfig = (id, config) => {
    setCurrentAutomation({
      ...currentAutomation,
      triggers: currentAutomation.triggers.map(t =>
        t.id === id ? { ...t, config: { ...t.config, ...config } } : t
      )
    });
  };

  const updateActionConfig = (id, config) => {
    setCurrentAutomation({
      ...currentAutomation,
      actions: currentAutomation.actions.map(a =>
        a.id === id ? { ...a, config: { ...a.config, ...config } } : a
      )
    });
  };

  const saveAutomation = () => {
    if (!currentAutomation.name.trim()) {
      toast.error('يرجى إدخال اسم للأتمتة');
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
      setAutomations(automations.map(a =>
        a.id === editingAutomation ? { ...currentAutomation, id: editingAutomation, active: a.active } : a
      ));
      toast.success('تم تحديث الأتمتة');
    } else {
      const newAutomation = {
        ...currentAutomation,
        id: `auto-${Date.now()}`,
        active: true
      };
      setAutomations([...automations, newAutomation]);
      toast.success('تم إنشاء الأتمتة');
    }
    setShowBuilder(false);
    resetBuilder();
  };

  const toggleAutomation = (id) => {
    setAutomations(automations.map(a =>
      a.id === id ? { ...a, active: !a.active } : a
    ));
  };

  const deleteAutomation = (id) => {
    setAutomations(automations.filter(a => a.id !== id));
    toast.success('تم حذف الأتمتة');
  };

  const duplicateAutomation = (automation) => {
    const newAutomation = {
      ...automation,
      id: `auto-${Date.now()}`,
      name: `${automation.name} (نسخة)`
    };
    setAutomations([...automations, newAutomation]);
    toast.success('تم نسخ الأتمتة');
  };

  const onDragEnd = (result, listType) => {
    if (!result.destination) return;

    const items = Array.from(currentAutomation[listType]);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCurrentAutomation({ ...currentAutomation, [listType]: items });
  };

  const getTriggerIcon = (type) => {
    const found = triggerTypes.find(t => t.id === type);
    return found ? found.icon : Zap;
  };

  const getActionIcon = (type) => {
    const found = actionTypes.find(a => a.id === type);
    return found ? found.icon : Zap;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/20">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">منشئ الأتمتة المتقدم</h2>
            <p className="text-slate-400 text-sm">إنشاء قواعد أتمتة معقدة بالسحب والإفلات</p>
          </div>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => openBuilder()}>
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
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 ${!automation.active ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${automation.active ? 'bg-green-500/20' : 'bg-slate-700'}`}>
                      <Brain className={`w-5 h-5 ${automation.active ? 'text-green-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{automation.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                          {automation.triggers.length} مشغّل
                        </Badge>
                        {automation.conditions.length > 0 && (
                          <Badge className="bg-amber-500/20 text-amber-400 text-xs">
                            {automation.conditions.length} شرط
                          </Badge>
                        )}
                        <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                          {automation.actions.length} إجراء
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={automation.active}
                      onCheckedChange={() => toggleAutomation(automation.id)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => openBuilder(automation)}>
                      <Settings className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => duplicateAutomation(automation)}>
                      <Copy className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteAutomation(automation.id)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>

                {/* Flow Preview */}
                <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
                  {automation.triggers.map((trigger, ti) => {
                    const TriggerIcon = getTriggerIcon(trigger.type);
                    return (
                      <React.Fragment key={trigger.id}>
                        <div className="flex items-center gap-1 px-2 py-1 bg-cyan-500/20 rounded text-cyan-400 text-xs whitespace-nowrap">
                          <TriggerIcon className="w-3 h-3" />
                          {triggerTypes.find(t => t.id === trigger.type)?.name}
                        </div>
                        {ti < automation.triggers.length - 1 && <span className="text-slate-500">أو</span>}
                      </React.Fragment>
                    );
                  })}
                  {automation.conditions.length > 0 && (
                    <>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                      <div className="px-2 py-1 bg-amber-500/20 rounded text-amber-400 text-xs whitespace-nowrap">
                        {automation.conditions.length} شروط
                      </div>
                    </>
                  )}
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  {automation.actions.map((action, ai) => {
                    const ActionIcon = getActionIcon(action.type);
                    return (
                      <React.Fragment key={action.id}>
                        <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded text-purple-400 text-xs whitespace-nowrap">
                          <ActionIcon className="w-3 h-3" />
                          {actionTypes.find(a => a.id === action.type)?.name}
                        </div>
                        {ai < automation.actions.length - 1 && <span className="text-slate-500">ثم</span>}
                      </React.Fragment>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {automations.length === 0 && (
          <Card className="glass-card border-dashed border-2 border-slate-700 bg-transparent">
            <CardContent className="p-8 text-center">
              <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">لا توجد قواعد أتمتة</p>
              <p className="text-slate-500 text-sm mt-1">أنشئ أول قاعدة أتمتة لتشغيل الأجهزة تلقائياً</p>
              <Button className="mt-4 bg-purple-600 hover:bg-purple-700" onClick={() => openBuilder()}>
                <Plus className="w-4 h-4 ml-2" />
                إنشاء أتمتة
              </Button>
            </CardContent>
          </Card>
        )}
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
                onChange={(e) => setCurrentAutomation({ ...currentAutomation, name: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="مثال: إطفاء الأضواء ليلاً"
              />
            </div>

            {/* Triggers */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  المشغّلات (عندما)
                </Label>
                <Select onValueChange={addTrigger}>
                  <SelectTrigger className="w-40 h-8 bg-slate-800/50 border-slate-700 text-white">
                    <Plus className="w-3 h-3 ml-1" />
                    <SelectValue placeholder="إضافة مشغّل" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {triggerTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        <span className="flex items-center gap-2">
                          <type.icon className={`w-4 h-4 text-${type.color}-400`} />
                          {type.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DragDropContext onDragEnd={(r) => onDragEnd(r, 'triggers')}>
                <Droppable droppableId="triggers">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                      {currentAutomation.triggers.map((trigger, index) => {
                        const triggerType = triggerTypes.find(t => t.id === trigger.type);
                        const TriggerIcon = triggerType?.icon || Zap;
                        return (
                          <Draggable key={trigger.id} draggableId={trigger.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="w-4 h-4 text-slate-500 cursor-grab" />
                                  </div>
                                  <TriggerIcon className={`w-5 h-5 text-${triggerType?.color || 'cyan'}-400`} />
                                  <span className="text-white font-medium flex-1">{triggerType?.name}</span>
                                  <Button variant="ghost" size="icon" onClick={() => removeTrigger(trigger.id)}>
                                    <X className="w-4 h-4 text-red-400" />
                                  </Button>
                                </div>

                                {/* Trigger Config */}
                                <div className="mt-3 grid grid-cols-2 gap-3">
                                  {trigger.type === 'time' && (
                                    <Input
                                      type="time"
                                      value={trigger.config.time || ''}
                                      onChange={(e) => updateTriggerConfig(trigger.id, { time: e.target.value })}
                                      className="bg-slate-800/50 border-slate-700 text-white"
                                    />
                                  )}
                                  {trigger.type === 'temperature' && (
                                    <>
                                      <Select
                                        value={trigger.config.operator || 'gt'}
                                        onValueChange={(v) => updateTriggerConfig(trigger.id, { operator: v })}
                                      >
                                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                          {operators.map(op => (
                                            <SelectItem key={op.id} value={op.id}>{op.name}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <Input
                                        type="number"
                                        value={trigger.config.value || ''}
                                        onChange={(e) => updateTriggerConfig(trigger.id, { value: parseFloat(e.target.value) })}
                                        className="bg-slate-800/50 border-slate-700 text-white"
                                        placeholder="°C"
                                      />
                                    </>
                                  )}
                                  {trigger.type === 'location' && (
                                    <Select
                                      value={trigger.config.action || 'arrive'}
                                      onValueChange={(v) => updateTriggerConfig(trigger.id, { action: v })}
                                    >
                                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-slate-800 border-slate-700">
                                        <SelectItem value="arrive">عند الوصول للمنزل</SelectItem>
                                        <SelectItem value="leave">عند مغادرة المنزل</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  )}
                                  {(trigger.type === 'sunset' || trigger.type === 'sunrise') && (
                                    <Input
                                      type="number"
                                      value={trigger.config.offset || 0}
                                      onChange={(e) => updateTriggerConfig(trigger.id, { offset: parseInt(e.target.value) })}
                                      className="bg-slate-800/50 border-slate-700 text-white"
                                      placeholder="الإزاحة بالدقائق"
                                    />
                                  )}
                                </div>
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
            </div>

            {/* Conditions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-slate-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  الشروط (اختياري - و)
                </Label>
                <Button size="sm" variant="outline" className="border-slate-600" onClick={addCondition}>
                  <Plus className="w-3 h-3 ml-1" />
                  إضافة شرط
                </Button>
              </div>

              <div className="space-y-2">
                {currentAutomation.conditions.map((condition) => (
                  <div key={condition.id} className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-white">شرط الوقت</span>
                      <Button variant="ghost" size="icon" onClick={() => removeCondition(condition.id)}>
                        <X className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                    <div className="mt-2 flex gap-3">
                      <div className="flex-1">
                        <Label className="text-slate-400 text-xs">من</Label>
                        <Input type="time" defaultValue="08:00" className="bg-slate-800/50 border-slate-700 text-white mt-1" />
                      </div>
                      <div className="flex-1">
                        <Label className="text-slate-400 text-xs">إلى</Label>
                        <Input type="time" defaultValue="22:00" className="bg-slate-800/50 border-slate-700 text-white mt-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Play className="w-4 h-4 text-purple-400" />
                  الإجراءات (افعل)
                </Label>
                <Select onValueChange={addAction}>
                  <SelectTrigger className="w-40 h-8 bg-slate-800/50 border-slate-700 text-white">
                    <Plus className="w-3 h-3 ml-1" />
                    <SelectValue placeholder="إضافة إجراء" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {actionTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        <span className="flex items-center gap-2">
                          <type.icon className={`w-4 h-4 text-${type.color}-400`} />
                          {type.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DragDropContext onDragEnd={(r) => onDragEnd(r, 'actions')}>
                <Droppable droppableId="actions">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                      {currentAutomation.actions.map((action, index) => {
                        const actionType = actionTypes.find(a => a.id === action.type);
                        const ActionIcon = actionType?.icon || Zap;
                        return (
                          <Draggable key={action.id} draggableId={action.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="w-4 h-4 text-slate-500 cursor-grab" />
                                  </div>
                                  <ActionIcon className={`w-5 h-5 text-${actionType?.color || 'purple'}-400`} />
                                  <span className="text-white font-medium flex-1">{actionType?.name}</span>
                                  <Button variant="ghost" size="icon" onClick={() => removeAction(action.id)}>
                                    <X className="w-4 h-4 text-red-400" />
                                  </Button>
                                </div>

                                {/* Action Config */}
                                <div className="mt-3 grid grid-cols-2 gap-3">
                                  {(action.type === 'light' || action.type === 'climate' || action.type === 'lock') && (
                                    <Select
                                      value={action.config.device || ''}
                                      onValueChange={(v) => updateActionConfig(action.id, { device: v })}
                                    >
                                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                                        <SelectValue placeholder="اختر الجهاز" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-slate-800 border-slate-700">
                                        <SelectItem value="all">جميع الأجهزة</SelectItem>
                                        {devices.map(d => (
                                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                  {action.type === 'light' && (
                                    <Select
                                      value={action.config.action || 'on'}
                                      onValueChange={(v) => updateActionConfig(action.id, { action: v })}
                                    >
                                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-slate-800 border-slate-700">
                                        <SelectItem value="on">تشغيل</SelectItem>
                                        <SelectItem value="off">إيقاف</SelectItem>
                                        <SelectItem value="toggle">تبديل</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  )}
                                  {action.type === 'notification' && (
                                    <Input
                                      value={action.config.message || ''}
                                      onChange={(e) => updateActionConfig(action.id, { message: e.target.value })}
                                      className="col-span-2 bg-slate-800/50 border-slate-700 text-white"
                                      placeholder="نص الإشعار"
                                    />
                                  )}
                                  {action.type === 'delay' && (
                                    <Input
                                      type="number"
                                      value={action.config.duration || ''}
                                      onChange={(e) => updateActionConfig(action.id, { duration: parseInt(e.target.value) })}
                                      className="bg-slate-800/50 border-slate-700 text-white"
                                      placeholder="الثواني"
                                    />
                                  )}
                                </div>
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
            </div>

            {/* Save Button */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 border-slate-600" onClick={() => setShowBuilder(false)}>
                إلغاء
              </Button>
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={saveAutomation}>
                <Save className="w-4 h-4 ml-2" />
                حفظ الأتمتة
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}