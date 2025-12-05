import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Calendar, Clock, Bell, Mail, Users, Play, Pause, Trash2, Settings,
  Plus, CheckCircle, AlertTriangle, RefreshCw, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const scheduleOptions = [
  { value: 'daily', label: 'يومي', description: 'كل يوم' },
  { value: 'weekly', label: 'أسبوعي', description: 'كل أسبوع' },
  { value: 'monthly', label: 'شهري', description: 'كل شهر' },
  { value: 'quarterly', label: 'ربع سنوي', description: 'كل 3 أشهر' },
];

const daysOfWeek = [
  { value: 'sunday', label: 'الأحد' },
  { value: 'monday', label: 'الإثنين' },
  { value: 'tuesday', label: 'الثلاثاء' },
  { value: 'wednesday', label: 'الأربعاء' },
  { value: 'thursday', label: 'الخميس' },
  { value: 'friday', label: 'الجمعة' },
  { value: 'saturday', label: 'السبت' },
];

const reportTypes = [
  { value: 'ai_comprehensive', label: 'تقرير AI شامل' },
  { value: 'sentiment_analysis', label: 'تحليل المشاعر' },
  { value: 'predictive_analytics', label: 'التحليلات التنبؤية' },
  { value: 'customer_insights', label: 'رؤى العملاء' },
  { value: 'performance_kpis', label: 'مؤشرات الأداء' },
  { value: 'churn_analysis', label: 'تحليل المغادرة' },
];

