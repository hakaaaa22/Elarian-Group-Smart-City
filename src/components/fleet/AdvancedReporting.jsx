import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  FileText, Download, BarChart3, PieChart, TrendingUp, Calendar,
  Car, Users, Shield, Wrench, Video, Filter, RefreshCw, Loader2,
  FileSpreadsheet, File, ChevronDown, Eye, Send, Clock, Target,
  Fuel, AlertTriangle, CheckCircle, DollarSign, MapPin, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const reportTypes = [
  { id: 'fleet_efficiency', name: 'كفاءة الأسطول', icon: Car, color: 'cyan' },
  { id: 'driver_performance', name: 'أداء السائقين', icon: Users, color: 'purple' },
  { id: 'security_incidents', name: 'الحوادث الأمنية', icon: Shield, color: 'red' },
  { id: 'maintenance_history', name: 'سجل الصيانة', icon: Wrench, color: 'amber' },
  { id: 'forensic_analysis', name: 'التحليل الجنائي', icon: Video, color: 'indigo' },
  { id: 'fuel_consumption', name: 'استهلاك الوقود', icon: Fuel, color: 'green' },
];

const exportFormats = [
  { id: 'pdf', name: 'PDF', icon: FileText },
  { id: 'csv', name: 'CSV', icon: FileSpreadsheet },
  { id: 'excel', name: 'Excel', icon: FileSpreadsheet },
  { id: 'json', name: 'JSON', icon: File },
];

const mockChartData = [
  { name: 'يناير', efficiency: 85, incidents: 12, maintenance: 8 },
  { name: 'فبراير', efficiency: 88, incidents: 8, maintenance: 5 },
  { name: 'مارس', efficiency: 82, incidents: 15, maintenance: 12 },
  { name: 'أبريل', efficiency: 91, incidents: 6, maintenance: 4 },
  { name: 'مايو', efficiency: 89, incidents: 9, maintenance: 7 },
  { name: 'يونيو', efficiency: 94, incidents: 4, maintenance: 3 },
];

const pieData = [
  { name: 'ممتاز', value: 45, color: '#10b981' },
  { name: 'جيد', value: 30, color: '#3b82f6' },
  { name: 'متوسط', value: 18, color: '#f59e0b' },
  { name: 'ضعيف', value: 7, color: '#ef4444' },
];

