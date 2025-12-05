import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Activity, Users, Bed, Stethoscope, Syringe, AlertTriangle, Clock,
  Heart, Thermometer, Brain, Ambulance, Building2, Shield, Wifi,
  TrendingUp, TrendingDown, RefreshCw, Eye, Bell, Zap, Radio, Pill, Calendar
} from 'lucide-react';
import AdvancedHospitalModules from '@/components/hospital/AdvancedHospitalModules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// بيانات محاكاة
const erData = [
  { time: '08:00', patients: 12, waiting: 5, critical: 2 },
  { time: '10:00', patients: 18, waiting: 8, critical: 3 },
  { time: '12:00', patients: 25, waiting: 12, critical: 4 },
  { time: '14:00', patients: 22, waiting: 10, critical: 2 },
  { time: '16:00', patients: 28, waiting: 15, critical: 5 },
];

const departmentStats = [
  { name: 'الطوارئ', occupancy: 85, patients: 28, critical: 5, color: 'red' },
  { name: 'العناية المركزة', occupancy: 92, patients: 23, critical: 23, color: 'purple' },
  { name: 'الجراحة', occupancy: 70, patients: 35, critical: 8, color: 'amber' },
  { name: 'الباطنة', occupancy: 78, patients: 45, critical: 4, color: 'cyan' },
  { name: 'الأطفال', occupancy: 65, patients: 22, critical: 2, color: 'green' },
];

const activeAlerts = [
  { id: 1, type: 'critical', message: 'مريض ICU غرفة 5 - انخفاض حاد في ضغط الدم', time: '2 دقيقة', department: 'ICU' },
  { id: 2, type: 'warning', message: 'نفاد مخزون الأنسولين - المستوى الحرج', time: '15 دقيقة', department: 'الصيدلية' },
  { id: 3, type: 'info', message: 'إسعاف في الطريق - حالة حادث مروري', time: '5 دقائق', department: 'الطوارئ' },
];

const orStatus = [
  { room: 'OR-1', status: 'in_progress', surgery: 'استبدال مفصل الركبة', progress: 65, surgeon: 'د. أحمد محمد' },
  { room: 'OR-2', status: 'preparing', surgery: 'استئصال المرارة', progress: 0, surgeon: 'د. سارة خالد' },
  { room: 'OR-3', status: 'cleaning', surgery: '-', progress: 100, surgeon: '-' },
  { room: 'OR-4', status: 'available', surgery: '-', progress: 0, surgeon: '-' },
];

