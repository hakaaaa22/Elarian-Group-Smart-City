import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  FileText, Plus, Save, Play, Calendar, Mail, Clock, Trash2,
  BarChart3, PieChart, TrendingUp, Activity, Brain, Sparkles,
  Loader2, Download, FolderOpen, Star, Settings, Bell, Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { toast } from 'sonner';
import AdvancedReportDataSources from './AdvancedReportDataSources';
import AdvancedVisualizations, { HeatmapVisualization, PivotTableVisualization } from './AdvancedVisualizations';

const COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];

const aiModels = [
  { id: 'sentiment', name: 'تحليل المشاعر', category: 'customer' },
  { id: 'intent', name: 'تحليل النوايا', category: 'customer' },
  { id: 'churn', name: 'تحليل المغادرة', category: 'customer' },
  { id: 'satisfaction', name: 'رضا العملاء', category: 'customer' },
  { id: 'performance', name: 'أداء الوكلاء', category: 'operations' },
  { id: 'trends', name: 'تحليل الاتجاهات', category: 'analytics' },
  { id: 'segmentation', name: 'تقسيم العملاء', category: 'customer' },
  { id: 'forecasting', name: 'التنبؤات', category: 'analytics' }
];

const metricOptions = [
  { id: 'total_calls', name: 'إجمالي المكالمات', category: 'volume' },
  { id: 'avg_duration', name: 'متوسط المدة', category: 'volume' },
  { id: 'resolution_rate', name: 'معدل الحل', category: 'quality' },
  { id: 'customer_satisfaction', name: 'رضا العملاء', category: 'quality' },
  { id: 'sentiment_score', name: 'درجة المشاعر', category: 'ai' },
  { id: 'churn_risk', name: 'خطر المغادرة', category: 'ai' },
  { id: 'purchase_intent', name: 'نية الشراء', category: 'ai' },
  { id: 'agent_performance', name: 'أداء الوكيل', category: 'quality' },
  { id: 'first_call_resolution', name: 'حل من أول اتصال', category: 'quality' },
  { id: 'wait_time', name: 'وقت الانتظار', category: 'volume' },
  { id: 'nps_score', name: 'مؤشر NPS', category: 'quality' },
  { id: 'revenue_impact', name: 'الأثر على الإيرادات', category: 'business' }
];

const visualizationTypes = [
  { id: 'line', name: 'خطي', icon: TrendingUp },
  { id: 'area', name: 'مساحة', icon: Activity },
  { id: 'bar', name: 'أعمدة', icon: BarChart3 },
  { id: 'pie', name: 'دائري', icon: PieChart },
  { id: 'mixed', name: 'مختلط', icon: BarChart3 },
  { id: 'heatmap', name: 'خريطة حرارية', icon: Activity },
  { id: 'pivot', name: 'جدول محوري', icon: BarChart3 },
  { id: 'table', name: 'جدول بيانات', icon: FileText }
];

