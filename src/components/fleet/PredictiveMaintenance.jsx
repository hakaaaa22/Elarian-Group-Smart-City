import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Wrench, AlertTriangle, Calendar, DollarSign, TrendingUp, Car,
  Clock, CheckCircle, XCircle, Settings, Filter, RefreshCw, Loader2,
  Thermometer, Gauge, Battery, Droplets, Disc, Wind, Cog, Activity,
  ArrowRight, ChevronDown, BarChart3, Target, Zap, Brain, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const componentTypes = [
  { id: 'brakes', name: 'الفرامل', icon: Disc, color: 'red', lifespan: 50000 },
  { id: 'tires', name: 'الإطارات', icon: Target, color: 'amber', lifespan: 60000 },
  { id: 'battery', name: 'البطارية', icon: Battery, color: 'green', lifespan: 36 },
  { id: 'oil', name: 'زيت المحرك', icon: Droplets, color: 'yellow', lifespan: 10000 },
  { id: 'filters', name: 'الفلاتر', icon: Wind, color: 'blue', lifespan: 15000 },
  { id: 'transmission', name: 'ناقل الحركة', icon: Cog, color: 'purple', lifespan: 100000 },
  { id: 'engine', name: 'المحرك', icon: Settings, color: 'slate', lifespan: 200000 },
  { id: 'cooling', name: 'نظام التبريد', icon: Thermometer, color: 'cyan', lifespan: 80000 },
];

const mockVehiclePredictions = [
  {
    id: 'v1',
    plate: 'ABC-123',
    type: 'patrol_car',
    mileage: 45000,
    predictions: [
      { component: 'brakes', health: 35, daysLeft: 15, cost: 1200, urgency: 'high' },
      { component: 'oil', health: 25, daysLeft: 7, cost: 150, urgency: 'critical' },
      { component: 'tires', health: 60, daysLeft: 45, cost: 2400, urgency: 'medium' },
    ]
  },
  {
    id: 'v2',
    plate: 'XYZ-789',
    type: 'suv',
    mileage: 78000,
    predictions: [
      { component: 'transmission', health: 55, daysLeft: 60, cost: 5000, urgency: 'medium' },
      { component: 'battery', health: 40, daysLeft: 30, cost: 800, urgency: 'medium' },
    ]
  },
  {
    id: 'v3',
    plate: 'DEF-456',
    type: 'van',
    mileage: 120000,
    predictions: [
      { component: 'engine', health: 70, daysLeft: 90, cost: 3000, urgency: 'low' },
      { component: 'filters', health: 20, daysLeft: 10, cost: 200, urgency: 'high' },
    ]
  },
];

const healthTrendData = [
  { month: 'يناير', health: 95, cost: 2000 },
  { month: 'فبراير', health: 92, cost: 1500 },
  { month: 'مارس', health: 88, cost: 3500 },
  { month: 'أبريل', health: 85, cost: 2800 },
  { month: 'مايو', health: 90, cost: 1200 },
  { month: 'يونيو', health: 87, cost: 4000 },
];