export default function HospitalCommandCenter() {
  const [activeTab, setActiveTab] = useState('overview');
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    totalBeds: 450,
    occupiedBeds: 352,
    erPatients: 28,
    icuPatients: 23,
    surgeriesToday: 12,
    discharges: 18,
    admissions: 22,
    pendingLabs: 45,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress': return 'amber';
      case 'preparing': return 'cyan';
      case 'cleaning': return 'purple';
      case 'available': return 'green';
      default: return 'slate';
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 bg-[#0a0e1a]" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-cyan-400" />
              مركز قيادة المستشفى
            </h1>
            <p className="text-slate-400 mt-1">نظرة شاملة على جميع العمليات</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-left">
              <p className="text-2xl font-bold text-cyan-400">{liveTime.toLocaleTimeString('ar-SA')}</p>
              <p className="text-slate-500 text-sm">{liveTime.toLocaleDateString('ar-SA')}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm">مباشر</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Critical Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <Bed className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.occupiedBeds}/{stats.totalBeds}</p>
            <p className="text-cyan-400 text-xs">الأسرة</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <Ambulance className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.erPatients}</p>
            <p className="text-red-400 text-xs">الطوارئ</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <Heart className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.icuPatients}</p>
            <p className="text-purple-400 text-xs">العناية المركزة</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <Syringe className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.surgeriesToday}</p>
            <p className="text-amber-400 text-xs">عمليات اليوم</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.admissions}</p>
            <p className="text-green-400 text-xs">إدخالات</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <TrendingDown className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.discharges}</p>
            <p className="text-blue-400 text-xs">خروج</p>
          </CardContent>
        </Card>
        <Card className="bg-pink-500/10 border-pink-500/30">
          <CardContent className="p-3 text-center">
            <Activity className="w-5 h-5 text-pink-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.pendingLabs}</p>
            <p className="text-pink-400 text-xs">تحاليل معلقة</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-500/10 border-slate-500/30">
          <CardContent className="p-3 text-center">
            <Users className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">245</p>
            <p className="text-slate-400 text-xs">طاقم نشط</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Banner */}
      {activeAlerts.filter(a => a.type === 'critical').length > 0 && (
        <Card className="bg-red-500/10 border-red-500/50 mb-6">
          <CardContent className="p-3">
            <div className="flex items-center gap-3 overflow-x-auto">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 animate-pulse" />
              {activeAlerts.filter(a => a.type === 'critical').map(alert => (
                <div key={alert.id} className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-red-400 font-medium">{alert.message}</span>
                  <Badge className="bg-red-500/20 text-red-400">{alert.time}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Hospital Modules */}
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="advanced">الوحدات المتقدمة</TabsTrigger>
        </TabsList>

        <TabsContent value="advanced" className="mt-4">
          <AdvancedHospitalModules />
        </TabsContent>

        <TabsContent value="overview" className="mt-4">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department Overview */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">نسبة إشغال الأقسام</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {departmentStats.map(dept => (
                  <div key={dept.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">{dept.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">{dept.patients} مريض</span>
                        {dept.critical > 0 && (
                          <Badge className="bg-red-500/20 text-red-400 text-xs">{dept.critical} حرج</Badge>
                        )}
                        <span className={`text-${dept.color}-400 font-bold`}>{dept.occupancy}%</span>
                      </div>
                    </div>
                    <Progress value={dept.occupancy} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ER Flow */}
          <Card className="glass-card border-red-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Ambulance className="w-4 h-4 text-red-400" />
                تدفق الطوارئ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={erData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="patients" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="المرضى" />
                    <Area type="monotone" dataKey="waiting" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="الانتظار" />
                    <Area type="monotone" dataKey="critical" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} name="حرج" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* OR Status */}
          <Card className="glass-card border-amber-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Syringe className="w-4 h-4 text-amber-400" />
                حالة غرف العمليات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {orStatus.map(or => (
                  <div key={or.room} className={`p-3 rounded-lg border bg-${getStatusColor(or.status)}-500/10 border-${getStatusColor(or.status)}-500/30`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{or.room}</span>
                      <Badge className={`bg-${getStatusColor(or.status)}-500/20 text-${getStatusColor(or.status)}-400`}>
                        {or.status === 'in_progress' ? 'جارية' : or.status === 'preparing' ? 'تحضير' : or.status === 'cleaning' ? 'تنظيف' : 'متاحة'}
                      </Badge>
                    </div>
                    {or.surgery !== '-' && (
                      <>
                        <p className="text-slate-400 text-xs mb-1">{or.surgery}</p>
                        <p className="text-slate-500 text-xs">{or.surgeon}</p>
                        {or.status === 'in_progress' && (
                          <Progress value={or.progress} className="h-1.5 mt-2" />
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Live Alerts */}
          <Card className="glass-card border-red-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-red-400" />
                التنبيهات المباشرة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeAlerts.map(alert => (
                  <div key={alert.id} className={`p-3 rounded-lg border ${alert.type === 'critical' ? 'bg-red-500/10 border-red-500/30' : alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                    <p className="text-white text-sm">{alert.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge className="bg-slate-700 text-slate-300 text-xs">{alert.department}</Badge>
                      <span className="text-slate-500 text-xs">{alert.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* IoT Status */}
          <Card className="glass-card border-cyan-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Wifi className="w-4 h-4 text-cyan-400" />
                حالة أجهزة IoT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'أجهزة المراقبة', online: 142, total: 150 },
                  { name: 'الأسرة الذكية', online: 85, total: 90 },
                  { name: 'RFID Readers', online: 45, total: 48 },
                  { name: 'حساسات البيئة', online: 78, total: 80 },
                ].map(device => (
                  <div key={device.name} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                    <span className="text-slate-300 text-sm">{device.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 text-sm">{device.online}/{device.total}</span>
                      <Progress value={(device.online / device.total) * 100} className="h-1.5 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-card border-purple-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-red-600 hover:bg-red-700 justify-start">
                <AlertTriangle className="w-4 h-4 ml-2" />
                تفعيل كود أزرق
              </Button>
              <Button variant="outline" className="w-full border-amber-500 text-amber-400 justify-start">
                <Ambulance className="w-4 h-4 ml-2" />
                استقبال إسعاف
              </Button>
              <Button variant="outline" className="w-full border-cyan-500 text-cyan-400 justify-start">
                <Bed className="w-4 h-4 ml-2" />
                إدارة الأسرة
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}