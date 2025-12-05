import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Radio, BarChart3, Activity, Zap, Signal, Wind, Gauge, TrendingUp,
  ChevronDown, Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

// بيانات الأبراج للمقارنة
const towersData = [
  {
    id: 'TWR-001',
    name: 'برج الاتصالات المركزي',
    signal_strength: 95,
    uptime: 99.8,
    energy_consumption: 450,
    maintenance_score: 94,
    connected_devices: 12500,
    structural_integrity: 98
  },
  {
    id: 'TWR-002',
    name: 'برج المنطقة الشرقية',
    signal_strength: 82,
    uptime: 97.2,
    energy_consumption: 380,
    maintenance_score: 78,
    connected_devices: 8900,
    structural_integrity: 87
  },
  {
    id: 'TWR-003',
    name: 'برج المراقبة الجنوبي',
    signal_strength: 68,
    uptime: 92.5,
    energy_consumption: 290,
    maintenance_score: 62,
    connected_devices: 45,
    structural_integrity: 72
  },
  {
    id: 'TWR-004',
    name: 'برج البث الإذاعي',
    signal_strength: 98,
    uptime: 99.9,
    energy_consumption: 680,
    maintenance_score: 92,
    connected_devices: 0,
    structural_integrity: 96
  }
];

const metrics = [
  { id: 'signal_strength', name: 'قوة الإشارة', unit: '%', icon: Signal, color: '#22d3ee' },
  { id: 'uptime', name: 'وقت التشغيل', unit: '%', icon: Activity, color: '#22c55e' },
  { id: 'energy_consumption', name: 'استهلاك الطاقة', unit: 'kWh', icon: Zap, color: '#f59e0b' },
  { id: 'maintenance_score', name: 'صحة الصيانة', unit: '%', icon: Gauge, color: '#a855f7' },
  { id: 'structural_integrity', name: 'السلامة الهيكلية', unit: '%', icon: Radio, color: '#3b82f6' }
];

