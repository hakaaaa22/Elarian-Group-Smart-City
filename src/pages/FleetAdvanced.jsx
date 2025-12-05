import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Car, Gauge, Fuel, AlertTriangle, Activity, Route, User, MapPin,
  Thermometer, Battery, Wifi, Clock, TrendingUp, TrendingDown, Shield,
  Settings, Zap, BarChart3, Target, Navigation, Bell, FileText, Brain, Mic, Users, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FleetReportsDashboard from '@/components/fleet/FleetReportsDashboard';
import AIFleetMaintenance from '@/components/fleet/AIFleetMaintenance';
import LiveDriverMonitor from '@/components/fleet/LiveDriverMonitor';
import FleetAnalyticsDashboard from '@/components/fleet/FleetAnalyticsDashboard';
import AdvancedPredictiveAnalytics from '@/components/predictive/AdvancedPredictiveAnalytics';
import AIRouteOptimization from '@/components/fleet/AIRouteOptimization';
import EnhancedDriverAssistant from '@/components/driver/EnhancedDriverAssistant';
import DeepDataAnalytics from '@/components/ai/DeepDataAnalytics';
import CollaborationHub from '@/components/collaboration/CollaborationHub';
import FleetPredictiveAI from '@/components/fleet/FleetPredictiveAI';
import CrossModuleCollaboration from '@/components/collaboration/CrossModuleCollaboration';
import FleetPredictiveMaintenanceAI from '@/components/fleet/FleetPredictiveMaintenanceAI';
import DriverBehaviorAIAnalytics from '@/components/fleet/DriverBehaviorAIAnalytics';
import AdvancedFleetAIModule from '@/components/fleet/AdvancedFleetAIModule';
import ComprehensiveReportingSystem from '@/components/reports/ComprehensiveReportingSystem';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#22d3ee', '#22c55e', '#f59e0b', '#ef4444', '#a855f7'];

// بيانات المركبات
const vehicles = [
  { 
    id: 1, plate: 'أ ب ج 1234', driver: 'محمد أحمد', type: 'شاحنة', 
    status: 'moving', speed: 85, fuel: 65, health: 92, location: 'طريق الملك فهد',
    canbus: { rpm: 2400, engineTemp: 92, oilPressure: 45, batteryVoltage: 13.8 },
    driverScore: 85, violations: 2, odometer: 125000
  },
  { 
    id: 2, plate: 'د هـ و 5678', driver: 'خالد السعيد', type: 'فان', 
    status: 'idle', speed: 0, fuel: 45, health: 78, location: 'المستودع الرئيسي',
    canbus: { rpm: 800, engineTemp: 75, oilPressure: 42, batteryVoltage: 12.6 },
    driverScore: 72, violations: 5, odometer: 89000
  },
  { 
    id: 3, plate: 'ز ح ط 9012', driver: 'عبدالله فهد', type: 'شاحنة', 
    status: 'alert', speed: 120, fuel: 30, health: 65, location: 'الطريق السريع',
    canbus: { rpm: 3200, engineTemp: 105, oilPressure: 38, batteryVoltage: 14.2 },
    driverScore: 58, violations: 8, odometer: 156000
  },
];

// بيانات استهلاك الوقود
const fuelData = [
  { day: 'السبت', consumption: 450, cost: 900, efficiency: 8.5 },
  { day: 'الأحد', consumption: 520, cost: 1040, efficiency: 8.2 },
  { day: 'الإثنين', consumption: 480, cost: 960, efficiency: 8.4 },
  { day: 'الثلاثاء', consumption: 510, cost: 1020, efficiency: 8.1 },
  { day: 'الأربعاء', consumption: 470, cost: 940, efficiency: 8.6 },
  { day: 'الخميس', consumption: 430, cost: 860, efficiency: 8.8 },
];

// مخالفات السرعة
const speedViolations = [
  { id: 1, vehicle: 'أ ب ج 1234', driver: 'محمد أحمد', speed: 135, limit: 120, location: 'طريق الدمام', time: '10:30' },
  { id: 2, vehicle: 'ز ح ط 9012', driver: 'عبدالله فهد', speed: 142, limit: 100, location: 'الطريق الدائري', time: '09:15' },
  { id: 3, vehicle: 'ز ح ط 9012', driver: 'عبدالله فهد', speed: 128, limit: 80, location: 'داخل المدينة', time: '14:20' },
];

