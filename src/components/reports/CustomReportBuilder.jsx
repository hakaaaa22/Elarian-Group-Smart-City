import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  FileText, Plus, Save, Play, Trash2, Settings, BarChart3, PieChart,
  TrendingUp, Activity, Brain, Sparkles, Loader2, Eye, Download,
  FolderOpen, Star, Copy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];

const aiModels = [
  { id: 'sentiment', name: 'تحليل المشاعر', description: 'تحليل مشاعر العملاء من المحادثات' },
  { id: 'intent', name: 'تحليل النوايا', description: 'التنبؤ بنوايا العملاء' },
  { id: 'churn', name: 'تحليل المغادرة', description: 'التنبؤ بخطر مغادرة العملاء' },
  { id: 'satisfaction', name: 'رضا العملاء', description: 'قياس رضا العملاء' },
  { id: 'performance', name: 'أداء الوكلاء', description: 'تحليل أداء فريق الدعم' },
  { id: 'trends', name: 'تحليل الاتجاهات', description: 'اكتشاف الأنماط والاتجاهات' },
];

const metricOptions = [
  { id: 'total_calls', name: 'إجمالي المكالمات', category: 'operational' },
  { id: 'avg_duration', name: 'متوسط المدة', category: 'operational' },
  { id: 'resolution_rate', name: 'معدل الحل', category: 'kpi' },
  { id: 'customer_satisfaction', name: 'رضا العملاء', category: 'kpi' },
  { id: 'sentiment_score', name: 'درجة المشاعر', category: 'ai' },
  { id: 'churn_risk', name: 'خطر المغادرة', category: 'ai' },
  { id: 'purchase_intent', name: 'نية الشراء', category: 'ai' },
  { id: 'agent_performance', name: 'أداء الوكيل', category: 'kpi' },
  { id: 'first_call_resolution', name: 'حل من أول اتصال', category: 'kpi' },
  { id: 'wait_time', name: 'وقت الانتظار', category: 'operational' },
];

const visualizationTypes = [
  { id: 'line', name: 'خطي', icon: TrendingUp },
  { id: 'area', name: 'مساحة', icon: Activity },
  { id: 'bar', name: 'أعمدة', icon: BarChart3 },
  { id: 'pie', name: 'دائري', icon: PieChart },
];

