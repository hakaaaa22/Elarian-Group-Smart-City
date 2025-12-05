import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Car, Camera, MapPin, Zap, ParkingSquare, Bus, Bike, AlertTriangle,
  TrendingUp, Clock, Eye, RefreshCw, Navigation
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const trafficZones = [
  { id: 1, name: 'طريق الملك فهد', congestion: 85, speed: 25, incidents: 2 },
  { id: 2, name: 'طريق الملك عبدالله', congestion: 45, speed: 55, incidents: 0 },
  { id: 3, name: 'الدائري الشرقي', congestion: 70, speed: 35, incidents: 1 },
  { id: 4, name: 'طريق العليا', congestion: 60, speed: 40, incidents: 0 },
];

const parkingAreas = [
  { name: 'موقف المركز', total: 500, available: 125, evChargers: 20 },
  { name: 'موقف السوق', total: 300, available: 45, evChargers: 10 },
  { name: 'موقف الحديقة', total: 200, available: 180, evChargers: 5 },
];

export default function SmartTrafficMobility() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <Car className="w-8 h-8 text-amber-400" />
          المرور والتنقل الذكي
        </h1>
        <p className="text-slate-400 mt-1">إدارة حركة المرور والمواقف والتنقل</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <Car className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">485K</p>
            <p className="text-amber-400 text-xs">مركبة نشطة</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <ParkingSquare className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">350</p>
            <p className="text-green-400 text-xs">موقف متاح</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <Zap className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">35</p>
            <p className="text-cyan-400 text-xs">شاحن EV</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">3</p>
            <p className="text-red-400 text-xs">حوادث</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="parking">المواقف</TabsTrigger>
          <TabsTrigger value="transit">النقل العام</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Traffic Zones */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">حالة الطرق الرئيسية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trafficZones.map(zone => (
                  <div key={zone.id} className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{zone.name}</span>
                      <div className="flex items-center gap-2">
                        {zone.incidents > 0 && <Badge className="bg-red-500/20 text-red-400">{zone.incidents} حادث</Badge>}
                        <Badge className={zone.congestion > 70 ? 'bg-red-500/20 text-red-400' : zone.congestion > 40 ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}>
                          {zone.speed} كم/س
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={zone.congestion} className="h-2 flex-1" />
                      <span className="text-slate-400 text-xs">{zone.congestion}% ازدحام</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Cameras */}
            <Card className="glass-card border-cyan-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  كاميرات AI المرورية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {['LPR/ANPR', 'كشف السرعة', 'تحليل الازدحام', 'كشف الحوادث'].map((cam, i) => (
                    <div key={i} className="p-3 bg-slate-800/50 rounded-lg text-center">
                      <Camera className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                      <p className="text-white text-sm">{cam}</p>
                      <Badge className="bg-green-500/20 text-green-400 mt-1">نشط</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="parking" className="mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            {parkingAreas.map((area, i) => (
              <Card key={i} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">{area.name}</span>
                    <ParkingSquare className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="text-center mb-3">
                    <p className="text-3xl font-bold text-green-400">{area.available}</p>
                    <p className="text-slate-400 text-sm">من {area.total} متاح</p>
                  </div>
                  <Progress value={(area.available / area.total) * 100} className="h-2 mb-2" />
                  <div className="flex items-center justify-center gap-1 text-cyan-400 text-xs">
                    <Zap className="w-3 h-3" />
                    {area.evChargers} شاحن كهربائي
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transit" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass-card border-green-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Bus className="w-4 h-4 text-green-400" />
                  الحافلات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { route: 'خط 1 - المركز', status: 'في الموعد', next: '5 دقائق' },
                  { route: 'خط 2 - الجامعة', status: 'متأخر 3 د', next: '8 دقائق' },
                ].map((bus, i) => (
                  <div key={i} className="p-3 bg-slate-800/50 rounded-lg flex items-center justify-between">
                    <span className="text-white">{bus.route}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={bus.status.includes('متأخر') ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}>{bus.status}</Badge>
                      <span className="text-slate-400 text-sm">{bus.next}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card border-purple-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Bike className="w-4 h-4 text-purple-400" />
                  التنقل الصغير
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-400">145</p>
                    <p className="text-slate-400 text-xs">سكوتر متاح</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-cyan-400">89</p>
                    <p className="text-slate-400 text-xs">دراجة متاحة</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}