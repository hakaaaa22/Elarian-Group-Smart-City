import React, { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/components/LanguageProvider';
import {
  FileText, Download, Filter, Calendar, RefreshCw, TrendingUp,
  Truck, Package, Camera, Cpu, Brain, Activity, CheckCircle,
  AlertTriangle, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon,
  Printer, Mail, Clock, Zap, Wand2, Layers
} from 'lucide-react';
import AdvancedReportBuilder from '@/components/reports/AdvancedReportBuilder';
import AssetPerformanceReports from '@/components/reports/AssetPerformanceReports';
import UnitComparisonReports from '@/components/reports/UnitComparisonReports';
import AlertsReports from '@/components/reports/AlertsReports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import AdvancedAIMetrics from '@/components/reports/AdvancedAIMetrics';
import FleetMetricsDashboard from '@/components/reports/FleetMetricsDashboard';
import ReportScheduler from '@/components/reports/ReportScheduler';
import ThreeDVisualization from '@/components/reports/ThreeDVisualization';

const COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#6366f1'];

// Sample data
const wasteCollectionData = [
  { month: 'يناير', collected: 1200, target: 1100, efficiency: 92 },
  { month: 'فبراير', collected: 1350, target: 1200, efficiency: 94 },
  { month: 'مارس', collected: 1180, target: 1150, efficiency: 89 },
  { month: 'أبريل', collected: 1420, target: 1300, efficiency: 96 },
  { month: 'مايو', collected: 1380, target: 1350, efficiency: 93 },
  { month: 'يونيو', collected: 1500, target: 1400, efficiency: 95 },
];

const deviceStatusData = [
  { name: 'نشط', value: 85, color: '#22c55e' },
  { name: 'صيانة', value: 8, color: '#f59e0b' },
  { name: 'معطل', value: 5, color: '#ef4444' },
  { name: 'غير متصل', value: 2, color: '#64748b' },
];

const aiModelPerformance = [
  { model: 'كشف الشذوذ', accuracy: 94.5, requests: 15420 },
  { model: 'التعرف على الوجه', accuracy: 97.2, requests: 8930 },
  { model: 'تحليل المرور', accuracy: 91.8, requests: 12340 },
  { model: 'الصيانة التنبؤية', accuracy: 89.5, requests: 5670 },
];

const systemHealthHistory = [
  { time: '00:00', cpu: 45, memory: 62, network: 78 },
  { time: '04:00', cpu: 32, memory: 58, network: 65 },
  { time: '08:00', cpu: 78, memory: 75, network: 85 },
  { time: '12:00', cpu: 85, memory: 82, network: 92 },
  { time: '16:00', cpu: 72, memory: 78, network: 88 },
  { time: '20:00', cpu: 58, memory: 68, network: 75 },
];

export default function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [customizing, setCustomizing] = useState(false);
  const [visibleCharts, setVisibleCharts] = useState({
    wasteCollection: true,
    deviceStatus: true,
    aiPerformance: true,
    systemHealth: true
  });
  const reportRef = useRef(null);
  const { isRTL } = useLanguage();

  const { data: maintenanceRecords = [] } = useQuery({
    queryKey: ['maintenanceRecords'],
    queryFn: () => base44.entities.MaintenanceRecord.list('-created_date', 100)
  });

  const { data: deviceAlerts = [] } = useQuery({
    queryKey: ['deviceAlerts'],
    queryFn: () => base44.entities.DeviceAlert.list('-created_date', 50)
  });

  const { data: cameraAnomalies = [] } = useQuery({
    queryKey: ['cameraAnomalies'],
    queryFn: () => base44.entities.CameraAnomaly.list('-created_date', 50)
  });

  const exportToPDF = async () => {
    if (!reportRef.current) return;
    
    toast.loading('جاري إنشاء PDF...');
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0a0e1a'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.dismiss();
      toast.success('تم تصدير التقرير بنجاح');
    } catch (error) {
      toast.dismiss();
      toast.error('فشل في تصدير التقرير');
    }
  };

  const exportToCSV = () => {
    const csvData = [
      ['الشهر', 'الجمع', 'الهدف', 'الكفاءة'],
      ...wasteCollectionData.map(d => [d.month, d.collected, d.target, d.efficiency])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success('تم تصدير البيانات بنجاح');
  };

  // Calculate stats
  const stats = useMemo(() => ({
    totalCollected: wasteCollectionData.reduce((s, d) => s + d.collected, 0),
    avgEfficiency: Math.round(wasteCollectionData.reduce((s, d) => s + d.efficiency, 0) / wasteCollectionData.length),
    activeDevices: deviceStatusData.find(d => d.name === 'نشط')?.value || 0,
    totalAlerts: deviceAlerts.length,
    resolvedAlerts: deviceAlerts.filter(a => a.status === 'resolved').length,
    avgAIAccuracy: Math.round(aiModelPerformance.reduce((s, m) => s + m.accuracy, 0) / aiModelPerformance.length * 10) / 10,
    cameraAnomaliesCount: cameraAnomalies.filter(a => a.status === 'new').length,
    predictiveAlerts: deviceAlerts.filter(a => a.alert_type === 'predictive_failure').length
  }), [deviceAlerts, cameraAnomalies]);

  const toggleChart = (chartKey) => {
    setVisibleCharts(prev => ({ ...prev, [chartKey]: !prev[chartKey] }));
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] p-4 md:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-cyan-400" />
              لوحة التقارير الشاملة
            </h1>
            <p className="text-slate-400 mt-1">تقارير وإحصائيات النظام</p>
          </div>
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">أسبوع</SelectItem>
                <SelectItem value="month">شهر</SelectItem>
                <SelectItem value="quarter">ربع سنة</SelectItem>
                <SelectItem value="year">سنة</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant={customizing ? "default" : "outline"} 
              className={customizing ? "bg-purple-600 hover:bg-purple-700" : "border-purple-500 text-purple-400"}
              onClick={() => setCustomizing(!customizing)}
            >
              <Filter className="w-4 h-4 ml-2" />
              تخصيص
            </Button>
            <Button variant="outline" className="border-green-500 text-green-400" onClick={exportToCSV}>
              <Download className="w-4 h-4 ml-2" />
              CSV
            </Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={exportToPDF}>
              <FileText className="w-4 h-4 ml-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Customization Panel */}
        {customizing && (
          <Card className="glass-card border-purple-500/30 bg-purple-500/5 mb-4">
            <CardContent className="p-4">
              <p className="text-white font-medium mb-3">تخصيص عرض الرسوم البيانية</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'wasteCollection', label: 'جمع النفايات' },
                  { key: 'deviceStatus', label: 'حالة الأجهزة' },
                  { key: 'aiPerformance', label: 'أداء AI' },
                  { key: 'systemHealth', label: 'صحة النظام' },
                ].map(chart => (
                  <Button
                    key={chart.key}
                    size="sm"
                    variant={visibleCharts[chart.key] ? "default" : "outline"}
                    className={visibleCharts[chart.key] ? "bg-purple-600" : "border-slate-600"}
                    onClick={() => toggleChart(chart.key)}
                  >
                    {chart.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <Card className="bg-cyan-500/10 border-cyan-500/30">
            <CardContent className="p-4 text-center">
              <Package className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{stats.totalCollected.toLocaleString()}</p>
              <p className="text-cyan-400 text-xs">طن نفايات</p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{stats.avgEfficiency}%</p>
              <p className="text-green-400 text-xs">كفاءة الجمع</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <Cpu className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{stats.activeDevices}%</p>
              <p className="text-purple-400 text-xs">أجهزة نشطة</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{stats.totalAlerts}</p>
              <p className="text-amber-400 text-xs">تنبيهات</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{stats.resolvedAlerts}</p>
              <p className="text-blue-400 text-xs">تم الحل</p>
            </CardContent>
          </Card>
          <Card className="bg-pink-500/10 border-pink-500/30">
            <CardContent className="p-4 text-center">
              <Brain className="w-6 h-6 text-pink-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{stats.avgAIAccuracy}%</p>
              <p className="text-pink-400 text-xs">دقة AI</p>
            </CardContent>
          </Card>
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{stats.predictiveAlerts}</p>
              <p className="text-red-400 text-xs">صيانة تنبؤية</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <Camera className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{stats.cameraAnomaliesCount}</p>
              <p className="text-purple-400 text-xs">شذوذ كاميرات</p>
            </CardContent>
          </Card>
        </div>

        <div ref={reportRef}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 border border-slate-700">
              <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20">
                <BarChart3 className="w-4 h-4 ml-1" />
                نظرة عامة
              </TabsTrigger>
              <TabsTrigger value="waste" className="data-[state=active]:bg-green-500/20">
                <Package className="w-4 h-4 ml-1" />
                النفايات
              </TabsTrigger>
              <TabsTrigger value="devices" className="data-[state=active]:bg-purple-500/20">
                <Cpu className="w-4 h-4 ml-1" />
                الأجهزة
              </TabsTrigger>
              <TabsTrigger value="ai" className="data-[state=active]:bg-pink-500/20">
                <Brain className="w-4 h-4 ml-1" />
                الذكاء الاصطناعي
              </TabsTrigger>
              <TabsTrigger value="system" className="data-[state=active]:bg-amber-500/20">
                <Activity className="w-4 h-4 ml-1" />
                صحة النظام
              </TabsTrigger>
              <TabsTrigger value="ai-advanced" className="data-[state=active]:bg-purple-500/20">
                <Brain className="w-4 h-4 ml-1" />
                تحليل AI متقدم
              </TabsTrigger>
              <TabsTrigger value="fleet-metrics" className="data-[state=active]:bg-cyan-500/20">
                <Truck className="w-4 h-4 ml-1" />
                مقاييس الأسطول
              </TabsTrigger>
              <TabsTrigger value="scheduler" className="data-[state=active]:bg-green-500/20">
                <Calendar className="w-4 h-4 ml-1" />
                جدولة التقارير
              </TabsTrigger>
              <TabsTrigger value="builder" className="data-[state=active]:bg-purple-500/20">
                <Wand2 className="w-4 h-4 ml-1" />
                منشئ التقارير
              </TabsTrigger>
              <TabsTrigger value="3d" className="data-[state=active]:bg-pink-500/20">
                <Layers className="w-4 h-4 ml-1" />
                تصورات 3D
              </TabsTrigger>
              <TabsTrigger value="asset-performance" className="data-[state=active]:bg-blue-500/20">
                <TrendingUp className="w-4 h-4 ml-1" />
                أداء الأصول
              </TabsTrigger>
              <TabsTrigger value="unit-comparison" className="data-[state=active]:bg-orange-500/20">
                <BarChart3 className="w-4 h-4 ml-1" />
                مقارنة الوحدات
              </TabsTrigger>
              <TabsTrigger value="alerts-reports" className="data-[state=active]:bg-red-500/20">
                <AlertTriangle className="w-4 h-4 ml-1" />
                تقارير التنبيهات
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-4">
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Waste Collection Trend */}
                {visibleCharts.wasteCollection && (
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      اتجاه جمع النفايات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={wasteCollectionData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} />
                          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                          <Area type="monotone" dataKey="collected" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="الجمع" />
                          <Area type="monotone" dataKey="target" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} name="الهدف" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* Device Status */}
                {visibleCharts.deviceStatus && (
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-400" />
                      حالة الأجهزة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={deviceStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {deviceStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* AI Model Performance */}
                {visibleCharts.aiPerformance && (
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Brain className="w-4 h-4 text-pink-400" />
                      أداء نماذج AI
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={aiModelPerformance} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                          <YAxis dataKey="model" type="category" stroke="#94a3b8" fontSize={10} width={100} />
                          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                          <Bar dataKey="accuracy" fill="#a855f7" name="الدقة %" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* System Health */}
                {visibleCharts.systemHealth && (
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      صحة النظام
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={systemHealthHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} />
                          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                          <Legend />
                          <Line type="monotone" dataKey="cpu" stroke="#22d3ee" name="CPU" strokeWidth={2} />
                          <Line type="monotone" dataKey="memory" stroke="#a855f7" name="الذاكرة" strokeWidth={2} />
                          <Line type="monotone" dataKey="network" stroke="#22c55e" name="الشبكة" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                )}
              </div>
            </TabsContent>

            {/* Waste Collection Tab */}
            <TabsContent value="waste" className="mt-4">
              <div className="grid lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2 glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">كفاءة الجمع الشهرية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={wasteCollectionData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="month" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                          <Legend />
                          <Bar dataKey="collected" fill="#22c55e" name="تم الجمع (طن)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="target" fill="#6366f1" name="الهدف (طن)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">ملخص الأداء</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {wasteCollectionData.slice(-3).map((data, i) => (
                      <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="text-white">{data.month}</span>
                          <Badge className={data.efficiency >= 95 ? 'bg-green-500/20 text-green-400' : data.efficiency >= 90 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}>
                            {data.efficiency}%
                          </Badge>
                        </div>
                        <Progress value={data.efficiency} className="h-2" />
                        <p className="text-slate-500 text-xs mt-1">{data.collected} / {data.target} طن</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Devices Tab */}
            <TabsContent value="devices" className="mt-4">
              <div className="grid lg:grid-cols-2 gap-4">
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">توزيع حالة الأجهزة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie data={deviceStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                            {deviceStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">تفاصيل الحالة</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {deviceStatusData.map((status, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                          <span className="text-white">{status.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{status.value}%</span>
                          <span className="text-slate-500 text-sm">({Math.round(status.value * 2.25)} جهاز)</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI Tab */}
            <TabsContent value="ai" className="mt-4">
              <div className="grid lg:grid-cols-2 gap-4">
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">دقة النماذج</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={aiModelPerformance}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="model" stroke="#94a3b8" fontSize={10} />
                          <YAxis domain={[80, 100]} stroke="#94a3b8" />
                          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                          <Bar dataKey="accuracy" fill="#a855f7" name="الدقة %" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">إحصائيات الطلبات</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {aiModelPerformance.map((model, i) => (
                      <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="text-white">{model.model}</span>
                          <Badge className="bg-purple-500/20 text-purple-400">{model.accuracy}%</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">الطلبات</span>
                          <span className="text-cyan-400">{model.requests.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* System Health Tab */}
            <TabsContent value="system" className="mt-4">
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">مؤشرات الأداء على مدار اليوم</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={systemHealthHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                        <Legend />
                        <Area type="monotone" dataKey="cpu" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} name="CPU %" />
                        <Area type="monotone" dataKey="memory" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} name="الذاكرة %" />
                        <Area type="monotone" dataKey="network" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="الشبكة %" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced AI Metrics Tab */}
            <TabsContent value="ai-advanced" className="mt-4">
              <AdvancedAIMetrics />
            </TabsContent>

            {/* Fleet Metrics Tab */}
            <TabsContent value="fleet-metrics" className="mt-4">
              <FleetMetricsDashboard />
            </TabsContent>

            {/* Report Scheduler Tab */}
            <TabsContent value="scheduler" className="mt-4">
              <ReportScheduler />
            </TabsContent>

            {/* Advanced Report Builder Tab */}
            <TabsContent value="builder" className="mt-4">
              <AdvancedReportBuilder />
            </TabsContent>

            {/* 3D Visualizations Tab */}
            <TabsContent value="3d" className="mt-4">
              <ThreeDVisualization />
            </TabsContent>

            {/* Asset Performance Reports Tab */}
            <TabsContent value="asset-performance" className="mt-4">
              <AssetPerformanceReports />
            </TabsContent>

            {/* Unit Comparison Reports Tab */}
            <TabsContent value="unit-comparison" className="mt-4">
              <UnitComparisonReports />
            </TabsContent>

            {/* Alerts Reports Tab */}
            <TabsContent value="alerts-reports" className="mt-4">
              <AlertsReports />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}