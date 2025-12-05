import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, BarChart3, TrendingUp, FileText, Clock, Calendar, Bell, Settings,
  Download, RefreshCw, Loader2, Sparkles, Eye, Save, Filter, Plus, X,
  AlertTriangle, CheckCircle, ArrowUp, ArrowDown, Zap, Target, PieChart,
  Palette, FolderOpen, Grid
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import AdvancedChartDesigner from './AdvancedChartDesigner';
import SavedConfigurationsManager from './SavedConfigurationsManager';
import AdvancedScheduler from './AdvancedScheduler';
import MetricAlertsSystem from './MetricAlertsSystem';

const COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];

// AI Metrics categories
const aiMetrics = [
  { id: 'sentiment', name: 'تحليل المشاعر', icon: '😊', value: 78, trend: 5 },
  { id: 'intent', name: 'التنبؤ بالنوايا', icon: '🎯', value: 85, trend: 8 },
  { id: 'churn', name: 'خطر المغادرة', icon: '⚠️', value: 23, trend: -3 },
  { id: 'satisfaction', name: 'رضا العملاء', icon: '⭐', value: 4.5, trend: 0.2 },
  { id: 'resolution', name: 'معدل الحل', icon: '✅', value: 92, trend: 4 },
  { id: 'response_time', name: 'سرعة الاستجابة', icon: '⚡', value: 2.3, trend: -0.5 },
];

// Chart configurations
const chartTypes = [
  { id: 'line', name: 'خطي', icon: TrendingUp },
  { id: 'area', name: 'مساحة', icon: BarChart3 },
  { id: 'bar', name: 'أعمدة', icon: BarChart3 },
  { id: 'pie', name: 'دائري', icon: PieChart },
];

// Default dashboard config
const defaultDashboardConfig = {
  widgets: [
    { id: 'sentiment', type: 'area', position: 0, visible: true },
    { id: 'intent', type: 'bar', position: 1, visible: true },
    { id: 'churn', type: 'line', position: 2, visible: true },
    { id: 'satisfaction', type: 'pie', position: 3, visible: true },
  ],
  refreshInterval: 60,
  notifications: {
    enabled: true,
    thresholds: {
      churn: 30,
      satisfaction: 4.0,
      resolution: 85,
    }
  }
};

// Sample data
const trendData = [
  { date: 'الأحد', sentiment: 72, intent: 80, churn: 25 },
  { date: 'الإثنين', sentiment: 75, intent: 82, churn: 24 },
  { date: 'الثلاثاء', sentiment: 74, intent: 85, churn: 26 },
  { date: 'الأربعاء', sentiment: 78, intent: 83, churn: 23 },
  { date: 'الخميس', sentiment: 80, intent: 86, churn: 21 },
  { date: 'الجمعة', sentiment: 76, intent: 84, churn: 24 },
  { date: 'السبت', sentiment: 78, intent: 85, churn: 23 },
];

const sentimentDistribution = [
  { name: 'إيجابي', value: 58, color: '#22c55e' },
  { name: 'محايد', value: 28, color: '#f59e0b' },
  { name: 'سلبي', value: 14, color: '#ef4444' },
];

