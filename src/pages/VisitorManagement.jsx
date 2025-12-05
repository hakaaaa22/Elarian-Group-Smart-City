import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, Search, Filter, Building2, Car, Clock, Calendar,
  Shield, Camera, DoorOpen, MapPin, FileText, Check, X, Eye, Edit,
  Trash2, QrCode, Download, Upload, AlertTriangle, CheckCircle, XCircle,
  Truck, Package, User, Briefcase, Star, Phone, Mail, CreditCard,
  Plus, Settings, ChevronRight, MoreVertical, Loader2, Radio, LayoutDashboard,
  ClipboardList, Ban, BarChart3, Globe, Brain, Plug, Bell
} from 'lucide-react';
import SmartGatesModule from '@/components/visitor/SmartGatesModule';
import VisitorDashboard from '@/components/visitor/VisitorDashboard';
import CheckInOutLog from '@/components/visitor/CheckInOutLog';
import VisitScheduling from '@/components/visitor/VisitScheduling';
import SecurityScreening from '@/components/visitor/SecurityScreening';
import VisitorReports from '@/components/visitor/VisitorReports';
import PermitWorkflow from '@/components/visitor/PermitWorkflow';
import IdentityVerification from '@/components/visitor/IdentityVerification';
import SmartAlertWidget from '@/components/notifications/SmartAlertWidget';
import ExternalIntegrations from '@/components/visitor/ExternalIntegrations';
import AdvancedPermitWorkflow from '@/components/visitor/AdvancedPermitWorkflow';
import AdvancedIdentityVerification from '@/components/visitor/AdvancedIdentityVerification';
import SmartAlertAnalytics from '@/components/alerts/SmartAlertAnalytics';
import CustomizableDashboard from '@/components/visitor/CustomizableDashboard';
import AIBehaviorAnalytics from '@/components/visitor/AIBehaviorAnalytics';
import UnifiedNotificationCenter from '@/components/notifications/UnifiedNotificationCenter';
import CameraIntegrationModule from '@/components/visitor/CameraIntegrationModule';
import AIRiskAssessment from '@/components/visitor/AIRiskAssessment';
import MultiLevelApproval from '@/components/visitor/MultiLevelApproval';
import AutomatedBackgroundCheck from '@/components/visitor/AutomatedBackgroundCheck';
import AISecurityAnalytics from '@/components/security/AISecurityAnalytics';
import KPIDashboard from '@/components/reports/KPIDashboard';
import AdvancedAISecurityModule from '@/components/security/AdvancedAISecurityModule';
import EnhancedNotificationSystem from '@/components/notifications/EnhancedNotificationSystem';
import CustomizableKPIDashboard from '@/components/reports/CustomizableKPIDashboard';
import VisitorFeedback from '@/components/visitor/VisitorFeedback';
import StaffCommunication from '@/components/visitor/StaffCommunication';
import GeofencingModule from '@/components/visitor/GeofencingModule';
import VisitorFeedbackAnalytics from '@/components/visitor/VisitorFeedbackAnalytics';
import AdvancedStaffCommunication from '@/components/communication/AdvancedStaffCommunication';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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

const visitorTypes = [
  { id: 'visitor', name: 'زائر', icon: User, color: 'cyan' },
  { id: 'contractor', name: 'متعاقد', icon: Briefcase, color: 'amber' },
  { id: 'client', name: 'عميل', icon: Building2, color: 'purple' },
  { id: 'supplier', name: 'مورد', icon: Package, color: 'green' },
  { id: 'delivery', name: 'توصيل', icon: Truck, color: 'orange' },
  { id: 'vip', name: 'VIP', icon: Star, color: 'pink' },
];

const gates = [
  { id: 'gate1', name: 'البوابة الرئيسية', type: 'main' },
  { id: 'gate2', name: 'بوابة الموظفين', type: 'staff' },
  { id: 'gate3', name: 'بوابة الشحن', type: 'cargo' },
  { id: 'gate4', name: 'بوابة الطوارئ', type: 'emergency' },
];

const cameras = [
  { id: 'cam1', name: 'كاميرا المدخل الرئيسي', zone: 'entrance' },
  { id: 'cam2', name: 'كاميرا موقف السيارات', zone: 'parking' },
  { id: 'cam3', name: 'كاميرا منطقة الشحن', zone: 'cargo' },
  { id: 'cam4', name: 'كاميرا الاستقبال', zone: 'reception' },
];

const zones = [
  { id: 'zone1', name: 'منطقة الاستقبال' },
  { id: 'zone2', name: 'المكاتب الإدارية' },
  { id: 'zone3', name: 'منطقة الإنتاج' },
  { id: 'zone4', name: 'المستودعات' },
  { id: 'zone5', name: 'منطقة VIP' },
];

