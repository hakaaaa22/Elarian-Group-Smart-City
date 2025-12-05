import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  FileText, Sparkles, RefreshCw, Wand2, MessageSquare, TrendingUp,
  Download, Copy, Eye, BarChart3, PieChart, LineChart, Brain, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// تحليل المشاعر للتعليقات
const sampleComments = [
  { id: 1, text: 'هذا التنبيه مهم جداً ويحتاج معالجة فورية', user: 'أحمد' },
  { id: 2, text: 'تم حل المشكلة بنجاح، عمل رائع', user: 'سارة' },
  { id: 3, text: 'المشكلة تتكرر كثيراً وهذا مزعج', user: 'محمد' },
  { id: 4, text: 'شكراً على المتابعة السريعة', user: 'خالد' },
];

export default function AIReportGenerator() {
  const [activeTab, setActiveTab] = useState('generate');
  const [reportDescription, setReportDescription] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [generatedReport, setGeneratedReport] = useState(null);
  const [summary, setSummary] = useState('');
  const [sentimentResults, setSentimentResults] = useState([]);
  const [selectedModule, setSelectedModule] = useState('fleet');

  // إنشاء تقرير من وصف نصي
  const generateReport = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كمحلل بيانات خبير، قم بإنشاء تقرير احترافي بناءً على الوصف التالي:

الوصف: ${reportDescription}
الوحدة: ${selectedModule}

قم بإنشاء تقرير يتضمن:
1. عنوان التقرير
2. ملخص تنفيذي
3. المؤشرات الرئيسية (KPIs) مع قيم افتراضية واقعية
4. التحليل التفصيلي
5. الرسوم البيانية المقترحة (أنواعها وبياناتها)
6. التوصيات
7. الخلاصة`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            executiveSummary: { type: "string" },
            kpis: { type: "array", items: { type: "object", properties: { name: { type: "string" }, value: { type: "string" }, trend: { type: "string" }, change: { type: "number" } } } },
            analysis: { type: "string" },
            charts: { type: "array", items: { type: "object", properties: { type: { type: "string" }, title: { type: "string" }, data: { type: "array", items: { type: "object" } } } } },
            recommendations: { type: "array", items: { type: "string" } },
            conclusion: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setGeneratedReport(data);
      toast.success('تم إنشاء التقرير بنجاح');
    }
  });

  // تلخيص التقرير
  const summarizeReport = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتلخيص التقرير التالي في فقرة واحدة موجزة (لا تزيد عن 100 كلمة):

${reportContent}

التلخيص يجب أن يشمل:
- النقاط الرئيسية
- أهم الأرقام والإحصائيات
- التوصيات الرئيسية`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            keyPoints: { type: "array", items: { type: "string" } },
            mainStats: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setSummary(data.summary);
      toast.success('تم تلخيص التقرير');
    }
  });

  // تحليل المشاعر
  const analyzeSentiment = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل المشاعر في التعليقات التالية:

${sampleComments.map(c => `- ${c.user}: "${c.text}"`).join('\n')}

