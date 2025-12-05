import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Users, TrendingUp, TrendingDown, Activity, Target, Brain, Zap,
  Clock, MousePointer, Eye, AlertTriangle, Star, Heart, RefreshCw,
  Loader2, BarChart3, PieChart, ArrowRight, Sparkles, UserMinus,
  UserPlus, Bell, MessageSquare, Settings, Filter, Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];

const engagementData = [
  { day: 'الأحد', sessions: 120, duration: 25, actions: 450 },
  { day: 'الإثنين', sessions: 180, duration: 32, actions: 720 },
  { day: 'الثلاثاء', sessions: 150, duration: 28, actions: 580 },
  { day: 'الأربعاء', sessions: 200, duration: 35, actions: 890 },
  { day: 'الخميس', sessions: 170, duration: 30, actions: 650 },
  { day: 'الجمعة', sessions: 90, duration: 20, actions: 320 },
  { day: 'السبت', sessions: 60, duration: 15, actions: 180 },
];

export default function AIUserBehaviorAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');

  const analyzeUserBehaviorMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل سلوك المستخدمين في منصة إدارة المدينة الذكية وقدم:

1. تحليل سلوك المستخدمين:
   - أنماط الاستخدام اليومية والأسبوعية
   - أكثر الميزات استخداماً
   - مسارات التنقل الشائعة
   - متوسط مدة الجلسة والإجراءات

2. الميزات الأكثر شعبية:
   - ترتيب الميزات حسب الاستخدام
   - معدل التفاعل لكل ميزة
   - الميزات الناشئة في الشعبية

3. مؤشرات مغادرة المستخدمين (Churn):
   - المستخدمون المعرضون للخطر
   - أسباب المغادرة المحتملة
   - نقاط الاحتكاك في التجربة
   - إجراءات الاحتفاظ المقترحة

4. توصيات مخصصة:
   - تحسينات UX مقترحة
   - ميزات جديدة موصى بها
   - استراتيجيات زيادة التفاعل

