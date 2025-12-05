import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Radio, Zap, Activity, TrendingUp, Download, Filter,
  ChevronDown, Check, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

// بيانات مقارنة استهلاك الطاقة بين الأبراج
const towerEnergyComparison = [
  { name: 'برج المركز', energy: 450, efficiency: 92, cost: 1350 },
  { name: 'برج الشرق', energy: 380, efficiency: 88, cost: 1140 },
  { name: 'برج الجنوب', energy: 290, efficiency: 75, cost: 870 },
  { name: 'برج البث', energy: 680, efficiency: 95, cost: 2040 },
];

// بيانات مقارنة أداء الكاميرات
const cameraComparison = [
  { name: 'كاميرا المدخل', uptime: 99.2, detections: 2450, accuracy: 96 },
  { name: 'كاميرا الموقف', uptime: 98.5, detections: 1890, accuracy: 94 },
  { name: 'كاميرا الصناعية', uptime: 92.1, detections: 780, accuracy: 88 },
  { name: 'كاميرا الحديقة', uptime: 85.3, detections: 320, accuracy: 82 },
];

// بيانات مقارنة المركبات
const vehicleComparison = [
  { name: 'دورية 1', distance: 4500, fuel: 520, efficiency: 8.7 },
  { name: 'شاحنة نفايات', distance: 3200, fuel: 680, efficiency: 4.7 },
  { name: 'صيانة 2', distance: 2800, fuel: 320, efficiency: 8.8 },
  { name: 'طوارئ 1', distance: 1500, fuel: 180, efficiency: 8.3 },
];

const comparisonMetrics = {
  towers: [
    { id: 'energy', name: 'استهلاك الطاقة', unit: 'kWh', color: '#f59e0b' },
    { id: 'efficiency', name: 'الكفاءة', unit: '%', color: '#22c55e' },
    { id: 'cost', name: 'التكلفة', unit: 'ر.س', color: '#ef4444' },
  ],
  cameras: [
    { id: 'uptime', name: 'وقت التشغيل', unit: '%', color: '#22c55e' },
    { id: 'detections', name: 'الكشوفات', unit: '', color: '#a855f7' },
    { id: 'accuracy', name: 'الدقة', unit: '%', color: '#22d3ee' },
  ],
  vehicles: [
    { id: 'distance', name: 'المسافة', unit: 'كم', color: '#3b82f6' },
    { id: 'fuel', name: 'الوقود', unit: 'لتر', color: '#f59e0b' },
    { id: 'efficiency', name: 'الكفاءة', unit: 'كم/لتر', color: '#22c55e' },
  ]
};

const COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'];

export default function UnitComparisonReports() {
  const [unitType, setUnitType] = useState('towers');
  const [selectedMetric, setSelectedMetric] = useState('energy');

  const getData = () => {
    switch (unitType) {
      case 'towers': return towerEnergyComparison;
      case 'cameras': return cameraComparison;
      case 'vehicles': return vehicleComparison;
      default: return [];
    }
  };

  const getMetrics = () => comparisonMetrics[unitType] || [];
  const currentMetric = getMetrics().find(m => m.id === selectedMetric) || getMetrics()[0];

  const data = getData();

  // حساب الأفضل والأسوأ
  const values = data.map(d => d[selectedMetric]);
  const best = Math.max(...values);
  const worst = Math.min(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  // بيانات الرادار
  const radarData = getMetrics().map(metric => ({
    metric: metric.name,
    ...data.reduce((acc, item) => ({
      ...acc,
      [item.name]: item[metric.id]
    }), {})
  }));

  return (
    <div className="space-y-4" dir="rtl">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={unitType} onValueChange={(v) => {
          setUnitType(v);
          setSelectedMetric(comparisonMetrics[v][0].id);
        }}>
          <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="towers">الأبراج</SelectItem>
            <SelectItem value="cameras">الكاميرات</SelectItem>
            <SelectItem value="vehicles">المركبات</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedMetric} onValueChange={setSelectedMetric}>
          <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {getMetrics().map(m => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" className="border-slate-600 mr-auto">
          <Download className="w-4 h-4 ml-2" />
          تصدير
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-card border-green-500/30 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">الأفضل</p>
                <p className="text-2xl font-bold text-green-400">{best.toLocaleString()} {currentMetric?.unit}</p>
                <p className="text-xs text-slate-500">{data.find(d => d[selectedMetric] === best)?.name}</p>
              </div>
              <ArrowUpRight className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">المتوسط</p>
                <p className="text-2xl font-bold text-cyan-400">{avg.toFixed(1)} {currentMetric?.unit}</p>
                <p className="text-xs text-slate-500">لجميع الوحدات</p>
              </div>
              <Activity className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-red-500/30 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">الأدنى</p>
                <p className="text-2xl font-bold text-red-400">{worst.toLocaleString()} {currentMetric?.unit}</p>
                <p className="text-xs text-slate-500">{data.find(d => d[selectedMetric] === worst)?.name}</p>
              </div>
              <ArrowDownRight className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader>
            <CardTitle className="text-white text-sm">مقارنة {currentMetric?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey={selectedMetric} fill={currentMetric?.color || '#22d3ee'} radius={[0, 4, 4, 0]} name={currentMetric?.name} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader>
            <CardTitle className="text-white text-sm">مقارنة شاملة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={10} />
                  <PolarRadiusAxis stroke="#94a3b8" />
                  {data.slice(0, 4).map((item, i) => (
                    <Radar key={item.name} name={item.name} dataKey={item.name} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} />
                  ))}
                  <Legend />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader>
          <CardTitle className="text-white text-sm">جدول المقارنة التفصيلي</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-right p-4 text-slate-400 font-medium">الوحدة</th>
                  {getMetrics().map(m => (
                    <th key={m.id} className="text-center p-4 text-slate-400 font-medium">{m.name}</th>
                  ))}
                  <th className="text-center p-4 text-slate-400 font-medium">التقييم</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => {
                  const score = getMetrics().reduce((acc, m) => {
                    const vals = data.map(d => d[m.id]);
                    const max = Math.max(...vals);
                    return acc + (item[m.id] / max) * 100;
                  }, 0) / getMetrics().length;
                  
                  return (
                    <tr key={item.name} className="border-b border-slate-700/50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                          <span className="text-white">{item.name}</span>
                        </div>
                      </td>
                      {getMetrics().map(m => (
                        <td key={m.id} className="text-center p-4 text-white">
                          {item[m.id].toLocaleString()} <span className="text-slate-500 text-xs">{m.unit}</span>
                        </td>
                      ))}
                      <td className="text-center p-4">
                        <Badge className={score >= 80 ? 'bg-green-500/20 text-green-400' : score >= 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}>
                          {score.toFixed(0)}%
                        </Badge>
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