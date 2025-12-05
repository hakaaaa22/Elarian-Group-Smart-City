import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Truck, Wrench, AlertTriangle, CheckCircle, Brain, RefreshCw, ThermometerSun,
  Gauge, Activity, Clock, Calendar, TrendingUp, Package, DollarSign, Settings,
  Zap, Droplets, BarChart3, Target, Battery, Thermometer, ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'sonner';
import MaintenanceReportsModule from './MaintenanceReportsModule';

const fleetHealthData = [
  { 
    id: 'TRK-001', 
    plate: 'أ ب ج 1234',
    healthScore: 78,
    canBus: { 
      engineTemp: 92, hydraulicPressure: 185, rpm: 1400, oilPressure: 45, 
      fuelEfficiency: 8.2, brakeWear: 35, transmissionTemp: 78,
      fuelPressure: 42, batteryVoltage: 12.4, batteryHealth: 85, odometer: 125000,
      coolantLevel: 78, exhaustTemp: 320, turboBoost: 1.2
    },
    lastMaintenance: '2024-11-15',
    nextScheduled: '2024-12-20',
    totalKm: 125000,
    issues: ['ارتفاع حرارة المحرك', 'ضغط هيدروليكي مرتفع'],
    riskLevel: 'medium',
    maintenanceHistory: [
      { date: '2024-11-15', type: 'preventive', description: 'تغيير زيت وفلتر', cost: 450, technician: 'أحمد' },
      { date: '2024-10-01', type: 'corrective', description: 'إصلاح نظام الفرامل', cost: 1200, technician: 'محمد' },
      { date: '2024-08-15', type: 'preventive', description: 'صيانة دورية شاملة', cost: 2500, technician: 'خالد' },
    ]
  },
  { 
    id: 'TRK-002', 
    plate: 'د هـ و 5678',
    healthScore: 92,
    canBus: { 
      engineTemp: 82, hydraulicPressure: 172, rpm: 1200, oilPressure: 52, 
      fuelEfficiency: 7.5, brakeWear: 15, transmissionTemp: 68,
      fuelPressure: 45, batteryVoltage: 12.8, batteryHealth: 95, odometer: 85000,
      coolantLevel: 92, exhaustTemp: 280, turboBoost: 1.1
    },
    lastMaintenance: '2024-11-28',
    nextScheduled: '2025-01-15',
    totalKm: 85000,
    issues: [],
    riskLevel: 'low',
    maintenanceHistory: [
      { date: '2024-11-28', type: 'preventive', description: 'فحص دوري', cost: 300, technician: 'علي' },
      { date: '2024-09-15', type: 'preventive', description: 'تغيير فلاتر', cost: 400, technician: 'أحمد' },
    ]
  },
  { 
    id: 'TRK-003', 
    plate: 'ز ح ط 9012',
    healthScore: 45,
    canBus: { 
      engineTemp: 105, hydraulicPressure: 210, rpm: 1600, oilPressure: 32, 
      fuelEfficiency: 12.5, brakeWear: 72, transmissionTemp: 95,
      fuelPressure: 35, batteryVoltage: 11.8, batteryHealth: 62, odometer: 180000,
      coolantLevel: 55, exhaustTemp: 420, turboBoost: 0.8
    },
    lastMaintenance: '2024-10-05',
    nextScheduled: 'عاجل',
    totalKm: 180000,
    issues: ['تآكل الفرامل عالي', 'حرارة المحرك حرجة', 'ضغط زيت منخفض', 'استهلاك وقود مرتفع', 'بطارية ضعيفة'],
    riskLevel: 'critical',
    maintenanceHistory: [
      { date: '2024-10-05', type: 'emergency', description: 'إصلاح طارئ للمحرك', cost: 5500, technician: 'محمد' },
      { date: '2024-07-20', type: 'corrective', description: 'استبدال مضخة الوقود', cost: 2800, technician: 'خالد' },
      { date: '2024-05-10', type: 'preventive', description: 'صيانة شاملة', cost: 3200, technician: 'أحمد' },
      { date: '2024-02-15', type: 'corrective', description: 'إصلاح ناقل الحركة', cost: 4500, technician: 'علي' },
    ]
  },
  { 
    id: 'TRK-004', 
    plate: 'ي ك ل 3456',
    healthScore: 85,
    canBus: { 
      engineTemp: 78, hydraulicPressure: 168, rpm: 1100, oilPressure: 48, 
      fuelEfficiency: 7.8, brakeWear: 25, transmissionTemp: 65,
      fuelPressure: 44, batteryVoltage: 12.6, batteryHealth: 90, odometer: 95000,
      coolantLevel: 88, exhaustTemp: 290, turboBoost: 1.15
    },
    lastMaintenance: '2024-11-20',
    nextScheduled: '2025-01-05',
    totalKm: 95000,
    issues: [],
    riskLevel: 'low',
    maintenanceHistory: [
      { date: '2024-11-20', type: 'preventive', description: 'تغيير زيت', cost: 350, technician: 'أحمد' },
      { date: '2024-09-01', type: 'preventive', description: 'فحص الإطارات', cost: 200, technician: 'محمد' },
    ]
  },
];

