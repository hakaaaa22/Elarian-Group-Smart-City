import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Settings,
  Plus, Trash2, Volume2, Mail, MessageSquare, Eye, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const metricOptions = [
  { id: 'churn_risk', name: 'خطر المغادرة', unit: '%', defaultThreshold: 30 },
  { id: 'satisfaction', name: 'رضا العملاء', unit: '/5', defaultThreshold: 4.0 },
  { id: 'resolution_rate', name: 'معدل الحل', unit: '%', defaultThreshold: 85 },
  { id: 'response_time', name: 'وقت الاستجابة', unit: 'دقيقة', defaultThreshold: 5 },
  { id: 'sentiment_score', name: 'درجة المشاعر', unit: '%', defaultThreshold: 60 },
  { id: 'purchase_intent', name: 'نية الشراء', unit: '%', defaultThreshold: 70 },
  { id: 'call_volume', name: 'حجم المكالمات', unit: '', defaultThreshold: 100 },
  { id: 'agent_performance', name: 'أداء الوكيل', unit: '%', defaultThreshold: 80 },
];

const conditionTypes = [
  { id: 'above', name: 'أعلى من' },
  { id: 'below', name: 'أقل من' },
  { id: 'equals', name: 'يساوي' },
  { id: 'change_up', name: 'ارتفع بنسبة' },
  { id: 'change_down', name: 'انخفض بنسبة' },
];

const notificationChannels = [
  { id: 'app', name: 'التطبيق', icon: Bell },
  { id: 'email', name: 'البريد الإلكتروني', icon: Mail },
  { id: 'sms', name: 'رسالة نصية', icon: MessageSquare },
];

