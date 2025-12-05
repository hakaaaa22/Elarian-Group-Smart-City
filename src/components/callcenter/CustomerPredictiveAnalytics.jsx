import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, TrendingUp, TrendingDown, DollarSign, AlertTriangle, Target,
  Users, ShoppingCart, UserMinus, Sparkles, RefreshCw, Loader2, Eye,
  Crown, Flag, ThumbsUp, ThumbsDown, Activity, Zap, Heart, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { toast } from 'sonner';

const intentCategories = [
  { key: 'purchase', label: 'نية الشراء', icon: ShoppingCart, color: 'green' },
  { key: 'churn', label: 'خطر المغادرة', icon: UserMinus, color: 'red' },
  { key: 'upgrade', label: 'احتمال الترقية', icon: TrendingUp, color: 'cyan' },
  { key: 'support', label: 'حاجة للدعم', icon: Activity, color: 'amber' },
  { key: 'referral', label: 'احتمال التوصية', icon: Users, color: 'purple' },
];

const churnDrivers = [
  { driver: 'مشاكل الخدمة المتكررة', impact: 35, trend: 'up' },
  { driver: 'أسعار المنافسين', impact: 28, trend: 'stable' },
  { driver: 'بطء الاستجابة', impact: 18, trend: 'down' },
  { driver: 'نقص الميزات', impact: 12, trend: 'up' },
  { driver: 'تجربة مستخدم سيئة', impact: 7, trend: 'stable' },
];

