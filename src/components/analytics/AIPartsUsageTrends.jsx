import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Package, Calendar, Sun, Snowflake,
  Zap, AlertTriangle, Brain, BarChart3, PieChart as PieChartIcon,
  Clock, RefreshCw, Filter
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const monthlyUsageData = [
  { month: 'يناير', فلاتر: 45, بطاريات: 12, حساسات: 8, كابلات: 150 },
  { month: 'فبراير', فلاتر: 38, بطاريات: 15, حساسات: 6, كابلات: 120 },
  { month: 'مارس', فلاتر: 42, بطاريات: 10, حساسات: 10, كابلات: 100 },
  { month: 'أبريل', فلاتر: 55, بطاريات: 8, حساسات: 5, كابلات: 90 },
  { month: 'مايو', فلاتر: 72, بطاريات: 12, حساسات: 7, كابلات: 85 },
  { month: 'يونيو', فلاتر: 95, بطاريات: 18, حساسات: 9, كابلات: 110 },
  { month: 'يوليو', فلاتر: 120, بطاريات: 22, حساسات: 11, كابلات: 130 },
  { month: 'أغسطس', فلاتر: 115, بطاريات: 25, حساسات: 8, كابلات: 125 },
  { month: 'سبتمبر', فلاتر: 85, بطاريات: 20, حساسات: 12, كابلات: 115 },
  { month: 'أكتوبر', فلاتر: 60, بطاريات: 15, حساسات: 6, كابلات: 95 },
  { month: 'نوفمبر', فلاتر: 48, بطاريات: 10, حساسات: 8, كابلات: 100 },
  { month: 'ديسمبر', فلاتر: 42, بطاريات: 8, حساسات: 5, كابلات: 90 },
];

const seasonalPatterns = [
  {
    part: 'فلاتر مكيف',
    pattern: 'موسمي - صيفي',
    peakMonths: ['يونيو', 'يوليو', 'أغسطس'],
    lowMonths: ['ديسمبر', 'يناير', 'فبراير'],
    peakIncrease: '+180%',
    recommendation: 'زيادة المخزون 50% قبل مايو'
  },
  {
    part: 'بطاريات كاميرات',
    pattern: 'موسمي - صيفي',
    peakMonths: ['يونيو', 'يوليو', 'أغسطس'],
    lowMonths: ['يناير', 'فبراير'],
    peakIncrease: '+100%',
    recommendation: 'الحرارة تؤثر على عمر البطارية'
  },
  {
    part: 'حساسات حركة',
    pattern: 'مرتبط بالأحداث',
    triggers: ['مشاريع جديدة', 'توسعات'],
    recommendation: 'متابعة خطط المشاريع'
  }
];

const eventCorrelations = [
  { event: 'موجة حر', part: 'فلاتر مكيف', increase: '+45%', date: '2024-07-15' },
  { event: 'عاصفة رملية', part: 'فلاتر', increase: '+30%', date: '2024-04-10' },
  { event: 'انقطاع كهربائي', part: 'UPS', increase: '+200%', date: '2024-08-22' },
  { event: 'مشروع توسعة', part: 'كابلات', increase: '+150%', date: '2024-06-01' },
];

