import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Download, Calendar, Filter, Users, DoorOpen,
  Clock, FileText, Building2, Car, Shield, Brain, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const monthlyData = [
  { month: 'يناير', visitors: 1250, permits: 320, vehicles: 180 },
  { month: 'فبراير', visitors: 1180, permits: 290, vehicles: 165 },
  { month: 'مارس', visitors: 1420, permits: 380, vehicles: 210 },
  { month: 'أبريل', visitors: 1350, permits: 350, vehicles: 195 },
  { month: 'مايو', visitors: 1480, permits: 400, vehicles: 225 },
  { month: 'يونيو', visitors: 1580, permits: 420, vehicles: 240 },
];

const gateUsage = [
  { gate: 'البوابة الرئيسية', usage: 45, color: '#06B6D4' },
  { gate: 'بوابة الموظفين', usage: 25, color: '#8B5CF6' },
  { gate: 'بوابة الشحن', usage: 20, color: '#22C55E' },
  { gate: 'بوابة الطوارئ', usage: 10, color: '#F59E0B' },
];

const topHosts = [
  { name: 'قسم المبيعات', visits: 245, percentage: 28 },
  { name: 'قسم الصيانة', visits: 189, percentage: 22 },
  { name: 'المستودعات', visits: 156, percentage: 18 },
  { name: 'الإدارة العامة', visits: 134, percentage: 15 },
  { name: 'تقنية المعلومات', visits: 98, percentage: 11 },
];

const peakHours = [
  { hour: '06:00', visits: 15 },
  { hour: '08:00', visits: 85 },
  { hour: '10:00', visits: 120 },
  { hour: '12:00', visits: 95 },
  { hour: '14:00', visits: 88 },
  { hour: '16:00', visits: 105 },
  { hour: '18:00', visits: 45 },
  { hour: '20:00', visits: 20 },
];

const permitExpiry = [
  { status: 'نشط', count: 89, color: '#22C55E' },
  { status: 'ينتهي هذا الأسبوع', count: 12, color: '#F59E0B' },
  { status: 'منتهي', count: 23, color: '#EF4444' },
  { status: 'معلق', count: 8, color: '#8B5CF6' },
];

const behaviorInsights = [
  { insight: 'متوسط مدة الزيارة 2.5 ساعة', type: 'normal' },
  { insight: '15% من الزوار يتجاوزون وقت الخروج المحدد', type: 'warning' },
  { insight: 'أكثر أيام الازدحام: الأربعاء', type: 'info' },
  { insight: 'معدل رفض التصاريح: 5%', type: 'normal' },
];

