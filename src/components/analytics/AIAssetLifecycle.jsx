import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, Clock, Wrench, RefreshCw,
  AlertTriangle, CheckCircle, Brain, Zap, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
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

const assetLifecycleData = [
  {
    id: 1,
    name: 'مكيف سبليت - المبنى أ',
    type: 'تكييف',
    purchaseDate: '2020-06-15',
    purchaseCost: 3500,
    currentAge: 4.5,
    expectedLife: 10,
    totalMaintenance: 2800,
    maintenanceHistory: [
      { year: 2021, cost: 350 },
      { year: 2022, cost: 500 },
      { year: 2023, cost: 850 },
      { year: 2024, cost: 1100 },
    ],
    predictedMaintenance: [
      { year: 2025, cost: 1500 },
      { year: 2026, cost: 2000 },
    ],
    replacementCost: 4500,
    recommendation: 'continue',
    healthScore: 65,
    breakEvenYears: 2.1
  },
  {
    id: 2,
    name: 'كاميرا أمنية - البوابة',
    type: 'أمن',
    purchaseDate: '2019-03-20',
    purchaseCost: 1200,
    currentAge: 5.7,
    expectedLife: 7,
    totalMaintenance: 950,
    maintenanceHistory: [
      { year: 2020, cost: 100 },
      { year: 2021, cost: 150 },
      { year: 2022, cost: 200 },
      { year: 2023, cost: 250 },
      { year: 2024, cost: 250 },
    ],
    predictedMaintenance: [
      { year: 2025, cost: 400 },
      { year: 2026, cost: 600 },
    ],
    replacementCost: 1500,
    recommendation: 'replace_soon',
    healthScore: 42,
    breakEvenYears: 0.8
  },
  {
    id: 3,
    name: 'حساس حركة - المستودع',
    type: 'أمن',
    purchaseDate: '2022-01-10',
    purchaseCost: 450,
    currentAge: 2.9,
    expectedLife: 5,
    totalMaintenance: 180,
    maintenanceHistory: [
      { year: 2023, cost: 80 },
      { year: 2024, cost: 100 },
    ],
    predictedMaintenance: [
      { year: 2025, cost: 150 },
    ],
    replacementCost: 500,
    recommendation: 'continue',
    healthScore: 78,
    breakEvenYears: 3.2
  }
];

const COLORS = ['#22d3ee', '#22c55e', '#f59e0b', '#ef4444', '#a855f7'];

