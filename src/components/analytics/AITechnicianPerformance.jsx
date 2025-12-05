import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, TrendingUp, TrendingDown, Award, Clock, CheckCircle,
  AlertTriangle, Brain, Zap, GraduationCap, Target, Star,
  BarChart3, Calendar, Wrench
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const technicianData = [
  {
    id: 1,
    name: 'محمد أحمد',
    specialty: 'تكييف',
    tasksCompleted: 145,
    avgCompletionTime: 1.8,
    customerRating: 4.8,
    firstTimeFixRate: 92,
    responseTime: 25,
    skills: { تكييف: 95, كهرباء: 70, سباكة: 40 },
    monthlyTasks: [
      { month: 'يوليو', tasks: 22 },
      { month: 'أغسطس', tasks: 28 },
      { month: 'سبتمبر', tasks: 25 },
      { month: 'أكتوبر', tasks: 24 },
      { month: 'نوفمبر', tasks: 26 },
      { month: 'ديسمبر', tasks: 20 },
    ],
    trainingNeeds: [],
    performanceScore: 88
  },
  {
    id: 2,
    name: 'خالد العلي',
    specialty: 'كاميرات',
    tasksCompleted: 98,
    avgCompletionTime: 2.2,
    customerRating: 4.5,
    firstTimeFixRate: 85,
    responseTime: 35,
    skills: { كاميرات: 90, شبكات: 85, كهرباء: 60 },
    monthlyTasks: [
      { month: 'يوليو', tasks: 15 },
      { month: 'أغسطس', tasks: 18 },
      { month: 'سبتمبر', tasks: 16 },
      { month: 'أكتوبر', tasks: 17 },
      { month: 'نوفمبر', tasks: 15 },
      { month: 'ديسمبر', tasks: 17 },
    ],
    trainingNeeds: ['الصيانة الوقائية', 'إدارة الوقت'],
    performanceScore: 78
  },
  {
    id: 3,
    name: 'فهد السعيد',
    specialty: 'أمن',
    tasksCompleted: 67,
    avgCompletionTime: 1.5,
    customerRating: 4.9,
    firstTimeFixRate: 95,
    responseTime: 20,
    skills: { أمن: 95, كهرباء: 80, شبكات: 75 },
    monthlyTasks: [
      { month: 'يوليو', tasks: 10 },
      { month: 'أغسطس', tasks: 12 },
      { month: 'سبتمبر', tasks: 11 },
      { month: 'أكتوبر', tasks: 12 },
      { month: 'نوفمبر', tasks: 11 },
      { month: 'ديسمبر', tasks: 11 },
    ],
    trainingNeeds: [],
    performanceScore: 92
  }
];

const trainingCourses = [
  { id: 1, name: 'الصيانة الوقائية المتقدمة', duration: '8 ساعات', level: 'متقدم' },
  { id: 2, name: 'إدارة الوقت للفنيين', duration: '4 ساعات', level: 'متوسط' },
  { id: 3, name: 'التعامل مع العملاء', duration: '6 ساعات', level: 'مبتدئ' },
  { id: 4, name: 'أنظمة التكييف الحديثة', duration: '12 ساعة', level: 'متقدم' },
];

