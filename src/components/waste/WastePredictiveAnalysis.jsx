import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, TrendingUp, Calendar, CloudRain, Users, AlertTriangle,
  RefreshCw, Target, Truck, Package, Clock, Zap, BarChart3,
  ThermometerSun, Wind, MapPin, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'sonner';

const historicalData = [
  { month: 'يناير', actual: 1200, predicted: 1180, events: 2 },
  { month: 'فبراير', actual: 1350, predicted: 1320, events: 3 },
  { month: 'مارس', actual: 1180, predicted: 1200, events: 1 },
  { month: 'أبريل', actual: 1420, predicted: 1380, events: 4 },
  { month: 'مايو', actual: 1380, predicted: 1400, events: 2 },
  { month: 'يونيو', actual: 1500, predicted: 1480, events: 5 },
];

const weeklyPrediction = [
  { day: 'السبت', predicted: 185, confidence: 92, risk: 'low' },
  { day: 'الأحد', predicted: 178, confidence: 94, risk: 'low' },
  { day: 'الإثنين', predicted: 195, confidence: 88, risk: 'medium' },
  { day: 'الثلاثاء', predicted: 210, confidence: 85, risk: 'medium' },
  { day: 'الأربعاء', predicted: 188, confidence: 91, risk: 'low' },
  { day: 'الخميس', predicted: 175, confidence: 93, risk: 'low' },
  { day: 'الجمعة', predicted: 245, confidence: 78, risk: 'high' },
];

const upcomingEvents = [
  { name: 'مهرجان الربيع', date: '2024-12-15', impact: '+35%', type: 'festival' },
  { name: 'مباراة كرة قدم', date: '2024-12-10', impact: '+20%', type: 'sports' },
  { name: 'عطلة رسمية', date: '2024-12-20', impact: '+15%', type: 'holiday' },
];

const weatherImpact = {
  temperature: 32,
  condition: 'مشمس',
  impactOnWaste: '+8%',
  recommendation: 'زيادة تكرار الجمع في المناطق التجارية'
};

const binOverflowRisks = [
  { id: 'BIN-012', location: 'مركز التسوق الشمالي', currentFill: 45, predictedFill: 92, timeToOverflow: '18 ساعة', risk: 'high' },
  { id: 'BIN-023', location: 'الحي السكني الغربي', currentFill: 38, predictedFill: 85, timeToOverflow: '24 ساعة', risk: 'medium' },
  { id: 'BIN-008', location: 'محطة الحافلات', currentFill: 52, predictedFill: 88, timeToOverflow: '16 ساعة', risk: 'high' },
  { id: 'BIN-031', location: 'الحديقة المركزية', currentFill: 28, predictedFill: 75, timeToOverflow: '32 ساعة', risk: 'medium' },
];

export default function WastePredictiveAnalysis() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [resourceAllocation, setResourceAllocation] = useState(null);

  const runPredictiveAnalysis = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في تحليل أنماط توليد النفايات باستخدام الذكاء الاصطناعي، قم بتحليل البيانات التالية:

البيانات التاريخية (طن/شهر):
${historicalData.map(d => `- ${d.month}: ${d.actual} طن (${d.events} أحداث)`).join('\n')}

التوقعات الأسبوعية:
${weeklyPrediction.map(d => `- ${d.day}: ${d.predicted} طن (ثقة ${d.confidence}%)`).join('\n')}

الأحداث القادمة:
${upcomingEvents.map(e => `- ${e.name} (${e.date}): تأثير ${e.impact}`).join('\n')}

حالة الطقس: ${weatherImpact.temperature}°C، ${weatherImpact.condition}

الحاويات المعرضة للخطر:
${binOverflowRisks.map(b => `- ${b.id}: ${b.currentFill}% حالياً، متوقع ${b.predictedFill}% خلال ${b.timeToOverflow}`).join('\n')}

قدم تحليلاً شاملاً يتضمن:
1. توقعات توليد النفايات للأسبوع القادم
2. تأثير الأحداث والطقس
3. الحاويات التي تحتاج اهتمام فوري
4. توصيات لتحسين جداول الجمع
5. تخصيص الموارد المقترح (الشاحنات والعمال)`,
        response_json_schema: {
          type: "object",
          properties: {
            weeklyForecast: {
              type: "object",
              properties: {
                totalPredicted: { type: "number" },
                peakDay: { type: "string" },
                peakAmount: { type: "number" },
                confidence: { type: "number" }
              }
            },
            eventImpacts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  event: { type: "string" },
                  impactPercentage: { type: "number" },
                  affectedAreas: { type: "array", items: { type: "string" } },
                  recommendation: { type: "string" }
                }
              }
            },
            urgentBins: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  binId: { type: "string" },
                  priority: { type: "string" },
                  recommendedAction: { type: "string" },
                  optimalCollectionTime: { type: "string" }
                }
              }
            },
            scheduleOptimization: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "string" },
                  recommendedTrucks: { type: "number" },
                  recommendedStaff: { type: "number" },
                  focusAreas: { type: "array", items: { type: "string" } }
                }
              }
            },
            overallRecommendations: { type: "array", items: { type: "string" } },
            riskSummary: {
              type: "object",
              properties: {
                highRiskBins: { type: "number" },
                mediumRiskBins: { type: "number" },
                overflowProbability: { type: "number" }
              }
            }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast.success('تم إكمال التحليل التنبؤي');
    }
  });

  const optimizeResources = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `بناءً على توقعات توليد النفايات ومخاطر الفيضان، قم بتحسين تخصيص الموارد:

