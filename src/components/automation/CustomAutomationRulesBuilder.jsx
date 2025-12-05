import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Settings, Plus, Trash2, Play, Pause, Zap, Brain, Filter, ArrowRight,
  CheckCircle, AlertTriangle, Clock, Save, RefreshCw, Loader2, Copy,
  ChevronDown, ChevronUp, Eye, Edit2, X, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Rule conditions
const conditionTypes = [
  { id: 'sentiment', name: 'مشاعر العميل', options: ['positive', 'negative', 'neutral', 'mixed'] },
  { id: 'outcome', name: 'نتيجة التفاعل', options: ['resolved', 'escalated', 'pending', 'follow_up_needed'] },
  { id: 'query_type', name: 'نوع الاستفسار', options: ['support', 'sales', 'complaint', 'inquiry', 'billing'] },
  { id: 'customer_tier', name: 'تصنيف العميل', options: ['vip', 'premium', 'regular', 'new'] },
  { id: 'churn_risk', name: 'خطر المغادرة', options: ['high', 'medium', 'low'] },
  { id: 'purchase_intent', name: 'نية الشراء', options: ['high', 'medium', 'low'] },
  { id: 'channel', name: 'قناة التواصل', options: ['voice', 'chat', 'email', 'whatsapp', 'social'] },
  { id: 'duration', name: 'مدة التفاعل', options: ['short', 'medium', 'long'] },
];

// Action types
const actionTypes = [
  { id: 'create_task', name: 'إنشاء مهمة', icon: '📋' },
  { id: 'send_email', name: 'إرسال بريد', icon: '📧' },
  { id: 'update_crm', name: 'تحديث CRM', icon: '💾' },
  { id: 'create_ticket', name: 'إنشاء تذكرة', icon: '🎫' },
  { id: 'notify_manager', name: 'إشعار المدير', icon: '🔔' },
  { id: 'schedule_followup', name: 'جدولة متابعة', icon: '📅' },
  { id: 'add_tag', name: 'إضافة وسم', icon: '🏷️' },
  { id: 'trigger_workflow', name: 'تشغيل سير عمل', icon: '⚡' },
];

const defaultRule = {
  name: '',
  description: '',
  conditions: [],
  actions: [],
  enabled: true,
  priority: 'medium',
};

