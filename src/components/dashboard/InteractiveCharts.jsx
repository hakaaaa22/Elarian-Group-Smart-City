import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, DollarSign, Wrench, TrendingUp, TrendingDown, Calendar,
  BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon,
  Download, Filter, Eye, AlertTriangle, Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, Scatter
} from 'recharts';

// بيانات استهلاك الطاقة
const energyData = [
  { month: 'يناير', consumption: 320, cost: 960, predicted: 340, savings: 20 },
  { month: 'فبراير', consumption: 280, cost: 840, predicted: 300, savings: 20 },
  { month: 'مارس', consumption: 350, cost: 1050, predicted: 360, savings: 10 },
  { month: 'أبريل', consumption: 420, cost: 1260, predicted: 400, savings: -20 },
  { month: 'مايو', consumption: 480, cost: 1440, predicted: 500, savings: 20 },
  { month: 'يونيو', consumption: 550, cost: 1650, predicted: 580, savings: 30 },
  { month: 'يوليو', consumption: 600, cost: 1800, predicted: 620, savings: 20 },
  { month: 'أغسطس', consumption: 580, cost: 1740, predicted: 600, savings: 20 },
  { month: 'سبتمبر', consumption: 450, cost: 1350, predicted: 470, savings: 20 },
  { month: 'أكتوبر', consumption: 380, cost: 1140, predicted: 400, savings: 20 },
  { month: 'نوفمبر', consumption: 320, cost: 960, predicted: 340, savings: 20 },
  { month: 'ديسمبر', consumption: 300, cost: 900, predicted: 320, savings: 20 },
];

// بيانات تكاليف الصيانة
const maintenanceCostData = [
  { month: 'يناير', preventive: 800, corrective: 1200, emergency: 500, total: 2500 },
  { month: 'فبراير', preventive: 900, corrective: 800, emergency: 200, total: 1900 },
  { month: 'مارس', preventive: 1000, corrective: 600, emergency: 0, total: 1600 },
  { month: 'أبريل', preventive: 850, corrective: 900, emergency: 300, total: 2050 },
  { month: 'مايو', preventive: 1100, corrective: 500, emergency: 0, total: 1600 },
  { month: 'يونيو', preventive: 950, corrective: 700, emergency: 400, total: 2050 },
];

// توزيع الصيانة حسب النوع
const maintenanceByType = [
  { name: 'وقائية', value: 45, color: '#22d3ee' },
  { name: 'تصحيحية', value: 35, color: '#f59e0b' },
  { name: 'طارئة', value: 12, color: '#ef4444' },
  { name: 'فحص', value: 8, color: '#a855f7' },
];

// توزيع المخزون
const inventoryDistribution = [
  { name: 'قطع غيار', value: 45000, count: 85, color: '#f59e0b' },
  { name: 'إلكترونيات', value: 32000, count: 45, color: '#a855f7' },
  { name: 'تكييف', value: 28000, count: 35, color: '#22d3ee' },
  { name: 'أمان', value: 15000, count: 40, color: '#ef4444' },
];

