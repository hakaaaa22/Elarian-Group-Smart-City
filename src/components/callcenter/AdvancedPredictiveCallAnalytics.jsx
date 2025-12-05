import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, TrendingUp, TrendingDown, ShoppingCart, UserMinus, Crown,
  AlertTriangle, Target, Sparkles, Loader2, DollarSign, Users,
  BarChart3, PieChart, Activity, Zap, Eye, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'];

export default function AdvancedPredictiveCallAnalytics({ callData, customerData }) {
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('purchase');

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت محلل بيانات متخصص في تحليلات مراكز الاتصال والتنبؤ بسلوك العملاء.

قم بتحليل البيانات التالية وتقديم تحليلات تنبؤية متقدمة:

بيانات العميل:
- الاسم: ${customerData?.name || 'عميل'}
- النوع: ${customerData?.type || 'عادي'}
- عدد التفاعلات السابقة: ${customerData?.interactions || 10}
- القيمة الإجمالية: ${customerData?.totalValue || 5000} ر.س
- آخر تواصل: ${customerData?.lastContact || 'قبل أسبوع'}

بيانات المكالمة:
- الموضوع: ${callData?.topic || 'استفسار عام'}
- المدة: ${callData?.duration || '5 دقائق'}
- المشاعر المكتشفة: ${callData?.sentiment || 'محايد'}

قدم تحليل شامل يتضمن:
1. نية الشراء (0-100) مع تفاصيل
2. خطر المغادرة (0-100) مع الأسباب
3. قيمة العميل المحتملة
4. فرص البيع المتقاطع
5. التوصيات الفورية للوكيل
6. الخطوات التالية المقترحة`,
        response_json_schema: {
          type: "object",
          properties: {
            purchase_intent: {
              type: "object",
              properties: {
                score: { type: "number" },
                confidence: { type: "number" },
                signals: { type: "array", items: { type: "string" } },
                products_of_interest: { type: "array", items: { type: "string" } },
                best_offer: { type: "string" },
                timing: { type: "string" }
              }
            },
            churn_risk: {
              type: "object",
              properties: {
                score: { type: "number" },
                level: { type: "string" },
                primary_drivers: { type: "array", items: { type: "string" } },
                warning_signs: { type: "array", items: { type: "string" } },
                retention_actions: { type: "array", items: { type: "string" } }
              }
            },
            customer_value: {
              type: "object",
              properties: {
                current_tier: { type: "string" },
                lifetime_value: { type: "number" },
                growth_potential: { type: "string" },
                recommended_tier: { type: "string" }
              }
            },
            cross_sell: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product: { type: "string" },
                  probability: { type: "number" },
                  value: { type: "number" }
                }
              }
            },
            agent_recommendations: { type: "array", items: { type: "string" } },
            next_steps: { type: "array", items: { type: "string" } },
            sentiment_trajectory: { type: "string" },
            urgency_level: { type: "string" }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast.success('تم تحليل المكالمة بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ في التحليل');
    }
  });

  const getScoreColor = (score, inverse = false) => {
    if (inverse) score = 100 - score;
    if (score >= 70) return 'green';
    if (score >= 40) return 'amber';
    return 'red';
  };

  const radarData = analysis ? [
    { metric: 'نية الشراء', value: analysis.purchase_intent?.score || 0 },
    { metric: 'الولاء', value: 100 - (analysis.churn_risk?.score || 0) },
    { metric: 'القيمة', value: Math.min((analysis.customer_value?.lifetime_value || 0) / 200, 100) },
    { metric: 'المشاركة', value: 75 },
    { metric: 'الرضا', value: 80 },
  ] : [];

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              boxShadow: ['0 0 20px rgba(34, 211, 238, 0.3)', '0 0 40px rgba(168, 85, 247, 0.3)', '0 0 20px rgba(34, 211, 238, 0.3)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
          >
            <Brain className="w-6 h-6 text-cyan-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">التحليلات التنبؤية المتقدمة</h4>
            <p className="text-slate-400 text-xs">AI-Powered Predictive Analytics</p>
          </div>
        </div>
        <Button
          className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
          onClick={() => analyzeMutation.mutate()}
          disabled={analyzeMutation.isPending}
        >
          {analyzeMutation.isPending ? (
            <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري التحليل...</>
          ) : (
            <><Sparkles className="w-4 h-4 ml-2" /> تحليل متقدم</>
          )}
        </Button>
      </div>

      {analysis ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
            <TabsTrigger value="purchase" className="data-[state=active]:bg-green-500/20 text-xs">
              <ShoppingCart className="w-3 h-3 ml-1" />
              نية الشراء
            </TabsTrigger>
            <TabsTrigger value="churn" className="data-[state=active]:bg-red-500/20 text-xs">
              <UserMinus className="w-3 h-3 ml-1" />
              خطر المغادرة
            </TabsTrigger>
            <TabsTrigger value="value" className="data-[state=active]:bg-amber-500/20 text-xs">
              <Crown className="w-3 h-3 ml-1" />
              قيمة العميل
            </TabsTrigger>
            <TabsTrigger value="actions" className="data-[state=active]:bg-purple-500/20 text-xs">
              <Zap className="w-3 h-3 ml-1" />
              التوصيات
            </TabsTrigger>
          </TabsList>

          {/* Purchase Intent */}
          <TabsContent value="purchase" className="mt-4 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className={`bg-${getScoreColor(analysis.purchase_intent?.score)}-500/10 border-${getScoreColor(analysis.purchase_intent?.score)}-500/30`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-white font-medium flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-green-400" />
                      نية الشراء
                    </h5>
                    <Badge className={`bg-${getScoreColor(analysis.purchase_intent?.score)}-500/20 text-${getScoreColor(analysis.purchase_intent?.score)}-400 text-lg px-3`}>
                      {analysis.purchase_intent?.score}%
                    </Badge>
                  </div>
                  <Progress value={analysis.purchase_intent?.score} className="h-3 mb-4" />
                  
                  <div className="space-y-3">
                    <div className="p-2 bg-slate-900/50 rounded">
                      <p className="text-slate-400 text-xs mb-1">الثقة في التنبؤ</p>
                      <p className="text-white font-medium">{analysis.purchase_intent?.confidence}%</p>
                    </div>
                    <div className="p-2 bg-slate-900/50 rounded">
                      <p className="text-slate-400 text-xs mb-1">أفضل عرض</p>
                      <p className="text-green-400 font-medium">{analysis.purchase_intent?.best_offer}</p>
                    </div>
                    <div className="p-2 bg-slate-900/50 rounded">
                      <p className="text-slate-400 text-xs mb-1">التوقيت المثالي</p>
                      <p className="text-cyan-400">{analysis.purchase_intent?.timing}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">إشارات الشراء</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {analysis.purchase_intent?.signals?.map((signal, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 bg-green-500/5 rounded">
                          <Target className="w-4 h-4 text-green-400 mt-0.5" />
                          <span className="text-slate-300 text-sm">{signal}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Cross-sell Opportunities */}
            {analysis.cross_sell?.length > 0 && (
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    فرص البيع المتقاطع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-3">
                    {analysis.cross_sell.map((item, i) => (
                      <div key={i} className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <p className="text-white font-medium mb-1">{item.product}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-xs">احتمالية: {item.probability}%</span>
                          <Badge className="bg-green-500/20 text-green-400">{item.value} ر.س</Badge>
                        </div>
                        <Progress value={item.probability} className="h-1 mt-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Churn Risk */}
          <TabsContent value="churn" className="mt-4 space-y-4">
            <Card className={`bg-${getScoreColor(analysis.churn_risk?.score, true)}-500/10 border-${getScoreColor(analysis.churn_risk?.score, true)}-500/30`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-white font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    تقييم خطر المغادرة
                  </h5>
                  <Badge className={`bg-${getScoreColor(analysis.churn_risk?.score, true)}-500/20 text-${getScoreColor(analysis.churn_risk?.score, true)}-400 text-lg px-3`}>
                    {analysis.churn_risk?.score}% - {analysis.churn_risk?.level}
                  </Badge>
                </div>
                <Progress value={analysis.churn_risk?.score} className="h-3 mb-4" />
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-red-500/10 border-red-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    أسباب الخطر الرئيسية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.churn_risk?.primary_drivers?.map((driver, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-red-500/5 rounded">
                        <span className="text-red-400 font-bold">{i + 1}.</span>
                        <span className="text-slate-300 text-sm">{driver}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-500/10 border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-400" />
                    إجراءات الاحتفاظ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.churn_risk?.retention_actions?.map((action, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-green-500/5 rounded">
                        <span className="text-green-400">✓</span>
                        <span className="text-slate-300 text-sm">{action}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Customer Value */}
          <TabsContent value="value" className="mt-4 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-amber-500/10 border-amber-500/30">
                  <CardContent className="p-4 text-center">
                    <Crown className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-sm text-white font-bold">{analysis.customer_value?.current_tier}</p>
                    <p className="text-slate-400 text-xs">التصنيف الحالي</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-lg font-bold text-white">{analysis.customer_value?.lifetime_value?.toLocaleString()}</p>
                    <p className="text-slate-400 text-xs">القيمة المتوقعة (ر.س)</p>
                  </CardContent>
                </Card>
                <Card className="bg-cyan-500/10 border-cyan-500/30">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-white">{analysis.customer_value?.growth_potential}</p>
                    <p className="text-slate-400 text-xs">إمكانية النمو</p>
                  </CardContent>
                </Card>
                <Card className="bg-purple-500/10 border-purple-500/30">
                  <CardContent className="p-4 text-center">
                    <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-white">{analysis.customer_value?.recommended_tier}</p>
                    <p className="text-slate-400 text-xs">التصنيف الموصى</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">مؤشرات القيمة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                        <Radar name="القيمة" dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Actions & Recommendations */}
          <TabsContent value="actions" className="mt-4 space-y-4">
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  توصيات فورية للوكيل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.agent_recommendations?.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-purple-500/5 rounded">
                      <Sparkles className="w-4 h-4 text-purple-400 mt-0.5" />
                      <span className="text-slate-300 text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  الخطوات التالية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.next_steps?.map((step, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-cyan-500/5 rounded">
                      <Badge className="bg-cyan-500/20 text-cyan-400">{i + 1}</Badge>
                      <span className="text-slate-300 text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Badge className={`bg-${analysis.urgency_level === 'high' ? 'red' : analysis.urgency_level === 'medium' ? 'amber' : 'green'}-500/20 text-${analysis.urgency_level === 'high' ? 'red' : analysis.urgency_level === 'medium' ? 'amber' : 'green'}-400`}>
                الأولوية: {analysis.urgency_level === 'high' ? 'عالية' : analysis.urgency_level === 'medium' ? 'متوسطة' : 'منخفضة'}
              </Badge>
              <Badge className="bg-slate-600 text-slate-300">
                اتجاه المشاعر: {analysis.sentiment_trajectory}
              </Badge>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-8 text-center">
            <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">اضغط "تحليل متقدم" للحصول على تحليلات تنبؤية شاملة</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}