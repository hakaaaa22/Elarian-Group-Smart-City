import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown, Users, Shield, Camera, Clock,
  AlertTriangle, CheckCircle, Settings, Save, Plus, Trash2, Move,
  Eye, Download, Filter, Calendar, RefreshCw, Maximize2, LayoutGrid
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart
} from 'recharts';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const defaultKPIs = [
  { id: 'visitors_today', name: 'زوار اليوم', value: 247, target: 300, trend: 'up', change: '+12%', icon: Users, color: 'cyan' },
  { id: 'avg_duration', name: 'متوسط مدة الزيارة', value: '45 دقيقة', target: '30 دقيقة', trend: 'down', change: '-8%', icon: Clock, color: 'purple' },
  { id: 'security_alerts', name: 'تنبيهات أمنية', value: 8, target: 5, trend: 'up', change: '+3', icon: AlertTriangle, color: 'red' },
  { id: 'approval_rate', name: 'معدل الموافقة', value: '94%', target: '95%', trend: 'stable', change: '0%', icon: CheckCircle, color: 'green' },
  { id: 'cameras_active', name: 'كاميرات نشطة', value: 45, target: 48, trend: 'down', change: '-3', icon: Camera, color: 'pink' },
  { id: 'permits_pending', name: 'تصاريح معلقة', value: 12, target: 10, trend: 'up', change: '+2', icon: Shield, color: 'amber' },
];

const visitorTrend = [
  { day: 'السبت', visitors: 180, permits: 25, alerts: 3 },
  { day: 'الأحد', visitors: 220, permits: 30, alerts: 5 },
  { day: 'الإثنين', visitors: 280, permits: 35, alerts: 8 },
  { day: 'الثلاثاء', visitors: 250, permits: 32, alerts: 4 },
  { day: 'الأربعاء', visitors: 300, permits: 40, alerts: 6 },
  { day: 'الخميس', visitors: 270, permits: 38, alerts: 7 },
  { day: 'الجمعة', visitors: 150, permits: 20, alerts: 2 },
];

const heatmapData = [
  { hour: '06:00', sun: 5, mon: 8, tue: 10, wed: 7, thu: 12 },
  { hour: '08:00', sun: 25, mon: 45, tue: 50, wed: 42, thu: 55 },
  { hour: '10:00', sun: 40, mon: 60, tue: 75, wed: 65, thu: 80 },
  { hour: '12:00', sun: 35, mon: 50, tue: 55, wed: 48, thu: 60 },
  { hour: '14:00', sun: 45, mon: 70, tue: 80, wed: 72, thu: 85 },
  { hour: '16:00', sun: 30, mon: 55, tue: 60, wed: 52, thu: 65 },
  { hour: '18:00', sun: 15, mon: 25, tue: 30, wed: 22, thu: 35 },
];

const savedReports = [
  { id: 1, name: 'تقرير الزوار الأسبوعي', type: 'visitors', lastRun: '2025-01-14', schedule: 'أسبوعي' },
  { id: 2, name: 'تحليل التنبيهات الأمنية', type: 'security', lastRun: '2025-01-15', schedule: 'يومي' },
  { id: 3, name: 'أداء البوابات', type: 'gates', lastRun: '2025-01-13', schedule: 'شهري' },
];

