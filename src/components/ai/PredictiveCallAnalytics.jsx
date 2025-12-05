import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, TrendingUp, TrendingDown, ShoppingCart, UserMinus, Crown,
  Target, AlertTriangle, Sparkles, Loader2, Users, DollarSign,
  Phone, MessageSquare, BarChart3, PieChart, RefreshCw, Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart,
  Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'];

const intentData = [
  { week: 'W1', purchase: 65, churn: 15, upgrade: 45 },
  { week: 'W2', purchase: 72, churn: 12, upgrade: 52 },
  { week: 'W3', purchase: 68, churn: 18, upgrade: 48 },
  { week: 'W4', purchase: 78, churn: 10, upgrade: 58 },
];

const customerSegments = [
  { name: 'عالي القيمة', value: 15, color: '#22c55e' },
  { name: 'متوسط', value: 45, color: '#f59e0b' },
  { name: 'منخفض', value: 30, color: '#ef4444' },
  { name: 'جديد', value: 10, color: '#3b82f6' },
];

const churnDriversData = [
  { factor: 'جودة الخدمة', impact: 85 },
  { factor: 'السعر', impact: 72 },
  { factor: 'الدعم الفني', impact: 68 },
  { factor: 'المنافسة', impact: 55 },
  { factor: 'التجربة', impact: 48 },
];

export default function PredictiveCallAnalytics() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const analysisMutation = useMutation({
    mutationFn: async () => {
      setIsAnalyzing(true);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت محلل بيانات متخصص في تحليل سلوك العملاء. قم بتحليل بيانات مركز الاتصال وتقديم:

1. التنبؤ بنية الشراء (Purchase Intent) - نسبة مئوية
2. تقييم خطر المغادرة (Churn Risk) - نسبة مئوية
3. تحديد العملاء عالي القيمة (High-Value Customers) - عدد ونسبة
4. أسباب فقدان العملاء الرئيسية (Churn Drivers)
5. توصيات لتحسين الاحتفاظ بالعملاء
6. توقعات الأسبوع القادم`,
        response_json_schema: {
          type: "object",
          properties: {
            purchase_intent_avg: { type: "number" },
            churn_risk_avg: { type: "number" },
            high_value_count: { type: "number" },
            high_value_percentage: { type: "number" },
            top_churn_drivers: { type: "array", items: { type: "string" } },
            retention_recommendations: { type: "array", items: { type: "string" } },
            weekly_forecast: {
              type: "object",
              properties: {
                expected_calls: { type: "number" },
                predicted_conversions: { type: "number" },
                churn_alerts: { type: "number" }
              }
            },
            customer_insights: { type: "array", items: { type: "string" } }
          }
        }
      });
      setIsAnalyzing(false);
      return result;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast.success('تم التحليل بنجاح');
    },
    onError: () => {
      setIsAnalyzing(false);
      toast.error('حدث خطأ');
    }
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
          >
            <Brain className="w-6 h-6 text-cyan-400" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-white">التحليلات التنبؤية للمكالمات</h3>
            <p className="text-slate-400 text-sm">نية الشراء • خطر المغادرة • العملاء عالي القيمة</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-600">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Button
            className="bg-cyan-600 hover:bg-cyan-700"
            onClick={() => analysisMutation.mutate()}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري التحليل...</>
            ) : (
              <><Sparkles className="w-4 h-4 ml-2" /> تحليل ذكي</>
            )}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{analysisResult?.purchase_intent_avg || 72}%</p>
                <p className="text-slate-400 text-sm">نية الشراء</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-green-400 text-xs">
              <TrendingUp className="w-3 h-3" />
              <span>+5% من الأسبوع الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserMinus className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-white">{analysisResult?.churn_risk_avg || 18}%</p>
                <p className="text-slate-400 text-sm">خطر المغادرة</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-green-400 text-xs">
              <TrendingDown className="w-3 h-3" />
              <span>-3% تحسن</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-amber-400" />
              <div>
                <p className="text-2xl font-bold text-white">{analysisResult?.high_value_count || 245}</p>
                <p className="text-slate-400 text-sm">عملاء VIP</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-amber-400 text-xs">
              <Target className="w-3 h-3" />
              <span>{analysisResult?.high_value_percentage || 15}% من الإجمالي</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Phone className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{analysisResult?.weekly_forecast?.expected_calls || 1250}</p>
                <p className="text-slate-400 text-sm">متوقع هذا الأسبوع</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-purple-400 text-xs">
              <BarChart3 className="w-3 h-3" />
              <span>توقع AI</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Intent Trends */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              اتجاهات النوايا
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={intentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="purchase" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} name="نية الشراء" />
                  <Area type="monotone" dataKey="upgrade" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} name="احتمال الترقية" />
                  <Area type="monotone" dataKey="churn" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="خطر المغادرة" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              شرائح العملاء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={customerSegments}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {customerSegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Churn Drivers */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              أسباب فقدان العملاء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {churnDriversData.map((driver, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 text-sm">{driver.factor}</span>
                    <span className="text-white font-medium">{driver.impact}%</span>
                  </div>
                  <Progress value={driver.impact} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              رؤى الذكاء الاصطناعي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {(analysisResult?.customer_insights || [
                  'العملاء الذين يتصلون أكثر من 3 مرات شهرياً لديهم احتمال مغادرة 45% أعلى',
                  'العروض المخصصة تزيد نية الشراء بنسبة 28%',
                  'وقت الانتظار الطويل هو السبب الأول لعدم الرضا',
                  'العملاء VIP يفضلون التواصل عبر WhatsApp بنسبة 67%',
                  'أفضل وقت للاتصال بالعملاء المحتملين: 10-12 صباحاً'
                ]).map((insight, i) => (
                  <div key={i} className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-slate-300 text-sm flex items-start gap-2">
                      <Brain className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      {insight}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {analysisResult?.retention_recommendations && (
        <Card className="bg-green-500/10 border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-green-400" />
              توصيات لتحسين الاحتفاظ بالعملاء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {analysisResult.retention_recommendations.map((rec, i) => (
                <div key={i} className="p-3 bg-slate-900/50 rounded-lg flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-slate-300 text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}