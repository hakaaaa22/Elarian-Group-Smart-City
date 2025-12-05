import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Wrench, Plus, Calendar, Clock, DollarSign, AlertTriangle, Check,
  X, Search, Filter, Download, User, Package, FileText, TrendingUp,
  Activity, Zap, Thermometer, Camera, Car, Settings, History,
  Phone, Mail, ChevronRight, Eye, Edit, Play, Pause, CheckCircle, BarChart3, Brain
} from 'lucide-react';
import MaintenanceKPIDashboard from '@/components/maintenance/MaintenanceKPIDashboard';
import MaintenanceReports from '@/components/maintenance/MaintenanceReports';
import AdvancedMaintenanceReports from '@/components/maintenance/AdvancedMaintenanceReports';
import AdvancedSearch from '@/components/common/AdvancedSearch';
import Pagination from '@/components/common/Pagination';
import EnhancedPredictiveMaintenance from '@/components/predictive/EnhancedPredictiveMaintenance';
import AutomatedMaintenanceScheduler from '@/components/maintenance/AutomatedMaintenanceScheduler';
import WorkflowAutomation from '@/components/automation/WorkflowAutomation';
import AIProactiveAnalytics from '@/components/analytics/AIProactiveAnalytics';
import AIPredictiveMaintenance from '@/components/analytics/AIPredictiveMaintenance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const maintenanceTypes = [
  { id: 'preventive', name: 'وقائية', color: 'green' },
  { id: 'corrective', name: 'تصحيحية', color: 'amber' },
  { id: 'emergency', name: 'طارئة', color: 'red' },
  { id: 'inspection', name: 'فحص', color: 'blue' },
  { id: 'replacement', name: 'استبدال', color: 'purple' },
];

const statusColors = {
  scheduled: 'bg-blue-500/20 text-blue-400',
  in_progress: 'bg-amber-500/20 text-amber-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-slate-500/20 text-slate-400',
  pending_parts: 'bg-purple-500/20 text-purple-400',
};

const priorityColors = {
  low: 'bg-slate-500/20 text-slate-400',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-amber-500/20 text-amber-400',
  critical: 'bg-red-500/20 text-red-400',
};

const mockRecords = [
  { id: 1, device_name: 'مكيف غرفة المعيشة', device_type: 'مكيف', maintenance_type: 'preventive', status: 'completed', priority: 'medium', description: 'صيانة دورية وتنظيف الفلتر', technician_name: 'محمد أحمد', scheduled_date: '2024-12-01', end_date: '2024-12-01', estimated_duration: 2, actual_duration: 1.5, labor_cost: 150, parts_cost: 50, total_cost: 200, parts_used: [{ part_name: 'فلتر', quantity: 1, unit_cost: 50 }] },
  { id: 2, device_name: 'كاميرا المدخل', device_type: 'كاميرا', maintenance_type: 'corrective', status: 'in_progress', priority: 'high', description: 'إصلاح مشكلة في الرؤية الليلية', technician_name: 'خالد العلي', scheduled_date: '2024-12-04', start_date: '2024-12-04', estimated_duration: 3, labor_cost: 200, parts_cost: 0, total_cost: 200 },
  { id: 3, device_name: 'قفل الباب الذكي', device_type: 'قفل', maintenance_type: 'emergency', status: 'scheduled', priority: 'critical', description: 'القفل لا يستجيب للأوامر', technician_name: 'فهد السعيد', scheduled_date: '2024-12-05', estimated_duration: 1 },
  { id: 4, device_name: 'سيارة النقل #3', device_type: 'مركبة', maintenance_type: 'inspection', status: 'pending_parts', priority: 'medium', description: 'فحص دوري + تغيير زيت', technician_name: 'عبدالله محمد', scheduled_date: '2024-12-06', estimated_duration: 4, parts_cost: 350 },
];

