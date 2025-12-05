import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Brain, Users, Wrench, Car, TrendingUp, TrendingDown, Calendar,
  Clock, Target, Zap, RefreshCw, Loader2, CheckCircle, AlertTriangle,
  BarChart3, Sparkles, Activity, Building2
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
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line
} from 'recharts';
import { toast } from 'sonner';

const predictionTypeConfig = {
  staffing: { icon: Users, color: 'cyan', label: 'التوظيف' },
  technicians: { icon: Wrench, color: 'purple', label: 'الفنيين' },
  fleet: { icon: Car, color: 'amber', label: 'الأسطول' },
  security: { icon: Building2, color: 'red', label: 'الأمان' },
  visitor_flow: { icon: Users, color: 'green', label: 'تدفق الزوار' },
  maintenance: { icon: Wrench, color: 'orange', label: 'الصيانة' }
};

export default function ResourcePredictionDashboard() {
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('weekly');
  const queryClient = useQueryClient();

  const { data: predictions = [], isLoading } = useQuery({
    queryKey: ['resource-predictions'],
    queryFn: () => base44.entities.ResourcePrediction.list('-created_date', 50)
  });

  const generatePredictionMutation = useMutation({
    mutationFn: async (type) => {
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير في تخطيط الموارد والتنبؤ. قم بتحليل احتياجات الموارد للأسبوع القادم لفئة "${predictionTypeConfig[type]?.label || type}".

بناءً على الأنماط التاريخية المعتادة، قدم:
1. القيمة المتوقعة للموارد المطلوبة
2. نسبة الثقة في التنبؤ (0-100)
3. التخصيص الموصى به
4. العوامل المؤثرة في التنبؤ
5. تبرير الذكاء الاصطناعي
6. التوصيات`,
        response_json_schema: {
          type: "object",
          properties: {
            predicted_value: { type: "number" },
            confidence_score: { type: "number" },
            recommended_allocation: { type: "number" },
            factors: { type: "array", items: { type: "object", properties: { factor_name: { type: "string" }, impact_weight: { type: "number" }, description: { type: "string" } } } },
            justification: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      const prediction = {
        prediction_type: type,
        resource_category: predictionTypeConfig[type]?.label || type,
        time_period: 'weekly',
        target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        predicted_value: analysis.predicted_value,
        confidence_score: analysis.confidence_score,
        current_allocation: Math.floor(analysis.recommended_allocation * 0.8),
        recommended_allocation: analysis.recommended_allocation,
        variance: analysis.recommended_allocation - Math.floor(analysis.recommended_allocation * 0.8),
        factors: analysis.factors,
        ai_justification: analysis.justification,
        ai_recommendations: analysis.recommendations,
        status: 'generated'
      };

      await base44.entities.ResourcePrediction.create(prediction);
      return prediction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource-predictions'] });
      toast.success('تم إنشاء التنبؤ بنجاح');
    }
  });

  const approvePredictionMutation = useMutation({
    mutationFn: async (predictionId) => {
      await base44.entities.ResourcePrediction.update(predictionId, { status: 'approved' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource-predictions'] });
      toast.success('تم اعتماد التنبؤ');
    }
  });

  const filteredPredictions = predictions.filter(p => {
    const matchesType = filterType === 'all' || p.prediction_type === filterType;
    const matchesPeriod = filterPeriod === 'all' || p.time_period === filterPeriod;
    return matchesType && matchesPeriod;
  });

  // Stats
  const totalPredictions = predictions.length;
  const approvedCount = predictions.filter(p => p.status === 'approved').length;
  const avgConfidence = predictions.length > 0
    ? Math.round(predictions.reduce((sum, p) => sum + (p.confidence_score || 0), 0) / predictions.length)
    : 0;
  const totalVariance = predictions.reduce((sum, p) => sum + Math.abs(p.variance || 0), 0);

  // Chart data
  const chartData = Object.entries(predictionTypeConfig).map(([key, config]) => {
    const typePredictions = predictions.filter(p => p.prediction_type === key);
    const avgPredicted = typePredictions.length > 0
      ? Math.round(typePredictions.reduce((sum, p) => sum + (p.predicted_value || 0), 0) / typePredictions.length)
      : 0;
    const avgRecommended = typePredictions.length > 0
      ? Math.round(typePredictions.reduce((sum, p) => sum + (p.recommended_allocation || 0), 0) / typePredictions.length)
      : 0;
    return {
      name: config.label,
      predicted: avgPredicted,
      recommended: avgRecommended
    };
  });

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
              تخصيص الموارد التنبؤي
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h3>
            <p className="text-slate-500 text-sm">تحليل البيانات التاريخية • التنبؤ بالاحتياجات • التوصيات الذكية</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue placeholder="النوع" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">الكل</SelectItem>
              {Object.entries(predictionTypeConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => generatePredictionMutation.mutate('staffing')}
            disabled={generatePredictionMutation.isPending}
          >
            {generatePredictionMutation.isPending ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 ml-2" />
            )}
            تنبؤ جديد
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-cyan-400" />
              <div>
                <p className="text-2xl font-bold text-white">{totalPredictions}</p>
                <p className="text-slate-500 text-xs">إجمالي التنبؤات</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-green-400">{approvedCount}</p>
                <p className="text-slate-500 text-xs">معتمدة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-purple-400">{avgConfidence}%</p>
                <p className="text-slate-500 text-xs">متوسط الثقة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-amber-400" />
              <div>
                <p className="text-2xl font-bold text-amber-400">{totalVariance}</p>
                <p className="text-slate-500 text-xs">إجمالي الفروق</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="predictions">التنبؤات</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="recommendations">التوصيات</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Quick Generate */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">إنشاء تنبؤ سريع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(predictionTypeConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <Button
                        key={key}
                        variant="outline"
                        className={`border-${config.color}-500/50 text-${config.color}-400 hover:bg-${config.color}-500/10`}
                        onClick={() => generatePredictionMutation.mutate(key)}
                        disabled={generatePredictionMutation.isPending}
                      >
                        <Icon className="w-4 h-4 ml-2" />
                        {config.label}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Predictions List */}
            <Card className="lg:col-span-2 bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">التنبؤات الحالية</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {filteredPredictions.map((prediction, index) => {
                      const config = predictionTypeConfig[prediction.prediction_type] || predictionTypeConfig.staffing;
                      const Icon = config.icon;
                      const isPositiveVariance = prediction.variance > 0;
                      return (
                        <motion.div
                          key={prediction.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-4 rounded-lg border bg-${config.color}-500/5 border-${config.color}-500/30`}
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
                                    prediction.status === 'generated' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-slate-500/20 text-slate-400'
                                  }`}>
                                    {prediction.status === 'approved' ? 'معتمد' : prediction.status === 'generated' ? 'جديد' : prediction.status}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm">
                                  <span className="text-slate-400">
                                    المتوقع: <span className="text-white">{prediction.predicted_value}</span>
                                  </span>
                                  <span className="text-slate-400">
                                    الموصى: <span className="text-cyan-400">{prediction.recommended_allocation}</span>
                                  </span>
                                  <span className={`flex items-center gap-1 ${isPositiveVariance ? 'text-green-400' : 'text-red-400'}`}>
                                    {isPositiveVariance ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {Math.abs(prediction.variance || 0)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Progress value={prediction.confidence_score || 0} className="h-1 w-24" />
                                  <span className="text-slate-500 text-xs">{prediction.confidence_score}% ثقة</span>
                                </div>
                              </div>
                            </div>
                            {prediction.status === 'generated' && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => approvePredictionMutation.mutate(prediction.id)}
                              >
                                <CheckCircle className="w-3 h-3 ml-1" />
                                اعتماد
                              </Button>
                            )}
                          </div>
                          {prediction.ai_justification && (
                            <div className="mt-3 p-2 bg-slate-900/50 rounded border border-slate-700/50">
                              <p className="text-purple-400 text-xs flex items-center gap-1">
                                <Brain className="w-3 h-3" />
                                {prediction.ai_justification}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                    {filteredPredictions.length === 0 && (
                      <div className="text-center py-12 text-slate-500">
                        <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>لا توجد تنبؤات</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">مقارنة التنبؤات حسب الفئة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                    <Bar dataKey="predicted" fill="#f59e0b" name="المتوقع" />
                    <Bar dataKey="recommended" fill="#22d3ee" name="الموصى" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                التوصيات الذكية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {predictions.filter(p => p.ai_recommendations?.length > 0).map((prediction, index) => {
                    const config = predictionTypeConfig[prediction.prediction_type] || predictionTypeConfig.staffing;
                    return (
                      <motion.div
                        key={prediction.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={`bg-${config.color}-500/20 text-${config.color}-400`}>
                            {config.label}
                          </Badge>
                          <span className="text-slate-500 text-xs">{prediction.target_date}</span>
                        </div>
                        <ul className="space-y-2">
                          {prediction.ai_recommendations.map((rec, i) => (
                            <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}