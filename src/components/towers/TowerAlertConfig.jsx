import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Wind, Thermometer, Gauge, Activity, AlertTriangle, Plus, Trash2,
  Save, Settings, Radio, Mail, MessageSquare, Smartphone, Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

// تنبيهات مخصصة موجودة
const existingAlerts = [
  {
    id: 'alert-1',
    name: 'تنبيه سرعة الرياح الحرجة',
    sensor: 'wind_speed',
    condition: 'greater_than',
    threshold: 50,
    unit: 'كم/س',
    severity: 'critical',
    towers: ['all'],
    notifications: ['email', 'sms', 'app'],
    enabled: true
  },
  {
    id: 'alert-2',
    name: 'تحذير سرعة الرياح',
    sensor: 'wind_speed',
    condition: 'greater_than',
    threshold: 30,
    unit: 'كم/س',
    severity: 'warning',
    towers: ['all'],
    notifications: ['email', 'app'],
    enabled: true
  },
  {
    id: 'alert-3',
    name: 'تنبيه درجة الحرارة العالية',
    sensor: 'temperature',
    condition: 'greater_than',
    threshold: 45,
    unit: '°C',
    severity: 'warning',
    towers: ['TWR-001', 'TWR-002'],
    notifications: ['app'],
    enabled: true
  },
  {
    id: 'alert-4',
    name: 'تنبيه السلامة الهيكلية',
    sensor: 'structural_integrity',
    condition: 'less_than',
    threshold: 80,
    unit: '%',
    severity: 'critical',
    towers: ['all'],
    notifications: ['email', 'sms', 'app'],
    enabled: true
  },
  {
    id: 'alert-5',
    name: 'تنبيه زاوية الميل',
    sensor: 'tilt_angle',
    condition: 'greater_than',
    threshold: 0.5,
    unit: '°',
    severity: 'critical',
    towers: ['all'],
    notifications: ['email', 'sms'],
    enabled: false
  }
];

const sensors = [
  { id: 'wind_speed', name: 'سرعة الرياح', icon: Wind, unit: 'كم/س', color: 'blue' },
  { id: 'temperature', name: 'درجة الحرارة', icon: Thermometer, unit: '°C', color: 'red' },
  { id: 'structural_integrity', name: 'السلامة الهيكلية', icon: Gauge, unit: '%', color: 'purple' },
  { id: 'vibration', name: 'الاهتزاز', icon: Activity, unit: 'mm/s', color: 'amber' },
  { id: 'tilt_angle', name: 'زاوية الميل', icon: Radio, unit: '°', color: 'cyan' }
];

const severityOptions = [
  { id: 'info', name: 'معلومات', color: 'blue' },
  { id: 'warning', name: 'تحذير', color: 'amber' },
  { id: 'critical', name: 'حرج', color: 'red' }
];

const towers = [
  { id: 'all', name: 'جميع الأبراج' },
  { id: 'TWR-001', name: 'برج الاتصالات المركزي' },
  { id: 'TWR-002', name: 'برج المنطقة الشرقية' },
  { id: 'TWR-003', name: 'برج المراقبة الجنوبي' },
  { id: 'TWR-004', name: 'برج البث الإذاعي' }
];

