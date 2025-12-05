import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  History, Search, Filter, Download, Calendar, User, Activity,
  Edit, Trash2, Plus, Eye, LogIn, LogOut, Settings, FileText,
  Check, X, AlertTriangle, Shield, ChevronDown, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const actionIcons = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  view: Eye,
  login: LogIn,
  logout: LogOut,
  export: Download,
  approve: Check,
  reject: X,
  other: Activity,
};

const actionColors = {
  create: 'bg-green-500/20 text-green-400',
  update: 'bg-amber-500/20 text-amber-400',
  delete: 'bg-red-500/20 text-red-400',
  view: 'bg-blue-500/20 text-blue-400',
  login: 'bg-cyan-500/20 text-cyan-400',
  logout: 'bg-slate-500/20 text-slate-400',
  export: 'bg-purple-500/20 text-purple-400',
  approve: 'bg-green-500/20 text-green-400',
  reject: 'bg-red-500/20 text-red-400',
  other: 'bg-slate-500/20 text-slate-400',
};

const modules = [
  { id: 'visitors', name: 'الزوار' },
  { id: 'permits', name: 'التصاريح' },
  { id: 'devices', name: 'الأجهزة' },
  { id: 'cameras', name: 'الكاميرات' },
  { id: 'fleet', name: 'الأسطول' },
  { id: 'incidents', name: 'الحوادث' },
  { id: 'reports', name: 'التقارير' },
  { id: 'settings', name: 'الإعدادات' },
  { id: 'users', name: 'المستخدمون' },
  { id: 'integrations', name: 'التكاملات' },
];

const mockAuditLogs = [
  { id: 1, action: 'إنشاء تصريح جديد', action_type: 'create', module: 'permits', target_name: 'P-2024-005', user_name: 'أحمد محمد', user_email: 'ahmed@example.com', created_date: '2024-12-04T10:30:00', status: 'success', ip_address: '192.168.1.100' },
  { id: 2, action: 'تعديل إعدادات الجهاز', action_type: 'update', module: 'devices', target_name: 'كاميرا المدخل', user_name: 'سارة أحمد', user_email: 'sara@example.com', created_date: '2024-12-04T10:15:00', status: 'success', ip_address: '192.168.1.101', old_value: { status: 'offline' }, new_value: { status: 'online' } },
  { id: 3, action: 'حذف تقرير', action_type: 'delete', module: 'reports', target_name: 'تقرير الأسبوع 48', user_name: 'محمد علي', user_email: 'mohamed@example.com', created_date: '2024-12-04T09:45:00', status: 'success', ip_address: '192.168.1.102' },
  { id: 4, action: 'تسجيل دخول', action_type: 'login', module: 'users', target_name: 'النظام', user_name: 'خالد العلي', user_email: 'khaled@example.com', created_date: '2024-12-04T09:00:00', status: 'success', ip_address: '192.168.1.103' },
  { id: 5, action: 'اعتماد تصريح', action_type: 'approve', module: 'permits', target_name: 'P-2024-004', user_name: 'أحمد محمد', user_email: 'ahmed@example.com', created_date: '2024-12-04T08:30:00', status: 'success', ip_address: '192.168.1.100' },
  { id: 6, action: 'رفض تصريح', action_type: 'reject', module: 'permits', target_name: 'P-2024-003', user_name: 'أحمد محمد', user_email: 'ahmed@example.com', created_date: '2024-12-04T08:15:00', status: 'success', ip_address: '192.168.1.100', notes: 'بيانات غير مكتملة' },
  { id: 7, action: 'تصدير بيانات', action_type: 'export', module: 'reports', target_name: 'تقرير الطاقة', user_name: 'فاطمة الزهراء', user_email: 'fatima@example.com', created_date: '2024-12-03T16:00:00', status: 'success', ip_address: '192.168.1.104' },
  { id: 8, action: 'تعديل صلاحيات', action_type: 'update', module: 'users', target_name: 'محمد علي', user_name: 'أحمد محمد', user_email: 'ahmed@example.com', created_date: '2024-12-03T14:30:00', status: 'success', ip_address: '192.168.1.100', old_value: { role: 'user' }, new_value: { role: 'admin' } },
  { id: 9, action: 'محاولة تسجيل دخول فاشلة', action_type: 'login', module: 'users', target_name: 'النظام', user_name: 'غير معروف', user_email: 'unknown@example.com', created_date: '2024-12-03T12:00:00', status: 'failed', ip_address: '192.168.1.200' },
  { id: 10, action: 'تسجيل خروج', action_type: 'logout', module: 'users', target_name: 'النظام', user_name: 'سارة أحمد', user_email: 'sara@example.com', created_date: '2024-12-03T17:30:00', status: 'success', ip_address: '192.168.1.101' },
];

