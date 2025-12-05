import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  AlertTriangle, Activity, Cpu, Thermometer, Zap, Shield, TrendingUp,
  TrendingDown, Bell, Settings, RefreshCw, Loader2, Eye, Target,
  Clock, Search, CheckCircle, XCircle, Sparkles, Radio, Car, Camera,
  Building2, Droplets, Wind, Volume2, AlertOctagon, Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ScatterChart, Scatter
} from 'recharts';
import { toast } from 'sonner';

const moduleIcons = {
  iot: Cpu,
  fleet: Car,
  cameras: Camera,
  towers: Radio,
  energy: Zap,
  environment: Wind,
  water: Droplets,
  building: Building2
};

const anomalyData = [
  { time: '00:00', normal: 95, anomaly: 2 },
  { time: '04:00', normal: 92, anomaly: 5 },
  { time: '08:00', normal: 88, anomaly: 8 },
  { time: '12:00', normal: 85, anomaly: 12 },
  { time: '16:00', normal: 90, anomaly: 6 },
  { time: '20:00', normal: 94, anomaly: 3 },
];

export default function AIProactiveAnomalyDetector() {
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('realtime');
  const [autoDetection, setAutoDetection] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedModule, setSelectedModule] = useState('all');
  const [thresholds, setThresholds] = useState({
    temperature: [35],
    humidity: [80],
    energy: [500],
    latency: [100]
  });
  const [alertRecipients, setAlertRecipients] = useState('');

  const detectAnomaliesMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل بيانات IoT والمدينة الذكية للكشف الاستباقي عن الشذوذات:

الحدود المخصصة:
- درجة الحرارة: ${thresholds.temperature[0]}°C
- الرطوبة: ${thresholds.humidity[0]}%
- الطاقة: ${thresholds.energy[0]} kWh
- التأخير: ${thresholds.latency[0]}ms

قدم:
1. الشذوذات المكتشفة في الوقت الفعلي:
   - نوع الشذوذ والجهاز المتأثر
   - درجة الخطورة والثقة
   - القيم الفعلية مقارنة بالحدود

2. التنبؤ بالأعطال المحتملة:
   - الأجهزة المعرضة للخطر
   - احتمالية الفشل والإطار الزمني
   - علامات الإنذار المبكر

3. تحليل السبب الجذري:
   - الأسباب المحتملة لكل شذوذ
   - العوامل المساهمة
   - الارتباطات المكتشفة

