import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, TrendingUp, TrendingDown, Package, AlertTriangle, DollarSign,
  Calendar, ShoppingCart, Check, Loader2, Sparkles, BarChart3,
  ArrowRight, RefreshCw, Download, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Area, AreaChart
} from 'recharts';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';

// بيانات تجريبية للتنبؤات
const mockForecasts = [
  {
    id: 1,
    item: 'فلتر مكيف',
    sku: 'AC-FLT-001',
    currentStock: 25,
    optimalStock: 35,
    predictedDemand: 15,
    forecastPeriod: '3 أشهر',
    seasonalFactor: 'summer_high',
    confidence: 92,
    trend: 'increasing',
    recommendation: 'زيادة المخزون بـ 10 وحدات',
    suggestedOrder: 15,
    suggestedSupplier: 'شركة التبريد المتحدة',
    historicalData: [
      { month: 'يناير', actual: 8, predicted: 7 },
      { month: 'فبراير', actual: 10, predicted: 9 },
      { month: 'مارس', actual: 12, predicted: 11 },
      { month: 'أبريل', actual: 14, predicted: 13 },
      { month: 'مايو', actual: 18, predicted: 17 },
      { month: 'يونيو', actual: null, predicted: 20 },
      { month: 'يوليو', actual: null, predicted: 22 },
      { month: 'أغسطس', actual: null, predicted: 20 },
    ]
  },
  {
    id: 2,
    item: 'بطارية كاميرا',
    sku: 'CAM-BAT-001',
    currentStock: 8,
    optimalStock: 20,
    predictedDemand: 12,
    forecastPeriod: '3 أشهر',
    seasonalFactor: 'stable',
    confidence: 88,
    trend: 'stable',
    recommendation: 'طلب عاجل - المخزون أقل من الحد الأدنى',
    suggestedOrder: 15,
    suggestedSupplier: 'موردي الإلكترونيات',
    historicalData: [
      { month: 'يناير', actual: 3, predicted: 3 },
      { month: 'فبراير', actual: 4, predicted: 4 },
      { month: 'مارس', actual: 4, predicted: 4 },
      { month: 'أبريل', actual: 5, predicted: 4 },
      { month: 'مايو', actual: 4, predicted: 4 },
      { month: 'يونيو', actual: null, predicted: 4 },
      { month: 'يوليو', actual: null, predicted: 4 },
      { month: 'أغسطس', actual: null, predicted: 4 },
    ]
  },
  {
    id: 3,
    item: 'زيت محرك',
    sku: 'VEH-OIL-001',
    currentStock: 10,
    optimalStock: 15,
    predictedDemand: 8,
    forecastPeriod: '3 أشهر',
    seasonalFactor: 'winter_high',
    confidence: 85,
    trend: 'decreasing',
    recommendation: 'المخزون كافٍ حالياً',
    suggestedOrder: 5,
    suggestedSupplier: 'شركة الزيوت الوطنية',
    historicalData: [
      { month: 'يناير', actual: 6, predicted: 7 },
      { month: 'فبراير', actual: 5, predicted: 6 },
      { month: 'مارس', actual: 4, predicted: 5 },
      { month: 'أبريل', actual: 3, predicted: 4 },
      { month: 'مايو', actual: 2, predicted: 3 },
      { month: 'يونيو', actual: null, predicted: 2 },
      { month: 'يوليو', actual: null, predicted: 2 },
      { month: 'أغسطس', actual: null, predicted: 3 },
    ]
  }
];

const supplierRecommendations = [
  { supplier: 'شركة التبريد المتحدة', rating: 4.8, deliveryTime: '3-5 أيام', priceRating: 'competitive', reliability: 95 },
  { supplier: 'موردي الإلكترونيات', rating: 4.5, deliveryTime: '2-4 أيام', priceRating: 'premium', reliability: 92 },
  { supplier: 'شركة الزيوت الوطنية', rating: 4.6, deliveryTime: '1-2 يوم', priceRating: 'budget', reliability: 90 },
];

