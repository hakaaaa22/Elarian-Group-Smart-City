import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Zap, TrendingUp, TrendingDown, Lightbulb, DollarSign, Leaf,
  BarChart3, Calendar, Clock, AlertTriangle, CheckCircle, Brain,
  Target, ArrowRight, RefreshCw, Loader2, Home, ThermometerSun
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'sonner';

// Mock data
const dailyUsage = [
  { hour: '00', current: 0.3, previous: 0.4, average: 0.35 },
  { hour: '04', current: 0.2, previous: 0.2, average: 0.25 },
  { hour: '08', current: 1.2, previous: 1.0, average: 1.1 },
  { hour: '12', current: 1.8, previous: 1.5, average: 1.6 },
  { hour: '16', current: 1.5, previous: 1.4, average: 1.4 },
  { hour: '20', current: 2.2, previous: 2.0, average: 2.1 },
];

const weeklyComparison = [
  { day: 'السبت', thisWeek: 8.2, lastWeek: 7.8 },
  { day: 'الأحد', thisWeek: 7.5, lastWeek: 8.0 },
  { day: 'الإثنين', thisWeek: 9.1, lastWeek: 8.5 },
  { day: 'الثلاثاء', thisWeek: 8.8, lastWeek: 8.2 },
  { day: 'الأربعاء', thisWeek: 8.0, lastWeek: 7.9 },
  { day: 'الخميس', thisWeek: 9.5, lastWeek: 8.8 },
  { day: 'الجمعة', thisWeek: 7.2, lastWeek: 7.5 },
];

const roomBreakdown = [
  { name: 'غرفة المعيشة', value: 35, color: '#22d3ee' },
  { name: 'غرفة النوم', value: 20, color: '#a855f7' },
  { name: 'المطبخ', value: 25, color: '#f59e0b' },
  { name: 'الحمام', value: 10, color: '#10b981' },
  { name: 'أخرى', value: 10, color: '#6366f1' },
];

const deviceBreakdown = [
  { name: 'المكيف', value: 40, color: '#22d3ee' },
  { name: 'الإضاءة', value: 15, color: '#f59e0b' },
  { name: 'السخان', value: 20, color: '#ef4444' },
  { name: 'الثلاجة', value: 15, color: '#10b981' },
  { name: 'أخرى', value: 10, color: '#6366f1' },
];

