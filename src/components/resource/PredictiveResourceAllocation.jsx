import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Users, Wrench, Car, TrendingUp, TrendingDown, Calendar,
  Clock, Target, Zap, RefreshCw, Loader2, CheckCircle, AlertTriangle,
  BarChart3, Sparkles, Activity, Building2, Phone, Package, Shield,
  ChevronRight, Download, Settings, Eye, FileText, Lightbulb
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
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { toast } from 'sonner';

const resourceCategories = {
  staffing: { icon: Users, color: 'cyan', label: 'التوظيف والموارد البشرية', unit: 'موظف' },
  technicians: { icon: Wrench, color: 'purple', label: 'فريق الصيانة', unit: 'فني' },
  fleet: { icon: Car, color: 'amber', label: 'الأسطول', unit: 'مركبة' },
  callcenter: { icon: Phone, color: 'green', label: 'مركز الاتصال', unit: 'وكيل' },
  security: { icon: Shield, color: 'red', label: 'الأمن', unit: 'حارس' },
  inventory: { icon: Package, color: 'blue', label: 'المخزون', unit: 'وحدة' }
};

const timeRanges = [
  { value: 'daily', label: 'يومي' },
  { value: 'weekly', label: 'أسبوعي' },
  { value: 'monthly', label: 'شهري' },
  { value: 'quarterly', label: 'ربع سنوي' }
];

// Mock historical data for analysis
const historicalTrends = {
  visitors: [
    { period: 'يناير', value: 1200, predicted: 1250 },
    { period: 'فبراير', value: 1350, predicted: 1400 },
    { period: 'مارس', value: 1500, predicted: 1550 },
    { period: 'أبريل', value: 1400, predicted: 1480 },
    { period: 'مايو', value: 1600, predicted: 1650 },
    { period: 'يونيو', value: 1750, predicted: 1800 }
  ],
  maintenance: [
    { period: 'يناير', requests: 45, completed: 42 },
    { period: 'فبراير', requests: 52, completed: 48 },
    { period: 'مارس', requests: 38, completed: 38 },
    { period: 'أبريل', requests: 61, completed: 55 },
    { period: 'مايو', requests: 48, completed: 46 },
    { period: 'يونيو', requests: 55, completed: 52 }
  ],
  callVolume: [
    { hour: '08:00', volume: 45, agents: 5 },
    { hour: '09:00', volume: 78, agents: 8 },
    { hour: '10:00', volume: 92, agents: 10 },
    { hour: '11:00', volume: 85, agents: 9 },
    { hour: '12:00', volume: 65, agents: 7 },
    { hour: '13:00', volume: 58, agents: 6 },
    { hour: '14:00', volume: 88, agents: 9 },
    { hour: '15:00', volume: 95, agents: 10 },
    { hour: '16:00', volume: 72, agents: 8 }
  ]
};

const upcomingEvents = [
  { id: 1, name: 'مؤتمر سنوي', date: '2025-01-15', expectedVisitors: 500, resourceImpact: 'high' },
  { id: 2, name: 'صيانة دورية للأنظمة', date: '2025-01-10', type: 'maintenance', resourceImpact: 'medium' },
  { id: 3, name: 'زيارة وفد رسمي', date: '2025-01-08', expectedVisitors: 50, resourceImpact: 'high' },
  { id: 4, name: 'تدريب الموظفين', date: '2025-01-12', type: 'internal', resourceImpact: 'low' }
];

