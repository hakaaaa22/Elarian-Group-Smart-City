import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Plus, Trash2, Edit2, Save, X, Eye, Building2, Heart, Shield,
  Camera, AlertTriangle, Settings, Zap, Check, Clock, Mail, MessageSquare,
  Smartphone, Volume2, Filter, Target, TrendingUp, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const moduleConfigs = {
  ai_vision: {
    name: 'AI Vision',
    icon: Eye,
    color: 'purple',
    metrics: [
      { id: 'weapon_detection', name: 'كشف الأسلحة', unit: '%', default: 85 },
      { id: 'intrusion_detection', name: 'كشف التسلل', unit: '%', default: 90 },
      { id: 'violence_detection', name: 'كشف العنف', unit: '%', default: 80 },
      { id: 'crowd_density', name: 'كثافة الحشود', unit: 'شخص', default: 100 },
      { id: 'suspicious_behavior', name: 'السلوك المشبوه', unit: '%', default: 75 },
      { id: 'face_match', name: 'تطابق الوجه', unit: '%', default: 95 },
    ]
  },
  municipality: {
    name: 'عمليات البلدية',
    icon: Building2,
    color: 'amber',
    metrics: [
      { id: 'bin_fill_level', name: 'امتلاء الحاوية', unit: '%', default: 80 },
      { id: 'street_light_fault', name: 'أعطال الإنارة', unit: 'عدد', default: 5 },
      { id: 'water_pressure', name: 'ضغط المياه', unit: 'bar', default: 2 },
      { id: 'road_damage', name: 'تلف الطرق', unit: 'مستوى', default: 3 },
      { id: 'collection_delay', name: 'تأخر الجمع', unit: 'ساعة', default: 2 },
    ]
  },
  hospital: {
    name: 'المستشفى الذكي',
    icon: Heart,
    color: 'pink',
    metrics: [
      { id: 'icu_occupancy', name: 'إشغال ICU', unit: '%', default: 90 },
      { id: 'er_wait_time', name: 'وقت انتظار الطوارئ', unit: 'دقيقة', default: 30 },
      { id: 'critical_patient', name: 'حالة حرجة', unit: 'عدد', default: 1 },
      { id: 'medication_stock', name: 'مخزون الأدوية', unit: '%', default: 20 },
      { id: 'bed_availability', name: 'الأسرة المتاحة', unit: '%', default: 10 },
      { id: 'vital_signs_alert', name: 'تنبيه العلامات الحيوية', unit: 'مستوى', default: 2 },
    ]
  }
};

const notificationChannels = [
  { id: 'push', name: 'إشعارات Push', icon: Smartphone, enabled: true },
  { id: 'email', name: 'البريد الإلكتروني', icon: Mail, enabled: true },
  { id: 'sms', name: 'رسائل SMS', icon: MessageSquare, enabled: false },
  { id: 'sound', name: 'تنبيه صوتي', icon: Volume2, enabled: true },
];

const defaultRules = [
  {
    id: 1,
    name: 'كشف سلاح - تنبيه فوري',
    module: 'ai_vision',
    metric: 'weapon_detection',
    condition: 'greater_than',
    threshold: 85,
    priority: 'critical',
    channels: ['push', 'email', 'sound'],
    enabled: true,
    createdAt: '2024-12-01'
  },
  {
    id: 2,
    name: 'امتلاء الحاويات',
    module: 'municipality',
    metric: 'bin_fill_level',
    condition: 'greater_than',
    threshold: 80,
    priority: 'high',
    channels: ['push'],
    enabled: true,
    createdAt: '2024-12-01'
  },
  {
    id: 3,
    name: 'إشغال ICU عالي',
    module: 'hospital',
    metric: 'icu_occupancy',
    condition: 'greater_than',
    threshold: 90,
    priority: 'critical',
    channels: ['push', 'email', 'sms', 'sound'],
    enabled: true,
    createdAt: '2024-12-02'
  }
];

