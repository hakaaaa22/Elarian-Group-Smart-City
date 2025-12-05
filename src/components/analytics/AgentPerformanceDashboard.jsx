import React, { useState } from 'react';
import {
  User, Clock, ThumbsUp, CheckCircle, TrendingUp, TrendingDown,
  Phone, MessageCircle, Mail, BarChart3, Target, Award, Calendar, Mic
} from 'lucide-react';
import CallQualityMonitoring from './CallQualityMonitoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'];

const agentData = [
  { name: 'أحمد محمد', avgResolution: 12, csat: 94, interactions: 156, sla: 96, calls: 89, chats: 45, emails: 22 },
  { name: 'سارة علي', avgResolution: 8, csat: 98, interactions: 189, sla: 99, calls: 72, chats: 85, emails: 32 },
  { name: 'خالد السعيد', avgResolution: 15, csat: 88, interactions: 134, sla: 91, calls: 95, chats: 28, emails: 11 },
  { name: 'فاطمة أحمد', avgResolution: 10, csat: 96, interactions: 167, sla: 97, calls: 68, chats: 67, emails: 32 },
  { name: 'عبدالله فهد', avgResolution: 18, csat: 85, interactions: 98, sla: 88, calls: 56, chats: 32, emails: 10 },
];

const weeklyTrend = [
  { day: 'السبت', resolution: 12, csat: 92, sla: 94 },
  { day: 'الأحد', resolution: 10, csat: 94, sla: 96 },
  { day: 'الإثنين', resolution: 14, csat: 90, sla: 92 },
  { day: 'الثلاثاء', resolution: 9, csat: 96, sla: 98 },
  { day: 'الأربعاء', resolution: 11, csat: 93, sla: 95 },
  { day: 'الخميس', resolution: 13, csat: 91, sla: 93 },
];

const channelDistribution = [
  { name: 'مكالمات', value: 45, color: '#22d3ee' },
  { name: 'محادثات', value: 35, color: '#a855f7' },
  { name: 'بريد', value: 15, color: '#22c55e' },
  { name: 'أخرى', value: 5, color: '#f59e0b' },
];

export default function AgentPerformanceDashboard() {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [activeView, setActiveView] = useState('performance');

  const filteredAgents = selectedAgent === 'all' ? agentData : agentData.filter(a => a.name === selectedAgent);
  
  const avgMetrics = {
    resolution: Math.round(filteredAgents.reduce((s, a) => s + a.avgResolution, 0) / filteredAgents.length),
    csat: Math.round(filteredAgents.reduce((s, a) => s + a.csat, 0) / filteredAgents.length),
    sla: Math.round(filteredAgents.reduce((s, a) => s + a.sla, 0) / filteredAgents.length),
    interactions: filteredAgents.reduce((s, a) => s + a.interactions, 0),
  };

  const radarData = selectedAgent !== 'all' ? [
    { metric: 'وقت الحل', value: 100 - (filteredAgents[0]?.avgResolution || 0) * 3 },
    { metric: 'رضا العملاء', value: filteredAgents[0]?.csat || 0 },
    { metric: 'SLA', value: filteredAgents[0]?.sla || 0 },
    { metric: 'الإنتاجية', value: Math.min((filteredAgents[0]?.interactions || 0) / 2, 100) },
    { metric: 'الجودة', value: 90 },
  ] : [];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            تحليلات أداء الوكلاء
          </h3>
          <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
            <Button size="sm" variant={activeView === 'performance' ? 'default' : 'ghost'} className="h-7" onClick={() => setActiveView('performance')}>
              <BarChart3 className="w-3 h-3 ml-1" />
              الأداء
            </Button>
            <Button size="sm" variant={activeView === 'quality' ? 'default' : 'ghost'} className="h-7" onClick={() => setActiveView('quality')}>
              <Mic className="w-3 h-3 ml-1" />
              جودة المكالمات
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue placeholder="الوكيل" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">جميع الوكلاء</SelectItem>
              {agentData.map(a => <SelectItem key={a.name} value={a.name}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="week">أسبوع</SelectItem>
              <SelectItem value="month">شهر</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quality Monitoring View */}
      {activeView === 'quality' && <CallQualityMonitoring />}

      {/* Performance View */}
      {activeView === 'performance' && (
        <>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-cyan-400" />
              <Badge className="bg-green-500/20 text-green-400">
                <TrendingDown className="w-3 h-3 ml-1" />
                -8%
              </Badge>
            </div>
            <p className="text-3xl font-bold text-white">{avgMetrics.resolution} دقيقة</p>
            <p className="text-slate-400 text-sm">متوسط وقت الحل</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <ThumbsUp className="w-8 h-8 text-purple-400" />
              <Badge className="bg-green-500/20 text-green-400">
                <TrendingUp className="w-3 h-3 ml-1" />
                +3%
              </Badge>
            </div>
            <p className="text-3xl font-bold text-white">{avgMetrics.csat}%</p>
            <p className="text-slate-400 text-sm">رضا العملاء (CSAT)</p>
          </CardContent>
        </Card>

        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">
                <TrendingUp className="w-3 h-3 ml-1" />
                +2%
              </Badge>
            </div>
            <p className="text-3xl font-bold text-white">{avgMetrics.sla}%</p>
            <p className="text-slate-400 text-sm">الالتزام بـ SLA</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <MessageCircle className="w-8 h-8 text-amber-400" />
              <Badge className="bg-green-500/20 text-green-400">
                <TrendingUp className="w-3 h-3 ml-1" />
                +12%
              </Badge>
            </div>
            <p className="text-3xl font-bold text-white">{avgMetrics.interactions}</p>
            <p className="text-slate-400 text-sm">إجمالي التفاعلات</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">اتجاه الأداء الأسبوعي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="csat" stroke="#a855f7" strokeWidth={2} name="CSAT %" />
                  <Line type="monotone" dataKey="sla" stroke="#22c55e" strokeWidth={2} name="SLA %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Channel Distribution */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">توزيع التفاعلات حسب القناة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {channelDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {channelDistribution.map(item => (
                <div key={item.name} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400 text-xs">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Agent Comparison */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">مقارنة أداء الوكلاء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={80} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="csat" fill="#a855f7" name="CSAT" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Agent Radar (when single agent selected) */}
        {selectedAgent !== 'all' && (
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">تحليل أداء: {selectedAgent}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" />
                    <Radar name="الأداء" dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.4} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Agent Leaderboard */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            قائمة المتصدرين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...agentData].sort((a, b) => b.csat - a.csat).map((agent, i) => (
              <div key={agent.name} className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-slate-400/20 text-slate-400' : i === 2 ? 'bg-amber-700/20 text-amber-700' : 'bg-slate-700 text-slate-500'}`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{agent.name}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>CSAT: {agent.csat}%</span>
                    <span>SLA: {agent.sla}%</span>
                    <span>{agent.interactions} تفاعل</span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-cyan-400">{agent.csat}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}