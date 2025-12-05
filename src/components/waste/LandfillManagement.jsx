import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Mountain, MapPin, AlertTriangle, TrendingUp, Clock, Gauge, Brain,
  RefreshCw, Plus, Eye, Settings, BarChart3, Thermometer, Droplets,
  Wind, Activity, Calendar, Target, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { toast } from 'sonner';

const landfillsData = [
  {
    id: 'LF-001',
    name: 'مكب النفايات الشمالي',
    location: 'شمال المدينة - طريق الدائري',
    lat: 24.8500,
    lng: 46.7200,
    totalCapacity: 500000, // طن
    currentFill: 385000,
    fillPercentage: 77,
    wasteTypes: ['عامة', 'إنشائية'],
    status: 'active',
    openDate: '2018-03-15',
    estimatedLifespan: '2027-06',
    dailyIntake: 850,
    sensors: {
      methane: 42,
      co2: 28,
      temperature: 35,
      moisture: 45,
      leachate: 'normal'
    },
    alerts: [],
    monthlyData: [
      { month: 'يوليو', intake: 25000, capacity: 72 },
      { month: 'أغسطس', intake: 26500, capacity: 73 },
      { month: 'سبتمبر', intake: 24800, capacity: 74 },
      { month: 'أكتوبر', intake: 27200, capacity: 75 },
      { month: 'نوفمبر', intake: 26000, capacity: 77 },
    ]
  },
  {
    id: 'LF-002',
    name: 'مكب النفايات الصناعي',
    location: 'المنطقة الصناعية الثانية',
    lat: 24.6800,
    lng: 46.7500,
    totalCapacity: 200000,
    currentFill: 178000,
    fillPercentage: 89,
    wasteTypes: ['صناعية', 'خطرة'],
    status: 'critical',
    openDate: '2015-08-20',
    estimatedLifespan: '2025-03',
    dailyIntake: 320,
    sensors: {
      methane: 68,
      co2: 45,
      temperature: 42,
      moisture: 38,
      leachate: 'elevated'
    },
    alerts: [
      { type: 'capacity', message: 'اقتراب من السعة القصوى', severity: 'critical' },
      { type: 'gas', message: 'ارتفاع مستوى الميثان', severity: 'high' }
    ],
    monthlyData: [
      { month: 'يوليو', intake: 9500, capacity: 84 },
      { month: 'أغسطس', intake: 10200, capacity: 85 },
      { month: 'سبتمبر', intake: 9800, capacity: 87 },
      { month: 'أكتوبر', intake: 10500, capacity: 88 },
      { month: 'نوفمبر', intake: 9200, capacity: 89 },
    ]
  },
  {
    id: 'LF-003',
    name: 'مكب النفايات العضوية',
    location: 'جنوب المدينة - منطقة المعالجة',
    lat: 24.6200,
    lng: 46.6800,
    totalCapacity: 150000,
    currentFill: 67500,
    fillPercentage: 45,
    wasteTypes: ['عضوية', 'زراعية'],
    status: 'active',
    openDate: '2020-01-10',
    estimatedLifespan: '2032-12',
    dailyIntake: 420,
    sensors: {
      methane: 55,
      co2: 35,
      temperature: 38,
      moisture: 62,
      leachate: 'normal'
    },
    alerts: [],
    monthlyData: [
      { month: 'يوليو', intake: 12500, capacity: 40 },
      { month: 'أغسطس', intake: 13200, capacity: 41 },
      { month: 'سبتمبر', intake: 12800, capacity: 43 },
      { month: 'أكتوبر', intake: 13500, capacity: 44 },
      { month: 'نوفمبر', intake: 12600, capacity: 45 },
    ]
  },
];

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];

