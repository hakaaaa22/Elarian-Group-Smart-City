import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  MapPin, Users, ArrowRight, AlertTriangle, TrendingUp, TrendingDown,
  Phone, Mail, MessageSquare, Facebook, Instagram, Clock, Target,
  Loader2, RefreshCw, Eye, Zap, Search, Filter, ChevronDown, ChevronUp,
  GitBranch, Activity, CheckCircle, XCircle, User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Sankey, Layer, Rectangle
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

const channelConfig = {
  voice: { icon: Phone, color: 'cyan', label: 'المكالمات' },
  email: { icon: Mail, color: 'red', label: 'البريد' },
  chat: { icon: MessageSquare, color: 'green', label: 'الدردشة' },
  facebook: { icon: Facebook, color: 'blue', label: 'فيسبوك' },
  instagram: { icon: Instagram, color: 'pink', label: 'انستجرام' },
  website: { icon: Eye, color: 'purple', label: 'الموقع' },
};

export default function DeepCustomerJourneyAnalytics() {
  const [journeyData, setJourneyData] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChannel, setFilterChannel] = useState('all');
  const [activeView, setActiveView] = useState('paths');

  // Generate journey analytics
  const generateJourneyMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بإنشاء تحليل عميق لرحلات العملاء عبر القنوات المختلفة:

قدم بيانات شاملة تتضمن:

1. المسارات الشائعة للعملاء:
   - أكثر 5 مسارات شيوعاً
   - نسبة النجاح لكل مسار
   - متوسط الوقت للإكمال

2. نقاط التحويل بين القنوات:
   - من أين وإلى أين ينتقل العملاء
   - أسباب التحويل
   - معدل النجاح بعد التحويل

3. نقاط الانقطاع الحرجة:
   - أين يتوقف العملاء؟
   - أسباب الانقطاع
   - توصيات لتحسين التجربة

4. رحلات عملاء فردية (10 عملاء):
   - تفاصيل كل تفاعل
   - المشاعر في كل نقطة
   - النتيجة النهائية

