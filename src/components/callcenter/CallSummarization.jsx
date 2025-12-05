import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  FileText, Brain, Loader2, Copy, Download, CheckCircle, Tag,
  MessageSquare, Target, AlertTriangle, Sparkles, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export default function CallSummarization({ callTranscript, onSummaryGenerated }) {
  const [summary, setSummary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const summarizeMutation = useMutation({
    mutationFn: async (transcript) => {
      setIsGenerating(true);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل وتلخيص المكالمة التالية:

"${transcript || 'مكالمة استفسار عن الخدمة مع العميل'}"

قدم:
1. ملخص موجز للمكالمة (3-4 جمل)
2. النقاط الرئيسية
3. الكلمات المفتاحية المستخرجة
4. نية العميل
5. الإجراءات المتخذة
6. المتابعات المطلوبة
7. تقييم عام للمكالمة`,
        response_json_schema: {
          type: "object",
          properties: {
            brief_summary: { type: "string" },
            key_points: { type: "array", items: { type: "string" } },
            keywords: { type: "array", items: { type: "string" } },
            customer_intent: { type: "string" },
            actions_taken: { type: "array", items: { type: "string" } },
            follow_ups_required: { type: "array", items: { type: "string" } },
            overall_sentiment: { type: "string" },
            call_outcome: { type: "string" },
            duration_estimate: { type: "string" },
            quality_score: { type: "number" }
          }
        }
      });
      setIsGenerating(false);
      return result;
    },
    onSuccess: (data) => {
      setSummary(data);
      onSummaryGenerated?.(data);
      toast.success('تم إنشاء ملخص المكالمة');
    },
    onError: () => {
      setIsGenerating(false);
      toast.error('حدث خطأ');
    }
  });

  const copySummary = () => {
    if (summary?.brief_summary) {
      navigator.clipboard.writeText(summary.brief_summary);
      toast.success('تم نسخ الملخص');
    }
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment?.includes('إيجابي') || sentiment === 'positive') return 'green';
    if (sentiment?.includes('سلبي') || sentiment === 'negative') return 'red';
    return 'amber';
  };

  return (
    <div className="space-y-3" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">تلخيص المكالمة AI</h4>
            <p className="text-slate-400 text-xs">Auto Summarization</p>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => summarizeMutation.mutate(callTranscript)}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <><Sparkles className="w-4 h-4 ml-1" /> تلخيص</>
          )}
        </Button>
      </div>

      {summary ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Brief Summary */}
          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-400" />
                  ملخص المكالمة
                </CardTitle>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={copySummary}>
                    <Copy className="w-3 h-3 text-slate-400" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm">{summary.brief_summary}</p>
              <div className="flex items-center gap-3 mt-3">
                <Badge className={`bg-${getSentimentColor(summary.overall_sentiment)}-500/20 text-${getSentimentColor(summary.overall_sentiment)}-400 text-xs`}>
                  {summary.overall_sentiment}
                </Badge>
                <Badge className="bg-slate-700 text-slate-300 text-xs">
                  <Clock className="w-3 h-3 ml-1" />
                  {summary.duration_estimate}
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                  جودة: {summary.quality_score}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Key Points */}
          {summary.key_points?.length > 0 && (
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-xs flex items-center gap-2">
                  <Target className="w-3 h-3 text-cyan-400" />
                  النقاط الرئيسية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {summary.key_points.map((point, i) => (
                    <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Keywords */}
          {summary.keywords?.length > 0 && (
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-3 h-3 text-purple-400" />
                  <span className="text-slate-400 text-xs">الكلمات المفتاحية</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {summary.keywords.map((keyword, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-purple-500/50 text-purple-300">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer Intent & Outcome */}
          <div className="grid grid-cols-2 gap-2">
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-3 h-3 text-green-400" />
                  <span className="text-green-400 text-xs">نية العميل</span>
                </div>
                <p className="text-white text-xs">{summary.customer_intent}</p>
              </CardContent>
            </Card>
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-3 h-3 text-cyan-400" />
                  <span className="text-cyan-400 text-xs">نتيجة المكالمة</span>
                </div>
                <p className="text-white text-xs">{summary.call_outcome}</p>
              </CardContent>
            </Card>
          </div>

          {/* Follow-ups */}
          {summary.follow_ups_required?.length > 0 && (
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-xs flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  متابعات مطلوبة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {summary.follow_ups_required.map((followUp, i) => (
                    <li key={i} className="text-amber-300 text-xs flex items-start gap-2">
                      <span className="text-amber-400">•</span>
                      {followUp}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </motion.div>
      ) : (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-6 text-center">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm mb-3">اضغط "تلخيص" لإنشاء ملخص تلقائي للمكالمة</p>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => summarizeMutation.mutate(callTranscript)}
            >
              <Sparkles className="w-4 h-4 ml-1" />
              إنشاء ملخص
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}