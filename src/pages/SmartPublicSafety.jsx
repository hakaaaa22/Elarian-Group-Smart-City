import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Camera, AlertTriangle, Plane, Users, MapPin, Activity, Eye,
  Radio, Bell, Zap, Target, Volume2, CloudRain, Waves
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const incidents = [
  { id: 1, type: 'سلوك مشبوه', location: 'حديقة المدينة', time: '5 دقائق', severity: 'medium', camera: 'CAM-045' },
  { id: 2, type: 'تجمع كبير', location: 'ساحة المركز', time: '12 دقيقة', severity: 'low', camera: 'CAM-012' },
  { id: 3, type: 'كشف سلاح', location: 'محطة القطار', time: '2 دقيقة', severity: 'critical', camera: 'CAM-078' },
];

const aiCameras = [
  { id: 'CAM-001', name: 'مدخل المدينة الشمالي', status: 'online', detections: 45, alerts: 2 },
  { id: 'CAM-002', name: 'ساحة المركز', status: 'online', detections: 123, alerts: 5 },
  { id: 'CAM-003', name: 'محطة الحافلات', status: 'online', detections: 67, alerts: 1 },
  { id: 'CAM-004', name: 'المنطقة الصناعية', status: 'maintenance', detections: 0, alerts: 0 },
];

const drones = [
  { id: 'DRN-01', name: 'درون الدورية 1', status: 'flying', battery: 78, area: 'المنطقة A' },
  { id: 'DRN-02', name: 'درون الدورية 2', status: 'charging', battery: 45, area: '-' },
  { id: 'DRN-03', name: 'درون الطوارئ', status: 'standby', battery: 100, area: '-' },
];

const crowdZones = [
  { zone: 'المركز التجاري', density: 85, capacity: 5000, current: 4250, trend: 'increasing' },
  { zone: 'الحديقة المركزية', density: 45, capacity: 3000, current: 1350, trend: 'stable' },
  { zone: 'ساحة الاحتفالات', density: 92, capacity: 10000, current: 9200, trend: 'critical' },
];

