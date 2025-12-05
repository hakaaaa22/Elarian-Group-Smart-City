import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Database, Server, HardDrive, Cloud, Shield, Key, Bell, 
  Globe, RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock, Save,
  Plus, Trash2, Eye, EyeOff, Copy, Download, Upload, Activity, Cpu,
  Wifi, Lock, Unlock, RotateCcw, Play, Pause, Terminal, FileText, Users
} from 'lucide-react';
import UserRoleManagement from './UserRoleManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// إعدادات قواعد البيانات
const databaseConfigs = [
  {
    id: 'db-main',
    name: 'قاعدة البيانات الرئيسية',
    type: 'PostgreSQL',
    host: 'db.smartcity.local',
    port: 5432,
    status: 'connected',
    connections: 45,
    maxConnections: 100,
    size: '2.4 TB',
    lastBackup: '2024-12-04 03:00'
  },
  {
    id: 'db-analytics',
    name: 'قاعدة بيانات التحليلات',
    type: 'ClickHouse',
    host: 'analytics.smartcity.local',
    port: 8123,
    status: 'connected',
    connections: 12,
    maxConnections: 50,
    size: '850 GB',
    lastBackup: '2024-12-04 02:00'
  },
  {
    id: 'db-cache',
    name: 'خادم التخزين المؤقت',
    type: 'Redis',
    host: 'cache.smartcity.local',
    port: 6379,
    status: 'connected',
    connections: 89,
    maxConnections: 200,
    size: '32 GB',
    lastBackup: 'N/A'
  }
];

// إعدادات الخوادم
const serverConfigs = [
  { id: 'srv-api', name: 'خادم API الرئيسي', ip: '192.168.1.10', status: 'running', cpu: 45, memory: 62, uptime: '45 يوم' },
  { id: 'srv-ai', name: 'خادم AI Vision', ip: '192.168.1.20', status: 'running', cpu: 78, memory: 85, uptime: '30 يوم' },
  { id: 'srv-stream', name: 'خادم البث', ip: '192.168.1.30', status: 'running', cpu: 52, memory: 71, uptime: '60 يوم' },
  { id: 'srv-backup', name: 'خادم النسخ الاحتياطي', ip: '192.168.1.40', status: 'running', cpu: 15, memory: 45, uptime: '90 يوم' },
];

// إعدادات النسخ الاحتياطي
const backupConfigs = [
  { id: 'bkp-daily', name: 'نسخ يومي', frequency: 'يومياً 3:00 ص', retention: '30 يوم', lastRun: '2024-12-04 03:00', status: 'success', size: '150 GB' },
  { id: 'bkp-weekly', name: 'نسخ أسبوعي', frequency: 'كل جمعة 1:00 ص', retention: '12 أسبوع', lastRun: '2024-11-29 01:00', status: 'success', size: '180 GB' },
  { id: 'bkp-monthly', name: 'نسخ شهري', frequency: 'أول كل شهر', retention: '12 شهر', lastRun: '2024-12-01 00:00', status: 'success', size: '200 GB' },
  { id: 'bkp-cloud', name: 'نسخ سحابي', frequency: 'كل 6 ساعات', retention: '90 يوم', lastRun: '2024-12-04 06:00', status: 'running', size: '2.4 TB' },
];

// إعدادات التخزين
const storageConfigs = [
  { id: 'stor-video', name: 'تخزين الفيديو', path: '/mnt/video', total: 50, used: 35, type: 'NAS' },
  { id: 'stor-logs', name: 'تخزين السجلات', path: '/mnt/logs', total: 10, used: 6.5, type: 'SSD' },
  { id: 'stor-backup', name: 'تخزين النسخ الاحتياطي', path: '/mnt/backup', total: 100, used: 45, type: 'HDD' },
  { id: 'stor-ai', name: 'تخزين نماذج AI', path: '/mnt/ai-models', total: 5, used: 3.2, type: 'NVMe' },
];