const mockPredictions = [
  { 
    id: 1, device_name: 'مكيف غرفة النوم', device_type: 'مكيف', health: 45, 
    issue: 'ضعف في الكفاءة', 
    recommendation: 'صيانة وقائية خلال أسبوعين',
    detailed_recommendation: 'تنظيف المبادل الحراري وفحص مستوى الفريون وتغيير الفلتر',
    repair_cost: 300, replace_cost: 2500, 
    impact_if_ignored: 'ارتفاع استهلاك الطاقة 30%',
    detailed_impact: 'زيادة فاتورة الكهرباء بمقدار 150 ر.س شهرياً، احتمال تعطل الضاغط خلال 3 أشهر',
    estimated_time: 2, urgency: 'high',
    error_logs: ['E001: انخفاض كفاءة التبريد', 'W002: ارتفاع درجة حرارة الضاغط'],
    usage_hours: 4500, avg_daily_usage: 8.5,
    required_parts: [{ name: 'فلتر مكيف', sku: 'AC-FLT-001', quantity: 1 }],
    confidence_score: 87
  },
  { 
    id: 2, device_name: 'كاميرا الحديقة', device_type: 'كاميرا', health: 62, 
    issue: 'بطارية ضعيفة', 
    recommendation: 'استبدال البطارية',
    detailed_recommendation: 'استبدال بطارية الليثيوم 3.7V بسعة 3000mAh',
    repair_cost: 150, replace_cost: 800, 
    impact_if_ignored: 'توقف عن العمل خلال شهر',
    detailed_impact: 'فقدان التغطية الأمنية للحديقة، عدم تسجيل الحركة ليلاً',
    estimated_time: 0.5, urgency: 'medium',
    error_logs: ['BAT: مستوى البطارية 15%', 'W001: إعادة تشغيل متكررة'],
    usage_hours: 8760, avg_daily_usage: 24,
    required_parts: [{ name: 'بطارية كاميرا', sku: 'CAM-BAT-001', quantity: 1 }],
    confidence_score: 92
  },
  { 
    id: 3, device_name: 'حساس الحركة', device_type: 'حساس', health: 28, 
    issue: 'أعطال متكررة', 
    recommendation: 'استبدال الجهاز',
    detailed_recommendation: 'الإصلاح غير مجدٍ اقتصادياً، يُنصح باستبدال الوحدة بالكامل',
    repair_cost: 400, replace_cost: 250, 
    impact_if_ignored: 'إنذارات خاطئة مستمرة',
    detailed_impact: 'تنبيهات وهمية متكررة، فقدان الثقة في نظام الإنذار، احتمال تجاهل تنبيهات حقيقية',
    estimated_time: 1, urgency: 'critical',
    error_logs: ['E005: فشل الاتصال', 'E003: قراءات غير طبيعية', 'E007: إنذار خاطئ متكرر'],
    usage_hours: 12500, avg_daily_usage: 24,
    required_parts: [{ name: 'حساس حركة', sku: 'SEC-MOT-001', quantity: 1 }],
    confidence_score: 95
  },
];

const technicians = [
  { id: 1, name: 'محمد أحمد', specialty: 'تكييف', phone: '+966 5XX XXX XXX' },
  { id: 2, name: 'خالد العلي', specialty: 'كاميرات', phone: '+966 5XX XXX XXX' },
  { id: 3, name: 'فهد السعيد', specialty: 'أقفال ذكية', phone: '+966 5XX XXX XXX' },
  { id: 4, name: 'عبدالله محمد', specialty: 'مركبات', phone: '+966 5XX XXX XXX' },
];

