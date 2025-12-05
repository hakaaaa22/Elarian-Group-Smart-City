import React from 'react';
import { motion } from 'framer-motion';
import {
  Car, TrendingUp, AlertTriangle, Clock, MapPin,
  ArrowUp, ArrowDown, Activity, Gauge
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const trafficData = [
  { time: '00:00', flow: 120, incidents: 2 },
  { time: '04:00', flow: 80, incidents: 0 },
  { time: '08:00', flow: 450, incidents: 5 },
  { time: '12:00', flow: 380, incidents: 3 },
  { time: '16:00', flow: 520, incidents: 8 },
  { time: '20:00', flow: 280, incidents: 2 },
  { time: '23:00', flow: 150, incidents: 1 },
];

const zones = [
  { name: 'الطريق السريع A1', flow: 'كثيف', speed: 72, congestion: 78, trend: 'up' },
  { name: 'وسط المدينة', flow: 'متوسط', speed: 45, congestion: 45, trend: 'down' },
  { name: 'المنطقة الصناعية', flow: 'خفيف', speed: 88, congestion: 22, trend: 'stable' },
  { name: 'المنطقة السكنية', flow: 'خفيف', speed: 56, congestion: 15, trend: 'stable' },
  { name: 'طريق المطار', flow: 'كثيف', speed: 64, congestion: 68, trend: 'up' },
];

const recentIncidents = [
  { id: 1, type: 'حادث', location: 'الطريق السريع A1 - كم 45', time: 'منذ 10 دقائق', severity: 'high' },
  { id: 2, type: 'أعمال بناء', location: 'وسط المدينة - الشارع الرئيسي', time: 'منذ ساعتين', severity: 'medium' },
  { id: 3, type: 'ازدحام', location: 'طريق المطار', time: 'منذ 30 دقيقة', severity: 'low' },
];

export default function TrafficIntelligence() {
  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <Car className="w-8 h-8 text-emerald-400" />
          ذكاء المرور
        </h1>
        <p className="text-slate-400 mt-1">مراقبة وتحليل حركة المرور في الوقت الفعلي</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'المستشعرات النشطة', value: '248', icon: Activity, color: 'cyan' },
          { label: 'متوسط السرعة', value: '68 كم/س', icon: Gauge, color: 'emerald' },
          { label: 'مؤشر المرور', value: '2.5', icon: TrendingUp, color: 'purple' },
          { label: 'الحوادث اليوم', value: '21', icon: AlertTriangle, color: 'amber' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-400">{stat.label}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}-500/20`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Traffic Flow Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                تحليل تدفق المرور
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData}>
                    <defs>
                      <linearGradient id="flowGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.1)" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        borderRadius: '8px',
                        color: '#fff'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="flow" 
                      stroke="#22d3ee" 
                      fill="url(#flowGradient)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Incidents */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 h-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                الحوادث الأخيرة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentIncidents.map((incident) => (
                <div key={incident.id} className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium text-sm">{incident.type}</span>
                    <Badge className={`text-xs ${
                      incident.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                      incident.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {incident.severity}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {incident.location}
                  </p>
                  <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {incident.time}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Zone Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader>
            <CardTitle className="text-white">حالة المناطق</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {zones.map((zone) => (
                <div key={zone.name} className="p-4 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-medium text-sm">{zone.name}</h3>
                    {zone.trend === 'up' ? (
                      <ArrowUp className="w-4 h-4 text-red-400" />
                    ) : zone.trend === 'down' ? (
                      <ArrowDown className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Activity className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">التدفق</span>
                      <Badge className={`${
                        zone.flow === 'كثيف' ? 'bg-red-500/20 text-red-400' :
                        zone.flow === 'متوسط' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {zone.flow}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">متوسط السرعة</span>
                      <span className="text-white">{zone.speed} كم/س</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">الازدحام</span>
                        <span className="text-white">{zone.congestion}%</span>
                      </div>
                      <Progress value={zone.congestion} className="h-1.5 bg-slate-700" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}