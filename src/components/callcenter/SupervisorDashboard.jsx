import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Phone, Clock, TrendingUp, TrendingDown, AlertTriangle, Brain,
  Activity, BarChart3, Target, Star, Zap, Shield, Eye, Headphones,
  Battery, Heart, Coffee, AlertCircle, CheckCircle, XCircle, Gauge,
  ThermometerSun, Volume2, MessageSquare, Timer, User, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// Mock real-time data
const queueData = [
  { time: '10:00', calls: 12, waiting: 3, aht: 4.2 },
  { time: '10:15', calls: 18, waiting: 5, aht: 4.5 },
  { time: '10:30', calls: 25, waiting: 8, aht: 4.8 },
  { time: '10:45', calls: 22, waiting: 6, aht: 4.3 },
  { time: '11:00', calls: 30, waiting: 10, aht: 5.0 },
  { time: '11:15', calls: 28, waiting: 7, aht: 4.6 },
];

const agentsRealTime = [
  { id: 1, name: 'سارة أحمد', status: 'on_call', fatigue: 35, stress: 25, calls: 15, aht: '4:20', qScore: 95, customerMood: 'positive', callDuration: '3:45' },
  { id: 2, name: 'محمد فهد', status: 'on_call', fatigue: 65, stress: 55, calls: 18, aht: '5:10', qScore: 88, customerMood: 'negative', callDuration: '8:20' },
  { id: 3, name: 'ليلى حسن', status: 'available', fatigue: 20, stress: 15, calls: 12, aht: '3:50', qScore: 98, customerMood: 'neutral', callDuration: '0:00' },
  { id: 4, name: 'عمر خالد', status: 'break', fatigue: 80, stress: 70, calls: 20, aht: '5:30', qScore: 82, customerMood: 'neutral', callDuration: '0:00' },
  { id: 5, name: 'نورة السعيد', status: 'on_call', fatigue: 45, stress: 40, calls: 14, aht: '4:00', qScore: 92, customerMood: 'positive', callDuration: '2:15' },
];

const riskAlerts = [
  { id: 1, type: 'angry_customer', agent: 'محمد فهد', severity: 'high', message: 'عميل غاضب جداً - قد يحتاج تدخل', time: '11:15' },
  { id: 2, type: 'agent_fatigue', agent: 'عمر خالد', severity: 'medium', message: 'الوكيل متعب - يُنصح بفترة راحة', time: '11:10' },
  { id: 3, type: 'long_call', agent: 'محمد فهد', severity: 'low', message: 'مكالمة تجاوزت 8 دقائق', time: '11:05' },
  { id: 4, type: 'abuse_detected', agent: 'سارة أحمد', severity: 'critical', message: 'كشف لغة غير لائقة من العميل', time: '11:00' },
];

