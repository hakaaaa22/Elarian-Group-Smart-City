import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, Cpu, AlertTriangle, TrendingUp, Wrench, Clock, RefreshCw,
  ThermometerSun, Gauge, Battery, Fuel, Activity, CheckCircle, XCircle,
  Calendar, DollarSign, Target, Zap, BarChart3, ArrowUp, ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// بيانات CANbus المحاكاة
const vehicleSensorData = [
  { id: 'V001', plate: 'أ ب ج 1234', engineTemp: 92, oilPressure: 42, rpm: 2400, batteryVoltage: 13.8, fuelLevel: 65, odometer: 125000, brakeWear: 35, tireHealth: 78 },
  { id: 'V002', plate: 'د هـ و 5678', engineTemp: 105, oilPressure: 28, rpm: 3200, batteryVoltage: 11.2, fuelLevel: 30, odometer: 189000, brakeWear: 72, tireHealth: 45 },
  { id: 'V003', plate: 'ز ح ط 9012', engineTemp: 88, oilPressure: 45, rpm: 1800, batteryVoltage: 14.1, fuelLevel: 80, odometer: 67000, brakeWear: 15, tireHealth: 92 },
];

// سجل الصيانة التاريخي
const maintenanceHistory = [
  { date: '2024-01', component: 'المحرك', cost: 5000, vehicle: 'V001', type: 'corrective' },
  { date: '2024-02', component: 'الفرامل', cost: 1500, vehicle: 'V002', type: 'preventive' },
  { date: '2024-03', component: 'البطارية', cost: 800, vehicle: 'V001', type: 'corrective' },
  { date: '2024-04', component: 'الإطارات', cost: 2400, vehicle: 'V003', type: 'preventive' },
  { date: '2024-05', component: 'الزيت', cost: 400, vehicle: 'V002', type: 'preventive' },
  { date: '2024-06', component: 'المحرك', cost: 8000, vehicle: 'V002', type: 'corrective' },
];

// بيانات الاتجاهات
const trendData = [
  { month: 'يناير', failures: 3, preventive: 5, cost: 8500 },
  { month: 'فبراير', failures: 2, preventive: 6, cost: 6200 },
  { month: 'مارس', failures: 4, preventive: 4, cost: 12000 },
  { month: 'أبريل', failures: 1, preventive: 7, cost: 4500 },
  { month: 'مايو', failures: 2, preventive: 8, cost: 5800 },
  { month: 'يونيو', failures: 5, preventive: 3, cost: 15000 },
];

// بيانات الارتباط (للـ Scatter Plot)
const correlationData = vehicleSensorData.map(v => ({
  odometer: v.odometer / 1000,
  brakeWear: v.brakeWear,
  engineTemp: v.engineTemp,
  name: v.plate
}));