// انحرافات المسار
const routeDeviations = [
  { id: 1, vehicle: 'د هـ و 5678', deviation: '5.2 كم', reason: 'تجنب الازدحام', time: '11:00', status: 'approved' },
  { id: 2, vehicle: 'ز ح ط 9012', deviation: '12.8 كم', reason: 'غير مبرر', time: '13:45', status: 'flagged' },
];

export default function FleetAdvanced() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedVehicle, setSelectedVehicle] = useState(vehicles[0]);

  const stats = {
    totalVehicles: vehicles.length,
    moving: vehicles.filter(v => v.status === 'moving').length,
    avgFuel: Math.round(vehicles.reduce((s, v) => s + v.fuel, 0) / vehicles.length),
    alerts: vehicles.filter(v => v.status === 'alert').length,
    avgDriverScore: Math.round(vehicles.reduce((s, v) => s + v.driverScore, 0) / vehicles.length),
    totalViolations: vehicles.reduce((s, v) => s + v.violations, 0),
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Car className="w-8 h-8 text-cyan-400" />
              إدارة الأسطول المتقدمة
            </h1>
            <p className="text-slate-400 mt-1">مراقبة وتحليل أداء المركبات والسائقين</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'المركبات', value: stats.totalVehicles, icon: Car, color: 'cyan' },
          { label: 'متحركة', value: stats.moving, icon: Activity, color: 'green' },
          { label: 'متوسط الوقود', value: `${stats.avgFuel}%`, icon: Fuel, color: 'amber' },
          { label: 'تنبيهات', value: stats.alerts, icon: AlertTriangle, color: 'red' },
          { label: 'تقييم السائقين', value: stats.avgDriverScore, icon: User, color: 'purple' },
          { label: 'المخالفات', value: stats.totalViolations, icon: Shield, color: 'red' },
        ].map((stat, i) => (
          <Card key={stat.label} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-3 text-center">
              <stat.icon className={`w-5 h-5 text-${stat.color}-400 mx-auto mb-1`} />
              <p className="text-lg font-bold text-white">{stat.value}</p>
              <p className="text-[10px] text-slate-400">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap">
          <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Car className="w-4 h-4 ml-1" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="driver_score" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <User className="w-4 h-4 ml-1" />
            تقييم السائقين
          </TabsTrigger>
          <TabsTrigger value="fuel" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Fuel className="w-4 h-4 ml-1" />
            تحليل الوقود
          </TabsTrigger>
          <TabsTrigger value="canbus" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Settings className="w-4 h-4 ml-1" />
            CANbus
          </TabsTrigger>
          <TabsTrigger value="violations" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
            <AlertTriangle className="w-4 h-4 ml-1" />
            المخالفات
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <BarChart3 className="w-4 h-4 ml-1" />
            التقارير الشاملة
          </TabsTrigger>
          <TabsTrigger value="ai_maintenance" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
            <Zap className="w-4 h-4 ml-1" />
            صيانة AI
          </TabsTrigger>
          <TabsTrigger value="live_monitor" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Activity className="w-4 h-4 ml-1" />
            مراقبة حية
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <TrendingUp className="w-4 h-4 ml-1" />
            التحليلات
          </TabsTrigger>
          <TabsTrigger value="predictive" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Brain className="w-4 h-4 ml-1" />
            التنبؤات
          </TabsTrigger>
          <TabsTrigger value="routing" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Car className="w-4 h-4 ml-1" />
            تحسين المسارات
          </TabsTrigger>
          <TabsTrigger value="driver_assistant" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Mic className="w-4 h-4 ml-1" />
            مساعد السائق
          </TabsTrigger>
          <TabsTrigger value="deep_analytics" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
            <Sparkles className="w-4 h-4 ml-1" />
            تحليل عميق
          </TabsTrigger>
          <TabsTrigger value="collaboration" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Users className="w-4 h-4 ml-1" />
            التعاون
          </TabsTrigger>
          <TabsTrigger value="predictive_ai" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
            <Brain className="w-4 h-4 ml-1" />
            صيانة تنبؤية AI
          </TabsTrigger>
          <TabsTrigger value="cross_collab" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Users className="w-4 h-4 ml-1" />
            تعاون متقدم
          </TabsTrigger>
          <TabsTrigger value="predictive_maintenance_ai" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Brain className="w-4 h-4 ml-1" />
            صيانة تنبؤية AI
          </TabsTrigger>
          <TabsTrigger value="driver_behavior_ai" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Shield className="w-4 h-4 ml-1" />
            تحليل سلوك السائق AI
          </TabsTrigger>
          <TabsTrigger value="advanced_fleet_ai" className="data-[state=active]:bg-gradient-to-r from-purple-500/20 to-cyan-500/20">
            <Brain className="w-4 h-4 ml-1" />
            Fleet OS AI
          </TabsTrigger>
          <TabsTrigger value="all_reports" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <FileText className="w-4 h-4 ml-1" />
            التقارير الشاملة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map(vehicle => (
              <Card key={vehicle.id} className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 cursor-pointer transition-all hover:border-cyan-500/50 ${selectedVehicle?.id === vehicle.id ? 'border-cyan-500' : ''} ${vehicle.status === 'alert' ? 'border-red-500/50' : ''}`}
                onClick={() => setSelectedVehicle(vehicle)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${vehicle.status === 'moving' ? 'bg-green-500/20' : vehicle.status === 'alert' ? 'bg-red-500/20' : 'bg-slate-500/20'}`}>
                        <Car className={`w-5 h-5 ${vehicle.status === 'moving' ? 'text-green-400' : vehicle.status === 'alert' ? 'text-red-400' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <p className="text-white font-bold">{vehicle.plate}</p>
                        <p className="text-slate-400 text-sm">{vehicle.driver}</p>
                      </div>
                    </div>
                    <Badge className={vehicle.status === 'moving' ? 'bg-green-500/20 text-green-400' : vehicle.status === 'alert' ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'}>
                      {vehicle.status === 'moving' ? 'متحرك' : vehicle.status === 'alert' ? 'تنبيه' : 'متوقف'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="text-center p-2 bg-slate-800/50 rounded">
                      <Gauge className="w-4 h-4 text-cyan-400 mx-auto" />
                      <p className="text-white text-sm">{vehicle.speed}</p>
                      <p className="text-slate-500 text-[10px]">كم/س</p>
                    </div>
                    <div className="text-center p-2 bg-slate-800/50 rounded">
                      <Fuel className="w-4 h-4 text-amber-400 mx-auto" />
                      <p className="text-white text-sm">{vehicle.fuel}%</p>
                      <p className="text-slate-500 text-[10px]">وقود</p>
                    </div>
                    <div className="text-center p-2 bg-slate-800/50 rounded">
                      <Activity className="w-4 h-4 text-green-400 mx-auto" />
                      <p className="text-white text-sm">{vehicle.health}%</p>
                      <p className="text-slate-500 text-[10px]">صحة</p>
                    </div>
                    <div className="text-center p-2 bg-slate-800/50 rounded">
                      <User className="w-4 h-4 text-purple-400 mx-auto" />
                      <p className="text-white text-sm">{vehicle.driverScore}</p>
                      <p className="text-slate-500 text-[10px]">تقييم</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <MapPin className="w-3 h-3" />
                    {vehicle.location}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="driver_score" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            {vehicles.map(vehicle => (
              <Card key={vehicle.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      vehicle.driverScore >= 80 ? 'bg-green-500/20' :
                      vehicle.driverScore >= 60 ? 'bg-amber-500/20' : 'bg-red-500/20'
                    }`}>
                      <span className={`text-2xl font-bold ${
                        vehicle.driverScore >= 80 ? 'text-green-400' :
                        vehicle.driverScore >= 60 ? 'text-amber-400' : 'text-red-400'
                      }`}>{vehicle.driverScore}</span>
                    </div>
                    <div>
                      <p className="text-white font-bold">{vehicle.driver}</p>
                      <p className="text-slate-400 text-sm">{vehicle.plate}</p>
                      <Badge className={vehicle.driverScore >= 80 ? 'bg-green-500/20 text-green-400' : vehicle.driverScore >= 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}>
                        {vehicle.driverScore >= 80 ? 'ممتاز' : vehicle.driverScore >= 60 ? 'جيد' : 'يحتاج تحسين'}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'القيادة الآمنة', value: vehicle.driverScore + 5 },
                      { label: 'الالتزام بالسرعة', value: 100 - vehicle.violations * 10 },
                      { label: 'كفاءة الوقود', value: vehicle.fuel + 10 },
                      { label: 'الالتزام بالمسار', value: 90 },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-400 text-sm">{item.label}</span>
                          <span className="text-white text-sm">{Math.min(item.value, 100)}%</span>
                        </div>
                        <Progress value={Math.min(item.value, 100)} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fuel" className="space-y-6 mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">استهلاك الوقود الأسبوعي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fuelData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Bar dataKey="consumption" fill="#f59e0b" name="الاستهلاك (لتر)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">كفاءة استهلاك الوقود</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={fuelData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="efficiency" stroke="#22c55e" strokeWidth={2} name="كم/لتر" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="canbus" className="space-y-4 mt-4">
          {selectedVehicle && (
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">بيانات CANbus - {selectedVehicle.plate}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-xl text-center">
                    <Gauge className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{selectedVehicle.canbus.rpm}</p>
                    <p className="text-slate-400">RPM</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl text-center">
                    <Thermometer className={`w-8 h-8 mx-auto mb-2 ${selectedVehicle.canbus.engineTemp > 100 ? 'text-red-400' : 'text-green-400'}`} />
                    <p className="text-2xl font-bold text-white">{selectedVehicle.canbus.engineTemp}°C</p>
                    <p className="text-slate-400">حرارة المحرك</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl text-center">
                    <Activity className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{selectedVehicle.canbus.oilPressure} PSI</p>
                    <p className="text-slate-400">ضغط الزيت</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl text-center">
                    <Battery className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{selectedVehicle.canbus.batteryVoltage}V</p>
                    <p className="text-slate-400">جهد البطارية</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="violations" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                مخالفات السرعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {speedViolations.map(v => (
                  <div key={v.id} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Gauge className="w-5 h-5 text-red-400" />
                        <div>
                          <p className="text-white font-medium">{v.vehicle}</p>
                          <p className="text-slate-400 text-sm">{v.driver}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-red-400 font-bold">{v.speed} كم/س</p>
                        <p className="text-slate-500 text-sm">الحد: {v.limit}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>{v.location}</span>
                      <span>{v.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Route className="w-4 h-4 text-amber-400" />
                انحرافات المسار
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {routeDeviations.map(d => (
                  <div key={d.id} className={`p-3 rounded-lg border ${d.status === 'flagged' ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{d.vehicle}</p>
                        <p className="text-slate-400 text-sm">انحراف: {d.deviation}</p>
                      </div>
                      <div className="text-left">
                        <Badge className={d.status === 'flagged' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                          {d.status === 'flagged' ? 'مشبوه' : 'مبرر'}
                        </Badge>
                        <p className="text-slate-500 text-sm mt-1">{d.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <FleetReportsDashboard />
        </TabsContent>

        <TabsContent value="ai_maintenance" className="mt-4">
          <AIFleetMaintenance vehicles={vehicles} />
        </TabsContent>

        <TabsContent value="live_monitor" className="mt-4">
          <LiveDriverMonitor />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <FleetAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="predictive" className="mt-4">
          <AdvancedPredictiveAnalytics module="fleet" />
        </TabsContent>

        <TabsContent value="routing" className="mt-4">
          <AIRouteOptimization />
        </TabsContent>

        <TabsContent value="driver_assistant" className="mt-4">
          <EnhancedDriverAssistant />
        </TabsContent>

        <TabsContent value="deep_analytics" className="mt-4">
          <DeepDataAnalytics module="fleet" />
        </TabsContent>

        <TabsContent value="collaboration" className="mt-4">
          <CollaborationHub contextType="fleet" />
        </TabsContent>

        <TabsContent value="predictive_ai" className="mt-4">
          <FleetPredictiveAI />
        </TabsContent>

        <TabsContent value="cross_collab" className="mt-4">
          <CrossModuleCollaboration contextType="fleet" />
        </TabsContent>

        <TabsContent value="predictive_maintenance_ai" className="mt-4">
          <FleetPredictiveMaintenanceAI />
        </TabsContent>

        <TabsContent value="driver_behavior_ai" className="mt-4">
          <DriverBehaviorAIAnalytics />
        </TabsContent>

        <TabsContent value="advanced_fleet_ai" className="mt-4">
          <AdvancedFleetAIModule />
        </TabsContent>

        <TabsContent value="all_reports" className="mt-4">
          <ComprehensiveReportingSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
}