export default function CustomReportBuilder() {
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  
  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    aiModel: 'sentiment',
    metrics: [],
    visualization: 'bar',
    timeRange: 'week',
    includeInsights: true,
    includeRecommendations: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem('custom_report_templates');
    if (saved) {
      setSavedTemplates(JSON.parse(saved));
    }
  }, []);

  const generateReportMutation = useMutation({
    mutationFn: async (config) => {
      const metricsText = config.metrics.map(m => 
        metricOptions.find(mo => mo.id === m)?.name
      ).join(', ');
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت محلل بيانات خبير. قم بإنشاء تقرير AI مخصص بالمواصفات التالية:

اسم التقرير: ${config.name}
الوصف: ${config.description}
نموذج AI: ${aiModels.find(m => m.id === config.aiModel)?.name}
المقاييس المطلوبة: ${metricsText}
الفترة الزمنية: ${config.timeRange === 'week' ? 'أسبوع' : config.timeRange === 'month' ? 'شهر' : 'ربع سنة'}

قم بإنشاء:
1. بيانات واقعية للرسم البياني
2. ملخص تنفيذي
3. رؤى رئيسية
4. توصيات قابلة للتنفيذ
5. مقارنة مع الفترة السابقة`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            executive_summary: { type: "string" },
            chart_data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  value: { type: "number" },
                  previous: { type: "number" }
                }
              }
            },
            key_metrics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  value: { type: "string" },
                  change: { type: "number" },
                  status: { type: "string" }
                }
              }
            },
            insights: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            comparison: {
              type: "object",
              properties: {
                improvement: { type: "number" },
                trend: { type: "string" }
              }
            }
          }
        }
      });
      return { ...result, config };
    },
    onSuccess: (data) => {
      setGeneratedReport(data);
      toast.success('تم إنشاء التقرير بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ');
    }
  });

  const saveTemplate = () => {
    if (!reportConfig.name) {
      toast.error('أدخل اسم التقرير');
      return;
    }

    const template = {
      id: Date.now().toString(),
      ...reportConfig,
      createdAt: new Date().toISOString(),
      isFavorite: false
    };

    const updated = [...savedTemplates, template];
    setSavedTemplates(updated);
    localStorage.setItem('custom_report_templates', JSON.stringify(updated));
    toast.success('تم حفظ القالب');
  };

  const loadTemplate = (template) => {
    setReportConfig({
      name: template.name,
      description: template.description,
      aiModel: template.aiModel,
      metrics: template.metrics,
      visualization: template.visualization,
      timeRange: template.timeRange,
      includeInsights: template.includeInsights,
      includeRecommendations: template.includeRecommendations,
    });
    setShowBuilder(true);
    toast.success('تم تحميل القالب');
  };

  const deleteTemplate = (templateId) => {
    const updated = savedTemplates.filter(t => t.id !== templateId);
    setSavedTemplates(updated);
    localStorage.setItem('custom_report_templates', JSON.stringify(updated));
    toast.success('تم حذف القالب');
  };

  const toggleMetric = (metricId) => {
    setReportConfig(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(m => m !== metricId)
        : [...prev.metrics, metricId]
    }));
  };

  const renderChart = () => {
    if (!generatedReport?.chart_data) return null;

    const data = generatedReport.chart_data;
    const ChartComponent = {
      line: LineChart,
      area: AreaChart,
      bar: BarChart,
    }[reportConfig.visualization] || BarChart;

    if (reportConfig.visualization === 'pie') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RePieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              nameKey="label"
              label={({ label, value }) => `${label}: ${value}`}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </RePieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} />
          <YAxis stroke="#94a3b8" fontSize={10} />
          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
          {reportConfig.visualization === 'area' ? (
            <>
              <Area type="monotone" dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} name="الحالي" />
              <Area type="monotone" dataKey="previous" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} name="السابق" />
            </>
          ) : reportConfig.visualization === 'line' ? (
            <>
              <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} name="الحالي" />
              <Line type="monotone" dataKey="previous" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" name="السابق" />
            </>
          ) : (
            <Bar dataKey="value" fill="#22d3ee" name="القيمة" />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20">
            <FileText className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h4 className="text-white font-bold">منشئ التقارير المخصصة</h4>
            <p className="text-slate-400 text-xs">Custom AI Report Builder</p>
          </div>
        </div>
        <Button
          className="bg-pink-600 hover:bg-pink-700"
          onClick={() => setShowBuilder(true)}
        >
          <Plus className="w-4 h-4 ml-2" />
          تقرير جديد
        </Button>
      </div>

      {/* Saved Templates */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-cyan-400" />
            قوالب التقارير المحفوظة
            <Badge className="bg-slate-700 text-slate-300">{savedTemplates.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {savedTemplates.length === 0 ? (
            <div className="text-center py-6 text-slate-500">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">لا توجد قوالب محفوظة</p>
            </div>
          ) : (
            <ScrollArea className="h-[200px]">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {savedTemplates.map(template => (
                  <div
                    key={template.id}
                    className="p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-pink-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-white font-medium text-sm">{template.name}</p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </Button>
                    </div>
                    <p className="text-slate-400 text-xs mb-2 line-clamp-2">{template.description}</p>
                    <div className="flex gap-1 mb-2">
                      <Badge className="bg-pink-500/20 text-pink-400 text-xs">
                        {aiModels.find(m => m.id === template.aiModel)?.name}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 h-7 text-xs bg-cyan-600 hover:bg-cyan-700"
                        onClick={() => loadTemplate(template)}
                      >
                        <Eye className="w-3 h-3 ml-1" />
                        تحميل
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 border-slate-600"
                        onClick={() => {
                          loadTemplate(template);
                          generateReportMutation.mutate(template);
                        }}
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Generated Report Preview */}
      {generatedReport && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  {generatedReport.title}
                </span>
                <Button size="sm" variant="outline" className="border-pink-500/50 h-7">
                  <Download className="w-3 h-3 ml-1" />
                  تحميل
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Executive Summary */}
              <div className="p-3 bg-slate-900/50 rounded-lg">
                <h5 className="text-cyan-400 font-medium mb-2">الملخص التنفيذي</h5>
                <p className="text-slate-300 text-sm">{generatedReport.executive_summary}</p>
              </div>

              {/* Key Metrics */}
              {generatedReport.key_metrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {generatedReport.key_metrics.map((metric, i) => (
                    <div key={i} className="p-3 bg-slate-900/50 rounded-lg text-center">
                      <p className="text-lg font-bold text-white">{metric.value}</p>
                      <p className="text-slate-400 text-xs">{metric.name}</p>
                      {metric.change !== undefined && (
                        <Badge className={`mt-1 ${metric.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {metric.change >= 0 ? '+' : ''}{metric.change}%
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Chart */}
              <div className="h-[250px] bg-slate-900/50 rounded-lg p-4">
                {renderChart()}
              </div>

              {/* Insights & Recommendations */}
              <div className="grid md:grid-cols-2 gap-4">
                {generatedReport.insights?.length > 0 && (
                  <div className="p-3 bg-slate-900/50 rounded-lg">
                    <h5 className="text-purple-400 font-medium mb-2 flex items-center gap-1">
                      <Brain className="w-4 h-4" />
                      رؤى رئيسية
                    </h5>
                    <ul className="space-y-1">
                      {generatedReport.insights.map((insight, i) => (
                        <li key={i} className="text-slate-300 text-xs flex items-start gap-1">
                          <span className="text-purple-400">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {generatedReport.recommendations?.length > 0 && (
                  <div className="p-3 bg-slate-900/50 rounded-lg">
                    <h5 className="text-green-400 font-medium mb-2 flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      التوصيات
                    </h5>
                    <ul className="space-y-1">
                      {generatedReport.recommendations.map((rec, i) => (
                        <li key={i} className="text-slate-300 text-xs flex items-start gap-1">
                          <span className="text-green-400">✓</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-pink-400" />
              إنشاء تقرير AI مخصص
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-sm">اسم التقرير</Label>
                <Input
                  value={reportConfig.name}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                  placeholder="تقرير تحليل المشاعر الأسبوعي"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">نموذج AI</Label>
                <Select value={reportConfig.aiModel} onValueChange={(v) => setReportConfig(prev => ({ ...prev, aiModel: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {aiModels.map(model => (
                      <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-slate-300 text-sm">الوصف</Label>
              <Textarea
                value={reportConfig.description}
                onChange={(e) => setReportConfig(prev => ({ ...prev, description: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white mt-1 h-16"
                placeholder="وصف مختصر لهدف التقرير..."
              />
            </div>

            {/* Metrics Selection */}
            <div>
              <Label className="text-slate-300 text-sm mb-2 block">المقاييس المطلوبة</Label>
              <div className="flex flex-wrap gap-2">
                {metricOptions.map(metric => {
                  const isSelected = reportConfig.metrics.includes(metric.id);
                  return (
                    <Button
                      key={metric.id}
                      size="sm"
                      variant={isSelected ? 'default' : 'outline'}
                      className={`h-7 text-xs ${isSelected ? 'bg-pink-600' : 'border-slate-600'}`}
                      onClick={() => toggleMetric(metric.id)}
                    >
                      {metric.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Visualization & Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-sm mb-2 block">نوع الرسم البياني</Label>
                <div className="flex gap-2">
                  {visualizationTypes.map(viz => (
                    <Button
                      key={viz.id}
                      size="sm"
                      variant={reportConfig.visualization === viz.id ? 'default' : 'outline'}
                      className={`h-8 ${reportConfig.visualization === viz.id ? 'bg-pink-600' : 'border-slate-600'}`}
                      onClick={() => setReportConfig(prev => ({ ...prev, visualization: viz.id }))}
                    >
                      <viz.icon className="w-3 h-3 ml-1" />
                      {viz.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-slate-300 text-sm">الفترة الزمنية</Label>
                <Select value={reportConfig.timeRange} onValueChange={(v) => setReportConfig(prev => ({ ...prev, timeRange: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="week">أسبوع</SelectItem>
                    <SelectItem value="month">شهر</SelectItem>
                    <SelectItem value="quarter">ربع سنة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Options */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={reportConfig.includeInsights}
                  onCheckedChange={(v) => setReportConfig(prev => ({ ...prev, includeInsights: v }))}
                />
                <Label className="text-slate-300 text-sm">تضمين الرؤى</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={reportConfig.includeRecommendations}
                  onCheckedChange={(v) => setReportConfig(prev => ({ ...prev, includeRecommendations: v }))}
                />
                <Label className="text-slate-300 text-sm">تضمين التوصيات</Label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-slate-700">
              <Button
                className="flex-1 bg-pink-600 hover:bg-pink-700"
                onClick={() => generateReportMutation.mutate(reportConfig)}
                disabled={generateReportMutation.isPending || !reportConfig.name || reportConfig.metrics.length === 0}
              >
                {generateReportMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري الإنشاء...</>
                ) : (
                  <><Play className="w-4 h-4 ml-2" /> إنشاء التقرير</>
                )}
              </Button>
              <Button variant="outline" className="border-cyan-500/50" onClick={saveTemplate}>
                <Save className="w-4 h-4 ml-2" />
                حفظ كقالب
              </Button>
              <Button variant="outline" className="border-slate-600" onClick={() => setShowBuilder(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}