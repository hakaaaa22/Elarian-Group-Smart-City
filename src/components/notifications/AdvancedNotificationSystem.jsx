import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Bell, Mail, MessageSquare, Smartphone, Send, Settings, Filter, Search,
  CheckCircle, Clock, AlertTriangle, User, Users, Eye, Trash2, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

// سجل الإشعارات
const notificationLogs = [
  { id: 'NTF-001', title: 'تنبيه حرج - برج الشرق', message: 'سرعة الرياح تجاوزت الحد الآمن', type: 'alert', severity: 'critical', channels: ['app', 'email', 'sms'], recipients: ['ahmed@example.com', 'sara@example.com'], status: 'delivered', sent_at: '2024-12-04 08:30', delivery_status: { app: 'delivered', email: 'delivered', sms: 'delivered' } },
  { id: 'NTF-002', title: 'صيانة مجدولة', message: 'صيانة برج الاتصالات المركزي غداً', type: 'maintenance', severity: 'info', channels: ['app', 'email'], recipients: ['team@example.com'], status: 'delivered', sent_at: '2024-12-04 09:00', delivery_status: { app: 'delivered', email: 'delivered' } },
  { id: 'NTF-003', title: 'تقرير يومي', message: 'تقرير أداء الأصول متاح للمراجعة', type: 'report', severity: 'info', channels: ['app'], recipients: ['managers'], status: 'read', sent_at: '2024-12-04 07:00', delivery_status: { app: 'read' } },
  { id: 'NTF-004', title: 'تحذير - كاميرا غير متصلة', message: 'كاميرا الحديقة غير متصلة منذ 30 دقيقة', type: 'alert', severity: 'warning', channels: ['app', 'email'], recipients: ['security@example.com'], status: 'delivered', sent_at: '2024-12-04 10:15', delivery_status: { app: 'delivered', email: 'failed' } },
];

// الأدوار المتاحة
const availableRoles = [
  { id: 'admin', name: 'مدير النظام' },
  { id: 'security_operator', name: 'مشغل أمن' },
  { id: 'municipal_manager', name: 'مدير بلدية' },
  { id: 'tower_operator', name: 'مشغل أبراج' },
  { id: 'maintenance', name: 'فريق الصيانة' },
];

// تفضيلات الإشعارات الافتراضية
const defaultPreferences = {
  app: true,
  email: true,
  sms: false,
  critical: { app: true, email: true, sms: true },
  warning: { app: true, email: true, sms: false },
  info: { app: true, email: false, sms: false }
};