لكل تعليق، حدد:
1. المشاعر (إيجابي/سلبي/محايد)
2. درجة الثقة (0-100)
3. الكلمات المفتاحية المؤثرة`,
        response_json_schema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  commentId: { type: "number" },
                  sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
                  confidence: { type: "number" },
                  keywords: { type: "array", items: { type: "string" } }
                }
              }
            },
            overallSentiment: { type: "string" },
            positivePercentage: { type: "number" },
            negativePercentage: { type: "number" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setSentimentResults(data.results || []);
      toast.success('تم تحليل المشاعر');
    }
  });

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'green';
      case 'negative': return 'red';
      default: return 'slate';
    }
  };

  const getSentimentLabel = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'إيجابي';
      case 'negative': return 'سلبي';
      default: return 'محايد';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          مولد التقارير بالذكاء الاصطناعي
        </h3>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="generate" className="data-[state=active]:bg-purple-500/20">
            <Wand2 className="w-4 h-4 ml-1" />
            إنشاء تقرير
          </TabsTrigger>
          <TabsTrigger value="summarize" className="data-[state=active]:bg-cyan-500/20">
            <FileText className="w-4 h-4 ml-1" />
            تلخيص تقرير
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="data-[state=active]:bg-amber-500/20">
            <MessageSquare className="w-4 h-4 ml-1" />
            تحليل المشاعر
          </TabsTrigger>
        </TabsList>

        {/* Generate Report Tab */}
        <TabsContent value="generate" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">وصف التقرير المطلوب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-400">الوحدة</Label>
                  <Select value={selectedModule} onValueChange={setSelectedModule}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fleet">الأسطول</SelectItem>
                      <SelectItem value="waste">النفايات</SelectItem>
                      <SelectItem value="devices">الأجهزة</SelectItem>
                      <SelectItem value="callcenter">مركز الاتصال</SelectItem>
                      <SelectItem value="maintenance">الصيانة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-400">وصف التقرير</Label>
                  <Textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="مثال: أريد تقرير أسبوعي عن أداء الأسطول يشمل استهلاك الوقود وكفاءة السائقين وحالة الصيانة..."
                    className="bg-slate-800/50 border-slate-700 text-white mt-2 h-32"
                  />
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => generateReport.mutate()} disabled={generateReport.isPending || !reportDescription}>
                  {generateReport.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Sparkles className="w-4 h-4 ml-2" />}
                  إنشاء التقرير
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">التقرير المُنشأ</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedReport ? (
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-4 pr-2">
                      <h4 className="text-cyan-400 font-bold text-lg">{generatedReport.title}</h4>
                      
                      <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                        <p className="text-slate-300 text-sm">{generatedReport.executiveSummary}</p>
                      </div>

                      {generatedReport.kpis?.length > 0 && (
                        <div>
                          <h5 className="text-white font-medium mb-2">المؤشرات الرئيسية</h5>
                          <div className="grid grid-cols-2 gap-2">
                            {generatedReport.kpis.map((kpi, i) => (
                              <div key={i} className="p-2 bg-slate-800/50 rounded">
                                <p className="text-slate-400 text-xs">{kpi.name}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-white font-bold">{kpi.value}</span>
                                  <Badge className={kpi.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                    {kpi.change >= 0 ? '+' : ''}{kpi.change}%
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {generatedReport.recommendations?.length > 0 && (
                        <div>
                          <h5 className="text-white font-medium mb-2">التوصيات</h5>
                          <ul className="space-y-1">
                            {generatedReport.recommendations.map((rec, i) => (
                              <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                                <Zap className="w-3 h-3 text-amber-400 mt-1 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="border-cyan-500 text-cyan-400">
                          <Download className="w-3 h-3 ml-1" />
                          تصدير
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-400">
                          <Copy className="w-3 h-3 ml-1" />
                          نسخ
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-slate-500">
                    <div className="text-center">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>أدخل وصف التقرير واضغط "إنشاء"</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Summarize Tab */}
        <TabsContent value="summarize" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">نص التقرير</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  placeholder="الصق نص التقرير هنا للحصول على تلخيص..."
                  className="bg-slate-800/50 border-slate-700 text-white h-64"
                />
                <Button className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700" onClick={() => summarizeReport.mutate()} disabled={summarizeReport.isPending || !reportContent}>
                  {summarizeReport.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <FileText className="w-4 h-4 ml-2" />}
                  تلخيص التقرير
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">الملخص</CardTitle>
              </CardHeader>
              <CardContent>
                {summary ? (
                  <div className="space-y-4">
                    <p className="text-slate-300 leading-relaxed">{summary}</p>
                    <Button size="sm" variant="outline" className="border-cyan-500 text-cyan-400">
                      <Copy className="w-3 h-3 ml-1" />
                      نسخ الملخص
                    </Button>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-500">
                    <p>الملخص سيظهر هنا</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sentiment Tab */}
        <TabsContent value="sentiment" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">التعليقات للتحليل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {sampleComments.map(comment => (
                    <div key={comment.id} className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-slate-400 text-xs mb-1">{comment.user}</p>
                      <p className="text-white text-sm">{comment.text}</p>
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => analyzeSentiment.mutate()} disabled={analyzeSentiment.isPending}>
                  {analyzeSentiment.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <MessageSquare className="w-4 h-4 ml-2" />}
                  تحليل المشاعر
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">نتائج التحليل</CardTitle>
              </CardHeader>
              <CardContent>
                {sentimentResults.length > 0 ? (
                  <div className="space-y-3">
                    {sentimentResults.map((result, i) => {
                      const comment = sampleComments.find(c => c.id === result.commentId);
                      return (
                        <div key={i} className={`p-3 rounded-lg border bg-${getSentimentColor(result.sentiment)}-500/10 border-${getSentimentColor(result.sentiment)}-500/30`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm">{comment?.user}</span>
                            <Badge className={`bg-${getSentimentColor(result.sentiment)}-500/20 text-${getSentimentColor(result.sentiment)}-400`}>
                              {getSentimentLabel(result.sentiment)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={result.confidence} className="h-2 flex-1" />
                            <span className="text-slate-400 text-xs">{result.confidence}%</span>
                          </div>
                          {result.keywords?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {result.keywords.map((kw, j) => (
                                <Badge key={j} className="bg-slate-700 text-slate-300 text-xs">{kw}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-500">
                    <p>نتائج التحليل ستظهر هنا</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}