export default function AITechnicianPerformance() {
  const [selectedTech, setSelectedTech] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const analysisMutation = useMutation({
    mutationFn: async (tech) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `حلل أداء الفني التالي وقدم توصيات للتطوير:

الاسم: ${tech.name}
التخصص: ${tech.specialty}
المهام المنجزة: ${tech.tasksCompleted}
متوسط وقت الإنجاز: ${tech.avgCompletionTime} ساعة
تقييم العملاء: ${tech.customerRating}/5
معدل الإصلاح من أول مرة: ${tech.firstTimeFixRate}%
درجة الأداء: ${tech.performanceScore}%

قدم:
1. تحليل نقاط القوة
2. مجالات التحسين
3. توصيات تدريبية محددة
4. توقع الأداء للربع القادم`,
        response_json_schema: {
          type: "object",
          properties: {
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            trainingRecommendations: { type: "array", items: { type: "string" } },
            performanceForecast: { type: "string" },
            overallAssessment: { type: "string" },
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

  const analyzeTechnician = (tech) => {
    setSelectedTech(tech);
    setIsAnalyzing(true);
    setAiAnalysis(null);
    analysisMutation.mutate(tech);
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6 text-cyan-400" />
            تحليل أداء الفنيين
          </h2>
          <p className="text-slate-400 text-sm">تنبؤ بالأداء وتحديد احتياجات التدريب</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-cyan-500/20 bg-cyan-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-cyan-400">{technicianData.length}</p>
            <p className="text-slate-400 text-xs">إجمالي الفنيين</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-green-500/20 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">
              {(technicianData.reduce((s, t) => s + t.performanceScore, 0) / technicianData.length).toFixed(0)}%
            </p>
            <p className="text-slate-400 text-xs">متوسط الأداء</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">
              {technicianData.reduce((s, t) => s + t.tasksCompleted, 0)}
            </p>
            <p className="text-slate-400 text-xs">إجمالي المهام</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-purple-500/20 bg-purple-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">
              {technicianData.filter(t => t.trainingNeeds.length > 0).length}
            </p>
            <p className="text-slate-400 text-xs">يحتاجون تدريب</p>
          </CardContent>
        </Card>
      </div>

      {/* Technicians List */}
      <div className="space-y-3">
        {technicianData.map((tech) => (
          <motion.div
            key={tech.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-cyan-500/20 text-cyan-400">
                      {tech.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-white font-bold">{tech.name}</h3>
                        <p className="text-slate-400 text-sm">{tech.specialty}</p>
                      </div>
                      <div className="text-left">
                        <p className={`text-2xl font-bold ${getScoreColor(tech.performanceScore)}`}>
                          {tech.performanceScore}%
                        </p>
                        <p className="text-slate-500 text-xs">درجة الأداء</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-2 mb-3">
                      <div className="p-2 bg-slate-800/50 rounded text-center">
                        <p className="text-cyan-400 font-bold text-sm">{tech.tasksCompleted}</p>
                        <p className="text-slate-500 text-[10px]">مهام منجزة</p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded text-center">
                        <p className="text-green-400 font-bold text-sm">{tech.avgCompletionTime}h</p>
                        <p className="text-slate-500 text-[10px]">متوسط الوقت</p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-amber-400 font-bold text-sm">{tech.customerRating}</span>
                        </div>
                        <p className="text-slate-500 text-[10px]">تقييم العملاء</p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded text-center">
                        <p className="text-purple-400 font-bold text-sm">{tech.firstTimeFixRate}%</p>
                        <p className="text-slate-500 text-[10px]">إصلاح أول مرة</p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded text-center">
                        <p className="text-white font-bold text-sm">{tech.responseTime}د</p>
                        <p className="text-slate-500 text-[10px]">وقت الاستجابة</p>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(tech.skills).map(([skill, level]) => (
                        <Badge 
                          key={skill} 
                          variant="outline" 
                          className={`border-slate-600 ${level >= 80 ? 'text-green-400' : level >= 60 ? 'text-amber-400' : 'text-slate-400'}`}
                        >
                          {skill}: {level}%
                        </Badge>
                      ))}
                    </div>

                    {/* Training Needs */}
                    {tech.trainingNeeds.length > 0 && (
                      <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-3">
                        <p className="text-amber-400 text-xs flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          احتياجات تدريبية: {tech.trainingNeeds.join('، ')}
                        </p>
                      </div>
                    )}

                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => analyzeTechnician(tech)}
                      disabled={isAnalyzing && selectedTech?.id === tech.id}
                    >
                      {isAnalyzing && selectedTech?.id === tech.id ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <Brain className="w-3 h-3 ml-1" />
                      )}
                      تحليل AI
                    </Button>

                    {/* AI Analysis */}
                    {aiAnalysis && selectedTech?.id === tech.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Brain className="w-5 h-5 text-purple-400" />
                          <span className="text-purple-300 font-medium">تحليل AI</span>
                        </div>
                        
                        <div className="space-y-3 text-sm">
                          {aiAnalysis.strengths?.length > 0 && (
                            <div>
                              <p className="text-green-400 text-xs mb-1">نقاط القوة:</p>
                              <ul className="space-y-1">
                                {aiAnalysis.strengths.map((s, i) => (
                                  <li key={i} className="text-slate-300 text-xs">✓ {s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {aiAnalysis.improvements?.length > 0 && (
                            <div>
                              <p className="text-amber-400 text-xs mb-1">مجالات التحسين:</p>
                              <ul className="space-y-1">
                                {aiAnalysis.improvements.map((s, i) => (
                                  <li key={i} className="text-slate-300 text-xs">• {s}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {aiAnalysis.trainingRecommendations?.length > 0 && (
                            <div className="p-2 bg-cyan-500/10 rounded">
                              <p className="text-cyan-400 text-xs mb-1">
                                <GraduationCap className="w-3 h-3 inline ml-1" />
                                توصيات التدريب:
                              </p>
                              {aiAnalysis.trainingRecommendations.map((t, i) => (
                                <p key={i} className="text-slate-300 text-xs">• {t}</p>
                              ))}
                            </div>
                          )}

                          <div className="p-2 bg-green-500/10 rounded">
                            <p className="text-green-400 text-xs">
                              <TrendingUp className="w-3 h-3 inline ml-1" />
                              {aiAnalysis.performanceForecast}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Training Courses */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
            الدورات التدريبية المتاحة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {trainingCourses.map(course => (
              <div key={course.id} className="p-3 bg-slate-800/50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{course.name}</p>
                  <p className="text-slate-400 text-xs">{course.duration} • {course.level}</p>
                </div>
                <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-400">
                  تسجيل
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}