export default function CustomAutomationRulesBuilder({ onRuleSave, existingRules = [] }) {
  const [rules, setRules] = useState(() => {
    const saved = localStorage.getItem('custom_automation_rules');
    return saved ? JSON.parse(saved) : existingRules;
  });
  const [showBuilder, setShowBuilder] = useState(false);
  const [currentRule, setCurrentRule] = useState({ ...defaultRule });
  const [editingIndex, setEditingIndex] = useState(null);
  const [suggestedRules, setSuggestedRules] = useState([]);

  // AI suggestion for automation sequences
  const suggestAutomationMutation = useMutation({
    mutationFn: async (context) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `بناءً على التفاعلات السابقة ونتائجها، اقترح تسلسلات أتمتة مخصصة:

السياق:
${context}

القواعد الموجودة:
${JSON.stringify(rules, null, 2)}

اقترح 3-5 قواعد أتمتة جديدة تتضمن:
1. اسم القاعدة
2. الشروط (sentiment, outcome, query_type, customer_tier, churn_risk, purchase_intent, channel)
3. الإجراءات (create_task, send_email, update_crm, create_ticket, notify_manager, schedule_followup, add_tag, trigger_workflow)
4. السبب والفائدة المتوقعة`,
        response_json_schema: {
          type: "object",
          properties: {
            suggested_rules: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  conditions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        operator: { type: "string" },
                        value: { type: "string" }
                      }
                    }
                  },
                  actions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        config: { type: "object" }
                      }
                    }
                  },
                  reason: { type: "string" },
                  expected_benefit: { type: "string" }
                }
              }
            }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setSuggestedRules(data.suggested_rules || []);
      toast.success('تم إنشاء اقتراحات الأتمتة');
    },
    onError: () => {
      toast.error('حدث خطأ في التحليل');
    }
  });

  useEffect(() => {
    localStorage.setItem('custom_automation_rules', JSON.stringify(rules));
  }, [rules]);

  const addCondition = () => {
    setCurrentRule(prev => ({
      ...prev,
      conditions: [...prev.conditions, { type: '', operator: 'equals', value: '' }]
    }));
  };

  const removeCondition = (index) => {
    setCurrentRule(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const updateCondition = (index, field, value) => {
    setCurrentRule(prev => ({
      ...prev,
      conditions: prev.conditions.map((c, i) => 
        i === index ? { ...c, [field]: value } : c
      )
    }));
  };

  const addAction = () => {
    setCurrentRule(prev => ({
      ...prev,
      actions: [...prev.actions, { type: '', config: {} }]
    }));
  };

  const removeAction = (index) => {
    setCurrentRule(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const updateAction = (index, field, value) => {
    setCurrentRule(prev => ({
      ...prev,
      actions: prev.actions.map((a, i) => 
        i === index ? { ...a, [field]: value } : a
      )
    }));
  };

  const saveRule = () => {
    if (!currentRule.name || currentRule.conditions.length === 0 || currentRule.actions.length === 0) {
      toast.error('يرجى إكمال جميع الحقول المطلوبة');
      return;
    }

    if (editingIndex !== null) {
      setRules(prev => prev.map((r, i) => i === editingIndex ? { ...currentRule, id: r.id } : r));
    } else {
      setRules(prev => [...prev, { ...currentRule, id: Date.now().toString() }]);
    }

    onRuleSave?.(currentRule);
    setShowBuilder(false);
    setCurrentRule({ ...defaultRule });
    setEditingIndex(null);
    toast.success('تم حفظ القاعدة');
  };

  const editRule = (index) => {
    setCurrentRule(rules[index]);
    setEditingIndex(index);
    setShowBuilder(true);
  };

  const deleteRule = (index) => {
    setRules(prev => prev.filter((_, i) => i !== index));
    toast.success('تم حذف القاعدة');
  };

  const toggleRule = (index) => {
    setRules(prev => prev.map((r, i) => 
      i === index ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const applySuggestedRule = (rule) => {
    setCurrentRule({
      ...defaultRule,
      ...rule,
      enabled: true,
      priority: 'medium'
    });
    setShowBuilder(true);
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Settings className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h4 className="text-white font-bold">قواعد الأتمتة المخصصة</h4>
            <p className="text-slate-400 text-xs">تكوين قواعد ما بعد التفاعل</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-purple-500/50"
            onClick={() => suggestAutomationMutation.mutate('تحليل التفاعلات الأخيرة')}
            disabled={suggestAutomationMutation.isPending}
          >
            {suggestAutomationMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><Brain className="w-4 h-4 ml-2" /> اقتراحات AI</>
            )}
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => {
              setCurrentRule({ ...defaultRule });
              setEditingIndex(null);
              setShowBuilder(true);
            }}
          >
            <Plus className="w-4 h-4 ml-2" />
            قاعدة جديدة
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-white">{rules.filter(r => r.enabled).length}</p>
            <p className="text-slate-400 text-xs">قواعد نشطة</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-white">{rules.length}</p>
            <p className="text-slate-400 text-xs">إجمالي القواعد</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-white">{suggestedRules.length}</p>
            <p className="text-slate-400 text-xs">اقتراحات AI</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-white">
              {rules.reduce((acc, r) => acc + r.actions.length, 0)}
            </p>
            <p className="text-slate-400 text-xs">إجراء تلقائي</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions */}
      {suggestedRules.length > 0 && (
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              اقتراحات AI للأتمتة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[150px]">
              <div className="space-y-2">
                {suggestedRules.map((rule, i) => (
                  <div key={i} className="p-3 bg-slate-900/50 rounded-lg border border-purple-500/20">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-medium">{rule.name}</p>
                        <p className="text-slate-400 text-xs mt-1">{rule.description}</p>
                        <p className="text-purple-400 text-xs mt-1">الفائدة: {rule.expected_benefit}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-purple-500/50 h-7"
                        onClick={() => applySuggestedRule(rule)}
                      >
                        <Plus className="w-3 h-3 ml-1" />
                        تطبيق
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Rules List */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            القواعد المكونة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">لا توجد قواعد بعد</p>
              <p className="text-xs">أنشئ قاعدة جديدة أو استخدم اقتراحات AI</p>
            </div>
          ) : (
            <ScrollArea className="h-[250px]">
              <div className="space-y-2">
                {rules.map((rule, i) => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border ${
                      rule.enabled 
                        ? 'bg-slate-900/50 border-slate-700' 
                        : 'bg-slate-900/30 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">{rule.name}</span>
                          <Badge className={rule.enabled ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}>
                            {rule.enabled ? 'نشط' : 'متوقف'}
                          </Badge>
                          <Badge className={
                            rule.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            rule.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-slate-600 text-slate-400'
                          }>
                            {rule.priority === 'high' ? 'عالي' : rule.priority === 'medium' ? 'متوسط' : 'منخفض'}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-xs mb-2">{rule.description}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-cyan-400">{rule.conditions.length} شرط</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="text-purple-400">{rule.actions.length} إجراء</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={() => toggleRule(i)}
                        />
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => editRule(i)}>
                          <Edit2 className="w-3 h-3 text-slate-400" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteRule(i)}>
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Rule Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              {editingIndex !== null ? 'تعديل القاعدة' : 'إنشاء قاعدة جديدة'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-sm mb-1 block">اسم القاعدة *</Label>
                <Input
                  value={currentRule.name}
                  onChange={(e) => setCurrentRule(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="مثال: متابعة العملاء غير الراضين"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm mb-1 block">الأولوية</Label>
                <Select
                  value={currentRule.priority}
                  onValueChange={(v) => setCurrentRule(prev => ({ ...prev, priority: v }))}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="high">عالية</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="low">منخفضة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm mb-1 block">الوصف</Label>
              <Textarea
                value={currentRule.description}
                onChange={(e) => setCurrentRule(prev => ({ ...prev, description: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white h-16"
                placeholder="وصف مختصر للقاعدة..."
              />
            </div>

            {/* Conditions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-slate-300 text-sm">الشروط (متى تُنفذ القاعدة)</Label>
                <Button size="sm" variant="outline" className="border-cyan-500/50 h-7" onClick={addCondition}>
                  <Plus className="w-3 h-3 ml-1" />
                  إضافة شرط
                </Button>
              </div>
              <div className="space-y-2">
                {currentRule.conditions.map((condition, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-slate-900/50 rounded">
                    <Select
                      value={condition.type}
                      onValueChange={(v) => updateCondition(i, 'type', v)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white w-40">
                        <SelectValue placeholder="نوع الشرط" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {conditionTypes.map(ct => (
                          <SelectItem key={ct.id} value={ct.id}>{ct.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={condition.operator}
                      onValueChange={(v) => updateCondition(i, 'operator', v)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="equals">يساوي</SelectItem>
                        <SelectItem value="not_equals">لا يساوي</SelectItem>
                        <SelectItem value="contains">يحتوي</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={condition.value}
                      onValueChange={(v) => updateCondition(i, 'value', v)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white flex-1">
                        <SelectValue placeholder="القيمة" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {conditionTypes.find(ct => ct.id === condition.type)?.options.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeCondition(i)}>
                      <X className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-slate-300 text-sm">الإجراءات (ماذا تفعل القاعدة)</Label>
                <Button size="sm" variant="outline" className="border-purple-500/50 h-7" onClick={addAction}>
                  <Plus className="w-3 h-3 ml-1" />
                  إضافة إجراء
                </Button>
              </div>
              <div className="space-y-2">
                {currentRule.actions.map((action, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-slate-900/50 rounded">
                    <Select
                      value={action.type}
                      onValueChange={(v) => updateAction(i, 'type', v)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white flex-1">
                        <SelectValue placeholder="نوع الإجراء" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {actionTypes.map(at => (
                          <SelectItem key={at.id} value={at.id}>
                            {at.icon} {at.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeAction(i)}>
                      <X className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2 pt-4 border-t border-slate-700">
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={saveRule}>
                <Save className="w-4 h-4 ml-2" />
                حفظ القاعدة
              </Button>
              <Button variant="outline" className="border-slate-600" onClick={() => setShowBuilder(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}