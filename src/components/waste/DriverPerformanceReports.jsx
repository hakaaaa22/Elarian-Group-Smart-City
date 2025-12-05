import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  User, Gauge, AlertTriangle, Route, TrendingUp, TrendingDown, Award, Target,
  Clock, Fuel, Brain, RefreshCw, ChevronDown, ChevronUp, Star, Shield,
  Zap, ThumbsUp, ThumbsDown, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'sonner';

const driversData = [
  {
    id: 'DRV-001',
    name: 'محمد أحمد',
    truckId: 'TRK-001',
    plate: 'أ ب ج 1234',
    overallScore: 92,
    metrics: {
      speed: { score: 88, violations: 3, avgSpeed: 42 },
      braking: { score: 85, harshBrakes: 5, smoothBrakes: 95 },
      route: { score: 95, deviations: 2, adherence: 98 },
      fuel: { score: 90, efficiency: 8.2, savings: 12 },
      time: { score: 94, onTime: 96, avgDelay: 5 },
      safety: { score: 91, incidents: 0, nearMisses: 1 }
    },
    trends: [
      { month: 'يوليو', score: 85 },
      { month: 'أغسطس', score: 88 },
      { month: 'سبتمبر', score: 90 },
      { month: 'أكتوبر', score: 89 },
      { month: 'نوفمبر', score: 92 },
    ],
    strengths: ['الالتزام بالمسار', 'كفاءة الوقود', 'الالتزام بالمواعيد'],
    weaknesses: ['الكبح المفاجئ أحياناً', 'تجاوز السرعة في المناطق المفتوحة'],
    totalTrips: 245,
    totalKm: 12500,
    experience: '3 سنوات'
  },
  {
    id: 'DRV-002',
    name: 'خالد سعيد',
    truckId: 'TRK-002',
    plate: 'د هـ و 5678',
    overallScore: 78,
    metrics: {
      speed: { score: 72, violations: 8, avgSpeed: 48 },
      braking: { score: 75, harshBrakes: 12, smoothBrakes: 85 },
      route: { score: 80, deviations: 6, adherence: 92 },
      fuel: { score: 82, efficiency: 9.5, savings: 5 },
      time: { score: 85, onTime: 88, avgDelay: 12 },
      safety: { score: 74, incidents: 1, nearMisses: 4 }
    },
    trends: [
      { month: 'يوليو', score: 82 },
      { month: 'أغسطس', score: 80 },
      { month: 'سبتمبر', score: 78 },
      { month: 'أكتوبر', score: 76 },
      { month: 'نوفمبر', score: 78 },
    ],
    strengths: ['الالتزام بالمواعيد', 'التعامل مع العملاء'],
    weaknesses: ['تجاوز السرعة المتكرر', 'الكبح المفاجئ', 'الانحراف عن المسار'],
    totalTrips: 198,
    totalKm: 10200,
    experience: '2 سنة'
  },
  {
    id: 'DRV-003',
    name: 'عبدالله فهد',
    truckId: 'TRK-003',
    plate: 'ز ح ط 9012',
    overallScore: 95,
    metrics: {
      speed: { score: 96, violations: 1, avgSpeed: 38 },
      braking: { score: 94, harshBrakes: 2, smoothBrakes: 98 },
      route: { score: 97, deviations: 1, adherence: 99 },
      fuel: { score: 95, efficiency: 7.5, savings: 18 },
      time: { score: 93, onTime: 94, avgDelay: 8 },
      safety: { score: 98, incidents: 0, nearMisses: 0 }
    },
    trends: [
      { month: 'يوليو', score: 92 },
      { month: 'أغسطس', score: 93 },
      { month: 'سبتمبر', score: 94 },
      { month: 'أكتوبر', score: 94 },
      { month: 'نوفمبر', score: 95 },
    ],
    strengths: ['القيادة الآمنة', 'كفاءة الوقود الممتازة', 'الالتزام بالمسار', 'صفر حوادث'],
    weaknesses: ['التأخير الطفيف أحياناً'],
    totalTrips: 267,
    totalKm: 13800,
    experience: '5 سنوات'
  },
  {
    id: 'DRV-004',
    name: 'فيصل عمر',
    truckId: 'TRK-004',
    plate: 'ي ك ل 3456',
    overallScore: 85,
    metrics: {
      speed: { score: 82, violations: 5, avgSpeed: 44 },
      braking: { score: 88, harshBrakes: 4, smoothBrakes: 92 },
      route: { score: 86, deviations: 4, adherence: 95 },
      fuel: { score: 84, efficiency: 8.8, savings: 8 },
      time: { score: 90, onTime: 92, avgDelay: 7 },
      safety: { score: 85, incidents: 0, nearMisses: 2 }
    },
    trends: [
      { month: 'يوليو', score: 80 },
      { month: 'أغسطس', score: 82 },
      { month: 'سبتمبر', score: 83 },
      { month: 'أكتوبر', score: 84 },
      { month: 'نوفمبر', score: 85 },
    ],
    strengths: ['التحسن المستمر', 'الالتزام بالمواعيد', 'الكبح السلس'],
    weaknesses: ['تجاوز السرعة أحياناً', 'الانحراف عن المسار'],
    totalTrips: 210,
    totalKm: 11000,
    experience: '2.5 سنة'
  },
];

