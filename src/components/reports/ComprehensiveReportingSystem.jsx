import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Car, MapPin, Brain, Users, Building2, Cpu, DollarSign,
  Shield, Leaf, BarChart3, Download, Search, Filter, Calendar,
  ChevronRight, Eye, Star, Clock, Zap, Settings, Plus, Loader2,
  TrendingUp, AlertTriangle, CheckCircle, Sparkles, Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

// Report Categories with full report lists
const reportCategories = {
  fleet: {
    icon: Car,
    color: 'cyan',
    label: 'Fleet Management',
    labelAr: 'إدارة الأسطول',
    count: 120,
    subcategories: {
      utilization: { label: 'Utilization & Operations', count: 40 },
      maintenance: { label: 'Maintenance & Breakdown', count: 40 },
      fuel: { label: 'Fuel, Cost & Efficiency', count: 40 }
    }
  },
  gps: {
    icon: MapPin,
    color: 'green',
    label: 'GPS & Telematics',
    labelAr: 'تتبع GPS والقياس عن بعد',
    count: 80,
    subcategories: {
      tracking: { label: 'Tracking & Location', count: 40 },
      devices: { label: 'Device Health', count: 40 }
    }
  },
  ai: {
    icon: Brain,
    color: 'purple',
    label: 'AI Predictive & Analytics',
    labelAr: 'الذكاء الاصطناعي التنبؤي',
    count: 70,
    subcategories: {
      predictive: { label: 'Predictive Analytics', count: 35 },
      detection: { label: 'AI Detection', count: 35 }
    }
  },
  driver: {
    icon: Users,
    color: 'amber',
    label: 'Driver Behavior & Compliance',
    labelAr: 'سلوك السائق والامتثال',
    count: 40,
    subcategories: {
      behavior: { label: 'Behavior Analysis', count: 20 },
      safety: { label: 'Safety & Compliance', count: 20 }
    }
  },
  smartcity: {
    icon: Building2,
    color: 'blue',
    label: 'Smart City & Municipal',
    labelAr: 'المدينة الذكية والبلدية',
    count: 110,
    subcategories: {
      mobility: { label: 'Smart Mobility', count: 30 },
      safety: { label: 'Safety & Surveillance', count: 25 },
      environment: { label: 'Environment', count: 20 },
      infrastructure: { label: 'Infrastructure', count: 20 },
      governance: { label: 'Governance', count: 15 }
    }
  },
  iot: {
    icon: Cpu,
    color: 'pink',
    label: 'IoT Sensor & Infrastructure',
    labelAr: 'أجهزة الاستشعار IoT',
    count: 40,
    subcategories: {
      sensors: { label: 'Sensor Health', count: 20 },
      infrastructure: { label: 'Infrastructure', count: 20 }
    }
  },
  financial: {
    icon: DollarSign,
    color: 'emerald',
    label: 'Financial & Executive',
    labelAr: 'المالية والتنفيذية',
    count: 40,
    subcategories: {
      executive: { label: 'Executive Reports', count: 20 },
      financial: { label: 'Financial Analysis', count: 20 }
    }
  },
  compliance: {
    icon: Shield,
    color: 'red',
    label: 'Compliance & Safety',
    labelAr: 'الامتثال والسلامة',
    count: 20,
    subcategories: {
      compliance: { label: 'Regulatory Compliance', count: 10 },
      safety: { label: 'Safety Reports', count: 10 }
    }
  }
};

