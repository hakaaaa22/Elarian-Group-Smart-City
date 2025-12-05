import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Sparkles, Plus, Play, Pause, Edit, Trash2, Copy, Settings, Mic,
  Sun, Moon, Tv, Coffee, Bed, Home, Lightbulb, Thermometer, Lock,
  Volume2, Eye, Clock, Zap, Check, X, ChevronDown, Filter, Battery,
  Wifi, WifiOff, RefreshCw, Activity, Loader2, Brain, AlertTriangle
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
import { toast } from 'sonner';

const sceneIcons = { sun: Sun, moon: Moon, tv: Tv, coffee: Coffee, bed: Bed, home: Home, sparkles: Sparkles };
const sceneColors = ['amber', 'purple', 'cyan', 'green', 'red', 'pink', 'indigo', 'blue'];

const mockScenes = [
  {
    id: 1, name: 'صباح الخير', icon: 'sun', color: 'amber', enabled: true,
    voiceCommands: ['صباح الخير', 'وقت الاستيقاظ'],
    actions: [
      { device: 'الستائر الذكية', action: 'فتح', value: 100, room: 'غرفة النوم' },
      { device: 'الإضاءة', action: 'تشغيل', value: 50, room: 'غرفة النوم' },
      { device: 'المكيف', action: 'ضبط', value: 23, room: 'غرفة النوم' },
      { device: 'آلة القهوة', action: 'تشغيل', value: null, room: 'المطبخ' }
    ]
  },
  {
    id: 2, name: 'وضع السينما', icon: 'tv', color: 'purple', enabled: true,
    voiceCommands: ['وقت الفيلم', 'وضع السينما'],
    actions: [
      { device: 'الإضاءة', action: 'تخفيض', value: 10, room: 'غرفة المعيشة' },
      { device: 'الستائر', action: 'إغلاق', value: 0, room: 'غرفة المعيشة' },
      { device: 'التلفاز', action: 'تشغيل', value: null, room: 'غرفة المعيشة' },
      { device: 'السماعات', action: 'وضع السينما', value: null, room: 'غرفة المعيشة' }
    ]
  },
  {
    id: 3, name: 'تصبح على خير', icon: 'moon', color: 'indigo', enabled: true,
    voiceCommands: ['تصبح على خير', 'وقت النوم'],
    actions: [
      { device: 'جميع الأضواء', action: 'إطفاء', value: 0, room: 'الكل' },
      { device: 'الأبواب', action: 'قفل', value: null, room: 'الكل' },
      { device: 'المكيف', action: 'ضبط', value: 21, room: 'غرفة النوم' },
      { device: 'كاميرات الأمان', action: 'تفعيل', value: null, room: 'خارجي' }
    ]
  },
  {
    id: 4, name: 'مغادرة المنزل', icon: 'home', color: 'red', enabled: true,
    voiceCommands: ['مغادرة', 'سأخرج'],
    actions: [
      { device: 'جميع الأجهزة', action: 'إطفاء', value: 0, room: 'الكل' },
      { device: 'الأبواب', action: 'قفل', value: null, room: 'الكل' },
      { device: 'نظام الإنذار', action: 'تفعيل', value: null, room: 'الكل' }
    ]
  }
];

const mockDeviceGroups = [
  { id: 1, name: 'إضاءة غرفة المعيشة', devices: ['المصباح الرئيسي', 'مصباح الزاوية', 'شريط LED'], room: 'غرفة المعيشة', type: 'lighting', color: 'amber', isDynamic: false },
  { id: 2, name: 'أجهزة التكييف', devices: ['مكيف غرفة المعيشة', 'مكيف غرفة النوم', 'مكيف المكتب'], room: 'متعدد', type: 'climate', color: 'cyan', isDynamic: false },
  { id: 3, name: 'أقفال المنزل', devices: ['قفل الباب الرئيسي', 'قفل باب الحديقة', 'قفل المرآب'], room: 'متعدد', type: 'security', color: 'green', isDynamic: false }
];

