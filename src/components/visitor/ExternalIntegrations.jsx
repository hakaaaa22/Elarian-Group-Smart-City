import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, Link2, Shield, Car, MessageSquare, CheckCircle, XCircle,
  RefreshCw, Settings, Zap, Database, Key, Activity, AlertTriangle,
  Smartphone, Mail, Bell, Server, Wifi, Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const integrations = [
  {
    id: 'national_id',
    name: 'نظام الهوية الوطنية',
    nameEn: 'National ID System',
    description: 'التحقق من هوية الزوار عبر قاعدة بيانات الهوية الوطنية',
    icon: Shield,
    color: 'purple',
    status: 'connected',
    apiCalls: 1234,
    successRate: 99.2,
    lastSync: '2025-01-15 10:30',
    features: ['التحقق من الهوية', 'استخراج البيانات', 'التحقق من الصلاحية']
  },
  {
    id: 'lpr_system',
    name: 'نظام التعرف على اللوحات',
    nameEn: 'LPR System',
    description: 'ربط مع كاميرات LPR للتحقق من لوحات المركبات',
    icon: Car,
    color: 'cyan',
    status: 'connected',
    apiCalls: 5678,
    successRate: 98.5,
    lastSync: '2025-01-15 10:45',
    features: ['قراءة اللوحات', 'التحقق من الملكية', 'سجل الدخول/الخروج']
  },
  {
    id: 'sms_gateway',
    name: 'بوابة الرسائل النصية',
    nameEn: 'SMS Gateway',
    description: 'إرسال الدعوات والتنبيهات عبر الرسائل القصيرة',
    icon: Smartphone,
    color: 'green',
    status: 'connected',
    apiCalls: 890,
    successRate: 99.8,
    lastSync: '2025-01-15 11:00',
    features: ['إرسال الدعوات', 'تنبيهات الوصول', 'رموز التحقق']
  },
  {
    id: 'email_service',
    name: 'خدمة البريد الإلكتروني',
    nameEn: 'Email Service',
    description: 'إرسال الدعوات والتقارير عبر البريد الإلكتروني',
    icon: Mail,
    color: 'blue',
    status: 'connected',
    apiCalls: 456,
    successRate: 99.5,
    lastSync: '2025-01-15 10:50',
    features: ['دعوات رسمية', 'تأكيدات الزيارة', 'تقارير يومية']
  },
  {
    id: 'face_recognition',
    name: 'نظام التعرف على الوجه',
    nameEn: 'Face Recognition',
    description: 'ربط الزوار بالكاميرات عبر تقنية التعرف على الوجه',
    icon: Activity,
    color: 'pink',
    status: 'warning',
    apiCalls: 2345,
    successRate: 95.3,
    lastSync: '2025-01-15 09:30',
    features: ['تسجيل الوجه', 'التحقق التلقائي', 'تتبع الحركة']
  },
  {
    id: 'push_notifications',
    name: 'الإشعارات الفورية',
    nameEn: 'Push Notifications',
    description: 'إرسال إشعارات فورية للمضيفين والأمن',
    icon: Bell,
    color: 'amber',
    status: 'disconnected',
    apiCalls: 0,
    successRate: 0,
    lastSync: 'غير متصل',
    features: ['إشعارات الوصول', 'تنبيهات الأمان', 'تحديثات الحالة']
  }
];

export default function ExternalIntegrations() {
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [testingConnection, setTestingConnection] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'disconnected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected': return 'متصل';
      case 'warning': return 'تحذير';
      case 'disconnected': return 'غير متصل';
      default: return status;
    }
  };

  const testConnection = async (integrationId) => {
    setTestingConnection(integrationId);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTestingConnection(null);
    toast.success('تم اختبار الاتصال بنجاح');
  };

  const openConfig = (integration) => {
    setSelectedIntegration(integration);
    setShowConfigDialog(true);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">4</p>
              <p className="text-green-400 text-sm">متصل</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">1</p>
              <p className="text-amber-400 text-sm">تحذير</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">1</p>
              <p className="text-red-400 text-sm">غير متصل</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">10,603</p>
              <p className="text-cyan-400 text-sm">طلبات API</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integrations Grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {integrations.map((integration, i) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`bg-slate-800/30 border-slate-700/50 hover:border-${integration.color}-500/50 transition-all`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-${integration.color}-500/20`}>
                      <integration.icon className={`w-6 h-6 text-${integration.color}-400`} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{integration.name}</h3>
                      <p className="text-slate-500 text-xs">{integration.nameEn}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(integration.status)}>
                    {getStatusText(integration.status)}
                  </Badge>
                </div>

                <p className="text-slate-400 text-sm mb-4">{integration.description}</p>

                {integration.status !== 'disconnected' && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-2 bg-slate-900/50 rounded-lg text-center">
                      <p className="text-white font-bold">{integration.apiCalls.toLocaleString()}</p>
                      <p className="text-slate-500 text-xs">طلبات API</p>
                    </div>
                    <div className="p-2 bg-slate-900/50 rounded-lg text-center">
                      <p className="text-white font-bold">{integration.successRate}%</p>
                      <p className="text-slate-500 text-xs">نسبة النجاح</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-1 mb-4">
                  {integration.features.map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="border-slate-600 text-slate-400 text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                  <span className="text-slate-500 text-xs">آخر مزامنة: {integration.lastSync}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-slate-400"
                      onClick={() => testConnection(integration.id)}
                      disabled={testingConnection === integration.id}
                    >
                      {testingConnection === integration.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Wifi className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-slate-400"
                      onClick={() => openConfig(integration)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Config Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              إعدادات {selectedIntegration?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">API Endpoint</Label>
              <Input 
                className="bg-slate-800/50 border-slate-700 text-white mt-1" 
                placeholder="https://api.example.com/v1"
                defaultValue={selectedIntegration?.id === 'national_id' ? 'https://nid.gov.sa/api/v2' : ''}
              />
            </div>
            <div>
              <Label className="text-slate-300">API Key</Label>
              <Input 
                type="password"
                className="bg-slate-800/50 border-slate-700 text-white mt-1" 
                placeholder="••••••••••••••••"
                defaultValue="sk_live_xxxxxxxxxxxx"
              />
            </div>
            <div>
              <Label className="text-slate-300">Secret Key</Label>
              <Input 
                type="password"
                className="bg-slate-800/50 border-slate-700 text-white mt-1" 
                placeholder="••••••••••••••••"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div>
                <p className="text-white text-sm">تفعيل التكامل</p>
                <p className="text-slate-500 text-xs">تشغيل/إيقاف الاتصال</p>
              </div>
              <Switch defaultChecked={selectedIntegration?.status === 'connected'} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="border-slate-600" onClick={() => setShowConfigDialog(false)}>
              إلغاء
            </Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => {
              setShowConfigDialog(false);
              toast.success('تم حفظ الإعدادات بنجاح');
            }}>
              حفظ الإعدادات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}