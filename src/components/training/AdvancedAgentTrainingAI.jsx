import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  GraduationCap, Brain, MessageSquare, Play, Pause, RotateCcw, CheckCircle,
  XCircle, AlertTriangle, Target, Zap, Users, Award, Mic, Volume2,
  Loader2, Clock, Star, TrendingUp, Shield, Heart, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const scenarioTypes = [
  { id: 'complaint', name: 'التعامل مع الشكاوى', icon: AlertTriangle, color: 'red' },
  { id: 'upsell', name: 'البيع الإضافي', icon: TrendingUp, color: 'green' },
  { id: 'technical', name: 'الدعم الفني', icon: Shield, color: 'blue' },
  { id: 'angry', name: 'العميل الغاضب', icon: Heart, color: 'orange' },
  { id: 'retention', name: 'الاحتفاظ بالعميل', icon: Users, color: 'purple' },
];

export default function AdvancedAgentTrainingAI({ agentId }) {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [rolePlayActive, setRolePlayActive] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [agentInput, setAgentInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [sessionStats, setSessionStats] = useState({
    totalResponses: 0,
    goodResponses: 0,
    avgSentiment: 0,
    complianceScore: 100,
  });

  // Generate scenario
  const generateScenarioMutation = useMutation({
    mutationFn: async (type) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بإنشاء سيناريو تدريبي لوكيل مركز اتصال من نوع: ${type}

قم بإنشاء:
1. وصف السيناريو والسياق
2. شخصية العميل (الاسم، المزاج، الخلفية)
3. المشكلة أو الطلب الرئيسي
4. 3 رسائل أولية من العميل
5. الأهداف التي يجب على الوكيل تحقيقها
6. المعايير التي سيتم التقييم عليها
7. الكلمات والعبارات الممنوعة
8. أفضل الممارسات المتوقعة`,
        response_json_schema: {
          type: "object",
          properties: {
            scenario_id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            difficulty: { type: "string" },
            customer: {
              type: "object",
              properties: {
                name: { type: "string" },
                mood: { type: "string" },
                background: { type: "string" },
                personality: { type: "string" }
              }
            },
            main_issue: { type: "string" },
            initial_messages: { type: "array", items: { type: "string" } },
            objectives: { type: "array", items: { type: "string" } },
            evaluation_criteria: { type: "array", items: { type: "string" } },
            forbidden_phrases: { type: "array", items: { type: "string" } },
            best_practices: { type: "array", items: { type: "string" } },
            expected_duration: { type: "string" }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setSelectedScenario(data);
      setConversation(data.initial_messages?.map((msg, i) => ({
        id: i,
        role: 'customer',
        message: msg,
        timestamp: new Date()
      })) || []);
      setRolePlayActive(true);
      toast.success('تم إنشاء السيناريو');
    }
  });

  // Evaluate response
  const evaluateResponseMutation = useMutation({
    mutationFn: async (response) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قيّم رد الوكيل في سيناريو التدريب:

السيناريو: ${selectedScenario?.title}
المشكلة: ${selectedScenario?.main_issue}
شخصية العميل: ${selectedScenario?.customer?.personality} - ${selectedScenario?.customer?.mood}

المحادثة السابقة:
${conversation.map(c => `${c.role === 'customer' ? 'العميل' : 'الوكيل'}: ${c.message}`).join('\n')}

رد الوكيل الجديد: "${response}"

الأهداف: ${selectedScenario?.objectives?.join(', ')}
العبارات الممنوعة: ${selectedScenario?.forbidden_phrases?.join(', ')}

قيّم الرد من حيث:
1. جودة الرد (0-100)
2. تحليل المشاعر
3. الامتثال
4. نقاط القوة
5. نقاط الضعف
6. اقتراحات التحسين
7. رد العميل التالي`,
        response_json_schema: {
          type: "object",
          properties: {
            quality_score: { type: "number" },
            sentiment_handling: { type: "string" },
            compliance_score: { type: "number" },
            compliance_issues: { type: "array", items: { type: "string" } },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            improvement_suggestions: { type: "array", items: { type: "string" } },
            customer_next_response: { type: "string" },
            customer_mood_change: { type: "string" },
            objective_progress: { type: "number" },
            scenario_complete: { type: "boolean" },
            final_grade: { type: "string" }
          }
        }
      });
      return result;
    },
    onSuccess: (data, response) => {
      setFeedback(data);
      
      // Add agent response to conversation
      setConversation(prev => [...prev, {
        id: prev.length,
        role: 'agent',
        message: response,
        timestamp: new Date(),
        score: data.quality_score
      }]);

      // Add customer response
      if (data.customer_next_response && !data.scenario_complete) {
        setTimeout(() => {
          setConversation(prev => [...prev, {
            id: prev.length,
            role: 'customer',
            message: data.customer_next_response,
            timestamp: new Date(),
            mood: data.customer_mood_change
          }]);
        }, 1000);
      }

      // Update stats
      setSessionStats(prev => ({
        totalResponses: prev.totalResponses + 1,
        goodResponses: prev.goodResponses + (data.quality_score >= 70 ? 1 : 0),
        avgSentiment: Math.round((prev.avgSentiment * prev.totalResponses + data.quality_score) / (prev.totalResponses + 1)),
        complianceScore: Math.min(prev.complianceScore, data.compliance_score),
      }));

      if (data.scenario_complete) {
        toast.success(`انتهى السيناريو! التقييم النهائي: ${data.final_grade}`);
        setRolePlayActive(false);
      }

      setAgentInput('');
    }
  });

  const handleSubmitResponse = () => {
    if (!agentInput.trim()) return;
    evaluateResponseMutation.mutate(agentInput);
  };

  const resetSession = () => {
    setSelectedScenario(null);
    setConversation([]);
    setFeedback(null);
    setRolePlayActive(false);
    setSessionStats({
      totalResponses: 0,
      goodResponses: 0,
      avgSentiment: 0,
      complianceScore: 100,
    });
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={rolePlayActive ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: rolePlayActive ? Infinity : 0 }}
            className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20"
          >
            <GraduationCap className="w-5 h-5 text-purple-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">التدريب المتقدم بالذكاء الاصطناعي</h4>
            <p className="text-slate-400 text-xs">سيناريوهات تفاعلية • تقييم فوري • تحسين مستمر</p>
          </div>
        </div>
        {rolePlayActive && (
          <Button variant="outline" className="border-red-500/50 text-red-400" onClick={resetSession}>
            <RotateCcw className="w-4 h-4 ml-2" />
            إنهاء الجلسة
          </Button>
        )}
      </div>

      {/* Session Stats */}
      {rolePlayActive && (
        <div className="grid grid-cols-4 gap-3">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-white">{sessionStats.totalResponses}</p>
              <p className="text-slate-400 text-xs">الردود</p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-green-400">{sessionStats.goodResponses}</p>
              <p className="text-slate-400 text-xs">ردود جيدة</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-purple-400">{sessionStats.avgSentiment}%</p>
              <p className="text-slate-400 text-xs">متوسط الجودة</p>
            </CardContent>
          </Card>
          <Card className="bg-cyan-500/10 border-cyan-500/30">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-cyan-400">{sessionStats.complianceScore}%</p>
              <p className="text-slate-400 text-xs">الامتثال</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scenario Selection */}
      {!rolePlayActive && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">اختر نوع السيناريو</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {scenarioTypes.map((type) => (
                <Button
                  key={type.id}
                  variant="outline"
                  className={`h-auto flex-col p-4 border-${type.color}-500/30 hover:bg-${type.color}-500/10`}
                  onClick={() => generateScenarioMutation.mutate(type.name)}
                  disabled={generateScenarioMutation.isPending}
                >
                  {generateScenarioMutation.isPending ? (
                    <Loader2 className="w-6 h-6 mb-2 animate-spin" />
                  ) : (
                    <type.icon className={`w-6 h-6 mb-2 text-${type.color}-400`} />
                  )}
                  <span className="text-sm">{type.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Play Area */}
      {rolePlayActive && selectedScenario && (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Conversation */}
          <div className="lg:col-span-2 space-y-4">
            {/* Scenario Info */}
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-white font-medium">{selectedScenario.title}</h5>
                  <Badge className="bg-purple-500/20 text-purple-400">{selectedScenario.difficulty}</Badge>
                </div>
                <p className="text-slate-400 text-sm">{selectedScenario.description}</p>
                <div className="mt-2 p-2 bg-slate-900/50 rounded">
                  <p className="text-cyan-400 text-xs">العميل: {selectedScenario.customer?.name} - {selectedScenario.customer?.mood}</p>
                </div>
              </CardContent>
            </Card>

            {/* Chat */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">المحادثة</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] mb-4">
                  <div className="space-y-3">
                    <AnimatePresence>
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
                              {msg.mood && (
                                <Badge className="bg-purple-500/20 text-purple-400 text-xs">{msg.mood}</Badge>
                              )}
                            </div>
                            <p className="text-white text-sm">{msg.message}</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="flex gap-2">
                  <Textarea
                    value={agentInput}
                    onChange={(e) => setAgentInput(e.target.value)}
                    placeholder="اكتب ردك على العميل..."
                    className="bg-slate-900/50 border-slate-700 text-white flex-1 h-20"
                    disabled={evaluateResponseMutation.isPending}
                  />
                  <Button
                    className="bg-cyan-600 hover:bg-cyan-700 h-auto"
                    onClick={handleSubmitResponse}
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
            {/* Objectives */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-400" />
                  الأهداف
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {selectedScenario.objectives?.map((obj, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-300">{obj}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Forbidden Phrases */}
            <Card className="bg-red-500/10 border-red-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  عبارات ممنوعة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {selectedScenario.forbidden_phrases?.map((phrase, i) => (
                    <Badge key={i} className="bg-red-500/20 text-red-400 text-xs">{phrase}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Real-time Feedback */}
            {feedback && (
              <Card className={`border ${feedback.quality_score >= 70 ? 'bg-green-500/10 border-green-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-400" />
                      تقييم الرد
                    </span>
                    <Badge className={feedback.quality_score >= 70 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                      {feedback.quality_score}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {feedback.strengths?.length > 0 && (
                    <div>
                      <p className="text-green-400 text-xs mb-1">نقاط القوة:</p>
                      {feedback.strengths.map((s, i) => (
                        <p key={i} className="text-slate-300 text-xs">✓ {s}</p>
                      ))}
                    </div>
                  )}
                  {feedback.weaknesses?.length > 0 && (
                    <div>
                      <p className="text-amber-400 text-xs mb-1">للتحسين:</p>
                      {feedback.weaknesses.map((w, i) => (
                        <p key={i} className="text-slate-300 text-xs">• {w}</p>
                      ))}
                    </div>
                  )}
                  {feedback.improvement_suggestions?.length > 0 && (
                    <div>
                      <p className="text-cyan-400 text-xs mb-1">اقتراحات:</p>
                      {feedback.improvement_suggestions.map((s, i) => (
                        <p key={i} className="text-slate-300 text-xs">💡 {s}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Best Practices */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  أفضل الممارسات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[120px]">
                  <div className="space-y-1">
                    {selectedScenario.best_practices?.map((practice, i) => (
                      <p key={i} className="text-slate-300 text-xs">⭐ {practice}</p>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}