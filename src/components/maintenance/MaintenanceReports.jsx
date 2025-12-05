import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Download, FileText, User, Wrench, DollarSign, Clock,
  TrendingUp, TrendingDown, MapPin, Filter, Printer, FileSpreadsheet
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#22d3ee', '#a855f7', '#f59e0b', '#22c55e', '#ef4444', '#6366f1'];

export default function MaintenanceReports({ records = [], technicians = [] }) {
  const [reportType, setReportType] = useState('cost');
  const [groupBy, setGroupBy] = useState('device_type');
  const [timeRange, setTimeRange] = useState('month');

  // تقارير حسب نوع الجهاز
  const byDeviceType = useMemo(() => {
    const grouped = {};
    records.forEach(r => {
      const type = r.device_type || 'أخرى';
      if (!grouped[type]) grouped[type] = { name: type, count: 0, cost: 0, preventive: 0, corrective: 0 };
      grouped[type].count++;
      grouped[type].cost += r.total_cost || 0;
      if (r.maintenance_type === 'preventive') grouped[type].preventive++;
      else grouped[type].corrective++;
    });
    return Object.values(grouped);
  }, [records]);

  // تقارير تكاليف الصيانة
  const costAnalysis = useMemo(() => {
    const preventive = records.filter(r => r.maintenance_type === 'preventive').reduce((s, r) => s + (r.total_cost || 0), 0);
    const corrective = records.filter(r => r.maintenance_type === 'corrective').reduce((s, r) => s + (r.total_cost || 0), 0);
    const emergency = records.filter(r => r.maintenance_type === 'emergency').reduce((s, r) => s + (r.total_cost || 0), 0);
    return [
      { name: 'وقائية', value: preventive, color: '#22c55e' },
      { name: 'تصحيحية', value: corrective, color: '#f59e0b' },
      { name: 'طارئة', value: emergency, color: '#ef4444' },
    ];
  }, [records]);

  // أداء الفنيين
  const technicianPerformance = useMemo(() => {
    const grouped = {};
    records.filter(r => r.status === 'completed').forEach(r => {
      const tech = r.technician_name || 'غير محدد';
      if (!grouped[tech]) grouped[tech] = { name: tech, completed: 0, avgTime: 0, totalTime: 0, totalCost: 0 };
      grouped[tech].completed++;
      grouped[tech].totalTime += r.actual_duration || r.estimated_duration || 0;
      grouped[tech].totalCost += r.total_cost || 0;
    });
    return Object.values(grouped).map(t => ({
      ...t,
      avgTime: t.completed > 0 ? (t.totalTime / t.completed).toFixed(1) : 0,
      avgCost: t.completed > 0 ? Math.round(t.totalCost / t.completed) : 0,
    })).sort((a, b) => b.completed - a.completed);
  }, [records]);

  // تقارير حسب المنطقة (محاكاة)
  const byZone = useMemo(() => {
    const zones = ['المنطقة أ', 'المنطقة ب', 'المنطقة ج', 'المقر الرئيسي'];
    return zones.map((zone, i) => ({
      name: zone,
      count: Math.floor(records.length / zones.length) + (i === 0 ? records.length % zones.length : 0),
      cost: Math.round((costAnalysis.reduce((s, c) => s + c.value, 0)) / zones.length),
    }));
  }, [records, costAnalysis]);

  const exportReport = (format) => {
    toast.success(`جاري تصدير التقرير بصيغة ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            تقارير الصيانة المتقدمة
          </h3>
          <p className="text-slate-400 text-sm">تحليلات شاملة لعمليات الصيانة</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="week">أسبوع</SelectItem>
              <SelectItem value="month">شهر</SelectItem>
              <SelectItem value="quarter">ربع سنوي</SelectItem>
              <SelectItem value="year">سنوي</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-green-500/50 text-green-400" onClick={() => exportReport('excel')}>
            <FileSpreadsheet className="w-4 h-4 ml-2" />
            Excel
          </Button>
          <Button variant="outline" className="border-red-500/50 text-red-400" onClick={() => exportReport('pdf')}>
            <FileText className="w-4 h-4 ml-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-white">{records.length}</p>
            <p className="text-slate-400 text-sm">إجمالي العمليات</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{costAnalysis.reduce((s, c) => s + c.value, 0).toLocaleString()}</p>
            <p className="text-slate-400 text-sm">إجمالي التكلفة (ر.س)</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-cyan-400">{records.filter(r => r.status === 'completed').length}</p>
            <p className="text-slate-400 text-sm">عمليات مكتملة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-400">{technicianPerformance.length}</p>
            <p className="text-slate-400 text-sm">فنيون نشطون</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={reportType} onValueChange={setReportType}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="cost" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <DollarSign className="w-4 h-4 ml-1" />
            تحليل التكاليف
          </TabsTrigger>
          <TabsTrigger value="type" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Wrench className="w-4 h-4 ml-1" />
            حسب النوع
          </TabsTrigger>
          <TabsTrigger value="zone" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <MapPin className="w-4 h-4 ml-1" />
            حسب المنطقة
          </TabsTrigger>
          <TabsTrigger value="technicians" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <User className="w-4 h-4 ml-1" />
            أداء الفنيين
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cost" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">توزيع تكاليف الصيانة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costAnalysis}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {costAnalysis.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value.toLocaleString()} ر.س`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">مقارنة الوقائية vs التصحيحية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costAnalysis.map((item, i) => (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white">{item.name}</span>
                        <span style={{ color: item.color }} className="font-bold">{item.value.toLocaleString()} ر.س</span>
                      </div>
                      <Progress 
                        value={(item.value / Math.max(...costAnalysis.map(c => c.value))) * 100} 
                        className="h-3"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-300 text-sm">
                    <TrendingUp className="w-4 h-4 inline ml-1" />
                    نسبة الصيانة الوقائية: {records.length > 0 ? Math.round((records.filter(r => r.maintenance_type === 'preventive').length / records.length) * 100) : 0}%
                  </p>
                  <p className="text-slate-400 text-xs mt-1">يُنصح بأن تكون نسبة الصيانة الوقائية 70% أو أكثر</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="type" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">الصيانة حسب نوع الجهاز</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byDeviceType}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="preventive" fill="#22c55e" name="وقائية" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="corrective" fill="#f59e0b" name="تصحيحية" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zone" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">الصيانة حسب المنطقة الجغرافية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byZone} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Bar dataKey="cost" fill="#a855f7" name="التكلفة (ر.س)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technicians" className="space-y-4 mt-4">
          <div className="space-y-3">
            {technicianPerformance.map((tech, i) => (
              <motion.div key={tech.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <span className="text-amber-400 font-bold text-lg">{tech.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 className="text-white font-bold">{tech.name}</h4>
                          <p className="text-slate-400 text-sm">{tech.completed} عملية مكتملة</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-2 bg-cyan-500/10 rounded-lg">
                          <p className="text-cyan-400 font-bold">{tech.avgTime}</p>
                          <p className="text-slate-500 text-xs">ساعة/عملية</p>
                        </div>
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <p className="text-green-400 font-bold">{tech.avgCost}</p>
                          <p className="text-slate-500 text-xs">ر.س/عملية</p>
                        </div>
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <p className="text-purple-400 font-bold">{tech.totalCost.toLocaleString()}</p>
                          <p className="text-slate-500 text-xs">إجمالي</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}