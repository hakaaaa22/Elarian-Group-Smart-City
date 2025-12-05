import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Globe, Phone, Mail, MessageSquare, Facebook, Instagram, Twitter,
  TrendingUp, TrendingDown, Users, Brain, BarChart3, Activity, Clock,
  Target, Zap, Eye, Loader2, RefreshCw, ArrowRight, CheckCircle,
  AlertTriangle, Star, Heart, GitBranch, MapPin
} from 'lucide-react';
import DeepCustomerJourneyAnalytics from './DeepCustomerJourneyAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Sankey
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

const channelConfig = {
  voice: { icon: Phone, color: 'cyan', label: 'المكالمات' },
  email: { icon: Mail, color: 'red', label: 'البريد' },
  chat: { icon: MessageSquare, color: 'green', label: 'الدردشة' },
  facebook: { icon: Facebook, color: 'blue', label: 'فيسبوك' },
  instagram: { icon: Instagram, color: 'pink', label: 'انستجرام' },
  twitter: { icon: Twitter, color: 'sky', label: 'تويتر' },
};

export default function UnifiedOmnichannelAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState('all');

  const generateAnalyticsMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بإنشاء تحليلات شاملة موحدة لجميع قنوات التفاعل مع العملاء:

القنوات: المكالمات، البريد الإلكتروني، الدردشة، فيسبوك، انستجرام، تويتر

قدم تحليلات تشمل:

1. نظرة عامة على جميع القنوات:
   - حجم التفاعلات لكل قناة
   - معدل الرضا لكل قناة
   - متوسط وقت الاستجابة
   - معدل الحل من أول تواصل

2. تحليل رحلة العميل الموحدة:
   - المسارات الشائعة بين القنوات
   - نقاط التحويل بين القنوات
   - نقاط الانقطاع الحرجة

3. أداء الوكلاء عبر القنوات:
   - أفضل الوكلاء في كل قناة
   - مقارنة الأداء
   - فجوات المهارات

