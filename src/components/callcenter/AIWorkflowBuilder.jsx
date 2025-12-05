import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Workflow, Zap, CheckCircle, XCircle, Clock, ArrowRight, Play, Pause,
  Settings, Send, FileText, User, Phone, Mail, MessageSquare, AlertTriangle,
  Search, Database, Wrench, RotateCw, Brain, Sparkles, ChevronRight,
  Plus, Trash2, Edit, Save, Loader2, Target, Shield, Ticket
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Workflow Step Types
const stepTypes = {
  check_device: { icon: Search, color: 'cyan', label: 'فحص الجهاز' },
  check_sim: { icon: Database, color: 'purple', label: 'فحص SIM' },
  diagnostics: { icon: Wrench, color: 'amber', label: 'تشخيص' },
  ping_test: { icon: Zap, color: 'green', label: 'اختبار Ping' },
  remote_command: { icon: Settings, color: 'blue', label: 'أمر عن بُعد' },
  create_ticket: { icon: Ticket, color: 'pink', label: 'إنشاء تذكرة' },
  escalation: { icon: AlertTriangle, color: 'red', label: 'تصعيد' },
  send_sms: { icon: MessageSquare, color: 'green', label: 'إرسال SMS' },
  send_email: { icon: Mail, color: 'blue', label: 'إرسال بريد' },
  notify_team: { icon: User, color: 'purple', label: 'إبلاغ الفريق' },
  close_ticket: { icon: CheckCircle, color: 'emerald', label: 'إغلاق التذكرة' },
  wait: { icon: Clock, color: 'slate', label: 'انتظار' },
};

