import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, CloudRain, Zap, Car, Shield, AlertTriangle, TrendingUp, RefreshCw,
  Thermometer, Wind, Activity, Target, Clock, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { toast } from 'sonner';

const weatherForecast = [
  { hour: '12:00', temp: 35, wind: 15, rain: 5 },
  { hour: '14:00', temp: 38, wind: 20, rain: 15 },
  { hour: '16:00', temp: 36, wind: 35, rain: 45 },
  { hour: '18:00', temp: 32, wind: 50, rain: 80 },
  { hour: '20:00', temp: 28, wind: 40, rain: 60 },
];

const energyPrediction = [
  { hour: '12:00', demand: 2.1, supply: 2.5, risk: 15 },
  { hour: '14:00', demand: 2.8, supply: 2.5, risk: 45 },
  { hour: '16:00', demand: 3.2, supply: 2.5, risk: 75 },
  { hour: '18:00', demand: 2.9, supply: 2.5, risk: 55 },
  { hour: '20:00', demand: 2.4, supply: 2.5, risk: 20 },
];

export default function AdvancedPredictiveAnalytics({ module = 'all' }) {
  const [activeTab, setActiveTab] = useState('smartcity');
  const [predictions, setPredictions] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Smart City Predictions
  const smartCityPrediction = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في تحليل بيانات المدن الذكية، قم بتحليل البيانات التالية وتقديم توقعات:

بيانات الطقس:
- درجة الحرارة الحالية: 35°C
- سرعة الرياح: 20 كم/س
- الرطوبة: 45%

بيانات الطاقة:
- الاستهلاك الحالي: 2.4 MW
- السعة القصوى: 3.0 MW
- وقت الذروة المتوقع: 4:00 PM

قدم:
1. توقعات الطقس للـ 6 ساعات القادمة
2. احتمالية أحداث طقس غير متوقعة (عواصف، أمطار غزيرة)
3. توقعات تقلبات شبكة الطاقة
4. توصيات استباقية`,
        response_json_schema: {
          type: "object",
          properties: {
            weatherPredictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  event: { type: "string" },
                  probability: { type: "number" },
                  timeframe: { type: "string" },
                  severity: { type: "string" }
                }
              }
            },
            energyRisks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk: { type: "string" },
                  likelihood: { type: "number" },
                  impact: { type: "string" },
                  mitigation: { type: "string" }
                }
              }
            },
            recommendations: { type: "array", items: { type: "string" } },
            overallRiskLevel: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setPredictions(prev => ({ ...prev, smartcity: data }));
      toast.success('تم تحديث توقعات المدينة الذكية');
    }
  });

  // Fleet Maintenance Predictions
  const fleetPrediction = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في صيانة الأساطيل، قم بتحليل بيانات المركبات التالية:

مركبة #12:
- الكيلومترات: 85,000 كم
- آخر صيانة: قبل 45 يوم
- متوسط السرعة: 75 كم/س
- نمط القيادة: عدواني (كبح حاد متكرر)

مركبة #08:
- الكيلومترات: 120,000 كم
- آخر صيانة: قبل 30 يوم
- استهلاك وقود مرتفع (+15%)

قدم توقعات صيانة تتضمن:
1. الأعطال المحتملة لكل مركبة
2. الوقت المتوقع للعطل
3. التكلفة التقديرية
4. أولوية الصيانة`,
        response_json_schema: {
          type: "object",
          properties: {
            vehiclePredictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  vehicleId: { type: "string" },
                  predictedFailure: { type: "string" },
                  probability: { type: "number" },
                  estimatedTime: { type: "string" },
                  estimatedCost: { type: "number" },
                  priority: { type: "string" },
                  recommendation: { type: "string" }
                }
              }
            },
            fleetHealthScore: { type: "number" },
            totalPredictedSavings: { type: "number" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setPredictions(prev => ({ ...prev, fleet: data }));
      toast.success('تم تحديث توقعات صيانة الأسطول');
    }
  });

  // Compliance Risk Predictions
  const compliancePrediction = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في الامتثال والمخاطر، قم بتحليل الأنماط السلوكية التالية:

مستخدم #45:
- تسجيل دخول غير معتاد: 3 مرات خارج ساعات العمل
- تصدير بيانات: 5 تقارير كبيرة في أسبوع
- محاولات وصول مرفوضة: 2