// Sample reports for each category
const sampleReports = {
  fleet: [
    { id: 'F001', name: 'Fleet Utilization Summary', nameAr: 'ملخص استخدام الأسطول', type: 'utilization', priority: 'high' },
    { id: 'F002', name: 'Vehicle Availability Report', nameAr: 'تقرير توفر المركبات', type: 'utilization', priority: 'high' },
    { id: 'F003', name: 'Daily Trips Summary', nameAr: 'ملخص الرحلات اليومية', type: 'utilization', priority: 'medium' },
    { id: 'F004', name: 'Preventive Maintenance Schedule', nameAr: 'جدول الصيانة الوقائية', type: 'maintenance', priority: 'critical' },
    { id: 'F005', name: 'AI Predictive Maintenance', nameAr: 'الصيانة التنبؤية AI', type: 'maintenance', priority: 'critical' },
    { id: 'F006', name: 'Fuel Consumption Summary', nameAr: 'ملخص استهلاك الوقود', type: 'fuel', priority: 'high' },
    { id: 'F007', name: 'Cost per KM Report', nameAr: 'تكلفة الكيلومتر', type: 'fuel', priority: 'high' },
    { id: 'F008', name: 'Carbon Emissions Report', nameAr: 'تقرير انبعاثات الكربون', type: 'fuel', priority: 'medium' },
  ],
  ai: [
    { id: 'AI001', name: 'AI Predictive Maintenance Probability', nameAr: 'احتمالية الصيانة التنبؤية', type: 'predictive', priority: 'critical' },
    { id: 'AI002', name: 'AI Failure Risk Index', nameAr: 'مؤشر مخاطر الفشل', type: 'predictive', priority: 'critical' },
    { id: 'AI003', name: 'AI Driver Risk Score', nameAr: 'درجة مخاطر السائق', type: 'detection', priority: 'high' },
    { id: 'AI004', name: 'AI Crash Prediction Model', nameAr: 'نموذج التنبؤ بالحوادث', type: 'detection', priority: 'critical' },
    { id: 'AI005', name: 'AI Route Optimization', nameAr: 'تحسين المسار AI', type: 'predictive', priority: 'high' },
  ],
  driver: [
    { id: 'D001', name: 'Driver Performance Summary', nameAr: 'ملخص أداء السائق', type: 'behavior', priority: 'high' },
    { id: 'D002', name: 'Speeding Violation Summary', nameAr: 'ملخص مخالفات السرعة', type: 'behavior', priority: 'high' },
    { id: 'D003', name: 'Driver Safety Scorecard', nameAr: 'بطاقة سلامة السائق', type: 'safety', priority: 'critical' },
    { id: 'D004', name: 'High-Risk Driver List', nameAr: 'قائمة السائقين عالي الخطورة', type: 'safety', priority: 'critical' },
  ],
  smartcity: [
    { id: 'SC001', name: 'City Mobility KPI Dashboard', nameAr: 'لوحة مؤشرات التنقل', type: 'mobility', priority: 'high' },
    { id: 'SC002', name: 'Traffic Congestion Heatmap', nameAr: 'خريطة الازدحام', type: 'mobility', priority: 'high' },
    { id: 'SC003', name: 'Citywide CCTV Health', nameAr: 'صحة كاميرات المدينة', type: 'safety', priority: 'critical' },
    { id: 'SC004', name: 'Air Quality Index', nameAr: 'مؤشر جودة الهواء', type: 'environment', priority: 'high' },
  ]
};

