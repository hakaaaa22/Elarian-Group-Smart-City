import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown, AlertTriangle, Brain, Clock,
  Cpu, Thermometer, Zap, Activity, Calendar, Download, RefreshCw,
  Filter, Search, ChevronDown, Loader2, Target, Shield, Gauge
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Scatter
} from 'recharts';

// Mock historical data
const historicalData = [
  { month: 'يناير', devices: 120, alerts: 45, uptime: 98.2, consumption: 1200 },
  { month: 'فبراير', devices: 125, alerts: 38, uptime: 98.8, consumption: 1150 },
  { month: 'مارس', devices: 132, alerts: 52, uptime: 97.5, consumption: 1350 },
  { month: 'أبريل', devices: 140, alerts: 41, uptime: 98.5, consumption: 1280 },
  { month: 'مايو', devices: 148, alerts: 35, uptime: 99.1, consumption: 1220 },
  { month: 'يونيو', devices: 155, alerts: 28, uptime: 99.4, consumption: 1180 },
];

const dailyData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  cpu: Math.round(40 + Math.random() * 40),
  memory: Math.round(50 + Math.random() * 30),
  network: Math.round(20 + Math.random() * 60),
  anomaly: Math.random() > 0.9 ? 1 : 0,
}));

const deviceCategories = [
  { id: 'all', name: 'جميع الأجهزة' },
  { id: 'camera', name: 'الكاميرات' },
  { id: 'sensor', name: 'المستشعرات' },
  { id: 'vehicle', name: 'المركبات' },
  { id: 'drone', name: 'الطائرات' },
];

