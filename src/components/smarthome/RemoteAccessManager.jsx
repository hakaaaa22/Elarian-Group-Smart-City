import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Key, Clock, User, UserPlus, Shield, Check, X, AlertTriangle,
  Home, Lock, Unlock, Eye, Settings, Smartphone, Calendar, Bell,
  Send, CheckCircle, XCircle, Timer, MapPin, Filter, Download,
  Search, ChevronDown, Activity, FileText, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const mockAccessGrants = [
  { id: 1, user: 'ضيف 1', email: 'guest1@example.com', type: 'temporary', rooms: ['غرفة المعيشة', 'المطبخ'], devices: [], startDate: '2024-12-04', endDate: '2024-12-06', status: 'active', createdBy: 'admin@elarian.com' },
  { id: 2, user: 'عامل الصيانة', email: 'maintenance@company.com', type: 'temporary', rooms: ['المدخل'], devices: ['قفل الباب'], startDate: '2024-12-05', endDate: '2024-12-05', status: 'scheduled', createdBy: 'admin@elarian.com' },
  { id: 3, user: 'جار', email: 'neighbor@example.com', type: 'emergency', rooms: [], devices: ['كاميرا المدخل'], startDate: null, endDate: null, status: 'expired', createdBy: 'admin@elarian.com' },
];

const mockAccessRequests = [
  { id: 1, user: 'صديق العائلة', email: 'friend@example.com', reason: 'زيارة عائلية يوم السبت', requestedRooms: ['غرفة المعيشة'], requestedDevices: [], duration: '24', status: 'pending', requestDate: '2024-12-04 10:30' },
  { id: 2, user: 'مقدم خدمة', email: 'service@company.com', reason: 'صيانة المكيف', requestedRooms: ['غرفة النوم'], requestedDevices: ['المكيف'], duration: '4', status: 'pending', requestDate: '2024-12-04 09:15' },
];

const mockAccessLog = [
  { id: 1, user: 'ضيف 1', email: 'guest1@example.com', action: 'دخول', target: 'غرفة المعيشة', targetType: 'room', time: '10:30', date: '2024-12-04', duration: '45 دقيقة', status: 'granted', ip: '192.168.1.50' },
  { id: 2, user: 'ضيف 1', email: 'guest1@example.com', action: 'تشغيل جهاز', target: 'التلفاز', targetType: 'device', time: '10:35', date: '2024-12-04', duration: '30 دقيقة', status: 'granted', ip: '192.168.1.50' },
  { id: 3, user: 'عامل الصيانة', email: 'maintenance@company.com', action: 'محاولة دخول', target: 'غرفة النوم', targetType: 'room', time: '09:00', date: '2024-12-04', duration: '-', status: 'denied', ip: '192.168.1.55' },
  { id: 4, user: 'ضيف 2', email: 'guest2@example.com', action: 'فتح قفل', target: 'قفل الباب الرئيسي', targetType: 'device', time: '14:20', date: '2024-12-03', duration: '2 ساعة', status: 'granted', ip: '192.168.1.60' },
  { id: 5, user: 'admin', email: 'admin@elarian.com', action: 'إلغاء وصول', target: 'ضيف 3', targetType: 'permission', time: '16:00', date: '2024-12-03', duration: '-', status: 'revoked', ip: '192.168.1.1' },
  { id: 6, user: 'جار', email: 'neighbor@example.com', action: 'مشاهدة كاميرا', target: 'كاميرا المدخل', targetType: 'device', time: '08:15', date: '2024-12-02', duration: '5 دقائق', status: 'granted', ip: '192.168.1.70' },
];

const rooms = ['غرفة المعيشة', 'غرفة النوم', 'المطبخ', 'الحمام', 'المدخل', 'المكتب'];
const devices = ['قفل الباب', 'كاميرا المدخل', 'المكيف', 'الإضاءة الرئيسية', 'التلفاز', 'السماعة الذكية'];

