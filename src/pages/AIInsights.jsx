import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Brain, Sparkles, TrendingUp, Zap, Car, Route, MapPin, Clock,
  Fuel, AlertTriangle, CheckCircle, Target, Lightbulb, RefreshCw,
  Loader2, BarChart3, Activity, Shield, Gauge, Navigation
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const energyData = [
  { hour: '00:00', actual: 45, predicted: 48, optimal: 40 },
  { hour: '04:00', actual: 38, predicted: 40, optimal: 35 },
  { hour: '08:00', actual: 72, predicted: 70, optimal: 65 },
  { hour: '12:00', actual: 85, predicted: 82, optimal: 75 },
  { hour: '16:00', actual: 78, predicted: 80, optimal: 70 },
  { hour: '20:00', actual: 55, predicted: 58, optimal: 50 },
];

export default function AIInsights() {
  const [activeTab, setActiveTab] = useState('predictions');
  const [devicePrediction, setDevicePrediction] = useState(null);
  const [routeOptimization, setRouteOptimization] = useState(null);
  const [smartInsights, setSmartInsights] = useState(null);

  // Device Behavior Prediction
  const devicePredictionMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير في تحليل سلوك أجهزة IoT والتنبؤ باستهلاك الطاقة.

قم بتحليل أنماط الاستخدام وتقديم تنبؤات دقيقة لـ:
1. استهلاك الطاقة للساعات الـ 24 القادمة
2. ذروة الاستخدام المتوقعة
3. توقعات الأداء
4. توصيات لتحسين الكفاءة

البيانات الحالية:
- متوسط الاستهلاك: 65 كيلوواط/ساعة
- الذروة الحالية: 85 كيلوواط/ساعة
- عدد الأجهزة: 155 جهاز
- متوسط وقت التشغيل: 99.2%`,
        response_json_schema: {
          type: "object",
          properties: {
            hourly_predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  hour: { type: "string" },
                  consumption: { type: "number" },
                  confidence: { type: "number" },
                  factors: { type: "array", items: { type: "string" } }
                }
              }
            },
            peak_prediction: {
              type: "object",
              properties: {
                time: { type: "string" },
                value: { type: "number" },
                duration: { type: "string" },
                cause: { type: "string" }
              }
            },
            daily_forecast: {
              type: "object",
              properties: {
                total_consumption: { type: "number" },
                average_consumption: { type: "number" },
                min_consumption: { type: "number" },
                max_consumption: { type: "number" },
                trend: { type: "string" },
                comparison_yesterday: { type: "number" }
              }
            },
            optimization_potential: {
              type: "object",
              properties: {
                current_efficiency: { type: "number" },
                potential_efficiency: { type: "number" },
                potential_savings: { type: "string" },
                actions: { type: "array", items: { type: "string" } }
              }
            },
            device_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  device_type: { type: "string" },
                  current_state: { type: "string" },
                  recommendation: { type: "string" },
                  impact: { type: "string" }
                }
              }
            }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setDevicePrediction(data);
      toast.success('تم تحليل سلوك الأجهزة');
    }
  });

  // Route Optimization
  const routeOptimizationMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير في تحسين مسارات الأسطول بناءً على بيانات المرور في الوقت الفعلي.

معطيات الأسطول:
- عدد المركبات: 15 مركبة
- المنطقة: الرياض
- الوقت: ساعة الذروة الصباحية
- المهام: توصيل وجمع

قم بتحليل وتقديم:
1. تحسين المسارات لكل مركبة
2. تقدير الوقت والمسافة
3. توفير الوقود المتوقع
4. تجنب نقاط الازدحام`,
        response_json_schema: {
          type: "object",
          properties: {
            optimized_routes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  vehicle_id: { type: "string" },
                  current_route: { type: "string" },
                  optimized_route: { type: "string" },
                  time_saved: { type: "string" },
                  distance_saved: { type: "string" },
                  fuel_saved: { type: "string" },
                  congestion_avoided: { type: "array", items: { type: "string" } }
                }
              }
            },
            traffic_insights: {
              type: "object",
              properties: {
                current_conditions: { type: "string" },
                congestion_points: { type: "array", items: { type: "string" } },
                recommended_departure_times: { type: "array", items: { type: "string" } },
                weather_impact: { type: "string" }
              }
            },
            fleet_summary: {
              type: "object",
              properties: {
                total_time_saved: { type: "string" },
                total_distance_saved: { type: "string" },
                total_fuel_saved: { type: "string" },
                cost_savings: { type: "string" },
                efficiency_improvement: { type: "number" }
              }
            },
            real_time_alerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  location: { type: "string" },
                  impact: { type: "string" },
                  alternative: { type: "string" }
                }
              }
            }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setRouteOptimization(data);
      toast.success('تم تحسين مسارات الأسطول');
    }
  });

  // Smart Insights
  const smartInsightsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت محلل بيانات ذكي متخصص في استخراج الرؤى من بيانات IoT والأسطول.