export default function DataAnalytics() {
  const [activeTab, setActiveTab] = useState('trends');
  const [timeRange, setTimeRange] = useState('6months');
  const [deviceCategory, setDeviceCategory] = useState('all');
  const [anomalyAnalysis, setAnomalyAnalysis] = useState(null);
  const [failurePrediction, setFailurePrediction] = useState(null);

  // Anomaly Detection AI
  const anomalyMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت محلل بيانات متخصص في كشف الأنماط الشاذة في بيانات أجهزة IoT.

قم بتحليل البيانات التالية وكشف أي أنماط غير طبيعية:

بيانات الاستخدام اليومي لآخر 30 يوم:
${JSON.stringify(dailyData.slice(-10))}

بيانات الاتجاهات الشهرية:
${JSON.stringify(historicalData)}

قدم تحليلاً شاملاً يتضمن:
1. الأنماط الشاذة المكتشفة
2. الأسباب المحتملة
3. مستوى الخطورة
4. التوصيات الوقائية
5. التنبؤ بالمشاكل المستقبلية`,
        response_json_schema: {
          type: "object",
          properties: {
            anomalies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string" },
                  affected_devices: { type: "number" },
                  timestamp: { type: "string" },
                  probable_cause: { type: "string" }
                }
              }
            },
            overall_health_score: { type: "number" },
            trend_analysis: {
              type: "object",
              properties: {
                direction: { type: "string" },
                change_percentage: { type: "number" },
                key_factors: { type: "array", items: { type: "string" } }
              }
            },
            predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  probability: { type: "number" },
                  timeframe: { type: "string" },
                  prevention_steps: { type: "array", items: { type: "string" } }
                }
              }
            },
            recommendations: { type: "array", items: { type: "string" } },
            resource_optimization: {
              type: "object",
              properties: {
                current_efficiency: { type: "number" },
                potential_savings: { type: "string" },
                optimization_areas: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setAnomalyAnalysis(data);
      toast.success('تم اكتشاف الأنماط الشاذة');
    }
  });

  // Failure Prediction AI
  const failureMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير في الصيانة التنبؤية للأجهزة. قم بتحليل بيانات الأجهزة والتنبؤ بالأعطال المحتملة.

البيانات:
${JSON.stringify(historicalData)}

قدم:
1. قائمة الأجهزة المعرضة للعطل
2. احتمالية العطل والإطار الزمني
3. نوع العطل المتوقع
4. تكلفة الصيانة المتوقعة
5. خطوات الوقاية`,
        response_json_schema: {
          type: "object",
          properties: {
            at_risk_devices: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  device_id: { type: "string" },
                  device_type: { type: "string" },
                  failure_probability: { type: "number" },
                  expected_failure_type: { type: "string" },
                  days_until_failure: { type: "number" },
                  maintenance_cost: { type: "string" },
                  replacement_cost: { type: "string" },
                  health_indicators: {
                    type: "object",
                    properties: {
                      cpu_health: { type: "number" },
                      memory_health: { type: "number" },
                      storage_health: { type: "number" },
                      network_health: { type: "number" }
                    }
                  }
                }
              }
            },
            maintenance_schedule: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  device_id: { type: "string" },
                  recommended_date: { type: "string" },
                  maintenance_type: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            cost_analysis: {
              type: "object",
              properties: {
                preventive_maintenance_cost: { type: "string" },
                potential_failure_cost: { type: "string" },
                savings_with_prevention: { type: "string" }
              }
            },
            summary: { type: "string" }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setFailurePrediction(data);
      toast.success('تم تحليل التنبؤ بالأعطال');
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
              <BarChart3 className="w-8 h-8 text-cyan-400" />
              تحليل البيانات المتقدم
            </h1>
            <p className="text-slate-400 mt-1">تحليل الاتجاهات واكتشاف الأنماط والتنبؤ بالأعطال</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="7days">7 أيام</SelectItem>
                <SelectItem value="30days">30 يوم</SelectItem>
                <SelectItem value="3months">3 أشهر</SelectItem>
                <SelectItem value="6months">6 أشهر</SelectItem>
                <SelectItem value="1year">سنة</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-slate-600">
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'متوسط وقت التشغيل', value: '99.2%', change: '+0.5%', icon: Activity, color: 'green', trend: 'up' },
          { label: 'الأجهزة النشطة', value: '155', change: '+12', icon: Cpu, color: 'cyan', trend: 'up' },
          { label: 'التنبيهات الشهرية', value: '28', change: '-25%', icon: AlertTriangle, color: 'amber', trend: 'down' },
          { label: 'استهلاك الموارد', value: '1.18 TB', change: '-5%', icon: Gauge, color: 'purple', trend: 'down' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="trends" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <TrendingUp className="w-4 h-4 ml-2" />
            الاتجاهات
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <AlertTriangle className="w-4 h-4 ml-2" />
            الأنماط الشاذة
          </TabsTrigger>
          <TabsTrigger value="prediction" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Brain className="w-4 h-4 ml-2" />
            التنبؤ بالأعطال
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <BarChart3 className="w-4 h-4 ml-2" />
            التقارير
          </TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">نمو الأجهزة ومعدل التنبيهات</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                    <YAxis yAxisId="left" stroke="#94a3b8" fontSize={10} />
                    <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="devices" fill="#22d3ee" name="الأجهزة" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="alerts" stroke="#f59e0b" name="التنبيهات" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">وقت التشغيل والاستهلاك</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
                    <Legend />
                    <Area type="monotone" dataKey="uptime" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="وقت التشغيل %" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">استخدام الموارد اليومي</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="cpu" stroke="#22d3ee" name="CPU %" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="memory" stroke="#a855f7" name="الذاكرة %" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="network" stroke="#10b981" name="الشبكة %" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anomalies Tab */}
        <TabsContent value="anomalies" className="space-y-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4">
              <Button
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => anomalyMutation.mutate()}
                disabled={anomalyMutation.isPending}
              >
                {anomalyMutation.isPending ? (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4 ml-2" />
                )}
                تحليل الأنماط الشاذة بالذكاء الاصطناعي
              </Button>
            </CardContent>
          </Card>

          {anomalyAnalysis && (
            <>
              {/* Health Score */}
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">نقاط صحة النظام</p>
                      <p className="text-4xl font-bold text-white mt-1">{anomalyAnalysis.overall_health_score}%</p>
                    </div>
                    <div className={`p-4 rounded-xl ${
                      anomalyAnalysis.overall_health_score >= 90 ? 'bg-green-500/20' :
                      anomalyAnalysis.overall_health_score >= 70 ? 'bg-amber-500/20' : 'bg-red-500/20'
                    }`}>
                      <Shield className={`w-8 h-8 ${
                        anomalyAnalysis.overall_health_score >= 90 ? 'text-green-400' :
                        anomalyAnalysis.overall_health_score >= 70 ? 'text-amber-400' : 'text-red-400'
                      }`} />
                    </div>
                  </div>
                  <Progress value={anomalyAnalysis.overall_health_score} className="mt-4 h-2" />
                </CardContent>
              </Card>

              {/* Detected Anomalies */}
              <div className="grid lg:grid-cols-2 gap-4">
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">الأنماط الشاذة المكتشفة</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {anomalyAnalysis.anomalies?.map((anomaly, i) => (
                      <div key={i} className={`p-3 rounded-lg ${
                        anomaly.severity === 'high' ? 'bg-red-500/20' :
                        anomaly.severity === 'medium' ? 'bg-amber-500/20' : 'bg-blue-500/20'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-white font-medium text-sm">{anomaly.type}</p>
                            <p className="text-slate-400 text-xs mt-1">{anomaly.description}</p>
                            <p className="text-slate-500 text-xs mt-1">السبب المحتمل: {anomaly.probable_cause}</p>
                          </div>
                          <Badge className={`${
                            anomaly.severity === 'high' ? 'bg-red-600' :
                            anomaly.severity === 'medium' ? 'bg-amber-600' : 'bg-blue-600'
                          }`}>
                            {anomaly.severity === 'high' ? 'عالي' : anomaly.severity === 'medium' ? 'متوسط' : 'منخفض'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">التوصيات</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {anomalyAnalysis.recommendations?.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-slate-800/50 rounded-lg">
                        <Target className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <p className="text-slate-300 text-sm">{rec}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Prediction Tab */}
        <TabsContent value="prediction" className="space-y-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4">
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => failureMutation.mutate()}
                disabled={failureMutation.isPending}
              >
                {failureMutation.isPending ? (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4 ml-2" />
                )}
                التنبؤ بالأعطال المحتملة
              </Button>
            </CardContent>
          </Card>

          {failurePrediction && (
            <>
              {/* Cost Analysis */}
              {failurePrediction.cost_analysis && (
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                    <CardContent className="p-4 text-center">
                      <p className="text-slate-400 text-sm">تكلفة الصيانة الوقائية</p>
                      <p className="text-2xl font-bold text-cyan-400 mt-1">{failurePrediction.cost_analysis.preventive_maintenance_cost}</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                    <CardContent className="p-4 text-center">
                      <p className="text-slate-400 text-sm">تكلفة العطل المحتمل</p>
                      <p className="text-2xl font-bold text-red-400 mt-1">{failurePrediction.cost_analysis.potential_failure_cost}</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                    <CardContent className="p-4 text-center">
                      <p className="text-slate-400 text-sm">التوفير المتوقع</p>
                      <p className="text-2xl font-bold text-green-400 mt-1">{failurePrediction.cost_analysis.savings_with_prevention}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* At Risk Devices */}
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader>
                  <CardTitle className="text-white text-sm">الأجهزة المعرضة للعطل</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {failurePrediction.at_risk_devices?.map((device, i) => (
                      <div key={i} className="p-4 bg-slate-800/50 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-white font-medium">{device.device_id}</p>
                            <p className="text-slate-400 text-sm">{device.device_type}</p>
                          </div>
                          <Badge className={`${
                            device.failure_probability >= 70 ? 'bg-red-600' :
                            device.failure_probability >= 40 ? 'bg-amber-600' : 'bg-green-600'
                          }`}>
                            {device.failure_probability}% احتمال العطل
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div className="p-2 bg-slate-900/50 rounded">
                            <p className="text-slate-500">نوع العطل المتوقع</p>
                            <p className="text-white">{device.expected_failure_type}</p>
                          </div>
                          <div className="p-2 bg-slate-900/50 rounded">
                            <p className="text-slate-500">الأيام حتى العطل</p>
                            <p className="text-amber-400 font-medium">{device.days_until_failure} يوم</p>
                          </div>
                          <div className="p-2 bg-slate-900/50 rounded">
                            <p className="text-slate-500">تكلفة الصيانة</p>
                            <p className="text-white">{device.maintenance_cost}</p>
                          </div>
                          <div className="p-2 bg-slate-900/50 rounded">
                            <p className="text-slate-500">تكلفة الاستبدال</p>
                            <p className="text-white">{device.replacement_cost}</p>
                          </div>
                        </div>
                        {device.health_indicators && (
                          <div className="grid grid-cols-4 gap-2 mt-3">
                            {Object.entries(device.health_indicators).map(([key, value]) => (
                              <div key={key}>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-slate-400">{key.replace('_health', '')}</span>
                                  <span className="text-white">{value}%</span>
                                </div>
                                <Progress value={value} className="h-1" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance Schedule */}
              {failurePrediction.maintenance_schedule?.length > 0 && (
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">جدول الصيانة المقترح</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {failurePrediction.maintenance_schedule.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-cyan-400" />
                            <div>
                              <p className="text-white text-sm">{item.device_id}</p>
                              <p className="text-slate-400 text-xs">{item.maintenance_type}</p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-white text-sm">{item.recommended_date}</p>
                            <Badge className={`${
                              item.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              item.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'
                            }`}>
                              {item.priority === 'high' ? 'عالي' : item.priority === 'medium' ? 'متوسط' : 'منخفض'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">إنشاء تقرير مخصص</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-slate-300 text-sm">نوع التقرير</Label>
                  <Select defaultValue="performance">
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="performance">أداء الأجهزة</SelectItem>
                      <SelectItem value="consumption">استهلاك الموارد</SelectItem>
                      <SelectItem value="alerts">التنبيهات والحوادث</SelectItem>
                      <SelectItem value="maintenance">الصيانة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">الفترة</Label>
                  <Select defaultValue="month">
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="week">أسبوع</SelectItem>
                      <SelectItem value="month">شهر</SelectItem>
                      <SelectItem value="quarter">ربع سنة</SelectItem>
                      <SelectItem value="year">سنة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">الصيغة</Label>
                  <Select defaultValue="pdf">
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 ml-2" />
                إنشاء التقرير
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}