export default function TowerAlertConfig() {
  const [alerts, setAlerts] = useState(existingAlerts);
  const [showNewAlertDialog, setShowNewAlertDialog] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: '',
    sensor: 'wind_speed',
    condition: 'greater_than',
    threshold: 0,
    severity: 'warning',
    towers: ['all'],
    notifications: ['app'],
    enabled: true
  });

  const toggleAlert = (alertId) => {
    setAlerts(alerts.map(a => 
      a.id === alertId ? { ...a, enabled: !a.enabled } : a
    ));
    toast.success('تم تحديث حالة التنبيه');
  };

  const deleteAlert = (alertId) => {
    setAlerts(alerts.filter(a => a.id !== alertId));
    toast.success('تم حذف التنبيه');
  };

  const saveNewAlert = () => {
    const sensor = sensors.find(s => s.id === newAlert.sensor);
    setAlerts([...alerts, {
      ...newAlert,
      id: `alert-${Date.now()}`,
      unit: sensor?.unit || ''
    }]);
    setShowNewAlertDialog(false);
    setNewAlert({
      name: '',
      sensor: 'wind_speed',
      condition: 'greater_than',
      threshold: 0,
      severity: 'warning',
      towers: ['all'],
      notifications: ['app'],
      enabled: true
    });
    toast.success('تم إنشاء التنبيه بنجاح');
  };

  const getSeverityConfig = (severity) => severityOptions.find(s => s.id === severity) || severityOptions[1];
  const getSensorConfig = (sensorId) => sensors.find(s => s.id === sensorId) || sensors[0];

  const toggleNotification = (type) => {
    setNewAlert(prev => ({
      ...prev,
      notifications: prev.notifications.includes(type)
        ? prev.notifications.filter(n => n !== type)
        : [...prev.notifications, type]
    }));
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            تنبيهات مخصصة
          </h3>
          <p className="text-slate-400 text-sm">إعداد تنبيهات بناءً على قراءات المستشعرات</p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => setShowNewAlertDialog(true)}>
          <Plus className="w-4 h-4 ml-2" />
          تنبيه جديد
        </Button>
      </div>

      {/* Active Alerts Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="glass-card border-green-500/30 bg-green-500/5">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{alerts.filter(a => a.enabled).length}</p>
            <p className="text-xs text-slate-400">تنبيهات نشطة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{alerts.filter(a => a.severity === 'warning').length}</p>
            <p className="text-xs text-slate-400">تحذيرات</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-red-500/30 bg-red-500/5">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{alerts.filter(a => a.severity === 'critical').length}</p>
            <p className="text-xs text-slate-400">حرجة</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.map((alert, i) => {
          const severityConfig = getSeverityConfig(alert.severity);
          const sensorConfig = getSensorConfig(alert.sensor);
          const SensorIcon = sensorConfig.icon;

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`glass-card ${alert.enabled ? `border-${severityConfig.color}-500/30` : 'border-slate-700'} ${alert.enabled ? `bg-${severityConfig.color}-500/5` : 'bg-slate-800/30'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${alert.enabled ? `bg-${sensorConfig.color}-500/20` : 'bg-slate-700'}`}>
                      <SensorIcon className={`w-5 h-5 ${alert.enabled ? `text-${sensorConfig.color}-400` : 'text-slate-500'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-medium ${alert.enabled ? 'text-white' : 'text-slate-500'}`}>{alert.name}</p>
                        <Badge className={`bg-${severityConfig.color}-500/20 text-${severityConfig.color}-400`}>
                          {severityConfig.name}
                        </Badge>
                        {!alert.enabled && <Badge className="bg-slate-700 text-slate-400">معطل</Badge>}
                      </div>
                      <p className="text-slate-400 text-sm">
                        {sensorConfig.name} {alert.condition === 'greater_than' ? '>' : '<'} {alert.threshold} {alert.unit}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          {alert.notifications.includes('email') && <Mail className="w-3 h-3 text-slate-400" />}
                          {alert.notifications.includes('sms') && <MessageSquare className="w-3 h-3 text-slate-400" />}
                          {alert.notifications.includes('app') && <Smartphone className="w-3 h-3 text-slate-400" />}
                        </div>
                        <span className="text-slate-500 text-xs">
                          {alert.towers.includes('all') ? 'جميع الأبراج' : `${alert.towers.length} أبراج`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={alert.enabled} onCheckedChange={() => toggleAlert(alert.id)} />
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-500/20" onClick={() => deleteAlert(alert.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* New Alert Dialog */}
      <Dialog open={showNewAlertDialog} onOpenChange={setShowNewAlertDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              إنشاء تنبيه جديد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-slate-400 text-sm">اسم التنبيه</label>
              <Input
                value={newAlert.name}
                onChange={(e) => setNewAlert({...newAlert, name: e.target.value})}
                className="bg-slate-800 border-slate-700 mt-1"
                placeholder="مثال: تنبيه سرعة الرياح"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-sm">المستشعر</label>
                <Select value={newAlert.sensor} onValueChange={(v) => setNewAlert({...newAlert, sensor: v})}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {sensors.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        <div className="flex items-center gap-2">
                          <s.icon className="w-4 h-4" />
                          {s.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-slate-400 text-sm">الشرط</label>
                <Select value={newAlert.condition} onValueChange={(v) => setNewAlert({...newAlert, condition: v})}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="greater_than">أكبر من</SelectItem>
                    <SelectItem value="less_than">أقل من</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-sm">القيمة الحدية ({sensors.find(s => s.id === newAlert.sensor)?.unit})</label>
              <Input
                type="number"
                value={newAlert.threshold}
                onChange={(e) => setNewAlert({...newAlert, threshold: parseFloat(e.target.value) || 0})}
                className="bg-slate-800 border-slate-700 mt-1"
              />
            </div>

            <div>
              <label className="text-slate-400 text-sm">مستوى الخطورة</label>
              <Select value={newAlert.severity} onValueChange={(v) => setNewAlert({...newAlert, severity: v})}>
                <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {severityOptions.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-2 block">طرق الإشعار</label>
              <div className="flex gap-2">
                {[
                  { id: 'email', icon: Mail, name: 'بريد إلكتروني' },
                  { id: 'sms', icon: MessageSquare, name: 'رسالة نصية' },
                  { id: 'app', icon: Smartphone, name: 'التطبيق' }
                ].map(n => (
                  <Button
                    key={n.id}
                    size="sm"
                    variant={newAlert.notifications.includes(n.id) ? 'default' : 'outline'}
                    className={newAlert.notifications.includes(n.id) ? 'bg-cyan-600' : 'border-slate-600'}
                    onClick={() => toggleNotification(n.id)}
                  >
                    <n.icon className="w-3 h-3 ml-1" />
                    {n.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={saveNewAlert} disabled={!newAlert.name}>
                <Save className="w-4 h-4 ml-2" />
                حفظ التنبيه
              </Button>
              <Button variant="outline" className="border-slate-600" onClick={() => setShowNewAlertDialog(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}