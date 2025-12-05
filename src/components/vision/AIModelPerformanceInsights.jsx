import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  BarChart3, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Brain,
  Zap, Target, Activity, Loader2, RefreshCw, Eye, Settings, Cpu,
  GitBranch, Clock, Search, Lightbulb, Wrench, Database
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { toast } from 'sonner';
import AIAutomatedOptimization from './AIAutomatedOptimization';

const performanceHistory = [
  { date: 'الأسبوع 1', accuracy: 94.2, latency: 45, errors: 12 },
  { date: 'الأسبوع 2', accuracy: 93.8, latency: 48, errors: 18 },
  { date: 'الأسبوع 3', accuracy: 92.5, latency: 52, errors: 25 },
  { date: 'الأسبوع 4', accuracy: 91.1, latency: 58, errors: 32 },
  { date: 'الأسبوع 5', accuracy: 93.5, latency: 46, errors: 15 },
  { date: 'الأسبوع 6', accuracy: 95.2, latency: 42, errors: 8 },
];

export default function AIModelPerformanceInsights({ modelId, modelName }) {
  const [insights, setInsights] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedModel, setSelectedModel] = useState('all');

  const analyzePerformanceMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل أداء نموذج AI بعمق وقدم:

1. تحليل الأسباب الجذرية لتدهور الأداء:
   - العوامل المؤثرة
   - ارتباطات البيانات
   - التغييرات البيئية

2. التنبؤ بالأداء المستقبلي:
   - اتجاهات الدقة
   - توقعات زمن الاستجابة
   - احتمالية المشاكل

3. استراتيجيات التحسين:
   - إعادة التدريب بالبيانات الجديدة
   - ضبط المعلمات الفائقة
   - بدائل معمارية