5. شرائح المستخدمين:
   - تصنيف المستخدمين حسب السلوك
   - احتياجات كل شريحة`,
        response_json_schema: {
          type: "object",
          properties: {
            behavior_summary: {
              type: "object",
              properties: {
                total_users: { type: "number" },
                active_users: { type: "number" },
                avg_session_duration: { type: "string" },
                avg_actions_per_session: { type: "number" },
                retention_rate: { type: "number" },
                churn_rate: { type: "number" }
              }
            },
            usage_patterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pattern: { type: "string" },
                  frequency: { type: "string" },
                  user_percentage: { type: "number" }
                }
              }
            },
            popular_features: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  feature: { type: "string" },
                  usage_count: { type: "number" },
                  engagement_rate: { type: "number" },
                  trend: { type: "string" },
                  satisfaction_score: { type: "number" }
                }
              }
            },
            churn_indicators: {
              type: "object",
              properties: {
                at_risk_users: { type: "number" },
                risk_factors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      factor: { type: "string" },
                      impact: { type: "string" },
                      affected_users: { type: "number" }
                    }
                  }
                },
                friction_points: { type: "array", items: { type: "string" } },
                retention_actions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      action: { type: "string" },
                      priority: { type: "string" },
                      expected_impact: { type: "string" }
                    }
                  }
                }
              }
            },
            personalized_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  recommendation: { type: "string" },
                  category: { type: "string" },
                  impact: { type: "string" },
                  effort: { type: "string" }
                }
              }
            },
            user_segments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  segment_name: { type: "string" },
                  size: { type: "number" },
                  characteristics: { type: "array", items: { type: "string" } },
                  primary_needs: { type: "array", items: { type: "string" } },
                  engagement_level: { type: "string" }
                }
              }
            },
            ai_insights: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setAnalytics(data);
      toast.success('تم تحليل سلوك المستخدمين بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ في التحليل');
    }
  });

  useEffect(() => {
    analyzeUserBehaviorMutation.mutate();
  }, []);

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Activity className="w-4 h-4 text-slate-400" />;
  };

  const getEngagementColor = (level) => {
    switch (level) {
      case 'high': return 'green';
      case 'medium': return 'amber';
      case 'low': return 'red';
      default: return 'slate';
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
            className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20"
          >
            <Users className="w-6 h-6 text-purple-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold text-lg">تحليلات سلوك المستخدمين AI</h4>
            <p className="text-slate-400 text-xs">التتبع • الشعبية • المغادرة • التوصيات</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-slate-800/50 rounded-lg p-1">
            {['7d', '30d', '90d'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded text-xs ${
                  timeRange === range ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {range === '7d' ? '7 أيام' : range === '30d' ? '30 يوم' : '90 يوم'}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            className="border-purple-500/50"
            onClick={() => analyzeUserBehaviorMutation.mutate()}
            disabled={analyzeUserBehaviorMutation.isPending}
          >
            {analyzeUserBehaviorMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><RefreshCw className="w-4 h-4 ml-1" /> تحديث</>
            )}
          </Button>
        </div>
      </div>

      {analyzeUserBehaviorMutation.isPending && !analytics && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-10 h-10 text-purple-400 mx-auto mb-4 animate-spin" />
            <p className="text-white">جاري تحليل سلوك المستخدمين...</p>
          </CardContent>
        </Card>
      )}

      {analytics && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-3 text-center">
                <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{analytics.behavior_summary?.total_users?.toLocaleString()}</p>
                <p className="text-slate-400 text-xs">إجمالي المستخدمين</p>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-3 text-center">
                <UserPlus className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{analytics.behavior_summary?.active_users?.toLocaleString()}</p>
                <p className="text-slate-400 text-xs">مستخدم نشط</p>
              </CardContent>
            </Card>
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardContent className="p-3 text-center">
                <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{analytics.behavior_summary?.avg_session_duration}</p>
                <p className="text-slate-400 text-xs">متوسط الجلسة</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-3 text-center">
                <MousePointer className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{analytics.behavior_summary?.avg_actions_per_session}</p>
                <p className="text-slate-400 text-xs">إجراء/جلسة</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="p-3 text-center">
                <Heart className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{analytics.behavior_summary?.retention_rate}%</p>
                <p className="text-slate-400 text-xs">معدل الاحتفاظ</p>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-3 text-center">
                <UserMinus className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{analytics.behavior_summary?.churn_rate}%</p>
                <p className="text-slate-400 text-xs">معدل المغادرة</p>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Chart */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                نشاط المستخدمين الأسبوعي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementData}>
                    <defs>
                      <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
                    <Area type="monotone" dataKey="sessions" stroke="#a855f7" fill="url(#sessionsGradient)" strokeWidth={2} name="الجلسات" />
                    <Area type="monotone" dataKey="duration" stroke="#22d3ee" fill="transparent" strokeWidth={2} name="المدة (دقيقة)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500/20">
                <Eye className="w-3 h-3 ml-1" />
                نظرة عامة
              </TabsTrigger>
              <TabsTrigger value="features" className="data-[state=active]:bg-cyan-500/20">
                <Star className="w-3 h-3 ml-1" />
                الميزات
              </TabsTrigger>
              <TabsTrigger value="churn" className="data-[state=active]:bg-red-500/20">
                <AlertTriangle className="w-3 h-3 ml-1" />
                المغادرة
              </TabsTrigger>
              <TabsTrigger value="segments" className="data-[state=active]:bg-green-500/20">
                <Users className="w-3 h-3 ml-1" />
                الشرائح
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-amber-500/20">
                <Sparkles className="w-3 h-3 ml-1" />
                التوصيات
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">أنماط الاستخدام</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-3">
                        {analytics.usage_patterns?.map((pattern, i) => (
                          <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium">{pattern.pattern}</span>
                              <Badge className="bg-purple-500/20 text-purple-400">{pattern.frequency}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={pattern.user_percentage} className="h-2 flex-1" />
                              <span className="text-slate-400 text-xs">{pattern.user_percentage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="bg-cyan-500/10 border-cyan-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Brain className="w-4 h-4 text-cyan-400" />
                      رؤى AI
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {analytics.ai_insights?.map((insight, i) => (
                          <div key={i} className="flex items-start gap-2 p-2 bg-slate-900/50 rounded">
                            <Zap className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-300 text-sm">{insight}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Popular Features Tab */}
            <TabsContent value="features" className="mt-4">
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    الميزات الأكثر شعبية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {analytics.popular_features?.map((feature, i) => (
                        <div key={i} className="p-4 bg-slate-900/50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                                {i + 1}
                              </div>
                              <span className="text-white font-medium">{feature.feature}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(feature.trend)}
                              <Badge className={`text-xs ${
                                feature.trend === 'up' ? 'bg-green-500/20 text-green-400' :
                                feature.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                                'bg-slate-600 text-slate-300'
                              }`}>
                                {feature.trend === 'up' ? 'صاعد' : feature.trend === 'down' ? 'هابط' : 'مستقر'}
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-white font-bold">{feature.usage_count?.toLocaleString()}</p>
                              <p className="text-slate-400 text-xs">استخدام</p>
                            </div>
                            <div>
                              <p className="text-white font-bold">{feature.engagement_rate}%</p>
                              <p className="text-slate-400 text-xs">تفاعل</p>
                            </div>
                            <div>
                              <p className="text-white font-bold">{feature.satisfaction_score}/5</p>
                              <p className="text-slate-400 text-xs">رضا</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Churn Tab */}
            <TabsContent value="churn" className="mt-4 space-y-4">
              {/* At Risk Alert */}
              <Card className="bg-red-500/10 border-red-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-red-500/20">
                      <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                    <div>
                      <p className="text-red-400 font-bold text-lg">
                        {analytics.churn_indicators?.at_risk_users} مستخدم معرض للخطر
                      </p>
                      <p className="text-slate-300 text-sm">يحتاجون إلى تدخل فوري للاحتفاظ بهم</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Risk Factors */}
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">عوامل الخطر</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-3">
                        {analytics.churn_indicators?.risk_factors?.map((factor, i) => (
                          <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium">{factor.factor}</span>
                              <Badge className={`text-xs ${
                                factor.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                                factor.impact === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>{factor.impact}</Badge>
                            </div>
                            <p className="text-slate-400 text-xs">{factor.affected_users} مستخدم متأثر</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Retention Actions */}
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Heart className="w-4 h-4 text-green-400" />
                      إجراءات الاحتفاظ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-3">
                        {analytics.churn_indicators?.retention_actions?.map((action, i) => (
                          <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium">{action.action}</span>
                              <Badge className={`text-xs ${
                                action.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                action.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>{action.priority}</Badge>
                            </div>
                            <p className="text-green-400 text-xs">التأثير المتوقع: {action.expected_impact}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Friction Points */}
              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">نقاط الاحتكاك</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analytics.churn_indicators?.friction_points?.map((point, i) => (
                      <Badge key={i} variant="outline" className="border-amber-500/50 text-amber-400">
                        {point}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* User Segments Tab */}
            <TabsContent value="segments" className="mt-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.user_segments?.map((segment, i) => (
                  <Card key={i} className={`bg-${getEngagementColor(segment.engagement_level)}-500/10 border-${getEngagementColor(segment.engagement_level)}-500/30`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-white font-bold">{segment.segment_name}</h5>
                        <Badge className={`bg-${getEngagementColor(segment.engagement_level)}-500/20 text-${getEngagementColor(segment.engagement_level)}-400`}>
                          {segment.size.toLocaleString()} مستخدم
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <p className="text-slate-400 text-xs mb-1">الخصائص:</p>
                        <div className="flex flex-wrap gap-1">
                          {segment.characteristics?.map((char, j) => (
                            <Badge key={j} variant="outline" className="text-xs border-slate-600">{char}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs mb-1">الاحتياجات:</p>
                        <ul className="space-y-1">
                          {segment.primary_needs?.map((need, j) => (
                            <li key={j} className="text-slate-300 text-xs flex items-center gap-1">
                              <ArrowRight className="w-3 h-3 text-cyan-400" />
                              {need}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="mt-4">
              <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    توصيات AI المخصصة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {analytics.personalized_recommendations?.map((rec, i) => (
                        <div key={i} className="p-4 bg-slate-900/50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-white font-medium">{rec.recommendation}</span>
                            <Badge variant="outline" className="border-purple-500/50 text-purple-400 text-xs">
                              {rec.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className={`${
                              rec.impact === 'high' ? 'text-green-400' :
                              rec.impact === 'medium' ? 'text-amber-400' :
                              'text-slate-400'
                            }`}>
                              التأثير: {rec.impact}
                            </span>
                            <span className={`${
                              rec.effort === 'low' ? 'text-green-400' :
                              rec.effort === 'medium' ? 'text-amber-400' :
                              'text-red-400'
                            }`}>
                              الجهد: {rec.effort}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}