5. تحليل الأنماط:
   - سلوكيات متكررة
   - عوامل النجاح
   - مؤشرات الخطر`,
        response_json_schema: {
          type: "object",
          properties: {
            common_paths: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  path: { type: "array", items: { type: "string" } },
                  count: { type: "number" },
                  success_rate: { type: "number" },
                  avg_duration: { type: "string" },
                  satisfaction: { type: "number" }
                }
              }
            },
            channel_transitions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  from: { type: "string" },
                  to: { type: "string" },
                  count: { type: "number" },
                  reason: { type: "string" },
                  success_after: { type: "number" }
                }
              }
            },
            dropoff_points: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  channel: { type: "string" },
                  stage: { type: "string" },
                  dropoff_rate: { type: "number" },
                  reasons: { type: "array", items: { type: "string" } },
                  recommendations: { type: "array", items: { type: "string" } }
                }
              }
            },
            individual_journeys: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  customer_id: { type: "string" },
                  customer_name: { type: "string" },
                  journey_type: { type: "string" },
                  status: { type: "string" },
                  touchpoints: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        channel: { type: "string" },
                        action: { type: "string" },
                        timestamp: { type: "string" },
                        sentiment: { type: "string" },
                        duration: { type: "string" },
                        outcome: { type: "string" }
                      }
                    }
                  },
                  total_duration: { type: "string" },
                  final_outcome: { type: "string" },
                  satisfaction_score: { type: "number" }
                }
              }
            },
            patterns: {
              type: "object",
              properties: {
                success_factors: { type: "array", items: { type: "string" } },
                risk_indicators: { type: "array", items: { type: "string" } },
                optimization_opportunities: { type: "array", items: { type: "string" } }
              }
            },
            metrics: {
              type: "object",
              properties: {
                avg_touchpoints: { type: "number" },
                avg_resolution_time: { type: "string" },
                cross_channel_rate: { type: "number" },
                first_contact_resolution: { type: "number" }
              }
            }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setJourneyData(data);
      toast.success('تم تحليل رحلات العملاء');
    },
    onError: () => {
      toast.error('حدث خطأ');
    }
  });

  useEffect(() => {
    generateJourneyMutation.mutate();
  }, []);

  const filteredJourneys = journeyData?.individual_journeys?.filter(j => {
    if (searchQuery && !j.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterChannel !== 'all') {
      const hasChannel = j.touchpoints?.some(t => t.channel === filterChannel);
      if (!hasChannel) return false;
    }
    return true;
  }) || [];

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20"
          >
            <MapPin className="w-6 h-6 text-purple-400" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-white">تحليل رحلة العميل المتعمق</h3>
            <p className="text-slate-400 text-sm">مسارات • تحويلات • نقاط انقطاع • تتبع فردي</p>
          </div>
        </div>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => generateJourneyMutation.mutate()}
          disabled={generateJourneyMutation.isPending}
        >
          {generateJourneyMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <><RefreshCw className="w-4 h-4 ml-2" /> تحديث</>
          )}
        </Button>
      </div>

      {generateJourneyMutation.isPending && !journeyData && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-10 h-10 text-purple-400 mx-auto mb-4 animate-spin" />
            <p className="text-white">جاري تحليل رحلات العملاء...</p>
          </CardContent>
        </Card>
      )}

      {journeyData && (
        <>
          {/* Metrics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-4 text-center">
                <Activity className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{journeyData.metrics?.avg_touchpoints}</p>
                <p className="text-slate-400 text-xs">متوسط نقاط التماس</p>
              </CardContent>
            </Card>
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{journeyData.metrics?.avg_resolution_time}</p>
                <p className="text-slate-400 text-xs">متوسط وقت الحل</p>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-4 text-center">
                <GitBranch className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{journeyData.metrics?.cross_channel_rate}%</p>
                <p className="text-slate-400 text-xs">معدل التنقل بين القنوات</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{journeyData.metrics?.first_contact_resolution}%</p>
                <p className="text-slate-400 text-xs">حل من أول تواصل</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
              <TabsTrigger value="paths" className="data-[state=active]:bg-purple-500/20">
                <GitBranch className="w-3 h-3 ml-1" />
                المسارات الشائعة
              </TabsTrigger>
              <TabsTrigger value="transitions" className="data-[state=active]:bg-cyan-500/20">
                <ArrowRight className="w-3 h-3 ml-1" />
                التحويلات
              </TabsTrigger>
              <TabsTrigger value="dropoffs" className="data-[state=active]:bg-red-500/20">
                <AlertTriangle className="w-3 h-3 ml-1" />
                نقاط الانقطاع
              </TabsTrigger>
              <TabsTrigger value="individual" className="data-[state=active]:bg-green-500/20">
                <User className="w-3 h-3 ml-1" />
                رحلات فردية
              </TabsTrigger>
            </TabsList>

            {/* Common Paths */}
            <TabsContent value="paths" className="mt-4">
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">أكثر المسارات شيوعاً</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {journeyData.common_paths?.map((path, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-purple-500/20 text-purple-400">#{i + 1}</Badge>
                            <span className="text-white font-medium">{path.count} عميل</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={path.success_rate >= 80 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                              نجاح: {path.success_rate}%
                            </Badge>
                            <Badge className="bg-slate-600 text-slate-300">
                              <Clock className="w-3 h-3 ml-1" />
                              {path.avg_duration}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {path.path?.map((channel, j) => {
                            const config = channelConfig[channel] || { icon: Eye, color: 'slate', label: channel };
                            const Icon = config.icon;
                            return (
                              <React.Fragment key={j}>
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full bg-${config.color}-500/20 border border-${config.color}-500/30`}>
                                  <Icon className={`w-4 h-4 text-${config.color}-400`} />
                                  <span className={`text-${config.color}-400 text-sm`}>{config.label}</span>
                                </div>
                                {j < path.path.length - 1 && <ArrowRight className="w-4 h-4 text-slate-500" />}
                              </React.Fragment>
                            );
                          })}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <Progress value={path.satisfaction} className="flex-1 h-2 ml-4" />
                          <span className="text-slate-400 text-sm">رضا: {path.satisfaction}%</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Channel Transitions */}
            <TabsContent value="transitions" className="mt-4">
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">تحويلات القنوات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {journeyData.channel_transitions?.map((trans, i) => {
                      const fromConfig = channelConfig[trans.from] || { icon: Eye, color: 'slate', label: trans.from };
                      const toConfig = channelConfig[trans.to] || { icon: Eye, color: 'slate', label: trans.to };
                      const FromIcon = fromConfig.icon;
                      const ToIcon = toConfig.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-lg bg-${fromConfig.color}-500/20`}>
                                <FromIcon className={`w-4 h-4 text-${fromConfig.color}-400`} />
                              </div>
                              <ArrowRight className="w-4 h-4 text-slate-500" />
                              <div className={`p-2 rounded-lg bg-${toConfig.color}-500/20`}>
                                <ToIcon className={`w-4 h-4 text-${toConfig.color}-400`} />
                              </div>
                            </div>
                            <Badge className="bg-purple-500/20 text-purple-400">{trans.count}</Badge>
                          </div>
                          <p className="text-slate-400 text-sm mb-2">{trans.reason}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 text-xs">نجاح بعد التحويل</span>
                            <Badge className={trans.success_after >= 80 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                              {trans.success_after}%
                            </Badge>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Dropoff Points */}
            <TabsContent value="dropoffs" className="mt-4">
              <Card className="bg-red-500/10 border-red-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    نقاط الانقطاع الحرجة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {journeyData.dropoff_points?.map((point, i) => {
                      const config = channelConfig[point.channel] || { icon: Eye, color: 'slate', label: point.channel };
                      const Icon = config.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-4 bg-slate-900/50 rounded-lg border border-red-500/30"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-5 h-5 text-${config.color}-400`} />
                              <span className="text-white font-medium">{config.label}</span>
                              <Badge className="bg-slate-600 text-slate-300">{point.stage}</Badge>
                            </div>
                            <Badge className="bg-red-500/20 text-red-400">
                              انقطاع: {point.dropoff_rate}%
                            </Badge>
                          </div>
                          <div className="mb-3">
                            <p className="text-slate-400 text-xs mb-1">الأسباب:</p>
                            <div className="flex flex-wrap gap-1">
                              {point.reasons?.map((r, j) => (
                                <Badge key={j} className="bg-slate-700 text-slate-300 text-[10px]">{r}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-green-400 text-xs mb-1">التوصيات:</p>
                            <ul className="space-y-1">
                              {point.recommendations?.map((r, j) => (
                                <li key={j} className="text-slate-300 text-sm flex items-start gap-1">
                                  <CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                                  {r}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Individual Journeys */}
            <TabsContent value="individual" className="mt-4 space-y-4">
              {/* Search & Filter */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن عميل..."
                    className="bg-slate-800/50 border-slate-700 text-white pr-10"
                  />
                </div>
                <Select value={filterChannel} onValueChange={setFilterChannel}>
                  <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">جميع القنوات</SelectItem>
                    {Object.entries(channelConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Journey List */}
              <div className="grid lg:grid-cols-2 gap-4">
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">العملاء ({filteredJourneys.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {filteredJourneys.map((journey, i) => (
                          <div
                            key={i}
                            onClick={() => setSelectedCustomer(journey)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedCustomer?.customer_id === journey.customer_id
                                ? 'bg-purple-500/20 border-purple-500/50'
                                : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                                  {journey.customer_name?.[0]}
                                </div>
                                <div>
                                  <p className="text-white text-sm font-medium">{journey.customer_name}</p>
                                  <p className="text-slate-400 text-xs">{journey.journey_type}</p>
                                </div>
                              </div>
                              <Badge className={
                                journey.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                                journey.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-red-500/20 text-red-400'
                              }>
                                {journey.status === 'resolved' ? 'محلول' : journey.status === 'pending' ? 'معلق' : 'مغلق'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              {journey.touchpoints?.slice(0, 4).map((tp, j) => {
                                const config = channelConfig[tp.channel] || { icon: Eye, color: 'slate' };
                                const Icon = config.icon;
                                return (
                                  <div key={j} className={`w-6 h-6 rounded-full bg-${config.color}-500/20 flex items-center justify-center`}>
                                    <Icon className={`w-3 h-3 text-${config.color}-400`} />
                                  </div>
                                );
                              })}
                              {journey.touchpoints?.length > 4 && (
                                <span className="text-slate-400 text-xs">+{journey.touchpoints.length - 4}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Journey Details */}
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">تفاصيل الرحلة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCustomer ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{selectedCustomer.customer_name}</p>
                            <p className="text-slate-400 text-xs">{selectedCustomer.total_duration}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-2xl font-bold text-white">{selectedCustomer.satisfaction_score}%</p>
                            <p className="text-slate-400 text-xs">رضا</p>
                          </div>
                        </div>

                        <ScrollArea className="h-[280px]">
                          <div className="space-y-3">
                            {selectedCustomer.touchpoints?.map((tp, i) => {
                              const config = channelConfig[tp.channel] || { icon: Eye, color: 'slate', label: tp.channel };
                              const Icon = config.icon;
                              return (
                                <div key={i} className="relative pr-6">
                                  <div className={`absolute right-0 top-0 w-4 h-4 rounded-full bg-${config.color}-500/20 border-2 border-${config.color}-500`} />
                                  {i < selectedCustomer.touchpoints.length - 1 && (
                                    <div className="absolute right-[7px] top-4 w-0.5 h-full bg-slate-700" />
                                  )}
                                  <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center gap-2">
                                        <Icon className={`w-4 h-4 text-${config.color}-400`} />
                                        <span className="text-white text-sm">{config.label}</span>
                                      </div>
                                      <span className="text-slate-500 text-xs">{tp.timestamp}</span>
                                    </div>
                                    <p className="text-slate-300 text-sm">{tp.action}</p>
                                    <div className="flex items-center justify-between mt-2">
                                      <Badge className={
                                        tp.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                                        tp.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                                        'bg-amber-500/20 text-amber-400'
                                      }>
                                        {tp.sentiment === 'positive' ? 'إيجابي' : tp.sentiment === 'negative' ? 'سلبي' : 'محايد'}
                                      </Badge>
                                      <span className="text-slate-400 text-xs">{tp.duration}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>

                        <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                          <p className="text-green-400 text-sm font-medium">النتيجة النهائية</p>
                          <p className="text-white">{selectedCustomer.final_outcome}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-[400px] flex items-center justify-center">
                        <p className="text-slate-400">اختر عميلاً لعرض تفاصيل رحلته</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Patterns & Insights */}
          <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                الأنماط والرؤى
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-green-400 text-sm font-medium mb-2">عوامل النجاح</p>
                  <ul className="space-y-1">
                    {journeyData.patterns?.success_factors?.map((f, i) => (
                      <li key={i} className="text-slate-300 text-sm flex items-start gap-1">
                        <CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-red-400 text-sm font-medium mb-2">مؤشرات الخطر</p>
                  <ul className="space-y-1">
                    {journeyData.patterns?.risk_indicators?.map((r, i) => (
                      <li key={i} className="text-slate-300 text-sm flex items-start gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-400 mt-1 flex-shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-amber-400 text-sm font-medium mb-2">فرص التحسين</p>
                  <ul className="space-y-1">
                    {journeyData.patterns?.optimization_opportunities?.map((o, i) => (
                      <li key={i} className="text-slate-300 text-sm flex items-start gap-1">
                        <Target className="w-3 h-3 text-amber-400 mt-1 flex-shrink-0" />
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}