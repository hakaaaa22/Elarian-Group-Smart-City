import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import {
  Brain, Sparkles, TrendingUp, TrendingDown, AlertTriangle, Lightbulb,
  Car, Package, Shield, Droplets, Zap, Building2, Users, Activity,
  ArrowRight, RefreshCw, Target, BarChart3, Link2, Clock, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';

// Department Data
const DEPARTMENTS = {
  transportation: { name: 'المواصلات', icon: Car, color: '#8B5CF6' },
  utilities: { name: 'المرافق', icon: Droplets, color: '#06B6D4' },
  safety: { name: 'السلامة', icon: Shield, color: '#EC4899' },
  waste: { name: 'النفايات', icon: Package, color: '#22C55E' },
  energy: { name: 'الطاقة', icon: Zap, color: '#F59E0B' },
};

// Correlation Data
const correlationData = [
  { hour: '06:00', traffic: 30, utilities: 45, safety: 95, waste: 20, energy: 35 },
  { hour: '08:00', traffic: 85, utilities: 70, safety: 88, waste: 35, energy: 75 },
  { hour: '10:00', traffic: 70, utilities: 80, safety: 92, waste: 50, energy: 85 },
  { hour: '12:00', traffic: 65, utilities: 85, safety: 90, waste: 65, energy: 90 },
  { hour: '14:00', traffic: 60, utilities: 82, safety: 91, waste: 70, energy: 88 },
  { hour: '16:00', traffic: 90, utilities: 75, safety: 85, waste: 55, energy: 82 },
  { hour: '18:00', traffic: 80, utilities: 60, safety: 87, waste: 40, energy: 70 },
  { hour: '20:00', traffic: 45, utilities: 55, safety: 94, waste: 30, energy: 55 },
];

// Radar Data for Department Performance
const radarData = [
  { subject: 'الكفاءة', transportation: 85, utilities: 78, safety: 92, waste: 75, fullMark: 100 },
  { subject: 'الاستجابة', transportation: 72, utilities: 85, safety: 88, waste: 80, fullMark: 100 },
  { subject: 'التغطية', transportation: 90, utilities: 82, safety: 95, waste: 70, fullMark: 100 },
  { subject: 'الموثوقية', transportation: 78, utilities: 90, safety: 85, waste: 82, fullMark: 100 },
  { subject: 'التكلفة', transportation: 65, utilities: 72, safety: 80, waste: 88, fullMark: 100 },
];

// Cross-Department Correlations
const correlations = [
  {
    id: 1,
    departments: ['transportation', 'utilities'],
    correlation: 0.82,
    type: 'positive',
    insight: 'ازدحام المرور يؤدي إلى زيادة استهلاك المياه بنسبة 15%',
    recommendation: 'تحسين توقيت إشارات المرور لتقليل الازدحام',
    impact: 'high',
  },
  {
    id: 2,
    departments: ['waste', 'safety'],
    correlation: -0.65,
    type: 'negative',
    insight: 'تراكم النفايات مرتبط بزيادة الحوادث الصحية',
    recommendation: 'زيادة جولات الجمع في المناطق الحيوية',
    impact: 'critical',
  },
  {
    id: 3,
    departments: ['transportation', 'energy'],
    correlation: 0.78,
    type: 'positive',
    insight: 'ذروة المرور تتزامن مع ذروة استهلاك الطاقة',
    recommendation: 'تنسيق جداول الصيانة بين القسمين',
    impact: 'medium',
  },
  {
    id: 4,
    departments: ['utilities', 'energy'],
    correlation: 0.91,
    type: 'positive',
    insight: 'استهلاك المياه مرتبط بشكل قوي باستهلاك الطاقة',
    recommendation: 'تطبيق نظام إدارة موارد متكامل',
    impact: 'high',
  },
];

// Predictive Alerts
const predictiveAlerts = [
  {
    id: 1,
    type: 'prediction',
    title: 'توقع ازدحام غداً',
    message: 'تحليل AI يتوقع ازدحام مروري بنسبة 40% في الطريق الدائري بسبب أعمال صيانة المرافق',
    departments: ['transportation', 'utilities'],
    confidence: 87,
    timeframe: '24 ساعة',
    action: 'تفعيل خطة المسارات البديلة',
  },
  {
    id: 2,
    type: 'optimization',
    title: 'فرصة تحسين',
    message: 'يمكن توفير 20% من تكاليف الطاقة بتنسيق جداول تشغيل محطات المياه مع ساعات الذروة',
    departments: ['utilities', 'energy'],
    confidence: 92,
    timeframe: '7 أيام',
    action: 'مراجعة جدول التشغيل',
  },
  {
    id: 3,
    type: 'warning',
    title: 'تنبيه استباقي',
    message: 'تراكم النفايات المتوقع في المنطقة الشرقية قد يؤثر على معدلات السلامة',
    departments: ['waste', 'safety'],
    confidence: 78,
    timeframe: '48 ساعة',
    action: 'جدولة جولة إضافية',
  },
];

// City-Wide KPIs
const cityKPIs = [
  { name: 'كفاءة المدينة', value: 87, trend: '+3%', color: '#8B5CF6' },
  { name: 'رضا المواطنين', value: 82, trend: '+5%', color: '#22C55E' },
  { name: 'استهلاك الموارد', value: 68, trend: '-8%', color: '#06B6D4' },
  { name: 'الاستدامة', value: 75, trend: '+12%', color: '#F59E0B' },
];

export default function CrossDepartmentInsights() {
  const [activeTab, setActiveTab] = useState('correlations');
  const [selectedCorrelation, setSelectedCorrelation] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // AI Analysis Mutation
  const aiAnalysisMutation = useMutation({
    mutationFn: async () => {
      setIsAnalyzing(true);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل البيانات التالية من أقسام المدينة الذكية وقدم رؤى عبر الأقسام:
        
        بيانات المواصلات: ازدحام متوسط 65%، أوقات الذروة 8-10 صباحاً و 4-6 مساءً
        بيانات المرافق: استهلاك مياه 78%، ضغط الشبكة مستقر
        بيانات السلامة: معدل الحوادث منخفض، 95% تغطية كاميرات
        بيانات النفايات: كفاءة الجمع 75%، بعض التأخيرات في المنطقة الشرقية
        بيانات الطاقة: استهلاك 82%، ذروة بعد الظهر
        
        قدم:
        1. ثلاث رؤى رئيسية عبر الأقسام
        2. توقعات للـ 24 ساعة القادمة
        3. توصيات للتحسين`,
        response_json_schema: {
          type: "object",
          properties: {
            insights: { type: "array", items: { type: "string" } },
            predictions: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
          }
        }
      });
      setIsAnalyzing(false);
      return result;
    },
  });

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'amber';
      default: return 'blue';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 0 rgba(139, 92, 246, 0.4)',
                '0 0 20px rgba(139, 92, 246, 0.6)',
                '0 0 0 rgba(139, 92, 246, 0.4)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20"
          >
            <Brain className="w-6 h-6 text-purple-400" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              رؤى AI عبر الأقسام
              <Badge className="bg-purple-500/20 text-purple-400">
                <Sparkles className="w-3 h-3 ml-1" />
                تحليلات تنبؤية
              </Badge>
            </h3>
            <p className="text-slate-400 text-xs">تحليل الترابطات والتوقعات على مستوى المدينة</p>
          </div>
        </div>
        <Button 
          onClick={() => aiAnalysisMutation.mutate()}
          disabled={isAnalyzing}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isAnalyzing ? (
            <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
          ) : (
            <Brain className="w-4 h-4 ml-2" />
          )}
          تحليل AI
        </Button>
      </div>

      {/* City-Wide KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {cityKPIs.map((kpi, i) => (
          <motion.div
            key={kpi.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-xs">{kpi.name}</span>
                  <Badge className={`${kpi.trend.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} text-xs`}>
                    {kpi.trend}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">{kpi.value}%</span>
                  <Progress value={kpi.value} className="flex-1 h-2" style={{ '--progress-color': kpi.color }} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="correlations" className="data-[state=active]:bg-purple-500/20">
            <Link2 className="w-4 h-4 ml-1" />
            الترابطات
          </TabsTrigger>
          <TabsTrigger value="predictions" className="data-[state=active]:bg-cyan-500/20">
            <Target className="w-4 h-4 ml-1" />
            التوقعات
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-pink-500/20">
            <TrendingUp className="w-4 h-4 ml-1" />
            الاتجاهات
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-green-500/20">
            <BarChart3 className="w-4 h-4 ml-1" />
            الأداء
          </TabsTrigger>
        </TabsList>

        {/* Correlations Tab */}
        <TabsContent value="correlations" className="mt-4 space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {correlations.map((corr, i) => {
              const dept1 = DEPARTMENTS[corr.departments[0]];
              const dept2 = DEPARTMENTS[corr.departments[1]];
              const Icon1 = dept1.icon;
              const Icon2 = dept2.icon;
              
              return (
                <motion.div
                  key={corr.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Card className={`cursor-pointer border-${getImpactColor(corr.impact)}-500/30 bg-${getImpactColor(corr.impact)}-500/5`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg" style={{ background: `${dept1.color}20` }}>
                            <Icon1 className="w-5 h-5" style={{ color: dept1.color }} />
                          </div>
                          <span className="text-white text-sm">{dept1.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className={`w-4 h-4 ${corr.type === 'positive' ? 'text-green-400' : 'text-red-400'}`} />
                          <Badge className={`${corr.type === 'positive' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {Math.abs(corr.correlation * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg" style={{ background: `${dept2.color}20` }}>
                            <Icon2 className="w-5 h-5" style={{ color: dept2.color }} />
                          </div>
                          <span className="text-white text-sm">{dept2.name}</span>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-slate-800/50 rounded-lg mb-3">
                        <p className="text-slate-300 text-sm">{corr.insight}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-400" />
                          <span className="text-slate-400 text-xs">{corr.recommendation}</span>
                        </div>
                        <Badge className={`bg-${getImpactColor(corr.impact)}-500/20 text-${getImpactColor(corr.impact)}-400`}>
                          {corr.impact === 'critical' ? 'حرج' : corr.impact === 'high' ? 'عالي' : 'متوسط'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="mt-4 space-y-4">
          {predictiveAlerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`border-${alert.type === 'warning' ? 'amber' : alert.type === 'prediction' ? 'purple' : 'cyan'}-500/30`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-${alert.type === 'warning' ? 'amber' : alert.type === 'prediction' ? 'purple' : 'cyan'}-500/20`}>
                      {alert.type === 'warning' ? (
                        <AlertTriangle className="w-6 h-6 text-amber-400" />
                      ) : alert.type === 'prediction' ? (
                        <Target className="w-6 h-6 text-purple-400" />
                      ) : (
                        <Lightbulb className="w-6 h-6 text-cyan-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-white font-medium">{alert.title}</h4>
                        <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                          <Sparkles className="w-3 h-3 ml-1" />
                          {alert.confidence}% ثقة
                        </Badge>
                        <Badge className="bg-slate-700 text-slate-300 text-xs">
                          <Clock className="w-3 h-3 ml-1" />
                          {alert.timeframe}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm mb-3">{alert.message}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {alert.departments.map(deptId => {
                            const dept = DEPARTMENTS[deptId];
                            const Icon = dept.icon;
                            return (
                              <Badge key={deptId} style={{ background: `${dept.color}20`, color: dept.color }}>
                                <Icon className="w-3 h-3 ml-1" />
                                {dept.name}
                              </Badge>
                            );
                          })}
                        </div>
                        <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                          {alert.action}
                          <ChevronRight className="w-4 h-4 mr-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="mt-4">
          <Card className="border-slate-700/50 bg-slate-800/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">تحليل الاتجاهات المشتركة (24 ساعة)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={correlationData}>
                    <defs>
                      {Object.entries(DEPARTMENTS).map(([key, dept]) => (
                        <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={dept.color} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={dept.color} stopOpacity={0}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#1e293b', 
                        border: '1px solid #334155', 
                        borderRadius: '12px' 
                      }} 
                    />
                    <Legend />
                    {Object.entries(DEPARTMENTS).map(([key, dept]) => (
                      <Area
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={dept.color}
                        fill={`url(#gradient-${key})`}
                        strokeWidth={2}
                        name={dept.name}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="mt-4">
          <Card className="border-slate-700/50 bg-slate-800/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">مقارنة أداء الأقسام</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                    <Radar name="المواصلات" dataKey="transportation" stroke={DEPARTMENTS.transportation.color} fill={DEPARTMENTS.transportation.color} fillOpacity={0.2} />
                    <Radar name="المرافق" dataKey="utilities" stroke={DEPARTMENTS.utilities.color} fill={DEPARTMENTS.utilities.color} fillOpacity={0.2} />
                    <Radar name="السلامة" dataKey="safety" stroke={DEPARTMENTS.safety.color} fill={DEPARTMENTS.safety.color} fillOpacity={0.2} />
                    <Radar name="النفايات" dataKey="waste" stroke={DEPARTMENTS.waste.color} fill={DEPARTMENTS.waste.color} fillOpacity={0.2} />
                    <Legend />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#1e293b', 
                        border: '1px solid #334155', 
                        borderRadius: '12px' 
                      }} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Analysis Results */}
      {aiAnalysisMutation.data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-purple-500/30 bg-purple-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                نتائج تحليل AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiAnalysisMutation.data.insights?.map((insight, i) => (
                <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-300 text-sm">{insight}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}