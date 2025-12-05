import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  GraduationCap, Target, TrendingUp, BookOpen, Play, CheckCircle, Clock,
  Award, Brain, Sparkles, ChevronRight, Lock, Star, Zap, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const skillCategories = [
  { id: 'communication', name: 'مهارات التواصل', icon: '💬', color: 'cyan' },
  { id: 'problem_solving', name: 'حل المشكلات', icon: '🧩', color: 'purple' },
  { id: 'product_knowledge', name: 'معرفة المنتج', icon: '📚', color: 'blue' },
  { id: 'emotional_intelligence', name: 'الذكاء العاطفي', icon: '❤️', color: 'pink' },
  { id: 'technical', name: 'المهارات التقنية', icon: '⚙️', color: 'green' },
  { id: 'sales', name: 'مهارات البيع', icon: '💰', color: 'amber' },
];

export default function AgentLearningPathways({ agentId, agentPerformance }) {
  const [selectedPath, setSelectedPath] = useState(null);
  const [learningPaths, setLearningPaths] = useState([]);
  const [contentLibrary, setContentLibrary] = useState([]);

  const generatePathMutation = useMutation({
    mutationFn: async (performanceData) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `بناءً على بيانات أداء الوكيل التالية، أنشئ مسار تعلم مخصص:

الأداء الحالي: ${performanceData.score}%
نقاط الضعف: ${performanceData.gaps?.join(', ') || 'التعامل مع الشكاوى، البيع الإضافي'}
نقاط القوة: ${performanceData.strengths?.join(', ') || 'سرعة الرد، الودية'}
الخبرة: ${performanceData.experience || '6 أشهر'}

أنشئ:
1. 3-4 مسارات تعلم مخصصة
2. كل مسار يحتوي على 4-5 دروس
3. ترتيب الأولوية حسب فجوات الأداء
4. وقت تقديري لكل درس`,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_paths: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  skill_category: { type: "string" },
                  estimated_hours: { type: "number" },
                  lessons: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        type: { type: "string" },
                        duration_minutes: { type: "number" },
                        description: { type: "string" }
                      }
                    }
                  },
                  expected_improvement: { type: "string" }
                }
              }
            },
            skill_gaps_analysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill: { type: "string" },
                  current_level: { type: "number" },
                  target_level: { type: "number" },
                  improvement_plan: { type: "string" }
                }
              }
            },
            weekly_schedule: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setLearningPaths(data.recommended_paths || []);
      toast.success('تم إنشاء مسار التعلم المخصص');
    }
  });

  const generateContentMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنشئ مكتبة محتوى تعليمي ديناميكية لخدمة العملاء تتضمن أحدث الاتجاهات:

