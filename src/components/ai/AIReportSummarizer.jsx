import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  FileText, Sparkles, Loader2, Copy, Download, CheckCircle,
  ListOrdered, Quote, BarChart3, AlertTriangle, Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AIReportSummarizer() {
  const [reportText, setReportText] = useState('');
  const [summaryLength, setSummaryLength] = useState([50]);
  const [summary, setSummary] = useState(null);
  const [copied, setCopied] = useState(false);

  const summarizeMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتلخيص التقرير التالي بطول ${summaryLength[0]}% من الأصل:

"${reportText}"

قدم:
1. ملخص تنفيذي موجز
2. النقاط الرئيسية (5-7 نقاط)
3. الأرقام والإحصائيات المهمة
4. التحديات المذكورة
5. التوصيات والخطوات التالية
6. اقتباسات مهمة إن وجدت`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            key_points: { type: "array", items: { type: "string" } },
            statistics: { type: "array", items: { type: "object", properties: { metric: { type: "string" }, value: { type: "string" }, context: { type: "string" } } } },
            challenges: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            important_quotes: { type: "array", items: { type: "string" } },
            word_count_original: { type: "number" },
            word_count_summary: { type: "number" },
            compression_ratio: { type: "number" }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setSummary(data);
      toast.success('تم إنشاء الملخص بنجاح');
    }
  });

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary.executive_summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('تم النسخ');
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
          <FileText className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h4 className="text-white font-bold">تلخيص التقارير بالذكاء الاصطناعي</h4>
          <p className="text-slate-400 text-xs">تحويل التقارير الطويلة إلى ملخصات موجزة</p>
        </div>
      </div>

      {/* Input */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-4 space-y-4">
          <Textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="الصق نص التقرير هنا..."
            className="bg-slate-900/50 border-slate-700 text-white min-h-[150px]"
          />
          
          <div className="flex items-center gap-4">
            <Label className="text-slate-400 text-sm whitespace-nowrap">طول الملخص:</Label>
            <Slider
              value={summaryLength}
              onValueChange={setSummaryLength}
              max={100}
              min={10}
              step={10}
              className="flex-1"
            />
            <Badge className="bg-blue-500/20 text-blue-400">{summaryLength[0]}%</Badge>
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => summarizeMutation.mutate()}
            disabled={!reportText || summarizeMutation.isPending}
          >
            {summarizeMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin ml-1" /> جاري التلخيص...</>
            ) : (
              <><Sparkles className="w-4 h-4 ml-1" /> إنشاء الملخص</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Summary Results */}
      {summary && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm">الملخص</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-slate-600 text-xs">
                    {summary.word_count_original} → {summary.word_count_summary} كلمة
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-400 text-xs">
                    ضغط {summary.compression_ratio}%
                  </Badge>
                  <Button size="sm" variant="ghost" className="h-7" onClick={handleCopy}>
                    {copied ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="summary">
                <TabsList className="bg-slate-800/50 border border-slate-700 p-1 mb-4">
                  <TabsTrigger value="summary" className="text-xs">الملخص</TabsTrigger>
                  <TabsTrigger value="points" className="text-xs">النقاط</TabsTrigger>
                  <TabsTrigger value="stats" className="text-xs">الأرقام</TabsTrigger>
                  <TabsTrigger value="actions" className="text-xs">التوصيات</TabsTrigger>
                </TabsList>

                <TabsContent value="summary">
                  <div className="p-4 bg-slate-900/50 rounded-lg">
                    <p className="text-slate-200 leading-relaxed">{summary.executive_summary}</p>
                  </div>
                </TabsContent>

                <TabsContent value="points">
                  <ScrollArea className="h-[200px]">
                    <ul className="space-y-2">
                      {summary.key_points?.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 p-2 bg-slate-900/50 rounded">
                          <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs flex-shrink-0">{i + 1}</span>
                          <span className="text-slate-300 text-sm">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="stats">
                  <ScrollArea className="h-[200px]">
                    <div className="grid gap-2">
                      {summary.statistics?.map((stat, i) => (
                        <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-medium">{stat.metric}</span>
                            <Badge className="bg-cyan-500/20 text-cyan-400">{stat.value}</Badge>
                          </div>
                          <p className="text-slate-400 text-xs">{stat.context}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="actions">
                  <div className="space-y-3">
                    {summary.challenges?.length > 0 && (
                      <div>
                        <p className="text-red-400 text-xs font-medium mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> التحديات
                        </p>
                        <ul className="space-y-1">
                          {summary.challenges.map((c, i) => (
                            <li key={i} className="text-slate-300 text-sm p-2 bg-red-500/10 rounded">{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {summary.recommendations?.length > 0 && (
                      <div>
                        <p className="text-green-400 text-xs font-medium mb-2 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" /> التوصيات
                        </p>
                        <ul className="space-y-1">
                          {summary.recommendations.map((r, i) => (
                            <li key={i} className="text-slate-300 text-sm p-2 bg-green-500/10 rounded">{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}