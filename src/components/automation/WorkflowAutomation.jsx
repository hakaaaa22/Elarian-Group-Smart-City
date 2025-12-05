import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Bell, Package, Wrench, AlertTriangle, Check, Settings,
  Play, Pause, Clock, TrendingDown, RefreshCw, Mail, Smartphone,
  ChevronRight, ToggleLeft, ToggleRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// قواعد الأتمتة
const automationRules = [
  {
    id: 'auto_maintenance',
    name: 'إنشاء مهام صيانة تلقائية',
    description: 'إنشاء مهام صيانة عند تنبؤ AI بعطل محتمل',
    trigger: 'ai_prediction',
    action: 'create_maintenance',
    enabled: true,
    conditions: { probability: 70 },
    stats: { triggered: 15, lastTriggered: '2024-12-03' }
  },
  {
    id: 'auto_purchase',
    name: 'طلبات شراء تلقائية',
    description: 'إنشاء طلب شراء عند انخفاض المخزون',
    trigger: 'low_stock',
    action: 'create_purchase_order',
    enabled: true,
    conditions: { threshold: 'min_quantity' },
    stats: { triggered: 8, lastTriggered: '2024-12-04' }
  },
  {
    id: 'notify_assignment',
    name: 'إشعار تعيين المهام',
    description: 'إرسال إشعار للفني عند تعيين مهمة جديدة',
    trigger: 'task_assigned',
    action: 'send_notification',
    enabled: true,
    conditions: { channels: ['push', 'sms'] },
    stats: { triggered: 45, lastTriggered: '2024-12-04' }
  },
  {
    id: 'notify_status',
    name: 'إشعار تحديث الحالة',
    description: 'إعلام المشرف عند تغيير حالة المهمة',
    trigger: 'status_change',
    action: 'send_notification',
    enabled: true,
    conditions: { notifyManager: true },
    stats: { triggered: 32, lastTriggered: '2024-12-04' }
  },
  {
    id: 'auto_escalate',
    name: 'تصعيد المهام المتأخرة',
    description: 'تصعيد المهام غير المكتملة بعد فترة محددة',
    trigger: 'task_overdue',
    action: 'escalate',
    enabled: false,
    conditions: { hoursDelay: 24 },
    stats: { triggered: 3, lastTriggered: '2024-12-02' }
  }
];

// سجل الأتمتة
const automationLog = [
  { id: 1, rule: 'auto_maintenance', action: 'أنشئت مهمة صيانة لـ "مكيف غرفة المعيشة"', timestamp: '2024-12-04 10:30', status: 'success' },
  { id: 2, rule: 'auto_purchase', action: 'أنشئ طلب شراء "بطارية كاميرا" × 20', timestamp: '2024-12-04 09:15', status: 'success' },
  { id: 3, rule: 'notify_assignment', action: 'إشعار للفني "محمد أحمد" بمهمة جديدة', timestamp: '2024-12-04 08:45', status: 'success' },
  { id: 4, rule: 'notify_status', action: 'إشعار المشرف: مهمة #123 اكتملت', timestamp: '2024-12-04 08:20', status: 'success' },
  { id: 5, rule: 'auto_maintenance', action: 'أنشئت مهمة صيانة لـ "حساس حركة"', timestamp: '2024-12-03 16:00', status: 'success' },
];