export default function TowerComparison() {
  const [selectedTowers, setSelectedTowers] = useState(['TWR-001', 'TWR-002']);
  const [viewType, setViewType] = useState('bar');

  const toggleTower = (towerId) => {
    setSelectedTowers(prev =>
      prev.includes(towerId)
        ? prev.filter(id => id !== towerId)
        : [...prev, towerId]
    );
  };

  const selectedTowersData = towersData.filter(t => selectedTowers.includes(t.id));

  // بيانات الرسم البياني الشريطي
  const barChartData = metrics.map(metric => ({
    name: metric.name,
    ...selectedTowersData.reduce((acc, tower) => ({
      ...acc,
      [tower.name.substring(0, 15)]: tower[metric.id]
    }), {})
  }));

  // بيانات الرادار
  const radarData = metrics.map(metric => ({
    metric: metric.name,
    ...selectedTowersData.reduce((acc, tower) => ({
      ...acc,
      [tower.id]: metric.id === 'energy_consumption'
        ? Math.round((1 - tower[metric.id] / 700) * 100) // عكس للطاقة (أقل = أفضل)
        : tower[metric.id]
    }), {}),
    fullMark: 100
  }));

  const COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#f59e0b'];

  return (
    <div className="space-y-4" dir="rtl">
      {/* Tower Selection */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              اختر الأبراج للمقارنة
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-slate-600">
                  {selectedTowers.length} أبراج محددة
                  <ChevronDown className="w-4 h-4 mr-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border-slate-700">
                {towersData.map(tower => (
                  <DropdownMenuCheckboxItem
                    key={tower.id}
                    checked={selectedTowers.includes(tower.id)}
                    onCheckedChange={() => toggleTower(tower.id)}
                    className="text-white"
                  >
                    {tower.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {selectedTowersData.map((tower, i) => (
              <Badge key={tower.id} style={{ backgroundColor: `${COLORS[i]}20`, color: COLORS[i] }}>
                <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[i] }} />
                {tower.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Type Tabs */}
      <Tabs value={viewType} onValueChange={setViewType}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="bar" className="data-[state=active]:bg-cyan-500/20">
            <BarChart3 className="w-4 h-4 ml-1" />
            أعمدة
          </TabsTrigger>
          <TabsTrigger value="radar" className="data-[state=active]:bg-purple-500/20">
            <Activity className="w-4 h-4 ml-1" />
            رادار
          </TabsTrigger>
          <TabsTrigger value="table" className="data-[state=active]:bg-green-500/20">
            <TrendingUp className="w-4 h-4 ml-1" />
            جدول
          </TabsTrigger>
        </TabsList>

        {/* Bar Chart View */}
        <TabsContent value="bar" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="pt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} fontSize={12} />
                    <Tooltip 
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    {selectedTowersData.map((tower, i) => (
                      <Bar
                        key={tower.id}
                        dataKey={tower.name.substring(0, 15)}
                        fill={COLORS[i]}
                        radius={[0, 4, 4, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Radar Chart View */}
        <TabsContent value="radar" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="pt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                    {selectedTowersData.map((tower, i) => (
                      <Radar
                        key={tower.id}
                        name={tower.name}
                        dataKey={tower.id}
                        stroke={COLORS[i]}
                        fill={COLORS[i]}
                        fillOpacity={0.2}
                      />
                    ))}
                    <Legend />
                    <Tooltip 
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Table View */}
        <TabsContent value="table" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-right p-4 text-slate-400 font-medium">المقياس</th>
                      {selectedTowersData.map((tower, i) => (
                        <th key={tower.id} className="text-center p-4 font-medium" style={{ color: COLORS[i] }}>
                          {tower.name.substring(0, 15)}
                        </th>
                      ))}
                      <th className="text-center p-4 text-slate-400 font-medium">الأفضل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map(metric => {
                      const Icon = metric.icon;
                      const values = selectedTowersData.map(t => t[metric.id]);
                      const isLowerBetter = metric.id === 'energy_consumption';
                      const bestValue = isLowerBetter ? Math.min(...values) : Math.max(...values);
                      const bestTower = selectedTowersData.find(t => t[metric.id] === bestValue);

                      return (
                        <tr key={metric.id} className="border-b border-slate-700/50">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" style={{ color: metric.color }} />
                              <span className="text-white">{metric.name}</span>
                            </div>
                          </td>
                          {selectedTowersData.map((tower, i) => {
                            const isBest = tower[metric.id] === bestValue;
                            return (
                              <td key={tower.id} className="text-center p-4">
                                <span className={`font-bold ${isBest ? 'text-green-400' : 'text-white'}`}>
                                  {tower[metric.id].toLocaleString()}
                                </span>
                                <span className="text-slate-500 text-sm mr-1">{metric.unit}</span>
                                {isBest && <Check className="w-4 h-4 inline text-green-400 mr-1" />}
                              </td>
                            );
                          })}
                          <td className="text-center p-4">
                            <Badge className="bg-green-500/20 text-green-400">
                              {bestTower?.name.substring(0, 12)}
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
        </TabsContent>
      </Tabs>

      {/* Summary */}
      <Card className="glass-card border-green-500/30 bg-green-500/5">
        <CardContent className="p-4">
          <p className="text-white font-medium mb-2">ملخص المقارنة</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {selectedTowersData.map((tower, i) => {
              const avgScore = Math.round(
                (tower.signal_strength + tower.uptime + tower.maintenance_score + tower.structural_integrity) / 4
              );
              return (
                <div key={tower.id} className="p-3 bg-slate-800/50 rounded-lg text-center">
                  <p className="text-sm text-slate-400 mb-1">{tower.name.substring(0, 15)}</p>
                  <p className="text-2xl font-bold" style={{ color: COLORS[i] }}>{avgScore}%</p>
                  <p className="text-xs text-slate-500">متوسط الأداء</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}