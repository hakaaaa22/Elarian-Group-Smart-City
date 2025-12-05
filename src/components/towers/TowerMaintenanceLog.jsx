import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wrench, Calendar, Clock, User, Filter, Download, Search, FileText,
  CheckCircle, AlertTriangle, XCircle, ChevronRight, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// سجلات الصيانة
const maintenanceLogs = [
  {
    id: 'ML-001',
    tower_id: 'TWR-001',
    tower_name: 'برج الاتصالات المركزي',
    type: 'preventive',
    title: 'صيانة وقائية دورية',
    description: 'فحص شامل للهيكل والمعدات الكهربائية',
    technician: 'أحمد الشمري',
    date: '2024-12-01',
    duration: '4 ساعات',
    status: 'completed',
    parts_used: ['كابلات كهربائية', 'براغي تثبيت'],
    cost: 2500,
    notes: 'تم استبدال بعض الكابلات التالفة وإعادة شد البراغي'
  },
  {
    id: 'ML-002',
    tower_id: 'TWR-002',
    tower_name: 'برج المنطقة الشرقية',
    type: 'corrective',
    title: 'إصلاح نظام التبريد',
    description: 'إصلاح عطل في وحدة التبريد الرئيسية',
    technician: 'خالد العتيبي',
    date: '2024-11-28',
    duration: '6 ساعات',
    status: 'completed',
    parts_used: ['ضاغط تبريد', 'غاز فريون', 'مرشح هواء'],
    cost: 8500,
    notes: 'تم استبدال الضاغط بالكامل وإعادة شحن الغاز'
  },
  {
    id: 'ML-003',
    tower_id: 'TWR-003',
    tower_name: 'برج المراقبة الجنوبي',
    type: 'emergency',
    title: 'إصلاح طارئ - ميل الهيكل',
    description: 'معالجة ميل غير طبيعي في الهيكل',
    technician: 'فهد الدوسري',
    date: '2024-11-25',
    duration: '12 ساعة',
    status: 'in_progress',
    parts_used: ['دعامات فولاذية', 'براغي تثبيت كبيرة'],
    cost: 25000,
    notes: 'جاري تركيب دعامات إضافية لتصحيح الميل'
  },
  {
    id: 'ML-004',
    tower_id: 'TWR-001',
    tower_name: 'برج الاتصالات المركزي',
    type: 'inspection',
    title: 'فحص هيكلي سنوي',
    description: 'فحص شامل للسلامة الهيكلية',
    technician: 'محمد السبيعي',
    date: '2024-11-15',
    duration: '3 ساعات',
    status: 'completed',
    parts_used: [],
    cost: 1500,
    notes: 'الهيكل في حالة ممتازة، لا حاجة لأي إصلاحات'
  },
  {
    id: 'ML-005',
    tower_id: 'TWR-004',
    tower_name: 'برج البث الإذاعي',
    type: 'preventive',
    title: 'صيانة معدات البث',
    description: 'فحص وصيانة أجهزة الإرسال',
    technician: 'سعد العنزي',
    date: '2024-11-10',
    duration: '5 ساعات',
    status: 'completed',
    parts_used: ['مكثفات', 'فيوزات'],
    cost: 3200,
    notes: 'تم تنظيف المعدات واستبدال بعض المكثفات التالفة'
  }
];

const maintenanceTypes = [
  { id: 'preventive', name: 'وقائية', color: 'blue' },
  { id: 'corrective', name: 'تصحيحية', color: 'amber' },
  { id: 'emergency', name: 'طارئة', color: 'red' },
  { id: 'inspection', name: 'فحص', color: 'purple' }
];

const statusTypes = [
  { id: 'completed', name: 'مكتملة', color: 'green' },
  { id: 'in_progress', name: 'جارية', color: 'blue' },
  { id: 'scheduled', name: 'مجدولة', color: 'amber' },
  { id: 'cancelled', name: 'ملغاة', color: 'red' }
];

