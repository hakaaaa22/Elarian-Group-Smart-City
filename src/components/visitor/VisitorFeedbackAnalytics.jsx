import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  MessageSquare, Brain, TrendingUp, ThumbsUp, ThumbsDown, Meh,
  BarChart3, PieChart, RefreshCw, Loader2, Filter, Download,
  AlertTriangle, CheckCircle, Star, Users, Clock, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#22d3ee', '#a855f7', '#f59e0b', '#ef4444', '#22c55e', '#3b82f6'];

const categoryLabels = {
  accessibility: 'سهولة الوصول',
  reception_quality: 'جودة الاستقبال',
  security: 'الأمان',
  facilities: 'المرافق',
  communication: 'التواصل',
  waiting_time: 'وقت الانتظار',
  staff_behavior: 'سلوك الموظفين',
  general: 'عام'
};

const sentimentConfig = {
  positive: { icon: ThumbsUp, color: 'green', label: 'إيجابي' },
  negative: { icon: ThumbsDown, color: 'red', label: 'سلبي' },
  neutral: { icon: Meh, color: 'slate', label: 'محايد' },
  mixed: { icon: AlertTriangle, color: 'amber', label: 'مختلط' }
};

export default function VisitorFeedbackAnalytics() {
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [filterCategory, setFilterCategory] = useState('all');
  const queryClient = useQueryClient();

  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: ['visitor-feedbacks'],
    queryFn: () => base44.entities.VisitorFeedback.list('-created_date', 100)
  });

  const analyzeMutation = useMutation({
    mutationFn: async (feedbackId) => {
      const feedback = feedbacks.find(f => f.id === feedbackId);
      if (!feedback?.comment) return;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل تعليق الزائر التالي وتصنيفه:
التعليق: "${feedback.comment}"

قم بتحديد:
1. الفئة (accessibility, reception_quality, security, facilities, communication, waiting_time, staff_behavior, general)
2. المشاعر (positive, negative, neutral, mixed)
3. درجة المشاعر من -1 إلى 1
4. ملخص موجز للتعليق
5. المواضيع الرئيسية
6. الإجراءات المقترحة للتحسين`,
        response_json_schema: {
          type: "object",
          properties: {
            category: { type: "string" },
            sentiment: { type: "string" },
            sentiment_score: { type: "number" },
            summary: { type: "string" },
            themes: { type: "array", items: { type: "string" } },
            action_items: { type: "array", items: { type: "string" } }
          }
        }
      });

      await base44.entities.VisitorFeedback.update(feedbackId, {
        ai_category: analysis.category,
        ai_sentiment: analysis.sentiment,
        ai_sentiment_score: analysis.sentiment_score,
        ai_summary: analysis.summary,
        ai_themes: analysis.themes,
        ai_action_items: analysis.action_items,
        status: 'analyzed'
      });

      return analysis;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitor-feedbacks'] });
      toast.success('تم تحليل التعليق بنجاح');
    }
  });

  const analyzeAllMutation = useMutation({
    mutationFn: async () => {
      const pendingFeedbacks = feedbacks.filter(f => f.status === 'pending' && f.comment);
      for (const feedback of pendingFeedbacks.slice(0, 10)) {
        await analyzeMutation.mutateAsync(feedback.id);
      }
    },
    onSuccess: () => {
      toast.success('تم تحليل جميع التعليقات المعلقة');
    }
  });

  // Calculate analytics
  const analyzedFeedbacks = feedbacks.filter(f => f.ai_sentiment);
  const sentimentDistribution = analyzedFeedbacks.reduce((acc, f) => {
    acc[f.ai_sentiment] = (acc[f.ai_sentiment] || 0) + 1;
    return acc;
  }, {});

  const categoryDistribution = analyzedFeedbacks.reduce((acc, f) => {
    if (f.ai_category) {
      acc[f.ai_category] = (acc[f.ai_category] || 0) + 1;
    }
    return acc;
  }, {});

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.filter(f => f.rating).length).toFixed(1)
    : 0;

  const sentimentChartData = Object.entries(sentimentDistribution).map(([key, value]) => ({
    name: sentimentConfig[key]?.label || key,
    value,
    color: sentimentConfig[key]?.color || 'slate'
  }));

  const categoryChartData = Object.entries(categoryDistribution).map(([key, value]) => ({
    name: categoryLabels[key] || key,
    value
  }));

  // Extract common themes
  const allThemes = analyzedFeedbacks.flatMap(f => f.ai_themes || []);
  const themeCounts = allThemes.reduce((acc, theme) => {
    acc[theme] = (acc[theme] || 0) + 1;
    return acc;
  }, {});
  const topThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Brain className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">تحليلات تعليقات الزوار بالذكاء الاصطناعي</h3>
            <p className="text-slate-500 text-sm">تصنيف تلقائي • تحليل المشاعر • استخراج المواضيع</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="week">أسبوع</SelectItem>
              <SelectItem value="month">شهر</SelectItem>
              <SelectItem value="quarter">ربع سنة</SelectItem>
              <SelectItem value="year">سنة</SelectItem>
            </SelectContent>
          </Select>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => analyzeAllMutation.mutate()}
            disabled={analyzeAllMutation.isPending}
          >
            {analyzeAllMutation.isPending ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 ml-2" />
            )}
            تحليل الكل
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-cyan-400" />
              <div>
                <p className="text-2xl font-bold text-white">{feedbacks.length}</p>
                <p className="text-slate-500 text-xs">إجمالي التعليقات</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-amber-400" />
              <div>
                <p className="text-2xl font-bold text-amber-400">{avgRating}</p>
                <p className="text-slate-500 text-xs">متوسط التقييم</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ThumbsUp className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-green-400">{sentimentDistribution.positive || 0}</p>
                <p className="text-slate-500 text-xs">إيجابي</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ThumbsDown className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-red-400">{sentimentDistribution.negative || 0}</p>
                <p className="text-slate-500 text-xs">سلبي</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-purple-400">{analyzedFeedbacks.length}</p>
                <p className="text-slate-500 text-xs">تم تحليله</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="sentiments">تحليل المشاعر</TabsTrigger>
          <TabsTrigger value="themes">المواضيع الشائعة</TabsTrigger>
          <TabsTrigger value="feedbacks">التعليقات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Sentiment Distribution */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">توزيع المشاعر</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={sentimentChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {sentimentChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">توزيع الفئات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" stroke="#94a3b8" />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} fontSize={11} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sentiments">
          <div className="grid lg:grid-cols-3 gap-4">
            {Object.entries(sentimentConfig).map(([key, config]) => {
              const count = sentimentDistribution[key] || 0;
              const percentage = analyzedFeedbacks.length > 0 ? ((count / analyzedFeedbacks.length) * 100).toFixed(1) : 0;
              const Icon = config.icon;
              return (
                <Card key={key} className={`bg-${config.color}-500/10 border-${config.color}-500/30`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 text-${config.color}-400`} />
                        <span className="text-white font-medium">{config.label}</span>
                      </div>
                      <Badge className={`bg-${config.color}-500/20 text-${config.color}-400`}>
                        {count}
                      </Badge>
                    </div>
                    <Progress value={parseFloat(percentage)} className="h-2" />
                    <p className="text-slate-500 text-xs mt-2">{percentage}% من التعليقات</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="themes">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                المواضيع الأكثر شيوعًا
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {topThemes.map(([theme, count], index) => (
                  <motion.div
                    key={theme}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-cyan-400 font-bold">#{index + 1}</span>
                      <span className="text-white">{theme}</span>
                    </div>
                    <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                      {count} ذكر
                    </Badge>
                  </motion.div>
                ))}
                {topThemes.length === 0 && (
                  <p className="text-slate-500 col-span-2 text-center py-8">لا توجد مواضيع مستخرجة بعد</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedbacks">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {feedbacks.map((feedback, index) => {
                    const sentimentCfg = sentimentConfig[feedback.ai_sentiment];
                    const SentimentIcon = sentimentCfg?.icon || Meh;
                    return (
                      <motion.div
                        key={feedback.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-white font-medium">{feedback.visitor_name}</span>
                              {feedback.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                  <span className="text-amber-400 text-sm">{feedback.rating}</span>
                                </div>
                              )}
                              {feedback.ai_sentiment && (
                                <Badge className={`bg-${sentimentCfg?.color}-500/20 text-${sentimentCfg?.color}-400`}>
                                  <SentimentIcon className="w-3 h-3 ml-1" />
                                  {sentimentCfg?.label}
                                </Badge>
                              )}
                              {feedback.ai_category && (
                                <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                                  {categoryLabels[feedback.ai_category]}
                                </Badge>
                              )}
                            </div>
                            <p className="text-slate-300 text-sm mb-2">{feedback.comment}</p>
                            {feedback.ai_summary && (
                              <div className="p-2 bg-purple-500/10 rounded border border-purple-500/20 mb-2">
                                <p className="text-purple-400 text-xs flex items-center gap-1">
                                  <Brain className="w-3 h-3" />
                                  {feedback.ai_summary}
                                </p>
                              </div>
                            )}
                            {feedback.ai_themes?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {feedback.ai_themes.map((theme, i) => (
                                  <Badge key={i} variant="outline" className="border-slate-600 text-slate-400 text-xs">
                                    {theme}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            {feedback.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-purple-500/50 text-purple-400"
                                onClick={() => analyzeMutation.mutate(feedback.id)}
                                disabled={analyzeMutation.isPending}
                              >
                                {analyzeMutation.isPending ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Brain className="w-3 h-3" />
                                )}
                              </Button>
                            )}
                            <Badge className={`text-xs ${
                              feedback.status === 'analyzed' ? 'bg-green-500/20 text-green-400' :
                              feedback.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>
                              {feedback.status === 'analyzed' ? 'محلل' : feedback.status === 'pending' ? 'معلق' : feedback.status}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}