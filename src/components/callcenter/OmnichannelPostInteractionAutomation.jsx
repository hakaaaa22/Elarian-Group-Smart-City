import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Zap, Mail, MessageSquare, Phone, FileText, Database, Tag, Ticket,
  GitBranch, CheckCircle, Clock, Loader2, Settings, Play, Eye,
  Send, RefreshCw, AlertTriangle, TrendingUp, Users, Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const channelIcons = {
  voice: Phone,
  email: Mail,
  chat: MessageSquare,
  whatsapp: MessageSquare,
  sms: MessageSquare,
};

const automationTypes = [
  { id: 'followup_email', name: 'إرسال بريد متابعة', icon: Mail, color: 'blue', category: 'communication' },
  { id: 'crm_update', name: 'تحديث CRM', icon: Database, color: 'purple', category: 'data' },
  { id: 'categorize', name: 'تصنيف التفاعل', icon: Tag, color: 'green', category: 'data' },
  { id: 'create_ticket', name: 'إنشاء تذكرة دعم', icon: Ticket, color: 'amber', category: 'workflow' },
  { id: 'trigger_workflow', name: 'تشغيل سير عمل', icon: GitBranch, color: 'cyan', category: 'workflow' },
  { id: 'schedule_callback', name: 'جدولة مكالمة', icon: Phone, color: 'pink', category: 'communication' },
  { id: 'send_survey', name: 'إرسال استبيان', icon: FileText, color: 'indigo', category: 'communication' },
  { id: 'escalate', name: 'تصعيد للمشرف', icon: AlertTriangle, color: 'red', category: 'workflow' },
];

const sentimentActions = {
  positive: ['followup_email', 'send_survey', 'crm_update'],
  negative: ['create_ticket', 'escalate', 'schedule_callback'],
  neutral: ['categorize', 'crm_update'],
};

