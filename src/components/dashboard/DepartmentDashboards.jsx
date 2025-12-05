import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Car, Droplets, Shield, Package, Building2, Activity, TrendingUp, TrendingDown,
  Users, AlertTriangle, CheckCircle, Clock, MapPin, Zap, Eye, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// ألوان اللوجو الموحدة
const BRAND_COLORS = {
  primary: '#8B5CF6',
  secondary: '#06B6D4',
  accent: '#EC4899',
  gradient: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 50%, #EC4899 100%)'
};

// بيانات الأقسام
const departmentData = {
  transportation: {
    name: 'النقل والمرور',
    icon: Car,
    color: '#8B5CF6',
    kpis: [
      { label: 'المركبات النشطة', value: '1,234', change: '+5%', up: true },
      { label: 'معدل السرعة', value: '45 كم/س', change: '-8%', up: false },
      { label: 'الازدحام', value: 'متوسط', change: 'مستقر', up: true },
      { label: 'الحوادث اليوم', value: '3', change: '-25%', up: true },
    ],
    chartData: [
      { time: '06:00', traffic: 30, speed: 55 },
      { time: '09:00', traffic: 85, speed: 25 },
      { time: '12:00', traffic: 60, speed: 40 },
      { time: '15:00', traffic: 70, speed: 35 },
      { time: '18:00', traffic: 90, speed: 20 },
      { time: '21:00', traffic: 40, speed: 50 },
    ],
    alerts: [
      { type: 'warning', message: 'ازدحام في شارع الملك فهد', time: '5 دقائق' },
      { type: 'info', message: 'صيانة إشارة مرورية - تقاطع 15', time: '30 دقيقة' },
    ]
  },
  utilities: {
    name: 'المرافق والطاقة',
    icon: Droplets,
    color: '#06B6D4',
    kpis: [
      { label: 'استهلاك الكهرباء', value: '45.2 MW', change: '+3%', up: false },
      { label: 'استهلاك المياه', value: '12.5M³', change: '-5%', up: true },
      { label: 'كفاءة الشبكة', value: '94%', change: '+2%', up: true },
      { label: 'الأعطال النشطة', value: '2', change: '-50%', up: true },
    ],
    chartData: [
      { hour: '00', electricity: 30, water: 15 },
      { hour: '04', electricity: 25, water: 12 },
      { hour: '08', electricity: 55, water: 35 },
      { hour: '12', electricity: 70, water: 45 },
      { hour: '16', electricity: 65, water: 40 },
      { hour: '20', electricity: 45, water: 25 },
    ],
    alerts: [
      { type: 'critical', message: 'ارتفاع استهلاك الطاقة - المنطقة الصناعية', time: '10 دقائق' },
    ]
  },
  safety: {
    name: 'السلامة العامة',
    icon: Shield,
    color: '#EC4899',
    kpis: [
      { label: 'البلاغات اليوم', value: '23', change: '-15%', up: true },
      { label: 'وقت الاستجابة', value: '4.2 دقيقة', change: '-20%', up: true },
      { label: 'الكاميرات النشطة', value: '156', change: '+10', up: true },
      { label: 'معدل الحل', value: '92%', change: '+5%', up: true },
    ],
    chartData: [
      { day: 'السبت', incidents: 15, resolved: 14 },
      { day: 'الأحد', incidents: 22, resolved: 20 },
      { day: 'الإثنين', incidents: 18, resolved: 17 },
      { day: 'الثلاثاء', incidents: 25, resolved: 23 },
      { day: 'الأربعاء', incidents: 20, resolved: 19 },
      { day: 'الخميس', incidents: 23, resolved: 22 },
    ],
    alerts: [
      { type: 'info', message: 'تحديث نظام المراقبة - القطاع C', time: '1 ساعة' },
    ]
  },
  waste: {
    name: 'إدارة النفايات',
    icon: Package,
    color: '#22C55E',
    kpis: [
      { label: 'الحاويات الممتلئة', value: '45', change: '+12', up: false },
      { label: 'الرحلات اليوم', value: '28', change: '+4', up: true },
      { label: 'معدل الجمع', value: '87%', change: '+3%', up: true },
      { label: 'إعادة التدوير', value: '34%', change: '+8%', up: true },
    ],
    chartData: [
      { zone: 'A', collected: 85, capacity: 100 },
      { zone: 'B', collected: 72, capacity: 100 },
      { zone: 'C', collected: 90, capacity: 100 },
      { zone: 'D', collected: 65, capacity: 100 },
      { zone: 'E', collected: 78, capacity: 100 },
    ],
    alerts: [
      { type: 'warning', message: 'حاوية ممتلئة - موقع 45A', time: '15 دقيقة' },
      { type: 'success', message: 'اكتمال جولة المنطقة B', time: '45 دقيقة' },
    ]
  }
};

export default function DepartmentDashboards() {
  const [activeDepartment, setActiveDepartment] = useState('transportation');
  const dept = departmentData[activeDepartment];

  return (
    <div className="space-y-4" dir="rtl">
      {/* Department Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Object.entries(departmentData).map(([key, data]) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveDepartment(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeDepartment === key 
                ? 'text-white shadow-lg' 
                : 'bg-slate-800/50 text-slate-400 hover:text-white'
            }`}
            style={activeDepartment === key ? { background: data.color } : {}}
          >
            <data.icon className="w-5 h-5" />
            <span className="font-medium">{data.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Department Content */}
      <motion.div
        key={activeDepartment}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {dept.kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-slate-700/50 bg-slate-800/30 hover:border-purple-500/50 transition-all">
                <CardContent className="p-4">
                  <p className="text-slate-400 text-sm mb-1">{kpi.label}</p>
                  <p className="text-2xl font-bold text-white">{kpi.value}</p>
                  <div className={`flex items-center gap-1 mt-1 ${kpi.up ? 'text-green-400' : 'text-red-400'}`}>
                    {kpi.up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="text-sm">{kpi.change}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Chart & Alerts */}
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 border-slate-700/50 bg-slate-800/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4" style={{ color: dept.color }} />
                الأداء والتحليل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {activeDepartment === 'waste' ? (
                    <BarChart data={dept.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="zone" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Bar dataKey="collected" fill={dept.color} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <AreaChart data={dept.chartData}>
                      <defs>
                        <linearGradient id={`gradient-${activeDepartment}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={dept.color} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={dept.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey={Object.keys(dept.chartData[0])[0]} stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Area 
                        type="monotone" 
                        dataKey={Object.keys(dept.chartData[0])[1]} 
                        stroke={dept.color} 
                        fill={`url(#gradient-${activeDepartment})`}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700/50 bg-slate-800/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                التنبيهات النشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dept.alerts.map((alert, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-3 rounded-lg ${
                      alert.type === 'critical' ? 'bg-red-500/10 border border-red-500/30' :
                      alert.type === 'warning' ? 'bg-amber-500/10 border border-amber-500/30' :
                      alert.type === 'success' ? 'bg-green-500/10 border border-green-500/30' :
                      'bg-blue-500/10 border border-blue-500/30'
                    }`}
                  >
                    <p className="text-white text-sm">{alert.message}</p>
                    <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.time}
                    </p>
                  </motion.div>
                ))}
                {dept.alerts.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                    <p className="text-slate-400">لا توجد تنبيهات نشطة</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}