الموارد المتاحة:
- 25 شاحنة (22 نشطة)
- 45 سائق
- 30 عامل جمع

التوقعات:
${weeklyPrediction.map(d => `- ${d.day}: ${d.predicted} طن`).join('\n')}

الحاويات الحرجة: ${binOverflowRisks.filter(b => b.risk === 'high').length}

قدم خطة تخصيص موارد مفصلة لكل يوم.`,
        response_json_schema: {
          type: "object",
          properties: {
            dailyAllocation: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "string" },
                  trucks: { type: "number" },
                  drivers: { type: "number" },
                  workers: { type: "number" },
                  shifts: { type: "number" },
                  priority: { type: "string" }
                }
              }
            },
            costEstimate: { type: "number" },
            efficiencyGain: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setResourceAllocation(data);
      toast.success('تم تحسين تخصيص الموارد');
    }
  });

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'red';
      case 'medium': return 'amber';
      default: return 'green';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          التحليل التنبؤي لتوليد النفايات
        </h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-purple-500 text-purple-400"
            onClick={() => optimizeResources.mutate()}
            disabled={optimizeResources.isPending}
          >
            {optimizeResources.isPending ? <RefreshCw className="w-4 h-4 ml-1 animate-spin" /> : <Truck className="w-4 h-4 ml-1" />}
            تحسين الموارد
          </Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => runPredictiveAnalysis.mutate()}
            disabled={runPredictiveAnalysis.isPending}
          >
            {runPredictiveAnalysis.isPending ? <RefreshCw className="w-4 h-4 ml-1 animate-spin" /> : <Zap className="w-4 h-4 ml-1" />}
            تشغيل التحليل
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{weeklyPrediction.reduce((s, d) => s + d.predicted, 0)}</p>
            <p className="text-purple-400 text-xs">طن متوقع هذا الأسبوع</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{binOverflowRisks.filter(b => b.risk === 'high').length}</p>
            <p className="text-red-400 text-xs">حاويات عالية الخطورة</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-4 text-center">
            <Calendar className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{upcomingEvents.length}</p>
            <p className="text-cyan-400 text-xs">أحداث قادمة</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <ThermometerSun className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{weatherImpact.impactOnWaste}</p>
            <p className="text-amber-400 text-xs">تأثير الطقس</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="forecast" className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="forecast" className="data-[state=active]:bg-purple-500/20">
            <TrendingUp className="w-4 h-4 ml-1" />
            التوقعات
          </TabsTrigger>
          <TabsTrigger value="risks" className="data-[state=active]:bg-red-500/20">
            <AlertTriangle className="w-4 h-4 ml-1" />
            المخاطر
          </TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:bg-cyan-500/20">
            <Calendar className="w-4 h-4 ml-1" />
            الأحداث
          </TabsTrigger>
          <TabsTrigger value="resources" className="data-[state=active]:bg-green-500/20">
            <Truck className="w-4 h-4 ml-1" />
            الموارد
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">التوقعات مقابل الفعلي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Legend />
                      <Area type="monotone" dataKey="actual" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="الفعلي" />
                      <Area type="monotone" dataKey="predicted" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} name="المتوقع" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">توقعات الأسبوع</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {weeklyPrediction.map((day, i) => (
                      <div key={i} className={`p-3 rounded-lg bg-${getRiskColor(day.risk)}-500/10 border border-${getRiskColor(day.risk)}-500/30`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{day.day}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={`bg-${getRiskColor(day.risk)}-500/20 text-${getRiskColor(day.risk)}-400`}>
                              {day.risk === 'high' ? 'عالي' : day.risk === 'medium' ? 'متوسط' : 'منخفض'}
                            </Badge>
                            <span className="text-cyan-400 text-sm">{day.confidence}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-sm">متوقع: {day.predicted} طن</span>
                          <Progress value={day.confidence} className="w-20 h-1.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risks" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">الحاويات المعرضة للفيضان</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-72">
                <div className="space-y-3">
                  {binOverflowRisks.map(bin => (
                    <div key={bin.id} className={`p-4 rounded-lg bg-${getRiskColor(bin.risk)}-500/10 border border-${getRiskColor(bin.risk)}-500/30`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-white font-medium">{bin.id}</p>
                          <p className="text-slate-400 text-sm flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {bin.location}
                          </p>
                        </div>
                        <Badge className={`bg-${getRiskColor(bin.risk)}-500/20 text-${getRiskColor(bin.risk)}-400`}>
                          {bin.risk === 'high' ? 'خطر عالي' : bin.risk === 'medium' ? 'خطر متوسط' : 'منخفض'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-2 bg-slate-800/50 rounded">
                          <p className="text-white font-bold">{bin.currentFill}%</p>
                          <p className="text-slate-500 text-xs">الحالي</p>
                        </div>
                        <div className="p-2 bg-slate-800/50 rounded">
                          <p className={`font-bold text-${getRiskColor(bin.risk)}-400`}>{bin.predictedFill}%</p>
                          <p className="text-slate-500 text-xs">المتوقع</p>
                        </div>
                        <div className="p-2 bg-slate-800/50 rounded">
                          <p className="text-amber-400 font-bold">{bin.timeToOverflow}</p>
                          <p className="text-slate-500 text-xs">للفيضان</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">الأحداث وتأثيرها على النفايات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map((event, i) => (
                  <div key={i} className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {event.type === 'festival' ? '🎉' : event.type === 'sports' ? '⚽' : '📅'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{event.name}</p>
                          <p className="text-slate-400 text-sm">{event.date}</p>
                        </div>
                      </div>
                      <Badge className="bg-amber-500/20 text-amber-400">{event.impact}</Badge>
                    </div>
                  </div>
                ))}
                
                {/* Weather Impact */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ThermometerSun className="w-8 h-8 text-amber-400" />
                      <div>
                        <p className="text-white font-medium">تأثير الطقس</p>
                        <p className="text-slate-400 text-sm">{weatherImpact.temperature}°C - {weatherImpact.condition}</p>
                      </div>
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-400">{weatherImpact.impactOnWaste}</Badge>
                  </div>
                  <p className="text-slate-300 text-sm mt-2">{weatherImpact.recommendation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="mt-4">
          {resourceAllocation ? (
            <Card className="glass-card border-green-500/30 bg-green-500/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm">تخصيص الموارد المحسن</CardTitle>
                  <Badge className="bg-green-500/20 text-green-400">
                    كفاءة {resourceAllocation.efficiencyGain}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {resourceAllocation.dailyAllocation?.map((day, i) => (
                      <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{day.day}</span>
                          <Badge className={day.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                            {day.priority === 'high' ? 'أولوية عالية' : 'عادي'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          <div className="p-1.5 bg-slate-900/50 rounded">
                            <Truck className="w-3 h-3 text-cyan-400 mx-auto mb-1" />
                            <p className="text-white">{day.trucks}</p>
                          </div>
                          <div className="p-1.5 bg-slate-900/50 rounded">
                            <Users className="w-3 h-3 text-green-400 mx-auto mb-1" />
                            <p className="text-white">{day.drivers}</p>
                          </div>
                          <div className="p-1.5 bg-slate-900/50 rounded">
                            <Package className="w-3 h-3 text-purple-400 mx-auto mb-1" />
                            <p className="text-white">{day.workers}</p>
                          </div>
                          <div className="p-1.5 bg-slate-900/50 rounded">
                            <Clock className="w-3 h-3 text-amber-400 mx-auto mb-1" />
                            <p className="text-white">{day.shifts}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                {resourceAllocation.recommendations?.length > 0 && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-xs font-medium mb-2">التوصيات</p>
                    {resourceAllocation.recommendations.slice(0, 3).map((rec, i) => (
                      <p key={i} className="text-white text-xs flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                        {rec}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-12 text-center">
                <Truck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">اضغط على "تحسين الموارد" للحصول على خطة تخصيص</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* AI Analysis Results */}
      {analysisResult && (
        <Card className="glass-card border-purple-500/30 bg-purple-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              نتائج التحليل التنبؤي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">{analysisResult.weeklyForecast?.totalPredicted || 1376}</p>
                <p className="text-purple-400 text-xs">إجمالي متوقع (طن)</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">{analysisResult.weeklyForecast?.peakDay || 'الجمعة'}</p>
                <p className="text-amber-400 text-xs">يوم الذروة</p>
              </div>
              <div className="p-3 bg-cyan-500/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">{analysisResult.weeklyForecast?.confidence || 89}%</p>
                <p className="text-cyan-400 text-xs">الثقة</p>
              </div>
            </div>
            
            {analysisResult.overallRecommendations?.length > 0 && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 text-sm font-medium mb-2">التوصيات</p>
                <ul className="space-y-1">
                  {analysisResult.overallRecommendations.slice(0, 4).map((rec, i) => (
                    <li key={i} className="text-white text-sm flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}