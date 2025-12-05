import React, { useState } from 'react';
import {
  Search, Filter, Clock, MapPin, Camera, Truck, CheckCircle, AlertTriangle,
  Eye, Calendar, Package, FileText, ChevronDown, ChevronUp, RefreshCw,
  User, Phone, MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const statusConfig = {
  pending: { label: 'قيد الانتظار', color: 'amber', progress: 25 },
  in_progress: { label: 'جاري المعالجة', color: 'cyan', progress: 50 },
  scheduled: { label: 'مجدول', color: 'blue', progress: 65 },
  assigned: { label: 'تم التكليف', color: 'purple', progress: 75 },
  resolved: { label: 'تم الحل', color: 'green', progress: 100 },
  completed: { label: 'مكتمل', color: 'green', progress: 100 },
  cancelled: { label: 'ملغي', color: 'red', progress: 0 },
};

const reportTypes = {
  broken: { label: 'حاوية مكسورة', color: 'amber' },
  overflow: { label: 'امتلاء زائد', color: 'red' },
  smell: { label: 'رائحة كريهة', color: 'purple' },
  missing: { label: 'حاوية مفقودة', color: 'cyan' },
  other: { label: 'أخرى', color: 'slate' },
};

// بيانات تجريبية مفصلة
const allItems = [
  { id: 'RPT-001', itemType: 'report', type: 'broken', location: 'حي الورود - شارع 12', description: 'حاوية مكسورة والغطاء لا يغلق', status: 'pending', priority: 'high', createdAt: '2024-12-04 08:30', photos: ['photo1.jpg'], citizenName: 'أحمد محمد', phone: '0501234567', updates: [{ time: '08:30', action: 'تم استلام البلاغ', by: 'النظام' }] },
  { id: 'RPT-002', itemType: 'report', type: 'overflow', location: 'المنتزه المركزي', description: 'الحاوية ممتلئة تماماً والنفايات على الأرض', status: 'in_progress', priority: 'critical', createdAt: '2024-12-04 07:15', photos: ['photo2.jpg', 'photo3.jpg'], citizenName: 'فاطمة علي', phone: '0559876543', assignedTruck: 'TRK-001', driverName: 'محمد أحمد', eta: '11:30', updates: [{ time: '07:15', action: 'تم استلام البلاغ', by: 'النظام' }, { time: '09:00', action: 'تم تكليف شاحنة TRK-001', by: 'مركز التحكم' }, { time: '09:15', action: 'الشاحنة في الطريق', by: 'السائق' }] },
  { id: 'RPT-003', itemType: 'report', type: 'smell', location: 'شارع الأمير سلطان', description: 'رائحة كريهة من الحاوية', status: 'resolved', priority: 'medium', createdAt: '2024-12-03 16:45', photos: [], citizenName: 'خالد سعيد', phone: '0541112233', resolvedAt: '2024-12-03 18:30', resolvedBy: 'فريق الصيانة', updates: [{ time: '16:45', action: 'تم استلام البلاغ', by: 'النظام' }, { time: '17:30', action: 'تم إرسال فريق الصيانة', by: 'مركز التحكم' }, { time: '18:30', action: 'تم حل المشكلة', by: 'فريق الصيانة' }] },
  { id: 'RPT-004', itemType: 'report', type: 'missing', location: 'حي الصفا', description: 'الحاوية مفقودة من مكانها', status: 'pending', priority: 'high', createdAt: '2024-12-04 09:00', photos: ['photo4.jpg'], citizenName: 'نورة أحمد', phone: '0567778899', updates: [{ time: '09:00', action: 'تم استلام البلاغ', by: 'النظام' }] },
  { id: 'BLK-001', itemType: 'bulk', location: 'حي الروضة - فيلا 45', description: 'أثاث قديم (سرير + خزانة)', status: 'scheduled', priority: 'medium', createdAt: '2024-12-03 14:00', scheduledDate: '2024-12-05 10:00', citizenName: 'سعود العتيبي', phone: '0508887766', estimatedWeight: '200 كغ', assignedTruck: 'TRK-004', updates: [{ time: '14:00', action: 'تم استلام الطلب', by: 'النظام' }, { time: '15:00', action: 'تمت الموافقة على الطلب', by: 'مركز التحكم' }, { time: '16:00', action: 'تم جدولة موعد الجمع', by: 'مركز التحكم' }] },
  { id: 'BLK-002', itemType: 'bulk', location: 'حي الملقا', description: 'مخلفات تجديد منزل', status: 'pending', priority: 'low', createdAt: '2024-12-04 10:30', citizenName: 'محمد الشهري', phone: '0532221100', estimatedWeight: '500 كغ', updates: [{ time: '10:30', action: 'تم استلام الطلب', by: 'النظام' }] },
  { id: 'BLK-003', itemType: 'bulk', location: 'المنطقة الصناعية', description: 'معدات مكتبية قديمة', status: 'completed', priority: 'medium', createdAt: '2024-12-02 11:00', completedAt: '2024-12-03 09:00', citizenName: 'شركة الأمل', phone: '0114445566', estimatedWeight: '300 كغ', updates: [{ time: '11:00', action: 'تم استلام الطلب', by: 'النظام' }, { time: '14:00', action: 'تم جدولة الجمع', by: 'مركز التحكم' }, { time: '09:00', action: 'تم الجمع بنجاح', by: 'السائق' }] },
];

export default function AdvancedTrackingPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedItems, setExpandedItems] = useState([]);

  const toggleExpand = (id) => {
    setExpandedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredItems = allItems.filter(item => {
    const matchSearch = item.location.includes(searchQuery) || item.description.includes(searchQuery) || item.id.includes(searchQuery);
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchType = filterType === 'all' || item.itemType === filterType || (filterType === 'reports' && item.itemType === 'report') || (filterType === 'bulk' && item.itemType === 'bulk');
    return matchSearch && matchStatus && matchType;
  });

  const stats = {
    total: allItems.length,
    pending: allItems.filter(i => i.status === 'pending').length,
    inProgress: allItems.filter(i => ['in_progress', 'scheduled', 'assigned'].includes(i.status)).length,
    completed: allItems.filter(i => ['resolved', 'completed'].includes(i.status)).length,
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'إجمالي الطلبات', value: stats.total, color: 'cyan' },
          { label: 'قيد الانتظار', value: stats.pending, color: 'amber' },
          { label: 'جاري المعالجة', value: stats.inProgress, color: 'blue' },
          { label: 'مكتملة', value: stats.completed, color: 'green' },
        ].map(stat => (
          <Card key={stat.label} className={`bg-${stat.color}-500/10 border-${stat.color}-500/30`}>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className={`text-${stat.color}-400 text-xs`}>{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Advanced Filters */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="بحث بالرقم، الموقع، أو الوصف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="in_progress">جاري المعالجة</SelectItem>
                <SelectItem value="scheduled">مجدول</SelectItem>
                <SelectItem value="resolved">تم الحل</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-36 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="reports">البلاغات</SelectItem>
                <SelectItem value="bulk">الجمع الضخم</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-36 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="الفترة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأوقات</SelectItem>
                <SelectItem value="today">اليوم</SelectItem>
                <SelectItem value="week">هذا الأسبوع</SelectItem>
                <SelectItem value="month">هذا الشهر</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-3">
          {filteredItems.map(item => {
            const status = statusConfig[item.status];
            const isExpanded = expandedItems.includes(item.id);
            const isReport = item.itemType === 'report';
            const typeConfig = isReport ? reportTypes[item.type] : null;
            
            return (
              <Card key={item.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isReport ? `bg-${typeConfig?.color || 'slate'}-500/20` : 'bg-purple-500/20'}`}>
                        {isReport ? <FileText className={`w-5 h-5 text-${typeConfig?.color || 'slate'}-400`} /> : <Package className="w-5 h-5 text-purple-400" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-bold">{item.id}</p>
                          <Badge className={isReport ? `bg-${typeConfig?.color || 'slate'}-500/20 text-${typeConfig?.color || 'slate'}-400` : 'bg-purple-500/20 text-purple-400'}>
                            {isReport ? typeConfig?.label : 'جمع ضخم'}
                          </Badge>
                          {item.priority === 'critical' && <Badge className="bg-red-500 text-white animate-pulse">عاجل</Badge>}
                        </div>
                        <p className="text-slate-400 text-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.location}
                        </p>
                      </div>
                    </div>
                    <Badge className={`bg-${status?.color}-500/20 text-${status?.color}-400`}>
                      {status?.label}
                    </Badge>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">التقدم</span>
                      <span className="text-slate-400">{status?.progress}%</span>
                    </div>
                    <Progress value={status?.progress} className="h-2" />
                  </div>

                  {/* Brief Info */}
                  <p className="text-white text-sm mb-3">{item.description}</p>

                  {/* Quick Info */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.createdAt}
                      </span>
                      {item.photos?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          {item.photos.length} صور
                        </span>
                      )}
                      {item.assignedTruck && (
                        <span className="flex items-center gap-1 text-cyan-400">
                          <Truck className="w-3 h-3" />
                          {item.assignedTruck}
                        </span>
                      )}
                      {item.scheduledDate && (
                        <span className="flex items-center gap-1 text-blue-400">
                          <Calendar className="w-3 h-3" />
                          {item.scheduledDate}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toggleExpand(item.id)}>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {isExpanded ? 'إخفاء' : 'المزيد'}
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs border-slate-600" onClick={() => setSelectedItem(item)}>
                        <Eye className="w-3 h-3 ml-1" />
                        التفاصيل
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Contact Info */}
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-400 text-xs mb-2">معلومات المُبلّغ</p>
                          <div className="space-y-1">
                            <p className="text-white text-sm flex items-center gap-2">
                              <User className="w-3 h-3 text-slate-500" />
                              {item.citizenName}
                            </p>
                            <p className="text-white text-sm flex items-center gap-2">
                              <Phone className="w-3 h-3 text-slate-500" />
                              {item.phone}
                            </p>
                          </div>
                        </div>

                        {/* Assignment Info */}
                        {(item.assignedTruck || item.eta) && (
                          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                            <p className="text-cyan-400 text-xs mb-2">معلومات التكليف</p>
                            <div className="space-y-1">
                              {item.assignedTruck && <p className="text-white text-sm">الشاحنة: {item.assignedTruck}</p>}
                              {item.driverName && <p className="text-white text-sm">السائق: {item.driverName}</p>}
                              {item.eta && <p className="text-white text-sm">الوصول المتوقع: {item.eta}</p>}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Timeline */}
                      {item.updates?.length > 0 && (
                        <div className="mt-4">
                          <p className="text-slate-400 text-xs mb-2">سجل التحديثات</p>
                          <div className="space-y-2">
                            {item.updates.map((update, i) => (
                              <div key={i} className="flex items-center gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                                <span className="text-slate-500 w-12">{update.time}</span>
                                <span className="text-white flex-1">{update.action}</span>
                                <span className="text-slate-500 text-xs">{update.by}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {selectedItem?.itemType === 'report' ? <FileText className="w-5 h-5 text-cyan-400" /> : <Package className="w-5 h-5 text-purple-400" />}
              تفاصيل {selectedItem?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 mt-4">
              <Tabs defaultValue="info">
                <TabsList className="bg-slate-800/50 border border-slate-700 w-full">
                  <TabsTrigger value="info" className="flex-1">المعلومات</TabsTrigger>
                  <TabsTrigger value="timeline" className="flex-1">التحديثات</TabsTrigger>
                  <TabsTrigger value="contact" className="flex-1">التواصل</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="mt-4 space-y-3">
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-slate-400 text-xs mb-1">الحالة</p>
                    <Badge className={`bg-${statusConfig[selectedItem.status]?.color}-500/20 text-${statusConfig[selectedItem.status]?.color}-400`}>
                      {statusConfig[selectedItem.status]?.label}
                    </Badge>
                    <Progress value={statusConfig[selectedItem.status]?.progress} className="h-2 mt-2" />
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-slate-400 text-xs mb-1">الموقع</p>
                    <p className="text-white">{selectedItem.location}</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-slate-400 text-xs mb-1">الوصف</p>
                    <p className="text-white">{selectedItem.description}</p>
                  </div>
                  {selectedItem.photos?.length > 0 && (
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-slate-400 text-xs mb-2">الصور المرفقة</p>
                      <div className="flex gap-2">
                        {selectedItem.photos.map((_, i) => (
                          <div key={i} className="w-16 h-16 bg-slate-700 rounded flex items-center justify-center">
                            <Camera className="w-6 h-6 text-slate-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedItem.assignedTruck && (
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                      <p className="text-cyan-400 text-xs mb-2">الشاحنة المكلفة</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{selectedItem.assignedTruck}</p>
                          {selectedItem.driverName && <p className="text-slate-400 text-sm">{selectedItem.driverName}</p>}
                        </div>
                        {selectedItem.eta && <Badge className="bg-green-500/20 text-green-400">ETA: {selectedItem.eta}</Badge>}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="timeline" className="mt-4">
                  <div className="space-y-3">
                    {selectedItem.updates?.map((update, i) => (
                      <div key={i} className="p-3 bg-slate-800/50 rounded-lg flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm">{update.action}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <span>{update.time}</span>
                            <span>•</span>
                            <span>{update.by}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="mt-4 space-y-3">
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-slate-400 text-xs mb-1">الاسم</p>
                    <p className="text-white">{selectedItem.citizenName}</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-slate-400 text-xs mb-1">رقم الهاتف</p>
                    <p className="text-white">{selectedItem.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      <Phone className="w-4 h-4 ml-2" />
                      اتصال
                    </Button>
                    <Button variant="outline" className="flex-1 border-cyan-500 text-cyan-400">
                      <MessageSquare className="w-4 h-4 ml-2" />
                      رسالة
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}