4. التنبؤات والرؤى:
   - توقعات الطلب القادم
   - اتجاهات الرضا
   - تنبيهات استباقية`,
        response_json_schema: {
          type: "object",
          properties: {
            overview: {
              type: "object",
              properties: {
                total_interactions: { type: "number" },
                avg_satisfaction: { type: "number" },
                avg_response_time: { type: "string" },
                fcr_rate: { type: "number" }
              }
            },
            channel_metrics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  channel: { type: "string" },
                  volume: { type: "number" },
                  satisfaction: { type: "number" },
                  response_time: { type: "string" },
                  fcr: { type: "number" },
                  trend: { type: "number" },
                  peak_hours: { type: "array", items: { type: "string" } }
                }
              }
            },
            journey_flows: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  from_channel: { type: "string" },
                  to_channel: { type: "string" },
                  count: { type: "number" },
                  avg_time: { type: "string" },
                  success_rate: { type: "number" }
                }
              }
            },
            agent_performance: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  channels: { type: "array", items: { type: "string" } },
                  avg_score: { type: "number" },
                  interactions: { type: "number" },
                  satisfaction: { type: "number" },
                  specialties: { type: "array", items: { type: "string" } }
                }
              }
            },
            hourly_distribution: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  hour: { type: "string" },
                  voice: { type: "number" },
                  email: { type: "number" },
                  chat: { type: "number" },
                  social: { type: "number" }
                }
              }
            },
            predictions: {
              type: "object",
              properties: {
                next_week_volume: { type: "number" },
                predicted_satisfaction: { type: "number" },
                peak_day: { type: "string" },
                alerts: { type: "array", items: { type: "string" } }
              }
            },
            insights: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setAnalytics(data);
      toast.success('تم تحديث التحليلات الموحدة');
    },
    onError: () => {
      toast.error('حدث خطأ');
    }
  });

  useEffect(() => {
    generateAnalyticsMutation.mutate();
  }, []);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
          >
            <Globe className="w-6 h-6 text-cyan-400" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-white">تحليلات Omnichannel الموحدة</h3>
            <p className="text-slate-400 text-sm">رؤية شاملة لجميع قنوات التفاعل</p>
          </div>
        </div>
        <Button
          className="bg-cyan-600 hover:bg-cyan-700"
          onClick={() => generateAnalyticsMutation.mutate()}
          disabled={generateAnalyticsMutation.isPending}
        >
          {generateAnalyticsMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <><RefreshCw className="w-4 h-4 ml-2" /> تحديث</>
          )}
        </Button>
      </div>

      {generateAnalyticsMutation.isPending && !analytics && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-10 h-10 text-cyan-400 mx-auto mb-4 animate-spin" />
            <p className="text-white">جاري تحليل البيانات من جميع القنوات...</p>
          </CardContent>
        </Card>
      )}

      {analytics && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardContent className="p-4 text-center">
                <Activity className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{analytics.overview?.total_interactions?.toLocaleString()}</p>
                <p className="text-slate-400 text-xs">إجمالي التفاعلات</p>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-4 text-center">
                <Star className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{analytics.overview?.avg_satisfaction}%</p>
                <p className="text-slate-400 text-xs">متوسط الرضا</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{analytics.overview?.avg_response_time}</p>
                <p className="text-slate-400 text-xs">متوسط الاستجابة</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{analytics.overview?.fcr_rate}%</p>
                <p className="text-slate-400 text-xs">حل من أول تواصل</p>
              </CardContent>
            </Card>
          </div>

          {/* Channel Metrics */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">أداء القنوات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">
                {analytics.channel_metrics?.map((channel, i) => {
                  const config = channelConfig[channel.channel] || { icon: MessageSquare, color: 'slate', label: channel.channel };
                  const Icon = config.icon;
                  return (
                    <div key={i} className={`p-3 rounded-lg bg-${config.color}-500/10 border border-${config.color}-500/30`}>
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-5 h-5 text-${config.color}-400`} />
                        <Badge className={channel.trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          {channel.trend > 0 ? '+' : ''}{channel.trend}%
                        </Badge>
                      </div>
                      <p className="text-white font-bold">{channel.volume?.toLocaleString()}</p>
                      <p className="text-slate-400 text-xs">{config.label}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">الرضا</span>
                          <span className="text-white">{channel.satisfaction}%</span>
                        </div>
                        <Progress value={channel.satisfaction} className="h-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Hourly Distribution */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">توزيع التفاعلات حسب الساعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.hourly_distribution || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="voice" stackId="1" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.4} name="مكالمات" />
                      <Area type="monotone" dataKey="chat" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.4} name="دردشة" />
                      <Area type="monotone" dataKey="email" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} name="بريد" />
                      <Area type="monotone" dataKey="social" stackId="1" stroke="#a855f7" fill="#a855f7" fillOpacity={0.4} name="سوشيال" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Agent Performance */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">أداء الوكلاء عبر القنوات</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {analytics.agent_performance?.slice(0, 5).map((agent, i) => (
                      <div key={i} className="p-2 bg-slate-900/50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{agent.name}</p>
                            <div className="flex gap-1">
                              {agent.channels?.map((ch, j) => {
                                const cfg = channelConfig[ch];
                                const ChIcon = cfg?.icon || MessageSquare;
                                return <ChIcon key={j} className={`w-3 h-3 text-${cfg?.color || 'slate'}-400`} />;
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-white font-bold">{agent.avg_score}%</p>
                          <p className="text-slate-400 text-xs">{agent.interactions} تفاعل</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Journey Flows Summary */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-purple-400" />
                تدفق الرحلة بين القنوات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analytics.journey_flows?.map((flow, i) => {
                  const fromCfg = channelConfig[flow.from_channel] || {};
                  const toCfg = channelConfig[flow.to_channel] || {};
                  return (
                    <div key={i} className="p-2 bg-slate-900/50 rounded-lg flex items-center gap-2">
                      <Badge className={`bg-${fromCfg.color || 'slate'}-500/20 text-${fromCfg.color || 'slate'}-400`}>
                        {fromCfg.label || flow.from_channel}
                      </Badge>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <Badge className={`bg-${toCfg.color || 'slate'}-500/20 text-${toCfg.color || 'slate'}-400`}>
                        {toCfg.label || flow.to_channel}
                      </Badge>
                      <span className="text-slate-400 text-xs">{flow.count} ({flow.success_rate}%)</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Deep Customer Journey Analysis */}
          <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                تحليل رحلة العميل المتعمق
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DeepCustomerJourneyAnalytics />
            </CardContent>
          </Card>

          {/* Predictions & Insights */}
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-400" />
                  التنبؤات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-3 bg-slate-900/50 rounded text-center">
                    <p className="text-2xl font-bold text-white">{analytics.predictions?.next_week_volume?.toLocaleString()}</p>
                    <p className="text-slate-400 text-xs">حجم الأسبوع القادم</p>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded text-center">
                    <p className="text-2xl font-bold text-white">{analytics.predictions?.predicted_satisfaction}%</p>
                    <p className="text-slate-400 text-xs">الرضا المتوقع</p>
                  </div>
                </div>
                {analytics.predictions?.alerts?.length > 0 && (
                  <div className="space-y-1">
                    {analytics.predictions.alerts.map((alert, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-amber-400">
                        <AlertTriangle className="w-3 h-3" />
                        {alert}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-green-500/10 border-green-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-green-400" />
                  الرؤى والتوصيات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px]">
                  <div className="space-y-2">
                    {analytics.insights?.map((insight, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Zap className="w-3 h-3 text-cyan-400 mt-1 flex-shrink-0" />
                        <span className="text-slate-300">{insight}</span>
                      </div>
                    ))}
                    {analytics.recommendations?.map((rec, i) => (
                      <div key={`rec-${i}`} className="flex items-start gap-2 text-sm">
                        <Target className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                        <span className="text-slate-300">{rec}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}