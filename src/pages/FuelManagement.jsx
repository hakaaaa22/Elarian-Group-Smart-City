import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Fuel, Plus, TrendingUp, TrendingDown, AlertTriangle, BarChart3,
  DollarSign, Activity, Calendar, Download, Filter, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'sonner';

const fuelData = [
  { month: 'يناير', consumption: 4500, cost: 9000, efficiency: 8.5 },
  { month: 'فبراير', consumption: 4200, cost: 8400, efficiency: 8.7 },
  { month: 'مارس', consumption: 5800, cost: 11600, efficiency: 7.2 },
  { month: 'أبريل', consumption: 4100, cost: 8200, efficiency: 8.9 },
  { month: 'مايو', consumption: 4600, cost: 9200, efficiency: 8.4 },
  { month: 'يونيو', consumption: 4800, cost: 9600, efficiency: 8.3 },
];

export default function FuelManagement() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: fuelLogs = [] } = useQuery({
    queryKey: ['fuelLogs'],
    queryFn: () => base44.entities.FuelLog.list('-date', 100),
    initialData: []
  });

  const stats = {
    totalConsumption: fuelData.reduce((s, d) => s + d.consumption, 0),
    totalCost: fuelData.reduce((s, d) => s + d.cost, 0),
    avgEfficiency: (fuelData.reduce((s, d) => s + d.efficiency, 0) / fuelData.length).toFixed(1),
    suspiciousTransactions: 2,
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Fuel className="w-8 h-8 text-amber-400" />
              إدارة الوقود الذكية
            </h1>
            <p className="text-slate-400 mt-1">تتبع وتحليل استهلاك الوقود</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <Fuel className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.totalConsumption.toLocaleString()}</p>
            <p className="text-amber-400 text-xs">لتر</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <DollarSign className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.totalCost.toLocaleString()}</p>
            <p className="text-red-400 text-xs">ر.س</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.avgEfficiency}</p>
            <p className="text-green-400 text-xs">كم/لتر</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.suspiciousTransactions}</p>
            <p className="text-purple-400 text-xs">معاملات مشبوهة</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="consumption">الاستهلاك</TabsTrigger>
          <TabsTrigger value="efficiency">الكفاءة</TabsTrigger>
          <TabsTrigger value="anomalies">الشذوذ</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">استهلاك الوقود الشهري</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={fuelData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="consumption" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="الاستهلاك (لتر)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">كفاءة الوقود</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={fuelData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="efficiency" stroke="#22c55e" strokeWidth={2} name="كم/لتر" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}