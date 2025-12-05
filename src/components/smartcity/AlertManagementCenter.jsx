import React, { useState } from 'react';
import {
  Bell, AlertTriangle, CheckCircle, Clock, User, MapPin, Send,
  Mail, MessageSquare, Filter, Search, Eye, UserCheck, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const mockAlerts = [
  { id: 1, type: 'traffic', title: 'ازدحام حرج', location: 'شارع العليا', severity: 'critical', status: 'active', time: '10:30', assignee: null },
  { id: 2, type: 'waste', title: 'حاوية ممتلئة 95%', location: 'حي الورود', severity: 'high', status: 'acknowledged', time: '10:25', assignee: 'أحمد محمد' },
  { id: 3, type: 'environment', title: 'تلوث هواء عالي', location: 'المنطقة الصناعية', severity: 'high', status: 'in_progress', time: '10:15', assignee: 'سارة علي' },
  { id: 4, type: 'energy', title: 'ذروة استهلاك متوقعة', location: 'الشبكة الرئيسية', severity: 'medium', status: 'active', time: '10:00', assignee: null },
  { id: 5, type: 'traffic', title: 'حادث مروري', location: 'الطريق الدائري', severity: 'critical', status: 'resolved', time: '09:45', assignee: 'خالد فهد' },
];

const supervisors = [
  { id: 1, name: 'أحمد محمد', department: 'المرور' },
  { id: 2, name: 'سارة علي', department: 'البيئة' },
  { id: 3, name: 'خالد فهد', department: 'الطوارئ' },
  { id: 4, name: 'نورة السعيد', department: 'الطاقة' },
];

export default function AlertManagementCenter() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  const filteredAlerts = alerts.filter(a => {
    const matchesType = filterType === 'all' || a.type === filterType;
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchesSearch = a.title.includes(searchQuery) || a.location.includes(searchQuery);
    return matchesType && matchesStatus && matchesSearch;
  });

  const acknowledgeAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a));
    toast.success('تم الإقرار بالتنبيه');
  };

  const assignAlert = (alertId, supervisor) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, assignee: supervisor.name, status: 'in_progress' } : a));
    setShowAssignDialog(false);
    toast.success(`تم تعيين التنبيه إلى ${supervisor.name}`);
  };

  const resolveAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
    toast.success('تم حل التنبيه');
  };

  const sendNotification = (type, alertId) => {
    const alert = alerts.find(a => a.id === alertId);
    toast.success(`تم إرسال ${type === 'sms' ? 'SMS' : type === 'email' ? 'بريد' : 'إشعار'} للمسؤولين`);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'traffic': return '🚗';
      case 'waste': return '🗑️';
      case 'environment': return '🌡️';
      case 'energy': return '⚡';
      default: return '⚠️';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'medium': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <Badge className="bg-red-500/20 text-red-400">نشط</Badge>;
      case 'acknowledged': return <Badge className="bg-amber-500/20 text-amber-400">تم الإقرار</Badge>;
      case 'in_progress': return <Badge className="bg-blue-500/20 text-blue-400">قيد المعالجة</Badge>;
      case 'resolved': return <Badge className="bg-green-500/20 text-green-400">تم الحل</Badge>;
      default: return null;
    }
  };

  const stats = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    critical: alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-400" />
          مركز إدارة التنبيهات
          {stats.critical > 0 && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
        </h3>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-slate-400 text-xs">إجمالي</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.active}</p>
            <p className="text-slate-400 text-xs">نشط</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.critical}</p>
            <p className="text-slate-400 text-xs">حرج</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
            <p className="text-slate-400 text-xs">محلول</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="بحث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-8 bg-slate-800/50 border-slate-700 text-white h-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white h-9">
            <SelectValue placeholder="النوع" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="traffic">المرور</SelectItem>
            <SelectItem value="waste">النفايات</SelectItem>
            <SelectItem value="environment">البيئة</SelectItem>
            <SelectItem value="energy">الطاقة</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white h-9">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="active">نشط</SelectItem>
            <SelectItem value="acknowledged">تم الإقرار</SelectItem>
            <SelectItem value="in_progress">قيد المعالجة</SelectItem>
            <SelectItem value="resolved">محلول</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map(alert => (
          <Card key={alert.id} className={`border ${getSeverityColor(alert.severity)} ${alert.severity === 'critical' && alert.status === 'active' ? 'animate-pulse' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTypeIcon(alert.type)}</span>
                  <div>
                    <p className="text-white font-bold">{alert.title}</p>
                    <p className="text-slate-400 text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {alert.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(alert.status)}
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity === 'critical' ? 'حرج' : alert.severity === 'high' ? 'عالي' : 'متوسط'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{alert.time}</span>
                  {alert.assignee && <span className="flex items-center gap-1"><User className="w-3 h-3" />{alert.assignee}</span>}
                </div>

                <div className="flex gap-2">
                  {alert.status === 'active' && (
                    <>
                      <Button size="sm" variant="outline" className="border-amber-500/50 text-amber-400 h-7" onClick={() => acknowledgeAlert(alert.id)}>
                        <Eye className="w-3 h-3 ml-1" />إقرار
                      </Button>
                      <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-400 h-7" onClick={() => { setSelectedAlert(alert); setShowAssignDialog(true); }}>
                        <UserCheck className="w-3 h-3 ml-1" />تعيين
                      </Button>
                    </>
                  )}
                  {alert.status === 'in_progress' && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 h-7" onClick={() => resolveAlert(alert.id)}>
                      <CheckCircle className="w-3 h-3 ml-1" />حل
                    </Button>
                  )}
                  {alert.severity === 'critical' && alert.status !== 'resolved' && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => sendNotification('sms', alert.id)}>
                        <MessageSquare className="w-3 h-3 text-green-400" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => sendNotification('email', alert.id)}>
                        <Mail className="w-3 h-3 text-blue-400" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => sendNotification('push', alert.id)}>
                        <Bell className="w-3 h-3 text-amber-400" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">تعيين التنبيه</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {supervisors.map(sup => (
              <Button
                key={sup.id}
                variant="outline"
                className="w-full justify-start border-slate-600"
                onClick={() => selectedAlert && assignAlert(selectedAlert.id, sup)}
              >
                <User className="w-4 h-4 ml-2" />
                <div className="text-right">
                  <p className="text-white">{sup.name}</p>
                  <p className="text-slate-400 text-xs">{sup.department}</p>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}