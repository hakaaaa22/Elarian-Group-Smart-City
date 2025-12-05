import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb, Droplets, Building, AlertTriangle, Wrench, MapPin, Clock,
  TrendingUp, Activity, Zap, ThermometerSun, Wind, Eye, Bell, Settings,
  CheckCircle, XCircle, Radio, Wifi, BarChart3, Calendar, Truck, Route
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';

// بيانات الإنارة
const streetLightsData = [
  { id: 'SL001', location: 'شارع الملك فهد - تقاطع 1', status: 'on', brightness: 100, health: 98, lastMaintenance: '2024-11-15', energyUsage: 150 },
  { id: 'SL002', location: 'حي الورود - شارع 5', status: 'on', brightness: 80, health: 95, lastMaintenance: '2024-11-20', energyUsage: 120 },
  { id: 'SL003', location: 'المنطقة الصناعية - بوابة A', status: 'fault', brightness: 0, health: 45, lastMaintenance: '2024-10-01', energyUsage: 0 },
  { id: 'SL004', location: 'المنتزه المركزي', status: 'dimmed', brightness: 50, health: 88, lastMaintenance: '2024-11-10', energyUsage: 75 },
  { id: 'SL005', location: 'شارع التحلية', status: 'on', brightness: 100, health: 100, lastMaintenance: '2024-12-01', energyUsage: 150 },
];

// بيانات المياه
const waterNetworkData = {
  zones: [
    { id: 'WZ01', name: 'المنطقة الشمالية', pressure: 4.2, flow: 1200, quality: 98, leaks: 0 },
    { id: 'WZ02', name: 'المنطقة الجنوبية', pressure: 3.8, flow: 980, quality: 96, leaks: 1 },
    { id: 'WZ03', name: 'المنطقة الصناعية', pressure: 5.1, flow: 2500, quality: 94, leaks: 0 },
    { id: 'WZ04', name: 'المنطقة السكنية', pressure: 4.0, flow: 1500, quality: 99, leaks: 2 },
  ],
  alerts: [
    { id: 1, zone: 'WZ02', type: 'leak', message: 'تسرب مياه محتمل - شارع 15', severity: 'high' },
    { id: 2, zone: 'WZ04', type: 'pressure', message: 'انخفاض ضغط المياه - حي الياسمين', severity: 'medium' },
  ]
};

// بيانات الطرق
const roadsData = {
  segments: [
    { id: 'RS01', name: 'طريق الملك عبدالعزيز', condition: 'good', lastInspection: '2024-11-28', issues: 0, traffic: 'moderate' },
    { id: 'RS02', name: 'شارع الأمير سلطان', condition: 'fair', lastInspection: '2024-11-15', issues: 2, traffic: 'heavy' },
    { id: 'RS03', name: 'طريق المطار', condition: 'excellent', lastInspection: '2024-12-01', issues: 0, traffic: 'light' },
    { id: 'RS04', name: 'شارع التخصصي', condition: 'needs_repair', lastInspection: '2024-10-20', issues: 5, traffic: 'moderate' },
  ],
  maintenanceQueue: [
    { road: 'شارع التخصصي', type: 'pothole_repair', priority: 'high', scheduledDate: '2024-12-05' },
    { road: 'شارع الأمير سلطان', type: 'resurfacing', priority: 'medium', scheduledDate: '2024-12-10' },
  ]
};

// بيانات الاستهلاك
const energyTrendData = [
  { time: '00:00', lighting: 80, water: 45, total: 125 },
  { time: '04:00', lighting: 90, water: 30, total: 120 },
  { time: '08:00', lighting: 20, water: 120, total: 140 },
  { time: '12:00', lighting: 0, water: 150, total: 150 },
  { time: '16:00', lighting: 10, water: 130, total: 140 },
  { time: '20:00', lighting: 100, water: 80, total: 180 },
];

