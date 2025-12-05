import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, Bell, Clock, CheckCircle, XCircle, Eye, Download, Filter,
  TrendingUp, Calendar, User, Timer, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// بيانات التنبيهات
const alertsData = [
  { id: 'ALT-001', title: 'سرعة رياح عالية - برج الشرق', type: 'tower', severity: 'critical', triggered: '2024-12-04 08:30', responded: '2024-12-04 08:32', resolved: '2024-12-04 09:15', responseTime: 2, resolveTime: 45, responder: 'أحمد محمد', status: 'resolved' },
  { id: 'ALT-002', title: 'كاميرا غير متصلة - المدخل', type: 'camera', severity: 'warning', triggered: '2024-12-04 09:00', responded: '2024-12-04 09:05', resolved: '2024-12-04 09:30', responseTime: 5, resolveTime: 30, responder: 'خالد العلي', status: 'resolved' },
  { id: 'ALT-003', title: 'تجاوز استهلاك الوقود', type: 'vehicle', severity: 'warning', triggered: '2024-12-04 10:15', responded: '2024-12-04 10:20', resolved: null, responseTime: 5, resolveTime: null, responder: 'سعد الدوسري', status: 'in_progress' },
  { id: 'ALT-004', title: 'ميل هيكلي - برج الجنوب', type: 'tower', severity: 'critical', triggered: '2024-12-04 11:00', responded: null, resolved: null, responseTime: null, resolveTime: null, responder: null, status: 'pending' },
  { id: 'ALT-005', title: 'حاوية ممتلئة 95%', type: 'waste', severity: 'info', triggered: '2024-12-04 07:00', responded: '2024-12-04 07:02', resolved: '2024-12-04 08:30', responseTime: 2, resolveTime: 90, responder: 'فهد السبيعي', status: 'resolved' },
];

// إحصائيات التنبيهات حسب الوقت
const alertsTrend = [
  { time: '00:00', critical: 2, warning: 5, info: 8 },
  { time: '04:00', critical: 1, warning: 3, info: 6 },
  { time: '08:00', critical: 4, warning: 8, info: 12 },
  { time: '12:00', critical: 3, warning: 10, info: 15 },
  { time: '16:00', critical: 5, warning: 7, info: 10 },
  { time: '20:00', critical: 2, warning: 4, info: 7 },
];

// توزيع التنبيهات
const alertsDistribution = [
  { name: 'حرجة', value: 15, color: '#ef4444' },
  { name: 'تحذيرية', value: 42, color: '#f59e0b' },
  { name: 'معلوماتية', value: 58, color: '#3b82f6' },
];

// متوسط أوقات الاستجابة
const responseTimeData = [
  { category: 'حرجة', avgResponse: 2.5, avgResolve: 35 },
  { category: 'تحذيرية', avgResponse: 5.2, avgResolve: 45 },
  { category: 'معلوماتية', avgResponse: 8.1, avgResolve: 60 },
];

const severityColors = {
  critical: { bg: 'red', text: 'حرج' },
  warning: { bg: 'amber', text: 'تحذير' },
  info: { bg: 'blue', text: 'معلومات' }
};

const statusColors = {
  resolved: { bg: 'green', text: 'تم الحل' },
  in_progress: { bg: 'amber', text: 'قيد المعالجة' },
  pending: { bg: 'red', text: 'معلق' }
};

