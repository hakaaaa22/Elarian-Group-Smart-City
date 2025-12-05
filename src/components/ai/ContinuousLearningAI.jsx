import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, TrendingUp, Zap, Target, Activity, BarChart3, Sparkles,
  Database, Users, Clock, CheckCircle, AlertTriangle, Eye, Settings,
  RefreshCw, Loader2, Award, Shield, Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// Training metrics over time
const trainingMetrics = [
  { week: 'W1', accuracy: 75, predictions: 120, feedback: 85 },
  { week: 'W2', accuracy: 78, predictions: 145, feedback: 88 },
  { week: 'W3', accuracy: 82, predictions: 168, feedback: 90 },
  { week: 'W4', accuracy: 85, predictions: 190, feedback: 92 },
  { week: 'W5', accuracy: 88, predictions: 215, feedback: 94 },
  { week: 'W6', accuracy: 91, predictions: 240, feedback: 96 },
];

// Model performance by category
const modelPerformance = [
  { category: 'تحليل المشاعر', score: 94, samples: 1250 },
  { category: 'التنبؤ بالصيانة', score: 88, samples: 850 },
  { category: 'كشف الشذوذ', score: 91, samples: 920 },
  { category: 'تصنيف التذاكر', score: 96, samples: 1580 },
  { category: 'التوجيه الذكي', score: 89, samples: 760 },
  { category: 'تحليل السلوك', score: 92, samples: 1120 },
];

const radarData = modelPerformance.map(m => ({
  category: m.category.split(' ')[0],
  score: m.score,
  fullMark: 100,
}));

export default function ContinuousLearningAI() {
  const [isRetraining, setIsRetraining] = useState(false);

  const { data: feedbackData = [] } = useQuery({
    queryKey: ['ai-feedback'],
    queryFn: async () => {
      // Mock data - في الواقع سيكون من قاعدة البيانات
      return [
        { type: 'positive', count: 842, percentage: 78 },
        { type: 'neutral', count: 165, percentage: 15 },
        { type: 'negative', count: 73, percentage: 7 },
      ];
    },
  });

  const stats = {
    totalSamples: 15420,
    lastUpdate: '2025-01-15 10:30',
    accuracy: 91,
    improvementRate: 12,
    activeModels: 12,
    trainingJobs: 3,
  };

  const startRetraining = async () => {
    setIsRetraining(true);
    setTimeout(() => {
      setIsRetraining(false);
      toast.success('تم إعادة تدريب النماذج بنجاح');
    }, 3000);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20"
          >
            <Brain className="w-6 h-6 text-purple-400" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-white">التعلم المستمر للذكاء الاصطناعي</h3>
            <p className="text-slate-400 text-sm">Continuous AI Learning & Model Improvement</p>
          </div>
        </div>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={startRetraining}
          disabled={isRetraining}
        >
          {isRetraining ? (
            <>
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              جاري التدريب...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة التدريب
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <Database className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{stats.totalSamples.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">عينات التدريب</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <Target className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{stats.accuracy}%</p>
            <p className="text-[10px] text-slate-400">الدقة</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <TrendingUp className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">+{stats.improvementRate}%</p>
            <p className="text-[10px] text-slate-400">التحسن</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <Brain className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{stats.activeModels}</p>
            <p className="text-[10px] text-slate-400">نماذج نشطة</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <Activity className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{stats.trainingJobs}</p>
            <p className="text-[10px] text-slate-400">تدريبات جارية</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-700/30 border-slate-600/30">
          <CardContent className="p-3 text-center">
            <Clock className="w-4 h-4 text-slate-400 mx-auto mb-1" />
            <p className="text-xs font-bold text-white">{stats.lastUpdate.split(' ')[1]}</p>
            <p className="text-[10px] text-slate-400">آخر تحديث</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Training Progress */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              تطور الدقة بمرور الوقت
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trainingMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="accuracy" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} name="الدقة %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Model Performance Radar */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              أداء النماذج
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                  <Radar
                    name="الدرجة"
                    dataKey="score"
                    stroke="#a855f7"
                    fill="#a855f7"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Performance List */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            أداء النماذج حسب الفئة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {modelPerformance.map((model, i) => (
              <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{model.category}</span>
                  <Badge className={`${
                    model.score >= 90 ? 'bg-green-500/20 text-green-400' :
                    model.score >= 80 ? 'bg-cyan-500/20 text-cyan-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {model.score}%
                  </Badge>
                </div>
                <Progress value={model.score} className="h-2 mb-1" />
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">{model.samples.toLocaleString()} عينة</span>
                  <span className={`${model.score >= 90 ? 'text-green-400' : model.score >= 80 ? 'text-cyan-400' : 'text-amber-400'}`}>
                    {model.score >= 90 ? 'ممتاز' : model.score >= 80 ? 'جيد جداً' : 'جيد'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Sources */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-cyan-400" />
            مصادر التعلم النشطة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { source: 'تفاعلات المستخدمين', count: '2,450', icon: Users, color: 'cyan' },
              { source: 'تقييمات الجودة', count: '1,840', icon: Award, color: 'amber' },
              { source: 'نتائج التذاكر', count: '3,120', icon: CheckCircle, color: 'green' },
              { source: 'بيانات التليماتكس', count: '5,680', icon: Activity, color: 'purple' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className={`p-3 bg-${item.color}-500/10 border border-${item.color}-500/30 rounded-lg`}>
                  <Icon className={`w-5 h-5 text-${item.color}-400 mb-2`} />
                  <p className="text-white font-bold">{item.count}</p>
                  <p className="text-slate-400 text-xs">{item.source}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}