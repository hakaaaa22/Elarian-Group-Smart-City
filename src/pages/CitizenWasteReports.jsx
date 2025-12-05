import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  FileText, MapPin, Camera, Upload, Package, AlertTriangle, CheckCircle,
  Clock, Send, Eye, Trash2, Search, Filter, Plus, Phone, Mail, User,
  Navigation, RefreshCw, Bell, Star, MessageSquare, Map, Layers, Brain,
  Scan, ShieldAlert, Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import AdvancedTrackingPanel from '@/components/waste/AdvancedTrackingPanel';
import CitizenRouteOptimizer from '@/components/waste/CitizenRouteOptimizer';

// بلاغات تجريبية
const sampleReports = [
  { id: 'RPT-001', type: 'broken', location: 'حي الورود - شارع 12', description: 'حاوية مكسورة والغطاء لا يغلق', status: 'pending', priority: 'high', createdAt: '2024-12-04 08:30', photos: ['photo1.jpg'], citizenName: 'أحمد محمد', phone: '0501234567' },
  { id: 'RPT-002', type: 'overflow', location: 'المنتزه المركزي', description: 'الحاوية ممتلئة تماماً والنفايات على الأرض', status: 'in_progress', priority: 'critical', createdAt: '2024-12-04 07:15', photos: ['photo2.jpg', 'photo3.jpg'], citizenName: 'فاطمة علي', phone: '0559876543', assignedTruck: 'TRK-001' },
  { id: 'RPT-003', type: 'smell', location: 'شارع الأمير سلطان', description: 'رائحة كريهة من الحاوية', status: 'resolved', priority: 'medium', createdAt: '2024-12-03 16:45', photos: [], citizenName: 'خالد سعيد', phone: '0541112233', resolvedAt: '2024-12-03 18:30' },
  { id: 'RPT-004', type: 'missing', location: 'حي الصفا', description: 'الحاوية مفقودة من مكانها', status: 'pending', priority: 'high', createdAt: '2024-12-04 09:00', photos: ['photo4.jpg'], citizenName: 'نورة أحمد', phone: '0567778899' },
];

// طلبات الجمع الضخم
const bulkRequests = [
  { id: 'BLK-001', location: 'حي الروضة - فيلا 45', description: 'أثاث قديم (سرير + خزانة)', status: 'scheduled', priority: 'medium', createdAt: '2024-12-03 14:00', scheduledDate: '2024-12-05', citizenName: 'سعود العتيبي', phone: '0508887766', estimatedWeight: '200 كغ' },
  { id: 'BLK-002', location: 'حي الملقا', description: 'مخلفات تجديد منزل', status: 'pending', priority: 'low', createdAt: '2024-12-04 10:30', citizenName: 'محمد الشهري', phone: '0532221100', estimatedWeight: '500 كغ' },
  { id: 'BLK-003', location: 'المنطقة الصناعية', description: 'معدات مكتبية قديمة', status: 'completed', priority: 'medium', createdAt: '2024-12-02 11:00', completedAt: '2024-12-03 09:00', citizenName: 'شركة الأمل', phone: '0114445566', estimatedWeight: '300 كغ' },
];

// الحاويات الذكية للخريطة
const smartBins = [
  { id: 'BIN-001', location: 'شارع الملك فهد', lat: 24.7136, lng: 46.6753, fillLevel: 85, type: 'general', status: 'active' },
  { id: 'BIN-002', location: 'حي الورود', lat: 24.7200, lng: 46.6800, fillLevel: 45, type: 'recyclable', status: 'active' },
  { id: 'BIN-003', location: 'المنتزه المركزي', lat: 24.7050, lng: 46.6900, fillLevel: 92, type: 'organic', status: 'alert' },
  { id: 'BIN-004', location: 'مركز التسوق', lat: 24.7180, lng: 46.6650, fillLevel: 30, type: 'general', status: 'active' },
  { id: 'BIN-005', location: 'حي الصفا', lat: 24.7250, lng: 46.6550, fillLevel: 75, type: 'recyclable', status: 'active' },
];

const reportTypes = {
  broken: { label: 'حاوية مكسورة', color: 'amber', icon: AlertTriangle },
  overflow: { label: 'امتلاء زائد', color: 'red', icon: Trash2 },
  smell: { label: 'رائحة كريهة', color: 'purple', icon: AlertTriangle },
  missing: { label: 'حاوية مفقودة', color: 'cyan', icon: Search },
  other: { label: 'أخرى', color: 'slate', icon: FileText },
};

