import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  GitBranch, Plus, Trash2, Play, Pause, Settings, Copy, Save,
  Zap, Clock, Thermometer, Sun, Moon, Lock, Unlock, Lightbulb,
  Speaker, Fan, Camera, Bell, AlertTriangle, Check, X, ChevronDown,
  ChevronRight, ArrowDown, ArrowRight, Split, Merge, User, MessageSquare,
  Smartphone, Mail, Webhook, Database, Code, RefreshCw, Timer,
  MoreVertical, GripVertical, Circle, Square, Diamond, Hexagon, Move
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Node Types
const nodeTypes = {
  trigger: { icon: Zap, color: 'amber', label: 'مُشغِّل' },
  condition: { icon: Split, color: 'purple', label: 'شرط' },
  action: { icon: Play, color: 'cyan', label: 'إجراء' },
  delay: { icon: Timer, color: 'blue', label: 'تأخير' },
  loop: { icon: RefreshCw, color: 'green', label: 'تكرار' },
  input: { icon: User, color: 'pink', label: 'إدخال بشري' },
  webhook: { icon: Webhook, color: 'orange', label: 'Webhook' },
  subflow: { icon: GitBranch, color: 'indigo', label: 'مسار فرعي' },
  ifttt: { icon: Code, color: 'red', label: 'IFTTT' },
  deviceResponse: { icon: Bell, color: 'emerald', label: 'استجابة جهاز' },
  parallel: { icon: Merge, color: 'teal', label: 'تنفيذ متوازي' },
  switch: { icon: Diamond, color: 'violet', label: 'تبديل متعدد' },
};

// Trigger Options
const triggerOptions = [
  { id: 'device_state', name: 'حالة جهاز', icon: Zap },
  { id: 'time', name: 'وقت محدد', icon: Clock },
  { id: 'sunrise_sunset', name: 'شروق/غروب', icon: Sun },
  { id: 'temperature', name: 'درجة حرارة', icon: Thermometer },
  { id: 'humidity', name: 'رطوبة', icon: Thermometer },
  { id: 'motion', name: 'حركة', icon: Camera },
  { id: 'door_window', name: 'باب/نافذة', icon: Lock },
  { id: 'webhook', name: 'Webhook', icon: Webhook },
  { id: 'ifttt', name: 'IFTTT Applet', icon: Code },
  { id: 'device_response', name: 'استجابة جهاز', icon: Bell },
  { id: 'human_input', name: 'إدخال بشري', icon: User },
  { id: 'location', name: 'الموقع (وصول/مغادرة)', icon: Camera },
  { id: 'voice_command', name: 'أمر صوتي', icon: Speaker },
  { id: 'schedule', name: 'جدول زمني', icon: Clock },
  { id: 'energy_threshold', name: 'حد استهلاك الطاقة', icon: Zap },
];

// IFTTT Services
const iftttServices = [
  { id: 'google_assistant', name: 'Google Assistant', color: 'blue' },
  { id: 'alexa', name: 'Amazon Alexa', color: 'cyan' },
  { id: 'weather', name: 'Weather Underground', color: 'amber' },
  { id: 'location', name: 'Location', color: 'green' },
  { id: 'time', name: 'Date & Time', color: 'purple' },
  { id: 'email', name: 'Email', color: 'red' },
  { id: 'sms', name: 'SMS', color: 'pink' },
  { id: 'calendar', name: 'Google Calendar', color: 'indigo' },
];

// Action Options
const actionOptions = [
  { id: 'control_device', name: 'التحكم بجهاز', icon: Lightbulb },
  { id: 'control_group', name: 'التحكم بمجموعة', icon: Lightbulb },
  { id: 'send_notification', name: 'إرسال إشعار', icon: Bell },
  { id: 'send_email', name: 'إرسال بريد', icon: Mail },
  { id: 'send_sms', name: 'إرسال SMS', icon: Smartphone },
  { id: 'call_webhook', name: 'استدعاء Webhook', icon: Webhook },
  { id: 'ifttt_action', name: 'تشغيل IFTTT', icon: Code },
  { id: 'run_scene', name: 'تشغيل سيناريو', icon: Play },
  { id: 'wait_response', name: 'انتظار استجابة', icon: MessageSquare },
  { id: 'wait_device_response', name: 'انتظار استجابة جهاز', icon: Bell },
  { id: 'set_variable', name: 'تعيين متغير', icon: Database },
  { id: 'run_subflow', name: 'تشغيل مسار فرعي', icon: GitBranch },
  { id: 'speak', name: 'نطق رسالة صوتية', icon: Speaker },
  { id: 'log', name: 'تسجيل في السجل', icon: Database },
  { id: 'http_request', name: 'طلب HTTP', icon: Webhook },
];

