import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Wand2, Cpu, Zap, Play, CheckCircle, Loader2, Brain, Settings, Target,
  TrendingDown, TrendingUp, AlertTriangle, RefreshCw, Sliders, GitBranch,
  Database, Clock, ArrowRight, Sparkles, Activity, BarChart3, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AIAutomatedOptimization({ modelId, performanceData }) {
  const [optimization, setOptimization] = useState(null);
  const [activeTab, setActiveTab] = useState('hyperparameters');
  const [autoOptimize, setAutoOptimize] = useState(false);
  const [applyingParam, setApplyingParam] = useState(null);
  const [retrainingStatus, setRetrainingStatus] = useState(null);

  // تحليل شامل للتحسين
  const optimizeMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل أداء نموذج AI Vision بعمق وقدم خطة تحسين تلقائي شاملة:

بيانات الأداء الحالية:
- الدقة: ${performanceData?.current_performance?.accuracy || 92}%
- زمن الاستجابة: ${performanceData?.current_performance?.latency_ms || 45}ms
- معدل الأخطاء: ${performanceData?.current_performance?.error_rate || 3.2}%

1. المعلمات الفائقة (Hyperparameters):
   - حدد كل معلمة بدقة مع قيمتها الحالية والمقترحة
   - اشرح سبب التغيير والتأثير المتوقع
   - رتب حسب الأولوية والتأثير

2. البدائل المعمارية:
   - اقترح معماريات بديلة عندما يركد الأداء
   - قدم مقارنة تفصيلية (الدقة، السرعة، الموارد)
   - حدد متى يجب التبديل

3. خطة إعادة التدريب التلقائي:
   - محفزات إعادة التدريب
   - متطلبات البيانات والجودة
   - خطوات التنفيذ التلقائي
   - جدول زمني وموارد

4. تحليل جودة البيانات:
   - مشاكل البيانات المكتشفة
   - تأثيرها على الأداء
   - حلول التصحيح

5. جدول التحسين التلقائي:
   - الإجراءات الفورية
   - الإجراءات قصيرة المدى
   - الإجراءات طويلة المدى`,
        response_json_schema: {
          type: "object",
          properties: {
            hyperparameters: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  param_name: { type: "string" },
                  param_type: { type: "string" },
                  current_value: { type: "string" },
                  suggested_value: { type: "string" },
                  reason: { type: "string" },
                  expected_impact: { type: "string" },
                  priority: { type: "string" },
                  risk_level: { type: "string" }
                }
              }
            },
            architecture_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  architecture_name: { type: "string" },
                  description: { type: "string" },
                  expected_accuracy: { type: "number" },
                  expected_latency: { type: "string" },
                  resource_requirements: { type: "string" },
                  migration_complexity: { type: "string" },
                  when_to_switch: { type: "string" },
                  pros: { type: "array", items: { type: "string" } },
                  cons: { type: "array", items: { type: "string" } }
                }
              }
            },
            retraining_automation: {
              type: "object",
              properties: {
                triggers: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      trigger_type: { type: "string" },
                      condition: { type: "string" },
                      threshold: { type: "string" },
                      action: { type: "string" }
                    }
                  }
                },
                data_requirements: {
                  type: "object",
                  properties: {
                    min_samples: { type: "number" },
                    quality_threshold: { type: "number" },
                    diversity_score: { type: "number" },
                    freshness_days: { type: "number" }
                  }
                },
                execution_steps: { type: "array", items: { type: "string" } },
                estimated_duration: { type: "string" },
                resource_allocation: { type: "string" }
              }
            },
            data_quality_analysis: {
              type: "object",
              properties: {
                issues_detected: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      issue: { type: "string" },
                      severity: { type: "string" },
                      affected_percentage: { type: "number" },
                      solution: { type: "string" }
                    }
                  }
                },
                overall_quality_score: { type: "number" },
                recommendations: { type: "array", items: { type: "string" } }
              }
            },
            optimization_schedule: {
              type: "object",
              properties: {
                immediate_actions: { type: "array", items: { type: "string" } },
                short_term_actions: { type: "array", items: { type: "string" } },
                long_term_actions: { type: "array", items: { type: "string" } }
              }
            },
            performance_forecast: {
              type: "object",
              properties: {
                after_hyperparameter_tuning: { type: "number" },
                after_architecture_change: { type: "number" },
                after_retraining: { type: "number" }
              }
            }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setOptimization(data);
      toast.success('تم إنشاء خطة التحسين التلقائي الشاملة');
    },
    onError: () => {
      toast.error('حدث خطأ في التحليل');
    }
  });

  // تطبيق معلمة
  const applyHyperparameterMutation = useMutation({
    mutationFn: async (param) => {
      setApplyingParam(param.param_name);
      // Simulate applying
      await new Promise(resolve => setTimeout(resolve, 2000));
      return param;
    },
    onSuccess: (param) => {
      setApplyingParam(null);
      toast.success(`تم تطبيق ${param.param_name} بنجاح`);
    }
  });

  // بدء إعادة التدريب
  const startRetrainingMutation = useMutation({
    mutationFn: async () => {
      setRetrainingStatus({ phase: 'preparing', progress: 0 });
      
      // Simulate retraining phases
      const phases = [
        { phase: 'preparing', progress: 10 },
        { phase: 'loading_data', progress: 25 },
        { phase: 'preprocessing', progress: 40 },
        { phase: 'training', progress: 70 },
        { phase: 'evaluating', progress: 90 },
        { phase: 'completed', progress: 100 }
      ];

      for (const p of phases) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setRetrainingStatus(p);
      }

      return { success: true };
    },
    onSuccess: () => {
      toast.success('تم إكمال إعادة التدريب بنجاح');
    }
  });

  useEffect(() => {
    optimizeMutation.mutate();
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'amber';
      case 'low': return 'green';
      default: return 'slate';
    }
  };

  const getRetrainingPhaseLabel = (phase) => {
    switch (phase) {
      case 'preparing': return 'جاري التحضير...';
      case 'loading_data': return 'تحميل البيانات...';
      case 'preprocessing': return 'المعالجة المسبقة...';
      case 'training': return 'التدريب...';
      case 'evaluating': return 'التقييم...';
      case 'completed': return 'اكتمل!';
      default: return phase;
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20"
          >
            <Wand2 className="w-5 h-5 text-purple-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">التحسين التلقائي بالذكاء الاصطناعي</h4>
            <p className="text-slate-400 text-xs">المعلمات • المعماريات • إعادة التدريب</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-lg">
            <Label className="text-slate-300 text-xs">تحسين تلقائي</Label>
            <Switch checked={autoOptimize} onCheckedChange={setAutoOptimize} />
          </div>
          <Button
            variant="outline"
            className="border-purple-500/50"
            onClick={() => optimizeMutation.mutate()}
            disabled={optimizeMutation.isPending}
          >
            {optimizeMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><RefreshCw className="w-4 h-4 ml-1" /> تحليل</>
            )}
          </Button>
        </div>
      </div>

      {optimizeMutation.isPending && !optimization && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-10 h-10 text-purple-400 mx-auto mb-4 animate-spin" />
            <p className="text-white">جاري تحليل النموذج وإنشاء خطة التحسين...</p>
          </CardContent>
        </Card>
      )}

      {optimization && (
        <>
          {/* Performance Forecast */}
          <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-white font-medium">التوقعات بعد التحسين</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                  <Sliders className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                  <p className="text-white font-bold text-lg">{optimization.performance_forecast?.after_hyperparameter_tuning}%</p>
                  <p className="text-slate-400 text-xs">بعد ضبط المعلمات</p>
                </div>
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                  <GitBranch className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                  <p className="text-white font-bold text-lg">{optimization.performance_forecast?.after_architecture_change}%</p>
                  <p className="text-slate-400 text-xs">بعد تغيير المعمارية</p>
                </div>
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-green-400 mx-auto mb-1" />
                  <p className="text-white font-bold text-lg">{optimization.performance_forecast?.after_retraining}%</p>
                  <p className="text-slate-400 text-xs">بعد إعادة التدريب</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
              <TabsTrigger value="hyperparameters" className="data-[state=active]:bg-purple-500/20">
                <Sliders className="w-3 h-3 ml-1" />
                المعلمات
              </TabsTrigger>
              <TabsTrigger value="architectures" className="data-[state=active]:bg-cyan-500/20">
                <GitBranch className="w-3 h-3 ml-1" />
                المعماريات
              </TabsTrigger>
              <TabsTrigger value="retraining" className="data-[state=active]:bg-green-500/20">
                <RefreshCw className="w-3 h-3 ml-1" />
                إعادة التدريب
              </TabsTrigger>
              <TabsTrigger value="data-quality" className="data-[state=active]:bg-amber-500/20">
                <Database className="w-3 h-3 ml-1" />
                جودة البيانات
              </TabsTrigger>
              <TabsTrigger value="schedule" className="data-[state=active]:bg-blue-500/20">
                <Clock className="w-3 h-3 ml-1" />
                الجدول
              </TabsTrigger>
            </TabsList>

            {/* Hyperparameters Tab */}
            <TabsContent value="hyperparameters" className="mt-4">
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    المعلمات الفائقة المقترحة للضبط
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-3">
                      {optimization.hyperparameters?.map((hp, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge className={`bg-${getPriorityColor(hp.priority)}-500/20 text-${getPriorityColor(hp.priority)}-400 text-xs`}>
                                {hp.priority}
                              </Badge>
                              <span className="text-white font-bold">{hp.param_name}</span>
                              <Badge variant="outline" className="text-xs border-slate-600">{hp.param_type}</Badge>
                            </div>
                            <Badge className={`text-xs ${
                              hp.risk_level === 'low' ? 'bg-green-500/20 text-green-400' :
                              hp.risk_level === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              خطر {hp.risk_level}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="p-2 bg-slate-800/50 rounded text-center">
                              <p className="text-slate-400 text-xs mb-1">القيمة الحالية</p>
                              <p className="text-white font-mono">{hp.current_value}</p>
                            </div>
                            <div className="p-2 bg-purple-500/10 rounded text-center border border-purple-500/30">
                              <p className="text-purple-400 text-xs mb-1">القيمة المقترحة</p>
                              <p className="text-white font-mono font-bold">{hp.suggested_value}</p>
                            </div>
                          </div>

                          <p className="text-slate-300 text-sm mb-2">{hp.reason}</p>
                          <p className="text-green-400 text-xs mb-3">التأثير المتوقع: {hp.expected_impact}</p>

                          <Button
                            size="sm"
                            className="w-full bg-purple-600 hover:bg-purple-700 h-8"
                            onClick={() => applyHyperparameterMutation.mutate(hp)}
                            disabled={applyingParam === hp.param_name}
                          >
                            {applyingParam === hp.param_name ? (
                              <><Loader2 className="w-3 h-3 animate-spin ml-1" /> جاري التطبيق...</>
                            ) : (
                              <><Zap className="w-3 h-3 ml-1" /> تطبيق التغيير</>
                            )}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Architectures Tab */}
            <TabsContent value="architectures" className="mt-4">
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-cyan-400" />
                    البدائل المعمارية الموصى بها
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-4">
                      {optimization.architecture_recommendations?.map((arch, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.15 }}
                          className="p-4 bg-cyan-500/5 rounded-lg border border-cyan-500/20"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h5 className="text-white font-bold text-lg">{arch.architecture_name}</h5>
                              <p className="text-slate-400 text-sm">{arch.description}</p>
                            </div>
                            <Badge className={`text-xs ${
                              arch.migration_complexity === 'low' ? 'bg-green-500/20 text-green-400' :
                              arch.migration_complexity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              تعقيد {arch.migration_complexity}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="p-2 bg-slate-900/50 rounded text-center">
                              <Target className="w-4 h-4 text-green-400 mx-auto mb-1" />
                              <p className="text-white font-bold">{arch.expected_accuracy}%</p>
                              <p className="text-slate-400 text-xs">الدقة المتوقعة</p>
                            </div>
                            <div className="p-2 bg-slate-900/50 rounded text-center">
                              <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                              <p className="text-white font-bold text-sm">{arch.expected_latency}</p>
                              <p className="text-slate-400 text-xs">التأخير</p>
                            </div>
                            <div className="p-2 bg-slate-900/50 rounded text-center">
                              <Cpu className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                              <p className="text-white font-bold text-sm">{arch.resource_requirements}</p>
                              <p className="text-slate-400 text-xs">الموارد</p>
                            </div>
                          </div>

                          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 mb-3">
                            <p className="text-amber-400 text-xs font-medium mb-1">متى يجب التبديل:</p>
                            <p className="text-slate-300 text-sm">{arch.when_to_switch}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <p className="text-green-400 text-xs font-medium mb-1">المميزات:</p>
                              <ul className="space-y-1">
                                {arch.pros?.map((pro, j) => (
                                  <li key={j} className="text-slate-300 text-xs flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-green-400" />
                                    {pro}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-red-400 text-xs font-medium mb-1">العيوب:</p>
                              <ul className="space-y-1">
                                {arch.cons?.map((con, j) => (
                                  <li key={j} className="text-slate-300 text-xs flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-red-400" />
                                    {con}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <Button size="sm" className="w-full bg-cyan-600 hover:bg-cyan-700 h-8">
                            <GitBranch className="w-3 h-3 ml-1" />
                            بدء الترحيل
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Retraining Tab */}
            <TabsContent value="retraining" className="mt-4 space-y-4">
              {/* Retraining Status */}
              {retrainingStatus && (
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-medium">حالة إعادة التدريب</span>
                      <Badge className={retrainingStatus.phase === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}>
                        {getRetrainingPhaseLabel(retrainingStatus.phase)}
                      </Badge>
                    </div>
                    <Progress value={retrainingStatus.progress} className="h-3 mb-2" />
                    <p className="text-slate-400 text-xs text-center">{retrainingStatus.progress}% مكتمل</p>
                  </CardContent>
                </Card>
              )}

              {/* Triggers */}
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    محفزات إعادة التدريب التلقائي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {optimization.retraining_automation?.triggers?.map((trigger, i) => (
                      <div key={i} className="p-3 bg-slate-900/50 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{trigger.trigger_type}</p>
                          <p className="text-slate-400 text-xs">{trigger.condition}</p>
                        </div>
                        <div className="text-left">
                          <Badge variant="outline" className="border-amber-500/50 text-amber-400 text-xs">
                            حد: {trigger.threshold}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Data Requirements & Execution */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Database className="w-4 h-4 text-cyan-400" />
                      متطلبات البيانات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">الحد الأدنى للعينات</span>
                        <span className="text-white font-bold">{optimization.retraining_automation?.data_requirements?.min_samples?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">حد الجودة</span>
                        <span className="text-white font-bold">{optimization.retraining_automation?.data_requirements?.quality_threshold}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">درجة التنوع</span>
                        <span className="text-white font-bold">{optimization.retraining_automation?.data_requirements?.diversity_score}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">حداثة البيانات</span>
                        <span className="text-white font-bold">{optimization.retraining_automation?.data_requirements?.freshness_days} يوم</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-400" />
                      معلومات التنفيذ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">المدة المتوقعة</span>
                        <span className="text-white font-bold">{optimization.retraining_automation?.estimated_duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">الموارد</span>
                        <span className="text-white font-bold">{optimization.retraining_automation?.resource_allocation}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-slate-400 text-xs mb-2">خطوات التنفيذ:</p>
                      <ol className="space-y-1">
                        {optimization.retraining_automation?.execution_steps?.map((step, i) => (
                          <li key={i} className="text-slate-300 text-xs flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-[10px]">{i + 1}</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Start Retraining Button */}
              <Button
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12"
                onClick={() => startRetrainingMutation.mutate()}
                disabled={startRetrainingMutation.isPending || retrainingStatus?.phase === 'completed'}
              >
                {startRetrainingMutation.isPending ? (
                  <><Loader2 className="w-5 h-5 animate-spin ml-2" /> جاري إعادة التدريب...</>
                ) : (
                  <><Play className="w-5 h-5 ml-2" /> بدء إعادة التدريب التلقائي</>
                )}
              </Button>
            </TabsContent>

            {/* Data Quality Tab */}
            <TabsContent value="data-quality" className="mt-4">
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Database className="w-4 h-4 text-amber-400" />
                      تحليل جودة البيانات
                    </CardTitle>
                    <Badge className={`${
                      (optimization.data_quality_analysis?.overall_quality_score || 0) >= 80 ? 'bg-green-500/20 text-green-400' :
                      (optimization.data_quality_analysis?.overall_quality_score || 0) >= 60 ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      الجودة: {optimization.data_quality_analysis?.overall_quality_score}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[280px]">
                    <div className="space-y-3">
                      {optimization.data_quality_analysis?.issues_detected?.map((issue, i) => (
                        <div key={i} className={`p-3 rounded-lg border ${
                          issue.severity === 'high' ? 'bg-red-500/10 border-red-500/30' :
                          issue.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
                          'bg-slate-900/50 border-slate-700/50'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{issue.issue}</span>
                            <Badge className={`text-xs ${
                              issue.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                              issue.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>{issue.severity}</Badge>
                          </div>
                          <p className="text-slate-400 text-xs mb-1">متأثر: {issue.affected_percentage}% من البيانات</p>
                          <p className="text-green-400 text-xs">الحل: {issue.solution}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  {optimization.data_quality_analysis?.recommendations?.length > 0 && (
                    <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                      <p className="text-cyan-400 text-xs font-medium mb-2">التوصيات:</p>
                      <ul className="space-y-1">
                        {optimization.data_quality_analysis.recommendations.map((rec, i) => (
                          <li key={i} className="text-slate-300 text-xs flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="mt-4">
              <div className="space-y-4">
                {/* Immediate Actions */}
                <Card className="bg-red-500/10 border-red-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 text-red-400" />
                      إجراءات فورية
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {optimization.optimization_schedule?.immediate_actions?.map((action, i) => (
                        <li key={i} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                          <span className="text-slate-300 text-sm flex items-center gap-2">
                            <ArrowRight className="w-3 h-3 text-red-400" />
                            {action}
                          </span>
                          <Button size="sm" variant="outline" className="h-6 text-xs border-red-500/50 text-red-400">تنفيذ</Button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Short-term Actions */}
                <Card className="bg-amber-500/10 border-amber-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      إجراءات قصيرة المدى (1-2 أسبوع)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {optimization.optimization_schedule?.short_term_actions?.map((action, i) => (
                        <li key={i} className="text-slate-300 text-sm flex items-center gap-2 p-2 bg-slate-900/50 rounded">
                          <ArrowRight className="w-3 h-3 text-amber-400" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Long-term Actions */}
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-400" />
                      إجراءات طويلة المدى (1-3 شهور)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {optimization.optimization_schedule?.long_term_actions?.map((action, i) => (
                        <li key={i} className="text-slate-300 text-sm flex items-center gap-2 p-2 bg-slate-900/50 rounded">
                          <ArrowRight className="w-3 h-3 text-green-400" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}