export default function LandfillManagement() {
  const [selectedLandfill, setSelectedLandfill] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState({});

  const analyzeLandfill = useMutation({
    mutationFn: async (landfill) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في إدارة المكبات وتحليل البيانات البيئية، قدم تحليلاً شاملاً للمكب:

المكب: ${landfill.name}
السعة الإجمالية: ${landfill.totalCapacity.toLocaleString()} طن
الامتلاء الحالي: ${landfill.currentFill.toLocaleString()} طن (${landfill.fillPercentage}%)
تاريخ الافتتاح: ${landfill.openDate}
العمر الافتراضي المتوقع: ${landfill.estimatedLifespan}
الاستقبال اليومي: ${landfill.dailyIntake} طن

قراءات الاستشعار:
- الميثان: ${landfill.sensors.methane} ppm
- CO2: ${landfill.sensors.co2}%
- الحرارة: ${landfill.sensors.temperature}°C
- الرطوبة: ${landfill.sensors.moisture}%
- الراشح: ${landfill.sensors.leachate}

البيانات الشهرية:
${landfill.monthlyData.map(m => `${m.month}: استقبال ${m.intake} طن، امتلاء ${m.capacity}%`).join('\n')}

قدم:
1. تقييم الحالة العامة
2. تقدير العمر الافتراضي المتبقي بدقة
3. تحليل المخاطر البيئية
4. توصيات لإطالة عمر المكب
5. خطة طوارئ مقترحة`,
        response_json_schema: {
          type: "object",
          properties: {
            overallAssessment: { type: "string" },
            healthScore: { type: "number" },
            remainingLifespan: {
              type: "object",
              properties: {
                optimistic: { type: "string" },
                realistic: { type: "string" },
                pessimistic: { type: "string" }
              }
            },
            environmentalRisks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk: { type: "string" },
                  severity: { type: "string" },
                  mitigation: { type: "string" }
                }
              }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  impact: { type: "string" },
                  timeline: { type: "string" }
                }
              }
            },
            emergencyPlan: { type: "array", items: { type: "string" } },
            capacityForecast: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  month: { type: "string" },
                  predictedFill: { type: "number" }
                }
              }
            }
          }
        }
      });
    },
    onSuccess: (data, landfill) => {
      setAiAnalysis(prev => ({ ...prev, [landfill.id]: data }));
      toast.success(`تم تحليل ${landfill.name}`);
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'red';
      case 'warning': return 'amber';
      default: return 'green';
    }
  };

  const getFillColor = (percentage) => {
    if (percentage >= 85) return 'red';
    if (percentage >= 70) return 'amber';
    return 'green';
  };

  const stats = {
    totalCapacity: landfillsData.reduce((s, l) => s + l.totalCapacity, 0),
    totalFill: landfillsData.reduce((s, l) => s + l.currentFill, 0),
    avgFill: Math.round(landfillsData.reduce((s, l) => s + l.fillPercentage, 0) / landfillsData.length),
    critical: landfillsData.filter(l => l.status === 'critical').length,
    dailyIntake: landfillsData.reduce((s, l) => s + l.dailyIntake, 0),
  };

  const capacityData = landfillsData.map(l => ({
    name: l.name.split(' ').slice(-1)[0],
    الامتلاء: l.fillPercentage,
    المتبقي: 100 - l.fillPercentage,
  }));

  const wasteTypeData = [
    { name: 'عامة', value: 45 },
    { name: 'صناعية', value: 25 },
    { name: 'عضوية', value: 20 },
    { name: 'إنشائية', value: 10 },
  ];

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Mountain className="w-5 h-5 text-amber-400" />
          إدارة المكبات
        </h3>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 ml-2" />
          إضافة مكب
        </Button>
      </div>

      {/* Alerts */}
      {landfillsData.some(l => l.alerts.length > 0) && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
              <div>
                <p className="text-red-400 font-medium">تنبيهات المكبات</p>
                {landfillsData.filter(l => l.alerts.length > 0).map(l => (
                  <p key={l.id} className="text-white text-sm">
                    {l.name}: {l.alerts.map(a => a.message).join(' | ')}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'إجمالي السعة', value: `${(stats.totalCapacity / 1000).toFixed(0)}K طن`, color: 'cyan', icon: Mountain },
          { label: 'إجمالي الامتلاء', value: `${(stats.totalFill / 1000).toFixed(0)}K طن`, color: 'purple', icon: Gauge },
          { label: 'متوسط الامتلاء', value: `${stats.avgFill}%`, color: getFillColor(stats.avgFill), icon: TrendingUp },
          { label: 'مكبات حرجة', value: stats.critical, color: stats.critical > 0 ? 'red' : 'green', icon: AlertTriangle },
          { label: 'الاستقبال اليومي', value: `${stats.dailyIntake} طن`, color: 'blue', icon: Activity },
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

      <Tabs defaultValue="overview">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20">نظرة عامة</TabsTrigger>
          <TabsTrigger value="map" className="data-[state=active]:bg-green-500/20">الخريطة</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500/20">التحليلات</TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-amber-500/20">تحليل AI</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <ScrollArea className="h-[450px]">
            <div className="space-y-3">
              {landfillsData.map(landfill => (
                <Card key={landfill.id} className={`glass-card border-${getStatusColor(landfill.status)}-500/30 bg-[#0f1629]/80`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-${getStatusColor(landfill.status)}-500/20`}>
                          <Mountain className={`w-6 h-6 text-${getStatusColor(landfill.status)}-400`} />
                        </div>
                        <div>
                          <p className="text-white font-bold">{landfill.name}</p>
                          <p className="text-slate-400 text-sm flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {landfill.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`bg-${getStatusColor(landfill.status)}-500/20 text-${getStatusColor(landfill.status)}-400`}>
                          {landfill.status === 'critical' ? 'حرج' : 'نشط'}
                        </Badge>
                        <Button size="sm" variant="ghost" onClick={() => { setSelectedLandfill(landfill); setShowDetails(true); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Capacity Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500">الامتلاء</span>
                        <span className={`text-${getFillColor(landfill.fillPercentage)}-400 font-bold`}>{landfill.fillPercentage}%</span>
                      </div>
                      <Progress value={landfill.fillPercentage} className="h-3" />
                      <div className="flex items-center justify-between text-xs mt-1 text-slate-500">
                        <span>{landfill.currentFill.toLocaleString()} طن</span>
                        <span>{landfill.totalCapacity.toLocaleString()} طن</span>
                      </div>
                    </div>

                    {/* Sensors */}
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {[
                        { label: 'الميثان', value: `${landfill.sensors.methane}`, icon: Wind, danger: landfill.sensors.methane > 50 },
                        { label: 'CO2', value: `${landfill.sensors.co2}%`, icon: Activity, danger: landfill.sensors.co2 > 40 },
                        { label: 'الحرارة', value: `${landfill.sensors.temperature}°`, icon: Thermometer, danger: landfill.sensors.temperature > 40 },
                        { label: 'الرطوبة', value: `${landfill.sensors.moisture}%`, icon: Droplets, danger: false },
                        { label: 'الراشح', value: landfill.sensors.leachate === 'normal' ? 'طبيعي' : 'مرتفع', icon: Droplets, danger: landfill.sensors.leachate !== 'normal' },
                      ].map(sensor => (
                        <div key={sensor.label} className={`p-2 rounded text-center ${sensor.danger ? 'bg-red-500/20' : 'bg-slate-800/50'}`}>
                          <sensor.icon className={`w-3 h-3 mx-auto ${sensor.danger ? 'text-red-400' : 'text-slate-400'}`} />
                          <p className={`text-sm font-bold ${sensor.danger ? 'text-red-400' : 'text-white'}`}>{sensor.value}</p>
                          <p className="text-slate-500 text-[9px]">{sensor.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Info */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>الاستقبال اليومي: {landfill.dailyIntake} طن</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        العمر المتوقع: {landfill.estimatedLifespan}
                      </span>
                      <span>أنواع: {landfill.wasteTypes.join('، ')}</span>
                    </div>

                    {/* Alerts */}
                    {landfill.alerts.length > 0 && (
                      <div className="mt-3 p-2 bg-red-500/10 rounded">
                        {landfill.alerts.map((alert, i) => (
                          <p key={i} className="text-red-400 text-xs flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {alert.message}
                          </p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="map" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4">
              <div className="h-[400px] bg-slate-800/50 rounded-lg relative">
                {/* Map placeholder */}
                <div className="absolute inset-4 border border-slate-700 rounded">
                  {landfillsData.map((landfill, i) => (
                    <div 
                      key={landfill.id}
                      className="absolute cursor-pointer"
                      style={{ 
                        top: `${20 + i * 30}%`, 
                        left: `${20 + i * 25}%`,
                      }}
                      onClick={() => { setSelectedLandfill(landfill); setShowDetails(true); }}
                    >
                      <div className={`p-2 rounded-lg bg-${getStatusColor(landfill.status)}-500/20 border border-${getStatusColor(landfill.status)}-500/50`}>
                        <Mountain className={`w-6 h-6 text-${getStatusColor(landfill.status)}-400`} />
                      </div>
                      <p className="text-white text-xs mt-1 text-center">{landfill.fillPercentage}%</p>
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-4 right-4 bg-slate-900/80 p-2 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded bg-green-400" />
                    <span className="text-slate-400 text-xs">نشط</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded bg-amber-400" />
                    <span className="text-slate-400 text-xs">تحذير</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-400" />
                    <span className="text-slate-400 text-xs">حرج</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">مقارنة السعات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={capacityData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                      <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Bar dataKey="الامتلاء" fill="#ef4444" stackId="a" />
                      <Bar dataKey="المتبقي" fill="#22c55e" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">توزيع أنواع النفايات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={wasteTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {wasteTypeData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">اختر مكباً للتحليل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {landfillsData.map(landfill => (
                    <div 
                      key={landfill.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${selectedLandfill?.id === landfill.id ? 'bg-purple-500/20 border border-purple-500/50' : 'bg-slate-800/50 hover:bg-slate-800'}`}
                      onClick={() => setSelectedLandfill(landfill)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mountain className={`w-4 h-4 text-${getStatusColor(landfill.status)}-400`} />
                          <span className="text-white">{landfill.name}</span>
                        </div>
                        <Badge className={`bg-${getFillColor(landfill.fillPercentage)}-500/20 text-${getFillColor(landfill.fillPercentage)}-400`}>
                          {landfill.fillPercentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedLandfill && (
                  <Button 
                    className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                    onClick={() => analyzeLandfill.mutate(selectedLandfill)}
                    disabled={analyzeLandfill.isPending}
                  >
                    {analyzeLandfill.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
                    تحليل AI للعمر الافتراضي
                  </Button>
                )}
              </CardContent>
            </Card>

            {selectedLandfill && aiAnalysis[selectedLandfill.id] ? (
              <Card className="glass-card border-purple-500/30 bg-purple-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">تحليل AI - {selectedLandfill.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-3">
                      {/* Health Score */}
                      <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                        <p className={`text-4xl font-bold text-${getFillColor(100 - (aiAnalysis[selectedLandfill.id].healthScore || 50))}-400`}>
                          {aiAnalysis[selectedLandfill.id].healthScore || 75}
                        </p>
                        <p className="text-slate-400 text-xs">درجة الصحة</p>
                      </div>

                      {/* Lifespan */}
                      {aiAnalysis[selectedLandfill.id].remainingLifespan && (
                        <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                          <p className="text-cyan-400 text-xs mb-2">العمر الافتراضي المتبقي</p>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <p className="text-green-400 text-sm font-bold">{aiAnalysis[selectedLandfill.id].remainingLifespan.optimistic}</p>
                              <p className="text-slate-500 text-[10px]">متفائل</p>
                            </div>
                            <div>
                              <p className="text-white text-sm font-bold">{aiAnalysis[selectedLandfill.id].remainingLifespan.realistic}</p>
                              <p className="text-slate-500 text-[10px]">واقعي</p>
                            </div>
                            <div>
                              <p className="text-red-400 text-sm font-bold">{aiAnalysis[selectedLandfill.id].remainingLifespan.pessimistic}</p>
                              <p className="text-slate-500 text-[10px]">متشائم</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Risks */}
                      {aiAnalysis[selectedLandfill.id].environmentalRisks?.map((risk, i) => (
                        <div key={i} className={`p-2 rounded ${risk.severity === 'high' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                          <p className={`text-${risk.severity === 'high' ? 'red' : 'amber'}-400 text-sm font-medium`}>{risk.risk}</p>
                          <p className="text-slate-400 text-xs">{risk.mitigation}</p>
                        </div>
                      ))}

                      {/* Recommendations */}
                      {aiAnalysis[selectedLandfill.id].recommendations?.length > 0 && (
                        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                          <p className="text-green-400 text-xs mb-2">التوصيات</p>
                          {aiAnalysis[selectedLandfill.id].recommendations.map((rec, i) => (
                            <div key={i} className="flex items-start gap-2 mb-1">
                              <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                              <p className="text-white text-xs">{rec.action}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">اختر مكباً واضغط "تحليل AI"</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Mountain className="w-5 h-5 text-amber-400" />
              {selectedLandfill?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedLandfill && (
            <div className="space-y-4 mt-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedLandfill.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="capacity" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="الامتلاء %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 bg-slate-800/50 rounded">
                  <p className="text-slate-400 text-xs">السعة الإجمالية</p>
                  <p className="text-white font-bold">{selectedLandfill.totalCapacity.toLocaleString()} طن</p>
                </div>
                <div className="p-2 bg-slate-800/50 rounded">
                  <p className="text-slate-400 text-xs">الامتلاء الحالي</p>
                  <p className="text-white font-bold">{selectedLandfill.currentFill.toLocaleString()} طن</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}