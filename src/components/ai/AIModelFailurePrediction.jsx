import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  AlertOctagon, TrendingDown, Clock, Cpu, Activity, Target,
  Loader2, RefreshCw, Calendar, Zap, Shield, AlertTriangle,
  CheckCircle, XCircle, ArrowRight, Settings, Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ReferenceLine
} from 'recharts';
import { toast } from 'sonner';

const degradationData = [
  { day: 'اليوم', health: 95, predicted: 95 },
  { day: '+1', health: null, predicted: 93 },
  { day: '+2', health: null, predicted: 90 },
  { day: '+3', health: null, predicted: 86 },
  { day: '+5', health: null, predicted: 78 },
  { day: '+7', health: null, predicted: 72 },
];

export default function AIModelFailurePrediction() {
  const [predictions, setPredictions] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);

  const predictFailuresMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل أنماط استخدام نماذج AI وتوقع الفشل المحتمل:

قدم تحليلاً شاملاً يتضمن:
1. النماذج المعرضة للفشل مع احتمالية الفشل
2. العلامات التحذيرية المبكرة لكل نموذج
3. الإطار الزمني المتوقع للفشل
4. أسباب التدهور المحتملة
5. إجراءات وقائية موصى بها
6. تقدير تكلفة عدم التدخل`,
        response_json_schema: {
          type: "object",
          properties: {
            at_risk_models: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  model_id: { type: "string" },
                  model_name: { type: "string" },
                  current_health: { type: "number" },
                  failure_probability: { type: "number" },
                  days_until_critical: { type: "number" },
                  risk_level: { type: "string" },
                  usage_pattern: { type: "string" },
                  warning_signs: { type: "array", items: { type: "string" } },
                  degradation_factors: { type: "array", items: { type: "object", properties: { factor: { type: "string" }, impact: { type: "number" }, trend: { type: "string" } } } },
                  recommended_actions: { type: "array", items: { type: "object", properties: { action: { type: "string" }, priority: { type: "string" }, effort: { type: "string" } } } },
                  estimated_downtime_cost: { type: "number" }
                }
              }
            },
            summary: {
              type: "object",
              properties: {
                total_models_monitored: { type: "number" },
                high_risk_count: { type: "number" },
                medium_risk_count: { type: "number" },
                average_health: { type: "number" },
                total_potential_cost: { type: "number" }
              }
            },
            maintenance_schedule: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  model_name: { type: "string" },
                  recommended_date: { type: "string" },
                  maintenance_type: { type: "string" },
                  duration_hours: { type: "number" }
                }
              }
            }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setPredictions(data);
      toast.success('تم تحديث تنبؤات الفشل');
    }
  });

  useEffect(() => {
    predictFailuresMutation.mutate();
  }, []);

  const getRiskColor = (level) => {
    switch(level) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'amber';
      case 'low': return 'green';
      default: return 'slate';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20"
          >
            <AlertOctagon className="w-6 h-6 text-orange-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold text-lg">التنبؤ بفشل النماذج</h4>
            <p className="text-slate-400 text-xs">تحليل أنماط الاستخدام • التدهور المتوقع • الصيانة الاستباقية</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="border-orange-500/50"
          onClick={() => predictFailuresMutation.mutate()}
          disabled={predictFailuresMutation.isPending}
        >
          {predictFailuresMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </Button>
      </div>

      {/* Summary Stats */}
      {predictions?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-3 text-center">
              <Cpu className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{predictions.summary.total_models_monitored}</p>
              <p className="text-slate-400 text-xs">نموذج مراقب</p>
            </CardContent>
          </Card>
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-3 text-center">
              <AlertOctagon className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{predictions.summary.high_risk_count}</p>
              <p className="text-slate-400 text-xs">خطر عالي</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-3 text-center">
              <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{predictions.summary.medium_risk_count}</p>
              <p className="text-slate-400 text-xs">خطر متوسط</p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="p-3 text-center">
              <Activity className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{predictions.summary.average_health}%</p>
              <p className="text-slate-400 text-xs">متوسط الصحة</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardContent className="p-3 text-center">
              <Zap className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">${predictions.summary.total_potential_cost?.toLocaleString()}</p>
              <p className="text-slate-400 text-xs">تكلفة محتملة</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Degradation Chart */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-orange-400" />
            منحنى التدهور المتوقع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={degradationData}>
                <defs>
                  <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'حد الخطر', fill: '#ef4444', fontSize: 10 }} />
                <Area type="monotone" dataKey="predicted" stroke="#f59e0b" fill="url(#healthGrad)" strokeWidth={2} strokeDasharray="5 5" name="متوقع" />
                <Line type="monotone" dataKey="health" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} name="فعلي" connectNulls={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* At-Risk Models */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">النماذج المعرضة للفشل</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {predictions?.at_risk_models?.map((model, i) => (
                <motion.div
                  key={model.model_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.01] ${
                    model.risk_level === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                    model.risk_level === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                    'bg-amber-500/10 border-amber-500/30'
                  }`}
                  onClick={() => setSelectedModel(selectedModel === model.model_id ? null : model.model_id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Cpu className={`w-5 h-5 text-${getRiskColor(model.risk_level)}-400`} />
                      <div>
                        <p className="text-white font-medium">{model.model_name}</p>
                        <p className="text-slate-400 text-xs">{model.usage_pattern}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <Badge className={`bg-${getRiskColor(model.risk_level)}-500/20 text-${getRiskColor(model.risk_level)}-400`}>
                        {model.failure_probability}% احتمالية فشل
                      </Badge>
                      <p className="text-slate-400 text-xs mt-1">
                        <Clock className="w-3 h-3 inline ml-1" />
                        {model.days_until_critical} يوم للحرج
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-slate-400 text-xs">الصحة:</span>
                    <Progress value={model.current_health} className="flex-1 h-2" />
                    <span className="text-white text-xs font-bold">{model.current_health}%</span>
                  </div>

                  {/* Expanded Details */}
                  {selectedModel === model.model_id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-3 pt-3 border-t border-slate-700/50 space-y-3"
                    >
                      {/* Warning Signs */}
                      <div>
                        <p className="text-amber-400 text-xs font-medium mb-1">علامات تحذيرية:</p>
                        <div className="flex flex-wrap gap-1">
                          {model.warning_signs?.map((sign, j) => (
                            <Badge key={j} variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">{sign}</Badge>
                          ))}
                        </div>
                      </div>

                      {/* Degradation Factors */}
                      <div>
                        <p className="text-slate-400 text-xs font-medium mb-1">عوامل التدهور:</p>
                        <div className="space-y-1">
                          {model.degradation_factors?.map((factor, j) => (
                            <div key={j} className="flex items-center justify-between text-xs">
                              <span className="text-slate-300">{factor.factor}</span>
                              <div className="flex items-center gap-2">
                                <Progress value={factor.impact} className="w-16 h-1" />
                                <span className={`${factor.trend === 'increasing' ? 'text-red-400' : 'text-green-400'}`}>
                                  {factor.impact}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommended Actions */}
                      <div>
                        <p className="text-green-400 text-xs font-medium mb-1">الإجراءات الموصى بها:</p>
                        <div className="space-y-1">
                          {model.recommended_actions?.map((action, j) => (
                            <div key={j} className="flex items-center justify-between p-2 bg-slate-900/50 rounded text-xs">
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-400" />
                                <span className="text-slate-300">{action.action}</span>
                              </div>
                              <Badge className={`text-[10px] ${
                                action.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'
                              }`}>{action.priority}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1 bg-orange-600 hover:bg-orange-700 h-7 text-xs">
                          <Settings className="w-3 h-3 ml-1" />
                          جدولة صيانة
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 border-slate-600 h-7 text-xs">
                          <Bell className="w-3 h-3 ml-1" />
                          إعداد تنبيه
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Maintenance Schedule */}
      {predictions?.maintenance_schedule && (
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              جدول الصيانة الموصى
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-2">
              {predictions.maintenance_schedule.map((item, i) => (
                <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-white text-sm font-medium">{item.model_name}</p>
                  <p className="text-cyan-400 text-xs">{item.recommended_date}</p>
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant="outline" className="text-[10px] border-slate-600">{item.maintenance_type}</Badge>
                    <span className="text-slate-400 text-[10px]">{item.duration_hours}س</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}