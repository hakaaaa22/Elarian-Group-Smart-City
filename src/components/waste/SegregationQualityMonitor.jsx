import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  AlertTriangle, TrendingUp, TrendingDown, Target, Brain, RefreshCw,
  CheckCircle, XCircle, BookOpen, Users, Award, BarChart3, PieChart as PieChartIcon,
  Lightbulb, AlertOctagon, ArrowUp, ArrowDown, Minus, Camera, Recycle, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7', '#06b6d4'];

// بيانات اتجاهات التلوث
const contaminationTrends = [
  { month: 'يناير', recyclable: 22, organic: 15, general: 8, hazardous: 5 },
  { month: 'فبراير', recyclable: 20, organic: 14, general: 7, hazardous: 4 },
  { month: 'مارس', recyclable: 18, organic: 12, general: 8, hazardous: 3 },
  { month: 'أبريل', recyclable: 16, organic: 11, general: 6, hazardous: 4 },
  { month: 'مايو', recyclable: 15, organic: 10, general: 5, hazardous: 3 },
  { month: 'يونيو', recyclable: 14, organic: 9, general: 5, hazardous: 2 },
];

// مصادر التلوث
const contaminationSources = [
  { source: 'بلاستيك في العضوي', count: 245, percentage: 32, trend: 'down', change: -5 },
  { source: 'طعام في القابل للتدوير', count: 189, percentage: 25, trend: 'down', change: -8 },
  { source: 'زجاج في البلاستيك', count: 134, percentage: 18, trend: 'up', change: +3 },
  { source: 'معادن في الورق', count: 98, percentage: 13, trend: 'stable', change: 0 },
  { source: 'خطرة في العام', count: 92, percentage: 12, trend: 'down', change: -2 },
];

// الأخطاء المتكررة مع صور
const commonMistakes = [
  { id: 1, mistake: 'أكياس بلاستيكية في حاوية العضوي', frequency: 156, severity: 'high', category: 'organic', training: 'تدريب فرز المواد العضوية', imageAnalysis: true, confidence: 94, binId: 'BIN-012' },
  { id: 2, mistake: 'علب طعام غير نظيفة في التدوير', frequency: 134, severity: 'high', category: 'recyclable', training: 'تنظيف المواد قبل التدوير', imageAnalysis: true, confidence: 89, binId: 'BIN-005' },
  { id: 3, mistake: 'زجاج مكسور في حاوية البلاستيك', frequency: 89, severity: 'medium', category: 'recyclable', training: 'فصل الزجاج عن البلاستيك', imageAnalysis: true, confidence: 91, binId: 'BIN-003' },
  { id: 4, mistake: 'بطاريات في النفايات العامة', frequency: 67, severity: 'critical', category: 'hazardous', training: 'التخلص من النفايات الخطرة', imageAnalysis: true, confidence: 97, binId: 'BIN-008' },
  { id: 5, mistake: 'ورق مبلل في حاوية الورق', frequency: 54, severity: 'medium', category: 'recyclable', training: 'حالة المواد الورقية', imageAnalysis: false, confidence: 0, binId: '' },
  { id: 6, mistake: 'مواد طبية في العام', frequency: 45, severity: 'critical', category: 'hazardous', training: 'التخلص من النفايات الطبية', imageAnalysis: true, confidence: 95, binId: 'BIN-015' },
];

// ربط جودة الفرز بمعدلات التدوير
const recyclingCorrelation = [
  { month: 'يناير', segregationQuality: 78, recyclingRate: 45 },
  { month: 'فبراير', segregationQuality: 80, recyclingRate: 48 },
  { month: 'مارس', segregationQuality: 82, recyclingRate: 52 },
  { month: 'أبريل', segregationQuality: 84, recyclingRate: 55 },
  { month: 'مايو', segregationQuality: 85, recyclingRate: 58 },
  { month: 'يونيو', segregationQuality: 86, recyclingRate: 62 },
];

