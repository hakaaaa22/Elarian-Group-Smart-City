import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, Search, Filter, Download, Trash2, Eye, Link2, Calendar,
  Radio, Car, Camera, Package, FolderOpen, Plus, X, Tag, Clock, User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

// بيانات المستندات التجريبية
const mockDocuments = [
  { id: 'DOC-001', title: 'دليل صيانة برج الاتصالات المركزي', document_type: 'maintenance_manual', asset_type: 'tower', asset_id: 'TWR-001', asset_name: 'برج الاتصالات المركزي', file_type: 'pdf', file_size: 2500000, tags: ['صيانة', 'أبراج'], created_date: '2024-11-15', expiry_date: null, status: 'active', uploaded_by: 'أحمد محمد' },
  { id: 'DOC-002', title: 'شهادة فحص برج المنطقة الشرقية', document_type: 'inspection_certificate', asset_type: 'tower', asset_id: 'TWR-002', asset_name: 'برج المنطقة الشرقية', file_type: 'pdf', file_size: 850000, tags: ['فحص', 'شهادة'], created_date: '2024-10-20', expiry_date: '2025-10-20', status: 'active', uploaded_by: 'سارة علي' },
  { id: 'DOC-003', title: 'عقد توريد معدات الكاميرات', document_type: 'supply_contract', asset_type: 'camera', asset_id: null, asset_name: 'كاميرات المراقبة', file_type: 'docx', file_size: 1200000, tags: ['عقد', 'توريد'], created_date: '2024-09-01', expiry_date: '2025-09-01', status: 'active', uploaded_by: 'خالد العتيبي' },
  { id: 'DOC-004', title: 'ضمان سيارة الدورية 1', document_type: 'warranty', asset_type: 'vehicle', asset_id: 'VEH-001', asset_name: 'سيارة الدورية 1', file_type: 'pdf', file_size: 450000, tags: ['ضمان', 'مركبات'], created_date: '2024-06-15', expiry_date: '2026-06-15', status: 'active', uploaded_by: 'فهد الدوسري' },
  { id: 'DOC-005', title: 'المواصفات الفنية لنظام AI Vision', document_type: 'technical_spec', asset_type: 'general', asset_id: null, asset_name: null, file_type: 'pdf', file_size: 3800000, tags: ['تقني', 'AI'], created_date: '2024-08-10', expiry_date: null, status: 'active', uploaded_by: 'محمد السبيعي' },
];

const documentTypes = [
  { id: 'maintenance_manual', name: 'دليل صيانة', icon: FileText, color: 'blue' },
  { id: 'inspection_certificate', name: 'شهادة فحص', icon: FileText, color: 'green' },
  { id: 'supply_contract', name: 'عقد توريد', icon: FileText, color: 'purple' },
  { id: 'warranty', name: 'ضمان', icon: FileText, color: 'amber' },
  { id: 'technical_spec', name: 'مواصفات فنية', icon: FileText, color: 'cyan' },
  { id: 'safety_report', name: 'تقرير سلامة', icon: FileText, color: 'red' },
  { id: 'other', name: 'أخرى', icon: FileText, color: 'slate' },
];

const assetTypes = [
  { id: 'tower', name: 'برج', icon: Radio },
  { id: 'vehicle', name: 'مركبة', icon: Car },
  { id: 'camera', name: 'كاميرا', icon: Camera },
  { id: 'equipment', name: 'معدات', icon: Package },
  { id: 'general', name: 'عام', icon: FolderOpen },
];

// أصول للربط
const assetsForLinking = [
  { id: 'TWR-001', name: 'برج الاتصالات المركزي', type: 'tower' },
  { id: 'TWR-002', name: 'برج المنطقة الشرقية', type: 'tower' },
  { id: 'TWR-003', name: 'برج المراقبة الجنوبي', type: 'tower' },
  { id: 'VEH-001', name: 'سيارة الدورية 1', type: 'vehicle' },
  { id: 'VEH-002', name: 'شاحنة النفايات 3', type: 'vehicle' },
  { id: 'CAM-001', name: 'كاميرا المدخل الرئيسي', type: 'camera' },
  { id: 'CAM-002', name: 'كاميرا الموقف A', type: 'camera' },
];

