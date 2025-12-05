import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  FileText, Plus, Settings, Download, Calendar, Clock, Mail, Filter,
  BarChart3, PieChart, LineChart, Table, Save, Trash2, Edit, Eye,
  Play, Pause, Copy, Share2, Loader2, Check, X, ChevronRight, Sparkles,
  Database, Columns, SortAsc, ArrowRight, Zap, Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Data Sources
const dataSources = [
  { id: 'fleet', name: 'الأسطول', icon: '🚗', tables: ['Vehicle', 'Driver', 'FuelLog', 'MaintenanceRecord'] },
  { id: 'visitors', name: 'الزوار', icon: '👥', tables: ['Visitor', 'VisitorPermit', 'VisitorFeedback'] },
  { id: 'incidents', name: 'الحوادث', icon: '⚠️', tables: ['Incident', 'CameraAnomaly'] },
  { id: 'devices', name: 'الأجهزة', icon: '📡', tables: ['Camera', 'Drone', 'Tower'] },
  { id: 'maintenance', name: 'الصيانة', icon: '🔧', tables: ['WorkOrder', 'Inspection', 'Asset'] },
  { id: 'users', name: 'المستخدمين', icon: '👤', tables: ['User', 'Role', 'AuditLog'] },
];

// Visualization Types
const visualTypes = [
  { id: 'table', name: 'جدول', icon: Table },
  { id: 'bar', name: 'أعمدة', icon: BarChart3 },
  { id: 'line', name: 'خطي', icon: LineChart },
  { id: 'pie', name: 'دائري', icon: PieChart },
];

// Export Formats
const exportFormats = [
  { id: 'pdf', name: 'PDF', icon: '📄' },
  { id: 'csv', name: 'CSV', icon: '📊' },
  { id: 'excel', name: 'Excel', icon: '📑' },
  { id: 'json', name: 'JSON', icon: '{ }' },
];

// Schedule Options
const scheduleOptions = [
  { id: 'daily', name: 'يومي' },
  { id: 'weekly', name: 'أسبوعي' },
  { id: 'monthly', name: 'شهري' },
  { id: 'quarterly', name: 'ربع سنوي' },
];

