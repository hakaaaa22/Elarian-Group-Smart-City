import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, BellRing, Volume2, VolumeX, AlertTriangle, Shield, Eye, Users,
  Settings, Plus, X, CheckCircle, Clock, Filter, ChevronDown, Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const alertTypes = [
  { id: 'weapon', name: 'كشف سلاح', icon: Shield, color: 'red', severity: 'critical' },
  { id: 'intrusion', name: 'تسلل', icon: AlertTriangle, color: 'red', severity: 'high' },
  { id: 'suspicious', name: 'سلوك مشبوه', icon: Eye, color: 'amber', severity: 'medium' },
  { id: 'crowd', name: 'ازدحام', icon: Users, color: 'blue', severity: 'low' },
];

const sampleAlerts = [
  { id: 1, type: 'weapon', message: 'كشف سلاح محتمل - الكاميرا 12', time: new Date(), status: 'active', camera: 'CAM-012', confidence: 94 },
  { id: 2, type: 'intrusion', message: 'محاولة تسلل - البوابة الشرقية', time: new Date(Date.now() - 300000), status: 'active', camera: 'CAM-005', confidence: 89 },
  { id: 3, type: 'suspicious', message: 'سلوك مشبوه - الممر الرئيسي', time: new Date(Date.now() - 600000), status: 'acknowledged', camera: 'CAM-008', confidence: 78 },
  { id: 4, type: 'crowd', message: 'ازدحام عالي - المدخل', time: new Date(Date.now() - 900000), status: 'resolved', camera: 'CAM-001', confidence: 96 },
];