export default function AIWorkflowBuilder({ customerStatement, isActive = false, onWorkflowComplete }) {
  const [workflow, setWorkflow] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatuses, setStepStatuses] = useState({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [showManualEdit, setShowManualEdit] = useState(false);
  const [executionLog, setExecutionLog] = useState([]);
  const [autoExecute, setAutoExecute] = useState(false);

  // Generate Workflow from Customer Statement
  const generateWorkflowMutation = useMutation({
    mutationFn: async (statement) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت محرك سير عمل ذكي لمركز اتصال.

العميل قال: "${statement}"

قم ببناء سير عمل تلقائي لحل المشكلة.

الخطوات المتاحة:
- check_device: فحص حالة الجهاز
- check_sim: فحص نشاط SIM
- diagnostics: إرسال تشخيصات عن بُعد
- ping_test: اختبار الاتصال
- remote_command: إرسال أمر عن بُعد للجهاز
- create_ticket: إنشاء تذكرة دعم
- escalation: تصعيد للمشرف
- send_sms: إرسال SMS للعميل
- send_email: إرسال بريد للعميل
- notify_team: إبلاغ الفريق التقني
- close_ticket: إغلاق التذكرة (إذا تم الحل)
- wait: انتظار استجابة

قم بإنشاء سير عمل منطقي ومتسلسل لحل هذه المشكلة.`,
        response_json_schema: {
          type: "object",
          properties: {
            problem_summary: { type: "string" },
            problem_category: { type: "string" },
            urgency: { type: "string" },
            estimated_resolution_time: { type: "string" },
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  order: { type: "number" },
                  type: { type: "string" },
                  description: { type: "string" },
                  expected_outcome: { type: "string" },
                  fallback_action: { type: "string" },
                  is_auto: { type: "boolean" },
                  timeout_seconds: { type: "number" }
                }
              }
            },
            success_message: { type: "string" },
            failure_escalation: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setWorkflow(data);
      setCurrentStep(0);
      setStepStatuses({});
      setExecutionLog([]);
      toast.success('تم بناء سير العمل بنجاح');
      
      addToLog('info', `تم إنشاء سير عمل: ${data.problem_summary}`);
      addToLog('info', `عدد الخطوات: ${data.steps?.length || 0}`);
    },
  });

  // Execute Single Step
  const executeStepMutation = useMutation({
    mutationFn: async ({ step, index }) => {
      // Simulate step execution
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500));
      
      // Random success/failure for demo
      const success = Math.random() > 0.15;
      
      return {
        success,
        step_index: index,
        result: success ? step.expected_outcome : 'فشل - ' + step.fallback_action,
        timestamp: new Date().toISOString(),
      };
    },
    onSuccess: (result) => {
      setStepStatuses(prev => ({
        ...prev,
        [result.step_index]: result.success ? 'success' : 'failed'
      }));
      
      addToLog(
        result.success ? 'success' : 'error',
        `${workflow.steps[result.step_index].description}: ${result.result}`
      );

      if (result.success && currentStep < workflow.steps.length - 1) {
        setCurrentStep(prev => prev + 1);
        if (autoExecute) {
          // Auto-execute next step
          setTimeout(() => {
            executeStep(currentStep + 1);
          }, 500);
        }
      } else if (!result.success) {
        addToLog('warning', `تم تنفيذ الإجراء البديل: ${workflow.steps[result.step_index].fallback_action}`);
      }
      
      // Check if workflow complete
      if (currentStep === workflow.steps.length - 1 && result.success) {
        setIsExecuting(false);
        addToLog('success', '✅ تم إكمال سير العمل بنجاح!');
        toast.success(workflow.success_message || 'تم حل المشكلة');
        onWorkflowComplete?.({ success: true, workflow });
      }
    },
  });

  const addToLog = (type, message) => {
    setExecutionLog(prev => [...prev, {
      id: Date.now(),
      type,
      message,
      time: new Date().toLocaleTimeString('ar-SA'),
    }]);
  };

  const executeStep = (index) => {
    if (!workflow?.steps?.[index]) return;
    setIsExecuting(true);
    setStepStatuses(prev => ({ ...prev, [index]: 'running' }));
    executeStepMutation.mutate({ step: workflow.steps[index], index });
  };

  const executeAllSteps = async () => {
    setAutoExecute(true);
    setCurrentStep(0);
    executeStep(0);
  };

  const stopExecution = () => {
    setAutoExecute(false);
    setIsExecuting(false);
    addToLog('warning', '⏸️ تم إيقاف التنفيذ');
  };

  useEffect(() => {
    if (customerStatement && isActive) {
      generateWorkflowMutation.mutate(customerStatement);
    }
  }, [customerStatement, isActive]);

  const completedSteps = Object.values(stepStatuses).filter(s => s === 'success').length;
  const progress = workflow?.steps?.length ? (completedSteps / workflow.steps.length) * 100 : 0;

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Workflow className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Workflow Builder</h3>
            <p className="text-slate-400 text-sm">بناء وتنفيذ سير العمل تلقائياً</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {workflow && (
            <>
              <Badge className={`${
                workflow.urgency === 'high' ? 'bg-red-500/20 text-red-400' :
                workflow.urgency === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {workflow.urgency === 'high' ? 'عاجل' : workflow.urgency === 'medium' ? 'متوسط' : 'عادي'}
              </Badge>
              <Badge className="bg-slate-700 text-slate-300">
                {workflow.estimated_resolution_time}
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Customer Statement Input */}
      {!workflow && (
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">ماذا قال العميل؟</span>
            </div>
            <div className="flex gap-2">
              <Textarea
                placeholder="مثال: عندي مشكلة GPS مش بيظهر في الخريطة"
                className="bg-slate-800/50 border-slate-700 text-white min-h-[80px]"
                defaultValue={customerStatement}
              />
            </div>
            <Button 
              className="w-full mt-3 bg-purple-600 hover:bg-purple-700"
              onClick={() => generateWorkflowMutation.mutate(customerStatement)}
              disabled={generateWorkflowMutation.isPending}
            >
              {generateWorkflowMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري بناء سير العمل...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 ml-2" />
                  بناء سير العمل بالذكاء الاصطناعي
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Workflow Display */}
      {workflow && (
        <>
          {/* Problem Summary */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">ملخص المشكلة</span>
                <Badge className="bg-purple-500/20 text-purple-400">{workflow.problem_category}</Badge>
              </div>
              <p className="text-white">{workflow.problem_summary}</p>
            </CardContent>
          </Card>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">التقدم</span>
              <span className="text-white">{completedSteps}/{workflow.steps?.length || 0} خطوات</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Workflow Steps */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm">خطوات سير العمل</CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-600 h-8"
                    onClick={() => setShowManualEdit(true)}
                  >
                    <Edit className="w-3 h-3 ml-1" />
                    تعديل
                  </Button>
                  {isExecuting ? (
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 h-8" onClick={stopExecution}>
                      <Pause className="w-3 h-3 ml-1" />
                      إيقاف
                    </Button>
                  ) : (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={executeAllSteps}>
                      <Play className="w-3 h-3 ml-1" />
                      تنفيذ الكل
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workflow.steps?.map((step, index) => {
                  const stepConfig = stepTypes[step.type] || stepTypes.check_device;
                  const StepIcon = stepConfig.icon;
                  const status = stepStatuses[index];
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-lg border transition-all ${
                        status === 'success' ? 'bg-green-500/10 border-green-500/30' :
                        status === 'failed' ? 'bg-red-500/10 border-red-500/30' :
                        status === 'running' ? 'bg-purple-500/10 border-purple-500/30 animate-pulse' :
                        currentStep === index ? 'bg-cyan-500/10 border-cyan-500/30' :
                        'bg-slate-900/30 border-slate-700/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          status === 'success' ? 'bg-green-500/20' :
                          status === 'failed' ? 'bg-red-500/20' :
                          status === 'running' ? 'bg-purple-500/20' :
                          `bg-${stepConfig.color}-500/20`
                        }`}>
                          {status === 'success' ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : status === 'failed' ? (
                            <XCircle className="w-4 h-4 text-red-400" />
                          ) : status === 'running' ? (
                            <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                          ) : (
                            <StepIcon className={`w-4 h-4 text-${stepConfig.color}-400`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium text-sm">{step.order}. {stepConfig.label}</span>
                            {step.is_auto && (
                              <Badge className="bg-purple-500/20 text-purple-400 text-xs">تلقائي</Badge>
                            )}
                          </div>
                          <p className="text-slate-400 text-xs">{step.description}</p>
                          <p className="text-slate-500 text-xs mt-1">→ {step.expected_outcome}</p>
                        </div>
                        {!status && currentStep === index && !isExecuting && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-cyan-400"
                            onClick={() => executeStep(index)}
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Execution Log */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                سجل التنفيذ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[150px]">
                {executionLog.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-sm">
                    سيظهر سجل التنفيذ هنا
                  </div>
                ) : (
                  <div className="space-y-2">
                    {executionLog.map(log => (
                      <div key={log.id} className="flex items-start gap-2 text-sm">
                        <span className="text-slate-500 text-xs w-16 flex-shrink-0">{log.time}</span>
                        <span className={`${
                          log.type === 'success' ? 'text-green-400' :
                          log.type === 'error' ? 'text-red-400' :
                          log.type === 'warning' ? 'text-amber-400' :
                          'text-slate-300'
                        }`}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Actions on Complete */}
          {progress === 100 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center"
            >
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h4 className="text-green-400 font-bold text-lg mb-2">تم حل المشكلة!</h4>
              <p className="text-slate-300 mb-4">{workflow.success_message}</p>
              <div className="flex justify-center gap-2">
                <Button className="bg-green-600 hover:bg-green-700">
                  <MessageSquare className="w-4 h-4 ml-2" />
                  إرسال تأكيد للعميل
                </Button>
                <Button variant="outline" className="border-slate-600">
                  <Ticket className="w-4 h-4 ml-2" />
                  إغلاق التذكرة
                </Button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}