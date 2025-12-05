import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Rocket, Shield, TrendingUp, AlertTriangle, CheckCircle, Brain,
  RotateCcw, Activity, Loader2, RefreshCw, Play, Pause, Settings,
  BarChart3, Target, Zap, Clock, GitBranch, Server, Eye, AlertOctagon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { toast } from 'sonner';

const deploymentStrategies = [
  { value: 'canary', label: 'نشر كناري (Canary)', description: 'نشر تدريجي لنسبة صغيرة من الحركة' },
  { value: 'blue_green', label: 'أزرق-أخضر (Blue-Green)', description: 'نشر موازٍ مع تبديل فوري' },
  { value: 'rolling', label: 'متدحرج (Rolling)', description: 'تحديث تدريجي للمثيلات' },
  { value: 'shadow', label: 'نشر ظلي (Shadow)', description: 'اختبار في الإنتاج دون تأثير' },
  { value: 'a_b', label: 'اختبار A/B', description: 'مقارنة مباشرة بين الإصدارات' }
];

export default function AIDeploymentLifecycle({ modelId, modelName, currentVersion }) {
  const [lifecycle, setLifecycle] = useState(null);
  const [activeTab, setActiveTab] = useState('deploy');
  const [autoRollback, setAutoRollback] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState('canary');
  const [canaryPercentage, setCanaryPercentage] = useState([10]);
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [deploymentHistory, setDeploymentHistory] = useState([]);

  // تحليل دورة حياة النشر
  const analyzeLifecycleMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل شامل لدورة حياة نشر نموذج الذكاء الاصطناعي وتقديم:

1. تحليل جاهزية النشر:
   - تقييم جودة النموذج
   - اختبارات مطلوبة
   - تقييم المخاطر

2. استراتيجية النشر المُوصى بها:
   - نوع الاستراتيجية المثلى
   - التبرير
   - الجدول الزمني المقترح

3. تنبؤات النشر:
   - احتمالية النجاح
   - الموارد المطلوبة
   - التأثير المتوقع على الأداء

4. آلية التراجع التلقائي:
   - المحفزات
   - الخطوات
   - وقت الاستجابة

5. مراقبة ما بعد النشر:
   - المقاييس الرئيسية
   - العتبات
   - التنبيهات`,
        response_json_schema: {
          type: "object",
          properties: {
            deployment_readiness: {
              type: "object",
              properties: {
                overall_score: { type: "number" },
                model_quality_score: { type: "number" },
                test_coverage: { type: "number" },
                risk_assessment: {
                  type: "object",
                  properties: {
                    level: { type: "string" },
                    factors: { type: "array", items: { type: "string" } },
                    mitigations: { type: "array", items: { type: "string" } }
                  }
                },
                required_tests: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      status: { type: "string" },
                      result: { type: "string" }
                    }
                  }
                },
                blockers: { type: "array", items: { type: "string" } },
                warnings: { type: "array", items: { type: "string" } }
              }
            },
            recommended_strategy: {
              type: "object",
              properties: {
                strategy: { type: "string" },
                reasoning: { type: "string" },
                timeline: { type: "string" },
                phases: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      phase: { type: "string" },
                      duration: { type: "string" },
                      traffic_percentage: { type: "number" },
                      success_criteria: { type: "string" }
                    }
                  }
                }
              }
            },
            predictions: {
              type: "object",
              properties: {
                success_probability: { type: "number" },
                estimated_deployment_time: { type: "string" },
                resource_requirements: {
                  type: "object",
                  properties: {
                    cpu: { type: "string" },
                    memory: { type: "string" },
                    gpu: { type: "string" },
                    estimated_cost: { type: "string" }
                  }
                },
                performance_impact: {
                  type: "object",
                  properties: {
                    latency_change: { type: "string" },
                    throughput_change: { type: "string" },
                    accuracy_change: { type: "string" }
                  }
                }
              }
            },
            rollback_mechanism: {
              type: "object",
              properties: {
                automatic: { type: "boolean" },
                triggers: { type: "array", items: { type: "string" } },
                steps: { type: "array", items: { type: "string" } },
                estimated_rollback_time: { type: "string" },
                fallback_version: { type: "string" }
              }
            },
            post_deployment_monitoring: {
              type: "object",
              properties: {
                key_metrics: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      metric: { type: "string" },
                      current_value: { type: "string" },
                      threshold: { type: "string" },
                      alert_severity: { type: "string" }
                    }
                  }
                },
                monitoring_duration: { type: "string" },
                escalation_path: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setLifecycle(data);
      toast.success('تم تحليل دورة حياة النشر');
    },
    onError: () => {
      toast.error('حدث خطأ في التحليل');
    }
  });

  // تنفيذ النشر
  const deployModelMutation = useMutation({
    mutationFn: async (config) => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { 
        success: true, 
        deployment_id: `DEP-${Date.now()}`,
        version: currentVersion,
        strategy: config.strategy,
        timestamp: new Date().toISOString()
      };
    },
    onSuccess: (data) => {
      setDeploymentHistory(prev => [data, ...prev]);
      setShowDeployDialog(false);
      toast.success('تم بدء النشر بنجاح');
    }
  });

  // التراجع
  const rollbackMutation = useMutation({
    mutationFn: async (targetVersion) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, rolled_back_to: targetVersion };
    },
    onSuccess: (data) => {
      toast.success(`تم التراجع إلى الإصدار ${data.rolled_back_to}`);
    }
  });

  useEffect(() => {
    analyzeLifecycleMutation.mutate();
  }, []);

  const getReadinessColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'amber';
    return 'red';
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20"
          >
            <Rocket className="w-5 h-5 text-blue-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">إدارة دورة حياة النشر الذكية</h4>
            <p className="text-slate-400 text-xs">النشر التلقائي • التراجع الذكي • التنبؤات</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-lg">
            <Label className="text-slate-300 text-xs">تراجع تلقائي</Label>
            <Switch checked={autoRollback} onCheckedChange={setAutoRollback} />
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowDeployDialog(true)}
            disabled={lifecycle?.deployment_readiness?.overall_score < 60}
          >
            <Rocket className="w-4 h-4 ml-1" />
            نشر النموذج
          </Button>
          <Button
            variant="outline"
            className="border-slate-600"
            onClick={() => analyzeLifecycleMutation.mutate()}
            disabled={analyzeLifecycleMutation.isPending}
          >
            {analyzeLifecycleMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {analyzeLifecycleMutation.isPending && !lifecycle && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-10 h-10 text-blue-400 mx-auto mb-4 animate-spin" />
            <p className="text-white">جاري تحليل دورة حياة النشر...</p>
          </CardContent>
        </Card>
      )}

      {lifecycle && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className={`bg-${getReadinessColor(lifecycle.deployment_readiness?.overall_score || 0)}-500/10 border-${getReadinessColor(lifecycle.deployment_readiness?.overall_score || 0)}-500/30`}>
              <CardContent className="p-3 text-center">
                <CheckCircle className={`w-5 h-5 text-${getReadinessColor(lifecycle.deployment_readiness?.overall_score || 0)}-400 mx-auto mb-1`} />
                <p className="text-2xl font-bold text-white">{lifecycle.deployment_readiness?.overall_score || 0}%</p>
                <p className="text-slate-400 text-xs">جاهزية النشر</p>
              </CardContent>
            </Card>
            <Card className={`bg-${lifecycle.predictions?.success_probability >= 80 ? 'green' : lifecycle.predictions?.success_probability >= 60 ? 'amber' : 'red'}-500/10 border-${lifecycle.predictions?.success_probability >= 80 ? 'green' : lifecycle.predictions?.success_probability >= 60 ? 'amber' : 'red'}-500/30`}>
              <CardContent className="p-3 text-center">
                <Target className={`w-5 h-5 text-${lifecycle.predictions?.success_probability >= 80 ? 'green' : lifecycle.predictions?.success_probability >= 60 ? 'amber' : 'red'}-400 mx-auto mb-1`} />
                <p className="text-2xl font-bold text-white">{lifecycle.predictions?.success_probability || 0}%</p>
                <p className="text-slate-400 text-xs">احتمالية النجاح</p>
              </CardContent>
            </Card>
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardContent className="p-3 text-center">
                <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{lifecycle.predictions?.estimated_deployment_time || 'N/A'}</p>
                <p className="text-slate-400 text-xs">وقت النشر المتوقع</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-3 text-center">
                <RotateCcw className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{lifecycle.rollback_mechanism?.estimated_rollback_time || 'N/A'}</p>
                <p className="text-slate-400 text-xs">وقت التراجع</p>
              </CardContent>
            </Card>
          </div>

          {/* Blockers Warning */}
          {lifecycle.deployment_readiness?.blockers?.length > 0 && (
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertOctagon className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-medium">عوائق النشر</span>
                </div>
                <ul className="space-y-1">
                  {lifecycle.deployment_readiness.blockers.map((blocker, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-red-400">•</span>
                      {blocker}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
              <TabsTrigger value="deploy" className="data-[state=active]:bg-blue-500/20">
                <Rocket className="w-3 h-3 ml-1" />
                النشر
              </TabsTrigger>
              <TabsTrigger value="rollback" className="data-[state=active]:bg-purple-500/20">
                <RotateCcw className="w-3 h-3 ml-1" />
                التراجع
              </TabsTrigger>
              <TabsTrigger value="predictions" className="data-[state=active]:bg-cyan-500/20">
                <Brain className="w-3 h-3 ml-1" />
                التنبؤات
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="data-[state=active]:bg-green-500/20">
                <Activity className="w-3 h-3 ml-1" />
                المراقبة
              </TabsTrigger>
            </TabsList>

            {/* Deploy Tab */}
            <TabsContent value="deploy" className="mt-4 space-y-4">
              {/* Readiness Tests */}
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    اختبارات الجاهزية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {lifecycle.deployment_readiness?.required_tests?.map((test, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                        <div className="flex items-center gap-2">
                          {test.status === 'passed' ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : test.status === 'failed' ? (
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-400" />
                          )}
                          <span className="text-white text-sm">{test.name}</span>
                        </div>
                        <Badge className={`text-xs ${
                          test.status === 'passed' ? 'bg-green-500/20 text-green-400' :
                          test.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {test.result}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommended Strategy */}
              <Card className="bg-blue-500/10 border-blue-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    استراتيجية النشر الموصى بها
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold text-lg">{lifecycle.recommended_strategy?.strategy}</span>
                      <Badge className="bg-blue-500/20 text-blue-400">{lifecycle.recommended_strategy?.timeline}</Badge>
                    </div>
                    <p className="text-slate-300 text-sm">{lifecycle.recommended_strategy?.reasoning}</p>
                    
                    {/* Deployment Phases */}
                    <div className="space-y-2">
                      <p className="text-slate-400 text-xs">مراحل النشر:</p>
                      {lifecycle.recommended_strategy?.phases?.map((phase, i) => (
                        <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{phase.phase}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-slate-600 text-xs">{phase.duration}</Badge>
                              <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">{phase.traffic_percentage}%</Badge>
                            </div>
                          </div>
                          <p className="text-slate-400 text-xs">معيار النجاح: {phase.success_criteria}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Assessment */}
              <Card className={`bg-${lifecycle.deployment_readiness?.risk_assessment?.level === 'high' ? 'red' : lifecycle.deployment_readiness?.risk_assessment?.level === 'medium' ? 'amber' : 'green'}-500/10 border-${lifecycle.deployment_readiness?.risk_assessment?.level === 'high' ? 'red' : lifecycle.deployment_readiness?.risk_assessment?.level === 'medium' ? 'amber' : 'green'}-500/30`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    تقييم المخاطر
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge className={`${
                      lifecycle.deployment_readiness?.risk_assessment?.level === 'high' ? 'bg-red-500/20 text-red-400' :
                      lifecycle.deployment_readiness?.risk_assessment?.level === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      مستوى المخاطر: {lifecycle.deployment_readiness?.risk_assessment?.level}
                    </Badge>
                    <div>
                      <p className="text-slate-400 text-xs mb-1">عوامل الخطر:</p>
                      <ul className="space-y-1">
                        {lifecycle.deployment_readiness?.risk_assessment?.factors?.map((factor, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-1">إجراءات التخفيف:</p>
                      <ul className="space-y-1">
                        {lifecycle.deployment_readiness?.risk_assessment?.mitigations?.map((mitigation, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            {mitigation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rollback Tab */}
            <TabsContent value="rollback" className="mt-4 space-y-4">
              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-purple-400" />
                    آلية التراجع الذكية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">التراجع التلقائي</p>
                      <p className="text-slate-400 text-xs">تفعيل التراجع عند اكتشاف مشاكل</p>
                    </div>
                    <Switch checked={autoRollback} onCheckedChange={setAutoRollback} />
                  </div>

                  <div>
                    <p className="text-slate-400 text-xs mb-2">محفزات التراجع:</p>
                    <div className="space-y-2">
                      {lifecycle.rollback_mechanism?.triggers?.map((trigger, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-slate-900/50 rounded">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <span className="text-slate-300 text-sm">{trigger}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-400 text-xs mb-2">خطوات التراجع:</p>
                    <div className="space-y-2">
                      {lifecycle.rollback_mechanism?.steps?.map((step, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-slate-900/50 rounded">
                          <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm">{i + 1}</span>
                          <span className="text-slate-300 text-sm">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <div>
                      <p className="text-slate-400 text-xs">الإصدار الاحتياطي</p>
                      <p className="text-white font-medium">{lifecycle.rollback_mechanism?.fallback_version}</p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-purple-500/50"
                      onClick={() => rollbackMutation.mutate(lifecycle.rollback_mechanism?.fallback_version)}
                      disabled={rollbackMutation.isPending}
                    >
                      {rollbackMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <><RotateCcw className="w-4 h-4 ml-1" /> تراجع يدوي</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Deployment History */}
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-cyan-400" />
                    سجل النشر
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {deploymentHistory.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">لا يوجد سجل نشر</p>
                  ) : (
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {deploymentHistory.map((dep, i) => (
                          <div key={i} className="p-3 bg-slate-900/50 rounded-lg flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-medium">{dep.deployment_id}</span>
                                <Badge className="bg-blue-500/20 text-blue-400 text-xs">{dep.strategy}</Badge>
                              </div>
                              <p className="text-slate-400 text-xs">{new Date(dep.timestamp).toLocaleString('ar-SA')}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600 h-7"
                              onClick={() => rollbackMutation.mutate(dep.version)}
                            >
                              <RotateCcw className="w-3 h-3 ml-1" />
                              تراجع
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Predictions Tab */}
            <TabsContent value="predictions" className="mt-4 space-y-4">
              {/* Resource Requirements */}
              <Card className="bg-cyan-500/10 border-cyan-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Server className="w-4 h-4 text-cyan-400" />
                    الموارد المطلوبة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                      <p className="text-white font-bold">{lifecycle.predictions?.resource_requirements?.cpu}</p>
                      <p className="text-slate-400 text-xs">CPU</p>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                      <p className="text-white font-bold">{lifecycle.predictions?.resource_requirements?.memory}</p>
                      <p className="text-slate-400 text-xs">الذاكرة</p>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                      <p className="text-white font-bold">{lifecycle.predictions?.resource_requirements?.gpu}</p>
                      <p className="text-slate-400 text-xs">GPU</p>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                      <p className="text-white font-bold">{lifecycle.predictions?.resource_requirements?.estimated_cost}</p>
                      <p className="text-slate-400 text-xs">التكلفة المتوقعة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Impact */}
              <Card className="bg-green-500/10 border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    التأثير المتوقع على الأداء
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                      <p className="text-white font-bold">{lifecycle.predictions?.performance_impact?.latency_change}</p>
                      <p className="text-slate-400 text-xs">التأخير</p>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                      <p className="text-white font-bold">{lifecycle.predictions?.performance_impact?.throughput_change}</p>
                      <p className="text-slate-400 text-xs">الإنتاجية</p>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                      <p className="text-white font-bold">{lifecycle.predictions?.performance_impact?.accuracy_change}</p>
                      <p className="text-slate-400 text-xs">الدقة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Monitoring Tab */}
            <TabsContent value="monitoring" className="mt-4">
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-400" />
                    مراقبة ما بعد النشر
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-300 text-sm">
                    مدة المراقبة: <span className="text-cyan-400">{lifecycle.post_deployment_monitoring?.monitoring_duration}</span>
                  </p>

                  <div>
                    <p className="text-slate-400 text-xs mb-2">المقاييس الرئيسية:</p>
                    <div className="space-y-2">
                      {lifecycle.post_deployment_monitoring?.key_metrics?.map((metric, i) => (
                        <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{metric.metric}</span>
                            <Badge className={`text-xs ${
                              metric.alert_severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                              metric.alert_severity === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>{metric.alert_severity}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">الحالي: <span className="text-white">{metric.current_value}</span></span>
                            <span className="text-slate-400">العتبة: <span className="text-amber-400">{metric.threshold}</span></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-400 text-xs mb-2">مسار التصعيد:</p>
                    <div className="flex items-center gap-2">
                      {lifecycle.post_deployment_monitoring?.escalation_path?.map((step, i) => (
                        <React.Fragment key={i}>
                          <Badge variant="outline" className="border-slate-600">{step}</Badge>
                          {i < lifecycle.post_deployment_monitoring.escalation_path.length - 1 && (
                            <span className="text-slate-500">→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Deploy Dialog */}
      <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Rocket className="w-5 h-5 text-blue-400" />
              نشر النموذج
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300 text-sm">استراتيجية النشر</Label>
              <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {deploymentStrategies.map(s => (
                    <SelectItem key={s.value} value={s.value}>
                      <div>
                        <p>{s.label}</p>
                        <p className="text-slate-400 text-xs">{s.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStrategy === 'canary' && (
              <div>
                <Label className="text-slate-300 text-sm">نسبة حركة المرور الأولية: {canaryPercentage[0]}%</Label>
                <Slider
                  value={canaryPercentage}
                  onValueChange={setCanaryPercentage}
                  max={50}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>
            )}

            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">احتمالية النجاح</span>
                <span className="text-green-400 font-bold">{lifecycle?.predictions?.success_probability || 0}%</span>
              </div>
              <Progress value={lifecycle?.predictions?.success_probability || 0} className="h-2" />
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span className="text-slate-300 text-sm">التراجع التلقائي</span>
              </div>
              <Switch checked={autoRollback} onCheckedChange={setAutoRollback} />
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => deployModelMutation.mutate({ strategy: selectedStrategy, canaryPercentage: canaryPercentage[0] })}
              disabled={deployModelMutation.isPending}
            >
              {deployModelMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري النشر...</>
              ) : (
                <><Rocket className="w-4 h-4 ml-2" /> بدء النشر</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}