export default function AIAssetLifecycle() {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const analysisMutation = useMutation({
    mutationFn: async (asset) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `حلل دورة حياة الأصل التالي وقدم توصيات مالية:

الأصل: ${asset.name}
تكلفة الشراء: ${asset.purchaseCost} ر.س
العمر الحالي: ${asset.currentAge} سنوات
العمر المتوقع: ${asset.expectedLife} سنوات
إجمالي تكاليف الصيانة: ${asset.totalMaintenance} ر.س
تكلفة الاستبدال: ${asset.replacementCost} ر.س
درجة الصحة: ${asset.healthScore}%

قدم:
1. تحليل التكلفة الإجمالية للملكية (TCO)
2. نقطة التعادل للاستبدال
3. توصية واضحة (استمرار الصيانة أو الاستبدال)
4. توقعات التكلفة للسنوات الثلاث القادمة`,
        response_json_schema: {
          type: "object",
          properties: {
            tcoAnalysis: { type: "string" },
            breakEvenAnalysis: { type: "string" },
            recommendation: { type: "string" },
            recommendationType: { type: "string" },
            costForecast: { type: "array", items: { type: "object", properties: { year: { type: "number" }, maintenance: { type: "number" }, replacement: { type: "number" } } } },
            savings: { type: "number" },
            confidence: { type: "number" }
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

  const analyzeAsset = (asset) => {
    setSelectedAsset(asset);
    setIsAnalyzing(true);
    setAiAnalysis(null);
    analysisMutation.mutate(asset);
  };

  const totalCosts = assetLifecycleData.map(a => ({
    name: a.name.split(' - ')[0],
    purchase: a.purchaseCost,
    maintenance: a.totalMaintenance,
    total: a.purchaseCost + a.totalMaintenance
  }));

  const recommendationColors = {
    continue: 'bg-green-500/20 text-green-400',
    replace_soon: 'bg-amber-500/20 text-amber-400',
    replace_now: 'bg-red-500/20 text-red-400'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            تحليل دورة حياة الأصول
          </h2>
          <p className="text-slate-400 text-sm">تحليل تكاليف الصيانة مقابل الاستبدال</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-cyan-500/20 bg-cyan-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-cyan-400">
              {assetLifecycleData.reduce((s, a) => s + a.purchaseCost, 0).toLocaleString()}
            </p>
            <p className="text-slate-400 text-xs">إجمالي قيمة الأصول</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">
              {assetLifecycleData.reduce((s, a) => s + a.totalMaintenance, 0).toLocaleString()}
            </p>
            <p className="text-slate-400 text-xs">إجمالي تكاليف الصيانة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-green-500/20 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">
              {assetLifecycleData.filter(a => a.recommendation === 'continue').length}
            </p>
            <p className="text-slate-400 text-xs">أصول بحالة جيدة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-red-500/20 bg-red-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">
              {assetLifecycleData.filter(a => a.recommendation !== 'continue').length}
            </p>
            <p className="text-slate-400 text-xs">تحتاج استبدال</p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Chart */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">التكلفة الإجمالية للملكية (TCO)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={totalCosts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
              <Legend />
              <Bar dataKey="purchase" name="تكلفة الشراء" fill="#22d3ee" stackId="a" />
              <Bar dataKey="maintenance" name="تكاليف الصيانة" fill="#f59e0b" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Assets List */}
      <div className="space-y-3">
        {assetLifecycleData.map((asset) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold">{asset.name}</h3>
                      <Badge className={recommendationColors[asset.recommendation]}>
                        {asset.recommendation === 'continue' ? 'استمرار الصيانة' : 
                         asset.recommendation === 'replace_soon' ? 'استبدال قريباً' : 'استبدال فوري'}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm">{asset.type}</p>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1">
                      <span className={`text-2xl font-bold ${asset.healthScore > 60 ? 'text-green-400' : asset.healthScore > 40 ? 'text-amber-400' : 'text-red-400'}`}>
                        {asset.healthScore}%
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs">صحة الأصل</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-3">
                  <div className="p-2 bg-slate-800/50 rounded text-center">
                    <p className="text-cyan-400 font-bold text-sm">{asset.purchaseCost}</p>
                    <p className="text-slate-500 text-[10px]">تكلفة الشراء</p>
                  </div>
                  <div className="p-2 bg-slate-800/50 rounded text-center">
                    <p className="text-amber-400 font-bold text-sm">{asset.totalMaintenance}</p>
                    <p className="text-slate-500 text-[10px]">الصيانة التراكمية</p>
                  </div>
                  <div className="p-2 bg-slate-800/50 rounded text-center">
                    <p className="text-white font-bold text-sm">{asset.currentAge.toFixed(1)} سنة</p>
                    <p className="text-slate-500 text-[10px]">العمر الحالي</p>
                  </div>
                  <div className="p-2 bg-slate-800/50 rounded text-center">
                    <p className="text-purple-400 font-bold text-sm">{asset.replacementCost}</p>
                    <p className="text-slate-500 text-[10px]">تكلفة الاستبدال</p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>العمر المستهلك</span>
                    <span>{((asset.currentAge / asset.expectedLife) * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={(asset.currentAge / asset.expectedLife) * 100} className="h-1.5" />
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => analyzeAsset(asset)}
                    disabled={isAnalyzing && selectedAsset?.id === asset.id}
                  >
                    {isAnalyzing && selectedAsset?.id === asset.id ? (
                      <RefreshCw className="w-3 h-3 ml-1 animate-spin" />
                    ) : (
                      <Brain className="w-3 h-3 ml-1" />
                    )}
                    تحليل AI
                  </Button>
                </div>

                {/* AI Analysis Result */}
                {aiAnalysis && selectedAsset?.id === asset.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-5 h-5 text-purple-400" />
                      <span className="text-purple-300 font-medium">تحليل AI</span>
                      <Badge className="bg-purple-500/20 text-purple-400">
                        دقة: {aiAnalysis.confidence}%
                      </Badge>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs mb-1">تحليل TCO:</p>
                        <p className="text-slate-300">{aiAnalysis.tcoAnalysis}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs mb-1">نقطة التعادل:</p>
                        <p className="text-slate-300">{aiAnalysis.breakEvenAnalysis}</p>
                      </div>
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded">
                        <p className="text-green-400 font-medium">
                          <Zap className="w-4 h-4 inline ml-1" />
                          التوصية: {aiAnalysis.recommendation}
                        </p>
                        {aiAnalysis.savings > 0 && (
                          <p className="text-green-300 text-xs mt-1">
                            توفير محتمل: {aiAnalysis.savings.toLocaleString()} ر.س
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}