const vehicleTypes = [
  'سيارة صغيرة', 'سيارة دفع رباعي', 'شاحنة صغيرة', 'شاحنة كبيرة', 
  'حافلة', 'دراجة نارية', 'مقطورة', 'رافعة شوكية'
];

const cargoTypes = [
  'بضائع عامة', 'مواد غذائية', 'مواد كيميائية', 'معدات', 
  'أثاث', 'إلكترونيات', 'مواد بناء', 'أخرى'
];

const daysOfWeek = [
  { id: 'sunday', name: 'الأحد' },
  { id: 'monday', name: 'الإثنين' },
  { id: 'tuesday', name: 'الثلاثاء' },
  { id: 'wednesday', name: 'الأربعاء' },
  { id: 'thursday', name: 'الخميس' },
  { id: 'friday', name: 'الجمعة' },
  { id: 'saturday', name: 'السبت' },
];

const mockPermits = [
  {
    id: 1, permit_number: 'P-2024-001', visitor_name: 'أحمد محمد', visitor_type: 'contractor',
    company: 'شركة البناء المتقدم', purpose: 'صيانة المكيفات', host_name: 'خالد العلي',
    start_date: '2024-12-04', end_date: '2024-12-10', status: 'active',
    allowed_gates: ['gate1', 'gate3'], allowed_zones: ['zone1', 'zone3'],
    vehicle_info: { has_vehicle: true, plate_number: 'ABC 1234', vehicle_type: 'شاحنة صغيرة', cargo_type: 'معدات' }
  },
  {
    id: 2, permit_number: 'P-2024-002', visitor_name: 'سارة أحمد', visitor_type: 'client',
    company: 'مؤسسة النجاح', purpose: 'اجتماع عمل', host_name: 'محمد السعيد',
    start_date: '2024-12-04', end_date: '2024-12-04', status: 'pending',
    allowed_gates: ['gate1'], allowed_zones: ['zone1', 'zone2', 'zone5'],
    vehicle_info: { has_vehicle: true, plate_number: 'XYZ 5678', vehicle_type: 'سيارة صغيرة' }
  },
  {
    id: 3, permit_number: 'P-2024-003', visitor_name: 'محمد علي', visitor_type: 'delivery',
    company: 'شركة التوصيل السريع', purpose: 'توصيل طلبية', host_name: 'فاطمة الزهراء',
    start_date: '2024-12-04', end_date: '2024-12-04', status: 'approved',
    allowed_gates: ['gate3'], allowed_zones: ['zone4'],
    vehicle_info: { has_vehicle: true, plate_number: 'DEF 9012', vehicle_type: 'شاحنة كبيرة', cargo_type: 'بضائع عامة', cargo_weight: '500 كجم' }
  },
];