export default function EnhancedCustomReportBuilder() {
  const [templates, setTemplates] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [generatedReport, setGeneratedReport] = useState(null);

  const [config, setConfig] = useState({
    name: '',
    description: '',
    type: 'custom',
    aiModels: [],
    metrics: [],
    visualization: 'bar',
    timeRange: 'week',
    groupBy: 'day',
    filters: {},
    includeInsights: true,
    includeRecommendations: true,
    includePredictions: true,
    dataSources: []
  });

  const [scheduleConfig, setScheduleConfig] = useState({
    frequency: 'weekly',
    dayOfWeek: 'sunday',
    time: '09:00',
    recipients: '',
    format: 'pdf',
    enabled: true
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const saved = localStorage.getItem('enhanced_report_templates');
    if (saved) setTemplates(JSON.parse(saved));
  }, []);

  const { data: scheduledReports = [] } = useQuery({
    queryKey: ['scheduled-custom-reports'],
    queryFn: () => base44.entities.ScheduledReport.filter({ report_type: 'custom' }, '-created_date', 20)
  });

  const generateReportMutation = useMutation({
    mutationFn: async (cfg) => {
      const modelsText = cfg.aiModels.map(m => aiModels.find(am => am.id === m)?.name).join(', ');
      const metricsText = cfg.metrics.map(m => metricOptions.find(mo => mo.id === m)?.name).join(', ');
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنشئ تقرير AI مخصص:

الاسم: ${cfg.name}
الوصف: ${cfg.description}
نماذج AI: ${modelsText}
المقاييس: ${metricsText}
الفترة: ${cfg.timeRange}
التجميع: ${cfg.groupBy}

أنشئ بيانات واقعية مع رؤى وتوصيات وتنبؤات.`,
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
                  previous: { type: "number" },
                  target: { type: "number" }
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
            ai_insights: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  metric: { type: "string" },
                  prediction: { type: "string" },
                  confidence: { type: "number" }
                }
              }
            }
          }
        }
      });
      return { ...result, config: cfg };
    },
    onSuccess: (data) => {
      setGeneratedReport(data);
      toast.success('تم إنشاء التقرير');
    }
  });

  const saveTemplate = () => {
    if (!config.name) {
      toast.error('أدخل اسم التقرير');
      return;
    }

    const template = {
      id: Date.now().toString(),
      ...config,
      createdAt: new Date().toISOString()
    };

    const updated = [...templates, template];
    setTemplates(updated);
    localStorage.setItem('enhanced_report_templates', JSON.stringify(updated));
    toast.success('تم حفظ القالب');
  };

  const scheduleReport = async () => {
    if (!selectedTemplate) return;

    await base44.entities.ScheduledReport.create({
      name: selectedTemplate.name,
      description: selectedTemplate.description,
      report_type: 'custom',
      data_sources: selectedTemplate.aiModels,
      filters: { metrics: selectedTemplate.metrics },
      visualization_type: selectedTemplate.visualization,
      schedule: scheduleConfig.frequency,
      schedule_time: scheduleConfig.time,
      schedule_day: scheduleConfig.dayOfWeek,
      recipients: scheduleConfig.recipients.split(',').map(e => e.trim()),
      export_format: scheduleConfig.format,
      is_active: scheduleConfig.enabled
    });

    queryClient.invalidateQueries({ queryKey: ['scheduled-custom-reports'] });
    toast.success('تم جدولة التقرير');
    setShowScheduler(false);
  };

  const toggleAiModel = (modelId) => {
    setConfig(prev => ({
      ...prev,
      aiModels: prev.aiModels.includes(modelId)
        ? prev.aiModels.filter(m => m !== modelId)
        : [...prev.aiModels, modelId]
    }));
  };

  const toggleMetric = (metricId) => {
    setConfig(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(m => m !== metricId)
        : [...prev.metrics, metricId]
    }));
  };

  const renderChart = () => {
    if (!generatedReport?.chart_data) return null;
    const data = generatedReport.chart_data;

    if (config.visualization === 'pie') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RePieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </RePieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} />
          <YAxis stroke="#94a3b8" fontSize={10} />
          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
          <Bar dataKey="value" fill="#22d3ee" name="الحالي" />
          <Bar dataKey="target" fill="#a855f7" name="الهدف" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20">
            <FileText className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h4 className="text-white font-bold">منشئ التقارير المتقدم</h4>
            <p className="text-slate-400 text-xs">Advanced Report Builder</p>
          </div>
        </div>
        <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => setShowBuilder(true)}>
          <Plus className="w-4 h-4 ml-2" />
          تقرير جديد
        </Button>
      </div>

      <Tabs defaultValue="templates">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="templates" className="data-[state=active]:bg-pink-500/20 text-xs">
            <FolderOpen className="w-3 h-3 ml-1" />
            القوالب
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="data-[state=active]:bg-green-500/20 text-xs">
            <Calendar className="w-3 h-3 ml-1" />
            المجدولة
          </TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-cyan-500/20 text-xs">
            <BarChart3 className="w-3 h-3 ml-1" />
            المعاينة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-4">
          {templates.length === 0 ? (
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-6 text-center">
                <FileText className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">لا توجد قوالب محفوظة</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {templates.map(template => (
                <Card key={template.id} className="bg-slate-800/30 border-slate-700/50 hover:border-pink-500/50 transition-colors">
                  <CardContent className="p-3">
                    <p className="text-white font-medium text-sm mb-1">{template.name}</p>
                    <p className="text-slate-400 text-xs mb-2 line-clamp-2">{template.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {template.aiModels?.slice(0, 2).map(m => (
                        <Badge key={m} className="bg-purple-500/20 text-purple-400 text-xs">
                          {aiModels.find(am => am.id === m)?.name}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 h-7 text-xs bg-cyan-600"
                        onClick={() => {
                          setConfig(template);
                          generateReportMutation.mutate(template);
                        }}
                      >
                        <Play className="w-3 h-3 ml-1" />
                        إنشاء
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 border-green-500/50"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowScheduler(true);
                        }}
                      >
                        <Calendar className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="mt-4">
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {scheduledReports.map(report => (
                <Card key={report.id} className="bg-green-500/10 border-green-500/30">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium text-sm">{report.name}</p>
                        <p className="text-slate-400 text-xs">
                          {report.schedule} • {report.schedule_time} • {report.recipients?.join(', ')}
                        </p>
                      </div>
                      <Badge className={report.is_active ? 'bg-green-500/20 text-green-400' : 'bg-slate-600'}>
                        {report.is_active ? 'نشط' : 'متوقف'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          {generatedReport ? (
            <div className="space-y-4">
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-4">
                  <h5 className="text-white font-bold mb-2">{generatedReport.title}</h5>
                  <p className="text-slate-300 text-sm">{generatedReport.executive_summary}</p>
                </CardContent>
              </Card>
              <div className="h-[250px] bg-slate-800/30 rounded-lg p-4">
                {renderChart()}
              </div>
              {generatedReport.predictions?.length > 0 && (
                <Card className="bg-purple-500/10 border-purple-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">التنبؤات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {generatedReport.predictions.map((pred, i) => (
                        <div key={i} className="p-2 bg-slate-900/50 rounded flex items-center justify-between">
                          <span className="text-white text-sm">{pred.metric}: {pred.prediction}</span>
                          <Badge className="bg-cyan-500/20 text-cyan-400">{pred.confidence}% ثقة</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">أنشئ تقريراً لمعاينته هنا</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">إنشاء تقرير مخصص</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Data Sources */}
            <AdvancedReportDataSources 
              onDataSourcesChange={(sources) => setConfig(prev => ({ ...prev, dataSources: sources }))} 
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">اسم التقرير</Label>
                <Input
                  value={config.name}
                  onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300">نوع التقرير</Label>
                <Select value={config.type} onValueChange={(v) => setConfig(prev => ({ ...prev, type: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="custom">مخصص</SelectItem>
                    <SelectItem value="performance">أداء</SelectItem>
                    <SelectItem value="customer">عملاء</SelectItem>
                    <SelectItem value="analytics">تحليلات</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-slate-300">الوصف</Label>
              <Textarea
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white mt-1 h-16"
              />
            </div>

            <div>
              <Label className="text-slate-300 mb-2 block">نماذج AI</Label>
              <div className="flex flex-wrap gap-2">
                {aiModels.map(model => (
                  <Button
                    key={model.id}
                    size="sm"
                    variant={config.aiModels.includes(model.id) ? 'default' : 'outline'}
                    className={`h-7 text-xs ${config.aiModels.includes(model.id) ? 'bg-purple-600' : 'border-slate-600'}`}
                    onClick={() => toggleAiModel(model.id)}
                  >
                    <Brain className="w-3 h-3 ml-1" />
                    {model.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-slate-300 mb-2 block">المقاييس</Label>
              <div className="flex flex-wrap gap-2">
                {metricOptions.map(metric => (
                  <Button
                    key={metric.id}
                    size="sm"
                    variant={config.metrics.includes(metric.id) ? 'default' : 'outline'}
                    className={`h-7 text-xs ${config.metrics.includes(metric.id) ? 'bg-cyan-600' : 'border-slate-600'}`}
                    onClick={() => toggleMetric(metric.id)}
                  >
                    {metric.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-300">نوع الرسم</Label>
                <Select value={config.visualization} onValueChange={(v) => setConfig(prev => ({ ...prev, visualization: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {visualizationTypes.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">الفترة</Label>
                <Select value={config.timeRange} onValueChange={(v) => setConfig(prev => ({ ...prev, timeRange: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="day">يوم</SelectItem>
                    <SelectItem value="week">أسبوع</SelectItem>
                    <SelectItem value="month">شهر</SelectItem>
                    <SelectItem value="quarter">ربع سنة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">التجميع</Label>
                <Select value={config.groupBy} onValueChange={(v) => setConfig(prev => ({ ...prev, groupBy: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="hour">ساعة</SelectItem>
                    <SelectItem value="day">يوم</SelectItem>
                    <SelectItem value="week">أسبوع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={config.includeInsights} onCheckedChange={(v) => setConfig(prev => ({ ...prev, includeInsights: v }))} />
                <Label className="text-slate-300 text-sm">رؤى AI</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={config.includeRecommendations} onCheckedChange={(v) => setConfig(prev => ({ ...prev, includeRecommendations: v }))} />
                <Label className="text-slate-300 text-sm">توصيات</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={config.includePredictions} onCheckedChange={(v) => setConfig(prev => ({ ...prev, includePredictions: v }))} />
                <Label className="text-slate-300 text-sm">تنبؤات</Label>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-700">
              <Button
                className="flex-1 bg-pink-600"
                onClick={() => generateReportMutation.mutate(config)}
                disabled={generateReportMutation.isPending}
              >
                {generateReportMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Play className="w-4 h-4 ml-2" /> إنشاء</>}
              </Button>
              <Button variant="outline" className="border-cyan-500/50" onClick={saveTemplate}>
                <Save className="w-4 h-4 ml-2" />
                حفظ كقالب
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scheduler Dialog */}
      <Dialog open={showScheduler} onOpenChange={setShowScheduler}>
        <DialogContent className="bg-[#0f1629] border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">جدولة التقرير</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">التكرار</Label>
                <Select value={scheduleConfig.frequency} onValueChange={(v) => setScheduleConfig(prev => ({ ...prev, frequency: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="daily">يومي</SelectItem>
                    <SelectItem value="weekly">أسبوعي</SelectItem>
                    <SelectItem value="monthly">شهري</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">الوقت</Label>
                <Input
                  type="time"
                  value={scheduleConfig.time}
                  onChange={(e) => setScheduleConfig(prev => ({ ...prev, time: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-300">المستلمون (البريد الإلكتروني)</Label>
              <Input
                value={scheduleConfig.recipients}
                onChange={(e) => setScheduleConfig(prev => ({ ...prev, recipients: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white mt-1"
                placeholder="email1@example.com, email2@example.com"
              />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-green-600" onClick={scheduleReport}>
                <Calendar className="w-4 h-4 ml-2" />
                جدولة
              </Button>
              <Button variant="outline" className="border-slate-600" onClick={() => setShowScheduler(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}