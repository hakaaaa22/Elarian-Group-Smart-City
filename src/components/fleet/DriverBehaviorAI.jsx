import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, AlertTriangle, TrendingUp, TrendingDown, Shield, User,
  Gauge, Navigation, Zap, Activity, Award, Target, FileText,
  ChevronDown, ChevronUp, Loader2, RefreshCw, Download, Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

const behaviorMetrics = [
  { key: 'speeding', label: 'تجاوز السرعة', icon: Gauge, weight: 0.25 },
  { key: 'harsh_braking', label: 'الفرملة القوية', icon: AlertTriangle, weight: 0.20 },
  { key: 'harsh_acceleration', label: 'التسارع المفاجئ', icon: Zap, weight: 0.15 },
  { key: 'sharp_turns', label: 'الانعطافات الحادة', icon: Navigation, weight: 0.15 },
  { key: 'seatbelt', label: 'حزام الأمان', icon: Shield, weight: 0.15 },
  { key: 'idle_time', label: 'وقت التوقف', icon: Activity, weight: 0.10 },
];

const getScoreColor = (score) => {
  if (score >= 85) return 'text-green-400';
  if (score >= 70) return 'text-amber-400';
  return 'text-red-400';
};

const getScoreBg = (score) => {
  if (score >= 85) return 'bg-green-500/20';
  if (score >= 70) return 'bg-amber-500/20';
  return 'bg-red-500/20';
};

const getGrade = (score) => {
  if (score >= 90) return { grade: 'A+', label: 'ممتاز' };
  if (score >= 85) return { grade: 'A', label: 'جيد جداً' };
  if (score >= 80) return { grade: 'B+', label: 'جيد' };
  if (score >= 70) return { grade: 'B', label: 'مقبول' };
  if (score >= 60) return { grade: 'C', label: 'يحتاج تحسين' };
  return { grade: 'D', label: 'ضعيف' };
};

