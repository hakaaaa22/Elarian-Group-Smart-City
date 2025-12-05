import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Zap, Wifi, WifiOff, TrendingUp, TrendingDown, Clock,
  AlertTriangle, CheckCircle, BarChart3, Battery, Signal, Thermometer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// Mock performance data
const mockEnergyData = [
  { time: '00:00', energy: 120, cost: 0.6 },
  { time: '04:00', energy: 80, cost: 0.4 },
  { time: '08:00', energy: 250, cost: 1.25 },
  { time: '12:00', energy: 320, cost: 1.6 },
  { time: '16:00', energy: 280, cost: 1.4 },
  { time: '20:00', energy: 400, cost: 2.0 },
  { time: '23:59', energy: 180, cost: 0.9 },
];

const mockConnectionData = [
  { day: 'السبت', uptime: 99.8, disconnects: 1 },
  { day: 'الأحد', uptime: 100, disconnects: 0 },
  { day: 'الإثنين', uptime: 98.5, disconnects: 3 },
  { day: 'الثلاثاء', uptime: 99.9, disconnects: 1 },
  { day: 'الأربعاء', uptime: 100, disconnects: 0 },
  { day: 'الخميس', uptime: 99.2, disconnects: 2 },
  { day: 'الجمعة', uptime: 100, disconnects: 0 },
];

export default function DevicePerformance({ devices }) {
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [timeRange, setTimeRange] = useState('day');

  // Calculate stats
  const totalPower = devices.reduce((sum, d) => sum + (d.state.power || 0), 0);
  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const avgUptime = 99.5;
  const todayEnergy = 8.2;
  const yesterdayEnergy = 7.8;
  const energyChange = ((todayEnergy - yesterdayEnergy) / yesterdayEnergy * 100).toFixed(1);

  // Device performance metrics
  const deviceMetrics = devices.map(device => ({
    ...device,
    uptime: Math.random() * 5 + 95, // 95-100%
    signalStrength: Math.floor(Math.random() * 30) + 70, // 70-100
    responseTime: Math.floor(Math.random() * 100) + 50, // 50-150ms
    dailyEnergy: device.state.power ? (device.state.power * 8 / 1000).toFixed(2) : 0,
  }));

  return (
    <div className="space-y-6" dir="rtl">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'الاستهلاك الحالي', value: `${totalPower}W`, icon: Zap, color: 'amber', change: null },
          { label: 'استهلاك اليوم', value: `${todayEnergy} kWh`, icon: BarChart3, color: 'cyan', change: energyChange },
          { label: 'الأجهزة المتصلة', value: `${onlineDevices}/${devices.length}`, icon: Wifi, color: 'green', change: null },
          { label: 'متوسط وقت التشغيل', value: `${avgUptime}%`, icon: Activity, color: 'purple', change: null },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-xs">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    {stat.change && (
                      <div className={`flex items-center gap-1 mt-1 text-xs ${parseFloat(stat.change) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {parseFloat(stat.change) > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {stat.change}% من أمس
                      </div>
                    )}
                  </div>
                  <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Select value={selectedDevice} onValueChange={setSelectedDevice}>
              <SelectTrigger className="w-48 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="اختر جهاز" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">جميع الأجهزة</SelectItem>
                {devices.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-36 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="day">اليوم</SelectItem>
                <SelectItem value="week">هذا الأسبوع</SelectItem>
                <SelectItem value="month">هذا الشهر</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="energy" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="energy" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Zap className="w-4 h-4 ml-2" />
            استهلاك الطاقة
          </TabsTrigger>
          <TabsTrigger value="connection" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Wifi className="w-4 h-4 ml-2" />
            استقرار الاتصال
          </TabsTrigger>
          <TabsTrigger value="devices" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Activity className="w-4 h-4 ml-2" />
            أداء الأجهزة
          </TabsTrigger>
        </TabsList>

        {/* Energy Tab */}
        <TabsContent value="energy">
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">استهلاك الطاقة عبر الوقت</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={mockEnergyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="energy" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} name="واط" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">أكثر الأجهزة استهلاكاً</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {devices
                  .filter(d => d.state.power)
                  .sort((a, b) => (b.state.power || 0) - (a.state.power || 0))
                  .slice(0, 5)
                  .map((device, i) => (
                    <div key={device.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          i === 0 ? 'bg-amber-500 text-black' : 'bg-slate-700 text-white'
                        }`}>{i + 1}</span>
                        <span className="text-white text-sm">{device.name}</span>
                      </div>
                      <span className="text-amber-400 font-medium">{device.state.power}W</span>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Connection Tab */}
        <TabsContent value="connection">
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">نسبة وقت التشغيل الأسبوعية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={mockConnectionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} domain={[95, 100]} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} />
                    <Bar dataKey="uptime" fill="#22c55e" name="نسبة التشغيل %" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">حالة الأجهزة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {devices.slice(0, 6).map(device => (
                  <div key={device.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {device.status === 'online' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-white text-sm truncate max-w-[120px]">{device.name}</span>
                    </div>
                    <Badge className={device.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {device.status === 'online' ? 'متصل' : 'منقطع'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Devices Performance Tab */}
        <TabsContent value="devices">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deviceMetrics.map((device, i) => (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">{device.name}</h4>
                      <Badge className={device.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {device.status === 'online' ? 'متصل' : 'منقطع'}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Activity className="w-3 h-3" /> وقت التشغيل
                          </span>
                          <span className="text-white">{device.uptime.toFixed(1)}%</span>
                        </div>
                        <Progress value={device.uptime} className="h-1.5" />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Signal className="w-3 h-3" /> قوة الإشارة
                          </span>
                          <span className="text-white">{device.signalStrength}%</span>
                        </div>
                        <Progress value={device.signalStrength} className="h-1.5" />
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/50">
                        <div className="text-center p-2 bg-slate-800/50 rounded">
                          <p className="text-slate-400 text-xs">زمن الاستجابة</p>
                          <p className="text-cyan-400 font-medium">{device.responseTime}ms</p>
                        </div>
                        <div className="text-center p-2 bg-slate-800/50 rounded">
                          <p className="text-slate-400 text-xs">الاستهلاك اليومي</p>
                          <p className="text-amber-400 font-medium">{device.dailyEnergy} kWh</p>
                        </div>
                      </div>

                      {device.state.battery !== undefined && (
                        <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                          <span className="text-slate-400 text-xs flex items-center gap-1">
                            <Battery className="w-3 h-3" /> البطارية
                          </span>
                          <span className={`font-medium ${device.state.battery > 20 ? 'text-green-400' : 'text-red-400'}`}>
                            {device.state.battery}%
                          </span>
                        </div>
                      )}
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