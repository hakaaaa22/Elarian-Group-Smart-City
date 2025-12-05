import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Plus, Download, Filter, Calendar, BarChart3, LineChart,
  PieChart, Table, Settings, Sparkles, Eye, Edit, Trash2, Copy,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, RefreshCw,
  FileSpreadsheet, FileDown, Share2
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart as ReLineChart, Line,
  PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AIAssetLifecycle from '@/components/analytics/AIAssetLifecycle';
import AITechnicianPerformance from '@/components/analytics/AITechnicianPerformance';
import AIPartsUsageTrends from '@/components/analytics/AIPartsUsageTrends';
import { toast } from 'sonner';

const availableMetrics = [
  { id: 'energy_consumption', name: 'استهلاك الطاقة', category: 'energy', unit: 'kWh' },
  { id: 'maintenance_cost', name: 'تكلفة الصيانة', category: 'maintenance', unit: 'ر.س' },
  { id: 'device_uptime', name: 'وقت تشغيل الأجهزة', category: 'devices', unit: '%' },
  { id: 'incident_count', name: 'عدد الحوادث', category: 'security', unit: '' },
  { id: 'visitor_count', name: 'عدد الزوار', category: 'visitors', unit: '' },
  { id: 'inventory_value', name: 'قيمة المخزون', category: 'inventory', unit: 'ر.س' },
  { id: 'vehicle_distance', name: 'مسافة المركبات', category: 'fleet', unit: 'كم' },
  { id: 'fuel_consumption', name: 'استهلاك الوقود', category: 'fleet', unit: 'لتر' }
];

const visualizationTypes = [
  { id: 'line', name: 'خط', icon: LineChart },
  { id: 'bar', name: 'أعمدة', icon: BarChart3 },
  { id: 'area', name: 'مساحة', icon: TrendingUp },
  { id: 'pie', name: 'دائري', icon: PieChart },
  { id: 'table', name: 'جدول', icon: Table }
];

const dateRanges = [
  { id: 'today', name: 'اليوم' },
  { id: 'week', name: 'هذا الأسبوع' },
  { id: 'month', name: 'هذا الشهر' },
  { id: 'quarter', name: 'هذا الربع' },
  { id: 'year', name: 'هذا العام' },
  { id: 'custom', name: 'مخصص' }
];

// بيانات تجريبية
const generateMockData = (metric, range) => {
  const points = range === 'today' ? 24 : range === 'week' ? 7 : range === 'month' ? 30 : 12;
  const data = [];
  for (let i = 0; i < points; i++) {
    data.push({
      period: range === 'today' ? `${i}:00` : range === 'week' ? `يوم ${i + 1}` : `${i + 1}`,
      value: Math.floor(Math.random() * 1000) + 100,
      previous: Math.floor(Math.random() * 1000) + 100
    });
  }
  return data;
};

const COLORS = ['#22d3ee', '#a855f7', '#f59e0b', '#22c55e', '#ef4444', '#6366f1'];