export default function AIInventoryForecasting({ items = [] }) {
  const [forecasts, setForecasts] = useState(mockForecasts);
  const [selectedForecast, setSelectedForecast] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [orderItem, setOrderItem] = useState(null);

  // تحليل AI للتنبؤات
  const analyzeWithAI = useMutation({
    mutationFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `بناءً على البيانات التالية للمخزون، قم بتحليل وتقديم توصيات:
        
المخزون الحالي:
${forecasts.map(f => `- ${f.item}: ${f.currentStock} وحدة، الطلب المتوقع: ${f.predictedDemand}`).join('\n')}

قدم تحليلاً يتضمن:
1. تقييم عام لحالة المخزون
2. أولويات الطلب
3. توصيات للتحسين
4. تحذيرات إن وجدت`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_status: { type: "string" },
            priorities: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            warnings: { type: "array", items: { type: "string" } }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      toast.success('تم تحليل المخزون بنجاح');
    },
    onError: () => {
      toast.error('فشل في التحليل');
    }
  });

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    await analyzeWithAI.mutateAsync();
    setIsAnalyzing(false);
  };

  const createPurchaseOrder = (forecast) => {
    setOrderItem(forecast);
    setShowOrderDialog(true);
  };

  const confirmOrder = () => {
    toast.success(`تم إنشاء طلب شراء لـ ${orderItem.suggestedOrder} وحدة من ${orderItem.item}`);
    setShowOrderDialog(false);
  };

  const totalPredictedDemand = forecasts.reduce((sum, f) => sum + f.predictedDemand, 0);
  const itemsNeedingOrder = forecasts.filter(f => f.currentStock < f.optimalStock).length;
  const avgConfidence = Math.round(forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">التنبؤ الذكي بالمخزون</h3>
            <p className="text-slate-400 text-sm">تحليل AI للطلب المستقبلي والمستويات المثلى</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-purple-500/50 text-purple-400"
            onClick={runAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Sparkles className="w-4 h-4 ml-2" />}
            تحليل AI
          </Button>
          <Button variant="outline" className="border-slate-600">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-purple-500/30 bg-purple-500/5">
          <CardContent className="p-4 text-center">
            <Brain className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{avgConfidence}%</p>
            <p className="text-slate-400 text-xs">دقة التنبؤ</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{totalPredictedDemand}</p>
            <p className="text-slate-400 text-xs">الطلب المتوقع</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{itemsNeedingOrder}</p>
            <p className="text-slate-400 text-xs">تحتاج طلب</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <ShoppingCart className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{forecasts.reduce((s, f) => s + f.suggestedOrder, 0)}</p>
            <p className="text-slate-400 text-xs">طلبات مقترحة</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Results */}
      {analyzeWithAI.data && (
        <Card className="glass-card border-purple-500/30 bg-purple-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              نتائج تحليل AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-xs mb-2">الحالة العامة</p>
                <p className="text-white">{analyzeWithAI.data.overall_status}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-2">الأولويات</p>
                <ul className="space-y-1">
                  {analyzeWithAI.data.priorities?.map((p, i) => (
                    <li key={i} className="text-cyan-400 text-sm flex items-center gap-2">
                      <Check className="w-3 h-3" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              {analyzeWithAI.data.warnings?.length > 0 && (
                <div className="md:col-span-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-xs mb-2 font-medium">تحذيرات</p>
                  <ul className="space-y-1">
                    {analyzeWithAI.data.warnings.map((w, i) => (
                      <li key={i} className="text-red-300 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forecasts List */}
      <div className="space-y-4">
        {forecasts.map(forecast => (
          <Card key={forecast.id} className={`glass-card ${
            forecast.currentStock < forecast.optimalStock * 0.5 ? 'border-red-500/30 bg-red-500/5' :
            forecast.currentStock < forecast.optimalStock ? 'border-amber-500/30 bg-amber-500/5' :
            'border-green-500/30 bg-green-500/5'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-bold">{forecast.item}</h4>
                    <Badge className={`text-xs ${
                      forecast.trend === 'increasing' ? 'bg-red-500/20 text-red-400' :
                      forecast.trend === 'decreasing' ? 'bg-green-500/20 text-green-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {forecast.trend === 'increasing' ? <TrendingUp className="w-3 h-3 inline ml-1" /> :
                       forecast.trend === 'decreasing' ? <TrendingDown className="w-3 h-3 inline ml-1" /> : null}
                      {forecast.trend === 'increasing' ? 'متزايد' : forecast.trend === 'decreasing' ? 'متناقص' : 'مستقر'}
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                      {forecast.confidence}% ثقة
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-sm">{forecast.sku}</p>
                </div>
                <div className="text-left">
                  <p className="text-white font-bold text-lg">{forecast.currentStock}/{forecast.optimalStock}</p>
                  <p className="text-slate-400 text-xs">الحالي/الأمثل</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">مستوى المخزون</span>
                  <span className={`${
                    (forecast.currentStock / forecast.optimalStock) < 0.5 ? 'text-red-400' :
                    (forecast.currentStock / forecast.optimalStock) < 1 ? 'text-amber-400' :
                    'text-green-400'
                  }`}>
                    {Math.round((forecast.currentStock / forecast.optimalStock) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(forecast.currentStock / forecast.optimalStock) * 100} 
                  className="h-2"
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="p-2 bg-slate-800/50 rounded text-center">
                  <p className="text-cyan-400 font-bold">{forecast.predictedDemand}</p>
                  <p className="text-slate-500 text-xs">الطلب المتوقع</p>
                </div>
                <div className="p-2 bg-slate-800/50 rounded text-center">
                  <p className="text-amber-400 font-bold">{forecast.suggestedOrder}</p>
                  <p className="text-slate-500 text-xs">الطلب المقترح</p>
                </div>
                <div className="p-2 bg-slate-800/50 rounded text-center">
                  <p className="text-purple-400 font-bold">{forecast.forecastPeriod}</p>
                  <p className="text-slate-500 text-xs">فترة التنبؤ</p>
                </div>
                <div className="p-2 bg-slate-800/50 rounded text-center">
                  <p className="text-green-400 font-bold text-xs">{forecast.suggestedSupplier?.split(' ')[0]}</p>
                  <p className="text-slate-500 text-xs">المورد</p>
                </div>
              </div>

              {/* Chart */}
              <div className="h-32 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecast.historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="actual" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} name="الفعلي" />
                    <Area type="monotone" dataKey="predicted" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} strokeDasharray="5 5" name="المتوقع" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Recommendation & Actions */}
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-white text-sm">{forecast.recommendation}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-slate-600 h-7"
                    onClick={() => setSelectedForecast(forecast)}
                  >
                    <Eye className="w-3 h-3 ml-1" />
                    تفاصيل
                  </Button>
                  {forecast.currentStock < forecast.optimalStock && (
                    <Button 
                      size="sm" 
                      className="bg-purple-600 hover:bg-purple-700 h-7"
                      onClick={() => createPurchaseOrder(forecast)}
                    >
                      <ShoppingCart className="w-3 h-3 ml-1" />
                      طلب شراء
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Supplier Recommendations */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-400" />
            الموردون الموصى بهم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {supplierRecommendations.map((supplier, i) => (
              <div key={i} className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{supplier.supplier}</span>
                  <Badge className="bg-amber-500/20 text-amber-400">⭐ {supplier.rating}</Badge>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">وقت التوصيل</span>
                    <span className="text-white">{supplier.deliveryTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">مستوى الأسعار</span>
                    <span className={`${
                      supplier.priceRating === 'budget' ? 'text-green-400' :
                      supplier.priceRating === 'competitive' ? 'text-cyan-400' :
                      'text-amber-400'
                    }`}>
                      {supplier.priceRating === 'budget' ? 'اقتصادي' : supplier.priceRating === 'competitive' ? 'منافس' : 'ممتاز'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الموثوقية</span>
                    <span className="text-white">{supplier.reliability}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-purple-400" />
              إنشاء طلب شراء
            </DialogTitle>
          </DialogHeader>
          {orderItem && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-white font-bold">{orderItem.item}</p>
                <p className="text-slate-400 text-sm">{orderItem.sku}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-purple-500/10 rounded-lg text-center">
                  <p className="text-purple-400 font-bold text-xl">{orderItem.suggestedOrder}</p>
                  <p className="text-slate-400 text-xs">الكمية المقترحة</p>
                </div>
                <div className="p-3 bg-cyan-500/10 rounded-lg text-center">
                  <p className="text-cyan-400 font-bold text-sm">{orderItem.suggestedSupplier}</p>
                  <p className="text-slate-400 text-xs">المورد المقترح</p>
                </div>
              </div>

              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-300 text-sm">
                  <Check className="w-4 h-4 inline ml-1" />
                  سيتم إرسال الطلب للمورد تلقائياً وتحديث المخزون عند الاستلام
                </p>
              </div>

              <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={confirmOrder}>
                <Check className="w-4 h-4 ml-2" />
                تأكيد الطلب
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}