export default function SmartPublicSafety() {
  const [activeTab, setActiveTab] = useState('overview');
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-400" />
              السلامة العامة الذكية
            </h1>
            <p className="text-slate-400 mt-1">مراقبة أمنية شاملة بالذكاء الاصطناعي</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm">{liveTime.toLocaleTimeString('ar-SA')}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <Camera className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">1,245</p>
            <p className="text-cyan-400 text-xs">كاميرا AI</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <Plane className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">12</p>
            <p className="text-purple-400 text-xs">درون دورية</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">3</p>
            <p className="text-red-400 text-xs">حوادث نشطة</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <Radio className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">45</p>
            <p className="text-green-400 text-xs">برج SOS</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Incidents Banner */}
      {incidents.filter(i => i.severity === 'critical').length > 0 && (
        <Card className="bg-red-500/10 border-red-500/50 mb-6 animate-pulse">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">تنبيه حرج:</span>
              {incidents.filter(i => i.severity === 'critical').map(inc => (
                <Badge key={inc.id} className="bg-red-500/20 text-red-400">{inc.type} - {inc.location}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="cameras">كاميرات AI</TabsTrigger>
          <TabsTrigger value="drones">الدرونز</TabsTrigger>
          <TabsTrigger value="crowd">تحليل الحشود</TabsTrigger>
          <TabsTrigger value="disasters">الكوارث</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Live Incidents */}
            <Card className="glass-card border-red-500/30 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  الحوادث المباشرة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {incidents.map(inc => (
                  <div key={inc.id} className={`p-3 rounded-lg border ${inc.severity === 'critical' ? 'bg-red-500/10 border-red-500/50' : inc.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{inc.type}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                          <MapPin className="w-3 h-3" />{inc.location}
                          <Camera className="w-3 h-3 mr-2" />{inc.camera}
                        </div>
                      </div>
                      <div className="text-left">
                        <Badge className={`${inc.severity === 'critical' ? 'bg-red-500/20 text-red-400' : inc.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-600 text-slate-300'}`}>
                          {inc.severity === 'critical' ? 'حرج' : inc.severity === 'medium' ? 'متوسط' : 'منخفض'}
                        </Badge>
                        <p className="text-slate-500 text-xs mt-1">{inc.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Detection Types */}
            <Card className="glass-card border-cyan-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  أنواع الكشف AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'كشف الأسلحة', icon: Target, color: 'red', count: 2 },
                    { name: 'سلوك عدواني', icon: Users, color: 'amber', count: 8 },
                    { name: 'اقتحام', icon: Shield, color: 'purple', count: 3 },
                    { name: 'تجمع غير طبيعي', icon: Users, color: 'cyan', count: 15 },
                    { name: 'سقوط شخص', icon: Activity, color: 'green', count: 1 },
                    { name: 'حريق/دخان', icon: AlertTriangle, color: 'orange', count: 0 },
                  ].map((type, i) => (
                    <div key={i} className={`p-3 bg-${type.color}-500/10 border border-${type.color}-500/30 rounded-lg`}>
                      <div className="flex items-center justify-between">
                        <type.icon className={`w-4 h-4 text-${type.color}-400`} />
                        <span className={`text-${type.color}-400 font-bold`}>{type.count}</span>
                      </div>
                      <p className="text-slate-300 text-xs mt-1">{type.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Cameras Tab */}
        <TabsContent value="cameras" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {aiCameras.map(cam => (
              <Card key={cam.id} className={`glass-card border-${cam.status === 'online' ? 'green' : 'amber'}-500/30 bg-[#0f1629]/80`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Camera className={`w-5 h-5 text-${cam.status === 'online' ? 'green' : 'amber'}-400`} />
                      <span className="text-white font-medium">{cam.id}</span>
                    </div>
                    <Badge className={cam.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                      {cam.status === 'online' ? 'متصل' : 'صيانة'}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-sm mb-3">{cam.name}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">كشف اليوم: <span className="text-cyan-400">{cam.detections}</span></span>
                    <span className="text-slate-500">تنبيهات: <span className="text-red-400">{cam.alerts}</span></span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Drones Tab */}
        <TabsContent value="drones" className="mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            {drones.map(drone => (
              <Card key={drone.id} className={`glass-card border-${drone.status === 'flying' ? 'green' : drone.status === 'charging' ? 'amber' : 'slate'}-500/30 bg-[#0f1629]/80`}>
                <CardContent className="p-4 text-center">
                  <Plane className={`w-8 h-8 mx-auto mb-2 text-${drone.status === 'flying' ? 'green' : drone.status === 'charging' ? 'amber' : 'slate'}-400 ${drone.status === 'flying' ? 'animate-bounce' : ''}`} />
                  <p className="text-white font-medium">{drone.name}</p>
                  <Badge className={`mt-2 ${drone.status === 'flying' ? 'bg-green-500/20 text-green-400' : drone.status === 'charging' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-600 text-slate-300'}`}>
                    {drone.status === 'flying' ? 'في الجو' : drone.status === 'charging' ? 'شحن' : 'جاهز'}
                  </Badge>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">البطارية</span>
                      <span className="text-cyan-400">{drone.battery}%</span>
                    </div>
                    <Progress value={drone.battery} className="h-2" />
                  </div>
                  {drone.area !== '-' && <p className="text-slate-400 text-xs mt-2">المنطقة: {drone.area}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Crowd Analysis Tab */}
        <TabsContent value="crowd" className="mt-4">
          <div className="space-y-3">
            {crowdZones.map((zone, i) => (
              <Card key={i} className={`glass-card border-${zone.density > 90 ? 'red' : zone.density > 70 ? 'amber' : 'green'}-500/30 bg-[#0f1629]/80`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className={`w-5 h-5 text-${zone.density > 90 ? 'red' : zone.density > 70 ? 'amber' : 'green'}-400`} />
                      <span className="text-white font-medium">{zone.zone}</span>
                    </div>
                    <Badge className={zone.trend === 'critical' ? 'bg-red-500/20 text-red-400' : zone.trend === 'increasing' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}>
                      {zone.trend === 'critical' ? 'حرج' : zone.trend === 'increasing' ? 'متزايد' : 'مستقر'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">{zone.current.toLocaleString()} / {zone.capacity.toLocaleString()}</span>
                    <span className={`font-bold text-${zone.density > 90 ? 'red' : zone.density > 70 ? 'amber' : 'green'}-400`}>{zone.density}%</span>
                  </div>
                  <Progress value={zone.density} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Disasters Tab */}
        <TabsContent value="disasters" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass-card border-blue-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Waves className="w-4 h-4 text-blue-400" />
                  مراقبة الفيضانات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-3xl font-bold text-green-400">منخفض</p>
                  <p className="text-slate-400 text-sm mt-1">خطر الفيضان</p>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="p-2 bg-slate-800/50 rounded">
                      <p className="text-cyan-400 font-bold">45%</p>
                      <p className="text-slate-500 text-xs">رطوبة التربة</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded">
                      <p className="text-blue-400 font-bold">2.1m</p>
                      <p className="text-slate-500 text-xs">منسوب المياه</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded">
                      <p className="text-green-400 font-bold">0mm</p>
                      <p className="text-slate-500 text-xs">أمطار متوقعة</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-amber-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  مراقبة الزلازل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-3xl font-bold text-green-400">0.2</p>
                  <p className="text-slate-400 text-sm mt-1">ريختر - نشاط طبيعي</p>
                  <Badge className="bg-green-500/20 text-green-400 mt-2">لا يوجد تحذير</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}