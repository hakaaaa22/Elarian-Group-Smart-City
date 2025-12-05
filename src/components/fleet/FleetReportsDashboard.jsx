import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Download, Filter, Calendar, Car, User, Fuel, Gauge,
  AlertTriangle, TrendingUp, TrendingDown, FileText, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Area
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#22d3ee', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#6366f1'];

// بيانات استهلاك الوقود المقارنة
const fuelComparisonData = [
  { month: 'يناير', vehicle1: 850, vehicle2: 920, vehicle3: 780 },
  { month: 'فبراير', vehicle1: 820, vehicle2: 950, vehicle3: 800 },
  { month: 'مارس', vehicle1: 880, vehicle2: 900, vehicle3: 850 },
  { month: 'أبريل', vehicle1: 900, vehicle2: 980, vehicle3: 820 },
  { month: 'مايو', vehicle1: 860, vehicle2: 940, vehicle3: 790 },
  { month: 'يونيو', vehicle1: 840, vehicle2: 910, vehicle3: 810 },
];

// بيانات المخالفات
const violationsData = [
  { driver: 'محمد أحمد', speed: 2, parking: 1, seatbelt: 0, total: 3 },
  { driver: 'خالد السعيد', speed: 5, parking: 2, seatbelt: 1, total: 8 },
  { driver: 'عبدالله فهد', speed: 1, parking: 0, seatbelt: 0, total: 1 },
  { driver: 'فيصل عمر', speed: 3, parking: 1, seatbelt: 0, total: 4 },
];

// تقييمات السائقين بالوقت
const driverScoresTrend = [
  { week: 'أسبوع 1', driver1: 85, driver2: 72, driver3: 90, driver4: 78 },
  { week: 'أسبوع 2', driver1: 87, driver2: 75, driver3: 92, driver4: 80 },
  { week: 'أسبوع 3', driver1: 86, driver2: 70, driver3: 93, driver4: 82 },
  { week: 'أسبوع 4', driver1: 88, driver2: 68, driver3: 91, driver4: 85 },
];

// توزيع الوقت
const timeDistribution = [
  { name: 'قيادة نشطة', value: 65, color: '#22c55e' },
  { name: 'خمول', value: 15, color: '#f59e0b' },
  { name: 'توقف', value: 12, color: '#ef4444' },
  { name: 'صيانة', value: 8, color: '#a855f7' },
];

export default function FleetReportsDashboard() {
  const [timeRange, setTimeRange] = useState('month');
  const [compareMode, setCompareMode] = useState('vehicles');
  const [selectedVehicles, setSelectedVehicles] = useState(['vehicle1', 'vehicle2']);

  const exportReport = (format) => {
    toast.success(`جاري تصدير التقرير بصيغة ${format}...`);
    setTimeout(() => toast.success(`تم تصدير التقرير بنجاح!`), 1500);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          لوحة التقارير الشاملة
        </h2>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="week">أسبوع</SelectItem>
              <SelectItem value="month">شهر</SelectItem>
              <SelectItem value="quarter">ربع سنوي</SelectItem>
              <SelectItem value="year">سنة</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-green-500/50 text-green-400" onClick={() => exportReport('PDF')}>
            <Download className="w-4 h-4 ml-2" />
            PDF
          </Button>
          <Button variant="outline" className="border-cyan-500/50 text-cyan-400" onClick={() => exportReport('Excel')}>
            <Download className="w-4 h-4 ml-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Fuel Consumption Comparison */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Fuel className="w-4 h-4 text-amber-400" />
              مقارنة استهلاك الوقود (لتر)
            </CardTitle>
            <Select value={compareMode} onValueChange={setCompareMode}>
              <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="vehicles">مقارنة المركبات</SelectItem>
                <SelectItem value="drivers">مقارنة السائقين</SelectItem>
                <SelectItem value="routes">مقارنة المسارات</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={fuelComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Legend />
                <Area type="monotone" dataKey="vehicle1" fill="#22d3ee" fillOpacity={0.2} stroke="#22d3ee" name="شاحنة #12" />
                <Line type="monotone" dataKey="vehicle2" stroke="#f59e0b" strokeWidth={2} name="فان #08" />
                <Line type="monotone" dataKey="vehicle3" stroke="#22c55e" strokeWidth={2} name="شاحنة #15" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Speed Violations */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              مخالفات السائقين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={violationsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="driver" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="speed" fill="#ef4444" name="سرعة" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="parking" fill="#f59e0b" name="مواقف" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="seatbelt" fill="#a855f7" name="حزام" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Driver Score Trends */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-purple-400" />
              اتجاهات تقييم السائقين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={driverScoresTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="driver1" stroke="#22d3ee" strokeWidth={2} name="محمد أحمد" />
                  <Line type="monotone" dataKey="driver2" stroke="#ef4444" strokeWidth={2} name="خالد السعيد" />
                  <Line type="monotone" dataKey="driver3" stroke="#22c55e" strokeWidth={2} name="عبدالله فهد" />
                  <Line type="monotone" dataKey="driver4" stroke="#a855f7" strokeWidth={2} name="فيصل عمر" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Distribution */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader>
          <CardTitle className="text-white text-sm">توزيع وقت التشغيل</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {timeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center">
              <div className="space-y-3 w-full">
                {timeDistribution.map(item => (
                  <div key={item.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400 text-sm">{item.name}</span>
                      <span className="text-white font-bold">{item.value}%</span>
                    </div>
                    <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden">
                      <div style={{ width: `${item.value}%`, backgroundColor: item.color }} className="h-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}