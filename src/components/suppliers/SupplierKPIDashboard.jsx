import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown, Award, Clock, DollarSign,
  Package, CheckCircle, AlertTriangle, Star, Target, Settings,
  Eye, EyeOff, RefreshCw, Calendar, Truck
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';

const defaultKPIs = [
  { id: 'onTimeDelivery', name: 'التسليم في الوقت', value: 92, target: 95, unit: '%', trend: 2, icon: Clock, color: 'cyan', visible: true },
  { id: 'qualityScore', name: 'معدل الجودة', value: 94, target: 95, unit: '%', trend: 1, icon: Award, color: 'green', visible: true },
  { id: 'priceCompetitiveness', name: 'تنافسية السعر', value: 87, target: 85, unit: '%', trend: -1, icon: DollarSign, color: 'amber', visible: true },
  { id: 'responseTime', name: 'سرعة الاستجابة', value: 4.2, target: 4, unit: 'ساعة', trend: -0.5, icon: RefreshCw, color: 'purple', visible: true },
  { id: 'defectRate', name: 'معدل العيوب', value: 1.2, target: 2, unit: '%', trend: -0.3, icon: AlertTriangle, color: 'red', visible: true },
  { id: 'orderAccuracy', name: 'دقة الطلبات', value: 98, target: 98, unit: '%', trend: 0, icon: Target, color: 'blue', visible: true },
];

const monthlyTrends = [
  { month: 'يوليو', delivery: 88, quality: 92, price: 85 },
  { month: 'أغسطس', delivery: 90, quality: 93, price: 86 },
  { month: 'سبتمبر', delivery: 89, quality: 91, price: 88 },
  { month: 'أكتوبر', delivery: 92, quality: 94, price: 87 },
  { month: 'نوفمبر', delivery: 91, quality: 95, price: 86 },
  { month: 'ديسمبر', delivery: 92, quality: 94, price: 87 },
];

const supplierRankings = [
  { name: 'شركة المستلزمات', overall: 94, delivery: 95, quality: 92, price: 85 },
  { name: 'مؤسسة التقنية', overall: 88, delivery: 88, quality: 94, price: 78 },
  { name: 'مصنع القطع', overall: 82, delivery: 82, quality: 88, price: 92 },
];

const COLORS = ['#22d3ee', '#22c55e', '#f59e0b', '#a855f7'];

export default function SupplierKPIDashboard({ suppliers = [] }) {
  const [kpis, setKPIs] = useState(defaultKPIs);
  const [timeRange, setTimeRange] = useState('month');
  const [showCustomize, setShowCustomize] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('all');

  const toggleKPI = (id) => {
    setKPIs(kpis.map(k => k.id === id ? { ...k, visible: !k.visible } : k));
  };

  const visibleKPIs = kpis.filter(k => k.visible);

  const radarData = supplierRankings.map(s => ({
    supplier: s.name.split(' ').slice(0, 2).join(' '),
    التسليم: s.delivery,
    الجودة: s.quality,
    السعر: s.price,
  }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            مؤشرات أداء الموردين
          </h2>
          <p className="text-slate-400 text-sm">تحليل شامل لأداء الموردين</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="week">أسبوع</SelectItem>
              <SelectItem value="month">شهر</SelectItem>
              <SelectItem value="quarter">ربع سنة</SelectItem>
              <SelectItem value="year">سنة</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-slate-600" onClick={() => setShowCustomize(true)}>
            <Settings className="w-4 h-4 ml-1" />
            تخصيص
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {visibleKPIs.map((kpi, i) => (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-${kpi.color}-500/20`}>
                    <kpi.icon className={`w-4 h-4 text-${kpi.color}-400`} />
                  </div>
                  {kpi.trend !== 0 && (
                    <Badge className={kpi.trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {kpi.trend > 0 ? <TrendingUp className="w-3 h-3 ml-1" /> : <TrendingDown className="w-3 h-3 ml-1" />}
                      {Math.abs(kpi.trend)}{kpi.unit === '%' ? '%' : ''}
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-white">{kpi.value}{kpi.unit === '%' ? '%' : ''}</p>
                <p className="text-slate-400 text-xs">{kpi.name}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>الهدف: {kpi.target}{kpi.unit === '%' ? '%' : ''}</span>
                    <span>{((kpi.value / kpi.target) * 100).toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={Math.min((kpi.value / kpi.target) * 100, 100)} 
                    className="h-1"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Trend Chart */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">اتجاهات الأداء الشهرية</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={[80, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                <Legend />
                <Line type="monotone" dataKey="delivery" name="التسليم" stroke="#22d3ee" strokeWidth={2} dot={{ fill: '#22d3ee' }} />
                <Line type="monotone" dataKey="quality" name="الجودة" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
                <Line type="monotone" dataKey="price" name="السعر" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">مقارنة أداء الموردين</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={[
                { metric: 'التسليم', ...Object.fromEntries(supplierRankings.map(s => [s.name.split(' ')[0], s.delivery])) },
                { metric: 'الجودة', ...Object.fromEntries(supplierRankings.map(s => [s.name.split(' ')[0], s.quality])) },
                { metric: 'السعر', ...Object.fromEntries(supplierRankings.map(s => [s.name.split(' ')[0], s.price])) },
              ]}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" fontSize={8} />
                {supplierRankings.map((s, i) => (
                  <Radar
                    key={s.name}
                    name={s.name.split(' ')[0]}
                    dataKey={s.name.split(' ')[0]}
                    stroke={COLORS[i]}
                    fill={COLORS[i]}
                    fillOpacity={0.2}
                  />
                ))}
                <Legend />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Rankings */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">ترتيب الموردين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {supplierRankings.map((supplier, idx) => (
              <div key={supplier.name} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  idx === 0 ? 'bg-amber-500/20 text-amber-400' :
                  idx === 1 ? 'bg-slate-400/20 text-slate-300' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="text-white font-medium">{supplier.name}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-cyan-400 text-xs">التسليم: {supplier.delivery}%</span>
                    <span className="text-green-400 text-xs">الجودة: {supplier.quality}%</span>
                    <span className="text-amber-400 text-xs">السعر: {supplier.price}%</span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-white">{supplier.overall}%</p>
                  <p className="text-slate-500 text-xs">التقييم الكلي</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customize Dialog */}
      <Dialog open={showCustomize} onOpenChange={setShowCustomize}>
        <DialogContent className="bg-[#0f1629] border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">تخصيص المؤشرات</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {kpis.map(kpi => (
              <div key={kpi.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={kpi.visible}
                    onCheckedChange={() => toggleKPI(kpi.id)}
                  />
                  <kpi.icon className={`w-4 h-4 text-${kpi.color}-400`} />
                  <span className="text-white">{kpi.name}</span>
                </div>
                <Badge variant="outline" className="border-slate-600">
                  {kpi.value}{kpi.unit === '%' ? '%' : ` ${kpi.unit}`}
                </Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}