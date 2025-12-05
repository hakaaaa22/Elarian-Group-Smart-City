import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, Clock, AlertTriangle, TrendingUp, Users, Activity, Eye,
  Calendar, Target, Shield, Zap, RefreshCw, ChevronRight, BarChart3,
  ArrowUpRight, ArrowDownRight, Bell, Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';

// بيانات تحليلية
const durationPatterns = [
  { range: '0-30 دقيقة', count: 45, percentage: 28, normal: true },
  { range: '30-60 دقيقة', count: 52, percentage: 33, normal: true },
  { range: '1-2 ساعة', count: 38, percentage: 24, normal: true },
  { range: '2-4 ساعات', count: 18, percentage: 11, normal: false },
  { range: '+4 ساعات', count: 6, percentage: 4, normal: false },
];

const overtimeViolations = [
  { id: 1, visitor: 'أحمد محمد', company: 'شركة التقنية', allowedTime: '17:00', actualExit: '19:30', overtime: '2:30 ساعة', status: 'warning' },
  { id: 2, visitor: 'سارة خالد', company: 'مؤسسة البناء', allowedTime: '16:00', actualExit: '18:45', overtime: '2:45 ساعة', status: 'critical' },
  { id: 3, visitor: 'محمد علي', company: 'شركة التوصيل', allowedTime: '14:00', actualExit: '15:30', overtime: '1:30 ساعة', status: 'info' },
];

const peakHoursData = [
  { hour: '06:00', visitors: 12, trend: 'low' },
  { hour: '08:00', visitors: 45, trend: 'rising' },
  { hour: '09:00', visitors: 78, trend: 'peak' },
  { hour: '10:00', visitors: 85, trend: 'peak' },
  { hour: '11:00', visitors: 72, trend: 'high' },
  { hour: '12:00', visitors: 45, trend: 'medium' },
  { hour: '13:00', visitors: 38, trend: 'medium' },
  { hour: '14:00', visitors: 65, trend: 'high' },
  { hour: '15:00', visitors: 58, trend: 'medium' },
  { hour: '16:00', visitors: 42, trend: 'declining' },
  { hour: '17:00', visitors: 28, trend: 'low' },
  { hour: '18:00', visitors: 15, trend: 'low' },
];

const weeklyPattern = [
  { day: 'الأحد', visits: 145, peakHour: '10:00', avgDuration: '1.8 ساعة' },
  { day: 'الاثنين', visits: 180, peakHour: '09:00', avgDuration: '2.1 ساعة' },
  { day: 'الثلاثاء', visits: 165, peakHour: '10:00', avgDuration: '1.9 ساعة' },
  { day: 'الأربعاء', visits: 190, peakHour: '09:00', avgDuration: '2.3 ساعة' },
  { day: 'الخميس', visits: 155, peakHour: '11:00', avgDuration: '1.7 ساعة' },
  { day: 'الجمعة', visits: 45, peakHour: '10:00', avgDuration: '1.2 ساعة' },
  { day: 'السبت', visits: 120, peakHour: '09:00', avgDuration: '1.5 ساعة' },
];

const suspiciousBehaviors = [
  { id: 1, visitor: 'زائر غير معروف', behavior: 'تكرار زيارات متعددة لمناطق محظورة', risk: 'high', linkedAlerts: 3, timestamp: '2025-01-15 10:30' },
  { id: 2, visitor: 'محمد سعيد', behavior: 'محاولة دخول خارج أوقات التصريح', risk: 'medium', linkedAlerts: 1, timestamp: '2025-01-15 09:45' },
  { id: 3, visitor: 'خالد العلي', behavior: 'تجاوز المناطق المصرح بها', risk: 'medium', linkedAlerts: 2, timestamp: '2025-01-15 08:20' },
  { id: 4, visitor: 'أحمد فهد', behavior: 'نمط حركة غير اعتيادي', risk: 'low', linkedAlerts: 0, timestamp: '2025-01-14 16:30' },
];

