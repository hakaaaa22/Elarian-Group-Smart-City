import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  TrendingUp, TrendingDown, Brain, Target, Activity, AlertTriangle,
  Loader2, RefreshCw, Settings, Play, Pause, CheckCircle, XCircle,
  Clock, Sparkles, BarChart3, LineChart as LineChartIcon, Zap,
  Sliders, GitBranch, Eye, ArrowRight, History, Award, Lightbulb
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, ComposedChart,
  ReferenceLine, Legend
} from 'recharts';
import { toast } from 'sonner';

// Historical prediction data for accuracy tracking
const historicalPredictions = [
  { id: 'pred_1', date: '2024-11-01', metric: 'accuracy', predicted: 94.5, actual: 93.8, variance: 0.7 },
  { id: 'pred_2', date: '2024-11-08', metric: 'accuracy', predicted: 93.2, actual: 92.5, variance: 0.7 },
  { id: 'pred_3', date: '2024-11-15', metric: 'latency', predicted: 45, actual: 48, variance: 6.7 },
  { id: 'pred_4', date: '2024-11-22', metric: 'anomalies', predicted: 12, actual: 15, variance: 25 },
  { id: 'pred_5', date: '2024-11-29', metric: 'accuracy', predicted: 95.1, actual: 94.9, variance: 0.2 },
];

const trendData = [
  { date: 'الأسبوع 1', accuracy: 94.2, latency: 45, anomalies: 8, predicted_accuracy: null, predicted_latency: null },
  { date: 'الأسبوع 2', accuracy: 93.8, latency: 48, anomalies: 12, predicted_accuracy: null, predicted_latency: null },
  { date: 'الأسبوع 3', accuracy: 92.5, latency: 52, anomalies: 18, predicted_accuracy: null, predicted_latency: null },
  { date: 'الأسبوع 4', accuracy: 91.1, latency: 58, anomalies: 25, predicted_accuracy: null, predicted_latency: null },
  { date: 'الأسبوع 5', accuracy: 93.5, latency: 46, anomalies: 15, predicted_accuracy: 93.5, predicted_latency: 46 },
  { date: 'الأسبوع 6', accuracy: 95.2, latency: 42, anomalies: 10, predicted_accuracy: 94.8, predicted_latency: 44 },
  { date: 'الأسبوع 7', accuracy: null, latency: null, anomalies: null, predicted_accuracy: 95.8, predicted_latency: 40 },
  { date: 'الأسبوع 8', accuracy: null, latency: null, anomalies: null, predicted_accuracy: 96.2, predicted_latency: 38 },
];

