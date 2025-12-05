import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, Download,
  Filter, Calendar, Zap, Thermometer, Droplets, Clock, Lightbulb,
  RefreshCw, FileText, FileSpreadsheet, AlertTriangle, Check, Brain,
  Home, Cpu, Activity, Target, ArrowUp, ArrowDown, Loader2
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  LineChart as ReLineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';

// Mock Data
const energyData = [
  { time: '00:00', consumption: 1.2, solar: 0, cost: 0.24 },
  { time: '04:00', consumption: 0.8, solar: 0, cost: 0.16 },
  { time: '08:00', consumption: 2.5, solar: 1.8, cost: 0.14 },
  { time: '12:00', consumption: 3.2, solar: 4.5, cost: 0 },
  { time: '16:00', consumption: 4.1, solar: 3.2, cost: 0.18 },
  { time: '20:00', consumption: 5.5, solar: 0.5, cost: 1.00 },
  { time: '23:00', consumption: 2.1, solar: 0, cost: 0.42 },
];

const temperatureData = [
  { time: '00:00', indoor: 22, outdoor: 18, target: 22 },
  { time: '04:00', indoor: 21, outdoor: 15, target: 21 },
  { time: '08:00', indoor: 23, outdoor: 20, target: 23 },
  { time: '12:00', indoor: 24, outdoor: 28, target: 23 },
  { time: '16:00', indoor: 25, outdoor: 32, target: 24 },
  { time: '20:00', indoor: 23, outdoor: 25, target: 23 },
  { time: '23:00', indoor: 22, outdoor: 20, target: 22 },
];

const deviceUsageData = [
  { name: 'المكيف', usage: 45, hours: 8.5 },
  { name: 'الإضاءة', usage: 20, hours: 12 },
  { name: 'التلفاز', usage: 15, hours: 5 },
  { name: 'الثلاجة', usage: 12, hours: 24 },
  { name: 'أخرى', usage: 8, hours: 10 },
];

const roomBreakdown = [
  { name: 'غرفة المعيشة', value: 35, color: '#06b6d4' },
  { name: 'غرفة النوم', value: 25, color: '#8b5cf6' },
  { name: 'المطبخ', value: 22, color: '#f59e0b' },
  { name: 'الحمام', value: 10, color: '#10b981' },
  { name: 'أخرى', value: 8, color: '#6366f1' },
];

const weeklyComparison = [
  { day: 'السبت', thisWeek: 12.5, lastWeek: 14.2 },
  { day: 'الأحد', thisWeek: 11.8, lastWeek: 13.5 },
  { day: 'الإثنين', thisWeek: 10.2, lastWeek: 12.1 },
  { day: 'الثلاثاء', thisWeek: 13.1, lastWeek: 11.8 },
  { day: 'الأربعاء', thisWeek: 9.5, lastWeek: 10.2 },
  { day: 'الخميس', thisWeek: 14.2, lastWeek: 15.5 },
  { day: 'الجمعة', thisWeek: 15.8, lastWeek: 16.2 },
];

