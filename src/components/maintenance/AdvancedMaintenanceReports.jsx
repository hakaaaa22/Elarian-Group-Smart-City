import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Download, FileText, User, Wrench, DollarSign, Clock,
  TrendingUp, TrendingDown, MapPin, Filter, Printer, FileSpreadsheet,
  Calendar, Brain, Sparkles, AlertTriangle, CheckCircle, Activity,
  PieChart as PieChartIcon, Settings, RefreshCw, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const COLORS = ['#22d3ee', '#a855f7', '#f59e0b', '#22c55e', '#ef4444', '#6366f1'];

export default function AdvancedMaintenanceReports({ records = [], technicians = [] }) {
  const [reportType, setReportType] = useState('overview');
  const [timeRange, setTimeRange] = useState('month');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState('all');
  const [selectedDeviceType, setSelectedDeviceType] = useState('all');
  const [selectedMaintenanceType, setSelectedMaintenanceType] = useState('all');
  const [showCustomReportDialog, setShowCustomReportDialog] = useState(false);
  const [showAIInsightsDialog, setShowAIInsightsDialog] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [customReportConfig, setCustomReportConfig] = useState({
    includeCharts: true,
    includeTechnicians: true,
    includeCosts: true,
    includeAIInsights: true,
    format: 'pdf'
  });

  // فلترة السجلات
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesTechnician = selectedTechnician === 'all' || r.technician_name === selectedTechnician;
      const matchesDeviceType = selectedDeviceType === 'all' || r.device_type === selectedDeviceType;
      const matchesMaintenanceType = selectedMaintenanceType === 'all' || r.maintenance_type === selectedMaintenanceType;
      const matchesDateFrom = !dateFrom || r.scheduled_date >= dateFrom;
      const matchesDateTo = !dateTo || r.scheduled_date <= dateTo;
      return matchesTechnician && matchesDeviceType && matchesMaintenanceType && matchesDateFrom && matchesDateTo;
    });
  }, [records, selectedTechnician, selectedDeviceType, selectedMaintenanceType, dateFrom, dateTo]);

  // إحصائيات عامة
  const stats = useMemo(() => ({
    total: filteredRecords.length,
    completed: filteredRecords.filter(r => r.status === 'completed').length,
    inProgress: filteredRecords.filter(r => r.status === 'in_progress').length,
    scheduled: filteredRecords.filter(r => r.status === 'scheduled').length,
    totalCost: filteredRecords.reduce((s, r) => s + (r.total_cost || 0), 0),
    avgCost: filteredRecords.length > 0 ? Math.round(filteredRecords.reduce((s, r) => s + (r.total_cost || 0), 0) / filteredRecords.length) : 0,
    preventiveRatio: filteredRecords.length > 0 ? Math.round((filteredRecords.filter(r => r.maintenance_type === 'preventive').length / filteredRecords.length) * 100) : 0,
    avgDuration: filteredRecords.filter(r => r.actual_duration).length > 0 
      ? (filteredRecords.reduce((s, r) => s + (r.actual_duration || 0), 0) / filteredRecords.filter(r => r.actual_duration).length).toFixed(1) 
      : 0
  }), [filteredRecords]);

  // تحليل التكاليف
  const costAnalysis = useMemo(() => {
    const preventive = filteredRecords.filter(r => r.maintenance_type === 'preventive').reduce((s, r) => s + (r.total_cost || 0), 0);
    const corrective = filteredRecords.filter(r => r.maintenance_type === 'corrective').reduce((s, r) => s + (r.total_cost || 0), 0);
    const emergency = filteredRecords.filter(r => r.maintenance_type === 'emergency').reduce((s, r) => s + (r.total_cost || 0), 0);
    const inspection = filteredRecords.filter(r => r.maintenance_type === 'inspection').reduce((s, r) => s + (r.total_cost || 0), 0);
    return [
      { name: 'وقائية', value: preventive, color: '#22c55e' },
      { name: 'تصحيحية', value: corrective, color: '#f59e0b' },
      { name: 'طارئة', value: emergency, color: '#ef4444' },
      { name: 'فحص', value: inspection, color: '#6366f1' },
    ];
  }, [filteredRecords]);

  // أداء الفنيين
  const technicianPerformance = useMemo(() => {
    const grouped = {};
    filteredRecords.filter(r => r.status === 'completed').forEach(r => {
      const tech = r.technician_name || 'غير محدد';
      if (!grouped[tech]) grouped[tech] = { 
        name: tech, completed: 0, avgTime: 0, totalTime: 0, totalCost: 0,
        preventive: 0, corrective: 0, emergency: 0, rating: 0
      };
      grouped[tech].completed++;
      grouped[tech].totalTime += r.actual_duration || r.estimated_duration || 0;
      grouped[tech].totalCost += r.total_cost || 0;
      if (r.maintenance_type === 'preventive') grouped[tech].preventive++;
      else if (r.maintenance_type === 'corrective') grouped[tech].corrective++;
      else if (r.maintenance_type === 'emergency') grouped[tech].emergency++;
    });
    return Object.values(grouped).map(t => ({
      ...t,
      avgTime: t.completed > 0 ? (t.totalTime / t.completed).toFixed(1) : 0,
      avgCost: t.completed > 0 ? Math.round(t.totalCost / t.completed) : 0,
      efficiency: t.completed > 0 ? Math.min(100, Math.round((t.preventive / t.completed) * 100 + 20)) : 0
    })).sort((a, b) => b.completed - a.completed);
  }, [filteredRecords]);

  // اتجاهات شهرية
  const monthlyTrends = useMemo(() => {
    const months = {};
    filteredRecords.forEach(r => {
      const month = r.scheduled_date?.substring(0, 7) || 'غير محدد';
      if (!months[month]) months[month] = { month, preventive: 0, corrective: 0, emergency: 0, cost: 0 };
      months[month].cost += r.total_cost || 0;
      if (r.maintenance_type === 'preventive') months[month].preventive++;
      else if (r.maintenance_type === 'corrective') months[month].corrective++;
      else if (r.maintenance_type === 'emergency') months[month].emergency++;
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [filteredRecords]);

  // حسب نوع الجهاز
  const byDeviceType = useMemo(() => {
    const grouped = {};
    filteredRecords.forEach(r => {
      const type = r.device_type || 'أخرى';
      if (!grouped[type]) grouped[type] = { name: type, count: 0, cost: 0, avgTime: 0, totalTime: 0 };
      grouped[type].count++;
      grouped[type].cost += r.total_cost || 0;
      grouped[type].totalTime += r.actual_duration || r.estimated_duration || 0;
    });
    return Object.values(grouped).map(g => ({
      ...g,
      avgTime: g.count > 0 ? (g.totalTime / g.count).toFixed(1) : 0,
      avgCost: g.count > 0 ? Math.round(g.cost / g.count) : 0
    }));
  }, [filteredRecords]);

  // AI Insights Generation
  const aiInsightsMutation = useMutation({
    mutationFn: async () => {
      const summaryData = {
        totalRecords: stats.total,
        completedRecords: stats.completed,
        totalCost: stats.totalCost,
        preventiveRatio: stats.preventiveRatio,
        avgDuration: stats.avgDuration,
        costBreakdown: costAnalysis,
        technicianStats: technicianPerformance.slice(0, 5),
        deviceTypeStats: byDeviceType,
        monthlyTrends: monthlyTrends
      };

      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت محلل بيانات صيانة خبير. حلل بيانات الصيانة التالية وقدم رؤى ذكية:

${JSON.stringify(summaryData, null, 2)}

قدم تحليلاً شاملاً يشمل:
1. ملخص تنفيذي للأداء
2. نقاط القوة والضعف
3. اتجاهات مهمة
4. توصيات للتحسين
5. تحذيرات ومخاطر محتملة
6. فرص توفير التكلفة`,
        response_json_schema: {
          type: "object",
          properties: {
            executiveSummary: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            trends: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  direction: { type: "string" }
                }
              } 
            },
            recommendations: { type: "array", items: { type: "string" } },
            warnings: { type: "array", items: { type: "string" } },
            costSavingOpportunities: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  opportunity: { type: "string" },
                  potentialSaving: { type: "string" }
                }
              } 
            },
            overallScore: { type: "number" },
            performanceIndicators: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  value: { type: "string" },
                  status: { type: "string" }
                }
              }
            }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAiInsights(data);
      setShowAIInsightsDialog(true);
      setIsGeneratingAI(false);
    },
    onError: () => {
      toast.error('حدث خطأ في إنشاء التحليل');
      setIsGeneratingAI(false);
    }
  });

  const generateAIInsights = () => {
    setIsGeneratingAI(true);
    aiInsightsMutation.mutate();
  };

  const exportReport = (format) => {
    toast.success(`جاري تصدير التقرير بصيغة ${format.toUpperCase()}`);
  };

  const generateCustomReport = () => {
    toast.success('جاري إنشاء التقرير المخصص...');
    setShowCustomReportDialog(false);
  };

  const deviceTypes = [...new Set(records.map(r => r.device_type).filter(Boolean))];
  const maintenanceTypes = ['preventive', 'corrective', 'emergency', 'inspection', 'replacement'];
  const technicianNames = [...new Set(records.map(r => r.technician_name).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            تقارير الصيانة المتقدمة
          </h3>
          <p className="text-slate-400 text-sm">تحليلات شاملة مع رؤى AI</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            className="border-purple-500/50 text-purple-400"
            onClick={generateAIInsights}
            disabled={isGeneratingAI}
          >
            {isGeneratingAI ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
            رؤى AI
          </Button>
          <Button 
            variant="outline" 
            className="border-cyan-500/50 text-cyan-400"
            onClick={() => setShowCustomReportDialog(true)}
          >
            <Settings className="w-4 h-4 ml-2" />
            تقرير مخصص
          </Button>
          <Button variant="outline" className="border-green-500/50 text-green-400" onClick={() => exportReport('csv')}>
            <FileSpreadsheet className="w-4 h-4 ml-2" />
            CSV
          </Button>
          <Button variant="outline" className="border-red-500/50 text-red-400" onClick={() => exportReport('pdf')}>
            <FileText className="w-4 h-4 ml-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <Label className="text-slate-400 text-xs">من تاريخ</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-white mt-1 h-9"
              />
            </div>
            <div>
              <Label className="text-slate-400 text-xs">إلى تاريخ</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-white mt-1 h-9"
              />
            </div>
            <div>
              <Label className="text-slate-400 text-xs">الفني</Label>
              <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">جميع الفنيين</SelectItem>
                  {technicianNames.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-400 text-xs">نوع الجهاز</Label>
              <Select value={selectedDeviceType} onValueChange={setSelectedDeviceType}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">جميع الأجهزة</SelectItem>
                  {deviceTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-400 text-xs">نوع الصيانة</Label>
              <Select value={selectedMaintenanceType} onValueChange={setSelectedMaintenanceType}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="preventive">وقائية</SelectItem>
                  <SelectItem value="corrective">تصحيحية</SelectItem>
                  <SelectItem value="emergency">طارئة</SelectItem>
                  <SelectItem value="inspection">فحص</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full border-slate-600 h-9"
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                  setSelectedTechnician('all');
                  setSelectedDeviceType('all');
                  setSelectedMaintenanceType('all');
                }}
              >
                مسح الفلاتر
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'إجمالي العمليات', value: stats.total, icon: Activity, color: 'cyan' },
          { label: 'مكتملة', value: stats.completed, icon: CheckCircle, color: 'green' },
          { label: 'قيد التنفيذ', value: stats.inProgress, icon: RefreshCw, color: 'amber' },
          { label: 'مجدولة', value: stats.scheduled, icon: Calendar, color: 'blue' },
          { label: 'إجمالي التكلفة', value: `${stats.totalCost.toLocaleString()}`, icon: DollarSign, color: 'green' },
          { label: 'متوسط التكلفة', value: `${stats.avgCost}`, icon: TrendingUp, color: 'purple' },
          { label: 'نسبة الوقائية', value: `${stats.preventiveRatio}%`, icon: Wrench, color: 'cyan' },
          { label: 'متوسط المدة', value: `${stats.avgDuration}h`, icon: Clock, color: 'amber' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-3 text-center">
                <stat.icon className={`w-5 h-5 text-${stat.color}-400 mx-auto mb-1`} />
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-slate-400">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs value={reportType} onValueChange={setReportType}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap">
          <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <PieChartIcon className="w-4 h-4 ml-1" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="costs" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <DollarSign className="w-4 h-4 ml-1" />
            التكاليف
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <TrendingUp className="w-4 h-4 ml-1" />
            الاتجاهات
          </TabsTrigger>
          <TabsTrigger value="technicians" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <User className="w-4 h-4 ml-1" />
            الفنيين
          </TabsTrigger>
          <TabsTrigger value="devices" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <Wrench className="w-4 h-4 ml-1" />
            الأجهزة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">توزيع أنواع الصيانة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costAnalysis.filter(c => c.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {costAnalysis.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value.toLocaleString()} ر.س`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">مؤشرات الأداء الرئيسية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-300">نسبة الصيانة الوقائية</span>
                      <span className={`font-bold ${stats.preventiveRatio >= 70 ? 'text-green-400' : stats.preventiveRatio >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {stats.preventiveRatio}%
                      </span>
                    </div>
                    <Progress value={stats.preventiveRatio} className="h-3" />
                    <p className="text-slate-500 text-xs mt-1">الهدف: 70%</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-300">معدل الإنجاز</span>
                      <span className="text-cyan-400 font-bold">
                        {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                      </span>
                    </div>
                    <Progress value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0} className="h-3" />
                  </div>

                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <p className="text-purple-300 text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      تحليل AI: {stats.preventiveRatio >= 70 ? 'أداء ممتاز!' : stats.preventiveRatio >= 50 ? 'أداء جيد، يمكن تحسينه' : 'يحتاج تحسين - زيادة الصيانة الوقائية'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">توزيع التكاليف حسب النوع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costAnalysis.map((item, i) => (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white">{item.name}</span>
                        <span style={{ color: item.color }} className="font-bold">{item.value.toLocaleString()} ر.س</span>
                      </div>
                      <Progress 
                        value={stats.totalCost > 0 ? (item.value / stats.totalCost) * 100 : 0} 
                        className="h-3"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">اتجاه التكاليف الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="cost" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="التكلفة" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">اتجاهات الصيانة الشهرية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="preventive" fill="#22c55e" name="وقائية" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="corrective" fill="#f59e0b" name="تصحيحية" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="emergency" fill="#ef4444" name="طارئة" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technicians" className="space-y-4 mt-4">
          <div className="space-y-3">
            {technicianPerformance.map((tech, i) => (
              <motion.div key={tech.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <span className="text-amber-400 font-bold text-lg">{tech.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 className="text-white font-bold">{tech.name}</h4>
                          <p className="text-slate-400 text-sm">{tech.completed} عملية مكتملة</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-green-500/20 text-green-400">{tech.preventive} وقائية</Badge>
                          <Badge className="bg-amber-500/20 text-amber-400">{tech.corrective} تصحيحية</Badge>
                          <Badge className="bg-red-500/20 text-red-400">{tech.emergency} طارئة</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="p-2 bg-cyan-500/10 rounded-lg">
                          <p className="text-cyan-400 font-bold">{tech.avgTime}h</p>
                          <p className="text-slate-500 text-xs">متوسط المدة</p>
                        </div>
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <p className="text-green-400 font-bold">{tech.avgCost}</p>
                          <p className="text-slate-500 text-xs">متوسط التكلفة</p>
                        </div>
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <p className="text-purple-400 font-bold">{tech.totalCost.toLocaleString()}</p>
                          <p className="text-slate-500 text-xs">إجمالي التكلفة</p>
                        </div>
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                          <p className="text-amber-400 font-bold">{tech.efficiency}%</p>
                          <p className="text-slate-500 text-xs">الكفاءة</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">الصيانة حسب نوع الجهاز</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byDeviceType} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="count" fill="#22d3ee" name="عدد العمليات" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {byDeviceType.map((device, i) => (
              <Card key={device.name} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <h4 className="text-white font-bold mb-3">{device.name}</h4>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-cyan-500/10 rounded">
                      <p className="text-cyan-400 font-bold">{device.count}</p>
                      <p className="text-slate-500 text-xs">عدد العمليات</p>
                    </div>
                    <div className="p-2 bg-green-500/10 rounded">
                      <p className="text-green-400 font-bold">{device.cost.toLocaleString()}</p>
                      <p className="text-slate-500 text-xs">إجمالي التكلفة</p>
                    </div>
                    <div className="p-2 bg-amber-500/10 rounded">
                      <p className="text-amber-400 font-bold">{device.avgTime}h</p>
                      <p className="text-slate-500 text-xs">متوسط المدة</p>
                    </div>
                    <div className="p-2 bg-purple-500/10 rounded">
                      <p className="text-purple-400 font-bold">{device.avgCost}</p>
                      <p className="text-slate-500 text-xs">متوسط التكلفة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Custom Report Dialog */}
      <Dialog open={showCustomReportDialog} onOpenChange={setShowCustomReportDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              إنشاء تقرير مخصص
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={customReportConfig.includeCharts} 
                  onCheckedChange={(c) => setCustomReportConfig({...customReportConfig, includeCharts: c})}
                />
                <Label className="text-slate-300">تضمين الرسوم البيانية</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={customReportConfig.includeTechnicians} 
                  onCheckedChange={(c) => setCustomReportConfig({...customReportConfig, includeTechnicians: c})}
                />
                <Label className="text-slate-300">تضمين أداء الفنيين</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={customReportConfig.includeCosts} 
                  onCheckedChange={(c) => setCustomReportConfig({...customReportConfig, includeCosts: c})}
                />
                <Label className="text-slate-300">تضمين تحليل التكاليف</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={customReportConfig.includeAIInsights} 
                  onCheckedChange={(c) => setCustomReportConfig({...customReportConfig, includeAIInsights: c})}
                />
                <Label className="text-slate-300">تضمين رؤى AI</Label>
              </div>
            </div>

            <div>
              <Label className="text-slate-300">صيغة التصدير</Label>
              <Select value={customReportConfig.format} onValueChange={(v) => setCustomReportConfig({...customReportConfig, format: v})}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={generateCustomReport}>
              <Download className="w-4 h-4 ml-2" />
              إنشاء التقرير
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Insights Dialog */}
      <Dialog open={showAIInsightsDialog} onOpenChange={setShowAIInsightsDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              رؤى AI للصيانة
            </DialogTitle>
          </DialogHeader>
          
          {aiInsights && (
            <div className="space-y-6 mt-4">
              {/* Overall Score */}
              <div className="text-center p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <p className="text-slate-400 text-sm mb-2">التقييم العام</p>
                <p className="text-5xl font-bold text-purple-400">{aiInsights.overallScore || 75}/100</p>
              </div>

              {/* Executive Summary */}
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="text-cyan-400 font-medium mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  ملخص تنفيذي
                </h4>
                <p className="text-slate-300 text-sm">{aiInsights.executiveSummary}</p>
              </div>

              {/* Performance Indicators */}
              {aiInsights.performanceIndicators?.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3">مؤشرات الأداء</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {aiInsights.performanceIndicators.map((ind, i) => (
                      <div key={i} className={`p-3 rounded-lg ${
                        ind.status === 'good' ? 'bg-green-500/10 border border-green-500/30' :
                        ind.status === 'warning' ? 'bg-amber-500/10 border border-amber-500/30' :
                        'bg-red-500/10 border border-red-500/30'
                      }`}>
                        <p className="text-slate-400 text-xs">{ind.name}</p>
                        <p className={`text-lg font-bold ${
                          ind.status === 'good' ? 'text-green-400' :
                          ind.status === 'warning' ? 'text-amber-400' : 'text-red-400'
                        }`}>{ind.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-4">
                {aiInsights.strengths?.length > 0 && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <h4 className="text-green-400 font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      نقاط القوة
                    </h4>
                    <ul className="space-y-1">
                      {aiInsights.strengths.map((s, i) => (
                        <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                          <span className="text-green-400">✓</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {aiInsights.weaknesses?.length > 0 && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <h4 className="text-red-400 font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      نقاط الضعف
                    </h4>
                    <ul className="space-y-1">
                      {aiInsights.weaknesses.map((w, i) => (
                        <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                          <span className="text-red-400">!</span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {aiInsights.recommendations?.length > 0 && (
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                  <h4 className="text-cyan-400 font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    التوصيات
                  </h4>
                  <ul className="space-y-2">
                    {aiInsights.recommendations.map((r, i) => (
                      <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">{i + 1}.</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cost Saving Opportunities */}
              {aiInsights.costSavingOpportunities?.length > 0 && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <h4 className="text-green-400 font-medium mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    فرص التوفير
                  </h4>
                  <div className="space-y-2">
                    {aiInsights.costSavingOpportunities.map((opp, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                        <span className="text-slate-300 text-sm">{opp.opportunity}</span>
                        <Badge className="bg-green-500/20 text-green-400">{opp.potentialSaving}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}