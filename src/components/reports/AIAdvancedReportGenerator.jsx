import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  FileText, Brain, BarChart3, TrendingUp, AlertTriangle, Download, Settings,
  Loader2, RefreshCw, Calendar, Filter, Target, Zap, Eye, CheckCircle,
  PieChart, LineChart, ArrowUp, ArrowDown, Clock, Users, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  LineChart as ReLineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'];

const reportTypes = [
  { id: 'performance', name: 'تقرير الأداء', icon: BarChart3 },
  { id: 'customer', name: 'تقرير العملاء', icon: Users },
  { id: 'agent', name: 'تقرير الوكلاء', icon: Activity },
  { id: 'predictive', name: 'تقرير تنبؤي', icon: Eye },
  { id: 'anomaly', name: 'كشف الشذوذ', icon: AlertTriangle },
];

export default function AIAdvancedReportGenerator() {
  const [reportConfig, setReportConfig] = useState({
    type: 'performance',
    period: 'week',
    metrics: ['calls', 'satisfaction', 'resolution'],
    includePredict: true,
    includeAnomaly: true,
  });
  const [generatedReport, setGeneratedReport] = useState(null);

  const generateReportMutation = useMutation({
    mutationFn: async (config) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بإنشاء تقرير ${config.type} متقدم يتضمن:

الفترة: ${config.period}
المقاييس: ${config.metrics.join(', ')}
تضمين التنبؤات: ${config.includePredict ? 'نعم' : 'لا'}
تضمين كشف الشذوذ: ${config.includeAnomaly ? 'نعم' : 'لا'}

قدم تقريراً شاملاً يتضمن:
1. ملخص تنفيذي
2. المقاييس الرئيسية مع الاتجاهات
3. الرسوم البيانية والبيانات
4. التنبؤات للفترة القادمة
5. الشذوذات المكتشفة والتنبيهات
6. التوصيات القابلة للتنفيذ
7. المخاطر والفرص`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            period: { type: "string" },
            generated_at: { type: "string" },
            executive_summary: { type: "string" },
            key_metrics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  value: { type: "string" },
                  change: { type: "number" },
                  status: { type: "string" },
                  target: { type: "string" }
                }
              }
            },
            trend_data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  period: { type: "string" },
                  calls: { type: "number" },
                  satisfaction: { type: "number" },
                  resolution: { type: "number" }
                }
              }
            },
            distribution_data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  value: { type: "number" }
                }
              }
            },
            predictions: {
              type: "object",
              properties: {
                next_period_volume: { type: "number" },
                next_period_satisfaction: { type: "number" },
                confidence: { type: "number" },
                trend: { type: "string" },
                factors: { type: "array", items: { type: "string" } }
              }
            },
            anomalies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  metric: { type: "string" },
                  severity: { type: "string" },
                  description: { type: "string" },
                  detected_at: { type: "string" },
                  recommended_action: { type: "string" }
                }
              }
            },
            recommendations: { type: "array", items: { type: "string" } },
            risks: { type: "array", items: { type: "string" } },
            opportunities: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setGeneratedReport(data);
      toast.success('تم إنشاء التقرير');
    },
    onError: () => {
      toast.error('حدث خطأ');
    }
  });

  const getSeverityColor = (severity) => {
    if (severity === 'high' || severity === 'critical') return 'red';
    if (severity === 'medium') return 'amber';
    return 'green';
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: generateReportMutation.isPending ? 360 : 0 }}
            transition={{ duration: 2, repeat: generateReportMutation.isPending ? Infinity : 0, ease: "linear" }}
            className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
          >
            <FileText className="w-5 h-5 text-cyan-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">منشئ التقارير المتقدم بـ AI</h4>
            <p className="text-slate-400 text-xs">تقارير ذكية • تنبؤات • كشف الشذوذ</p>
          </div>
        </div>
        {generatedReport && (
          <Button variant="outline" className="border-cyan-500/50">
            <Download className="w-4 h-4 ml-2" />
            تحميل PDF
          </Button>
        )}
      </div>

      {/* Configuration */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            إعدادات التقرير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label className="text-slate-400 text-xs mb-1 block">نوع التقرير</Label>
              <Select value={reportConfig.type} onValueChange={(v) => setReportConfig(prev => ({ ...prev, type: v }))}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {reportTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-400 text-xs mb-1 block">الفترة</Label>
              <Select value={reportConfig.period} onValueChange={(v) => setReportConfig(prev => ({ ...prev, period: v }))}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="day">اليوم</SelectItem>
                  <SelectItem value="week">الأسبوع</SelectItem>
                  <SelectItem value="month">الشهر</SelectItem>
                  <SelectItem value="quarter">الربع</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={reportConfig.includePredict}
                  onCheckedChange={(v) => setReportConfig(prev => ({ ...prev, includePredict: v }))}
                />
                <Label className="text-slate-300 text-xs">تنبؤات</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={reportConfig.includeAnomaly}
                  onCheckedChange={(v) => setReportConfig(prev => ({ ...prev, includeAnomaly: v }))}
                />
                <Label className="text-slate-300 text-xs">كشف الشذوذ</Label>
              </div>
            </div>
            <Button
              className="bg-cyan-600 hover:bg-cyan-700"
              onClick={() => generateReportMutation.mutate(reportConfig)}
              disabled={generateReportMutation.isPending}
            >
              {generateReportMutation.isPending ? (
                <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري الإنشاء...</>
              ) : (
                <><Brain className="w-4 h-4 ml-2" /> إنشاء التقرير</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Report */}
      {generatedReport && (
        <div className="space-y-4">
          {/* Report Header */}
          <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{generatedReport.title}</h3>
                  <p className="text-slate-400 text-sm">{generatedReport.period} • تم الإنشاء: {generatedReport.generated_at}</p>
                </div>
                <Badge className="bg-green-500/20 text-green-400">تقرير AI</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Executive Summary */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">الملخص التنفيذي</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm leading-relaxed">{generatedReport.executive_summary}</p>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {generatedReport.key_metrics?.map((metric, i) => (
              <Card key={i} className={`bg-${metric.status === 'good' ? 'green' : metric.status === 'warning' ? 'amber' : 'red'}-500/10 border-${metric.status === 'good' ? 'green' : metric.status === 'warning' ? 'amber' : 'red'}-500/30`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400 text-xs">{metric.name}</span>
                    <div className={`flex items-center gap-1 text-xs ${metric.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {metric.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {Math.abs(metric.change)}%
                    </div>
                  </div>
                  <p className="text-xl font-bold text-white">{metric.value}</p>
                  <p className="text-slate-500 text-xs">الهدف: {metric.target}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Trend Chart */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">الاتجاهات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={generatedReport.trend_data || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="period" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="calls" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} name="المكالمات" />
                      <Area type="monotone" dataKey="satisfaction" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} name="الرضا" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Distribution */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">التوزيع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={generatedReport.distribution_data || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {(generatedReport.distribution_data || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Predictions */}
          {reportConfig.includePredict && generatedReport.predictions && (
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-400" />
                  التنبؤات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-900/50 rounded text-center">
                    <p className="text-2xl font-bold text-white">{generatedReport.predictions.next_period_volume?.toLocaleString()}</p>
                    <p className="text-slate-400 text-xs">حجم الفترة القادمة</p>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded text-center">
                    <p className="text-2xl font-bold text-white">{generatedReport.predictions.next_period_satisfaction}%</p>
                    <p className="text-slate-400 text-xs">الرضا المتوقع</p>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded text-center">
                    <p className="text-2xl font-bold text-white">{generatedReport.predictions.confidence}%</p>
                    <p className="text-slate-400 text-xs">مستوى الثقة</p>
                  </div>
                </div>
                {generatedReport.predictions.factors?.length > 0 && (
                  <div className="mt-3 p-3 bg-slate-900/50 rounded">
                    <p className="text-purple-400 text-xs mb-1">العوامل المؤثرة:</p>
                    <div className="flex flex-wrap gap-1">
                      {generatedReport.predictions.factors.map((f, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Anomalies */}
          {reportConfig.includeAnomaly && generatedReport.anomalies?.length > 0 && (
            <Card className="bg-red-500/10 border-red-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  الشذوذات المكتشفة ({generatedReport.anomalies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {generatedReport.anomalies.map((anomaly, i) => (
                    <div key={i} className={`p-3 rounded-lg border bg-${getSeverityColor(anomaly.severity)}-500/10 border-${getSeverityColor(anomaly.severity)}-500/30`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium text-sm">{anomaly.metric}</span>
                        <Badge className={`bg-${getSeverityColor(anomaly.severity)}-500/20 text-${getSeverityColor(anomaly.severity)}-400`}>
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <p className="text-slate-300 text-sm">{anomaly.description}</p>
                      <p className="text-cyan-400 text-xs mt-1">💡 {anomaly.recommended_action}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations & Risks */}
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="bg-green-500/10 border-green-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  التوصيات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px]">
                  <div className="space-y-1">
                    {generatedReport.recommendations?.map((rec, i) => (
                      <p key={i} className="text-slate-300 text-xs">✓ {rec}</p>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  المخاطر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px]">
                  <div className="space-y-1">
                    {generatedReport.risks?.map((risk, i) => (
                      <p key={i} className="text-slate-300 text-xs">⚠ {risk}</p>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-400" />
                  الفرص
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px]">
                  <div className="space-y-1">
                    {generatedReport.opportunities?.map((opp, i) => (
                      <p key={i} className="text-slate-300 text-xs">🎯 {opp}</p>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}