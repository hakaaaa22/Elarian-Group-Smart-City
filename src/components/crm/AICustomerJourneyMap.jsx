import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  MapPin, Phone, MessageCircle, Mail, ShoppingCart, AlertTriangle,
  Brain, Sparkles, Loader2, TrendingUp, TrendingDown, ChevronRight,
  Star, Clock, Target, Eye, Heart, UserMinus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import JourneySimulation from './JourneySimulation';

const channelIcons = {
  call: Phone,
  chat: MessageCircle,
  email: Mail,
  whatsapp: MessageCircle,
  purchase: ShoppingCart,
  complaint: AlertTriangle,
  feedback: Star
};

const stageColors = {
  awareness: 'cyan',
  consideration: 'purple',
  decision: 'amber',
  retention: 'green',
  advocacy: 'pink'
};

export default function AICustomerJourneyMap({ customerId, customerName }) {
  const [journeyData, setJourneyData] = useState(null);

  const analyzeJourneyMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل رحلة العميل "${customerName || 'أحمد محمد'}" عبر جميع قنوات التواصل:

أنشئ خريطة رحلة شاملة تتضمن:
1. نقاط التماس الرئيسية (Touchpoints) مع التواريخ والقنوات
2. المشاعر في كل مرحلة
3. التنبؤات المستقبلية (احتمالية الشراء، خطر المغادرة)
4. رؤى AI في كل مرحلة
5. توصيات للإجراءات القادمة`,
        response_json_schema: {
          type: "object",
          properties: {
            customer_profile: {
              type: "object",
              properties: {
                name: { type: "string" },
                segment: { type: "string" },
                lifetime_value: { type: "number" },
                relationship_duration: { type: "string" }
              }
            },
            current_stage: { type: "string" },
            journey_health_score: { type: "number" },
            touchpoints: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  date: { type: "string" },
                  channel: { type: "string" },
                  stage: { type: "string" },
                  action: { type: "string" },
                  sentiment: { type: "string" },
                  sentiment_score: { type: "number" },
                  ai_insight: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            predictions: {
              type: "object",
              properties: {
                purchase_likelihood: { type: "number" },
                churn_risk: { type: "number" },
                upsell_potential: { type: "number" },
                next_action_prediction: { type: "string" },
                predicted_ltv_change: { type: "number" }
              }
            },
            stage_insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  stage: { type: "string" },
                  status: { type: "string" },
                  key_events: { type: "array", items: { type: "string" } },
                  recommendation: { type: "string" }
                }
              }
            },
            next_best_actions: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setJourneyData(data);
      toast.success('تم تحليل رحلة العميل');
    }
  });

  const getSentimentColor = (sentiment) => {
    if (sentiment === 'positive') return 'green';
    if (sentiment === 'negative') return 'red';
    return 'amber';
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
            <MapPin className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-white font-bold">خريطة رحلة العميل</h4>
            <p className="text-slate-400 text-xs">AI Customer Journey Mapping</p>
          </div>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => analyzeJourneyMutation.mutate()}
          disabled={analyzeJourneyMutation.isPending}
        >
          {analyzeJourneyMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <><Brain className="w-4 h-4 ml-2" /> تحليل الرحلة</>
          )}
        </Button>
      </div>

      {journeyData && (
        <div className="space-y-4">
          {/* Customer Profile & Predictions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="bg-indigo-500/10 border-indigo-500/30">
              <CardContent className="p-3 text-center">
                <ShoppingCart className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{journeyData.predictions?.purchase_likelihood}%</p>
                <p className="text-slate-400 text-xs">احتمالية الشراء</p>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-3 text-center">
                <UserMinus className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{journeyData.predictions?.churn_risk}%</p>
                <p className="text-slate-400 text-xs">خطر المغادرة</p>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-3 text-center">
                <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{journeyData.predictions?.upsell_potential}%</p>
                <p className="text-slate-400 text-xs">إمكانية الترقية</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-3 text-center">
                <Heart className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{journeyData.journey_health_score}%</p>
                <p className="text-slate-400 text-xs">صحة الرحلة</p>
              </CardContent>
            </Card>
          </div>

          {/* Journey Stages */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">مراحل الرحلة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                {['awareness', 'consideration', 'decision', 'retention', 'advocacy'].map((stage, i) => {
                  const isActive = journeyData.current_stage === stage;
                  const stageInfo = journeyData.stage_insights?.find(s => s.stage === stage);
                  return (
                    <React.Fragment key={stage}>
                      <div className={`flex flex-col items-center ${isActive ? 'scale-110' : 'opacity-60'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isActive ? `bg-${stageColors[stage]}-500` : `bg-${stageColors[stage]}-500/30`
                        }`}>
                          <span className="text-white text-xs font-bold">{i + 1}</span>
                        </div>
                        <span className="text-white text-xs mt-1 capitalize">{stage}</span>
                        {stageInfo && (
                          <Badge className={`mt-1 text-xs ${stageInfo.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {stageInfo.status === 'completed' ? 'مكتمل' : 'جاري'}
                          </Badge>
                        )}
                      </div>
                      {i < 4 && <ChevronRight className="w-4 h-4 text-slate-500" />}
                    </React.Fragment>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Touchpoints Timeline */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                نقاط التماس
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px]">
                <div className="relative pr-4">
                  <div className="absolute right-2 top-0 bottom-0 w-0.5 bg-slate-700" />
                  {journeyData.touchpoints?.map((tp, i) => {
                    const Icon = channelIcons[tp.channel] || MessageCircle;
                    const sentimentColor = getSentimentColor(tp.sentiment);
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative pr-8 pb-4"
                      >
                        <div className={`absolute right-0 w-4 h-4 rounded-full bg-${stageColors[tp.stage]}-500 border-2 border-slate-800`} />
                        <Card className={`bg-${sentimentColor}-500/10 border-${sentimentColor}-500/30`}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 text-${sentimentColor}-400`} />
                                <span className="text-white text-sm font-medium">{tp.action}</span>
                              </div>
                              <span className="text-slate-500 text-xs">{tp.date}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`text-xs bg-${stageColors[tp.stage]}-500/20 text-${stageColors[tp.stage]}-400`}>
                                {tp.stage}
                              </Badge>
                              <Badge className={`text-xs bg-${sentimentColor}-500/20 text-${sentimentColor}-400`}>
                                {tp.sentiment === 'positive' ? 'إيجابي' : tp.sentiment === 'negative' ? 'سلبي' : 'محايد'}
                              </Badge>
                            </div>
                            {tp.ai_insight && (
                              <div className="p-2 bg-slate-900/50 rounded mt-2">
                                <p className="text-cyan-400 text-xs flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  {tp.ai_insight}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Next Best Actions */}
          <Card className="bg-green-500/10 border-green-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-green-400" />
                الإجراءات الموصى بها
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {journeyData.next_best_actions?.map((action, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-slate-900/50 rounded">
                    <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs">{i + 1}</span>
                    <span className="text-slate-300 text-sm">{action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Journey Simulation */}
      <JourneySimulation onComplete={(feedback) => toast.success(`أتممت المحاكاة بنتيجة ${feedback.overall_score}%`)} />
    </div>
  );
}