export default function FleetPredictiveAI() {
  const [activeTab, setActiveTab] = useState('predictions');
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [predictions, setPredictions] = useState([]);
  const [optimizedSchedule, setOptimizedSchedule] = useState([]);

  // تحليل البيانات والتنبؤ بالأعطال
  const analyzeSensorData = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في تحليل بيانات المركبات والصيانة التنبؤية، قم بتحليل بيانات CANbus وسجل الصيانة التالي:

بيانات المستشعرات:
${vehicleSensorData.map(v => `
المركبة ${v.plate}:
- حرارة المحرك: ${v.engineTemp}°C (طبيعي: 85-95)
- ضغط الزيت: ${v.oilPressure} PSI (طبيعي: 40-60)
- جهد البطارية: ${v.batteryVoltage}V (طبيعي: 13.5-14.5)
- تآكل الفرامل: ${v.brakeWear}% (استبدال عند 80%)
- صحة الإطارات: ${v.tireHealth}%
- عداد المسافة: ${v.odometer} كم
`).join('\n')}

سجل الصيانة:
${maintenanceHistory.map(m => `${m.date}: ${m.component} للمركبة ${m.vehicle} - ${m.type} - ${m.cost} ر.س`).join('\n')}

قدم:
1. تنبؤات بالأعطال المحتملة لكل مركبة مع نسبة الاحتمالية
2. المكونات المعرضة للخطر
3. الوقت المتوقع حتى الفشل
4. التكلفة المتوقعة للإصلاح vs الصيانة الوقائية
5. توصيات محددة لكل مركبة`,
        response_json_schema: {
          type: "object",
          properties: {
            predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  vehicleId: { type: "string" },
                  vehiclePlate: { type: "string" },
                  component: { type: "string" },
                  failureProbability: { type: "number" },
                  timeToFailure: { type: "string" },
                  severity: { type: "string" },
                  repairCost: { type: "number" },
                  preventiveCost: { type: "number" },
                  recommendation: { type: "string" },
                  riskFactors: { type: "array", items: { type: "string" } }
                }
              }
            },
            fleetHealthScore: { type: "number" },
            totalRiskVehicles: { type: "number" },
            estimatedSavings: { type: "number" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setPredictions(data.predictions || []);
      toast.success('تم تحليل البيانات وإنشاء التنبؤات');
    }
  });

  // تحسين جدول الصيانة
  const optimizeSchedule = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `بناءً على بيانات المركبات وتنبؤات الأعطال، قم بإنشاء جدول صيانة محسّن:

المركبات وحالتها:
${vehicleSensorData.map(v => `${v.plate}: عداد ${v.odometer} كم، فرامل ${v.brakeWear}%، إطارات ${v.tireHealth}%`).join('\n')}

التنبؤات الحالية:
${predictions.map(p => `${p.vehiclePlate}: ${p.component} - احتمال فشل ${p.failureProbability}%`).join('\n')}

قم بإنشاء جدول صيانة للأسبوعين القادمين يراعي:
1. الأولوية بناءً على المخاطر
2. تجميع الصيانات المتشابهة
3. تقليل وقت التوقف
4. توزيع الحمل على أيام الأسبوع`,
        response_json_schema: {
          type: "object",
          properties: {
            schedule: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  vehicle: { type: "string" },
                  tasks: { type: "array", items: { type: "string" } },
                  estimatedDuration: { type: "string" },
                  priority: { type: "string" },
                  estimatedCost: { type: "number" }
                }
              }
            },
            totalDowntime: { type: "string" },
            totalCost: { type: "number" },
            efficiencyGain: { type: "number" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setOptimizedSchedule(data.schedule || []);
      toast.success('تم تحسين جدول الصيانة');
    }
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'amber';
      case 'medium': return 'yellow';
      default: return 'green';
    }
  };

  const getHealthStatus = (value, thresholds) => {
    if (value >= thresholds.danger) return { color: 'red', status: 'خطر' };
    if (value >= thresholds.warning) return { color: 'amber', status: 'تحذير' };
    return { color: 'green', status: 'جيد' };
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          الصيانة التنبؤية بالذكاء الاصطناعي
        </h3>
        <div className="flex gap-2">
          <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
            <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue placeholder="كل المركبات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل المركبات</SelectItem>
              {vehicleSensorData.map(v => (
                <SelectItem key={v.id} value={v.id}>{v.plate}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-purple-500 text-purple-400" onClick={() => analyzeSensorData.mutate()} disabled={analyzeSensorData.isPending}>
            {analyzeSensorData.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
            تحليل وتنبؤ
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => optimizeSchedule.mutate()} disabled={optimizeSchedule.isPending}>
            {optimizeSchedule.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Calendar className="w-4 h-4 ml-2" />}
            تحسين الجدول
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <Activity className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">87%</p>
            <p className="text-green-400 text-xs">صحة الأسطول</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{predictions.length || 3}</p>
            <p className="text-amber-400 text-xs">تنبؤات نشطة</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <DollarSign className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">35,000</p>
            <p className="text-cyan-400 text-xs">توفير متوقع (ر.س)</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <Clock className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">-40%</p>
            <p className="text-purple-400 text-xs">تقليل وقت التوقف</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="predictions" className="data-[state=active]:bg-purple-500/20">
            <Brain className="w-4 h-4 ml-1" />
            التنبؤات
          </TabsTrigger>
          <TabsTrigger value="sensors" className="data-[state=active]:bg-cyan-500/20">
            <Cpu className="w-4 h-4 ml-1" />
            بيانات المستشعرات
          </TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-green-500/20">
            <Calendar className="w-4 h-4 ml-1" />
            الجدول المحسّن
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-500/20">
            <BarChart3 className="w-4 h-4 ml-1" />
            التحليلات
          </TabsTrigger>
        </TabsList>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="mt-4">
          <div className="space-y-3">
            {(predictions.length > 0 ? predictions : [
              { vehicleId: 'V002', vehiclePlate: 'د هـ و 5678', component: 'البطارية', failureProbability: 85, timeToFailure: '7-10 أيام', severity: 'high', repairCost: 1500, preventiveCost: 400, recommendation: 'استبدال فوري للبطارية', riskFactors: ['جهد منخفض 11.2V', 'عمر البطارية'] },
              { vehicleId: 'V002', vehiclePlate: 'د هـ و 5678', component: 'ضغط الزيت', failureProbability: 72, timeToFailure: '2-3 أسابيع', severity: 'high', repairCost: 8000, preventiveCost: 600, recommendation: 'تغيير الزيت وفحص المضخة', riskFactors: ['ضغط منخفض 28 PSI', 'حرارة عالية'] },
              { vehicleId: 'V002', vehiclePlate: 'د هـ و 5678', component: 'الفرامل', failureProbability: 65, timeToFailure: '3-4 أسابيع', severity: 'medium', repairCost: 2500, preventiveCost: 1200, recommendation: 'جدولة استبدال تيل الفرامل', riskFactors: ['تآكل 72%', 'مسافة عالية'] },
            ]).map((pred, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className={`glass-card border-${getSeverityColor(pred.severity)}-500/30 bg-${getSeverityColor(pred.severity)}-500/5`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${getSeverityColor(pred.severity)}-500/20`}>
                          <AlertTriangle className={`w-5 h-5 text-${getSeverityColor(pred.severity)}-400`} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{pred.component}</p>
                          <p className="text-slate-400 text-sm">{pred.vehiclePlate}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <Badge className={`bg-${getSeverityColor(pred.severity)}-500/20 text-${getSeverityColor(pred.severity)}-400`}>
                          احتمال {pred.failureProbability}%
                        </Badge>
                        <p className="text-slate-500 text-xs mt-1">{pred.timeToFailure}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-3 mb-3">
                      <div className="p-2 bg-slate-800/50 rounded text-center">
                        <p className="text-red-400 font-bold">{pred.repairCost?.toLocaleString()} ر.س</p>
                        <p className="text-slate-500 text-xs">تكلفة الإصلاح</p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded text-center">
                        <p className="text-green-400 font-bold">{pred.preventiveCost?.toLocaleString()} ر.س</p>
                        <p className="text-slate-500 text-xs">الصيانة الوقائية</p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded text-center">
                        <p className="text-cyan-400 font-bold">{((pred.repairCost - pred.preventiveCost) / pred.repairCost * 100).toFixed(0)}%</p>
                        <p className="text-slate-500 text-xs">التوفير</p>
                      </div>
                    </div>

                    <div className="p-2 bg-slate-900/50 rounded mb-3">
                      <p className="text-cyan-400 text-sm">{pred.recommendation}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {pred.riskFactors?.map((factor, j) => (
                        <Badge key={j} className="bg-slate-700 text-slate-300 text-xs">{factor}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Sensors Tab */}
        <TabsContent value="sensors" className="mt-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {vehicleSensorData.map(vehicle => (
              <Card key={vehicle.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">{vehicle.plate}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: 'حرارة المحرك', value: vehicle.engineTemp, unit: '°C', icon: ThermometerSun, thresholds: { warning: 95, danger: 100 } },
                    { label: 'ضغط الزيت', value: vehicle.oilPressure, unit: 'PSI', icon: Gauge, thresholds: { warning: 35, danger: 30 }, inverse: true },
                    { label: 'جهد البطارية', value: vehicle.batteryVoltage, unit: 'V', icon: Battery, thresholds: { warning: 12.5, danger: 12 }, inverse: true },
                    { label: 'تآكل الفرامل', value: vehicle.brakeWear, unit: '%', icon: Activity, thresholds: { warning: 60, danger: 80 } },
                  ].map((sensor, i) => {
                    const status = getHealthStatus(sensor.inverse ? (100 - sensor.value) : sensor.value, sensor.thresholds);
                    return (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                        <div className="flex items-center gap-2">
                          <sensor.icon className={`w-4 h-4 text-${status.color}-400`} />
                          <span className="text-slate-400 text-sm">{sensor.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{sensor.value}{sensor.unit}</span>
                          <Badge className={`bg-${status.color}-500/20 text-${status.color}-400 text-xs`}>{status.status}</Badge>
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-2 border-t border-slate-700">
                    <p className="text-slate-500 text-xs">عداد المسافة: {vehicle.odometer.toLocaleString()} كم</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">جدول الصيانة المحسّن</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(optimizedSchedule.length > 0 ? optimizedSchedule : [
                  { date: '2024-12-05', vehicle: 'د هـ و 5678', tasks: ['استبدال البطارية', 'تغيير الزيت'], estimatedDuration: '3 ساعات', priority: 'high', estimatedCost: 1000 },
                  { date: '2024-12-08', vehicle: 'د هـ و 5678', tasks: ['استبدال تيل الفرامل'], estimatedDuration: '2 ساعة', priority: 'medium', estimatedCost: 1200 },
                  { date: '2024-12-12', vehicle: 'أ ب ج 1234', tasks: ['فحص دوري', 'تعبئة الزيت'], estimatedDuration: '1 ساعة', priority: 'low', estimatedCost: 300 },
                ]).map((item, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${item.priority === 'high' ? 'bg-red-500/10 border-red-500/30' : item.priority === 'medium' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Calendar className={`w-4 h-4 ${item.priority === 'high' ? 'text-red-400' : item.priority === 'medium' ? 'text-amber-400' : 'text-slate-400'}`} />
                        <div>
                          <p className="text-white font-medium">{item.date}</p>
                          <p className="text-slate-400 text-sm">{item.vehicle}</p>
                        </div>
                      </div>
                      <Badge className={item.priority === 'high' ? 'bg-red-500/20 text-red-400' : item.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-600 text-slate-300'}>
                        {item.priority === 'high' ? 'عاجل' : item.priority === 'medium' ? 'متوسط' : 'منخفض'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {item.tasks.map((task, j) => (
                        <Badge key={j} className="bg-cyan-500/20 text-cyan-400">{task}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>المدة: {item.estimatedDuration}</span>
                      <span>التكلفة: {item.estimatedCost?.toLocaleString()} ر.س</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">اتجاه الأعطال والصيانة الوقائية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Legend />
                      <Area type="monotone" dataKey="preventive" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.4} name="صيانة وقائية" />
                      <Area type="monotone" dataKey="failures" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} name="أعطال" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">علاقة المسافة بتآكل الفرامل (Scatter)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" dataKey="odometer" name="المسافة (ألف كم)" stroke="#94a3b8" fontSize={10} />
                      <YAxis type="number" dataKey="brakeWear" name="تآكل الفرامل %" stroke="#94a3b8" fontSize={10} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Scatter name="المركبات" data={correlationData} fill="#a855f7">
                        {correlationData.map((entry, index) => (
                          <Cell key={index} fill={entry.brakeWear > 60 ? '#ef4444' : entry.brakeWear > 40 ? '#f59e0b' : '#22c55e'} />
                        ))}
                      </Scatter>
                    </ScatterChart>
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