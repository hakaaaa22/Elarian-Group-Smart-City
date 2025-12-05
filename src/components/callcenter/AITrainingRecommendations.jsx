import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  GraduationCap, Target, Brain, Play, CheckCircle, AlertTriangle,
  TrendingUp, Award, Sparkles, Loader2, MessageSquare, Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function AITrainingRecommendations({ agentPerformance = 75, performanceGaps = [] }) {
  const [recommendations, setRecommendations] = useState(null);
  const [showSimulation, setShowSimulation] = useState(false);
  const [currentSimulation, setCurrentSimulation] = useState(null);
  const [simulationStep, setSimulationStep] = useState(0);
  const [userResponses, setUserResponses] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const analyzeGapsMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مدرب AI متخصص في تطوير وكلاء مراكز الاتصال.

أداء الوكيل الحالي: ${agentPerformance}%
الفجوات المحددة: ${performanceGaps.join(', ') || 'التعامل مع الشكاوى، البيع الإضافي، إدارة الوقت'}

قدم توصيات تدريبية مخصصة مع سيناريوهات تفاعلية للممارسة.`,
        response_json_schema: {
          type: "object",
          properties: {
            performance_analysis: { type: "string" },
            skill_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill: { type: "string" },
                  current_level: { type: "number" },
                  target_level: { type: "number" },
                  priority: { type: "string" }
                }
              }
            },
            training_modules: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  duration: { type: "string" },
                  difficulty: { type: "string" },
                  skills_covered: { type: "array", items: { type: "string" } }
                }
              }
            },
            simulations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  scenario: { type: "string" },
                  difficulty: { type: "string" },
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        customer_message: { type: "string" },
                        suggested_responses: { type: "array", items: { type: "string" } },
                        best_response_index: { type: "number" }
                      }
                    }
                  }
                }
              }
            },
            improvement_tips: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setRecommendations(data);
      toast.success('تم تحليل الأداء وإنشاء التوصيات');
    }
  });

  const startSimulation = (simulation) => {
    setCurrentSimulation(simulation);
    setSimulationStep(0);
    setUserResponses([]);
    setFeedback(null);
    setShowSimulation(true);
  };

  const handleResponse = (responseIndex) => {
    const newResponses = [...userResponses, responseIndex];
    setUserResponses(newResponses);
    
    if (simulationStep < currentSimulation.steps.length - 1) {
      setSimulationStep(prev => prev + 1);
    } else {
      generateFeedback(newResponses);
    }
  };

  const generateFeedback = async (responses) => {
    const correctCount = responses.filter((r, i) => 
      r === currentSimulation.steps[i].best_response_index
    ).length;
    const score = Math.round((correctCount / responses.length) * 100);
    
    setFeedback({
      score,
      correctCount,
      total: responses.length,
      message: score >= 80 ? 'أداء ممتاز!' : score >= 60 ? 'أداء جيد، يمكن التحسين' : 'يحتاج المزيد من التدريب'
    });
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-cyan-500/20">
            <GraduationCap className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h4 className="text-white font-bold">توصيات التدريب الذكية</h4>
            <p className="text-slate-400 text-xs">AI-Powered Training Recommendations</p>
          </div>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => analyzeGapsMutation.mutate()}
          disabled={analyzeGapsMutation.isPending}
        >
          {analyzeGapsMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <><Brain className="w-4 h-4 ml-2" /> تحليل الأداء</>
          )}
        </Button>
      </div>

      {recommendations && (
        <div className="space-y-4">
          {/* Skill Gaps */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                فجوات المهارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.skill_gaps?.map((gap, i) => (
                  <div key={i} className="p-2 bg-slate-900/50 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm">{gap.skill}</span>
                      <Badge className={`text-xs ${gap.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {gap.priority === 'high' ? 'أولوية عالية' : 'متوسطة'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={gap.current_level} className="flex-1 h-2" />
                      <span className="text-slate-400 text-xs">{gap.current_level}% → {gap.target_level}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Training Modules */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">الدورات التدريبية الموصى بها</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[150px]">
                <div className="space-y-2">
                  {recommendations.training_modules?.map((module, i) => (
                    <div key={i} className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium text-sm">{module.title}</span>
                        <Badge className="bg-slate-600 text-xs">{module.duration}</Badge>
                      </div>
                      <p className="text-slate-400 text-xs mt-1">{module.description}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Simulations */}
          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Play className="w-4 h-4 text-purple-400" />
                محاكاة تفاعلية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {recommendations.simulations?.map((sim, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto p-3 border-purple-500/30 text-right justify-start"
                    onClick={() => startSimulation(sim)}
                  >
                    <div>
                      <p className="text-white text-sm font-medium">{sim.title}</p>
                      <p className="text-slate-400 text-xs">{sim.difficulty}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Simulation Dialog */}
      <Dialog open={showSimulation} onOpenChange={setShowSimulation}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">{currentSimulation?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {!feedback ? (
              <>
                <Progress value={(simulationStep + 1) / (currentSimulation?.steps?.length || 1) * 100} className="h-2" />
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <p className="text-cyan-400 text-sm mb-3">
                      💬 العميل: {currentSimulation?.steps?.[simulationStep]?.customer_message}
                    </p>
                    <div className="space-y-2">
                      {currentSimulation?.steps?.[simulationStep]?.suggested_responses?.map((response, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          className="w-full text-right justify-start h-auto p-3 border-slate-600 hover:border-green-500"
                          onClick={() => handleResponse(i)}
                        >
                          {response}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className={`${feedback.score >= 80 ? 'bg-green-500/10 border-green-500/30' : feedback.score >= 60 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-2">{feedback.score >= 80 ? '🏆' : feedback.score >= 60 ? '👍' : '📚'}</div>
                  <p className="text-2xl font-bold text-white mb-2">{feedback.score}%</p>
                  <p className="text-slate-300">{feedback.message}</p>
                  <p className="text-slate-400 text-sm mt-2">{feedback.correctCount} من {feedback.total} إجابات صحيحة</p>
                  <Button className="mt-4 bg-purple-600" onClick={() => setShowSimulation(false)}>إغلاق</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}