export default function KPIDashboard() {
  const [kpis, setKpis] = useState(defaultKPIs);
  const [dateRange, setDateRange] = useState('week');
  const [showCustomize, setShowCustomize] = useState(false);
  const [showReportBuilder, setShowReportBuilder] = useState(false);
  const [isLive, setIsLive] = useState(true);

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <span className="w-4 h-4 text-slate-400">―</span>;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
            <BarChart3 className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">لوحة مؤشرات الأداء (KPI)</h3>
            <p className="text-slate-500 text-sm">مراقبة فورية للمؤشرات الرئيسية</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg">
            <span className="text-slate-400 text-sm">مباشر</span>
            <Switch checked={isLive} onCheckedChange={setIsLive} />
            {isLive && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="week">هذا الأسبوع</SelectItem>
              <SelectItem value="month">هذا الشهر</SelectItem>
              <SelectItem value="quarter">الربع</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-slate-600" onClick={() => setShowCustomize(true)}>
            <Settings className="w-4 h-4 ml-2" />
            تخصيص
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowReportBuilder(true)}>
            <Plus className="w-4 h-4 ml-2" />
            تقرير جديد
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`bg-${kpi.color}-500/10 border-${kpi.color}-500/30 hover:border-${kpi.color}-500/50 transition-all`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 text-${kpi.color}-400`} />
                    <div className="flex items-center gap-1">
                      {getTrendIcon(kpi.trend)}
                      <span className={`text-xs ${
                        kpi.trend === 'up' ? 'text-green-400' :
                        kpi.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                      }`}>{kpi.change}</span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white">{kpi.value}</p>
                  <p className="text-slate-500 text-sm">{kpi.name}</p>
                  <p className="text-slate-600 text-xs mt-1">الهدف: {kpi.target}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Visitor Trend */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                اتجاه الزوار والتصاريح
              </CardTitle>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Maximize2 className="w-4 h-4 text-slate-400" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={visitorTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="visitors" fill="#06b6d420" stroke="#06b6d4" name="الزوار" />
                  <Bar dataKey="permits" fill="#8b5cf6" name="التصاريح" barSize={20} />
                  <Line type="monotone" dataKey="alerts" stroke="#ef4444" strokeWidth={2} name="التنبيهات" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Heatmap */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-amber-400" />
              خريطة حرارية للزوار (ساعات الذروة)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={heatmapData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="sun" stackId="a" fill="#64748b" name="الأحد" />
                  <Bar dataKey="mon" stackId="a" fill="#06b6d4" name="الإثنين" />
                  <Bar dataKey="tue" stackId="a" fill="#8b5cf6" name="الثلاثاء" />
                  <Bar dataKey="wed" stackId="a" fill="#f59e0b" name="الأربعاء" />
                  <Bar dataKey="thu" stackId="a" fill="#ec4899" name="الخميس" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saved Reports */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Save className="w-4 h-4 text-green-400" />
            التقارير المحفوظة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {savedReports.map(report => (
              <div key={report.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-cyan-500/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{report.name}</h4>
                  <Badge variant="outline" className="border-slate-600 text-slate-400">
                    {report.schedule}
                  </Badge>
                </div>
                <p className="text-slate-500 text-sm mb-3">آخر تشغيل: {report.lastRun}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-slate-600 h-8 flex-1">
                    <Eye className="w-3 h-3 ml-1" />
                    عرض
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-600 h-8 flex-1">
                    <Download className="w-3 h-3 ml-1" />
                    تصدير
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Builder Dialog */}
      <Dialog open={showReportBuilder} onOpenChange={setShowReportBuilder}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              إنشاء تقرير مخصص
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">اسم التقرير</label>
                <Input className="bg-slate-800/50 border-slate-700 text-white" placeholder="تقرير جديد..." />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">نوع التقرير</label>
                <Select>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="visitors">الزوار</SelectItem>
                    <SelectItem value="security">الأمان</SelectItem>
                    <SelectItem value="permits">التصاريح</SelectItem>
                    <SelectItem value="gates">البوابات</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-1 block">نوع العرض</label>
              <div className="flex gap-2">
                {['جدول', 'رسم بياني خطي', 'رسم بياني شريطي', 'دائري', 'خريطة حرارية'].map(type => (
                  <Badge key={type} variant="outline" className="border-slate-600 text-slate-400 cursor-pointer hover:border-cyan-500/50 hover:text-cyan-400">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                <Save className="w-4 h-4 ml-2" />
                حفظ التقرير
              </Button>
              <Button variant="outline" className="border-slate-600" onClick={() => setShowReportBuilder(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}