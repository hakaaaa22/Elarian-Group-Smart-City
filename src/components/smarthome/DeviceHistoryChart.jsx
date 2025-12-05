import React, { useState } from 'react';
import {
  Activity, Zap, Thermometer, Clock, Calendar, TrendingUp, TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// Mock historical data
const generateHistoricalData = (days) => {
  return Array.from({ length: days }, (_, i) => ({
    time: i < 24 ? `${i}:00` : `يوم ${Math.floor(i / 24)}`,
    usage: Math.floor(Math.random() * 100) + 20,
    power: Math.floor(Math.random() * 500) + 100,
    temp: Math.floor(Math.random() * 10) + 20,
    uptime: Math.floor(Math.random() * 20) + 80,
  }));
};

export default function DeviceHistoryChart({ device }) {
  const [period, setPeriod] = useState('day');
  const [metric, setMetric] = useState('usage');
  
  const data = generateHistoricalData(period === 'day' ? 24 : period === 'week' ? 7 : 30);

  const metrics = [
    { id: 'usage', name: 'الاستخدام', icon: Activity, color: '#22d3ee', unit: '%' },
    { id: 'power', name: 'الطاقة', icon: Zap, color: '#f59e0b', unit: 'W' },
    { id: 'temp', name: 'الحرارة', icon: Thermometer, color: '#ef4444', unit: '°C' },
    { id: 'uptime', name: 'وقت التشغيل', icon: Clock, color: '#10b981', unit: '%' },
  ];

  const currentMetric = metrics.find(m => m.id === metric);
  const avgValue = Math.floor(data.reduce((sum, d) => sum + d[metric], 0) / data.length);
  const maxValue = Math.max(...data.map(d => d[metric]));
  const minValue = Math.min(...data.map(d => d[metric]));
  const trend = data[data.length - 1][metric] > data[0][metric] ? 'up' : 'down';

  return (
    <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            سجل الأداء - {device?.name || 'الجهاز'}
          </CardTitle>
          <div className="flex gap-2">
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger className="w-28 h-8 bg-slate-800/50 border-slate-700 text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {metrics.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-24 h-8 bg-slate-800/50 border-slate-700 text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="day">يوم</SelectItem>
                <SelectItem value="week">أسبوع</SelectItem>
                <SelectItem value="month">شهر</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="p-2 bg-slate-800/50 rounded text-center">
            <p className="text-lg font-bold" style={{ color: currentMetric?.color }}>{avgValue}{currentMetric?.unit}</p>
            <p className="text-slate-500 text-xs">المتوسط</p>
          </div>
          <div className="p-2 bg-slate-800/50 rounded text-center">
            <p className="text-lg font-bold text-green-400">{maxValue}{currentMetric?.unit}</p>
            <p className="text-slate-500 text-xs">الأعلى</p>
          </div>
          <div className="p-2 bg-slate-800/50 rounded text-center">
            <p className="text-lg font-bold text-amber-400">{minValue}{currentMetric?.unit}</p>
            <p className="text-slate-500 text-xs">الأدنى</p>
          </div>
          <div className="p-2 bg-slate-800/50 rounded text-center">
            <div className="flex items-center justify-center gap-1">
              {trend === 'up' ? 
                <TrendingUp className="w-4 h-4 text-red-400" /> : 
                <TrendingDown className="w-4 h-4 text-green-400" />
              }
              <p className={`text-lg font-bold ${trend === 'up' ? 'text-red-400' : 'text-green-400'}`}>
                {trend === 'up' ? '+' : '-'}5%
              </p>
            </div>
            <p className="text-slate-500 text-xs">الاتجاه</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area 
                type="monotone" 
                dataKey={metric} 
                stroke={currentMetric?.color} 
                fill={currentMetric?.color} 
                fillOpacity={0.2}
                name={currentMetric?.name}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}