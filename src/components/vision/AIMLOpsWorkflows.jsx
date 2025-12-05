import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  GitBranch, Play, Pause, RefreshCw, Loader2, CheckCircle, AlertTriangle,
  Settings, Zap, Activity, Clock, BarChart3, Target, Brain, Cpu, Box,
  ArrowRight, RotateCcw, Bell, TrendingUp, Layers, Workflow, Terminal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const pipelineStages = [
  { id: 'data', name: 'جمع البيانات', status: 'completed', duration: '2m 15s' },
  { id: 'preprocess', name: 'المعالجة المسبقة', status: 'completed', duration: '5m 32s' },
  { id: 'train', name: 'التدريب', status: 'running', duration: '15m 48s', progress: 72 },
  { id: 'evaluate', name: 'التقييم', status: 'pending', duration: '-' },
  { id: 'deploy', name: 'النشر', status: 'pending', duration: '-' },
];

export default function AIMLOpsWorkflows() {
  const [workflows, setWorkflows] = useState(null);
  const [activeTab, setActiveTab] = useState('pipelines');
  const [autoHealing, setAutoHealing] = useState(true);
  const [stages, setStages] = useState(pipelineStages);

  const analyzeMLOpsMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل سير عمل MLOps وقدم:

1. تحسينات خط أنابيب CI/CD:
   - اختناقات الأداء
   - فرص التوازي
   - تحسين الموارد

2. المراقبة والمعالجة الذاتية:
   - حالة النماذج في الإنتاج
   - محفزات إعادة التدريب
   - قرارات التراجع

3. تكامل MLflow/Kubeflow:
   - حالة الاتصال
   - التجارب النشطة
   - سجلات النماذج

4. توصيات التحسين`,
        response_json_schema: {
          type: "object",
          properties: {
            pipeline_optimizations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  stage: { type: "string" },
                  issue: { type: "string" },
                  suggestion: { type: "string" },
                  impact: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            self_healing_status: {
              type: "object",
              properties: {
                models_monitored: { type: "number" },
                alerts_triggered: { type: "number" },
                auto_retrains: { type: "number" },
                rollbacks_executed: { type: "number" },
                recent_actions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      action: { type: "string" },
                      model: { type: "string" },
                      reason: { type: "string" },
                      timestamp: { type: "string" },
                      status: { type: "string" }
                    }
                  }
                }
              }
            },
            external_integrations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string" },
                  status: { type: "string" },
                  experiments: { type: "number" },
                  models_registered: { type: "number" },
                  last_sync: { type: "string" }
                }
              }
            },
            pipeline_metrics: {
              type: "object",
              properties: {
                avg_build_time: { type: "string" },
                success_rate: { type: "number" },
                deployments_today: { type: "number" },
                failed_stages: { type: "number" }
              }
            },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setWorkflows(data);
      toast.success('تم تحليل سير عمل MLOps');
    }
  });

  useEffect(() => {
    analyzeMLOpsMutation.mutate();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'running': return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20"
          >
            <Workflow className="w-5 h-5 text-blue-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">سير عمل MLOps المؤتمت</h4>
            <p className="text-slate-400 text-xs">CI/CD • المعالجة الذاتية • التكامل الخارجي</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-lg">
            <Label className="text-slate-300 text-xs">معالجة ذاتية</Label>
            <Switch checked={autoHealing} onCheckedChange={setAutoHealing} />
          </div>
          <Button
            variant="outline"
            className="border-blue-500/50"
            onClick={() => analyzeMLOpsMutation.mutate()}
            disabled={analyzeMLOpsMutation.isPending}
          >
            {analyzeMLOpsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Pipeline Status */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-blue-400" />
            خط الأنابيب النشط
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2">
            {stages.map((stage, i) => (
              <React.Fragment key={stage.id}>
                <div className={`flex-1 p-3 rounded-lg text-center ${
                  stage.status === 'completed' ? 'bg-green-500/10 border border-green-500/30' :
                  stage.status === 'running' ? 'bg-blue-500/10 border border-blue-500/30' :
                  stage.status === 'failed' ? 'bg-red-500/10 border border-red-500/30' :
                  'bg-slate-900/50 border border-slate-700/50'
                }`}>
                  <div className="flex justify-center mb-2">{getStatusIcon(stage.status)}</div>
                  <p className="text-white text-xs font-medium">{stage.name}</p>
                  <p className="text-slate-400 text-[10px]">{stage.duration}</p>
                  {stage.progress && <Progress value={stage.progress} className="h-1 mt-2" />}
                </div>
                {i < stages.length - 1 && <ArrowRight className="w-4 h-4 text-slate-500 flex-shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {workflows && (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="p-3 text-center">
                <Clock className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{workflows.pipeline_metrics?.avg_build_time}</p>
                <p className="text-slate-400 text-xs">متوسط البناء</p>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-3 text-center">
                <Target className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{workflows.pipeline_metrics?.success_rate}%</p>
                <p className="text-slate-400 text-xs">معدل النجاح</p>
              </CardContent>
            </Card>
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardContent className="p-3 text-center">
                <Zap className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{workflows.pipeline_metrics?.deployments_today}</p>
                <p className="text-slate-400 text-xs">نشر اليوم</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-3 text-center">
                <Activity className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{workflows.self_healing_status?.models_monitored}</p>
                <p className="text-slate-400 text-xs">نموذج مراقب</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
              <TabsTrigger value="pipelines" className="data-[state=active]:bg-blue-500/20">
                <GitBranch className="w-3 h-3 ml-1" />
                التحسينات
              </TabsTrigger>
              <TabsTrigger value="healing" className="data-[state=active]:bg-green-500/20">
                <RotateCcw className="w-3 h-3 ml-1" />
                المعالجة الذاتية
              </TabsTrigger>
              <TabsTrigger value="integrations" className="data-[state=active]:bg-purple-500/20">
                <Box className="w-3 h-3 ml-1" />
                التكاملات
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pipelines" className="mt-4">
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">تحسينات خط الأنابيب المقترحة</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px]">
                    <div className="space-y-3">
                      {workflows.pipeline_optimizations?.map((opt, i) => (
                        <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="border-blue-500/50 text-blue-400">{opt.stage}</Badge>
                            <Badge className={`text-xs ${opt.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{opt.priority}</Badge>
                          </div>
                          <p className="text-white text-sm mb-1">{opt.issue}</p>
                          <p className="text-green-400 text-xs">الحل: {opt.suggestion}</p>
                          <p className="text-slate-400 text-xs mt-1">التأثير: {opt.impact}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="healing" className="mt-4">
              <Card className="bg-green-500/10 border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-green-400" />
                    إجراءات المعالجة الذاتية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="p-2 bg-slate-900/50 rounded text-center">
                      <p className="text-white font-bold">{workflows.self_healing_status?.alerts_triggered}</p>
                      <p className="text-slate-400 text-xs">تنبيهات</p>
                    </div>
                    <div className="p-2 bg-slate-900/50 rounded text-center">
                      <p className="text-white font-bold">{workflows.self_healing_status?.auto_retrains}</p>
                      <p className="text-slate-400 text-xs">إعادة تدريب</p>
                    </div>
                    <div className="p-2 bg-slate-900/50 rounded text-center">
                      <p className="text-white font-bold">{workflows.self_healing_status?.rollbacks_executed}</p>
                      <p className="text-slate-400 text-xs">تراجعات</p>
                    </div>
                  </div>
                  <ScrollArea className="h-[180px]">
                    <div className="space-y-2">
                      {workflows.self_healing_status?.recent_actions?.map((action, i) => (
                        <div key={i} className="p-2 bg-slate-900/50 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">{action.action}</p>
                            <p className="text-slate-400 text-xs">{action.model} - {action.reason}</p>
                          </div>
                          <Badge className={action.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>{action.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                {workflows.external_integrations?.map((int, i) => (
                  <Card key={i} className={`border-${int.status === 'connected' ? 'green' : 'slate'}-500/30 bg-${int.status === 'connected' ? 'green' : 'slate'}-500/10`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white font-bold">{int.platform}</span>
                        <Badge className={int.status === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}>{int.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-2 bg-slate-900/50 rounded">
                          <p className="text-white font-bold">{int.experiments}</p>
                          <p className="text-slate-400 text-xs">تجارب</p>
                        </div>
                        <div className="p-2 bg-slate-900/50 rounded">
                          <p className="text-white font-bold">{int.models_registered}</p>
                          <p className="text-slate-400 text-xs">نماذج</p>
                        </div>
                      </div>
                      <p className="text-slate-400 text-xs mt-2">آخر مزامنة: {int.last_sync}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Recommendations */}
          {workflows.recommendations?.length > 0 && (
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-cyan-400" />
                  توصيات AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {workflows.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}