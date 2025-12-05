import React, { useState } from 'react';
import {
  User, Bell, Calendar, MapPin, Camera, MessageSquare, Star, CreditCard,
  Truck, Sofa, AlertTriangle, CheckCircle, Clock, Phone, Send, Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const userRequests = [
  { id: 'REQ-001', type: 'bulk', description: 'أثاث قديم - كنبة وطاولة', status: 'scheduled', scheduledDate: '2024-12-05', address: 'حي الورود - شارع 15' },
  { id: 'REQ-002', type: 'report', description: 'حاوية ممتلئة في الشارع الرئيسي', status: 'resolved', resolvedDate: '2024-12-03', address: 'شارع الملك فهد' },
  { id: 'REQ-003', type: 'bulk', description: 'مرتبة وسرير قديم', status: 'pending', address: 'حي النزهة - فيلا 23' },
];

const collectionSchedule = [
  { day: 'الأحد', type: 'عام', time: '06:00 - 10:00' },
  { day: 'الثلاثاء', type: 'قابل للتدوير', time: '06:00 - 10:00' },
  { day: 'الخميس', type: 'عضوي', time: '14:00 - 18:00' },
];

const notifications = [
  { id: 1, title: 'موعد الجمع غداً', message: 'سيتم جمع النفايات العامة غداً من 6-10 صباحاً', time: '2 ساعة', read: false },
  { id: 2, title: 'تم قبول طلبك', message: 'تمت الموافقة على طلب جمع النفايات الضخمة', time: '1 يوم', read: true },
  { id: 3, title: 'شكراً لتعاونك', message: 'تم التعامل مع بلاغك بنجاح', time: '2 يوم', read: true },
];

export default function CitizenWasteApp() {
  const [activeSection, setActiveSection] = useState('home');
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [newRequest, setNewRequest] = useState({ type: 'bulk', description: '', address: '' });
  const [rating, setRating] = useState(0);

  const submitRequest = () => {
    if (!newRequest.description || !newRequest.address) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    toast.success('تم إرسال طلبك بنجاح');
    setShowNewRequest(false);
    setNewRequest({ type: 'bulk', description: '', address: '' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled': return <Badge className="bg-cyan-500/20 text-cyan-400">مجدول</Badge>;
      case 'pending': return <Badge className="bg-amber-500/20 text-amber-400">قيد المراجعة</Badge>;
      case 'resolved': return <Badge className="bg-green-500/20 text-green-400">مكتمل</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* User Header */}
      <Card className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 border-green-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500/30 flex items-center justify-center">
                <User className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-white font-bold">أحمد محمد</p>
                <p className="text-slate-400 text-sm">حي الورود - الرياض</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="relative">
                <Bell className="w-5 h-5 text-slate-400" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">2</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'طلب جمع ضخم', icon: Sofa, color: 'amber', action: () => { setNewRequest({...newRequest, type: 'bulk'}); setShowNewRequest(true); } },
          { label: 'الإبلاغ عن مشكلة', icon: AlertTriangle, color: 'red', action: () => { setNewRequest({...newRequest, type: 'report'}); setShowNewRequest(true); } },
          { label: 'مواعيد الجمع', icon: Calendar, color: 'cyan', action: () => setActiveSection('schedule') },
          { label: 'الدفع', icon: CreditCard, color: 'green', action: () => toast.info('سيتم إضافة خدمة الدفع قريباً') },
        ].map(action => (
          <Card key={action.label} className={`bg-${action.color}-500/10 border-${action.color}-500/30 cursor-pointer hover:scale-105 transition-transform`} onClick={action.action}>
            <CardContent className="p-4 text-center">
              <action.icon className={`w-8 h-8 text-${action.color}-400 mx-auto mb-2`} />
              <p className="text-white text-sm">{action.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Collection Schedule */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            جدول مواعيد الجمع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {collectionSchedule.map((schedule, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{schedule.day}</p>
                    <p className="text-slate-400 text-xs">{schedule.type}</p>
                  </div>
                </div>
                <Badge className="bg-slate-700">{schedule.time}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* My Requests */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              طلباتي
            </CardTitle>
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setShowNewRequest(true)}>
              <Plus className="w-4 h-4 ml-1" />
              طلب جديد
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {userRequests.map(request => (
                <div key={request.id} className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {request.type === 'bulk' ? <Sofa className="w-4 h-4 text-amber-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                      <span className="text-white font-medium text-sm">{request.id}</span>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-slate-300 text-sm mb-1">{request.description}</p>
                  <p className="text-slate-500 text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {request.address}
                  </p>
                  {request.scheduledDate && (
                    <p className="text-cyan-400 text-xs mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      موعد الاستلام: {request.scheduledDate}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            الإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {notifications.map(notif => (
              <div key={notif.id} className={`p-3 rounded-lg ${notif.read ? 'bg-slate-800/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white font-medium text-sm">{notif.title}</p>
                  <span className="text-slate-500 text-xs">{notif.time}</span>
                </div>
                <p className="text-slate-400 text-xs">{notif.message}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card className="glass-card border-green-500/30 bg-green-500/5">
        <CardContent className="p-4">
          <p className="text-white font-medium mb-2">قيم خدمة الجمع الأخيرة</p>
          <div className="flex items-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map(star => (
              <Star 
                key={star} 
                className={`w-8 h-8 cursor-pointer transition-colors ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <Button className="w-full bg-green-600 hover:bg-green-700" disabled={!rating} onClick={() => { toast.success('شكراً على تقييمك!'); setRating(0); }}>
            إرسال التقييم
          </Button>
        </CardContent>
      </Card>

      {/* New Request Dialog */}
      <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
        <DialogContent className="bg-[#0f1629] border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">طلب جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-slate-400 text-sm mb-1 block">نوع الطلب</label>
              <Select value={newRequest.type} onValueChange={(v) => setNewRequest({...newRequest, type: v})}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="bulk">جمع نفايات ضخمة</SelectItem>
                  <SelectItem value="report">الإبلاغ عن مشكلة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-1 block">الوصف</label>
              <Textarea 
                placeholder="صف طلبك بالتفصيل..."
                value={newRequest.description}
                onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-1 block">العنوان</label>
              <Input 
                placeholder="أدخل عنوانك الكامل"
                value={newRequest.address}
                onChange={(e) => setNewRequest({...newRequest, address: e.target.value})}
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-slate-600" onClick={() => setShowNewRequest(false)}>إلغاء</Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={submitRequest}>
                <Send className="w-4 h-4 ml-2" />
                إرسال
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}