const maintenanceHistory = [
  { week: 'أسبوع 1', preventive: 5, corrective: 2, emergency: 1 },
  { week: 'أسبوع 2', preventive: 6, corrective: 1, emergency: 0 },
  { week: 'أسبوع 3', preventive: 4, corrective: 3, emergency: 2 },
  { week: 'أسبوع 4', preventive: 7, corrective: 1, emergency: 0 },
];

const spareParts = [
  { name: 'فلتر زيت', stock: 25, minStock: 10, predicted: 8, unit: 'قطعة' },
  { name: 'فلتر هواء', stock: 18, minStock: 8, predicted: 5, unit: 'قطعة' },
  { name: 'بطانة فرامل', stock: 12, minStock: 15, predicted: 12, unit: 'طقم' },
  { name: 'زيت هيدروليك', stock: 45, minStock: 20, predicted: 15, unit: 'لتر' },
  { name: 'حساس حرارة', stock: 5, minStock: 5, predicted: 3, unit: 'قطعة' },
];

export default function FleetPredictiveMaintenance() {
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [predictions, setPredictions] = useState({});
  const [activeTab, setActiveTab] = useState('health');
  const [expandedTruck, setExpandedTruck] = useState(null);
  const [showHistory, setShowHistory] = useState(null);

  const predictMaintenance = useMutation({
    mutationFn: async (truck) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في صيانة أسطول شاحنات النفايات، حلل بيانات CAN Bus التالية وقدم توقعات الصيانة:

الشاحنة: ${truck.id} - ${truck.plate}
إجمالي الكيلومترات: ${truck.totalKm} كم
آخر صيانة: ${truck.lastMaintenance}

بيانات CAN Bus الحالية:
- حرارة المحرك: ${truck.canBus.engineTemp}°C (الطبيعي: 75-95°C)
- ضغط الهيدروليك: ${truck.canBus.hydraulicPressure} PSI (الطبيعي: 150-180 PSI)
- RPM: ${truck.canBus.rpm}
- ضغط الزيت: ${truck.canBus.oilPressure} PSI (الطبيعي: 40-60 PSI)
- كفاءة الوقود: ${truck.canBus.fuelEfficiency} لتر/100كم
- تآكل الفرامل: ${truck.canBus.brakeWear}% (الحد الأقصى: 80%)
- حرارة ناقل الحركة: ${truck.canBus.transmissionTemp}°C
- ضغط الوقود: ${truck.canBus.fuelPressure} PSI (الطبيعي: 40-50 PSI)
- جهد البطارية: ${truck.canBus.batteryVoltage}V (الطبيعي: 12.4-12.8V)
- صحة البطارية: ${truck.canBus.batteryHealth}%
- عداد المسافات: ${truck.canBus.odometer} كم
- مستوى سائل التبريد: ${truck.canBus.coolantLevel}%
- حرارة العادم: ${truck.canBus.exhaustTemp}°C
- ضغط التيربو: ${truck.canBus.turboBoost} بار

سجل الصيانة السابق:
${truck.maintenanceHistory?.map(m => `- ${m.date}: ${m.type} - ${m.description} (${m.cost} ر.س)`).join('\n') || 'لا يوجد سجل'}

قدم:
1. الأعطال المحتملة مع احتمالية حدوثها
2. الوقت المتوقع للعطل
3. قطع الغيار المطلوبة
4. التكلفة التقديرية
5. أولوية الصيانة وتوصيات`,
        response_json_schema: {
          type: "object",
          properties: {
            overallHealthScore: { type: "number" },
            predictedFailures: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  component: { type: "string" },
                  failureProbability: { type: "number" },
                  estimatedTimeToFailure: { type: "string" },
                  severity: { type: "string" },
                  symptoms: { type: "array", items: { type: "string" } }
                }
              }
            },
            requiredParts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  partName: { type: "string" },
                  quantity: { type: "number" },
                  estimatedCost: { type: "number" },
                  urgency: { type: "string" }
                }
              }
            },
            maintenanceSchedule: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  task: { type: "string" },
                  priority: { type: "string" },
                  recommendedDate: { type: "string" },
                  estimatedDuration: { type: "string" }
                }
              }
            },
            totalEstimatedCost: { type: "number" },
            downtimePrevented: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data, truck) => {
      setPredictions(prev => ({ ...prev, [truck.id]: data }));
      toast.success(`تم تحليل ${truck.plate}`);
    }
  });

  const analyzeFleet = useMutation({
    mutationFn: async () => {
      const fleetSummary = fleetHealthData.map(t => `${t.id}: صحة ${t.healthScore}%, حرارة ${t.canBus.engineTemp}°C, فرامل ${t.canBus.brakeWear}%`).join('\n');
      return await base44.integrations.Core.InvokeLLM({
        prompt: `حلل حالة أسطول شاحنات النفايات بالكامل:

${fleetSummary}

المخزون الحالي:
${spareParts.map(p => `${p.name}: ${p.stock} (الحد الأدنى: ${p.minStock})`).join('\n')}

قدم:
1. تقييم شامل للأسطول
2. أولويات الصيانة
3. توقعات الطلب على قطع الغيار
4. توصيات لتحسين الكفاءة`,
        response_json_schema: {
          type: "object",
          properties: {
            fleetHealthScore: { type: "number" },
            criticalVehicles: { type: "array", items: { type: "string" } },
            maintenancePriorities: { type: "array", items: { type: "object", properties: { vehicleId: { type: "string" }, priority: { type: "string" }, action: { type: "string" } } } },
            partsForecasting: { type: "array", items: { type: "object", properties: { partName: { type: "string" }, currentStock: { type: "number" }, predictedDemand: { type: "number" }, reorderNeeded: { type: "boolean" } } } },
            costSavings: { type: "number" },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setPredictions(prev => ({ ...prev, fleet: data }));
      toast.success('تم تحليل الأسطول بالكامل');
    }
  });

  const getRiskColor = (level) => {
    switch (level) {
      case 'critical': return 'red';
      case 'medium': return 'amber';
      default: return 'green';
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'amber';
    return 'red';
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          الصيانة التنبؤية للأسطول
        </h3>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => analyzeFleet.mutate()} disabled={analyzeFleet.isPending}>
          {analyzeFleet.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
          تحليل شامل AI
        </Button>
      </div>

      {/* Fleet Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'صحة الأسطول', value: `${Math.round(fleetHealthData.reduce((s, t) => s + t.healthScore, 0) / fleetHealthData.length)}%`, color: 'green', icon: Activity },
          { label: 'حرجة', value: fleetHealthData.filter(t => t.riskLevel === 'critical').length, color: 'red', icon: AlertTriangle },
          { label: 'تحتاج صيانة', value: fleetHealthData.filter(t => t.riskLevel !== 'low').length, color: 'amber', icon: Wrench },
          { label: 'قطع ناقصة', value: spareParts.filter(p => p.stock < p.minStock).length, color: 'purple', icon: Package },
          { label: 'توفير متوقع', value: '15,000 ر.س', color: 'cyan', icon: DollarSign },
        ].map(stat => (
          <Card key={stat.label} className={`bg-${stat.color}-500/10 border-${stat.color}-500/30`}>
            <CardContent className="p-3 text-center">
              <stat.icon className={`w-5 h-5 text-${stat.color}-400 mx-auto mb-1`} />
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className={`text-${stat.color}-400 text-xs`}>{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="health" className="data-[state=active]:bg-green-500/20">صحة المركبات</TabsTrigger>
          <TabsTrigger value="predictions" className="data-[state=active]:bg-purple-500/20">التوقعات</TabsTrigger>
          <TabsTrigger value="parts" className="data-[state=active]:bg-cyan-500/20">قطع الغيار</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-500/20">التحليلات</TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-red-500/20">التقارير المفصلة</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="mt-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {fleetHealthData.map(truck => (
                <Card key={truck.id} className={`glass-card border-${getRiskColor(truck.riskLevel)}-500/30 bg-[#0f1629]/80`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-${getRiskColor(truck.riskLevel)}-500/20`}>
                          <Truck className={`w-6 h-6 text-${getRiskColor(truck.riskLevel)}-400`} />
                        </div>
                        <div>
                          <p className="text-white font-bold">{truck.plate}</p>
                          <p className="text-slate-400 text-sm">{truck.totalKm.toLocaleString()} كم</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-left">
                          <p className={`text-2xl font-bold text-${getHealthColor(truck.healthScore)}-400`}>{truck.healthScore}%</p>
                          <p className="text-slate-500 text-xs">صحة المركبة</p>
                        </div>
                        <Badge className={`bg-${getRiskColor(truck.riskLevel)}-500/20 text-${getRiskColor(truck.riskLevel)}-400`}>
                          {truck.riskLevel === 'critical' ? 'حرج' : truck.riskLevel === 'medium' ? 'متوسط' : 'منخفض'}
                        </Badge>
                      </div>
                    </div>

                    {/* CAN Bus Data - Basic */}
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mb-2">
                      {[
                        { label: 'حرارة المحرك', value: `${truck.canBus.engineTemp}°`, icon: ThermometerSun, danger: truck.canBus.engineTemp > 95 },
                        { label: 'هيدروليك', value: `${truck.canBus.hydraulicPressure}`, icon: Gauge, danger: truck.canBus.hydraulicPressure > 180 },
                        { label: 'RPM', value: truck.canBus.rpm, icon: Activity, danger: false },
                        { label: 'ضغط الزيت', value: `${truck.canBus.oilPressure}`, icon: Droplets, danger: truck.canBus.oilPressure < 40 },
                        { label: 'الوقود', value: `${truck.canBus.fuelEfficiency}L`, icon: Zap, danger: truck.canBus.fuelEfficiency > 10 },
                        { label: 'الفرامل', value: `${truck.canBus.brakeWear}%`, icon: Target, danger: truck.canBus.brakeWear > 60 },
                        { label: 'ناقل الحركة', value: `${truck.canBus.transmissionTemp}°`, icon: Settings, danger: truck.canBus.transmissionTemp > 90 },
                      ].map(sensor => (
                        <div key={sensor.label} className={`p-2 rounded text-center ${sensor.danger ? 'bg-red-500/20' : 'bg-slate-800/50'}`}>
                          <sensor.icon className={`w-3 h-3 mx-auto ${sensor.danger ? 'text-red-400' : 'text-slate-400'}`} />
                          <p className={`text-sm font-bold ${sensor.danger ? 'text-red-400' : 'text-white'}`}>{sensor.value}</p>
                          <p className="text-slate-500 text-[9px]">{sensor.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Expandable CAN Bus Data */}
                    {expandedTruck === truck.id && (
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3 p-2 bg-slate-900/50 rounded-lg">
                        {[
                          { label: 'ضغط الوقود', value: `${truck.canBus.fuelPressure} PSI`, danger: truck.canBus.fuelPressure < 40 },
                          { label: 'البطارية', value: `${truck.canBus.batteryVoltage}V`, danger: truck.canBus.batteryVoltage < 12.2 },
                          { label: 'صحة البطارية', value: `${truck.canBus.batteryHealth}%`, danger: truck.canBus.batteryHealth < 70 },
                          { label: 'سائل التبريد', value: `${truck.canBus.coolantLevel}%`, danger: truck.canBus.coolantLevel < 60 },
                          { label: 'حرارة العادم', value: `${truck.canBus.exhaustTemp}°`, danger: truck.canBus.exhaustTemp > 400 },
                          { label: 'التيربو', value: `${truck.canBus.turboBoost} بار`, danger: truck.canBus.turboBoost < 1 },
                        ].map(sensor => (
                          <div key={sensor.label} className={`p-2 rounded text-center ${sensor.danger ? 'bg-red-500/20' : 'bg-slate-800/50'}`}>
                            <p className={`text-xs font-bold ${sensor.danger ? 'text-red-400' : 'text-white'}`}>{sensor.value}</p>
                            <p className="text-slate-500 text-[8px]">{sensor.label}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="w-full text-xs text-slate-400 hover:text-white mb-2"
                      onClick={() => setExpandedTruck(expandedTruck === truck.id ? null : truck.id)}
                    >
                      {expandedTruck === truck.id ? 'إخفاء التفاصيل' : 'عرض المزيد من بيانات CAN Bus'}
                    </Button>

                    {/* Issues */}
                    {truck.issues.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {truck.issues.map((issue, i) => (
                          <Badge key={i} className="bg-red-500/20 text-red-400 text-xs">{issue}</Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="text-slate-500 text-xs">
                        <span>آخر صيانة: {truck.lastMaintenance}</span>
                        <span className="mx-2">|</span>
                        <span className={truck.nextScheduled === 'عاجل' ? 'text-red-400' : ''}>القادمة: {truck.nextScheduled}</span>
                        <span className="mx-2">|</span>
                        <span>العداد: {truck.canBus.odometer.toLocaleString()} كم</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-400" onClick={() => setShowHistory(showHistory === truck.id ? null : truck.id)}>
                          <Clock className="w-3 h-3 ml-1" />
                          السجل
                        </Button>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => { setSelectedTruck(truck); predictMaintenance.mutate(truck); }} disabled={predictMaintenance.isPending}>
                          <Brain className="w-3 h-3 ml-1" />
                          تحليل AI
                        </Button>
                      </div>
                    </div>

                    {/* Maintenance History */}
                    {showHistory === truck.id && truck.maintenanceHistory && (
                      <div className="mt-3 p-3 bg-slate-900/50 rounded-lg">
                        <p className="text-slate-400 text-xs font-medium mb-2">سجل الصيانة</p>
                        <div className="space-y-2">
                          {truck.maintenanceHistory.map((record, i) => (
                            <div key={i} className={`p-2 rounded flex items-center justify-between ${record.type === 'emergency' ? 'bg-red-500/10' : record.type === 'corrective' ? 'bg-amber-500/10' : 'bg-green-500/10'}`}>
                              <div className="flex items-center gap-2">
                                <Badge className={`text-xs ${record.type === 'emergency' ? 'bg-red-500/20 text-red-400' : record.type === 'corrective' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                                  {record.type === 'emergency' ? 'طارئة' : record.type === 'corrective' ? 'تصحيحية' : 'وقائية'}
                                </Badge>
                                <span className="text-white text-xs">{record.description}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-slate-400">{record.date}</span>
                                <span className="text-cyan-400">{record.cost} ر.س</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="predictions" className="mt-4">
          {selectedTruck && predictions[selectedTruck.id] ? (
            <div className="space-y-4">
              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">توقعات الصيانة - {selectedTruck.plate}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-3 mb-4">
                    <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-purple-400">{predictions[selectedTruck.id].overallHealthScore || selectedTruck.healthScore}%</p>
                      <p className="text-slate-400 text-xs">الصحة المتوقعة</p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-amber-400">{predictions[selectedTruck.id].totalEstimatedCost?.toLocaleString() || 0}</p>
                      <p className="text-slate-400 text-xs">التكلفة التقديرية (ر.س)</p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-green-400">{predictions[selectedTruck.id].downtimePrevented || '3 أيام'}</p>
                      <p className="text-slate-400 text-xs">توقف يمكن تجنبه</p>
                    </div>
                  </div>

                  {/* Predicted Failures */}
                  {predictions[selectedTruck.id].predictedFailures?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-white font-medium mb-2">الأعطال المتوقعة</p>
                      <div className="space-y-2">
                        {predictions[selectedTruck.id].predictedFailures.map((failure, i) => (
                          <div key={i} className={`p-3 rounded-lg ${failure.severity === 'high' ? 'bg-red-500/10 border border-red-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-white font-medium">{failure.component}</p>
                              <Badge className={failure.severity === 'high' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}>
                                {failure.failureProbability}%
                              </Badge>
                            </div>
                            <p className="text-slate-400 text-sm">الوقت المتوقع: {failure.estimatedTimeToFailure}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Required Parts */}
                  {predictions[selectedTruck.id].requiredParts?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-white font-medium mb-2">قطع الغيار المطلوبة</p>
                      <div className="grid grid-cols-2 gap-2">
                        {predictions[selectedTruck.id].requiredParts.map((part, i) => (
                          <div key={i} className="p-2 bg-slate-800/50 rounded flex items-center justify-between">
                            <span className="text-white text-sm">{part.partName} x{part.quantity}</span>
                            <span className="text-cyan-400 text-sm">{part.estimatedCost} ر.س</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {predictions[selectedTruck.id].recommendations?.length > 0 && (
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-green-400 font-medium mb-2">التوصيات</p>
                      <ul className="space-y-1">
                        {predictions[selectedTruck.id].recommendations.map((rec, i) => (
                          <li key={i} className="text-white text-sm flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">اختر شاحنة واضغط "تحليل AI" لعرض التوقعات</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="parts" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">إدارة قطع الغيار التنبؤية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {spareParts.map(part => (
                  <div key={part.name} className={`p-3 rounded-lg ${part.stock < part.minStock ? 'bg-red-500/10 border border-red-500/30' : 'bg-slate-800/50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium">{part.name}</p>
                      <div className="flex items-center gap-2">
                        {part.stock < part.minStock && <Badge className="bg-red-500 text-white">نقص</Badge>}
                        <span className={`font-bold ${part.stock < part.minStock ? 'text-red-400' : 'text-green-400'}`}>
                          {part.stock} {part.unit}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-400">الحد الأدنى: {part.minStock}</span>
                      <span className="text-cyan-400">الطلب المتوقع: {part.predicted}</span>
                    </div>
                    <Progress value={(part.stock / (part.minStock * 2)) * 100} className="h-2 mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">تحليلات الصيانة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={maintenanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="preventive" fill="#22c55e" name="وقائية" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="corrective" fill="#f59e0b" name="تصحيحية" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="emergency" fill="#ef4444" name="طارئة" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <MaintenanceReportsModule />
        </TabsContent>
      </Tabs>
    </div>
  );
}