export default function AuditLog() {
  const [logs, setLogs] = useState(mockAuditLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.includes(searchQuery) || log.user_name.includes(searchQuery) || log.target_name?.includes(searchQuery);
    const matchesModule = filterModule === 'all' || log.module === filterModule;
    const matchesAction = filterAction === 'all' || log.action_type === filterAction;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchesDateFrom = !dateFrom || new Date(log.created_date) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(log.created_date) <= new Date(dateTo);
    return matchesSearch && matchesModule && matchesAction && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const stats = {
    total: logs.length,
    today: logs.filter(l => new Date(l.created_date).toDateString() === new Date().toDateString()).length,
    failed: logs.filter(l => l.status === 'failed').length,
    changes: logs.filter(l => ['create', 'update', 'delete'].includes(l.action_type)).length,
  };

  const exportLogs = () => {
    const csv = "التاريخ,الإجراء,الموديول,المستخدم,الهدف,الحالة,IP\n" +
      filteredLogs.map(l => `${l.created_date},${l.action},${l.module},${l.user_name},${l.target_name},${l.status},${l.ip_address}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_log.csv';
    a.click();
    toast.success('تم تصدير السجل');
  };

  const getActionName = (type) => {
    const names = { create: 'إنشاء', update: 'تعديل', delete: 'حذف', view: 'عرض', login: 'دخول', logout: 'خروج', export: 'تصدير', approve: 'اعتماد', reject: 'رفض', other: 'أخرى' };
    return names[type] || type;
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <History className="w-8 h-8 text-cyan-400" />
              سجل التدقيق
            </h1>
            <p className="text-slate-400 mt-1">تتبع جميع الإجراءات والتغييرات في النظام</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-600" onClick={() => setLogs(mockAuditLogs)}>
              <RefreshCw className="w-4 h-4 ml-2" />
              تحديث
            </Button>
            <Button variant="outline" className="border-slate-600" onClick={exportLogs}>
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي السجلات', value: stats.total, icon: History, color: 'cyan' },
          { label: 'اليوم', value: stats.today, icon: Calendar, color: 'green' },
          { label: 'التغييرات', value: stats.changes, icon: Edit, color: 'amber' },
          { label: 'فشل', value: stats.failed, icon: AlertTriangle, color: 'red' },
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

      {/* Filters */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="بحث..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-9 bg-slate-800/50 border-slate-700 text-white" />
            </div>
            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white"><SelectValue placeholder="الموديول" /></SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">جميع الموديولات</SelectItem>
                {modules.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white"><SelectValue placeholder="الإجراء" /></SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">جميع الإجراءات</SelectItem>
                {Object.keys(actionIcons).map(a => <SelectItem key={a} value={a}>{getActionName(a)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-slate-800/50 border-slate-700 text-white" placeholder="من" />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-slate-800/50 border-slate-700 text-white" placeholder="إلى" />
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardContent className="p-4">
          <div className="space-y-2">
            {filteredLogs.map((log, i) => {
              const Icon = actionIcons[log.action_type] || Activity;
              return (
                <motion.div key={log.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}>
                  <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800/70 cursor-pointer transition-all" onClick={() => { setSelectedLog(log); setShowDetailDialog(true); }}>
                    <div className={`p-2 rounded-lg ${actionColors[log.action_type]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-medium">{log.action}</span>
                        <Badge className="bg-slate-700 text-slate-300 text-xs">{modules.find(m => m.id === log.module)?.name}</Badge>
                        {log.target_name && <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">{log.target_name}</Badge>}
                        {log.status === 'failed' && <Badge className="bg-red-500/20 text-red-400 text-xs">فشل</Badge>}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{log.user_name}</span>
                        <span>{new Date(log.created_date).toLocaleString('ar-SA')}</span>
                        <span className="text-slate-600">{log.ip_address}</span>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-500 -rotate-90" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              تفاصيل السجل
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">الإجراء</p>
                  <p className="text-white font-medium">{selectedLog.action}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">الموديول</p>
                  <p className="text-white">{modules.find(m => m.id === selectedLog.module)?.name}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">المستخدم</p>
                  <p className="text-white">{selectedLog.user_name}</p>
                  <p className="text-slate-500 text-xs">{selectedLog.user_email}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">التاريخ</p>
                  <p className="text-white">{new Date(selectedLog.created_date).toLocaleString('ar-SA')}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">الهدف</p>
                  <p className="text-white">{selectedLog.target_name || '-'}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">IP</p>
                  <p className="text-white font-mono">{selectedLog.ip_address}</p>
                </div>
              </div>
              {(selectedLog.old_value || selectedLog.new_value) && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-300 font-medium mb-2">التغييرات</p>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedLog.old_value && (
                      <div>
                        <p className="text-slate-400 text-xs mb-1">القيمة السابقة</p>
                        <pre className="text-red-400 text-xs bg-slate-900 p-2 rounded">{JSON.stringify(selectedLog.old_value, null, 2)}</pre>
                      </div>
                    )}
                    {selectedLog.new_value && (
                      <div>
                        <p className="text-slate-400 text-xs mb-1">القيمة الجديدة</p>
                        <pre className="text-green-400 text-xs bg-slate-900 p-2 rounded">{JSON.stringify(selectedLog.new_value, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {selectedLog.notes && (
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">ملاحظات</p>
                  <p className="text-white">{selectedLog.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}