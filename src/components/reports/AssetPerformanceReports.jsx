import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Camera, Radio, Car, Calendar, Download, Filter, TrendingUp,
  TrendingDown, Activity, Zap, Signal, Clock, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';

// بيانات أداء الكاميرات
const cameraPerformance = {
  daily: [
    { time: '00:00', uptime: 98, detections: 120, alerts: 5 },
    { time: '04:00', uptime: 99, detections: 45, alerts: 2 },
    { time: '08:00', uptime: 97, detections: 280, alerts: 12 },
    { time: '12:00', uptime: 96, detections: 450, alerts: 18 },
    { time: '16:00', uptime: 98, detections: 380, alerts: 15 },
    { time: '20:00', uptime: 99, detections: 220, alerts: 8 },
  ],
  weekly: [
    { day: 'السبت', uptime: 98.5, detections: 2400, alerts: 45 },
    { day: 'الأحد', uptime: 97.8, detections: 2650, alerts: 52 },
    { day: 'الإثنين', uptime: 99.1, detections: 2800, alerts: 38 },
    { day: 'الثلاثاء', uptime: 98.2, detections: 2550, alerts: 41 },
    { day: 'الأربعاء', uptime: 97.5, detections: 2700, alerts: 48 },
    { day: 'الخميس', uptime: 98.8, detections: 2350, alerts: 35 },
    { day: 'الجمعة', uptime: 99.2, detections: 1800, alerts: 22 },
  ],
  monthly: [
    { week: 'الأسبوع 1', uptime: 98.2, detections: 18500, alerts: 285 },
    { week: 'الأسبوع 2', uptime: 97.8, detections: 19200, alerts: 312 },
    { week: 'الأسبوع 3', uptime: 98.5, detections: 17800, alerts: 268 },
    { week: 'الأسبوع 4', uptime: 99.1, detections: 18900, alerts: 245 },
  ]
};

// بيانات أداء الأبراج
const towerPerformance = {
  daily: [
    { time: '00:00', signal: 95, energy: 420, uptime: 99.8 },
    { time: '04:00', signal: 96, energy: 380, uptime: 99.9 },
    { time: '08:00', signal: 92, energy: 480, uptime: 99.5 },
    { time: '12:00', signal: 88, energy: 550, uptime: 99.2 },
    { time: '16:00', signal: 91, energy: 520, uptime: 99.4 },
    { time: '20:00', signal: 94, energy: 450, uptime: 99.7 },
  ],
  weekly: [
    { day: 'السبت', signal: 93, energy: 3200, uptime: 99.5 },
    { day: 'الأحد', signal: 94, energy: 3350, uptime: 99.6 },
    { day: 'الإثنين', signal: 92, energy: 3500, uptime: 99.3 },
    { day: 'الثلاثاء', signal: 91, energy: 3420, uptime: 99.4 },
    { day: 'الأربعاء', signal: 93, energy: 3280, uptime: 99.7 },
    { day: 'الخميس', signal: 95, energy: 3150, uptime: 99.8 },
    { day: 'الجمعة', signal: 96, energy: 2900, uptime: 99.9 },
  ],
  monthly: [
    { week: 'الأسبوع 1', signal: 93.2, energy: 22500, uptime: 99.5 },
    { week: 'الأسبوع 2', signal: 92.8, energy: 23200, uptime: 99.4 },
    { week: 'الأسبوع 3', signal: 94.1, energy: 21800, uptime: 99.7 },
    { week: 'الأسبوع 4', signal: 94.5, energy: 22100, uptime: 99.6 },
  ]
};

// بيانات أداء المركبات
const vehiclePerformance = {
  daily: [
    { time: '00:00', distance: 0, fuel: 0, trips: 0 },
    { time: '04:00', distance: 25, fuel: 8, trips: 2 },
    { time: '08:00', distance: 120, fuel: 35, trips: 8 },
    { time: '12:00', distance: 85, fuel: 28, trips: 6 },
    { time: '16:00', distance: 150, fuel: 45, trips: 10 },
    { time: '20:00', distance: 60, fuel: 18, trips: 4 },
  ],
  weekly: [
    { day: 'السبت', distance: 450, fuel: 140, trips: 32 },
    { day: 'الأحد', distance: 520, fuel: 165, trips: 38 },
    { day: 'الإثنين', distance: 580, fuel: 180, trips: 42 },
    { day: 'الثلاثاء', distance: 540, fuel: 170, trips: 40 },
    { day: 'الأربعاء', distance: 510, fuel: 160, trips: 36 },
    { day: 'الخميس', distance: 480, fuel: 150, trips: 34 },
    { day: 'الجمعة', distance: 320, fuel: 100, trips: 22 },
  ],
  monthly: [
    { week: 'الأسبوع 1', distance: 3200, fuel: 1020, trips: 245 },
    { week: 'الأسبوع 2', distance: 3450, fuel: 1100, trips: 268 },
    { week: 'الأسبوع 3', distance: 3100, fuel: 980, trips: 232 },
    { week: 'الأسبوع 4', distance: 3350, fuel: 1050, trips: 255 },
  ]
};

const COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'];

