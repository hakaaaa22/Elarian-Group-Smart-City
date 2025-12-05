import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingDown, AlertTriangle, Package, Calendar, Zap, RefreshCw,
  ArrowRight, Clock, DollarSign, Target, Wrench, CheckCircle, Brain
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// بيانات التنبؤ بالنقص
const stockPredictions = [
  {
    id: 1,
    name: 'فلتر مكيف',
    currentStock: 25,
    avgMonthlyUsage: 8,
    predictedDepletion: '2025-03-15',
    daysUntilDepletion: 45,
    scheduledMaintenance: 12,
    riskLevel: 'medium',
    confidence: 87,
    usageHistory: [
      { month: 'يوليو', usage: 6 },
      { month: 'أغسطس', usage: 9 },
      { month: 'سبتمبر', usage: 10 },
      { month: 'أكتوبر', usage: 7 },
      { month: 'نوفمبر', usage: 8 },
      { month: 'ديسمبر', usage: 8 },
    ],
    forecast: [
      { month: 'يناير', predicted: 9, stock: 17 },
      { month: 'فبراير', predicted: 10, stock: 7 },
      { month: 'مارس', predicted: 8, stock: 0 },
    ]
  },
  {
    id: 2,
    name: 'بطارية كاميرا',
    currentStock: 8,
    avgMonthlyUsage: 5,
    predictedDepletion: '2025-01-20',
    daysUntilDepletion: 15,
    scheduledMaintenance: 6,
    riskLevel: 'high',
    confidence: 92,
    usageHistory: [
      { month: 'يوليو', usage: 4 },
      { month: 'أغسطس', usage: 5 },
      { month: 'سبتمبر', usage: 6 },
      { month: 'أكتوبر', usage: 5 },
      { month: 'نوفمبر', usage: 5 },
      { month: 'ديسمبر', usage: 5 },
    ],
    forecast: [
      { month: 'يناير', predicted: 6, stock: 2 },
      { month: 'فبراير', predicted: 5, stock: 0 },
    ]
  },
  {
    id: 3,
    name: 'حساس حركة',
    currentStock: 0,
    avgMonthlyUsage: 3,
    predictedDepletion: 'نفذ',
    daysUntilDepletion: 0,
    scheduledMaintenance: 4,
    riskLevel: 'critical',
    confidence: 100,
    usageHistory: [],
    forecast: []
  }
];

// توصيات مستويات إعادة الطلب
const reorderRecommendations = [
  {
    id: 1,
    name: 'فلتر مكيف',
    currentMinLevel: 10,
    recommendedLevel: 15,
    reasoning: 'زيادة الاستخدام الموسمي في الصيف',
    costImpact: '+250 ر.س مخزون إضافي',
    deliveryTime: 3,
    savings: '150 ر.س توفير في الطلبات العاجلة'
  },
  {
    id: 2,
    name: 'بطارية كاميرا',
    currentMinLevel: 15,
    recommendedLevel: 20,
    reasoning: 'تسارع استبدال البطاريات القديمة',
    costImpact: '+600 ر.س مخزون إضافي',
    deliveryTime: 5,
    savings: '300 ر.س توفير في الشحن السريع'
  },
  {
    id: 3,
    name: 'زيت محرك',
    currentMinLevel: 10,
    recommendedLevel: 8,
    reasoning: 'انخفاض استخدام الأسطول',
    costImpact: '-90 ر.س تقليل المخزون',
    deliveryTime: 2,
    savings: 'تحرير رأس مال'
  }
];

// ارتباط القطع بالأعطال
const partFailureCorrelation = [
  {
    part: 'فلتر مكيف',
    device: 'مكيف سبليت',
    correlation: 85,
    pattern: 'عند تجاوز 6 أشهر بدون تغيير',
    recommendation: 'صيانة وقائية كل 5 أشهر',
    failuresCaused: 8,
    costSaved: 2400
  },
  {
    part: 'بطارية كاميرا',
    device: 'كاميرا IP',
    correlation: 78,
    pattern: 'عند انخفاض الجهد عن 3.2V',
    recommendation: 'مراقبة الجهد واستبدال استباقي',
    failuresCaused: 5,
    costSaved: 1500
  },
  {
    part: 'حساس حركة',
    device: 'نظام الإنذار',
    correlation: 92,
    pattern: 'بعد 18 شهر من التشغيل المتواصل',
    recommendation: 'جدولة استبدال دوري',
    failuresCaused: 12,
    costSaved: 3600
  }
];

