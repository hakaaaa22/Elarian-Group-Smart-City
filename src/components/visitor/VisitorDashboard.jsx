import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, UserCheck, UserX, Clock, Calendar, Shield, AlertTriangle,
  TrendingUp, TrendingDown, Car, DoorOpen, Camera, Bell, Activity,
  FileText, CheckCircle, XCircle, Eye, ArrowUpRight, Timer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// بيانات الرسوم البيانية
const hourlyVisitors = [
  { hour: '06', visitors: 5 },
  { hour: '08', visitors: 45 },
  { hour: '10', visitors: 78 },
  { hour: '12', visitors: 62 },
  { hour: '14', visitors: 55 },
  { hour: '16', visitors: 40 },
  { hour: '18', visitors: 15 },
];

const weeklyData = [
  { day: 'الأحد', visitors: 145, permits: 32 },
  { day: 'الإثنين', visitors: 178, permits: 45 },
  { day: 'الثلاثاء', visitors: 156, permits: 38 },
  { day: 'الأربعاء', visitors: 189, permits: 52 },
  { day: 'الخميس', visitors: 134, permits: 28 },
];

const visitorTypes = [
  { name: 'زوار', value: 45, color: '#06B6D4' },
  { name: 'متعاقدون', value: 25, color: '#F59E0B' },
  { name: 'عملاء', value: 15, color: '#8B5CF6' },
  { name: 'موردون', value: 10, color: '#22C55E' },
  { name: 'توصيل', value: 5, color: '#EC4899' },
];

const recentActivity = [
  { id: 1, type: 'checkin', visitor: 'أحمد محمد', gate: 'البوابة الرئيسية', time: '09:45', status: 'success' },
  { id: 2, type: 'checkout', visitor: 'سارة أحمد', gate: 'بوابة الموظفين', time: '09:30', status: 'success' },
  { id: 3, type: 'denied', visitor: 'محمد علي', gate: 'بوابة الشحن', time: '09:15', status: 'denied' },
  { id: 4, type: 'checkin', visitor: 'خالد العلي', gate: 'البوابة الرئيسية', time: '09:00', status: 'success' },
  { id: 5, type: 'alert', visitor: 'فهد السعيد', gate: 'البوابة الرئيسية', time: '08:45', status: 'warning' },
];

const upcomingVisits = [
  { id: 1, visitor: 'شركة البناء المتقدم', time: '10:00', purpose: 'صيانة دورية', host: 'خالد العلي' },
  { id: 2, visitor: 'مؤسسة النجاح', time: '11:30', purpose: 'اجتماع عمل', host: 'محمد السعيد' },
  { id: 3, visitor: 'شركة التوصيل', time: '14:00', purpose: 'توصيل طلبية', host: 'فاطمة الزهراء' },
];

const securityAlerts = [
  { id: 1, type: 'expired', message: '5 تصاريح ستنتهي اليوم', severity: 'warning' },
  { id: 2, type: 'blacklist', message: 'محاولة دخول من شخص في القائمة السوداء', severity: 'critical' },
  { id: 3, type: 'overtime', message: '3 زوار تجاوزوا وقت الخروج المسموح', severity: 'warning' },
];

export default function VisitorDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    currentVisitors: 47,
    todayTotal: 156,
    activePermits: 89,
    pendingApprovals: 12,
    todayCheckIns: 134,
    todayCheckOuts: 87,
    avgVisitDuration: '2.5 ساعة',
    peakHour: '10:00 - 11:00',
  };

  return (
    <div className="space-y-6">
      {/* Live Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'الزوار الآن', value: stats.currentVisitors, icon: Users, color: 'cyan', trend: '+12%', live: true },
          { label: 'زيارات اليوم', value: stats.todayTotal, icon: Calendar, color: 'green', trend: '+8%' },
          { label: 'تصاريح نشطة', value: stats.activePermits, icon: FileText, color: 'purple', trend: '+5%' },
          { label: 'بانتظار الموافقة', value: stats.pendingApprovals, icon: Clock, color: 'amber', trend: '-3%' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`bg-${stat.color}-500/10 border-${stat.color}-500/30 relative overflow-hidden`}>
              <CardContent className="p-4">
                {stat.live && (
                  <span className="absolute top-2 left-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                    <div className={`flex items-center gap-1 mt-1 text-xs ${stat.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.trend.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stat.trend}
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}-500/20`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'دخول اليوم', value: stats.todayCheckIns, icon: UserCheck, color: 'green' },
          { label: 'خروج اليوم', value: stats.todayCheckOuts, icon: UserX, color: 'slate' },
          { label: 'متوسط مدة الزيارة', value: stats.avgVisitDuration, icon: Timer, color: 'blue' },
          { label: 'ساعة الذروة', value: stats.peakHour, icon: Activity, color: 'pink' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
          >
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">{stat.label}</p>
                  <p className="text-white font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Hourly Visitors */}
        <Card className="lg:col-span-2 bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              حركة الزوار اليوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyVisitors}>
                  <defs>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="visitors" stroke="#06B6D4" fill="url(#colorVisitors)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Visitor Types Pie */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">توزيع أنواع الزوار</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={visitorTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {visitorTypes.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {visitorTypes.map(type => (
                <div key={type.name} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ background: type.color }} />
                  <span className="text-slate-400">{type.name}</span>
                  <span className="text-white font-bold mr-auto">{type.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity & Alerts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              النشاط الأخير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivity.map((activity, i) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    activity.status === 'denied' ? 'bg-red-500/10 border border-red-500/30' :
                    activity.status === 'warning' ? 'bg-amber-500/10 border border-amber-500/30' :
                    'bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'checkin' ? 'bg-green-500/20' :
                      activity.type === 'checkout' ? 'bg-slate-600/20' :
                      activity.type === 'denied' ? 'bg-red-500/20' :
                      'bg-amber-500/20'
                    }`}>
                      {activity.type === 'checkin' ? <UserCheck className="w-4 h-4 text-green-400" /> :
                       activity.type === 'checkout' ? <UserX className="w-4 h-4 text-slate-400" /> :
                       activity.type === 'denied' ? <XCircle className="w-4 h-4 text-red-400" /> :
                       <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{activity.visitor}</p>
                      <p className="text-slate-500 text-xs">{activity.gate}</p>
                    </div>
                  </div>
                  <span className="text-slate-400 text-sm">{activity.time}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Alerts & Upcoming */}
        <div className="space-y-4">
          {/* Security Alerts */}
          <Card className="bg-red-500/5 border-red-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-400" />
                تنبيهات أمنية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {securityAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-2 rounded-lg text-xs ${
                      alert.severity === 'critical' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {alert.message}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Visits */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                زيارات قادمة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcomingVisits.map(visit => (
                  <div key={visit.id} className="p-2 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-medium">{visit.visitor}</span>
                      <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">{visit.time}</Badge>
                    </div>
                    <p className="text-slate-500 text-xs mt-1">{visit.purpose} • {visit.host}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Weekly Comparison */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">مقارنة الأسبوع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Bar dataKey="visitors" fill="#06B6D4" radius={[4, 4, 0, 0]} name="الزوار" />
                <Bar dataKey="permits" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="التصاريح" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}