// Dynamic group filters
const dynamicGroupFilters = [
  { id: 'offline', name: 'أجهزة غير متصلة', icon: WifiOff, color: 'red', filter: (d) => d.status === 'offline' },
  { id: 'low_battery', name: 'بطارية أقل من 50%', icon: Battery, color: 'amber', filter: (d) => d.battery !== null && d.battery < 50 },
  { id: 'online', name: 'أجهزة متصلة', icon: Wifi, color: 'green', filter: (d) => d.status === 'online' },
  { id: 'lights', name: 'جميع الإضاءات', icon: Lightbulb, color: 'yellow', filter: (d) => d.category === 'lighting' || d.type === 'light' },
  { id: 'climate', name: 'أجهزة التكييف', icon: Thermometer, color: 'cyan', filter: (d) => d.category === 'climate' },
  { id: 'security', name: 'أجهزة الأمان', icon: Lock, color: 'purple', filter: (d) => d.category === 'security' }
];

const availableDevices = [
  { id: 'd1', name: 'المصباح الرئيسي', type: 'light', room: 'غرفة المعيشة' },
  { id: 'd2', name: 'مكيف غرفة المعيشة', type: 'climate', room: 'غرفة المعيشة' },
  { id: 'd3', name: 'التلفاز', type: 'entertainment', room: 'غرفة المعيشة' },
  { id: 'd4', name: 'الستائر الذكية', type: 'blinds', room: 'غرفة المعيشة' },
  { id: 'd5', name: 'قفل الباب', type: 'lock', room: 'المدخل' },
  { id: 'd6', name: 'كاميرا المدخل', type: 'camera', room: 'المدخل' }
];