export default function MetricAlertsSystem() {
  const [alerts, setAlerts] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const [alertConfig, setAlertConfig] = useState({
    name: '',
    metric: 'churn_risk',
    condition: 'above',
    threshold: 30,
    channels: ['app'],
    isActive: true,
    severity: 'warning',
  });

  useEffect(() => {
    const saved = localStorage.getItem('metric_alerts');
    if (saved) {
      setAlerts(JSON.parse(saved));
    }
    const history = localStorage.getItem('alert_history');
    if (history) {
      setAlertHistory(JSON.parse(history));
    }
  }, []);

  // Simulate metric monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      alerts.filter(a => a.isActive).forEach(alert => {
        // Simulate random metric values for demo
        const currentValue = Math.random() * 100;
        let triggered = false;
        
        switch (alert.condition) {
          case 'above':
            triggered = currentValue > alert.threshold;
            break;
          case 'below':
            triggered = currentValue < alert.threshold;
            break;
          default:
            break;
        }
        
        if (triggered && Math.random() > 0.95) { // Simulate occasional triggers
          const newAlert = {
            id: Date.now(),
            alertId: alert.id,
            alertName: alert.name,
            metric: alert.metric,
            value: currentValue.toFixed(1),
            threshold: alert.threshold,
            severity: alert.severity,
            time: new Date().toISOString(),
            acknowledged: false,
          };
          
          setAlertHistory(prev => {
            const updated = [newAlert, ...prev.slice(0, 49)];
            localStorage.setItem('alert_history', JSON.stringify(updated));
            return updated;
          });
          
          toast.warning(`تنبيه: ${alert.name}`, {
            description: `${metricOptions.find(m => m.id === alert.metric)?.name}: ${currentValue.toFixed(1)}`,
          });
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [alerts]);

  const saveAlert = () => {
    if (!alertConfig.name) {
      toast.error('أدخل اسم التنبيه');
      return;
    }

    const newAlert = { ...alertConfig, id: Date.now().toString() };
    const updated = [...alerts, newAlert];
    setAlerts(updated);
    localStorage.setItem('metric_alerts', JSON.stringify(updated));
    
    resetForm();
    toast.success('تم إنشاء التنبيه');
  };

  const deleteAlert = (alertId) => {
    const updated = alerts.filter(a => a.id !== alertId);
    setAlerts(updated);
    localStorage.setItem('metric_alerts', JSON.stringify(updated));
    toast.success('تم حذف التنبيه');
  };

  const toggleAlert = (alertId) => {
    const updated = alerts.map(a => 
      a.id === alertId ? { ...a, isActive: !a.isActive } : a
    );
    setAlerts(updated);
    localStorage.setItem('metric_alerts', JSON.stringify(updated));
  };

  const acknowledgeAlert = (historyId) => {
    setAlertHistory(prev => {
      const updated = prev.map(h => 
        h.id === historyId ? { ...h, acknowledged: true } : h
      );
      localStorage.setItem('alert_history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setAlertHistory([]);
    localStorage.removeItem('alert_history');
    toast.success('تم مسح السجل');
  };

  const resetForm = () => {
    setAlertConfig({
      name: '',
      metric: 'churn_risk',
      condition: 'above',
      threshold: 30,
      channels: ['app'],
      isActive: true,
      severity: 'warning',
    });
    setShowCreateDialog(false);
  };

  const toggleChannel = (channelId) => {
    setAlertConfig(prev => ({
      ...prev,
      channels: prev.channels.includes(channelId)
        ? prev.channels.filter(c => c !== channelId)
        : [...prev.channels, channelId]
    }));
  };

  const unacknowledgedCount = alertHistory.filter(h => !h.acknowledged).length;

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-400" />
          <h4 className="text-white font-bold">نظام تنبيهات المقاييس</h4>
          {unacknowledgedCount > 0 && (
            <Badge className="bg-red-500/20 text-red-400 animate-pulse">
              {unacknowledgedCount} جديد
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          className="bg-amber-600 hover:bg-amber-700"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="w-4 h-4 ml-1" />
          تنبيه جديد
        </Button>
      </div>

      {/* Active Alerts */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            التنبيهات النشطة
            <Badge className="bg-slate-700 text-slate-300">{alerts.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              لا توجد تنبيهات مُعدة
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map(alert => {
                const metric = metricOptions.find(m => m.id === alert.metric);
                const condition = conditionTypes.find(c => c.id === alert.condition);
                return (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${alert.isActive ? 'bg-amber-500/5 border-amber-500/30' : 'bg-slate-900/50 border-slate-700'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">{alert.name}</span>
                          <Badge className={`text-xs ${
                            alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            alert.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {alert.severity === 'critical' ? 'حرج' : alert.severity === 'warning' ? 'تحذير' : 'معلومات'}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-xs mt-1">
                          {metric?.name} {condition?.name} {alert.threshold}{metric?.unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={alert.isActive} onCheckedChange={() => toggleAlert(alert.id)} />
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteAlert(alert.id)}>
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert History */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              سجل التنبيهات
            </span>
            {alertHistory.length > 0 && (
              <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={clearHistory}>
                مسح السجل
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {alertHistory.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">
                لا توجد تنبيهات سابقة
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {alertHistory.map(history => (
                    <motion.div
                      key={history.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className={`p-2 rounded-lg ${!history.acknowledged ? 'bg-red-500/10 border border-red-500/30' : 'bg-slate-900/50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm">{history.alertName}</p>
                          <p className="text-slate-400 text-xs">
                            {metricOptions.find(m => m.id === history.metric)?.name}: {history.value} (حد: {history.threshold})
                          </p>
                          <p className="text-slate-500 text-xs">{new Date(history.time).toLocaleString('ar-SA')}</p>
                        </div>
                        {!history.acknowledged && (
                          <Button size="sm" variant="ghost" className="h-7" onClick={() => acknowledgeAlert(history.id)}>
                            <CheckCircle className="w-3 h-3 ml-1 text-green-400" />
                            تأكيد
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Create Alert Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              إنشاء تنبيه جديد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300 text-sm">اسم التنبيه</Label>
              <Input
                value={alertConfig.name}
                onChange={(e) => setAlertConfig(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white mt-1"
                placeholder="تنبيه ارتفاع خطر المغادرة"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-slate-300 text-xs">المقياس</Label>
                <Select value={alertConfig.metric} onValueChange={(v) => setAlertConfig(prev => ({ ...prev, metric: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {metricOptions.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 text-xs">الشرط</Label>
                <Select value={alertConfig.condition} onValueChange={(v) => setAlertConfig(prev => ({ ...prev, condition: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {conditionTypes.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 text-xs">الحد</Label>
                <Input
                  type="number"
                  value={alertConfig.threshold}
                  onChange={(e) => setAlertConfig(prev => ({ ...prev, threshold: Number(e.target.value) }))}
                  className="bg-slate-800 border-slate-700 text-white mt-1 h-8"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300 text-xs mb-2 block">قنوات الإشعار</Label>
              <div className="flex gap-2">
                {notificationChannels.map(channel => (
                  <Button
                    key={channel.id}
                    size="sm"
                    variant={alertConfig.channels.includes(channel.id) ? 'default' : 'outline'}
                    className={`h-8 ${alertConfig.channels.includes(channel.id) ? 'bg-amber-600' : 'border-slate-600'}`}
                    onClick={() => toggleChannel(channel.id)}
                  >
                    <channel.icon className="w-3 h-3 ml-1" />
                    {channel.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-slate-300 text-xs mb-2 block">الأهمية</Label>
              <div className="flex gap-2">
                {['info', 'warning', 'critical'].map(sev => (
                  <Button
                    key={sev}
                    size="sm"
                    variant={alertConfig.severity === sev ? 'default' : 'outline'}
                    className={`h-8 ${
                      alertConfig.severity === sev 
                        ? sev === 'critical' ? 'bg-red-600' : sev === 'warning' ? 'bg-amber-600' : 'bg-blue-600'
                        : 'border-slate-600'
                    }`}
                    onClick={() => setAlertConfig(prev => ({ ...prev, severity: sev }))}
                  >
                    {sev === 'critical' ? 'حرج' : sev === 'warning' ? 'تحذير' : 'معلومات'}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-700">
              <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={saveAlert}>
                <Bell className="w-4 h-4 ml-2" />
                إنشاء التنبيه
              </Button>
              <Button variant="outline" className="border-slate-600" onClick={resetForm}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}