export default function AIVisionAlerts() {
  const [alerts, setAlerts] = useState(sampleAlerts);
  const [activeTab, setActiveTab] = useState('active');
  const [showConfig, setShowConfig] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertRules, setAlertRules] = useState([
    { id: 1, type: 'weapon', enabled: true, escalate: true, team: 'security', threshold: 80 },
    { id: 2, type: 'intrusion', enabled: true, escalate: true, team: 'security', threshold: 85 },
    { id: 3, type: 'suspicious', enabled: true, escalate: false, team: 'operations', threshold: 70 },
    { id: 4, type: 'crowd', enabled: false, escalate: false, team: 'operations', threshold: 90 },
  ]);

  // Simulate new alerts
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const types = ['weapon', 'intrusion', 'suspicious', 'crowd'];
        const newAlert = {
          id: Date.now(),
          type: types[Math.floor(Math.random() * types.length)],
          message: `تنبيه جديد - كاميرا ${Math.floor(Math.random() * 20) + 1}`,
          time: new Date(),
          status: 'active',
          camera: `CAM-${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}`,
          confidence: Math.floor(Math.random() * 20) + 75
        };
        setAlerts(prev => [newAlert, ...prev]);
        if (soundEnabled) toast.warning('تنبيه جديد!', { duration: 3000 });
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const acknowledgeAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a));
    toast.success('تم الإقرار بالتنبيه');
  };

  const resolveAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
    toast.success('تم حل التنبيه');
  };

  const escalateAlert = (id) => {
    toast.info('تم تصعيد التنبيه للفريق المختص');
  };

  const filteredAlerts = alerts.filter(a => {
    if (activeTab === 'active') return a.status === 'active';
    if (activeTab === 'acknowledged') return a.status === 'acknowledged';
    if (activeTab === 'resolved') return a.status === 'resolved';
    return true;
  });

  const stats = {
    active: alerts.filter(a => a.status === 'active').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    critical: alerts.filter(a => a.type === 'weapon' && a.status === 'active').length
  };

  const getAlertConfig = (type) => alertTypes.find(t => t.id === type) || alertTypes[0];

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={stats.active > 0 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: stats.active > 0 ? Infinity : 0 }}
            className={`p-2 rounded-lg ${stats.critical > 0 ? 'bg-red-500/20' : 'bg-amber-500/20'}`}
          >
            {stats.active > 0 ? <BellRing className="w-5 h-5 text-red-400" /> : <Bell className="w-5 h-5 text-amber-400" />}
          </motion.div>
          <div>
            <h4 className="text-white font-bold">نظام التنبيهات</h4>
            <p className="text-slate-400 text-xs">{stats.active} تنبيه نشط</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-green-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </Button>
          <Button variant="outline" className="border-slate-600 h-8" onClick={() => setShowConfig(true)}>
            <Settings className="w-3 h-3 ml-1" />
            إعدادات
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-2 text-center">
            <p className="text-xl font-bold text-white">{stats.active}</p>
            <p className="text-red-400 text-xs">نشط</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-2 text-center">
            <p className="text-xl font-bold text-white">{stats.acknowledged}</p>
            <p className="text-amber-400 text-xs">مُقر</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-2 text-center">
            <p className="text-xl font-bold text-white">{stats.resolved}</p>
            <p className="text-green-400 text-xs">محلول</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-2 text-center">
            <p className="text-xl font-bold text-white">{stats.critical}</p>
            <p className="text-purple-400 text-xs">حرج</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="active" className="data-[state=active]:bg-red-500/20">
            نشط ({stats.active})
          </TabsTrigger>
          <TabsTrigger value="acknowledged" className="data-[state=active]:bg-amber-500/20">
            مُقر ({stats.acknowledged})
          </TabsTrigger>
          <TabsTrigger value="resolved" className="data-[state=active]:bg-green-500/20">
            محلول ({stats.resolved})
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-slate-500/20">
            الكل
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <ScrollArea className="h-[400px]">
            <AnimatePresence>
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>لا توجد تنبيهات</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAlerts.map((alert) => {
                    const config = getAlertConfig(alert.type);
                    const Icon = config.icon;
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <Card className={`bg-${config.color}-500/10 border-${config.color}-500/30 ${alert.status === 'active' ? 'animate-pulse' : ''}`}>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <Icon className={`w-5 h-5 text-${config.color}-400 mt-0.5`} />
                                <div>
                                  <p className="text-white font-medium text-sm">{alert.message}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-[10px]">{alert.camera}</Badge>
                                    <span className="text-slate-400 text-xs">{alert.confidence}% ثقة</span>
                                    <span className="text-slate-500 text-xs">
                                      {new Date(alert.time).toLocaleTimeString('ar-SA')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                {alert.status === 'active' && (
                                  <>
                                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => acknowledgeAlert(alert.id)}>
                                      إقرار
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 text-xs text-amber-400" onClick={() => escalateAlert(alert.id)}>
                                      تصعيد
                                    </Button>
                                  </>
                                )}
                                {alert.status === 'acknowledged' && (
                                  <Button size="sm" className="h-7 text-xs bg-green-600" onClick={() => resolveAlert(alert.id)}>
                                    حل
                                  </Button>
                                )}
                                {alert.status === 'resolved' && (
                                  <Badge className="bg-green-500/20 text-green-400">
                                    <CheckCircle className="w-3 h-3 ml-1" />
                                    محلول
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={showConfig} onOpenChange={setShowConfig}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">إعدادات التنبيهات</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {alertRules.map((rule) => {
              const config = getAlertConfig(rule.type);
              const Icon = config.icon;
              return (
                <div key={rule.id} className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 text-${config.color}-400`} />
                      <span className="text-white">{config.name}</span>
                    </div>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(v) => setAlertRules(prev =>
                        prev.map(r => r.id === rule.id ? { ...r, enabled: v } : r)
                      )}
                    />
                  </div>
                  {rule.enabled && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div>
                        <Label className="text-slate-400 text-xs">حد الثقة</Label>
                        <Input
                          type="number"
                          value={rule.threshold}
                          onChange={(e) => setAlertRules(prev =>
                            prev.map(r => r.id === rule.id ? { ...r, threshold: Number(e.target.value) } : r)
                          )}
                          className="bg-slate-900 border-slate-700 text-white h-8 mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-400 text-xs">الفريق</Label>
                        <Select
                          value={rule.team}
                          onValueChange={(v) => setAlertRules(prev =>
                            prev.map(r => r.id === rule.id ? { ...r, team: v } : r)
                          )}
                        >
                          <SelectTrigger className="bg-slate-900 border-slate-700 text-white h-8 mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="security">الأمن</SelectItem>
                            <SelectItem value="operations">العمليات</SelectItem>
                            <SelectItem value="management">الإدارة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.escalate}
                            onCheckedChange={(v) => setAlertRules(prev =>
                              prev.map(r => r.id === rule.id ? { ...r, escalate: v } : r)
                            )}
                          />
                          <Label className="text-slate-400 text-xs">تصعيد تلقائي</Label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={() => { setShowConfig(false); toast.success('تم حفظ الإعدادات'); }}>
              حفظ الإعدادات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}