قم بتحليل البيانات المجمعة وتقديم رؤى ذكية تشمل:
1. الأنماط المخفية في البيانات
2. الفرص للتحسين
3. المخاطر المحتملة
4. التوصيات الاستراتيجية
5. مقارنة مع معايير الصناعة

البيانات:
- 155 جهاز IoT
- 15 مركبة
- 6 أشهر من البيانات التاريخية
- متوسط وقت التشغيل: 99.2%`,
        response_json_schema: {
          type: "object",
          properties: {
            key_insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string" },
                  confidence: { type: "number" },
                  category: { type: "string" },
                  action_required: { type: "boolean" }
                }
              }
            },
            hidden_patterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pattern: { type: "string" },
                  frequency: { type: "string" },
                  significance: { type: "string" },
                  recommendation: { type: "string" }
                }
              }
            },
            opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  opportunity: { type: "string" },
                  potential_value: { type: "string" },
                  implementation_effort: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk: { type: "string" },
                  probability: { type: "number" },
                  impact: { type: "string" },
                  mitigation: { type: "string" }
                }
              }
            },
            industry_comparison: {
              type: "object",
              properties: {
                overall_score: { type: "number" },
                percentile: { type: "number" },
                strengths: { type: "array", items: { type: "string" } },
                improvement_areas: { type: "array", items: { type: "string" } }
              }
            },
            strategic_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  recommendation: { type: "string" },
                  timeframe: { type: "string" },
                  expected_roi: { type: "string" },
                  resources_required: { type: "string" }
                }
              }
            }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setSmartInsights(data);
      toast.success('تم استخراج الرؤى الذكية');
    }
  });

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-400" />
              تحليلات الذكاء الاصطناعي
            </h1>
            <p className="text-slate-400 mt-1">تنبؤات ذكية ورؤى متقدمة</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'دقة التنبؤات', value: '94.5%', icon: Target, color: 'green' },
          { label: 'التوفير المحقق', value: '23%', icon: TrendingUp, color: 'cyan' },
          { label: 'الرؤى المستخرجة', value: '48', icon: Lightbulb, color: 'amber' },
          { label: 'التحسينات المقترحة', value: '12', icon: Sparkles, color: 'purple' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-500/20`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="predictions" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Zap className="w-4 h-4 ml-2" />
            تنبؤات الأجهزة
          </TabsTrigger>
          <TabsTrigger value="routes" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Route className="w-4 h-4 ml-2" />
            تحسين المسارات
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Lightbulb className="w-4 h-4 ml-2" />
            رؤى ذكية
          </TabsTrigger>
        </TabsList>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4">
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => devicePredictionMutation.mutate()}
                disabled={devicePredictionMutation.isPending}
              >
                {devicePredictionMutation.isPending ? (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4 ml-2" />
                )}
                تحليل وتنبؤ سلوك الأجهزة
              </Button>
            </CardContent>
          </Card>

          {/* Energy Prediction Chart */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">تنبؤ استهلاك الطاقة</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={energyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
                  <Legend />
                  <Area type="monotone" dataKey="actual" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} name="الفعلي" />
                  <Area type="monotone" dataKey="predicted" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} name="المتوقع" />
                  <Area type="monotone" dataKey="optimal" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="الأمثل" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {devicePrediction && (
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Daily Forecast */}
              {devicePrediction.daily_forecast && (
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">توقعات اليوم</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                        <p className="text-slate-400 text-xs">إجمالي الاستهلاك</p>
                        <p className="text-xl font-bold text-white">{devicePrediction.daily_forecast.total_consumption} kWh</p>
                      </div>
                      <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                        <p className="text-slate-400 text-xs">مقارنة بالأمس</p>
                        <p className={`text-xl font-bold ${devicePrediction.daily_forecast.comparison_yesterday >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {devicePrediction.daily_forecast.comparison_yesterday >= 0 ? '+' : ''}{devicePrediction.daily_forecast.comparison_yesterday}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Optimization Potential */}
              {devicePrediction.optimization_potential && (
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">إمكانية التحسين</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">الكفاءة الحالية</span>
                        <span className="text-white">{devicePrediction.optimization_potential.current_efficiency}%</span>
                      </div>
                      <Progress value={devicePrediction.optimization_potential.current_efficiency} className="h-2" />
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">الكفاءة المحتملة</span>
                        <span className="text-green-400">{devicePrediction.optimization_potential.potential_efficiency}%</span>
                      </div>
                      <Progress value={devicePrediction.optimization_potential.potential_efficiency} className="h-2" />
                    </div>
                    <p className="text-cyan-400 text-sm">
                      التوفير المحتمل: {devicePrediction.optimization_potential.potential_savings}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Routes Tab */}
        <TabsContent value="routes" className="space-y-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4">
              <Button
                className="bg-cyan-600 hover:bg-cyan-700"
                onClick={() => routeOptimizationMutation.mutate()}
                disabled={routeOptimizationMutation.isPending}
              >
                {routeOptimizationMutation.isPending ? (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                ) : (
                  <Route className="w-4 h-4 ml-2" />
                )}
                تحسين مسارات الأسطول
              </Button>
            </CardContent>
          </Card>

          {routeOptimization && (
            <>
              {/* Fleet Summary */}
              {routeOptimization.fleet_summary && (
                <div className="grid md:grid-cols-4 gap-4">
                  <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                    <CardContent className="p-4 text-center">
                      <Clock className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                      <p className="text-xl font-bold text-white">{routeOptimization.fleet_summary.total_time_saved}</p>
                      <p className="text-xs text-slate-400">الوقت الموفر</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                    <CardContent className="p-4 text-center">
                      <Navigation className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <p className="text-xl font-bold text-white">{routeOptimization.fleet_summary.total_distance_saved}</p>
                      <p className="text-xs text-slate-400">المسافة الموفرة</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                    <CardContent className="p-4 text-center">
                      <Fuel className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                      <p className="text-xl font-bold text-white">{routeOptimization.fleet_summary.total_fuel_saved}</p>
                      <p className="text-xs text-slate-400">الوقود الموفر</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <p className="text-xl font-bold text-white">{routeOptimization.fleet_summary.cost_savings}</p>
                      <p className="text-xs text-slate-400">التوفير المالي</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Optimized Routes */}
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader>
                  <CardTitle className="text-white text-sm">المسارات المحسنة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {routeOptimization.optimized_routes?.map((route, i) => (
                    <div key={i} className="p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Car className="w-5 h-5 text-cyan-400" />
                          <span className="text-white font-medium">{route.vehicle_id}</span>
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-green-500/20 text-green-400">{route.time_saved} وقت</Badge>
                          <Badge className="bg-cyan-500/20 text-cyan-400">{route.distance_saved}</Badge>
                        </div>
                      </div>
                      <div className="text-sm space-y-1">
                        <p className="text-slate-400">المسار الحالي: <span className="text-white">{route.current_route}</span></p>
                        <p className="text-slate-400">المسار المحسن: <span className="text-green-400">{route.optimized_route}</span></p>
                      </div>
                      {route.congestion_avoided?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {route.congestion_avoided.map((point, j) => (
                            <Badge key={j} variant="outline" className="border-amber-500/50 text-amber-400 text-xs">
                              تجنب: {point}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Traffic Alerts */}
              {routeOptimization.real_time_alerts?.length > 0 && (
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">تنبيهات المرور</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {routeOptimization.real_time_alerts.map((alert, i) => (
                      <div key={i} className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-white text-sm font-medium">{alert.type} - {alert.location}</p>
                            <p className="text-slate-400 text-xs">التأثير: {alert.impact}</p>
                            <p className="text-green-400 text-xs">البديل: {alert.alternative}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4">
              <Button
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => smartInsightsMutation.mutate()}
                disabled={smartInsightsMutation.isPending}
              >
                {smartInsightsMutation.isPending ? (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                ) : (
                  <Lightbulb className="w-4 h-4 ml-2" />
                )}
                استخراج الرؤى الذكية
              </Button>
            </CardContent>
          </Card>

          {smartInsights && (
            <>
              {/* Industry Comparison */}
              {smartInsights.industry_comparison && (
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-slate-400 text-sm">تصنيفك في الصناعة</p>
                        <p className="text-4xl font-bold text-white">{smartInsights.industry_comparison.overall_score}/100</p>
                      </div>
                      <div className="text-left">
                        <p className="text-slate-400 text-sm">المئوي</p>
                        <p className="text-2xl font-bold text-green-400">أعلى {smartInsights.industry_comparison.percentile}%</p>
                      </div>
                    </div>
                    <Progress value={smartInsights.industry_comparison.overall_score} className="h-3" />
                  </CardContent>
                </Card>
              )}

              {/* Key Insights */}
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader>
                  <CardTitle className="text-white text-sm">الرؤى الرئيسية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {smartInsights.key_insights?.map((insight, i) => (
                    <div key={i} className={`p-4 rounded-lg ${
                      insight.action_required ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-800/50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white font-medium">{insight.title}</p>
                          <p className="text-slate-400 text-sm mt-1">{insight.description}</p>
                        </div>
                        <Badge className={`${
                          insight.confidence >= 90 ? 'bg-green-500/20 text-green-400' :
                          insight.confidence >= 70 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {insight.confidence}% ثقة
                        </Badge>
                      </div>
                      {insight.action_required && (
                        <p className="text-amber-400 text-xs mt-2 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          يتطلب إجراء
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Opportunities & Risks */}
              <div className="grid lg:grid-cols-2 gap-4">
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-green-400" />
                      الفرص
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {smartInsights.opportunities?.map((opp, i) => (
                      <div key={i} className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-white text-sm font-medium">{opp.opportunity}</p>
                        <p className="text-green-400 text-xs mt-1">القيمة المحتملة: {opp.potential_value}</p>
                        <Badge className={`mt-2 ${
                          opp.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          opp.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {opp.priority === 'high' ? 'أولوية عالية' : opp.priority === 'medium' ? 'أولوية متوسطة' : 'أولوية منخفضة'}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-400" />
                      المخاطر
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {smartInsights.risks?.map((risk, i) => (
                      <div key={i} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-white text-sm font-medium">{risk.risk}</p>
                        <p className="text-slate-400 text-xs mt-1">الاحتمالية: {risk.probability}%</p>
                        <p className="text-cyan-400 text-xs">التخفيف: {risk.mitigation}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}