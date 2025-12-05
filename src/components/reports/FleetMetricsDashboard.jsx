import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Truck, Fuel, Wrench, User, Route, TrendingUp, TrendingDown,
  Clock, Award, AlertTriangle, Calendar, MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'];

const fuelConsumptionData = [
  { route: 'المسار A', consumption: 45, distance: 12.5, efficiency: 3.6 },
  { route: 'المسار B', consumption: 62, distance: 18.2, efficiency: 3.4 },
  { route: 'المسار C', consumption: 28, distance: 8.7, efficiency: 3.2 },
  { route: 'المسار D', consumption: 55, distance: 15.3, efficiency: 3.6 },
  { route: 'المسار E', consumption: 38, distance: 11.0, efficiency: 3.5 },
];

const maintenanceHistory = [
  { month: 'يناير', preventive: 12, corrective: 4, emergency: 1 },
  { month: 'فبراير', preventive: 15, corrective: 3, emergency: 2 },
  { month: 'مارس', preventive: 10, corrective: 5, emergency: 0 },
  { month: 'أبريل', preventive: 18, corrective: 2, emergency: 1 },
  { month: 'مايو', preventive: 14, corrective: 4, emergency: 0 },
  { month: 'يونيو', preventive: 16, corrective: 3, emergency: 1 },
];

const driverPerformance = [
  { name: 'محمد أحمد', score: 95, trips: 145, fuelEfficiency: 3.8, violations: 0, rating: 4.9 },
  { name: 'خالد سعيد', score: 88, trips: 132, fuelEfficiency: 3.5, violations: 2, rating: 4.5 },
  { name: 'عبدالله فهد', score: 92, trips: 128, fuelEfficiency: 3.7, violations: 1, rating: 4.7 },
  { name: 'فيصل عمر', score: 85, trips: 120, fuelEfficiency: 3.3, violations: 3, rating: 4.2 },
  { name: 'سعود العتيبي', score: 90, trips: 138, fuelEfficiency: 3.6, violations: 1, rating: 4.6 },
];

const fleetStats = {
  totalVehicles: 25,
  activeVehicles: 22,
  inMaintenance: 2,
  outOfService: 1,
  avgFuelEfficiency: 3.52,
  totalDistance: 15420,
  avgDriverScore: 90,
};

export default function FleetMetricsDashboard() {
  const [selectedDriver, setSelectedDriver] = useState(null);

  const { data: vehicles = [] } = useQuery({
    queryKey: ['fleetVehicles'],
    queryFn: () => base44.entities.FleetVehicle?.list('-created_date', 50) || []
  });

  const { data: maintenanceRecords = [] } = useQuery({
    queryKey: ['maintenanceRecords'],
    queryFn: () => base44.entities.MaintenanceRecord?.list('-created_date', 100) || []
  });

  return (
    <div className="space-y-4" dir="rtl">
      <h3 className="text-white font-bold flex items-center gap-2">
        <Truck className="w-5 h-5 text-cyan-400" />
        مقاييس إدارة الأسطول
      </h3>

      {/* Fleet Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <Truck className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{fleetStats.totalVehicles}</p>
            <p className="text-cyan-400 text-[10px]">إجمالي المركبات</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <Truck className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{fleetStats.activeVehicles}</p>
            <p className="text-green-400 text-[10px]">نشطة</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <Wrench className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{fleetStats.inMaintenance}</p>
            <p className="text-amber-400 text-[10px]">في الصيانة</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{fleetStats.outOfService}</p>
            <p className="text-red-400 text-[10px]">خارج الخدمة</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <Fuel className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{fleetStats.avgFuelEfficiency}</p>
            <p className="text-purple-400 text-[10px]">كم/لتر</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <MapPin className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{(fleetStats.totalDistance / 1000).toFixed(1)}k</p>
            <p className="text-blue-400 text-[10px]">كم إجمالي</p>
          </CardContent>
        </Card>
        <Card className="bg-pink-500/10 border-pink-500/30">
          <CardContent className="p-3 text-center">
            <Award className="w-5 h-5 text-pink-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{fleetStats.avgDriverScore}</p>
            <p className="text-pink-400 text-[10px]">متوسط تقييم</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="fuel" className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="fuel" className="data-[state=active]:bg-purple-500/20">
            <Fuel className="w-4 h-4 ml-1" />
            الوقود
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="data-[state=active]:bg-amber-500/20">
            <Wrench className="w-4 h-4 ml-1" />
            الصيانة
          </TabsTrigger>
          <TabsTrigger value="drivers" className="data-[state=active]:bg-green-500/20">
            <User className="w-4 h-4 ml-1" />
            السائقين
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fuel" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">استهلاك الوقود حسب المسار</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fuelConsumptionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="route" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Bar dataKey="consumption" fill="#a855f7" name="استهلاك (لتر)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">كفاءة الوقود</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {fuelConsumptionData.map((route, i) => (
                      <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{route.route}</span>
                          <Badge className={route.efficiency >= 3.5 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                            {route.efficiency} كم/لتر
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>{route.distance} كم</span>
                          <span>{route.consumption} لتر</span>
                        </div>
                        <Progress value={(route.efficiency / 4) * 100} className="h-1.5 mt-2" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">سجل الصيانة الشهري</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={maintenanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="preventive" fill="#22c55e" name="وقائية" stackId="a" />
                    <Bar dataKey="corrective" fill="#f59e0b" name="تصحيحية" stackId="a" />
                    <Bar dataKey="emergency" fill="#ef4444" name="طارئة" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">أداء السائقين</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-72">
                <div className="space-y-3">
                  {driverPerformance.map((driver, i) => (
                    <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-medium">{driver.name[0]}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{driver.name}</p>
                            <p className="text-slate-400 text-xs">{driver.trips} رحلة</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <Badge className={driver.score >= 90 ? 'bg-green-500/20 text-green-400' : driver.score >= 80 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}>
                            {driver.score} نقطة
                          </Badge>
                          <div className="flex items-center gap-1 mt-1">
                            <Award className="w-3 h-3 text-amber-400" />
                            <span className="text-amber-400 text-xs">{driver.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-1 bg-slate-900/50 rounded">
                          <p className="text-slate-400">الكفاءة</p>
                          <p className="text-cyan-400">{driver.fuelEfficiency} كم/لتر</p>
                        </div>
                        <div className="text-center p-1 bg-slate-900/50 rounded">
                          <p className="text-slate-400">المخالفات</p>
                          <p className={driver.violations === 0 ? 'text-green-400' : 'text-red-400'}>{driver.violations}</p>
                        </div>
                        <div className="text-center p-1 bg-slate-900/50 rounded">
                          <p className="text-slate-400">الرحلات</p>
                          <p className="text-white">{driver.trips}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}