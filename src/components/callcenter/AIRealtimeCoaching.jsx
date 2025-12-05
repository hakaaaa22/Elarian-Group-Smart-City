import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, Target, TrendingUp, AlertTriangle, CheckCircle, Lightbulb,
  Award, BookOpen, Mic, Clock, Zap, Star, MessageSquare, Volume2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export default function AIRealtimeCoaching({ isCallActive, callTranscript, agentPerformance }) {
  const [coachingTips, setCoachingTips] = useState([]);
  const [performanceScore, setPerformanceScore] = useState(85);
  const [improvements, setImprovements] = useState([]);
  const [suggestedTraining, setSuggestedTraining] = useState([]);
  const [realtimeFeedback, setRealtimeFeedback] = useState(null);

  const coachingMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مدرب خبير لمركز الاتصال. قم بتحليل أداء الوكيل وتقديم تدريب فوري:

نص المحادثة: "${data.transcript || 'استفسار العميل عن الخدمة'}"
درجة الأداء الحالية: ${data.performance || 85}%

قدم:
1. نصائح تدريبية فورية (3-5 نصائح)
2. مجالات التحسين المطلوبة
3. دورات تدريبية مقترحة
4. تقييم الأداء مقارنة بأفضل الممارسات
5. ملاحظات محددة للتحسين`,
        response_json_schema: {
          type: "object",
          properties: {
            realtime_tips: { type: "array", items: { type: "string" } },
            performance_score: { type: "number" },
            improvement_areas: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  area: { type: "string" },
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
                  name: { type: "string" },
                  duration: { type: "string" },
                  relevance: { type: "number" }
                }
              }
            },
            best_practices_comparison: { type: "string" },
            specific_feedback: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setCoachingTips(data.realtime_tips || []);
      setPerformanceScore(data.performance_score || 85);
      setImprovements(data.improvement_areas || []);
      setSuggestedTraining(data.training_modules || []);
      setRealtimeFeedback(data);
    }
  });

  useEffect(() => {
    if (isCallActive && callTranscript) {
      const timer = setTimeout(() => {
        coachingMutation.mutate({ transcript: callTranscript, performance: agentPerformance });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [callTranscript, isCallActive]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'amber';
      default: return 'green';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={isCallActive ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-cyan-500/20"
          >
            <Brain className="w-5 h-5 text-green-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold text-sm">التدريب الفوري AI</h4>
            <p className="text-slate-400 text-xs">Real-time Coaching</p>
          </div>
        </div>
        {isCallActive && (
          <Badge className="bg-green-500/20 text-green-400 animate-pulse">
            <Mic className="w-3 h-3 ml-1" />
            مكالمة نشطة
          </Badge>
        )}
      </div>

      {/* Performance Score */}
      <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">درجة الأداء الحالية</span>
            <span className="text-2xl font-bold text-white">{performanceScore}%</span>
          </div>
          <Progress value={performanceScore} className="h-2" />
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-slate-400">الهدف: 90%</span>
            <span className={`${performanceScore >= 90 ? 'text-green-400' : 'text-amber-400'}`}>
              {performanceScore >= 90 ? '✓ هدف محقق' : `${90 - performanceScore}% للوصول للهدف`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Tips */}
      <Card className="bg-amber-500/10 border-amber-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            نصائح فورية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            <ScrollArea className="h-[120px]">
              <div className="space-y-2">
                {coachingTips.length > 0 ? coachingTips.map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-2 bg-slate-900/50 rounded-lg flex items-start gap-2"
                  >
                    <Zap className="w-3 h-3 text-amber-400 mt-1 flex-shrink-0" />
                    <span className="text-slate-300 text-xs">{tip}</span>
                  </motion.div>
                )) : (
                  <div className="text-center py-4 text-slate-500 text-sm">
                    ستظهر النصائح أثناء المكالمة
                  </div>
                )}
              </div>
            </ScrollArea>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Improvement Areas */}
      {improvements.length > 0 && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              مجالات التحسين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {improvements.slice(0, 3).map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-xs">{item.area}</span>
                    <Badge className={`bg-${getPriorityColor(item.priority)}-500/20 text-${getPriorityColor(item.priority)}-400 text-xs`}>
                      {item.priority === 'high' ? 'أولوية عالية' : item.priority === 'medium' ? 'متوسط' : 'منخفض'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={item.current_level} className="flex-1 h-1.5" />
                    <span className="text-slate-400 text-xs">{item.current_level}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggested Training */}
      {suggestedTraining.length > 0 && (
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              دورات مقترحة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {suggestedTraining.slice(0, 3).map((module, i) => (
                <div key={i} className="p-2 bg-slate-900/50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-white text-xs">{module.name}</p>
                      <p className="text-slate-400 text-xs">{module.duration}</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                    {module.relevance}% ملاءمة
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}