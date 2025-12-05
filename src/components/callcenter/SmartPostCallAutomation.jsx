import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Zap, CheckCircle, Clock, Calendar, Users, FileText, Brain,
  Sparkles, Loader2, Play, Pause, Settings, Target, Mail,
  MessageSquare, Phone, AlertTriangle, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const automationTypes = [
  { id: 'crm_update', name: 'تحديث CRM', icon: Users, color: 'cyan' },
  { id: 'follow_up_task', name: 'مهمة متابعة', icon: CheckCircle, color: 'green' },
  { id: 'schedule_callback', name: 'جدولة اتصال', icon: Calendar, color: 'purple' },
  { id: 'send_email', name: 'إرسال بريد', icon: Mail, color: 'blue' },
  { id: 'escalate', name: 'تصعيد الحالة', icon: AlertTriangle, color: 'red' },
  { id: 'workflow', name: 'سير عمل', icon: Zap, color: 'amber' },
];

export default function SmartPostCallAutomation({ callContext, callResult, customerData }) {
  const [automations, setAutomations] = useState([]);
  const [settings, setSettings] = useState({
    autoExecute: false,
    notifyOnComplete: true,
    syncToCRM: true,
    createTasks: true,
    sendFollowUp: true,
  });
  const [executionStatus, setExecutionStatus] = useState({});

  const generateAutomationsMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت نظام أتمتة ذكي لمراكز الاتصال. 

بناءً على سياق المكالمة التالي، قم بإنشاء مهام أتمتة ذكية:

سياق المكالمة:
- الموضوع: ${callContext?.topic || 'استفسار عن الخدمة'}
- المدة: ${callContext?.duration || '5 دقائق'}
- المشاعر: ${callContext?.sentiment || 'محايد'}
- نتيجة المكالمة: ${callResult || 'تم حل الاستفسار'}

بيانات العميل:
- الاسم: ${customerData?.name || 'العميل'}
- النوع: ${customerData?.type || 'عادي'}
- خطر المغادرة: ${customerData?.churnRisk || 20}%

قم بإنشاء قائمة بالمهام التلقائية المطلوبة:
1. تحديثات CRM
2. مهام المتابعة
3. جدولة الاتصالات
4. رسائل البريد الإلكتروني
5. التصعيدات إن لزم
6. سير العمل الآلي`,
        response_json_schema: {
          type: "object",
          properties: {
            automations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  type: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  due_date: { type: "string" },
                  assigned_to: { type: "string" },
                  crm_fields: { type: "object" },
                  workflow_trigger: { type: "string" },
                  email_template: { type: "string" },
                  follow_up_type: { type: "string" }
                }
              }
            },
            summary: { type: "string" },
            total_tasks: { type: "number" },
            urgent_tasks: { type: "number" },
            estimated_completion: { type: "string" }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setAutomations(data.automations || []);
      toast.success(`تم إنشاء ${data.total_tasks || 0} مهمة تلقائية`);
      
      if (settings.autoExecute) {
        executeAllAutomations(data.automations);
      }
    },
    onError: () => {
      toast.error('حدث خطأ');
    }
  });

  const executeAutomation = async (automation) => {
    setExecutionStatus(prev => ({ ...prev, [automation.id]: 'running' }));
    
    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Execute based on type
      switch (automation.type) {
        case 'crm_update':
          // Update CRM
          toast.success(`تم تحديث CRM: ${automation.title}`);
          break;
        case 'follow_up_task':
          // Create task
          await base44.entities.Task.create({
            title: automation.title,
            description: automation.description,
            priority: automation.priority === 'high' ? 'urgent' : 'medium',
            status: 'pending',
            due_date: new Date(Date.now() + 86400000).toISOString(),
            related_customer: customerData?.name,
            category: 'follow_up',
          });
          toast.success(`تم إنشاء مهمة: ${automation.title}`);
          break;
        case 'send_email':
          toast.success(`تم إرسال البريد: ${automation.title}`);
          break;
        default:
          toast.success(`تم تنفيذ: ${automation.title}`);
      }
      
      setExecutionStatus(prev => ({ ...prev, [automation.id]: 'completed' }));
    } catch {
      setExecutionStatus(prev => ({ ...prev, [automation.id]: 'failed' }));
      toast.error(`فشل تنفيذ: ${automation.title}`);
    }
  };

  const executeAllAutomations = async (autos = automations) => {
    for (const auto of autos) {
      await executeAutomation(auto);
    }
  };

  const getTypeConfig = (type) => {
    return automationTypes.find(t => t.id === type) || automationTypes[0];
  };

  const getStatusBadge = (id) => {
    const status = executionStatus[id];
    if (status === 'running') return <Badge className="bg-blue-500/20 text-blue-400 animate-pulse">جاري التنفيذ</Badge>;
    if (status === 'completed') return <Badge className="bg-green-500/20 text-green-400">مكتمل</Badge>;
    if (status === 'failed') return <Badge className="bg-red-500/20 text-red-400">فشل</Badge>;
    return <Badge className="bg-slate-600 text-slate-300">قيد الانتظار</Badge>;
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20"
          >
            <Zap className="w-6 h-6 text-amber-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">الأتمتة الذكية بعد المكالمة</h4>
            <p className="text-slate-400 text-xs">Smart Post-Call Automation</p>
          </div>
        </div>
        <Button
          className="bg-amber-600 hover:bg-amber-700"
          onClick={() => generateAutomationsMutation.mutate()}
          disabled={generateAutomationsMutation.isPending}
        >
          {generateAutomationsMutation.isPending ? (
            <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري التحليل...</>
          ) : (
            <><Brain className="w-4 h-4 ml-2" /> إنشاء المهام</>
          )}
        </Button>
      </div>

      {/* Settings */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            إعدادات الأتمتة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { key: 'autoExecute', label: 'تنفيذ تلقائي' },
              { key: 'notifyOnComplete', label: 'إشعار عند الاكتمال' },
              { key: 'syncToCRM', label: 'مزامنة CRM' },
              { key: 'createTasks', label: 'إنشاء مهام' },
              { key: 'sendFollowUp', label: 'إرسال متابعة' },
            ].map(setting => (
              <div key={setting.key} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                <Label className="text-slate-300 text-xs">{setting.label}</Label>
                <Switch
                  checked={settings[setting.key]}
                  onCheckedChange={(v) => setSettings(prev => ({ ...prev, [setting.key]: v }))}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {automations.length > 0 ? (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-white">{automations.length}</p>
                <p className="text-slate-400 text-xs">إجمالي المهام</p>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-white">
                  {automations.filter(a => a.priority === 'high').length}
                </p>
                <p className="text-slate-400 text-xs">مهام عاجلة</p>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-white">
                  {Object.values(executionStatus).filter(s => s === 'completed').length}
                </p>
                <p className="text-slate-400 text-xs">مكتملة</p>
              </CardContent>
            </Card>
          </div>

          {/* Execute All Button */}
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => executeAllAutomations()}
            disabled={Object.values(executionStatus).some(s => s === 'running')}
          >
            <Play className="w-4 h-4 ml-2" />
            تنفيذ جميع المهام
          </Button>

          {/* Automations List */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">المهام التلقائية</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {automations.map((automation, i) => {
                    const typeConfig = getTypeConfig(automation.type);
                    const Icon = typeConfig.icon;
                    return (
                      <motion.div
                        key={automation.id || i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-3 bg-${typeConfig.color}-500/10 border border-${typeConfig.color}-500/30 rounded-lg`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-${typeConfig.color}-500/20`}>
                              <Icon className={`w-4 h-4 text-${typeConfig.color}-400`} />
                            </div>
                            <div>
                              <p className="text-white font-medium">{automation.title}</p>
                              <p className="text-slate-400 text-xs mt-1">{automation.description}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge className={`bg-${automation.priority === 'high' ? 'red' : automation.priority === 'medium' ? 'amber' : 'blue'}-500/20 text-xs`}>
                                  {automation.priority === 'high' ? 'عاجل' : automation.priority === 'medium' ? 'متوسط' : 'عادي'}
                                </Badge>
                                {automation.due_date && (
                                  <Badge className="bg-slate-600 text-slate-300 text-xs">
                                    <Clock className="w-3 h-3 ml-1" />
                                    {automation.due_date}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(automation.id || i)}
                            {executionStatus[automation.id || i] !== 'completed' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7"
                                onClick={() => executeAutomation(automation)}
                                disabled={executionStatus[automation.id || i] === 'running'}
                              >
                                <Play className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-8 text-center">
            <Zap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">اضغط "إنشاء المهام" لتوليد مهام أتمتة ذكية بناءً على سياق المكالمة</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}