// Sample Workflows
const sampleWorkflows = [
  {
    id: 'wf1',
    name: 'أتمتة الإضاءة الذكية',
    description: 'تشغيل الإضاءة عند الحركة مع شروط متعددة',
    enabled: true,
    nodes: [
      { id: 'n1', type: 'trigger', config: { trigger: 'motion', device: 'sensor_1' }, position: { x: 100, y: 100 } },
      { id: 'n2', type: 'condition', config: { type: 'time', operator: 'between', value: ['18:00', '06:00'] }, position: { x: 100, y: 200 } },
      { id: 'n3', type: 'action', config: { action: 'control_device', device: 'light_1', state: 'on' }, position: { x: 100, y: 300 } },
    ],
    connections: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3', condition: 'true' },
    ]
  },
  {
    id: 'wf2',
    name: 'نظام الأمان المتقدم',
    description: 'مراقبة وتنبيه مع انتظار استجابة المستخدم',
    enabled: true,
    nodes: [
      { id: 'n1', type: 'trigger', config: { trigger: 'device_state', device: 'door_sensor', state: 'open' }, position: { x: 100, y: 100 } },
      { id: 'n2', type: 'condition', config: { type: 'device_state', device: 'alarm_armed', state: true }, position: { x: 100, y: 200 } },
      { id: 'n3', type: 'action', config: { action: 'send_notification', message: 'تم فتح الباب!' }, position: { x: 100, y: 300 } },
      { id: 'n4', type: 'input', config: { prompt: 'هل تريد تفعيل الإنذار؟', timeout: 60, options: ['نعم', 'لا'] }, position: { x: 100, y: 400 } },
      { id: 'n5', type: 'action', config: { action: 'control_device', device: 'siren', state: 'on' }, position: { x: 50, y: 500 } },
      { id: 'n6', type: 'action', config: { action: 'send_notification', message: 'تم التجاهل' }, position: { x: 200, y: 500 } },
    ],
    connections: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3', condition: 'true' },
      { from: 'n3', to: 'n4' },
      { from: 'n4', to: 'n5', condition: 'نعم' },
      { from: 'n4', to: 'n6', condition: 'لا' },
    ]
  }
];

