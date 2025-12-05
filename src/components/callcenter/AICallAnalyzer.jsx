import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, FileText, Smile, Frown, Meh, Star, ChevronRight, Hash,
  MessageSquare, AlertTriangle, CheckCircle, Clock, Share2, Copy, 
  Loader2, Sparkles, Target, User, ThumbsUp, ThumbsDown, Mic
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function AICallAnalyzer({ conversation, messages, isOpen, onClose }) {
  const [analysis, setAnalysis] = useState(null);

  const analysisMutation = useMutation({
    mutationFn: async () => {
      const conversationText = messages?.map(m => 
        `${m.sender === 'agent' ? 'الوكيل' : 'العميل'}: ${m.text}`
      ).join('\n') || '';

      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت محلل مكالمات متخصص في مراكز الاتصال. قم بتحليل المحادثة التالية بدقة:

معلومات المحادثة:
- العميل: ${conversation?.customer || 'غير معروف'}
- القناة: ${conversation?.channel || 'غير معروف'}
- الأولوية: ${conversation?.priority || 'عادية'}
- الحالة: ${conversation?.status || 'غير معروف'}

نص المحادثة:
${conversationText || 'لا توجد رسائل متاحة'}

قم بتقديم تحليل شامل يتضمن:
1. ملخص موجز للمحادثة (جملة أو جملتين)
2. التفاصيل المهمة المستخلصة (رقم التذكرة، طلبات المتابعة، المواعيد، المشاكل المطروحة)
3. تقييم رضا العميل من 1 إلى 5 بناءً على نبرة المحادثة والمحتوى
4. تحليل المشاعر (إيجابي/محايد/سلبي) مع درجة الثقة
5. نية العميل الرئيسية (Intent)
6. 3-5 ردود مقترحة يمكن للوكيل استخدامها
7. الخطوات التالية الموصى بها
8. تقييم أداء الوكيل (إن كان هناك تفاعل)
9. أي مخاطر أو تحذيرات (مثل عميل غاضب، مشكلة متكررة)
10. وسوم/تصنيفات مقترحة`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            keyDetails: {
              type: "object",
              properties: {
                ticketNumber: { type: "string" },
                followUpRequests: { type: "array", items: { type: "string" } },
                appointments: { type: "array", items: { type: "string" } },
                issues: { type: "array", items: { type: "string" } },
                customerInfo: { type: "string" }
              }
            },
            satisfaction: {
              type: "object",
              properties: {
                score: { type: "number" },
                reason: { type: "string" }
              }
            },
            sentiment: {
              type: "object",
              properties: {
                label: { type: "string", enum: ["positive", "neutral", "negative"] },
                confidence: { type: "number" },
                indicators: { type: "array", items: { type: "string" } }
              }
            },
            intent: {
              type: "object",
              properties: {
                primary: { type: "string" },
                secondary: { type: "array", items: { type: "string" } }
              }
            },
            suggestedResponses: { type: "array", items: { type: "string" } },
            nextSteps: { type: "array", items: { type: "string" } },
            agentPerformance: {
              type: "object",
              properties: {
                score: { type: "number" },
                strengths: { type: "array", items: { type: "string" } },
                improvements: { type: "array", items: { type: "string" } }
              }
            },
            risks: { type: "array", items: { type: "string" } },
            tags: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast.success('تم تحليل المحادثة بنجاح');
    },
    onError: () => {
      toast.error('فشل في تحليل المحادثة');
    }
  });

  const getSentimentIcon = (label) => {
    switch (label) {
      case 'positive': return <Smile className="w-6 h-6 text-green-400" />;
      case 'negative': return <Frown className="w-6 h-6 text-red-400" />;
      default: return <Meh className="w-6 h-6 text-amber-400" />;
    }
  };

  const getSentimentColor = (label) => {
    switch (label) {
      case 'positive': return 'bg-green-500/10 border-green-500/30';
      case 'negative': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-amber-500/10 border-amber-500/30';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0f1629] border-slate-700 max-w-3xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            مساعد AI لتحليل المكالمات
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info Bar */}
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-cyan-400" />
              <span className="text-white">{conversation?.customer || 'عميل'}</span>
              <Badge className="bg-slate-700 text-slate-300">{conversation?.channel}</Badge>
            </div>
            <Button 
              onClick={() => analysisMutation.mutate()} 
              disabled={analysisMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {analysisMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري التحليل...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 ml-2" />
                  تحليل بالذكاء الاصطناعي
                </>
              )}
            </Button>
          </div>

          {analysis && (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4 pr-4">
                {/* Summary */}
                <Card className="bg-purple-500/10 border-purple-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-purple-400 mt-0.5" />
                      <div>
                        <h4 className="text-purple-400 font-medium mb-1">ملخص المحادثة</h4>
                        <p className="text-white text-sm">{analysis.summary}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sentiment & Satisfaction */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className={`${getSentimentColor(analysis.sentiment?.label)}`}>
                    <CardContent className="p-4 text-center">
                      {getSentimentIcon(analysis.sentiment?.label)}
                      <p className="text-2xl font-bold text-white mt-2">
                        {analysis.sentiment?.label === 'positive' ? 'إيجابي' : 
                         analysis.sentiment?.label === 'negative' ? 'سلبي' : 'محايد'}
                      </p>
                      <p className="text-slate-400 text-sm">ثقة: {analysis.sentiment?.confidence}%</p>
                      {analysis.sentiment?.indicators?.length > 0 && (
                        <div className="mt-2 text-xs text-slate-400">
                          {analysis.sentiment.indicators.slice(0, 2).join(' • ')}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-cyan-500/10 border-cyan-500/30">
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star 
                            key={i} 
                            className={`w-5 h-5 ${i <= (analysis.satisfaction?.score || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} 
                          />
                        ))}
                      </div>
                      <p className="text-2xl font-bold text-white mt-2">{analysis.satisfaction?.score}/5</p>
                      <p className="text-slate-400 text-sm">رضا العميل المتوقع</p>
                      <p className="text-xs text-slate-500 mt-1">{analysis.satisfaction?.reason}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Intent */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-cyan-400 font-medium">نية العميل</h4>
                    </div>
                    <p className="text-white font-medium">{analysis.intent?.primary}</p>
                    {analysis.intent?.secondary?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {analysis.intent.secondary.map((intent, i) => (
                          <Badge key={i} className="bg-slate-700 text-slate-300">{intent}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Key Details */}
                {analysis.keyDetails && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                      <h4 className="text-cyan-400 font-medium mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        التفاصيل المهمة المستخلصة
                      </h4>
                      <div className="space-y-3">
                        {analysis.keyDetails.ticketNumber && (
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-purple-400" />
                            <span className="text-slate-400">رقم التذكرة:</span>
                            <span className="text-white font-mono">{analysis.keyDetails.ticketNumber}</span>
                          </div>
                        )}
                        {analysis.keyDetails.issues?.length > 0 && (
                          <div>
                            <p className="text-slate-400 text-sm mb-1">المشاكل المطروحة:</p>
                            <ul className="space-y-1">
                              {analysis.keyDetails.issues.map((issue, i) => (
                                <li key={i} className="text-white text-sm flex items-start gap-2">
                                  <AlertTriangle className="w-3 h-3 text-amber-400 mt-1" />
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {analysis.keyDetails.followUpRequests?.length > 0 && (
                          <div>
                            <p className="text-slate-400 text-sm mb-1">طلبات المتابعة:</p>
                            <ul className="space-y-1">
                              {analysis.keyDetails.followUpRequests.map((req, i) => (
                                <li key={i} className="text-white text-sm flex items-start gap-2">
                                  <Clock className="w-3 h-3 text-cyan-400 mt-1" />
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Suggested Responses */}
                {analysis.suggestedResponses?.length > 0 && (
                  <Card className="bg-green-500/10 border-green-500/30">
                    <CardContent className="p-4">
                      <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        ردود مقترحة للوكيل
                      </h4>
                      <div className="space-y-2">
                        {analysis.suggestedResponses.map((response, i) => (
                          <div key={i} className="p-3 bg-slate-800/50 rounded-lg flex items-start justify-between gap-2">
                            <p className="text-white text-sm flex-1">{response}</p>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => copyToClipboard(response)}
                              className="h-8 px-2"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Next Steps */}
                {analysis.nextSteps?.length > 0 && (
                  <Card className="bg-amber-500/10 border-amber-500/30">
                    <CardContent className="p-4">
                      <h4 className="text-amber-400 font-medium mb-2 flex items-center gap-2">
                        <ChevronRight className="w-4 h-4" />
                        الخطوات التالية
                      </h4>
                      <ul className="space-y-1">
                        {analysis.nextSteps.map((step, i) => (
                          <li key={i} className="text-white text-sm flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-amber-400 mt-1" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Agent Performance */}
                {analysis.agentPerformance && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                      <h4 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        تقييم أداء الوكيل
                      </h4>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <span className="text-2xl font-bold text-purple-400">{analysis.agentPerformance.score}</span>
                        </div>
                        <Progress value={analysis.agentPerformance.score} className="flex-1 h-3" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-green-400 text-xs mb-1 flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" /> نقاط القوة
                          </p>
                          <ul className="text-sm text-slate-300 space-y-1">
                            {analysis.agentPerformance.strengths?.map((s, i) => (
                              <li key={i}>• {s}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-amber-400 text-xs mb-1 flex items-center gap-1">
                            <ThumbsDown className="w-3 h-3" /> نقاط التحسين
                          </p>
                          <ul className="text-sm text-slate-300 space-y-1">
                            {analysis.agentPerformance.improvements?.map((s, i) => (
                              <li key={i}>• {s}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Risks */}
                {analysis.risks?.length > 0 && (
                  <Card className="bg-red-500/10 border-red-500/30">
                    <CardContent className="p-4">
                      <h4 className="text-red-400 font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        تحذيرات ومخاطر
                      </h4>
                      <ul className="space-y-1">
                        {analysis.risks.map((risk, i) => (
                          <li key={i} className="text-red-300 text-sm">• {risk}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Tags */}
                {analysis.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {analysis.tags.map((tag, i) => (
                      <Badge key={i} className="bg-slate-700 text-slate-300">
                        <Hash className="w-3 h-3 ml-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          {!analysis && !analysisMutation.isPending && (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">اضغط على "تحليل بالذكاء الاصطناعي" لبدء التحليل</p>
              <p className="text-slate-500 text-sm mt-2">سيقوم AI بتلخيص المحادثة وتقييم رضا العميل واقتراح ردود</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}