import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Clock, Check, X, Send, Eye, Edit, User, Building2,
  ArrowRight, Bell, MessageSquare, AlertTriangle, CheckCircle, XCircle,
  Loader2, ChevronDown, ChevronUp, History
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const workflowSteps = [
  { id: 'submitted', label: 'تم التقديم', icon: Send, color: 'blue' },
  { id: 'review', label: 'قيد المراجعة', icon: Eye, color: 'amber' },
  { id: 'approved', label: 'تمت الموافقة', icon: Check, color: 'green' },
  { id: 'issued', label: 'تم الإصدار', icon: FileText, color: 'cyan' },
];

const mockPermitWorkflow = [
  {
    id: 1,
    permit_number: 'P-2024-001',
    visitor_name: 'شركة البناء المتقدم',
    purpose: 'صيانة دورية',
    requested_by: 'أحمد محمد',
    requested_date: '2024-12-04 08:30',
    current_step: 'review',
    priority: 'high',
    history: [
      { step: 'submitted', date: '2024-12-04 08:30', user: 'أحمد محمد', notes: 'طلب تصريح جديد' },
      { step: 'review', date: '2024-12-04 09:00', user: 'خالد العلي', notes: 'جاري المراجعة' },
    ]
  },
  {
    id: 2,
    permit_number: 'P-2024-002',
    visitor_name: 'مؤسسة النجاح',
    purpose: 'اجتماع عمل',
    requested_by: 'سارة أحمد',
    requested_date: '2024-12-04 09:15',
    current_step: 'submitted',
    priority: 'normal',
    history: [
      { step: 'submitted', date: '2024-12-04 09:15', user: 'سارة أحمد', notes: 'طلب تصريح زيارة' },
    ]
  },
  {
    id: 3,
    permit_number: 'P-2024-003',
    visitor_name: 'شركة التوصيل',
    purpose: 'توصيل طلبية',
    requested_by: 'محمد علي',
    requested_date: '2024-12-03 14:00',
    current_step: 'approved',
    priority: 'normal',
    history: [
      { step: 'submitted', date: '2024-12-03 14:00', user: 'محمد علي', notes: 'طلب تصريح توصيل' },
      { step: 'review', date: '2024-12-03 14:30', user: 'خالد العلي', notes: 'تمت المراجعة' },
      { step: 'approved', date: '2024-12-03 15:00', user: 'مدير الأمن', notes: 'موافقة على التصريح' },
    ]
  },
];