export default function SceneManager({ onSceneActivate, devices = [] }) {
  const [scenes, setScenes] = useState(mockScenes);
  const [deviceGroups, setDeviceGroups] = useState(mockDeviceGroups);
  const [showSceneDialog, setShowSceneDialog] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [showDynamicGroupDialog, setShowDynamicGroupDialog] = useState(false);
  const [showBulkActionsDialog, setShowBulkActionsDialog] = useState(false);
  const [editingScene, setEditingScene] = useState(null);
  const [selectedDynamicGroup, setSelectedDynamicGroup] = useState(null);
  const [newScene, setNewScene] = useState({ name: '', icon: 'sparkles', color: 'cyan', voiceCommands: [], actions: [] });
  const [newGroup, setNewGroup] = useState({ name: '', devices: [], type: 'lighting', color: 'amber', isDynamic: false, dynamicFilter: null });
  const [newAction, setNewAction] = useState({ device: '', action: '', value: 0, room: '' });
  const [runningBulkAction, setRunningBulkAction] = useState(false);

  // Dynamic groups based on device status
  const dynamicGroups = useMemo(() => {
    return dynamicGroupFilters.map(filter => ({
      ...filter,
      devices: devices.filter(filter.filter),
      count: devices.filter(filter.filter).length
    }));
  }, [devices]);

  // Bulk actions for dynamic groups
  const bulkActionsMutation = useMutation({
    mutationFn: async ({ action, groupDevices }) => {
      setRunningBulkAction(true);
      await new Promise(r => setTimeout(r, 1500)); // Simulate action
      return { success: true, affected: groupDevices.length };
    },
    onSuccess: (data) => {
      setRunningBulkAction(false);
      toast.success(`تم تنفيذ الإجراء على ${data.affected} جهاز`);
      setShowBulkActionsDialog(false);
    },
    onError: () => {
      setRunningBulkAction(false);
      toast.error('فشل تنفيذ الإجراء');
    }
  });

  const runBulkAction = (action) => {
    if (!selectedDynamicGroup) return;
    bulkActionsMutation.mutate({ action, groupDevices: selectedDynamicGroup.devices });
  };

  const activateScene = (scene) => {
    toast.success(`جاري تنفيذ "${scene.name}"...`);
    onSceneActivate?.(scene);
  };

  const createScene = () => {
    if (!newScene.name) {
      toast.error('يرجى إدخال اسم المشهد');
      return;
    }
    const scene = { ...newScene, id: Date.now(), enabled: true };
    setScenes([...scenes, scene]);
    setShowSceneDialog(false);
    setNewScene({ name: '', icon: 'sparkles', color: 'cyan', voiceCommands: [], actions: [] });
    toast.success('تم إنشاء المشهد');
  };

  const addActionToScene = () => {
    if (!newAction.device) return;
    setNewScene({ ...newScene, actions: [...newScene.actions, { ...newAction }] });
    setNewAction({ device: '', action: '', value: 0, room: '' });
  };

  const createGroup = () => {
    if (!newGroup.name || newGroup.devices.length === 0) {
      toast.error('يرجى إدخال اسم المجموعة واختيار الأجهزة');
      return;
    }
    setDeviceGroups([...deviceGroups, { ...newGroup, id: Date.now() }]);
    setShowGroupDialog(false);
    setNewGroup({ name: '', devices: [], type: 'lighting', color: 'amber' });
    toast.success('تم إنشاء المجموعة');
  };

  const toggleScene = (sceneId) => {
    setScenes(scenes.map(s => s.id === sceneId ? { ...s, enabled: !s.enabled } : s));
  };

  const deleteScene = (sceneId) => {
    setScenes(scenes.filter(s => s.id !== sceneId));
    toast.success('تم حذف المشهد');
  };

  const duplicateScene = (scene) => {
    const newS = { ...scene, id: Date.now(), name: `${scene.name} (نسخة)` };
    setScenes([...scenes, newS]);
    toast.success('تم نسخ المشهد');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            المشاهد والمجموعات
          </h3>
          <p className="text-slate-400 text-sm">تحكم بمجموعة أجهزة بأمر واحد</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-600" onClick={() => setShowGroupDialog(true)}>
            <Plus className="w-4 h-4 ml-2" />
            مجموعة جديدة
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowSceneDialog(true)}>
            <Plus className="w-4 h-4 ml-2" />
            مشهد جديد
          </Button>
        </div>
      </div>

      {/* Static Device Groups */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-medium">مجموعات الأجهزة الثابتة</h4>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {deviceGroups.map((group, i) => (
            <motion.div key={group.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-${group.color}-500/20`}>
                      {group.type === 'lighting' ? <Lightbulb className={`w-5 h-5 text-${group.color}-400`} /> :
                       group.type === 'climate' ? <Thermometer className={`w-5 h-5 text-${group.color}-400`} /> :
                       <Lock className={`w-5 h-5 text-${group.color}-400`} />}
                    </div>
                    <Badge className="bg-slate-700 text-slate-300 text-xs">{group.devices.length} أجهزة</Badge>
                  </div>
                  <h4 className="text-white font-medium mb-1">{group.name}</h4>
                  <p className="text-slate-400 text-xs mb-3">{group.room}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                      <Zap className="w-3 h-3 ml-1" />
                      تشغيل الكل
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-600">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dynamic Device Groups */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-purple-400" />
            <h4 className="text-white font-medium">مجموعات ديناميكية</h4>
          </div>
          <Badge className="bg-purple-500/20 text-purple-400 text-xs">تحديث تلقائي</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {dynamicGroups.map((group, i) => {
            const Icon = group.icon;
            return (
              <motion.div key={group.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Card 
                  className={`glass-card border-${group.color}-500/30 bg-${group.color}-500/5 cursor-pointer hover:border-${group.color}-500/60 transition-all`}
                  onClick={() => { setSelectedDynamicGroup(group); setShowBulkActionsDialog(true); }}
                >
                  <CardContent className="p-3 text-center">
                    <div className={`p-2 rounded-lg bg-${group.color}-500/20 w-fit mx-auto mb-2`}>
                      <Icon className={`w-5 h-5 text-${group.color}-400`} />
                    </div>
                    <p className={`text-2xl font-bold text-${group.color}-400`}>{group.count}</p>
                    <p className="text-slate-400 text-xs">{group.name}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Scenes */}
      <div>
        <h4 className="text-white font-medium mb-3">المشاهد</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenes.map((scene, i) => {
            const Icon = sceneIcons[scene.icon] || Sparkles;
            return (
              <motion.div key={scene.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={`glass-card border-${scene.color}-500/30 bg-${scene.color}-500/5 cursor-pointer hover:border-${scene.color}-500/60 transition-all ${!scene.enabled && 'opacity-50'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-xl bg-${scene.color}-500/20`}>
                        <Icon className={`w-6 h-6 text-${scene.color}-400`} />
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => duplicateScene(scene)}>
                          <Copy className="w-3 h-3 text-slate-400" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteScene(scene.id)}>
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                      </div>
                    </div>
                    <h4 className="text-white font-bold mb-1">{scene.name}</h4>
                    <p className="text-slate-400 text-xs mb-3">{scene.actions.length} إجراء</p>
                    {scene.voiceCommands.length > 0 && (
                      <div className="flex items-center gap-1 mb-3">
                        <Mic className="w-3 h-3 text-cyan-400" />
                        <span className="text-cyan-400 text-xs">"{scene.voiceCommands[0]}"</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <Switch checked={scene.enabled} onCheckedChange={() => toggleScene(scene.id)} />
                      <Button size="sm" className={`bg-${scene.color}-600 hover:bg-${scene.color}-700`} onClick={() => activateScene(scene)} disabled={!scene.enabled}>
                        <Play className="w-3 h-3 ml-1" />
                        تشغيل
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Create Scene Dialog */}
      <Dialog open={showSceneDialog} onOpenChange={setShowSceneDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">إنشاء مشهد جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">اسم المشهد</Label>
              <Input value={newScene.name} onChange={(e) => setNewScene({ ...newScene, name: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="مثال: وقت القهوة" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300">الأيقونة</Label>
                <Select value={newScene.icon} onValueChange={(v) => setNewScene({ ...newScene, icon: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.keys(sceneIcons).map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">اللون</Label>
                <div className="flex gap-2 mt-2">
                  {sceneColors.map(color => (
                    <button key={color} onClick={() => setNewScene({ ...newScene, color })} className={`w-6 h-6 rounded-full bg-${color}-500 ${newScene.color === color ? 'ring-2 ring-white' : ''}`} />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Label className="text-slate-300">الأوامر الصوتية</Label>
              <Input placeholder='مفصولة بفواصل: "صباح الخير, استيقاظ"' onChange={(e) => setNewScene({ ...newScene, voiceCommands: e.target.value.split(',').map(s => s.trim()) })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
            </div>
            
            <div>
              <Label className="text-slate-300 mb-2 block">الإجراءات ({newScene.actions.length})</Label>
              <div className="space-y-2 mb-3">
                {newScene.actions.map((action, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                    <span className="text-white text-sm">{action.device}: {action.action}</span>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setNewScene({ ...newScene, actions: newScene.actions.filter((_, j) => j !== i) })}>
                      <X className="w-3 h-3 text-red-400" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Select value={newAction.device} onValueChange={(v) => setNewAction({ ...newAction, device: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white text-xs"><SelectValue placeholder="الجهاز" /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {availableDevices.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={newAction.action} onValueChange={(v) => setNewAction({ ...newAction, action: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white text-xs"><SelectValue placeholder="الإجراء" /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="تشغيل">تشغيل</SelectItem>
                    <SelectItem value="إيقاف">إيقاف</SelectItem>
                    <SelectItem value="ضبط">ضبط</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={addActionToScene}><Plus className="w-3 h-3" /></Button>
              </div>
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={createScene}>
              <Sparkles className="w-4 h-4 ml-2" />
              إنشاء المشهد
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Group Dialog */}
      <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">إنشاء مجموعة أجهزة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">اسم المجموعة</Label>
              <Input value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="مثال: إضاءة الصالة" />
            </div>
            <div>
              <Label className="text-slate-300">النوع</Label>
              <Select value={newGroup.type} onValueChange={(v) => setNewGroup({ ...newGroup, type: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="lighting">إضاءة</SelectItem>
                  <SelectItem value="climate">تكييف</SelectItem>
                  <SelectItem value="security">أمان</SelectItem>
                  <SelectItem value="entertainment">ترفيه</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">الأجهزة</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableDevices.map(device => (
                  <Badge key={device.id} variant="outline" className={`cursor-pointer ${newGroup.devices.includes(device.name) ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400' : 'border-slate-600 text-slate-400'}`}
                    onClick={() => {
                      const d = newGroup.devices.includes(device.name) ? newGroup.devices.filter(x => x !== device.name) : [...newGroup.devices, device.name];
                      setNewGroup({ ...newGroup, devices: d });
                    }}>
                    {device.name}
                  </Badge>
                ))}
              </div>
            </div>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={createGroup}>
              <Plus className="w-4 h-4 ml-2" />
              إنشاء المجموعة
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Dialog */}
      <Dialog open={showBulkActionsDialog} onOpenChange={setShowBulkActionsDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              إجراءات جماعية
            </DialogTitle>
          </DialogHeader>
          {selectedDynamicGroup && (
            <div className="space-y-4 mt-4">
              <div className={`p-4 bg-${selectedDynamicGroup.color}-500/10 border border-${selectedDynamicGroup.color}-500/30 rounded-lg`}>
                <div className="flex items-center gap-3 mb-2">
                  <selectedDynamicGroup.icon className={`w-6 h-6 text-${selectedDynamicGroup.color}-400`} />
                  <div>
                    <h4 className="text-white font-bold">{selectedDynamicGroup.name}</h4>
                    <p className="text-slate-400 text-xs">{selectedDynamicGroup.count} جهاز</p>
                  </div>
                </div>
                {selectedDynamicGroup.devices.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedDynamicGroup.devices.slice(0, 5).map((d, i) => (
                      <Badge key={i} variant="outline" className="border-slate-600 text-slate-300 text-xs">{d.name}</Badge>
                    ))}
                    {selectedDynamicGroup.devices.length > 5 && (
                      <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">+{selectedDynamicGroup.devices.length - 5}</Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-slate-300 text-sm font-medium">الإجراءات المتاحة:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                    onClick={() => runBulkAction('power_on')}
                    disabled={runningBulkAction}
                  >
                    {runningBulkAction ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Zap className="w-4 h-4 ml-2" />}
                    تشغيل الكل
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                    onClick={() => runBulkAction('power_off')}
                    disabled={runningBulkAction}
                  >
                    إيقاف الكل
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
                    onClick={() => runBulkAction('check_status')}
                    disabled={runningBulkAction}
                  >
                    <RefreshCw className="w-4 h-4 ml-2" />
                    فحص الحالة
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                    onClick={() => runBulkAction('diagnostics')}
                    disabled={runningBulkAction}
                  >
                    <Brain className="w-4 h-4 ml-2" />
                    تشخيص
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20 col-span-2"
                    onClick={() => runBulkAction('restart')}
                    disabled={runningBulkAction}
                  >
                    <RefreshCw className="w-4 h-4 ml-2" />
                    إعادة تشغيل الكل
                  </Button>
                </div>
              </div>

              {selectedDynamicGroup.id === 'low_battery' && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <p className="text-amber-300 text-sm font-medium">تنبيه البطارية</p>
                  </div>
                  <p className="text-slate-400 text-xs">هذه الأجهزة تحتاج لشحن أو استبدال البطارية قريباً</p>
                </div>
              )}

              {selectedDynamicGroup.id === 'offline' && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <WifiOff className="w-4 h-4 text-red-400" />
                    <p className="text-red-300 text-sm font-medium">أجهزة غير متصلة</p>
                  </div>
                  <p className="text-slate-400 text-xs">تحقق من اتصال الشبكة أو قم بإعادة تشغيل الأجهزة</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}