export default function SmartMunicipalityModule() {
  const [activeTab, setActiveTab] = useState('lighting');
  const [lights, setLights] = useState(streetLightsData);

  const lightingStats = {
    total: lights.length,
    active: lights.filter(l => l.status === 'on').length,
    faults: lights.filter(l => l.status === 'fault').length,
    avgHealth: Math.round(lights.reduce((s, l) => s + l.health, 0) / lights.length),
    totalEnergy: lights.reduce((s, l) => s + l.energyUsage, 0),
  };

  const toggleLight = (id) => {
    setLights(prev => prev.map(l => {
      if (l.id === id && l.status !== 'fault') {
        return { ...l, status: l.status === 'on' ? 'off' : 'on', brightness: l.status === 'on' ? 0 : 100 };
      }
      return l;
    }));
    toast.success('تم تحديث حالة الإنارة');
  };

  const adjustBrightness = (id, brightness) => {
    setLights(prev => prev.map(l => {
      if (l.id === id && l.status !== 'fault') {
        return { ...l, brightness, status: brightness > 0 ? (brightness < 100 ? 'dimmed' : 'on') : 'off' };
      }
      return l;
    }));
  };

  const getConditionConfig = (condition) => {
    switch (condition) {
      case 'excellent': return { label: 'ممتاز', color: 'green' };
      case 'good': return { label: 'جيد', color: 'cyan' };
      case 'fair': return { label: 'متوسط', color: 'amber' };
      case 'needs_repair': return { label: 'يحتاج إصلاح', color: 'red' };
      default: return { label: condition, color: 'slate' };
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      <motion.div 
        className="flex items-center justify-between flex-wrap gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building className="w-6 h-6 text-cyan-400" />
            عمليات البلدية الذكية
          </h2>
          <p className="text-slate-400 text-sm">إدارة الإنارة والمياه والبنية التحتية</p>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="lighting" className="data-[state=active]:bg-amber-500/20">
            <Lightbulb className="w-4 h-4 ml-1" />
            إنارة الشوارع
          </TabsTrigger>
          <TabsTrigger value="water" className="data-[state=active]:bg-blue-500/20">
            <Droplets className="w-4 h-4 ml-1" />
            شبكة المياه
          </TabsTrigger>
          <TabsTrigger value="roads" className="data-[state=active]:bg-slate-500/20">
            <Route className="w-4 h-4 ml-1" />
            الطرق
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500/20">
            <BarChart3 className="w-4 h-4 ml-1" />
            التحليلات
          </TabsTrigger>
        </TabsList>

        {/* Street Lighting */}
        <TabsContent value="lighting" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'إجمالي الأعمدة', value: lightingStats.total, icon: Lightbulb, color: 'cyan' },
              { label: 'نشطة', value: lightingStats.active, icon: Zap, color: 'green' },
              { label: 'أعطال', value: lightingStats.faults, icon: AlertTriangle, color: 'red' },
              { label: 'صحة النظام', value: `${lightingStats.avgHealth}%`, icon: Activity, color: 'purple' },
              { label: 'استهلاك الطاقة', value: `${lightingStats.totalEnergy} kWh`, icon: Zap, color: 'amber' },
            ].map((stat, i) => (
              <Card key={stat.label} className={`bg-${stat.color}-500/10 border-${stat.color}-500/30`}>
                <CardContent className="p-3 text-center">
                  <stat.icon className={`w-5 h-5 text-${stat.color}-400 mx-auto mb-1`} />
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] text-slate-400">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-3">
            {lights.map((light, i) => (
              <motion.div
                key={light.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`glass-card ${light.status === 'fault' ? 'border-red-500/50 bg-red-500/5' : 'border-indigo-500/20'} bg-[#0f1629]/80`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${light.status === 'on' ? 'bg-amber-500/20' : light.status === 'fault' ? 'bg-red-500/20' : 'bg-slate-700'}`}>
                          <Lightbulb className={`w-6 h-6 ${light.status === 'on' ? 'text-amber-400' : light.status === 'fault' ? 'text-red-400' : 'text-slate-500'}`} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{light.location}</p>
                          <div className="flex items-center gap-3 text-slate-400 text-sm">
                            <span>#{light.id}</span>
                            <span>•</span>
                            <span>آخر صيانة: {light.lastMaintenance}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-amber-400 font-bold">{light.brightness}%</p>
                          <p className="text-slate-500 text-xs">السطوع</p>
                        </div>
                        <div className="text-center">
                          <p className="text-cyan-400 font-bold">{light.energyUsage} W</p>
                          <p className="text-slate-500 text-xs">الاستهلاك</p>
                        </div>
                        <div className="text-center">
                          <Progress value={light.health} className="w-16 h-2" />
                          <p className="text-slate-500 text-xs mt-1">{light.health}% صحة</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${light.status === 'on' ? 'bg-green-500/20 text-green-400' : light.status === 'fault' ? 'bg-red-500/20 text-red-400' : light.status === 'dimmed' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-600 text-slate-300'}`}>
                            {light.status === 'on' ? 'مضاء' : light.status === 'fault' ? 'عطل' : light.status === 'dimmed' ? 'خافت' : 'مطفأ'}
                          </Badge>
                          <Switch 
                            checked={light.status === 'on' || light.status === 'dimmed'} 
                            onCheckedChange={() => toggleLight(light.id)}
                            disabled={light.status === 'fault'}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Water Network */}
        <TabsContent value="water" className="mt-4 space-y-4">
          {waterNetworkData.alerts.length > 0 && (
            <Card className="glass-card border-red-500/30 bg-red-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                  <span className="text-red-300 font-medium">تنبيهات شبكة المياه</span>
                </div>
                <div className="space-y-2">
                  {waterNetworkData.alerts.map(alert => (
                    <div key={alert.id} className={`p-3 rounded-lg ${alert.severity === 'high' ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
                      <p className={`${alert.severity === 'high' ? 'text-red-300' : 'text-amber-300'}`}>{alert.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {waterNetworkData.zones.map((zone, i) => (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`glass-card ${zone.leaks > 0 ? 'border-amber-500/50' : 'border-blue-500/30'} bg-[#0f1629]/80`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-400" />
                        {zone.name}
                      </span>
                      {zone.leaks > 0 && (
                        <Badge className="bg-amber-500/20 text-amber-400">
                          {zone.leaks} تسرب
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center p-2 bg-slate-800/50 rounded">
                        <p className="text-blue-400 font-bold">{zone.pressure}</p>
                        <p className="text-slate-500 text-[10px]">ضغط (bar)</p>
                      </div>
                      <div className="text-center p-2 bg-slate-800/50 rounded">
                        <p className="text-cyan-400 font-bold">{zone.flow}</p>
                        <p className="text-slate-500 text-[10px]">تدفق (م³/س)</p>
                      </div>
                      <div className="text-center p-2 bg-slate-800/50 rounded">
                        <p className="text-green-400 font-bold">{zone.quality}%</p>
                        <p className="text-slate-500 text-[10px]">جودة</p>
                      </div>
                      <div className="text-center p-2 bg-slate-800/50 rounded">
                        <p className={`font-bold ${zone.leaks > 0 ? 'text-amber-400' : 'text-green-400'}`}>{zone.leaks}</p>
                        <p className="text-slate-500 text-[10px]">تسربات</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Roads */}
        <TabsContent value="roads" className="mt-4 space-y-4">
          <div className="grid gap-3">
            {roadsData.segments.map((road, i) => {
              const conditionConfig = getConditionConfig(road.condition);
              return (
                <motion.div
                  key={road.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`glass-card border-${conditionConfig.color}-500/30 bg-[#0f1629]/80`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl bg-${conditionConfig.color}-500/20`}>
                            <Route className={`w-6 h-6 text-${conditionConfig.color}-400`} />
                          </div>
                          <div>
                            <p className="text-white font-medium">{road.name}</p>
                            <div className="flex items-center gap-3 text-slate-400 text-sm">
                              <span>آخر فحص: {road.lastInspection}</span>
                              <span>•</span>
                              <span>مشاكل: {road.issues}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={`bg-${conditionConfig.color}-500/20 text-${conditionConfig.color}-400`}>
                            {conditionConfig.label}
                          </Badge>
                          <Badge className={`${road.traffic === 'heavy' ? 'bg-red-500/20 text-red-400' : road.traffic === 'moderate' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                            {road.traffic === 'heavy' ? 'ازدحام' : road.traffic === 'moderate' ? 'متوسط' : 'سلس'}
                          </Badge>
                          {road.condition === 'needs_repair' && (
                            <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                              <Wrench className="w-3 h-3 ml-1" />
                              جدولة صيانة
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Maintenance Queue */}
          <Card className="glass-card border-amber-500/30 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                قائمة الصيانة المجدولة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {roadsData.maintenanceQueue.map((item, i) => (
                <div key={i} className="p-3 bg-slate-800/50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-white">{item.road}</p>
                    <p className="text-slate-400 text-sm">{item.type === 'pothole_repair' ? 'إصلاح حفر' : 'إعادة رصف'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${item.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {item.priority === 'high' ? 'عالية' : 'متوسطة'}
                    </Badge>
                    <span className="text-slate-400 text-sm">{item.scheduledDate}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">استهلاك الطاقة والمياه (24 ساعة)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={energyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="lighting" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="الإنارة (kWh)" />
                    <Area type="monotone" dataKey="water" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="المياه (م³)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}