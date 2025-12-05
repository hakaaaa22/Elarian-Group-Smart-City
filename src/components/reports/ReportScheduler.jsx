import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Calendar, Clock, FileText, Download, Mail, Plus, Edit, Trash2,
  Save, RefreshCw, CheckCircle, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const reportTypes = [
  { id: 'waste', name: 'تقرير جمع النفايات', icon: '🗑️' },
  { id: 'fleet', name: 'تقرير الأسطول', icon: '🚚' },
  { id: 'ai', name: 'تقرير أداء AI', icon: '🤖' },
  { id: 'devices', name: 'تقرير الأجهزة', icon: '📡' },
  { id: 'maintenance', name: 'تقرير الصيانة', icon: '🔧' },
  { id: 'summary', name: 'تقرير شامل', icon: '📊' },
];

const scheduleOptions = [
  { value: 'daily', label: 'يومي' },
  { value: 'weekly', label: 'أسبوعي' },
  { value: 'monthly', label: 'شهري' },
  { value: 'quarterly', label: 'ربع سنوي' },
];

const formatOptions = [
  { value: 'pdf', label: 'PDF', icon: '📄' },
  { value: 'csv', label: 'CSV', icon: '📊' },
  { value: 'excel', label: 'Excel', icon: '📗' },
];

export default function ReportScheduler() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    report_type: '',
    schedule: 'weekly',
    schedule_time: '08:00',
    export_format: 'pdf',
    recipients: '',
    is_active: true
  });
  const queryClient = useQueryClient();

  const { data: scheduledReports = [] } = useQuery({
    queryKey: ['scheduledReports'],
    queryFn: () => base44.entities.ScheduledReport.list('-created_date', 50)
  });

  const createReport = useMutation({
    mutationFn: (data) => base44.entities.ScheduledReport.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledReports'] });
      setShowDialog(false);
      resetForm();
      toast.success('تم إنشاء التقرير المجدول');
    }
  });

  const updateReport = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ScheduledReport.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledReports'] });
      setShowDialog(false);
      resetForm();
      toast.success('تم تحديث التقرير');
    }
  });

  const deleteReport = useMutation({
    mutationFn: (id) => base44.entities.ScheduledReport.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledReports'] });
      toast.success('تم حذف التقرير');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      report_type: '',
      schedule: 'weekly',
      schedule_time: '08:00',
      export_format: 'pdf',
      recipients: '',
      is_active: true
    });
    setEditingReport(null);
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    setFormData({
      name: report.name,
      report_type: report.report_type,
      schedule: report.schedule,
      schedule_time: report.schedule_time || '08:00',
      export_format: report.export_format,
      recipients: report.recipients?.join(', ') || '',
      is_active: report.is_active
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.report_type) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    const data = {
      ...formData,
      recipients: formData.recipients.split(',').map(e => e.trim()).filter(Boolean)
    };

    if (editingReport) {
      updateReport.mutate({ id: editingReport.id, data });
    } else {
      createReport.mutate(data);
    }
  };

  const generateNow = async (report) => {
    toast.loading('جاري إنشاء التقرير...');
    
    // Simulate report generation
    setTimeout(() => {
      toast.dismiss();
      if (report.export_format === 'pdf') {
        toast.success('تم إنشاء التقرير PDF');
      } else if (report.export_format === 'csv') {
        const csvContent = "data:text/csv;charset=utf-8,التاريخ,القيمة\n2024-01-01,100\n2024-01-02,150";
        const link = document.createElement('a');
        link.href = encodeURI(csvContent);
        link.download = `${report.name}.csv`;
        link.click();
        toast.success('تم تصدير CSV');
      } else {
        toast.success('تم إنشاء التقرير Excel');
      }
    }, 2000);
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-400" />
          جدولة التقارير
        </h3>
        <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => { resetForm(); setShowDialog(true); }}>
          <Plus className="w-4 h-4 ml-2" />
          تقرير جديد
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {scheduledReports.map(report => (
            <Card key={report.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{reportTypes.find(t => t.id === report.report_type)?.icon || '📊'}</div>
                    <div>
                      <p className="text-white font-medium">{report.name}</p>
                      <p className="text-slate-400 text-sm">{reportTypes.find(t => t.id === report.report_type)?.name}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {scheduleOptions.find(s => s.value === report.schedule)?.label} - {report.schedule_time}
                        </span>
                        <Badge className="bg-slate-700 text-slate-300">{report.export_format?.toUpperCase()}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={report.is_active ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}>
                      {report.is_active ? 'نشط' : 'متوقف'}
                    </Badge>
                    <Button size="sm" variant="ghost" onClick={() => generateNow(report)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(report)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-400" onClick={() => deleteReport.mutate(report.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {scheduledReports.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">لا توجد تقارير مجدولة</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingReport ? 'تعديل التقرير' : 'إنشاء تقرير مجدول'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-400 text-sm">اسم التقرير</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="مثال: تقرير الأسطول الأسبوعي"
              />
            </div>
            <div>
              <Label className="text-slate-400 text-sm">نوع التقرير</Label>
              <Select value={formData.report_type} onValueChange={(v) => setFormData({ ...formData, report_type: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                  <SelectValue placeholder="اختر نوع التقرير" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.icon} {type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-400 text-sm">التكرار</Label>
                <Select value={formData.schedule} onValueChange={(v) => setFormData({ ...formData, schedule: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scheduleOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-400 text-sm">الوقت</Label>
                <Input
                  type="time"
                  value={formData.schedule_time}
                  onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-400 text-sm">صيغة التصدير</Label>
              <Select value={formData.export_format} onValueChange={(v) => setFormData({ ...formData, export_format: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.icon} {opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-400 text-sm">المستلمين (بريد إلكتروني)</Label>
              <Input
                value={formData.recipients}
                onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="email1@example.com, email2@example.com"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <Label className="text-slate-300">تفعيل التقرير</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
              />
            </div>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={handleSubmit}>
              <Save className="w-4 h-4 ml-2" />
              {editingReport ? 'حفظ التغييرات' : 'إنشاء التقرير'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}