export default function ComprehensiveReportingSystem() {
  const [selectedCategory, setSelectedCategory] = useState('fleet');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const queryClient = useQueryClient();

  const { data: scheduledReports = [] } = useQuery({
    queryKey: ['scheduled-reports'],
    queryFn: () => base44.entities.ScheduledReport.list('-created_date', 20)
  });

  const generateReportMutation = useMutation({
    mutationFn: async (report) => {
      setIsGenerating(true);
      const category = reportCategories[selectedCategory];
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت محلل بيانات متخصص. قم بإنشاء تقرير "${report.name}" (${report.nameAr}) للفئة "${category.labelAr}".

اكتب تقريراً شاملاً يتضمن:
1. ملخص تنفيذي (3-4 جمل)
2. المقاييس الرئيسية (5 مقاييس مع قيم)
3. التحليل التفصيلي
4. الاتجاهات المكتشفة
5. التوصيات (5 توصيات)
6. المخاطر المحتملة
7. خطوات العمل القادمة

استخدم بيانات واقعية ومنطقية.`,
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
                  trend: { type: "string" },
                  status: { type: "string" }
                }
              }
            },
            analysis: { type: "string" },
            trends: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            risks: { type: "array", items: { type: "string" } },
            action_items: { type: "array", items: { type: "string" } }
          }
        }
      });

      setIsGenerating(false);
      return { ...report, ...result, generated_at: new Date().toISOString() };
    },
    onSuccess: (data) => {
      setGeneratedReport(data);
      toast.success('تم إنشاء التقرير بنجاح');
    },
    onError: () => {
      setIsGenerating(false);
      toast.error('حدث خطأ أثناء إنشاء التقرير');
    }
  });

  const currentCategory = reportCategories[selectedCategory];
  const currentReports = sampleReports[selectedCategory] || [];
  
  const filteredReports = currentReports.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.nameAr.includes(searchQuery);
    const matchesPriority = filterPriority === 'all' || r.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const totalReports = Object.values(reportCategories).reduce((sum, cat) => sum + cat.count, 0);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
          >
            <FileText className="w-8 h-8 text-cyan-400" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              نظام التقارير الشامل
              <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
                {totalReports}+ تقرير
              </Badge>
            </h2>
            <p className="text-slate-400 text-sm">Fleet • GPS • AI • Smart City • IoT • Finance • Compliance</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-600">
            <Calendar className="w-4 h-4 ml-2" />
            جدولة
          </Button>
          <Button className="bg-gradient-to-r from-cyan-600 to-purple-600">
            <Download className="w-4 h-4 ml-2" />
            تصدير الكل
          </Button>
        </div>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {Object.entries(reportCategories).map(([key, cat]) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === key;
          return (
            <Card
              key={key}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? `bg-${cat.color}-500/20 border-${cat.color}-500` 
                  : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
              }`}
              onClick={() => setSelectedCategory(key)}
            >
              <CardContent className="p-3 text-center">
                <Icon className={`w-6 h-6 mx-auto mb-1 text-${cat.color}-400`} />
                <p className="text-white text-xs font-medium truncate">{cat.label.split(' ')[0]}</p>
                <Badge className={`mt-1 bg-${cat.color}-500/20 text-${cat.color}-400 text-xs`}>
                  {cat.count}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Subcategories */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <currentCategory.icon className={`w-4 h-4 text-${currentCategory.color}-400`} />
              {currentCategory.labelAr}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(currentCategory.subcategories).map(([key, sub]) => (
              <div
                key={key}
                className="p-3 bg-slate-900/50 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">{sub.label}</span>
                  <Badge variant="outline" className="text-xs">{sub.count}</Badge>
                </div>
              </div>
            ))}
            
            <div className="pt-3 border-t border-slate-700">
              <div className="text-slate-400 text-xs mb-2">إحصائيات الفئة</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">مجدولة</span>
                  <span className="text-cyan-400">{scheduledReports.filter(r => r.report_type === selectedCategory).length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">منشأة هذا الشهر</span>
                  <span className="text-green-400">24</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <Card className="lg:col-span-3 bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="text-white text-sm">التقارير المتاحة</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="بحث..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-8 w-48 h-8 bg-slate-900/50 border-slate-700 text-white text-sm"
                  />
                </div>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-28 h-8 bg-slate-900/50 border-slate-700 text-white text-sm">
                    <SelectValue placeholder="الأولوية" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="critical">حرج</SelectItem>
                    <SelectItem value="high">عالي</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg border bg-slate-900/30 border-slate-700/50 hover:border-${currentCategory.color}-500/50 transition-all cursor-pointer`}
                    onClick={() => { setSelectedReport(report); setShowGenerateDialog(true); }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-${currentCategory.color}-500/20 flex items-center justify-center`}>
                          <FileText className={`w-4 h-4 text-${currentCategory.color}-400`} />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{report.nameAr}</p>
                          <p className="text-slate-500 text-xs">{report.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${
                          report.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                          report.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {report.priority === 'critical' ? 'حرج' : report.priority === 'high' ? 'عالي' : 'متوسط'}
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-7">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Generate Report Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              {selectedReport?.nameAr || 'إنشاء تقرير'}
            </DialogTitle>
          </DialogHeader>
          
          {!generatedReport ? (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="text-white font-medium mb-2">{selectedReport?.name}</h4>
                <p className="text-slate-400 text-sm">سيتم تحليل البيانات وإنشاء تقرير شامل باستخدام الذكاء الاصطناعي.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">الفئة</p>
                  <p className="text-white">{currentCategory.labelAr}</p>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">الأولوية</p>
                  <Badge className={selectedReport?.priority === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}>
                    {selectedReport?.priority === 'critical' ? 'حرج' : 'عالي'}
                  </Badge>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-cyan-600 to-purple-600"
                onClick={() => generateReportMutation.mutate(selectedReport)}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري التحليل...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 ml-2" />
                    إنشاء التقرير بالذكاء الاصطناعي
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {/* Executive Summary */}
              <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/30">
                <h4 className="text-cyan-400 font-medium mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  الملخص التنفيذي
                </h4>
                <p className="text-slate-300 text-sm">{generatedReport.executive_summary}</p>
              </div>

              {/* Metrics */}
              {generatedReport.metrics?.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3">المقاييس الرئيسية</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {generatedReport.metrics.map((metric, i) => (
                      <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-400 text-xs">{metric.name}</p>
                        <p className="text-white text-lg font-bold">{metric.value}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {metric.trend === 'up' ? (
                            <TrendingUp className="w-3 h-3 text-green-400" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                          )}
                          <span className={`text-xs ${metric.status === 'good' ? 'text-green-400' : 'text-amber-400'}`}>
                            {metric.trend}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {generatedReport.recommendations?.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3">التوصيات</h4>
                  <ul className="space-y-2">
                    {generatedReport.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-slate-700">
                <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                  <Download className="w-4 h-4 ml-2" />
                  تحميل PDF
                </Button>
                <Button variant="outline" className="border-slate-600" onClick={() => setGeneratedReport(null)}>
                  تقرير جديد
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}