4. التنبيهات والإشعارات:
   - التنبيهات الموصى بها
   - مستوى الأولوية
   - الإجراءات المطلوبة`,
        response_json_schema: {
          type: "object",
          properties: {
            realtime_anomalies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  device_name: { type: "string" },
                  device_type: { type: "string" },
                  module: { type: "string" },
                  anomaly_type: { type: "string" },
                  severity: { type: "string" },
                  confidence: { type: "number" },
                  actual_value: { type: "string" },
                  expected_range: { type: "string" },
                  detected_at: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            failure_predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  device_name: { type: "string" },
                  device_type: { type: "string" },
                  failure_type: { type: "string" },
                  probability: { type: "number" },
                  timeframe: { type: "string" },
                  warning_signs: { type: "array", items: { type: "string" } },
                  preventive_actions: { type: "array", items: { type: "string" } }
                }
              }
            },
            root_cause_analysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  anomaly_id: { type: "string" },
                  primary_cause: { type: "string" },
                  contributing_factors: { type: "array", items: { type: "string" } },
                  correlations: { type: "array", items: { type: "string" } },
                  confidence: { type: "number" },
                  recommended_fix: { type: "string" }
                }
              }
            },
            alert_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  alert_title: { type: "string" },
                  priority: { type: "string" },
                  affected_systems: { type: "array", items: { type: "string" } },
                  message: { type: "string" },
                  action_required: { type: "string" },
                  notify_roles: { type: "array", items: { type: "string" } }
                }
              }
            },
            summary: {
              type: "object",
              properties: {
                total_anomalies: { type: "number" },
                critical_count: { type: "number" },
                devices_at_risk: { type: "number" },
                health_score: { type: "number" },
                trend: { type: "string" }
              }
            },
            module_health: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  module: { type: "string" },
                  health_score: { type: "number" },
                  anomaly_count: { type: "number" },
                  status: { type: "string" }
                }
              }
            }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      if (data.summary?.critical_count > 0) {
        toast.error(`تم اكتشاف ${data.summary.critical_count} شذوذ حرج!`);
      } else {
        toast.success('تم تحديث تحليل الشذوذات');
      }
    }
  });

  const sendAlertMutation = useMutation({
    mutationFn: async (alert) => {
      // Simulate sending alert
      await new Promise(resolve => setTimeout(resolve, 1000));
      return alert;
    },
    onSuccess: (alert) => {
      toast.success(`تم إرسال التنبيه: ${alert.alert_title}`);
    }
  });

  useEffect(() => {
    detectAnomaliesMutation.mutate();
    
    if (autoDetection) {
      const interval = setInterval(() => {
        detectAnomaliesMutation.mutate();
      }, 60000); // كل دقيقة
      return () => clearInterval(interval);
    }
  }, [autoDetection]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'amber';
      case 'low': return 'green';
      default: return 'slate';
    }
  };

  const getModuleIcon = (module) => {
    const Icon = moduleIcons[module] || Cpu;
    return Icon;
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              boxShadow: analysis?.summary?.critical_count > 0 
                ? ['0 0 10px rgba(239,68,68,0.3)', '0 0 20px rgba(239,68,68,0.6)', '0 0 10px rgba(239,68,68,0.3)']
                : ['0 0 10px rgba(34,197,94,0.3)', '0 0 20px rgba(34,197,94,0.5)', '0 0 10px rgba(34,197,94,0.3)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20"
          >
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold text-lg">الكشف الاستباقي عن الشذوذات AI</h4>
            <p className="text-slate-400 text-xs">الوقت الفعلي • التنبؤ • تحليل الأسباب • التنبيهات</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedModule} onValueChange={setSelectedModule}>
            <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700">
              <SelectValue placeholder="الوحدة" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="iot">IoT</SelectItem>
              <SelectItem value="fleet">الأسطول</SelectItem>
              <SelectItem value="cameras">الكاميرات</SelectItem>
              <SelectItem value="energy">الطاقة</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-lg">
            <Label className="text-slate-300 text-xs">كشف تلقائي</Label>
            <Switch checked={autoDetection} onCheckedChange={setAutoDetection} />
          </div>
          <Button variant="outline" className="border-slate-600" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="border-red-500/50"
            onClick={() => detectAnomaliesMutation.mutate()}
            disabled={detectAnomaliesMutation.isPending}
          >
            {detectAnomaliesMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {analysis?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className={`bg-${analysis.summary.critical_count > 0 ? 'red' : 'green'}-500/10 border-${analysis.summary.critical_count > 0 ? 'red' : 'green'}-500/30`}>
            <CardContent className="p-3 text-center">
              <Activity className={`w-5 h-5 text-${analysis.summary.critical_count > 0 ? 'red' : 'green'}-400 mx-auto mb-1`} />
              <p className="text-xl font-bold text-white">{analysis.summary.health_score}%</p>
              <p className="text-slate-400 text-xs">صحة النظام</p>
            </CardContent>
          </Card>
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-3 text-center">
              <AlertOctagon className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{analysis.summary.total_anomalies}</p>
              <p className="text-slate-400 text-xs">شذوذ مكتشف</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-500/10 border-orange-500/30">
            <CardContent className="p-3 text-center">
              <AlertTriangle className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{analysis.summary.critical_count}</p>
              <p className="text-slate-400 text-xs">حرج</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-3 text-center">
              <Cpu className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{analysis.summary.devices_at_risk}</p>
              <p className="text-slate-400 text-xs">جهاز معرض</p>
            </CardContent>
          </Card>
          <Card className="bg-cyan-500/10 border-cyan-500/30">
            <CardContent className="p-3 text-center">
              {analysis.summary.trend === 'improving' ? (
                <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400 mx-auto mb-1" />
              )}
              <p className="text-sm font-bold text-white">{analysis.summary.trend === 'improving' ? 'تحسن' : 'تراجع'}</p>
              <p className="text-slate-400 text-xs">الاتجاه</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Module Health */}
      {analysis?.module_health && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">صحة الوحدات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {analysis.module_health.map((mod, i) => {
                const ModuleIcon = getModuleIcon(mod.module);
                return (
                  <div key={i} className={`p-3 rounded-lg border ${
                    mod.status === 'healthy' ? 'bg-green-500/10 border-green-500/30' :
                    mod.status === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                    'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <ModuleIcon className={`w-5 h-5 ${
                        mod.status === 'healthy' ? 'text-green-400' :
                        mod.status === 'warning' ? 'text-amber-400' :
                        'text-red-400'
                      }`} />
                      <Badge className={`text-xs ${
                        mod.status === 'healthy' ? 'bg-green-500/20 text-green-400' :
                        mod.status === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>{mod.anomaly_count}</Badge>
                    </div>
                    <p className="text-white text-sm font-medium mb-1">{mod.module}</p>
                    <Progress value={mod.health_score} className="h-1" />
                    <p className="text-slate-400 text-xs mt-1">{mod.health_score}%</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Anomaly Chart */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">اتجاه الشذوذات (24 ساعة)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={anomalyData}>
                <defs>
                  <linearGradient id="anomalyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
                <Area type="monotone" dataKey="normal" stroke="#22c55e" fill="transparent" strokeWidth={2} name="طبيعي %" />
                <Area type="monotone" dataKey="anomaly" stroke="#ef4444" fill="url(#anomalyGrad)" strokeWidth={2} name="شذوذات" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      {analysis && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
            <TabsTrigger value="realtime" className="data-[state=active]:bg-red-500/20">
              <Activity className="w-3 h-3 ml-1" />
              الوقت الفعلي
            </TabsTrigger>
            <TabsTrigger value="predictions" className="data-[state=active]:bg-purple-500/20">
              <TrendingUp className="w-3 h-3 ml-1" />
              التنبؤات
            </TabsTrigger>
            <TabsTrigger value="root-cause" className="data-[state=active]:bg-cyan-500/20">
              <Search className="w-3 h-3 ml-1" />
              تحليل الأسباب
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-amber-500/20">
              <Bell className="w-3 h-3 ml-1" />
              التنبيهات
            </TabsTrigger>
          </TabsList>

          {/* Realtime Anomalies */}
          <TabsContent value="realtime" className="mt-4">
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-4">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {analysis.realtime_anomalies?.map((anomaly, i) => {
                      const ModuleIcon = getModuleIcon(anomaly.module);
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`p-4 rounded-lg border ${
                            anomaly.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                            anomaly.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                            'bg-slate-900/50 border-slate-700/50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <ModuleIcon className={`w-5 h-5 text-${getSeverityColor(anomaly.severity)}-400`} />
                              <div>
                                <p className="text-white font-medium">{anomaly.device_name}</p>
                                <p className="text-slate-400 text-xs">{anomaly.device_type}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`bg-${getSeverityColor(anomaly.severity)}-500/20 text-${getSeverityColor(anomaly.severity)}-400 text-xs`}>
                                {anomaly.severity}
                              </Badge>
                              <Badge variant="outline" className="border-slate-600 text-xs">
                                ثقة {anomaly.confidence}%
                              </Badge>
                            </div>
                          </div>
                          <p className="text-slate-300 text-sm mb-2">{anomaly.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-red-400">الفعلي: {anomaly.actual_value}</span>
                            <span className="text-green-400">المتوقع: {anomaly.expected_range}</span>
                            <span className="text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {anomaly.detected_at}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Predictions */}
          <TabsContent value="predictions" className="mt-4">
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-4">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {analysis.failure_predictions?.map((pred, i) => (
                      <div key={i} className="p-4 bg-slate-900/50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-white font-bold">{pred.device_name}</p>
                            <p className="text-slate-400 text-xs">{pred.device_type}</p>
                          </div>
                          <div className="text-left">
                            <Badge className={`${
                              pred.probability >= 70 ? 'bg-red-500/20 text-red-400' :
                              pred.probability >= 40 ? 'bg-amber-500/20 text-amber-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              احتمالية {pred.probability}%
                            </Badge>
                            <p className="text-slate-400 text-xs mt-1">{pred.timeframe}</p>
                          </div>
                        </div>
                        <p className="text-purple-400 text-sm mb-3">نوع الفشل: {pred.failure_type}</p>
                        
                        <div className="mb-3">
                          <p className="text-slate-400 text-xs mb-1">علامات التحذير:</p>
                          <div className="flex flex-wrap gap-1">
                            {pred.warning_signs?.map((sign, j) => (
                              <Badge key={j} variant="outline" className="text-xs border-amber-500/30 text-amber-400">{sign}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-slate-400 text-xs mb-1">الإجراءات الوقائية:</p>
                          <ul className="space-y-1">
                            {pred.preventive_actions?.map((action, j) => (
                              <li key={j} className="text-green-400 text-xs flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Root Cause Analysis */}
          <TabsContent value="root-cause" className="mt-4">
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardContent className="p-4">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {analysis.root_cause_analysis?.map((rca, i) => (
                      <div key={i} className="p-4 bg-slate-900/50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                            الشذوذ #{rca.anomaly_id}
                          </Badge>
                          <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                            ثقة {rca.confidence}%
                          </Badge>
                        </div>
                        
                        <div className="p-3 bg-red-500/10 rounded mb-3">
                          <p className="text-red-400 text-xs font-medium">السبب الرئيسي:</p>
                          <p className="text-white">{rca.primary_cause}</p>
                        </div>

                        <div className="mb-3">
                          <p className="text-slate-400 text-xs mb-1">العوامل المساهمة:</p>
                          <ul className="space-y-1">
                            {rca.contributing_factors?.map((factor, j) => (
                              <li key={j} className="text-slate-300 text-xs flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-amber-400" />
                                {factor}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {rca.correlations?.length > 0 && (
                          <div className="mb-3">
                            <p className="text-slate-400 text-xs mb-1">الارتباطات:</p>
                            <div className="flex flex-wrap gap-1">
                              {rca.correlations.map((corr, j) => (
                                <Badge key={j} className="bg-slate-700 text-slate-300 text-xs">{corr}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="p-3 bg-green-500/10 rounded">
                          <p className="text-green-400 text-xs font-medium">الإصلاح الموصى:</p>
                          <p className="text-white text-sm">{rca.recommended_fix}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts */}
          <TabsContent value="alerts" className="mt-4">
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-4">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {analysis.alert_recommendations?.map((alert, i) => (
                      <div key={i} className={`p-4 rounded-lg border ${
                        alert.priority === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                        alert.priority === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                        'bg-slate-900/50 border-slate-700/50'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Bell className={`w-5 h-5 text-${getSeverityColor(alert.priority)}-400`} />
                            <span className="text-white font-medium">{alert.alert_title}</span>
                          </div>
                          <Badge className={`bg-${getSeverityColor(alert.priority)}-500/20 text-${getSeverityColor(alert.priority)}-400 text-xs`}>
                            {alert.priority}
                          </Badge>
                        </div>
                        <p className="text-slate-300 text-sm mb-2">{alert.message}</p>
                        <p className="text-amber-400 text-xs mb-2">الإجراء: {alert.action_required}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {alert.notify_roles?.map((role, j) => (
                              <Badge key={j} variant="outline" className="text-xs border-slate-600">{role}</Badge>
                            ))}
                          </div>
                          <Button
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700 h-7"
                            onClick={() => sendAlertMutation.mutate(alert)}
                            disabled={sendAlertMutation.isPending}
                          >
                            <Send className="w-3 h-3 ml-1" />
                            إرسال
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">إعدادات الكشف عن الشذوذات</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300 text-sm">حد درجة الحرارة (°C)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider value={thresholds.temperature} onValueChange={(v) => setThresholds({...thresholds, temperature: v})} max={50} />
                <Badge>{thresholds.temperature[0]}°C</Badge>
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">حد الرطوبة (%)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider value={thresholds.humidity} onValueChange={(v) => setThresholds({...thresholds, humidity: v})} max={100} />
                <Badge>{thresholds.humidity[0]}%</Badge>
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">حد الطاقة (kWh)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider value={thresholds.energy} onValueChange={(v) => setThresholds({...thresholds, energy: v})} max={1000} />
                <Badge>{thresholds.energy[0]}</Badge>
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">حد التأخير (ms)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider value={thresholds.latency} onValueChange={(v) => setThresholds({...thresholds, latency: v})} max={500} />
                <Badge>{thresholds.latency[0]}ms</Badge>
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">مستلمو التنبيهات (البريد الإلكتروني)</Label>
              <Input
                value={alertRecipients}
                onChange={(e) => setAlertRecipients(e.target.value)}
                placeholder="email@example.com, ..."
                className="mt-2 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => { setShowSettings(false); detectAnomaliesMutation.mutate(); }}>
              حفظ وتطبيق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}