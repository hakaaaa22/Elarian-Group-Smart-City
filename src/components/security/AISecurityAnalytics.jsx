import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Shield, AlertTriangle, Eye, Camera, User, Clock, TrendingUp,
  Activity, Zap, Target, BarChart3, PieChart, LineChart as LineChartIcon,
  RefreshCw, Bell, Map, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const threatTrends = [
  { time: '00:00', threats: 2, anomalies: 5, alerts: 3 },
  { time: '04:00', threats: 1, anomalies: 3, alerts: 2 },
  { time: '08:00', threats: 8, anomalies: 12, alerts: 10 },
  { time: '12:00', threats: 5, anomalies: 8, alerts: 7 },
  { time: '16:00', threats: 12, anomalies: 18, alerts: 15 },
  { time: '20:00', threats: 4, anomalies: 6, alerts: 5 },
];

const anomalyTypes = [
  { name: 'سلوك غير طبيعي', value: 35, color: '#f59e0b' },
  { name: 'تجاوز الوقت', value: 25, color: '#ef4444' },
  { name: 'دخول غير مصرح', value: 20, color: '#8b5cf6' },
  { name: 'تطابق وجه ضعيف', value: 12, color: '#06b6d4' },
  { name: 'أخرى', value: 8, color: '#64748b' },
];

const riskZones = [
  { zone: 'البوابة الرئيسية', risk: 75 },
  { zone: 'موقف السيارات', risk: 45 },
  { zone: 'منطقة الاستقبال', risk: 30 },
  { zone: 'المكاتب الإدارية', risk: 20 },
  { zone: 'المستودعات', risk: 60 },
];

const realtimeAlerts = [
  { id: 1, type: 'تطابق وجه ضعيف', visitor: 'زائر #4521', camera: 'كاميرا البوابة', time: 'منذ 2 دقيقة', severity: 'high', correlated: true },
  { id: 2, type: 'تجاوز وقت الخروج', visitor: 'سارة خالد', camera: 'كاميرا الاستقبال', time: 'منذ 5 دقائق', severity: 'medium', correlated: true },
  { id: 3, type: 'محاولة دخول منطقة محظورة', visitor: 'أحمد محمد', camera: 'كاميرا المستودع', time: 'منذ 8 دقائق', severity: 'critical', correlated: true },
];

const predictions = [
  { metric: 'احتمال تهديد أمني', value: 23, trend: 'down', change: -5 },
  { metric: 'ذروة الازدحام المتوقعة', value: '14:30', trend: 'up', change: '+30 زائر' },
  { metric: 'تنبيهات متوقعة اليوم', value: 12, trend: 'stable', change: '±2' },
  { metric: 'مستوى الخطر العام', value: 35, trend: 'down', change: -8 },
];

export default function AISecurityAnalytics() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const runDeepAnalysis = async () => {
    setIsAnalyzing(true);
    await new Promise(r => setTimeout(r, 3000));
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              boxShadow: ['0 0 20px rgba(139, 92, 246, 0.3)', '0 0 40px rgba(6, 182, 212, 0.4)', '0 0 20px rgba(139, 92, 246, 0.3)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20"
          >
            <Brain className="w-7 h-7 text-purple-400" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-white">تحليلات الأمان بالذكاء الاصطناعي</h3>
            <p className="text-slate-500 text-sm">
              تحليل الأنماط والتنبؤ بالتهديدات • آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')}
            </p>
          </div>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={runDeepAnalysis} disabled={isAnalyzing}>
          {isAnalyzing ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Zap className="w-4 h-4 ml-2" />}
          تحليل عميق
        </Button>
      </div>

      {/* Predictions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {predictions.map((pred, i) => (
          <motion.div
            key={pred.metric}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <Badge className={
                    pred.trend === 'down' ? 'bg-green-500/20 text-green-400' :
                    pred.trend === 'up' ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'
                  }>
                    {pred.change}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-white">{typeof pred.value === 'number' ? `${pred.value}%` : pred.value}</p>
                <p className="text-slate-500 text-sm">{pred.metric}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Threat Trends */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              اتجاهات التهديدات (24 ساعة)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={threatTrends}>
                  <defs>
                    <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="anomalyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="threats" stroke="#ef4444" fill="url(#threatGradient)" name="تهديدات" />
                  <Area type="monotone" dataKey="anomalies" stroke="#f59e0b" fill="url(#anomalyGradient)" name="شذوذات" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Anomaly Distribution */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-400" />
              توزيع الشذوذات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="50%" height="100%">
                <RechartsPie>
                  <Pie
                    data={anomalyTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {anomalyTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {anomalyTypes.map(type => (
                  <div key={type.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: type.color }} />
                    <span className="text-slate-400 text-sm flex-1">{type.name}</span>
                    <span className="text-white font-medium">{type.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Realtime Correlated Alerts */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-red-400" />
            تنبيهات مترابطة في الوقت الفعلي
            <Badge className="bg-red-500 text-white animate-pulse">{realtimeAlerts.length} نشط</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {realtimeAlerts.map(alert => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg border ${
                  alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                  alert.severity === 'high' ? 'bg-amber-500/10 border-amber-500/30' :
                  'bg-slate-900/50 border-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-5 h-5 ${
                      alert.severity === 'critical' ? 'text-red-400' :
                      alert.severity === 'high' ? 'text-amber-400' : 'text-slate-400'
                    }`} />
                    <div>
                      <p className="text-white font-medium">{alert.type}</p>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span><User className="w-3 h-3 inline ml-1" />{alert.visitor}</span>
                        <span><Camera className="w-3 h-3 inline ml-1" />{alert.camera}</span>
                        <span><Clock className="w-3 h-3 inline ml-1" />{alert.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {alert.correlated && (
                      <Badge className="bg-purple-500/20 text-purple-400">
                        <Brain className="w-3 h-3 ml-1" />
                        AI مترابط
                      </Badge>
                    )}
                    <Button size="sm" variant="outline" className="border-slate-600 h-8">
                      <Eye className="w-3 h-3 ml-1" />
                      عرض
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Zones */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Map className="w-4 h-4 text-pink-400" />
            تحليل مستوى الخطر حسب المنطقة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            {riskZones.map(zone => (
              <div key={zone.zone} className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="35" stroke="#334155" strokeWidth="6" fill="none" />
                    <circle
                      cx="40" cy="40" r="35"
                      stroke={zone.risk > 60 ? '#ef4444' : zone.risk > 40 ? '#f59e0b' : '#22c55e'}
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${zone.risk * 2.2} 220`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-white font-bold">
                    {zone.risk}%
                  </span>
                </div>
                <p className="text-slate-400 text-sm">{zone.zone}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}