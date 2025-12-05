import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Lightbulb, Thermometer, Wind, Droplets, Zap, Car, Users,
  MapPin, AlertTriangle, CheckCircle, TrendingUp, BarChart3, Activity,
  Sun, Moon, Cloud, CloudRain, Gauge, Radio, Wifi, Signal, Camera,
  TreePine, ParkingCircle, Bus, Train, Bike, Footprints, Volume2, Brain, Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IoTDataHub from '@/components/smartcity/IoTDataHub';
import AlertManagementCenter from '@/components/smartcity/AlertManagementCenter';
import AdvancedPredictiveAnalytics from '@/components/predictive/AdvancedPredictiveAnalytics';
import ProactiveAlertSystem from '@/components/smartcity/ProactiveAlertSystem';
import AIInfrastructurePredictions from '@/components/smartcity/AIInfrastructurePredictions';
import SmartCityEnvironmentPredictions from '@/components/predictive/SmartCityEnvironmentPredictions';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#6366f1'];

// بيانات المدينة الذكية
const cityZones = [
  { id: 1, name: 'المنطقة التجارية', type: 'commercial', devices: 245, alerts: 3, status: 'normal' },
  { id: 2, name: 'الحي السكني الشمالي', type: 'residential', devices: 180, alerts: 1, status: 'normal' },
  { id: 3, name: 'المنطقة الصناعية', type: 'industrial', devices: 320, alerts: 5, status: 'warning' },
  { id: 4, name: 'المنتزه المركزي', type: 'park', devices: 85, alerts: 0, status: 'normal' },
  { id: 5, name: 'محطة النقل الرئيسية', type: 'transport', devices: 150, alerts: 2, status: 'normal' },
];

// بيانات الطاقة
const energyData = [
  { hour: '00:00', consumption: 1200, solar: 0, wind: 450 },
  { hour: '04:00', consumption: 950, solar: 0, wind: 520 },
  { hour: '08:00', consumption: 2100, solar: 800, wind: 380 },
  { hour: '12:00', consumption: 3200, solar: 1500, wind: 320 },
  { hour: '16:00', consumption: 2800, solar: 1200, wind: 400 },
  { hour: '20:00', consumption: 2400, solar: 200, wind: 480 },
];

// بيانات حركة المرور
const trafficData = [
  { name: 'شارع الملك فهد', vehicles: 4500, congestion: 75 },
  { name: 'طريق المدينة', vehicles: 3200, congestion: 45 },
  { name: 'شارع الأمير سلطان', vehicles: 2800, congestion: 60 },
  { name: 'طريق الخليج', vehicles: 5100, congestion: 85 },
];

// بيانات البيئة
const environmentData = {
  airQuality: 78,
  temperature: 32,
  humidity: 45,
  noiseLevel: 62,
  co2Level: 420,
  pm25: 35,
};

// بيانات الخدمات
const publicServices = [
  { name: 'إنارة الشوارع', active: 12500, total: 13000, status: 'operational' },
  { name: 'إشارات المرور', active: 850, total: 870, status: 'warning' },
  { name: 'كاميرات المراقبة', active: 2100, total: 2200, status: 'operational' },
  { name: 'محطات الشحن', active: 180, total: 200, status: 'operational' },
  { name: 'نقاط WiFi', active: 450, total: 500, status: 'operational' },
];