export default function VisitorManagement() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPermitDialog, setShowPermitDialog] = useState(false);
  const [showVisitorDialog, setShowVisitorDialog] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [permits, setPermits] = useState(mockPermits);
  
  const [newPermit, setNewPermit] = useState({
    visitor_name: '',
    visitor_type: 'visitor',
    company: '',
    phone: '',
    email: '',
    id_number: '',
    purpose: '',
    host_name: '',
    host_department: '',
    start_date: '',
    end_date: '',
    entry_time: '08:00',
    exit_time: '17:00',
    allowed_days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
    allowed_gates: [],
    allowed_zones: [],
    linked_cameras: [],
    escort_required: false,
    escort_name: '',
    vehicle_info: {
      has_vehicle: false,
      plate_number: '',
      plate_type: 'خاص',
      vehicle_type: '',
      vehicle_brand: '',
      vehicle_model: '',
      vehicle_color: '',
      vehicle_year: '',
      cargo_type: '',
      cargo_description: '',
      cargo_weight: '',
      driver_name: '',
      driver_id: '',
      driver_license: ''
    },
    custom_fields: [],
    notes: ''
  });

  const [customFieldName, setCustomFieldName] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');

  const stats = {
    total: permits.length,
    active: permits.filter(p => p.status === 'active').length,
    pending: permits.filter(p => p.status === 'pending').length,
    today: permits.filter(p => p.start_date === '2024-12-04').length
  };

  const filteredPermits = permits.filter(p => {
    const matchesSearch = p.visitor_name.includes(searchQuery) || p.permit_number.includes(searchQuery) || p.company?.includes(searchQuery);
    const matchesType = filterType === 'all' || p.visitor_type === filterType;
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const addCustomField = () => {
    if (customFieldName && customFieldValue) {
      setNewPermit({
        ...newPermit,
        custom_fields: [...newPermit.custom_fields, { field_name: customFieldName, field_value: customFieldValue }]
      });
      setCustomFieldName('');
      setCustomFieldValue('');
    }
  };

  const removeCustomField = (index) => {
    setNewPermit({
      ...newPermit,
      custom_fields: newPermit.custom_fields.filter((_, i) => i !== index)
    });
  };

  const createPermit = () => {
    const permit = {
      ...newPermit,
      id: Date.now(),
      permit_number: `P-2024-${String(permits.length + 1).padStart(3, '0')}`,
      status: 'pending'
    };
    setPermits([permit, ...permits]);
    setShowPermitDialog(false);
    resetForm();
    toast.success('تم إنشاء التصريح بنجاح');
  };

  const approvePermit = (permitId) => {
    setPermits(permits.map(p => p.id === permitId ? { ...p, status: 'approved' } : p));
    toast.success('تم اعتماد التصريح');
  };

  const rejectPermit = (permitId) => {
    setPermits(permits.map(p => p.id === permitId ? { ...p, status: 'rejected' } : p));
    toast.success('تم رفض التصريح');
  };

  const resetForm = () => {
    setNewPermit({
      visitor_name: '', visitor_type: 'visitor', company: '', phone: '', email: '', id_number: '',
      purpose: '', host_name: '', host_department: '', start_date: '', end_date: '',
      entry_time: '08:00', exit_time: '17:00',
      allowed_days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
      allowed_gates: [], allowed_zones: [], linked_cameras: [],
      escort_required: false, escort_name: '',
      vehicle_info: { has_vehicle: false, plate_number: '', plate_type: 'خاص', vehicle_type: '', vehicle_brand: '', vehicle_model: '', vehicle_color: '', vehicle_year: '', cargo_type: '', cargo_description: '', cargo_weight: '', driver_name: '', driver_id: '', driver_license: '' },
      custom_fields: [], notes: ''
    });
  };

  const getTypeConfig = (type) => visitorTypes.find(t => t.id === type) || visitorTypes[0];

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-cyan-400" />
              إدارة الزوار والتصاريح
            </h1>
            <p className="text-slate-400 mt-1">إدارة المتعاقدين والعملاء والزوار وتصاريح الدخول</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-600">
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowPermitDialog(true)}>
              <Plus className="w-4 h-4 ml-2" />
              تصريح جديد
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Smart Alerts Widget */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي التصاريح', value: stats.total, icon: FileText, color: 'cyan' },
          { label: 'نشط', value: stats.active, icon: CheckCircle, color: 'green' },
          { label: 'قيد الانتظار', value: stats.pending, icon: Clock, color: 'amber' },
          { label: 'زيارات اليوم', value: stats.today, icon: Calendar, color: 'purple' },
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
        </div>
        <SmartAlertWidget />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 mb-4 flex-wrap">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-cyan-500/20">
            <LayoutDashboard className="w-4 h-4 ml-1" />
            لوحة التحكم
          </TabsTrigger>
          <TabsTrigger value="gates" className="data-[state=active]:bg-green-500/20">
            <Radio className="w-4 h-4 ml-1" />
            البوابات
          </TabsTrigger>
          <TabsTrigger value="permits" className="data-[state=active]:bg-purple-500/20">
            <FileText className="w-4 h-4 ml-1" />
            التصاريح
          </TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-blue-500/20">
            <Calendar className="w-4 h-4 ml-1" />
            المواعيد
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-amber-500/20">
            <ClipboardList className="w-4 h-4 ml-1" />
            السجلات
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-red-500/20">
            <Ban className="w-4 h-4 ml-1" />
            التحقق الأمني
          </TabsTrigger>
          <TabsTrigger value="workflow" className="data-[state=active]:bg-orange-500/20">
            <ChevronRight className="w-4 h-4 ml-1" />
            سير العمل
          </TabsTrigger>
          <TabsTrigger value="identity" className="data-[state=active]:bg-indigo-500/20">
            <Eye className="w-4 h-4 ml-1" />
            تحقق الهوية
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-pink-500/20">
            <BarChart3 className="w-4 h-4 ml-1" />
            التقارير
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-teal-500/20">
            <Plug className="w-4 h-4 ml-1" />
            التكاملات
          </TabsTrigger>
          <TabsTrigger value="advanced-workflow" className="data-[state=active]:bg-rose-500/20">
            <Globe className="w-4 h-4 ml-1" />
            سير العمل المتقدم
          </TabsTrigger>
          <TabsTrigger value="advanced-identity" className="data-[state=active]:bg-violet-500/20">
            <Shield className="w-4 h-4 ml-1" />
            التحقق المتقدم
          </TabsTrigger>
          <TabsTrigger value="smart-alerts" className="data-[state=active]:bg-emerald-500/20">
            <Brain className="w-4 h-4 ml-1" />
            تنبيهات AI
          </TabsTrigger>
          <TabsTrigger value="unified-notifications" className="data-[state=active]:bg-sky-500/20">
            <Bell className="w-4 h-4 ml-1" />
            الإشعارات الموحدة
          </TabsTrigger>
          <TabsTrigger value="camera-integration" className="data-[state=active]:bg-fuchsia-500/20">
            <Camera className="w-4 h-4 ml-1" />
            تكامل الكاميرات
          </TabsTrigger>
          <TabsTrigger value="risk-assessment" className="data-[state=active]:bg-purple-500/20">
            <Brain className="w-4 h-4 ml-1" />
            تقييم المخاطر AI
          </TabsTrigger>
          <TabsTrigger value="approval-chain" className="data-[state=active]:bg-indigo-500/20">
            <ChevronRight className="w-4 h-4 ml-1" />
            سلاسل الموافقة
          </TabsTrigger>
          <TabsTrigger value="background-check" className="data-[state=active]:bg-cyan-500/20">
            <Shield className="w-4 h-4 ml-1" />
            فحص الخلفيات
          </TabsTrigger>
          <TabsTrigger value="security-analytics" className="data-[state=active]:bg-pink-500/20">
            <Eye className="w-4 h-4 ml-1" />
            تحليلات الأمان
          </TabsTrigger>
          <TabsTrigger value="kpi-dashboard" className="data-[state=active]:bg-blue-500/20">
            <BarChart3 className="w-4 h-4 ml-1" />
            لوحة KPI
          </TabsTrigger>
          <TabsTrigger value="advanced-ai-security" className="data-[state=active]:bg-gradient-to-r from-purple-500/20 to-pink-500/20">
            <Brain className="w-4 h-4 ml-1" />
            أمان AI متقدم
          </TabsTrigger>
          <TabsTrigger value="enhanced-notifications" className="data-[state=active]:bg-cyan-500/20">
            <Bell className="w-4 h-4 ml-1" />
            إشعارات متقدمة
          </TabsTrigger>
          <TabsTrigger value="custom-kpi" className="data-[state=active]:bg-indigo-500/20">
            <LayoutDashboard className="w-4 h-4 ml-1" />
            KPI مخصص
          </TabsTrigger>
          <TabsTrigger value="feedback" className="data-[state=active]:bg-amber-500/20">
            <ClipboardList className="w-4 h-4 ml-1" />
            تقييم الزوار
          </TabsTrigger>
          <TabsTrigger value="staff-comm" className="data-[state=active]:bg-blue-500/20">
            <Radio className="w-4 h-4 ml-1" />
            التواصل الداخلي
          </TabsTrigger>
          <TabsTrigger value="geofencing" className="data-[state=active]:bg-green-500/20">
            <Globe className="w-4 h-4 ml-1" />
            السياج الجغرافي
          </TabsTrigger>
          <TabsTrigger value="feedback-analytics" className="data-[state=active]:bg-purple-500/20">
            <Brain className="w-4 h-4 ml-1" />
            تحليلات التعليقات AI
          </TabsTrigger>
          <TabsTrigger value="advanced-comm" className="data-[state=active]:bg-indigo-500/20">
            <Radio className="w-4 h-4 ml-1" />
            تواصل متقدم
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <VisitorDashboard />
        </TabsContent>

        <TabsContent value="gates">
          <SmartGatesModule />
        </TabsContent>

        <TabsContent value="schedule">
          <VisitScheduling />
        </TabsContent>

        <TabsContent value="logs">
          <CheckInOutLog />
        </TabsContent>

        <TabsContent value="security">
          <SecurityScreening />
        </TabsContent>

        <TabsContent value="workflow">
          <PermitWorkflow />
        </TabsContent>

        <TabsContent value="identity">
          <IdentityVerification />
        </TabsContent>

        <TabsContent value="reports">
          <div className="space-y-6">
            <CustomizableDashboard />
            <AIBehaviorAnalytics />
            <VisitorReports />
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <ExternalIntegrations />
        </TabsContent>

        <TabsContent value="advanced-workflow">
          <AdvancedPermitWorkflow />
        </TabsContent>

        <TabsContent value="advanced-identity">
          <AdvancedIdentityVerification />
        </TabsContent>

        <TabsContent value="smart-alerts">
          <SmartAlertAnalytics />
        </TabsContent>

        <TabsContent value="unified-notifications">
          <UnifiedNotificationCenter />
        </TabsContent>

        <TabsContent value="camera-integration">
          <CameraIntegrationModule />
        </TabsContent>

        <TabsContent value="risk-assessment">
          <AIRiskAssessment />
        </TabsContent>

        <TabsContent value="approval-chain">
          <MultiLevelApproval />
        </TabsContent>

        <TabsContent value="background-check">
          <AutomatedBackgroundCheck />
        </TabsContent>

        <TabsContent value="security-analytics">
          <AISecurityAnalytics />
        </TabsContent>

        <TabsContent value="kpi-dashboard">
          <KPIDashboard />
        </TabsContent>

        <TabsContent value="advanced-ai-security">
          <AdvancedAISecurityModule />
        </TabsContent>

        <TabsContent value="enhanced-notifications">
          <EnhancedNotificationSystem />
        </TabsContent>

        <TabsContent value="custom-kpi">
          <CustomizableKPIDashboard />
        </TabsContent>

        <TabsContent value="feedback">
          <VisitorFeedback />
        </TabsContent>

        <TabsContent value="staff-comm">
          <StaffCommunication />
        </TabsContent>

        <TabsContent value="geofencing">
          <GeofencingModule />
        </TabsContent>

        <TabsContent value="feedback-analytics">
          <VisitorFeedbackAnalytics />
        </TabsContent>

        <TabsContent value="advanced-comm">
          <AdvancedStaffCommunication />
        </TabsContent>

        <TabsContent value="permits">
      {/* Filters */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="بحث بالاسم أو رقم التصريح..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {visitorTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="approved">معتمد</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="expired">منتهي</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Permits List */}
      <div className="space-y-3">
        {filteredPermits.map((permit, i) => {
          const typeConfig = getTypeConfig(permit.visitor_type);
          const TypeIcon = typeConfig.icon;
          return (
            <motion.div key={permit.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 hover:border-cyan-500/30 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-${typeConfig.color}-500/20`}>
                        <TypeIcon className={`w-6 h-6 text-${typeConfig.color}-400`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-bold">{permit.visitor_name}</h3>
                          <Badge className={`text-xs bg-${typeConfig.color}-500/20 text-${typeConfig.color}-400`}>
                            {typeConfig.name}
                          </Badge>
                          <Badge className={`text-xs ${
                            permit.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            permit.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                            permit.status === 'approved' ? 'bg-cyan-500/20 text-cyan-400' :
                            permit.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {permit.status === 'active' ? 'نشط' : permit.status === 'pending' ? 'قيد الانتظار' : permit.status === 'approved' ? 'معتمد' : permit.status === 'rejected' ? 'مرفوض' : 'منتهي'}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm">{permit.company} • {permit.purpose}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{permit.start_date} - {permit.end_date}</span>
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />المضيف: {permit.host_name}</span>
                          {permit.vehicle_info?.has_vehicle && (
                            <span className="flex items-center gap-1"><Car className="w-3 h-3" />{permit.vehicle_info.plate_number}</span>
                          )}
                        </div>
                        {/* Gates & Zones */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {permit.allowed_gates?.map(g => {
                            const gate = gates.find(gt => gt.id === g);
                            return gate && <Badge key={g} variant="outline" className="border-cyan-500/50 text-cyan-400 text-xs"><DoorOpen className="w-3 h-3 ml-1" />{gate.name}</Badge>;
                          })}
                          {permit.allowed_zones?.map(z => {
                            const zone = zones.find(zn => zn.id === z);
                            return zone && <Badge key={z} variant="outline" className="border-purple-500/50 text-purple-400 text-xs"><MapPin className="w-3 h-3 ml-1" />{zone.name}</Badge>;
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {permit.status === 'pending' && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={() => approvePermit(permit.id)}>
                            <Check className="w-3 h-3 ml-1" />اعتماد
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 h-8" onClick={() => rejectPermit(permit.id)}>
                            <X className="w-3 h-3 ml-1" />رفض
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" className="border-slate-600 h-8" onClick={() => { setSelectedPermit(permit); }}>
                        <Eye className="w-3 h-3 ml-1" />عرض
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8">
                        <QrCode className="w-4 h-4 text-slate-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Create Permit Dialog */}
      <Dialog open={showPermitDialog} onOpenChange={setShowPermitDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              إنشاء تصريح جديد
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1 mb-4">
              <TabsTrigger value="basic">البيانات الأساسية</TabsTrigger>
              <TabsTrigger value="timing">التوقيت والمدة</TabsTrigger>
              <TabsTrigger value="access">الوصول والبوابات</TabsTrigger>
              <TabsTrigger value="vehicle">بيانات المركبة</TabsTrigger>
              <TabsTrigger value="custom">حقول مخصصة</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">نوع الزائر</Label>
                  <Select value={newPermit.visitor_type} onValueChange={(v) => setNewPermit({ ...newPermit, visitor_type: v })}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {visitorTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">الاسم الكامل *</Label>
                  <Input value={newPermit.visitor_name} onChange={(e) => setNewPermit({ ...newPermit, visitor_name: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="اسم الزائر" />
                </div>
                <div>
                  <Label className="text-slate-300">رقم الهوية</Label>
                  <Input value={newPermit.id_number} onChange={(e) => setNewPermit({ ...newPermit, id_number: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="رقم الهوية أو الإقامة" />
                </div>
                <div>
                  <Label className="text-slate-300">الشركة/الجهة</Label>
                  <Input value={newPermit.company} onChange={(e) => setNewPermit({ ...newPermit, company: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="اسم الشركة" />
                </div>
                <div>
                  <Label className="text-slate-300">الهاتف</Label>
                  <Input value={newPermit.phone} onChange={(e) => setNewPermit({ ...newPermit, phone: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="+966 5XX XXX XXXX" />
                </div>
                <div>
                  <Label className="text-slate-300">البريد الإلكتروني</Label>
                  <Input value={newPermit.email} onChange={(e) => setNewPermit({ ...newPermit, email: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="email@example.com" />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-slate-300">غرض الزيارة *</Label>
                  <Input value={newPermit.purpose} onChange={(e) => setNewPermit({ ...newPermit, purpose: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="سبب الزيارة" />
                </div>
                <div>
                  <Label className="text-slate-300">اسم المضيف</Label>
                  <Input value={newPermit.host_name} onChange={(e) => setNewPermit({ ...newPermit, host_name: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="الشخص المسؤول" />
                </div>
                <div>
                  <Label className="text-slate-300">قسم المضيف</Label>
                  <Input value={newPermit.host_department} onChange={(e) => setNewPermit({ ...newPermit, host_department: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="القسم" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">يتطلب مرافق</p>
                  <p className="text-slate-400 text-sm">يجب أن يرافق الزائر موظف</p>
                </div>
                <Switch checked={newPermit.escort_required} onCheckedChange={(v) => setNewPermit({ ...newPermit, escort_required: v })} />
              </div>
              {newPermit.escort_required && (
                <div>
                  <Label className="text-slate-300">اسم المرافق</Label>
                  <Input value={newPermit.escort_name} onChange={(e) => setNewPermit({ ...newPermit, escort_name: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="اسم الموظف المرافق" />
                </div>
              )}
            </TabsContent>

            <TabsContent value="timing" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">تاريخ البداية *</Label>
                  <Input type="date" value={newPermit.start_date} onChange={(e) => setNewPermit({ ...newPermit, start_date: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-slate-300">تاريخ الانتهاء *</Label>
                  <Input type="date" value={newPermit.end_date} onChange={(e) => setNewPermit({ ...newPermit, end_date: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-slate-300">وقت الدخول المسموح</Label>
                  <Input type="time" value={newPermit.entry_time} onChange={(e) => setNewPermit({ ...newPermit, entry_time: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-slate-300">وقت الخروج المسموح</Label>
                  <Input type="time" value={newPermit.exit_time} onChange={(e) => setNewPermit({ ...newPermit, exit_time: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block">الأيام المسموحة</Label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => (
                    <Badge
                      key={day.id}
                      variant="outline"
                      className={`cursor-pointer transition-all ${newPermit.allowed_days.includes(day.id) ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400' : 'border-slate-600 text-slate-400'}`}
                      onClick={() => {
                        const days = newPermit.allowed_days.includes(day.id)
                          ? newPermit.allowed_days.filter(d => d !== day.id)
                          : [...newPermit.allowed_days, day.id];
                        setNewPermit({ ...newPermit, allowed_days: days });
                      }}
                    >
                      {day.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="access" className="space-y-4">
              <div>
                <Label className="text-slate-300 mb-2 block">البوابات المسموحة</Label>
                <div className="grid md:grid-cols-2 gap-2">
                  {gates.map(gate => (
                    <div
                      key={gate.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all flex items-center gap-3 ${newPermit.allowed_gates.includes(gate.id) ? 'bg-cyan-500/20 border border-cyan-500/50' : 'bg-slate-800/50 border border-slate-700'}`}
                      onClick={() => {
                        const g = newPermit.allowed_gates.includes(gate.id)
                          ? newPermit.allowed_gates.filter(x => x !== gate.id)
                          : [...newPermit.allowed_gates, gate.id];
                        setNewPermit({ ...newPermit, allowed_gates: g });
                      }}
                    >
                      <DoorOpen className={`w-5 h-5 ${newPermit.allowed_gates.includes(gate.id) ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span className={newPermit.allowed_gates.includes(gate.id) ? 'text-white' : 'text-slate-300'}>{gate.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block">المناطق المسموحة</Label>
                <div className="grid md:grid-cols-2 gap-2">
                  {zones.map(zone => (
                    <div
                      key={zone.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all flex items-center gap-3 ${newPermit.allowed_zones.includes(zone.id) ? 'bg-purple-500/20 border border-purple-500/50' : 'bg-slate-800/50 border border-slate-700'}`}
                      onClick={() => {
                        const z = newPermit.allowed_zones.includes(zone.id)
                          ? newPermit.allowed_zones.filter(x => x !== zone.id)
                          : [...newPermit.allowed_zones, zone.id];
                        setNewPermit({ ...newPermit, allowed_zones: z });
                      }}
                    >
                      <MapPin className={`w-5 h-5 ${newPermit.allowed_zones.includes(zone.id) ? 'text-purple-400' : 'text-slate-400'}`} />
                      <span className={newPermit.allowed_zones.includes(zone.id) ? 'text-white' : 'text-slate-300'}>{zone.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block">الكاميرات المرتبطة</Label>
                <div className="grid md:grid-cols-2 gap-2">
                  {cameras.map(cam => (
                    <div
                      key={cam.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all flex items-center gap-3 ${newPermit.linked_cameras.includes(cam.id) ? 'bg-red-500/20 border border-red-500/50' : 'bg-slate-800/50 border border-slate-700'}`}
                      onClick={() => {
                        const c = newPermit.linked_cameras.includes(cam.id)
                          ? newPermit.linked_cameras.filter(x => x !== cam.id)
                          : [...newPermit.linked_cameras, cam.id];
                        setNewPermit({ ...newPermit, linked_cameras: c });
                      }}
                    >
                      <Camera className={`w-5 h-5 ${newPermit.linked_cameras.includes(cam.id) ? 'text-red-400' : 'text-slate-400'}`} />
                      <span className={newPermit.linked_cameras.includes(cam.id) ? 'text-white' : 'text-slate-300'}>{cam.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vehicle" className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-white font-medium">يوجد مركبة</p>
                    <p className="text-slate-400 text-sm">تفعيل بيانات المركبة</p>
                  </div>
                </div>
                <Switch checked={newPermit.vehicle_info.has_vehicle} onCheckedChange={(v) => setNewPermit({ ...newPermit, vehicle_info: { ...newPermit.vehicle_info, has_vehicle: v } })} />
              </div>

              {newPermit.vehicle_info.has_vehicle && (
                <>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-300">رقم اللوحة *</Label>
                      <Input value={newPermit.vehicle_info.plate_number} onChange={(e) => setNewPermit({ ...newPermit, vehicle_info: { ...newPermit.vehicle_info, plate_number: e.target.value } })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="ABC 1234" />
                    </div>
                    <div>
                      <Label className="text-slate-300">نوع اللوحة</Label>
                      <Select value={newPermit.vehicle_info.plate_type} onValueChange={(v) => setNewPermit({ ...newPermit, vehicle_info: { ...newPermit.vehicle_info, plate_type: v } })}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="خاص">خاص</SelectItem>
                          <SelectItem value="نقل عام">نقل عام</SelectItem>
                          <SelectItem value="تجاري">تجاري</SelectItem>
                          <SelectItem value="حكومي">حكومي</SelectItem>
                          <SelectItem value="دبلوماسي">دبلوماسي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-300">نوع المركبة</Label>
                      <Select value={newPermit.vehicle_info.vehicle_type} onValueChange={(v) => setNewPermit({ ...newPermit, vehicle_info: { ...newPermit.vehicle_info, vehicle_type: v } })}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1"><SelectValue placeholder="اختر النوع" /></SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {vehicleTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-300">الماركة</Label>
                      <Input value={newPermit.vehicle_info.vehicle_brand} onChange={(e) => setNewPermit({ ...newPermit, vehicle_info: { ...newPermit.vehicle_info, vehicle_brand: e.target.value } })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="تويوتا، نيسان..." />
                    </div>
                    <div>
                      <Label className="text-slate-300">الموديل</Label>
                      <Input value={newPermit.vehicle_info.vehicle_model} onChange={(e) => setNewPermit({ ...newPermit, vehicle_info: { ...newPermit.vehicle_info, vehicle_model: e.target.value } })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="كامري، باترول..." />
                    </div>
                    <div>
                      <Label className="text-slate-300">اللون</Label>
                      <Input value={newPermit.vehicle_info.vehicle_color} onChange={(e) => setNewPermit({ ...newPermit, vehicle_info: { ...newPermit.vehicle_info, vehicle_color: e.target.value } })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="أبيض، أسود..." />
                    </div>
                    <div>
                      <Label className="text-slate-300">سنة الصنع</Label>
                      <Input value={newPermit.vehicle_info.vehicle_year} onChange={(e) => setNewPermit({ ...newPermit, vehicle_info: { ...newPermit.vehicle_info, vehicle_year: e.target.value } })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="2024" />
                    </div>
                  </div>

                  {/* Cargo Info */}
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <h4 className="text-amber-300 font-medium mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      بيانات الحمولة
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-slate-300">نوع الحمولة</Label>
                        <Select value={newPermit.vehicle_info.cargo_type} onValueChange={(v) => setNewPermit({ ...newPermit, vehicle_info: { ...newPermit.vehicle_info, cargo_type: v } })}>
                          <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1"><SelectValue placeholder="اختر نوع الحمولة" /></SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {cargoTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-slate-300">الوزن</Label>
                        <Input value={newPermit.vehicle_info.cargo_weight} onChange={(e) => setNewPermit({ ...newPermit, vehicle_info: { ...newPermit.vehicle_info, cargo_weight: e.target.value } })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="500 كجم" />
                      </div>
                      <div className="md:col-span-1">
                        <Label className="text-slate-300">وصف الحمولة</Label>
                        <Input value={newPermit.vehicle_info.cargo_description} onChange={(e) => setNewPermit({ ...newPermit, vehicle_info: { ...newPermit.vehicle_info, cargo_description: e.target.value } })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="وصف مختصر" />
                      </div>
                    </div>
                  </div>

                  {/* Driver Info */}
                  <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <h4 className="text-cyan-300 font-medium mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      بيانات السائق
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-slate-300">اسم السائق</Label>
                        <Input value={newPermit.vehicle_info.driver_name} onChange={(e) => setNewPermit({ ...newPermit, vehicle_info: { ...newPermit.vehicle_info, driver_name: e.target.value } })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
                      </div>
                      <div>
                        <Label className="text-slate-300">رقم هوية السائق</Label>
                        <Input value={newPermit.vehicle_info.driver_id} onChange={(e) => setNewPermit({ ...newPermit, vehicle_info: { ...newPermit.vehicle_info, driver_id: e.target.value } })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
                      </div>
                      <div>
                        <Label className="text-slate-300">رقم رخصة القيادة</Label>
                        <Input value={newPermit.vehicle_info.driver_license} onChange={(e) => setNewPermit({ ...newPermit, vehicle_info: { ...newPermit.vehicle_info, driver_license: e.target.value } })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <h4 className="text-purple-300 font-medium mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  إضافة حقل مخصص
                </h4>
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-slate-300">اسم الحقل</Label>
                    <Input value={customFieldName} onChange={(e) => setCustomFieldName(e.target.value)} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="مثال: رقم العقد" />
                  </div>
                  <div>
                    <Label className="text-slate-300">القيمة</Label>
                    <Input value={customFieldValue} onChange={(e) => setCustomFieldValue(e.target.value)} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="مثال: C-2024-001" />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addCustomField} className="bg-purple-600 hover:bg-purple-700 w-full">
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة
                    </Button>
                  </div>
                </div>
              </div>

              {newPermit.custom_fields.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-slate-300">الحقول المخصصة</Label>
                  {newPermit.custom_fields.map((field, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div>
                        <span className="text-slate-400 text-sm">{field.field_name}:</span>
                        <span className="text-white mr-2">{field.field_value}</span>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => removeCustomField(i)}>
                        <X className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <Label className="text-slate-300">ملاحظات</Label>
                <Textarea value={newPermit.notes} onChange={(e) => setNewPermit({ ...newPermit, notes: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="ملاحظات إضافية..." rows={3} />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 mt-6 pt-4 border-t border-slate-700">
            <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={createPermit}>
              <Check className="w-4 h-4 ml-2" />
              إنشاء التصريح
            </Button>
            <Button variant="outline" className="border-slate-600" onClick={() => { setShowPermitDialog(false); resetForm(); }}>
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>

        </TabsContent>
      </Tabs>

      {/* Permit Details Dialog */}
      <Dialog open={!!selectedPermit} onOpenChange={() => setSelectedPermit(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              تفاصيل التصريح - {selectedPermit?.permit_number}
            </DialogTitle>
          </DialogHeader>
          {selectedPermit && (
            <div className="space-y-4 mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">الزائر</p>
                  <p className="text-white font-medium">{selectedPermit.visitor_name}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">الشركة</p>
                  <p className="text-white">{selectedPermit.company || '-'}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">الغرض</p>
                  <p className="text-white">{selectedPermit.purpose}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">المضيف</p>
                  <p className="text-white">{selectedPermit.host_name}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">الفترة</p>
                  <p className="text-white">{selectedPermit.start_date} - {selectedPermit.end_date}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">الحالة</p>
                  <Badge className={`${selectedPermit.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {selectedPermit.status}
                  </Badge>
                </div>
              </div>
              {selectedPermit.vehicle_info?.has_vehicle && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <h4 className="text-amber-300 font-medium mb-2">بيانات المركبة</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p className="text-slate-400">اللوحة: <span className="text-white">{selectedPermit.vehicle_info.plate_number}</span></p>
                    <p className="text-slate-400">النوع: <span className="text-white">{selectedPermit.vehicle_info.vehicle_type}</span></p>
                    {selectedPermit.vehicle_info.cargo_type && <p className="text-slate-400">الحمولة: <span className="text-white">{selectedPermit.vehicle_info.cargo_type}</span></p>}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                  <QrCode className="w-4 h-4 ml-2" />
                  طباعة QR
                </Button>
                <Button variant="outline" className="border-slate-600">
                  <Edit className="w-4 h-4 ml-2" />
                  تعديل
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}