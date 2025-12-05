import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, User, Building2, Mail, Phone, QrCode, Send,
  Plus, Check, X, Eye, Edit, Trash2, Copy, MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const mockScheduledVisits = [
  {
    id: 1, visitor_name: 'شركة البناء المتقدم', visitor_email: 'info@abc.com', visitor_phone: '+966501234567',
    date: '2024-12-04', time: '10:00', purpose: 'صيانة دورية', host: 'خالد العلي', host_department: 'الصيانة',
    status: 'confirmed', qr_sent: true, reminder_sent: true
  },
  {
    id: 2, visitor_name: 'مؤسسة النجاح', visitor_email: 'contact@najah.com', visitor_phone: '+966509876543',
    date: '2024-12-04', time: '11:30', purpose: 'اجتماع عمل', host: 'محمد السعيد', host_department: 'المبيعات',
    status: 'pending', qr_sent: false, reminder_sent: false
  },
  {
    id: 3, visitor_name: 'شركة التوصيل السريع', visitor_email: 'delivery@fast.com', visitor_phone: '+966507654321',
    date: '2024-12-05', time: '09:00', purpose: 'توصيل طلبية', host: 'فاطمة الزهراء', host_department: 'المستودعات',
    status: 'confirmed', qr_sent: true, reminder_sent: false
  },
];

const hosts = [
  { id: 1, name: 'خالد العلي', department: 'الصيانة', email: 'khalid@company.com' },
  { id: 2, name: 'محمد السعيد', department: 'المبيعات', email: 'mohammed@company.com' },
  { id: 3, name: 'فاطمة الزهراء', department: 'المستودعات', email: 'fatima@company.com' },
  { id: 4, name: 'أحمد السعيد', department: 'تقنية المعلومات', email: 'ahmed@company.com' },
];