export default function SmartCity() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedZone, setSelectedZone] = useState('all');
  const [timeRange, setTimeRange] = useState('today');

  const stats = {
    totalDevices: cityZones.reduce((s, z) => s + z.devices, 0),
    activeAlerts: cityZones.reduce((s, z) => s + z.alerts, 0),
    energySaved: 23,
    airQuality: environmentData.airQuality,
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-cyan-400" />
              إدارة المدينة الذكية
            </h1>
            <p className="text-slate-400 mt-1">مراقبة وإدارة البنية التحتية الذكية للمدينة</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="today">اليوم</SelectItem>
                <SelectItem value="week">أسبوع</SelectItem>
                <SelectItem value="month">شهر</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Weather & Environment Quick View */}
      <Card className="glass-card border-indigo-500/20 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Sun className="w-12 h-12 text-amber-400" />
              <div>
                <p className="text-3xl font-bold text-white">{environmentData.temperature}°C</p>
                <p className="text-slate-400">مشمس • رطوبة {environmentData.humidity}%</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <Wind className="w-6 h-6 text-cyan-400 mx-auto" />
                <p className="text-white font-bold">12 كم/س</p>
                <p className="text-slate-500 text-xs">الرياح</p>
              </div>
              <div className="text-center">
                <Gauge className="w-6 h-6 text-green-400 mx-auto" />
                <p className="text-white font-bold">{environmentData.airQuality}</p>
                <p className="text-slate-500 text-xs">جودة الهواء</p>
              </div>
              <div className="text-center">
                <Volume2 className="w-6 h-6 text-amber-400 mx-auto" />
                <p className="text-white font-bold">{environmentData.noiseLevel} dB</p>
                <p className="text-slate-500 text-xs">الضوضاء</p>
              </div>
              <div className="text-center">
                <Cloud className="w-6 h-6 text-purple-400 mx-auto" />
                <p className="text-white font-bold">{environmentData.co2Level} ppm</p>
                <p className="text-slate-500 text-xs">CO2</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'إجمالي الأجهزة', value: stats.totalDevices.toLocaleString(), icon: Radio, color: 'cyan' },
          { label: 'التنبيهات النشطة', value: stats.activeAlerts, icon: AlertTriangle, color: 'amber' },
          { label: 'توفير الطاقة', value: `${stats.energySaved}%`, icon: Zap, color: 'green' },
          { label: 'جودة الهواء', value: stats.airQuality, icon: Wind, color: 'blue' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-500/20`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap">
          <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Building2 className="w-4 h-4 ml-1" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="energy" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Zap className="w-4 h-4 ml-1" />
            الطاقة
          </TabsTrigger>
          <TabsTrigger value="traffic" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Car className="w-4 h-4 ml-1" />
            المرور
          </TabsTrigger>
          <TabsTrigger value="environment" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <TreePine className="w-4 h-4 ml-1" />
            البيئة
          </TabsTrigger>
          <TabsTrigger value="services" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Lightbulb className="w-4 h-4 ml-1" />
            الخدمات
          </TabsTrigger>
          <TabsTrigger value="transport" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
            <Bus className="w-4 h-4 ml-1" />
            النقل
          </TabsTrigger>
          <TabsTrigger value="iot" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Activity className="w-4 h-4 ml-1" />
            IoT Hub
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
            <AlertTriangle className="w-4 h-4 ml-1" />
            التنبيهات
          </TabsTrigger>
          <TabsTrigger value="predictive" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Brain className="w-4 h-4 ml-1" />
            التنبؤات
          </TabsTrigger>
          <TabsTrigger value="proactive" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Shield className="w-4 h-4 ml-1" />
            تنبيهات استباقية
          </TabsTrigger>
          <TabsTrigger value="ai-infra" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
            <Zap className="w-4 h-4 ml-1" />
            تنبؤات البنية
          </TabsTrigger>
          <TabsTrigger value="environment" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <CloudRain className="w-4 h-4 ml-1" />
            البيئة والطاقة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* City Zones */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cityZones.map(zone => (
              <Card key={zone.id} className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 ${zone.status === 'warning' ? 'border-amber-500/50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-bold">{zone.name}</h3>
                    <Badge className={zone.status === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}>
                      {zone.status === 'warning' ? 'تنبيه' : 'طبيعي'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-2 bg-slate-800/50 rounded">
                      <p className="text-cyan-400 font-bold">{zone.devices}</p>
                      <p className="text-slate-500 text-xs">جهاز</p>
                    </div>
                    <div className="text-center p-2 bg-slate-800/50 rounded">
                      <p className={`font-bold ${zone.alerts > 0 ? 'text-amber-400' : 'text-green-400'}`}>{zone.alerts}</p>
                      <p className="text-slate-500 text-xs">تنبيهات</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Public Services Overview */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">حالة الخدمات العامة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {publicServices.map(service => (
                  <div key={service.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white">{service.name}</span>
                      <span className="text-slate-400 text-sm">{service.active}/{service.total}</span>
                    </div>
                    <Progress value={(service.active / service.total) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="energy" className="space-y-6 mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">استهلاك الطاقة خلال اليوم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={energyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Legend />
                      <Area type="monotone" dataKey="consumption" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="الاستهلاك" />
                      <Area type="monotone" dataKey="solar" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="طاقة شمسية" />
                      <Area type="monotone" dataKey="wind" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} name="طاقة رياح" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">مصادر الطاقة المتجددة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                    <Sun className="w-12 h-12 text-amber-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">1,500 MW</p>
                    <p className="text-slate-400">طاقة شمسية</p>
                    <Badge className="mt-2 bg-green-500/20 text-green-400">+15% من أمس</Badge>
                  </div>
                  <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-center">
                    <Wind className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">450 MW</p>
                    <p className="text-slate-400">طاقة رياح</p>
                    <Badge className="mt-2 bg-amber-500/20 text-amber-400">-5% من أمس</Badge>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <p className="text-green-400 font-medium mb-2">توفير الطاقة الشهري</p>
                  <p className="text-3xl font-bold text-white">23%</p>
                  <p className="text-slate-400 text-sm">مقارنة بالعام الماضي</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">حالة المرور في الشوارع الرئيسية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trafficData.map(road => (
                  <div key={road.name} className="p-4 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{road.name}</span>
                      <Badge className={
                        road.congestion > 70 ? 'bg-red-500/20 text-red-400' :
                        road.congestion > 50 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-green-500/20 text-green-400'
                      }>
                        {road.congestion > 70 ? 'مزدحم' : road.congestion > 50 ? 'متوسط' : 'سلس'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Progress value={road.congestion} className="h-3" />
                      </div>
                      <span className="text-slate-400 text-sm">{road.vehicles.toLocaleString()} مركبة/ساعة</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: 'مواقف شاغرة', value: '2,450', icon: ParkingCircle, color: 'cyan' },
              { label: 'حوادث اليوم', value: '3', icon: AlertTriangle, color: 'red' },
              { label: 'متوسط السرعة', value: '45 كم/س', icon: Gauge, color: 'amber' },
              { label: 'سيارات كهربائية', value: '1,200', icon: Zap, color: 'green' },
            ].map(stat => (
              <Card key={stat.label} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4 text-center">
                  <stat.icon className={`w-8 h-8 text-${stat.color}-400 mx-auto mb-2`} />
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-slate-400 text-xs">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="environment" className="space-y-6 mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'جودة الهواء (AQI)', value: environmentData.airQuality, unit: '', icon: Wind, color: 'green', max: 100 },
              { label: 'PM2.5', value: environmentData.pm25, unit: 'μg/m³', icon: Cloud, color: 'amber', max: 50 },
              { label: 'CO2', value: environmentData.co2Level, unit: 'ppm', icon: Activity, color: 'purple', max: 500 },
              { label: 'درجة الحرارة', value: environmentData.temperature, unit: '°C', icon: Thermometer, color: 'red', max: 50 },
              { label: 'الرطوبة', value: environmentData.humidity, unit: '%', icon: Droplets, color: 'blue', max: 100 },
              { label: 'مستوى الضوضاء', value: environmentData.noiseLevel, unit: 'dB', icon: Volume2, color: 'cyan', max: 100 },
            ].map(item => (
              <Card key={item.label} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <item.icon className={`w-6 h-6 text-${item.color}-400`} />
                    <span className="text-white font-medium">{item.label}</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">
                    {item.value}<span className="text-lg text-slate-400 mr-1">{item.unit}</span>
                  </p>
                  <Progress value={(item.value / item.max) * 100} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6 mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            {publicServices.map(service => (
              <Card key={service.name} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold">{service.name}</h3>
                    <Badge className={service.status === 'operational' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                      {service.status === 'operational' ? 'تعمل' : 'تنبيه'}
                    </Badge>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">الفعّالة</span>
                      <span className="text-white">{service.active.toLocaleString()} / {service.total.toLocaleString()}</span>
                    </div>
                    <Progress value={(service.active / service.total) * 100} className="h-3" />
                  </div>
                  <p className="text-slate-400 text-sm">
                    {service.total - service.active} وحدة تحتاج صيانة
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transport" className="space-y-6 mt-4">
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: 'حافلات نشطة', value: 85, total: 100, icon: Bus, color: 'green' },
              { label: 'محطات مترو', value: 32, total: 32, icon: Train, color: 'cyan' },
              { label: 'دراجات متاحة', value: 450, total: 600, icon: Bike, color: 'amber' },
              { label: 'ركاب اليوم', value: '125K', total: null, icon: Users, color: 'purple' },
            ].map(item => (
              <Card key={item.label} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4 text-center">
                  <item.icon className={`w-10 h-10 text-${item.color}-400 mx-auto mb-2`} />
                  <p className="text-2xl font-bold text-white">
                    {item.value}{item.total && <span className="text-slate-400 text-lg">/{item.total}</span>}
                  </p>
                  <p className="text-slate-400 text-sm">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="iot" className="mt-4">
          <IoTDataHub />
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <AlertManagementCenter />
        </TabsContent>

        <TabsContent value="predictive" className="mt-4">
          <AdvancedPredictiveAnalytics module="smartcity" />
        </TabsContent>

        <TabsContent value="proactive" className="mt-4">
          <ProactiveAlertSystem />
        </TabsContent>

        <TabsContent value="ai-infra" className="mt-4">
          <AIInfrastructurePredictions />
        </TabsContent>

        <TabsContent value="environment" className="mt-4">
          <SmartCityEnvironmentPredictions />
        </TabsContent>
      </Tabs>
    </div>
  );
}