// إعدادات الوحدات
const moduleConfigs = [
  { id: 'ai_vision', name: 'AI Vision', enabled: true, apiEndpoint: '/api/v1/ai-vision', rateLimit: 1000 },
  { id: 'municipality', name: 'البلدية الذكية', enabled: true, apiEndpoint: '/api/v1/municipality', rateLimit: 500 },
  { id: 'hospital', name: 'المستشفى الذكي', enabled: true, apiEndpoint: '/api/v1/hospital', rateLimit: 500 },
  { id: 'fleet', name: 'إدارة الأسطول', enabled: true, apiEndpoint: '/api/v1/fleet', rateLimit: 300 },
  { id: 'towers', name: 'إدارة الأبراج', enabled: true, apiEndpoint: '/api/v1/towers', rateLimit: 200 },
  { id: 'waste', name: 'إدارة النفايات', enabled: true, apiEndpoint: '/api/v1/waste', rateLimit: 300 },
];

export default function SystemConfigurationPanel() {
  const [activeTab, setActiveTab] = useState('databases');
  const [showPasswordFields, setShowPasswordFields] = useState({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addDialogType, setAddDialogType] = useState('');
  const [testingConnection, setTestingConnection] = useState(null);

  const testConnection = async (configId, type) => {
    setTestingConnection(configId);
    await new Promise(r => setTimeout(r, 2000));
    setTestingConnection(null);
    toast.success('تم اختبار الاتصال بنجاح');
  };

  const runBackup = (backupId) => {
    toast.success('جاري تشغيل النسخ الاحتياطي...');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': case 'running': case 'success': return 'green';
      case 'warning': return 'amber';
      case 'disconnected': case 'stopped': case 'failed': return 'red';
      default: return 'blue';
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Settings className="w-7 h-7 text-cyan-400 animate-spin-slow" />
            إعدادات النظام المتقدمة
          </h2>
          <p className="text-slate-400">تكوين قواعد البيانات والخوادم والنسخ الاحتياطي</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-600">
            <Download className="w-4 h-4 ml-2" />
            تصدير الإعدادات
          </Button>
          <Button variant="outline" className="border-slate-600">
            <Upload className="w-4 h-4 ml-2" />
            استيراد
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'قواعد البيانات', value: '3/3', status: 'متصل', icon: Database, color: 'green' },
          { label: 'الخوادم', value: '4/4', status: 'يعمل', icon: Server, color: 'green' },
          { label: 'التخزين', value: '89.7 TB', status: 'متاح', icon: HardDrive, color: 'cyan' },
          { label: 'النسخ الاحتياطي', value: 'نجاح', status: 'آخر: 3 ساعات', icon: Cloud, color: 'green' },
          { label: 'الأمان', value: 'آمن', status: 'لا تهديدات', icon: Shield, color: 'green' },
        ].map((item, i) => (
          <Card key={i} className={`glass-card border-${item.color}-500/30 bg-${item.color}-500/5`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <item.icon className={`w-8 h-8 text-${item.color}-400`} />
                <div>
                  <p className="text-white font-bold">{item.value}</p>
                  <p className="text-slate-400 text-xs">{item.label}</p>
                  <p className="text-slate-500 text-[10px]">{item.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 flex-wrap">
          <TabsTrigger value="databases" className="data-[state=active]:bg-cyan-500/20">
            <Database className="w-4 h-4 ml-1" />
            قواعد البيانات
          </TabsTrigger>
          <TabsTrigger value="servers" className="data-[state=active]:bg-green-500/20">
            <Server className="w-4 h-4 ml-1" />
            الخوادم
          </TabsTrigger>
          <TabsTrigger value="backups" className="data-[state=active]:bg-purple-500/20">
            <Cloud className="w-4 h-4 ml-1" />
            النسخ الاحتياطي
          </TabsTrigger>
          <TabsTrigger value="storage" className="data-[state=active]:bg-amber-500/20">
            <HardDrive className="w-4 h-4 ml-1" />
            التخزين
          </TabsTrigger>
          <TabsTrigger value="modules" className="data-[state=active]:bg-pink-500/20">
            <Cpu className="w-4 h-4 ml-1" />
            الوحدات
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-red-500/20">
            <Shield className="w-4 h-4 ml-1" />
            الأمان
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-cyan-500/20">
            <Users className="w-4 h-4 ml-1" />
            المستخدمين والصلاحيات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="databases" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-medium">اتصالات قواعد البيانات</h3>
            <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700" onClick={() => { setAddDialogType('database'); setShowAddDialog(true); }}>
              <Plus className="w-4 h-4 ml-1" />
              إضافة قاعدة بيانات
            </Button>
          </div>
          
          {databaseConfigs.map(db => (
            <Card key={db.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-${getStatusColor(db.status)}-500/20`}>
                      <Database className={`w-6 h-6 text-${getStatusColor(db.status)}-400`} />
                    </div>
                    <div>
                      <p className="text-white font-medium">{db.name}</p>
                      <p className="text-slate-400 text-sm">{db.type} - {db.host}:{db.port}</p>
                      <div className="flex gap-4 mt-2 text-xs text-slate-500">
                        <span>الاتصالات: {db.connections}/{db.maxConnections}</span>
                        <span>الحجم: {db.size}</span>
                        <span>آخر نسخ: {db.lastBackup}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`bg-${getStatusColor(db.status)}-500/20 text-${getStatusColor(db.status)}-400`}>
                      {db.status === 'connected' ? 'متصل' : 'غير متصل'}
                    </Badge>
                    <Button size="sm" variant="outline" className="border-slate-600"
                            disabled={testingConnection === db.id}
                            onClick={() => testConnection(db.id, 'database')}>
                      {testingConnection === db.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-600">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>استخدام الاتصالات</span>
                    <span>{Math.round((db.connections / db.maxConnections) * 100)}%</span>
                  </div>
                  <Progress value={(db.connections / db.maxConnections) * 100} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="servers" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-medium">الخوادم النشطة</h3>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 ml-1" />
              إضافة خادم
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {serverConfigs.map(server => (
              <Card key={server.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Server className={`w-5 h-5 text-${getStatusColor(server.status)}-400`} />
                      <div>
                        <p className="text-white font-medium">{server.name}</p>
                        <p className="text-slate-400 text-xs">{server.ip}</p>
                      </div>
                    </div>
                    <Badge className={`bg-${getStatusColor(server.status)}-500/20 text-${getStatusColor(server.status)}-400`}>
                      {server.status === 'running' ? 'يعمل' : 'متوقف'}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>CPU</span>
                        <span>{server.cpu}%</span>
                      </div>
                      <Progress value={server.cpu} className={`h-1.5 ${server.cpu > 80 ? '[&>div]:bg-red-500' : server.cpu > 60 ? '[&>div]:bg-amber-500' : ''}`} />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>الذاكرة</span>
                        <span>{server.memory}%</span>
                      </div>
                      <Progress value={server.memory} className={`h-1.5 ${server.memory > 80 ? '[&>div]:bg-red-500' : server.memory > 60 ? '[&>div]:bg-amber-500' : ''}`} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700">
                    <span className="text-slate-500 text-xs">وقت التشغيل: {server.uptime}</span>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7">
                        <Terminal className="w-3 h-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7">
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="backups" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-medium">جدول النسخ الاحتياطي</h3>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 ml-1" />
              إضافة جدول
            </Button>
          </div>
          
          {backupConfigs.map(backup => (
            <Card key={backup.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-${getStatusColor(backup.status)}-500/20`}>
                      <Cloud className={`w-6 h-6 text-${getStatusColor(backup.status)}-400`} />
                    </div>
                    <div>
                      <p className="text-white font-medium">{backup.name}</p>
                      <p className="text-slate-400 text-sm">{backup.frequency}</p>
                      <div className="flex gap-4 mt-1 text-xs text-slate-500">
                        <span>الاحتفاظ: {backup.retention}</span>
                        <span>الحجم: {backup.size}</span>
                        <span>آخر تشغيل: {backup.lastRun}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`bg-${getStatusColor(backup.status)}-500/20 text-${getStatusColor(backup.status)}-400`}>
                      {backup.status === 'success' ? 'نجاح' : backup.status === 'running' ? 'قيد التشغيل' : 'فشل'}
                    </Badge>
                    <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-400" onClick={() => runBackup(backup.id)}>
                      <Play className="w-4 h-4 ml-1" />
                      تشغيل الآن
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-600">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="storage" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-medium">وحدات التخزين</h3>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4 ml-1" />
              إضافة وحدة تخزين
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {storageConfigs.map(storage => {
              const usagePercent = (storage.used / storage.total) * 100;
              return (
                <Card key={storage.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <HardDrive className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-white font-medium">{storage.name}</p>
                          <p className="text-slate-400 text-xs">{storage.path}</p>
                        </div>
                      </div>
                      <Badge className="bg-slate-700 text-slate-300">{storage.type}</Badge>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>المستخدم: {storage.used} TB</span>
                        <span>الإجمالي: {storage.total} TB</span>
                      </div>
                      <Progress value={usagePercent} className={`h-2 ${usagePercent > 90 ? '[&>div]:bg-red-500' : usagePercent > 75 ? '[&>div]:bg-amber-500' : ''}`} />
                      <p className="text-slate-500 text-xs mt-1 text-left">متاح: {(storage.total - storage.used).toFixed(1)} TB ({(100 - usagePercent).toFixed(0)}%)</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="modules" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-medium">إعدادات الوحدات</h3>
          </div>
          
          {moduleConfigs.map(module => (
            <Card key={module.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Cpu className={`w-5 h-5 ${module.enabled ? 'text-green-400' : 'text-slate-500'}`} />
                    <div>
                      <p className="text-white font-medium">{module.name}</p>
                      <p className="text-slate-400 text-xs">{module.apiEndpoint}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <p className="text-slate-500 text-xs">حد الطلبات</p>
                      <p className="text-white text-sm">{module.rateLimit}/دقيقة</p>
                    </div>
                    <Switch checked={module.enabled} />
                    <Button size="sm" variant="outline" className="border-slate-600">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                إعدادات الأمان
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div>
                  <p className="text-white">المصادقة الثنائية (2FA)</p>
                  <p className="text-slate-400 text-xs">طلب رمز تأكيد إضافي عند تسجيل الدخول</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div>
                  <p className="text-white">تشفير البيانات في الراحة</p>
                  <p className="text-slate-400 text-xs">تشفير AES-256 لجميع البيانات المخزنة</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div>
                  <p className="text-white">سجل التدقيق</p>
                  <p className="text-slate-400 text-xs">تسجيل جميع العمليات الحساسة</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div>
                  <p className="text-white">قفل الجلسة التلقائي</p>
                  <p className="text-slate-400 text-xs">قفل بعد 15 دقيقة من عدم النشاط</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div>
                  <p className="text-white">حماية من هجمات DDoS</p>
                  <p className="text-slate-400 text-xs">تفعيل جدار الحماية المتقدم</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <UserRoleManagement />
        </TabsContent>
      </Tabs>

      {/* Add Config Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">إضافة {addDialogType === 'database' ? 'قاعدة بيانات' : 'إعداد'} جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-slate-400 text-sm">الاسم</label>
              <Input className="bg-slate-800 border-slate-700 mt-1" placeholder="اسم الاتصال" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm">المضيف</label>
                <Input className="bg-slate-800 border-slate-700 mt-1" placeholder="localhost" />
              </div>
              <div>
                <label className="text-slate-400 text-sm">المنفذ</label>
                <Input className="bg-slate-800 border-slate-700 mt-1" placeholder="5432" type="number" />
              </div>
            </div>
            <div>
              <label className="text-slate-400 text-sm">اسم المستخدم</label>
              <Input className="bg-slate-800 border-slate-700 mt-1" placeholder="admin" />
            </div>
            <div>
              <label className="text-slate-400 text-sm">كلمة المرور</label>
              <Input className="bg-slate-800 border-slate-700 mt-1" type="password" placeholder="••••••••" />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" variant="outline" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
              <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={() => { toast.success('تم الحفظ'); setShowAddDialog(false); }}>
                <Save className="w-4 h-4 ml-2" />
                حفظ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}