import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Phone, Clock, Star, TrendingUp, TrendingDown, Target,
  CheckCircle, AlertTriangle, Users, Zap, Award, Timer, PhoneCall,
  PhoneMissed, ThumbsUp, Settings, Eye, Sparkles, Save, RefreshCw, Brain
} from 'lucide-react';
import AIRealtimeCoaching from './AIRealtimeCoaching';
import AITrainingRecommendations from './AITrainingRecommendations';
import AgentGoalsAndCoaching from './AgentGoalsAndCoaching';
import AgentLearningPathways from './AgentLearningPathways';
import AdvancedAgentKPIDashboard from './AdvancedAgentKPIDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';
import { toast } from 'sonner';

// Real-time KPIs
const defaultKPIs = {
  callsHandled: { value: 47, target: 50, trend: 'up', change: 12, visible: true },
  avgHandleTime: { value: '4:32', target: '5:00', trend: 'down', change: -8, visible: true },
  firstCallResolution: { value: 89, target: 85, trend: 'up', change: 5, visible: true },
  customerSatisfaction: { value: 4.7, target: 4.5, trend: 'up', change: 3, visible: true },
  queueWaitTime: { value: '1:23', target: '2:00', trend: 'down', change: -15, visible: true },
  transferRate: { value: 8, target: 10, trend: 'down', change: -12, visible: true },
  missedCalls: { value: 3, target: 5, trend: 'down', change: -25, visible: false },
  afterCallWork: { value: '1:15', target: '1:30', trend: 'down', change: -10, visible: false },
};

const hourlyData = [
  { hour: '08', calls: 12, satisfaction: 4.5 },
  { hour: '09', calls: 18, satisfaction: 4.6 },
  { hour: '10', calls: 25, satisfaction: 4.8 },
  { hour: '11', calls: 22, satisfaction: 4.7 },
  { hour: '12', calls: 15, satisfaction: 4.4 },
  { hour: '13', calls: 20, satisfaction: 4.6 },
  { hour: '14', calls: 28, satisfaction: 4.9 },
  { hour: '15', calls: 24, satisfaction: 4.7 },
];

const performanceScore = [
  { name: 'الأداء', value: 87, fill: '#22d3ee' },
];