export default function AlertsReports() {
  const [period, setPeriod] = useState('today');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filteredAlerts = alertsData.filter(a => 
    severityFilter === 'all' || a.severity === severityFilter
  );

  const stats = {
    total: filteredAlerts.length,
    resolved: filteredAlerts.filter(a => a.status === 'resolved').length,
    pending: filteredAlerts.filter(a => a.status === 'pending').length,
    avgResponseTime: filteredAlerts.filter(a => a.responseTime).reduce((s, a) => s + a.responseTime, 0) / filteredAlerts.filter(a => a.responseTime).length || 0,
    avgResolveTime: filteredAlerts.filter(a => a.resolveTime).reduce((s, a) => s + a.resolveTime, 0) / filteredAlerts.filter(a => a.resolveTime).length || 0,
    responseRate: (filteredAlerts.filter(a => a.responded).length / filteredAlerts.length * 100) || 0
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
          {[
            { id: 'today', name: 'اليوم' },
            { id: 'week', name: 'الأسبوع' },
            { id: 'month', name: 'الشهر' }
          ].map(p => (
            <Button key={p.id} size="sm" variant={period === p.id ? 'default' : 'ghost'}
              className={period === p.id ? 'bg-cyan-600' : ''} onClick={() => setPeriod(p.id)}>
              {p.name}
            </Button>
          ))}
        </div>

        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-36 bg-slate-800 border-slate-700">
            <SelectValue placeholder="الخطورة" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="critical">حرج</SelectItem>
            <SelectItem value="warning">تحذير</SelectItem>
            <SelectItem value="info">معلومات</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="border-slate-600 mr-auto">
          <Download className="w-4 h-4 ml-2" />
          تصدير التقرير
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
          <CardContent className="p-3 text-center">
            <Bell className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-slate-400">إجمالي التنبيهات</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-green-500/30 bg-green-500/5">
          <CardContent className="p-3 text-center">
            <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-green-400">{stats.resolved}</p>
            <p className="text-xs text-slate-400">تم الحل</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-red-500/30 bg-red-500/5">
          <CardContent className="p-3 text-center">
            <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-red-400">{stats.pending}</p>
            <p className="text-xs text-slate-400">معلق</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-3 text-center">
            <Timer className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.avgResponseTime.toFixed(1)} د</p>
            <p className="text-xs text-slate-400">متوسط الاستجابة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-purple-500/30 bg-purple-500/5">
          <CardContent className="p-3 text-center">
            <Clock className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.avgResolveTime.toFixed(0)} د</p>
            <p className="text-xs text-slate-400">متوسط الحل</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-3 text-center">
            <TrendingUp className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.responseRate.toFixed(0)}%</p>
            <p className="text-xs text-slate-400">معدل الاستجابة</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Trend Chart */}
        <Card className="lg:col-span-2 glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader>
            <CardTitle className="text-white text-sm">اتجاه التنبيهات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={alertsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="critical" stackId="a" fill="#ef4444" name="حرجة" />
                  <Bar dataKey="warning" stackId="a" fill="#f59e0b" name="تحذيرية" />
                  <Bar dataKey="info" stackId="a" fill="#3b82f6" name="معلوماتية" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Pie */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader>
            <CardTitle className="text-white text-sm">توزيع التنبيهات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={alertsDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {alertsDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response Time Analysis */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader>
          <CardTitle className="text-white text-sm">تحليل أوقات الاستجابة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {responseTimeData.map((item, i) => (
              <div key={item.category} className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-white font-medium mb-3">{item.category}</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">وقت الاستجابة</span>
                      <span className="text-cyan-400">{item.avgResponse} دقيقة</span>
                    </div>
                    <Progress value={100 - item.avgResponse * 5} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">وقت الحل</span>
                      <span className="text-purple-400">{item.avgResolve} دقيقة</span>
                    </div>
                    <Progress value={100 - item.avgResolve} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader>
          <CardTitle className="text-white text-sm">سجل التنبيهات</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-right p-3 text-slate-400 font-medium text-sm">التنبيه</th>
                  <th className="text-center p-3 text-slate-400 font-medium text-sm">الخطورة</th>
                  <th className="text-center p-3 text-slate-400 font-medium text-sm">وقت التفعيل</th>
                  <th className="text-center p-3 text-slate-400 font-medium text-sm">الاستجابة</th>
                  <th className="text-center p-3 text-slate-400 font-medium text-sm">المستجيب</th>
                  <th className="text-center p-3 text-slate-400 font-medium text-sm">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map(alert => {
                  const severity = severityColors[alert.severity];
                  const status = statusColors[alert.status];
                  return (
                    <tr key={alert.id} className="border-b border-slate-700/50">
                      <td className="p-3">
                        <p className="text-white text-sm">{alert.title}</p>
                        <p className="text-slate-500 text-xs">{alert.id}</p>
                      </td>
                      <td className="text-center p-3">
                        <Badge className={`bg-${severity.bg}-500/20 text-${severity.bg}-400`}>{severity.text}</Badge>
                      </td>
                      <td className="text-center p-3 text-slate-400 text-sm">{alert.triggered}</td>
                      <td className="text-center p-3">
                        {alert.responseTime ? (
                          <span className="text-cyan-400">{alert.responseTime} د</span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="text-center p-3 text-slate-400 text-sm">{alert.responder || '-'}</td>
                      <td className="text-center p-3">
                        <Badge className={`bg-${status.bg}-500/20 text-${status.bg}-400`}>{status.text}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}