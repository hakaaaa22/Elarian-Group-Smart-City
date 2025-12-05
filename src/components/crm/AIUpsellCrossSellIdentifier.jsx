import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  TrendingUp, ShoppingCart, Target, Sparkles, RefreshCw, Loader2, CheckCircle,
  DollarSign, User, Package, Zap, Brain, ArrowRight, Clock, Star, Crown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export default function AIUpsellCrossSellIdentifier({ customerData, journeyData, crmHistory, onTaskCreate }) {
  const [opportunities, setOpportunities] = useState(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  const identifyOpportunitiesMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `بناءً على بيانات العميل ورحلته وسجل CRM، حدد فرص Upsell و Cross-sell:

بيانات العميل:
${JSON.stringify(customerData, null, 2)}

رحلة العميل:
${JSON.stringify(journeyData, null, 2)}

سجل CRM:
${JSON.stringify(crmHistory, null, 2)}

قم بتحليل:
1. فرص الترقية (Upsell) بناءً على استخدام العميل الحالي
2. فرص البيع المتقاطع (Cross-sell) بناءً على سلوك العملاء المشابهين
3. التوقيت الأمثل لكل فرصة
4. نسبة النجاح المتوقعة
5. القيمة المحتملة لكل فرصة
6. استراتيجية التواصل المقترحة`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: {
              type: "object",
              properties: {
                total_opportunities: { type: "number" },
                total_potential_value: { type: "number" },
                priority_level: { type: "string" },
                best_timing: { type: "string" }
              }
            },
            upsell_opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  current_product: { type: "string" },
                  suggested_upgrade: { type: "string" },
                  reason: { type: "string" },
                  success_probability: { type: "number" },
                  potential_value: { type: "number" },
                  best_timing: { type: "string" },
                  approach: { type: "string" },
                  triggers: { type: "array", items: { type: "string" } }
                }
              }
            },
            crosssell_opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  product: { type: "string" },
                  reason: { type: "string" },
                  success_probability: { type: "number" },
                  potential_value: { type: "number" },
                  complementary_to: { type: "string" },
                  approach: { type: "string" }
                }
              }
            },
            recommended_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  deadline: { type: "string" },
                  assigned_to: { type: "string" }
                }
              }
            },
            talking_points: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setOpportunities(data);
      toast.success('تم تحديد فرص البيع بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ في التحليل');
    }
  });

  const createTask = (opportunity, type) => {
    const task = {
      type: type,
      title: `فرصة ${type === 'upsell' ? 'ترقية' : 'بيع متقاطع'}: ${opportunity.suggested_upgrade || opportunity.product}`,
      customer: customerData?.name,
      opportunity_id: opportunity.id,
      potential_value: opportunity.potential_value,
      deadline: opportunity.best_timing,
      priority: opportunity.success_probability > 70 ? 'high' : 'medium'
    };
    onTaskCreate?.(task);
    toast.success('تم إنشاء المهمة');
  };

  const getProbabilityColor = (prob) => {
    if (prob >= 70) return 'green';
    if (prob >= 50) return 'amber';
    return 'red';
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={identifyOpportunitiesMutation.isPending ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: identifyOpportunitiesMutation.isPending ? Infinity : 0 }}
            className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-amber-500/20"
          >
            <TrendingUp className="w-5 h-5 text-green-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">تحديد فرص Upsell/Cross-sell</h4>
            <p className="text-slate-400 text-xs">تحليل AI لفرص البيع الاستباقية</p>
          </div>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => identifyOpportunitiesMutation.mutate()}
          disabled={identifyOpportunitiesMutation.isPending}
        >
          {identifyOpportunitiesMutation.isPending ? (
            <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري التحليل...</>
          ) : (
            <><Brain className="w-4 h-4 ml-2" /> تحليل الفرص</>
          )}
        </Button>
      </div>

      {identifyOpportunitiesMutation.isPending && !opportunities && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 text-green-400 mx-auto mb-3 animate-spin" />
            <p className="text-slate-300">جاري تحليل رحلة العميل وسجل CRM...</p>
          </CardContent>
        </Card>
      )}

      {opportunities && (
        <div className="space-y-4">
          {/* Summary */}
          <Card className="bg-gradient-to-r from-green-500/10 to-amber-500/10 border-green-500/30">
            <CardContent className="p-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{opportunities.summary?.total_opportunities || 0}</p>
                  <p className="text-slate-400 text-sm">فرصة محددة</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400">
                    {opportunities.summary?.total_potential_value?.toLocaleString() || 0}
                  </p>
                  <p className="text-slate-400 text-sm">القيمة المحتملة</p>
                </div>
                <div className="text-center">
                  <Badge className={`text-lg px-3 py-1 ${
                    opportunities.summary?.priority_level === 'high' 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {opportunities.summary?.priority_level === 'high' ? 'عالية' : 'متوسطة'}
                  </Badge>
                  <p className="text-slate-400 text-sm mt-1">الأولوية</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-cyan-400">{opportunities.summary?.best_timing || 'الآن'}</p>
                  <p className="text-slate-400 text-sm">أفضل توقيت</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upsell Opportunities */}
          {opportunities.upsell_opportunities?.length > 0 && (
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  فرص الترقية (Upsell)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3">
                    {opportunities.upsell_opportunities.map((opp, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-3 bg-slate-900/50 rounded-lg border border-purple-500/20"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-purple-400" />
                            <span className="text-white font-medium">{opp.current_product}</span>
                            <ArrowRight className="w-4 h-4 text-slate-500" />
                            <span className="text-purple-400 font-medium">{opp.suggested_upgrade}</span>
                          </div>
                          <Badge className={`bg-${getProbabilityColor(opp.success_probability)}-500/20 text-${getProbabilityColor(opp.success_probability)}-400`}>
                            {opp.success_probability}%
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm mb-2">{opp.reason}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-green-400 flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {opp.potential_value?.toLocaleString()} ر.س
                            </span>
                            <span className="text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {opp.best_timing}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-purple-500/50 h-7"
                            onClick={() => createTask(opp, 'upsell')}
                          >
                            <Zap className="w-3 h-3 ml-1" />
                            إنشاء مهمة
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Cross-sell Opportunities */}
          {opportunities.crosssell_opportunities?.length > 0 && (
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-amber-400" />
                  فرص البيع المتقاطع (Cross-sell)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3">
                    {opportunities.crosssell_opportunities.map((opp, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-3 bg-slate-900/50 rounded-lg border border-amber-500/20"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-400" />
                            <span className="text-white font-medium">{opp.product}</span>
                          </div>
                          <Badge className={`bg-${getProbabilityColor(opp.success_probability)}-500/20 text-${getProbabilityColor(opp.success_probability)}-400`}>
                            {opp.success_probability}%
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm mb-1">{opp.reason}</p>
                        <p className="text-slate-500 text-xs mb-2">مكمل لـ: {opp.complementary_to}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-green-400 text-sm flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {opp.potential_value?.toLocaleString()} ر.س
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-amber-500/50 h-7"
                            onClick={() => createTask(opp, 'crosssell')}
                          >
                            <Zap className="w-3 h-3 ml-1" />
                            إنشاء مهمة
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Recommended Actions */}
          {opportunities.recommended_actions?.length > 0 && (
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-400" />
                  الإجراءات الموصى بها
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {opportunities.recommended_actions.map((action, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-cyan-400" />
                        <span className="text-white text-sm">{action.action}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={action.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}>
                          {action.priority === 'high' ? 'عاجل' : 'متوسط'}
                        </Badge>
                        <span className="text-slate-500 text-xs">{action.deadline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Talking Points */}
          {opportunities.talking_points?.length > 0 && (
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  نقاط الحديث المقترحة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {opportunities.talking_points.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-purple-400">💡</span>
                      <span className="text-slate-300">{point}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}