1. مقالات حول أفضل الممارسات
2. دروس فيديو قصيرة
3. اختبارات تفاعلية
4. دراسات حالة
5. نصائح يومية`,
        response_json_schema: {
          type: "object",
          properties: {
            trending_topics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  category: { type: "string" },
                  type: { type: "string" },
                  duration: { type: "string" },
                  difficulty: { type: "string" },
                  summary: { type: "string" },
                  tags: { type: "array", items: { type: "string" } }
                }
              }
            },
            daily_tip: { type: "string" },
            featured_course: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                modules: { type: "number" }
              }
            }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setContentLibrary(data.trending_topics || []);
      toast.success('تم تحديث مكتبة المحتوى');
    }
  });

  const startLesson = (lesson) => {
    toast.info(`بدء الدرس: ${lesson.title}`);
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <GraduationCap className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h4 className="text-white font-bold">مسارات التعلم المخصصة</h4>
            <p className="text-slate-400 text-xs">تدريب ذكي بناءً على أدائك</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-slate-600"
            onClick={() => generateContentMutation.mutate()}
            disabled={generateContentMutation.isPending}
          >
            <BookOpen className="w-4 h-4 ml-1" />
            تحديث المكتبة
          </Button>
          <Button
            size="sm"
            className="bg-purple-600"
            onClick={() => generatePathMutation.mutate({ score: agentPerformance || 75, gaps: ['الشكاوى', 'البيع'] })}
            disabled={generatePathMutation.isPending}
          >
            <Sparkles className="w-4 h-4 ml-1" />
            إنشاء مسار
          </Button>
        </div>
      </div>

      <Tabs defaultValue="paths">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="paths" className="data-[state=active]:bg-purple-500/20 text-xs">
            <Target className="w-3 h-3 ml-1" />
            المسارات
          </TabsTrigger>
          <TabsTrigger value="library" className="data-[state=active]:bg-cyan-500/20 text-xs">
            <BookOpen className="w-3 h-3 ml-1" />
            المكتبة
          </TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-green-500/20 text-xs">
            <BarChart3 className="w-3 h-3 ml-1" />
            التقدم
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paths" className="mt-4">
          {learningPaths.length === 0 ? (
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-8 text-center">
                <GraduationCap className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">اضغط "إنشاء مسار" لتحليل أدائك وإنشاء خطة تعلم مخصصة</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {learningPaths.map((path, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className={`bg-slate-800/30 border-slate-700/50 cursor-pointer hover:border-purple-500/50 transition-all ${selectedPath === i ? 'border-purple-500' : ''}`}
                    onClick={() => setSelectedPath(selectedPath === i ? null : i)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-${skillCategories.find(s => s.id === path.skill_category)?.color || 'purple'}-500/20 flex items-center justify-center`}>
                            <span className="text-xl">{skillCategories.find(s => s.id === path.skill_category)?.icon || '📚'}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{path.title}</p>
                            <p className="text-slate-400 text-xs">{path.lessons?.length || 0} دروس • {path.estimated_hours} ساعات</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`bg-${path.priority === 'high' ? 'red' : path.priority === 'medium' ? 'amber' : 'green'}-500/20 text-${path.priority === 'high' ? 'red' : path.priority === 'medium' ? 'amber' : 'green'}-400`}>
                            {path.priority === 'high' ? 'أولوية عالية' : path.priority === 'medium' ? 'متوسط' : 'منخفض'}
                          </Badge>
                          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${selectedPath === i ? 'rotate-90' : ''}`} />
                        </div>
                      </div>

                      {selectedPath === i && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 pt-4 border-t border-slate-700"
                        >
                          <p className="text-slate-300 text-sm mb-3">{path.description}</p>
                          <div className="space-y-2">
                            {path.lessons?.map((lesson, li) => (
                              <div key={li} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs text-purple-400">
                                    {li + 1}
                                  </div>
                                  <div>
                                    <p className="text-white text-sm">{lesson.title}</p>
                                    <p className="text-slate-500 text-xs">{lesson.duration_minutes} دقيقة • {lesson.type}</p>
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost" className="h-7" onClick={() => startLesson(lesson)}>
                                  <Play className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <p className="text-green-400 text-xs mt-3">📈 التحسن المتوقع: {path.expected_improvement}</p>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="library" className="mt-4">
          <ScrollArea className="h-[350px]">
            <div className="grid gap-3">
              {contentLibrary.length === 0 ? (
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardContent className="p-6 text-center">
                    <BookOpen className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">اضغط "تحديث المكتبة" لتحميل أحدث المحتوى</p>
                  </CardContent>
                </Card>
              ) : (
                contentLibrary.map((content, i) => (
                  <Card key={i} className="bg-slate-800/30 border-slate-700/50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-${content.type === 'video' ? 'red' : content.type === 'article' ? 'blue' : 'green'}-500/20 flex items-center justify-center`}>
                            {content.type === 'video' ? '🎥' : content.type === 'article' ? '📄' : '📝'}
                          </div>
                          <div>
                            <p className="text-white text-sm">{content.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs border-slate-600">{content.category}</Badge>
                              <span className="text-slate-500 text-xs">{content.duration}</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" className="h-7 bg-cyan-600">
                          <Play className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="progress" className="mt-4">
          <div className="grid grid-cols-2 gap-3">
            {skillCategories.map(skill => (
              <Card key={skill.id} className={`bg-${skill.color}-500/10 border-${skill.color}-500/30`}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{skill.icon}</span>
                    <span className="text-white text-sm">{skill.name}</span>
                  </div>
                  <Progress value={Math.random() * 40 + 50} className="h-2" />
                  <p className="text-slate-400 text-xs mt-1">{Math.floor(Math.random() * 40 + 50)}%</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}