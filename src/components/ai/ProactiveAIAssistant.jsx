import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, Sparkles, TrendingUp, TrendingDown, Zap, Target, AlertTriangle,
  CheckCircle, Clock, FileText, Download, RefreshCw, ChevronRight, X,
  Lightbulb, BarChart3, MapPin, Car, Package, Shield, Users, Building2,
  Activity, ArrowUpRight, Send, MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// ألوان اللوجو الموحدة
const BRAND_COLORS = {
  primary: '#8B5CF6',      // بنفسجي فاتح
  secondary: '#06B6D4',    // سماوي
  accent: '#EC4899',       // وردي
  purple: {
    50: 'rgba(139, 92, 246, 0.05)',
    100: 'rgba(139, 92, 246, 0.1)',
    200: 'rgba(139, 92, 246, 0.2)',
    500: '#8B5CF6',
    600: '#7C3AED',
  },
  cyan: {
    50: 'rgba(6, 182, 212, 0.05)',
    100: 'rgba(6, 182, 212, 0.1)',
    200: 'rgba(6, 182, 212, 0.2)',
    500: '#06B6D4',
    600: '#0891B2',
  },
  pink: {
    50: 'rgba(236, 72, 153, 0.05)',
    100: 'rgba(236, 72, 153, 0.1)',
    200: 'rgba(236, 72, 153, 0.2)',
    500: '#EC4899',
    600: '#DB2777',
  }
};

// اقتراحات استباقية
const proactiveSuggestions = [
  {
    id: 1,
    type: 'optimization',
    icon: TrendingUp,
    title: 'تحسين مسارات الأسطول',
    description: 'تحليل البيانات يشير إلى إمكانية توفير 15% من الوقود بتعديل مسارات 5 مركبات',
    impact: 'high',
    savings: '2,500 ريال/شهر',
    department: 'الأسطول',
    confidence: 94
  },
  {
    id: 2,
    type: 'alert',
    icon: AlertTriangle,
    title: 'صيانة وقائية مطلوبة',
    description: '3 مركبات ستحتاج صيانة خلال الأسبوع القادم بناءً على أنماط الاستخدام',
    impact: 'medium',
    department: 'الصيانة',
    confidence: 87
  },
  {
    id: 3,
    type: 'insight',
    icon: Lightbulb,
    title: 'نمط استهلاك الطاقة',
    description: 'ارتفاع استهلاك الطاقة 20% في المنطقة الشرقية مقارنة بالفترة السابقة',
    impact: 'medium',
    department: 'المرافق',
    confidence: 91
  },
  {
    id: 4,
    type: 'prediction',
    icon: Target,
    title: 'توقع زيادة حركة المرور',
    description: 'متوقع ازدحام مروري في المنطقة المركزية غداً 4-7 مساءً',
    impact: 'high',
    department: 'المرور',
    confidence: 89
  },
  {
    id: 5,
    type: 'optimization',
    icon: Package,
    title: 'تحسين جدولة جمع النفايات',
    description: 'يمكن تقليل عدد الرحلات 12% بإعادة توزيع الحاويات الذكية',
    impact: 'medium',
    savings: '1,800 ريال/شهر',
    department: 'النفايات',
    confidence: 86
  }
];

// قوالب التقارير الآلية
const reportTemplates = [
  { id: 'daily_ops', name: 'تقرير العمليات اليومي', departments: ['all'], frequency: 'daily', icon: Activity },
  { id: 'fleet_perf', name: 'أداء الأسطول الأسبوعي', departments: ['fleet'], frequency: 'weekly', icon: Car },
  { id: 'energy_usage', name: 'استهلاك الطاقة الشهري', departments: ['utilities'], frequency: 'monthly', icon: Zap },
  { id: 'safety_incidents', name: 'تقرير الحوادث والسلامة', departments: ['safety'], frequency: 'daily', icon: Shield },
  { id: 'waste_efficiency', name: 'كفاءة إدارة النفايات', departments: ['waste'], frequency: 'weekly', icon: Package },
  { id: 'traffic_analysis', name: 'تحليل حركة المرور', departments: ['transportation'], frequency: 'daily', icon: MapPin },
];