export default function DocumentManagement() {
  const [documents, setDocuments] = useState(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [assetTypeFilter, setAssetTypeFilter] = useState('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    document_type: 'maintenance_manual',
    asset_type: 'general',
    asset_id: '',
    description: '',
    tags: '',
    expiry_date: ''
  });

  const queryClient = useQueryClient();

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const result = await base44.integrations.Core.UploadFile({ file });
      return result;
    },
    onSuccess: (data) => {
      const selectedAsset = assetsForLinking.find(a => a.id === uploadForm.asset_id);
      const newDoc = {
        id: `DOC-${Date.now()}`,
        ...uploadForm,
        asset_name: selectedAsset?.name || null,
        file_url: data.file_url,
        file_type: 'pdf',
        file_size: 0,
        tags: uploadForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        created_date: new Date().toISOString().split('T')[0],
        status: 'active',
        uploaded_by: 'المستخدم الحالي'
      };
      setDocuments([newDoc, ...documents]);
      toast.success('تم رفع المستند بنجاح');
      setShowUploadDialog(false);
      setUploadForm({
        title: '',
        document_type: 'maintenance_manual',
        asset_type: 'general',
        asset_id: '',
        description: '',
        tags: '',
        expiry_date: ''
      });
    }
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const deleteDocument = (docId) => {
    setDocuments(documents.filter(d => d.id !== docId));
    toast.success('تم حذف المستند');
  };

  const filteredDocuments = documents.filter(doc => {
    if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !doc.tags?.some(t => t.includes(searchQuery))) {
      return false;
    }
    if (typeFilter !== 'all' && doc.document_type !== typeFilter) return false;
    if (assetTypeFilter !== 'all' && doc.asset_type !== assetTypeFilter) return false;
    return true;
  });

  const getDocTypeConfig = (type) => documentTypes.find(t => t.id === type) || documentTypes[6];
  const getAssetTypeConfig = (type) => assetTypes.find(t => t.id === type) || assetTypes[4];

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const stats = {
    total: documents.length,
    active: documents.filter(d => d.status === 'active').length,
    expiringSoon: documents.filter(d => {
      if (!d.expiry_date) return false;
      const expiry = new Date(d.expiry_date);
      const today = new Date();
      const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);
      return diffDays > 0 && diffDays <= 30;
    }).length,
    expired: documents.filter(d => d.expiry_date && new Date(d.expiry_date) < new Date()).length
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-cyan-400" />
            إدارة المستندات
          </h2>
          <p className="text-slate-400 text-sm">رفع وتخزين المستندات المرتبطة بالأصول</p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowUploadDialog(true)}>
          <Upload className="w-4 h-4 ml-2" />
          رفع مستند
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-slate-400">إجمالي المستندات</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-green-500/30 bg-green-500/5">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.active}</p>
            <p className="text-xs text-slate-400">نشطة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.expiringSoon}</p>
            <p className="text-xs text-slate-400">تنتهي قريباً</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-red-500/30 bg-red-500/5">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.expired}</p>
            <p className="text-xs text-slate-400">منتهية</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالعنوان أو الوسوم..."
            className="bg-slate-800 border-slate-700 pr-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
            <SelectValue placeholder="نوع المستند" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">جميع الأنواع</SelectItem>
            {documentTypes.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
          <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
            <SelectValue placeholder="نوع الأصل" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">جميع الأصول</SelectItem>
            {assetTypes.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Documents Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((doc, i) => {
          const typeConfig = getDocTypeConfig(doc.document_type);
          const assetConfig = getAssetTypeConfig(doc.asset_type);
          const AssetIcon = assetConfig.icon;

          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`glass-card border-${typeConfig.color}-500/30 bg-${typeConfig.color}-500/5 hover:scale-[1.02] transition-transform cursor-pointer`}
                onClick={() => { setSelectedDocument(doc); setShowViewDialog(true); }}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-lg bg-${typeConfig.color}-500/20`}>
                      <FileText className={`w-6 h-6 text-${typeConfig.color}-400`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`bg-${typeConfig.color}-500/20 text-${typeConfig.color}-400 text-xs`}>
                          {typeConfig.name}
                        </Badge>
                        <span className="text-slate-500 text-xs">{doc.file_type.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  {doc.asset_name && (
                    <div className="mt-3 p-2 bg-slate-800/50 rounded flex items-center gap-2">
                      <AssetIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300 text-sm">{doc.asset_name}</span>
                    </div>
                  )}

                  {doc.tags?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {doc.tags.slice(0, 3).map((tag, j) => (
                        <Badge key={j} variant="outline" className="text-xs border-slate-600">
                          <Tag className="w-3 h-3 ml-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {doc.created_date}
                    </span>
                    <span>{formatFileSize(doc.file_size)}</span>
                  </div>

                  {doc.expiry_date && (
                    <div className={`mt-2 p-2 rounded text-xs ${
                      new Date(doc.expiry_date) < new Date() ? 'bg-red-500/10 text-red-400' :
                      (new Date(doc.expiry_date) - new Date()) / (1000*60*60*24) <= 30 ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800/50 text-slate-400'
                    }`}>
                      <Clock className="w-3 h-3 inline ml-1" />
                      ينتهي: {doc.expiry_date}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">لا توجد مستندات</p>
          <Button className="mt-4 bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowUploadDialog(true)}>
            <Upload className="w-4 h-4 ml-2" />
            رفع مستند جديد
          </Button>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-cyan-400" />
              رفع مستند جديد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-slate-400 text-sm">عنوان المستند</label>
              <Input
                value={uploadForm.title}
                onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                className="bg-slate-800 border-slate-700 mt-1"
                placeholder="عنوان المستند"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-sm">نوع المستند</label>
                <Select value={uploadForm.document_type} onValueChange={(v) => setUploadForm({...uploadForm, document_type: v})}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {documentTypes.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-slate-400 text-sm">نوع الأصل</label>
                <Select value={uploadForm.asset_type} onValueChange={(v) => setUploadForm({...uploadForm, asset_type: v, asset_id: ''})}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {assetTypes.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {uploadForm.asset_type !== 'general' && (
              <div>
                <label className="text-slate-400 text-sm">ربط بأصل</label>
                <Select value={uploadForm.asset_id} onValueChange={(v) => setUploadForm({...uploadForm, asset_id: v})}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
                    <SelectValue placeholder="اختر الأصل" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {assetsForLinking.filter(a => a.type === uploadForm.asset_type).map(asset => (
                      <SelectItem key={asset.id} value={asset.id}>{asset.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-slate-400 text-sm">الوسوم (مفصولة بفاصلة)</label>
              <Input
                value={uploadForm.tags}
                onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                className="bg-slate-800 border-slate-700 mt-1"
                placeholder="صيانة, فحص, ..."
              />
            </div>

            <div>
              <label className="text-slate-400 text-sm">تاريخ انتهاء الصلاحية (اختياري)</label>
              <Input
                type="date"
                value={uploadForm.expiry_date}
                onChange={(e) => setUploadForm({...uploadForm, expiry_date: e.target.value})}
                className="bg-slate-800 border-slate-700 mt-1"
              />
            </div>

            <div>
              <label className="text-slate-400 text-sm">الملف</label>
              <div className="mt-1 border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400 text-sm mb-2">اسحب الملف هنا أو</p>
                <input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileUpload}
                />
                <label htmlFor="file-upload">
                  <Button type="button" variant="outline" className="border-slate-600" asChild>
                    <span>اختر ملف</span>
                  </Button>
                </label>
              </div>
            </div>

            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" disabled={!uploadForm.title || uploadMutation.isPending}>
              {uploadMutation.isPending ? 'جاري الرفع...' : 'رفع المستند'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              تفاصيل المستند
            </DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-white font-bold text-lg">{selectedDocument.title}</p>
                <Badge className="mt-2">{getDocTypeConfig(selectedDocument.document_type).name}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/30 rounded">
                  <p className="text-slate-500 text-xs">نوع الملف</p>
                  <p className="text-white">{selectedDocument.file_type?.toUpperCase()}</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded">
                  <p className="text-slate-500 text-xs">الحجم</p>
                  <p className="text-white">{formatFileSize(selectedDocument.file_size)}</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded">
                  <p className="text-slate-500 text-xs">تاريخ الرفع</p>
                  <p className="text-white">{selectedDocument.created_date}</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded">
                  <p className="text-slate-500 text-xs">رفع بواسطة</p>
                  <p className="text-white">{selectedDocument.uploaded_by}</p>
                </div>
              </div>

              {selectedDocument.asset_name && (
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded">
                  <p className="text-cyan-400 text-xs mb-1">مرتبط بـ</p>
                  <p className="text-white">{selectedDocument.asset_name}</p>
                </div>
              )}

              {selectedDocument.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedDocument.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="border-slate-600">
                      <Tag className="w-3 h-3 ml-1" />{tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                  <Download className="w-4 h-4 ml-2" />
                  تحميل
                </Button>
                <Button variant="outline" className="border-red-500/50 text-red-400" onClick={() => {
                  deleteDocument(selectedDocument.id);
                  setShowViewDialog(false);
                }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}