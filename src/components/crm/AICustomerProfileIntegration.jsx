import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, User, TrendingUp, TrendingDown, Crown, AlertTriangle, ShoppingCart,
  UserMinus, Target, Sparkles, RefreshCw, Loader2, CheckCircle, Star,
  Phone, MessageSquare, Mail, Calendar, DollarSign, History, Zap, Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import AICustomerJourneyMap from './AICustomerJourneyMap';

export default function AICustomerProfileIntegration({ customerId, customerData, onProfileUpdate }) {
  const [aiProfile, setAiProfile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeCustomerMutation = useMutation({
    mutationFn: async (data) => {
      setIsAnalyzing(true);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل شامل لملف العميل التالي وتقديم رؤى AI متقدمة:

معلومات العميل:
- الاسم: ${data.name || 'غير محدد'}
- النوع: ${data.type || 'عادي'}
- عدد التفاعلات: ${data.interactions || 0}
- آخر تواصل: ${data.lastContact || 'غير محدد'}
- القيمة الإجمالية: ${data.totalValue || 0}

قم بتحليل وتقديم:
1. نية الشراء (Purchase Intent) - نسبة مئوية مع تبرير
2. خطر المغادرة (Churn Risk) - نسبة مئوية مع أسباب
3. تصنيف القيمة (عالي/متوسط/منخفض) مع تبرير
4. توصيات مخصصة للتعامل
5. أفضل وقت للتواصل
6. القناة المفضلة
7. فرص البيع المتقاطع/الترقية`,
        response_json_schema: {
          type: "object",
          properties: {
            purchase_intent: {
              type: "object",
              properties: {
                score: { type: "number" },
                confidence: { type: "number" },
                reasoning: { type: "string" },
                signals: { type: "array", items: { type: "string" } }
              }
            },
            churn_risk: {
              type: "object",
              properties: {
                score: { type: "number" },
                level: { type: "string" },
                drivers: { type: "array", items: { type: "string" } },
                prevention_actions: { type: "array", items: { type: "string" } }
              }
            },
            customer_value: {
              type: "object",
              properties: {
                tier: { type: "string" },
                lifetime_value_estimate: { type: "number" },
                growth_potential: { type: "string" }
              }
            },
            personalization: {
              type: "object",
              properties: {
                preferred_channel: { type: "string" },
                best_contact_time: { type: "string" },
                communication_style: { type: "string" },
                interests: { type: "array", items: { type: "string" } }
              }
            },
            recommendations: { type: "array", items: { type: "string" } },
            upsell_opportunities: { type: "array", items: { type: "string" } },
            next_best_action: { type: "string" }
          }
        }
      });
      setIsAnalyzing(false);
      return result;
    },
    onSuccess: (data) => {
      setAiProfile(data);
      onProfileUpdate?.(data);
      toast.success('تم تحديث ملف العميل بتحليلات AI');
    },
    onError: () => {
      setIsAnalyzing(false);
      toast.error('حدث خطأ في التحليل');
    }
  });

  useEffect(() => {
    if (customerData && !aiProfile) {
      analyzeCustomerMutation.mutate(customerData);
    }
  }, [customerData]);

  const getChurnColor = (level) => {
    if (level === 'high' || (aiProfile?.churn_risk?.score > 60)) return 'red';
    if (level === 'medium' || (aiProfile?.churn_risk?.score > 30)) return 'amber';
    return 'green';
  };

  const getValueBadge = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'high':
      case 'عالي':
        return { color: 'amber', icon: Crown, label: 'عميل VIP' };
      case 'medium':
      case 'متوسط':
        return { color: 'blue', icon: Star, label: 'عميل مميز' };
      default:
        return { color: 'slate', icon: User, label: 'عميل عادي' };
    }
  };

  const valueBadge = getValueBadge(aiProfile?.customer_value?.tier);
  const churnColor = getChurnColor(aiProfile?.churn_risk?.level);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={isAnalyzing ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: isAnalyzing ? Infinity : 0, ease: "linear" }}
            className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20"
          >
            <Brain className="w-5 h-5 text-purple-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">تحليل AI للعميل</h4>
            <p className="text-slate-400 text-xs">تحديث تلقائي لملف CRM</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-purple-500/50"
          onClick={() => analyzeCustomerMutation.mutate(customerData)}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>

      {isAnalyzing && !aiProfile && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 text-purple-400 mx-auto mb-3 animate-spin" />
            <p className="text-slate-300">جاري تحليل ملف العميل...</p>
          </CardContent>
        </Card>
      )}

      {aiProfile && (
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            {/* Purchase Intent */}
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-3 text-center">
                <ShoppingCart className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{aiProfile.purchase_intent?.score || 0}%</p>
                <p className="text-slate-400 text-xs">نية الشراء</p>
                <Progress value={aiProfile.purchase_intent?.score || 0} className="h-1 mt-2" />
              </CardContent>
            </Card>

            {/* Churn Risk */}
            <Card className={`bg-${churnColor}-500/10 border-${churnColor}-500/30`}>
              <CardContent className="p-3 text-center">
                <UserMinus className={`w-5 h-5 text-${churnColor}-400 mx-auto mb-1`} />
                <p className="text-xl font-bold text-white">{aiProfile.churn_risk?.score || 0}%</p>
                <p className="text-slate-400 text-xs">خطر المغادرة</p>
                <Progress value={aiProfile.churn_risk?.score || 0} className="h-1 mt-2" />
              </CardContent>
            </Card>

            {/* Customer Value */}
            <Card className={`bg-${valueBadge.color}-500/10 border-${valueBadge.color}-500/30`}>
              <CardContent className="p-3 text-center">
                <valueBadge.icon className={`w-5 h-5 text-${valueBadge.color}-400 mx-auto mb-1`} />
                <p className="text-sm font-bold text-white">{valueBadge.label}</p>
                <p className="text-slate-400 text-xs">تصنيف القيمة</p>
                <Badge className={`mt-2 bg-${valueBadge.color}-500/20 text-${valueBadge.color}-400 text-xs`}>
                  {aiProfile.customer_value?.growth_potential || 'متوسط'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Next Best Action */}
          {aiProfile.next_best_action && (
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 font-medium text-sm">الإجراء التالي الأمثل</span>
                </div>
                <p className="text-white text-sm">{aiProfile.next_best_action}</p>
              </CardContent>
            </Card>
          )}

          {/* Personalization Insights */}
          {aiProfile.personalization && (
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-400" />
                  رؤى التخصيص
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-slate-900/50 rounded">
                    <p className="text-slate-400 text-xs">القناة المفضلة</p>
                    <p className="text-white text-sm font-medium">{aiProfile.personalization.preferred_channel}</p>
                  </div>
                  <div className="p-2 bg-slate-900/50 rounded">
                    <p className="text-slate-400 text-xs">أفضل وقت للتواصل</p>
                    <p className="text-white text-sm font-medium">{aiProfile.personalization.best_contact_time}</p>
                  </div>
                </div>
                <div className="p-2 bg-slate-900/50 rounded">
                  <p className="text-slate-400 text-xs mb-1">أسلوب التواصل</p>
                  <p className="text-white text-sm">{aiProfile.personalization.communication_style}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Churn Drivers */}
          {aiProfile.churn_risk?.drivers?.length > 0 && (
            <Card className="bg-red-500/10 border-red-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  أسباب خطر المغادرة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {aiProfile.churn_risk.drivers.map((driver, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-red-400">•</span>
                      <span className="text-slate-300">{driver}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prevention Actions */}
          {aiProfile.churn_risk?.prevention_actions?.length > 0 && (
            <Card className="bg-green-500/10 border-green-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  إجراءات الاحتفاظ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {aiProfile.churn_risk.prevention_actions.map((action, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-green-400">✓</span>
                      <span className="text-slate-300">{action}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upsell Opportunities */}
          {aiProfile.upsell_opportunities?.length > 0 && (
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  فرص البيع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {aiProfile.upsell_opportunities.map((opp, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-amber-400">💡</span>
                      <span className="text-slate-300">{opp}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {aiProfile.recommendations?.length > 0 && (
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  توصيات AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[100px]">
                  <div className="space-y-1">
                    {aiProfile.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Brain className="w-3 h-3 text-purple-400 mt-1 flex-shrink-0" />
                        <span className="text-slate-300">{rec}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Customer Journey Map */}
          <AICustomerJourneyMap 
            customerId={customerId} 
            customerName={customerData?.name} 
          />
        </div>
      )}
    </div>
  );
}