export default function DriverPerformanceReports() {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState({});
  const [expandedDriver, setExpandedDriver] = useState(null);

  const generateRecommendations = useMutation({
    mutationFn: async (driver) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في تقييم أداء سائقي شاحنات النفايات، قدم توصيات مفصلة لتحسين أداء السائق:

السائق: ${driver.name}
التقييم العام: ${driver.overallScore}/100

المقاييس التفصيلية:
- السرعة: ${driver.metrics.speed.score}/100 (${driver.metrics.speed.violations} مخالفات، متوسط ${driver.metrics.speed.avgSpeed} كم/س)
- الكبح: ${driver.metrics.braking.score}/100 (${driver.metrics.braking.harshBrakes} كبح مفاجئ)
- الالتزام بالمسار: ${driver.metrics.route.score}/100 (${driver.metrics.route.deviations} انحرافات)
- كفاءة الوقود: ${driver.metrics.fuel.score}/100 (${driver.metrics.fuel.efficiency} لتر/100كم)
- الالتزام بالوقت: ${driver.metrics.time.score}/100 (${driver.metrics.time.onTime}% في الموعد)
- السلامة: ${driver.metrics.safety.score}/100 (${driver.metrics.safety.incidents} حوادث)

نقاط القوة: ${driver.strengths.join(', ')}
نقاط الضعف: ${driver.weaknesses.join(', ')}

قدم:
1. تحليل شامل للأداء
2. توصيات محددة لتحسين كل نقطة ضعف
3. برنامج تدريبي مقترح
4. أهداف قابلة للقياس
5. حوافز مقترحة`,
        response_json_schema: {
          type: "object",
          properties: {
            overallAnalysis: { type: "string" },
            improvementAreas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  currentStatus: { type: "string" },
                  targetScore: { type: "number" },
                  recommendations: { type: "array", items: { type: "string" } },
                  timeframe: { type: "string" }
                }
              }
            },
            trainingProgram: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  module: { type: "string" },
                  duration: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            measurableGoals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  goal: { type: "string" },
                  metric: { type: "string" },
                  target: { type: "string" },
                  deadline: { type: "string" }
                }
              }
            },
            incentives: { type: "array", items: { type: "string" } },
            riskAssessment: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data, driver) => {
      setAiRecommendations(prev => ({ ...prev, [driver.id]: data }));
      toast.success(`تم تحليل أداء ${driver.name}`);
    }
  });

  const getScoreColor = (score) => {
    if (score >= 90) return 'green';
    if (score >= 75) return 'amber';
    return 'red';
  };

  const comparisonData = driversData.map(d => ({
    name: d.name.split(' ')[0],
    السرعة: d.metrics.speed.score,
    الكبح: d.metrics.braking.score,
    المسار: d.metrics.route.score,
    الوقود: d.metrics.fuel.score,
    الوقت: d.metrics.time.score,
    السلامة: d.metrics.safety.score,
  }));

  const radarData = selectedDriver ? [
    { metric: 'السرعة', value: selectedDriver.metrics.speed.score },
    { metric: 'الكبح', value: selectedDriver.metrics.braking.score },
    { metric: 'المسار', value: selectedDriver.metrics.route.score },
    { metric: 'الوقود', value: selectedDriver.metrics.fuel.score },
    { metric: 'الوقت', value: selectedDriver.metrics.time.score },
    { metric: 'السلامة', value: selectedDriver.metrics.safety.score },
  ] : [];

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          تقارير أداء السائقين
        </h3>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-4 gap-3">
        {driversData.sort((a, b) => b.overallScore - a.overallScore).map((driver, i) => (
          <Card key={driver.id} className={`${i === 0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700'} cursor-pointer hover:bg-slate-800`} onClick={() => setSelectedDriver(driver)}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                {i === 0 && <Award className="w-5 h-5 text-amber-400" />}
                <span className="text-white font-medium text-sm">{driver.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold text-${getScoreColor(driver.overallScore)}-400`}>{driver.overallScore}</span>
                <Badge className={`bg-${getScoreColor(driver.overallScore)}-500/20 text-${getScoreColor(driver.overallScore)}-400`}>
                  #{i + 1}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20">نظرة عامة</TabsTrigger>
          <TabsTrigger value="comparison" className="data-[state=active]:bg-purple-500/20">المقارنة</TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-green-500/20">التفاصيل</TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-amber-500/20">التوصيات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <ScrollArea className="h-[450px]">
            <div className="space-y-3">
              {driversData.map(driver => (
                <Card key={driver.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full bg-${getScoreColor(driver.overallScore)}-500/20 flex items-center justify-center`}>
                          <User className={`w-6 h-6 text-${getScoreColor(driver.overallScore)}-400`} />
                        </div>
                        <div>
                          <p className="text-white font-bold">{driver.name}</p>
                          <p className="text-slate-400 text-sm">{driver.plate} | {driver.experience}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className={`text-3xl font-bold text-${getScoreColor(driver.overallScore)}-400`}>{driver.overallScore}</p>
                        <p className="text-slate-500 text-xs">التقييم العام</p>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-6 gap-2 mb-3">
                      {[
                        { key: 'speed', label: 'السرعة', icon: Gauge },
                        { key: 'braking', label: 'الكبح', icon: AlertTriangle },
                        { key: 'route', label: 'المسار', icon: Route },
                        { key: 'fuel', label: 'الوقود', icon: Fuel },
                        { key: 'time', label: 'الوقت', icon: Clock },
                        { key: 'safety', label: 'السلامة', icon: Shield },
                      ].map(metric => (
                        <div key={metric.key} className="p-2 bg-slate-800/50 rounded text-center">
                          <metric.icon className={`w-4 h-4 mx-auto mb-1 text-${getScoreColor(driver.metrics[metric.key].score)}-400`} />
                          <p className={`text-sm font-bold text-${getScoreColor(driver.metrics[metric.key].score)}-400`}>
                            {driver.metrics[metric.key].score}
                          </p>
                          <p className="text-slate-500 text-[9px]">{metric.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-green-400" />
                        <span className="text-slate-400 text-xs">{driver.strengths.slice(0, 2).join('، ')}</span>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => setExpandedDriver(expandedDriver === driver.id ? null : driver.id)}>
                        {expandedDriver === driver.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>

                    {expandedDriver === driver.id && (
                      <div className="mt-3 pt-3 border-t border-slate-700/50 grid md:grid-cols-2 gap-3">
                        <div className="p-2 bg-green-500/10 rounded">
                          <p className="text-green-400 text-xs mb-1 flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> نقاط القوة</p>
                          <ul className="space-y-0.5">
                            {driver.strengths.map((s, i) => <li key={i} className="text-white text-xs">• {s}</li>)}
                          </ul>
                        </div>
                        <div className="p-2 bg-red-500/10 rounded">
                          <p className="text-red-400 text-xs mb-1 flex items-center gap-1"><ThumbsDown className="w-3 h-3" /> نقاط الضعف</p>
                          <ul className="space-y-0.5">
                            {driver.weaknesses.map((w, i) => <li key={i} className="text-white text-xs">• {w}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="comparison" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">مقارنة أداء السائقين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="السرعة" fill="#3b82f6" />
                    <Bar dataKey="الكبح" fill="#f59e0b" />
                    <Bar dataKey="المسار" fill="#22c55e" />
                    <Bar dataKey="السلامة" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          {selectedDriver ? (
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">تحليل الأداء - {selectedDriver.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                        <Radar name={selectedDriver.name} dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">اتجاه الأداء</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedDriver.trends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                        <YAxis domain={[70, 100]} stroke="#94a3b8" fontSize={11} />
                        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                        <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">اختر سائقاً من القائمة لعرض التفاصيل</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Driver Selection */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">اختر سائقاً للتحليل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {driversData.map(driver => (
                    <div 
                      key={driver.id} 
                      className={`p-3 rounded-lg cursor-pointer transition-all ${selectedDriver?.id === driver.id ? 'bg-cyan-500/20 border border-cyan-500/50' : 'bg-slate-800/50 hover:bg-slate-800'}`}
                      onClick={() => setSelectedDriver(driver)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-white">{driver.name}</span>
                        </div>
                        <Badge className={`bg-${getScoreColor(driver.overallScore)}-500/20 text-${getScoreColor(driver.overallScore)}-400`}>
                          {driver.overallScore}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedDriver && (
                  <Button 
                    className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                    onClick={() => generateRecommendations.mutate(selectedDriver)}
                    disabled={generateRecommendations.isPending}
                  >
                    {generateRecommendations.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
                    تحليل AI وتوصيات
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            {selectedDriver && aiRecommendations[selectedDriver.id] ? (
              <Card className="glass-card border-purple-500/30 bg-purple-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">توصيات AI - {selectedDriver.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-4">
                      {/* Overall Analysis */}
                      <div className="p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-400 text-xs mb-1">التحليل العام</p>
                        <p className="text-white text-sm">{aiRecommendations[selectedDriver.id].overallAnalysis}</p>
                      </div>

                      {/* Improvement Areas */}
                      {aiRecommendations[selectedDriver.id].improvementAreas?.map((area, i) => (
                        <div key={i} className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                          <p className="text-amber-400 font-medium text-sm mb-2">{area.area}</p>
                          <p className="text-slate-400 text-xs mb-2">{area.currentStatus}</p>
                          <ul className="space-y-1">
                            {area.recommendations?.map((rec, j) => (
                              <li key={j} className="text-white text-xs flex items-start gap-1">
                                <Target className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}

                      {/* Training Program */}
                      {aiRecommendations[selectedDriver.id].trainingProgram?.length > 0 && (
                        <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                          <p className="text-cyan-400 font-medium text-sm mb-2">برنامج التدريب المقترح</p>
                          {aiRecommendations[selectedDriver.id].trainingProgram.map((module, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-slate-800/30 rounded mb-1">
                              <span className="text-white text-xs">{module.module}</span>
                              <Badge className={module.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-slate-600'}>{module.duration}</Badge>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Incentives */}
                      {aiRecommendations[selectedDriver.id].incentives?.length > 0 && (
                        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                          <p className="text-green-400 font-medium text-sm mb-2">الحوافز المقترحة</p>
                          <ul className="space-y-1">
                            {aiRecommendations[selectedDriver.id].incentives.map((inc, i) => (
                              <li key={i} className="text-white text-xs flex items-start gap-1">
                                <Star className="w-3 h-3 text-amber-400 mt-0.5" />
                                {inc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">اختر سائقاً واضغط "تحليل AI" لعرض التوصيات</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}