export default function PermitWorkflow({ onAction }) {
  const [permits, setPermits] = useState(mockPermitWorkflow);
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [showHistory, setShowHistory] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  const [showActionDialog, setShowActionDialog] = useState(null);

  const getStepIndex = (step) => workflowSteps.findIndex(s => s.id === step);

  const advanceWorkflow = (permitId, action, notes = '') => {
    setPermits(permits.map(p => {
      if (p.id !== permitId) return p;
      
      const currentIndex = getStepIndex(p.current_step);
      let newStep = p.current_step;
      let newHistory = [...p.history];

      if (action === 'approve') {
        if (currentIndex < workflowSteps.length - 1) {
          newStep = workflowSteps[currentIndex + 1].id;
          newHistory.push({
            step: newStep,
            date: new Date().toLocaleString('ar-SA'),
            user: 'المستخدم الحالي',
            notes: notes || `تم ${workflowSteps[currentIndex + 1].label}`
          });
        }
      } else if (action === 'reject') {
        newStep = 'rejected';
        newHistory.push({
          step: 'rejected',
          date: new Date().toLocaleString('ar-SA'),
          user: 'المستخدم الحالي',
          notes: notes || 'تم الرفض'
        });
      } else if (action === 'cancel') {
        newStep = 'cancelled';
        newHistory.push({
          step: 'cancelled',
          date: new Date().toLocaleString('ar-SA'),
          user: 'المستخدم الحالي',
          notes: notes || 'تم الإلغاء'
        });
      }

      return { ...p, current_step: newStep, history: newHistory };
    }));

    // إرسال إشعار
    const actionLabels = { approve: 'الموافقة', reject: 'الرفض', cancel: 'الإلغاء' };
    toast.success(`تم ${actionLabels[action]} على التصريح`);
    
    // تشغيل صوت للتنبيهات الحرجة
    if (action === 'reject' || action === 'cancel') {
      // يمكن إضافة صوت تنبيه هنا
    }

    setShowActionDialog(null);
    setActionNotes('');
  };

  const pendingCount = permits.filter(p => p.current_step === 'submitted' || p.current_step === 'review').length;

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'طلبات جديدة', value: permits.filter(p => p.current_step === 'submitted').length, color: 'blue' },
          { label: 'قيد المراجعة', value: permits.filter(p => p.current_step === 'review').length, color: 'amber' },
          { label: 'معتمدة', value: permits.filter(p => p.current_step === 'approved').length, color: 'green' },
          { label: 'صادرة', value: permits.filter(p => p.current_step === 'issued').length, color: 'cyan' },
        ].map((stat, i) => (
          <Card key={i} className={`bg-${stat.color}-500/10 border-${stat.color}-500/30`}>
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
              <p className="text-slate-400 text-xs">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workflow Queue */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              طلبات التصاريح - سير العمل
            </span>
            {pendingCount > 0 && (
              <Badge className="bg-amber-500/20 text-amber-400 animate-pulse">
                <Bell className="w-3 h-3 ml-1" />
                {pendingCount} بانتظار الإجراء
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {permits.map((permit, i) => {
            const currentStepIndex = getStepIndex(permit.current_step);
            const isRejected = permit.current_step === 'rejected';
            const isCancelled = permit.current_step === 'cancelled';
            
            return (
              <motion.div
                key={permit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-lg border ${
                  isRejected ? 'bg-red-500/10 border-red-500/30' :
                  isCancelled ? 'bg-slate-700/30 border-slate-600' :
                  permit.priority === 'high' ? 'bg-amber-500/5 border-amber-500/30' :
                  'bg-slate-800/50 border-slate-700/50'
                }`}
              >
                {/* Permit Info */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 bg-cyan-500/20">
                      <AvatarFallback className="bg-transparent text-cyan-400">
                        {permit.visitor_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-medium">{permit.visitor_name}</h4>
                        <Badge className="text-xs bg-slate-700 text-slate-300">{permit.permit_number}</Badge>
                        {permit.priority === 'high' && (
                          <Badge className="bg-amber-500/20 text-amber-400 text-xs">
                            <AlertTriangle className="w-3 h-3 ml-1" />
                            عاجل
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">{permit.purpose}</p>
                      <p className="text-slate-500 text-xs mt-1">
                        طلب بواسطة: {permit.requested_by} • {permit.requested_date}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8"
                    onClick={() => setShowHistory(showHistory === permit.id ? null : permit.id)}
                  >
                    <History className="w-4 h-4 ml-1 text-slate-400" />
                    السجل
                    {showHistory === permit.id ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                  </Button>
                </div>

                {/* Workflow Steps */}
                {!isRejected && !isCancelled && (
                  <div className="flex items-center justify-between mb-4">
                    {workflowSteps.map((step, idx) => {
                      const StepIcon = step.icon;
                      const isCompleted = idx < currentStepIndex;
                      const isCurrent = idx === currentStepIndex;
                      const isPending = idx > currentStepIndex;

                      return (
                        <React.Fragment key={step.id}>
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              isCompleted ? `bg-${step.color}-500 text-white` :
                              isCurrent ? `bg-${step.color}-500/20 text-${step.color}-400 ring-2 ring-${step.color}-500 animate-pulse` :
                              'bg-slate-700 text-slate-500'
                            }`}>
                              {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                            </div>
                            <span className={`text-xs mt-1 ${isCurrent ? `text-${step.color}-400` : 'text-slate-500'}`}>
                              {step.label}
                            </span>
                          </div>
                          {idx < workflowSteps.length - 1 && (
                            <div className={`flex-1 h-1 mx-2 rounded ${
                              isCompleted ? `bg-${workflowSteps[idx + 1].color}-500` : 'bg-slate-700'
                            }`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}

                {/* Status for rejected/cancelled */}
                {(isRejected || isCancelled) && (
                  <div className={`p-3 rounded-lg mb-4 ${isRejected ? 'bg-red-500/20' : 'bg-slate-700/50'}`}>
                    <div className="flex items-center gap-2">
                      {isRejected ? <XCircle className="w-5 h-5 text-red-400" /> : <X className="w-5 h-5 text-slate-400" />}
                      <span className={isRejected ? 'text-red-400' : 'text-slate-400'}>
                        {isRejected ? 'تم رفض التصريح' : 'تم إلغاء التصريح'}
                      </span>
                    </div>
                  </div>
                )}

                {/* History */}
                <AnimatePresence>
                  {showHistory === permit.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-3 bg-slate-900/50 rounded-lg"
                    >
                      <p className="text-slate-400 text-xs mb-2">سجل العمليات:</p>
                      <div className="space-y-2">
                        {permit.history.map((h, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5" />
                            <div>
                              <span className="text-white">{h.notes}</span>
                              <span className="text-slate-500 text-xs block">{h.user} • {h.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                {!isRejected && !isCancelled && permit.current_step !== 'issued' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => setShowActionDialog({ permit, action: 'approve' })}
                    >
                      <Check className="w-4 h-4 ml-1" />
                      {permit.current_step === 'submitted' ? 'بدء المراجعة' :
                       permit.current_step === 'review' ? 'موافقة' :
                       permit.current_step === 'approved' ? 'إصدار التصريح' : 'التالي'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/50 text-red-400"
                      onClick={() => setShowActionDialog({ permit, action: 'reject' })}
                    >
                      <X className="w-4 h-4 ml-1" />
                      رفض
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400"
                      onClick={() => setShowActionDialog({ permit, action: 'cancel' })}
                    >
                      إلغاء
                    </Button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!showActionDialog} onOpenChange={() => setShowActionDialog(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {showActionDialog?.action === 'approve' && <Check className="w-5 h-5 text-green-400" />}
              {showActionDialog?.action === 'reject' && <X className="w-5 h-5 text-red-400" />}
              {showActionDialog?.action === 'cancel' && <X className="w-5 h-5 text-slate-400" />}
              {showActionDialog?.action === 'approve' ? 'تأكيد الموافقة' :
               showActionDialog?.action === 'reject' ? 'تأكيد الرفض' : 'تأكيد الإلغاء'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <p className="text-slate-400 text-sm">التصريح: {showActionDialog?.permit?.permit_number}</p>
              <p className="text-white">{showActionDialog?.permit?.visitor_name}</p>
            </div>
            <div>
              <p className="text-slate-300 text-sm mb-2">ملاحظات (اختياري):</p>
              <Textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-white"
                placeholder="أضف ملاحظة..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                className={`flex-1 ${
                  showActionDialog?.action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  showActionDialog?.action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-slate-600 hover:bg-slate-700'
                }`}
                onClick={() => advanceWorkflow(showActionDialog?.permit?.id, showActionDialog?.action, actionNotes)}
              >
                تأكيد
              </Button>
              <Button variant="outline" className="border-slate-600" onClick={() => setShowActionDialog(null)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}