export default function AdvancedReports() {
  const [activeTab, setActiveTab] = useState('builder');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    metrics: [],
    dateRange: 'month',
    customDateFrom: '',
    customDateTo: '',
    visualization: 'line',
    compareWithPrevious: true,
    groupBy: 'day'
  });

  const [savedReports, setSavedReports] = useState([
    {
      id: 1,
      name: 'تقرير استهلاك الطاقة الشهري',
      description: 'تحليل استهلاك الطاقة حسب المنطقة',
      metrics: ['energy_consumption'],
      dateRange: 'month',
      visualization: 'area',
      created: '2024-12-01',
      lastRun: '2024-12-04'
    },
    {
      id: 2,
      name: 'تكاليف الصيانة الربعية',
      description: 'مقارنة تكاليف الصيانة بين الفترات',
      metrics: ['maintenance_cost'],
      dateRange: 'quarter',
      visualization: 'bar',
      created: '2024-11-15',
      lastRun: '2024-12-03'
    }
  ]);

  const reportData = useMemo(() => {
    if (reportConfig.metrics.length === 0) return [];
    return generateMockData(reportConfig.metrics[0], reportConfig.dateRange);
  }, [reportConfig.metrics, reportConfig.dateRange]);

  // تحليل AI
  const aiAnalysisMutation = useMutation({
    mutationFn: async () => {
      const metricsNames = reportConfig.metrics.map(m => 
        availableMetrics.find(am => am.id === m)?.name
      ).join(', ');
      
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت محلل بيانات ذكي. حلل التقرير التالي وقدم رؤى:

التقرير: ${reportConfig.name || 'تقرير مخصص'}
المقاييس: ${metricsNames}
الفترة: ${dateRanges.find(d => d.id === reportConfig.dateRange)?.name}
البيانات: ${JSON.stringify(reportData.slice(0, 10))}

قدم:
1. ملخص تنفيذي
2. أهم 3 اتجاهات
3. شذوذات مكتشفة
4. توصيات عملية`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            trends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  direction: { type: "string", enum: ["up", "down", "stable"] },
                  percentage: { type: "number" },
                  description: { type: "string" }
                }
              }
            },
            anomalies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  period: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string" }
                }
              }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAiInsights(data);
      setIsGeneratingAI(false);
    },
    onError: () => {
      toast.error('فشل تحليل AI');
      setIsGeneratingAI(false);
    }
  });

  const generateAIInsights = () => {
    if (reportConfig.metrics.length === 0) {
      toast.error('يرجى اختيار مقياس واحد على الأقل');
      return;
    }
    setIsGeneratingAI(true);
    aiAnalysisMutation.mutate();
  };

  const saveReport = () => {
    if (!reportConfig.name) {
      toast.error('يرجى إدخال اسم التقرير');
      return;
    }
    const newReport = {
      id: Date.now(),
      ...reportConfig,
      created: new Date().toISOString().split('T')[0],
      lastRun: new Date().toISOString().split('T')[0]
    };
    setSavedReports([newReport, ...savedReports]);
    setShowCreateDialog(false);
    setReportConfig({
      name: '', description: '', metrics: [], dateRange: 'month',
      customDateFrom: '', customDateTo: '', visualization: 'line',
      compareWithPrevious: true, groupBy: 'day'
    });
    toast.success('تم حفظ التقرير');
  };

  const exportReport = (format) => {
    toast.success(`جاري تصدير التقرير بصيغة ${format.toUpperCase()}`);
  };

  const loadReport = (report) => {
    setReportConfig({
      name: report.name,
      description: report.description,
      metrics: report.metrics,
      dateRange: report.dateRange,
      visualization: report.visualization,
      compareWithPrevious: true,
      groupBy: 'day',
      customDateFrom: '',
      customDateTo: ''
    });
    setActiveTab('builder');
    setAiInsights(null);
  };

  const renderChart = () => {
    if (reportData.length === 0) return null;

    switch (reportConfig.visualization) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ReLineChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="period" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} name="الحالي" />
              {reportConfig.compareWithPrevious && (
                <Line type="monotone" dataKey="previous" stroke="#a855f7" strokeWidth={2} name="السابق" strokeDasharray="5 5" />
              )}
            </ReLineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="period" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
              <Legend />
              <Bar dataKey="value" fill="#22d3ee" name="الحالي" />
              {reportConfig.compareWithPrevious && (
                <Bar dataKey="previous" fill="#a855f7" name="السابق" />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="period" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
              <Legend />
              <Area type="monotone" dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} name="الحالي" />
              {reportConfig.compareWithPrevious && (
                <Area type="monotone" dataKey="previous" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} name="السابق" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        const pieData = reportData.slice(0, 6).map((d, i) => ({ name: d.period, value: d.value }));
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
            </RePieChart>
          </ResponsiveContainer>
        );
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-right p-3 text-slate-300">الفترة</th>
                  <th className="text-right p-3 text-slate-300">القيمة</th>
                  {reportConfig.compareWithPrevious && (
                    <>
                      <th className="text-right p-3 text-slate-300">السابق</th>
                      <th className="text-right p-3 text-slate-300">التغيير</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => {
                  const change = ((row.value - row.previous) / row.previous * 100).toFixed(1);
                  return (
                    <tr key={idx} className="border-b border-slate-700/50">
                      <td className="p-3 text-white">{row.period}</td>
                      <td className="p-3 text-cyan-400">{row.value.toLocaleString()}</td>
                      {reportConfig.compareWithPrevious && (
                        <>
                          <td className="p-3 text-slate-400">{row.previous.toLocaleString()}</td>
                          <td className={`p-3 ${Number(change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {Number(change) >= 0 ? '+' : ''}{change}%
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-cyan-400" />
              التقارير المتقدمة
            </h1>
            <p className="text-slate-400 mt-1">إنشاء تقارير مخصصة مع تحليلات AI</p>
          </div>
          <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 ml-2" />
            تقرير جديد
          </Button>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="builder" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <BarChart3 className="w-4 h-4 ml-2" />
            منشئ التقارير
          </TabsTrigger>
          <TabsTrigger value="saved" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <FileText className="w-4 h-4 ml-2" />
            المحفوظة
          </TabsTrigger>
          <TabsTrigger value="lifecycle" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <TrendingUp className="w-4 h-4 ml-2" />
            دورة الأصول
          </TabsTrigger>
          <TabsTrigger value="technicians" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <TrendingUp className="w-4 h-4 ml-2" />
            أداء الفنيين
          </TabsTrigger>
          <TabsTrigger value="parts-trends" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <TrendingUp className="w-4 h-4 ml-2" />
            اتجاهات القطع
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
            <Sparkles className="w-4 h-4 ml-2" />
            رؤى AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* إعدادات التقرير */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-lg">إعدادات التقرير</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300">اسم التقرير</Label>
                  <Input
                    value={reportConfig.name}
                    onChange={(e) => setReportConfig({...reportConfig, name: e.target.value})}
                    placeholder="تقرير جديد..."
                    className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 mb-2 block">المقاييس</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableMetrics.map(metric => (
                      <div key={metric.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={reportConfig.metrics.includes(metric.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setReportConfig({...reportConfig, metrics: [...reportConfig.metrics, metric.id]});
                            } else {
                              setReportConfig({...reportConfig, metrics: reportConfig.metrics.filter(m => m !== metric.id)});
                            }
                          }}
                        />
                        <span className="text-slate-300 text-sm">{metric.name}</span>
                        <Badge className="text-[10px] bg-slate-700">{metric.unit}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300">الفترة الزمنية</Label>
                  <Select value={reportConfig.dateRange} onValueChange={(v) => setReportConfig({...reportConfig, dateRange: v})}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {dateRanges.map(range => (
                        <SelectItem key={range.id} value={range.id}>{range.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {reportConfig.dateRange === 'custom' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-slate-300 text-xs">من</Label>
                      <Input
                        type="date"
                        value={reportConfig.customDateFrom}
                        onChange={(e) => setReportConfig({...reportConfig, customDateFrom: e.target.value})}
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300 text-xs">إلى</Label>
                      <Input
                        type="date"
                        value={reportConfig.customDateTo}
                        onChange={(e) => setReportConfig({...reportConfig, customDateTo: e.target.value})}
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-slate-300 mb-2 block">نوع العرض</Label>
                  <div className="grid grid-cols-5 gap-1">
                    {visualizationTypes.map(viz => (
                      <Button
                        key={viz.id}
                        variant={reportConfig.visualization === viz.id ? "default" : "outline"}
                        size="sm"
                        className={reportConfig.visualization === viz.id ? "bg-cyan-600" : "border-slate-600"}
                        onClick={() => setReportConfig({...reportConfig, visualization: viz.id})}
                      >
                        <viz.icon className="w-4 h-4" />
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">مقارنة مع الفترة السابقة</Label>
                  <Checkbox
                    checked={reportConfig.compareWithPrevious}
                    onCheckedChange={(v) => setReportConfig({...reportConfig, compareWithPrevious: v})}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={saveReport}>
                    حفظ
                  </Button>
                  <Button
                    variant="outline"
                    className="border-cyan-500/50 text-cyan-400"
                    onClick={generateAIInsights}
                    disabled={isGeneratingAI}
                  >
                    <Sparkles className={`w-4 h-4 ml-1 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                    AI
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* معاينة التقرير */}
            <Card className="lg:col-span-2 glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">
                    {reportConfig.name || 'معاينة التقرير'}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-slate-600" onClick={() => exportReport('pdf')}>
                      <FileDown className="w-4 h-4 ml-1" />PDF
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-600" onClick={() => exportReport('csv')}>
                      <FileSpreadsheet className="w-4 h-4 ml-1" />CSV
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-600" onClick={() => exportReport('excel')}>
                      <Download className="w-4 h-4 ml-1" />Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {reportConfig.metrics.length === 0 ? (
                  <div className="text-center py-16">
                    <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">اختر مقياساً واحداً على الأقل لعرض التقرير</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {renderChart()}

                    {/* رؤى AI */}
                    {aiInsights && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl mt-4"
                      >
                        <h3 className="text-purple-300 font-bold mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          تحليل AI
                        </h3>
                        <p className="text-slate-300 text-sm mb-4">{aiInsights.summary}</p>

                        {aiInsights.trends?.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-slate-400 text-sm mb-2">الاتجاهات:</h4>
                            <div className="grid md:grid-cols-3 gap-2">
                              {aiInsights.trends.map((trend, idx) => (
                                <div key={idx} className="p-2 bg-slate-800/50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    {trend.direction === 'up' ? (
                                      <TrendingUp className="w-4 h-4 text-green-400" />
                                    ) : trend.direction === 'down' ? (
                                      <TrendingDown className="w-4 h-4 text-red-400" />
                                    ) : (
                                      <TrendingUp className="w-4 h-4 text-slate-400" />
                                    )}
                                    <span className="text-white text-sm">{trend.title}</span>
                                  </div>
                                  <p className="text-slate-400 text-xs mt-1">{trend.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {aiInsights.recommendations?.length > 0 && (
                          <div>
                            <h4 className="text-slate-400 text-sm mb-2">التوصيات:</h4>
                            <ul className="space-y-1">
                              {aiInsights.recommendations.map((rec, idx) => (
                                <li key={idx} className="text-green-300 text-sm flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedReports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 hover:border-cyan-500/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-bold">{report.name}</h3>
                        <p className="text-slate-400 text-sm">{report.description}</p>
                      </div>
                      <Badge className="bg-slate-700">
                        {visualizationTypes.find(v => v.id === report.visualization)?.name}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                      <span>إنشاء: {report.created}</span>
                      <span>آخر تشغيل: {report.lastRun}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={() => loadReport(report)}>
                        <Eye className="w-3 h-3 ml-1" />عرض
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-600">
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-500/50 text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lifecycle" className="mt-4">
          <AIAssetLifecycle />
        </TabsContent>

        <TabsContent value="technicians" className="mt-4">
          <AITechnicianPerformance />
        </TabsContent>

        <TabsContent value="parts-trends" className="mt-4">
          <AIPartsUsageTrends />
        </TabsContent>

        <TabsContent value="insights" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-6 text-center">
              <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-white text-xl font-bold mb-2">رؤى AI التلقائية</h3>
              <p className="text-slate-400 mb-4">
                قم بإنشاء تقرير واضغط على زر AI للحصول على تحليلات ذكية
              </p>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setActiveTab('builder')}>
                ابدأ الآن
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}