export default function ProactiveAIAssistant({ onClose }) {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [query, setQuery] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

  const generateReportMutation = useMutation({
    mutationFn: async (template) => {
      setGenerating(true);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بإنشاء تقرير ${template.name} يتضمن:
        1. ملخص تنفيذي
        2. المؤشرات الرئيسية
        3. التحليل التفصيلي
        4. التوصيات
        استخدم بيانات افتراضية واقعية للمدينة الذكية.`,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            kpis: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, value: { type: 'string' }, trend: { type: 'string' } } } },
            analysis: { type: 'string' },
            recommendations: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      return { ...result, templateName: template.name };
    },
    onSuccess: (data) => {
      setGeneratedReport(data);
      setGenerating(false);
      toast.success('تم إنشاء التقرير بنجاح');
    },
    onError: () => {
      setGenerating(false);
      toast.error('فشل في إنشاء التقرير');
    }
  });

  const askAIMutation = useMutation({
    mutationFn: async (question) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مساعد ذكي للمدينة الذكية. أجب على السؤال التالي بشكل مختصر ومفيد:
        ${question}
        
        قدم إجابة عملية مع اقتراحات إن أمكن.`,
        add_context_from_internet: true
      });
    },
    onSuccess: (data) => {
      toast.success('تم الحصول على الإجابة');
    }
  });

  const handleAskAI = () => {
    if (!query.trim()) return;
    askAIMutation.mutate(query);
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'optimization': return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' };
      case 'alert': return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
      case 'insight': return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' };
      case 'prediction': return { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' };
      default: return { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' };
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="p-2 rounded-xl"
            style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.purple[200]}, ${BRAND_COLORS.cyan[200]})` }}
          >
            <Brain className="w-6 h-6" style={{ color: BRAND_COLORS.primary }} />
          </motion.div>
          <div>
            <h2 className="text-lg font-bold text-white">المساعد الذكي الاستباقي</h2>
            <p className="text-slate-400 text-xs">اقتراحات وتقارير آلية بالذكاء الاصطناعي</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400">
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* AI Query */}
      <Card className="border-purple-500/30" style={{ background: BRAND_COLORS.purple[50] }}>
        <CardContent className="p-3">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="اسأل المساعد الذكي..."
              className="bg-slate-800/50 border-slate-700 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
            />
            <Button 
              onClick={handleAskAI} 
              disabled={askAIMutation.isPending}
              style={{ background: BRAND_COLORS.primary }}
              className="hover:opacity-90"
            >
              {askAIMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          {askAIMutation.data && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 bg-slate-800/50 rounded-lg"
            >
              <p className="text-white text-sm leading-relaxed">{askAIMutation.data}</p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="suggestions" className="data-[state=active]:bg-purple-500/20">
            <Lightbulb className="w-4 h-4 ml-1" />
            اقتراحات استباقية
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-cyan-500/20">
            <FileText className="w-4 h-4 ml-1" />
            التقارير الآلية
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="mt-4 space-y-3">
          {proactiveSuggestions.map((suggestion, i) => {
            const colors = getTypeColor(suggestion.type);
            return (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedSuggestion(selectedSuggestion === suggestion.id ? null : suggestion.id)}
              >
                <Card className={`cursor-pointer transition-all ${colors.border} border ${selectedSuggestion === suggestion.id ? colors.bg : 'bg-slate-800/30'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${colors.bg}`}>
                        <suggestion.icon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-medium">{suggestion.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge className={getImpactColor(suggestion.impact)}>
                              {suggestion.impact === 'high' ? 'عالي' : suggestion.impact === 'medium' ? 'متوسط' : 'منخفض'}
                            </Badge>
                            <Badge className="bg-slate-700 text-slate-300">{suggestion.department}</Badge>
                          </div>
                        </div>
                        <p className="text-slate-400 text-sm mt-1">{suggestion.description}</p>
                        
                        <AnimatePresence>
                          {selectedSuggestion === suggestion.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 pt-3 border-t border-slate-700"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-500 text-xs">نسبة الثقة في التحليل</span>
                                <span className="text-purple-400 font-bold">{suggestion.confidence}%</span>
                              </div>
                              <Progress value={suggestion.confidence} className="h-1.5 mb-3" />
                              
                              {suggestion.savings && (
                                <div className="flex items-center gap-2 mb-3 p-2 bg-emerald-500/10 rounded-lg">
                                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                                  <span className="text-emerald-400 text-sm">التوفير المتوقع: {suggestion.savings}</span>
                                </div>
                              )}
                              
                              <div className="flex gap-2">
                                <Button size="sm" style={{ background: BRAND_COLORS.primary }} className="flex-1">
                                  <CheckCircle className="w-4 h-4 ml-1" />
                                  تطبيق
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1 border-slate-600">
                                  تفاصيل أكثر
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          {generatedReport ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border-cyan-500/30 bg-cyan-500/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm">{generatedReport.templateName}</CardTitle>
                    <Button size="sm" variant="ghost" onClick={() => setGeneratedReport(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-purple-400 text-sm font-medium mb-2">الملخص التنفيذي</h4>
                    <p className="text-slate-300 text-sm">{generatedReport.summary}</p>
                  </div>
                  
                  {generatedReport.kpis && (
                    <div>
                      <h4 className="text-purple-400 text-sm font-medium mb-2">المؤشرات الرئيسية</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {generatedReport.kpis.map((kpi, i) => (
                          <div key={i} className="p-2 bg-slate-800/50 rounded-lg">
                            <p className="text-slate-400 text-xs">{kpi.name}</p>
                            <p className="text-white font-bold">{kpi.value}</p>
                            <p className={`text-xs ${kpi.trend?.includes('+') ? 'text-green-400' : 'text-red-400'}`}>{kpi.trend}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {generatedReport.recommendations && (
                    <div>
                      <h4 className="text-purple-400 text-sm font-medium mb-2">التوصيات</h4>
                      <ul className="space-y-1">
                        {generatedReport.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                            <ChevronRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <Button className="w-full" style={{ background: BRAND_COLORS.secondary }}>
                    <Download className="w-4 h-4 ml-2" />
                    تحميل التقرير PDF
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {reportTemplates.map((template, i) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="border-slate-700 bg-slate-800/30 hover:border-cyan-500/50 transition-all cursor-pointer"
                        onClick={() => generateReportMutation.mutate(template)}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ background: BRAND_COLORS.cyan[100] }}>
                          <template.icon className="w-5 h-5" style={{ color: BRAND_COLORS.secondary }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{template.name}</p>
                          <p className="text-slate-500 text-xs">
                            {template.frequency === 'daily' ? 'يومي' : template.frequency === 'weekly' ? 'أسبوعي' : 'شهري'}
                          </p>
                        </div>
                        {generating && generateReportMutation.variables?.id === template.id ? (
                          <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}