export default function AgentKPIDashboard({ agentId }) {
  const [kpis, setKpis] = useState(defaultKPIs);
  const [showSettings, setShowSettings] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setKpis(prev => ({
        ...prev,
        callsHandled: { ...prev.callsHandled, value: prev.callsHandled.value + Math.floor(Math.random() * 2) },
      }));
      setLastUpdate(new Date());
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const toggleKPIVisibility = (key) => {
    setKpis(prev => ({
      ...prev,
      [key]: { ...prev[key], visible: !prev[key].visible }
    }));
  };

  const saveSettings = () => {
    localStorage.setItem('agent_kpi_settings', JSON.stringify(kpis));
    toast.success('تم حفظ الإعدادات');
    setShowSettings(false);
  };

  const visibleKPIs = Object.entries(kpis).filter(([_, kpi]) => kpi.visible);

  const kpiConfig = {
    callsHandled: { label: 'المكالمات المعالجة', icon: Phone, color: 'cyan', unit: '' },
    avgHandleTime: { label: 'متوسط وقت المعالجة', icon: Timer, color: 'purple', unit: '' },
    firstCallResolution: { label: 'حل من أول اتصال', icon: CheckCircle, color: 'green', unit: '%' },
    customerSatisfaction: { label: 'رضا العملاء', icon: Star, color: 'amber', unit: '/5' },
    queueWaitTime: { label: 'وقت الانتظار', icon: Clock, color: 'blue', unit: '' },
    transferRate: { label: 'نسبة التحويل', icon: Users, color: 'red', unit: '%' },
    missedCalls: { label: 'المكالمات الفائتة', icon: PhoneMissed, color: 'red', unit: '' },
    afterCallWork: { label: 'عمل ما بعد المكالمة', icon: Timer, color: 'slate', unit: '' },
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-white font-bold flex items-center gap-2">
              لوحة مؤشرات الأداء
              <Badge className="bg-green-500/20 text-green-400 text-xs animate-pulse">
                مباشر
              </Badge>
            </h4>
            <p className="text-slate-400 text-xs">آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="border-slate-600 h-8" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="w-3 h-3 ml-1" />
            تخصيص
          </Button>
          <Button size="sm" variant="ghost" className="h-8" onClick={() => setLastUpdate(new Date())}>
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg"
        >
          <h5 className="text-white font-medium mb-3">تخصيص المؤشرات المعروضة</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(kpis).map(([key, kpi]) => {
              const config = kpiConfig[key];
              return (
                <div key={key} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                  <Label className="text-slate-300 text-xs">{config.label}</Label>
                  <Switch checked={kpi.visible} onCheckedChange={() => toggleKPIVisibility(key)} />
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-700">
            <div className="flex items-center gap-2">
              <Label className="text-slate-300 text-xs">فترة التحديث</Label>
              <Select value={String(refreshInterval)} onValueChange={(v) => setRefreshInterval(Number(v))}>
                <SelectTrigger className="w-24 h-8 bg-slate-900 border-slate-700 text-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="10">10 ثواني</SelectItem>
                  <SelectItem value="30">30 ثانية</SelectItem>
                  <SelectItem value="60">دقيقة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 h-8" onClick={saveSettings}>
              <Save className="w-3 h-3 ml-1" />
              حفظ
            </Button>
          </div>
        </motion.div>
      )}

      {/* Performance Score */}
      <div className="grid lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-20 h-20">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={performanceScore}>
                  <RadialBar dataKey="value" cornerRadius={10} fill="#22d3ee" />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">87%</p>
              <p className="text-slate-400 text-sm">درجة الأداء الكلية</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-green-400 text-xs">+5% من الأسبوع الماضي</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top KPIs */}
        {visibleKPIs.slice(0, 3).map(([key, kpi]) => {
          const config = kpiConfig[key];
          const Icon = config.icon;
          const isPositive = kpi.change > 0;
          const isBetter = (key === 'transferRate' || key === 'missedCalls' || key === 'queueWaitTime' || key === 'avgHandleTime') 
            ? !isPositive 
            : isPositive;

          return (
            <Card key={key} className={`bg-${config.color}-500/5 border-${config.color}-500/30`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 text-${config.color}-400`} />
                  <div className={`flex items-center gap-1 ${isBetter ? 'text-green-400' : 'text-red-400'}`}>
                    {isBetter ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span className="text-xs">{Math.abs(kpi.change)}%</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{kpi.value}{config.unit}</p>
                <p className="text-slate-400 text-xs">{config.label}</p>
                <p className="text-slate-500 text-xs mt-1">الهدف: {kpi.target}{config.unit}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">المكالمات حسب الساعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="calls" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} name="المكالمات" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">رضا العملاء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[4, 5]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="satisfaction" stroke="#f59e0b" strokeWidth={2} name="التقييم" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional KPIs Grid */}
      {visibleKPIs.length > 4 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {visibleKPIs.slice(3).map(([key, kpi]) => {
            const config = kpiConfig[key];
            const Icon = config.icon;
            return (
              <Card key={key} className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 text-${config.color}-400`} />
                    <span className="text-slate-400 text-xs">{config.label}</span>
                  </div>
                  <p className="text-lg font-bold text-white">{kpi.value}{config.unit}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Advanced KPI Dashboard */}
      <AdvancedAgentKPIDashboard agentId={agentId} />

      {/* AI Coaching & Training */}
      <div className="grid lg:grid-cols-2 gap-4">
        <AIRealtimeCoaching
          isCallActive={true}
          callTranscript="محادثة تجريبية مع العميل"
          agentPerformance={performanceScore[0].value}
        />
        <AITrainingRecommendations
          agentPerformance={performanceScore[0].value}
          performanceGaps={['التعامل مع الشكاوى', 'البيع الإضافي']}
        />
      </div>

      {/* Learning Pathways */}
      <AgentLearningPathways agentId={agentId} agentPerformance={performanceScore[0].value} />

      {/* Agent Goals & Peer Coaching */}
      <AgentGoalsAndCoaching agentId={agentId} />
      </div>
      );
      }