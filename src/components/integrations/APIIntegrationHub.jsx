import React, { useState } from 'react';
import {
  Globe, Key, Code, Webhook, RefreshCw, Copy, Eye, EyeOff, Plus,
  CheckCircle, XCircle, Settings, Database, Server, Link2, Zap, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// مفاتيح API
const apiKeys = [
  { id: 'k1', name: 'Production Key', key: 'pk_live_xxxx...xxxx', created: '2024-11-01', lastUsed: '2024-12-04', requests: 15420, status: 'active' },
  { id: 'k2', name: 'Development Key', key: 'pk_test_xxxx...xxxx', created: '2024-10-15', lastUsed: '2024-12-03', requests: 8930, status: 'active' },
  { id: 'k3', name: 'Old Key', key: 'pk_old_xxxx...xxxx', created: '2024-08-01', lastUsed: '2024-09-15', requests: 2340, status: 'revoked' },
];

// الموصلات
const connectors = [
  { id: 'sap', name: 'SAP ERP', category: 'erp', status: 'connected', icon: '🏢', lastSync: '10 دقائق' },
  { id: 'salesforce', name: 'Salesforce CRM', category: 'crm', status: 'connected', icon: '☁️', lastSync: '5 دقائق' },
  { id: 'jira', name: 'Jira', category: 'project', status: 'disconnected', icon: '📋', lastSync: '-' },
  { id: 'slack', name: 'Slack', category: 'communication', status: 'connected', icon: '💬', lastSync: 'مباشر' },
  { id: 'oracle', name: 'Oracle ERP', category: 'erp', status: 'pending', icon: '🔴', lastSync: '-' },
  { id: 'hubspot', name: 'HubSpot', category: 'crm', status: 'disconnected', icon: '🧡', lastSync: '-' },
];

// Webhooks
const webhooks = [
  { id: 'w1', name: 'Alert Webhook', url: 'https://api.example.com/alerts', events: ['alert.created', 'alert.resolved'], status: 'active', lastTriggered: '10:30' },
  { id: 'w2', name: 'Report Webhook', url: 'https://api.example.com/reports', events: ['report.generated'], status: 'active', lastTriggered: '09:00' },
];

// نقاط API
const apiEndpoints = [
  { method: 'GET', endpoint: '/api/v1/fleet/vehicles', description: 'قائمة المركبات' },
  { method: 'POST', endpoint: '/api/v1/fleet/vehicles', description: 'إنشاء مركبة' },
  { method: 'GET', endpoint: '/api/v1/reports', description: 'قائمة التقارير' },
  { method: 'POST', endpoint: '/api/v1/alerts', description: 'إنشاء تنبيه' },
  { method: 'GET', endpoint: '/api/v1/users', description: 'قائمة المستخدمين' },
];

export default function APIIntegrationHub() {
  const [activeTab, setActiveTab] = useState('api');
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [showKey, setShowKey] = useState({});
  const [newKey, setNewKey] = useState({ name: '', permissions: [] });
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '', events: [] });

  const generateKey = () => {
    toast.success('تم إنشاء مفتاح API جديد');
    setShowKeyDialog(false);
  };

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    toast.success('تم نسخ المفتاح');
  };

  const createWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    toast.success('تم إنشاء Webhook');
    setShowWebhookDialog(false);
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          مركز التكامل والـ API
        </h3>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <Key className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{apiKeys.filter(k => k.status === 'active').length}</p>
            <p className="text-cyan-400 text-xs">مفاتيح نشطة</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <Link2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{connectors.filter(c => c.status === 'connected').length}</p>
            <p className="text-green-400 text-xs">موصلات متصلة</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <Webhook className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{webhooks.length}</p>
            <p className="text-purple-400 text-xs">Webhooks</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <Zap className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">24.3K</p>
            <p className="text-amber-400 text-xs">طلبات اليوم</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="api" className="data-[state=active]:bg-cyan-500/20">
            <Key className="w-4 h-4 ml-1" />
            مفاتيح API
          </TabsTrigger>
          <TabsTrigger value="connectors" className="data-[state=active]:bg-green-500/20">
            <Link2 className="w-4 h-4 ml-1" />
            الموصلات
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="data-[state=active]:bg-purple-500/20">
            <Webhook className="w-4 h-4 ml-1" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="docs" className="data-[state=active]:bg-amber-500/20">
            <FileText className="w-4 h-4 ml-1" />
            التوثيق
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="api" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm">مفاتيح API</CardTitle>
                <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 h-7" onClick={() => setShowKeyDialog(true)}>
                  <Plus className="w-3 h-3 ml-1" />
                  مفتاح جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {apiKeys.map(key => (
                  <div key={key.id} className={`p-3 rounded-lg border ${key.status === 'active' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-800/30 border-slate-800 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{key.name}</span>
                      <Badge className={key.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {key.status === 'active' ? 'نشط' : 'ملغي'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="flex-1 text-sm text-slate-400 bg-slate-900 rounded px-2 py-1">
                        {showKey[key.id] ? key.key.replace('xxxx...xxxx', 'abcd1234efgh5678') : key.key}
                      </code>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setShowKey(prev => ({ ...prev, [key.id]: !prev[key.id] }))}>
                        {showKey[key.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => copyKey(key.key)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>إنشاء: {key.created}</span>
                      <span>آخر استخدام: {key.lastUsed}</span>
                      <span>{key.requests.toLocaleString()} طلب</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connectors Tab */}
        <TabsContent value="connectors" className="mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectors.map(conn => (
              <Card key={conn.id} className={`glass-card border-${conn.status === 'connected' ? 'green' : conn.status === 'pending' ? 'amber' : 'slate'}-500/30 bg-[#0f1629]/80`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{conn.icon}</span>
                      <span className="text-white font-medium">{conn.name}</span>
                    </div>
                    <Badge className={conn.status === 'connected' ? 'bg-green-500/20 text-green-400' : conn.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-600 text-slate-400'}>
                      {conn.status === 'connected' ? 'متصل' : conn.status === 'pending' ? 'قيد الإعداد' : 'غير متصل'}
                    </Badge>
                  </div>
                  <p className="text-slate-500 text-xs mb-3">آخر مزامنة: {conn.lastSync}</p>
                  <Button size="sm" variant={conn.status === 'connected' ? 'outline' : 'default'} className={conn.status === 'connected' ? 'w-full border-slate-600 text-slate-400' : 'w-full bg-green-600 hover:bg-green-700'}>
                    {conn.status === 'connected' ? 'إعدادات' : 'اتصال'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm">Webhooks</CardTitle>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 h-7" onClick={() => setShowWebhookDialog(true)}>
                  <Plus className="w-3 h-3 ml-1" />
                  Webhook جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {webhooks.map(wh => (
                  <div key={wh.id} className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{wh.name}</span>
                      <Switch defaultChecked={wh.status === 'active'} />
                    </div>
                    <code className="text-sm text-cyan-400 block mb-2">{wh.url}</code>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {wh.events.map(event => (
                        <Badge key={event} className="bg-slate-700 text-slate-300 text-xs">{event}</Badge>
                      ))}
                    </div>
                    <p className="text-slate-500 text-xs">آخر تشغيل: {wh.lastTriggered}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="docs" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">نقاط API المتاحة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {apiEndpoints.map((ep, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <Badge className={ep.method === 'GET' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                      {ep.method}
                    </Badge>
                    <code className="text-cyan-400 text-sm flex-1">{ep.endpoint}</code>
                    <span className="text-slate-500 text-sm">{ep.description}</span>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="outline" className="w-full mt-4 border-cyan-500 text-cyan-400">
                <FileText className="w-4 h-4 ml-1" />
                عرض التوثيق الكامل
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Key Dialog */}
      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">مفتاح API جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-400">اسم المفتاح</Label>
              <Input value={newKey.name} onChange={(e) => setNewKey({ ...newKey, name: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-2" />
            </div>
            <div>
              <Label className="text-slate-400">الصلاحيات</Label>
              <Select>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">كاملة</SelectItem>
                  <SelectItem value="read">قراءة فقط</SelectItem>
                  <SelectItem value="write">كتابة فقط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="border-slate-600 text-slate-400" onClick={() => setShowKeyDialog(false)}>إلغاء</Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={generateKey}>إنشاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Webhook Dialog */}
      <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Webhook جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-400">الاسم</Label>
              <Input value={newWebhook.name} onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-2" />
            </div>
            <div>
              <Label className="text-slate-400">URL</Label>
              <Input value={newWebhook.url} onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })} placeholder="https://..." className="bg-slate-800/50 border-slate-700 text-white mt-2" />
            </div>
            <div>
              <Label className="text-slate-400">الأحداث</Label>
              <Select>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                  <SelectValue placeholder="اختر الأحداث" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alert.created">إنشاء تنبيه</SelectItem>
                  <SelectItem value="alert.resolved">حل تنبيه</SelectItem>
                  <SelectItem value="report.generated">إنشاء تقرير</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="border-slate-600 text-slate-400" onClick={() => setShowWebhookDialog(false)}>إلغاء</Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={createWebhook}>إنشاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}