export default function AdvancedNotificationSystem() {
  const [activeTab, setActiveTab] = useState('send');
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'system',
    severity: 'info',
    channels: ['app'],
    recipientType: 'roles',
    roles: [],
    emails: ''
  });

  const queryClient = useQueryClient();

  // إرسال إشعار
  const sendNotificationMutation = useMutation({
    mutationFn: async (data) => {
      // في الحالة الحقيقية سيتم إرسال للخادم
      // هنا نحاكي الإرسال
      if (data.channels.includes('email') && data.emails) {
        await base44.integrations.Core.SendEmail({
          to: data.emails.split(',')[0].trim(),
          subject: data.title,
          body: data.message
        });
      }
      return { success: true };
    },
    onSuccess: () => {
      toast.success('تم إرسال الإشعار بنجاح');
      setShowSendDialog(false);
      setNewNotification({
        title: '',
        message: '',
        type: 'system',
        severity: 'info',
        channels: ['app'],
        recipientType: 'roles',
        roles: [],
        emails: ''
      });
    }
  });

  const toggleChannel = (channel) => {
    setNewNotification(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  const toggleRole = (roleId) => {
    setNewNotification(prev => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter(r => r !== roleId)
        : [...prev.roles, roleId]
    }));
  };

  const filteredLogs = notificationLogs.filter(log =>
    log.title.includes(searchQuery) || log.message.includes(searchQuery)
  );

  const stats = {
    total: notificationLogs.length,
    delivered: notificationLogs.filter(n => n.status === 'delivered').length,
    read: notificationLogs.filter(n => n.status === 'read').length,
    failed: notificationLogs.filter(n => Object.values(n.delivery_status).includes('failed')).length
  };

  return (
    <div className="space-y-4" dir="rtl">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="send" className="data-[state=active]:bg-cyan-500/20">
            <Send className="w-4 h-4 ml-1" />
            إرسال إشعار
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-purple-500/20">
            <Clock className="w-4 h-4 ml-1" />
            سجل الإشعارات
          </TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-amber-500/20">
            <Settings className="w-4 h-4 ml-1" />
            التفضيلات
          </TabsTrigger>
        </TabsList>

        {/* Send Notification */}
        <TabsContent value="send" className="mt-4 space-y-4">
          <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" />
                إرسال إشعار جديد
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm">عنوان الإشعار</label>
                  <Input
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                    className="bg-slate-800 border-slate-700 mt-1"
                    placeholder="عنوان الإشعار"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 text-sm">النوع</label>
                    <Select value={newNotification.type} onValueChange={(v) => setNewNotification({...newNotification, type: v})}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="system">نظام</SelectItem>
                        <SelectItem value="alert">تنبيه</SelectItem>
                        <SelectItem value="maintenance">صيانة</SelectItem>
                        <SelectItem value="report">تقرير</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm">الأهمية</label>
                    <Select value={newNotification.severity} onValueChange={(v) => setNewNotification({...newNotification, severity: v})}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="info">معلومات</SelectItem>
                        <SelectItem value="warning">تحذير</SelectItem>
                        <SelectItem value="critical">حرج</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm">الرسالة</label>
                <Textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                  className="bg-slate-800 border-slate-700 mt-1"
                  placeholder="نص الرسالة..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-2 block">قنوات الإرسال</label>
                <div className="flex gap-2">
                  {[
                    { id: 'app', icon: Smartphone, name: 'التطبيق' },
                    { id: 'email', icon: Mail, name: 'البريد' },
                    { id: 'sms', icon: MessageSquare, name: 'SMS' }
                  ].map(ch => (
                    <Button key={ch.id} size="sm" variant={newNotification.channels.includes(ch.id) ? 'default' : 'outline'}
                      className={newNotification.channels.includes(ch.id) ? 'bg-cyan-600' : 'border-slate-600'}
                      onClick={() => toggleChannel(ch.id)}>
                      <ch.icon className="w-4 h-4 ml-1" />
                      {ch.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-2 block">المستلمون</label>
                <div className="flex gap-2 mb-3">
                  <Button size="sm" variant={newNotification.recipientType === 'roles' ? 'default' : 'outline'}
                    className={newNotification.recipientType === 'roles' ? 'bg-purple-600' : 'border-slate-600'}
                    onClick={() => setNewNotification({...newNotification, recipientType: 'roles'})}>
                    <Users className="w-4 h-4 ml-1" />
                    حسب الدور
                  </Button>
                  <Button size="sm" variant={newNotification.recipientType === 'emails' ? 'default' : 'outline'}
                    className={newNotification.recipientType === 'emails' ? 'bg-purple-600' : 'border-slate-600'}
                    onClick={() => setNewNotification({...newNotification, recipientType: 'emails'})}>
                    <Mail className="w-4 h-4 ml-1" />
                    بريد إلكتروني
                  </Button>
                </div>

                {newNotification.recipientType === 'roles' ? (
                  <div className="flex flex-wrap gap-2">
                    {availableRoles.map(role => (
                      <Button key={role.id} size="sm" variant={newNotification.roles.includes(role.id) ? 'default' : 'outline'}
                        className={newNotification.roles.includes(role.id) ? 'bg-slate-600' : 'border-slate-600'}
                        onClick={() => toggleRole(role.id)}>
                        {role.name}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <Input
                    value={newNotification.emails}
                    onChange={(e) => setNewNotification({...newNotification, emails: e.target.value})}
                    className="bg-slate-800 border-slate-700"
                    placeholder="email1@example.com, email2@example.com"
                  />
                )}
              </div>

              <Button className="w-full bg-cyan-600 hover:bg-cyan-700"
                onClick={() => sendNotificationMutation.mutate(newNotification)}
                disabled={!newNotification.title || !newNotification.message || sendNotificationMutation.isPending}>
                {sendNotificationMutation.isPending ? (
                  <><RefreshCw className="w-4 h-4 ml-2 animate-spin" />جاري الإرسال...</>
                ) : (
                  <><Send className="w-4 h-4 ml-2" />إرسال الإشعار</>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Logs */}
        <TabsContent value="logs" className="mt-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-slate-400">إجمالي</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-green-500/30 bg-green-500/5">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-green-400">{stats.delivered}</p>
                <p className="text-xs text-slate-400">تم التسليم</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-blue-500/30 bg-blue-500/5">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-blue-400">{stats.read}</p>
                <p className="text-xs text-slate-400">تمت القراءة</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-red-500/30 bg-red-500/5">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-red-400">{stats.failed}</p>
                <p className="text-xs text-slate-400">فشل</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 border-slate-700 pr-10"
              placeholder="بحث في الإشعارات..."
            />
          </div>

          {/* Logs List */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-700/50">
                {filteredLogs.map(log => (
                  <div key={log.id} className="p-4 hover:bg-slate-800/30">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        log.severity === 'critical' ? 'bg-red-500/20' :
                        log.severity === 'warning' ? 'bg-amber-500/20' : 'bg-blue-500/20'
                      }`}>
                        <Bell className={`w-5 h-5 ${
                          log.severity === 'critical' ? 'text-red-400' :
                          log.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-medium">{log.title}</p>
                          <Badge className={`text-xs ${
                            log.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            log.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {log.severity === 'critical' ? 'حرج' : log.severity === 'warning' ? 'تحذير' : 'معلومات'}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm">{log.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span><Clock className="w-3 h-3 inline ml-1" />{log.sent_at}</span>
                          <span className="flex items-center gap-1">
                            {log.channels.map(ch => (
                              <Badge key={ch} variant="outline" className="text-[10px] px-1">
                                {ch === 'app' ? <Smartphone className="w-3 h-3" /> :
                                 ch === 'email' ? <Mail className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                              </Badge>
                            ))}
                          </span>
                        </div>
                      </div>
                      <div className="text-left">
                        <Badge className={
                          log.status === 'read' ? 'bg-green-500/20 text-green-400' :
                          log.status === 'delivered' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-600 text-slate-300'
                        }>
                          {log.status === 'read' ? 'مقروء' : log.status === 'delivered' ? 'تم التسليم' : 'معلق'}
                        </Badge>
                        <div className="mt-2 text-xs space-y-1">
                          {Object.entries(log.delivery_status).map(([ch, status]) => (
                            <div key={ch} className="flex items-center gap-1">
                              <span className="text-slate-500">{ch}:</span>
                              {status === 'delivered' || status === 'read' ? (
                                <CheckCircle className="w-3 h-3 text-green-400" />
                              ) : (
                                <AlertTriangle className="w-3 h-3 text-red-400" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="mt-4 space-y-4">
          <Card className="glass-card border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-400" />
                تفضيلات الإشعارات حسب الأهمية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 'critical', name: 'تنبيهات حرجة', color: 'red' },
                  { id: 'warning', name: 'تحذيرات', color: 'amber' },
                  { id: 'info', name: 'معلومات', color: 'blue' }
                ].map(level => (
                  <div key={level.id} className="p-4 bg-slate-800/50 rounded-lg">
                    <p className={`text-${level.color}-400 font-medium mb-3`}>{level.name}</p>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 text-slate-300">
                        <Switch defaultChecked={defaultPreferences[level.id].app} />
                        <Smartphone className="w-4 h-4" />
                        التطبيق
                      </label>
                      <label className="flex items-center gap-2 text-slate-300">
                        <Switch defaultChecked={defaultPreferences[level.id].email} />
                        <Mail className="w-4 h-4" />
                        البريد
                      </label>
                      <label className="flex items-center gap-2 text-slate-300">
                        <Switch defaultChecked={defaultPreferences[level.id].sms} />
                        <MessageSquare className="w-4 h-4" />
                        SMS
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-amber-600 hover:bg-amber-700">
                <Settings className="w-4 h-4 ml-2" />
                حفظ التفضيلات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}