export default function AdvancedReporting({ vehicles = [] }) {
  const [selectedReport, setSelectedReport] = useState('fleet_efficiency');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [reportOptions, setReportOptions] = useState({
    includeCharts: true,
    includeRawData: true,
    includeSummary: true,
    includeRecommendations: true,
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (params) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت محلل بيانات متخصص في إدارة الأساطيل. قم بإنشاء تقرير تفصيلي من نوع "${reportTypes.find(r => r.id === params.reportType)?.name}".

الفترة: ${params.dateRange.from || 'آخر 30 يوم'} إلى ${params.dateRange.to || 'اليوم'}
عدد المركبات: ${params.vehicleCount || 'جميع المركبات'}

قم بتضمين:
1. ملخص تنفيذي
2. مؤشرات الأداء الرئيسية (KPIs)
3. تحليل الاتجاهات
4. نقاط القوة والضعف
5. توصيات للتحسين
6. مقارنة بالفترة السابقة`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            kpis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  value: { type: "string" },
                  change: { type: "number" },
                  trend: { type: "string" },
                  status: { type: "string" }
                }
              }
            },
            trends_analysis: {
              type: "object",
              properties: {
                overall_trend: { type: "string" },
                key_insights: { type: "array", items: { type: "string" } },
                anomalies: { type: "array", items: { type: "string" } }
              }
            },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  estimated_impact: { type: "string" }
                }
              }
            },
            comparison: {
              type: "object",
              properties: {
                previous_period: { type: "string" },
                change_percentage: { type: "number" },
                improvement_areas: { type: "array", items: { type: "string" } }
              }
            },
            detailed_metrics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  metrics: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        value: { type: "string" },
                        benchmark: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setReportData(data);
      toast.success('تم إنشاء التقرير بنجاح');
    },
    onError: () => {
      toast.error('فشل في إنشاء التقرير');
    }
  });

  const handleExport = () => {
    toast.success(`جاري تصدير التقرير بصيغة ${exportFormat.toUpperCase()}...`);
    setShowExportDialog(false);
  };

  const selectedReportConfig = reportTypes.find(r => r.id === selectedReport);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/20">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">التقارير المتقدمة</h2>
            <p className="text-slate-400 text-sm">تقارير تحليلية شاملة وقابلة للتخصيص</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-600">
            <Calendar className="w-4 h-4 ml-2" />
            جدولة تقرير
          </Button>
          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-600 hover:bg-cyan-700" disabled={!reportData}>
                <Download className="w-4 h-4 ml-2" />
                تصدير
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0f1629] border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">تصدير التقرير</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-slate-300">صيغة الملف</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {exportFormats.map(format => (
                      <Button
                        key={format.id}
                        variant={exportFormat === format.id ? "default" : "outline"}
                        className={exportFormat === format.id ? "bg-cyan-600" : "border-slate-600"}
                        onClick={() => setExportFormat(format.id)}
                      >
                        <format.icon className="w-4 h-4 ml-1" />
                        {format.name}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  {Object.entries(reportOptions).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="text-slate-300 text-sm">
                        {key === 'includeCharts' && 'تضمين الرسوم البيانية'}
                        {key === 'includeRawData' && 'تضمين البيانات الخام'}
                        {key === 'includeSummary' && 'تضمين الملخص التنفيذي'}
                        {key === 'includeRecommendations' && 'تضمين التوصيات'}
                      </Label>
                      <Switch
                        checked={value}
                        onCheckedChange={(v) => setReportOptions({ ...reportOptions, [key]: v })}
                      />
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={handleExport}>
                  <Download className="w-4 h-4 ml-2" />
                  تصدير الآن
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Report Selection & Filters */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader>
            <CardTitle className="text-white text-sm">نوع التقرير</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reportTypes.map(report => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedReport === report.id
                    ? `bg-${report.color}-500/20 border border-${report.color}-500/50`
                    : 'bg-slate-800/50 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <report.icon className={`w-4 h-4 text-${report.color}-400`} />
                  <span className="text-white text-sm">{report.name}</span>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-slate-700 space-y-3">
              <div>
                <Label className="text-slate-400 text-xs">من تاريخ</Label>
                <Input
                  type="date"
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-slate-400 text-xs">إلى تاريخ</Label>
                <Input
                  type="date"
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                />
              </div>
            </div>

            <Button
              className="w-full bg-cyan-600 hover:bg-cyan-700"
              onClick={() => generateReportMutation.mutate({
                reportType: selectedReport,
                dateRange,
                vehicleCount: selectedVehicles.length || vehicles.length
              })}
              disabled={generateReportMutation.isPending}
            >
              {generateReportMutation.isPending ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <BarChart3 className="w-4 h-4 ml-2" />
              )}
              إنشاء التقرير
            </Button>
          </CardContent>
        </Card>

        {/* Report Content */}
        <div className="lg:col-span-3 space-y-4">
          {reportData ? (
            <>
              {/* Executive Summary */}
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    الملخص التنفيذي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm leading-relaxed">{reportData.executive_summary}</p>
                </CardContent>
              </Card>

              {/* KPIs */}
              <div className="grid md:grid-cols-4 gap-3">
                {reportData.kpis?.slice(0, 4).map((kpi, i) => (
                  <Card key={i} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                    <CardContent className="p-4">
                      <p className="text-slate-400 text-xs">{kpi.name}</p>
                      <p className="text-2xl font-bold text-white mt-1">{kpi.value}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className={`w-3 h-3 ${kpi.change >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                        <span className={`text-xs ${kpi.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {kpi.change >= 0 ? '+' : ''}{kpi.change}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-4">
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">اتجاه الأداء</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={mockChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} />
                        <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
                        <Area type="monotone" dataKey="efficiency" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">توزيع الأداء</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <RePieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
                        <Legend />
                      </RePieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              {reportData.recommendations?.length > 0 && (
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">التوصيات</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {reportData.recommendations.map((rec, i) => (
                      <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-white font-medium text-sm">{rec.title}</p>
                            <p className="text-slate-400 text-xs mt-1">{rec.description}</p>
                          </div>
                          <Badge className={`${
                            rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            rec.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {rec.priority}
                          </Badge>
                        </div>
                        {rec.estimated_impact && (
                          <p className="text-cyan-400 text-xs mt-2">التأثير المتوقع: {rec.estimated_impact}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="py-16 text-center">
                <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">اختر نوع التقرير والفترة الزمنية ثم اضغط "إنشاء التقرير"</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}