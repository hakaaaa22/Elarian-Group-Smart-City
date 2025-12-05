import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Award, CheckCircle, XCircle, AlertTriangle, TrendingUp, TrendingDown,
  FileText, User, Star, Target, Shield, Clock, BarChart3, Brain,
  MessageSquare, Phone, Headphones, ThumbsUp, ThumbsDown, Loader2,
  ChevronRight, Play, Pause, Volume2, Mic, AlertCircle, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { toast } from 'sonner';

// QA Criteria
const qaCriteria = [
  { id: 'greeting', label: 'التحية', weight: 10 },
  { id: 'identification', label: 'التعريف بالاسم', weight: 5 },
  { id: 'listening', label: 'الاستماع الفعال', weight: 15 },
  { id: 'problem_understanding', label: 'فهم المشكلة', weight: 15 },
  { id: 'solution_accuracy', label: 'دقة الحل', weight: 20 },
  { id: 'professionalism', label: 'المهنية', weight: 10 },
  { id: 'script_adherence', label: 'اتباع البروتوكول', weight: 10 },
  { id: 'closing', label: 'الإغلاق', weight: 10 },
  { id: 'empathy', label: 'التعاطف', weight: 5 },
];

export default function AIQualityAssurance({ callData, agentData }) {
  const [qaResult, setQaResult] = useState(null);
  const [selectedCriteria, setSelectedCriteria] = useState(null);
  const [showCoaching, setShowCoaching] = useState(false);

  // AI QA Analysis
  const qaAnalysisMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت محلل جودة مكالمات خبير.

معلومات المكالمة:
- الوكيل: ${data.agent}
- المدة: ${data.duration}
- العميل: ${data.customer}
- الموضوع: ${data.subject}
- القناة: ${data.channel}

قم بتقييم المكالمة وفق المعايير التالية:
1. التحية (10%)
2. التعريف بالاسم (5%)
3. الاستماع الفعال (15%)
4. فهم المشكلة (15%)
5. دقة الحل (20%)
6. المهنية (10%)
7. اتباع البروتوكول (10%)
8. الإغلاق (10%)
9. التعاطف (5%)

قدم درجات من 0-100 لكل معيار مع ملاحظات تفصيلية ونصائح للتحسين.`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            grade: { type: "string" },
            criteria_scores: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  score: { type: "number" },
                  notes: { type: "string" },
                  passed: { type: "boolean" }
                }
              }
            },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            critical_errors: { type: "array", items: { type: "string" } },
            coaching_points: { type: "array", items: { type: "string" } },
            script_violations: { type: "array", items: { type: "string" } },
            compliance_status: { type: "string" },
            customer_satisfaction_prediction: { type: "number" },
            recommended_training: { type: "array", items: { type: "string" } },
            summary: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setQaResult(data);
      toast.success('تم تحليل جودة المكالمة');
    },
  });

  // Prepare radar chart data
  const radarData = qaResult?.criteria_scores?.map(cs => {
    const criteria = qaCriteria.find(c => c.id === cs.id);
    return {
      criteria: criteria?.label || cs.id,
      score: cs.score,
      fullMark: 100,
    };
  }) || [];

  // Mock trend data
  const trendData = [
    { week: 'W1', score: 82 },
    { week: 'W2', score: 85 },
    { week: 'W3', score: 78 },
    { week: 'W4', score: 88 },
    { week: 'W5', score: 92 },
    { week: 'W6', score: qaResult?.overall_score || 90 },
  ];

  const getGradeColor = (grade) => {
    if (grade === 'A' || grade === 'A+') return 'green';
    if (grade === 'B' || grade === 'B+') return 'cyan';
    if (grade === 'C' || grade === 'C+') return 'amber';
    return 'red';
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
            <Award className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">ضمان الجودة بالذكاء الاصطناعي</h3>
            <p className="text-slate-400 text-sm">AI Quality Assurance Engine</p>
          </div>
        </div>
        <Button
          className="bg-amber-600 hover:bg-amber-700"
          onClick={() => qaAnalysisMutation.mutate(callData || { agent: 'سارة أحمد', duration: '5:30', customer: 'أحمد محمد', subject: 'مشكلة GPS', channel: 'phone' })}
          disabled={qaAnalysisMutation.isPending}
        >
          {qaAnalysisMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              جاري التحليل...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 ml-2" />
              تحليل الجودة
            </>
          )}
        </Button>
      </div>

      {qaResult ? (
        <>
          {/* Overall Score */}
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className={`bg-${getGradeColor(qaResult.grade)}-500/10 border-${getGradeColor(qaResult.grade)}-500/30`}>
              <CardContent className="p-6 text-center">
                <div className="text-6xl font-bold text-white mb-2">{qaResult.overall_score}</div>
                <Badge className={`bg-${getGradeColor(qaResult.grade)}-500/20 text-${getGradeColor(qaResult.grade)}-400 text-lg px-4 py-1`}>
                  {qaResult.grade}
                </Badge>
                <p className="text-slate-400 text-sm mt-3">النتيجة الإجمالية</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-amber-400" />
                  <span className="text-white font-medium">رضا العميل المتوقع</span>
                </div>
                <div className="text-4xl font-bold text-amber-400 mb-2">
                  {qaResult.customer_satisfaction_prediction}%
                </div>
                <Progress value={qaResult.customer_satisfaction_prediction} className="h-2" />
              </CardContent>
            </Card>

            <Card className={`${qaResult.compliance_status === 'compliant' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <CardContent className="p-4 flex items-center gap-4">
                {qaResult.compliance_status === 'compliant' ? (
                  <Shield className="w-12 h-12 text-green-400" />
                ) : (
                  <AlertTriangle className="w-12 h-12 text-red-400" />
                )}
                <div>
                  <p className="text-white font-bold text-lg">
                    {qaResult.compliance_status === 'compliant' ? 'ملتزم' : 'غير ملتزم'}
                  </p>
                  <p className="text-slate-400 text-sm">حالة الامتثال</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Radar Chart & Criteria */}
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">مخطط الأداء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="criteria" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                      <Radar
                        name="الدرجة"
                        dataKey="score"
                        stroke="#22d3ee"
                        fill="#22d3ee"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">تفاصيل المعايير</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[280px]">
                  <div className="space-y-2">
                    {qaResult.criteria_scores?.map((cs, i) => {
                      const criteria = qaCriteria.find(c => c.id === cs.id);
                      return (
                        <div
                          key={i}
                          className={`p-2 rounded-lg cursor-pointer transition-all ${
                            cs.passed ? 'bg-green-500/10 hover:bg-green-500/20' : 'bg-red-500/10 hover:bg-red-500/20'
                          }`}
                          onClick={() => setSelectedCriteria(cs)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {cs.passed ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-400" />
                              )}
                              <span className="text-white text-sm">{criteria?.label}</span>
                            </div>
                            <span className={`font-bold ${cs.passed ? 'text-green-400' : 'text-red-400'}`}>
                              {cs.score}%
                            </span>
                          </div>
                          <Progress value={cs.score} className="h-1.5" />
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Strengths, Weaknesses, Coaching */}
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Strengths */}
            <Card className="bg-green-500/10 border-green-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-400 text-sm flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4" />
                  نقاط القوة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {qaResult.strengths?.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white">{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-400 text-sm flex items-center gap-2">
                  <ThumbsDown className="w-4 h-4" />
                  نقاط الضعف
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {qaResult.weaknesses?.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white">{w}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Coaching Points */}
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-purple-400 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  نصائح التحسين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {qaResult.coaching_points?.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ChevronRight className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white">{c}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Critical Errors & Script Violations */}
          {(qaResult.critical_errors?.length > 0 || qaResult.script_violations?.length > 0) && (
            <Card className="bg-red-500/10 border-red-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  أخطاء حرجة ومخالفات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {qaResult.critical_errors?.length > 0 && (
                    <div>
                      <p className="text-red-400 text-sm font-medium mb-2">أخطاء حرجة:</p>
                      <ul className="space-y-1">
                        {qaResult.critical_errors.map((e, i) => (
                          <li key={i} className="text-white text-sm flex items-start gap-2">
                            <XCircle className="w-3 h-3 text-red-400 mt-1 flex-shrink-0" />
                            {e}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {qaResult.script_violations?.length > 0 && (
                    <div>
                      <p className="text-orange-400 text-sm font-medium mb-2">مخالفات البروتوكول:</p>
                      <ul className="space-y-1">
                        {qaResult.script_violations.map((v, i) => (
                          <li key={i} className="text-white text-sm flex items-start gap-2">
                            <AlertTriangle className="w-3 h-3 text-orange-400 mt-1 flex-shrink-0" />
                            {v}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4">
              <p className="text-slate-300">{qaResult.summary}</p>
            </CardContent>
          </Card>

          {/* Recommended Training */}
          {qaResult.recommended_training?.length > 0 && (
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  التدريبات الموصى بها
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {qaResult.recommended_training.map((t, i) => (
                    <Badge key={i} className="bg-cyan-500/20 text-cyan-400">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-12 text-center">
            <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">اضغط على "تحليل الجودة" لبدء تقييم المكالمة</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}