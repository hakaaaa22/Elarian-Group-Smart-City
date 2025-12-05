import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Star, TrendingUp, TrendingDown, Clock, DollarSign,
  Package, CheckCircle, AlertTriangle, Mail, Phone, FileText,
  Search, Filter, BarChart3, Zap, Send, RefreshCw, Award,
  ThumbsUp, ThumbsDown, MessageSquare, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// بيانات الموردين
const mockSuppliers = [
  {
    id: 1,
    name: 'شركة المستلزمات الصناعية',
    category: 'قطع غيار',
    email: 'orders@industrial-supplies.sa',
    phone: '+966 11 XXX XXXX',
    rating: 4.8,
    deliveryScore: 95,
    qualityScore: 92,
    priceScore: 85,
    totalOrders: 156,
    onTimeDelivery: 148,
    avgDeliveryDays: 3,
    avgResponseTime: '4 ساعات',
    lastOrder: '2024-12-01',
    status: 'preferred',
    products: ['فلاتر', 'محركات', 'حساسات']
  },
  {
    id: 2,
    name: 'مؤسسة التقنية المتقدمة',
    category: 'إلكترونيات',
    email: 'sales@advtech.sa',
    phone: '+966 12 XXX XXXX',
    rating: 4.5,
    deliveryScore: 88,
    qualityScore: 94,
    priceScore: 78,
    totalOrders: 89,
    onTimeDelivery: 78,
    avgDeliveryDays: 5,
    avgResponseTime: '8 ساعات',
    lastOrder: '2024-11-28',
    status: 'active',
    products: ['كاميرات', 'أجهزة استشعار', 'لوحات تحكم']
  },
  {
    id: 3,
    name: 'مصنع قطع الغيار الوطني',
    category: 'قطع غيار',
    email: 'info@national-parts.sa',
    phone: '+966 13 XXX XXXX',
    rating: 4.2,
    deliveryScore: 82,
    qualityScore: 88,
    priceScore: 92,
    totalOrders: 67,
    onTimeDelivery: 55,
    avgDeliveryDays: 7,
    avgResponseTime: '24 ساعة',
    lastOrder: '2024-11-15',
    status: 'active',
    products: ['بطاريات', 'كابلات', 'موصلات']
  },
  {
    id: 4,
    name: 'الشركة العربية للتوريدات',
    category: 'عام',
    email: 'procurement@arab-supplies.sa',
    phone: '+966 14 XXX XXXX',
    rating: 3.8,
    deliveryScore: 75,
    qualityScore: 80,
    priceScore: 95,
    totalOrders: 45,
    onTimeDelivery: 34,
    avgDeliveryDays: 10,
    avgResponseTime: '48 ساعة',
    lastOrder: '2024-10-20',
    status: 'under_review',
    products: ['مستلزمات عامة', 'أدوات']
  }
];

