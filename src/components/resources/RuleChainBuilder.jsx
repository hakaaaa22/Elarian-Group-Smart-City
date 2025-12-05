import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch, Plus, Play, Pause, Trash2, Edit, Copy, Check, X,
  AlertTriangle, Bell, Mail, MessageSquare, Zap, Shield, Settings,
  ChevronRight, ArrowRight, Filter, Clock, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const TRIGGER_TYPES = [
  { id: 'alert', name: 'تنبيه', icon: AlertTriangle, color: 'red' },
  { id: 'threshold', name: 'تجاوز حد', icon: Target, color: 'amber' },
  { id: 'schedule', name: 'جدولة', icon: Clock, color: 'blue' },
  { id: 'event', name: 'حدث', icon: Zap, color: 'purple' },
];

const ACTION_TYPES = [
  { id: 'notification', name: 'إرسال إشعار', icon: Bell, color: 'cyan' },
  { id: 'email', name: 'بريد إلكتروني', icon: Mail, color: 'green' },
  { id: 'sms', name: 'رسالة SMS', icon: MessageSquare, color: 'amber' },
  { id: 'block', name: 'حظر/إيقاف', icon: Shield, color: 'red' },
  { id: 'automation', name: 'أتمتة', icon: Settings, color: 'purple' },
];

