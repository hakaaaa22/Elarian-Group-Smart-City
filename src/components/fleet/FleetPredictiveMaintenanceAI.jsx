import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, Wrench, AlertTriangle, Brain, TrendingUp, Clock, Calendar,
  Activity, Zap, Target, CheckCircle, XCircle, RefreshCw, Loader2,
  DollarSign, Timer, Settings, ChevronRight, Sparkles, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend
} from 'recharts';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';

const componentLabels = {
  engine: 'المحرك',
  transmission: 'ناقل الحركة',
  brakes: 'الفرامل',
  tires: 'الإطارات',
  battery: 'البطارية',
  fuel_system: 'نظام الوقود',
  electrical: 'النظام الكهربائي',
  suspension: 'نظام التعليق',
  cooling: 'نظام التبريد',
  exhaust: 'نظام العادم'
};

const severityConfig = {
  critical: { color: 'red', label: 'حرج', priority: 1 },
  high: { color: 'orange', label: 'عالي', priority: 2 },
  medium: { color: 'amber', label: 'متوسط', priority: 3 },
  low: { color: 'green', label: 'منخفض', priority: 4 }
};

export default function FleetPredictiveMaintenanceAI() {
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [showCreateWorkOrder, setShowCreateWorkOrder] = useState(false);
  const queryClient = useQueryClient();

  const { data: predictions = [], isLoading } = useQuery({
    queryKey: ['fleet-predictive-maintenance'],
    queryFn: () => base44.entities.FleetPredictiveMaintenance.list('-created_date', 50)
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list()
  });

  const analyzeMutation = useMutation({
    mutationFn: async (vehicleId) => {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (!vehicle) return;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير في صيانة الأسطول التنبؤية. قم بتحليل بيانات المركبة التالية والتنبؤ بالأعطال المحتملة:

المركبة: ${vehicle.name || vehicle.asset_number}
الموديل: ${vehicle.model || 'غير محدد'}
سنة الصنع: ${vehicle.year || 'غير محدد'}
قراءة العداد: ${vehicle.odometer || 0} كم
آخر صيانة: ${vehicle.last_service_date || 'غير محدد'}
نوع الوقود: ${vehicle.fuel_type || 'غير محدد'}

بناءً على هذه البيانات، قدم:
1. المكون الأكثر عرضة للفشل
2. احتمالية الفشل (نسبة مئوية)
3. الأيام المتوقعة حتى الفشل
4. شدة المشكلة
5. الإجراء الموصى به
6. التكلفة التقديرية للإصلاح
7. تحليل مفصل`,
        response_json_schema: {
          type: "object",
          properties: {
            component: { type: "string" },
            failure_probability: { type: "number" },
            days_until_failure: { type: "number" },
            severity: { type: "string" },
            recommended_action: { type: "string" },
            estimated_cost: { type: "number" },
            analysis: { type: "string" },
            health_score: { type: "number" }
          }
        }
      });

      const prediction = {
        vehicle_id: vehicleId,
        vehicle_name: vehicle.name || vehicle.asset_number,
        component: analysis.component,
        current_health_score: analysis.health_score,
        predicted_failure_date: new Date(Date.now() + analysis.days_until_failure * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        days_until_failure: analysis.days_until_failure,
        failure_probability: analysis.failure_probability,
        severity: analysis.severity,
        recommended_action: analysis.recommended_action,
        estimated_repair_cost: analysis.estimated_cost,
        ai_analysis: analysis.analysis,
        status: 'predicted'
      };

      await base44.entities.FleetPredictiveMaintenance.create(prediction);
      return prediction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fleet-predictive-maintenance'] });
      toast.success('تم تحليل المركبة بنجاح');
    }
  });

  const createWorkOrderMutation = useMutation({
    mutationFn: async (predictionId) => {
      const prediction = predictions.find(p => p.id === predictionId);
      if (!prediction) return;

      const workOrder = {
        asset_name: prediction.vehicle_name,
        type: 'preventive',
        priority: prediction.severity === 'critical' ? 'critical' : prediction.severity === 'high' ? 'high' : 'medium',
        title: `صيانة تنبؤية - ${componentLabels[prediction.component] || prediction.component}`,
        description: prediction.ai_analysis,
        scheduled_date: prediction.optimal_maintenance_date || prediction.predicted_failure_date,
        status: 'open'
      };

      const created = await base44.entities.WorkOrder.create(workOrder);
      await base44.entities.FleetPredictiveMaintenance.update(predictionId, {
        status: 'scheduled',
        work_order_id: created.id
      });

      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fleet-predictive-maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      setShowCreateWorkOrder(false);
      toast.success('تم إنشاء أمر العمل بنجاح');
    }
  });

  // Stats
  const criticalCount = predictions.filter(p => p.severity === 'critical' && p.status === 'predicted').length;
  const highCount = predictions.filter(p => p.severity === 'high' && p.status === 'predicted').length;
  const scheduledCount = predictions.filter(p => p.status === 'scheduled').length;
  const avgHealthScore = predictions.length > 0
    ? Math.round(predictions.reduce((sum, p) => sum + (p.current_health_score || 0), 0) / predictions.length)
    : 0;

  // Chart data
  const componentDistribution = predictions.reduce((acc, p) => {
    const label = componentLabels[p.component] || p.component;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(componentDistribution).map(([name, value]) => ({
    name,
    value,
    fill: COLORS[Object.keys(componentDistribution).indexOf(name) % COLORS.length]
  }));

  const COLORS = ['#22d3ee', '#a855f7', '#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              boxShadow: ['0 0 20px rgba(34, 211, 238, 0.4)', '0 0 40px rgba(168, 85, 247, 0.4)', '0 0 20px rgba(34, 211, 238, 0.4)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
          >
            <Brain className="w-7 h-7 text-cyan-400" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              الصيانة التنبؤية بالذكاء الاصطناعي
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h3>
            <p className="text-slate-500 text-sm">تنبؤ بالأعطال • جدولة ذكية • تقليل التوقف</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-slate-600"
            onClick={() => vehicles.length > 0 && analyzeMutation.mutate(vehicles[0].id)}
            disabled={analyzeMutation.isPending || vehicles.length === 0}
          >
            {analyzeMutation.isPending ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 ml-2" />
            )}
            تحليل جديد
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
                <p className="text-slate-500 text-xs">تنبيهات حرجة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wrench className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-orange-400">{highCount}</p>
                <p className="text-slate-500 text-xs">أولوية عالية</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-cyan-400" />
              <div>
                <p className="text-2xl font-bold text-cyan-400">{scheduledCount}</p>
                <p className="text-slate-500 text-xs">مجدولة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-green-400">{avgHealthScore}%</p>
                <p className="text-slate-500 text-xs">متوسط الصحة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="predictions">التنبؤات</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="scheduled">المجدولة</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {predictions.filter(p => p.status === 'predicted').sort((a, b) => 
                    severityConfig[a.severity]?.priority - severityConfig[b.severity]?.priority
                  ).map((prediction, index) => {
                    const severity = severityConfig[prediction.severity] || severityConfig.medium;
                    return (
                      <motion.div
                        key={prediction.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-${severity.color}-500/50 bg-${severity.color}-500/5 border-${severity.color}-500/30`}
                        onClick={() => setSelectedPrediction(prediction)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-${severity.color}-500/20`}>
                              <Car className={`w-5 h-5 text-${severity.color}-400`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-medium">{prediction.vehicle_name}</span>
                                <Badge className={`bg-${severity.color}-500/20 text-${severity.color}-400`}>
                                  {severity.label}
                                </Badge>
                              </div>
                              <p className="text-slate-400 text-sm mb-2">
                                {componentLabels[prediction.component] || prediction.component}
                              </p>
                              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {prediction.days_until_failure} يوم متبقي
                                </span>
                                <span className="flex items-center gap-1">
                                  <Target className="w-3 h-3" />
                                  {prediction.failure_probability}% احتمال
                                </span>
                                {prediction.estimated_repair_cost && (
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    {prediction.estimated_repair_cost} ر.س
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-white">{prediction.current_health_score || 0}%</p>
                              <p className="text-slate-500 text-xs">صحة المكون</p>
                            </div>
                            <Button
                              size="sm"
                              className="bg-cyan-600 hover:bg-cyan-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                createWorkOrderMutation.mutate(prediction.id);
                              }}
                            >
                              <Wrench className="w-3 h-3 ml-1" />
                              جدولة
                            </Button>
                          </div>
                        </div>
                        {prediction.recommended_action && (
                          <div className="mt-3 p-2 bg-slate-900/50 rounded border border-slate-700/50">
                            <p className="text-cyan-400 text-xs flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {prediction.recommended_action}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                  {predictions.filter(p => p.status === 'predicted').length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>لا توجد تنبؤات حالية</p>
                      <p className="text-sm">قم بتحليل المركبات للحصول على تنبؤات</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">توزيع المكونات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={chartData}>
                      <RadialBar dataKey="value" cornerRadius={10} label={{ fill: '#fff', fontSize: 11 }} />
                      <Legend />
                      <Tooltip />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">ملخص الصحة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(componentLabels).slice(0, 6).map(([key, label]) => {
                    const componentPredictions = predictions.filter(p => p.component === key);
                    const avgHealth = componentPredictions.length > 0
                      ? Math.round(componentPredictions.reduce((sum, p) => sum + (p.current_health_score || 0), 0) / componentPredictions.length)
                      : 100;
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">{label}</span>
                          <span className={`${avgHealth > 70 ? 'text-green-400' : avgHealth > 40 ? 'text-amber-400' : 'text-red-400'}`}>
                            {avgHealth}%
                          </span>
                        </div>
                        <Progress value={avgHealth} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {predictions.filter(p => p.status === 'scheduled').map((prediction, index) => (
                    <motion.div
                      key={prediction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-cyan-500/5 border border-cyan-500/30 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-cyan-400" />
                          <div>
                            <p className="text-white font-medium">{prediction.vehicle_name}</p>
                            <p className="text-slate-400 text-sm">{componentLabels[prediction.component]}</p>
                          </div>
                        </div>
                        <Badge className="bg-cyan-500/20 text-cyan-400">مجدولة</Badge>
                      </div>
                    </motion.div>
                  ))}
                  {predictions.filter(p => p.status === 'scheduled').length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>لا توجد صيانات مجدولة</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Prediction Detail Dialog */}
      <Dialog open={!!selectedPrediction} onOpenChange={() => setSelectedPrediction(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-400" />
              تفاصيل التنبؤ
            </DialogTitle>
          </DialogHeader>
          {selectedPrediction && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs">المركبة</p>
                  <p className="text-white font-medium">{selectedPrediction.vehicle_name}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs">المكون</p>
                  <p className="text-white font-medium">{componentLabels[selectedPrediction.component]}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs">احتمالية الفشل</p>
                  <p className="text-amber-400 font-medium">{selectedPrediction.failure_probability}%</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs">الأيام المتبقية</p>
                  <p className="text-red-400 font-medium">{selectedPrediction.days_until_failure} يوم</p>
                </div>
              </div>
              {selectedPrediction.ai_analysis && (
                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <h4 className="text-purple-400 font-medium mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    تحليل الذكاء الاصطناعي
                  </h4>
                  <p className="text-slate-300 text-sm">{selectedPrediction.ai_analysis}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                  onClick={() => {
                    createWorkOrderMutation.mutate(selectedPrediction.id);
                    setSelectedPrediction(null);
                  }}
                >
                  <Wrench className="w-4 h-4 ml-2" />
                  إنشاء أمر عمل
                </Button>
                <Button variant="outline" className="border-slate-600" onClick={() => setSelectedPrediction(null)}>
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}