export default function MaintenanceTracker() {
  const [activeTab, setActiveTab] = useState('records');
  const [records, setRecords] = useState(mockRecords);
  const [predictions, setPredictions] = useState(mockPredictions);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [newRecord, setNewRecord] = useState({
    device_name: '', device_type: '', maintenance_type: 'preventive',
    priority: 'medium', description: '', technician_name: '',
    scheduled_date: '', estimated_duration: '', notes: ''
  });
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completingRecord, setCompletingRecord] = useState(null);
  const [partsUsed, setPartsUsed] = useState([]);
  const [laborCost, setLaborCost] = useState(0);
  
  // قطع الغيار المتوفرة (محاكاة من المخزون)
  const availableParts = [
    { id: 1, name: 'فلتر مكيف', sku: 'AC-FLT-001', quantity: 25, unit_cost: 50 },
    { id: 2, name: 'بطارية كاميرا', sku: 'CAM-BAT-001', quantity: 8, unit_cost: 120 },
    { id: 3, name: 'حساس حركة', sku: 'SEC-MOT-001', quantity: 5, unit_cost: 85 },
    { id: 4, name: 'زيت محرك', sku: 'VEH-OIL-001', quantity: 10, unit_cost: 45 },
  ];

  const stats = {
    total: records.length,
    completed: records.filter(r => r.status === 'completed').length,
    inProgress: records.filter(r => r.status === 'in_progress').length,
    totalCost: records.reduce((sum, r) => sum + (r.total_cost || 0), 0),
  };

  const maintenanceFilters = [
    { id: 'status', label: 'الحالة', type: 'select', options: [
      { value: 'scheduled', label: 'مجدولة' },
      { value: 'in_progress', label: 'قيد التنفيذ' },
      { value: 'completed', label: 'مكتملة' },
      { value: 'pending_parts', label: 'بانتظار قطع' },
    ]},
    { id: 'maintenance_type', label: 'نوع الصيانة', type: 'select', options: maintenanceTypes.map(t => ({ value: t.id, label: t.name })) },
    { id: 'priority', label: 'الأولوية', type: 'select', options: [
      { value: 'low', label: 'منخفض' },
      { value: 'medium', label: 'متوسط' },
      { value: 'high', label: 'عالي' },
      { value: 'critical', label: 'حرج' },
    ]},
    { id: 'technician', label: 'الفني', type: 'text', placeholder: 'اسم الفني' },
    { id: 'date_from', label: 'من تاريخ', type: 'date' },
    { id: 'date_to', label: 'إلى تاريخ', type: 'date' },
  ];

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = r.device_name.includes(searchQuery) || r.technician_name?.includes(searchQuery);
      const matchesStatus = !activeFilters.status || activeFilters.status === 'all' || r.status === activeFilters.status;
      const matchesType = !activeFilters.maintenance_type || activeFilters.maintenance_type === 'all' || r.maintenance_type === activeFilters.maintenance_type;
      const matchesPriority = !activeFilters.priority || activeFilters.priority === 'all' || r.priority === activeFilters.priority;
      const matchesTechnician = !activeFilters.technician || r.technician_name?.includes(activeFilters.technician);
      const matchesDateFrom = !activeFilters.date_from || r.scheduled_date >= activeFilters.date_from;
      const matchesDateTo = !activeFilters.date_to || r.scheduled_date <= activeFilters.date_to;
      return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesTechnician && matchesDateFrom && matchesDateTo;
    });
  }, [records, searchQuery, activeFilters]);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const handleFilterChange = (id, value) => {
    setActiveFilters(prev => ({ ...prev, [id]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
    setCurrentPage(1);
  };

  const createRecord = () => {
    if (!newRecord.device_name) {
      toast.error('يرجى إدخال اسم الجهاز');
      return;
    }
    const record = { ...newRecord, id: Date.now(), status: 'scheduled' };
    setRecords([record, ...records]);
    setShowCreateDialog(false);
    setNewRecord({ device_name: '', device_type: '', maintenance_type: 'preventive', priority: 'medium', description: '', technician_name: '', scheduled_date: '', estimated_duration: '', notes: '' });
    toast.success('تم جدولة الصيانة');
  };

  const updateStatus = (id, status) => {
    if (status === 'completed') {
      const record = records.find(r => r.id === id);
      setCompletingRecord(record);
      setShowCompleteDialog(true);
    } else {
      setRecords(records.map(r => r.id === id ? { ...r, status, ...(status === 'in_progress' ? { start_date: new Date().toISOString() } : {}) } : r));
      toast.success('تم تحديث الحالة');
    }
  };

  const completeWithParts = () => {
    if (!completingRecord) return;
    const partsCost = partsUsed.reduce((sum, p) => sum + (p.quantity * p.unit_cost), 0);
    const totalCost = laborCost + partsCost;
    
    setRecords(records.map(r => r.id === completingRecord.id ? {
      ...r,
      status: 'completed',
      end_date: new Date().toISOString(),
      parts_used: partsUsed,
      labor_cost: laborCost,
      parts_cost: partsCost,
      total_cost: totalCost,
      actual_duration: r.estimated_duration
    } : r));

    setShowCompleteDialog(false);
    setCompletingRecord(null);
    setPartsUsed([]);
    setLaborCost(0);
    toast.success(`تم إكمال الصيانة وخصم ${partsUsed.length} قطعة من المخزون`);
  };

  const addPartToUsed = (part) => {
    const existing = partsUsed.find(p => p.id === part.id);
    if (existing) {
      setPartsUsed(partsUsed.map(p => p.id === part.id ? { ...p, quantity: p.quantity + 1 } : p));
    } else {
      setPartsUsed([...partsUsed, { ...part, quantity: 1 }]);
    }
  };

  const removePartFromUsed = (partId) => {
    setPartsUsed(partsUsed.filter(p => p.id !== partId));
  };

  const scheduleFromPrediction = (prediction) => {
    const record = {
      id: Date.now(),
      device_name: prediction.device_name,
      device_type: prediction.device_type,
      maintenance_type: prediction.repair_cost < prediction.replace_cost ? 'corrective' : 'replacement',
      priority: prediction.urgency,
      description: prediction.recommendation,
      status: 'scheduled',
      scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimated_duration: prediction.estimated_time,
      parts_cost: prediction.repair_cost < prediction.replace_cost ? prediction.repair_cost : prediction.replace_cost
    };
    setRecords([record, ...records]);
    toast.success('تم جدولة الصيانة');
  };

  const [showPartsOrderDialog, setShowPartsOrderDialog] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState(null);

  const orderParts = (prediction) => {
    setSelectedPrediction(prediction);
    setShowPartsOrderDialog(true);
  };

  const confirmPartsOrder = () => {
    if (selectedPrediction?.required_parts) {
      toast.success(`تم طلب ${selectedPrediction.required_parts.length} قطعة غيار`);
    }
    setShowPartsOrderDialog(false);
  };

  const callTechnician = () => {
    toast.success('جاري الاتصال بالفني...');
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Wrench className="w-8 h-8 text-amber-400" />
              تتبع الصيانة
            </h1>
            <p className="text-slate-400 mt-1">إدارة الصيانة الوقائية والتنبؤية للأجهزة</p>
          </div>
          <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 ml-2" />
            جدولة صيانة
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي السجلات', value: stats.total, icon: FileText, color: 'cyan' },
          { label: 'مكتملة', value: stats.completed, icon: CheckCircle, color: 'green' },
          { label: 'قيد التنفيذ', value: stats.inProgress, icon: Activity, color: 'amber' },
          { label: 'إجمالي التكلفة', value: `${stats.totalCost} ر.س`, icon: DollarSign, color: 'purple' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-500/20`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="records" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <History className="w-4 h-4 ml-2" />
            سجل الصيانة
          </TabsTrigger>
          <TabsTrigger value="predictions" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
            <AlertTriangle className="w-4 h-4 ml-2" />
            التنبؤية ({predictions.length})
          </TabsTrigger>
          <TabsTrigger value="ai-analysis" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Activity className="w-4 h-4 ml-2" />
            تحليل AI
          </TabsTrigger>
          <TabsTrigger value="technicians" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <User className="w-4 h-4 ml-2" />
            الفنيون
          </TabsTrigger>
          <TabsTrigger value="automation" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Zap className="w-4 h-4 ml-2" />
            الأتمتة
          </TabsTrigger>
          <TabsTrigger value="workflow" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Activity className="w-4 h-4 ml-2" />
            سير العمل
          </TabsTrigger>
          <TabsTrigger value="ai-analytics" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
            <TrendingUp className="w-4 h-4 ml-2" />
            تحليلات AI
          </TabsTrigger>
          <TabsTrigger value="predictive-ai" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
            <Brain className="w-4 h-4 ml-2" />
            الصيانة التنبؤية
          </TabsTrigger>
          <TabsTrigger value="kpis" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <BarChart3 className="w-4 h-4 ml-2" />
            مؤشرات الأداء
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <FileText className="w-4 h-4 ml-2" />
            التقارير
          </TabsTrigger>
          <TabsTrigger value="advanced-reports" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
            <BarChart3 className="w-4 h-4 ml-2" />
            تقارير متقدمة
          </TabsTrigger>
          </TabsList>

        <TabsContent value="records" className="space-y-4 mt-4">
          <AdvancedSearch
            searchQuery={searchQuery}
            onSearchChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
            filters={maintenanceFilters}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            placeholder="بحث بالجهاز أو الفني..."
          />

          {/* Records List */}
          <div className="space-y-3">
            {paginatedRecords.map((record, i) => (
              <motion.div key={record.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-${maintenanceTypes.find(t => t.id === record.maintenance_type)?.color || 'slate'}-500/20`}>
                          <Wrench className={`w-6 h-6 text-${maintenanceTypes.find(t => t.id === record.maintenance_type)?.color || 'slate'}-400`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-bold">{record.device_name}</h3>
                            <Badge className={statusColors[record.status]}>
                              {record.status === 'scheduled' ? 'مجدولة' : record.status === 'in_progress' ? 'قيد التنفيذ' : record.status === 'completed' ? 'مكتملة' : record.status === 'pending_parts' ? 'بانتظار قطع' : 'ملغاة'}
                            </Badge>
                            <Badge className={priorityColors[record.priority]}>
                              {record.priority === 'low' ? 'منخفض' : record.priority === 'medium' ? 'متوسط' : record.priority === 'high' ? 'عالي' : 'حرج'}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm">{record.description}</p>
                          <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{record.scheduled_date}</span>
                            {record.technician_name && <span className="flex items-center gap-1"><User className="w-3 h-3" />{record.technician_name}</span>}
                            {record.estimated_duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{record.estimated_duration} ساعة</span>}
                            {record.total_cost && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{record.total_cost} ر.س</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {record.status === 'scheduled' && (
                          <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => updateStatus(record.id, 'in_progress')}>
                            <Play className="w-3 h-3 ml-1" />بدء
                          </Button>
                        )}
                        {record.status === 'in_progress' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus(record.id, 'completed')}>
                            <Check className="w-3 h-3 ml-1" />إكمال
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="border-slate-600" onClick={() => { setSelectedRecord(record); setShowDetailDialog(true); }}>
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredRecords.length / pageSize)}
            totalItems={filteredRecords.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          />
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4 mt-4">
          <Card className="glass-card border-red-500/30 bg-red-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-white font-medium">الأجهزة المعرضة للخطر</p>
                  <p className="text-slate-400 text-sm">أجهزة تحتاج صيانة استباقية بناءً على التحليل التنبؤي</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {predictions.map((pred, i) => (
              <motion.div key={pred.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className={`glass-card border-${pred.urgency === 'critical' ? 'red' : pred.urgency === 'high' ? 'amber' : 'blue'}-500/30 bg-${pred.urgency === 'critical' ? 'red' : pred.urgency === 'high' ? 'amber' : 'blue'}-500/5`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg bg-${pred.urgency === 'critical' ? 'red' : pred.urgency === 'high' ? 'amber' : 'blue'}-500/20`}>
                            <AlertTriangle className={`w-5 h-5 text-${pred.urgency === 'critical' ? 'red' : pred.urgency === 'high' ? 'amber' : 'blue'}-400`} />
                          </div>
                          <div>
                            <h3 className="text-white font-bold">{pred.device_name}</h3>
                            <p className="text-slate-400 text-sm">{pred.device_type}</p>
                          </div>
                          <Badge className={priorityColors[pred.urgency]}>
                            {pred.urgency === 'critical' ? 'حرج' : pred.urgency === 'high' ? 'عالي' : 'متوسط'}
                          </Badge>
                        </div>

                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-slate-400 text-sm">صحة الجهاز</span>
                            <span className={`font-bold ${pred.health < 40 ? 'text-red-400' : pred.health < 70 ? 'text-amber-400' : 'text-green-400'}`}>{pred.health}%</span>
                          </div>
                          <Progress value={pred.health} className="h-2" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-3 mb-3">
                          <div className="p-3 bg-slate-800/50 rounded-lg">
                            <p className="text-slate-400 text-xs mb-1">المشكلة</p>
                            <p className="text-white text-sm">{pred.issue}</p>
                          </div>
                          <div className="p-3 bg-slate-800/50 rounded-lg">
                            <p className="text-slate-400 text-xs mb-1">التوصية</p>
                            <p className="text-cyan-400 text-sm">{pred.recommendation}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                            <p className="text-green-400 font-bold">{pred.repair_cost} ر.س</p>
                            <p className="text-slate-400 text-xs">تكلفة الإصلاح</p>
                          </div>
                          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center">
                            <p className="text-amber-400 font-bold">{pred.replace_cost} ر.س</p>
                            <p className="text-slate-400 text-xs">تكلفة الاستبدال</p>
                          </div>
                          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-center">
                            <p className="text-cyan-400 font-bold">{pred.estimated_time} ساعة</p>
                            <p className="text-slate-400 text-xs">الوقت المقدر</p>
                          </div>
                        </div>

                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <p className="text-red-400 text-sm font-medium mb-1">
                            <AlertTriangle className="w-4 h-4 inline ml-1" />
                            التأثير في حالة عدم الصيانة:
                          </p>
                          <p className="text-red-300 text-xs">{pred.detailed_impact || pred.impact_if_ignored}</p>
                        </div>

                        {/* Error Logs */}
                        {pred.error_logs && (
                          <div className="p-3 bg-slate-800/50 rounded-lg">
                            <p className="text-slate-300 text-xs font-medium mb-2">سجل الأخطاء:</p>
                            <div className="space-y-1">
                              {pred.error_logs.map((log, idx) => (
                                <p key={idx} className="text-slate-400 text-xs font-mono">{log}</p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Usage Data */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-2 bg-slate-800/30 rounded text-center">
                            <p className="text-slate-400 text-[10px]">ساعات التشغيل</p>
                            <p className="text-white text-sm font-bold">{pred.usage_hours?.toLocaleString()}</p>
                          </div>
                          <div className="p-2 bg-slate-800/30 rounded text-center">
                            <p className="text-slate-400 text-[10px]">الاستخدام اليومي</p>
                            <p className="text-white text-sm font-bold">{pred.avg_daily_usage} ساعة</p>
                          </div>
                          <div className="p-2 bg-slate-800/30 rounded text-center">
                            <p className="text-slate-400 text-[10px]">دقة التنبؤ</p>
                            <p className="text-cyan-400 text-sm font-bold">{pred.confidence_score}%</p>
                          </div>
                        </div>

                        {/* Required Parts */}
                        {pred.required_parts?.length > 0 && (
                          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                            <p className="text-purple-300 text-xs font-medium mb-2">القطع المطلوبة:</p>
                            {pred.required_parts.map((part, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs">
                                <span className="text-white">{part.name} × {part.quantity}</span>
                                <span className="text-slate-400 font-mono">{part.sku}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50">
                      <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={() => scheduleFromPrediction(pred)}>
                        <Calendar className="w-4 h-4 ml-2" />
                        جدولة صيانة
                      </Button>
                      <Button variant="outline" className="border-purple-500/50 text-purple-400" onClick={() => orderParts(pred)}>
                        <Package className="w-4 h-4 ml-2" />
                        طلب قطع
                      </Button>
                      <Button variant="outline" className="border-cyan-500/50 text-cyan-400" onClick={callTechnician}>
                        <Phone className="w-4 h-4 ml-2" />
                        استدعاء فني
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="technicians" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {technicians.map((tech) => (
              <Card key={tech.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-cyan-500/20 text-cyan-400">{tech.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-white font-bold">{tech.name}</h3>
                      <p className="text-slate-400 text-sm">{tech.specialty}</p>
                      <p className="text-slate-500 text-xs">{tech.phone}</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-400">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai-analysis" className="mt-4">
          <EnhancedPredictiveMaintenance 
            devices={predictions.map(p => ({
              id: p.id,
              name: p.device_name,
              type: p.device_type,
              status: p.health > 60 ? 'active' : 'warning',
              analysis: {
                healthScore: p.health,
                riskLevel: p.urgency,
                issues: p.error_logs || [],
                prediction: { daysToFailure: 15, confidence: p.confidence_score }
              },
              status_history: [],
              error_logs: p.error_logs,
              usage_data: { hours_used: p.usage_hours, avg_daily_hours: p.avg_daily_usage },
              repair_cost: p.repair_cost,
              replace_cost: p.replace_cost
            }))}
            onScheduleMaintenance={(device) => {
              const pred = predictions.find(p => p.device_name === device.name);
              if (pred) scheduleFromPrediction(pred);
            }}
            onOrderParts={(device) => {
              const pred = predictions.find(p => p.device_name === device.name);
              if (pred) orderParts(pred);
            }}
            onCallTechnician={callTechnician}
            inventoryItems={availableParts}
          />
        </TabsContent>

        <TabsContent value="kpis" className="mt-4">
            <MaintenanceKPIDashboard />
          </TabsContent>

        <TabsContent value="reports" className="mt-4">
            <MaintenanceReports records={records} technicians={technicians} />
          </TabsContent>

          <TabsContent value="advanced-reports" className="mt-4">
            <AdvancedMaintenanceReports records={records} technicians={technicians} />
          </TabsContent>

        <TabsContent value="workflow" className="mt-4">
          <WorkflowAutomation 
            onTriggerRule={(rule) => {
              if (rule.id === 'auto_maintenance') {
                const pred = predictions[0];
                if (pred) scheduleFromPrediction(pred);
              }
            }}
          />
        </TabsContent>

        <TabsContent value="ai-analytics" className="mt-4">
          <AIProactiveAnalytics />
        </TabsContent>

        <TabsContent value="predictive-ai" className="mt-4">
          <AIPredictiveMaintenance 
            onCreateWorkOrder={(workOrder) => {
              const record = {
                id: Date.now(),
                device_name: workOrder.device_name,
                device_type: workOrder.device_type,
                maintenance_type: workOrder.maintenance_type,
                priority: workOrder.priority,
                description: workOrder.description,
                status: 'scheduled',
                scheduled_date: new Date().toISOString().split('T')[0],
                parts_cost: workOrder.estimated_cost
              };
              setRecords([record, ...records]);
            }}
          />
        </TabsContent>
        </Tabs>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-400" />
              جدولة صيانة جديدة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">اسم الجهاز *</Label>
                <Input value={newRecord.device_name} onChange={(e) => setNewRecord({ ...newRecord, device_name: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
              <div>
                <Label className="text-slate-300">نوع الجهاز</Label>
                <Input value={newRecord.device_type} onChange={(e) => setNewRecord({ ...newRecord, device_type: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">نوع الصيانة</Label>
                <Select value={newRecord.maintenance_type} onValueChange={(v) => setNewRecord({ ...newRecord, maintenance_type: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {maintenanceTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">الأولوية</Label>
                <Select value={newRecord.priority} onValueChange={(v) => setNewRecord({ ...newRecord, priority: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="low">منخفض</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="high">عالي</SelectItem>
                    <SelectItem value="critical">حرج</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-slate-300">الوصف</Label>
              <Textarea value={newRecord.description} onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">الفني</Label>
                <Select value={newRecord.technician_name} onValueChange={(v) => setNewRecord({ ...newRecord, technician_name: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1"><SelectValue placeholder="اختر" /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {technicians.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">التاريخ المجدول</Label>
                <Input type="date" value={newRecord.scheduled_date} onChange={(e) => setNewRecord({ ...newRecord, scheduled_date: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-slate-300">المدة المقدرة (ساعات)</Label>
              <Input type="number" value={newRecord.estimated_duration} onChange={(e) => setNewRecord({ ...newRecord, estimated_duration: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
            </div>
            <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={createRecord}>
              <Calendar className="w-4 h-4 ml-2" />
              جدولة الصيانة
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete with Parts Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              إكمال الصيانة
            </DialogTitle>
          </DialogHeader>
          {completingRecord && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-white font-medium">{completingRecord.device_name}</p>
                <p className="text-slate-400 text-sm">{completingRecord.description}</p>
              </div>

              {/* تكلفة العمالة */}
              <div>
                <Label className="text-slate-300">تكلفة العمالة (ر.س)</Label>
                <Input 
                  type="number" 
                  value={laborCost} 
                  onChange={(e) => setLaborCost(Number(e.target.value))} 
                  className="bg-slate-800/50 border-slate-700 text-white mt-1" 
                />
              </div>

              {/* قطع الغيار المستخدمة */}
              <div>
                <Label className="text-slate-300 mb-2 block">قطع الغيار المستخدمة</Label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {availableParts.map(part => (
                    <Button 
                      key={part.id} 
                      variant="outline" 
                      size="sm" 
                      className="border-slate-600 justify-start"
                      onClick={() => addPartToUsed(part)}
                    >
                      <Plus className="w-3 h-3 ml-1" />
                      {part.name} ({part.quantity})
                    </Button>
                  ))}
                </div>

                {partsUsed.length > 0 && (
                  <div className="space-y-2 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    {partsUsed.map(part => (
                      <div key={part.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-white">{part.name}</span>
                          <Input 
                            type="number" 
                            min="1" 
                            value={part.quantity} 
                            onChange={(e) => setPartsUsed(partsUsed.map(p => p.id === part.id ? { ...p, quantity: Number(e.target.value) } : p))}
                            className="w-16 h-7 bg-slate-800/50 border-slate-700 text-white text-center"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">{part.quantity * part.unit_cost} ر.س</span>
                          <Button size="sm" variant="ghost" onClick={() => removePartFromUsed(part.id)}>
                            <X className="w-3 h-3 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ملخص التكلفة */}
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="text-white">تكلفة العمالة</span>
                  <span className="text-green-400">{laborCost} ر.س</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-white">تكلفة القطع</span>
                  <span className="text-green-400">{partsUsed.reduce((s, p) => s + p.quantity * p.unit_cost, 0)} ر.س</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700/50 font-bold">
                  <span className="text-white">الإجمالي</span>
                  <span className="text-green-400">{laborCost + partsUsed.reduce((s, p) => s + p.quantity * p.unit_cost, 0)} ر.س</span>
                </div>
              </div>

              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={completeWithParts}>
                <Check className="w-4 h-4 ml-2" />
                إكمال وخصم من المخزون
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Parts Order Dialog */}
      <Dialog open={showPartsOrderDialog} onOpenChange={setShowPartsOrderDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              طلب قطع غيار
            </DialogTitle>
          </DialogHeader>
          {selectedPrediction && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-white font-medium">{selectedPrediction.device_name}</p>
                <p className="text-slate-400 text-sm">{selectedPrediction.recommendation}</p>
              </div>
              {selectedPrediction.required_parts?.map((part, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <div>
                    <p className="text-white">{part.name}</p>
                    <p className="text-slate-400 text-xs font-mono">{part.sku}</p>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-400">× {part.quantity}</Badge>
                </div>
              ))}
              <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={confirmPartsOrder}>
                <Package className="w-4 h-4 ml-2" />
                تأكيد الطلب
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">تفاصيل الصيانة</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">الجهاز</p>
                  <p className="text-white font-medium">{selectedRecord.device_name}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">النوع</p>
                  <p className="text-white">{maintenanceTypes.find(t => t.id === selectedRecord.maintenance_type)?.name}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">الفني</p>
                  <p className="text-white">{selectedRecord.technician_name || '-'}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">التاريخ</p>
                  <p className="text-white">{selectedRecord.scheduled_date}</p>
                </div>
              </div>
              {selectedRecord.parts_used?.length > 0 && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-purple-300 font-medium mb-2">القطع المستخدمة</p>
                  {selectedRecord.parts_used.map((part, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-white">{part.part_name} × {part.quantity}</span>
                      <span className="text-slate-400">{part.unit_cost} ر.س</span>
                    </div>
                  ))}
                </div>
              )}
              {selectedRecord.total_cost && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-white">تكلفة العمالة</span>
                    <span className="text-green-400">{selectedRecord.labor_cost || 0} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white">تكلفة القطع</span>
                    <span className="text-green-400">{selectedRecord.parts_cost || 0} ر.س</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
                    <span className="text-white font-bold">الإجمالي</span>
                    <span className="text-green-400 font-bold">{selectedRecord.total_cost} ر.س</span>
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