const statusConfig = {
  pending: { label: 'قيد الانتظار', color: 'amber' },
  in_progress: { label: 'جاري المعالجة', color: 'cyan' },
  scheduled: { label: 'مجدول', color: 'blue' },
  resolved: { label: 'تم الحل', color: 'green' },
  completed: { label: 'مكتمل', color: 'green' },
};

export default function CitizenWasteReports() {
  const [activeTab, setActiveTab] = useState('reports');
  const [showNewReportDialog, setShowNewReportDialog] = useState(false);
  const [showNewBulkDialog, setShowNewBulkDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState(sampleReports);
  const [bulks, setBulks] = useState(bulkRequests);
  
  // New report form
  const [newReport, setNewReport] = useState({
    type: '',
    location: '',
    description: '',
    citizenName: '',
    phone: '',
    photos: []
  });

  // New bulk request form
  const [newBulk, setNewBulk] = useState({
    location: '',
    description: '',
    citizenName: '',
    phone: '',
    estimatedWeight: '',
    preferredDate: ''
  });

  // AI Image Analysis state
  const [showImageAnalysis, setShowImageAnalysis] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);

  // AI Image Analysis Mutation
  const analyzeContaminationImage = useMutation({
    mutationFn: async (imageData) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في تحليل صور النفايات وتحديد التلوث، قم بتحليل الصورة المرفقة/الموصوفة وتحديد:

نوع الحاوية المفترض: ${imageData.binType || 'عامة'}
الوصف المقدم: ${imageData.description}
الموقع: ${imageData.location}

قدم تحليلاً شاملاً يتضمن:
1. أنواع التلوث المكتشفة (مثل: مواد عضوية في حاويات التدوير، زجاج مكسور، مواد خطرة)
2. نسبة خطورة كل نوع تلوث (من 0-100)
3. التأثير البيئي والصحي المحتمل
4. إجراءات تصحيحية فورية مقترحة
5. توصيات للمواطن والفريق الميداني`,
        response_json_schema: {
          type: "object",
          properties: {
            contaminationTypes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  description: { type: "string" },
                  riskLevel: { type: "number" },
                  quantity: { type: "string" }
                }
              }
            },
            overallRiskScore: { type: "number" },
            riskCategory: { type: "string" },
            environmentalImpact: { type: "string" },
            healthRisk: { type: "string" },
            immediateActions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  responsible: { type: "string" }
                }
              }
            },
            citizenRecommendations: { type: "array", items: { type: "string" } },
            fieldTeamRecommendations: { type: "array", items: { type: "string" } },
            specialEquipmentNeeded: { type: "array", items: { type: "string" } },
            estimatedCleanupTime: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setImageAnalysisResult(data);
      setAnalyzingImage(false);
      toast.success('تم تحليل الصورة بنجاح');
    },
    onError: () => {
      setAnalyzingImage(false);
      toast.error('فشل في تحليل الصورة');
    }
  });

  const handleImageAnalysis = () => {
    setAnalyzingImage(true);
    analyzeContaminationImage.mutate({
      binType: newReport.type || 'general',
      description: newReport.description,
      location: newReport.location
    });
  };

  const submitReport = () => {
    if (!newReport.type || !newReport.location || !newReport.description) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    const report = {
      id: `RPT-${String(reports.length + 1).padStart(3, '0')}`,
      ...newReport,
      status: 'pending',
      priority: newReport.type === 'overflow' ? 'critical' : 'medium',
      createdAt: new Date().toLocaleString('ar-SA'),
    };
    setReports([report, ...reports]);
    setNewReport({ type: '', location: '', description: '', citizenName: '', phone: '', photos: [] });
    setShowNewReportDialog(false);
    toast.success('تم إرسال البلاغ بنجاح');
  };

  const submitBulkRequest = () => {
    if (!newBulk.location || !newBulk.description) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    const bulk = {
      id: `BLK-${String(bulks.length + 1).padStart(3, '0')}`,
      ...newBulk,
      status: 'pending',
      priority: 'medium',
      createdAt: new Date().toLocaleString('ar-SA'),
    };
    setBulks([bulk, ...bulks]);
    setNewBulk({ location: '', description: '', citizenName: '', phone: '', estimatedWeight: '', preferredDate: '' });
    setShowNewBulkDialog(false);
    toast.success('تم إرسال طلب الجمع بنجاح');
  };

  const filteredReports = reports.filter(r => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchSearch = r.location.includes(searchQuery) || r.description.includes(searchQuery) || r.id.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  const stats = {
    totalReports: reports.length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    totalBulk: bulks.length,
    pendingBulk: bulks.filter(b => b.status === 'pending').length,
    resolvedToday: reports.filter(r => r.status === 'resolved').length,
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] p-4 md:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileText className="w-7 h-7 text-cyan-400" />
              خدمات بلاغات النفايات
            </h1>
            <p className="text-slate-400 mt-1">قدم بلاغاتك وتتبع حالتها</p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowNewReportDialog(true)}>
              <Plus className="w-4 h-4 ml-2" />
              بلاغ جديد
            </Button>
            <Button variant="outline" className="border-purple-500 text-purple-400" onClick={() => setShowNewBulkDialog(true)}>
              <Package className="w-4 h-4 ml-2" />
              طلب جمع ضخم
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'إجمالي البلاغات', value: stats.totalReports, color: 'cyan', icon: FileText },
            { label: 'قيد الانتظار', value: stats.pendingReports, color: 'amber', icon: Clock },
            { label: 'طلبات الجمع', value: stats.totalBulk, color: 'purple', icon: Package },
            { label: 'جمع معلق', value: stats.pendingBulk, color: 'blue', icon: AlertTriangle },
            { label: 'تم الحل اليوم', value: stats.resolvedToday, color: 'green', icon: CheckCircle },
          ].map(stat => (
            <Card key={stat.label} className={`bg-${stat.color}-500/10 border-${stat.color}-500/30`}>
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-5 h-5 text-${stat.color}-400 mx-auto mb-2`} />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className={`text-${stat.color}-400 text-xs`}>{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="reports" className="data-[state=active]:bg-cyan-500/20">
              <FileText className="w-4 h-4 ml-1" />
              البلاغات
            </TabsTrigger>
            <TabsTrigger value="bulk" className="data-[state=active]:bg-purple-500/20">
              <Package className="w-4 h-4 ml-1" />
              الجمع الضخم
            </TabsTrigger>
            <TabsTrigger value="tracking" className="data-[state=active]:bg-green-500/20">
              <Navigation className="w-4 h-4 ml-1" />
              تتبع الطلبات
            </TabsTrigger>
            <TabsTrigger value="map" className="data-[state=active]:bg-blue-500/20">
              <Map className="w-4 h-4 ml-1" />
              خريطة الحاويات
            </TabsTrigger>
            <TabsTrigger value="routes" className="data-[state=active]:bg-purple-500/20">
              <Navigation className="w-4 h-4 ml-1" />
              تحسين المسارات
            </TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="بحث في البلاغات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="in_progress">جاري المعالجة</SelectItem>
                  <SelectItem value="resolved">تم الحل</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredReports.map(report => {
                  const typeConfig = reportTypes[report.type] || reportTypes.other;
                  const TypeIcon = typeConfig.icon;
                  return (
                    <Card key={report.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl bg-${typeConfig.color}-500/20`}>
                              <TypeIcon className={`w-5 h-5 text-${typeConfig.color}-400`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-white font-bold">{report.id}</p>
                                <Badge className={`bg-${typeConfig.color}-500/20 text-${typeConfig.color}-400`}>
                                  {typeConfig.label}
                                </Badge>
                              </div>
                              <p className="text-slate-400 text-sm flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {report.location}
                              </p>
                            </div>
                          </div>
                          <Badge className={`bg-${statusConfig[report.status]?.color}-500/20 text-${statusConfig[report.status]?.color}-400`}>
                            {statusConfig[report.status]?.label}
                          </Badge>
                        </div>
                        <p className="text-white text-sm mb-3">{report.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {report.createdAt}
                            </span>
                            {report.photos?.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Camera className="w-3 h-3" />
                                {report.photos.length} صور
                              </span>
                            )}
                          </div>
                          <Button size="sm" variant="outline" className="border-slate-600" onClick={() => setSelectedReport(report)}>
                            <Eye className="w-3 h-3 ml-1" />
                            التفاصيل
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Bulk Requests Tab */}
          <TabsContent value="bulk" className="mt-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {bulks.map(bulk => (
                  <Card key={bulk.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-purple-500/20">
                            <Package className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-white font-bold">{bulk.id}</p>
                            <p className="text-slate-400 text-sm flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {bulk.location}
                            </p>
                          </div>
                        </div>
                        <Badge className={`bg-${statusConfig[bulk.status]?.color}-500/20 text-${statusConfig[bulk.status]?.color}-400`}>
                          {statusConfig[bulk.status]?.label}
                        </Badge>
                      </div>
                      <p className="text-white text-sm mb-3">{bulk.description}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-4">
                          <span>الوزن التقديري: {bulk.estimatedWeight}</span>
                          {bulk.scheduledDate && <span>موعد الجمع: {bulk.scheduledDate}</span>}
                        </div>
                        <span>{bulk.createdAt}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="mt-4">
            <AdvancedTrackingPanel />
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="mt-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Map className="w-4 h-4 text-blue-400" />
                  خريطة الحاويات الذكية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-800/50 rounded-lg flex items-center justify-center mb-4">
                  <p className="text-slate-500">خريطة تفاعلية للحاويات</p>
                </div>
                
                {/* Bins List */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {smartBins.map(bin => (
                    <div key={bin.id} className={`p-3 rounded-lg ${bin.fillLevel > 80 ? 'bg-red-500/10 border border-red-500/30' : 'bg-slate-800/50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{bin.id}</span>
                        <Badge className={bin.fillLevel > 80 ? 'bg-red-500/20 text-red-400' : bin.fillLevel > 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}>
                          {bin.fillLevel}%
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {bin.location}
                      </p>
                      <Progress value={bin.fillLevel} className="h-1.5 mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Routes Optimization Tab */}
          <TabsContent value="routes" className="mt-4">
            <CitizenRouteOptimizer />
          </TabsContent>
        </Tabs>

        {/* New Report Dialog */}
        <Dialog open={showNewReportDialog} onOpenChange={setShowNewReportDialog}>
          <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                تقديم بلاغ جديد
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">نوع البلاغ *</label>
                <Select value={newReport.type} onValueChange={(v) => setNewReport({...newReport, type: v})}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="اختر نوع البلاغ" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(reportTypes).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">الموقع *</label>
                <Input
                  placeholder="مثال: حي الورود - شارع 12"
                  value={newReport.location}
                  onChange={(e) => setNewReport({...newReport, location: e.target.value})}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">وصف المشكلة *</label>
                <Textarea
                  placeholder="اشرح المشكلة بالتفصيل..."
                  value={newReport.description}
                  onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                  className="bg-slate-800/50 border-slate-700 text-white h-24"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">الاسم</label>
                  <Input
                    placeholder="اسمك"
                    value={newReport.citizenName}
                    onChange={(e) => setNewReport({...newReport, citizenName: e.target.value})}
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">رقم الهاتف</label>
                  <Input
                    placeholder="05xxxxxxxx"
                    value={newReport.phone}
                    onChange={(e) => setNewReport({...newReport, phone: e.target.value})}
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">إرفاق صور</label>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 text-center">
                  <Camera className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">اسحب الصور هنا أو اضغط للاختيار</p>
                </div>
              </div>
              
              {/* AI Analysis Button */}
              {newReport.description && (
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full border-purple-500 text-purple-400 hover:bg-purple-500/10"
                  onClick={handleImageAnalysis}
                  disabled={analyzingImage}
                >
                  {analyzingImage ? (
                    <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4 ml-2" />
                  )}
                  تحليل التلوث بالذكاء الاصطناعي
                </Button>
              )}

              {/* AI Analysis Results */}
              {imageAnalysisResult && (
                <div className="space-y-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-purple-400 font-medium flex items-center gap-2">
                      <Scan className="w-4 h-4" />
                      نتائج تحليل التلوث
                    </p>
                    <Badge className={
                      imageAnalysisResult.overallRiskScore > 70 ? 'bg-red-500/20 text-red-400' :
                      imageAnalysisResult.overallRiskScore > 40 ? 'bg-amber-500/20 text-amber-400' :
                      'bg-green-500/20 text-green-400'
                    }>
                      خطورة: {imageAnalysisResult.overallRiskScore}%
                    </Badge>
                  </div>
                  
                  {/* Contamination Types */}
                  {imageAnalysisResult.contaminationTypes?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-slate-400 text-xs">أنواع التلوث المكتشفة:</p>
                      {imageAnalysisResult.contaminationTypes.map((contam, i) => (
                        <div key={i} className="p-2 bg-slate-800/50 rounded flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">{contam.type}</p>
                            <p className="text-slate-500 text-xs">{contam.description}</p>
                          </div>
                          <Badge className={
                            contam.riskLevel > 70 ? 'bg-red-500/20 text-red-400' :
                            contam.riskLevel > 40 ? 'bg-amber-500/20 text-amber-400' :
                            'bg-green-500/20 text-green-400'
                          }>
                            {contam.riskLevel}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Health & Environmental Risk */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-red-500/10 rounded">
                      <p className="text-red-400 text-xs">الخطر الصحي</p>
                      <p className="text-white text-xs">{imageAnalysisResult.healthRisk}</p>
                    </div>
                    <div className="p-2 bg-amber-500/10 rounded">
                      <p className="text-amber-400 text-xs">التأثير البيئي</p>
                      <p className="text-white text-xs">{imageAnalysisResult.environmentalImpact}</p>
                    </div>
                  </div>
                  
                  {/* Immediate Actions */}
                  {imageAnalysisResult.immediateActions?.length > 0 && (
                    <div>
                      <p className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        إجراءات فورية مطلوبة:
                      </p>
                      <div className="space-y-1">
                        {imageAnalysisResult.immediateActions.slice(0, 3).map((action, i) => (
                          <div key={i} className="flex items-center justify-between p-1.5 bg-slate-800/30 rounded text-xs">
                            <span className="text-white">{action.action}</span>
                            <Badge className={
                              action.priority === 'عاجل' || action.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              'bg-slate-600 text-slate-300'
                            } style={{fontSize: '10px'}}>
                              {action.priority}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Citizen Recommendations */}
                  {imageAnalysisResult.citizenRecommendations?.length > 0 && (
                    <div className="p-2 bg-cyan-500/10 rounded">
                      <p className="text-cyan-400 text-xs mb-1 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        نصائح للمواطن:
                      </p>
                      <ul className="space-y-0.5">
                        {imageAnalysisResult.citizenRecommendations.slice(0, 2).map((rec, i) => (
                          <li key={i} className="text-white text-xs">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Estimated Cleanup Time */}
                  {imageAnalysisResult.estimatedCleanupTime && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">وقت التنظيف المقدر:</span>
                      <span className="text-white">{imageAnalysisResult.estimatedCleanupTime}</span>
                    </div>
                  )}
                </div>
              )}

              <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={submitReport}>
                <Send className="w-4 h-4 ml-2" />
                إرسال البلاغ
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Bulk Request Dialog */}
        <Dialog open={showNewBulkDialog} onOpenChange={setShowNewBulkDialog}>
          <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                طلب جمع نفايات ضخمة
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">العنوان الكامل *</label>
                <Input
                  placeholder="مثال: حي الروضة - فيلا 45"
                  value={newBulk.location}
                  onChange={(e) => setNewBulk({...newBulk, location: e.target.value})}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">وصف النفايات *</label>
                <Textarea
                  placeholder="مثال: أثاث قديم، معدات، مخلفات بناء..."
                  value={newBulk.description}
                  onChange={(e) => setNewBulk({...newBulk, description: e.target.value})}
                  className="bg-slate-800/50 border-slate-700 text-white h-24"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">الوزن التقديري</label>
                  <Input
                    placeholder="مثال: 200 كغ"
                    value={newBulk.estimatedWeight}
                    onChange={(e) => setNewBulk({...newBulk, estimatedWeight: e.target.value})}
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">التاريخ المفضل</label>
                  <Input
                    type="date"
                    value={newBulk.preferredDate}
                    onChange={(e) => setNewBulk({...newBulk, preferredDate: e.target.value})}
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">الاسم</label>
                  <Input
                    placeholder="اسمك"
                    value={newBulk.citizenName}
                    onChange={(e) => setNewBulk({...newBulk, citizenName: e.target.value})}
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">رقم الهاتف</label>
                  <Input
                    placeholder="05xxxxxxxx"
                    value={newBulk.phone}
                    onChange={(e) => setNewBulk({...newBulk, phone: e.target.value})}
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={submitBulkRequest}>
                <Send className="w-4 h-4 ml-2" />
                إرسال الطلب
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Report Details Dialog */}
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">تفاصيل البلاغ {selectedReport?.id}</DialogTitle>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4 mt-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">نوع البلاغ</p>
                  <p className="text-white">{reportTypes[selectedReport.type]?.label}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">الموقع</p>
                  <p className="text-white">{selectedReport.location}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">الوصف</p>
                  <p className="text-white">{selectedReport.description}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">الحالة</p>
                  <Badge className={`bg-${statusConfig[selectedReport.status]?.color}-500/20 text-${statusConfig[selectedReport.status]?.color}-400`}>
                    {statusConfig[selectedReport.status]?.label}
                  </Badge>
                </div>
                {selectedReport.assignedTruck && (
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <p className="text-cyan-400 text-sm">الشاحنة المكلفة: {selectedReport.assignedTruck}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}