export default function CustomerPredictiveAnalytics({ customerData, conversationHistory }) {
  const [activeTab, setActiveTab] = useState('intent');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analysisMutation = useMutation({
    mutationFn: async () => {
      setIsAnalyzing(true);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت محلل بيانات خبير في سلوك العملاء. قم بتحليل بيانات العميل والمحادثة التالية:

بيانات العميل:
- الاسم: ${customerData?.name || 'أحمد محمد'}
- نوع العميل: ${customerData?.type || 'عميل VIP'}
- تاريخ الاشتراك: ${customerData?.joinDate || '2022-05-15'}
- عدد التفاعلات السابقة: ${customerData?.interactions || 15}
- متوسط قيمة الطلبات: ${customerData?.avgOrderValue || '500 ر.س'}

المحادثة الأخيرة:
${conversationHistory || 'استفسار عن تجديد الاشتراك وشكوى من بطء الخدمة'}

قم بتحليل:
1. نية الشراء (0-100)
2. خطر المغادرة (0-100)
3. احتمال الترقية (0-100)
4. حاجة للدعم (0-100)
5. احتمال التوصية (0-100)
6. قيمة العميل المتوقعة
7. أسباب محتملة للمغادرة
8. توصيات للوكيل`,
        response_json_schema: {
          type: "object",
          properties: {
            purchase_intent: { type: "number" },
            churn_risk: { type: "number" },
            upgrade_probability: { type: "number" },
            support_need: { type: "number" },
            referral_likelihood: { type: "number" },
            customer_value: { type: "string" },
            lifetime_value: { type: "number" },
            churn_reasons: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            sentiment: { type: "string" },
            urgency_level: { type: "string" },
            best_action: { type: "string" }
          }
        }
      });
      setIsAnalyzing(false);
      return result;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast.success('تم تحليل بيانات العميل');
    },
    onError: () => {
      setIsAnalyzing(false);
      toast.error('حدث خطأ في التحليل');
    }
  });

  const radarData = analysis ? [
    { metric: 'الشراء', value: analysis.purchase_intent },
    { metric: 'الولاء', value: 100 - analysis.churn_risk },
    { metric: 'الترقية', value: analysis.upgrade_probability },
    { metric: 'الرضا', value: 100 - analysis.support_need },
    { metric: 'التوصية', value: analysis.referral_likelihood },
  ] : [];

  const getRiskColor = (value) => {
    if (value >= 70) return 'red';
    if (value >= 40) return 'amber';
    return 'green';
  };

  const getValueColor = (value) => {
    if (value >= 70) return 'green';
    if (value >= 40) return 'amber';
    return 'red';
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              boxShadow: ['0 0 20px rgba(168, 85, 247, 0.4)', '0 0 40px rgba(34, 211, 238, 0.4)', '0 0 20px rgba(168, 85, 247, 0.4)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20"
          >
            <Brain className="w-5 h-5 text-purple-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">التحليلات التنبؤية للعميل</h4>
            <p className="text-slate-400 text-xs">AI Customer Intelligence</p>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => analysisMutation.mutate()}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <><Loader2 className="w-4 h-4 ml-1 animate-spin" /> جاري التحليل...</>
          ) : (
            <><Sparkles className="w-4 h-4 ml-1" /> تحليل ذكي</>
          )}
        </Button>
      </div>

      {analysis ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
            <TabsTrigger value="intent" className="data-[state=active]:bg-purple-500/20 text-xs">
              <Target className="w-3 h-3 ml-1" />
              النوايا
            </TabsTrigger>
            <TabsTrigger value="value" className="data-[state=active]:bg-green-500/20 text-xs">
              <DollarSign className="w-3 h-3 ml-1" />
              القيمة
            </TabsTrigger>
            <TabsTrigger value="churn" className="data-[state=active]:bg-red-500/20 text-xs">
              <AlertTriangle className="w-3 h-3 ml-1" />
              المغادرة
            </TabsTrigger>
            <TabsTrigger value="actions" className="data-[state=active]:bg-cyan-500/20 text-xs">
              <Zap className="w-3 h-3 ml-1" />
              التوصيات
            </TabsTrigger>
          </TabsList>

          {/* Intent Analysis */}
          <TabsContent value="intent" className="mt-4 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-4">
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                        <Radar name="القيمة" dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {intentCategories.map(cat => {
                  const value = analysis[`${cat.key === 'purchase' ? 'purchase_intent' : 
                    cat.key === 'churn' ? 'churn_risk' :
                    cat.key === 'upgrade' ? 'upgrade_probability' :
                    cat.key === 'support' ? 'support_need' : 'referral_likelihood'}`];
                  const color = cat.key === 'churn' || cat.key === 'support' ? getRiskColor(value) : getValueColor(value);
                  const Icon = cat.icon;
                  return (
                    <div key={cat.key} className={`p-3 bg-${color}-500/10 border border-${color}-500/30 rounded-lg`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 text-${color}-400`} />
                          <span className="text-white text-sm">{cat.label}</span>
                        </div>
                        <span className={`text-${color}-400 font-bold`}>{value}%</span>
                      </div>
                      <Progress value={value} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Customer Value */}
          <TabsContent value="value" className="mt-4 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="p-4 text-center">
                  <Crown className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{analysis.customer_value}</p>
                  <p className="text-slate-400 text-sm">تصنيف العميل</p>
                </CardContent>
              </Card>
              <Card className="bg-cyan-500/10 border-cyan-500/30">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{analysis.lifetime_value?.toLocaleString()} ر.س</p>
                  <p className="text-slate-400 text-sm">القيمة المتوقعة</p>
                </CardContent>
              </Card>
              <Card className={`bg-${analysis.sentiment === 'positive' ? 'green' : analysis.sentiment === 'negative' ? 'red' : 'amber'}-500/10 border-${analysis.sentiment === 'positive' ? 'green' : analysis.sentiment === 'negative' ? 'red' : 'amber'}-500/30`}>
                <CardContent className="p-4 text-center">
                  {analysis.sentiment === 'positive' ? <ThumbsUp className="w-8 h-8 text-green-400 mx-auto mb-2" /> :
                   analysis.sentiment === 'negative' ? <ThumbsDown className="w-8 h-8 text-red-400 mx-auto mb-2" /> :
                   <Activity className="w-8 h-8 text-amber-400 mx-auto mb-2" />}
                  <p className="text-lg font-bold text-white capitalize">{analysis.sentiment}</p>
                  <p className="text-slate-400 text-sm">المشاعر الحالية</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Churn Analysis */}
          <TabsContent value="churn" className="mt-4 space-y-4">
            <Card className={`bg-${getRiskColor(analysis.churn_risk)}-500/10 border-${getRiskColor(analysis.churn_risk)}-500/30`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-white font-medium">خطر المغادرة</h5>
                  <Badge className={`bg-${getRiskColor(analysis.churn_risk)}-500/20 text-${getRiskColor(analysis.churn_risk)}-400 text-lg px-3`}>
                    {analysis.churn_risk}%
                  </Badge>
                </div>
                <Progress value={analysis.churn_risk} className="h-3 mb-4" />
                
                <h6 className="text-slate-400 text-sm mb-2">أسباب محتملة للمغادرة:</h6>
                <div className="space-y-2">
                  {analysis.churn_reasons?.map((reason, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-900/50 rounded">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-white text-sm">{reason}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">عوامل المغادرة الشائعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {churnDrivers.map((driver, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-300 text-sm">{driver.driver}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{driver.impact}%</span>
                          {driver.trend === 'up' && <TrendingUp className="w-3 h-3 text-red-400" />}
                          {driver.trend === 'down' && <TrendingDown className="w-3 h-3 text-green-400" />}
                        </div>
                      </div>
                      <Progress value={driver.impact} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations */}
          <TabsContent value="actions" className="mt-4 space-y-4">
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  الإجراء الأمثل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white">{analysis.best_action}</p>
                <Badge className={`mt-2 bg-${analysis.urgency_level === 'high' ? 'red' : analysis.urgency_level === 'medium' ? 'amber' : 'green'}-500/20 text-${analysis.urgency_level === 'high' ? 'red' : analysis.urgency_level === 'medium' ? 'amber' : 'green'}-400`}>
                  الأولوية: {analysis.urgency_level === 'high' ? 'عالية' : analysis.urgency_level === 'medium' ? 'متوسطة' : 'منخفضة'}
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">توصيات للوكيل</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px]">
                  <div className="space-y-2">
                    {analysis.recommendations?.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-slate-900/50 rounded">
                        <Sparkles className="w-4 h-4 text-purple-400 mt-0.5" />
                        <span className="text-white text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-8 text-center">
            <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">اضغط "تحليل ذكي" للحصول على رؤى تنبؤية عن العميل</p>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => analysisMutation.mutate()}
              disabled={isAnalyzing}
            >
              <Sparkles className="w-4 h-4 ml-2" />
              بدء التحليل
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}