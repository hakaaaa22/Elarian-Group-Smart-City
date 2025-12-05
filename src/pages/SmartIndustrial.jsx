import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Factory, Cpu, Wrench, AlertTriangle, Truck, Users, Activity,
  Thermometer, Shield, Zap, Radio, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const factories = [
  { name: 'مصنع الإلكترونيات A', status: 'operational', efficiency: 94, workers: 450, alerts: 1 },
  { name: 'مصنع التعبئة B', status: 'maintenance', efficiency: 0, workers: 120, alerts: 0 },
  { name: 'مصنع البتروكيماويات C', status: 'operational', efficiency: 88, workers: 280, alerts: 3 },
];

const forklifts = [
  { id: 'FL-001', operator: 'أحمد محمد', status: 'active', battery: 78, location: 'المستودع A' },
  { id: 'FL-002', operator: 'محمد علي', status: 'idle', battery: 92, location: 'منطقة التحميل' },
  { id: 'FL-003', operator: '-', status: 'charging', battery: 35, location: 'محطة الشحن' },
];

const safetyAlerts = [
  { type: 'حرارة عالية', zone: 'منطقة الأفران', severity: 'medium', time: '10 دقائق' },
  { type: 'عامل بدون خوذة', zone: 'منطقة البناء', severity: 'high', time: '2 دقيقة' },
  { type: 'تسرب غاز', zone: 'المستودع C', severity: 'critical', time: '1 دقيقة' },
];

export default function SmartIndustrial() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <Factory className="w-8 h-8 text-amber-400" />
          المناطق الصناعية الذكية
        </h1>
        <p className="text-slate-400 mt-1">إدارة المصانع والأمان الصناعي</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <Factory className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">45</p>
            <p className="text-amber-400 text-xs">مصنع</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <Activity className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">91%</p>
            <p className="text-green-400 text-xs">الكفاءة</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <Users className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">12,500</p>
            <p className="text-cyan-400 text-xs">عامل</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">4</p>
            <p className="text-red-400 text-xs">تنبيهات أمان</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alert Banner */}
      {safetyAlerts.filter(a => a.severity === 'critical').length > 0 && (
        <Card className="bg-red-500/10 border-red-500/50 mb-6 animate-pulse">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">تنبيه حرج:</span>
              {safetyAlerts.filter(a => a.severity === 'critical').map((alert, i) => (
                <Badge key={i} className="bg-red-500/20 text-red-400">{alert.type} - {alert.zone}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview">المصانع</TabsTrigger>
          <TabsTrigger value="forklifts">الرافعات</TabsTrigger>
          <TabsTrigger value="safety">الأمان</TabsTrigger>
          <TabsTrigger value="maintenance">الصيانة</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="space-y-3">
            {factories.map((factory, i) => (
              <Card key={i} className={`glass-card border-${factory.status === 'operational' ? 'green' : 'amber'}-500/30 bg-[#0f1629]/80`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Factory className={`w-5 h-5 text-${factory.status === 'operational' ? 'green' : 'amber'}-400`} />
                        <p className="text-white font-medium">{factory.name}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                        <span><Users className="w-3 h-3 inline ml-1" />{factory.workers} عامل</span>
                        {factory.alerts > 0 && <Badge className="bg-red-500/20 text-red-400">{factory.alerts} تنبيه</Badge>}
                      </div>
                    </div>
                    <div className="text-left">
                      <Badge className={factory.status === 'operational' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                        {factory.status === 'operational' ? 'تشغيل' : 'صيانة'}
                      </Badge>
                      {factory.efficiency > 0 && (
                        <div className="mt-2">
                          <Progress value={factory.efficiency} className="h-2 w-20" />
                          <p className="text-slate-500 text-xs mt-1">{factory.efficiency}% كفاءة</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Forklifts Tab */}
        <TabsContent value="forklifts" className="mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            {forklifts.map(forklift => (
              <Card key={forklift.id} className={`glass-card border-${forklift.status === 'active' ? 'green' : forklift.status === 'idle' ? 'amber' : 'purple'}-500/30 bg-[#0f1629]/80`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">{forklift.id}</span>
                    <Badge className={forklift.status === 'active' ? 'bg-green-500/20 text-green-400' : forklift.status === 'idle' ? 'bg-amber-500/20 text-amber-400' : 'bg-purple-500/20 text-purple-400'}>
                      {forklift.status === 'active' ? 'نشط' : forklift.status === 'idle' ? 'خامل' : 'شحن'}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-sm">المشغل: {forklift.operator}</p>
                  <p className="text-slate-400 text-sm">الموقع: {forklift.location}</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">البطارية</span>
                      <span className={`text-${forklift.battery > 50 ? 'green' : forklift.battery > 20 ? 'amber' : 'red'}-400`}>{forklift.battery}%</span>
                    </div>
                    <Progress value={forklift.battery} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Safety Tab */}
        <TabsContent value="safety" className="mt-4">
          <div className="space-y-3">
            {safetyAlerts.map((alert, i) => (
              <Card key={i} className={`glass-card border-${alert.severity === 'critical' ? 'red' : alert.severity === 'high' ? 'amber' : 'slate'}-500/30 bg-[#0f1629]/80`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`w-5 h-5 text-${alert.severity === 'critical' ? 'red' : alert.severity === 'high' ? 'amber' : 'slate'}-400`} />
                      <div>
                        <p className="text-white font-medium">{alert.type}</p>
                        <p className="text-slate-400 text-sm">{alert.zone}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <Badge className={`bg-${alert.severity === 'critical' ? 'red' : alert.severity === 'high' ? 'amber' : 'slate'}-500/20 text-${alert.severity === 'critical' ? 'red' : alert.severity === 'high' ? 'amber' : 'slate'}-400`}>
                        {alert.severity === 'critical' ? 'حرج' : alert.severity === 'high' ? 'عالي' : 'متوسط'}
                      </Badge>
                      <p className="text-slate-500 text-xs mt-1">{alert.time}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="mt-4">
          <Card className="glass-card border-purple-500/30 bg-purple-500/5">
            <CardContent className="p-6 text-center">
              <Wrench className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">الصيانة التنبؤية AI</h3>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="p-3 bg-slate-800/50 rounded">
                  <p className="text-green-400 font-bold">12</p>
                  <p className="text-slate-500 text-xs">صيانة مجدولة</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded">
                  <p className="text-amber-400 font-bold">3</p>
                  <p className="text-slate-500 text-xs">تنبؤ بالعطل</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded">
                  <p className="text-cyan-400 font-bold">98%</p>
                  <p className="text-slate-500 text-xs">دقة التنبؤ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}