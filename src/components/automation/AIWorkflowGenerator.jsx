import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Workflow, Brain, Zap, Plus, Play, Pause, Save, Trash2, ArrowRight, ArrowDown,
  CheckCircle, AlertTriangle, Clock, Settings, Loader2, RefreshCw, Copy,
  GitBranch, Target, Sparkles, Filter, MessageSquare, Mail, Phone, Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

const stepIcons = {
  trigger: Zap,
  condition: Filter,
  action: Play,
  notification: Bell,
  email: Mail,
  call: Phone,
  message: MessageSquare,
  wait: Clock,
  branch: GitBranch,
};

const stepColors = {
  trigger: 'cyan',
  condition: 'amber',
  action: 'green',
  notification: 'purple',
  email: 'red',
  call: 'blue',
  message: 'pink',
  wait: 'slate',
  branch: 'orange',
};

export default function AIWorkflowGenerator({ onWorkflowSave }) {
  const [context, setContext] = useState('');
  const [generatedWorkflows, setGeneratedWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const generateWorkflowsMutation = useMutation({
    mutationFn: async (inputContext) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `بناءً على السياق التالي، قم بإنشاء تسلسلات أتمتة ذكية (Workflows):

السياق: ${inputContext || 'مركز اتصال عام مع قنوات متعددة'}

قم بإنشاء 3-5 تدفقات عمل معقدة تشمل:
1. المشغّل (Trigger) - ما الذي يبدأ سير العمل
2. الشروط (Conditions) - متى يتم تنفيذ الخطوات
3. الإجراءات (Actions) - ما الذي يتم تنفيذه
4. الفروع (Branches) - السيناريوهات المختلفة
5. الإشعارات - من يتم إخطاره

اجعل التدفقات واقعية وقابلة للتنفيذ في بيئة مركز اتصال.`,
        response_json_schema: {
          type: "object",
          properties: {
            workflows: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  trigger: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      condition: { type: "string" }
                    }
                  },
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        type: { type: "string" },
                        name: { type: "string" },
                        description: { type: "string" },
                        config: { type: "object" },
                        next_step: { type: "string" },
                        branches: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              condition: { type: "string" },
                              next_step: { type: "string" }
                            }
                          }
                        }
                      }
                    }
                  },
                  expected_outcome: { type: "string" },
                  estimated_time_saved: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            optimization_tips: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setGeneratedWorkflows(data.workflows || []);
      toast.success(`تم إنشاء ${data.workflows?.length || 0} تدفق عمل`);
    },
    onError: () => {
      toast.error('حدث خطأ في إنشاء التدفقات');
    }
  });

  const saveWorkflow = (workflow) => {
    onWorkflowSave?.(workflow);
    toast.success(`تم حفظ: ${workflow.name}`);
  };

  const getStepIcon = (type) => {
    const Icon = stepIcons[type] || Zap;
    return Icon;
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: generateWorkflowsMutation.isPending ? 360 : 0 }}
            transition={{ duration: 2, repeat: generateWorkflowsMutation.isPending ? Infinity : 0, ease: "linear" }}
            className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20"
          >
            <Workflow className="w-5 h-5 text-purple-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">منشئ سير العمل الذكي</h4>
            <p className="text-slate-400 text-xs">إنشاء تلقائي لتسلسلات الأتمتة</p>
          </div>
        </div>
      </div>

      {/* Context Input */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-4">
          <Label className="text-slate-300 text-sm mb-2 block">وصف السيناريو أو السياق</Label>
          <div className="flex gap-2">
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="مثال: عميل VIP يشكو من تأخر في الخدمة ويهدد بإلغاء الاشتراك..."
              className="bg-slate-900/50 border-slate-700 text-white h-20 flex-1"
            />
            <Button
              className="bg-purple-600 hover:bg-purple-700 h-auto"
              onClick={() => generateWorkflowsMutation.mutate(context)}
              disabled={generateWorkflowsMutation.isPending}
            >
              {generateWorkflowsMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <><Brain className="w-5 h-5" /><span className="mr-2">إنشاء</span></>
              )}
            </Button>
          </div>
          <div className="flex gap-2 mt-2">
            {['شكوى عميل', 'طلب جديد', 'استفسار فني', 'متابعة', 'تصعيد'].map(preset => (
              <Button
                key={preset}
                size="sm"
                variant="outline"
                className="border-slate-600 text-xs h-7"
                onClick={() => setContext(preset)}
              >
                {preset}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generated Workflows */}
      {generatedWorkflows.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Workflow List */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                التدفقات المُنشأة ({generatedWorkflows.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {generatedWorkflows.map((workflow, i) => (
                    <motion.div
                      key={workflow.id || i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => setSelectedWorkflow(workflow)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedWorkflow?.id === workflow.id
                          ? 'bg-purple-500/20 border-purple-500/50'
                          : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="text-white font-medium">{workflow.name}</h5>
                          <p className="text-slate-400 text-xs mt-1">{workflow.description}</p>
                        </div>
                        <Badge className={
                          workflow.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          workflow.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-green-500/20 text-green-400'
                        }>
                          {workflow.priority === 'high' ? 'عالي' : workflow.priority === 'medium' ? 'متوسط' : 'منخفض'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{workflow.steps?.length || 0} خطوة</span>
                        <span>•</span>
                        <span>{workflow.estimated_time_saved}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Workflow Details */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-cyan-400" />
                  تفاصيل التدفق
                </CardTitle>
                {selectedWorkflow && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="border-slate-600 h-7" onClick={() => saveWorkflow(selectedWorkflow)}>
                      <Save className="w-3 h-3 ml-1" />
                      حفظ
                    </Button>
                    <Button size="sm" variant="outline" className="border-green-500/50 h-7">
                      <Play className="w-3 h-3 ml-1" />
                      تفعيل
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedWorkflow ? (
                <div className="text-center py-12 text-slate-500">
                  <Workflow className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>اختر تدفق عمل لعرض التفاصيل</p>
                </div>
              ) : (
                <ScrollArea className="h-[380px]">
                  <div className="space-y-4">
                    {/* Trigger */}
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        <span className="text-cyan-400 font-medium text-sm">المشغّل</span>
                      </div>
                      <p className="text-white text-sm">{selectedWorkflow.trigger?.type}</p>
                      <p className="text-slate-400 text-xs mt-1">{selectedWorkflow.trigger?.condition}</p>
                    </div>

                    {/* Steps */}
                    <div className="space-y-2">
                      {selectedWorkflow.steps?.map((step, i) => {
                        const StepIcon = getStepIcon(step.type);
                        const color = stepColors[step.type] || 'slate';

                        return (
                          <div key={step.id || i}>
                            <div className={`p-3 bg-${color}-500/10 border border-${color}-500/30 rounded-lg`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <StepIcon className={`w-4 h-4 text-${color}-400`} />
                                  <span className={`text-${color}-400 font-medium text-sm`}>{step.name}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">{step.type}</Badge>
                              </div>
                              <p className="text-slate-300 text-sm">{step.description}</p>

                              {/* Branches */}
                              {step.branches?.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {step.branches.map((branch, j) => (
                                    <div key={j} className="flex items-center gap-2 text-xs text-slate-400 mr-4">
                                      <GitBranch className="w-3 h-3" />
                                      <span>{branch.condition}</span>
                                      <ArrowRight className="w-3 h-3" />
                                      <span className="text-slate-300">{branch.next_step}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            {i < (selectedWorkflow.steps?.length || 0) - 1 && (
                              <div className="flex justify-center py-1">
                                <ArrowDown className="w-4 h-4 text-slate-600" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Expected Outcome */}
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-medium text-sm">النتيجة المتوقعة</span>
                      </div>
                      <p className="text-slate-300 text-sm">{selectedWorkflow.expected_outcome}</p>
                    </div>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {generatedWorkflows.length === 0 && !generateWorkflowsMutation.isPending && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-8 text-center">
            <Workflow className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-white font-medium">لم يتم إنشاء تدفقات عمل بعد</p>
            <p className="text-slate-400 text-sm mt-1">أدخل وصفاً للسيناريو واضغط إنشاء</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}