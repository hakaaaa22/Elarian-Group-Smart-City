import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Zap, Building2, Car, Droplets, Leaf, GraduationCap, ShoppingBag,
  Plane, Factory, Shield, Sun, Truck, Activity, Users, TrendingUp,
  AlertTriangle, MapPin, Wifi, Radio, Globe, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const cityModules = [
  { id: 'governance', name: 'الحوكمة الذكية', icon: Building2, color: 'cyan', status: 98, alerts: 2 },
  { id: 'traffic', name: 'المرور والتنقل', icon: Car, color: 'amber', status: 87, alerts: 5 },
  { id: 'utilities', name: 'المرافق', icon: Droplets, color: 'blue', status: 95, alerts: 1 },
  { id: 'environment', name: 'البيئة', icon: Leaf, color: 'green', status: 92, alerts: 3 },
  { id: 'safety', name: 'السلامة العامة', icon: Shield, color: 'red', status: 99, alerts: 0 },
  { id: 'education', name: 'التعليم', icon: GraduationCap, color: 'purple', status: 94, alerts: 1 },
  { id: 'commerce', name: 'التجارة', icon: ShoppingBag, color: 'pink', status: 91, alerts: 2 },
  { id: 'energy', name: 'الطاقة', icon: Sun, color: 'yellow', status: 96, alerts: 1 },
];

const aiPredictions = [
  { type: 'traffic', prediction: 'ازدحام متوقع على طريق الملك فهد الساعة 5:30', confidence: 92, action: 'تحويل مسارات' },
  { type: 'energy', prediction: 'ذروة استهلاك كهرباء خلال 2 ساعة', confidence: 88, action: 'تفعيل الاحتياطي' },
  { type: 'safety', prediction: 'احتمال تجمع في منطقة الحديقة', confidence: 75, action: 'نشر دوريات' },
];

const realTimeData = [
  { time: '00:00', traffic: 20, energy: 45, water: 30 },
  { time: '04:00', traffic: 15, energy: 35, water: 25 },
  { time: '08:00', traffic: 85, energy: 70, water: 55 },
  { time: '12:00', traffic: 65, energy: 85, water: 60 },
  { time: '16:00', traffic: 90, energy: 80, water: 50 },
  { time: '20:00', traffic: 55, energy: 75, water: 45 },
];

export default function SmartCityBrain() {
  const [liveTime, setLiveTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const interval = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const cityHealth = Math.round(cityModules.reduce((s, m) => s + m.status, 0) / cityModules.length);
  const totalAlerts = cityModules.reduce((s, m) => s + m.alerts, 0);

  return (
    <div className="min-h-screen p-4 lg:p-6 bg-[#0a0e1a]" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-cyan-400 animate-pulse" />
              العقل الذكي للمدينة
            </h1>
            <p className="text-slate-400 mt-1">نظام الذكاء الاصطناعي المركزي للمدينة</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-left">
              <p className="text-2xl font-bold text-cyan-400">{liveTime.toLocaleTimeString('ar-SA')}</p>
              <p className="text-slate-500 text-sm">{liveTime.toLocaleDateString('ar-SA')}</p>
            </div>
            <Badge className="bg-green-500/20 text-green-400 animate-pulse">
              <Wifi className="w-3 h-3 ml-1" />
              متصل
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* City Health Score */}
      <Card className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500/30 mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 mb-2">صحة المدينة الإجمالية</p>
              <div className="flex items-center gap-4">
                <span className="text-5xl font-bold text-white">{cityHealth}%</span>
                <div className="space-y-1">
                  <Badge className="bg-green-500/20 text-green-400">جميع الأنظمة تعمل</Badge>
                  <Badge className="bg-amber-500/20 text-amber-400">{totalAlerts} تنبيهات نشطة</Badge>
                </div>
              </div>
            </div>
            <div className="hidden md:flex gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`w-3 h-16 rounded-full ${i < Math.floor(cityHealth / 12.5) ? 'bg-cyan-400' : 'bg-slate-700'}`} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {cityModules.map(module => (
          <Card key={module.id} className={`bg-${module.color}-500/10 border-${module.color}-500/30 cursor-pointer hover:border-${module.color}-400`}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <module.icon className={`w-5 h-5 text-${module.color}-400`} />
                {module.alerts > 0 && <Badge className="bg-red-500/20 text-red-400 text-xs">{module.alerts}</Badge>}
              </div>
              <p className="text-white font-medium text-sm">{module.name}</p>
              <div className="flex items-center gap-2 mt-2">
                <Progress value={module.status} className="h-1.5 flex-1" />
                <span className={`text-${module.color}-400 text-xs font-bold`}>{module.status}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* AI Predictions */}
        <Card className="glass-card border-purple-500/30 bg-purple-500/5 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              تنبؤات الذكاء الاصطناعي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiPredictions.map((pred, i) => (
                <div key={i} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white">{pred.prediction}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-purple-500/20 text-purple-400">ثقة {pred.confidence}%</Badge>
                        <Badge className="bg-cyan-500/20 text-cyan-400">{pred.action}</Badge>
                      </div>
                    </div>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">تنفيذ</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">إحصائيات لحظية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'السكان النشطون', value: '2.4M', icon: Users, color: 'cyan' },
              { label: 'المركبات', value: '485K', icon: Car, color: 'amber' },
              { label: 'أجهزة IoT', value: '1.2M', icon: Radio, color: 'purple' },
              { label: 'الحوادث اليوم', value: '12', icon: AlertTriangle, color: 'red' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                <div className="flex items-center gap-2">
                  <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
                  <span className="text-slate-400 text-sm">{stat.label}</span>
                </div>
                <span className={`text-${stat.color}-400 font-bold`}>{stat.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Real-time Chart */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">استهلاك الموارد على مدار اليوم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={realTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="traffic" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} name="المرور" />
                <Area type="monotone" dataKey="energy" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} name="الطاقة" />
                <Area type="monotone" dataKey="water" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="المياه" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}