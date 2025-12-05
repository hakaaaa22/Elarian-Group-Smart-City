import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Shield, Key, Lock, Eye, EyeOff, Smartphone, Mail, AlertTriangle,
  CheckCircle, XCircle, Clock, User, Activity, RefreshCw, Settings,
  FileText, Bell, Zap, Globe, Database, Server
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// إعدادات MFA
const mfaMethods = [
  { id: 'app', name: 'تطبيق المصادقة', icon: Smartphone, enabled: true },
  { id: 'sms', name: 'رسالة SMS', icon: Mail, enabled: false },
  { id: 'email', name: 'البريد الإلكتروني', icon: Mail, enabled: true },
];

// سجل الأنشطة
const auditLogs = [
  { id: 1, user: 'أحمد محمد', action: 'تسجيل دخول', ip: '192.168.1.100', time: '10:30', status: 'success', module: 'auth' },
  { id: 2, user: 'سارة خالد', action: 'تعديل إعدادات', ip: '192.168.1.105', time: '10:25', status: 'success', module: 'settings' },
  { id: 3, user: 'غير معروف', action: 'محاولة دخول فاشلة', ip: '45.33.32.156', time: '10:20', status: 'failed', module: 'auth' },
  { id: 4, user: 'محمد علي', action: 'حذف تقرير', ip: '192.168.1.110', time: '10:15', status: 'success', module: 'reports' },
  { id: 5, user: 'فاطمة أحمد', action: 'إنشاء مستخدم', ip: '192.168.1.108', time: '10:10', status: 'success', module: 'users' },
];

// تنبيهات الأمان
const securityAlerts = [
  { id: 1, type: 'intrusion', message: 'محاولات تسجيل دخول متعددة فاشلة من IP مشبوه', severity: 'high', time: '10:20' },
  { id: 2, type: 'anomaly', message: 'نشاط غير طبيعي مكتشف - تحميل بيانات كبير', severity: 'medium', time: '09:45' },
  { id: 3, type: 'policy', message: 'مستخدم يحاول الوصول لموارد غير مصرح بها', severity: 'low', time: '09:30' },
];

// الأدوار والصلاحيات
const roles = [
  { id: 'admin', name: 'مدير النظام', users: 2, permissions: 45 },
  { id: 'manager', name: 'مدير', users: 5, permissions: 32 },
  { id: 'operator', name: 'مشغل', users: 12, permissions: 18 },
  { id: 'viewer', name: 'مشاهد', users: 25, permissions: 8 },
];

const permissionModules = [
  { id: 'dashboard', name: 'لوحة التحكم', actions: ['view', 'edit', 'admin'] },
  { id: 'reports', name: 'التقارير', actions: ['view', 'create', 'edit', 'delete'] },
  { id: 'users', name: 'المستخدمين', actions: ['view', 'create', 'edit', 'delete'] },
  { id: 'fleet', name: 'الأسطول', actions: ['view', 'edit', 'admin'] },
  { id: 'settings', name: 'الإعدادات', actions: ['view', 'edit'] },
];