export default function WorkflowBuilder({ devices = [] }) {
  const [workflows, setWorkflows] = useState(sampleWorkflows);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [showNodePicker, setShowNodePicker] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({ name: '', description: '' });

  const createWorkflow = () => {
    if (!newWorkflow.name.trim()) {
      toast.error('يرجى إدخال اسم المسار');
      return;
    }
    const workflow = {
      id: `wf-${Date.now()}`,
      name: newWorkflow.name,
      description: newWorkflow.description,
      enabled: false,
      nodes: [],
      connections: []
    };
    setWorkflows([...workflows, workflow]);
    setSelectedWorkflow(workflow);
    setShowCreateDialog(false);
    setNewWorkflow({ name: '', description: '' });
    toast.success('تم إنشاء المسار');
  };

  const addNode = (type) => {
    if (!selectedWorkflow) return;
    const newNode = {
      id: `node-${Date.now()}`,
      type,
      config: {},
      position: { x: 150, y: (selectedWorkflow.nodes.length + 1) * 120 }
    };
    const updated = {
      ...selectedWorkflow,
      nodes: [...selectedWorkflow.nodes, newNode]
    };
    setSelectedWorkflow(updated);
    setWorkflows(workflows.map(w => w.id === updated.id ? updated : w));
    setShowNodePicker(false);
    setEditingNode(newNode);
  };

  const updateNode = (nodeId, config) => {
    if (!selectedWorkflow) return;
    const updated = {
      ...selectedWorkflow,
      nodes: selectedWorkflow.nodes.map(n => 
        n.id === nodeId ? { ...n, config: { ...n.config, ...config } } : n
      )
    };
    setSelectedWorkflow(updated);
    setWorkflows(workflows.map(w => w.id === updated.id ? updated : w));
  };

  const deleteNode = (nodeId) => {
    if (!selectedWorkflow) return;
    const updated = {
      ...selectedWorkflow,
      nodes: selectedWorkflow.nodes.filter(n => n.id !== nodeId),
      connections: selectedWorkflow.connections.filter(c => c.from !== nodeId && c.to !== nodeId)
    };
    setSelectedWorkflow(updated);
    setWorkflows(workflows.map(w => w.id === updated.id ? updated : w));
    toast.success('تم حذف العقدة');
  };

  const connectNodes = (fromId, toId, condition = null) => {
    if (!selectedWorkflow) return;
    const exists = selectedWorkflow.connections.find(c => c.from === fromId && c.to === toId);
    if (exists) return;
    const updated = {
      ...selectedWorkflow,
      connections: [...selectedWorkflow.connections, { from: fromId, to: toId, condition }]
    };
    setSelectedWorkflow(updated);
    setWorkflows(workflows.map(w => w.id === updated.id ? updated : w));
  };

  const toggleWorkflow = (workflowId) => {
    setWorkflows(workflows.map(w => 
      w.id === workflowId ? { ...w, enabled: !w.enabled } : w
    ));
    toast.success('تم تحديث حالة المسار');
  };

  const deleteWorkflow = (workflowId) => {
    setWorkflows(workflows.filter(w => w.id !== workflowId));
    if (selectedWorkflow?.id === workflowId) setSelectedWorkflow(null);
    toast.success('تم حذف المسار');
  };

  const duplicateWorkflow = (workflow) => {
    const newWf = {
      ...workflow,
      id: `wf-${Date.now()}`,
      name: `${workflow.name} (نسخة)`,
      enabled: false
    };
    setWorkflows([...workflows, newWf]);
    toast.success('تم نسخ المسار');
  };

  const runWorkflow = (workflow) => {
    toast.success(`جاري تشغيل "${workflow.name}"...`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-purple-400" />
            محرر مسارات الأتمتة (Workflows)
          </h3>
          <p className="text-slate-400 text-sm">إنشاء مسارات أتمتة معقدة متعددة الخطوات</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 ml-2" />
          مسار جديد
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Workflows List */}
        <div className="space-y-3">
          <h4 className="text-white font-medium text-sm">المسارات المحفوظة</h4>
          {workflows.map(workflow => (
            <Card 
              key={workflow.id}
              className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 cursor-pointer transition-all ${
                selectedWorkflow?.id === workflow.id ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => setSelectedWorkflow(workflow)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="text-white font-medium">{workflow.name}</h5>
                    <p className="text-slate-400 text-xs">{workflow.description}</p>
                  </div>
                  <Switch
                    checked={workflow.enabled}
                    onCheckedChange={() => toggleWorkflow(workflow.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <Badge className="bg-slate-700 text-slate-300 text-xs">
                    {workflow.nodes.length} خطوة
                  </Badge>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); runWorkflow(workflow); }}>
                      <Play className="w-3 h-3 text-green-400" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); duplicateWorkflow(workflow); }}>
                      <Copy className="w-3 h-3 text-slate-400" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); deleteWorkflow(workflow.id); }}>
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Visual Editor */}
        <div className="lg:col-span-2">
          {selectedWorkflow ? (
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm">{selectedWorkflow.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-slate-600" onClick={() => setShowNodePicker(true)}>
                      <Plus className="w-3 h-3 ml-1" />
                      إضافة خطوة
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => runWorkflow(selectedWorkflow)}>
                      <Play className="w-3 h-3 ml-1" />
                      تشغيل
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Flow Canvas */}
                <div className="relative min-h-[400px] bg-slate-900/50 rounded-lg p-4 overflow-auto">
                  {selectedWorkflow.nodes.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <GitBranch className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">اسحب وأفلت العناصر لبناء المسار</p>
                        <Button size="sm" className="mt-3 bg-purple-600" onClick={() => setShowNodePicker(true)}>
                          <Plus className="w-3 h-3 ml-1" />
                          إضافة خطوة
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <DragDropContext onDragEnd={(result) => {
                      if (!result.destination) return;
                      const items = Array.from(selectedWorkflow.nodes);
                      const [reorderedItem] = items.splice(result.source.index, 1);
                      items.splice(result.destination.index, 0, reorderedItem);
                      const updated = { ...selectedWorkflow, nodes: items };
                      setSelectedWorkflow(updated);
                      setWorkflows(workflows.map(w => w.id === updated.id ? updated : w));
                    }}>
                      <Droppable droppableId="workflow-nodes">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                            {selectedWorkflow.nodes.map((node, index) => {
                              const nodeType = nodeTypes[node.type];
                              const Icon = nodeType?.icon || Circle;
                              const connection = selectedWorkflow.connections.find(c => c.to === node.id);
                              
                              return (
                                <Draggable key={node.id} draggableId={node.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                    >
                                      {/* Connection Line */}
                                      {index > 0 && (
                                        <div className="flex justify-center py-2">
                                          <div className="flex flex-col items-center">
                                            <div className="w-0.5 h-6 bg-slate-600" />
                                            <ArrowDown className="w-4 h-4 text-slate-500" />
                                            {connection?.condition && (
                                              <Badge className="bg-purple-500/20 text-purple-400 text-[10px] mt-1">
                                                {connection.condition}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Node */}
                                      <motion.div
                                        layout
                                        className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                          snapshot.isDragging 
                                            ? 'border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/20'
                                            : editingNode?.id === node.id 
                                              ? `border-${nodeType?.color || 'slate'}-500 bg-${nodeType?.color || 'slate'}-500/20`
                                              : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                                        }`}
                                        onClick={() => setEditingNode(node)}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                            <GripVertical className="w-4 h-4 text-slate-500" />
                                          </div>
                                          <div className={`p-2 rounded-lg bg-${nodeType?.color || 'slate'}-500/20`}>
                                            <Icon className={`w-5 h-5 text-${nodeType?.color || 'slate'}-400`} />
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-white font-medium text-sm">{nodeType?.label}</p>
                                            <p className="text-slate-400 text-xs">
                                              {node.config.trigger || node.config.action || node.config.type || node.config.iftttService || 'غير محدد'}
                                            </p>
                                          </div>
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-red-400"
                                            onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>

                                        {/* Condition branches */}
                                        {node.type === 'condition' && (
                                          <div className="flex justify-center gap-8 mt-4 pt-3 border-t border-slate-700">
                                            <Badge className="bg-green-500/20 text-green-400 text-xs">✓ صحيح</Badge>
                                            <Badge className="bg-red-500/20 text-red-400 text-xs">✗ خطأ</Badge>
                                          </div>
                                        )}

                                        {/* Switch branches */}
                                        {node.type === 'switch' && node.config.cases && (
                                          <div className="flex flex-wrap justify-center gap-2 mt-4 pt-3 border-t border-slate-700">
                                            {node.config.cases.map((c, i) => (
                                              <Badge key={i} className="bg-violet-500/20 text-violet-400 text-xs">{c}</Badge>
                                            ))}
                                          </div>
                                        )}

                                        {/* Parallel indicator */}
                                        {node.type === 'parallel' && (
                                          <div className="flex justify-center gap-2 mt-4 pt-3 border-t border-slate-700">
                                            {Array.from({ length: node.config.parallelCount || 2 }).map((_, i) => (
                                              <div key={i} className="w-8 h-1 bg-teal-500/50 rounded" />
                                            ))}
                                          </div>
                                        )}

                                        {/* Human input options */}
                                        {node.type === 'input' && node.config.options && (
                                          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-700">
                                            {node.config.options.map((opt, i) => (
                                              <Badge key={i} className="bg-pink-500/20 text-pink-400 text-xs">{opt}</Badge>
                                            ))}
                                          </div>
                                        )}

                                        {/* IFTTT indicator */}
                                        {node.type === 'ifttt' && (
                                          <div className="mt-3 pt-3 border-t border-slate-700">
                                            <Badge className="bg-red-500/20 text-red-400 text-xs">
                                              IFTTT: {node.config.eventName || 'غير محدد'}
                                            </Badge>
                                          </div>
                                        )}

                                        {/* Device Response indicator */}
                                        {node.type === 'deviceResponse' && (
                                          <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-400">
                                            انتظار: {node.config.expectedResponse || 'أي استجابة'} من {node.config.sourceDevice || 'جهاز'}
                                          </div>
                                        )}
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
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 h-full min-h-[400px] flex items-center justify-center">
              <CardContent className="text-center">
                <GitBranch className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">اختر مسار أتمتة للتعديل أو أنشئ مسار جديد</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Node Picker Dialog */}
      <Dialog open={showNodePicker} onOpenChange={setShowNodePicker}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">إضافة خطوة جديدة</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {Object.entries(nodeTypes).map(([key, type]) => {
              const Icon = type.icon;
              return (
                <button
                  key={key}
                  onClick={() => addNode(key)}
                  className={`p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-${type.color}-500/50 transition-all text-right`}
                >
                  <div className={`p-2 rounded-lg bg-${type.color}-500/20 w-fit mb-2`}>
                    <Icon className={`w-5 h-5 text-${type.color}-400`} />
                  </div>
                  <p className="text-white font-medium text-sm">{type.label}</p>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Node Config Dialog */}
      <Dialog open={!!editingNode} onOpenChange={() => setEditingNode(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">تعديل الخطوة</DialogTitle>
          </DialogHeader>
          {editingNode && (
            <div className="space-y-4 mt-4">
              {editingNode.type === 'trigger' && (
                <>
                  <div>
                    <Label className="text-slate-300">نوع المُشغِّل</Label>
                    <Select
                      value={editingNode.config.trigger || ''}
                      onValueChange={(v) => updateNode(editingNode.id, { trigger: v })}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                        <SelectValue placeholder="اختر المُشغِّل" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {triggerOptions.map(opt => (
                          <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {editingNode.config.trigger === 'device_response' && (
                    <div>
                      <Label className="text-slate-300">الجهاز المصدر</Label>
                      <Input
                        value={editingNode.config.sourceDevice || ''}
                        onChange={(e) => updateNode(editingNode.id, { sourceDevice: e.target.value })}
                        className="bg-slate-800/50 border-slate-700 text-white mt-1"
                        placeholder="معرف الجهاز"
                      />
                    </div>
                  )}
                </>
              )}

              {editingNode.type === 'action' && (
                <>
                  <div>
                    <Label className="text-slate-300">نوع الإجراء</Label>
                    <Select
                      value={editingNode.config.action || ''}
                      onValueChange={(v) => updateNode(editingNode.id, { action: v })}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                        <SelectValue placeholder="اختر الإجراء" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {actionOptions.map(opt => (
                          <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {editingNode.type === 'condition' && (
                <>
                  <div>
                    <Label className="text-slate-300">نوع الشرط</Label>
                    <Select
                      value={editingNode.config.conditionType || ''}
                      onValueChange={(v) => updateNode(editingNode.id, { conditionType: v })}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                        <SelectValue placeholder="اختر نوع الشرط" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="device_state">حالة جهاز</SelectItem>
                        <SelectItem value="time">الوقت</SelectItem>
                        <SelectItem value="variable">متغير</SelectItem>
                        <SelectItem value="expression">تعبير مخصص</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {editingNode.type === 'input' && (
                <>
                  <div>
                    <Label className="text-slate-300">رسالة الإدخال</Label>
                    <Textarea
                      value={editingNode.config.prompt || ''}
                      onChange={(e) => updateNode(editingNode.id, { prompt: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                      placeholder="أدخل السؤال للمستخدم"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">مهلة الانتظار (ثواني)</Label>
                    <Input
                      type="number"
                      value={editingNode.config.timeout || 60}
                      onChange={(e) => updateNode(editingNode.id, { timeout: parseInt(e.target.value) })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">خيارات الإجابة (مفصولة بفواصل)</Label>
                    <Input
                      value={(editingNode.config.options || []).join(', ')}
                      onChange={(e) => updateNode(editingNode.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                      placeholder="نعم, لا, لاحقاً"
                    />
                  </div>
                </>
              )}

              {editingNode.type === 'delay' && (
                <div>
                  <Label className="text-slate-300">مدة التأخير (ثواني)</Label>
                  <Input
                    type="number"
                    value={editingNode.config.delay || 0}
                    onChange={(e) => updateNode(editingNode.id, { delay: parseInt(e.target.value) })}
                    className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  />
                </div>
              )}

              {editingNode.type === 'ifttt' && (
                <>
                  <div>
                    <Label className="text-slate-300">خدمة IFTTT</Label>
                    <Select
                      value={editingNode.config.iftttService || ''}
                      onValueChange={(v) => updateNode(editingNode.id, { iftttService: v })}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                        <SelectValue placeholder="اختر الخدمة" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {iftttServices.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-300">مفتاح Webhook</Label>
                    <Input
                      value={editingNode.config.webhookKey || ''}
                      onChange={(e) => updateNode(editingNode.id, { webhookKey: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                      placeholder="IFTTT Webhook Key"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">اسم الحدث</Label>
                    <Input
                      value={editingNode.config.eventName || ''}
                      onChange={(e) => updateNode(editingNode.id, { eventName: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                      placeholder="event_name"
                    />
                  </div>
                </>
              )}

              {editingNode.type === 'deviceResponse' && (
                <>
                  <div>
                    <Label className="text-slate-300">الجهاز المصدر</Label>
                    <Input
                      value={editingNode.config.sourceDevice || ''}
                      onChange={(e) => updateNode(editingNode.id, { sourceDevice: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                      placeholder="معرف الجهاز"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">الاستجابة المتوقعة</Label>
                    <Select
                      value={editingNode.config.expectedResponse || ''}
                      onValueChange={(v) => updateNode(editingNode.id, { expectedResponse: v })}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                        <SelectValue placeholder="اختر الاستجابة" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="on">تشغيل</SelectItem>
                        <SelectItem value="off">إيقاف</SelectItem>
                        <SelectItem value="open">مفتوح</SelectItem>
                        <SelectItem value="closed">مغلق</SelectItem>
                        <SelectItem value="motion">حركة</SelectItem>
                        <SelectItem value="no_motion">لا حركة</SelectItem>
                        <SelectItem value="any">أي استجابة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-300">مهلة الانتظار (ثواني)</Label>
                    <Input
                      type="number"
                      value={editingNode.config.responseTimeout || 30}
                      onChange={(e) => updateNode(editingNode.id, { responseTimeout: parseInt(e.target.value) })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    />
                  </div>
                </>
              )}

              {editingNode.type === 'parallel' && (
                <div>
                  <Label className="text-slate-300">عدد المسارات المتوازية</Label>
                  <Input
                    type="number"
                    value={editingNode.config.parallelCount || 2}
                    onChange={(e) => updateNode(editingNode.id, { parallelCount: parseInt(e.target.value) })}
                    className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    min={2}
                    max={5}
                  />
                  <p className="text-slate-500 text-xs mt-1">تنفيذ عدة إجراءات في نفس الوقت</p>
                </div>
              )}

              {editingNode.type === 'switch' && (
                <>
                  <div>
                    <Label className="text-slate-300">المتغير للتبديل</Label>
                    <Input
                      value={editingNode.config.switchVariable || ''}
                      onChange={(e) => updateNode(editingNode.id, { switchVariable: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                      placeholder="اسم المتغير"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">الحالات (مفصولة بفواصل)</Label>
                    <Input
                      value={(editingNode.config.cases || []).join(', ')}
                      onChange={(e) => updateNode(editingNode.id, { cases: e.target.value.split(',').map(s => s.trim()) })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                      placeholder="حالة1, حالة2, حالة3"
                    />
                  </div>
                </>
              )}

              <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => setEditingNode(null)}>
                <Check className="w-4 h-4 ml-2" />
                حفظ
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Workflow Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">إنشاء مسار أتمتة جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">اسم المسار</Label>
              <Input
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="مثال: أتمتة الإضاءة"
              />
            </div>
            <div>
              <Label className="text-slate-300">الوصف</Label>
              <Textarea
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="وصف مختصر للمسار"
              />
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={createWorkflow}>
              <Plus className="w-4 h-4 ml-2" />
              إنشاء المسار
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}