const mockRuleChains = [
  {
    id: 1,
    name: 'تنبيه الأمان الحرج',
    description: 'عند اكتشاف تهديد أمني، إرسال إشعارات فورية',
    active: true,
    trigger: { type: 'alert', condition: 'severity === "critical"', category: 'security' },
    actions: [
      { type: 'notification', target: 'security_team', message: 'تنبيه أمني حرج!' },
      { type: 'email', target: 'admin@company.com' },
    ],
    executions: 45,
    lastExecuted: '2024-12-04 09:30'
  },
  {
    id: 2,
    name: 'صيانة تلقائية',
    description: 'عند انخفاض أداء الجهاز، جدولة صيانة',
    active: true,
    trigger: { type: 'threshold', condition: 'performance < 70', category: 'maintenance' },
    actions: [
      { type: 'notification', target: 'maintenance_team' },
      { type: 'automation', action: 'schedule_maintenance' },
    ],
    executions: 23,
    lastExecuted: '2024-12-04 08:15'
  },
  {
    id: 3,
    name: 'تقرير يومي',
    description: 'إرسال تقرير ملخص يومي للإدارة',
    active: false,
    trigger: { type: 'schedule', time: '08:00', days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'] },
    actions: [
      { type: 'email', target: 'management@company.com', template: 'daily_report' },
    ],
    executions: 120,
    lastExecuted: '2024-12-03 08:00'
  },
];

export default function RuleChainBuilder() {
  const [rules, setRules] = useState(mockRuleChains);
  const [showNewRule, setShowNewRule] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    trigger: { type: 'alert', condition: '', category: '' },
    actions: [],
  });

  const toggleRule = (ruleId) => {
    setRules(rules.map(r => r.id === ruleId ? { ...r, active: !r.active } : r));
    toast.success('تم تحديث حالة القاعدة');
  };

  const deleteRule = (ruleId) => {
    setRules(rules.filter(r => r.id !== ruleId));
    toast.success('تم حذف القاعدة');
  };

  const duplicateRule = (rule) => {
    const newR = { ...rule, id: Date.now(), name: `${rule.name} (نسخة)`, executions: 0 };
    setRules([...rules, newR]);
    toast.success('تم نسخ القاعدة');
  };

  const addAction = () => {
    setNewRule({
      ...newRule,
      actions: [...newRule.actions, { type: 'notification', target: '' }]
    });
  };

  const createRule = () => {
    const rule = {
      ...newRule,
      id: Date.now(),
      active: true,
      executions: 0,
      lastExecuted: null
    };
    setRules([rule, ...rules]);
    setShowNewRule(false);
    setNewRule({ name: '', description: '', trigger: { type: 'alert', condition: '', category: '' }, actions: [] });
    toast.success('تم إنشاء القاعدة بنجاح');
  };

  const stats = {
    total: rules.length,
    active: rules.filter(r => r.active).length,
    executions: rules.reduce((acc, r) => acc + r.executions, 0),
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
            <GitBranch className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">سلاسل القواعد</h3>
            <p className="text-slate-400 text-xs">إنشاء قواعد أتمتة للإجراءات التلقائية</p>
          </div>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowNewRule(true)}>
          <Plus className="w-4 h-4 ml-2" />
          قاعدة جديدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'إجمالي القواعد', value: stats.total, color: 'cyan' },
          { label: 'قواعد نشطة', value: stats.active, color: 'green' },
          { label: 'عمليات التنفيذ', value: stats.executions, color: 'purple' },
        ].map((stat, i) => (
          <Card key={i} className={`bg-${stat.color}-500/10 border-${stat.color}-500/30`}>
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
              <p className="text-slate-400 text-xs">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((rule, i) => {
          const triggerType = TRIGGER_TYPES.find(t => t.id === rule.trigger.type);
          const TriggerIcon = triggerType?.icon || AlertTriangle;

          return (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`${rule.active ? 'bg-slate-800/30' : 'bg-slate-900/30'} border-slate-700/50`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${rule.active ? `bg-${triggerType?.color}-500/20` : 'bg-slate-700'}`}>
                        <TriggerIcon className={`w-5 h-5 ${rule.active ? `text-${triggerType?.color}-400` : 'text-slate-500'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${rule.active ? 'text-white' : 'text-slate-500'}`}>{rule.name}</h4>
                          <Badge className={rule.active ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}>
                            {rule.active ? 'نشط' : 'متوقف'}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm">{rule.description}</p>
                        
                        {/* Rule Flow */}
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <Badge variant="outline" className={`border-${triggerType?.color}-500/50 text-${triggerType?.color}-400`}>
                            <TriggerIcon className="w-3 h-3 ml-1" />
                            {triggerType?.name}
                          </Badge>
                          <ArrowRight className="w-4 h-4 text-slate-600" />
                          {rule.actions.map((action, idx) => {
                            const actionType = ACTION_TYPES.find(a => a.id === action.type);
                            const ActionIcon = actionType?.icon || Zap;
                            return (
                              <React.Fragment key={idx}>
                                <Badge variant="outline" className={`border-${actionType?.color}-500/50 text-${actionType?.color}-400`}>
                                  <ActionIcon className="w-3 h-3 ml-1" />
                                  {actionType?.name}
                                </Badge>
                                {idx < rule.actions.length - 1 && <ChevronRight className="w-3 h-3 text-slate-600" />}
                              </React.Fragment>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span>التنفيذات: {rule.executions}</span>
                          {rule.lastExecuted && <span>آخر تنفيذ: {rule.lastExecuted}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch checked={rule.active} onCheckedChange={() => toggleRule(rule.id)} />
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => duplicateRule(rule)}>
                        <Copy className="w-4 h-4 text-slate-400" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setSelectedRule(rule)}>
                        <Edit className="w-4 h-4 text-slate-400" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => deleteRule(rule.id)}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* New Rule Dialog */}
      <Dialog open={showNewRule} onOpenChange={setShowNewRule}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-purple-400" />
              إنشاء قاعدة جديدة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-slate-300">اسم القاعدة</Label>
                <Input
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  placeholder="مثال: تنبيه الصيانة التلقائي"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-slate-300">الوصف</Label>
                <Input
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  placeholder="وصف مختصر للقاعدة"
                />
              </div>
            </div>

            {/* Trigger */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <h4 className="text-amber-400 font-medium mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                المحفز (Trigger)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300">نوع المحفز</Label>
                  <Select
                    value={newRule.trigger.type}
                    onValueChange={(v) => setNewRule({ ...newRule, trigger: { ...newRule.trigger, type: v } })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {TRIGGER_TYPES.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">الشرط</Label>
                  <Input
                    value={newRule.trigger.condition}
                    onChange={(e) => setNewRule({ ...newRule, trigger: { ...newRule.trigger, condition: e.target.value } })}
                    className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    placeholder="severity === 'critical'"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-cyan-400 font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  الإجراءات (Actions)
                </h4>
                <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-400" onClick={addAction}>
                  <Plus className="w-4 h-4 ml-1" />
                  إضافة إجراء
                </Button>
              </div>
              <div className="space-y-2">
                {newRule.actions.map((action, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                    <Select
                      value={action.type}
                      onValueChange={(v) => {
                        const actions = [...newRule.actions];
                        actions[idx].type = v;
                        setNewRule({ ...newRule, actions });
                      }}
                    >
                      <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {ACTION_TYPES.map(a => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={action.target}
                      onChange={(e) => {
                        const actions = [...newRule.actions];
                        actions[idx].target = e.target.value;
                        setNewRule({ ...newRule, actions });
                      }}
                      className="flex-1 bg-slate-800 border-slate-700 text-white"
                      placeholder="الهدف"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setNewRule({ ...newRule, actions: newRule.actions.filter((_, i) => i !== idx) })}
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                ))}
                {newRule.actions.length === 0 && (
                  <p className="text-slate-500 text-center py-2">لا توجد إجراءات - أضف إجراء</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={createRule}>
                <Check className="w-4 h-4 ml-2" />
                إنشاء القاعدة
              </Button>
              <Button variant="outline" className="border-slate-600" onClick={() => setShowNewRule(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}