export default function AdvancedDataAnalytics({ devices = [] }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('day');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(null);

  const aiMutation = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `بناءً على بيانات استهلاك الطاقة التالية للمنزل الذكي:
        - متوسط الاستهلاك اليومي: 15.5 كيلوواط
        - أعلى استهلاك: المكيف (45%)
        - ساعات الذروة: 16:00-20:00
        - درجة الحرارة المفضلة: 23°C
        
        قدم 5 توصيات محددة لتحسين كفاءة الطاقة والأتمتة مع تقدير التوفير المتوقع.`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  savings: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            totalSavings: { type: "string" },
            summary: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAiRecommendations(data);
      toast.success('تم تحليل البيانات بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ في التحليل');
    }
  });

  const stats = {
    totalConsumption: 87.1,
    avgDaily: 15.5,
    costThisMonth: 245,
    savings: 12,
    peakHour: '18:00',
    efficiency: 78
  };

  const exportReport = (format) => {
    // Generate report data based on filters
    const reportData = {
      timeRange,
      deviceFilter,
      roomFilter,
      stats,
      energyData,
      deviceUsageData,
      generatedAt: new Date().toISOString()
    };
    
    if (format === 'csv') {
      const csvContent = [
        'الوقت,الاستهلاك,الطاقة الشمسية,التكلفة',
        ...energyData.map(d => `${d.time},${d.consumption},${d.solar},${d.cost}`)
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `energy_report_${timeRange}.csv`;
      a.click();
    } else if (format === 'json') {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `energy_report_${timeRange}.json`;
      a.click();
    }
    
    toast.success(`تم تصدير التقرير بصيغة ${format.toUpperCase()}`);
    setShowExportDialog(false);
  };

  const generatePeriodicReport = (period) => {
    toast.success(`جاري إنشاء تقرير ${period === 'daily' ? 'يومي' : period === 'weekly' ? 'أسبوعي' : 'شهري'}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            تحليلات البيانات المتقدمة
          </h3>
          <p className="text-slate-400 text-sm">تتبع وتحليل استهلاك الطاقة وأداء الأجهزة</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="day">اليوم</SelectItem>
              <SelectItem value="week">الأسبوع</SelectItem>
              <SelectItem value="month">الشهر</SelectItem>
              <SelectItem value="year">السنة</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-slate-600" onClick={() => setShowExportDialog(true)}>
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700" 
            onClick={() => aiMutation.mutate()}
            disabled={aiMutation.isPending}
          >
            {aiMutation.isPending ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
            تحليل ذكي
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'الاستهلاك الكلي', value: `${stats.totalConsumption} kWh`, icon: Zap, color: 'cyan', change: -5 },
          { label: 'المتوسط اليومي', value: `${stats.avgDaily} kWh`, icon: Activity, color: 'purple', change: -8 },
          { label: 'التكلفة الشهرية', value: `${stats.costThisMonth} ر.س`, icon: Target, color: 'amber', change: -12 },
          { label: 'التوفير', value: `${stats.savings}%`, icon: TrendingDown, color: 'green', change: 15 },
          { label: 'ساعة الذروة', value: stats.peakHour, icon: Clock, color: 'red', change: 0 },
          { label: 'الكفاءة', value: `${stats.efficiency}%`, icon: Target, color: 'blue', change: 5 },
        ].map((stat, i) => (
          <Card key={i} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                {stat.change !== 0 && (
                  <Badge className={`text-[10px] ${stat.change > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {stat.change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(stat.change)}%
                  </Badge>
                )}
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                <SelectTrigger className="w-36 bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="الجهاز" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">جميع الأجهزة</SelectItem>
                  <SelectItem value="lighting">الإضاءة</SelectItem>
                  <SelectItem value="climate">التحكم بالمناخ</SelectItem>
                  <SelectItem value="appliances">الأجهزة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-slate-400" />
              <Select value={roomFilter} onValueChange={setRoomFilter}>
                <SelectTrigger className="w-36 bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="الغرفة" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">جميع الغرف</SelectItem>
                  <SelectItem value="living">غرفة المعيشة</SelectItem>
                  <SelectItem value="bedroom">غرفة النوم</SelectItem>
                  <SelectItem value="kitchen">المطبخ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <Input type="date" className="w-36 bg-slate-800/50 border-slate-700 text-white" />
              <span className="text-slate-400">إلى</span>
              <Input type="date" className="w-36 bg-slate-800/50 border-slate-700 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="energy" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            الطاقة
          </TabsTrigger>
          <TabsTrigger value="temperature" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
            درجة الحرارة
          </TabsTrigger>
          <TabsTrigger value="devices" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            الأجهزة
          </TabsTrigger>
          <TabsTrigger value="patterns" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            أنماط الاستخدام
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Energy Consumption Chart */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  استهلاك الطاقة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={energyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                        labelStyle={{ color: '#f1f5f9' }}
                      />
                      <Area type="monotone" dataKey="consumption" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="الاستهلاك" />
                      <Area type="monotone" dataKey="solar" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="الطاقة الشمسية" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Room Breakdown */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Home className="w-4 h-4 text-cyan-400" />
                  توزيع حسب الغرفة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center">
                  <ResponsiveContainer width="50%" height="100%">
                    <RePieChart>
                      <Pie
                        data={roomBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {roomBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {roomBreakdown.map((room, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: room.color }} />
                        <span className="text-white text-sm">{room.name}</span>
                        <span className="text-slate-400 text-sm">{room.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations */}
          {aiRecommendations && (
            <Card className="glass-card border-purple-500/30 bg-purple-500/10">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  توصيات الذكاء الاصطناعي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">{aiRecommendations.summary}</p>
                <div className="grid md:grid-cols-2 gap-3">
                  {aiRecommendations.recommendations?.map((rec, i) => (
                    <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="text-white font-medium text-sm">{rec.title}</h5>
                        <Badge className={`text-xs ${
                          rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          rec.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>{rec.priority}</Badge>
                      </div>
                      <p className="text-slate-400 text-xs mb-2">{rec.description}</p>
                      <Badge className="bg-green-500/20 text-green-400 text-xs">توفير: {rec.savings}</Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <p className="text-green-400 font-medium">التوفير المتوقع الإجمالي: {aiRecommendations.totalSavings}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Energy Tab */}
        <TabsContent value="energy" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">مقارنة أسبوعية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="thisWeek" fill="#06b6d4" name="هذا الأسبوع" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="lastWeek" fill="#6366f1" name="الأسبوع الماضي" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">تكلفة الطاقة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReLineChart data={energyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={2} name="التكلفة (ر.س)" dot={{ fill: '#f59e0b' }} />
                    </ReLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Temperature Tab */}
        <TabsContent value="temperature" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-red-400" />
                درجات الحرارة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart data={temperatureData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} domain={[10, 40]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="indoor" stroke="#06b6d4" strokeWidth={2} name="داخلي" />
                    <Line type="monotone" dataKey="outdoor" stroke="#f59e0b" strokeWidth={2} name="خارجي" />
                    <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="المستهدف" />
                  </ReLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">استخدام الأجهزة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deviceUsageData.map((device, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-24 text-white text-sm">{device.name}</div>
                    <div className="flex-1">
                      <Progress value={device.usage} className="h-3" />
                    </div>
                    <div className="w-16 text-slate-400 text-sm text-left">{device.usage}%</div>
                    <div className="w-20 text-cyan-400 text-sm text-left">{device.hours} ساعة</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'نمط الصباح', time: '06:00 - 09:00', devices: ['إضاءة', 'مكيف', 'ماكينة قهوة'], auto: true },
              { title: 'نمط العمل', time: '09:00 - 17:00', devices: ['توفير الطاقة'], auto: true },
              { title: 'نمط المساء', time: '17:00 - 23:00', devices: ['إضاءة', 'تلفاز', 'مكيف'], auto: false },
            ].map((pattern, i) => (
              <Card key={i} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="text-white font-medium">{pattern.title}</h5>
                      <p className="text-slate-400 text-xs">{pattern.time}</p>
                    </div>
                    {pattern.auto && <Badge className="bg-green-500/20 text-green-400 text-xs">تلقائي</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pattern.devices.map((d, j) => (
                      <Badge key={j} variant="outline" className="border-slate-600 text-slate-300 text-xs">{d}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">تصدير التقرير</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300 mb-2 block">صيغة التصدير</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { format: 'pdf', icon: FileText, label: 'PDF', color: 'red' },
                  { format: 'csv', icon: FileSpreadsheet, label: 'CSV', color: 'green' },
                  { format: 'excel', icon: FileSpreadsheet, label: 'Excel', color: 'emerald' },
                  { format: 'json', icon: FileText, label: 'JSON', color: 'blue' },
                ].map(({ format, icon: Icon, label, color }) => (
                  <button
                    key={format}
                    onClick={() => exportReport(format)}
                    className={`p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-${color}-500/50 transition-all flex items-center gap-2`}
                  >
                    <Icon className={`w-4 h-4 text-${color}-400`} />
                    <span className="text-white text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="border-t border-slate-700 pt-4">
              <Label className="text-slate-300 mb-2 block">تقارير دورية</Label>
              <div className="space-y-2">
                {[
                  { period: 'daily', label: 'تقرير يومي', desc: 'كل يوم الساعة 8 صباحاً' },
                  { period: 'weekly', label: 'تقرير أسبوعي', desc: 'كل يوم أحد' },
                  { period: 'monthly', label: 'تقرير شهري', desc: 'أول كل شهر' },
                ].map(({ period, label, desc }) => (
                  <div key={period} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-white text-sm">{label}</p>
                      <p className="text-slate-500 text-xs">{desc}</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-slate-600" onClick={() => generatePeriodicReport(period)}>
                      تفعيل
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}