export default function WorkflowAutomation({ onTriggerRule }) {
  const [rules, setRules] = useState(automationRules);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [log, setLog] = useState(automationLog);

  const toggleRule = (ruleId) => {
    setRules(rules.map(r => 
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ));
    const rule = rules.find(r => r.id === ruleId);
    toast.success(`${rule.enabled ? 'تم إيقاف' : 'تم تفعيل'} "${rule.name}"`);
  };

  const triggerManually = (rule) => {
    const newLog = {
      id: Date.now(),
      rule: rule.id,
      action: `تشغيل يدوي: ${rule.name}`,
      timestamp: new Date().toLocaleString('ar-SA'),
      status: 'success'
    };
    setLog([newLog, ...log]);
    onTriggerRule?.(rule);
    toast.success(`تم تشغيل "${rule.name}" يدوياً`);
  };

  const getTriggerIcon = (trigger) => {
    switch (trigger) {
      case 'ai_prediction': return AlertTriangle;
      case 'low_stock': return Package;
      case 'task_assigned': return Wrench;
      case 'status_change': return RefreshCw;
      case 'task_overdue': return Clock;
      default: return Zap;
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'create_maintenance': return Wrench;
      case 'create_purchase_order': return Package;
      case 'send_notification': return Bell;
      case 'escalate': return AlertTriangle;
      default: return Zap;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" />
            أتمتة سير العمل
          </h2>
          <p className="text-slate-400 text-sm">قواعد تلقائية لتحسين الكفاءة</p>
        </div>
        <Badge className="bg-green-500/20 text-green-400">
          {rules.filter(r => r.enabled).length} قاعدة نشطة
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-cyan-400">
              {rules.reduce((sum, r) => sum + r.stats.triggered, 0)}
            </p>
            <p className="text-slate-400 text-xs">إجمالي التنفيذات</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-400">
              {rules.filter(r => r.enabled).length}
            </p>
            <p className="text-slate-400 text-xs">قواعد نشطة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">
              {log.filter(l => l.timestamp.includes('2024-12-04')).length}
            </p>
            <p className="text-slate-400 text-xs">تنفيذات اليوم</p>
          </CardContent>
        </Card>
      </div>

      {/* Rules */}
      <div className="space-y-3">
        {rules.map((rule) => {
          const TriggerIcon = getTriggerIcon(rule.trigger);
          const ActionIcon = getActionIcon(rule.action);
          
          return (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 ${
                rule.enabled ? '' : 'opacity-60'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        rule.enabled ? 'bg-amber-500/20' : 'bg-slate-500/20'
                      }`}>
                        <TriggerIcon className={`w-5 h-5 ${
                          rule.enabled ? 'text-amber-400' : 'text-slate-400'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-bold">{rule.name}</h3>
                          <Badge className={rule.enabled ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
                            {rule.enabled ? 'نشط' : 'متوقف'}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm mt-1">{rule.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {rule.stats.triggered} تنفيذ
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            آخر: {rule.stats.lastTriggered}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-cyan-400"
                        onClick={() => triggerManually(rule)}
                        disabled={!rule.enabled}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedRule(rule);
                          setShowSettings(true);
                        }}
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                      </Button>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => toggleRule(rule.id)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Log */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            سجل التنفيذات الأخيرة
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {log.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-white text-sm">{entry.action}</span>
                </div>
                <span className="text-slate-500 text-xs">{entry.timestamp}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-400" />
              إعدادات القاعدة
            </DialogTitle>
          </DialogHeader>
          {selectedRule && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <h3 className="text-white font-bold">{selectedRule.name}</h3>
                <p className="text-slate-400 text-sm">{selectedRule.description}</p>
              </div>

              {selectedRule.trigger === 'ai_prediction' && (
                <div>
                  <Label className="text-slate-300">الحد الأدنى لاحتمالية العطل (%)</Label>
                  <Input
                    type="number"
                    defaultValue={selectedRule.conditions.probability}
                    className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  />
                </div>
              )}

              {selectedRule.trigger === 'task_overdue' && (
                <div>
                  <Label className="text-slate-300">ساعات التأخير قبل التصعيد</Label>
                  <Input
                    type="number"
                    defaultValue={selectedRule.conditions.hoursDelay}
                    className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  />
                </div>
              )}

              {selectedRule.action === 'send_notification' && (
                <div>
                  <Label className="text-slate-300 mb-2 block">قنوات الإشعار</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-400">
                      <Smartphone className="w-3 h-3 ml-1" /> تطبيق
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-600">
                      <Mail className="w-3 h-3 ml-1" /> بريد
                    </Button>
                  </div>
                </div>
              )}

              <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                <Check className="w-4 h-4 ml-2" />
                حفظ الإعدادات
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}