export default function AIPredictiveAnalytics() {
  const [predictions, setPredictions] = useState(null);
  const [activeTab, setActiveTab] = useState('predictions');
  const [selectedMetric, setSelectedMetric] = useState('accuracy');
  const [predictionHorizon, setPredictionHorizon] = useState([7]);
  const [confidenceLevel, setConfidenceLevel] = useState([85]);
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [whatIfScenario, setWhatIfScenario] = useState({
    dataQuality: 90,
    modelUpdates: 50,
    resourceAllocation: 70,
    trainingData: 80
  });
  const [scenarioResults, setScenarioResults] = useState(null);
  const [feedbackHistory, setFeedbackHistory] = useState(historicalPredictions);

  const generatePredictionsMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بإنشاء تحليل تنبؤي متقدم لنماذج AI Vision:

المعلمات:
- أفق التنبؤ: ${predictionHorizon[0]} أيام
- مستوى الثقة: ${confidenceLevel[0]}%
- المقياس المختار: ${selectedMetric}

قدم:
1. التنبؤات الأساسية:
   - تنبؤات الدقة للأيام القادمة
   - تنبؤات زمن الاستجابة
   - تنبؤات الشذوذات المتوقعة

2. تحليل الاتجاهات:
   - الاتجاه العام (صاعد/هابط/مستقر)
   - نقاط التحول المتوقعة
   - العوامل المؤثرة

3. نطاقات الثقة:
   - الحد الأعلى والأدنى للتنبؤات
   - احتمالية تحقق كل سيناريو

4. تحذيرات مبكرة:
   - مخاطر محتملة
   - توصيات استباقية`,
        response_json_schema: {
          type: "object",
          properties: {
            predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  accuracy: { type: "object", properties: { value: { type: "number" }, lower: { type: "number" }, upper: { type: "number" } } },
                  latency: { type: "object", properties: { value: { type: "number" }, lower: { type: "number" }, upper: { type: "number" } } },
                  anomalies: { type: "object", properties: { value: { type: "number" }, lower: { type: "number" }, upper: { type: "number" } } }
                }
              }
            },
            trend_analysis: {
              type: "object",
              properties: {
                accuracy_trend: { type: "string" },
                latency_trend: { type: "string" },
                overall_health: { type: "string" },
                turning_points: { type: "array", items: { type: "string" } },
                key_factors: { type: "array", items: { type: "object", properties: { factor: { type: "string" }, impact: { type: "string" }, weight: { type: "number" } } } }
              }
            },
            early_warnings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  severity: { type: "string" },
                  message: { type: "string" },
                  probability: { type: "number" },
                  timeframe: { type: "string" },
                  mitigation: { type: "string" }
                }
              }
            },
            model_confidence: { type: "number" },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setPredictions(data);
      toast.success('تم تحديث التنبؤات');
    }
  });

  const runWhatIfScenarioMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل سيناريو "ماذا لو" التالي لنماذج AI:

المعلمات المعدلة:
- جودة البيانات: ${whatIfScenario.dataQuality}%
- تحديثات النماذج: ${whatIfScenario.modelUpdates}%
- تخصيص الموارد: ${whatIfScenario.resourceAllocation}%
- بيانات التدريب: ${whatIfScenario.trainingData}%

قدم:
1. التأثير المتوقع على الأداء
2. مقارنة مع السيناريو الأساسي
3. المخاطر والفرص
4. توصيات للتحسين`,
        response_json_schema: {
          type: "object",
          properties: {
            scenario_impact: {
              type: "object",
              properties: {
                accuracy_change: { type: "number" },
                latency_change: { type: "number" },
                anomaly_reduction: { type: "number" },
                overall_improvement: { type: "number" }
              }
            },
            comparison: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  metric: { type: "string" },
                  baseline: { type: "number" },
                  scenario: { type: "number" },
                  difference: { type: "number" }
                }
              }
            },
            risks: { type: "array", items: { type: "string" } },
            opportunities: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            confidence: { type: "number" }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setScenarioResults(data);
      toast.success('تم تحليل السيناريو');
    }
  });

  useEffect(() => {
    generatePredictionsMutation.mutate();
  }, []);

  const calculatePredictionAccuracy = () => {
    if (feedbackHistory.length === 0) return 0;
    const avgVariance = feedbackHistory.reduce((sum, p) => sum + p.variance, 0) / feedbackHistory.length;
    return Math.max(0, 100 - avgVariance);
  };

  const submitFeedback = (predictionId, actualValue) => {
    setFeedbackHistory(prev => prev.map(p => 
      p.id === predictionId ? { ...p, actual: actualValue, variance: Math.abs(p.predicted - actualValue) / p.predicted * 100 } : p
    ));
    toast.success('تم تسجيل الملاحظات وتحديث النموذج');
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              boxShadow: ['0 0 10px rgba(34,211,238,0.3)', '0 0 20px rgba(168,85,247,0.5)', '0 0 10px rgba(34,211,238,0.3)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
          >
            <Brain className="w-6 h-6 text-cyan-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold text-lg">التحليل التنبؤي المتقدم</h4>
            <p className="text-slate-400 text-xs">التنبؤات • سيناريوهات ماذا لو • تقييم الدقة</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="accuracy">الدقة</SelectItem>
              <SelectItem value="latency">التأخير</SelectItem>
              <SelectItem value="anomalies">الشذوذات</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="border-purple-500/50"
            onClick={() => setShowWhatIf(true)}
          >
            <GitBranch className="w-4 h-4 ml-1" />
            ماذا لو
          </Button>
          <Button
            variant="outline"
            className="border-cyan-500/50"
            onClick={() => generatePredictionsMutation.mutate()}
            disabled={generatePredictionsMutation.isPending}
          >
            {generatePredictionsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <Target className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{calculatePredictionAccuracy().toFixed(1)}%</p>
            <p className="text-slate-400 text-xs">دقة التنبؤات</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <Activity className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{predictions?.model_confidence || 0}%</p>
            <p className="text-slate-400 text-xs">ثقة النموذج</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-white">{predictions?.trend_analysis?.accuracy_trend || 'N/A'}</p>
            <p className="text-slate-400 text-xs">اتجاه الدقة</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{predictions?.early_warnings?.length || 0}</p>
            <p className="text-slate-400 text-xs">تحذيرات مبكرة</p>
          </CardContent>
        </Card>
      </div>

      {/* Prediction Controls */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-slate-300 text-sm mb-2 block">أفق التنبؤ (أيام)</Label>
              <div className="flex items-center gap-4">
                <Slider value={predictionHorizon} onValueChange={setPredictionHorizon} max={30} min={1} className="flex-1" />
                <Badge className="bg-cyan-500/20 text-cyan-400">{predictionHorizon[0]} يوم</Badge>
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm mb-2 block">مستوى الثقة المطلوب</Label>
              <div className="flex items-center gap-4">
                <Slider value={confidenceLevel} onValueChange={setConfidenceLevel} max={99} min={50} className="flex-1" />
                <Badge className="bg-purple-500/20 text-purple-400">{confidenceLevel[0]}%</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Chart */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <LineChartIcon className="w-4 h-4 text-cyan-400" />
            التنبؤات والاتجاهات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData}>
                <defs>
                  <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} name="الدقة الفعلية" connectNulls={false} />
                <Line type="monotone" dataKey="predicted_accuracy" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#a855f7' }} name="الدقة المتوقعة" connectNulls={false} />
                <Area type="monotone" dataKey="predicted_accuracy" fill="url(#predictionGradient)" stroke="none" name="نطاق التنبؤ" />
                <ReferenceLine y={95} stroke="#22d3ee" strokeDasharray="3 3" label={{ value: 'الهدف', fill: '#22d3ee', fontSize: 10 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="predictions" className="data-[state=active]:bg-cyan-500/20">
            <TrendingUp className="w-3 h-3 ml-1" />
            التنبؤات
          </TabsTrigger>
          <TabsTrigger value="factors" className="data-[state=active]:bg-purple-500/20">
            <Sliders className="w-3 h-3 ml-1" />
            العوامل المؤثرة
          </TabsTrigger>
          <TabsTrigger value="warnings" className="data-[state=active]:bg-amber-500/20">
            <AlertTriangle className="w-3 h-3 ml-1" />
            التحذيرات
          </TabsTrigger>
          <TabsTrigger value="accuracy" className="data-[state=active]:bg-green-500/20">
            <Award className="w-3 h-3 ml-1" />
            تقييم الدقة
          </TabsTrigger>
        </TabsList>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="mt-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4">
              {predictions?.predictions ? (
                <div className="grid md:grid-cols-3 gap-4">
                  {predictions.predictions.slice(0, 6).map((pred, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="border-slate-600 text-xs">{pred.date}</Badge>
                        <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                          {i < 3 ? 'قريب' : 'بعيد'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-xs">الدقة</span>
                          <span className="text-green-400 text-sm font-bold">{pred.accuracy?.value}%</span>
                        </div>
                        <Progress value={pred.accuracy?.value} className="h-1" />
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>الحد الأدنى: {pred.accuracy?.lower}%</span>
                          <span>الحد الأعلى: {pred.accuracy?.upper}%</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-cyan-400 mx-auto animate-spin mb-2" />
                  <p className="text-slate-400">جاري تحميل التنبؤات...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Factors Tab */}
        <TabsContent value="factors" className="mt-4">
          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardContent className="p-4">
              <ScrollArea className="h-[250px]">
                <div className="space-y-3">
                  {predictions?.trend_analysis?.key_factors?.map((factor, i) => (
                    <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{factor.factor}</span>
                        <Badge className={`text-xs ${
                          factor.impact === 'positive' ? 'bg-green-500/20 text-green-400' :
                          factor.impact === 'negative' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {factor.impact === 'positive' ? 'إيجابي' : factor.impact === 'negative' ? 'سلبي' : 'محايد'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={factor.weight * 100} className="flex-1 h-2" />
                        <span className="text-slate-400 text-xs">{(factor.weight * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  )) || (
                    <p className="text-slate-400 text-center py-4">لا توجد بيانات</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Warnings Tab */}
        <TabsContent value="warnings" className="mt-4">
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-4">
              <ScrollArea className="h-[250px]">
                <div className="space-y-3">
                  {predictions?.early_warnings?.map((warning, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`p-3 rounded-lg border ${
                        warning.severity === 'high' ? 'bg-red-500/10 border-red-500/30' :
                        warning.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
                        'bg-slate-900/50 border-slate-700/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-4 h-4 ${
                            warning.severity === 'high' ? 'text-red-400' :
                            warning.severity === 'medium' ? 'text-amber-400' :
                            'text-slate-400'
                          }`} />
                          <span className="text-white font-medium text-sm">{warning.type}</span>
                        </div>
                        <Badge className="text-xs">{warning.probability}% احتمالية</Badge>
                      </div>
                      <p className="text-slate-300 text-xs mb-2">{warning.message}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">الإطار الزمني: {warning.timeframe}</span>
                        <span className="text-green-400">التخفيف: {warning.mitigation}</span>
                      </div>
                    </motion.div>
                  )) || (
                    <p className="text-slate-400 text-center py-4">لا توجد تحذيرات حالياً</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accuracy Evaluation Tab */}
        <TabsContent value="accuracy" className="mt-4">
          <Card className="bg-green-500/10 border-green-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-green-400" />
                تقييم دقة التنبؤات السابقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 bg-slate-900/50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs">متوسط دقة التنبؤات</p>
                  <p className="text-2xl font-bold text-green-400">{calculatePredictionAccuracy().toFixed(1)}%</p>
                </div>
                <Award className="w-10 h-10 text-green-400 opacity-50" />
              </div>

              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {feedbackHistory.map((pred) => (
                    <div key={pred.id} className="p-3 bg-slate-900/50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          pred.variance < 5 ? 'bg-green-500' :
                          pred.variance < 15 ? 'bg-amber-500' :
                          'bg-red-500'
                        }`} />
                        <div>
                          <p className="text-white text-sm">{pred.metric} - {pred.date}</p>
                          <p className="text-slate-400 text-xs">
                            متوقع: {pred.predicted} | فعلي: {pred.actual || '—'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${
                          pred.variance < 5 ? 'bg-green-500/20 text-green-400' :
                          pred.variance < 15 ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          انحراف {pred.variance.toFixed(1)}%
                        </Badge>
                        {!pred.actual && (
                          <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => submitFeedback(pred.id, pred.predicted * 0.98)}>
                            <CheckCircle className="w-3 h-3 ml-1" />
                            تأكيد
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* What-If Scenario Dialog */}
      <Dialog open={showWhatIf} onOpenChange={setShowWhatIf}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-purple-400" />
              سيناريوهات "ماذا لو"
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Scenario Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-sm">جودة البيانات</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Slider 
                    value={[whatIfScenario.dataQuality]} 
                    onValueChange={([v]) => setWhatIfScenario({...whatIfScenario, dataQuality: v})} 
                    max={100} 
                  />
                  <Badge>{whatIfScenario.dataQuality}%</Badge>
                </div>
              </div>
              <div>
                <Label className="text-slate-300 text-sm">تحديثات النماذج</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Slider 
                    value={[whatIfScenario.modelUpdates]} 
                    onValueChange={([v]) => setWhatIfScenario({...whatIfScenario, modelUpdates: v})} 
                    max={100} 
                  />
                  <Badge>{whatIfScenario.modelUpdates}%</Badge>
                </div>
              </div>
              <div>
                <Label className="text-slate-300 text-sm">تخصيص الموارد</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Slider 
                    value={[whatIfScenario.resourceAllocation]} 
                    onValueChange={([v]) => setWhatIfScenario({...whatIfScenario, resourceAllocation: v})} 
                    max={100} 
                  />
                  <Badge>{whatIfScenario.resourceAllocation}%</Badge>
                </div>
              </div>
              <div>
                <Label className="text-slate-300 text-sm">بيانات التدريب</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Slider 
                    value={[whatIfScenario.trainingData]} 
                    onValueChange={([v]) => setWhatIfScenario({...whatIfScenario, trainingData: v})} 
                    max={100} 
                  />
                  <Badge>{whatIfScenario.trainingData}%</Badge>
                </div>
              </div>
            </div>

            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => runWhatIfScenarioMutation.mutate()}
              disabled={runWhatIfScenarioMutation.isPending}
            >
              {runWhatIfScenarioMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <Play className="w-4 h-4 ml-2" />
              )}
              تشغيل السيناريو
            </Button>

            {/* Scenario Results */}
            {scenarioResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Impact Summary */}
                <div className="grid grid-cols-4 gap-3">
                  <Card className="bg-green-500/10 border-green-500/30">
                    <CardContent className="p-3 text-center">
                      <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-white">+{scenarioResults.scenario_impact?.accuracy_change}%</p>
                      <p className="text-slate-400 text-[10px]">تحسن الدقة</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-cyan-500/10 border-cyan-500/30">
                    <CardContent className="p-3 text-center">
                      <Zap className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-white">-{scenarioResults.scenario_impact?.latency_change}ms</p>
                      <p className="text-slate-400 text-[10px]">تقليل التأخير</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-amber-500/10 border-amber-500/30">
                    <CardContent className="p-3 text-center">
                      <AlertTriangle className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-white">-{scenarioResults.scenario_impact?.anomaly_reduction}%</p>
                      <p className="text-slate-400 text-[10px]">تقليل الشذوذات</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-500/10 border-purple-500/30">
                    <CardContent className="p-3 text-center">
                      <Sparkles className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-white">+{scenarioResults.scenario_impact?.overall_improvement}%</p>
                      <p className="text-slate-400 text-[10px]">التحسن الكلي</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Comparison Chart */}
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">مقارنة السيناريوهات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[150px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={scenarioResults.comparison}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="metric" stroke="#94a3b8" fontSize={10} />
                          <YAxis stroke="#94a3b8" fontSize={10} />
                          <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
                          <Bar dataKey="baseline" fill="#64748b" name="الحالي" />
                          <Bar dataKey="scenario" fill="#a855f7" name="السيناريو" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <p className="text-green-400 font-medium text-sm mb-2 flex items-center gap-1">
                      <Lightbulb className="w-4 h-4" />
                      الفرص
                    </p>
                    <ul className="space-y-1">
                      {scenarioResults.opportunities?.map((opp, i) => (
                        <li key={i} className="text-slate-300 text-xs flex items-start gap-1">
                          <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                          {opp}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                    <p className="text-red-400 font-medium text-sm mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      المخاطر
                    </p>
                    <ul className="space-y-1">
                      {scenarioResults.risks?.map((risk, i) => (
                        <li key={i} className="text-slate-300 text-xs flex items-start gap-1">
                          <XCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}