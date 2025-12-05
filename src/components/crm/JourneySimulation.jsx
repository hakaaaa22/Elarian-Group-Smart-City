import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Play, User, AlertTriangle, Crown, MessageSquare, CheckCircle,
  XCircle, Clock, Brain, Sparkles, RotateCcw, Trophy, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const scenarioTypes = [
  { 
    id: 'at_risk', 
    name: 'عميل معرض للخطر', 
    icon: AlertTriangle, 
    color: 'red',
    description: 'تعامل مع عميل يفكر في إلغاء الخدمة'
  },
  { 
    id: 'high_value', 
    name: 'عميل ذو قيمة عالية', 
    icon: Crown, 
    color: 'amber',
    description: 'تعامل مع عميل VIP يتوقع خدمة استثنائية'
  },
  { 
    id: 'new_customer', 
    name: 'عميل جديد', 
    icon: User, 
    color: 'green',
    description: 'استقبل عميل جديد وساعده في البدء'
  },
  { 
    id: 'complaint', 
    name: 'شكوى', 
    icon: XCircle, 
    color: 'orange',
    description: 'تعامل مع شكوى عميل غاضب'
  },
];

export default function JourneySimulation({ onComplete }) {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [scenario, setScenario] = useState(null);
  const [responses, setResponses] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const generateScenarioMutation = useMutation({
    mutationFn: async (type) => {
      const scenarioConfig = scenarioTypes.find(s => s.id === type);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنشئ سيناريو محاكاة تفاعلية لتدريب وكيل خدمة العملاء:

نوع السيناريو: ${scenarioConfig.name}
الوصف: ${scenarioConfig.description}

أنشئ 4-5 خطوات تفاعلية، كل خطوة تتضمن:
1. رسالة/موقف العميل
2. 3 خيارات استجابة للوكيل (واحد ممتاز، واحد جيد، واحد ضعيف)
3. الاستجابة المثلى ولماذا

اجعل السيناريو واقعياً وتحدياً.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            customer_profile: {
              type: "object",
              properties: {
                name: { type: "string" },
                type: { type: "string" },
                history: { type: "string" },
                mood: { type: "string" }
              }
            },
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step_number: { type: "number" },
                  customer_message: { type: "string" },
                  context: { type: "string" },
                  options: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        text: { type: "string" },
                        quality: { type: "string" },
                        points: { type: "number" }
                      }
                    }
                  },
                  best_option_index: { type: "number" },
                  explanation: { type: "string" }
                }
              }
            },
            success_criteria: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setScenario(data);
      setIsSimulating(true);
      setCurrentStep(0);
      setResponses([]);
    }
  });

  const handleResponse = (optionIndex) => {
    const step = scenario.steps[currentStep];
    const option = step.options[optionIndex];
    
    setResponses(prev => [...prev, {
      step: currentStep,
      optionIndex,
      points: option.points,
      quality: option.quality
    }]);

    if (currentStep < scenario.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      generateFeedbackMutation.mutate();
    }
  };

  const generateFeedbackMutation = useMutation({
    mutationFn: async () => {
      const totalPoints = responses.reduce((sum, r) => sum + (r.points || 0), 0);
      const maxPoints = scenario.steps.length * 10;
      const score = Math.round((totalPoints / maxPoints) * 100);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قدم تقييماً شاملاً لأداء الوكيل في المحاكاة:

السيناريو: ${scenario.title}
النتيجة: ${score}%
الإجابات: ${responses.map((r, i) => `الخطوة ${i + 1}: ${scenario.steps[i].options[r.optionIndex].quality}`).join(', ')}

قدم:
1. ملخص الأداء
2. نقاط القوة
3. مجالات التحسين
4. نصائح محددة`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            performance_summary: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            tips: { type: "array", items: { type: "string" } },
            badge_earned: { type: "string" }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setFeedback(data);
      setShowResults(true);
      setIsSimulating(false);
      onComplete?.(data);
    }
  });

  const resetSimulation = () => {
    setSelectedScenario(null);
    setIsSimulating(false);
    setCurrentStep(0);
    setScenario(null);
    setResponses([]);
    setFeedback(null);
    setShowResults(false);
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          <Play className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h4 className="text-white font-bold">محاكاة رحلة العميل</h4>
          <p className="text-slate-400 text-xs">تدريب تفاعلي على سيناريوهات حقيقية</p>
        </div>
      </div>

      {!isSimulating && !showResults && (
        <div className="grid grid-cols-2 gap-3">
          {scenarioTypes.map(type => (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all hover:scale-105 ${
                selectedScenario === type.id 
                  ? `bg-${type.color}-500/20 border-${type.color}-500/50` 
                  : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
              }`}
              onClick={() => setSelectedScenario(type.id)}
            >
              <CardContent className="p-4">
                <type.icon className={`w-8 h-8 text-${type.color}-400 mb-2`} />
                <p className="text-white font-medium">{type.name}</p>
                <p className="text-slate-400 text-xs mt-1">{type.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedScenario && !isSimulating && !showResults && (
        <Button
          className="w-full bg-purple-600 hover:bg-purple-700"
          onClick={() => generateScenarioMutation.mutate(selectedScenario)}
          disabled={generateScenarioMutation.isPending}
        >
          {generateScenarioMutation.isPending ? (
            <><Clock className="w-4 h-4 ml-2 animate-spin" /> جاري إنشاء السيناريو...</>
          ) : (
            <><Play className="w-4 h-4 ml-2" /> بدء المحاكاة</>
          )}
        </Button>
      )}

      {/* Simulation Interface */}
      {isSimulating && scenario && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className="bg-purple-500/20 text-purple-400">{scenario.title}</Badge>
            <span className="text-slate-400 text-sm">الخطوة {currentStep + 1} من {scenario.steps.length}</span>
          </div>
          <Progress value={((currentStep + 1) / scenario.steps.length) * 100} className="h-2" />

          {/* Customer Profile */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{scenario.customer_profile?.name}</p>
                  <p className="text-slate-400 text-xs">{scenario.customer_profile?.type} • {scenario.customer_profile?.mood}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Step */}
          <Card className="bg-cyan-500/10 border-cyan-500/30">
            <CardContent className="p-4">
              <p className="text-slate-400 text-xs mb-2">{scenario.steps[currentStep]?.context}</p>
              <p className="text-white">💬 "{scenario.steps[currentStep]?.customer_message}"</p>
            </CardContent>
          </Card>

          {/* Response Options */}
          <div className="space-y-2">
            <p className="text-slate-400 text-sm">اختر استجابتك:</p>
            {scenario.steps[currentStep]?.options?.map((option, i) => (
              <Button
                key={i}
                variant="outline"
                className="w-full text-right justify-start h-auto p-3 border-slate-600 hover:border-purple-500 hover:bg-purple-500/10"
                onClick={() => handleResponse(i)}
              >
                <span className="text-white text-sm">{option.text}</span>
              </Button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              نتائج المحاكاة
            </DialogTitle>
          </DialogHeader>
          {feedback && (
            <div className="space-y-4 mt-4">
              <div className="text-center">
                <p className="text-5xl font-bold text-white mb-2">{feedback.overall_score}%</p>
                {feedback.badge_earned && (
                  <Badge className="bg-amber-500/20 text-amber-400">{feedback.badge_earned}</Badge>
                )}
              </div>

              <p className="text-slate-300 text-sm">{feedback.performance_summary}</p>

              {feedback.strengths?.length > 0 && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 font-medium text-sm mb-2">نقاط القوة:</p>
                  {feedback.strengths.map((s, i) => (
                    <p key={i} className="text-slate-300 text-xs flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-400" /> {s}
                    </p>
                  ))}
                </div>
              )}

              {feedback.improvements?.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-400 font-medium text-sm mb-2">مجالات التحسين:</p>
                  {feedback.improvements.map((s, i) => (
                    <p key={i} className="text-slate-300 text-xs flex items-center gap-1">
                      <Target className="w-3 h-3 text-amber-400" /> {s}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1 bg-purple-600" onClick={resetSimulation}>
                  <RotateCcw className="w-4 h-4 ml-2" />
                  محاكاة جديدة
                </Button>
                <Button variant="outline" className="border-slate-600" onClick={() => setShowResults(false)}>
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}