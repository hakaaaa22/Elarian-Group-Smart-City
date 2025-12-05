import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Car, Wrench, AlertTriangle, TrendingUp, TrendingDown, Shield,
  Zap, Clock, Target, Activity, Gauge, Fuel, Battery, Thermometer,
  CheckCircle, XCircle, Loader2, Eye, Settings, RefreshCw, Download,
  BarChart3, Users, Calendar, FileText, Sparkles, ChevronRight
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
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'];

const componentHealth = [
  { component: 'المحرك', health: 92, prediction: 'stable', nextService: '45 يوم' },
  { component: 'ناقل الحركة', health: 78, prediction: 'declining', nextService: '15 يوم' },
  { component: 'الفرامل', health: 65, prediction: 'critical', nextService: '5 أيام' },
  { component: 'الإطارات', health: 71, prediction: 'declining', nextService: '20 يوم' },
  { component: 'البطارية', health: 88, prediction: 'stable', nextService: '60 يوم' },
  { component: 'نظام الوقود', health: 95, prediction: 'excellent', nextService: '90 يوم' },
  { component: 'التعليق', health: 82, prediction: 'stable', nextService: '30 يوم' },
  { component: 'التبريد', health: 74, prediction: 'declining', nextService: '25 يوم' }
];

const driverBehaviorData = [
  { metric: 'السرعة', score: 78 },
  { metric: 'الفرملة', score: 65 },
  { metric: 'التسارع', score: 82 },
  { metric: 'المنعطفات', score: 70 },
  { metric: 'الوقود', score: 88 },
  { metric: 'الالتزام', score: 75 }
];

const telematicsHistory = [
  { time: '00:00', rpm: 2100, temp: 85, fuel: 92 },
  { time: '04:00', rpm: 2400, temp: 88, fuel: 85 },
  { time: '08:00', rpm: 2800, temp: 92, fuel: 78 },
  { time: '12:00', rpm: 2600, temp: 95, fuel: 70 },
  { time: '16:00', rpm: 3100, temp: 102, fuel: 62 },
  { time: '20:00', rpm: 2300, temp: 88, fuel: 55 }
];

const maintenanceSchedule = [
  { id: 1, vehicle: 'شاحنة 001', task: 'تغيير زيت', date: '2025-01-10', priority: 'high', status: 'scheduled' },
  { id: 2, vehicle: 'فان 003', task: 'فحص الفرامل', date: '2025-01-08', priority: 'critical', status: 'overdue' },
  { id: 3, vehicle: 'شاحنة 005', task: 'استبدال الإطارات', date: '2025-01-15', priority: 'medium', status: 'scheduled' },
  { id: 4, vehicle: 'سيارة 002', task: 'صيانة دورية', date: '2025-01-20', priority: 'low', status: 'scheduled' }
];

