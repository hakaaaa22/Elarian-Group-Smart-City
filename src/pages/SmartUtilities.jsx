import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Droplets, Zap, Flame, Thermometer, AlertTriangle, TrendingUp,
  TrendingDown, Activity, Gauge
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const consumptionData = [
  { hour: '00', water: 120, electricity: 850, gas: 45 },
  { hour: '04', water: 80, electricity: 650, gas: 30 },
  { hour: '08', water: 250, electricity: 1200, gas: 85 },
  { hour: '12', water: 320, electricity: 1450, gas: 95 },
  { hour: '16', water: 280, electricity: 1350, gas: 75 },
  { hour: '20', water: 200, electricity: 1100, gas: 60 },
];

const alerts = [
  { type: 'water', message: 'تسرب محتمل - منطقة الصناعية', severity: 'high' },
  { type: 'electricity', message: 'حمل عالي - المنطقة السكنية B', severity: 'medium' },
];

export default function SmartUtilities() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <Droplets className="w-8 h-8 text-blue-400" />
          المرافق الذكية
        </h1>
        <p className="text-slate-400 mt-1">إدارة المياه والكهرباء والغاز والتبريد</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <Droplets className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">2.4M</p>
            <p className="text-blue-400 text-xs">م³ مياه/يوم</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <Zap className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">1.2GW</p>
            <p className="text-amber-400 text-xs">استهلاك الكهرباء</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <Flame className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">850K</p>
            <p className="text-red-400 text-xs">م³ غاز/يوم</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <Thermometer className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">45K</p>
            <p className="text-cyan-400 text-xs">TR تبريد</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="bg-amber-500/10 border-amber-500/30 mb-6">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              {alerts.map((alert, i) => (
                <Badge key={i} className={alert.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}>
                  {alert.message}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="water">المياه</TabsTrigger>
          <TabsTrigger value="electricity">الكهرباء</TabsTrigger>
          <TabsTrigger value="gas">الغاز</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">استهلاك الموارد خلال اليوم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={consumptionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="water" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="المياه" />
                    <Area type="monotone" dataKey="electricity" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} name="الكهرباء" />
                    <Area type="monotone" dataKey="gas" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="الغاز" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="water" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass-card border-blue-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">حالة الشبكة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'ضغط الشبكة', value: 4.2, unit: 'بار', status: 'normal' },
                  { label: 'جودة المياه', value: 98, unit: '%', status: 'good' },
                  { label: 'مستوى الخزانات', value: 78, unit: '%', status: 'normal' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                    <span className="text-slate-400">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{item.value} {item.unit}</span>
                      <Badge className="bg-green-500/20 text-green-400">{item.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card border-red-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">كشف التسرب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Gauge className="w-12 h-12 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">0.2%</p>
                  <p className="text-slate-400 text-sm">نسبة الفاقد</p>
                  <Badge className="bg-green-500/20 text-green-400 mt-2">ضمن المعدل الطبيعي</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}