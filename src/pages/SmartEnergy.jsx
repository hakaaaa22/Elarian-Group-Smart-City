import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sun, Wind, Zap, Battery, Activity, TrendingUp, TrendingDown,
  Gauge, BarChart3, AlertTriangle, DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const energyData = [
  { time: '00:00', solar: 0, wind: 120, grid: 450, consumption: 500 },
  { time: '04:00', solar: 0, wind: 150, grid: 400, consumption: 450 },
  { time: '08:00', solar: 280, wind: 100, grid: 350, consumption: 680 },
  { time: '12:00', solar: 520, wind: 80, grid: 200, consumption: 750 },
  { time: '16:00', solar: 380, wind: 110, grid: 280, consumption: 720 },
  { time: '20:00', solar: 50, wind: 140, grid: 480, consumption: 620 },
];

const solarFarms = [
  { name: 'مزرعة الشمس الشمالية', capacity: 50, current: 42, efficiency: 84 },
  { name: 'مزرعة الشمس الجنوبية', capacity: 75, current: 68, efficiency: 91 },
  { name: 'مزرعة الشمس الشرقية', capacity: 30, current: 25, efficiency: 83 },
];

export default function SmartEnergy() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <Zap className="w-8 h-8 text-yellow-400" />
          شبكة الطاقة الذكية
        </h1>
        <p className="text-slate-400 mt-1">إدارة الطاقة المتجددة والشبكة الكهربائية</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-3 text-center">
            <Sun className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">135 MW</p>
            <p className="text-yellow-400 text-xs">طاقة شمسية</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <Wind className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">45 MW</p>
            <p className="text-cyan-400 text-xs">طاقة رياح</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <Battery className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">78%</p>
            <p className="text-green-400 text-xs">مخزون البطاريات</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <Activity className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">1.2 GW</p>
            <p className="text-purple-400 text-xs">الاستهلاك</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="solar">الطاقة الشمسية</TabsTrigger>
          <TabsTrigger value="storage">التخزين</TabsTrigger>
          <TabsTrigger value="tariff">التعرفة</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">توليد واستهلاك الطاقة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={energyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="solar" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.5} name="شمسية" />
                    <Area type="monotone" dataKey="wind" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.5} name="رياح" />
                    <Line type="monotone" dataKey="consumption" stroke="#ef4444" strokeWidth={2} name="استهلاك" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Solar Tab */}
        <TabsContent value="solar" className="mt-4">
          <div className="space-y-3">
            {solarFarms.map((farm, i) => (
              <Card key={i} className="glass-card border-yellow-500/30 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sun className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-medium">{farm.name}</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">{farm.efficiency}% كفاءة</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">الإنتاج الحالي</span>
                        <span className="text-yellow-400">{farm.current} MW / {farm.capacity} MW</span>
                      </div>
                      <Progress value={(farm.current / farm.capacity) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Storage Tab */}
        <TabsContent value="storage" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass-card border-green-500/20 bg-[#0f1629]/80">
              <CardContent className="p-6 text-center">
                <Battery className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-4xl font-bold text-white">78%</p>
                <p className="text-slate-400">مخزون البطاريات</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-2 bg-slate-800/50 rounded">
                    <p className="text-cyan-400 font-bold">150 MWh</p>
                    <p className="text-slate-500 text-xs">السعة الكلية</p>
                  </div>
                  <div className="p-2 bg-slate-800/50 rounded">
                    <p className="text-green-400 font-bold">117 MWh</p>
                    <p className="text-slate-500 text-xs">المتاح</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-purple-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">الشبكات الصغيرة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['المنطقة السكنية A', 'المنطقة التجارية', 'المنطقة الصناعية'].map((zone, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                      <span className="text-slate-300">{zone}</span>
                      <Badge className="bg-green-500/20 text-green-400">متصل</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dynamic Tariff Tab */}
        <TabsContent value="tariff" className="mt-4">
          <Card className="glass-card border-amber-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                التعرفة الديناميكية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { period: 'خارج الذروة', time: '00:00 - 08:00', rate: 0.08, color: 'green' },
                  { period: 'عادي', time: '08:00 - 16:00', rate: 0.15, color: 'amber' },
                  { period: 'الذروة', time: '16:00 - 22:00', rate: 0.25, color: 'red' },
                ].map((tariff, i) => (
                  <div key={i} className={`p-4 bg-${tariff.color}-500/10 border border-${tariff.color}-500/30 rounded-lg text-center`}>
                    <p className={`text-${tariff.color}-400 font-bold`}>{tariff.period}</p>
                    <p className="text-slate-400 text-xs mt-1">{tariff.time}</p>
                    <p className="text-2xl font-bold text-white mt-2">{tariff.rate} ر.س</p>
                    <p className="text-slate-500 text-xs">لكل kWh</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}