export default function AdvancedFleetAIModule() {
  const [activeTab, setActiveTab] = useState('predictive');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const queryClient = useQueryClient();

  const { data: maintenanceRecords = [] } = useQuery({
    queryKey: ['fleet-maintenance'],
    queryFn: () => base44.entities.FleetPredictiveMaintenance.list('-created_date', 20)
  });

  const { data: driverAnalysis = [] } = useQuery({
    queryKey: ['driver-behavior'],
    queryFn: () => base44.entities.DriverBehaviorAnalysis.list('-created_date', 20)
  });

  const runPredictiveAnalysisMutation = useMutation({
    mutationFn: async () => {
      setIsAnalyzing(true);
      
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير في صيانة الأسطول والتحليل التنبؤي. قم بتحليل بيانات القياس عن بعد التالية:

بيانات المحرك: RPM متوسط 2500، درجة الحرارة 92°C
الوقود: استهلاك 12 لتر/100كم
الفرامل: سمك التيل 4mm (الحد الأدنى 2mm)
الإطارات: عمق المداس 3mm (الحد الأدنى 1.6mm)
البطارية: الجهد 12.4V

قدم:
1. تنبؤات الفشل للأسبوعين القادمين
2. جدول الصيانة المثالي
3. تقييم المخاطر
4. توصيات لتقليل التكاليف
5. تحليل سلوك القيادة وتأثيره`,
        response_json_schema: {
          type: "object",
          properties: {
            failure_predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  component: { type: "string" },
                  probability: { type: "number" },
                  timeframe: { type: "string" },
                  severity: { type: "string" }
                }
              }
            },
            optimal_schedule: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  task: { type: "string" },
                  recommended_date: { type: "string" },
                  estimated_cost: { type: "number" },
                  priority: { type: "string" }
                }
              }
            },
            risk_assessment: { type: "string" },
            cost_recommendations: { type: "array", items: { type: "string" } },
            driver_behavior_impact: { type: "string" },
            overall_fleet_health: { type: "number" },
            downtime_prediction: { type: "string" }
          }
        }
      });

      setIsAnalyzing(false);
      return analysis;
    },
    onSuccess: (data) => {
      setAiAnalysis(data);
      toast.success('تم إكمال التحليل التنبؤي');
    }
  });

  const generateReportMutation = useMutation({
    mutationFn: async (reportType) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنشئ تقرير "${reportType}" لإدارة الأسطول يتضمن ملخص تنفيذي، مقاييس رئيسية، تحليل مفصل، وتوصيات.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            executive_summary: { type: "string" },
            metrics: { type: "array", items: { type: "object" } },
            analysis: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: () => {
      toast.success('تم إنشاء التقرير');
      setShowReportDialog(false);
    }
  });

  const stats = {
    totalVehicles: 45,
    atRisk: 8,
    scheduledMaintenance: maintenanceSchedule.length,
    avgHealthScore: Math.round(componentHealth.reduce((s, c) => s + c.health, 0) / componentHealth.length),
    overdue: maintenanceSchedule.filter(m => m.status === 'overdue').length
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              boxShadow: ['0 0 20px rgba(168, 85, 247, 0.4)', '0 0 40px rgba(34, 211, 238, 0.4)', '0 0 20px rgba(168, 85, 247, 0.4)']
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20"
          >
            <Brain className="w-8 h-8 text-purple-400" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Fleet OS - الصيانة التنبؤية AI
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h2>
            <p className="text-slate-400 text-sm">تحليل القياس عن بعد • التنبؤ بالأعطال • تحسين الجداول</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-gradient-to-r from-purple-600 to-cyan-600"
            onClick={() => runPredictiveAnalysisMutation.mutate()}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Zap className="w-4 h-4 ml-2" />}
            تحليل تنبؤي
          </Button>
          <Button variant="outline" className="border-slate-600" onClick={() => setShowReportDialog(true)}>
            <FileText className="w-4 h-4 ml-2" />
            تقارير
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <Car className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalVehicles}</p>
            <p className="text-slate-500 text-xs">إجمالي المركبات</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-400">{stats.atRisk}</p>
            <p className="text-slate-500 text-xs">بحاجة لصيانة</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <Wrench className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-400">{stats.scheduledMaintenance}</p>
            <p className="text-slate-500 text-xs">مجدولة</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <Activity className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-400">{stats.avgHealthScore}%</p>
            <p className="text-slate-500 text-xs">صحة الأسطول</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-400">{stats.overdue}</p>
            <p className="text-slate-500 text-xs">متأخرة</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="predictive">الصيانة التنبؤية</TabsTrigger>
          <TabsTrigger value="components">صحة المكونات</TabsTrigger>
          <TabsTrigger value="driver">سلوك السائق</TabsTrigger>
          <TabsTrigger value="schedule">الجدولة المثلى</TabsTrigger>
          <TabsTrigger value="telematics">القياس عن بعد</TabsTrigger>
        </TabsList>

        <TabsContent value="predictive">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* AI Analysis Results */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  تنبؤات الفشل AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiAnalysis?.failure_predictions ? (
                  <div className="space-y-3">
                    {aiAnalysis.failure_predictions.map((pred, i) => (
                      <div key={i} className={`p-3 rounded-lg border ${
                        pred.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                        pred.severity === 'high' ? 'bg-amber-500/10 border-amber-500/30' :
                        'bg-slate-900/50 border-slate-700'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{pred.component}</span>
                          <Badge className={
                            pred.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            pred.severity === 'high' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-blue-500/20 text-blue-400'
                          }>
                            {pred.probability}% احتمالية
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm">{pred.timeframe}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">اضغط "تحليل تنبؤي" لبدء التحليل</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cost Recommendations */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-400" />
                  توصيات تقليل التكاليف
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiAnalysis?.cost_recommendations ? (
                  <ul className="space-y-2">
                    {aiAnalysis.cost_recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300 text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <p className="text-green-400 text-sm">توفير متوقع: 15% من تكاليف الصيانة</p>
                    </div>
                    <div className="p-3 bg-cyan-500/10 rounded-lg">
                      <p className="text-cyan-400 text-sm">تقليل وقت التوقف: 25%</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Fleet Health Overview */}
          {aiAnalysis && (
            <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30 mt-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">صحة الأسطول الإجمالية</h4>
                    <p className="text-slate-400 text-sm">{aiAnalysis.risk_assessment}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-cyan-400">{aiAnalysis.overall_fleet_health}%</p>
                    <p className="text-slate-500 text-xs">درجة الصحة</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="components">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">صحة مكونات المركبات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {componentHealth.map((comp, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${
                    comp.health < 70 ? 'bg-red-500/10 border-red-500/30' :
                    comp.health < 80 ? 'bg-amber-500/10 border-amber-500/30' :
                    'bg-green-500/10 border-green-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{comp.component}</span>
                      <Badge className={
                        comp.prediction === 'critical' ? 'bg-red-500/20 text-red-400' :
                        comp.prediction === 'declining' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-green-500/20 text-green-400'
                      }>
                        {comp.prediction === 'critical' ? 'حرج' : 
                         comp.prediction === 'declining' ? 'متراجع' : 
                         comp.prediction === 'excellent' ? 'ممتاز' : 'مستقر'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Progress value={comp.health} className="flex-1" />
                      <span className={`text-sm font-bold ${
                        comp.health < 70 ? 'text-red-400' :
                        comp.health < 80 ? 'text-amber-400' : 'text-green-400'
                      }`}>{comp.health}%</span>
                    </div>
                    <p className="text-slate-500 text-xs">الصيانة التالية: {comp.nextService}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="driver">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  تحليل سلوك القيادة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={driverBehaviorData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={12} />
                      <PolarRadiusAxis stroke="#94a3b8" fontSize={10} />
                      <Radar name="الدرجة" dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">مخاطر السلامة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { driver: 'محمد أحمد', score: 85, risk: 'low', violations: 2 },
                    { driver: 'خالد السعيد', score: 62, risk: 'high', violations: 8 },
                    { driver: 'عبدالله فهد', score: 74, risk: 'medium', violations: 4 },
                    { driver: 'سعود العلي', score: 91, risk: 'low', violations: 1 }
                  ].map((driver, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${
                      driver.risk === 'high' ? 'bg-red-500/10 border-red-500/30' :
                      driver.risk === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
                      'bg-green-500/10 border-green-500/30'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{driver.driver}</p>
                          <p className="text-slate-500 text-xs">{driver.violations} مخالفات</p>
                        </div>
                        <div className="text-left">
                          <p className={`text-lg font-bold ${
                            driver.score >= 80 ? 'text-green-400' :
                            driver.score >= 70 ? 'text-amber-400' : 'text-red-400'
                          }`}>{driver.score}</p>
                          <Badge className={
                            driver.risk === 'high' ? 'bg-red-500/20 text-red-400' :
                            driver.risk === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-green-500/20 text-green-400'
                          }>
                            {driver.risk === 'high' ? 'عالي' : driver.risk === 'medium' ? 'متوسط' : 'منخفض'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                جدول الصيانة المثالي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {maintenanceSchedule.map((item, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${
                    item.status === 'overdue' ? 'bg-red-500/10 border-red-500/30' :
                    item.priority === 'critical' ? 'bg-amber-500/10 border-amber-500/30' :
                    'bg-slate-900/50 border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">{item.vehicle}</span>
                          <Badge className={
                            item.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                            'bg-green-500/20 text-green-400'
                          }>
                            {item.status === 'overdue' ? 'متأخر' : 'مجدول'}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm">{item.task}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-white">{item.date}</p>
                        <Badge className={
                          item.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                          item.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }>
                          {item.priority === 'critical' ? 'حرج' : item.priority === 'high' ? 'عالي' : 'متوسط'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="telematics">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">بيانات القياس عن بعد</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={telematicsHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                    <Line type="monotone" dataKey="rpm" stroke="#22d3ee" strokeWidth={2} name="RPM (÷10)" />
                    <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} name="درجة الحرارة" />
                    <Line type="monotone" dataKey="fuel" stroke="#22c55e" strokeWidth={2} name="الوقود %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              إنشاء تقرير الأسطول
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {[
              'AI Predictive Maintenance Report',
              'Fleet Health Summary',
              'Driver Behavior Analysis',
              'Cost Optimization Report',
              'Maintenance Schedule Overview'
            ].map((report, i) => (
              <Button
                key={i}
                variant="outline"
                className="w-full justify-start border-slate-600 hover:bg-slate-800"
                onClick={() => generateReportMutation.mutate(report)}
              >
                <ChevronRight className="w-4 h-4 ml-2" />
                {report}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}