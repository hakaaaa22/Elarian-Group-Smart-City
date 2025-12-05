import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  TrendingUp, TrendingDown, Activity, Cpu, Thermometer, Droplets,
  Zap, Wind, Loader2, RefreshCw, AlertTriangle, Target, Clock,
  BarChart3, Eye, Bell, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { toast } from 'sonner';

const mockTrendData = [
  { time: '00:00', temp: 22, humidity: 45, energy: 120 },
  { time: '04:00', temp: 20, humidity: 48, energy: 80 },
  { time: '08:00', temp: 24, humidity: 42, energy: 180 },
  { time: '12:00', temp: 28, humidity: 38, energy: 220 },
  { time: '16:00', temp: 26, humidity: 40, energy: 200 },
  { time: '20:00', temp: 23, humidity: 44, energy: 150 },
];

export default function AIIoTTrendPredictor() {
  const [predictions, setPredictions] = useState(null);
  const [activeTab, setActiveTab] = useState('trends');

  const predictTrendsMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل بيانات IoT واكتشف الاتجاهات والتنبؤات:

بيانات المستشعرات:
- درجة الحرارة: 22-28°C
- الرطوبة: 38-48%
- استهلاك الطاقة: 80-220 kWh

قدم:
1. الاتجاهات المكتشفة في البيانات
2. الأنماط الموسمية واليومية
3. الشذوذات المحتملة
4. تنبؤات الـ 24 ساعة القادمة
5. تنبيهات استباقية
6. توصيات التحسين`,
        response_json_schema: {
          type: "object",
          properties: {
            discovered_trends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  metric: { type: "string" },
                  trend_direction: { type: "string" },
                  change_rate: { type: "number" },
                  significance: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            patterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pattern_type: { type: "string" },
                  affected_metrics: { type: "array", items: { type: "string" } },
                  peak_times: { type: "array", items: { type: "string" } },
                  description: { type: "string" }
                }
              }
            },
            anomalies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  metric: { type: "string" },
                  anomaly_type: { type: "string" },
                  severity: { type: "string" },
                  detected_at: { type: "string" },
                  probable_cause: { type: "string" }
                }
              }
            },
            predictions_24h: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  metric: { type: "string" },
                  current_value: { type: "number" },
                  predicted_value: { type: "number" },
                  confidence: { type: "number" },
                  trend: { type: "string" }
                }
              }
            },
            proactive_alerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  alert_type: { type: "string" },
                  metric: { type: "string" },
                  threshold: { type: "string" },
                  expected_time: { type: "string" },
                  recommended_action: { type: "string" }
                }
              }
            },
            optimization_recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setPredictions(data);
      toast.success('تم تحليل الاتجاهات والتنبؤات');
    }
  });

  useEffect(() => {
    predictTrendsMutation.mutate();
  }, []);

  const getTrendIcon = (direction) => {
    if (direction === 'up' || direction === 'increasing') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (direction === 'down' || direction === 'decreasing') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Activity className="w-4 h-4 text-amber-400" />;
  };

  const getMetricIcon = (metric) => {
    if (metric.includes('حرارة') || metric.includes('temp')) return <Thermometer className="w-4 h-4 text-red-400" />;
    if (metric.includes('رطوبة') || metric.includes('humid')) return <Droplets className="w-4 h-4 text-blue-400" />;
    if (metric.includes('طاقة') || metric.includes('energy')) return <Zap className="w-4 h-4 text-amber-400" />;
    return <Activity className="w-4 h-4 text-cyan-400" />;
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-cyan-500/20"
          >
            <TrendingUp className="w-5 h-5 text-green-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">اكتشاف اتجاهات IoT والتنبؤ</h4>
            <p className="text-slate-400 text-xs">الاتجاهات • الأنماط • الشذوذات • التنبؤات</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="border-green-500/50"
          onClick={() => predictTrendsMutation.mutate()}
          disabled={predictTrendsMutation.isPending}
        >
          {predictTrendsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </Button>
      </div>

      {/* Trend Chart */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">بيانات المستشعرات (24 ساعة)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrendData}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
                <Area type="monotone" dataKey="temp" stroke="#ef4444" fill="url(#tempGrad)" name="الحرارة" />
                <Area type="monotone" dataKey="energy" stroke="#f59e0b" fill="url(#energyGrad)" name="الطاقة" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {predictions && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
            <TabsTrigger value="trends" className="text-xs">الاتجاهات</TabsTrigger>
            <TabsTrigger value="patterns" className="text-xs">الأنماط</TabsTrigger>
            <TabsTrigger value="anomalies" className="text-xs">الشذوذات</TabsTrigger>
            <TabsTrigger value="predictions" className="text-xs">التنبؤات</TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs">التنبيهات</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="mt-4">
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-4">
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3">
                    {predictions.discovered_trends?.map((trend, i) => (
                      <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getMetricIcon(trend.metric)}
                            <span className="text-white font-medium">{trend.metric}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(trend.trend_direction)}
                            <Badge className={`text-xs ${
                              trend.significance === 'high' ? 'bg-red-500/20 text-red-400' :
                              trend.significance === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>{trend.change_rate}%</Badge>
                          </div>
                        </div>
                        <p className="text-slate-400 text-xs">{trend.description}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patterns" className="mt-4">
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardContent className="p-4">
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3">
                    {predictions.patterns?.map((pattern, i) => (
                      <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                        <p className="text-white font-medium mb-2">{pattern.pattern_type}</p>
                        <p className="text-slate-400 text-xs mb-2">{pattern.description}</p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span className="text-cyan-400 text-xs">أوقات الذروة: {pattern.peak_times?.join(', ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anomalies" className="mt-4">
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-4">
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3">
                    {predictions.anomalies?.map((anomaly, i) => (
                      <div key={i} className="p-3 bg-slate-900/50 rounded-lg border border-red-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{anomaly.metric}</span>
                          <Badge className={`text-xs ${
                            anomaly.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                            anomaly.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>{anomaly.severity}</Badge>
                        </div>
                        <p className="text-slate-400 text-xs mb-1">النوع: {anomaly.anomaly_type}</p>
                        <p className="text-amber-400 text-xs">السبب المحتمل: {anomaly.probable_cause}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="mt-4">
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-4">
                <div className="grid gap-3">
                  {predictions.predictions_24h?.map((pred, i) => (
                    <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getMetricIcon(pred.metric)}
                          <span className="text-white font-medium">{pred.metric}</span>
                        </div>
                        <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                          ثقة {pred.confidence}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">الحالي: {pred.current_value}</span>
                            <span className="text-purple-400">المتوقع: {pred.predicted_value}</span>
                          </div>
                          <Progress value={pred.confidence} className="h-1" />
                        </div>
                        {getTrendIcon(pred.trend)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="mt-4">
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-4">
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3">
                    {predictions.proactive_alerts?.map((alert, i) => (
                      <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Bell className="w-4 h-4 text-amber-400" />
                          <span className="text-white font-medium">{alert.alert_type}</span>
                        </div>
                        <p className="text-slate-400 text-xs mb-1">{alert.metric} - حد: {alert.threshold}</p>
                        <p className="text-amber-400 text-xs mb-1">الوقت المتوقع: {alert.expected_time}</p>
                        <p className="text-green-400 text-xs">الإجراء: {alert.recommended_action}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {predictions?.optimization_recommendations?.length > 0 && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              توصيات التحسين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {predictions.optimization_recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                  <Target className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}