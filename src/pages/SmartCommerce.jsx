import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Users, TrendingUp, CreditCard, MapPin, BarChart3,
  Store, Package, Truck, Warehouse, Zap, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const mallData = [
  { time: '10:00', visitors: 1200, sales: 45000 },
  { time: '12:00', visitors: 2800, sales: 125000 },
  { time: '14:00', visitors: 3500, sales: 180000 },
  { time: '16:00', visitors: 4200, sales: 220000 },
  { time: '18:00', visitors: 5100, sales: 310000 },
  { time: '20:00', visitors: 4800, sales: 285000 },
];

const hotZones = [
  { zone: 'منطقة الأزياء', footfall: 8500, conversion: 12, trend: 'up' },
  { zone: 'منطقة الطعام', footfall: 12000, conversion: 45, trend: 'up' },
  { zone: 'الإلكترونيات', footfall: 5200, conversion: 8, trend: 'stable' },
  { zone: 'المنزل والحديقة', footfall: 3100, conversion: 15, trend: 'down' },
];

export default function SmartCommerce() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-pink-400" />
          التجارة الذكية
        </h1>
        <p className="text-slate-400 mt-1">تحليلات المراكز التجارية والمبيعات</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="bg-pink-500/10 border-pink-500/30">
          <CardContent className="p-3 text-center">
            <Users className="w-5 h-5 text-pink-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">28,500</p>
            <p className="text-pink-400 text-xs">زائر اليوم</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <CreditCard className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">1.2M</p>
            <p className="text-green-400 text-xs">ر.س مبيعات</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <Store className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">450</p>
            <p className="text-cyan-400 text-xs">متجر نشط</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <TrendingUp className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">+18%</p>
            <p className="text-purple-400 text-xs">نمو المبيعات</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="heatmap">خريطة الحرارة</TabsTrigger>
          <TabsTrigger value="warehouse">المستودعات</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">الزوار والمبيعات خلال اليوم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mallData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="visitors" stroke="#ec4899" fill="#ec4899" fillOpacity={0.2} name="الزوار" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Heatmap Tab */}
        <TabsContent value="heatmap" className="mt-4">
          <div className="space-y-3">
            {hotZones.map((zone, i) => (
              <Card key={i} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{zone.zone}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                        <span><Users className="w-3 h-3 inline ml-1" />{zone.footfall.toLocaleString()} زائر</span>
                        <span><CreditCard className="w-3 h-3 inline ml-1" />{zone.conversion}% تحويل</span>
                      </div>
                    </div>
                    <Badge className={zone.trend === 'up' ? 'bg-green-500/20 text-green-400' : zone.trend === 'down' ? 'bg-red-500/20 text-red-400' : 'bg-slate-600 text-slate-300'}>
                      {zone.trend === 'up' ? '↑ صاعد' : zone.trend === 'down' ? '↓ هابط' : '→ مستقر'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Warehouse Tab */}
        <TabsContent value="warehouse" className="mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="glass-card border-cyan-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4 text-center">
                <Warehouse className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-slate-400 text-sm">مستودع ذكي</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-purple-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4 text-center">
                <Package className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">45K</p>
                <p className="text-slate-400 text-sm">منتج RFID</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-green-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4 text-center">
                <Truck className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">156</p>
                <p className="text-slate-400 text-sm">شحنة اليوم</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}