export default function AIBehaviorAnalytics() {
  const [activeTab, setActiveTab] = useState('duration');
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeWithAI = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          حلل بيانات سلوك الزوار التالية وقدم توصيات:
          - تجاوزات وقت الخروج: ${overtimeViolations.length} حالة
          - سلوكيات مشبوهة: ${suspiciousBehaviors.length} حالة
          - ساعات الذروة: 09:00 - 10:00
          - متوسط مدة الزيارة: 1.8 ساعة
          
          قدم تحليلاً شاملاً يتضمن:
          1. الأنماط غير المعتادة
          2. توصيات لتحسين الأمن
          3. اقتراحات لتحسين تدفق الزوار
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            unusual_patterns: { type: 'array', items: { type: 'string' } },
            security_recommendations: { type: 'array', items: { type: 'string' } },
            flow_improvements: { type: 'array', items: { type: 'string' } },
            risk_level: { type: 'string' }
          }
        }
      });
      return result;
    },
    onSuccess: () => {
      toast.success('تم تحليل البيانات بنجاح');
    }
  });

  const getRiskBadge = (risk) => {
    const colors = {
      high: 'bg-red-500/20 text-red-400',
      medium: 'bg-amber-500/20 text-amber-400',
      low: 'bg-green-500/20 text-green-400'
    };
    const labels = { high: 'عالي', medium: 'متوسط', low: 'منخفض' };
    return <Badge className={colors[risk]}>{labels[risk]}</Badge>;
  };

  const stats = {
    avgDuration: '1.8 ساعة',
    overtimeCount: overtimeViolations.length,
    peakHour: '09:00 - 10:00',
    suspiciousCount: suspiciousBehaviors.filter(s => s.risk === 'high').length
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">تحليلات سلوك الزوار بالـ AI</h3>
            <p className="text-slate-500 text-sm">تحليل ذكي للأنماط والسلوكيات</p>
          </div>
        </div>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => analyzeWithAI.mutate()}
          disabled={analyzeWithAI.isPending}
        >
          {analyzeWithAI.isPending ? (
            <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
          ) : (
            <Brain className="w-4 h-4 ml-2" />
          )}
          تحليل AI شامل
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.avgDuration}</p>
              <p className="text-cyan-400 text-sm">متوسط المدة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.overtimeCount}</p>
              <p className="text-amber-400 text-sm">تجاوزات الوقت</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.peakHour}</p>
              <p className="text-purple-400 text-sm">ساعة الذروة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.suspiciousCount}</p>
              <p className="text-red-400 text-sm">سلوك مشبوه</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="duration" className="data-[state=active]:bg-cyan-500/20">
            <Clock className="w-4 h-4 ml-1" />
            تحليل المدة
          </TabsTrigger>
          <TabsTrigger value="overtime" className="data-[state=active]:bg-amber-500/20">
            <AlertTriangle className="w-4 h-4 ml-1" />
            التجاوزات
          </TabsTrigger>
          <TabsTrigger value="peaks" className="data-[state=active]:bg-purple-500/20">
            <TrendingUp className="w-4 h-4 ml-1" />
            ساعات الذروة
          </TabsTrigger>
          <TabsTrigger value="suspicious" className="data-[state=active]:bg-red-500/20">
            <Shield className="w-4 h-4 ml-1" />
            السلوكيات المشبوهة
          </TabsTrigger>
        </TabsList>

        {/* Duration Analysis */}
        <TabsContent value="duration" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">توزيع مدة الزيارات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {durationPatterns.map((pattern, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{pattern.range}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{pattern.count}</span>
                        {!pattern.normal && (
                          <Badge className="bg-amber-500/20 text-amber-400 text-xs">غير اعتيادي</Badge>
                        )}
                      </div>
                    </div>
                    <Progress value={pattern.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">الاتجاه الأسبوعي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyPattern}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Bar dataKey="visits" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Overtime Violations */}
        <TabsContent value="overtime" className="mt-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                تجاوزات وقت الخروج
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {overtimeViolations.map(violation => (
                <motion.div
                  key={violation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-lg border ${
                    violation.status === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                    violation.status === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                    'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-bold">{violation.visitor}</p>
                      <p className="text-slate-400 text-sm">{violation.company}</p>
                    </div>
                    <Badge className={
                      violation.status === 'critical' ? 'bg-red-500/20 text-red-400' :
                      violation.status === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-blue-500/20 text-blue-400'
                    }>
                      تجاوز {violation.overtime}
                    </Badge>
                  </div>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-slate-500">الوقت المسموح: <span className="text-white">{violation.allowedTime}</span></span>
                    <span className="text-slate-500">وقت الخروج الفعلي: <span className="text-red-400">{violation.actualExit}</span></span>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Peak Hours */}
        <TabsContent value="peaks" className="mt-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">تحليل ساعات الذروة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={peakHoursData}>
                    <defs>
                      <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="visitors" stroke="#8B5CF6" fill="url(#colorPeak)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                  <p className="text-green-400 font-bold">06:00 - 08:00</p>
                  <p className="text-slate-400 text-sm">فترة هادئة</p>
                </div>
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                  <p className="text-red-400 font-bold">09:00 - 11:00</p>
                  <p className="text-slate-400 text-sm">ذروة الازدحام</p>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center">
                  <p className="text-amber-400 font-bold">14:00 - 16:00</p>
                  <p className="text-slate-400 text-sm">ذروة ثانوية</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suspicious Behaviors */}
        <TabsContent value="suspicious" className="mt-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-400" />
                السلوكيات المشبوهة المرتبطة بالتنبيهات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {suspiciousBehaviors.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{item.visitor}</span>
                      {getRiskBadge(item.risk)}
                    </div>
                    <span className="text-slate-500 text-xs">{item.timestamp}</span>
                  </div>
                  <p className="text-slate-300 text-sm mb-2">{item.behavior}</p>
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 text-sm">{item.linkedAlerts} تنبيهات مرتبطة</span>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}