export default function PredictiveResourceAllocation() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeRange, setTimeRange] = useState('weekly');
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  const { data: predictions = [], isLoading } = useQuery({
    queryKey: ['resource-predictions'],
    queryFn: () => base44.entities.ResourcePrediction.list('-created_date', 30)
  });

  const generatePredictionMutation = useMutation({
    mutationFn: async (category) => {
      setIsAnalyzing(true);
      const categoryConfig = resourceCategories[category];
      
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير في تخطيط الموارد والتحليل التنبؤي. قم بتحليل شامل لاحتياجات الموارد لفئة "${categoryConfig.label}".

بناءً على:
1. اتجاهات الزوار التاريخية: معدل نمو 15% شهرياً
2. جدول الأحداث القادمة: مؤتمر كبير خلال أسبوعين
3. سجلات الصيانة: 50 طلب صيانة شهرياً بمعدل
4. أداء القوى العاملة: كفاءة 85% حالياً

قدم تحليلاً شاملاً يتضمن:
1. القيمة المتوقعة للموارد المطلوبة للأسبوع القادم
2. نسبة الثقة في التنبؤ (0-100)
3. التخصيص الحالي والموصى به
4. العوامل المؤثرة مع وزن تأثير كل عامل
5. تبرير مفصل للتنبؤ
6. 5 توصيات قابلة للتنفيذ
7. المخاطر المحتملة إذا لم يتم اتباع التوصيات`,
        response_json_schema: {
          type: "object",
          properties: {
            predicted_value: { type: "number" },
            confidence_score: { type: "number" },
            current_allocation: { type: "number" },
            recommended_allocation: { type: "number" },
            peak_times: { type: "array", items: { type: "string" } },
            factors: { 
              type: "array", 
              items: { 
                type: "object", 
                properties: { 
                  factor_name: { type: "string" }, 
                  impact_weight: { type: "number" }, 
                  description: { type: "string" },
                  trend: { type: "string" }
                } 
              } 
            },
            justification: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } },
            risks: { type: "array", items: { type: "string" } },
            cost_savings_potential: { type: "number" },
            efficiency_improvement: { type: "number" }
          }
        }
      });

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 7);

      const prediction = {
        prediction_type: category,
        resource_category: categoryConfig.label,
        time_period: timeRange,
        target_date: targetDate.toISOString().split('T')[0],
        predicted_value: analysis.predicted_value,
        confidence_score: analysis.confidence_score,
        current_allocation: analysis.current_allocation,
        recommended_allocation: analysis.recommended_allocation,
        variance: analysis.recommended_allocation - analysis.current_allocation,
        factors: analysis.factors,
        ai_justification: analysis.justification,
        ai_recommendations: analysis.recommendations,
        status: 'generated'
      };

      await base44.entities.ResourcePrediction.create(prediction);
      setIsAnalyzing(false);
      return { ...prediction, ...analysis };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['resource-predictions'] });
      setSelectedPrediction(data);
      setShowDetailDialog(true);
      toast.success('تم إنشاء التنبؤ بنجاح');
    },
    onError: () => {
      setIsAnalyzing(false);
      toast.error('حدث خطأ أثناء التحليل');
    }
  });

  const generateAllPredictions = async () => {
    setIsAnalyzing(true);
    for (const category of Object.keys(resourceCategories)) {
      await generatePredictionMutation.mutateAsync(category);
    }
    setIsAnalyzing(false);
    toast.success('تم إنشاء جميع التنبؤات');
  };

  const approvePrediction = async (id) => {
    await base44.entities.ResourcePrediction.update(id, { status: 'approved' });
    queryClient.invalidateQueries({ queryKey: ['resource-predictions'] });
    toast.success('تم اعتماد التنبؤ');
  };

  const filteredPredictions = predictions.filter(p => 
    selectedCategory === 'all' || p.prediction_type === selectedCategory
  );

  // Calculate summary stats
  const stats = {
    total: predictions.length,
    approved: predictions.filter(p => p.status === 'approved').length,
    avgConfidence: predictions.length > 0 
      ? Math.round(predictions.reduce((sum, p) => sum + (p.confidence_score || 0), 0) / predictions.length)
      : 0,
    totalVariance: predictions.reduce((sum, p) => sum + Math.abs(p.variance || 0), 0),
    positiveVariance: predictions.filter(p => (p.variance || 0) > 0).length,
    negativeVariance: predictions.filter(p => (p.variance || 0) < 0).length
  };

  // Radar chart data for resource balance
  const radarData = Object.entries(resourceCategories).map(([key, config]) => {
    const categoryPredictions = predictions.filter(p => p.prediction_type === key);
    const avgScore = categoryPredictions.length > 0
      ? Math.round(categoryPredictions.reduce((sum, p) => sum + (p.confidence_score || 0), 0) / categoryPredictions.length)
      : 50;
    return { category: config.label.split(' ')[0], score: avgScore, fullMark: 100 };
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              boxShadow: ['0 0 20px rgba(34, 211, 238, 0.3)', '0 0 40px rgba(168, 85, 247, 0.5)', '0 0 20px rgba(34, 211, 238, 0.3)']
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
          >
            <Brain className="w-8 h-8 text-cyan-400" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              تخصيص الموارد التنبؤي
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h2>
            <p className="text-slate-400 text-sm">تحليل البيانات التاريخية • التنبؤ بالاحتياجات • توصيات ذكية</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {timeRanges.map(range => (
                <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
            onClick={generateAllPredictions}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 ml-2" />
            )}
            تحليل شامل
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-slate-500 text-xs">إجمالي التنبؤات</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
            <p className="text-slate-500 text-xs">معتمدة</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-400">{stats.avgConfidence}%</p>
            <p className="text-slate-500 text-xs">متوسط الثقة</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-400">{stats.positiveVariance}</p>
            <p className="text-slate-500 text-xs">تحتاج زيادة</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 text-center">
            <TrendingDown className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-400">{stats.negativeVariance}</p>
            <p className="text-slate-500 text-xs">فائض موارد</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4 text-center">
            <Activity className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-400">{stats.totalVariance}</p>
            <p className="text-slate-500 text-xs">إجمالي الفروق</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="predictions">التنبؤات</TabsTrigger>
          <TabsTrigger value="analysis">التحليل التاريخي</TabsTrigger>
          <TabsTrigger value="events">الأحداث القادمة</TabsTrigger>
          <TabsTrigger value="recommendations">التوصيات</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Category Selector */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">فئات الموارد</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  className={`w-full justify-start ${selectedCategory === 'all' ? 'bg-cyan-600' : 'border-slate-600'}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  <BarChart3 className="w-4 h-4 ml-2" />
                  جميع الفئات
                </Button>
                {Object.entries(resourceCategories).map(([key, config]) => {
                  const Icon = config.icon;
                  const count = predictions.filter(p => p.prediction_type === key).length;
                  return (
                    <Button
                      key={key}
                      variant={selectedCategory === key ? 'default' : 'outline'}
                      className={`w-full justify-between ${selectedCategory === key ? `bg-${config.color}-600` : 'border-slate-600'}`}
                      onClick={() => setSelectedCategory(key)}
                    >
                      <span className="flex items-center">
                        <Icon className="w-4 h-4 ml-2" />
                        {config.label.split(' ')[0]}
                      </span>
                      <Badge variant="outline" className="text-xs">{count}</Badge>
                    </Button>
                  );
                })}
                
                <div className="pt-4 border-t border-slate-700">
                  <p className="text-slate-400 text-xs mb-2">إنشاء تنبؤ جديد</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(resourceCategories).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <Button
                          key={key}
                          size="sm"
                          variant="outline"
                          className={`border-${config.color}-500/50 text-${config.color}-400 hover:bg-${config.color}-500/10`}
                          onClick={() => generatePredictionMutation.mutate(key)}
                          disabled={generatePredictionMutation.isPending}
                        >
                          <Icon className="w-3 h-3" />
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Predictions List */}
            <Card className="lg:col-span-3 bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm">التنبؤات الحالية</CardTitle>
                  <Button size="sm" variant="outline" className="border-slate-600">
                    <Download className="w-3 h-3 ml-1" />
                    تصدير
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    <AnimatePresence>
                      {filteredPredictions.map((prediction, index) => {
                        const config = resourceCategories[prediction.prediction_type] || resourceCategories.staffing;
                        const Icon = config.icon;
                        const isPositiveVariance = (prediction.variance || 0) > 0;
                        
                        return (
                          <motion.div
                            key={prediction.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 rounded-xl border bg-gradient-to-r from-${config.color}-500/5 to-transparent border-${config.color}-500/30 hover:border-${config.color}-500/50 transition-all cursor-pointer`}
                            onClick={() => { setSelectedPrediction(prediction); setShowDetailDialog(true); }}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg bg-${config.color}-500/20`}>
                                  <Icon className={`w-5 h-5 text-${config.color}-400`} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-white font-medium">{config.label}</span>
                                    <Badge className={`${
                                      prediction.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                      prediction.status === 'applied' ? 'bg-blue-500/20 text-blue-400' :
                                      'bg-amber-500/20 text-amber-400'
                                    }`}>
                                      {prediction.status === 'approved' ? 'معتمد' : 
                                       prediction.status === 'applied' ? 'مطبق' : 'جديد'}
                                    </Badge>
                                  </div>
                                  <div className="flex flex-wrap gap-4 text-sm">
                                    <span className="text-slate-400">
                                      الحالي: <span className="text-white font-medium">{prediction.current_allocation} {config.unit}</span>
                                    </span>
                                    <span className="text-slate-400">
                                      الموصى: <span className="text-cyan-400 font-medium">{prediction.recommended_allocation} {config.unit}</span>
                                    </span>
                                    <span className={`flex items-center gap-1 ${isPositiveVariance ? 'text-green-400' : 'text-red-400'}`}>
                                      {isPositiveVariance ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                      {isPositiveVariance ? '+' : ''}{prediction.variance || 0}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center gap-1">
                                      <Progress value={prediction.confidence_score || 0} className="h-1.5 w-20" />
                                      <span className="text-slate-500 text-xs">{prediction.confidence_score}%</span>
                                    </div>
                                    <span className="text-slate-500 text-xs">{prediction.target_date}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {prediction.status === 'generated' && (
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 h-8"
                                    onClick={(e) => { e.stopPropagation(); approvePrediction(prediction.id); }}
                                  >
                                    <CheckCircle className="w-3 h-3 ml-1" />
                                    اعتماد
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost" className="h-8">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            {prediction.ai_justification && (
                              <div className="mt-3 p-2 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                <p className="text-purple-400 text-xs flex items-start gap-1">
                                  <Brain className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  <span className="line-clamp-2">{prediction.ai_justification}</span>
                                </p>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    {filteredPredictions.length === 0 && (
                      <div className="text-center py-12">
                        <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">لا توجد تنبؤات</p>
                        <p className="text-slate-500 text-sm">اضغط على "تحليل شامل" لإنشاء تنبؤات جديدة</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Visitor Trends */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  اتجاهات الزوار
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalTrends.visitors}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                      <Area type="monotone" dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} name="فعلي" />
                      <Area type="monotone" dataKey="predicted" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} name="متوقع" strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Trends */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-purple-400" />
                  طلبات الصيانة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historicalTrends.maintenance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                      <Bar dataKey="requests" fill="#a855f7" name="طلبات" />
                      <Bar dataKey="completed" fill="#22c55e" name="مكتملة" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Call Center Volume */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-400" />
                  حجم المكالمات حسب الساعة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalTrends.callVolume}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                      <Line type="monotone" dataKey="volume" stroke="#22c55e" strokeWidth={2} name="مكالمات" />
                      <Line type="monotone" dataKey="agents" stroke="#f59e0b" strokeWidth={2} name="وكلاء" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Resource Balance Radar */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  توازن الموارد
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="category" stroke="#94a3b8" fontSize={10} />
                      <PolarRadiusAxis stroke="#94a3b8" fontSize={10} />
                      <Radar name="درجة الثقة" dataKey="score" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                الأحداث القادمة وتأثيرها على الموارد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <div key={event.id} className={`p-4 rounded-xl border ${
                    event.resourceImpact === 'high' ? 'bg-red-500/10 border-red-500/30' :
                    event.resourceImpact === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
                    'bg-green-500/10 border-green-500/30'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">{event.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {event.date}
                          </span>
                          {event.expectedVisitors && (
                            <span className="text-slate-400 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {event.expectedVisitors} زائر متوقع
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge className={
                        event.resourceImpact === 'high' ? 'bg-red-500/20 text-red-400' :
                        event.resourceImpact === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-green-500/20 text-green-400'
                      }>
                        {event.resourceImpact === 'high' ? 'تأثير عالي' :
                         event.resourceImpact === 'medium' ? 'تأثير متوسط' : 'تأثير منخفض'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="grid lg:grid-cols-2 gap-6">
            {predictions.filter(p => p.ai_recommendations?.length > 0).slice(0, 4).map((prediction, index) => {
              const config = resourceCategories[prediction.prediction_type] || resourceCategories.staffing;
              const Icon = config.icon;
              return (
                <Card key={prediction.id} className="bg-slate-800/30 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Icon className={`w-4 h-4 text-${config.color}-400`} />
                      {config.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {prediction.ai_recommendations?.slice(0, 5).map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-300">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              تفاصيل التنبؤ
            </DialogTitle>
          </DialogHeader>
          {selectedPrediction && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">التخصيص الحالي</p>
                  <p className="text-2xl font-bold text-white">{selectedPrediction.current_allocation}</p>
                </div>
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">التخصيص الموصى</p>
                  <p className="text-2xl font-bold text-cyan-400">{selectedPrediction.recommended_allocation}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400 text-xs mb-2">نسبة الثقة</p>
                <div className="flex items-center gap-3">
                  <Progress value={selectedPrediction.confidence_score || 0} className="flex-1" />
                  <span className="text-white font-medium">{selectedPrediction.confidence_score}%</span>
                </div>
              </div>

              {selectedPrediction.ai_justification && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-purple-400 text-xs mb-2 flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    تحليل الذكاء الاصطناعي
                  </p>
                  <p className="text-slate-300 text-sm">{selectedPrediction.ai_justification}</p>
                </div>
              )}

              {selectedPrediction.factors?.length > 0 && (
                <div>
                  <p className="text-white font-medium mb-2">العوامل المؤثرة</p>
                  <div className="space-y-2">
                    {selectedPrediction.factors.map((factor, i) => (
                      <div key={i} className="p-2 bg-slate-800/50 rounded-lg flex items-center justify-between">
                        <span className="text-slate-300 text-sm">{factor.factor_name}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={factor.impact_weight * 10} className="w-16 h-1.5" />
                          <span className="text-slate-400 text-xs">{Math.round(factor.impact_weight * 10)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPrediction.ai_recommendations?.length > 0 && (
                <div>
                  <p className="text-white font-medium mb-2">التوصيات</p>
                  <ul className="space-y-2">
                    {selectedPrediction.ai_recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}