export default function AIReportsDashboard() {
  const [dashboardConfig, setDashboardConfig] = useState(() => {
    const saved = localStorage.getItem('ai_reports_config');
    return saved ? JSON.parse(saved) : defaultDashboardConfig;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [alertLogs, setAlertLogs] = useState([]);
  const [activeConfigTab, setActiveConfigTab] = useState('charts');

  const queryClient = useQueryClient();

  const { data: scheduledReports = [] } = useQuery({
    queryKey: ['ai-scheduled-reports'],
    queryFn: () => base44.entities.ScheduledReport.filter({ report_type: 'ai' }, '-created_date', 10),
  });

  // Generate AI Report
  const generateReportMutation = useMutation({
    mutationFn: async (reportType) => {
      setIsGenerating(true);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بإنشاء تقرير ذكاء اصطناعي شامل من نوع "${reportType}" يتضمن:

1. ملخص تنفيذي
2. المقاييس الرئيسية والاتجاهات
3. تحليل المشاعر
4. التنبؤات المستقبلية
5. توصيات قابلة للتنفيذ
6. المخاطر المحتملة

استخدم بيانات واقعية ومفصلة.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            metrics: {
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
            sentiment_analysis: {
              type: "object",
              properties: {
                overall: { type: "string" },
                positive: { type: "number" },
                negative: { type: "number" },
                neutral: { type: "number" },
                key_topics: { type: "array", items: { type: "string" } }
              }
            },
            predictions: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            risks: { type: "array", items: { type: "string" } }
          }
        }
      });
      setIsGenerating(false);
      return result;
    },
    onSuccess: (data) => {
      setGeneratedReport(data);
      toast.success('تم إنشاء التقرير بنجاح');
    },
    onError: () => {
      setIsGenerating(false);
      toast.error('حدث خطأ');
    }
  });

  // Save configuration
  const saveConfig = () => {
    localStorage.setItem('ai_reports_config', JSON.stringify(dashboardConfig));
    toast.success('تم حفظ التكوين');
    setShowSettings(false);
  };

  // Schedule report
  const scheduleReport = async (config) => {
    await base44.entities.ScheduledReport.create({
      name: config.name,
      report_type: 'ai',
      schedule: config.schedule,
      schedule_time: config.time,
      recipients: config.recipients?.split(',').map(e => e.trim()),
      is_active: true,
    });
    queryClient.invalidateQueries({ queryKey: ['ai-scheduled-reports'] });
    toast.success('تم جدولة التقرير');
    setShowScheduler(false);
  };

  // Check thresholds and add alerts
  const checkThresholds = () => {
    const alerts = [];
    if (aiMetrics.find(m => m.id === 'churn').value > dashboardConfig.notifications.thresholds.churn) {
      alerts.push({ type: 'warning', message: 'خطر المغادرة تجاوز الحد المسموح' });
    }
    if (aiMetrics.find(m => m.id === 'satisfaction').value < dashboardConfig.notifications.thresholds.satisfaction) {
      alerts.push({ type: 'warning', message: 'رضا العملاء أقل من الحد المطلوب' });
    }
    if (alerts.length > 0) {
      setAlertLogs(prev => [...alerts.map(a => ({ ...a, time: new Date() })), ...prev]);
    }
  };

  const toggleWidget = (widgetId) => {
    setDashboardConfig(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      )
    }));
  };

  const changeWidgetType = (widgetId, type) => {
    setDashboardConfig(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, type } : w
      )
    }));
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20"
          >
            <Brain className="w-6 h-6 text-purple-400" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-white">لوحة تقارير الذكاء الاصطناعي</h3>
            <p className="text-slate-400 text-sm">تحليلات متقدمة • تنبؤات • رؤى ذكية</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-slate-600"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="w-4 h-4 ml-2" />
            تخصيص
          </Button>
          <Button
            variant="outline"
            className="border-slate-600"
            onClick={() => setShowScheduler(true)}
          >
            <Calendar className="w-4 h-4 ml-2" />
            جدولة
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => generateReportMutation.mutate('شامل')}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري التحليل...</>
            ) : (
              <><Sparkles className="w-4 h-4 ml-2" /> إنشاء تقرير</>
            )}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {dashboardConfig.notifications.enabled && alertLogs.length > 0 && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-medium">تنبيهات</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setAlertLogs([])}>
                <X className="w-3 h-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {alertLogs.slice(0, 3).map((alert, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-amber-200">
                  <AlertTriangle className="w-3 h-3" />
                  {alert.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {aiMetrics.map((metric, i) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-3 text-center">
                <span className="text-2xl">{metric.icon}</span>
                <p className="text-lg font-bold text-white mt-1">
                  {typeof metric.value === 'number' && metric.value > 10 ? `${metric.value}%` : metric.value}
                </p>
                <p className="text-slate-400 text-xs">{metric.name}</p>
                <div className={`flex items-center justify-center gap-1 mt-1 ${metric.trend > 0 ? 'text-green-400' : metric.trend < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                  {metric.trend > 0 ? <ArrowUp className="w-3 h-3" /> : metric.trend < 0 ? <ArrowDown className="w-3 h-3" /> : null}
                  <span className="text-xs">{Math.abs(metric.trend)}%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Trend Chart */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              اتجاهات الأسبوع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="sentiment" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} name="المشاعر" />
                  <Area type="monotone" dataKey="intent" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} name="النوايا" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Distribution */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-400" />
              توزيع المشاعر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={sentimentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {sentimentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Churn Risk Trend */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              خطر المغادرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 50]} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="churn" stroke="#ef4444" strokeWidth={2} name="خطر المغادرة" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Reports */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-400" />
              التقارير المجدولة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              {scheduledReports.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">لا توجد تقارير مجدولة</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {scheduledReports.map((report, i) => (
                    <div key={i} className="p-2 bg-slate-900/50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm">{report.name}</p>
                        <p className="text-slate-400 text-xs">{report.schedule} - {report.schedule_time}</p>
                      </div>
                      <Badge className={report.is_active ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}>
                        {report.is_active ? 'نشط' : 'متوقف'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Generated Report Preview */}
      {generatedReport && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  التقرير المُنشأ
                </CardTitle>
                <Button size="sm" variant="outline" className="border-purple-500/50 h-7">
                  <Download className="w-3 h-3 ml-1" />
                  تحميل PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-slate-900/50 rounded-lg">
                <h5 className="text-cyan-400 font-medium mb-2">الملخص التنفيذي</h5>
                <p className="text-slate-300 text-sm">{generatedReport.executive_summary}</p>
              </div>
              
              {generatedReport.sentiment_analysis && (
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <h5 className="text-green-400 font-medium mb-2">تحليل المشاعر</h5>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="text-center">
                      <p className="text-green-400 font-bold">{generatedReport.sentiment_analysis.positive}%</p>
                      <p className="text-slate-400 text-xs">إيجابي</p>
                    </div>
                    <div className="text-center">
                      <p className="text-amber-400 font-bold">{generatedReport.sentiment_analysis.neutral}%</p>
                      <p className="text-slate-400 text-xs">محايد</p>
                    </div>
                    <div className="text-center">
                      <p className="text-red-400 font-bold">{generatedReport.sentiment_analysis.negative}%</p>
                      <p className="text-slate-400 text-xs">سلبي</p>
                    </div>
                  </div>
                </div>
              )}

              {generatedReport.recommendations?.length > 0 && (
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <h5 className="text-amber-400 font-medium mb-2">التوصيات</h5>
                  <ul className="space-y-1">
                    {generatedReport.recommendations.slice(0, 5).map((rec, i) => (
                      <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              تخصيص متقدم للوحة التقارير
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeConfigTab} onValueChange={setActiveConfigTab} className="mt-4">
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
              <TabsTrigger value="charts" className="data-[state=active]:bg-purple-500/20 text-xs">
                <Palette className="w-3 h-3 ml-1" />
                تصميم الرسوم
              </TabsTrigger>
              <TabsTrigger value="configs" className="data-[state=active]:bg-cyan-500/20 text-xs">
                <FolderOpen className="w-3 h-3 ml-1" />
                التكوينات
              </TabsTrigger>
              <TabsTrigger value="alerts" className="data-[state=active]:bg-amber-500/20 text-xs">
                <Bell className="w-3 h-3 ml-1" />
                التنبيهات
              </TabsTrigger>
              <TabsTrigger value="basic" className="data-[state=active]:bg-green-500/20 text-xs">
                <Grid className="w-3 h-3 ml-1" />
                أساسي
              </TabsTrigger>
            </TabsList>

            <TabsContent value="charts" className="mt-4">
              <AdvancedChartDesigner
                existingCharts={dashboardConfig.widgets || []}
                onSaveChart={(chart) => {
                  setDashboardConfig(prev => ({
                    ...prev,
                    widgets: [...(prev.widgets || []), chart]
                  }));
                }}
              />
            </TabsContent>

            <TabsContent value="configs" className="mt-4">
              <SavedConfigurationsManager
                currentConfig={dashboardConfig}
                onLoadConfig={(config) => {
                  setDashboardConfig(config);
                  toast.success('تم تحميل التكوين');
                }}
              />
            </TabsContent>

            <TabsContent value="alerts" className="mt-4">
              <MetricAlertsSystem />
            </TabsContent>

            <TabsContent value="basic" className="mt-4">
              <div className="space-y-4">
                <div>
                  <h5 className="text-white font-medium mb-3">المقاييس المعروضة</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {dashboardConfig.widgets.map(widget => (
                      <div key={widget.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                        <span className="text-slate-300 text-sm">{aiMetrics.find(m => m.id === widget.id)?.name}</span>
                        <Switch checked={widget.visible} onCheckedChange={() => toggleWidget(widget.id)} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-white font-medium mb-3">إعدادات التنبيهات</h5>
                  <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded mb-2">
                    <span className="text-slate-300 text-sm">تفعيل التنبيهات</span>
                    <Switch 
                      checked={dashboardConfig.notifications.enabled} 
                      onCheckedChange={(v) => setDashboardConfig(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, enabled: v }
                      }))}
                    />
                  </div>
                  {dashboardConfig.notifications.enabled && (
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-slate-400 text-xs">حد خطر المغادرة</Label>
                        <Input
                          type="number"
                          value={dashboardConfig.notifications.thresholds.churn}
                          onChange={(e) => setDashboardConfig(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              thresholds: { ...prev.notifications.thresholds, churn: Number(e.target.value) }
                            }
                          }))}
                          className="bg-slate-800 border-slate-700 text-white h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-400 text-xs">حد الرضا</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={dashboardConfig.notifications.thresholds.satisfaction}
                          onChange={(e) => setDashboardConfig(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              thresholds: { ...prev.notifications.thresholds, satisfaction: Number(e.target.value) }
                            }
                          }))}
                          className="bg-slate-800 border-slate-700 text-white h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-400 text-xs">حد معدل الحل</Label>
                        <Input
                          type="number"
                          value={dashboardConfig.notifications.thresholds.resolution}
                          onChange={(e) => setDashboardConfig(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              thresholds: { ...prev.notifications.thresholds, resolution: Number(e.target.value) }
                            }
                          }))}
                          className="bg-slate-800 border-slate-700 text-white h-8"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-700">
                  <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={saveConfig}>
                    <Save className="w-4 h-4 ml-2" />
                    حفظ التكوين
                  </Button>
                  <Button variant="outline" className="border-slate-600" onClick={() => setShowSettings(false)}>
                    إلغاء
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Scheduler Dialog */}
      <Dialog open={showScheduler} onOpenChange={setShowScheduler}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-400" />
              نظام الجدولة المتقدم
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <AdvancedScheduler />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SchedulerForm({ onSubmit, onCancel }) {
  const [config, setConfig] = useState({
    name: '',
    schedule: 'daily',
    time: '09:00',
    recipients: '',
  });

  return (
    <div className="space-y-4 mt-4">
      <div>
        <Label className="text-slate-300 text-sm mb-1 block">اسم التقرير</Label>
        <Input
          value={config.name}
          onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
          className="bg-slate-800 border-slate-700 text-white"
          placeholder="تقرير AI اليومي"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-300 text-sm mb-1 block">الجدولة</Label>
          <Select value={config.schedule} onValueChange={(v) => setConfig(prev => ({ ...prev, schedule: v }))}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
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
          <Label className="text-slate-300 text-sm mb-1 block">الوقت</Label>
          <Input
            type="time"
            value={config.time}
            onChange={(e) => setConfig(prev => ({ ...prev, time: e.target.value }))}
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>
      </div>
      <div>
        <Label className="text-slate-300 text-sm mb-1 block">المستلمون (البريد الإلكتروني)</Label>
        <Input
          value={config.recipients}
          onChange={(e) => setConfig(prev => ({ ...prev, recipients: e.target.value }))}
          className="bg-slate-800 border-slate-700 text-white"
          placeholder="email@example.com"
        />
      </div>
      <div className="flex gap-2 pt-4 border-t border-slate-700">
        <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => onSubmit(config)}>
          <Calendar className="w-4 h-4 ml-2" />
          جدولة
        </Button>
        <Button variant="outline" className="border-slate-600" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </div>
  );
}