export default function VisitScheduling() {
  const [visits, setVisits] = useState(mockScheduledVisits);
  const [showNewVisit, setShowNewVisit] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [newVisit, setNewVisit] = useState({
    visitor_name: '', visitor_email: '', visitor_phone: '',
    date: '', time: '', purpose: '', host_id: '', notes: ''
  });

  const createVisit = () => {
    const host = hosts.find(h => h.id === parseInt(newVisit.host_id));
    const visit = {
      id: Date.now(),
      ...newVisit,
      host: host?.name,
      host_department: host?.department,
      status: 'pending',
      qr_sent: false,
      reminder_sent: false
    };
    setVisits([visit, ...visits]);
    setShowNewVisit(false);
    setNewVisit({ visitor_name: '', visitor_email: '', visitor_phone: '', date: '', time: '', purpose: '', host_id: '', notes: '' });
    toast.success('تم جدولة الزيارة بنجاح');
  };

  const sendInvitation = (visitId) => {
    setVisits(visits.map(v => v.id === visitId ? { ...v, qr_sent: true, status: 'confirmed' } : v));
    toast.success('تم إرسال الدعوة مع رمز QR');
  };

  const sendReminder = (visitId) => {
    setVisits(visits.map(v => v.id === visitId ? { ...v, reminder_sent: true } : v));
    toast.success('تم إرسال التذكير');
  };

  const cancelVisit = (visitId) => {
    setVisits(visits.map(v => v.id === visitId ? { ...v, status: 'cancelled' } : v));
    toast.success('تم إلغاء الزيارة');
  };

  const todayVisits = visits.filter(v => v.date === '2024-12-04');
  const upcomingVisits = visits.filter(v => v.date !== '2024-12-04' && v.status !== 'cancelled');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            جدولة الزيارات
          </h3>
          <p className="text-slate-400 text-sm">إدارة المواعيد والدعوات</p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowNewVisit(true)}>
          <Plus className="w-4 h-4 ml-2" />
          موعد جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'زيارات اليوم', value: todayVisits.length, color: 'cyan' },
          { label: 'زيارات قادمة', value: upcomingVisits.length, color: 'purple' },
          { label: 'بانتظار التأكيد', value: visits.filter(v => v.status === 'pending').length, color: 'amber' },
          { label: 'مؤكدة', value: visits.filter(v => v.status === 'confirmed').length, color: 'green' },
        ].map((stat, i) => (
          <Card key={i} className={`bg-${stat.color}-500/10 border-${stat.color}-500/30`}>
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
              <p className="text-slate-400 text-xs">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Visits */}
      <Card className="bg-cyan-500/5 border-cyan-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">زيارات اليوم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {todayVisits.map((visit, i) => (
              <motion.div
                key={visit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 bg-slate-800/50 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/20">
                    <Clock className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{visit.visitor_name}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{visit.time}</span>
                      <span>•</span>
                      <span>{visit.purpose}</span>
                      <span>•</span>
                      <span>المضيف: {visit.host}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={visit.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                    {visit.status === 'confirmed' ? 'مؤكد' : 'معلق'}
                  </Badge>
                  {visit.qr_sent && <Badge className="bg-purple-500/20 text-purple-400"><QrCode className="w-3 h-3 ml-1" />QR</Badge>}
                  {!visit.qr_sent && (
                    <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-400 h-7" onClick={() => sendInvitation(visit.id)}>
                      <Send className="w-3 h-3 ml-1" />
                      إرسال دعوة
                    </Button>
                  )}
                  {!visit.reminder_sent && visit.qr_sent && (
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => sendReminder(visit.id)}>
                      <MessageSquare className="w-3 h-3 text-slate-400" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
            {todayVisits.length === 0 && (
              <p className="text-slate-500 text-center py-4">لا توجد زيارات مجدولة اليوم</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Visits */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">الزيارات القادمة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {upcomingVisits.map((visit, i) => (
              <motion.div
                key={visit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 bg-slate-800/50 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Calendar className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{visit.visitor_name}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{visit.date}</span>
                      <span>•</span>
                      <span>{visit.time}</span>
                      <span>•</span>
                      <span>{visit.purpose}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={visit.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                    {visit.status === 'confirmed' ? 'مؤكد' : 'معلق'}
                  </Badge>
                  <Button size="sm" variant="ghost" className="h-7" onClick={() => setSelectedVisit(visit)}>
                    <Eye className="w-4 h-4 text-slate-400" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7" onClick={() => cancelVisit(visit.id)}>
                    <X className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Visit Dialog */}
      <Dialog open={showNewVisit} onOpenChange={setShowNewVisit}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              جدولة زيارة جديدة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-slate-300">اسم الزائر / الشركة</Label>
                <Input
                  value={newVisit.visitor_name}
                  onChange={(e) => setNewVisit({ ...newVisit, visitor_name: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  placeholder="اسم الزائر أو الشركة"
                />
              </div>
              <div>
                <Label className="text-slate-300">البريد الإلكتروني</Label>
                <Input
                  value={newVisit.visitor_email}
                  onChange={(e) => setNewVisit({ ...newVisit, visitor_email: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label className="text-slate-300">رقم الهاتف</Label>
                <Input
                  value={newVisit.visitor_phone}
                  onChange={(e) => setNewVisit({ ...newVisit, visitor_phone: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  placeholder="+966 5XX XXX XXXX"
                />
              </div>
              <div>
                <Label className="text-slate-300">تاريخ الزيارة</Label>
                <Input
                  type="date"
                  value={newVisit.date}
                  onChange={(e) => setNewVisit({ ...newVisit, date: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300">وقت الزيارة</Label>
                <Input
                  type="time"
                  value={newVisit.time}
                  onChange={(e) => setNewVisit({ ...newVisit, time: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-slate-300">غرض الزيارة</Label>
                <Input
                  value={newVisit.purpose}
                  onChange={(e) => setNewVisit({ ...newVisit, purpose: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  placeholder="سبب الزيارة"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-slate-300">مسؤول الاستقبال</Label>
                <Select value={newVisit.host_id} onValueChange={(v) => setNewVisit({ ...newVisit, host_id: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                    <SelectValue placeholder="اختر المضيف" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {hosts.map(h => (
                      <SelectItem key={h.id} value={h.id.toString()}>{h.name} - {h.department}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-slate-300">ملاحظات</Label>
                <Textarea
                  value={newVisit.notes}
                  onChange={(e) => setNewVisit({ ...newVisit, notes: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={createVisit}>
                <Check className="w-4 h-4 ml-2" />
                جدولة الزيارة
              </Button>
              <Button variant="outline" className="border-slate-600" onClick={() => setShowNewVisit(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}