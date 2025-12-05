import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle, Zap, Target, DollarSign,
  RefreshCw, Fuel, Car, Truck, BarChart3, LineChart, PieChart, Activity,
  CheckCircle, Clock, Lightbulb, ArrowUp, ArrowDown, Minus, Share2, MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart as ReLineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// بيانات تاريخية للتحليل
const historicalData = {
  fuel: [
    { month: 'يناير', actual: 4500, predicted: 4300, anomaly: false },
    { month: 'فبراير', actual: 4200, predicted: 4100, anomaly: false },
    { month: 'مارس', actual: 5800, predicted: 4400, anomaly: true },
    { month: 'أبريل', actual: 4100, predicted: 4200, anomaly: false },
    { month: 'مايو', actual: 4600, predicted: 4500, anomaly: false },
    { month: 'يونيو', actual: 4800, predicted: 4700, anomaly: false },
  ],
  traffic: [
    { hour: '06:00', density: 25, predicted: 28 },
    { hour: '08:00', density: 85, predicted: 82 },
    { hour: '10:00', density: 65, predicted: 60 },
    { hour: '12:00', density: 55, predicted: 58 },
    { hour: '14:00', density: 70, predicted: 68 },
    { hour: '16:00', density: 90, predicted: 88 },
    { hour: '18:00', density: 95, predicted: 92 },
    { hour: '20:00', density: 45, predicted: 48 },
  ],
  fleet: [
    { week: 'الأسبوع 1', efficiency: 85, maintenance: 2, incidents: 1 },
    { week: 'الأسبوع 2', efficiency: 88, maintenance: 1, incidents: 0 },
    { week: 'الأسبوع 3', efficiency: 82, maintenance: 3, incidents: 2 },
    { week: 'الأسبوع 4', efficiency: 90, maintenance: 1, incidents: 0 },
  ],
};

export default function DeepDataAnalytics({ module = 'all' }) {
  const [activeTab, setActiveTab] = useState('anomalies');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  // تحليل الأنماط الشاذة
  const analyzeAnomalies = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في تحليل البيانات والكشف عن الأنماط الشاذة، قم بتحليل البيانات التالية:

بيانات استهلاك الوقود:
${historicalData.fuel.map(d => `${d.month}: فعلي ${d.actual} لتر، متوقع ${d.predicted} لتر`).join('\n')}

بيانات حركة المرور:
${historicalData.traffic.map(d => `${d.hour}: كثافة ${d.density}%، متوقع ${d.predicted}%`).join('\n')}

بيانات كفاءة الأسطول:
${historicalData.fleet.map(d => `${d.week}: كفاءة ${d.efficiency}%، صيانة ${d.maintenance}، حوادث ${d.incidents}`).join('\n')}

قدم تحليلاً يشمل:
1. الأنماط الشاذة المكتشفة مع درجة الخطورة
2. الأسباب المحتملة لكل شذوذ
3. التأثير المالي التقديري
4. توصيات للمعالجة`,
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
                  cause: { type: "string" },
                  impact: { type: "string" },
                  recommendation: { type: "string" }
                } 
              } 
            },
            totalAnomalies: { type: "number" },
            riskLevel: { type: "string" },
            estimatedLoss: { type: "number" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAnalysisResults(prev => ({ ...prev, anomalies: data }));
      toast.success('تم تحليل الأنماط الشاذة');
    }
  });

  // التنبؤ بالاتجاهات
  const predictTrends = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في التنبؤ وتحليل الاتجاهات، بناءً على البيانات التاريخية:

بيانات الوقود والأسطول وحركة المرور المتاحة.

قدم تنبؤات للأشهر الثلاثة القادمة تشمل:
1. استهلاك الوقود المتوقع
2. أنماط حركة المرور
3. احتياجات الصيانة
4. فرص التوفير
5. نسبة الثقة في كل تنبؤ`,
        response_json_schema: {
          type: "object",
          properties: {
            predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  metric: { type: "string" },
                  currentValue: { type: "string" },
                  predictedValue: { type: "string" },
                  change: { type: "number" },
                  trend: { type: "string" },
                  confidence: { type: "number" },
                  factors: { type: "array", items: { type: "string" } }
                }
              }
            },
            savingsOpportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  potentialSavings: { type: "number" },
                  implementation: { type: "string" }
                }
              }
            }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAnalysisResults(prev => ({ ...prev, predictions: data }));
      toast.success('تم إنشاء التنبؤات');
    }
  });

  // التوصيات الاستباقية
  const generateRecommendations = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كمستشار استراتيجي في إدارة الأساطيل والنفايات، قدم توصيات استباقية لتحسين الكفاءة وتقليل التكاليف.