// توصيات التدريب
const trainingRecommendations = [
  { id: 1, title: 'تدريب الفرز الأساسي', target: 'جميع الوكلاء', duration: '2 ساعة', priority: 'high', completion: 65, impact: '+15% دقة' },
  { id: 2, title: 'التعامل مع النفايات الخطرة', target: 'فريق الجمع', duration: '3 ساعات', priority: 'critical', completion: 45, impact: '+25% سلامة' },
  { id: 3, title: 'معايير تنظيف المواد', target: 'المواطنين', duration: '30 دقيقة', priority: 'medium', completion: 30, impact: '+20% جودة' },
  { id: 4, title: 'تحديث إرشادات الفرز', target: 'جميع الوكلاء', duration: '1 ساعة', priority: 'high', completion: 80, impact: '+10% كفاءة' },
];

// بيانات الفئات المتأثرة
const affectedCategories = [
  { name: 'قابل للتدوير', contamination: 18, target: 5, color: '#3b82f6' },
  { name: 'عضوي', contamination: 12, target: 8, color: '#22c55e' },
  { name: 'عام', contamination: 8, target: 15, color: '#64748b' },
  { name: 'خطرة', contamination: 5, target: 2, color: '#ef4444' },
];

export default function SegregationQualityMonitor() {
  const [activeTab, setActiveTab] = useState('overview');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [imageAnalysisResult, setImageAnalysisResult] = useState(null);

  const analyzeQuality = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في إدارة جودة فرز النفايات، قم بتحليل البيانات التالية وقدم تقريراً شاملاً:

اتجاهات التلوث (آخر 6 أشهر):
${contaminationTrends.map(t => `${t.month}: تدوير ${t.recyclable}%, عضوي ${t.organic}%, عام ${t.general}%`).join('\n')}

مصادر التلوث الرئيسية:
${contaminationSources.map(s => `${s.source}: ${s.count} حالة (${s.percentage}%)`).join('\n')}

الأخطاء المتكررة:
${commonMistakes.map(m => `${m.mistake}: ${m.frequency} مرة - خطورة ${m.severity}`).join('\n')}

قدم:
1. تقييم شامل لجودة الفرز الحالية
2. تحليل الاتجاهات ومعدل التحسن
3. توصيات محددة لتقليل التلوث
4. خطة تدريبية مقترحة
5. التوقعات للأشهر القادمة`,
        response_json_schema: {
          type: "object",
          properties: {
            overallScore: { type: "number" },
            improvementRate: { type: "number" },
            criticalAreas: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "object", properties: { action: { type: "string" }, priority: { type: "string" }, expectedImpact: { type: "string" } } } },
            trainingPlan: { type: "array", items: { type: "object", properties: { topic: { type: "string" }, audience: { type: "string" }, urgency: { type: "string" } } } },
            forecast: { type: "object", properties: { nextMonth: { type: "number" }, threeMonths: { type: "number" }, sixMonths: { type: "number" } } },
            rootCauses: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAiAnalysis(data);
      toast.success('تم إنشاء تقرير جودة الفرز');
    }
  });

  // تحليل صور الحاويات الذكية
  const analyzeBinImage = useMutation({
    mutationFn: async (mistake) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في تحليل صور النفايات بالذكاء الاصطناعي، قم بتحليل الخطأ التالي المكتشف من كاميرا الحاوية الذكية:

الخطأ: ${mistake.mistake}
الحاوية: ${mistake.binId}
الفئة: ${mistake.category}
نسبة الثقة: ${mistake.confidence}%

قدم:
1. تحليل مفصل لنوع التلوث
2. الأسباب المحتملة
3. توصيات تدريبية مخصصة
4. إجراءات تصحيحية فورية
5. تأثير على معدل إعادة التدوير`,
        response_json_schema: {
          type: "object",
          properties: {
            contaminationType: { type: "string" },
            detailedAnalysis: { type: "string" },
            rootCauses: { type: "array", items: { type: "string" } },
            customTraining: { type: "object", properties: { title: { type: "string" }, content: { type: "array", items: { type: "string" } }, duration: { type: "string" }, targetAudience: { type: "string" } } },
            immediateActions: { type: "array", items: { type: "string" } },
            recyclingImpact: { type: "object", properties: { currentRate: { type: "number" }, potentialLoss: { type: "number" }, recommendation: { type: "string" } } }
          }
        }
      });
    },
    onSuccess: (data, mistake) => {
      setImageAnalysisResult({ ...data, mistake });
      toast.success('تم تحليل صورة الحاوية');
    }
  });

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-red-400" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-green-400" />;
      default: return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'amber';
      default: return 'blue';
    }
  };

  const overallScore = 100 - Math.round(affectedCategories.reduce((s, c) => s + c.contamination, 0) / affectedCategories.length);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-green-400" />
          مراقبة جودة الفرز
        </h3>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => analyzeQuality.mutate()} disabled={analyzeQuality.isPending}>
          {analyzeQuality.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
          تحليل AI شامل
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{overallScore}%</div>
            <p className="text-slate-400 text-sm">جودة الفرز الإجمالية</p>
            <Badge className="mt-2 bg-green-500/20 text-green-400">
              <TrendingUp className="w-3 h-3 ml-1" />+5% هذا الشهر
            </Badge>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-amber-400">14%</div>
            <p className="text-slate-400 text-sm">متوسط التلوث</p>
            <Badge className="mt-2 bg-green-500/20 text-green-400">
              <TrendingDown className="w-3 h-3 ml-1" />-3% من الشهر الماضي
            </Badge>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-cyan-400">768</div>
            <p className="text-slate-400 text-sm">حالات التلوث</p>
            <Badge className="mt-2 bg-green-500/20 text-green-400">-12% أسبوعياً</Badge>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-400">55%</div>
            <p className="text-slate-400 text-sm">إتمام التدريب</p>
            <Badge className="mt-2 bg-amber-500/20 text-amber-400">الهدف: 90%</Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-green-500/20">نظرة عامة</TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-cyan-500/20">الاتجاهات</TabsTrigger>
          <TabsTrigger value="sources" className="data-[state=active]:bg-amber-500/20">مصادر التلوث</TabsTrigger>
          <TabsTrigger value="mistakes" className="data-[state=active]:bg-red-500/20">الأخطاء المتكررة</TabsTrigger>
          <TabsTrigger value="training" className="data-[state=active]:bg-purple-500/20">التوصيات التدريبية</TabsTrigger>
          <TabsTrigger value="recycling" className="data-[state=active]:bg-green-500/20">ربط التدوير</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Contamination by Category */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">التلوث حسب الفئة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={affectedCategories} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" stroke="#94a3b8" fontSize={11} domain={[0, 25]} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Bar dataKey="contamination" fill="#ef4444" name="التلوث الحالي %" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="target" fill="#22c55e" name="الهدف %" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">توزيع حالات التلوث</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={contaminationSources}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="percentage"
                        label={({ source, percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {contaminationSources.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {contaminationSources.slice(0, 4).map((source, i) => (
                    <Badge key={i} style={{ backgroundColor: `${COLORS[i]}20`, color: COLORS[i] }} className="text-xs">
                      {source.source.split(' ')[0]}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Analysis Result */}
          {aiAnalysis && (
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  تحليل الذكاء الاصطناعي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-purple-400">{aiAnalysis.overallScore}%</p>
                    <p className="text-slate-400 text-xs">التقييم الإجمالي</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-400">+{aiAnalysis.improvementRate}%</p>
                    <p className="text-slate-400 text-xs">معدل التحسن</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-cyan-400">{aiAnalysis.forecast?.threeMonths}%</p>
                    <p className="text-slate-400 text-xs">التوقع (3 أشهر)</p>
                  </div>
                </div>

                {aiAnalysis.recommendations?.length > 0 && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 font-medium mb-2">التوصيات</p>
                    <div className="space-y-2">
                      {aiAnalysis.recommendations.slice(0, 4).map((rec, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded p-2">
                          <span className="text-white text-sm">{rec.action}</span>
                          <Badge className={rec.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-slate-600'}>{rec.expectedImpact}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">اتجاهات التلوث بمرور الوقت</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={contaminationTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Legend />
                    <Area type="monotone" dataKey="recyclable" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="قابل للتدوير" />
                    <Area type="monotone" dataKey="organic" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="عضوي" />
                    <Area type="monotone" dataKey="general" stroke="#64748b" fill="#64748b" fillOpacity={0.3} name="عام" />
                    <Area type="monotone" dataKey="hazardous" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="خطرة" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">مصادر التلوث الرئيسية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contaminationSources.map((source, i) => (
                  <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(source.trend)}
                        <span className="text-white font-medium">{source.source}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-slate-700">{source.count} حالة</Badge>
                        <span className={`text-sm font-bold ${source.change > 0 ? 'text-red-400' : source.change < 0 ? 'text-green-400' : 'text-slate-400'}`}>
                          {source.change > 0 ? '+' : ''}{source.change}%
                        </span>
                      </div>
                    </div>
                    <Progress value={source.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mistakes" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-400" />
                الأخطاء المتكررة في الفرز
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {commonMistakes.map(mistake => (
                    <div key={mistake.id} className={`p-4 rounded-lg bg-${getSeverityColor(mistake.severity)}-500/10 border border-${getSeverityColor(mistake.severity)}-500/30`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <XCircle className={`w-5 h-5 text-${getSeverityColor(mistake.severity)}-400`} />
                          <p className="text-white font-medium">{mistake.mistake}</p>
                        </div>
                        <Badge className={`bg-${getSeverityColor(mistake.severity)}-500/20 text-${getSeverityColor(mistake.severity)}-400`}>
                          {mistake.severity === 'critical' ? 'حرج' : mistake.severity === 'high' ? 'عالي' : 'متوسط'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-400">التكرار: <span className="text-white">{mistake.frequency}</span></span>
                          <Badge className="bg-slate-700 text-slate-300">{mistake.category}</Badge>
                          {mistake.imageAnalysis && (
                            <Badge className="bg-purple-500/20 text-purple-400">
                              <Camera className="w-3 h-3 ml-1" />
                              {mistake.confidence}%
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {mistake.imageAnalysis && (
                            <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-400 text-xs" onClick={() => analyzeBinImage.mutate(mistake)} disabled={analyzeBinImage.isPending}>
                              <Eye className="w-3 h-3 ml-1" />
                              تحليل
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-400 text-xs">
                            <BookOpen className="w-3 h-3 ml-1" />
                            {mistake.training}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                التوصيات التدريبية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trainingRecommendations.map(training => (
                  <div key={training.id} className={`p-4 rounded-lg bg-${training.priority === 'critical' ? 'red' : training.priority === 'high' ? 'amber' : 'slate'}-500/10 border border-${training.priority === 'critical' ? 'red' : training.priority === 'high' ? 'amber' : 'slate'}-500/30`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-bold">{training.title}</p>
                        <p className="text-slate-400 text-sm">{training.target} • {training.duration}</p>
                      </div>
                      <Badge className={`bg-${training.priority === 'critical' ? 'red' : training.priority === 'high' ? 'amber' : 'slate'}-500/20 text-${training.priority === 'critical' ? 'red' : training.priority === 'high' ? 'amber' : 'slate'}-400`}>
                        {training.priority === 'critical' ? 'عاجل' : training.priority === 'high' ? 'مهم' : 'عادي'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 ml-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-400">الإتمام</span>
                          <span className="text-white">{training.completion}%</span>
                        </div>
                        <Progress value={training.completion} className="h-2" />
                      </div>
                      <Badge className="bg-green-500/20 text-green-400">{training.impact}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recycling" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Correlation Chart */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Recycle className="w-4 h-4 text-green-400" />
                  العلاقة بين جودة الفرز ومعدل التدوير
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={recyclingCorrelation}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Legend />
                      <Line type="monotone" dataKey="segregationQuality" stroke="#22d3ee" strokeWidth={2} name="جودة الفرز %" />
                      <Line type="monotone" dataKey="recyclingRate" stroke="#22c55e" strokeWidth={2} name="معدل التدوير %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recycling Impact Summary */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">تأثير الفرز على التدوير</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                    <p className="text-4xl font-bold text-green-400">+17%</p>
                    <p className="text-slate-400 text-sm">تحسن معدل التدوير (6 أشهر)</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-cyan-400">62%</p>
                      <p className="text-slate-400 text-xs">معدل التدوير الحالي</p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-400">75%</p>
                      <p className="text-slate-400 text-xs">الهدف السنوي</p>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-amber-400 font-medium mb-1">ملاحظة</p>
                    <p className="text-white text-sm">كل 1% تحسن في جودة الفرز يؤدي إلى ~2% زيادة في معدل التدوير</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}