export default function AIPartsUsageTrends() {
  const [selectedPart, setSelectedPart] = useState('all');
  const [timeRange, setTimeRange] = useState('year');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const analysisMutation = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `حلل بيانات استخدام قطع الغيار التالية واستخرج الأنماط:

البيانات الشهرية:
${monthlyUsageData.map(d => `${d.month}: فلاتر=${d.فلاتر}, بطاريات=${d.بطاريات}, حساسات=${d.حساسات}`).join('\n')}

الأحداث المرتبطة:
${eventCorrelations.map(e => `${e.event}: ${e.part} +${e.increase}`).join('\n')}

قدم:
1. الأنماط الموسمية المكتشفة
2. الارتباطات بين الأحداث والاستخدام
3. توقعات للأشهر الثلاثة القادمة
4. توصيات لتحسين إدارة المخزون`,
        response_json_schema: {
          type: "object",
          properties: {
            seasonalPatterns: { type: "array", items: { type: "string" } },
            eventCorrelations: { type: "array", items: { type: "string" } },
            forecasts: { type: "array", items: { type: "object", properties: { part: { type: "string" }, nextMonth: { type: "number" }, trend: { type: "string" } } } },
            recommendations: { type: "array", items: { type: "string" } },
            insights: { type: "string" },
            confidence: { type: "number" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAiAnalysis(data);
      setIsAnalyzing(false);
    },
    onError: () => {
      toast.error('فشل التحليل');
      setIsAnalyzing(false);
    }
  });

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    analysisMutation.mutate();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-400" />
            تحليل اتجاهات الاستخدام
          </h2>
          <p className="text-slate-400 text-sm">أنماط موسمية وارتباطات بالأحداث</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="quarter">3 أشهر</SelectItem>
              <SelectItem value="half">6 أشهر</SelectItem>
              <SelectItem value="year">سنة</SelectItem>
            </SelectContent>
          </Select>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={runAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
            تحليل AI
          </Button>
        </div>
      </div>

      {/* Main Chart */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">الاستخدام الشهري لقطع الغيار</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
              <Legend />
              <Area type="monotone" dataKey="فلاتر" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
              <Area type="monotone" dataKey="بطاريات" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
              <Area type="monotone" dataKey="حساسات" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Tabs defaultValue="seasonal">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="seasonal" className="data-[state=active]:bg-cyan-500/20">
            <Sun className="w-4 h-4 ml-2" />
            الأنماط الموسمية
          </TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:bg-amber-500/20">
            <Zap className="w-4 h-4 ml-2" />
            ارتباط الأحداث
          </TabsTrigger>
        </TabsList>

        <TabsContent value="seasonal" className="space-y-4 mt-4">
          {seasonalPatterns.map((pattern, idx) => (
            <Card key={idx} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold">{pattern.part}</h3>
                    <Badge className="bg-cyan-500/20 text-cyan-400 mt-1">
                      {pattern.pattern}
                    </Badge>
                  </div>
                  {pattern.peakIncrease && (
                    <div className="text-left">
                      <p className="text-green-400 font-bold">{pattern.peakIncrease}</p>
                      <p className="text-slate-500 text-xs">زيادة الذروة</p>
                    </div>
                  )}
                </div>

                {pattern.peakMonths && (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="p-2 bg-red-500/10 rounded">
                      <p className="text-red-400 text-xs flex items-center gap-1">
                        <Sun className="w-3 h-3" />
                        أشهر الذروة
                      </p>
                      <p className="text-white text-sm">{pattern.peakMonths.join('، ')}</p>
                    </div>
                    <div className="p-2 bg-blue-500/10 rounded">
                      <p className="text-blue-400 text-xs flex items-center gap-1">
                        <Snowflake className="w-3 h-3" />
                        أشهر الانخفاض
                      </p>
                      <p className="text-white text-sm">{pattern.lowMonths.join('، ')}</p>
                    </div>
                  </div>
                )}

                {pattern.triggers && (
                  <div className="p-2 bg-amber-500/10 rounded mb-3">
                    <p className="text-amber-400 text-xs">المحفزات: {pattern.triggers.join('، ')}</p>
                  </div>
                )}

                <div className="p-2 bg-green-500/10 border border-green-500/30 rounded">
                  <p className="text-green-400 text-sm">
                    <Zap className="w-4 h-4 inline ml-1" />
                    {pattern.recommendation}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="events" className="space-y-4 mt-4">
          <Card className="glass-card border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span className="text-amber-300 font-medium">ارتباطات مكتشفة</span>
              </div>
              <p className="text-slate-400 text-sm">أحداث أثرت على استخدام القطع</p>
            </CardContent>
          </Card>

          {eventCorrelations.map((event, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/20">
                        <Zap className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{event.event}</h3>
                        <p className="text-slate-400 text-sm">
                          <Calendar className="w-3 h-3 inline ml-1" />
                          {event.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-cyan-400 font-medium">{event.part}</p>
                      <Badge className="bg-red-500/20 text-red-400">{event.increase}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>

      {/* AI Analysis Results */}
      {aiAnalysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card border-purple-500/30 bg-purple-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-300 text-sm flex items-center gap-2">
                <Brain className="w-5 h-5" />
                تحليل AI للاتجاهات
                <Badge className="bg-purple-500/20 text-purple-400">دقة: {aiAnalysis.confidence}%</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300 text-sm">{aiAnalysis.insights}</p>

              {aiAnalysis.forecasts?.length > 0 && (
                <div>
                  <p className="text-slate-400 text-xs mb-2">توقعات الشهر القادم:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {aiAnalysis.forecasts.map((f, i) => (
                      <div key={i} className="p-2 bg-slate-800/50 rounded text-center">
                        <p className="text-white font-bold">{f.nextMonth}</p>
                        <p className="text-slate-400 text-xs">{f.part}</p>
                        <Badge className={f.trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          {f.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {aiAnalysis.recommendations?.length > 0 && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-xs font-medium mb-2">التوصيات:</p>
                  {aiAnalysis.recommendations.map((r, i) => (
                    <p key={i} className="text-slate-300 text-xs">• {r}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}