export default function AIStockPrediction({ items = [], onCreateOrder, onScheduleMaintenance }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const analysisMutation = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `حلل بيانات المخزون التالية وقدم توصيات استراتيجية:

توقعات النقص:
${stockPredictions.map(p => `- ${p.name}: المخزون ${p.currentStock}، نفاد متوقع خلال ${p.daysUntilDepletion} يوم`).join('\n')}

ارتباط القطع بالأعطال:
${partFailureCorrelation.map(c => `- ${c.part} → ${c.device}: ارتباط ${c.correlation}%`).join('\n')}

قدم:
1. أولويات الشراء العاجلة
2. توصيات لتحسين مستويات المخزون
3. صيانة استباقية مقترحة
4. فرص توفير التكاليف`,
        response_json_schema: {
          type: "object",
          properties: {
            urgentPurchases: { type: "array", items: { type: "string" } },
            stockOptimization: { type: "array", items: { type: "string" } },
            preventiveMaintenance: { type: "array", items: { type: "string" } },
            costSavings: { type: "array", items: { type: "string" } },
            summary: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAiAnalysis(data);
      setIsAnalyzing(false);
    },
    onError: () => {
      toast.error('فشل التحليل');
      setIsAnalyzing(false);
    }
  });

  const riskColors = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    medium: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            التنبؤ الذكي بالمخزون
          </h2>
          <p className="text-slate-400 text-sm">تحليل استباقي وتوصيات محسّنة</p>
        </div>
        <Button 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => { setIsAnalyzing(true); analysisMutation.mutate(); }}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Zap className="w-4 h-4 ml-2" />}
          تحليل شامل
        </Button>
      </div>

      {/* تنبيهات عاجلة */}
      <Card className="glass-card border-red-500/30 bg-red-500/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-300 font-medium">تنبيهات نقص المخزون</span>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {stockPredictions.filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high').map(pred => (
              <div key={pred.id} className={`p-3 rounded-lg border ${riskColors[pred.riskLevel]}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{pred.name}</span>
                  <Badge className={riskColors[pred.riskLevel]}>
                    {pred.riskLevel === 'critical' ? 'حرج' : 'عالي'}
                  </Badge>
                </div>
                <p className="text-slate-400 text-xs">
                  المخزون: {pred.currentStock} | نفاد خلال: {pred.daysUntilDepletion} يوم
                </p>
                <Button 
                  size="sm" 
                  className="w-full mt-2 bg-amber-600 hover:bg-amber-700"
                  onClick={() => onCreateOrder?.(pred)}
                >
                  طلب الآن
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="predictions">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="predictions" className="data-[state=active]:bg-cyan-500/20">
            <TrendingDown className="w-4 h-4 ml-2" />
            توقعات النفاد
          </TabsTrigger>
          <TabsTrigger value="reorder" className="data-[state=active]:bg-green-500/20">
            <Target className="w-4 h-4 ml-2" />
            مستويات الطلب
          </TabsTrigger>
          <TabsTrigger value="correlation" className="data-[state=active]:bg-purple-500/20">
            <Wrench className="w-4 h-4 ml-2" />
            ارتباط الأعطال
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4 mt-4">
          {stockPredictions.map(pred => (
            <Card key={pred.id} className={`glass-card border ${riskColors[pred.riskLevel]}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold">{pred.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>المخزون: {pred.currentStock}</span>
                      <span>الاستخدام الشهري: {pred.avgMonthlyUsage}</span>
                      <span>صيانات مجدولة: {pred.scheduledMaintenance}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className={`font-bold ${pred.daysUntilDepletion <= 15 ? 'text-red-400' : pred.daysUntilDepletion <= 30 ? 'text-amber-400' : 'text-green-400'}`}>
                      {pred.daysUntilDepletion === 0 ? 'نفذ!' : `${pred.daysUntilDepletion} يوم`}
                    </p>
                    <p className="text-slate-500 text-xs">حتى النفاد</p>
                  </div>
                </div>

                {pred.forecast.length > 0 && (
                  <div className="h-32 mb-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={pred.forecast}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                        <Area type="monotone" dataKey="stock" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} name="المخزون" />
                        <Area type="monotone" dataKey="predicted" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="الاستخدام" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Badge className="bg-purple-500/20 text-purple-400">
                    دقة التنبؤ: {pred.confidence}%
                  </Badge>
                  <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-400">
                    تفاصيل
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reorder" className="space-y-4 mt-4">
          <Card className="glass-card border-green-500/30 bg-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-medium">توصيات تحسين مستويات الطلب</span>
              </div>
              <p className="text-slate-400 text-sm">بناءً على تحليل التكاليف ووقت التسليم</p>
            </CardContent>
          </Card>

          {reorderRecommendations.map(rec => (
            <Card key={rec.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold">{rec.name}</h3>
                    <p className="text-slate-400 text-sm mt-1">{rec.reasoning}</p>
                  </div>
                  <Badge className={rec.recommendedLevel > rec.currentMinLevel ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}>
                    {rec.recommendedLevel > rec.currentMinLevel ? 'زيادة' : 'تقليل'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="p-2 bg-slate-800/50 rounded text-center">
                    <p className="text-slate-400 text-xs">الحالي</p>
                    <p className="text-white font-bold">{rec.currentMinLevel}</p>
                  </div>
                  <div className="p-2 bg-cyan-500/10 rounded text-center">
                    <ArrowRight className="w-4 h-4 text-cyan-400 mx-auto" />
                  </div>
                  <div className="p-2 bg-green-500/10 rounded text-center">
                    <p className="text-slate-400 text-xs">الموصى</p>
                    <p className="text-green-400 font-bold">{rec.recommendedLevel}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    <DollarSign className="w-3 h-3 inline" /> {rec.costImpact}
                  </span>
                  <span className="text-green-400">
                    <CheckCircle className="w-3 h-3 inline" /> {rec.savings}
                  </span>
                </div>

                <Button size="sm" className="w-full mt-3 bg-green-600 hover:bg-green-700">
                  تطبيق التوصية
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="correlation" className="space-y-4 mt-4">
          <Card className="glass-card border-purple-500/30 bg-purple-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-5 h-5 text-purple-400" />
                <span className="text-purple-300 font-medium">ارتباط القطع بأعطال الأجهزة</span>
              </div>
              <p className="text-slate-400 text-sm">تحليل أنماط الأعطال للصيانة الاستباقية</p>
            </CardContent>
          </Card>

          {partFailureCorrelation.map((corr, idx) => (
            <Card key={idx} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-bold">{corr.part}</h3>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                      <span className="text-cyan-400">{corr.device}</span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">{corr.pattern}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-purple-400 font-bold text-xl">{corr.correlation}%</p>
                    <p className="text-slate-500 text-xs">ارتباط</p>
                  </div>
                </div>

                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-3">
                  <p className="text-green-400 text-sm">
                    <Zap className="w-4 h-4 inline ml-1" />
                    {corr.recommendation}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-400">{corr.failuresCaused} أعطال مرتبطة</span>
                  <span className="text-green-400">توفير محتمل: {corr.costSaved} ر.س</span>
                </div>

                <Button 
                  size="sm" 
                  className="w-full mt-3 bg-purple-600 hover:bg-purple-700"
                  onClick={() => onScheduleMaintenance?.(corr)}
                >
                  جدولة صيانة استباقية
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* AI Analysis Results */}
      {aiAnalysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card border-purple-500/30 bg-purple-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-300 text-sm flex items-center gap-2">
                <Brain className="w-4 h-4" />
                تحليل AI الشامل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300 text-sm">{aiAnalysis.summary}</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {aiAnalysis.urgentPurchases?.length > 0 && (
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <h4 className="text-red-400 text-xs font-medium mb-2">مشتريات عاجلة</h4>
                    <ul className="space-y-1">
                      {aiAnalysis.urgentPurchases.map((item, i) => (
                        <li key={i} className="text-slate-400 text-xs">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {aiAnalysis.preventiveMaintenance?.length > 0 && (
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <h4 className="text-purple-400 text-xs font-medium mb-2">صيانة استباقية</h4>
                    <ul className="space-y-1">
                      {aiAnalysis.preventiveMaintenance.map((item, i) => (
                        <li key={i} className="text-slate-400 text-xs">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}