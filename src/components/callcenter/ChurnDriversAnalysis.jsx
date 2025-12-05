import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  UserMinus, AlertTriangle, TrendingDown, Target, Brain, Sparkles,
  Loader2, BarChart3, PieChart, Activity, CheckCircle, XCircle,
  MessageSquare, Phone, Clock, DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'];

export default function ChurnDriversAnalysis({ conversationData, customerHistory }) {
  const [analysis, setAnalysis] = useState(null);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير في تحليل أسباب فقدان العملاء (Customer Churn Analysis).

قم بتحليل البيانات التالية لتحديد أسباب فقدان العملاء:

بيانات المحادثات:
${conversationData || 'العميل يشكو من بطء الخدمة وارتفاع الأسعار مقارنة بالمنافسين'}

تاريخ العميل:
${customerHistory || 'عميل منذ سنتين، انخفض معدل الاستخدام 40% في الشهور الأخيرة'}

قدم تحليل شامل يتضمن:
1. أسباب المغادرة الرئيسية مع نسب التأثير
2. إشارات التحذير المبكرة
3. مقارنة مع المنافسين (إن وجدت)
4. تأثير كل عامل على قرار المغادرة
5. استراتيجيات الاحتفاظ المقترحة
6. توقع احتمالية المغادرة`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_churn_probability: { type: "number" },
            risk_level: { type: "string" },
            primary_drivers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  driver: { type: "string" },
                  impact_percentage: { type: "number" },
                  severity: { type: "string" },
                  evidence: { type: "array", items: { type: "string" } }
                }
              }
            },
            warning_signals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  signal: { type: "string" },
                  detected_date: { type: "string" },
                  urgency: { type: "string" }
                }
              }
            },
            competitor_mentions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  competitor: { type: "string" },
                  advantage_mentioned: { type: "string" }
                }
              }
            },
            sentiment_breakdown: {
              type: "object",
              properties: {
                product: { type: "number" },
                service: { type: "number" },
                price: { type: "number" },
                support: { type: "number" }
              }
            },
            retention_strategies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  strategy: { type: "string" },
                  priority: { type: "string" },
                  expected_impact: { type: "number" },
                  implementation: { type: "string" }
                }
              }
            },
            key_insights: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast.success('تم تحليل أسباب المغادرة');
    },
    onError: () => {
      toast.error('حدث خطأ');
    }
  });

  const driversChartData = analysis?.primary_drivers?.map(d => ({
    name: d.driver.substring(0, 15) + '...',
    impact: d.impact_percentage
  })) || [];

  const sentimentData = analysis?.sentiment_breakdown ? [
    { name: 'المنتج', value: analysis.sentiment_breakdown.product },
    { name: 'الخدمة', value: analysis.sentiment_breakdown.service },
    { name: 'السعر', value: analysis.sentiment_breakdown.price },
    { name: 'الدعم', value: analysis.sentiment_breakdown.support },
  ] : [];

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
      case 'عالي':
        return 'red';
      case 'medium':
      case 'متوسط':
        return 'amber';
      default:
        return 'green';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-amber-500/20"
          >
            <UserMinus className="w-6 h-6 text-red-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">تحليل أسباب فقدان العملاء</h4>
            <p className="text-slate-400 text-xs">Customer Churn Drivers Analysis</p>
          </div>
        </div>
        <Button
          className="bg-red-600 hover:bg-red-700"
          onClick={() => analyzeMutation.mutate()}
          disabled={analyzeMutation.isPending}
        >
          {analyzeMutation.isPending ? (
            <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري التحليل...</>
          ) : (
            <><Brain className="w-4 h-4 ml-2" /> تحليل الأسباب</>
          )}
        </Button>
      </div>

      {analysis ? (
        <div className="space-y-4">
          {/* Risk Summary */}
          <Card className={`bg-${getRiskColor(analysis.risk_level)}-500/10 border-${getRiskColor(analysis.risk_level)}-500/30`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">احتمالية المغادرة الإجمالية</p>
                  <p className="text-3xl font-bold text-white">{analysis.overall_churn_probability}%</p>
                </div>
                <Badge className={`bg-${getRiskColor(analysis.risk_level)}-500/20 text-${getRiskColor(analysis.risk_level)}-400 text-lg px-4 py-2`}>
                  خطر {analysis.risk_level}
                </Badge>
              </div>
              <Progress value={analysis.overall_churn_probability} className="h-3 mt-4" />
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Primary Drivers Chart */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-red-400" />
                  عوامل المغادرة الرئيسية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={driversChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} width={80} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                      <Bar dataKey="impact" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Breakdown */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-purple-400" />
                  توزيع المشاعر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {sentimentData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Drivers */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">تفاصيل عوامل المغادرة</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {analysis.primary_drivers?.map((driver, i) => (
                    <div key={i} className={`p-3 bg-${driver.severity === 'high' ? 'red' : driver.severity === 'medium' ? 'amber' : 'slate'}-500/10 rounded-lg border border-${driver.severity === 'high' ? 'red' : driver.severity === 'medium' ? 'amber' : 'slate'}-500/30`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{driver.driver}</span>
                        <Badge className={`bg-${driver.severity === 'high' ? 'red' : driver.severity === 'medium' ? 'amber' : 'green'}-500/20`}>
                          تأثير {driver.impact_percentage}%
                        </Badge>
                      </div>
                      <Progress value={driver.impact_percentage} className="h-1.5 mb-2" />
                      {driver.evidence?.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {driver.evidence.map((e, j) => (
                            <p key={j} className="text-slate-400 text-xs flex items-start gap-1">
                              <span className="text-slate-500">•</span> {e}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Warning Signals */}
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                إشارات التحذير المبكرة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-2">
                {analysis.warning_signals?.map((signal, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-amber-500/5 rounded">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 ${signal.urgency === 'high' ? 'text-red-400' : 'text-amber-400'}`} />
                    <div>
                      <p className="text-slate-300 text-sm">{signal.signal}</p>
                      <p className="text-slate-500 text-xs">{signal.detected_date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Retention Strategies */}
          <Card className="bg-green-500/10 border-green-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-green-400" />
                استراتيجيات الاحتفاظ المقترحة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.retention_strategies?.map((strategy, i) => (
                  <div key={i} className="p-3 bg-green-500/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{strategy.strategy}</span>
                      <div className="flex gap-2">
                        <Badge className={`bg-${strategy.priority === 'high' ? 'red' : strategy.priority === 'medium' ? 'amber' : 'blue'}-500/20`}>
                          {strategy.priority === 'high' ? 'عالية' : strategy.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                        </Badge>
                        <Badge className="bg-green-500/20 text-green-400">
                          تأثير متوقع: {strategy.expected_impact}%
                        </Badge>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm">{strategy.implementation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                رؤى رئيسية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.key_insights?.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-purple-500/5 rounded">
                    <Brain className="w-4 h-4 text-purple-400 mt-0.5" />
                    <span className="text-slate-300 text-sm">{insight}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-8 text-center">
            <UserMinus className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">اضغط "تحليل الأسباب" للحصول على تحليل شامل لأسباب فقدان العملاء</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}