export default function VisitorReports() {
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('overview');

  const stats = {
    totalVisitors: 8456,
    totalPermits: 2160,
    avgDailyVisits: 156,
    permitApprovalRate: 95,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            التقارير والتحليلات
          </h3>
          <p className="text-slate-400 text-sm">تحليل شامل لبيانات الزوار والتصاريح</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="week">هذا الأسبوع</SelectItem>
              <SelectItem value="month">هذا الشهر</SelectItem>
              <SelectItem value="quarter">هذا الربع</SelectItem>
              <SelectItem value="year">هذه السنة</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-slate-600">
            <Download className="w-4 h-4 ml-2" />
            تصدير PDF
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'إجمالي الزوار', value: stats.totalVisitors.toLocaleString(), icon: Users, color: 'cyan', change: '+12%' },
          { label: 'التصاريح الصادرة', value: stats.totalPermits.toLocaleString(), icon: FileText, color: 'purple', change: '+8%' },
          { label: 'متوسط يومي', value: stats.avgDailyVisits, icon: Calendar, color: 'green', change: '+5%' },
          { label: 'نسبة الموافقة', value: `${stats.permitApprovalRate}%`, icon: Shield, color: 'amber', change: '+2%' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`bg-${stat.color}-500/10 border-${stat.color}-500/30`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    <p className="text-green-400 text-xs mt-1">{stat.change}</p>
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

      <Tabs value={reportType} onValueChange={setReportType}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20">نظرة عامة</TabsTrigger>
          <TabsTrigger value="gates" className="data-[state=active]:bg-purple-500/20">البوابات</TabsTrigger>
          <TabsTrigger value="permits" className="data-[state=active]:bg-green-500/20">التصاريح</TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-pink-500/20">تحليل AI</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Monthly Trend */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  اتجاه الزيارات الشهري
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="visitors" stroke="#06B6D4" fill="url(#colorVisitors)" strokeWidth={2} name="الزوار" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Peak Hours */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  ساعات الذروة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peakHours}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Bar dataKey="visits" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="الزيارات" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Hosts */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-green-400" />
                أكثر الجهات استقبالاً للزوار
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topHosts.map((host, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-slate-400 w-32 text-sm">{host.name}</span>
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${host.percentage}%` }}
                        transition={{ delay: i * 0.1 }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                      />
                    </div>
                    <span className="text-white font-bold w-16 text-left">{host.visits}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gates */}
        <TabsContent value="gates" className="mt-4 space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">توزيع استخدام البوابات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gateUsage}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="usage"
                      >
                        {gateUsage.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {gateUsage.map(gate => (
                    <div key={gate.gate} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ background: gate.color }} />
                      <span className="text-slate-400">{gate.gate}</span>
                      <span className="text-white font-bold mr-auto">{gate.usage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <DoorOpen className="w-4 h-4 text-cyan-400" />
                  إحصائيات البوابات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {gateUsage.map((gate, i) => (
                  <motion.div
                    key={gate.gate}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 bg-slate-800/50 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ background: `${gate.color}20` }}>
                        <DoorOpen className="w-4 h-4" style={{ color: gate.color }} />
                      </div>
                      <span className="text-white">{gate.gate}</span>
                    </div>
                    <div className="text-left">
                      <p className="text-white font-bold">{gate.usage * 15}</p>
                      <p className="text-slate-500 text-xs">عملية اليوم</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Permits */}
        <TabsContent value="permits" className="mt-4 space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">حالة التصاريح</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={permitExpiry}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="count"
                      >
                        {permitExpiry.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {permitExpiry.map(p => (
                    <div key={p.status} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ background: p.color }} />
                      <span className="text-slate-400">{p.status}</span>
                      <span className="text-white font-bold mr-auto">{p.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">التصاريح والمركبات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Legend />
                      <Line type="monotone" dataKey="permits" stroke="#8B5CF6" strokeWidth={2} name="التصاريح" />
                      <Line type="monotone" dataKey="vehicles" stroke="#F59E0B" strokeWidth={2} name="المركبات" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Analytics */}
        <TabsContent value="ai" className="mt-4 space-y-4">
          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                تحليل السلوك بالذكاء الاصطناعي
                <Badge className="bg-purple-500/20 text-purple-400">
                  <Sparkles className="w-3 h-3 ml-1" />
                  AI
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {behaviorInsights.map((insight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-3 rounded-lg ${
                      insight.type === 'warning' ? 'bg-amber-500/10 border border-amber-500/30' :
                      insight.type === 'info' ? 'bg-blue-500/10 border border-blue-500/30' :
                      'bg-slate-800/50'
                    }`}
                  >
                    <p className="text-white text-sm">{insight.insight}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">التوقعات والتوصيات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <p className="text-cyan-300 font-medium text-sm mb-1">توقع الأسبوع القادم</p>
                <p className="text-white text-sm">زيادة متوقعة في الزيارات بنسبة 15% بسبب معرض الشركة</p>
              </div>
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-300 font-medium text-sm mb-1">توصية تحسين</p>
                <p className="text-white text-sm">يُنصح بفتح نافذة إضافية في البوابة الرئيسية خلال ساعات الذروة</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}