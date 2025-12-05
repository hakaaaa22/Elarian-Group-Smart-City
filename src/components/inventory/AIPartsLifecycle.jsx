import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Package, AlertTriangle, TrendingUp, TrendingDown, Clock,
  Wrench, RefreshCw, Zap, BarChart3, Calendar, CheckCircle,
  XCircle, Activity, Target, ArrowRight, Lightbulb
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// بيانات دورة حياة القطع
const mockLifecycleData = [
  {
    id: 1,
    name: 'فلتر مكيف AC-001',
    category: 'تكييف',
    avgLifespan: 180, // أيام
    currentAge: 145,
    usageCount: 23,
    failureRate: 2.5,
    replacementCost: 50,
    lastReplaced: '2024-06-15',
    predictedEnd: '2024-12-20',
    healthScore: 35,
    usagePattern: [
      { month: 'يناير', usage: 2 },
      { month: 'فبراير', usage: 3 },
      { month: 'مارس', usage: 4 },
      { month: 'أبريل', usage: 5 },
      { month: 'مايو', usage: 6 },
      { month: 'يونيو', usage: 4 }
    ],
    linkedDevices: ['مكيف غرفة المعيشة', 'مكيف غرفة النوم'],
    recommendations: ['استبدال خلال 5 أسابيع', 'طلب قطعة بديلة الآن']
  },
  {
    id: 2,
    name: 'بطارية كاميرا CAM-BAT-001',
    category: 'أمن',
    avgLifespan: 365,
    currentAge: 280,
    usageCount: 12,
    failureRate: 1.2,
    replacementCost: 120,
    lastReplaced: '2024-02-01',
    predictedEnd: '2025-01-15',
    healthScore: 55,
    usagePattern: [
      { month: 'يناير', usage: 2 },
      { month: 'فبراير', usage: 2 },
      { month: 'مارس', usage: 2 },
      { month: 'أبريل', usage: 2 },
      { month: 'مايو', usage: 2 },
      { month: 'يونيو', usage: 2 }
    ],
    linkedDevices: ['كاميرا المدخل', 'كاميرا الحديقة'],
    recommendations: ['فحص دوري بعد شهرين', 'مراقبة مستوى الشحن']
  },
  {
    id: 3,
    name: 'حساس حركة SEC-MOT-001',
    category: 'أمن',
    avgLifespan: 730,
    currentAge: 650,
    usageCount: 8,
    failureRate: 5.8,
    replacementCost: 85,
    lastReplaced: '2023-02-10',
    predictedEnd: '2024-12-10',
    healthScore: 18,
    usagePattern: [
      { month: 'يناير', usage: 1 },
      { month: 'فبراير', usage: 1 },
      { month: 'مارس', usage: 2 },
      { month: 'أبريل', usage: 1 },
      { month: 'مايو', usage: 2 },
      { month: 'يونيو', usage: 1 }
    ],
    linkedDevices: ['نظام الإنذار'],
    recommendations: ['استبدال فوري', 'معدل أعطال مرتفع']
  },
  {
    id: 4,
    name: 'ضاغط مكيف AC-COMP-001',
    category: 'تكييف',
    avgLifespan: 2555,
    currentAge: 1200,
    usageCount: 3,
    failureRate: 0.5,
    replacementCost: 1500,
    lastReplaced: '2021-08-20',
    predictedEnd: '2028-08-20',
    healthScore: 78,
    usagePattern: [
      { month: 'يناير', usage: 0 },
      { month: 'فبراير', usage: 0 },
      { month: 'مارس', usage: 1 },
      { month: 'أبريل', usage: 0 },
      { month: 'مايو', usage: 1 },
      { month: 'يونيو', usage: 1 }
    ],
    linkedDevices: ['مكيف غرفة المعيشة'],
    recommendations: ['صيانة وقائية سنوية', 'أداء جيد']
  }
];

