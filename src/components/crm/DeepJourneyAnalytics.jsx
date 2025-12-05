import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Map, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Zap,
  Brain, Eye, ArrowRight, Clock, Users, Phone, Mail, MessageSquare,
  Loader2, RefreshCw, Sparkles, GitBranch, XCircle, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const channelIcons = {
  phone: Phone,
  email: Mail,
  chat: MessageSquare,
  web: Eye,
};

export default function DeepJourneyAnalytics({ customerId, customerData }) {
  const [journeyAnalysis, setJourneyAnalysis] = useState(null);

  const analyzeJourneyMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل عميق لرحلة العميل مع التركيز على:

معلومات العميل:
${JSON.stringify(customerData, null, 2)}

قدم تحليلاً شاملاً يشمل:

1. نقاط الانقطاع (Drop-off Points):
   - أين يتوقف العملاء في الرحلة
   - أسباب الانقطاع
   - تأثير كل نقطة انقطاع
   - حلول مقترحة

2. نقاط الاتصال المستقبلية:
   - التنبؤ بالتفاعلات القادمة
   - القناة المتوقعة
   - الموضوع المتوقع
   - التوقيت الأمثل للتواصل

3. رؤى استباقية:
   - فرص تحسين التجربة
   - تحذيرات مبكرة
   - توصيات مخصصة
   - إجراءات فورية

4. تحليل متعدد القنوات:
   - أداء كل قناة
   - تفضيلات العميل
   - نقاط الاحتكاك`,
        response_json_schema: {
          type: "object",
          properties: {
            journey_health_score: { type: "number" },
            dropoff_points: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  stage: { type: "string" },
                  dropoff_rate: { type: "number" },
                  primary_reason: { type: "string" },
                  impact: { type: "string" },
                  suggested_solution: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            predicted_touchpoints: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  predicted_date: { type: "string" },
                  channel: { type: "string" },
                  topic: { type: "string" },
                  probability: { type: "number" },
                  recommended_action: { type: "string" },
                  preparation_tips: { type: "array", items: { type: "string" } }
                }
              }
            },
            proactive_insights: {
              type: "object",
              properties: {
                opportunities: { type: "array", items: { type: "string" } },
                warnings: { type: "array", items: { type: "string" } },
                recommendations: { type: "array", items: { type: "string" } },
                immediate_actions: { type: "array", items: { type: "string" } }
              }
            },
            channel_analysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  channel: { type: "string" },
                  usage_percentage: { type: "number" },
                  satisfaction_score: { type: "number" },
                  friction_points: { type: "array", items: { type: "string" } },
                  optimization_tips: { type: "array", items: { type: "string" } }
                }
              }
            },
            journey_stages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  status: { type: "string" },
                  completion: { type: "number" },
                  time_spent: { type: "string" },
                  sentiment: { type: "string" }
                }
              }
            },
            next_best_experience: { type: "string" }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setJourneyAnalysis(data);
      toast.success('تم تحليل رحلة العميل');
    },
    onError: () => {
      toast.error('حدث خطأ في التحليل');
    }
  });

  const getPriorityColor = (priority) => {
    if (priority === 'high' || priority === 'critical') return 'red';
    if (priority === 'medium') return 'amber';
    return 'green';
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment === 'positive') return 'green';
    if (sentiment === 'negative') return 'red';
    return 'amber';
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={analyzeJourneyMutation.isPending ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: analyzeJourneyMutation.isPending ? Infinity : 0 }}
            className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
          >
            <Map className="w-5 h-5 text-cyan-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">تحليل رحلة العميل العميق</h4>
            <p className="text-slate-400 text-xs">نقاط الانقطاع • التنبؤات • رؤى استباقية</p>
          </div>
        </div>
        <Button
          className="bg-cyan-600 hover:bg-cyan-700"
          onClick={() => analyzeJourneyMutation.mutate()}
          disabled={analyzeJourneyMutation.isPending}
        >
          {analyzeJourneyMutation.isPending ? (
            <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري التحليل...</>
          ) : (
            <><Brain className="w-4 h-4 ml-2" /> تحليل الرحلة</>
          )}
        </Button>
      </div>

      {analyzeJourneyMutation.isPending && !journeyAnalysis && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-10 h-10 text-cyan-400 mx-auto mb-4 animate-spin" />
            <p className="text-white font-medium">جاري تحليل رحلة العميل...</p>
            <p className="text-slate-400 text-sm">تحليل نقاط الاتصال والتنبؤ بالسلوك</p>
          </CardContent>
        </Card>
      )}

      {journeyAnalysis && (
        <div className="space-y-4">
          {/* Health Score */}
          <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">صحة رحلة العميل</p>
                  <p className="text-4xl font-bold text-white mt-1">
                    {journeyAnalysis.journey_health_score || 0}%
                  </p>
                </div>
                <div className={`p-4 rounded-full ${
                  (journeyAnalysis.journey_health_score || 0) >= 70 
                    ? 'bg-green-500/20' 
                    : (journeyAnalysis.journey_health_score || 0) >= 50 
                    ? 'bg-amber-500/20' 
                    : 'bg-red-500/20'
                }`}>
                  <Activity className={`w-8 h-8 ${
                    (journeyAnalysis.journey_health_score || 0) >= 70 
                      ? 'text-green-400' 
                      : (journeyAnalysis.journey_health_score || 0) >= 50 
                      ? 'text-amber-400' 
                      : 'text-red-400'
                  }`} />
                </div>
              </div>
              <Progress value={journeyAnalysis.journey_health_score || 0} className="mt-3 h-2" />
            </CardContent>
          </Card>

          {/* Journey Stages */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-purple-400" />
                مراحل الرحلة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {journeyAnalysis.journey_stages?.map((stage, i) => (
                  <React.Fragment key={i}>
                    <div className={`flex-shrink-0 p-3 rounded-lg border min-w-[140px] ${
                      stage.status === 'completed' ? 'bg-green-500/10 border-green-500/30' :
                      stage.status === 'current' ? 'bg-cyan-500/10 border-cyan-500/30' :
                      'bg-slate-900/50 border-slate-700'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm font-medium">{stage.name}</span>
                        {stage.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-400" />}
                      </div>
                      <Progress value={stage.completion} className="h-1 mb-1" />
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">{stage.time_spent}</span>
                        <Badge className={`bg-${getSentimentColor(stage.sentiment)}-500/20 text-${getSentimentColor(stage.sentiment)}-400 text-xs`}>
                          {stage.sentiment}
                        </Badge>
                      </div>
                    </div>
                    {i < (journeyAnalysis.journey_stages?.length || 0) - 1 && (
                      <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="dropoffs">
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
              <TabsTrigger value="dropoffs" className="data-[state=active]:bg-red-500/20 text-xs">
                <XCircle className="w-3 h-3 ml-1" />
                نقاط الانقطاع
              </TabsTrigger>
              <TabsTrigger value="predictions" className="data-[state=active]:bg-purple-500/20 text-xs">
                <Eye className="w-3 h-3 ml-1" />
                التنبؤات
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-green-500/20 text-xs">
                <Sparkles className="w-3 h-3 ml-1" />
                رؤى استباقية
              </TabsTrigger>
              <TabsTrigger value="channels" className="data-[state=active]:bg-cyan-500/20 text-xs">
                <Activity className="w-3 h-3 ml-1" />
                تحليل القنوات
              </TabsTrigger>
            </TabsList>

            {/* Drop-off Points */}
            <TabsContent value="dropoffs" className="mt-4">
              <Card className="bg-red-500/10 border-red-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    نقاط الانقطاع الرئيسية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px]">
                    <div className="space-y-3">
                      {journeyAnalysis.dropoff_points?.map((point, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-3 bg-slate-900/50 rounded-lg border border-red-500/20"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <span className="text-white font-medium">{point.stage}</span>
                              <p className="text-slate-400 text-xs mt-1">{point.primary_reason}</p>
                            </div>
                            <div className="text-left">
                              <Badge className={`bg-${getPriorityColor(point.priority)}-500/20 text-${getPriorityColor(point.priority)}-400`}>
                                {point.dropoff_rate}% انقطاع
                              </Badge>
                            </div>
                          </div>
                          <div className="p-2 bg-green-500/10 rounded mt-2">
                            <p className="text-green-400 text-xs font-medium">الحل المقترح:</p>
                            <p className="text-slate-300 text-sm">{point.suggested_solution}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Predicted Touchpoints */}
            <TabsContent value="predictions" className="mt-4">
              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Eye className="w-4 h-4 text-purple-400" />
                    نقاط الاتصال المتوقعة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px]">
                    <div className="space-y-3">
                      {journeyAnalysis.predicted_touchpoints?.map((touchpoint, i) => {
                        const ChannelIcon = channelIcons[touchpoint.channel] || Phone;
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-3 bg-slate-900/50 rounded-lg border border-purple-500/20"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <ChannelIcon className="w-4 h-4 text-purple-400" />
                                <div>
                                  <span className="text-white font-medium">{touchpoint.topic}</span>
                                  <p className="text-slate-400 text-xs">{touchpoint.predicted_date}</p>
                                </div>
                              </div>
                              <Badge className="bg-purple-500/20 text-purple-400">
                                {touchpoint.probability}% احتمال
                              </Badge>
                            </div>
                            <p className="text-cyan-400 text-sm mb-2">💡 {touchpoint.recommended_action}</p>
                            {touchpoint.preparation_tips?.length > 0 && (
                              <div className="space-y-1">
                                {touchpoint.preparation_tips.map((tip, j) => (
                                  <p key={j} className="text-slate-400 text-xs flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-green-400" />
                                    {tip}
                                  </p>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Proactive Insights */}
            <TabsContent value="insights" className="mt-4 space-y-4">
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Opportunities */}
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      الفرص
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {journeyAnalysis.proactive_insights?.opportunities?.map((opp, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <Sparkles className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                          <span className="text-slate-300">{opp}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Warnings */}
                <Card className="bg-amber-500/10 border-amber-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      التحذيرات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {journeyAnalysis.proactive_insights?.warnings?.map((warn, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="w-3 h-3 text-amber-400 mt-1 flex-shrink-0" />
                          <span className="text-slate-300">{warn}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Immediate Actions */}
              <Card className="bg-cyan-500/10 border-cyan-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    إجراءات فورية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-2">
                    {journeyAnalysis.proactive_insights?.immediate_actions?.map((action, i) => (
                      <div key={i} className="p-2 bg-slate-900/50 rounded flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span className="text-slate-300 text-sm">{action}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Next Best Experience */}
              {journeyAnalysis.next_best_experience && (
                <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      <span className="text-purple-400 font-medium">أفضل تجربة تالية</span>
                    </div>
                    <p className="text-white">{journeyAnalysis.next_best_experience}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Channel Analysis */}
            <TabsContent value="channels" className="mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                {journeyAnalysis.channel_analysis?.map((channel, i) => {
                  const ChannelIcon = channelIcons[channel.channel] || Phone;
                  return (
                    <Card key={i} className="bg-slate-800/30 border-slate-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <ChannelIcon className="w-5 h-5 text-cyan-400" />
                            <span className="text-white font-medium capitalize">{channel.channel}</span>
                          </div>
                          <Badge className="bg-cyan-500/20 text-cyan-400">
                            {channel.usage_percentage}%
                          </Badge>
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">رضا القناة</span>
                            <span className="text-white">{channel.satisfaction_score}%</span>
                          </div>
                          <Progress value={channel.satisfaction_score} className="h-2" />
                        </div>
                        {channel.friction_points?.length > 0 && (
                          <div className="mb-2">
                            <p className="text-red-400 text-xs mb-1">نقاط الاحتكاك:</p>
                            {channel.friction_points.map((point, j) => (
                              <p key={j} className="text-slate-400 text-xs">• {point}</p>
                            ))}
                          </div>
                        )}
                        {channel.optimization_tips?.length > 0 && (
                          <div>
                            <p className="text-green-400 text-xs mb-1">تحسينات:</p>
                            {channel.optimization_tips.map((tip, j) => (
                              <p key={j} className="text-slate-400 text-xs">✓ {tip}</p>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}