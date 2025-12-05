import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Package, TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon,
  Download, Filter, Calendar, AlertTriangle, DollarSign, Activity,
  Wrench, Car, Clock, ChevronRight, FileText, Eye
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
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'sonner';

// بيانات تجريبية
const mostUsedItems = [
  { name: 'فلتر مكيف', totalUsed: 48, lastMonth: 12, thisMonth: 15, trend: 25, category: 'hvac' },
  { name: 'بطارية كاميرا', totalUsed: 35, lastMonth: 8, thisMonth: 10, trend: 25, category: 'security' },
  { name: 'زيت محرك', totalUsed: 60, lastMonth: 15, thisMonth: 12, trend: -20, category: 'consumables' },
  { name: 'حساس حركة', totalUsed: 22, lastMonth: 5, thisMonth: 7, trend: 40, category: 'security' },
  { name: 'مفتاح ذكي', totalUsed: 18, lastMonth: 4, thisMonth: 3, trend: -25, category: 'electronics' },
  { name: 'كابل شبكة', totalUsed: 250, lastMonth: 50, thisMonth: 45, trend: -10, category: 'electronics' },
];

const valueByCategory = [
  { name: 'قطع غيار', value: 45000, count: 85, color: '#f59e0b' },
  { name: 'إلكترونيات', value: 32000, count: 45, color: '#a855f7' },
  { name: 'تكييف', value: 28000, count: 35, color: '#22d3ee' },
  { name: 'أمان', value: 15000, count: 40, color: '#ef4444' },
  { name: 'مستهلكات', value: 5000, count: 40, color: '#10b981' },
];

const nearDepletionItems = [
  { name: 'حساس حركة', current: 2, min: 5, avgUsage: 3, daysUntilEmpty: 20, lastOrder: '2024-11-01', status: 'critical' },
  { name: 'بطارية كاميرا', current: 8, min: 15, avgUsage: 5, daysUntilEmpty: 48, lastOrder: '2024-11-20', status: 'warning' },
  { name: 'زيت محرك', current: 3, min: 10, avgUsage: 4, daysUntilEmpty: 22, lastOrder: '2024-12-01', status: 'critical' },
  { name: 'فلتر مكيف', current: 12, min: 10, avgUsage: 4, daysUntilEmpty: 90, lastOrder: '2024-11-15', status: 'ok' },
];

const usageByDevice = [
  { 
    device: 'مكيف غرفة المعيشة', 
    type: 'مكيف',
    partsUsed: [
      { name: 'فلتر مكيف', quantity: 4, totalCost: 200, dates: ['2024-09', '2024-10', '2024-11', '2024-12'] },
      { name: 'مكثف', quantity: 1, totalCost: 350, dates: ['2024-10'] },
    ],
    totalCost: 550,
    maintenanceCount: 5
  },
  { 
    device: 'سيارة النقل #3', 
    type: 'مركبة',
    partsUsed: [
      { name: 'زيت محرك', quantity: 12, totalCost: 540, dates: ['2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'] },
      { name: 'فلتر زيت', quantity: 6, totalCost: 180, dates: ['2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'] },
      { name: 'بطارية', quantity: 1, totalCost: 450, dates: ['2024-09'] },
    ],
    totalCost: 1170,
    maintenanceCount: 8
  },
  { 
    device: 'كاميرا الحديقة', 
    type: 'كاميرا',
    partsUsed: [
      { name: 'بطارية كاميرا', quantity: 3, totalCost: 360, dates: ['2024-08', '2024-10', '2024-12'] },
    ],
    totalCost: 360,
    maintenanceCount: 3
  },
];

const monthlyTrend = [
  { month: 'يوليو', usage: 45, cost: 2250 },
  { month: 'أغسطس', usage: 52, cost: 2600 },
  { month: 'سبتمبر', usage: 48, cost: 2400 },
  { month: 'أكتوبر', usage: 55, cost: 2750 },
  { month: 'نوفمبر', usage: 42, cost: 2100 },
  { month: 'ديسمبر', usage: 38, cost: 1900 },
];

const COLORS = ['#f59e0b', '#a855f7', '#22d3ee', '#ef4444', '#10b981'];