const COLORS = ['#22d3ee', '#f59e0b', '#ef4444', '#a855f7', '#10b981'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
        <p className="text-white font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()} {entry.unit || ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function InteractiveCharts() {
  const [activeChart, setActiveChart] = useState('energy');
  const [timeRange, setTimeRange] = useState('year');
  const [chartType, setChartType] = useState('area');

  const filteredEnergyData = useMemo(() => {
    if (timeRange === 'quarter') return energyData.slice(-3);
    if (timeRange === 'half') return energyData.slice(-6);
    return energyData;
  }, [timeRange]);

  const totalEnergy = filteredEnergyData.reduce((sum, d) => sum + d.consumption, 0);
  const totalCost = filteredEnergyData.reduce((sum, d) => sum + d.cost, 0);
  const totalSavings = filteredEnergyData.reduce((sum, d) => sum + d.savings, 0);
  const avgConsumption = Math.round(totalEnergy / filteredEnergyData.length);

  const totalMaintenanceCost = maintenanceCostData.reduce((sum, d) => sum + d.total, 0);
  const preventiveCost = maintenanceCostData.reduce((sum, d) => sum + d.preventive, 0);
  const correctiveCost = maintenanceCostData.reduce((sum, d) => sum + d.corrective, 0);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={activeChart} onValueChange={setActiveChart}>
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
            <TabsTrigger value="energy" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Zap className="w-4 h-4 ml-2" />
              الطاقة
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              <Wrench className="w-4 h-4 ml-2" />
              الصيانة
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <Package className="w-4 h-4 ml-2" />
              المخزون
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-28 bg-slate-800/50 border-slate-700 text-white h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="quarter">3 أشهر</SelectItem>
              <SelectItem value="half">6 أشهر</SelectItem>
              <SelectItem value="year">سنة</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="border-slate-600 h-8">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Energy Charts */}
      {activeChart === 'energy' && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
              <CardContent className="p-3 text-center">
                <Zap className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{totalEnergy.toLocaleString()}</p>
                <p className="text-slate-400 text-xs">kWh إجمالي</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-3 text-center">
                <DollarSign className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{totalCost.toLocaleString()}</p>
                <p className="text-slate-400 text-xs">ر.س التكلفة</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-green-500/30 bg-green-500/5">
              <CardContent className="p-3 text-center">
                <TrendingDown className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-green-400">{totalSavings}</p>
                <p className="text-slate-400 text-xs">kWh توفير</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-purple-500/30 bg-purple-500/5">
              <CardContent className="p-3 text-center">
                <BarChart3 className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{avgConsumption}</p>
                <p className="text-slate-400 text-xs">kWh متوسط</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Chart */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">اتجاه استهلاك الطاقة والتكلفة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={filteredEnergyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                    <YAxis yAxisId="left" stroke="#22d3ee" fontSize={10} />
                    <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="consumption" 
                      fill="#22d3ee" 
                      fillOpacity={0.2}
                      stroke="#22d3ee" 
                      name="الاستهلاك (kWh)"
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#a855f7" 
                      strokeDasharray="5 5"
                      name="المتوقع (kWh)"
                    />
                    <Bar 
                      yAxisId="right"
                      dataKey="cost" 
                      fill="#f59e0b" 
                      fillOpacity={0.6}
                      name="التكلفة (ر.س)"
                      radius={[4, 4, 0, 0]}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Maintenance Charts */}
      {activeChart === 'maintenance' && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="glass-card border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-3 text-center">
                <DollarSign className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{totalMaintenanceCost.toLocaleString()}</p>
                <p className="text-slate-400 text-xs">ر.س إجمالي</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
              <CardContent className="p-3 text-center">
                <Wrench className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{preventiveCost.toLocaleString()}</p>
                <p className="text-slate-400 text-xs">ر.س وقائية</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-red-500/30 bg-red-500/5">
              <CardContent className="p-3 text-center">
                <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{correctiveCost.toLocaleString()}</p>
                <p className="text-slate-400 text-xs">ر.س تصحيحية</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-green-500/30 bg-green-500/5">
              <CardContent className="p-3 text-center">
                <TrendingDown className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-green-400">-15%</p>
                <p className="text-slate-400 text-xs">انخفاض التكلفة</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Cost Trend */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">تكاليف الصيانة الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={maintenanceCostData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="preventive" stackId="a" fill="#22d3ee" name="وقائية" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="corrective" stackId="a" fill="#f59e0b" name="تصحيحية" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="emergency" stackId="a" fill="#ef4444" name="طارئة" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Distribution */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">توزيع أنواع الصيانة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={maintenanceByType}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {maintenanceByType.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Inventory Charts */}
      {activeChart === 'inventory' && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Value Distribution */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">قيمة المخزون حسب الفئة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventoryDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={80} />
                      <Tooltip formatter={(value) => `${value.toLocaleString()} ر.س`} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {inventoryDistribution.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Items Count */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">عدد الأصناف حسب الفئة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={inventoryDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="count"
                        label={({ name, count }) => `${name}: ${count}`}
                      >
                        {inventoryDistribution.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}