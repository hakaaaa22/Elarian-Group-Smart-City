import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Users, Brain, TrendingUp, MousePointer, Clock, BarChart3, PieChart,
  Eye, Target, Zap, RefreshCw, Lightbulb, Activity, ArrowUp, ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'sonner';

// بيانات سلوك المستخدمين
const userBehaviorData = {
  pageViews: [
    { page: 'لوحة التحكم', views: 1250, avgTime: '3:45', bounceRate: 12 },
    { page: 'إدارة النفايات', views: 890, avgTime: '5:20', bounceRate: 8 },
    { page: 'الأسطول', views: 720, avgTime: '4:10', bounceRate: 15 },
    { page: 'التقارير', views: 540, avgTime: '6:30', bounceRate: 5 },
    { page: 'الإعدادات', views: 320, avgTime: '2:15', bounceRate: 25 },
  ],
  userJourneys: [
    { path: 'لوحة التحكم → النفايات → التقارير', count: 345, conversionRate: 78 },
    { path: 'لوحة التحكم → الأسطول → الصيانة', count: 234, conversionRate: 65 },
    { path: 'تسجيل الدخول → لوحة التحكم → الإعدادات', count: 189, conversionRate: 45 },
  ],
  interactionPatterns: [
    { action: 'نقرات على الأزرار', count: 8920 },
    { action: 'تمرير الصفحات', count: 15430 },
    { action: 'البحث', count: 2340 },
    { action: 'تصفية البيانات', count: 4560 },
    { action: 'تصدير التقارير', count: 890 },
  ],
  timeDistribution: [
    { hour: '08:00', users: 45 },
    { hour: '10:00', users: 120 },
    { hour: '12:00', users: 85 },
    { hour: '14:00', users: 150 },
    { hour: '16:00', users: 180 },
    { hour: '18:00', users: 95 },
  ],
};

const COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'];

export default function UserBehaviorAnalytics() {
  const [insights, setInsights] = useState(null);

  // تحليل سلوك المستخدمين بالذكاء الاصطناعي
  const analyzeUserBehavior = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في تحليل سلوك المستخدمين وتجربة المستخدم (UX)، قم بتحليل البيانات التالية:

مشاهدات الصفحات:
${userBehaviorData.pageViews.map(p => `- ${p.page}: ${p.views} مشاهدة، متوسط الوقت ${p.avgTime}، معدل الارتداد ${p.bounceRate}%`).join('\n')}

رحلات المستخدمين:
${userBehaviorData.userJourneys.map(j => `- ${j.path}: ${j.count} مستخدم، معدل التحويل ${j.conversionRate}%`).join('\n')}

أنماط التفاعل:
${userBehaviorData.interactionPatterns.map(i => `- ${i.action}: ${i.count}`).join('\n')}

قدم:
1. الأنماط الشائعة في سلوك المستخدمين
2. نقاط الاحتكاك في تجربة المستخدم
3. فرص تحسين واجهة المستخدم
4. توصيات لزيادة التفاعل
5. تحسينات مقترحة للتنقل`,
        response_json_schema: {
          type: "object",
          properties: {
            commonPatterns: { type: "array", items: { type: "string" } },
            frictionPoints: { type: "array", items: { type: "object", properties: { issue: { type: "string" }, impact: { type: "string" }, solution: { type: "string" } } } },
            uiImprovements: { type: "array", items: { type: "object", properties: { area: { type: "string" }, suggestion: { type: "string" }, priority: { type: "string" } } } },
            engagementTips: { type: "array", items: { type: "string" } },
            navigationImprovements: { type: "array", items: { type: "string" } },
            overallScore: { type: "number" },
            keyMetrics: { type: "object", properties: { avgSessionDuration: { type: "string" }, userSatisfaction: { type: "number" }, taskCompletionRate: { type: "number" } } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setInsights(data);
      toast.success('تم تحليل سلوك المستخدمين');
    }
  });

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          تحليل سلوك المستخدمين
        </h3>
        <Button variant="outline" className="border-purple-500 text-purple-400" onClick={() => analyzeUserBehavior.mutate()} disabled={analyzeUserBehavior.isPending}>
          {analyzeUserBehavior.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
          تحليل ذكي
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <Eye className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{userBehaviorData.pageViews.reduce((s, p) => s + p.views, 0).toLocaleString()}</p>
            <p className="text-cyan-400 text-xs">مشاهدات</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <MousePointer className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{userBehaviorData.interactionPatterns.reduce((s, i) => s + i.count, 0).toLocaleString()}</p>
            <p className="text-purple-400 text-xs">تفاعلات</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <Clock className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">4:15</p>
            <p className="text-green-400 text-xs">متوسط الجلسة</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <Target className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">68%</p>
            <p className="text-amber-400 text-xs">معدل التحويل</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Page Views Chart */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              مشاهدات الصفحات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userBehaviorData.pageViews}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="page" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="views" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Activity Time */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              توزيع النشاط
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userBehaviorData.timeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="users" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Journeys */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">رحلات المستخدمين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userBehaviorData.userJourneys.map((journey, i) => (
                <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-cyan-400 text-sm mb-2">{journey.path}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">{journey.count} مستخدم</span>
                    <div className="flex items-center gap-2">
                      <Progress value={journey.conversionRate} className="w-24 h-2" />
                      <span className="text-green-400 text-xs">{journey.conversionRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interaction Patterns */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">أنماط التفاعل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={userBehaviorData.interactionPatterns}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="count"
                    nameKey="action"
                  >
                    {userBehaviorData.interactionPatterns.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {insights && (
        <Card className="glass-card border-purple-500/30 bg-purple-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              رؤى AI لتحسين تجربة المستخدم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Friction Points */}
              {insights.frictionPoints?.length > 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm font-medium mb-2">نقاط الاحتكاك</p>
                  <div className="space-y-2">
                    {insights.frictionPoints.slice(0, 3).map((point, i) => (
                      <div key={i} className="p-2 bg-slate-900/50 rounded">
                        <p className="text-white text-xs">{point.issue}</p>
                        <p className="text-green-400 text-xs mt-1">الحل: {point.solution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* UI Improvements */}
              {insights.uiImprovements?.length > 0 && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-sm font-medium mb-2">تحسينات مقترحة</p>
                  <div className="space-y-2">
                    {insights.uiImprovements.slice(0, 3).map((improvement, i) => (
                      <div key={i} className="p-2 bg-slate-900/50 rounded flex items-center justify-between">
                        <div>
                          <p className="text-white text-xs">{improvement.area}</p>
                          <p className="text-slate-400 text-xs">{improvement.suggestion}</p>
                        </div>
                        <Badge className={improvement.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}>
                          {improvement.priority === 'high' ? 'عالي' : 'متوسط'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Common Patterns */}
            {insights.commonPatterns?.length > 0 && (
              <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <p className="text-cyan-400 text-sm font-medium mb-2">الأنماط الشائعة</p>
                <ul className="space-y-1">
                  {insights.commonPatterns.map((pattern, i) => (
                    <li key={i} className="text-white text-xs flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 text-cyan-400" />
                      {pattern}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}