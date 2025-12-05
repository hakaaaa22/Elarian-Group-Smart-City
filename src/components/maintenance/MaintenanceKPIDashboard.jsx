import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown, Clock, DollarSign, Wrench,
  CheckCircle, XCircle, AlertTriangle, Target, Activity, Calendar,
  Settings, Plus, X, GripVertical, Eye, EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const defaultKPIs = [
  { id: 'mttr', name: 'متوسط وقت الإصلاح', value: 2.5, unit: 'ساعة', target: 3, trend: -12, icon: Clock, color: 'cyan', visible: true },
  { id: 'mtbf', name: 'متوسط الوقت بين الأعطال', value: 45, unit: 'يوم', target: 30, trend: 15, icon: Activity, color: 'green', visible: true },
  { id: 'preventive_success', name: 'نجاح الصيانة الوقائية', value: 92, unit: '%', target: 90, trend: 5, icon: CheckCircle, color: 'emerald', visible: true },
  { id: 'first_time_fix', name: 'الإصلاح من المرة الأولى', value: 78, unit: '%', target: 85, trend: -3, icon: Target, color: 'purple', visible: true },
  { id: 'planned_vs_unplanned', name: 'الصيانة المخططة vs الطارئة', value: 72, unit: '%', target: 80, trend: 8, icon: Calendar, color: 'blue', visible: true },
  { id: 'cost_variance', name: 'انحراف التكلفة', value: -8, unit: '%', target: 0, trend: -5, icon: DollarSign, color: 'amber', visible: true },
  { id: 'backlog', name: 'الأعمال المتراكمة', value: 12, unit: 'طلب', target: 10, trend: 20, icon: AlertTriangle, color: 'red', visible: true },
  { id: 'technician_utilization', name: 'استغلال الفنيين', value: 85, unit: '%', target: 80, trend: 3, icon: Wrench, color: 'pink', visible: true },
];

const monthlyData = [
  { month: 'يناير', actual: 12500, predicted: 14000, preventive: 8, corrective: 4 },
  { month: 'فبراير', actual: 11800, predicted: 13500, preventive: 10, corrective: 3 },
  { month: 'مارس', actual: 15200, predicted: 13000, preventive: 7, corrective: 6 },
  { month: 'أبريل', actual: 10500, predicted: 12000, preventive: 12, corrective: 2 },
  { month: 'مايو', actual: 13200, predicted: 12500, preventive: 9, corrective: 5 },
  { month: 'يونيو', actual: 11000, predicted: 11500, preventive: 11, corrective: 3 },
];

const categoryBreakdown = [
  { name: 'تكييف', value: 35, color: '#22d3ee' },
  { name: 'كهرباء', value: 25, color: '#a855f7' },
  { name: 'أمان', value: 20, color: '#f59e0b' },
  { name: 'مركبات', value: 15, color: '#10b981' },
  { name: 'أخرى', value: 5, color: '#6366f1' },
];

const COLORS = ['#22d3ee', '#a855f7', '#f59e0b', '#10b981', '#6366f1', '#ef4444'];

