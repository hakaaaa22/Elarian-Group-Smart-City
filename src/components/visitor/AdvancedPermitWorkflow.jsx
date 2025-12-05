import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Clock, CheckCircle, XCircle, AlertTriangle, User, Building2,
  Calendar, Send, Eye, Edit, Trash2, MessageSquare, Bell, ArrowRight,
  ChevronDown, Filter, Search, Plus, RefreshCw, Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const workflowStages = [
  { id: 'request', name: 'طلب', icon: FileText, color: 'slate' },
  { id: 'review', name: 'مراجعة', icon: Eye, color: 'amber' },
  { id: 'approval', name: 'موافقة', icon: CheckCircle, color: 'blue' },
  { id: 'issued', name: 'إصدار', icon: Send, color: 'green' },
  { id: 'cancelled', name: 'ملغي', icon: XCircle, color: 'red' },
];

const mockPermits = [
  {
    id: 'P-2025-001',
    visitorName: 'أحمد محمد علي',
    visitorId: '1234567890',
    company: 'شركة التقنية المتقدمة',
    purpose: 'اجتماع عمل',
    host: 'م. خالد العريان',
    hostDept: 'تقنية المعلومات',
    requestDate: '2025-01-14',
    visitDate: '2025-01-16',
    validFrom: '09:00',
    validTo: '17:00',
    status: 'review',
    priority: 'high',
    vehiclePlate: 'أ ب ج 1234',
    notes: 'يرجى تجهيز قاعة الاجتماعات',
    history: [
      { action: 'إنشاء الطلب', by: 'النظام', date: '2025-01-14 09:00', notes: '' },
      { action: 'إرسال للمراجعة', by: 'أ. سارة', date: '2025-01-14 09:30', notes: 'تم التحقق من البيانات' },
    ]
  },
  {
    id: 'P-2025-002',
    visitorName: 'فاطمة عبدالله',
    visitorId: '0987654321',
    company: 'مؤسسة البناء الحديث',
    purpose: 'صيانة دورية',
    host: 'م. عبدالرحمن',
    hostDept: 'الصيانة',
    requestDate: '2025-01-13',
    visitDate: '2025-01-15',
    validFrom: '08:00',
    validTo: '14:00',
    status: 'approval',
    priority: 'medium',
    vehiclePlate: '',
    notes: '',
    history: [
      { action: 'إنشاء الطلب', by: 'النظام', date: '2025-01-13 10:00', notes: '' },
      { action: 'إرسال للمراجعة', by: 'أ. محمد', date: '2025-01-13 10:30', notes: '' },
      { action: 'موافقة المراجع', by: 'م. أحمد', date: '2025-01-14 08:00', notes: 'تمت الموافقة' },
    ]
  },
  {
    id: 'P-2025-003',
    visitorName: 'محمد سعيد',
    visitorId: '1122334455',
    company: 'شركة الأمن والحماية',
    purpose: 'تدريب الموظفين',
    host: 'أ. نورة',
    hostDept: 'الموارد البشرية',
    requestDate: '2025-01-12',
    visitDate: '2025-01-14',
    validFrom: '10:00',
    validTo: '16:00',
    status: 'issued',
    priority: 'low',
    vehiclePlate: 'ر س ط 5678',
    notes: 'مطلوب موقف سيارات',
    history: [
      { action: 'إنشاء الطلب', by: 'النظام', date: '2025-01-12 11:00', notes: '' },
      { action: 'إرسال للمراجعة', by: 'أ. خالد', date: '2025-01-12 11:30', notes: '' },
      { action: 'موافقة المراجع', by: 'م. سامي', date: '2025-01-12 14:00', notes: '' },
      { action: 'موافقة المدير', by: 'م. علي', date: '2025-01-13 09:00', notes: '' },
      { action: 'إصدار التصريح', by: 'النظام', date: '2025-01-13 09:05', notes: 'تم إرسال التصريح للزائر' },
    ]
  },
];