export default function AssetPerformanceReports() {
  const [assetType, setAssetType] = useState('cameras');
  const [period, setPeriod] = useState('daily');

  const getAssetData = () => {
    switch (assetType) {
      case 'cameras': return cameraPerformance[period];
      case 'towers': return towerPerformance[period];
      case 'vehicles': return vehiclePerformance[period];
      default: return [];
    }
  };

  const getXKey = () => {
    if (period === 'daily') return 'time';
    if (period === 'weekly') return 'day';
    return 'week';
  };

  const getStats = () => {
    const data = getAssetData();
    if (assetType === 'cameras') {
      return {
        avgUptime: (data.reduce((s, d) => s + d.uptime, 0) / data.length).toFixed(1),
        totalDetections: data.reduce((s, d) => s + d.detections, 0),
        totalAlerts: data.reduce((s, d) => s + d.alerts, 0)
      };
    } else if (assetType === 'towers') {
      return {
        avgSignal: (data.reduce((s, d) => s + d.signal, 0) / data.length).toFixed(1),
        totalEnergy: data.reduce((s, d) => s + d.energy, 0),
        avgUptime: (data.reduce((s, d) => s + d.uptime, 0) / data.length).toFixed(2)
      };
    } else {
      return {
        totalDistance: data.reduce((s, d) => s + d.distance, 0),
        totalFuel: data.reduce((s, d) => s + d.fuel, 0),
        totalTrips: data.reduce((s, d) => s + d.trips, 0)
      };
    }
  };

  const stats = getStats();
  const chartData = getAssetData();

  return (
    <div className="space-y-4" dir="rtl">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={assetType} onValueChange={setAssetType}>
          <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="cameras"><Camera className="w-4 h-4 inline ml-2" />الكاميرات</SelectItem>
            <SelectItem value="towers"><Radio className="w-4 h-4 inline ml-2" />الأبراج</SelectItem>
            <SelectItem value="vehicles"><Car className="w-4 h-4 inline ml-2" />المركبات</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
          {['daily', 'weekly', 'monthly'].map(p => (
            <Button key={p} size="sm" variant={period === p ? 'default' : 'ghost'}
              className={period === p ? 'bg-cyan-600' : ''} onClick={() => setPeriod(p)}>
              {p === 'daily' ? 'يومي' : p === 'weekly' ? 'أسبوعي' : 'شهري'}
            </Button>
          ))}
        </div>

        <Button variant="outline" className="border-slate-600 mr-auto">
          <Download className="w-4 h-4 ml-2" />
          تصدير PDF
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {assetType === 'cameras' && (
          <>
            <Card className="glass-card border-green-500/30 bg-green-500/5">
              <CardContent className="p-4 text-center">
                <Activity className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.avgUptime}%</p>
                <p className="text-xs text-slate-400">متوسط وقت التشغيل</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-purple-500/30 bg-purple-500/5">
              <CardContent className="p-4 text-center">
                <Camera className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.totalDetections.toLocaleString()}</p>
                <p className="text-xs text-slate-400">إجمالي الكشوفات</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.totalAlerts}</p>
                <p className="text-xs text-slate-400">إجمالي التنبيهات</p>
              </CardContent>
            </Card>
          </>
        )}
        {assetType === 'towers' && (
          <>
            <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
              <CardContent className="p-4 text-center">
                <Signal className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.avgSignal}%</p>
                <p className="text-xs text-slate-400">متوسط قوة الإشارة</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4 text-center">
                <Zap className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.totalEnergy.toLocaleString()}</p>
                <p className="text-xs text-slate-400">إجمالي الطاقة (kWh)</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-green-500/30 bg-green-500/5">
              <CardContent className="p-4 text-center">
                <Activity className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.avgUptime}%</p>
                <p className="text-xs text-slate-400">متوسط التشغيل</p>
              </CardContent>
            </Card>
          </>
        )}
        {assetType === 'vehicles' && (
          <>
            <Card className="glass-card border-blue-500/30 bg-blue-500/5">
              <CardContent className="p-4 text-center">
                <Car className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.totalDistance.toLocaleString()}</p>
                <p className="text-xs text-slate-400">المسافة (كم)</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4 text-center">
                <Zap className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.totalFuel.toLocaleString()}</p>
                <p className="text-xs text-slate-400">الوقود (لتر)</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-green-500/30 bg-green-500/5">
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.totalTrips}</p>
                <p className="text-xs text-slate-400">عدد الرحلات</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader>
            <CardTitle className="text-white text-sm">
              {assetType === 'cameras' ? 'وقت التشغيل والكشوفات' : 
               assetType === 'towers' ? 'قوة الإشارة والطاقة' : 'المسافة والوقود'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey={getXKey()} stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  {assetType === 'cameras' && (
                    <>
                      <Area type="monotone" dataKey="uptime" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} name="التشغيل %" />
                      <Area type="monotone" dataKey="detections" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} name="الكشوفات" />
                    </>
                  )}
                  {assetType === 'towers' && (
                    <>
                      <Area type="monotone" dataKey="signal" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} name="الإشارة %" />
                      <Area type="monotone" dataKey="energy" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} name="الطاقة" />
                    </>
                  )}
                  {assetType === 'vehicles' && (
                    <>
                      <Area type="monotone" dataKey="distance" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="المسافة كم" />
                      <Area type="monotone" dataKey="fuel" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} name="الوقود لتر" />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader>
            <CardTitle className="text-white text-sm">مقارنة الأداء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey={getXKey()} stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  {assetType === 'cameras' && <Bar dataKey="alerts" fill="#ef4444" name="التنبيهات" radius={[4, 4, 0, 0]} />}
                  {assetType === 'towers' && <Bar dataKey="uptime" fill="#22c55e" name="التشغيل %" radius={[4, 4, 0, 0]} />}
                  {assetType === 'vehicles' && <Bar dataKey="trips" fill="#22d3ee" name="الرحلات" radius={[4, 4, 0, 0]} />}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}