4. توصيات محددة قابلة للتنفيذ`,
        response_json_schema: {
          type: "object",
          properties: {
            current_performance: {
              type: "object",
              properties: {
                accuracy: { type: "number" },
                latency_ms: { type: "number" },
                error_rate: { type: "number" },
                throughput: { type: "number" },
                health_score: { type: "number" }
              }
            },
            root_cause_analysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  root_cause: { type: "string" },
                  contributing_factors: { type: "array", items: { type: "string" } },
                  impact: { type: "string" },
                  confidence: { type: "number" }
                }
              }
            },
            performance_predictions: {
              type: "object",
              properties: {
                accuracy_trend: { type: "string" },
                predicted_accuracy_7d: { type: "number" },
                predicted_accuracy_30d: { type: "number" },
                latency_trend: { type: "string" },
                risk_of_degradation: { type: "number" },
                recommended_action_date: { type: "string" }
              }
            },
            optimization_strategies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  strategy: { type: "string" },
                  type: { type: "string" },
                  description: { type: "string" },
                  expected_improvement: { type: "string" },
                  effort: { type: "string" },
                  priority: { type: "string" },
                  steps: { type: "array", items: { type: "string" } }
                }
              }
            },
            data_quality_insights: {
              type: "object",
              properties: {
                drift_detected: { type: "boolean" },
                drift_severity: { type: "string" },
                affected_features: { type: "array", items: { type: "string" } },
                recommended_data_actions: { type: "array", items: { type: "string" } }
              }
            },
            actionable_recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setInsights(data);
      toast.success('تم تحليل أداء النموذج');
    }
  });

  useEffect(() => {
    analyzePerformanceMutation.mutate();
  }, []);

  const getHealthColor = (score) => {
    if (score >= 90) return 'green';
    if (score >= 70) return 'amber';
    return 'red';
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20"
          >
            <BarChart3 className="w-5 h-5 text-emerald-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">رؤى أداء النموذج المتقدمة</h4>
            <p className="text-slate-400 text-xs">الأسباب الجذرية • التنبؤات • التحسينات</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="border-emerald-500/50"
          onClick={() => analyzePerformanceMutation.mutate()}
          disabled={analyzePerformanceMutation.isPending}
        >
          {analyzePerformanceMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </Button>
      </div>

      {analyzePerformanceMutation.isPending && !insights && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-10 h-10 text-emerald-400 mx-auto mb-4 animate-spin" />
            <p className="text-white">جاري تحليل أداء النموذج...</p>
          </CardContent>
        </Card>
      )}

      {insights && (
        <>
          {/* Current Performance */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className={`bg-${getHealthColor(insights.current_performance?.health_score || 0)}-500/10 border-${getHealthColor(insights.current_performance?.health_score || 0)}-500/30`}>
              <CardContent className="p-3 text-center">
                <Activity className={`w-5 h-5 text-${getHealthColor(insights.current_performance?.health_score || 0)}-400 mx-auto mb-1`} />
                <p className="text-xl font-bold text-white">{insights.current_performance?.health_score}%</p>
                <p className="text-slate-400 text-xs">صحة النموذج</p>
              </CardContent>
            </Card>
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardContent className="p-3 text-center">
                <Target className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{insights.current_performance?.accuracy}%</p>
                <p className="text-slate-400 text-xs">الدقة</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-3 text-center">
                <Clock className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{insights.current_performance?.latency_ms}ms</p>
                <p className="text-slate-400 text-xs">زمن الاستجابة</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-3 text-center">
                <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{insights.current_performance?.error_rate}%</p>
                <p className="text-slate-400 text-xs">معدل الأخطاء</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="p-3 text-center">
                <Zap className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{insights.current_performance?.throughput}</p>
                <p className="text-slate-400 text-xs">الإنتاجية/ث</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">تطور الأداء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} name="الدقة" />
                    <Line type="monotone" dataKey="latency" stroke="#a855f7" strokeWidth={2} name="التأخير" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-500/20">
                <Eye className="w-3 h-3 ml-1" />
                نظرة عامة
              </TabsTrigger>
              <TabsTrigger value="root-cause" className="data-[state=active]:bg-red-500/20">
                <Search className="w-3 h-3 ml-1" />
                الأسباب الجذرية
              </TabsTrigger>
              <TabsTrigger value="predictions" className="data-[state=active]:bg-purple-500/20">
                <TrendingUp className="w-3 h-3 ml-1" />
                التنبؤات
              </TabsTrigger>
              <TabsTrigger value="optimizations" className="data-[state=active]:bg-cyan-500/20">
                <Wrench className="w-3 h-3 ml-1" />
                التحسينات
              </TabsTrigger>
              <TabsTrigger value="automated" className="data-[state=active]:bg-purple-500/20">
                <Zap className="w-3 h-3 ml-1" />
                تحسين تلقائي
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              {/* Data Quality Alert */}
              {insights.data_quality_insights?.drift_detected && (
                <Card className="bg-amber-500/10 border-amber-500/30 mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-5 h-5 text-amber-400" />
                      <span className="text-amber-400 font-medium">انحراف بيانات مكتشف</span>
                      <Badge className="bg-amber-500/20 text-amber-400">{insights.data_quality_insights.drift_severity}</Badge>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">الميزات المتأثرة: {insights.data_quality_insights.affected_features?.join(', ')}</p>
                    <div className="space-y-1">
                      {insights.data_quality_insights.recommended_data_actions?.map((action, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          {action}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actionable Recommendations */}
              <Card className="bg-emerald-500/10 border-emerald-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-emerald-400" />
                    توصيات قابلة للتنفيذ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insights.actionable_recommendations?.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-slate-900/50 rounded">
                        <Zap className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300 text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="root-cause" className="mt-4">
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Search className="w-4 h-4 text-red-400" />
                    تحليل الأسباب الجذرية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {insights.root_cause_analysis?.map((analysis, i) => (
                        <div key={i} className="p-4 bg-red-500/5 rounded-lg border border-red-500/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-bold">{analysis.issue}</span>
                            <Badge className="bg-red-500/20 text-red-400">ثقة {analysis.confidence}%</Badge>
                          </div>
                          <p className="text-red-400 text-sm mb-2">السبب الجذري: {analysis.root_cause}</p>
                          <div className="mb-2">
                            <p className="text-slate-400 text-xs mb-1">العوامل المساهمة:</p>
                            <div className="flex flex-wrap gap-1">
                              {analysis.contributing_factors?.map((factor, j) => (
                                <Badge key={j} variant="outline" className="text-xs border-slate-600">{factor}</Badge>
                              ))}
                            </div>
                          </div>
                          <p className="text-amber-400 text-xs">التأثير: {analysis.impact}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="predictions" className="mt-4">
              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    التنبؤات المستقبلية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                      <p className="text-white font-bold">{insights.performance_predictions?.predicted_accuracy_7d}%</p>
                      <p className="text-slate-400 text-xs">الدقة (7 أيام)</p>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                      <p className="text-white font-bold">{insights.performance_predictions?.predicted_accuracy_30d}%</p>
                      <p className="text-slate-400 text-xs">الدقة (30 يوم)</p>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                      <p className="text-white font-bold">{insights.performance_predictions?.risk_of_degradation}%</p>
                      <p className="text-slate-400 text-xs">خطر التدهور</p>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                      <p className="text-white font-bold text-sm">{insights.performance_predictions?.recommended_action_date}</p>
                      <p className="text-slate-400 text-xs">إجراء موصى</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm">اتجاه الدقة:</span>
                      {insights.performance_predictions?.accuracy_trend === 'improving' ? (
                        <Badge className="bg-green-500/20 text-green-400"><TrendingUp className="w-3 h-3 ml-1" />تحسن</Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-400"><TrendingDown className="w-3 h-3 ml-1" />تراجع</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm">اتجاه التأخير:</span>
                      {insights.performance_predictions?.latency_trend === 'improving' ? (
                        <Badge className="bg-green-500/20 text-green-400">تحسن</Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-400">تراجع</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="optimizations" className="mt-4">
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-cyan-400" />
                    استراتيجيات التحسين
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {insights.optimization_strategies?.map((strategy, i) => (
                        <div key={i} className="p-4 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold">{strategy.strategy}</span>
                              <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 text-xs">{strategy.type}</Badge>
                            </div>
                            <Badge className={`text-xs ${
                              strategy.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              strategy.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>{strategy.priority}</Badge>
                          </div>
                          <p className="text-slate-300 text-sm mb-2">{strategy.description}</p>
                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-green-400 text-xs">التحسن المتوقع: {strategy.expected_improvement}</span>
                            <span className="text-slate-400 text-xs">الجهد: {strategy.effort}</span>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs mb-1">الخطوات:</p>
                            <ol className="space-y-1">
                              {strategy.steps?.map((step, j) => (
                                <li key={j} className="flex items-center gap-2 text-xs text-slate-300">
                                  <span className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-[10px]">{j + 1}</span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                          <Button size="sm" className="mt-3 bg-cyan-600 hover:bg-cyan-700 h-7">
                            تطبيق الاستراتيجية
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="automated" className="mt-4">
              <AIAutomatedOptimization modelId={modelId} performanceData={insights} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}