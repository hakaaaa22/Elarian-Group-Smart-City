import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, TrendingUp, TrendingDown, Users, AlertTriangle, Activity, Clock,
  Target, Zap, Heart, Coffee, Battery, BatteryLow, Loader2, RefreshCw,
  BarChart3, LineChart, Calendar, ArrowUp, ArrowDown, Sparkles, Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart as ReLineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { toast } from 'sonner';

export default function AdvancedPredictiveAnalytics() {
  const [predictions, setPredictions] = useState(null);
  const [activeTab, setActiveTab] = useState('demand');

  const generatePredictionsMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بإنشاء تحليلات تنبؤية متقدمة شاملة تشمل:

1. التنبؤ بالطلب المستقبلي على الخدمات:
   - توقعات الأسبوع القادم بالساعة
   - توقعات الشهر القادم بالأسبوع
   - العوامل المؤثرة في الطلب
   - توصيات توزيع الموارد

2. تحليل خطر إرهاق الوكلاء (Agent Burnout):
   - قائمة بالوكلاء المعرضين للخطر
   - مؤشرات الإرهاق لكل وكيل
   - توصيات للتدخل المبكر
   - خطة توزيع العبء

3. التنبؤ باتجاهات رضا العملاء:
   - توقعات الرضا للأسبوع القادم
   - العوامل المؤثرة إيجاباً وسلباً
   - نقاط الخطر المحتملة
   - توصيات لتحسين الرضا

قدم بيانات واقعية ومفصلة.`,
        response_json_schema: {
          type: "object",
          properties: {
            demand_forecast: {
              type: "object",
              properties: {
                weekly_hourly: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      hour: { type: "string" },
                      calls: { type: "number" },
                      chats: { type: "number" },
                      emails: { type: "number" }
                    }
                  }
                },
                monthly_weekly: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      week: { type: "string" },
                      total: { type: "number" },
                      change: { type: "number" }
                    }
                  }
                },
                influencing_factors: { type: "array", items: { type: "string" } },
                resource_recommendations: { type: "array", items: { type: "string" } },
                peak_times: { type: "array", items: { type: "string" } },
                low_times: { type: "array", items: { type: "string" } }
              }
            },
            agent_burnout: {
              type: "object",
              properties: {
                at_risk_agents: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      risk_level: { type: "string" },
                      risk_score: { type: "number" },
                      indicators: { type: "array", items: { type: "string" } },
                      workload_hours: { type: "number" },
                      avg_call_duration: { type: "number" },
                      break_time_ratio: { type: "number" }
                    }
                  }
                },
                intervention_recommendations: { type: "array", items: { type: "string" } },
                workload_distribution: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      agent: { type: "string" },
                      current: { type: "number" },
                      recommended: { type: "number" }
                    }
                  }
                },
                team_health_score: { type: "number" }
              }
            },
            satisfaction_trends: {
              type: "object",
              properties: {
                weekly_forecast: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      day: { type: "string" },
                      predicted_score: { type: "number" },
                      confidence: { type: "number" }
                    }
                  }
                },
                positive_factors: { type: "array", items: { type: "string" } },
                negative_factors: { type: "array", items: { type: "string" } },
                risk_points: { type: "array", items: { type: "string" } },
                improvement_recommendations: { type: "array", items: { type: "string" } },
                predicted_nps: { type: "number" },
                predicted_csat: { type: "number" }
              }
            }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setPredictions(data);
      toast.success('تم إنشاء التحليلات التنبؤية');
    },
    onError: () => {
      toast.error('حدث خطأ في التحليل');
    }
  });

  useEffect(() => {
    generatePredictionsMutation.mutate();
  }, []);

  const getRiskColor = (level) => {
    if (level === 'high' || level === 'critical') return 'red';
    if (level === 'medium') return 'amber';
    return 'green';
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20"
          >
            <Brain className="w-6 h-6 text-purple-400" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-white">التحليلات التنبؤية المتقدمة</h3>
            <p className="text-slate-400 text-sm">تنبؤ بالطلب • إرهاق الوكلاء • اتجاهات الرضا</p>
          </div>
        </div>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => generatePredictionsMutation.mutate()}
          disabled={generatePredictionsMutation.isPending}
        >
          {generatePredictionsMutation.isPending ? (
            <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري التحليل...</>
          ) : (
            <><RefreshCw className="w-4 h-4 ml-2" /> تحديث التنبؤات</>
          )}
        </Button>
      </div>

      {generatePredictionsMutation.isPending && !predictions && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
            <p className="text-white font-medium">جاري إنشاء التحليلات التنبؤية...</p>
            <p className="text-slate-400 text-sm">تحليل البيانات وبناء النماذج</p>
          </CardContent>
        </Card>
      )}

      {predictions && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
            <TabsTrigger value="demand" className="data-[state=active]:bg-cyan-500/20">
              <TrendingUp className="w-4 h-4 ml-1" />
              التنبؤ بالطلب
            </TabsTrigger>
            <TabsTrigger value="burnout" className="data-[state=active]:bg-red-500/20">
              <Battery className="w-4 h-4 ml-1" />
              إرهاق الوكلاء
            </TabsTrigger>
            <TabsTrigger value="satisfaction" className="data-[state=active]:bg-green-500/20">
              <Heart className="w-4 h-4 ml-1" />
              اتجاهات الرضا
            </TabsTrigger>
          </TabsList>

          {/* Demand Forecast */}
          <TabsContent value="demand" className="mt-4 space-y-4">
            {/* Hourly Forecast Chart */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  التنبؤ بالطلب حسب الساعة (الأسبوع القادم)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={predictions.demand_forecast?.weekly_hourly || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="calls" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} name="مكالمات" />
                      <Area type="monotone" dataKey="chats" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} name="محادثات" />
                      <Area type="monotone" dataKey="emails" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="بريد" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-4">
              {/* Peak & Low Times */}
              <Card className="bg-cyan-500/10 border-cyan-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">أوقات الذروة والهدوء</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-cyan-400 text-xs mb-2">أوقات الذروة</p>
                      <div className="flex flex-wrap gap-2">
                        {predictions.demand_forecast?.peak_times?.map((time, i) => (
                          <Badge key={i} className="bg-red-500/20 text-red-400">{time}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-cyan-400 text-xs mb-2">أوقات الهدوء</p>
                      <div className="flex flex-wrap gap-2">
                        {predictions.demand_forecast?.low_times?.map((time, i) => (
                          <Badge key={i} className="bg-green-500/20 text-green-400">{time}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resource Recommendations */}
              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-400" />
                    توصيات الموارد
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[120px]">
                    <div className="space-y-2">
                      {predictions.demand_forecast?.resource_recommendations?.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <Zap className="w-3 h-3 text-purple-400 mt-1 flex-shrink-0" />
                          <span className="text-slate-300">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Agent Burnout */}
          <TabsContent value="burnout" className="mt-4 space-y-4">
            {/* Team Health Score */}
            <Card className="bg-gradient-to-r from-red-500/10 to-amber-500/10 border-red-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">صحة الفريق العامة</p>
                    <p className="text-4xl font-bold text-white mt-1">
                      {predictions.agent_burnout?.team_health_score || 0}%
                    </p>
                  </div>
                  <div className={`p-4 rounded-full ${
                    (predictions.agent_burnout?.team_health_score || 0) >= 70 
                      ? 'bg-green-500/20' 
                      : (predictions.agent_burnout?.team_health_score || 0) >= 50 
                      ? 'bg-amber-500/20' 
                      : 'bg-red-500/20'
                  }`}>
                    <Battery className={`w-8 h-8 ${
                      (predictions.agent_burnout?.team_health_score || 0) >= 70 
                        ? 'text-green-400' 
                        : (predictions.agent_burnout?.team_health_score || 0) >= 50 
                        ? 'text-amber-400' 
                        : 'text-red-400'
                    }`} />
                  </div>
                </div>
                <Progress 
                  value={predictions.agent_burnout?.team_health_score || 0} 
                  className="mt-3 h-3" 
                />
              </CardContent>
            </Card>

            {/* At Risk Agents */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  الوكلاء المعرضون للخطر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px]">
                  <div className="space-y-3">
                    {predictions.agent_burnout?.at_risk_agents?.map((agent, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-3 rounded-lg border ${
                          agent.risk_level === 'high' || agent.risk_level === 'critical'
                            ? 'bg-red-500/10 border-red-500/30'
                            : agent.risk_level === 'medium'
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-slate-900/50 border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span className="text-white font-medium">{agent.name}</span>
                          </div>
                          <Badge className={`bg-${getRiskColor(agent.risk_level)}-500/20 text-${getRiskColor(agent.risk_level)}-400`}>
                            {agent.risk_score}% خطر
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
                          <div className="p-2 bg-slate-900/50 rounded">
                            <p className="text-slate-400">ساعات العمل</p>
                            <p className="text-white font-medium">{agent.workload_hours}h</p>
                          </div>
                          <div className="p-2 bg-slate-900/50 rounded">
                            <p className="text-slate-400">متوسط المكالمة</p>
                            <p className="text-white font-medium">{agent.avg_call_duration}m</p>
                          </div>
                          <div className="p-2 bg-slate-900/50 rounded">
                            <p className="text-slate-400">نسبة الراحة</p>
                            <p className="text-white font-medium">{agent.break_time_ratio}%</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {agent.indicators?.map((ind, j) => (
                            <Badge key={j} variant="outline" className="text-xs border-slate-600">
                              {ind}
                            </Badge>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Intervention Recommendations */}
            <Card className="bg-green-500/10 border-green-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  توصيات التدخل المبكر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {predictions.agent_burnout?.intervention_recommendations?.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-slate-900/50 rounded">
                      <Coffee className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Satisfaction Trends */}
          <TabsContent value="satisfaction" className="mt-4 space-y-4">
            {/* Predicted Scores */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="p-4 text-center">
                  <Heart className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{predictions.satisfaction_trends?.predicted_csat || 0}%</p>
                  <p className="text-slate-400 text-sm">CSAT المتوقع</p>
                </CardContent>
              </Card>
              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{predictions.satisfaction_trends?.predicted_nps || 0}</p>
                  <p className="text-slate-400 text-sm">NPS المتوقع</p>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Forecast Chart */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">توقعات الرضا الأسبوعية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReLineChart data={predictions.satisfaction_trends?.weekly_forecast || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="predicted_score" stroke="#22c55e" strokeWidth={2} name="الرضا المتوقع" />
                      <Line type="monotone" dataKey="confidence" stroke="#94a3b8" strokeDasharray="5 5" name="مستوى الثقة" />
                    </ReLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-4">
              {/* Positive Factors */}
              <Card className="bg-green-500/10 border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <ArrowUp className="w-4 h-4 text-green-400" />
                    عوامل إيجابية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {predictions.satisfaction_trends?.positive_factors?.map((factor, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-green-400">✓</span>
                        <span className="text-slate-300">{factor}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Negative Factors */}
              <Card className="bg-red-500/10 border-red-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <ArrowDown className="w-4 h-4 text-red-400" />
                    عوامل سلبية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {predictions.satisfaction_trends?.negative_factors?.map((factor, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-red-400">✗</span>
                        <span className="text-slate-300">{factor}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Improvement Recommendations */}
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  توصيات التحسين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {predictions.satisfaction_trends?.improvement_recommendations?.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-slate-900/50 rounded">
                      <Target className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}