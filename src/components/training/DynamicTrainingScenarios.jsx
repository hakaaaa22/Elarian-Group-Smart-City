import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  GraduationCap, Brain, Target, TrendingUp, Award, AlertTriangle, CheckCircle,
  MessageSquare, Play, Pause, RotateCcw, Star, Loader2, BarChart3, Clock,
  Zap, ArrowUp, ArrowDown, FileText, Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts';
import { toast } from 'sonner';

export default function DynamicTrainingScenarios({ agentId, agentProfile }) {
  const [currentScenario, setCurrentScenario] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [agentInput, setAgentInput] = useState('');
  const [difficulty, setDifficulty] = useState(1);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    responses: 0,
    avgScore: 0,
    improvements: [],
    weaknesses: [],
  });
  const [sessionReport, setSessionReport] = useState(null);
  const [agentWeaknesses, setAgentWeaknesses] = useState([
    'التعامل مع الشكاوى', 'البيع الإضافي', 'إدارة الوقت'
  ]);

  // Generate adaptive scenario
  const generateScenarioMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنشئ سيناريو تدريب ديناميكي متكيف:

مستوى الصعوبة الحالي: ${difficulty}/5
نقاط الضعف المحددة للوكيل: ${agentWeaknesses.join(', ')}
عدد الردود السابقة: ${sessionStats.responses}
متوسط الدرجات: ${sessionStats.avgScore}%