export default function AdvancedScheduler() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  
  const [scheduleConfig, setScheduleConfig] = useState({
    name: '',
    reportType: 'ai_comprehensive',
    schedule: 'daily',
    scheduleDay: 'sunday',
    scheduleTime: '09:00',
    recipients: '',
    includeExcel: true,
    includePdf: true,
    sendNotification: true,
    notifyOnCompletion: true,
    description: '',
    isActive: true,
  });

  const queryClient = useQueryClient();

  const { data: scheduledReports = [], isLoading } = useQuery({
    queryKey: ['scheduled-reports'],
    queryFn: () => base44.entities.ScheduledReport.list('-created_date', 20),
  });

  const createScheduleMutation = useMutation({
    mutationFn: async (config) => {
      return await base44.entities.ScheduledReport.create({
        name: config.name,
        description: config.description,
        report_type: config.reportType,
        schedule: config.schedule,
        schedule_day: config.scheduleDay,
        schedule_time: config.scheduleTime,
        recipients: config.recipients.split(',').map(e => e.trim()).filter(e => e),
        export_format: config.includePdf && config.includeExcel ? 'both' : config.includePdf ? 'pdf' : 'excel',
        is_active: config.isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      resetForm();
      toast.success('تم إنشاء الجدولة بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ');
    }
  });

  const toggleScheduleMutation = useMutation({
    mutationFn: async ({ id, isActive }) => {
      return await base44.entities.ScheduledReport.update(id, { is_active: isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
    }
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.ScheduledReport.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('تم حذف الجدولة');
    }
  });

  const resetForm = () => {
    setScheduleConfig({
      name: '',
      reportType: 'ai_comprehensive',
      schedule: 'daily',
      scheduleDay: 'sunday',
      scheduleTime: '09:00',
      recipients: '',
      includeExcel: true,
      includePdf: true,
      sendNotification: true,
      notifyOnCompletion: true,
      description: '',
      isActive: true,
    });
    setEditingSchedule(null);
    setShowCreateDialog(false);
  };

  const getScheduleLabel = (schedule, day, time) => {
    const scheduleText = scheduleOptions.find(s => s.value === schedule)?.label || schedule;
    const dayText = schedule === 'weekly' ? daysOfWeek.find(d => d.value === day)?.label : '';
    return `${scheduleText} ${dayText} - ${time}`;
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-400" />
          <h4 className="text-white font-bold">جدولة التقارير المتقدمة</h4>
        </div>
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="w-4 h-4 ml-1" />
          جدولة جديدة
        </Button>
      </div>

      {/* Scheduled Reports List */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 text-slate-500 mx-auto animate-spin" />
            </div>
          ) : scheduledReports.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">لا توجد تقارير مجدولة</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {scheduledReports.map(report => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-3 rounded-lg border ${report.is_active ? 'bg-green-500/5 border-green-500/30' : 'bg-slate-900/50 border-slate-700'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className={`w-4 h-4 ${report.is_active ? 'text-green-400' : 'text-slate-500'}`} />
                          <span className="text-white font-medium">{report.name}</span>
                          <Badge className={report.is_active ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}>
                            {report.is_active ? 'نشط' : 'متوقف'}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-xs mb-2">{report.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getScheduleLabel(report.schedule, report.schedule_day, report.schedule_time)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {report.recipients?.length || 0} مستلم
                          </span>
                          {report.last_generated && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              آخر تنفيذ: {new Date(report.last_generated).toLocaleDateString('ar-SA')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={report.is_active}
                          onCheckedChange={(checked) => toggleScheduleMutation.mutate({ id: report.id, isActive: checked })}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => deleteScheduleMutation.mutate(report.id)}
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-400" />
              إنشاء جدولة تقرير جديدة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-sm">اسم الجدولة</Label>
                <Input
                  value={scheduleConfig.name}
                  onChange={(e) => setScheduleConfig(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                  placeholder="تقرير AI اليومي"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">نوع التقرير</Label>
                <Select value={scheduleConfig.reportType} onValueChange={(v) => setScheduleConfig(prev => ({ ...prev, reportType: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {reportTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-300 text-sm">التكرار</Label>
                <Select value={scheduleConfig.schedule} onValueChange={(v) => setScheduleConfig(prev => ({ ...prev, schedule: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {scheduleOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {scheduleConfig.schedule === 'weekly' && (
                <div>
                  <Label className="text-slate-300 text-sm">اليوم</Label>
                  <Select value={scheduleConfig.scheduleDay} onValueChange={(v) => setScheduleConfig(prev => ({ ...prev, scheduleDay: v }))}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {daysOfWeek.map(day => (
                        <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label className="text-slate-300 text-sm">الوقت</Label>
                <Input
                  type="time"
                  value={scheduleConfig.scheduleTime}
                  onChange={(e) => setScheduleConfig(prev => ({ ...prev, scheduleTime: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300 text-sm">المستلمون (البريد الإلكتروني - مفصولة بفاصلة)</Label>
              <Input
                value={scheduleConfig.recipients}
                onChange={(e) => setScheduleConfig(prev => ({ ...prev, recipients: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white mt-1"
                placeholder="email1@example.com, email2@example.com"
              />
            </div>

            <div>
              <Label className="text-slate-300 text-sm">الوصف</Label>
              <Textarea
                value={scheduleConfig.description}
                onChange={(e) => setScheduleConfig(prev => ({ ...prev, description: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white mt-1 h-16"
                placeholder="وصف التقرير..."
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                <Label className="text-slate-300 text-xs">PDF</Label>
                <Switch checked={scheduleConfig.includePdf} onCheckedChange={(v) => setScheduleConfig(prev => ({ ...prev, includePdf: v }))} />
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                <Label className="text-slate-300 text-xs">Excel</Label>
                <Switch checked={scheduleConfig.includeExcel} onCheckedChange={(v) => setScheduleConfig(prev => ({ ...prev, includeExcel: v }))} />
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                <Label className="text-slate-300 text-xs">إشعار</Label>
                <Switch checked={scheduleConfig.sendNotification} onCheckedChange={(v) => setScheduleConfig(prev => ({ ...prev, sendNotification: v }))} />
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                <Label className="text-slate-300 text-xs">نشط</Label>
                <Switch checked={scheduleConfig.isActive} onCheckedChange={(v) => setScheduleConfig(prev => ({ ...prev, isActive: v }))} />
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-700">
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700" 
                onClick={() => createScheduleMutation.mutate(scheduleConfig)}
                disabled={createScheduleMutation.isPending}
              >
                <Calendar className="w-4 h-4 ml-2" />
                إنشاء الجدولة
              </Button>
              <Button variant="outline" className="border-slate-600" onClick={resetForm}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}