مستخدم #23:
- تأخر في إكمال التدريبات الإلزامية
- عدم تحديث كلمة المرور منذ 90 يوم

قدم تحليل مخاطر يتضمن:
1. الأنماط المشبوهة
2. مستوى المخاطر لكل مستخدم
3. احتمالية انتهاك الامتثال
4. إجراءات وقائية مقترحة`,
        response_json_schema: {
          type: "object",
          properties: {
            userRisks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  userId: { type: "string" },
                  riskLevel: { type: "string" },
                  riskScore: { type: "number" },
                  suspiciousPatterns: { type: "array", items: { type: "string" } },
                  recommendedActions: { type: "array", items: { type: "string" } }
                }
              }
            },
            overallComplianceRisk: { type: "number" },
            criticalAlerts: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setPredictions(prev => ({ ...prev, compliance: data }));
      toast.success('تم تحديث تحليل مخاطر الامتثال');
    }
  });

  const runAllPredictions = () => {
    setIsAnalyzing(true);
    Promise.all([
      smartCityPrediction.mutateAsync(),
      fleetPrediction.mutateAsync(),
      compliancePrediction.mutateAsync()
    ]).finally(() => setIsAnalyzing(false));
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': case 'حرج': return 'bg-red-500/20 text-red-400';
      case 'high': case 'عالي': return 'bg-amber-500/20 text-amber-400';
      case 'medium': case 'متوسط': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-green-500/20 text-green-400';
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          التحليلات التنبؤية المتقدمة
        </h3>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={runAllPredictions} disabled={isAnalyzing}>
          {isAnalyzing ? <RefreshCw className="w-4 h-4 ml-1 animate-spin" /> : <Brain className="w-4 h-4 ml-1" />}
          تحليل شامل
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="smartcity" className="data-[state=active]:bg-cyan-500/20">
            <CloudRain className="w-4 h-4 ml-1" />
            المدينة الذكية
          </TabsTrigger>
          <TabsTrigger value="fleet" className="data-[state=active]:bg-green-500/20">
            <Car className="w-4 h-4 ml-1" />
            الأسطول
          </TabsTrigger>
          <TabsTrigger value="compliance" className="data-[state=active]:bg-amber-500/20">
            <Shield className="w-4 h-4 ml-1" />
            الامتثال
          </TabsTrigger>
        </TabsList>

        {/* Smart City Tab */}
        <TabsContent value="smartcity" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Weather Prediction Chart */}
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-cyan-400" />
                  توقعات الطقس
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weatherForecast}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="rain" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="احتمال المطر %" />
                      <Area type="monotone" dataKey="wind" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} name="سرعة الرياح" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Energy Grid Prediction */}
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  توقعات شبكة الطاقة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={energyPrediction}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="demand" stroke="#ef4444" strokeWidth={2} name="الطلب MW" />
                      <Line type="monotone" dataKey="supply" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" name="السعة MW" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Predictions */}
          {predictions.smartcity && (
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">توقعات الذكاء الاصطناعي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {predictions.smartcity.weatherPredictions?.map((pred, i) => (
                    <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-medium">{pred.event}</p>
                        <Badge className={getPriorityColor(pred.severity)}>{pred.severity}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Progress value={pred.probability} className="flex-1 h-2" />
                        <span className="text-cyan-400 text-sm">{pred.probability}%</span>
                      </div>
                      <p className="text-slate-400 text-xs">{pred.timeframe}</p>
                    </div>
                  ))}
                </div>
                {predictions.smartcity.recommendations?.length > 0 && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 font-medium mb-2">التوصيات:</p>
                    <ul className="space-y-1">
                      {predictions.smartcity.recommendations.map((rec, i) => (
                        <li key={i} className="text-white text-sm flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!predictions.smartcity && (
            <div className="text-center py-8">
              <Button variant="outline" className="border-cyan-500/50 text-cyan-400" onClick={() => smartCityPrediction.mutate()} disabled={smartCityPrediction.isPending}>
                {smartCityPrediction.isPending ? <RefreshCw className="w-4 h-4 ml-1 animate-spin" /> : <Brain className="w-4 h-4 ml-1" />}
                تشغيل التحليل التنبؤي
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Fleet Tab */}
        <TabsContent value="fleet" className="space-y-4 mt-4">
          {predictions.fleet ? (
            <>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-green-400">{predictions.fleet.fleetHealthScore || 85}%</p>
                    <p className="text-slate-400 text-sm">صحة الأسطول</p>
                  </CardContent>
                </Card>
                <Card className="bg-amber-500/10 border-amber-500/30">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-amber-400">{predictions.fleet.vehiclePredictions?.length || 0}</p>
                    <p className="text-slate-400 text-sm">مركبات تحتاج اهتمام</p>
                  </CardContent>
                </Card>
                <Card className="bg-cyan-500/10 border-cyan-500/30">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-cyan-400">{predictions.fleet.totalPredictedSavings?.toLocaleString() || '15,000'}</p>
                    <p className="text-slate-400 text-sm">ر.س توفير متوقع</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                {predictions.fleet.vehiclePredictions?.map((vehicle, i) => (
                  <Card key={i} className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Car className="w-8 h-8 text-cyan-400" />
                          <div>
                            <p className="text-white font-bold">{vehicle.vehicleId}</p>
                            <p className="text-red-400 text-sm">{vehicle.predictedFailure}</p>
                          </div>
                        </div>
                        <Badge className={getPriorityColor(vehicle.priority)}>{vehicle.priority}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-amber-400 font-bold">{vehicle.probability}%</p>
                          <p className="text-slate-500 text-xs">احتمالية</p>
                        </div>
                        <div>
                          <p className="text-cyan-400 font-bold">{vehicle.estimatedTime}</p>
                          <p className="text-slate-500 text-xs">الوقت المتوقع</p>
                        </div>
                        <div>
                          <p className="text-green-400 font-bold">{vehicle.estimatedCost?.toLocaleString()} ر.س</p>
                          <p className="text-slate-500 text-xs">التكلفة</p>
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm mt-3 p-2 bg-slate-900/50 rounded">{vehicle.recommendation}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Button variant="outline" className="border-green-500/50 text-green-400" onClick={() => fleetPrediction.mutate()} disabled={fleetPrediction.isPending}>
                {fleetPrediction.isPending ? <RefreshCw className="w-4 h-4 ml-1 animate-spin" /> : <Car className="w-4 h-4 ml-1" />}
                تحليل صيانة الأسطول
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4 mt-4">
          {predictions.compliance ? (
            <>
              <Card className={`border ${predictions.compliance.overallComplianceRisk > 50 ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                <CardContent className="p-4 text-center">
                  <p className={`text-4xl font-bold ${predictions.compliance.overallComplianceRisk > 50 ? 'text-red-400' : 'text-green-400'}`}>
                    {100 - (predictions.compliance.overallComplianceRisk || 0)}%
                  </p>
                  <p className="text-slate-400">مستوى الامتثال العام</p>
                </CardContent>
              </Card>

              {predictions.compliance.criticalAlerts?.length > 0 && (
                <Card className="bg-red-500/10 border-red-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-red-400 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      تنبيهات حرجة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {predictions.compliance.criticalAlerts.map((alert, i) => (
                        <li key={i} className="text-white text-sm p-2 bg-red-500/10 rounded">{alert}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                {predictions.compliance.userRisks?.map((user, i) => (
                  <Card key={i} className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-amber-400" />
                          <p className="text-white font-bold">{user.userId}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(user.riskLevel)}>{user.riskLevel}</Badge>
                          <span className="text-amber-400 font-bold">{user.riskScore}%</span>
                        </div>
                      </div>
                      {user.suspiciousPatterns?.length > 0 && (
                        <div className="mb-3">
                          <p className="text-slate-400 text-xs mb-1">الأنماط المشبوهة:</p>
                          <div className="flex flex-wrap gap-1">
                            {user.suspiciousPatterns.map((pattern, j) => (
                              <Badge key={j} className="bg-red-500/20 text-red-400 text-xs">{pattern}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {user.recommendedActions?.length > 0 && (
                        <div className="p-2 bg-green-500/10 rounded">
                          <p className="text-green-400 text-xs mb-1">الإجراءات المقترحة:</p>
                          <ul className="space-y-1">
                            {user.recommendedActions.map((action, j) => (
                              <li key={j} className="text-white text-xs">• {action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Button variant="outline" className="border-amber-500/50 text-amber-400" onClick={() => compliancePrediction.mutate()} disabled={compliancePrediction.isPending}>
                {compliancePrediction.isPending ? <RefreshCw className="w-4 h-4 ml-1 animate-spin" /> : <Shield className="w-4 h-4 ml-1" />}
                تحليل مخاطر الامتثال
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}