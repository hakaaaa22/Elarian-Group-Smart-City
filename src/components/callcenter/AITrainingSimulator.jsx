import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  GraduationCap, Play, Brain, MessageCircle, Target, Award, CheckCircle,
  AlertTriangle, User, Clock, Star, TrendingUp, BookOpen, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const scenarioTypes = [
  { id: 'complaint', name: 'شكوى عميل غاضب', difficulty: 'hard', icon: '😠' },
  { id: 'technical', name: 'مشكلة تقنية', difficulty: 'medium', icon: '🔧' },
  { id: 'inquiry', name: 'استفسار عام', difficulty: 'easy', icon: '❓' },
  { id: 'refund', name: 'طلب استرداد', difficulty: 'hard', icon: '💰' },
  { id: 'urgent', name: 'حالة طارئة', difficulty: 'critical', icon: '🚨' },
];

export default function AITrainingSimulator() {
  const [activeScenario, setActiveScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [agentResponse, setAgentResponse] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [trainingModules, setTrainingModules] = useState([]);

  const generateScenario = useMutation({
    mutationFn: async (type) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مدرب مركز اتصال. قم بإنشاء سيناريو تدريبي واقعي من نوع: ${type.name}

أنشئ:
1. وصف الموقف والخلفية
2. شخصية العميل ومزاجه
3. المشكلة الأساسية
4. الرسالة الأولى من العميل
5. معايير التقييم للسيناريو`,
        response_json_schema: {
          type: "object",
          properties: {
            situation: { type: "string" },
            customerPersona: { type: "string" },
            mainIssue: { type: "string" },
            initialMessage: { type: "string" },
            evaluationCriteria: { type: "array", items: { type: "string" } },
            idealResponse: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data, type) => {
      setActiveScenario({ ...type, ...data });
      setMessages([{ role: 'customer', text: data.initialMessage }]);
      setEvaluation(null);
      toast.success('تم إنشاء السيناريو');
    }
  });

  const evaluateResponse = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `قيّم رد الوكيل على سيناريو التدريب:

السيناريو: ${activeScenario.situation}
رسالة العميل: ${messages[messages.length - 1]?.text}
رد الوكيل: ${agentResponse}
الرد المثالي: ${activeScenario.idealResponse}

قيّم على المعايير التالية (من 100):
1. التواصل والاحترافية
2. حل المشكلة
3. الالتزام بالبروتوكولات
4. التعاطف مع العميل
5. سرعة الاستجابة

قدم أيضاً:
- نقاط القوة
- نقاط التحسين
- وحدات تدريبية مقترحة`,
        response_json_schema: {
          type: "object",
          properties: {
            scores: {
              type: "object",
              properties: {
                communication: { type: "number" },
                problemSolving: { type: "number" },
                protocols: { type: "number" },
                empathy: { type: "number" },
                speed: { type: "number" }
              }
            },
            overallScore: { type: "number" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            suggestedModules: { type: "array", items: { type: "string" } },
            feedback: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setEvaluation(data);
      setTrainingModules(data.suggestedModules || []);
      setMessages(prev => [...prev, { role: 'agent', text: agentResponse }]);
      setAgentResponse('');
      toast.success('تم تقييم الرد');
    }
  });

  const submitResponse = () => {
    if (!agentResponse.trim()) return;
    evaluateResponse.mutate();
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'easy': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-amber-500/20 text-amber-400';
      case 'hard': return 'bg-red-500/20 text-red-400';
      case 'critical': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-purple-400" />
          محاكاة التدريب بالذكاء الاصطناعي
        </h3>
      </div>

      {!activeScenario ? (
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {scenarioTypes.map(type => (
            <Card key={type.id} className="bg-slate-800/50 border-slate-700 cursor-pointer hover:border-purple-500/50 transition-all"
              onClick={() => generateScenario.mutate(type)}>
              <CardContent className="p-4 text-center">
                <span className="text-3xl block mb-2">{type.icon}</span>
                <p className="text-white font-medium text-sm">{type.name}</p>
                <Badge className={`mt-2 ${getDifficultyColor(type.difficulty)}`}>
                  {type.difficulty === 'easy' ? 'سهل' : type.difficulty === 'medium' ? 'متوسط' : type.difficulty === 'hard' ? 'صعب' : 'حرج'}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Scenario Info */}
          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">معلومات السيناريو</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-slate-400 text-xs">الموقف</p>
                <p className="text-white text-sm">{activeScenario.situation}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">شخصية العميل</p>
                <p className="text-white text-sm">{activeScenario.customerPersona}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">المشكلة</p>
                <p className="text-amber-400 text-sm">{activeScenario.mainIssue}</p>
              </div>
              <Button size="sm" variant="outline" className="w-full border-slate-600" onClick={() => setActiveScenario(null)}>
                <RefreshCw className="w-3 h-3 ml-1" />
                سيناريو جديد
              </Button>
            </CardContent>
          </Card>

          {/* Chat Simulation */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">المحادثة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {messages.map((msg, i) => (
                  <div key={i} className={`p-3 rounded-lg ${msg.role === 'customer' ? 'bg-red-500/10 border border-red-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
                    <p className={`text-xs mb-1 ${msg.role === 'customer' ? 'text-red-400' : 'text-green-400'}`}>
                      {msg.role === 'customer' ? '👤 العميل' : '🎧 الوكيل'}
                    </p>
                    <p className="text-white text-sm">{msg.text}</p>
                  </div>
                ))}
              </div>
              <Textarea
                value={agentResponse}
                onChange={(e) => setAgentResponse(e.target.value)}
                placeholder="اكتب ردك كوكيل..."
                className="bg-slate-900/50 border-slate-700 text-white mb-2"
                rows={3}
              />
              <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={submitResponse} disabled={evaluateResponse.isPending}>
                {evaluateResponse.isPending ? 'جاري التقييم...' : 'إرسال وتقييم'}
              </Button>
            </CardContent>
          </Card>

          {/* Evaluation */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">التقييم</CardTitle>
            </CardHeader>
            <CardContent>
              {evaluation ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <p className="text-3xl font-bold text-cyan-400">{evaluation.overallScore}%</p>
                    <p className="text-slate-400 text-sm">النتيجة الإجمالية</p>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'التواصل', key: 'communication' },
                      { label: 'حل المشكلة', key: 'problemSolving' },
                      { label: 'البروتوكولات', key: 'protocols' },
                      { label: 'التعاطف', key: 'empathy' },
                    ].map(item => (
                      <div key={item.key}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">{item.label}</span>
                          <span className="text-white">{evaluation.scores?.[item.key]}%</span>
                        </div>
                        <Progress value={evaluation.scores?.[item.key] || 0} className="h-2" />
                      </div>
                    ))}
                  </div>
                  {evaluation.improvements?.length > 0 && (
                    <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded">
                      <p className="text-amber-400 text-xs font-medium mb-1">نقاط التحسين:</p>
                      <ul className="text-white text-xs space-y-1">
                        {evaluation.improvements.slice(0, 3).map((imp, i) => <li key={i}>• {imp}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">أرسل ردك للحصول على التقييم</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Training Modules */}
      {trainingModules.length > 0 && (
        <Card className="bg-green-500/10 border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-green-400" />
              وحدات تدريبية مقترحة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trainingModules.map((module, i) => (
                <Badge key={i} className="bg-green-500/20 text-green-400">{module}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}