export default function AdvancedAlertRules() {
  const [rules, setRules] = useState(defaultRules);
  const [channels, setChannels] = useState(notificationChannels);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [activeTab, setActiveTab] = useState('rules');

  const [newRule, setNewRule] = useState({
    name: '',
    module: 'ai_vision',
    metric: 'weapon_detection',
    condition: 'greater_than',
    threshold: 80,
    priority: 'high',
    channels: ['push'],
    enabled: true
  });

  const handleSaveRule = () => {
    if (!newRule.name) {
      toast.error('يرجى إدخال اسم القاعدة');
      return;
    }

    if (editingRule) {
      setRules(rules.map(r => r.id === editingRule.id ? { ...newRule, id: editingRule.id } : r));
      toast.success('تم تحديث القاعدة بنجاح');
    } else {
      setRules([...rules, { ...newRule, id: Date.now(), createdAt: new Date().toISOString().split('T')[0] }]);
      toast.success('تم إنشاء القاعدة بنجاح');
    }

    setShowRuleDialog(false);
    setEditingRule(null);
    setNewRule({
      name: '',
      module: 'ai_vision',
      metric: 'weapon_detection',
      condition: 'greater_than',
      threshold: 80,
      priority: 'high',
      channels: ['push'],
      enabled: true
    });
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setNewRule(rule);
    setShowRuleDialog(true);
  };

  const handleDeleteRule = (id) => {
    setRules(rules.filter(r => r.id !== id));
    toast.success('تم حذف القاعدة');
  };

  const toggleRuleEnabled = (id) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const toggleChannel = (channelId) => {
    setChannels(channels.map(c => c.id === channelId ? { ...c, enabled: !c.enabled } : c));
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'critical': return { label: 'حرج', color: 'red' };
      case 'high': return { label: 'عالي', color: 'amber' };
      case 'medium': return { label: 'متوسط', color: 'blue' };
      case 'low': return { label: 'منخفض', color: 'green' };
      default: return { label: priority, color: 'slate' };
    }
  };

  const moduleConfig = moduleConfigs[newRule.module];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-400" />
            قواعد التنبيه المتقدمة
          </h2>
          <p className="text-slate-400 text-sm">إعداد قواعد تنبيه مخصصة لجميع الوحدات</p>
        </div>
        <Button
          onClick={() => {
            setEditingRule(null);
            setNewRule({
              name: '',
              module: 'ai_vision',
              metric: 'weapon_detection',
              condition: 'greater_than',
              threshold: 80,
              priority: 'high',
              channels: ['push'],
              enabled: true
            });
            setShowRuleDialog(true);
          }}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          <Plus className="w-4 h-4 ml-2" />
          قاعدة جديدة
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="rules" className="data-[state=active]:bg-cyan-500/20">
            <Filter className="w-4 h-4 ml-1" />
            القواعد ({rules.length})
          </TabsTrigger>
          <TabsTrigger value="channels" className="data-[state=active]:bg-purple-500/20">
            <Smartphone className="w-4 h-4 ml-1" />
            قنوات الإشعار
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-green-500/20">
            <Activity className="w-4 h-4 ml-1" />
            الإحصائيات
          </TabsTrigger>
        </TabsList>

        {/* Rules Tab */}
        <TabsContent value="rules" className="mt-4 space-y-3">
          {rules.map((rule) => {
            const module = moduleConfigs[rule.module];
            const metric = module?.metrics.find(m => m.id === rule.metric);
            const priority = getPriorityConfig(rule.priority);

            return (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`glass-card border-${module?.color || 'slate'}-500/30 bg-[#0f1629]/80 ${!rule.enabled && 'opacity-50'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-${module?.color}-500/20`}>
                          {module && <module.icon className={`w-5 h-5 text-${module.color}-400`} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium">{rule.name}</p>
                            <Badge className={`bg-${priority.color}-500/20 text-${priority.color}-400`}>
                              {priority.label}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm mt-1">
                            {metric?.name || rule.metric} {rule.condition === 'greater_than' ? '>' : '<'} {rule.threshold} {metric?.unit}
                          </p>
                          <div className="flex gap-1 mt-2">
                            {rule.channels.map(ch => {
                              const channel = notificationChannels.find(c => c.id === ch);
                              return channel ? (
                                <Badge key={ch} className="bg-slate-700 text-slate-300 text-xs">
                                  <channel.icon className="w-3 h-3 ml-1" />
                                  {channel.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={() => toggleRuleEnabled(rule.id)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditRule(rule)}
                          className="text-slate-400 hover:text-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {channels.map((channel) => (
              <Card key={channel.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${channel.enabled ? 'bg-green-500/20' : 'bg-slate-700'}`}>
                        <channel.icon className={`w-5 h-5 ${channel.enabled ? 'text-green-400' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <p className="text-white font-medium">{channel.name}</p>
                        <p className="text-slate-500 text-sm">
                          {channel.enabled ? 'مفعّل' : 'معطّل'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={channel.enabled}
                      onCheckedChange={() => toggleChannel(channel.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-white">{rules.length}</p>
                <p className="text-cyan-400 text-sm">إجمالي القواعد</p>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-white">{rules.filter(r => r.enabled).length}</p>
                <p className="text-green-400 text-sm">قواعد نشطة</p>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-white">{rules.filter(r => r.priority === 'critical').length}</p>
                <p className="text-red-400 text-sm">قواعد حرجة</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Rule Dialog */}
      <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              {editingRule ? 'تعديل القاعدة' : 'قاعدة تنبيه جديدة'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-400">اسم القاعدة</Label>
              <Input
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                placeholder="مثال: تنبيه كشف سلاح"
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
              />
            </div>

            <div>
              <Label className="text-slate-400">الوحدة</Label>
              <Select
                value={newRule.module}
                onValueChange={(value) => {
                  setNewRule({
                    ...newRule,
                    module: value,
                    metric: moduleConfigs[value].metrics[0].id
                  });
                }}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.entries(moduleConfigs).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="text-white">
                      <div className="flex items-center gap-2">
                        <config.icon className={`w-4 h-4 text-${config.color}-400`} />
                        {config.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-400">المقياس</Label>
              <Select
                value={newRule.metric}
                onValueChange={(value) => setNewRule({ ...newRule, metric: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {moduleConfig?.metrics.map((metric) => (
                    <SelectItem key={metric.id} value={metric.id} className="text-white">
                      {metric.name} ({metric.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-400">الحد ({moduleConfig?.metrics.find(m => m.id === newRule.metric)?.unit})</Label>
              <div className="flex items-center gap-4 mt-2">
                <Select
                  value={newRule.condition}
                  onValueChange={(value) => setNewRule({ ...newRule, condition: value })}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="greater_than" className="text-white">أكبر من</SelectItem>
                    <SelectItem value="less_than" className="text-white">أقل من</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={newRule.threshold}
                  onChange={(e) => setNewRule({ ...newRule, threshold: parseInt(e.target.value) })}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-400">الأولوية</Label>
              <Select
                value={newRule.priority}
                onValueChange={(value) => setNewRule({ ...newRule, priority: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="critical" className="text-red-400">حرج</SelectItem>
                  <SelectItem value="high" className="text-amber-400">عالي</SelectItem>
                  <SelectItem value="medium" className="text-blue-400">متوسط</SelectItem>
                  <SelectItem value="low" className="text-green-400">منخفض</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-400">قنوات الإشعار</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {notificationChannels.map((channel) => (
                  <Button
                    key={channel.id}
                    type="button"
                    variant={newRule.channels.includes(channel.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const channels = newRule.channels.includes(channel.id)
                        ? newRule.channels.filter(c => c !== channel.id)
                        : [...newRule.channels, channel.id];
                      setNewRule({ ...newRule, channels });
                    }}
                    className={newRule.channels.includes(channel.id) ? 'bg-cyan-600' : 'border-slate-600'}
                  >
                    <channel.icon className="w-4 h-4 ml-1" />
                    {channel.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowRuleDialog(false)} className="border-slate-600">
              إلغاء
            </Button>
            <Button onClick={handleSaveRule} className="bg-cyan-600 hover:bg-cyan-700">
              <Save className="w-4 h-4 ml-2" />
              حفظ القاعدة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}