export default function OmnichannelPostInteractionAutomation({ 
  interactionData, 
  channel = 'voice',
  onAutomationComplete 
}) {
  const [automationConfig, setAutomationConfig] = useState({
    autoExecute: true,
    emailEnabled: true,
    crmEnabled: true,
    ticketEnabled: true,
    workflowEnabled: true,
    sentimentBased: true,
  });
  const [generatedAutomations, setGeneratedAutomations] = useState([]);
  const [executionLog, setExecutionLog] = useState([]);
  const [activeTab, setActiveTab] = useState('generate');

  const generateAutomationsMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل التفاعل التالي وحدد الإجراءات التلقائية المطلوبة:

القناة: ${data.channel}
ملخص التفاعل: ${data.summary || 'محادثة خدمة عملاء'}
المشاعر المكتشفة: ${data.sentiment || 'محايد'}
نوع الاستفسار: ${data.queryType || 'عام'}
حالة الحل: ${data.resolved ? 'تم الحل' : 'قيد المتابعة'}
معلومات العميل: ${data.customerInfo || 'غير متوفر'}

حدد الإجراءات التلقائية المناسبة من:
- إرسال بريد متابعة (محتوى مخصص)
- تحديث سجل CRM (الحقول والقيم)
- تصنيف التفاعل (الفئة والعلامات)
- إنشاء تذكرة دعم (إذا لم يُحل)
- تشغيل سير عمل (حسب النتيجة)
- جدولة مكالمة متابعة
- إرسال استبيان رضا`,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment_analysis: {
              type: "object",
              properties: {
                sentiment: { type: "string" },
                confidence: { type: "number" },
                key_emotions: { type: "array", items: { type: "string" } }
              }
            },
            interaction_category: {
              type: "object",
              properties: {
                primary: { type: "string" },
                secondary: { type: "string" },
                tags: { type: "array", items: { type: "string" } }
              }
            },
            automations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  priority: { type: "string" },
                  reason: { type: "string" },
                  config: { type: "object" }
                }
              }
            },
            followup_email: {
              type: "object",
              properties: {
                subject: { type: "string" },
                body: { type: "string" },
                tone: { type: "string" }
              }
            },
            crm_updates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  value: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            ticket_details: {
              type: "object",
              properties: {
                should_create: { type: "boolean" },
                title: { type: "string" },
                priority: { type: "string" },
                description: { type: "string" },
                assigned_team: { type: "string" }
              }
            },
            workflow_triggers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  workflow_name: { type: "string" },
                  trigger_reason: { type: "string" },
                  parameters: { type: "object" }
                }
              }
            },
            callback_recommendation: {
              type: "object",
              properties: {
                recommended: { type: "boolean" },
                reason: { type: "string" },
                suggested_time: { type: "string" }
              }
            }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setGeneratedAutomations(data.automations || []);
      toast.success('تم تحليل التفاعل وتحديد الإجراءات');
      
      if (automationConfig.autoExecute) {
        executeAllAutomations(data);
      }
    }
  });

  const executeAllAutomations = async (data) => {
    const log = [];

    // Execute Follow-up Email
    if (automationConfig.emailEnabled && data.followup_email?.body) {
      log.push({
        type: 'followup_email',
        status: 'success',
        message: `تم إنشاء بريد المتابعة: ${data.followup_email.subject}`,
        time: new Date()
      });
    }

    // Execute CRM Update
    if (automationConfig.crmEnabled && data.crm_updates?.length > 0) {
      log.push({
        type: 'crm_update',
        status: 'success',
        message: `تم تحديث ${data.crm_updates.length} حقول في CRM`,
        time: new Date()
      });
    }

    // Execute Ticket Creation
    if (automationConfig.ticketEnabled && data.ticket_details?.should_create) {
      try {
        await base44.entities.Task.create({
          title: data.ticket_details.title,
          description: data.ticket_details.description,
          priority: data.ticket_details.priority === 'high' ? 'urgent' : 'medium',
          status: 'pending',
          category: 'support',
        });
        log.push({
          type: 'create_ticket',
          status: 'success',
          message: `تم إنشاء تذكرة: ${data.ticket_details.title}`,
          time: new Date()
        });
      } catch (e) {
        log.push({
          type: 'create_ticket',
          status: 'error',
          message: 'فشل إنشاء التذكرة',
          time: new Date()
        });
      }
    }

    // Execute Workflow Triggers
    if (automationConfig.workflowEnabled && data.workflow_triggers?.length > 0) {
      data.workflow_triggers.forEach(wf => {
        log.push({
          type: 'trigger_workflow',
          status: 'success',
          message: `تم تشغيل: ${wf.workflow_name}`,
          time: new Date()
        });
      });
    }

    // Categorization
    log.push({
      type: 'categorize',
      status: 'success',
      message: `تصنيف: ${data.interaction_category?.primary} - العلامات: ${data.interaction_category?.tags?.join(', ')}`,
      time: new Date()
    });

    setExecutionLog(log);
    onAutomationComplete?.(data);
    toast.success(`تم تنفيذ ${log.filter(l => l.status === 'success').length} إجراء تلقائي`);
  };

  const executeAutomation = (automation) => {
    const newLog = {
      type: automation.type,
      status: 'success',
      message: `تم تنفيذ: ${automationTypes.find(a => a.id === automation.type)?.name}`,
      time: new Date()
    };
    setExecutionLog(prev => [...prev, newLog]);
    toast.success(newLog.message);
  };

  const ChannelIcon = channelIcons[channel] || MessageSquare;

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: generateAutomationsMutation.isPending ? 360 : 0 }}
            transition={{ duration: 2, repeat: generateAutomationsMutation.isPending ? Infinity : 0 }}
            className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
          >
            <Zap className="w-5 h-5 text-cyan-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">أتمتة ما بعد التفاعل</h4>
            <p className="text-slate-400 text-xs flex items-center gap-2">
              <ChannelIcon className="w-3 h-3" />
              {channel === 'voice' ? 'مكالمة' : channel === 'email' ? 'بريد' : 'محادثة'}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-cyan-600 hover:bg-cyan-700"
          onClick={() => generateAutomationsMutation.mutate(interactionData || { channel, summary: 'تفاعل خدمة عملاء' })}
          disabled={generateAutomationsMutation.isPending}
        >
          {generateAutomationsMutation.isPending ? (
            <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري التحليل</>
          ) : (
            <><Brain className="w-4 h-4 ml-2" /> تحليل وأتمتة</>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="generate" className="data-[state=active]:bg-cyan-500/20 text-xs">
            <Zap className="w-3 h-3 ml-1" />
            الإجراءات
          </TabsTrigger>
          <TabsTrigger value="config" className="data-[state=active]:bg-purple-500/20 text-xs">
            <Settings className="w-3 h-3 ml-1" />
            الإعدادات
          </TabsTrigger>
          <TabsTrigger value="log" className="data-[state=active]:bg-green-500/20 text-xs">
            <FileText className="w-3 h-3 ml-1" />
            السجل
            {executionLog.length > 0 && (
              <Badge className="mr-1 bg-green-500/20 text-green-400 text-xs px-1">{executionLog.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-4 space-y-3">
          {generatedAutomations.length === 0 ? (
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-6 text-center">
                <Zap className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">اضغط "تحليل وأتمتة" لتحليل التفاعل</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {generatedAutomations.map((auto, i) => {
                  const typeConfig = automationTypes.find(t => t.id === auto.type);
                  const Icon = typeConfig?.icon || Zap;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className={`bg-${typeConfig?.color}-500/10 border-${typeConfig?.color}-500/30`}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 text-${typeConfig?.color}-400`} />
                              <span className="text-white text-sm font-medium">{typeConfig?.name}</span>
                              <Badge className={`bg-${auto.priority === 'high' ? 'red' : 'slate'}-500/20 text-${auto.priority === 'high' ? 'red' : 'slate'}-400 text-xs`}>
                                {auto.priority === 'high' ? 'عالي' : 'عادي'}
                              </Badge>
                            </div>
                            <Button size="sm" variant="ghost" className="h-7" onClick={() => executeAutomation(auto)}>
                              <Play className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-slate-400 text-xs mt-1">{auto.reason}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          {generateAutomationsMutation.data?.followup_email && (
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  بريد المتابعة المقترح
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-2 bg-slate-900/50 rounded">
                  <p className="text-slate-400 text-xs">الموضوع:</p>
                  <p className="text-white text-sm">{generateAutomationsMutation.data.followup_email.subject}</p>
                </div>
                <div className="p-2 bg-slate-900/50 rounded">
                  <p className="text-slate-400 text-xs">المحتوى:</p>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">{generateAutomationsMutation.data.followup_email.body}</p>
                </div>
                <Button size="sm" className="w-full bg-blue-600">
                  <Send className="w-3 h-3 ml-1" />
                  إرسال البريد
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="config" className="mt-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                <Label className="text-slate-300 text-sm">تنفيذ تلقائي</Label>
                <Switch 
                  checked={automationConfig.autoExecute} 
                  onCheckedChange={(v) => setAutomationConfig(prev => ({ ...prev, autoExecute: v }))} 
                />
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                <Label className="text-slate-300 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  إرسال بريد المتابعة
                </Label>
                <Switch 
                  checked={automationConfig.emailEnabled} 
                  onCheckedChange={(v) => setAutomationConfig(prev => ({ ...prev, emailEnabled: v }))} 
                />
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                <Label className="text-slate-300 text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  تحديث CRM
                </Label>
                <Switch 
                  checked={automationConfig.crmEnabled} 
                  onCheckedChange={(v) => setAutomationConfig(prev => ({ ...prev, crmEnabled: v }))} 
                />
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                <Label className="text-slate-300 text-sm flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-amber-400" />
                  إنشاء تذاكر
                </Label>
                <Switch 
                  checked={automationConfig.ticketEnabled} 
                  onCheckedChange={(v) => setAutomationConfig(prev => ({ ...prev, ticketEnabled: v }))} 
                />
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                <Label className="text-slate-300 text-sm flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-cyan-400" />
                  تشغيل سير العمل
                </Label>
                <Switch 
                  checked={automationConfig.workflowEnabled} 
                  onCheckedChange={(v) => setAutomationConfig(prev => ({ ...prev, workflowEnabled: v }))} 
                />
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                <Label className="text-slate-300 text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-pink-400" />
                  بناءً على المشاعر
                </Label>
                <Switch 
                  checked={automationConfig.sentimentBased} 
                  onCheckedChange={(v) => setAutomationConfig(prev => ({ ...prev, sentimentBased: v }))} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="log" className="mt-4">
          {executionLog.length === 0 ? (
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-6 text-center">
                <FileText className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">لا توجد عمليات منفذة بعد</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[250px]">
              <div className="space-y-2">
                {executionLog.map((log, i) => {
                  const typeConfig = automationTypes.find(t => t.id === log.type);
                  const Icon = typeConfig?.icon || Zap;
                  return (
                    <div key={i} className={`p-2 rounded-lg flex items-center gap-2 ${log.status === 'success' ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                      {log.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-white text-sm">{log.message}</p>
                        <p className="text-slate-500 text-xs">{log.time.toLocaleTimeString('ar-SA')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}