export default function EnergyAnalytics({ devices }) {
  const [timeRange, setTimeRange] = useState('day');
  const [viewBy, setViewBy] = useState('room');
  const [aiRecommendations, setAiRecommendations] = useState(null);

  // Calculate stats
  const todayUsage = 8.2;
  const yesterdayUsage = 7.8;
  const monthUsage = 245;
  const avgUsage = 8.0;
  const usageChange = ((todayUsage - yesterdayUsage) / yesterdayUsage * 100).toFixed(1);
  const costPerKwh = 0.18;
  const todayCost = (todayUsage * costPerKwh).toFixed(2);
  const monthCost = (monthUsage * costPerKwh).toFixed(2);
  const savingsPotential = 15; // %

  // AI Recommendations mutation
  const getRecommendationsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير في توفير الطاقة للمنازل الذكية. بناءً على البيانات التالية، قدم توصيات لتوفير الطاقة:

استهلاك اليوم: ${todayUsage} كيلوواط/ساعة
استهلاك أمس: ${yesterdayUsage} كيلوواط/ساعة
استهلاك الشهر: ${monthUsage} كيلوواط/ساعة
المتوسط اليومي: ${avgUsage} كيلوواط/ساعة
عدد الأجهزة: ${devices.length}
الأجهزة المتصلة: ${devices.filter(d => d.status === 'online').length}
أكثر الأجهزة استهلاكاً: المكيف (40%), السخان (20%), الثلاجة (15%)

قدم توصيات عملية ومحددة لتوفير الطاقة والتكلفة.`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            potential_savings: {
              type: "object",
              properties: {
                percentage: { type: "number" },
                monthly_kwh: { type: "number" },
                monthly_cost: { type: "number" }
              }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string" },
                  savings: { type: "string" },
                  priority: { type: "string" },
                  implementation: { type: "string" }
                }
              }
            },
            usage_patterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pattern: { type: "string" },
                  insight: { type: "string" }
                }
              }
            },
            optimization_plan: {
              type: "object",
              properties: {
                immediate_actions: { type: "array", items: { type: "string" } },
                short_term: { type: "array", items: { type: "string" } },
                long_term: { type: "array", items: { type: "string" } }
              }
            },
            comparison: {
              type: "object",
              properties: {
                vs_average: { type: "string" },
                efficiency_score: { type: "number" },
                ranking: { type: "string" }
              }
            }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setAiRecommendations(data);
      toast.success('تم تحليل البيانات وتوليد التوصيات');
    },
    onError: () => {
      toast.error('فشل في تحليل البيانات');
    }
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'استهلاك اليوم', 
            value: `${todayUsage} kWh`, 
            icon: Zap, 
            color: 'amber',
            change: usageChange,
            changeLabel: 'من أمس'
          },
          { 
            label: 'تكلفة اليوم', 
            value: `${todayCost} ر.س`, 
            icon: DollarSign, 
            color: 'green',
            subtext: `${costPerKwh} ر.س/kWh`
          },
          { 
            label: 'استهلاك الشهر', 
            value: `${monthUsage} kWh`, 
            icon: Calendar, 
            color: 'cyan',
            subtext: `${monthCost} ر.س`
          },
          { 
            label: 'إمكانية التوفير', 
            value: `${savingsPotential}%`, 
            icon: Leaf, 
            color: 'emerald',
            subtext: `~${(monthUsage * savingsPotential / 100).toFixed(0)} kWh/شهر`
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-xs">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    {stat.change && (
                      <div className={`flex items-center gap-1 mt-1 text-xs ${parseFloat(stat.change) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {parseFloat(stat.change) > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {stat.change}% {stat.changeLabel}
                      </div>
                    )}
                    {stat.subtext && (
                      <p className="text-slate-500 text-xs mt-1">{stat.subtext}</p>
                    )}
                  </div>
                  <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-36 bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="day">اليوم</SelectItem>
                  <SelectItem value="week">هذا الأسبوع</SelectItem>
                  <SelectItem value="month">هذا الشهر</SelectItem>
                  <SelectItem value="year">هذه السنة</SelectItem>
                </SelectContent>
              </Select>
              <Select value={viewBy} onValueChange={setViewBy}>
                <SelectTrigger className="w-36 bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="room">حسب الغرفة</SelectItem>
                  <SelectItem value="device">حسب الجهاز</SelectItem>
                  <SelectItem value="category">حسب الفئة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => getRecommendationsMutation.mutate()}
              disabled={getRecommendationsMutation.isPending}
            >
              {getRecommendationsMutation.isPending ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <Brain className="w-4 h-4 ml-2" />
              )}
              توصيات الذكاء الاصطناعي
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <BarChart3 className="w-4 h-4 ml-2" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Home className="w-4 h-4 ml-2" />
            التوزيع
          </TabsTrigger>
          <TabsTrigger value="comparison" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <TrendingUp className="w-4 h-4 ml-2" />
            المقارنة
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Lightbulb className="w-4 h-4 ml-2" />
            التوصيات
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">الاستهلاك عبر الوقت</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyUsage}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} />
                    <Legend />
                    <Area type="monotone" dataKey="current" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} name="اليوم" />
                    <Area type="monotone" dataKey="previous" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1} name="أمس" />
                    <Area type="monotone" dataKey="average" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} name="المتوسط" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">ذروة الاستهلاك</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">أعلى استهلاك</span>
                    <Badge className="bg-red-500/20 text-red-400">20:00</Badge>
                  </div>
                  <p className="text-2xl font-bold text-white mt-1">2.2 kWh</p>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">أقل استهلاك</span>
                    <Badge className="bg-green-500/20 text-green-400">04:00</Badge>
                  </div>
                  <p className="text-2xl font-bold text-white mt-1">0.2 kWh</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-sm">نصيحة</p>
                  <p className="text-white text-sm mt-1">حاول تشغيل الأجهزة الكبيرة خارج أوقات الذروة لتوفير التكلفة</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Breakdown Tab */}
        <TabsContent value="breakdown">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">الاستهلاك حسب الغرفة</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={roomBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${value}%`}
                    >
                      {roomBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {roomBreakdown.map((room) => (
                    <div key={room.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: room.color }} />
                      <span className="text-slate-400 text-xs">{room.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">الاستهلاك حسب الجهاز</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={deviceBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${value}%`}
                    >
                      {deviceBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {deviceBreakdown.map((device) => (
                    <div key={device.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: device.color }} />
                      <span className="text-slate-400 text-xs">{device.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Device List */}
            <Card className="lg:col-span-2 glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">تفصيل الأجهزة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {devices.filter(d => d.state.power || d.state.today).map((device) => {
                    const dailyKwh = device.state.today || (device.state.power ? (device.state.power * 8 / 1000) : 0);
                    const percentage = (dailyKwh / todayUsage * 100).toFixed(0);
                    return (
                      <div key={device.id} className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white text-sm">{device.name}</span>
                            <span className="text-slate-400 text-xs">{dailyKwh.toFixed(2)} kWh</span>
                          </div>
                          <Progress value={parseFloat(percentage)} className="h-2" />
                        </div>
                        <span className="text-cyan-400 text-sm w-12 text-left">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison">
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">مقارنة أسبوعية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="thisWeek" fill="#22d3ee" name="هذا الأسبوع" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lastWeek" fill="#a855f7" name="الأسبوع الماضي" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">مقارنة مع المتوسط</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-sm">استهلاكك مقارنة بالمتوسط</p>
                  <p className="text-4xl font-bold text-cyan-400 mt-2">+5%</p>
                  <p className="text-slate-500 text-xs mt-1">أعلى من متوسط المنازل المماثلة</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">استهلاكك</span>
                    <span className="text-white font-medium">{todayUsage} kWh/يوم</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">المتوسط العام</span>
                    <span className="text-white font-medium">{avgUsage} kWh/يوم</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">أفضل 10%</span>
                    <span className="text-green-400 font-medium">6.5 kWh/يوم</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-400 text-sm flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    الهدف الموصى به
                  </p>
                  <p className="text-white font-medium mt-1">7.0 kWh/يوم</p>
                  <p className="text-slate-400 text-xs mt-1">توفير ~15% من استهلاكك الحالي</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations">
          {aiRecommendations ? (
            <div className="space-y-4">
              {/* Summary */}
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500/20">
                      <Brain className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">تحليل الذكاء الاصطناعي</h3>
                      <p className="text-slate-300 mt-2">{aiRecommendations.summary}</p>
                      {aiRecommendations.potential_savings && (
                        <div className="flex gap-4 mt-4">
                          <Badge className="bg-emerald-500/20 text-emerald-400">
                            توفير {aiRecommendations.potential_savings.percentage}%
                          </Badge>
                          <Badge className="bg-cyan-500/20 text-cyan-400">
                            ~{aiRecommendations.potential_savings.monthly_kwh} kWh/شهر
                          </Badge>
                          <Badge className="bg-amber-500/20 text-amber-400">
                            ~{aiRecommendations.potential_savings.monthly_cost} ر.س/شهر
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations List */}
              <div className="grid md:grid-cols-2 gap-4">
                {aiRecommendations.recommendations?.map((rec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 h-full">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-white font-medium">{rec.title}</h4>
                          <Badge className={`${
                            rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            rec.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {rec.priority === 'high' ? 'عالية' : rec.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm">{rec.description}</p>
                        {rec.savings && (
                          <p className="text-emerald-400 text-sm mt-2 flex items-center gap-1">
                            <Leaf className="w-4 h-4" />
                            التوفير المتوقع: {rec.savings}
                          </p>
                        )}
                        {rec.implementation && (
                          <p className="text-slate-500 text-xs mt-2">كيفية التنفيذ: {rec.implementation}</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Optimization Plan */}
              {aiRecommendations.optimization_plan && (
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-400" />
                      خطة التحسين
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-cyan-400 text-sm font-medium mb-2">إجراءات فورية</h4>
                        <ul className="space-y-1">
                          {aiRecommendations.optimization_plan.immediate_actions?.map((action, i) => (
                            <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-amber-400 text-sm font-medium mb-2">قصيرة المدى</h4>
                        <ul className="space-y-1">
                          {aiRecommendations.optimization_plan.short_term?.map((action, i) => (
                            <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-purple-400 text-sm font-medium mb-2">طويلة المدى</h4>
                        <ul className="space-y-1">
                          {aiRecommendations.optimization_plan.long_term?.map((action, i) => (
                            <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="py-16 text-center">
                <Lightbulb className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg mb-2">احصل على توصيات مخصصة لتوفير الطاقة</p>
                <p className="text-slate-500 text-sm mb-6">يستخدم الذكاء الاصطناعي لتحليل أنماط استخدامك وتقديم نصائح عملية</p>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => getRecommendationsMutation.mutate()}
                  disabled={getRecommendationsMutation.isPending}
                >
                  {getRecommendationsMutation.isPending ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4 ml-2" />
                  )}
                  تحليل وتوصيات
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}