export default function PredictiveMaintenance({ vehicles = [] }) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [analysisResult, setAnalysisResult] = useState(null);

  // AI Prediction Analysis
  const predictMutation = useMutation({
    mutationFn: async (vehicle) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير في الصيانة التنبؤية للمركبات.

قم بتحليل بيانات المركبة التالية وتقديم توقعات دقيقة:

المركبة: ${vehicle.plate}
النوع: ${vehicle.type}
المسافة المقطوعة: ${vehicle.mileage} كم
سجل الصيانة السابق: متوسط

قدم:
1. توقعات تفصيلية لكل مكون
2. الأولويات والجدول الزمني
3. تقدير التكاليف
4. نصائح لإطالة عمر المكونات
5. مقارنة بمعايير الصناعة`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_health_score: { type: "number" },
            risk_level: { type: "string" },
            component_predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  component: { type: "string" },
                  current_health: { type: "number" },
                  predicted_failure_date: { type: "string" },
                  confidence: { type: "number" },
                  estimated_cost: { type: "number" },
                  urgency: { type: "string" },
                  symptoms: { type: "array", items: { type: "string" } },
                  recommendation: { type: "string" }
                }
              }
            },
            maintenance_schedule: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  tasks: { type: "array", items: { type: "string" } },
                  estimated_duration: { type: "string" },
                  total_cost: { type: "number" }
                }
              }
            },
            cost_forecast: {
              type: "object",
              properties: {
                next_month: { type: "number" },
                next_quarter: { type: "number" },
                next_year: { type: "number" }
              }
            },
            optimization_tips: { type: "array", items: { type: "string" } },
            comparison_to_fleet: {
              type: "object",
              properties: {
                percentile: { type: "number" },
                better_than_average: { type: "boolean" },
                areas_of_concern: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast.success('تم تحليل المركبة بنجاح');
    },
    onError: () => {
      toast.error('فشل في التحليل');
    }
  });

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'amber';
      case 'low': return 'green';
      default: return 'slate';
    }
  };

  const getUrgencyLabel = (urgency) => {
    switch (urgency) {
      case 'critical': return 'حرج';
      case 'high': return 'عالي';
      case 'medium': return 'متوسط';
      case 'low': return 'منخفض';
      default: return urgency;
    }
  };

  const filteredVehicles = mockVehiclePredictions.filter(v => {
    if (filterUrgency === 'all') return true;
    return v.predictions.some(p => p.urgency === filterUrgency);
  });

  const totalCost = mockVehiclePredictions.reduce((acc, v) => 
    acc + v.predictions.reduce((a, p) => a + p.cost, 0), 0
  );

  const criticalCount = mockVehiclePredictions.reduce((acc, v) =>
    acc + v.predictions.filter(p => p.urgency === 'critical' || p.urgency === 'high').length, 0
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/20">
            <Wrench className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">الصيانة التنبؤية</h2>
            <p className="text-slate-400 text-sm">توقع الأعطال قبل حدوثها</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{criticalCount}</p>
                <p className="text-slate-400 text-xs">تنبيهات عاجلة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalCost.toLocaleString()}</p>
                <p className="text-slate-400 text-xs">تكلفة متوقعة (ر.س)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Calendar className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-slate-400 text-xs">صيانة مجدولة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">87%</p>
                <p className="text-slate-400 text-xs">صحة الأسطول</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Vehicles List */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm">المركبات</CardTitle>
              <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                <SelectTrigger className="w-28 bg-slate-800/50 border-slate-700 text-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="critical">حرج</SelectItem>
                  <SelectItem value="high">عالي</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="low">منخفض</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredVehicles.map(vehicle => {
              const worstPrediction = vehicle.predictions.reduce((worst, p) => 
                p.health < (worst?.health || 100) ? p : worst, null
              );
              return (
                <div
                  key={vehicle.id}
                  onClick={() => {
                    setSelectedVehicle(vehicle);
                    setAnalysisResult(null);
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedVehicle?.id === vehicle.id
                      ? 'bg-purple-500/20 border border-purple-500/50'
                      : 'bg-slate-800/50 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-slate-400" />
                      <span className="text-white font-medium">{vehicle.plate}</span>
                    </div>
                    <Badge className={`bg-${getUrgencyColor(worstPrediction?.urgency)}-500/20 text-${getUrgencyColor(worstPrediction?.urgency)}-400`}>
                      {getUrgencyLabel(worstPrediction?.urgency)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{vehicle.mileage.toLocaleString()} كم</span>
                    <span className="text-slate-400">{vehicle.predictions.length} تنبيهات</span>
                  </div>
                  <Progress value={worstPrediction?.health || 0} className="h-1.5 mt-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Vehicle Details */}
        <div className="lg:col-span-2 space-y-4">
          {selectedVehicle ? (
            <>
              {/* Vehicle Header */}
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-purple-500/20">
                        <Car className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{selectedVehicle.plate}</h3>
                        <p className="text-slate-400 text-sm">المسافة: {selectedVehicle.mileage.toLocaleString()} كم</p>
                      </div>
                    </div>
                    <Button
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => predictMutation.mutate(selectedVehicle)}
                      disabled={predictMutation.isPending}
                    >
                      {predictMutation.isPending ? (
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      ) : (
                        <Brain className="w-4 h-4 ml-2" />
                      )}
                      تحليل AI متقدم
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Component Predictions */}
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader>
                  <CardTitle className="text-white text-sm">توقعات المكونات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedVehicle.predictions.map((pred, i) => {
                    const comp = componentTypes.find(c => c.id === pred.component);
                    const CompIcon = comp?.icon || Cog;
                    return (
                      <div key={i} className="p-4 bg-slate-800/50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-${comp?.color}-500/20`}>
                              <CompIcon className={`w-5 h-5 text-${comp?.color}-400`} />
                            </div>
                            <div>
                              <p className="text-white font-medium">{comp?.name}</p>
                              <p className="text-slate-500 text-xs">{pred.daysLeft} يوم متبقي</p>
                            </div>
                          </div>
                          <div className="text-left">
                            <Badge className={`bg-${getUrgencyColor(pred.urgency)}-500/20 text-${getUrgencyColor(pred.urgency)}-400`}>
                              {getUrgencyLabel(pred.urgency)}
                            </Badge>
                            <p className="text-green-400 text-sm mt-1">{pred.cost.toLocaleString()} ر.س</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">صحة المكون</span>
                            <span className="text-white">{pred.health}%</span>
                          </div>
                          <Progress 
                            value={pred.health} 
                            className={`h-2 ${pred.health < 30 ? '[&>div]:bg-red-500' : pred.health < 60 ? '[&>div]:bg-amber-500' : '[&>div]:bg-green-500'}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* AI Analysis Results */}
              {analysisResult && (
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-400" />
                      تحليل الذكاء الاصطناعي
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Overall Score */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                        <p className="text-3xl font-bold text-cyan-400">{analysisResult.overall_health_score}%</p>
                        <p className="text-slate-400 text-xs">الصحة العامة</p>
                      </div>
                      <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                        <Badge className={`bg-${getUrgencyColor(analysisResult.risk_level)}-500/20 text-${getUrgencyColor(analysisResult.risk_level)}-400`}>
                          {getUrgencyLabel(analysisResult.risk_level)}
                        </Badge>
                        <p className="text-slate-400 text-xs mt-1">مستوى المخاطر</p>
                      </div>
                      <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                        <p className="text-xl font-bold text-green-400">
                          {analysisResult.cost_forecast?.next_month?.toLocaleString()}
                        </p>
                        <p className="text-slate-400 text-xs">تكلفة الشهر القادم</p>
                      </div>
                    </div>

                    {/* Maintenance Schedule */}
                    {analysisResult.maintenance_schedule?.length > 0 && (
                      <div>
                        <p className="text-slate-400 text-xs mb-2">جدول الصيانة المقترح</p>
                        {analysisResult.maintenance_schedule.slice(0, 3).map((schedule, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-slate-900/50 rounded mb-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-amber-400" />
                              <span className="text-white text-xs">{schedule.date}</span>
                            </div>
                            <span className="text-slate-400 text-xs">{schedule.tasks?.join(', ')}</span>
                            <span className="text-green-400 text-xs">{schedule.total_cost?.toLocaleString()} ر.س</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Optimization Tips */}
                    {analysisResult.optimization_tips?.length > 0 && (
                      <div>
                        <p className="text-slate-400 text-xs mb-2">نصائح للتحسين</p>
                        <ul className="space-y-1">
                          {analysisResult.optimization_tips.map((tip, i) => (
                            <li key={i} className="text-white text-xs flex items-start gap-2">
                              <Sparkles className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="py-16 text-center">
                <Car className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">اختر مركبة لعرض تفاصيل الصيانة التنبؤية</p>
              </CardContent>
            </Card>
          )}

          {/* Health Trend Chart */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">اتجاه صحة الأسطول والتكاليف</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={healthTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                  <YAxis yAxisId="left" stroke="#94a3b8" fontSize={10} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
                  <Area yAxisId="left" type="monotone" dataKey="health" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} name="الصحة %" />
                  <Area yAxisId="right" type="monotone" dataKey="cost" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} name="التكلفة" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}