export default function InventoryReportsAdvanced({ items = [], usageLog = [] }) {
  const [activeTab, setActiveTab] = useState('most-used');
  const [timeRange, setTimeRange] = useState('month');
  const [selectedDevice, setSelectedDevice] = useState(null);

  const totalValue = valueByCategory.reduce((sum, c) => sum + c.value, 0);
  const totalItems = valueByCategory.reduce((sum, c) => sum + c.count, 0);

  const exportReport = (reportType) => {
    toast.success(`جاري تصدير تقرير ${reportType}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            تقارير المخزون المتقدمة
          </h3>
          <p className="text-slate-400 text-sm">تحليل شامل لاستخدام وقيمة المخزون</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-28 bg-slate-800/50 border-slate-700 text-white h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="week">الأسبوع</SelectItem>
              <SelectItem value="month">الشهر</SelectItem>
              <SelectItem value="quarter">الربع</SelectItem>
              <SelectItem value="year">السنة</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-slate-600 h-8" onClick={() => exportReport('all')}>
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{totalValue.toLocaleString()} ر.س</p>
            <p className="text-slate-400 text-xs">قيمة المخزون</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-purple-500/30 bg-purple-500/5">
          <CardContent className="p-4 text-center">
            <Package className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{totalItems}</p>
            <p className="text-slate-400 text-xs">إجمالي الأصناف</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{nearDepletionItems.filter(i => i.status === 'critical').length}</p>
            <p className="text-slate-400 text-xs">أصناف حرجة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <Activity className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{mostUsedItems.reduce((s, i) => s + i.thisMonth, 0)}</p>
            <p className="text-slate-400 text-xs">استخدام الشهر</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap">
          <TabsTrigger value="most-used" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <TrendingUp className="w-4 h-4 ml-2" />
            الأكثر استخداماً
          </TabsTrigger>
          <TabsTrigger value="value-by-category" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <PieChartIcon className="w-4 h-4 ml-2" />
            القيمة حسب الفئة
          </TabsTrigger>
          <TabsTrigger value="near-depletion" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
            <AlertTriangle className="w-4 h-4 ml-2" />
            قاربت على النفاد
          </TabsTrigger>
          <TabsTrigger value="usage-by-device" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Wrench className="w-4 h-4 ml-2" />
            حسب الجهاز/المركبة
          </TabsTrigger>
        </TabsList>

        {/* Most Used Items */}
        <TabsContent value="most-used" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Chart */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">اتجاه الاستخدام الشهري</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mostUsedItems}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} angle={-45} textAnchor="end" height={60} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="lastMonth" fill="#6366f1" name="الشهر الماضي" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="thisMonth" fill="#22d3ee" name="هذا الشهر" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm">تفاصيل الأصناف</CardTitle>
                  <Button size="sm" variant="ghost" className="text-cyan-400 h-7" onClick={() => exportReport('most-used')}>
                    <Download className="w-3 h-3 ml-1" />
                    CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mostUsedItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-sm w-6">{i + 1}</span>
                        <div>
                          <p className="text-white font-medium text-sm">{item.name}</p>
                          <p className="text-slate-500 text-xs">إجمالي: {item.totalUsed} وحدة</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <Badge className={`${item.trend > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'} text-xs`}>
                          {item.trend > 0 ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
                          {Math.abs(item.trend)}%
                        </Badge>
                        <p className="text-cyan-400 text-xs mt-1">{item.thisMonth} هذا الشهر</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Value by Category */}
        <TabsContent value="value-by-category" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">توزيع القيمة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={valueByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {valueByCategory.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value.toLocaleString()} ر.س`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Details */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">تفاصيل الفئات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {valueByCategory.map((cat, i) => (
                    <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-white font-medium">{cat.name}</span>
                        </div>
                        <span className="text-white font-bold">{cat.value.toLocaleString()} ر.س</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{cat.count} صنف</span>
                        <Progress value={(cat.value / totalValue) * 100} className="w-24 h-2" />
                        <span className="text-cyan-400">{((cat.value / totalValue) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Near Depletion */}
        <TabsContent value="near-depletion" className="space-y-4 mt-4">
          <Card className="glass-card border-red-500/30 bg-red-500/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  الأصناف القريبة من النفاد
                </CardTitle>
                <Button size="sm" variant="ghost" className="text-red-400 h-7" onClick={() => exportReport('near-depletion')}>
                  <Download className="w-3 h-3 ml-1" />
                  تصدير
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="p-3 text-right text-slate-400 text-xs font-medium">الصنف</th>
                      <th className="p-3 text-right text-slate-400 text-xs font-medium">الحالة</th>
                      <th className="p-3 text-right text-slate-400 text-xs font-medium">المتوفر</th>
                      <th className="p-3 text-right text-slate-400 text-xs font-medium">الاستخدام الشهري</th>
                      <th className="p-3 text-right text-slate-400 text-xs font-medium">أيام حتى النفاد</th>
                      <th className="p-3 text-right text-slate-400 text-xs font-medium">آخر طلب</th>
                      <th className="p-3 text-right text-slate-400 text-xs font-medium">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nearDepletionItems.map((item, i) => (
                      <tr key={i} className="border-b border-slate-700/30">
                        <td className="p-3 text-white font-medium">{item.name}</td>
                        <td className="p-3">
                          <Badge className={`text-xs ${
                            item.status === 'critical' ? 'bg-red-500/20 text-red-400' :
                            item.status === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {item.status === 'critical' ? 'حرج' : item.status === 'warning' ? 'تحذير' : 'جيد'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <span className={`font-bold ${item.current < item.min ? 'text-red-400' : 'text-white'}`}>
                            {item.current}
                          </span>
                          <span className="text-slate-500">/{item.min}</span>
                        </td>
                        <td className="p-3 text-slate-400">{item.avgUsage}</td>
                        <td className="p-3">
                          <span className={`font-bold ${item.daysUntilEmpty < 30 ? 'text-red-400' : item.daysUntilEmpty < 60 ? 'text-amber-400' : 'text-green-400'}`}>
                            {item.daysUntilEmpty} يوم
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 text-sm">{item.lastOrder}</td>
                        <td className="p-3">
                          <Button size="sm" className={`h-7 ${item.status === 'critical' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
                            طلب الآن
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage by Device */}
        <TabsContent value="usage-by-device" className="space-y-4 mt-4">
          <div className="space-y-4">
            {usageByDevice.map((device, i) => (
              <Card key={i} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {device.type === 'مركبة' ? <Car className="w-5 h-5 text-cyan-400" /> : <Wrench className="w-5 h-5 text-amber-400" />}
                      <div>
                        <CardTitle className="text-white text-sm">{device.device}</CardTitle>
                        <p className="text-slate-400 text-xs">{device.type} • {device.maintenanceCount} صيانة</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-amber-400 font-bold">{device.totalCost.toLocaleString()} ر.س</p>
                      <p className="text-slate-500 text-xs">إجمالي التكلفة</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {device.partsUsed.map((part, pi) => (
                      <div key={pi} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Package className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-white text-sm">{part.name}</p>
                            <p className="text-slate-500 text-xs">{part.dates.join(', ')}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-white font-medium">{part.quantity} وحدة</p>
                          <p className="text-cyan-400 text-xs">{part.totalCost} ر.س</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}