export default function RemoteAccessManager() {
  const [activeTab, setActiveTab] = useState('grants');
  const [accessGrants, setAccessGrants] = useState(mockAccessGrants);
  const [accessRequests, setAccessRequests] = useState(mockAccessRequests);
  const [accessLog, setAccessLog] = useState(mockAccessLog);
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showLogDetailDialog, setShowLogDetailDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedLogEntry, setSelectedLogEntry] = useState(null);
  const [newGrant, setNewGrant] = useState({
    user: '', email: '', type: 'temporary', rooms: [], devices: [],
    startDate: '', endDate: '', notifyOnAccess: true
  });
  
  // Log Filters
  const [logFilters, setLogFilters] = useState({
    user: 'all',
    status: 'all',
    targetType: 'all',
    dateFrom: '',
    dateTo: '',
    searchQuery: ''
  });

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return accessLog.filter(log => {
      const matchesUser = logFilters.user === 'all' || log.user === logFilters.user;
      const matchesStatus = logFilters.status === 'all' || log.status === logFilters.status;
      const matchesType = logFilters.targetType === 'all' || log.targetType === logFilters.targetType;
      const matchesSearch = !logFilters.searchQuery || 
        log.user.includes(logFilters.searchQuery) || 
        log.target.includes(logFilters.searchQuery) ||
        log.action.includes(logFilters.searchQuery);
      const matchesDateFrom = !logFilters.dateFrom || log.date >= logFilters.dateFrom;
      const matchesDateTo = !logFilters.dateTo || log.date <= logFilters.dateTo;
      return matchesUser && matchesStatus && matchesType && matchesSearch && matchesDateFrom && matchesDateTo;
    });
  }, [accessLog, logFilters]);

  // Unique users for filter
  const uniqueUsers = [...new Set(accessLog.map(l => l.user))];

  // Log stats
  const logStats = useMemo(() => ({
    total: accessLog.length,
    granted: accessLog.filter(l => l.status === 'granted').length,
    denied: accessLog.filter(l => l.status === 'denied').length,
    revoked: accessLog.filter(l => l.status === 'revoked').length
  }), [accessLog]);

  const exportLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "User,Email,Action,Target,Type,Date,Time,Duration,Status,IP\n" +
      filteredLogs.map(l => `${l.user},${l.email},${l.action},${l.target},${l.targetType},${l.date},${l.time},${l.duration},${l.status},${l.ip}`).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "access_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('تم تصدير السجل');
  };

  const createGrant = () => {
    if (!newGrant.user || !newGrant.email) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    const grant = {
      ...newGrant,
      id: Date.now(),
      status: 'active',
      createdBy: 'admin@elarian.com'
    };
    setAccessGrants([...accessGrants, grant]);
    setShowGrantDialog(false);
    setNewGrant({ user: '', email: '', type: 'temporary', rooms: [], devices: [], startDate: '', endDate: '', notifyOnAccess: true });
    toast.success('تم إنشاء صلاحية الوصول');
  };

  const approveRequest = (request) => {
    const grant = {
      id: Date.now(),
      user: request.user,
      email: request.email,
      type: 'temporary',
      rooms: request.requestedRooms,
      devices: request.requestedDevices,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + parseInt(request.duration) * 3600000).toISOString().split('T')[0],
      status: 'active',
      createdBy: 'admin@elarian.com'
    };
    setAccessGrants([...accessGrants, grant]);
    setAccessRequests(accessRequests.filter(r => r.id !== request.id));
    setShowRequestDialog(false);
    toast.success('تم الموافقة على الطلب');
  };

  const rejectRequest = (requestId) => {
    setAccessRequests(accessRequests.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
    setShowRequestDialog(false);
    toast.success('تم رفض الطلب');
  };

  const revokeGrant = (grantId) => {
    setAccessGrants(accessGrants.map(g => g.id === grantId ? { ...g, status: 'revoked' } : g));
    toast.success('تم إلغاء صلاحية الوصول');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            إدارة الوصول عن بُعد
          </h3>
          <p className="text-slate-400 text-sm">منح وإدارة صلاحيات الوصول للضيوف</p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => setShowGrantDialog(true)}>
          <UserPlus className="w-4 h-4 ml-2" />
          منح وصول جديد
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'صلاحيات نشطة', value: accessGrants.filter(g => g.status === 'active').length, color: 'green' },
          { label: 'طلبات معلقة', value: accessRequests.filter(r => r.status === 'pending').length, color: 'amber' },
          { label: 'مجدولة', value: accessGrants.filter(g => g.status === 'scheduled').length, color: 'blue' },
          { label: 'منتهية', value: accessGrants.filter(g => g.status === 'expired').length, color: 'slate' },
        ].map((stat, i) => (
          <Card key={i} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
              <p className="text-slate-400 text-xs">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="grants">الصلاحيات</TabsTrigger>
          <TabsTrigger value="requests">
            الطلبات
            {accessRequests.filter(r => r.status === 'pending').length > 0 && (
              <Badge className="bg-red-500 text-white text-xs mr-2">{accessRequests.filter(r => r.status === 'pending').length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="log">سجل الوصول</TabsTrigger>
        </TabsList>

        <TabsContent value="grants" className="space-y-3 mt-4">
          {accessGrants.map((grant, i) => (
            <motion.div key={grant.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-amber-500/20 text-amber-400">{grant.user.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-medium">{grant.user}</h4>
                          <Badge className={`text-xs ${
                            grant.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            grant.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                            grant.status === 'revoked' ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'
                          }`}>
                            {grant.status === 'active' ? 'نشط' : grant.status === 'scheduled' ? 'مجدول' : grant.status === 'revoked' ? 'ملغى' : 'منتهي'}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-xs">{grant.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {grant.status === 'active' && (
                        <Button size="sm" variant="outline" className="border-red-500/50 text-red-400" onClick={() => revokeGrant(grant.id)}>
                          <X className="w-3 h-3 ml-1" />
                          إلغاء
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {grant.rooms.map(room => (
                        <Badge key={room} variant="outline" className="border-cyan-500/50 text-cyan-400 text-xs">
                          <Home className="w-3 h-3 ml-1" />{room}
                        </Badge>
                      ))}
                      {grant.devices.map(device => (
                        <Badge key={device} variant="outline" className="border-purple-500/50 text-purple-400 text-xs">
                          <Smartphone className="w-3 h-3 ml-1" />{device}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-slate-500 text-xs">
                      <Clock className="w-3 h-3 inline ml-1" />
                      {grant.startDate} - {grant.endDate || 'غير محدد'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="requests" className="space-y-3 mt-4">
          {accessRequests.filter(r => r.status === 'pending').map((request, i) => (
            <Card key={request.id} className="glass-card border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-medium">{request.user}</h4>
                      <Badge className="bg-amber-500/20 text-amber-400 text-xs">معلق</Badge>
                    </div>
                    <p className="text-slate-400 text-xs mb-2">{request.email}</p>
                    <p className="text-slate-300 text-sm mb-2">{request.reason}</p>
                    <div className="flex flex-wrap gap-1">
                      {request.requestedRooms.map(room => (
                        <Badge key={room} variant="outline" className="border-slate-600 text-slate-300 text-xs">{room}</Badge>
                      ))}
                    </div>
                    <p className="text-slate-500 text-xs mt-2">المدة المطلوبة: {request.duration} ساعة</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => approveRequest(request)}>
                      <Check className="w-3 h-3 ml-1" />
                      موافقة
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-500/50 text-red-400" onClick={() => rejectRequest(request.id)}>
                      <X className="w-3 h-3 ml-1" />
                      رفض
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {accessRequests.filter(r => r.status === 'pending').length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-slate-400">لا توجد طلبات معلقة</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="log" className="space-y-4 mt-4">
          {/* Log Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'إجمالي الأحداث', value: logStats.total, color: 'cyan' },
              { label: 'مسموح', value: logStats.granted, color: 'green' },
              { label: 'مرفوض', value: logStats.denied, color: 'red' },
              { label: 'ملغى', value: logStats.revoked, color: 'amber' }
            ].map((stat, i) => (
              <div key={i} className={`p-3 bg-${stat.color}-500/10 border border-${stat.color}-500/30 rounded-lg text-center`}>
                <p className={`text-xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                <p className="text-slate-400 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-white text-sm font-medium">تصفية السجل</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="relative col-span-2">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="بحث..."
                    value={logFilters.searchQuery}
                    onChange={(e) => setLogFilters({ ...logFilters, searchQuery: e.target.value })}
                    className="pr-9 bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <Select value={logFilters.user} onValueChange={(v) => setLogFilters({ ...logFilters, user: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="المستخدم" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">جميع المستخدمين</SelectItem>
                    {uniqueUsers.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={logFilters.status} onValueChange={(v) => setLogFilters({ ...logFilters, status: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="granted">مسموح</SelectItem>
                    <SelectItem value="denied">مرفوض</SelectItem>
                    <SelectItem value="revoked">ملغى</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={logFilters.targetType} onValueChange={(v) => setLogFilters({ ...logFilters, targetType: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="النوع" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="room">غرفة</SelectItem>
                    <SelectItem value="device">جهاز</SelectItem>
                    <SelectItem value="permission">صلاحية</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="border-slate-600" onClick={exportLogs}>
                  <Download className="w-4 h-4 ml-2" />
                  تصدير
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <Label className="text-slate-400 text-xs">من تاريخ</Label>
                  <Input type="date" value={logFilters.dateFrom} onChange={(e) => setLogFilters({ ...logFilters, dateFrom: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-slate-400 text-xs">إلى تاريخ</Label>
                  <Input type="date" value={logFilters.dateTo} onChange={(e) => setLogFilters({ ...logFilters, dateTo: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Log Entries */}
          <div className="space-y-2">
            {filteredLogs.map((log, i) => (
              <motion.div 
                key={log.id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-all"
                onClick={() => { setSelectedLogEntry(log); setShowLogDetailDialog(true); }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    log.status === 'granted' ? 'bg-green-500/20' : 
                    log.status === 'denied' ? 'bg-red-500/20' : 'bg-amber-500/20'
                  }`}>
                    {log.status === 'granted' ? <Unlock className="w-4 h-4 text-green-400" /> : 
                     log.status === 'denied' ? <Lock className="w-4 h-4 text-red-400" /> :
                     <XCircle className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium">{log.user}</p>
                      <Badge className={`text-[10px] ${
                        log.status === 'granted' ? 'bg-green-500/20 text-green-400' : 
                        log.status === 'denied' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {log.status === 'granted' ? 'مسموح' : log.status === 'denied' ? 'مرفوض' : 'ملغى'}
                      </Badge>
                      <Badge variant="outline" className="border-slate-600 text-slate-400 text-[10px]">
                        {log.targetType === 'room' ? 'غرفة' : log.targetType === 'device' ? 'جهاز' : 'صلاحية'}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-xs">{log.action} - {log.target}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-slate-400 text-xs">{log.time}</p>
                  <p className="text-slate-500 text-xs">{log.date}</p>
                  {log.duration !== '-' && <p className="text-cyan-400 text-[10px]">{log.duration}</p>}
                </div>
              </motion.div>
            ))}
            {filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">لا توجد سجلات مطابقة</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Log Detail Dialog */}
      <Dialog open={showLogDetailDialog} onOpenChange={setShowLogDetailDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              تفاصيل حدث الوصول
            </DialogTitle>
          </DialogHeader>
          {selectedLogEntry && (
            <div className="space-y-4 mt-4">
              <div className={`p-4 rounded-lg ${
                selectedLogEntry.status === 'granted' ? 'bg-green-500/10 border border-green-500/30' : 
                selectedLogEntry.status === 'denied' ? 'bg-red-500/10 border border-red-500/30' : 
                'bg-amber-500/10 border border-amber-500/30'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-bold">{selectedLogEntry.action}</h4>
                  <Badge className={`${
                    selectedLogEntry.status === 'granted' ? 'bg-green-500/20 text-green-400' : 
                    selectedLogEntry.status === 'denied' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {selectedLogEntry.status === 'granted' ? 'مسموح' : selectedLogEntry.status === 'denied' ? 'مرفوض' : 'ملغى'}
                  </Badge>
                </div>
                <p className="text-slate-300 text-sm">{selectedLogEntry.target}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">المستخدم</p>
                  <p className="text-white text-sm font-medium">{selectedLogEntry.user}</p>
                  <p className="text-slate-500 text-xs">{selectedLogEntry.email}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">نوع الهدف</p>
                  <p className="text-white text-sm font-medium">
                    {selectedLogEntry.targetType === 'room' ? 'غرفة' : selectedLogEntry.targetType === 'device' ? 'جهاز' : 'صلاحية'}
                  </p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">التاريخ والوقت</p>
                  <p className="text-white text-sm font-medium">{selectedLogEntry.date}</p>
                  <p className="text-slate-500 text-xs">{selectedLogEntry.time}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">مدة الوصول</p>
                  <p className="text-cyan-400 text-sm font-medium">{selectedLogEntry.duration}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg col-span-2">
                  <p className="text-slate-400 text-xs mb-1">عنوان IP</p>
                  <p className="text-white text-sm font-mono">{selectedLogEntry.ip}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">منح وصول جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">اسم الشخص</Label>
              <Input value={newGrant.user} onChange={(e) => setNewGrant({ ...newGrant, user: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="اسم الضيف" />
            </div>
            <div>
              <Label className="text-slate-300">البريد الإلكتروني</Label>
              <Input type="email" value={newGrant.email} onChange={(e) => setNewGrant({ ...newGrant, email: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="email@example.com" />
            </div>
            <div>
              <Label className="text-slate-300">الغرف</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {rooms.map(room => (
                  <Badge key={room} variant="outline" className={`cursor-pointer ${newGrant.rooms.includes(room) ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400' : 'border-slate-600 text-slate-400'}`}
                    onClick={() => {
                      const r = newGrant.rooms.includes(room) ? newGrant.rooms.filter(x => x !== room) : [...newGrant.rooms, room];
                      setNewGrant({ ...newGrant, rooms: r });
                    }}>
                    {room}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-slate-300">الأجهزة</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {devices.map(device => (
                  <Badge key={device} variant="outline" className={`cursor-pointer ${newGrant.devices.includes(device) ? 'border-purple-500 bg-purple-500/20 text-purple-400' : 'border-slate-600 text-slate-400'}`}
                    onClick={() => {
                      const d = newGrant.devices.includes(device) ? newGrant.devices.filter(x => x !== device) : [...newGrant.devices, device];
                      setNewGrant({ ...newGrant, devices: d });
                    }}>
                    {device}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300">تاريخ البدء</Label>
                <Input type="date" value={newGrant.startDate} onChange={(e) => setNewGrant({ ...newGrant, startDate: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
              <div>
                <Label className="text-slate-300">تاريخ الانتهاء</Label>
                <Input type="date" value={newGrant.endDate} onChange={(e) => setNewGrant({ ...newGrant, endDate: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
              <span className="text-white text-sm">إشعار عند الوصول</span>
              <Switch checked={newGrant.notifyOnAccess} onCheckedChange={(v) => setNewGrant({ ...newGrant, notifyOnAccess: v })} />
            </div>
            <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={createGrant}>
              <Key className="w-4 h-4 ml-2" />
              منح الوصول
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}