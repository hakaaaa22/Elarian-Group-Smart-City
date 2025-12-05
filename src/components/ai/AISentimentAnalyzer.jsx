import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  MessageSquare, ThumbsUp, ThumbsDown, Meh, TrendingUp, Loader2,
  BarChart3, PieChart, AlertTriangle, Sparkles, Users, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#22c55e', '#ef4444', '#f59e0b'];

export default function AISentimentAnalyzer({ feedbackData }) {
  const [textInput, setTextInput] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [batchResults, setBatchResults] = useState(null);

  const analyzeSentimentMutation = useMutation({
    mutationFn: async (text) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل المشاعر في النص التالي بدقة:

"${text}"

قدم:
1. التصنيف العام (إيجابي/سلبي/محايد)
2. درجة الثقة
3. المشاعر الفرعية المكتشفة
4. الكلمات المفتاحية المؤثرة
5. توصيات للتحسين إن وجدت`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
            confidence: { type: "number" },
            sentiment_score: { type: "number" },
            sub_emotions: { type: "array", items: { type: "object", properties: { emotion: { type: "string" }, intensity: { type: "number" } } } },
            key_phrases: { type: "array", items: { type: "string" } },
            concerns: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            summary: { type: "string" }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast.success('تم تحليل المشاعر بنجاح');
    }
  });

  const analyzeBatchMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل مجموعة من ملاحظات المستخدمين وقدم تقريراً شاملاً:

قدم:
1. توزيع المشاعر العام
2. أهم المواضيع المتكررة
3. نقاط القوة والضعف
4. اتجاهات المشاعر
5. توصيات التحسين`,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment_distribution: { type: "object", properties: { positive: { type: "number" }, negative: { type: "number" }, neutral: { type: "number" } } },
            top_topics: { type: "array", items: { type: "object", properties: { topic: { type: "string" }, count: { type: "number" }, sentiment: { type: "string" } } } },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            trend: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } },
            overall_score: { type: "number" }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setBatchResults(data);
      toast.success('تم تحليل الملاحظات');
    }
  });

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="w-5 h-5 text-green-400" />;
      case 'negative': return <ThumbsDown className="w-5 h-5 text-red-400" />;
      default: return <Meh className="w-5 h-5 text-amber-400" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'green';
      case 'negative': return 'red';
      default: return 'amber';
    }
  };

  const pieData = batchResults ? [
    { name: 'إيجابي', value: batchResults.sentiment_distribution?.positive || 0 },
    { name: 'سلبي', value: batchResults.sentiment_distribution?.negative || 0 },
    { name: 'محايد', value: batchResults.sentiment_distribution?.neutral || 0 }
  ] : [];

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
          <MessageSquare className="w-5 h-5 text-pink-400" />
        </div>
        <div>
          <h4 className="text-white font-bold">تحليل المشاعر بالذكاء الاصطناعي</h4>
          <p className="text-slate-400 text-xs">تحليل ملاحظات المستخدمين والتعليقات</p>
        </div>
      </div>

      {/* Single Text Analysis */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">تحليل نص فردي</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="أدخل النص للتحليل..."
            className="bg-slate-900/50 border-slate-700 text-white min-h-[100px]"
          />
          <Button
            className="w-full bg-pink-600 hover:bg-pink-700"
            onClick={() => analyzeSentimentMutation.mutate(textInput)}
            disabled={!textInput || analyzeSentimentMutation.isPending}
          >
            {analyzeSentimentMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><Sparkles className="w-4 h-4 ml-1" /> تحليل المشاعر</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Single Analysis Results */}
      {analysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`bg-${getSentimentColor(analysis.overall_sentiment)}-500/10 border-${getSentimentColor(analysis.overall_sentiment)}-500/30`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getSentimentIcon(analysis.overall_sentiment)}
                  <span className="text-white font-bold text-lg">
                    {analysis.overall_sentiment === 'positive' ? 'إيجابي' : analysis.overall_sentiment === 'negative' ? 'سلبي' : 'محايد'}
                  </span>
                </div>
                <Badge className={`bg-${getSentimentColor(analysis.overall_sentiment)}-500/20 text-${getSentimentColor(analysis.overall_sentiment)}-400`}>
                  ثقة {analysis.confidence}%
                </Badge>
              </div>

              <p className="text-slate-300 text-sm mb-4">{analysis.summary}</p>

              {analysis.sub_emotions?.length > 0 && (
                <div className="mb-4">
                  <p className="text-slate-400 text-xs mb-2">المشاعر الفرعية:</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.sub_emotions.map((e, i) => (
                      <Badge key={i} variant="outline" className="border-slate-600">
                        {e.emotion} ({e.intensity}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {analysis.key_phrases?.length > 0 && (
                <div className="mb-4">
                  <p className="text-slate-400 text-xs mb-2">العبارات المفتاحية:</p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.key_phrases.map((p, i) => (
                      <Badge key={i} className="bg-slate-700 text-slate-300 text-xs">{p}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {analysis.recommendations?.length > 0 && (
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-cyan-400 text-xs font-medium mb-2">التوصيات:</p>
                  <ul className="space-y-1">
                    {analysis.recommendations.map((r, i) => (
                      <li key={i} className="text-slate-300 text-xs flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Batch Analysis */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              تحليل شامل للملاحظات
            </CardTitle>
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 h-7"
              onClick={() => analyzeBatchMutation.mutate()}
              disabled={analyzeBatchMutation.isPending}
            >
              {analyzeBatchMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'تحليل'}
            </Button>
          </div>
        </CardHeader>
        {batchResults && (
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" label>
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">النتيجة العامة</span>
                  <span className="text-white font-bold">{batchResults.overall_score}/100</span>
                </div>
                <Progress value={batchResults.overall_score} className="h-2" />
                <p className="text-slate-400 text-xs">الاتجاه: <span className="text-cyan-400">{batchResults.trend}</span></p>
              </div>
            </div>

            {batchResults.top_topics?.length > 0 && (
              <div className="mt-4">
                <p className="text-slate-400 text-xs mb-2">المواضيع الشائعة:</p>
                <div className="space-y-1">
                  {batchResults.top_topics.slice(0, 5).map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                      <span className="text-white text-sm">{t.topic}</span>
                      <div className="flex items-center gap-2">
                        <Badge className="text-xs">{t.count}</Badge>
                        {getSentimentIcon(t.sentiment)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}