// بيانات التنبؤ بالأعطال
const failurePredictions = [
  {
    id: 1,
    device: 'مكيف غرفة المعيشة',
    part: 'فلتر مكيف',
    probability: 85,
    estimatedDate: '2024-12-20',
    impact: 'high',
    suggestedAction: 'استبدال الفلتر قبل الموعد المتوقع',
    estimatedCost: 50,
    downtime: '30 دقيقة'
  },
  {
    id: 2,
    device: 'نظام الإنذار',
    part: 'حساس حركة',
    probability: 92,
    estimatedDate: '2024-12-10',
    impact: 'critical',
    suggestedAction: 'استبدال فوري لتجنب فشل النظام',
    estimatedCost: 85,
    downtime: '1 ساعة'
  },
  {
    id: 3,
    device: 'كاميرا الحديقة',
    part: 'بطارية',
    probability: 45,
    estimatedDate: '2025-01-15',
    impact: 'medium',
    suggestedAction: 'مراقبة ومتابعة',
    estimatedCost: 120,
    downtime: '15 دقيقة'
  }
];

export default function AIPartsLifecycle({ inventoryItems = [], onScheduleMaintenance, onOrderParts }) {
  const [selectedPart, setSelectedPart] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [activeTab, setActiveTab] = useState('lifecycle');

  // تحليل AI لدورة الحياة
  const analysisMutation = useMutation({
    mutationFn: async (part) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `حلل دورة حياة قطعة الغيار التالية وقدم توصيات:

القطعة: ${part.name}
الفئة: ${part.category}
العمر الحالي: ${part.currentAge} يوم من أصل ${part.avgLifespan} يوم
معدل الأعطال: ${part.failureRate}%
درجة الصحة: ${part.healthScore}%
تكلفة الاستبدال: ${part.replacementCost} ر.س

قدم:
1. تقييم الحالة الحالية
2. توقع العمر المتبقي
3. هل يُنصح بالاستبدال أم الصيانة
4. توصيات لإطالة العمر الافتراضي
5. تقدير التكلفة الإجمالية للصيانة مقابل الاستبدال`,
        response_json_schema: {
          type: "object",
          properties: {
            condition: { type: "string" },
            remainingLife: { type: "string" },
            recommendation: { type: "string", enum: ["replace_now", "replace_soon", "maintain", "monitor"] },
            tips: { type: "array", items: { type: "string" } },
            maintenanceCost: { type: "number" },
            replacementCost: { type: "number" },
            costBenefit: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAiRecommendations(data);
      setIsAnalyzing(false);
    },
    onError: () => {
      toast.error('فشل التحليل');
      setIsAnalyzing(false);
    }
  });

  // إحصائيات عامة
  const stats = useMemo(() => {
    const critical = mockLifecycleData.filter(p => p.healthScore < 30).length;
    const warning = mockLifecycleData.filter(p => p.healthScore >= 30 && p.healthScore < 60).length;
    const healthy = mockLifecycleData.filter(p => p.healthScore >= 60).length;
    const avgHealth = mockLifecycleData.reduce((sum, p) => sum + p.healthScore, 0) / mockLifecycleData.length;
    const totalReplacementCost = mockLifecycleData
      .filter(p => p.healthScore < 30)
      .reduce((sum, p) => sum + p.replacementCost, 0);

    return { critical, warning, healthy, avgHealth, totalReplacementCost };
  }, []);

  const getHealthColor = (score) => {
    if (score < 30) return 'text-red-400';
    if (score < 60) return 'text-amber-400';
    return 'text-green-400';
  };

  const getHealthBg = (score) => {
    if (score < 30) return 'bg-red-500/20';
    if (score < 60) return 'bg-amber-500/20';
    return 'bg-green-500/20';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            تحليل دورة حياة القطع
          </h2>
          <p className="text-slate-400 text-sm">التنبؤ بالأعطال والصيانة الاستباقية</p>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="glass-card border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-400">{stats.critical}</p>
            <p className="text-slate-400 text-xs">حرجة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-400">{stats.warning}</p>
            <p className="text-slate-400 text-xs">تحذير</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{stats.healthy}</p>
            <p className="text-slate-400 text-xs">سليمة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-cyan-400">{stats.avgHealth.toFixed(0)}%</p>
            <p className="text-slate-400 text-xs">متوسط الصحة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-purple-500/30 bg-purple-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-400">{stats.totalReplacementCost}</p>
            <p className="text-slate-400 text-xs">تكلفة الاستبدال (ر.س)</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="lifecycle" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Activity className="w-4 h-4 ml-2" />
            دورة الحياة
          </TabsTrigger>
          <TabsTrigger value="predictions" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
            <AlertTriangle className="w-4 h-4 ml-2" />
            التنبؤات ({failurePredictions.length})
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Wrench className="w-4 h-4 ml-2" />
            الصيانة الاستباقية
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lifecycle" className="space-y-4 mt-4">
          {/* قائمة القطع */}
          <div className="grid md:grid-cols-2 gap-4">
            {mockLifecycleData.map((part) => (
              <motion.div key={part.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 cursor-pointer hover:border-cyan-500/50 transition-colors ${
                  part.healthScore < 30 ? 'ring-1 ring-red-500/50' : ''
                }`} onClick={() => { setSelectedPart(part); setShowDetails(true); }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-bold">{part.name}</h3>
                        <p className="text-slate-400 text-sm">{part.category}</p>
                      </div>
                      <div className={`p-2 rounded-lg ${getHealthBg(part.healthScore)}`}>
                        <span className={`text-2xl font-bold ${getHealthColor(part.healthScore)}`}>
                          {part.healthScore}%
                        </span>
                      </div>
                    </div>

                    {/* شريط التقدم */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>العمر: {part.currentAge} يوم</span>
                        <span>المتوقع: {part.avgLifespan} يوم</span>
                      </div>
                      <Progress 
                        value={(part.currentAge / part.avgLifespan) * 100} 
                        className="h-2"
                      />
                    </div>

                    {/* معلومات إضافية */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="p-2 bg-slate-800/50 rounded text-center">
                        <p className="text-white font-bold text-sm">{part.usageCount}</p>
                        <p className="text-slate-500 text-[10px]">استخدامات</p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded text-center">
                        <p className="text-amber-400 font-bold text-sm">{part.failureRate}%</p>
                        <p className="text-slate-500 text-[10px]">معدل الأعطال</p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded text-center">
                        <p className="text-cyan-400 font-bold text-sm">{part.replacementCost}</p>
                        <p className="text-slate-500 text-[10px]">تكلفة (ر.س)</p>
                      </div>
                    </div>

                    {/* التوصيات */}
                    {part.recommendations.length > 0 && (
                      <div className={`p-2 rounded-lg ${part.healthScore < 30 ? 'bg-red-500/10 border border-red-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
                        <p className={`text-xs ${part.healthScore < 30 ? 'text-red-400' : 'text-amber-400'}`}>
                          <Lightbulb className="w-3 h-3 inline ml-1" />
                          {part.recommendations[0]}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4 mt-4">
          <Card className="glass-card border-red-500/30 bg-red-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-300 font-medium">تنبؤات الأعطال المحتملة</span>
              </div>
              <p className="text-slate-400 text-sm">بناءً على أنماط الاستخدام والبيانات التاريخية</p>
            </CardContent>
          </Card>

          {failurePredictions.map((pred) => (
            <motion.div key={pred.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className={`glass-card border-${pred.impact === 'critical' ? 'red' : pred.impact === 'high' ? 'amber' : 'blue'}-500/30`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-bold">{pred.device}</h3>
                      <p className="text-slate-400 text-sm">القطعة: {pred.part}</p>
                    </div>
                    <div className="text-left">
                      <Badge className={`${
                        pred.impact === 'critical' ? 'bg-red-500/20 text-red-400' :
                        pred.impact === 'high' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {pred.impact === 'critical' ? 'حرج' : pred.impact === 'high' ? 'عالي' : 'متوسط'}
                      </Badge>
                    </div>
                  </div>

                  {/* احتمالية العطل */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">احتمالية العطل</span>
                      <span className={`font-bold ${pred.probability > 70 ? 'text-red-400' : 'text-amber-400'}`}>
                        {pred.probability}%
                      </span>
                    </div>
                    <Progress value={pred.probability} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="p-2 bg-slate-800/50 rounded text-center">
                      <Calendar className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      <p className="text-white text-xs">{pred.estimatedDate}</p>
                      <p className="text-slate-500 text-[10px]">التاريخ المتوقع</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded text-center">
                      <Clock className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      <p className="text-white text-xs">{pred.downtime}</p>
                      <p className="text-slate-500 text-[10px]">وقت التوقف</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded text-center">
                      <Package className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      <p className="text-white text-xs">{pred.estimatedCost} ر.س</p>
                      <p className="text-slate-500 text-[10px]">التكلفة</p>
                    </div>
                  </div>

                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg mb-3">
                    <p className="text-cyan-300 text-sm">
                      <Zap className="w-4 h-4 inline ml-1" />
                      {pred.suggestedAction}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-amber-600 hover:bg-amber-700"
                      onClick={() => onScheduleMaintenance?.(pred)}
                    >
                      <Wrench className="w-3 h-3 ml-1" />
                      جدولة صيانة
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 border-purple-500/50 text-purple-400"
                      onClick={() => onOrderParts?.(pred)}
                    >
                      <Package className="w-3 h-3 ml-1" />
                      طلب قطعة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4 mt-4">
          <Card className="glass-card border-green-500/30 bg-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-medium">الصيانة الاستباقية المقترحة</span>
              </div>
              <p className="text-slate-400 text-sm">إجراءات لإطالة عمر القطع وتجنب الأعطال</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {mockLifecycleData.filter(p => p.healthScore < 70).map((part) => (
              <Card key={part.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-bold">{part.name}</h3>
                    <Badge className={getHealthBg(part.healthScore)}>
                      <span className={getHealthColor(part.healthScore)}>{part.healthScore}%</span>
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {part.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-slate-300 text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className="w-full mt-3 bg-green-600 hover:bg-green-700" 
                    size="sm"
                    onClick={() => {
                      setSelectedPart(part);
                      setIsAnalyzing(true);
                      analysisMutation.mutate(part);
                      setShowDetails(true);
                    }}
                  >
                    <Zap className="w-3 h-3 ml-1" />
                    تحليل AI مفصل
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* نافذة التفاصيل */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              تحليل دورة الحياة
            </DialogTitle>
          </DialogHeader>
          {selectedPart && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <h3 className="text-white font-bold">{selectedPart.name}</h3>
                <p className="text-slate-400 text-sm">{selectedPart.category}</p>
              </div>

              {/* رسم بياني للاستخدام */}
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedPart.usagePattern}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                    <Area type="monotone" dataKey="usage" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* تحليل AI */}
              {isAnalyzing ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
                  <p className="text-slate-400">جاري التحليل...</p>
                </div>
              ) : aiRecommendations ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <p className="text-purple-300 text-sm">{aiRecommendations.condition}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-slate-800/50 rounded text-center">
                      <p className="text-slate-400 text-xs">العمر المتبقي</p>
                      <p className="text-white font-bold">{aiRecommendations.remainingLife}</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded text-center">
                      <p className="text-slate-400 text-xs">التوصية</p>
                      <Badge className={`${
                        aiRecommendations.recommendation === 'replace_now' ? 'bg-red-500/20 text-red-400' :
                        aiRecommendations.recommendation === 'replace_soon' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {aiRecommendations.recommendation === 'replace_now' ? 'استبدال فوري' :
                         aiRecommendations.recommendation === 'replace_soon' ? 'استبدال قريب' :
                         aiRecommendations.recommendation === 'maintain' ? 'صيانة' : 'مراقبة'}
                      </Badge>
                    </div>
                  </div>

                  {aiRecommendations.tips?.length > 0 && (
                    <div>
                      <h4 className="text-slate-300 text-sm mb-2">نصائح لإطالة العمر:</h4>
                      <ul className="space-y-1">
                        {aiRecommendations.tips.map((tip, i) => (
                          <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
                            <Lightbulb className="w-3 h-3 text-amber-400 mt-1 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ) : null}

              {/* الأجهزة المرتبطة */}
              <div>
                <h4 className="text-slate-300 text-sm mb-2">الأجهزة المرتبطة:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPart.linkedDevices.map((device, idx) => (
                    <Badge key={idx} variant="outline" className="border-slate-600">
                      {device}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}