export default function AdvancedReportBuilder() {
  const [activeTab, setActiveTab] = useState('builder');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState(null);
  const [selectedTables, setSelectedTables] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [filters, setFilters] = useState([]);
  const [visualization, setVisualization] = useState('table');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  
  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    dataSource: '',
    tables: [],
    columns: [],
    filters: [],
    groupBy: '',
    orderBy: '',
    visualization: 'table',
    schedule: null,
    recipients: [],
    exportFormats: ['pdf'],
  });

  const queryClient = useQueryClient();

  const { data: savedReports = [] } = useQuery({
    queryKey: ['scheduled-reports'],
    queryFn: () => base44.entities.ScheduledReport.list('-created_date', 20),
  });

  // Generate Report with AI
  const generateReportMutation = useMutation({
    mutationFn: async (config) => {
      setIsGenerating(true);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بإنشاء تقرير بناءً على الإعدادات التالية:
        
اسم التقرير: ${config.name}
الوصف: ${config.description}
مصدر البيانات: ${config.dataSource}
الجداول: ${config.tables.join(', ')}
نوع العرض: ${config.visualization}

أنشئ تقريراً شاملاً يتضمن:
1. ملخص تنفيذي
2. المقاييس الرئيسية (5-8 مقاييس)
3. التحليل التفصيلي
4. الاتجاهات
5. التوصيات`,
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
                  change: { type: "string" },
                  trend: { type: "string" }
                }
              }
            },
            analysis: { type: "string" },
            trends: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            data_table: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: true
              }
            }
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

  // Save Report Schedule
  const saveReportMutation = useMutation({
    mutationFn: async (config) => {
      return await base44.entities.ScheduledReport.create({
        name: config.name,
        description: config.description,
        report_type: config.dataSource,
        data_sources: config.tables,
        filters: config.filters,
        visualization_type: config.visualization,
        schedule: config.schedule,
        recipients: config.recipients,
        export_format: config.exportFormats[0],
        is_active: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('تم حفظ التقرير المجدول');
      setShowCreateDialog(false);
      resetConfig();
    },
  });

  const resetConfig = () => {
    setReportConfig({
      name: '',
      description: '',
      dataSource: '',
      tables: [],
      columns: [],
      filters: [],
      groupBy: '',
      orderBy: '',
      visualization: 'table',
      schedule: null,
      recipients: [],
      exportFormats: ['pdf'],
    });
    setSelectedDataSource(null);
    setSelectedTables([]);
    setGeneratedReport(null);
  };

  const addFilter = () => {
    setFilters([...filters, { field: '', operator: 'equals', value: '' }]);
  };

  const exportReport = (format) => {
    toast.success(`جاري تصدير التقرير بصيغة ${format}...`);
  };

  const exportBulk = () => {
    toast.success('جاري تصدير التقارير المحددة...');
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <FileText className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">منشئ التقارير المتقدم</h3>
            <p className="text-slate-400 text-sm">إنشاء تقارير مخصصة وجدولتها وتصديرها</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-600" onClick={exportBulk}>
            <Download className="w-4 h-4 ml-2" />
            تصدير مجمع
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 ml-2" />
            تقرير جديد
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="builder" className="data-[state=active]:bg-blue-500/20">
            <Settings className="w-4 h-4 ml-1" />
            منشئ التقارير
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="data-[state=active]:bg-green-500/20">
            <Calendar className="w-4 h-4 ml-1" />
            التقارير المجدولة
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-purple-500/20">
            <Copy className="w-4 h-4 ml-1" />
            القوالب
          </TabsTrigger>
        </TabsList>

        {/* Builder Tab */}
        <TabsContent value="builder" className="mt-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Data Source Selection */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  مصادر البيانات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dataSources.map(ds => (
                    <div
                      key={ds.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedDataSource?.id === ds.id
                          ? 'bg-cyan-500/20 border border-cyan-500/30'
                          : 'bg-slate-900/50 hover:bg-slate-800/50'
                      }`}
                      onClick={() => {
                        setSelectedDataSource(ds);
                        setReportConfig(prev => ({ ...prev, dataSource: ds.id }));
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{ds.icon}</span>
                        <div>
                          <p className="text-white font-medium">{ds.name}</p>
                          <p className="text-slate-400 text-xs">{ds.tables.length} جداول</p>
                        </div>
                        {selectedDataSource?.id === ds.id && (
                          <Check className="w-4 h-4 text-cyan-400 mr-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tables & Columns */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Columns className="w-4 h-4 text-purple-400" />
                  الجداول والأعمدة
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDataSource ? (
                  <div className="space-y-2">
                    {selectedDataSource.tables.map(table => (
                      <div
                        key={table}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedTables.includes(table)
                            ? 'bg-purple-500/20 border border-purple-500/30'
                            : 'bg-slate-900/50 hover:bg-slate-800/50'
                        }`}
                        onClick={() => {
                          setSelectedTables(prev => 
                            prev.includes(table) 
                              ? prev.filter(t => t !== table)
                              : [...prev, table]
                          );
                          setReportConfig(prev => ({
                            ...prev,
                            tables: prev.tables.includes(table)
                              ? prev.tables.filter(t => t !== table)
                              : [...prev.tables, table]
                          }));
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox checked={selectedTables.includes(table)} />
                          <span className="text-white">{table}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    اختر مصدر بيانات أولاً
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Visualization & Filters */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-green-400" />
                  العرض والفلاتر
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300 text-sm mb-2 block">نوع العرض</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {visualTypes.map(vt => {
                      const Icon = vt.icon;
                      return (
                        <div
                          key={vt.id}
                          className={`p-3 rounded-lg cursor-pointer text-center transition-all ${
                            visualization === vt.id
                              ? 'bg-green-500/20 border border-green-500/30'
                              : 'bg-slate-900/50 hover:bg-slate-800/50'
                          }`}
                          onClick={() => {
                            setVisualization(vt.id);
                            setReportConfig(prev => ({ ...prev, visualization: vt.id }));
                          }}
                        >
                          <Icon className={`w-5 h-5 mx-auto mb-1 ${visualization === vt.id ? 'text-green-400' : 'text-slate-400'}`} />
                          <span className="text-xs text-white">{vt.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-slate-300 text-sm">الفلاتر</Label>
                    <Button size="sm" variant="ghost" className="h-7 text-cyan-400" onClick={addFilter}>
                      <Plus className="w-3 h-3 ml-1" />
                      إضافة
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {filters.map((filter, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          placeholder="الحقل"
                          value={filter.field}
                          onChange={(e) => {
                            const newFilters = [...filters];
                            newFilters[i].field = e.target.value;
                            setFilters(newFilters);
                          }}
                          className="bg-slate-900/50 border-slate-700 text-white h-8 text-sm"
                        />
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-red-400"
                          onClick={() => setFilters(filters.filter((_, idx) => idx !== i))}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                  onClick={() => generateReportMutation.mutate(reportConfig)}
                  disabled={!selectedDataSource || selectedTables.length === 0 || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 ml-2" />
                      إنشاء التقرير
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Generated Report Preview */}
          {generatedReport && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm">معاينة التقرير</CardTitle>
                    <div className="flex gap-2">
                      {exportFormats.map(fmt => (
                        <Button
                          key={fmt.id}
                          size="sm"
                          variant="outline"
                          className="border-slate-600 h-8"
                          onClick={() => exportReport(fmt.id)}
                        >
                          <span className="ml-1">{fmt.icon}</span>
                          {fmt.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Executive Summary */}
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h4 className="text-blue-400 font-medium mb-2">الملخص التنفيذي</h4>
                    <p className="text-slate-300 text-sm">{generatedReport.executive_summary}</p>
                  </div>

                  {/* Metrics */}
                  {generatedReport.metrics?.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {generatedReport.metrics.map((metric, i) => (
                        <div key={i} className="p-3 bg-slate-900/50 rounded-lg text-center">
                          <p className="text-slate-400 text-xs">{metric.name}</p>
                          <p className="text-white text-xl font-bold">{metric.value}</p>
                          <p className={`text-xs ${metric.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                            {metric.change}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendations */}
                  {generatedReport.recommendations?.length > 0 && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <h4 className="text-green-400 font-medium mb-2">التوصيات</h4>
                      <ul className="space-y-1">
                        {generatedReport.recommendations.map((rec, i) => (
                          <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
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
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="scheduled" className="mt-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4">
              {savedReports.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>لا توجد تقارير مجدولة</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedReports.map((report, i) => (
                    <div key={report.id || i} className="p-4 bg-slate-900/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{report.name}</p>
                          <p className="text-slate-400 text-sm">{report.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge className="bg-purple-500/20 text-purple-400">{report.schedule}</Badge>
                            <Badge className="bg-cyan-500/20 text-cyan-400">{report.export_format}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-slate-600 h-8">
                            <Play className="w-3 h-3 ml-1" />
                            تشغيل
                          </Button>
                          <Button size="sm" variant="outline" className="border-slate-600 h-8">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 text-red-400">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'تقرير الأسطول الشهري', desc: 'ملخص شامل لأداء الأسطول', icon: '🚗' },
              { name: 'تقرير الزوار الأسبوعي', desc: 'إحصائيات الزوار والتصاريح', icon: '👥' },
              { name: 'تقرير الصيانة', desc: 'حالة أوامر العمل والمعدات', icon: '🔧' },
              { name: 'تقرير الأمان', desc: 'الحوادث والتنبيهات الأمنية', icon: '🛡️' },
              { name: 'التقرير المالي', desc: 'التكاليف والميزانية', icon: '💰' },
              { name: 'تقرير الأداء', desc: 'KPIs ومؤشرات الأداء', icon: '📊' },
            ].map((template, i) => (
              <Card key={i} className="bg-slate-800/30 border-slate-700/50 hover:border-purple-500/30 transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="text-3xl mb-3">{template.icon}</div>
                  <h4 className="text-white font-medium mb-1">{template.name}</h4>
                  <p className="text-slate-400 text-sm mb-3">{template.desc}</p>
                  <Button size="sm" variant="outline" className="w-full border-purple-500/50 text-purple-400">
                    استخدام القالب
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Report Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              إنشاء تقرير مجدول جديد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-sm mb-2 block">اسم التقرير</Label>
                <Input
                  value={reportConfig.name}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-800/50 border-slate-700 text-white"
                  placeholder="أدخل اسم التقرير"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm mb-2 block">الجدولة</Label>
                <Select
                  value={reportConfig.schedule || ''}
                  onValueChange={(v) => setReportConfig(prev => ({ ...prev, schedule: v }))}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="اختر الجدولة" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {scheduleOptions.map(opt => (
                      <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm mb-2 block">الوصف</Label>
              <Textarea
                value={reportConfig.description}
                onChange={(e) => setReportConfig(prev => ({ ...prev, description: e.target.value }))}
                className="bg-slate-800/50 border-slate-700 text-white"
                placeholder="وصف التقرير"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm mb-2 block">المستلمون (البريد الإلكتروني)</Label>
              <Input
                value={reportConfig.recipients.join(', ')}
                onChange={(e) => setReportConfig(prev => ({ ...prev, recipients: e.target.value.split(',').map(s => s.trim()) }))}
                className="bg-slate-800/50 border-slate-700 text-white"
                placeholder="email1@example.com, email2@example.com"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm mb-2 block">صيغة التصدير</Label>
              <div className="flex gap-2">
                {exportFormats.map(fmt => (
                  <Badge
                    key={fmt.id}
                    className={`cursor-pointer ${
                      reportConfig.exportFormats.includes(fmt.id)
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                    onClick={() => {
                      setReportConfig(prev => ({
                        ...prev,
                        exportFormats: prev.exportFormats.includes(fmt.id)
                          ? prev.exportFormats.filter(f => f !== fmt.id)
                          : [...prev.exportFormats, fmt.id]
                      }));
                    }}
                  >
                    {fmt.icon} {fmt.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-slate-700">
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => saveReportMutation.mutate(reportConfig)}
                disabled={!reportConfig.name || !reportConfig.schedule}
              >
                <Save className="w-4 h-4 ml-2" />
                حفظ التقرير المجدول
              </Button>
              <Button variant="outline" className="border-slate-600" onClick={() => setShowCreateDialog(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}