البيانات المتاحة:
- متوسط استهلاك الوقود: 4500 لتر/شهر
- كفاءة الأسطول: 86%
- تكاليف الصيانة: 25000 ر.س/شهر
- معدل الحوادث: 1.5/شهر

قدم توصيات مفصلة تشمل:
1. إجراءات فورية (خلال أسبوع)
2. إجراءات قصيرة المدى (شهر)
3. إجراءات استراتيجية (3 أشهر)
4. العائد المتوقع على الاستثمار
5. أولوية التنفيذ`,
        response_json_schema: {
          type: "object",
          properties: {
            immediate: { type: "array", items: { type: "object", properties: { action: { type: "string" }, impact: { type: "string" }, savings: { type: "number" } } } },
            shortTerm: { type: "array", items: { type: "object", properties: { action: { type: "string" }, timeline: { type: "string" }, roi: { type: "number" } } } },
            strategic: { type: "array", items: { type: "object", properties: { action: { type: "string" }, investment: { type: "number" }, expectedReturn: { type: "number" } } } },
            totalPotentialSavings: { type: "number" },
            implementationPriority: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setRecommendations(data);
      toast.success('تم إنشاء التوصيات الاستباقية');
    }
  });

  const runFullAnalysis = () => {
    analyzeAnomalies.mutate();
    predictTrends.mutate();
    generateRecommendations.mutate();
  };

  const isLoading = analyzeAnomalies.isPending || predictTrends.isPending || generateRecommendations.isPending;

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          تحليل البيانات العميق بالذكاء الاصطناعي
        </h3>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={runFullAnalysis} disabled={isLoading}>
          {isLoading ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Zap className="w-4 h-4 ml-2" />}
          تحليل شامل
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{analysisResults?.anomalies?.totalAnomalies || 3}</p>
            <p className="text-red-400 text-xs">أنماط شاذة</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">+12%</p>
            <p className="text-green-400 text-xs">تحسن متوقع</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <DollarSign className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{recommendations?.totalPotentialSavings?.toLocaleString() || '45,000'}</p>
            <p className="text-amber-400 text-xs">توفير محتمل (ر.س)</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <Target className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">92%</p>
            <p className="text-purple-400 text-xs">دقة التنبؤ</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="anomalies" className="data-[state=active]:bg-red-500/20">
            <AlertTriangle className="w-4 h-4 ml-1" />
            الأنماط الشاذة
          </TabsTrigger>
          <TabsTrigger value="predictions" className="data-[state=active]:bg-cyan-500/20">
            <TrendingUp className="w-4 h-4 ml-1" />
            التنبؤات
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-green-500/20">
            <Lightbulb className="w-4 h-4 ml-1" />
            التوصيات
          </TabsTrigger>
          <TabsTrigger value="comparison" className="data-[state=active]:bg-purple-500/20">
            <BarChart3 className="w-4 h-4 ml-1" />
            المقارنة
          </TabsTrigger>
        </TabsList>

        {/* Anomalies Tab */}
        <TabsContent value="anomalies" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">استهلاك الوقود (الفعلي vs المتوقع)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalData.fuel}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="predicted" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} name="متوقع" />
                      <Area type="monotone" dataKey="actual" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="فعلي" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-red-500/30 bg-red-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">الشذوذات المكتشفة</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {(analysisResults?.anomalies?.anomalies || [
                      { type: 'استهلاك وقود', description: 'ارتفاع غير طبيعي في مارس', severity: 'high', cause: 'تسريب محتمل أو سرقة' },
                      { type: 'كفاءة السائق', description: 'انخفاض مفاجئ في الأسبوع 3', severity: 'medium', cause: 'إرهاق أو مشاكل في المركبة' },
                      { type: 'مسار غير مبرر', description: 'انحراف 15 كم عن المسار', severity: 'low', cause: 'تجنب ازدحام أو استخدام شخصي' },
                    ]).map((anomaly, i) => (
                      <div key={i} className={`p-3 rounded-lg border ${anomaly.severity === 'high' ? 'bg-red-500/10 border-red-500/30' : anomaly.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-medium text-sm">{anomaly.type}</span>
                          <Badge className={anomaly.severity === 'high' ? 'bg-red-500/20 text-red-400' : anomaly.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-600 text-slate-300'}>
                            {anomaly.severity === 'high' ? 'عالي' : anomaly.severity === 'medium' ? 'متوسط' : 'منخفض'}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-xs">{anomaly.description}</p>
                        <p className="text-cyan-400 text-xs mt-1">السبب: {anomaly.cause}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">أنماط حركة المرور المتوقعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReLineChart data={historicalData.traffic}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="density" stroke="#22c55e" strokeWidth={2} name="فعلي" />
                      <Line type="monotone" dataKey="predicted" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" name="متوقع" />
                    </ReLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">تنبؤات الأشهر القادمة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(analysisResults?.predictions?.predictions || [
                    { metric: 'استهلاك الوقود', currentValue: '4,500 لتر', predictedValue: '4,200 لتر', change: -7, trend: 'down', confidence: 89 },
                    { metric: 'تكاليف الصيانة', currentValue: '25,000 ر.س', predictedValue: '28,000 ر.س', change: 12, trend: 'up', confidence: 78 },
                    { metric: 'كفاءة التشغيل', currentValue: '86%', predictedValue: '91%', change: 6, trend: 'up', confidence: 85 },
                  ]).map((pred, i) => (
                    <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{pred.metric}</span>
                        <div className="flex items-center gap-1">
                          {pred.trend === 'up' ? (
                            <ArrowUp className={`w-4 h-4 ${pred.change > 0 && pred.metric.includes('كفاءة') ? 'text-green-400' : 'text-red-400'}`} />
                          ) : (
                            <ArrowDown className={`w-4 h-4 ${pred.change < 0 && !pred.metric.includes('كفاءة') ? 'text-green-400' : 'text-red-400'}`} />
                          )}
                          <span className={pred.change > 0 ? 'text-amber-400' : 'text-green-400'}>{pred.change > 0 ? '+' : ''}{pred.change}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">الحالي: {pred.currentValue}</span>
                        <span className="text-cyan-400">المتوقع: {pred.predictedValue}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={pred.confidence} className="h-1.5 flex-1" />
                        <span className="text-slate-500 text-xs">{pred.confidence}% ثقة</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Immediate Actions */}
            <Card className="glass-card border-red-500/30 bg-red-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-red-400" />
                  إجراءات فورية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(recommendations?.immediate || [
                    { action: 'فحص مركبة #3 فوراً', impact: 'منع عطل محتمل', savings: 5000 },
                    { action: 'مراجعة استهلاك الوقود', impact: 'كشف تسريب', savings: 3000 },
                  ]).map((rec, i) => (
                    <div key={i} className="p-2 bg-slate-800/50 rounded">
                      <p className="text-white text-sm">{rec.action}</p>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-slate-400">{rec.impact}</span>
                        <span className="text-green-400">توفير: {rec.savings?.toLocaleString()} ر.س</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Short Term */}
            <Card className="glass-card border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  قصيرة المدى (شهر)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(recommendations?.shortTerm || [
                    { action: 'تدريب السائقين على القيادة الاقتصادية', timeline: '2 أسابيع', roi: 150 },
                    { action: 'تحديث نظام تتبع المركبات', timeline: '3 أسابيع', roi: 200 },
                  ]).map((rec, i) => (
                    <div key={i} className="p-2 bg-slate-800/50 rounded">
                      <p className="text-white text-sm">{rec.action}</p>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-slate-400">{rec.timeline}</span>
                        <span className="text-amber-400">ROI: {rec.roi}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strategic */}
            <Card className="glass-card border-green-500/30 bg-green-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-400" />
                  استراتيجية (3 أشهر)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(recommendations?.strategic || [
                    { action: 'تجديد أسطول المركبات القديمة', investment: 500000, expectedReturn: 750000 },
                    { action: 'نظام صيانة تنبؤية بالـ AI', investment: 100000, expectedReturn: 180000 },
                  ]).map((rec, i) => (
                    <div key={i} className="p-2 bg-slate-800/50 rounded">
                      <p className="text-white text-sm">{rec.action}</p>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-slate-400">استثمار: {rec.investment?.toLocaleString()} ر.س</span>
                        <span className="text-green-400">عائد: {rec.expectedReturn?.toLocaleString()} ر.س</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">مقارنة الأداء بين الفترات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historicalData.fleet}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="efficiency" fill="#22c55e" name="الكفاءة %" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="maintenance" fill="#f59e0b" name="الصيانة" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="incidents" fill="#ef4444" name="الحوادث" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}