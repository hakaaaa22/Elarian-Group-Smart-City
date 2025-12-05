import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  FileText, Calendar, Clock, Download, Send, Loader2, RefreshCw,
  BarChart3, TrendingUp, AlertTriangle, Users, Cpu, Eye, Sparkles,
  CheckCircle, Settings, Filter, CalendarDays, FileBarChart, Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const reportModules = [
  { id: 'anomaly', name: 'كشف الشذوذات', icon: AlertTriangle, color: 'red' },
  { id: 'user_behavior', name: 'تحليلات المستخدمين', icon: Users, color: 'purple' },
  { id: 'model_performance', name: 'أداء النماذج', icon: Cpu, color: 'cyan' },
  { id: 'iot_trends', name: 'اتجاهات IoT', icon: TrendingUp, color: 'green' },
  { id: 'security', name: 'الأمن والتهديدات', icon: Eye, color: 'orange' },
  { id: 'energy', name: 'استهلاك الطاقة', icon: BarChart3, color: 'amber' },
];

export default function AIAutomatedReportGenerator() {
  const [activeTab, setActiveTab] = useState('generate');
  const [reportType, setReportType] = useState('daily');
  const [selectedModules, setSelectedModules] = useState(['anomaly', 'model_performance']);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedReport, setGeneratedReport] = useState(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState({
    frequency: 'daily',
    time: '08:00',
    recipients: '',
    autoSend: true
  });

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const modulesText = selectedModules.map(m => reportModules.find(rm => rm.id === m)?.name).join(', ');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنشئ تقرير ${reportType === 'daily' ? 'يومي' : reportType === 'weekly' ? 'أسبوعي' : 'شهري'} شامل للوحدات التالية: ${modulesText}

${customPrompt ? `متطلبات إضافية: ${customPrompt}` : ''}

يجب أن يتضمن التقرير:
1. ملخص تنفيذي
2. أهم المؤشرات والإحصائيات
3. الاتجاهات الرئيسية المكتشفة
4. الشذوذات والتنبيهات
5. مقارنة مع الفترة السابقة
6. التوصيات والإجراءات المقترحة
7. التوقعات للفترة القادمة`,
        response_json_schema: {
          type: "object",
          properties: {
            report_title: { type: "string" },
            report_period: { type: "string" },
            generated_at: { type: "string" },
            executive_summary: { type: "string" },
            key_metrics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  metric_name: { type: "string" },
                  current_value: { type: "string" },
                  previous_value: { type: "string" },
                  change_percent: { type: "number" },
                  trend: { type: "string" },
                  status: { type: "string" }
                }
              }
            },
            module_insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  module: { type: "string" },
                  health_score: { type: "number" },
                  key_findings: { type: "array", items: { type: "string" } },
                  alerts_count: { type: "number" },
                  performance_trend: { type: "string" }
                }
              }
            },
            trends_identified: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  trend_name: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string" },
                  affected_areas: { type: "array", items: { type: "string" } }
                }
              }
            },
            anomalies_summary: {
              type: "object",
              properties: {
                total_count: { type: "number" },
                critical: { type: "number" },
                high: { type: "number" },
                medium: { type: "number" },
                resolved: { type: "number" },
                top_anomalies: { type: "array", items: { type: "string" } }
              }
            },
            period_comparison: {
              type: "object",
              properties: {
                overall_improvement: { type: "number" },
                areas_improved: { type: "array", items: { type: "string" } },
                areas_declined: { type: "array", items: { type: "string" } }
              }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  priority: { type: "string" },
                  recommendation: { type: "string" },
                  expected_impact: { type: "string" },
                  responsible_team: { type: "string" }
                }
              }
            },
            forecasts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  metric: { type: "string" },
                  forecast_value: { type: "string" },
                  confidence: { type: "number" },
                  timeframe: { type: "string" }
                }
              }
            }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setGeneratedReport(data);
      toast.success('تم إنشاء التقرير بنجاح');
    }
  });

  const toggleModule = (moduleId) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(m => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up' || trend === 'improving') return <TrendingUp className="w-4 h-4 text-green-400" />;
    return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'green';
      case 'warning': return 'amber';
      case 'critical': return 'red';
      default: return 'slate';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20"
          >
            <FileBarChart className="w-6 h-6 text-blue-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold text-lg">إنشاء التقارير التلقائية AI</h4>
            <p className="text-slate-400 text-xs">يومي • أسبوعي • شهري • مخصص</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-purple-500/50" onClick={() => setShowScheduleDialog(true)}>
            <Calendar className="w-4 h-4 ml-1" />
            جدولة
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="generate" className="data-[state=active]:bg-blue-500/20">
            <Sparkles className="w-3 h-3 ml-1" />
            إنشاء تقرير
          </TabsTrigger>
          <TabsTrigger value="report" className="data-[state=active]:bg-green-500/20" disabled={!generatedReport}>
            <FileText className="w-3 h-3 ml-1" />
            عرض التقرير
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-purple-500/20">
            <Clock className="w-3 h-3 ml-1" />
            السجل
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="mt-4 space-y-4">
          {/* Report Type */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">نوع التقرير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'daily', name: 'يومي', icon: CalendarDays },
                  { id: 'weekly', name: 'أسبوعي', icon: Calendar },
                  { id: 'monthly', name: 'شهري', icon: FileBarChart }
                ].map((type) => (
                  <Card 
                    key={type.id}
                    className={`cursor-pointer transition-all ${
                      reportType === type.id 
                        ? 'bg-blue-500/20 border-blue-500' 
                        : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                    }`}
                    onClick={() => setReportType(type.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <type.icon className={`w-6 h-6 mx-auto mb-2 ${reportType === type.id ? 'text-blue-400' : 'text-slate-400'}`} />
                      <p className="text-white text-sm">{type.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Modules Selection */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">الوحدات المشمولة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {reportModules.map((module) => (
                  <div
                    key={module.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedModules.includes(module.id)
                        ? `bg-${module.color}-500/10 border-${module.color}-500/50`
                        : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                    }`}
                    onClick={() => toggleModule(module.id)}
                  >
                    <Checkbox checked={selectedModules.includes(module.id)} />
                    <module.icon className={`w-4 h-4 text-${module.color}-400`} />
                    <span className="text-white text-sm">{module.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Requirements */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">متطلبات مخصصة (اختياري)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="أضف أي متطلبات خاصة للتقرير..."
                className="bg-slate-900/50 border-slate-700 text-white min-h-[80px]"
              />
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12"
            onClick={() => generateReportMutation.mutate()}
            disabled={generateReportMutation.isPending || selectedModules.length === 0}
          >
            {generateReportMutation.isPending ? (
              <><Loader2 className="w-5 h-5 animate-spin ml-2" /> جاري إنشاء التقرير...</>
            ) : (
              <><Sparkles className="w-5 h-5 ml-2" /> إنشاء التقرير</>
            )}
          </Button>
        </TabsContent>

        {/* Report View Tab */}
        <TabsContent value="report" className="mt-4">
          {generatedReport && (
            <div className="space-y-4">
              {/* Report Header */}
              <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-bold text-xl">{generatedReport.report_title}</h3>
                      <p className="text-slate-400 text-sm">{generatedReport.report_period}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-slate-600">
                        <Download className="w-4 h-4 ml-1" />
                        تصدير PDF
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Send className="w-4 h-4 ml-1" />
                        إرسال
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg">
                    <p className="text-slate-300 leading-relaxed">{generatedReport.executive_summary}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">المؤشرات الرئيسية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-3">
                    {generatedReport.key_metrics?.map((metric, i) => (
                      <div key={i} className={`p-4 rounded-lg bg-${getStatusColor(metric.status)}-500/10 border border-${getStatusColor(metric.status)}-500/30`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-400 text-xs">{metric.metric_name}</span>
                          {getTrendIcon(metric.trend)}
                        </div>
                        <p className="text-white text-2xl font-bold">{metric.current_value}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-500 text-xs">السابق: {metric.previous_value}</span>
                          <Badge className={`text-xs ${metric.change_percent >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {metric.change_percent >= 0 ? '+' : ''}{metric.change_percent}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Module Insights */}
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">تحليلات الوحدات</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-3">
                      {generatedReport.module_insights?.map((insight, i) => (
                        <div key={i} className="p-4 bg-slate-900/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{insight.module}</span>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-cyan-500/20 text-cyan-400">{insight.health_score}%</Badge>
                              <Badge variant="outline" className="border-slate-600 text-xs">{insight.alerts_count} تنبيه</Badge>
                            </div>
                          </div>
                          <Progress value={insight.health_score} className="h-1 mb-2" />
                          <ul className="space-y-1">
                            {insight.key_findings?.map((finding, j) => (
                              <li key={j} className="text-slate-400 text-xs flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-400" />
                                {finding}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Trends & Anomalies */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      الاتجاهات المكتشفة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[150px]">
                      <div className="space-y-2">
                        {generatedReport.trends_identified?.map((trend, i) => (
                          <div key={i} className="p-3 bg-slate-900/50 rounded">
                            <p className="text-white text-sm font-medium">{trend.trend_name}</p>
                            <p className="text-slate-400 text-xs">{trend.description}</p>
                            <Badge className="mt-1 text-xs">{trend.impact}</Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="bg-red-500/10 border-red-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      ملخص الشذوذات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="text-center p-2 bg-slate-900/50 rounded">
                        <p className="text-2xl font-bold text-white">{generatedReport.anomalies_summary?.total_count}</p>
                        <p className="text-slate-400 text-xs">إجمالي</p>
                      </div>
                      <div className="text-center p-2 bg-red-500/10 rounded">
                        <p className="text-2xl font-bold text-red-400">{generatedReport.anomalies_summary?.critical}</p>
                        <p className="text-slate-400 text-xs">حرج</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {generatedReport.anomalies_summary?.top_anomalies?.slice(0, 3).map((a, i) => (
                        <p key={i} className="text-slate-300 text-xs">• {a}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">التوصيات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {generatedReport.recommendations?.map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded">
                        <Badge className={`text-xs flex-shrink-0 ${
                          rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          rec.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>{rec.priority}</Badge>
                        <div className="flex-1">
                          <p className="text-white text-sm">{rec.recommendation}</p>
                          <p className="text-slate-400 text-xs mt-1">التأثير: {rec.expected_impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Forecasts */}
              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    التوقعات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-3">
                    {generatedReport.forecasts?.map((forecast, i) => (
                      <div key={i} className="p-3 bg-slate-900/50 rounded-lg text-center">
                        <p className="text-slate-400 text-xs mb-1">{forecast.metric}</p>
                        <p className="text-white text-xl font-bold">{forecast.forecast_value}</p>
                        <Badge className="mt-1 bg-purple-500/20 text-purple-400 text-xs">ثقة {forecast.confidence}%</Badge>
                        <p className="text-slate-500 text-xs mt-1">{forecast.timeframe}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4">
              <div className="space-y-3">
                {[
                  { title: 'تقرير يومي - IoT والشذوذات', date: '2025-12-05', type: 'daily' },
                  { title: 'تقرير أسبوعي شامل', date: '2025-12-01', type: 'weekly' },
                  { title: 'تقرير شهري - نوفمبر', date: '2025-11-30', type: 'monthly' },
                ].map((report, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">{report.title}</p>
                        <p className="text-slate-400 text-xs">{report.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-slate-600">{report.type}</Badge>
                      <Button size="sm" variant="ghost" className="h-7">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">جدولة التقارير التلقائية</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">التكرار</Label>
              <Select value={scheduleConfig.frequency} onValueChange={(v) => setScheduleConfig({...scheduleConfig, frequency: v})}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="daily">يومياً</SelectItem>
                  <SelectItem value="weekly">أسبوعياً</SelectItem>
                  <SelectItem value="monthly">شهرياً</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">وقت الإرسال</Label>
              <Input
                type="time"
                value={scheduleConfig.time}
                onChange={(e) => setScheduleConfig({...scheduleConfig, time: e.target.value})}
                className="bg-slate-800/50 border-slate-700 mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">المستلمون (البريد الإلكتروني)</Label>
              <Input
                value={scheduleConfig.recipients}
                onChange={(e) => setScheduleConfig({...scheduleConfig, recipients: e.target.value})}
                placeholder="email@example.com, ..."
                className="bg-slate-800/50 border-slate-700 mt-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={scheduleConfig.autoSend} onCheckedChange={(v) => setScheduleConfig({...scheduleConfig, autoSend: v})} />
              <Label className="text-slate-300">إرسال تلقائي</Label>
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => { setShowScheduleDialog(false); toast.success('تم حفظ الجدولة'); }}>
              حفظ الجدولة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}