export default function SecurityCenter() {
  const [activeTab, setActiveTab] = useState('mfa');
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [securitySettings, setSecuritySettings] = useState({
    mfaEnabled: true,
    sessionTimeout: 30,
    ipWhitelist: true,
    bruteForceProtection: true,
    anomalyDetection: true,
  });

  // إعداد MFA
  const setupMFA = useMutation({
    mutationFn: async (method) => {
      // محاكاة إعداد MFA
      await new Promise(r => setTimeout(r, 1000));
      return { qrCode: 'data:image/png;base64,...', secret: 'ABCD1234EFGH5678' };
    },
    onSuccess: () => {
      toast.success('تم إعداد المصادقة الثنائية');
      setShowMFASetup(false);
    }
  });

  const verifyMFA = () => {
    if (mfaCode.length === 6) {
      toast.success('تم التحقق بنجاح');
      setShowMFASetup(false);
    } else {
      toast.error('الرمز غير صحيح');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'red';
      case 'medium': return 'amber';
      default: return 'slate';
    }
  };

  const getStatusColor = (status) => status === 'success' ? 'green' : 'red';

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          مركز الأمان
        </h3>
        <Badge className="bg-green-500/20 text-green-400">
          <CheckCircle className="w-3 h-3 ml-1" />
          النظام آمن
        </Badge>
      </div>

      {/* Security Score */}
      <Card className="glass-card border-green-500/30 bg-green-500/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">درجة الأمان</span>
            <span className="text-green-400 font-bold text-xl">92/100</span>
          </div>
          <Progress value={92} className="h-2" />
          <div className="flex gap-2 mt-3">
            <Badge className="bg-green-500/20 text-green-400">MFA مفعل</Badge>
            <Badge className="bg-green-500/20 text-green-400">كشف التسلل نشط</Badge>
            <Badge className="bg-amber-500/20 text-amber-400">3 تنبيهات</Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="mfa" className="data-[state=active]:bg-cyan-500/20">
            <Key className="w-4 h-4 ml-1" />
            MFA
          </TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-purple-500/20">
            <FileText className="w-4 h-4 ml-1" />
            سجل النشاط
          </TabsTrigger>
          <TabsTrigger value="intrusion" className="data-[state=active]:bg-red-500/20">
            <AlertTriangle className="w-4 h-4 ml-1" />
            كشف التسلل
          </TabsTrigger>
          <TabsTrigger value="rbac" className="data-[state=active]:bg-amber-500/20">
            <User className="w-4 h-4 ml-1" />
            RBAC
          </TabsTrigger>
        </TabsList>

        {/* MFA Tab */}
        <TabsContent value="mfa" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">طرق المصادقة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mfaMethods.map(method => (
                  <div key={method.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <method.icon className={`w-5 h-5 ${method.enabled ? 'text-green-400' : 'text-slate-500'}`} />
                      <span className="text-white">{method.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.enabled ? (
                        <Badge className="bg-green-500/20 text-green-400">مفعل</Badge>
                      ) : (
                        <Button size="sm" variant="outline" className="border-cyan-500 text-cyan-400 h-7" onClick={() => setShowMFASetup(true)}>
                          تفعيل
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">إعدادات الأمان</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { key: 'mfaEnabled', label: 'المصادقة الثنائية إلزامية', icon: Key },
                  { key: 'bruteForceProtection', label: 'حماية من هجمات القوة الغاشمة', icon: Shield },
                  { key: 'ipWhitelist', label: 'قائمة IP المسموح بها', icon: Globe },
                  { key: 'anomalyDetection', label: 'كشف الأنشطة المشبوهة', icon: Activity },
                ].map(setting => (
                  <div key={setting.key} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <setting.icon className="w-4 h-4 text-cyan-400" />
                      <span className="text-white text-sm">{setting.label}</span>
                    </div>
                    <Switch checked={securitySettings[setting.key]} onCheckedChange={(v) => setSecuritySettings(prev => ({ ...prev, [setting.key]: v }))} />
                  </div>
                ))}
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">مهلة انتهاء الجلسة</span>
                    <Select value={String(securitySettings.sessionTimeout)} onValueChange={(v) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(v) }))}>
                      <SelectTrigger className="w-24 h-8 bg-slate-900 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 دقيقة</SelectItem>
                        <SelectItem value="30">30 دقيقة</SelectItem>
                        <SelectItem value="60">ساعة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm">سجل النشاطات</CardTitle>
                <Button size="sm" variant="outline" className="border-slate-600 text-slate-400 h-7">
                  <RefreshCw className="w-3 h-3 ml-1" />
                  تحديث
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[350px]">
                <div className="space-y-2">
                  {auditLogs.map(log => (
                    <div key={log.id} className={`p-3 rounded-lg border ${log.status === 'success' ? 'bg-slate-800/50 border-slate-700' : 'bg-red-500/10 border-red-500/30'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {log.status === 'success' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                          <span className="text-white font-medium">{log.action}</span>
                        </div>
                        <span className="text-slate-500 text-xs">{log.time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{log.user}</span>
                        <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{log.ip}</span>
                        <Badge className="bg-slate-700 text-slate-300">{log.module}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Intrusion Detection Tab */}
        <TabsContent value="intrusion" className="mt-4">
          <div className="grid lg:grid-cols-3 gap-4 mb-4">
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-3 text-center">
                <Shield className="w-6 h-6 text-green-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">1,245</p>
                <p className="text-green-400 text-xs">هجمات محجوبة</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-3 text-center">
                <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">3</p>
                <p className="text-amber-400 text-xs">تنبيهات نشطة</p>
              </CardContent>
            </Card>
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardContent className="p-3 text-center">
                <Activity className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">99.8%</p>
                <p className="text-cyan-400 text-xs">وقت التشغيل</p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-red-500/30 bg-red-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">التنبيهات الأمنية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityAlerts.map(alert => (
                  <div key={alert.id} className={`p-3 rounded-lg border bg-${getSeverityColor(alert.severity)}-500/10 border-${getSeverityColor(alert.severity)}-500/30`}>
                    <div className="flex items-center justify-between mb-1">
                      <Badge className={`bg-${getSeverityColor(alert.severity)}-500/20 text-${getSeverityColor(alert.severity)}-400`}>
                        {alert.severity === 'high' ? 'عالي' : alert.severity === 'medium' ? 'متوسط' : 'منخفض'}
                      </Badge>
                      <span className="text-slate-500 text-xs">{alert.time}</span>
                    </div>
                    <p className="text-white text-sm">{alert.message}</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 h-6 text-xs">حظر IP</Button>
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-400 h-6 text-xs">تجاهل</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RBAC Tab */}
        <TabsContent value="rbac" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm">الأدوار</CardTitle>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 h-7">
                    <User className="w-3 h-3 ml-1" />
                    دور جديد
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {roles.map(role => (
                    <div key={role.id} onClick={() => { setSelectedRole(role); setShowRoleDialog(true); }} className="p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{role.name}</span>
                        <Badge className="bg-slate-700 text-slate-300">{role.users} مستخدم</Badge>
                      </div>
                      <p className="text-slate-500 text-xs mt-1">{role.permissions} صلاحية</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">مصفوفة الصلاحيات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400">
                        <th className="text-right p-2">الوحدة</th>
                        <th className="text-center p-2">عرض</th>
                        <th className="text-center p-2">تعديل</th>
                        <th className="text-center p-2">حذف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permissionModules.slice(0, 4).map(mod => (
                        <tr key={mod.id} className="border-t border-slate-700">
                          <td className="p-2 text-white">{mod.name}</td>
                          <td className="text-center p-2"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                          <td className="text-center p-2"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                          <td className="text-center p-2"><XCircle className="w-4 h-4 text-slate-500 mx-auto" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* MFA Setup Dialog */}
      <Dialog open={showMFASetup} onOpenChange={setShowMFASetup}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">إعداد المصادقة الثنائية</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-white rounded-lg mx-auto w-32 h-32 flex items-center justify-center">
              <span className="text-slate-500 text-xs">QR Code</span>
            </div>
            <p className="text-slate-400 text-sm text-center">امسح الرمز بتطبيق المصادقة</p>
            <div>
              <Label className="text-slate-400">رمز التحقق</Label>
              <Input value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} maxLength={6} placeholder="000000" className="bg-slate-800/50 border-slate-700 text-white text-center text-xl tracking-widest mt-2" />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="border-slate-600 text-slate-400" onClick={() => setShowMFASetup(false)}>إلغاء</Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={verifyMFA}>تأكيد</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}