export default function TowerMaintenanceLog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);

  const filteredLogs = maintenanceLogs.filter(log => {
    if (searchQuery && !log.title.includes(searchQuery) && !log.tower_name.includes(searchQuery)) {
      return false;
    }
    if (typeFilter !== 'all' && log.type !== typeFilter) return false;
    if (statusFilter !== 'all' && log.status !== statusFilter) return false;
    return true;
  });

  const getTypeConfig = (type) => maintenanceTypes.find(t => t.id === type) || { name: type, color: 'slate' };
  const getStatusConfig = (status) => statusTypes.find(s => s.id === status) || { name: status, color: 'slate' };

  const totalCost = filteredLogs.reduce((sum, log) => sum + log.cost, 0);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في السجلات..."
            className="bg-slate-800 border-slate-700 pr-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36 bg-slate-800 border-slate-700">
            <SelectValue placeholder="النوع" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">جميع الأنواع</SelectItem>
            {maintenanceTypes.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-slate-800 border-slate-700">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">جميع الحالات</SelectItem>
            {statusTypes.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" className="border-slate-600">
          <Download className="w-4 h-4 ml-2" />
          تصدير
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-white">{filteredLogs.length}</p>
            <p className="text-xs text-slate-400">سجل صيانة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-green-500/30 bg-green-500/5">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{filteredLogs.filter(l => l.status === 'completed').length}</p>
            <p className="text-xs text-slate-400">مكتملة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{filteredLogs.filter(l => l.status === 'in_progress').length}</p>
            <p className="text-xs text-slate-400">جارية</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{totalCost.toLocaleString()} ر.س</p>
            <p className="text-xs text-slate-400">إجمالي التكلفة</p>
          </CardContent>
        </Card>
      </div>

      {/* Logs List */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardContent className="p-0">
          <div className="divide-y divide-slate-700/50">
            {filteredLogs.map((log, i) => {
              const typeConfig = getTypeConfig(log.type);
              const statusConfig = getStatusConfig(log.status);
              
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 hover:bg-slate-800/30 cursor-pointer transition-colors"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg bg-${typeConfig.color}-500/20 mt-1`}>
                      <Wrench className={`w-5 h-5 text-${typeConfig.color}-400`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-medium">{log.title}</p>
                        <Badge className={`bg-${typeConfig.color}-500/20 text-${typeConfig.color}-400 text-xs`}>
                          {typeConfig.name}
                        </Badge>
                        <Badge className={`bg-${statusConfig.color}-500/20 text-${statusConfig.color}-400 text-xs`}>
                          {statusConfig.name}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm">{log.tower_name}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {log.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.technician}
                        </span>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-amber-400 font-bold">{log.cost.toLocaleString()} ر.س</p>
                      <ChevronRight className="w-4 h-4 text-slate-500 mt-2" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              تفاصيل سجل الصيانة
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-white font-bold text-lg mb-1">{selectedLog.title}</p>
                <p className="text-slate-400">{selectedLog.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-slate-500 text-xs">البرج</p>
                  <p className="text-white">{selectedLog.tower_name}</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-slate-500 text-xs">الفني</p>
                  <p className="text-white">{selectedLog.technician}</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-slate-500 text-xs">التاريخ</p>
                  <p className="text-white">{selectedLog.date}</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-slate-500 text-xs">المدة</p>
                  <p className="text-white">{selectedLog.duration}</p>
                </div>
              </div>

              {selectedLog.parts_used.length > 0 && (
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-slate-500 text-xs mb-2">القطع المستخدمة</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedLog.parts_used.map((part, i) => (
                      <Badge key={i} className="bg-slate-700 text-slate-300">{part}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-amber-400 text-xs mb-1">التكلفة الإجمالية</p>
                <p className="text-2xl font-bold text-white">{selectedLog.cost.toLocaleString()} ر.س</p>
              </div>

              {selectedLog.notes && (
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-slate-500 text-xs mb-1">ملاحظات</p>
                  <p className="text-slate-300 text-sm">{selectedLog.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}