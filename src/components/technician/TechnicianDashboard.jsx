import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, CheckCircle, Clock, Star, TrendingUp, Calendar,
  Wrench, Award, Target, AlertTriangle, BarChart3, Zap
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function TechnicianDashboard({ technicianName = 'محمد أحمد' }) {
  const [stats, setStats] = useState({
    tasksToday: 4,
    tasksCompleted: 2,
    avgRating: 4.8,
    responseTime: 25,
    monthlyTasks: 26,
    monthlyTarget: 30,
    firstTimeFixRate: 92,
    customerSatisfaction: 96
  });

  const weeklyData = [
    { day: 'سبت', tasks: 5, rating: 4.9 },
    { day: 'أحد', tasks: 6, rating: 4.7 },
    { day: 'إثنين', tasks: 4, rating: 5.0 },
    { day: 'ثلاثاء', tasks: 7, rating: 4.8 },
    { day: 'أربعاء', tasks: 5, rating: 4.6 },
    { day: 'خميس', tasks: 4, rating: 4.9 },
    { day: 'جمعة', tasks: 2, rating: 5.0 },
  ];

  const recentTasks = [
    { id: 1, device: 'مكيف المكتب الرئيسي', type: 'صيانة وقائية', status: 'completed', rating: 5, time: '1.5 ساعة' },
    { id: 2, device: 'كاميرا البوابة', type: 'إصلاح', status: 'completed', rating: 4, time: '45 دقيقة' },
    { id: 3, device: 'حساس المستودع', type: 'استبدال', status: 'in_progress', rating: null, time: null },
    { id: 4, device: 'مكيف غرفة الاجتماعات', type: 'فحص', status: 'pending', rating: null, time: null },
  ];

  const achievements = [
    { name: 'نجم الأسبوع', icon: Star, earned: true, description: 'أعلى تقييم هذا الأسبوع' },
    { name: 'سريع البرق', icon: Zap, earned: true, description: 'أسرع وقت استجابة' },
    { name: 'المحترف', icon: Award, earned: false, description: '100 مهمة منجزة' },
  ];

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <Card className="glass-card border-indigo-500/20 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-xl">
                {technicianName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{technicianName}</h2>
              <p className="text-slate-400 text-sm">فني تكييف وتبريد</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-white font-bold">{stats.avgRating}</span>
                </div>
                <Badge className="bg-green-500/20 text-green-400">نشط</Badge>
              </div>
            </div>
            <div className="text-left">
              <p className="text-3xl font-bold text-cyan-400">{stats.monthlyTasks}</p>
              <p className="text-slate-400 text-xs">مهام هذا الشهر</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="glass-card border-cyan-500/20 bg-cyan-500/5">
          <CardContent className="p-3 text-center">
            <CheckCircle className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{stats.tasksCompleted}/{stats.tasksToday}</p>
            <p className="text-slate-400 text-xs">مهام اليوم</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-green-500/20 bg-green-500/5">
          <CardContent className="p-3 text-center">
            <Clock className="w-6 h-6 text-green-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{stats.responseTime}د</p>
            <p className="text-slate-400 text-xs">متوسط الاستجابة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-3 text-center">
            <Target className="w-6 h-6 text-amber-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{stats.firstTimeFixRate}%</p>
            <p className="text-slate-400 text-xs">إصلاح من أول مرة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-purple-500/20 bg-purple-500/5">
          <CardContent className="p-3 text-center">
            <Star className="w-6 h-6 text-purple-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{stats.customerSatisfaction}%</p>
            <p className="text-slate-400 text-xs">رضا العملاء</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Target */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">هدف الشهر</span>
            <span className="text-cyan-400 font-bold">{stats.monthlyTasks}/{stats.monthlyTarget}</span>
          </div>
          <Progress value={(stats.monthlyTasks / stats.monthlyTarget) * 100} className="h-2" />
          <p className="text-slate-500 text-xs mt-1">
            {stats.monthlyTarget - stats.monthlyTasks} مهمة متبقية للوصول للهدف
          </p>
        </CardContent>
      </Card>

      {/* Weekly Chart */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            أداء الأسبوع
          </CardTitle>
        </CardHeader>
        <CardContent className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
              <Bar dataKey="tasks" fill="#22d3ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Tasks */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" />
            آخر المهام
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
              <div className="flex-1">
                <p className="text-white text-sm">{task.device}</p>
                <p className="text-slate-500 text-xs">{task.type}</p>
              </div>
              <div className="flex items-center gap-2">
                {task.status === 'completed' && (
                  <>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= task.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                      ))}
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 text-xs">مكتمل</Badge>
                  </>
                )}
                {task.status === 'in_progress' && (
                  <Badge className="bg-amber-500/20 text-amber-400 text-xs">قيد التنفيذ</Badge>
                )}
                {task.status === 'pending' && (
                  <Badge className="bg-slate-500/20 text-slate-400 text-xs">قادم</Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            الإنجازات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {achievements.map((ach) => (
              <div
                key={ach.name}
                className={`flex-1 p-3 rounded-lg text-center ${
                  ach.earned ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-800/50 opacity-50'
                }`}
              >
                <ach.icon className={`w-6 h-6 mx-auto mb-1 ${ach.earned ? 'text-amber-400' : 'text-slate-500'}`} />
                <p className="text-white text-xs font-medium">{ach.name}</p>
                <p className="text-slate-500 text-[10px]">{ach.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}