export default function SupervisorDashboard() {
  const [liveStats, setLiveStats] = useState({
    totalCalls: 156,
    inQueue: 8,
    avgWaitTime: '1:45',
    aht: '4:32',
    fcr: 91,
    sla: 94,
    onlineAgents: 4,
    busyAgents: 3,
    angryCustomers: 2,
    predictedLoad: 'heavy',
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Simulate live updates
      setLiveStats(prev => ({
        ...prev,
        inQueue: Math.max(0, prev.inQueue + Math.floor(Math.random() * 3) - 1),
        totalCalls: prev.totalCalls + Math.floor(Math.random() * 2),
      }));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'on_call': return 'blue';
      case 'available': return 'green';
      case 'break': return 'amber';
      case 'offline': return 'slate';
      default: return 'slate';
    }
  };

  const getFatigueColor = (level) => {
    if (level < 40) return 'green';
    if (level < 70) return 'amber';
    return 'red';
  };

  const getMoodIcon = (mood) => {
    switch (mood) {
      case 'positive': return { icon: '😊', color: 'green' };
      case 'negative': return { icon: '😠', color: 'red' };
      default: return { icon: '😐', color: 'slate' };
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
            <Eye className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">لوحة المشرف الذكية</h3>
            <p className="text-slate-400 text-sm">AI Supervisor Dashboard • مراقبة حية</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-500/20 text-green-400 animate-pulse">
            🔴 مباشر
          </Badge>
          <span className="text-slate-400 text-sm">
            {currentTime.toLocaleTimeString('ar-SA')}
          </span>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <Phone className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{liveStats.totalCalls}</p>
            <p className="text-xs text-slate-400">إجمالي اليوم</p>
          </CardContent>
        </Card>
        <Card className={`${liveStats.inQueue > 5 ? 'bg-red-500/10 border-red-500/30 animate-pulse' : 'bg-amber-500/10 border-amber-500/30'}`}>
          <CardContent className="p-3 text-center">
            <Clock className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{liveStats.inQueue}</p>
            <p className="text-xs text-slate-400">في الانتظار</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <Timer className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{liveStats.aht}</p>
            <p className="text-xs text-slate-400">AHT</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <Target className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{liveStats.sla}%</p>
            <p className="text-xs text-slate-400">SLA</p>
          </CardContent>
        </Card>
        <Card className={`${liveStats.predictedLoad === 'heavy' ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
          <CardContent className="p-3 text-center">
            <Brain className="w-5 h-5 text-pink-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">
              {liveStats.predictedLoad === 'heavy' ? 'ضغط عالي' : 'عادي'}
            </p>
            <p className="text-xs text-slate-400">توقع AI</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Queue Heatmap / Chart */}
        <Card className="lg:col-span-2 bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              حركة الطابور
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={queueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="calls" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} name="المكالمات" />
                  <Area type="monotone" dataKey="waiting" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} name="الانتظار" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Alerts */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              تنبيهات المخاطر
              <Badge className="bg-red-500/20 text-red-400">{riskAlerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {riskAlerts.map(alert => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-2 rounded-lg ${
                      alert.severity === 'critical' ? 'bg-red-500/20 border border-red-500/30 animate-pulse' :
                      alert.severity === 'high' ? 'bg-orange-500/20 border border-orange-500/30' :
                      alert.severity === 'medium' ? 'bg-amber-500/20 border border-amber-500/30' :
                      'bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        alert.severity === 'critical' ? 'text-red-400' :
                        alert.severity === 'high' ? 'text-orange-400' :
                        'text-amber-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm">{alert.message}</p>
                        <p className="text-slate-500 text-xs">{alert.agent} • {alert.time}</p>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 text-cyan-400">
                        تدخل
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Agent Status Grid */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-green-400" />
            حالة الوكلاء (مباشر)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
            {agentsRealTime.map(agent => {
              const mood = getMoodIcon(agent.customerMood);
              return (
                <Card key={agent.id} className={`bg-slate-900/50 border-${getStatusColor(agent.status)}-500/30`}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={`bg-${getStatusColor(agent.status)}-500/20 text-${getStatusColor(agent.status)}-400 text-xs`}>
                          {agent.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{agent.name}</p>
                        <Badge className={`text-xs bg-${getStatusColor(agent.status)}-500/20 text-${getStatusColor(agent.status)}-400`}>
                          {agent.status === 'on_call' ? 'في مكالمة' : agent.status === 'available' ? 'متاح' : 'استراحة'}
                        </Badge>
                      </div>
                    </div>

                    {/* Fatigue & Stress Bars */}
                    <div className="space-y-2 mb-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Battery className="w-3 h-3" /> إرهاق
                          </span>
                          <span className={`text-${getFatigueColor(agent.fatigue)}-400`}>{agent.fatigue}%</span>
                        </div>
                        <Progress value={agent.fatigue} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Heart className="w-3 h-3" /> ضغط
                          </span>
                          <span className={`text-${getFatigueColor(agent.stress)}-400`}>{agent.stress}%</span>
                        </div>
                        <Progress value={agent.stress} className="h-1.5" />
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{agent.calls} مكالمة</span>
                      <span className="text-cyan-400">QA {agent.qScore}%</span>
                      {agent.status === 'on_call' && (
                        <span className={`text-${mood.color}-400`}>{mood.icon}</span>
                      )}
                    </div>

                    {/* Call Duration */}
                    {agent.status === 'on_call' && (
                      <div className="mt-2 pt-2 border-t border-slate-700/50 text-center">
                        <span className="text-white font-mono">{agent.callDuration}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {agent.fatigue > 60 && (
                      <Button size="sm" variant="outline" className="w-full mt-2 border-amber-500/50 text-amber-400 h-7 text-xs">
                        <Coffee className="w-3 h-3 ml-1" />
                        اقتراح راحة
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Predictions */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-white font-medium">تنبؤ AI: الساعة القادمة ستشهد ضغطاً متوسطاً</p>
              <p className="text-slate-400 text-sm">يُنصح بإعادة توزيع المكالمات وإعطاء فترة راحة لـ عمر خالد</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}