المتطلبات:
1. يجب أن يستهدف السيناريو نقاط الضعف
2. الصعوبة متدرجة بناءً على الأداء السابق
3. تضمين تحديات واقعية
4. أهداف واضحة وقابلة للقياس`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            difficulty_level: { type: "number" },
            target_weakness: { type: "string" },
            customer: {
              type: "object",
              properties: {
                name: { type: "string" },
                personality: { type: "string" },
                mood: { type: "string" },
                background: { type: "string" }
              }
            },
            situation: { type: "string" },
            objectives: { type: "array", items: { type: "string" } },
            success_criteria: { type: "array", items: { type: "string" } },
            initial_message: { type: "string" },
            hints: { type: "array", items: { type: "string" } },
            expected_duration: { type: "string" }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setCurrentScenario(data);
      setConversation([{
        id: 0,
        role: 'customer',
        message: data.initial_message,
        timestamp: new Date()
      }]);
      setSessionActive(true);
      setDifficulty(data.difficulty_level || difficulty);
      toast.success(`سيناريو جديد: ${data.title}`);
    }
  });

  // Evaluate response with personalized feedback
  const evaluateResponseMutation = useMutation({
    mutationFn: async (response) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قيّم رد الوكيل مع ملاحظات مخصصة:

السيناريو: ${currentScenario?.title}
نقطة الضعف المستهدفة: ${currentScenario?.target_weakness}
صعوبة: ${difficulty}/5

المحادثة:
${conversation.map(c => `${c.role === 'customer' ? 'العميل' : 'الوكيل'}: ${c.message}`).join('\n')}

رد الوكيل الجديد: "${response}"

قدم:
1. تقييم شامل (0-100)
2. تقييم مفصل لكل معيار
3. ملاحظات مخصصة بناءً على نقاط الضعف
4. اقتراحات تحسين محددة
5. رد العميل التالي
6. هل يجب زيادة/تقليل الصعوبة`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            criteria_scores: {
              type: "object",
              properties: {
                empathy: { type: "number" },
                problem_solving: { type: "number" },
                communication: { type: "number" },
                compliance: { type: "number" },
                efficiency: { type: "number" }
              }
            },
            personalized_feedback: { type: "string" },
            strengths_shown: { type: "array", items: { type: "string" } },
            areas_to_improve: { type: "array", items: { type: "string" } },
            specific_suggestions: { type: "array", items: { type: "string" } },
            customer_response: { type: "string" },
            customer_mood_change: { type: "string" },
            difficulty_adjustment: { type: "string" },
            objective_progress: { type: "number" },
            scenario_complete: { type: "boolean" }
          }
        }
      });
      return result;
    },
    onSuccess: (data, response) => {
      // Add agent response
      setConversation(prev => [...prev, {
        id: prev.length,
        role: 'agent',
        message: response,
        score: data.overall_score,
        feedback: data.personalized_feedback,
        timestamp: new Date()
      }]);

      // Update stats
      setSessionStats(prev => ({
        responses: prev.responses + 1,
        avgScore: Math.round((prev.avgScore * prev.responses + data.overall_score) / (prev.responses + 1)),
        improvements: [...new Set([...prev.improvements, ...data.strengths_shown])],
        weaknesses: [...new Set([...prev.weaknesses, ...data.areas_to_improve])],
      }));

      // Adjust difficulty
      if (data.difficulty_adjustment === 'increase' && difficulty < 5) {
        setDifficulty(prev => prev + 1);
        toast.info('تم زيادة مستوى الصعوبة! 📈');
      } else if (data.difficulty_adjustment === 'decrease' && difficulty > 1) {
        setDifficulty(prev => prev - 1);
      }

      // Add customer response
      if (!data.scenario_complete && data.customer_response) {
        setTimeout(() => {
          setConversation(prev => [...prev, {
            id: prev.length,
            role: 'customer',
            message: data.customer_response,
            mood: data.customer_mood_change,
            timestamp: new Date()
          }]);
        }, 1000);
      }

      if (data.scenario_complete) {
        generateSessionReport();
      }

      setAgentInput('');
    }
  });

  // Generate session report
  const generateSessionReport = async () => {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `أنشئ تقرير جلسة تدريب مفصل:

السيناريو: ${currentScenario?.title}
عدد الردود: ${sessionStats.responses}
متوسط الدرجات: ${sessionStats.avgScore}%
نقاط القوة المُظهرة: ${sessionStats.improvements.join(', ')}
المجالات للتحسين: ${sessionStats.weaknesses.join(', ')}

قدم تقريراً شاملاً يتضمن:
1. ملخص الأداء
2. تحليل مفصل للمهارات
3. مقارنة بالأداء السابق
4. خطة تحسين مخصصة
5. السيناريوهات المقترحة القادمة`,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          overall_grade: { type: "string" },
          skill_analysis: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill: { type: "string" },
                score: { type: "number" },
                trend: { type: "string" },
                feedback: { type: "string" }
              }
            }
          },
          key_achievements: { type: "array", items: { type: "string" } },
          improvement_areas: { type: "array", items: { type: "string" } },
          improvement_plan: { type: "array", items: { type: "string" } },
          recommended_scenarios: { type: "array", items: { type: "string" } },
          next_session_focus: { type: "string" }
        }
      }
    });
    setSessionReport(result);
    setSessionActive(false);
    toast.success('تم إنشاء تقرير الجلسة!');
  };

  const handleSubmit = () => {
    if (!agentInput.trim()) return;
    evaluateResponseMutation.mutate(agentInput);
  };

  const resetSession = () => {
    setCurrentScenario(null);
    setConversation([]);
    setSessionActive(false);
    setSessionStats({ responses: 0, avgScore: 0, improvements: [], weaknesses: [] });
    setSessionReport(null);
    setDifficulty(1);
  };

  const radarData = sessionReport?.skill_analysis?.map(s => ({
    skill: s.skill,
    score: s.score,
    fullMark: 100
  })) || [];

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={sessionActive ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: sessionActive ? Infinity : 0 }}
            className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20"
          >
            <GraduationCap className="w-5 h-5 text-purple-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">التدريب الديناميكي المتكيف</h4>
            <p className="text-slate-400 text-xs">سيناريوهات متدرجة • ملاحظات مخصصة • تقارير مفصلة</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-500/20 text-purple-400">
            الصعوبة: {difficulty}/5
          </Badge>
          {sessionActive && (
            <Button variant="outline" className="border-red-500/50 text-red-400 h-8" onClick={resetSession}>
              <RotateCcw className="w-3 h-3 ml-1" />
              إنهاء
            </Button>
          )}
        </div>
      </div>

      {/* Session Stats */}
      {sessionActive && (
        <div className="grid grid-cols-4 gap-3">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-white">{sessionStats.responses}</p>
              <p className="text-slate-400 text-xs">الردود</p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-green-400">{sessionStats.avgScore}%</p>
              <p className="text-slate-400 text-xs">المتوسط</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-purple-400">{difficulty}</p>
              <p className="text-slate-400 text-xs">الصعوبة</p>
            </CardContent>
          </Card>
          <Card className="bg-cyan-500/10 border-cyan-500/30">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-cyan-400">{sessionStats.improvements.length}</p>
              <p className="text-slate-400 text-xs">نقاط قوة</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Start Training */}
      {!sessionActive && !sessionReport && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-6 text-center">
            <GraduationCap className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h5 className="text-white font-bold text-lg mb-2">ابدأ جلسة تدريب جديدة</h5>
            <p className="text-slate-400 mb-4">سيتم إنشاء سيناريو متكيف مع مستواك ونقاط ضعفك</p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {agentWeaknesses.map((w, i) => (
                <Badge key={i} className="bg-amber-500/20 text-amber-400">{w}</Badge>
              ))}
            </div>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => generateScenarioMutation.mutate()}
              disabled={generateScenarioMutation.isPending}
            >
              {generateScenarioMutation.isPending ? (
                <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري الإنشاء...</>
              ) : (
                <><Play className="w-4 h-4 ml-2" /> بدء التدريب</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Training Session */}
      {sessionActive && currentScenario && (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Conversation */}
          <div className="lg:col-span-2 space-y-4">
            {/* Scenario Info */}
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-white font-medium">{currentScenario.title}</h5>
                  <Badge className="bg-amber-500/20 text-amber-400">{currentScenario.target_weakness}</Badge>
                </div>
                <p className="text-slate-400 text-sm">{currentScenario.situation}</p>
              </CardContent>
            </Card>

            {/* Chat */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-4">
                <ScrollArea className="h-[300px] mb-4">
                  <div className="space-y-3">
                    {conversation.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'agent' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          msg.role === 'agent' 
                            ? 'bg-cyan-500/20 border border-cyan-500/30' 
                            : 'bg-slate-700/50'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {msg.role === 'agent' ? 'أنت' : 'العميل'}
                            </Badge>
                            {msg.score && (
                              <Badge className={msg.score >= 70 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                                {msg.score}%
                              </Badge>
                            )}
                          </div>
                          <p className="text-white text-sm">{msg.message}</p>
                          {msg.feedback && (
                            <p className="text-cyan-400 text-xs mt-2 p-2 bg-slate-900/50 rounded">
                              💡 {msg.feedback}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Textarea
                    value={agentInput}
                    onChange={(e) => setAgentInput(e.target.value)}
                    placeholder="اكتب ردك..."
                    className="bg-slate-900/50 border-slate-700 text-white flex-1 h-20"
                    disabled={evaluateResponseMutation.isPending}
                  />
                  <Button
                    className="bg-cyan-600 hover:bg-cyan-700 h-auto"
                    onClick={handleSubmit}
                    disabled={evaluateResponseMutation.isPending || !agentInput.trim()}
                  >
                    {evaluateResponseMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <MessageSquare className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-400" />
                  الأهداف
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {currentScenario.objectives?.map((obj, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-300">{obj}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  تلميحات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[100px]">
                  <div className="space-y-1">
                    {currentScenario.hints?.map((hint, i) => (
                      <p key={i} className="text-slate-300 text-xs">💡 {hint}</p>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Session Report */}
      {sessionReport && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                تقرير الجلسة
              </CardTitle>
              <Badge className="bg-green-500/20 text-green-400 text-lg px-4 py-1">
                {sessionReport.overall_grade}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">{sessionReport.summary}</p>

            {/* Skills Radar */}
            {radarData.length > 0 && (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="skill" stroke="#94a3b8" fontSize={10} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" />
                    <Radar dataKey="score" stroke="#a855f7" fill="#a855f7" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h6 className="text-green-400 font-medium mb-2">الإنجازات</h6>
                {sessionReport.key_achievements?.map((a, i) => (
                  <p key={i} className="text-slate-300 text-sm">✓ {a}</p>
                ))}
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <h6 className="text-amber-400 font-medium mb-2">للتحسين</h6>
                {sessionReport.improvement_areas?.map((a, i) => (
                  <p key={i} className="text-slate-300 text-sm">• {a}</p>
                ))}
              </div>
            </div>

            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h6 className="text-cyan-400 font-medium mb-2">خطة التحسين</h6>
              {sessionReport.improvement_plan?.map((p, i) => (
                <p key={i} className="text-slate-300 text-sm">{i + 1}. {p}</p>
              ))}
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => generateScenarioMutation.mutate()}>
                <Play className="w-4 h-4 ml-2" />
                جلسة جديدة
              </Button>
              <Button variant="outline" className="border-slate-600">
                <Download className="w-4 h-4 ml-2" />
                تحميل التقرير
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}