export default function AISupplierManagement({ inventoryItems = [] }) {
  const [suppliers, setSuppliers] = useState(mockSuppliers);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showQuoteRequest, setShowQuoteRequest] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [quoteRequest, setQuoteRequest] = useState({
    items: [],
    quantity: '',
    deadline: '',
    notes: ''
  });

  // تحليل أداء المورد
  const analyzeSupplierMutation = useMutation({
    mutationFn: async (supplier) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `حلل أداء المورد التالي وقدم تقييماً شاملاً:

المورد: ${supplier.name}
التقييم العام: ${supplier.rating}/5
نسبة التسليم في الوقت: ${supplier.deliveryScore}%
جودة المنتجات: ${supplier.qualityScore}%
تنافسية الأسعار: ${supplier.priceScore}%
إجمالي الطلبات: ${supplier.totalOrders}
متوسط وقت التسليم: ${supplier.avgDeliveryDays} أيام

قدم:
1. ملخص الأداء
2. نقاط القوة
3. نقاط الضعف
4. توصيات للتحسين
5. هل يُنصح بالاستمرار مع هذا المورد`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            overallScore: { type: "number" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            recommendation: { type: "string", enum: ["strongly_recommended", "recommended", "neutral", "not_recommended"] },
            riskLevel: { type: "string", enum: ["low", "medium", "high"] }
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

  // اقتراح موردين بديلين
  const suggestAlternatives = (supplier, criteria) => {
    const alternatives = suppliers
      .filter(s => s.id !== supplier.id && s.category === supplier.category)
      .map(s => {
        let score = 0;
        if (criteria === 'cost') score = s.priceScore;
        else if (criteria === 'speed') score = s.deliveryScore;
        else if (criteria === 'quality') score = s.qualityScore;
        else score = (s.deliveryScore + s.qualityScore + s.priceScore) / 3;
        return { ...s, matchScore: score };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
    
    return alternatives;
  };

  // إرسال طلب عرض سعر
  const sendQuoteRequest = async () => {
    if (!selectedSupplier || !quoteRequest.items.length) {
      toast.error('يرجى تحديد المورد والمنتجات');
      return;
    }

    // محاكاة إرسال البريد
    toast.success(`تم إرسال طلب عرض السعر إلى ${selectedSupplier.name}`);
    setShowQuoteRequest(false);
    setQuoteRequest({ items: [], quantity: '', deadline: '', notes: '' });
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchesSearch = s.name.includes(searchQuery) || s.products.some(p => p.includes(searchQuery));
      const matchesCategory = filterCategory === 'all' || s.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [suppliers, searchQuery, filterCategory]);

  const statusColors = {
    preferred: 'bg-green-500/20 text-green-400',
    active: 'bg-blue-500/20 text-blue-400',
    under_review: 'bg-amber-500/20 text-amber-400',
    inactive: 'bg-slate-500/20 text-slate-400'
  };

  const statusLabels = {
    preferred: 'مفضل',
    active: 'نشط',
    under_review: 'قيد المراجعة',
    inactive: 'غير نشط'
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-400" />
            إدارة الموردين بالذكاء الاصطناعي
          </h2>
          <p className="text-slate-400 text-sm">تحليل الأداء واقتراح البدائل</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-purple-500/50 text-purple-400" onClick={() => setShowComparison(true)}>
            <BarChart3 className="w-4 h-4 ml-2" />
            مقارنة الموردين
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="بحث بالاسم أو المنتج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-slate-800/50 border-slate-700 text-white"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="الفئة" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">جميع الفئات</SelectItem>
            <SelectItem value="قطع غيار">قطع غيار</SelectItem>
            <SelectItem value="إلكترونيات">إلكترونيات</SelectItem>
            <SelectItem value="عام">عام</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Suppliers Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredSuppliers.map((supplier) => (
          <motion.div key={supplier.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 hover:border-purple-500/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-bold">{supplier.name}</h3>
                      <Badge className={statusColors[supplier.status]}>{statusLabels[supplier.status]}</Badge>
                    </div>
                    <p className="text-slate-400 text-sm">{supplier.category}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-white font-bold">{supplier.rating}</span>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="p-2 bg-slate-800/50 rounded text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span className="text-cyan-400 font-bold text-sm">{supplier.deliveryScore}%</span>
                    </div>
                    <p className="text-slate-500 text-[10px]">التسليم</p>
                  </div>
                  <div className="p-2 bg-slate-800/50 rounded text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Award className="w-3 h-3 text-green-400" />
                      <span className="text-green-400 font-bold text-sm">{supplier.qualityScore}%</span>
                    </div>
                    <p className="text-slate-500 text-[10px]">الجودة</p>
                  </div>
                  <div className="p-2 bg-slate-800/50 rounded text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="w-3 h-3 text-amber-400" />
                      <span className="text-amber-400 font-bold text-sm">{supplier.priceScore}%</span>
                    </div>
                    <p className="text-slate-500 text-[10px]">السعر</p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                  <span>{supplier.totalOrders} طلب</span>
                  <span>تسليم: {supplier.avgDeliveryDays} أيام</span>
                  <span>رد: {supplier.avgResponseTime}</span>
                </div>

                {/* Products */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {supplier.products.slice(0, 3).map((product, idx) => (
                    <Badge key={idx} variant="outline" className="text-[10px] border-slate-600">
                      {product}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setIsAnalyzing(true);
                      analyzeSupplierMutation.mutate(supplier);
                      setShowAnalysis(true);
                    }}
                  >
                    <Zap className="w-3 h-3 ml-1" />
                    تحليل AI
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-cyan-500/50 text-cyan-400"
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setShowQuoteRequest(true);
                    }}
                  >
                    <Send className="w-3 h-3 ml-1" />
                    طلب سعر
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-600">
                    <Phone className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Analysis Dialog */}
      <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              تحليل AI للمورد
            </DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <h3 className="text-white font-bold">{selectedSupplier.name}</h3>
                <p className="text-slate-400 text-sm">{selectedSupplier.category}</p>
              </div>

              {isAnalyzing ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
                  <p className="text-slate-400">جاري التحليل...</p>
                </div>
              ) : aiAnalysis ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {/* Overall Score */}
                  <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
                    <p className="text-4xl font-bold text-purple-400">{aiAnalysis.overallScore || 85}/100</p>
                    <p className="text-slate-400 text-sm">التقييم العام</p>
                    <Badge className={`mt-2 ${
                      aiAnalysis.recommendation === 'strongly_recommended' ? 'bg-green-500/20 text-green-400' :
                      aiAnalysis.recommendation === 'recommended' ? 'bg-cyan-500/20 text-cyan-400' :
                      aiAnalysis.recommendation === 'neutral' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {aiAnalysis.recommendation === 'strongly_recommended' ? 'موصى به بشدة' :
                       aiAnalysis.recommendation === 'recommended' ? 'موصى به' :
                       aiAnalysis.recommendation === 'neutral' ? 'محايد' : 'غير موصى به'}
                    </Badge>
                  </div>

                  {/* Summary */}
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-slate-300 text-sm">{aiAnalysis.summary}</p>
                  </div>

                  {/* Strengths */}
                  {aiAnalysis.strengths?.length > 0 && (
                    <div>
                      <h4 className="text-green-400 text-sm font-medium mb-2 flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" /> نقاط القوة
                      </h4>
                      <ul className="space-y-1">
                        {aiAnalysis.strengths.map((s, i) => (
                          <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Weaknesses */}
                  {aiAnalysis.weaknesses?.length > 0 && (
                    <div>
                      <h4 className="text-amber-400 text-sm font-medium mb-2 flex items-center gap-1">
                        <ThumbsDown className="w-4 h-4" /> نقاط الضعف
                      </h4>
                      <ul className="space-y-1">
                        {aiAnalysis.weaknesses.map((w, i) => (
                          <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                            <AlertTriangle className="w-3 h-3 text-amber-400 mt-1 flex-shrink-0" />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {aiAnalysis.recommendations?.length > 0 && (
                    <div>
                      <h4 className="text-cyan-400 text-sm font-medium mb-2">التوصيات</h4>
                      <ul className="space-y-1">
                        {aiAnalysis.recommendations.map((r, i) => (
                          <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                            <Zap className="w-3 h-3 text-cyan-400 mt-1 flex-shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Alternative Suppliers */}
                  <div className="pt-4 border-t border-slate-700">
                    <h4 className="text-white text-sm font-medium mb-2">موردون بديلون مقترحون</h4>
                    <div className="space-y-2">
                      {suggestAlternatives(selectedSupplier, 'balanced').slice(0, 2).map(alt => (
                        <div key={alt.id} className="p-2 bg-slate-800/50 rounded flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">{alt.name}</p>
                            <p className="text-slate-400 text-xs">تطابق: {alt.matchScore.toFixed(0)}%</p>
                          </div>
                          <Button size="sm" variant="ghost" className="text-cyan-400">
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quote Request Dialog */}
      <Dialog open={showQuoteRequest} onOpenChange={setShowQuoteRequest}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-cyan-400" />
              طلب عرض سعر
            </DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-white font-medium">{selectedSupplier.name}</p>
                <p className="text-slate-400 text-sm">{selectedSupplier.email}</p>
              </div>

              <div>
                <Label className="text-slate-300">المنتجات المطلوبة</Label>
                <Select>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                    <SelectValue placeholder="اختر المنتجات" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {selectedSupplier.products.map((p, i) => (
                      <SelectItem key={i} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">الكمية المطلوبة</Label>
                <Input
                  type="number"
                  value={quoteRequest.quantity}
                  onChange={(e) => setQuoteRequest({...quoteRequest, quantity: e.target.value})}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                />
              </div>

              <div>
                <Label className="text-slate-300">موعد التسليم المطلوب</Label>
                <Input
                  type="date"
                  value={quoteRequest.deadline}
                  onChange={(e) => setQuoteRequest({...quoteRequest, deadline: e.target.value})}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                />
              </div>

              <div>
                <Label className="text-slate-300">ملاحظات إضافية</Label>
                <Textarea
                  value={quoteRequest.notes}
                  onChange={(e) => setQuoteRequest({...quoteRequest, notes: e.target.value})}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  rows={3}
                />
              </div>

              <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={sendQuoteRequest}>
                <Mail className="w-4 h-4 ml-2" />
                إرسال طلب عرض السعر
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Comparison Dialog */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              مقارنة الموردين
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-right p-3 text-slate-300">المورد</th>
                  <th className="text-center p-3 text-slate-300">التقييم</th>
                  <th className="text-center p-3 text-slate-300">التسليم</th>
                  <th className="text-center p-3 text-slate-300">الجودة</th>
                  <th className="text-center p-3 text-slate-300">السعر</th>
                  <th className="text-center p-3 text-slate-300">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.id} className="border-b border-slate-700/50">
                    <td className="p-3 text-white">{s.name}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-white">{s.rating}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center text-cyan-400">{s.deliveryScore}%</td>
                    <td className="p-3 text-center text-green-400">{s.qualityScore}%</td>
                    <td className="p-3 text-center text-amber-400">{s.priceScore}%</td>
                    <td className="p-3 text-center">
                      <Badge className={statusColors[s.status]}>{statusLabels[s.status]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}