export default function MaintenanceKPIDashboard() {
  const [kpis, setKpis] = useState(defaultKPIs);
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false);
  const [timeRange, setTimeRange] = useState('month');
  const [selectedKPI, setSelectedKPI] = useState(null);

  const toggleKPIVisibility = (kpiId) => {
    setKpis(kpis.map(k => k.id === kpiId ? { ...k, visible: !k.visible } : k));
  };

  const visibleKPIs = kpis.filter(k => k.visible);

  const totalActualCost = monthlyData.reduce((sum, m) => sum + m.actual, 0);
  const totalPredictedCost = monthlyData.reduce((sum, m) => sum + m.predicted, 0);
  const costVariance = ((totalActualCost - totalPredictedCost) / totalPredictedCost * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            لوحة مؤشرات الأداء - الصيانة
          </h3>
          <p className="text-slate-400 text-sm">مراقبة وتحليل أداء عمليات الصيانة</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="week">الأسبوع</SelectItem>
              <SelectItem value="month">الشهر</SelectItem>
              <SelectItem value="quarter">الربع</SelectItem>
              <SelectItem value="year">السنة</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-slate-600" onClick={() => setShowCustomizeDialog(true)}>
            <Settings className="w-4 h-4 ml-2" />
            تخصيص
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {visibleKPIs.map((kpi, i) => {
          const Icon = kpi.icon;
          const isPositive = kpi.trend > 0;
          const meetsTarget = kpi.id === 'backlog' || kpi.id === 'cost_variance' 
            ? kpi.value <= kpi.target 
            : kpi.value >= kpi.target;
          
          return (
            <motion.div 
              key={kpi.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }}
              className="cursor-pointer"
              onClick={() => setSelectedKPI(kpi)}
            >
              <Card className={`glass-card border-${kpi.color}-500/30 bg-${kpi.color}-500/5 hover:border-${kpi.color}-500/50 transition-all`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-${kpi.color}-500/20`}>
                      <Icon className={`w-5 h-5 text-${kpi.color}-400`} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(kpi.trend)}%
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs mb-1">{kpi.name}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold text-white">{kpi.value}</span>
                    <span className="text-slate-500 text-xs mb-1">{kpi.unit}</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">الهدف: {kpi.target}{kpi.unit}</span>
                      <span className={meetsTarget ? 'text-green-400' : 'text-red-400'}>
                        {meetsTarget ? '✓ محقق' : '✗ غير محقق'}
                      </span>
                    </div>
                    <Progress 
                      value={kpi.id === 'backlog' ? Math.max(0, 100 - (kpi.value / kpi.target) * 50) : Math.min(100, (kpi.value / kpi.target) * 100)} 
                      className="h-1.5" 
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cost Comparison Chart */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                التكاليف: المتوقعة vs الفعلية
              </span>
              <Badge className={`${Number(costVariance) <= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {costVariance}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(value) => [`${value.toLocaleString()} ر.س`]}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="predicted" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} name="المتوقع" />
                  <Area type="monotone" dataKey="actual" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} name="الفعلي" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700/50">
              <div className="text-center">
                <p className="text-slate-400 text-xs">إجمالي المتوقع</p>
                <p className="text-purple-400 font-bold">{totalPredictedCost.toLocaleString()} ر.س</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-xs">إجمالي الفعلي</p>
                <p className="text-cyan-400 font-bold">{totalActualCost.toLocaleString()} ر.س</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-xs">الفرق</p>
                <p className={`font-bold ${totalActualCost <= totalPredictedCost ? 'text-green-400' : 'text-red-400'}`}>
                  {(totalActualCost - totalPredictedCost).toLocaleString()} ر.س
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Type Breakdown */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Wrench className="w-4 h-4 text-purple-400" />
              توزيع الصيانة حسب الفئة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      formatter={(value) => [`${value}%`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {categoryBreakdown.map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-white text-sm">{cat.name}</span>
                    </div>
                    <span className="text-slate-400 text-sm">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preventive vs Corrective Trend */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" />
            اتجاه الصيانة الوقائية vs التصحيحية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="preventive" fill="#10b981" name="وقائية" radius={[4, 4, 0, 0]} />
                <Bar dataKey="corrective" fill="#ef4444" name="تصحيحية" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Customize Dialog */}
      <Dialog open={showCustomizeDialog} onOpenChange={setShowCustomizeDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              تخصيص المؤشرات
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4 max-h-96 overflow-y-auto">
            {kpis.map(kpi => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${kpi.color}-500/20`}>
                      <Icon className={`w-4 h-4 text-${kpi.color}-400`} />
                    </div>
                    <span className="text-white text-sm">{kpi.name}</span>
                  </div>
                  <Switch
                    checked={kpi.visible}
                    onCheckedChange={() => toggleKPIVisibility(kpi.id)}
                  />
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* KPI Detail Dialog */}
      <Dialog open={!!selectedKPI} onOpenChange={() => setSelectedKPI(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {selectedKPI && <selectedKPI.icon className={`w-5 h-5 text-${selectedKPI?.color}-400`} />}
              {selectedKPI?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedKPI && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                  <p className="text-slate-400 text-xs mb-1">القيمة الحالية</p>
                  <p className="text-2xl font-bold text-white">{selectedKPI.value}{selectedKPI.unit}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                  <p className="text-slate-400 text-xs mb-1">الهدف</p>
                  <p className="text-2xl font-bold text-cyan-400">{selectedKPI.target}{selectedKPI.unit}</p>
                </div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">التقدم نحو الهدف</span>
                  <span className="text-white font-bold">{Math.round((selectedKPI.value / selectedKPI.target) * 100)}%</span>
                </div>
                <Progress value={Math.min(100, (selectedKPI.value / selectedKPI.target) * 100)} className="h-3" />
              </div>
              <div className={`p-4 rounded-lg flex items-center gap-3 ${selectedKPI.trend > 0 ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                {selectedKPI.trend > 0 ? <TrendingUp className="w-5 h-5 text-green-400" /> : <TrendingDown className="w-5 h-5 text-red-400" />}
                <div>
                  <p className={selectedKPI.trend > 0 ? 'text-green-400' : 'text-red-400'}>
                    {selectedKPI.trend > 0 ? 'تحسن' : 'تراجع'} بنسبة {Math.abs(selectedKPI.trend)}%
                  </p>
                  <p className="text-slate-400 text-xs">مقارنة بالفترة السابقة</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}