export default function AdvancedPermitWorkflow() {
  const [permits, setPermits] = useState(mockPermits);
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getStageIndex = (status) => {
    const index = workflowStages.findIndex(s => s.id === status);
    return index === -1 ? 0 : index;
  };

  const getStatusBadge = (status) => {
    const stage = workflowStages.find(s => s.id === status);
    if (!stage) return null;
    return (
      <Badge className={`bg-${stage.color}-500/20 text-${stage.color}-400`}>
        <stage.icon className="w-3 h-3 ml-1" />
        {stage.name}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-500/20 text-red-400',
      medium: 'bg-amber-500/20 text-amber-400',
      low: 'bg-green-500/20 text-green-400'
    };
    const labels = { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' };
    return <Badge className={colors[priority]}>{labels[priority]}</Badge>;
  };

  const handleAction = (permit, action) => {
    setSelectedPermit(permit);
    setActionType(action);
    setActionNotes('');
    setShowActionDialog(true);
  };

  const executeAction = () => {
    if (!selectedPermit || !actionType) return;

    const statusMap = {
      approve: selectedPermit.status === 'review' ? 'approval' : 'issued',
      reject: 'cancelled',
      cancel: 'cancelled'
    };

    const newStatus = statusMap[actionType];
    const actionLabel = {
      approve: 'تمت الموافقة',
      reject: 'تم الرفض',
      cancel: 'تم الإلغاء'
    }[actionType];

    setPermits(prev => prev.map(p => {
      if (p.id === selectedPermit.id) {
        return {
          ...p,
          status: newStatus,
          history: [...p.history, {
            action: actionLabel,
            by: 'المستخدم الحالي',
            date: new Date().toISOString().slice(0, 16).replace('T', ' '),
            notes: actionNotes
          }]
        };
      }
      return p;
    }));

    setShowActionDialog(false);
    toast.success(`تم ${actionLabel} للتصريح ${selectedPermit.id}`);
  };

  const filteredPermits = permits.filter(p => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesSearch = p.visitorName.includes(searchQuery) || 
                          p.id.includes(searchQuery) ||
                          p.company.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: permits.length,
    pending: permits.filter(p => ['request', 'review', 'approval'].includes(p.status)).length,
    issued: permits.filter(p => p.status === 'issued').length,
    cancelled: permits.filter(p => p.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-slate-400 text-sm">إجمالي الطلبات</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
              <p className="text-slate-400 text-sm">قيد المعالجة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.issued}</p>
              <p className="text-slate-400 text-sm">صادرة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.cancelled}</p>
              <p className="text-slate-400 text-sm">ملغاة</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="بحث بالاسم أو رقم التصريح..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9 bg-slate-900/50 border-slate-700 text-white"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 bg-slate-900/50 border-slate-700 text-white">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">جميع الحالات</SelectItem>
                {workflowStages.map(stage => (
                  <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="w-4 h-4 ml-2" />
              طلب جديد
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Permits List */}
      <div className="space-y-4">
        {filteredPermits.map((permit, i) => (
          <motion.div
            key={permit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="bg-slate-800/30 border-slate-700/50 hover:border-cyan-500/30 transition-all">
              <CardContent className="p-4">
                {/* Workflow Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    {workflowStages.slice(0, 4).map((stage, idx) => {
                      const currentIdx = getStageIndex(permit.status);
                      const isActive = idx <= currentIdx && permit.status !== 'cancelled';
                      const isCurrent = idx === currentIdx;
                      return (
                        <React.Fragment key={stage.id}>
                          <div className={`flex flex-col items-center ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCurrent ? `bg-${stage.color}-500 text-white` : 
                              isActive ? `bg-${stage.color}-500/30 text-${stage.color}-400` : 
                              'bg-slate-700 text-slate-500'
                            }`}>
                              <stage.icon className="w-4 h-4" />
                            </div>
                            <span className={`text-xs mt-1 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                              {stage.name}
                            </span>
                          </div>
                          {idx < 3 && (
                            <div className={`flex-1 h-0.5 mx-2 ${
                              idx < currentIdx && permit.status !== 'cancelled' ? 'bg-green-500' : 'bg-slate-700'
                            }`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Permit Info */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-cyan-400 font-mono text-sm">{permit.id}</span>
                      {getStatusBadge(permit.status)}
                      {getPriorityBadge(permit.priority)}
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">{permit.visitorName}</h3>
                    <p className="text-slate-400 text-sm">{permit.company}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <span className="text-slate-400 flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {permit.host}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {permit.hostDept}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {permit.visitDate}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {permit.validFrom} - {permit.validTo}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400"
                      onClick={() => { setSelectedPermit(permit); setShowDetailsDialog(true); }}
                    >
                      <Eye className="w-4 h-4 ml-1" />
                      التفاصيل
                    </Button>
                    {['review', 'approval'].includes(permit.status) && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleAction(permit, 'approve')}
                        >
                          <CheckCircle className="w-4 h-4 ml-1" />
                          موافقة
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAction(permit, 'reject')}
                        >
                          <XCircle className="w-4 h-4 ml-1" />
                          رفض
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              تفاصيل التصريح {selectedPermit?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedPermit && (
            <div className="space-y-4 mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-500 text-xs mb-1">اسم الزائر</p>
                  <p className="text-white">{selectedPermit.visitorName}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-500 text-xs mb-1">رقم الهوية</p>
                  <p className="text-white">{selectedPermit.visitorId}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-500 text-xs mb-1">الشركة</p>
                  <p className="text-white">{selectedPermit.company}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-500 text-xs mb-1">الغرض</p>
                  <p className="text-white">{selectedPermit.purpose}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-500 text-xs mb-1">المضيف</p>
                  <p className="text-white">{selectedPermit.host}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-500 text-xs mb-1">لوحة المركبة</p>
                  <p className="text-white">{selectedPermit.vehiclePlate || 'غير محدد'}</p>
                </div>
              </div>

              {/* History */}
              <div>
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  سجل العمليات
                </h4>
                <div className="space-y-2">
                  {selectedPermit.history.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm">{item.action}</span>
                          <span className="text-slate-500 text-xs">{item.date}</span>
                        </div>
                        <p className="text-slate-400 text-xs">بواسطة: {item.by}</p>
                        {item.notes && <p className="text-slate-500 text-xs mt-1">{item.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {actionType === 'approve' ? 'تأكيد الموافقة' : 
               actionType === 'reject' ? 'تأكيد الرفض' : 'تأكيد الإلغاء'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-slate-400">
              هل أنت متأكد من {actionType === 'approve' ? 'الموافقة على' : 
              actionType === 'reject' ? 'رفض' : 'إلغاء'} التصريح {selectedPermit?.id}؟
            </p>
            <div>
              <Label className="text-slate-300">ملاحظات (اختياري)</Label>
              <Textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="أضف ملاحظاتك..."
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="border-slate-600" onClick={() => setShowActionDialog(false)}>
              إلغاء
            </Button>
            <Button
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              onClick={executeAction}
            >
              تأكيد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}