export default function DriverBehaviorAI({ vehicles }) {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [expandedDriver, setExpandedDriver] = useState(null);
  const [timeRange, setTimeRange] = useState('week');

  // Generate mock sensor data for analysis
  const generateSensorData = (vehicle) => ({
    driver: vehicle.driver,
    vehicle_id: vehicle.id,
    plate: vehicle.plate,
    period: timeRange,
    events: {
      speeding_events: Math.floor(Math.random() * 15),
      harsh_braking_events: Math.floor(Math.random() * 10),
      harsh_acceleration_events: Math.floor(Math.random() * 8),
      sharp_turn_events: Math.floor(Math.random() * 5),
      seatbelt_violations: Math.floor(Math.random() * 3),
      idle_time_minutes: Math.floor(Math.random() * 120),
    },
    totals: {
      total_distance_km: Math.floor(Math.random() * 1000) + 500,
      total_driving_hours: Math.floor(Math.random() * 40) + 20,
      avg_speed: Math.floor(Math.random() * 30) + 50,
      max_speed: Math.floor(Math.random() * 40) + 100,
    },
    current_sensors: vehicle.sensors
  });

  const analysisMutation = useMutation({
    mutationFn: async (driverData) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير في تحليل سلوك السائقين وسلامة الأسطول. قم بتحليل البيانات التالية لسائق وأعطني تقرير شامل:

بيانات السائق:
- الاسم: ${driverData.driver}
- المركبة: ${driverData.plate}
- الفترة: ${driverData.period === 'week' ? 'أسبوع' : driverData.period === 'month' ? 'شهر' : 'يوم'}

أحداث القيادة:
- حوادث تجاوز السرعة: ${driverData.events.speeding_events}
- أحداث الفرملة القوية: ${driverData.events.harsh_braking_events}
- أحداث التسارع المفاجئ: ${driverData.events.harsh_acceleration_events}
- الانعطافات الحادة: ${driverData.events.sharp_turn_events}
- مخالفات حزام الأمان: ${driverData.events.seatbelt_violations}
- وقت التوقف (دقائق): ${driverData.events.idle_time_minutes}

إحصائيات القيادة:
- المسافة الإجمالية: ${driverData.totals.total_distance_km} كم
- ساعات القيادة: ${driverData.totals.total_driving_hours}
- متوسط السرعة: ${driverData.totals.avg_speed} كم/س
- أقصى سرعة: ${driverData.totals.max_speed} كم/س

قم بتقديم:
1. درجة السلامة الإجمالية (0-100)
2. تقييم كل معيار على حدة (0-100)
3. تحديد أنماط القيادة الخطرة
4. توصيات محددة للتحسين
5. مقارنة بمعايير الصناعة
6. تنبيهات عاجلة إن وجدت`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            metrics: {
              type: "object",
              properties: {
                speeding: { type: "number" },
                harsh_braking: { type: "number" },
                harsh_acceleration: { type: "number" },
                sharp_turns: { type: "number" },
                seatbelt: { type: "number" },
                idle_time: { type: "number" }
              }
            },
            risk_patterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pattern: { type: "string" },
                  severity: { type: "string" },
                  frequency: { type: "string" }
                }
              }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  expected_improvement: { type: "string" }
                }
              }
            },
            industry_comparison: {
              type: "object",
              properties: {
                percentile: { type: "number" },
                comparison_text: { type: "string" }
              }
            },
            urgent_alerts: {
              type: "array",
              items: { type: "string" }
            },
            summary: { type: "string" }
          }
        }
      });
      return { ...response, driverData };
    },
    onSuccess: (data) => {
      setAnalysisResults(prev => ({
        ...prev,
        [data.driverData.driver]: data
      }));
      toast.success(`تم تحليل سلوك ${data.driverData.driver}`);
    },
    onError: () => {
      toast.error('فشل في التحليل');
    }
  });

  const analyzeDriver = (vehicle) => {
    const sensorData = generateSensorData(vehicle);
    setSelectedDriver(vehicle.driver);
    analysisMutation.mutate(sensorData);
  };

  const analyzeAllDrivers = async () => {
    for (const vehicle of vehicles) {
      const sensorData = generateSensorData(vehicle);
      await analysisMutation.mutateAsync(sensorData);
    }
  };

  const getDriverAnalysis = (driverName) => analysisResults?.[driverName];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/20">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">تحليل سلوك السائقين بالذكاء الاصطناعي</h2>
            <p className="text-slate-400 text-sm">تحليل شامل لأنماط القيادة والسلامة</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="day">اليوم</SelectItem>
              <SelectItem value="week">الأسبوع</SelectItem>
              <SelectItem value="month">الشهر</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={analyzeAllDrivers}
            disabled={analysisMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {analysisMutation.isPending ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Brain className="w-4 h-4 ml-2" />
            )}
            تحليل الكل
          </Button>
        </div>
      </div>

      {/* Drivers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((vehicle, i) => {
          const analysis = getDriverAnalysis(vehicle.driver);
          const isExpanded = expandedDriver === vehicle.id;
          
          return (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 transition-all ${
                isExpanded ? 'ring-2 ring-purple-500/50' : ''
              }`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-sm">{vehicle.driver}</CardTitle>
                        <p className="text-slate-400 text-xs">{vehicle.plate}</p>
                      </div>
                    </div>
                    {analysis && (
                      <div className={`text-center p-2 rounded-lg ${getScoreBg(analysis.overall_score)}`}>
                        <p className={`text-2xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                          {analysis.overall_score}
                        </p>
                        <p className="text-[10px] text-slate-400">نقطة</p>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {analysis ? (
                    <div className="space-y-3">
                      {/* Grade Badge */}
                      <div className="flex items-center justify-between">
                        <Badge className={`${getScoreBg(analysis.overall_score)} ${getScoreColor(analysis.overall_score)}`}>
                          <Star className="w-3 h-3 ml-1" />
                          {getGrade(analysis.overall_score).grade} - {getGrade(analysis.overall_score).label}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          أفضل من {analysis.industry_comparison?.percentile || 50}% من السائقين
                        </span>
                      </div>

                      {/* Metrics Summary */}
                      <div className="grid grid-cols-3 gap-2">
                        {behaviorMetrics.slice(0, 3).map(metric => {
                          const score = analysis.metrics?.[metric.key] || 0;
                          return (
                            <div key={metric.key} className="text-center p-2 bg-slate-800/50 rounded">
                              <metric.icon className={`w-4 h-4 mx-auto mb-1 ${getScoreColor(score)}`} />
                              <p className={`text-sm font-bold ${getScoreColor(score)}`}>{score}</p>
                              <p className="text-[10px] text-slate-500">{metric.label}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Urgent Alerts */}
                      {analysis.urgent_alerts?.length > 0 && (
                        <div className="p-2 bg-red-500/10 border border-red-500/30 rounded">
                          <div className="flex items-center gap-2 text-red-400 text-xs">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{analysis.urgent_alerts[0]}</span>
                          </div>
                        </div>
                      )}

                      {/* Expand Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-slate-400"
                        onClick={() => setExpandedDriver(isExpanded ? null : vehicle.id)}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4 ml-1" />
                            إخفاء التفاصيل
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 ml-1" />
                            عرض التفاصيل
                          </>
                        )}
                      </Button>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-3 border-t border-slate-700"
                          >
                            {/* All Metrics */}
                            <div>
                              <p className="text-slate-400 text-xs mb-2">تفاصيل المعايير</p>
                              <div className="space-y-2">
                                {behaviorMetrics.map(metric => {
                                  const score = analysis.metrics?.[metric.key] || 0;
                                  return (
                                    <div key={metric.key} className="flex items-center gap-2">
                                      <metric.icon className="w-4 h-4 text-slate-400" />
                                      <span className="text-xs text-slate-300 flex-1">{metric.label}</span>
                                      <div className="w-24">
                                        <Progress value={score} className="h-1.5" />
                                      </div>
                                      <span className={`text-xs font-medium w-8 text-left ${getScoreColor(score)}`}>
                                        {score}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Risk Patterns */}
                            {analysis.risk_patterns?.length > 0 && (
                              <div>
                                <p className="text-slate-400 text-xs mb-2">أنماط الخطر</p>
                                <div className="space-y-1">
                                  {analysis.risk_patterns.map((pattern, pi) => (
                                    <div key={pi} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
                                      <AlertTriangle className={`w-3 h-3 ${
                                        pattern.severity === 'high' ? 'text-red-400' : 
                                        pattern.severity === 'medium' ? 'text-amber-400' : 'text-yellow-400'
                                      }`} />
                                      <span className="text-xs text-white flex-1">{pattern.pattern}</span>
                                      <Badge className="text-[10px]">{pattern.frequency}</Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Recommendations */}
                            {analysis.recommendations?.length > 0 && (
                              <div>
                                <p className="text-slate-400 text-xs mb-2">التوصيات</p>
                                <div className="space-y-2">
                                  {analysis.recommendations.slice(0, 3).map((rec, ri) => (
                                    <div key={ri} className="p-2 bg-green-500/10 border border-green-500/30 rounded">
                                      <p className="text-green-400 text-xs font-medium">{rec.title}</p>
                                      <p className="text-slate-400 text-[10px] mt-1">{rec.description}</p>
                                      {rec.expected_improvement && (
                                        <Badge className="mt-1 bg-green-500/20 text-green-400 text-[10px]">
                                          <TrendingUp className="w-2 h-2 ml-1" />
                                          {rec.expected_improvement}
                                        </Badge>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Summary */}
                            {analysis.summary && (
                              <div className="p-3 bg-slate-800/50 rounded">
                                <p className="text-slate-300 text-xs">{analysis.summary}</p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1 text-xs border-slate-600">
                                <FileText className="w-3 h-3 ml-1" />
                                تقرير PDF
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1 text-xs border-slate-600">
                                <Download className="w-3 h-3 ml-1" />
                                تصدير البيانات
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Button
                        onClick={() => analyzeDriver(vehicle)}
                        disabled={analysisMutation.isPending && selectedDriver === vehicle.driver}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {analysisMutation.isPending && selectedDriver === vehicle.driver ? (
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        ) : (
                          <Brain className="w-4 h-4 ml-2" />
                        )}
                        تحليل السلوك
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Overall Fleet Summary */}
      {Object.keys(analysisResults || {}).length > 0 && (
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              ملخص أداء الأسطول
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-800/50 rounded-xl">
                <p className="text-3xl font-bold text-cyan-400">
                  {Math.round(
                    Object.values(analysisResults).reduce((sum, a) => sum + (a.overall_score || 0), 0) /
                    Object.keys(analysisResults).length
                  )}
                </p>
                <p className="text-slate-400 text-sm">متوسط الدرجة</p>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-xl">
                <p className="text-3xl font-bold text-green-400">
                  {Object.values(analysisResults).filter(a => a.overall_score >= 85).length}
                </p>
                <p className="text-slate-400 text-sm">سائقين ممتازين</p>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-xl">
                <p className="text-3xl font-bold text-amber-400">
                  {Object.values(analysisResults).filter(a => a.overall_score >= 70 && a.overall_score < 85).length}
                </p>
                <p className="text-slate-400 text-sm">يحتاجون تحسين</p>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-xl">
                <p className="text-3xl font-bold text-red-400">
                  {Object.values(analysisResults).reduce((sum, a) => sum + (a.urgent_alerts?.length || 0), 0)}
                </p>
                <p className="text-slate-400 text-sm">تنبيهات عاجلة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}