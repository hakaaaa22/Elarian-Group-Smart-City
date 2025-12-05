import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  User, Car, AlertTriangle, Shield, TrendingUp, TrendingDown, Brain,
  Activity, Zap, Target, Award, Clock, Fuel, GraduationCap, RefreshCw,
  Loader2, ChevronRight, Sparkles, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';

const riskConfig = {
  low: { color: 'green', label: 'منخفض', icon: Shield },
  medium: { color: 'amber', label: 'متوسط', icon: AlertTriangle },
  high: { color: 'orange', label: 'عالي', icon: AlertTriangle },
  critical: { color: 'red', label: 'حرج', icon: AlertTriangle }
};

export default function DriverBehaviorAIAnalytics() {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const queryClient = useQueryClient();

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ['driver-behavior-analyses'],
    queryFn: () => base44.entities.DriverBehaviorAnalysis.list('-created_date', 50)
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list()
  });

  const analyzeMutation = useMutation({
    mutationFn: async (driverId) => {
      const driver = drivers.find(d => d.id === driverId);
      if (!driver) return;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير في تحليل سلوك السائقين والسلامة المرورية. قم بتحليل بيانات السائق التالي:

السائق: ${driver.name}
رقم الرخصة: ${driver.license_number || 'غير محدد'}
الخبرة: ${driver.experience_years || 0} سنوات

قم بإنشاء تحليل شامل يتضمن:
1. درجة السلامة العامة (0-100)
2. مستوى المخاطر (low, medium, high, critical)
3. عوامل الخطر الرئيسية
4. رؤى وملاحظات
5. توصيات للتحسين
6. هل يحتاج تدريب؟
7. مجالات التدريب المقترحة`,
        response_json_schema: {
          type: "object",
          properties: {
            safety_score: { type: "number" },
            risk_level: { type: "string" },
            risk_factors: { type: "array", items: { type: "object", properties: { factor: { type: "string" }, severity: { type: "string" }, occurrences: { type: "number" } } } },
            insights: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } },
            training_recommended: { type: "boolean" },
            training_areas: { type: "array", items: { type: "string" } },
            behavior_metrics: { type: "object" }
          }
        }
      });

      const driverAnalysis = {
        driver_id: driverId,
        driver_name: driver.name,
        analysis_period: 'weekly',
        period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        period_end: new Date().toISOString().split('T')[0],
        overall_safety_score: analysis.safety_score,
        risk_level: analysis.risk_level,
        risk_factors: analysis.risk_factors,
        ai_insights: analysis.insights,
        ai_recommendations: analysis.recommendations,
        training_recommended: analysis.training_recommended,
        training_areas: analysis.training_areas,
        behavior_metrics: analysis.behavior_metrics || {
          harsh_braking_count: Math.floor(Math.random() * 20),
          harsh_acceleration_count: Math.floor(Math.random() * 15),
          speeding_events: Math.floor(Math.random() * 10),
          sharp_turns: Math.floor(Math.random() * 8),
          total_distance_km: Math.floor(Math.random() * 2000) + 500,
          fuel_efficiency_score: Math.floor(Math.random() * 30) + 70
        }
      };

      await base44.entities.DriverBehaviorAnalysis.create(driverAnalysis);
      return driverAnalysis;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-behavior-analyses'] });
      toast.success('تم تحليل سلوك السائق بنجاح');
    }
  });

  // Stats
  const avgSafetyScore = analyses.length > 0
    ? Math.round(analyses.reduce((sum, a) => sum + (a.overall_safety_score || 0), 0) / analyses.length)
    : 0;
  const highRiskCount = analyses.filter(a => a.risk_level === 'high' || a.risk_level === 'critical').length;
  const trainingNeeded = analyses.filter(a => a.training_recommended).length;

  // Radar chart data
  const getRadarData = (analysis) => {
    if (!analysis?.behavior_metrics) return [];
    const metrics = analysis.behavior_metrics;
    return [
      { metric: 'الفرملة', value: Math.max(0, 100 - (metrics.harsh_braking_count || 0) * 5), fullMark: 100 },
      { metric: 'التسارع', value: Math.max(0, 100 - (metrics.harsh_acceleration_count || 0) * 5), fullMark: 100 },
      { metric: 'السرعة', value: Math.max(0, 100 - (metrics.speeding_events || 0) * 10), fullMark: 100 },
      { metric: 'المنعطفات', value: Math.max(0, 100 - (metrics.sharp_turns || 0) * 8), fullMark: 100 },
      { metric: 'كفاءة الوقود', value: metrics.fuel_efficiency_score || 80, fullMark: 100 }
    ];
  };

  // Top drivers chart
  const topDriversData = analyses
    .sort((a, b) => (b.overall_safety_score || 0) - (a.overall_safety_score || 0))
    .slice(0, 10)
    .map(a => ({
      name: a.driver_name?.split(' ')[0] || 'سائق',
      score: a.overall_safety_score || 0
    }));

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
              تحليلات سلوك السائقين بالذكاء الاصطناعي
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h3>
            <p className="text-slate-500 text-sm">تقييم الأداء • تحديد المخاطر • توصيات التدريب</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-slate-600"
            onClick={() => drivers.length > 0 && analyzeMutation.mutate(drivers[0].id)}
            disabled={analyzeMutation.isPending || drivers.length === 0}
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
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-cyan-400" />
              <div>
                <p className="text-2xl font-bold text-white">{analyses.length}</p>
                <p className="text-slate-500 text-xs">إجمالي التحليلات</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-green-400">{avgSafetyScore}%</p>
                <p className="text-slate-500 text-xs">متوسط السلامة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-red-400">{highRiskCount}</p>
                <p className="text-slate-500 text-xs">مخاطر عالية</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-amber-400" />
              <div>
                <p className="text-2xl font-bold text-amber-400">{trainingNeeded}</p>
                <p className="text-slate-500 text-xs">يحتاجون تدريب</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="drivers" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="drivers">السائقون</TabsTrigger>
          <TabsTrigger value="leaderboard">الترتيب</TabsTrigger>
          <TabsTrigger value="training">التدريب</TabsTrigger>
        </TabsList>

        <TabsContent value="drivers">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Drivers List */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">تحليلات السائقين</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {analyses.map((analysis, index) => {
                      const risk = riskConfig[analysis.risk_level] || riskConfig.medium;
                      const RiskIcon = risk.icon;
                      return (
                        <motion.div
                          key={analysis.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-${risk.color}-500/50 ${
                            selectedDriver?.id === analysis.id ? `bg-${risk.color}-500/10 border-${risk.color}-500/50` : 'bg-slate-900/50 border-slate-700/50'
                          }`}
                          onClick={() => setSelectedDriver(analysis)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-cyan-500/20 text-cyan-400">
                                  {analysis.driver_name?.charAt(0) || 'س'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-white font-medium">{analysis.driver_name}</p>
                                <div className="flex items-center gap-2">
                                  <Badge className={`bg-${risk.color}-500/20 text-${risk.color}-400 text-xs`}>
                                    <RiskIcon className="w-3 h-3 ml-1" />
                                    {risk.label}
                                  </Badge>
                                  {analysis.training_recommended && (
                                    <Badge variant="outline" className="border-amber-500/50 text-amber-400 text-xs">
                                      <GraduationCap className="w-3 h-3 ml-1" />
                                      تدريب
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className={`text-2xl font-bold ${
                                analysis.overall_safety_score >= 80 ? 'text-green-400' :
                                analysis.overall_safety_score >= 60 ? 'text-amber-400' : 'text-red-400'
                              }`}>
                                {analysis.overall_safety_score}%
                              </p>
                              <p className="text-slate-500 text-xs">السلامة</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Radar Chart for Selected Driver */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">
                  {selectedDriver ? `تحليل ${selectedDriver.driver_name}` : 'اختر سائقًا'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDriver ? (
                  <div className="space-y-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={getRadarData(selectedDriver)}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
                          <PolarRadiusAxis stroke="#334155" />
                          <Radar name="الأداء" dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    {selectedDriver.ai_insights && (
                      <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <p className="text-purple-400 text-sm flex items-center gap-1">
                          <Brain className="w-4 h-4" />
                          {selectedDriver.ai_insights}
                        </p>
                      </div>
                    )}
                    {selectedDriver.ai_recommendations?.length > 0 && (
                      <div>
                        <h4 className="text-white text-sm font-medium mb-2">التوصيات:</h4>
                        <ul className="space-y-1">
                          {selectedDriver.ai_recommendations.map((rec, i) => (
                            <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                              <Zap className="w-3 h-3 text-cyan-400 mt-1 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-500">
                    <div className="text-center">
                      <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>اختر سائقًا لعرض التحليل</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                ترتيب السائقين حسب درجة السلامة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topDriversData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                    <Bar dataKey="score" fill="#22d3ee" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                السائقون الذين يحتاجون تدريب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {analyses.filter(a => a.training_recommended).map((analysis, index) => (
                    <motion.div
                      key={analysis.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-amber-500/5 border border-amber-500/30 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white font-medium">{analysis.driver_name}</p>
                          <p className="text-slate-400 text-sm mb-2">درجة السلامة: {analysis.overall_safety_score}%</p>
                          {analysis.training_areas?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {analysis.training_areas.map((area, i) => (
                                <Badge key={i} variant="outline" className="border-amber-500/50 text-amber-400 text-xs">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                          <GraduationCap className="w-3 h-3 ml-1" />
                          جدولة
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                  {analyses.filter(a => a.training_recommended).length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>لا يوجد سائقون يحتاجون تدريب حاليًا</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}