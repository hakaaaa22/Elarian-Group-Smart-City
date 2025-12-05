import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Zap, Shield, RefreshCw, Bell, Users, Mail, MessageSquare, Phone,
  CheckCircle, XCircle, Clock, AlertTriangle, Settings, Play, Pause,
  Loader2, ArrowRight, Activity, Target, Bot, Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const responseActions = [
  { id: 'restart', name: 'إعادة تشغيل النموذج', icon: RefreshCw, color: 'cyan', auto: true },
  { id: 'scale', name: 'توسيع الموارد', icon: Zap, color: 'purple', auto: true },
  { id: 'fallback', name: 'تفعيل النموذج الاحتياطي', icon: Shield, color: 'green', auto: true },
  { id: 'notify_team', name: 'إعلام الفريق', icon: Users, color: 'blue', auto: true },
  { id: 'email', name: 'إرسال بريد إلكتروني', icon: Mail, color: 'amber', auto: false },
  { id: 'sms', name: 'إرسال رسالة SMS', icon: Phone, color: 'pink', auto: false },
];

const recentResponses = [
  { id: 1, action: 'restart', model: 'كشف الوجوه', trigger: 'انخفاض الدقة', status: 'success', time: 'منذ 5 دقائق' },
  { id: 2, action: 'notify_team', model: 'تحليل الحشود', trigger: 'ارتفاع التأخير', status: 'success', time: 'منذ 15 دقيقة' },
  { id: 3, action: 'scale', model: 'كشف المركبات', trigger: 'حمل زائد', status: 'pending', time: 'منذ 30 دقيقة' },
  { id: 4, action: 'fallback', model: 'كشف التهديدات', trigger: 'فشل النموذج', status: 'success', time: 'منذ ساعة' },
];

export default function AIAutoResponseSystem() {
  const [autoResponseEnabled, setAutoResponseEnabled] = useState(true);
  const [rules, setRules] = useState([
    { id: 1, condition: 'accuracy_drop', threshold: 85, action: 'restart', enabled: true, cooldown: 5 },
    { id: 2, condition: 'latency_spike', threshold: 100, action: 'scale', enabled: true, cooldown: 10 },
    { id: 3, condition: 'error_rate', threshold: 5, action: 'notify_team', enabled: true, cooldown: 15 },
    { id: 4, condition: 'model_failure', threshold: 0, action: 'fallback', enabled: true, cooldown: 0 },
  ]);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState({ condition: 'accuracy_drop', threshold: 80, action: 'restart', cooldown: 5 });
  const [responses, setResponses] = useState(recentResponses);
  const [isExecuting, setIsExecuting] = useState(false);

  const executeResponseMutation = useMutation({
    mutationFn: async (response) => {
      setIsExecuting(true);
      // Simulate action execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      return response;
    },
    onSuccess: (response) => {
      setIsExecuting(false);
      setResponses(prev => [{
        id: Date.now(),
        action: response.action,
        model: response.model,
        trigger: 'تنفيذ يدوي',
        status: 'success',
        time: 'الآن'
      }, ...prev].slice(0, 20));
      toast.success(`تم تنفيذ: ${responseActions.find(a => a.id === response.action)?.name}`);
    }
  });

  const notifyTeamMutation = useMutation({
    mutationFn: async (anomaly) => {
      await base44.integrations.Core.SendEmail({
        to: 'team@example.com',
        subject: `🚨 تنبيه AI Vision: ${anomaly.type}`,
        body: `تم اكتشاف شذوذ في النموذج: ${anomaly.model}\n\nالتفاصيل:\n- النوع: ${anomaly.type}\n- القيمة: ${anomaly.value}\n- الوقت: ${new Date().toLocaleString('ar-SA')}\n\nيرجى مراجعة النظام.`
      });
      return anomaly;
    },
    onSuccess: () => {
      toast.success('تم إرسال التنبيه للفريق');
    }
  });

  const toggleRule = (ruleId) => {
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  const addRule = () => {
    setRules(prev => [...prev, { ...newRule, id: Date.now(), enabled: true }]);
    setShowAddRule(false);
    setNewRule({ condition: 'accuracy_drop', threshold: 80, action: 'restart', cooldown: 5 });
    toast.success('تمت إضافة القاعدة');
  };

  const deleteRule = (ruleId) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
    toast.success('تم حذف القاعدة');
  };

  const getConditionLabel = (condition) => {
    switch(condition) {
      case 'accuracy_drop': return 'انخفاض الدقة';
      case 'latency_spike': return 'ارتفاع التأخير';
      case 'error_rate': return 'معدل الأخطاء';
      case 'model_failure': return 'فشل النموذج';
      default: return condition;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return 'green';
      case 'pending': return 'amber';
      case 'failed': return 'red';
      default: return 'slate';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={autoResponseEnabled ? { 
              boxShadow: ['0 0 10px rgba(34,211,238,0.3)', '0 0 20px rgba(34,211,238,0.5)', '0 0 10px rgba(34,211,238,0.3)']
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`p-2 rounded-lg ${autoResponseEnabled ? 'bg-cyan-500/20' : 'bg-slate-500/20'}`}
          >
            <Bot className={`w-6 h-6 ${autoResponseEnabled ? 'text-cyan-400' : 'text-slate-400'}`} />
          </motion.div>
          <div>
            <h4 className="text-white font-bold text-lg">الاستجابة التلقائية للشذوذات</h4>
            <p className="text-slate-400 text-xs">إجراءات تلقائية • إشعارات فورية • قواعد مخصصة</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg">
            <Label className="text-slate-300 text-sm">الاستجابة التلقائية</Label>
            <Switch checked={autoResponseEnabled} onCheckedChange={setAutoResponseEnabled} />
          </div>
          <Button onClick={() => setShowAddRule(true)} className="bg-cyan-600 hover:bg-cyan-700">
            <Zap className="w-4 h-4 ml-1" />
            إضافة قاعدة
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{responses.filter(r => r.status === 'success').length}</p>
            <p className="text-slate-400 text-xs">استجابة ناجحة</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <Clock className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{responses.filter(r => r.status === 'pending').length}</p>
            <p className="text-slate-400 text-xs">قيد التنفيذ</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <Activity className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{rules.filter(r => r.enabled).length}</p>
            <p className="text-slate-400 text-xs">قاعدة نشطة</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <Target className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">98%</p>
            <p className="text-slate-400 text-xs">معدل النجاح</p>
          </CardContent>
        </Card>
      </div>

      {/* Response Actions */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            إجراءات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {responseActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className={`h-auto py-3 flex flex-col items-center gap-1 border-${action.color}-500/30 hover:bg-${action.color}-500/10`}
                onClick={() => executeResponseMutation.mutate({ action: action.id, model: 'النموذج المحدد' })}
                disabled={isExecuting}
              >
                <action.icon className={`w-5 h-5 text-${action.color}-400`} />
                <span className="text-[10px] text-slate-300">{action.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Rules Configuration */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Settings className="w-4 h-4 text-purple-400" />
              قواعد الاستجابة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <div className="space-y-2">
                {rules.map((rule) => {
                  const action = responseActions.find(a => a.id === rule.action);
                  return (
                    <div
                      key={rule.id}
                      className={`p-3 rounded-lg border ${rule.enabled ? 'bg-slate-900/50 border-slate-700/50' : 'bg-slate-900/30 border-slate-800/50 opacity-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                          <div>
                            <p className="text-white text-sm font-medium">
                              إذا {getConditionLabel(rule.condition)} {rule.threshold > 0 ? `< ${rule.threshold}` : ''}
                            </p>
                            <p className="text-slate-400 text-xs flex items-center gap-1">
                              <ArrowRight className="w-3 h-3" />
                              {action?.name}
                              {rule.cooldown > 0 && <span className="text-slate-500">• انتظار {rule.cooldown}د</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {action && <action.icon className={`w-4 h-4 text-${action.color}-400`} />}
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-400" onClick={() => deleteRule(rule.id)}>
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Responses */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              الاستجابات الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <div className="space-y-2">
                <AnimatePresence>
                  {responses.map((response) => {
                    const action = responseActions.find(a => a.id === response.action);
                    return (
                      <motion.div
                        key={response.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 bg-slate-900/50 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {action && <action.icon className={`w-4 h-4 text-${action.color}-400`} />}
                          <div>
                            <p className="text-white text-sm">{action?.name}</p>
                            <p className="text-slate-400 text-xs">{response.model} • {response.trigger}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <Badge className={`bg-${getStatusColor(response.status)}-500/20 text-${getStatusColor(response.status)}-400 text-[10px]`}>
                            {response.status === 'success' ? 'نجح' : response.status === 'pending' ? 'قيد التنفيذ' : 'فشل'}
                          </Badge>
                          <p className="text-slate-500 text-[10px] mt-1">{response.time}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Add Rule Dialog */}
      <Dialog open={showAddRule} onOpenChange={setShowAddRule}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">إضافة قاعدة استجابة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300 text-sm">الشرط</Label>
              <Select value={newRule.condition} onValueChange={(v) => setNewRule({...newRule, condition: v})}>
                <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="accuracy_drop">انخفاض الدقة</SelectItem>
                  <SelectItem value="latency_spike">ارتفاع التأخير</SelectItem>
                  <SelectItem value="error_rate">معدل الأخطاء</SelectItem>
                  <SelectItem value="model_failure">فشل النموذج</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">الحد</Label>
              <Input
                type="number"
                value={newRule.threshold}
                onChange={(e) => setNewRule({...newRule, threshold: Number(e.target.value)})}
                className="mt-1 bg-slate-800/50 border-slate-700"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">الإجراء</Label>
              <Select value={newRule.action} onValueChange={(v) => setNewRule({...newRule, action: v})}>
                <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {responseActions.map(action => (
                    <SelectItem key={action.id} value={action.id}>{action.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">فترة الانتظار (دقائق)</Label>
              <Input
                type="number"
                value={newRule.cooldown}
                onChange={(e) => setNewRule({...newRule, cooldown: Number(e.target.value)})}
                className="mt-1 bg-slate-800/50 border-slate-700"
              />
            </div>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={addRule}>
              <Zap className="w-4 h-4 ml-1" />
              إضافة القاعدة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}