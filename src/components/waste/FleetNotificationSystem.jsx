import React, { useState, useEffect } from 'react';
import {
  Bell, AlertTriangle, Navigation, Fuel, Battery, Clock, Truck, MapPin,
  Gauge, Volume2, VolumeX, Settings, X, CheckCircle, AlertOctagon,
  Route, Zap, ThermometerSun, Send, Eye, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import FleetNotificationSettings from './FleetNotificationSettings';

// أنواع التنبيهات
const alertTypes = {
  route_deviation: { label: 'انحراف عن المسار', icon: Route, color: 'amber', sound: 'warning' },
  speeding: { label: 'تجاوز السرعة', icon: Gauge, color: 'red', sound: 'alert' },
  harsh_driving: { label: 'قيادة خطرة', icon: AlertTriangle, color: 'red', sound: 'alert' },
  low_fuel: { label: 'وقود منخفض', icon: Fuel, color: 'amber', sound: 'warning' },
  battery_critical: { label: 'بطارية حرجة', icon: Battery, color: 'red', sound: 'alert' },
  priority_bin: { label: 'حاوية ذات أولوية', icon: MapPin, color: 'cyan', sound: 'info' },
  delay_expected: { label: 'تأخير متوقع', icon: Clock, color: 'purple', sound: 'warning' },
  maintenance_due: { label: 'موعد صيانة', icon: AlertOctagon, color: 'amber', sound: 'info' },
  engine_temp: { label: 'حرارة المحرك', icon: ThermometerSun, color: 'red', sound: 'alert' },
  route_completed: { label: 'اكتمال المسار', icon: CheckCircle, color: 'green', sound: 'success' },
};

// تنبيهات تجريبية
const sampleAlerts = [
  { id: 1, type: 'speeding', truckId: 'TRK-001', plate: 'أ ب ج 1234', driver: 'محمد أحمد', message: 'تجاوز السرعة المسموحة - 85 كم/س في منطقة 60', location: 'شارع الملك فهد', time: '10:45', severity: 'high', acknowledged: false },
  { id: 2, type: 'priority_bin', truckId: 'TRK-001', plate: 'أ ب ج 1234', driver: 'محمد أحمد', message: 'اقتراب من حاوية BIN-004 (92% امتلاء) - 500 متر', location: 'المنتزه المركزي', time: '10:42', severity: 'medium', acknowledged: false },
  { id: 3, type: 'low_fuel', truckId: 'TRK-003', plate: 'ز ح ط 9012', driver: 'عبدالله فهد', message: 'مستوى الوقود منخفض - 18%', location: 'المنطقة الصناعية', time: '10:38', severity: 'high', acknowledged: false },
  { id: 4, type: 'route_deviation', truckId: 'TRK-002', plate: 'د هـ و 5678', driver: 'خالد سعيد', message: 'انحراف عن المسار المحسن بـ 1.2 كم', location: 'حي الورود', time: '10:35', severity: 'medium', acknowledged: true },
  { id: 5, type: 'delay_expected', truckId: 'TRK-002', plate: 'د هـ و 5678', driver: 'خالد سعيد', message: 'تأخير متوقع 25 دقيقة بسبب حركة المرور', location: 'طريق الملك عبدالله', time: '10:30', severity: 'medium', acknowledged: false },
  { id: 6, type: 'harsh_driving', truckId: 'TRK-001', plate: 'أ ب ج 1234', driver: 'محمد أحمد', message: 'كبح مفاجئ شديد', location: 'شارع العليا', time: '10:25', severity: 'high', acknowledged: true },
  { id: 7, type: 'engine_temp', truckId: 'TRK-003', plate: 'ز ح ط 9012', driver: 'عبدالله فهد', message: 'حرارة المحرك مرتفعة - 102°C', location: 'المنطقة الصناعية', time: '10:20', severity: 'critical', acknowledged: false },
  { id: 8, type: 'route_completed', truckId: 'TRK-004', plate: 'ي ك ل 3456', driver: 'فيصل عمر', message: 'اكتمل المسار D بنجاح - 15 حاوية', location: 'المستودع', time: '10:15', severity: 'low', acknowledged: true },
];

// إعدادات التنبيهات الافتراضية
const defaultNotificationSettings = {
  route_deviation: { enabled: true, sendToDriver: true, sendToManager: true, sound: true },
  speeding: { enabled: true, sendToDriver: true, sendToManager: true, sound: true },
  harsh_driving: { enabled: true, sendToDriver: true, sendToManager: true, sound: true },
  low_fuel: { enabled: true, sendToDriver: true, sendToManager: true, sound: true },
  battery_critical: { enabled: true, sendToDriver: true, sendToManager: true, sound: true },
  priority_bin: { enabled: true, sendToDriver: true, sendToManager: false, sound: false },
  delay_expected: { enabled: true, sendToDriver: true, sendToManager: true, sound: true },
  maintenance_due: { enabled: true, sendToDriver: false, sendToManager: true, sound: false },
  engine_temp: { enabled: true, sendToDriver: true, sendToManager: true, sound: true },
  route_completed: { enabled: true, sendToDriver: false, sendToManager: true, sound: false },
};

export default function FleetNotificationSystem() {
  const [alerts, setAlerts] = useState(sampleAlerts);
  const [activeTab, setActiveTab] = useState('live');
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState(defaultNotificationSettings);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // محاكاة تنبيهات جديدة
  useEffect(() => {
    const interval = setInterval(() => {
      const types = Object.keys(alertTypes);
      const randomType = types[Math.floor(Math.random() * types.length)];
      const trucks = [
        { id: 'TRK-001', plate: 'أ ب ج 1234', driver: 'محمد أحمد' },
        { id: 'TRK-002', plate: 'د هـ و 5678', driver: 'خالد سعيد' },
        { id: 'TRK-003', plate: 'ز ح ط 9012', driver: 'عبدالله فهد' },
      ];
      const randomTruck = trucks[Math.floor(Math.random() * trucks.length)];
      
      if (notificationSettings[randomType]?.enabled && Math.random() > 0.7) {
        const newAlert = {
          id: Date.now(),
          type: randomType,
          truckId: randomTruck.id,
          plate: randomTruck.plate,
          driver: randomTruck.driver,
          message: getAlertMessage(randomType),
          location: 'موقع عشوائي',
          time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
          severity: getSeverity(randomType),
          acknowledged: false,
        };
        setAlerts(prev => [newAlert, ...prev].slice(0, 50));
        
        if (soundEnabled && notificationSettings[randomType]?.sound) {
          toast.warning(newAlert.message, { duration: 5000 });
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [soundEnabled, notificationSettings]);

  const getAlertMessage = (type) => {
    const messages = {
      route_deviation: 'انحراف عن المسار المحسن',
      speeding: 'تجاوز حد السرعة المسموح',
      harsh_driving: 'تم اكتشاف قيادة خطرة',
      low_fuel: 'مستوى الوقود منخفض جداً',
      battery_critical: 'حالة البطارية حرجة',
      priority_bin: 'اقتراب من حاوية ذات أولوية عالية',
      delay_expected: 'تأخير متوقع على المسار',
      maintenance_due: 'موعد الصيانة الدورية',
      engine_temp: 'ارتفاع حرارة المحرك',
      route_completed: 'اكتمل المسار بنجاح',
    };
    return messages[type] || 'تنبيه جديد';
  };

  const getSeverity = (type) => {
    const critical = ['engine_temp', 'battery_critical'];
    const high = ['speeding', 'harsh_driving', 'low_fuel'];
    if (critical.includes(type)) return 'critical';
    if (high.includes(type)) return 'high';
    return 'medium';
  };

  const acknowledgeAlert = (alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    toast.success('تم تأكيد استلام التنبيه');
  };

  const sendToDriver = (alert) => {
    toast.success(`تم إرسال التنبيه للسائق ${alert.driver}`);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'amber';
      case 'medium': return 'blue';
      default: return 'green';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchType = filterType === 'all' || alert.type === filterType;
    const matchSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    return matchType && matchSeverity;
  });

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;

  const stats = {
    total: alerts.length,
    unacknowledged: unacknowledgedCount,
    critical: criticalCount,
    today: alerts.length,
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-cyan-400" />
          نظام إشعارات الأسطول المتقدم
          {unacknowledgedCount > 0 && (
            <Badge className="bg-red-500 text-white animate-pulse">{unacknowledgedCount}</Badge>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSoundEnabled(!soundEnabled)} className={soundEnabled ? 'text-green-400' : 'text-slate-500'}>
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button variant="outline" className="border-slate-600" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4 ml-1" />
            الإعدادات
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {criticalCount > 0 && (
        <Card className="bg-red-500/20 border-red-500/50 animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertOctagon className="w-8 h-8 text-red-400" />
                <div>
                  <p className="text-red-400 font-bold">تنبيهات حرجة تحتاج انتباه فوري</p>
                  <p className="text-white">{criticalCount} تنبيه حرج غير معالج</p>
                </div>
              </div>
              <Button className="bg-red-600 hover:bg-red-700">معالجة الآن</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'إجمالي التنبيهات', value: stats.total, color: 'cyan', icon: Bell },
          { label: 'غير مؤكدة', value: stats.unacknowledged, color: 'amber', icon: AlertTriangle },
          { label: 'حرجة', value: stats.critical, color: 'red', icon: AlertOctagon },
          { label: 'اليوم', value: stats.today, color: 'green', icon: Clock },
        ].map(stat => (
          <Card key={stat.label} className={`bg-${stat.color}-500/10 border-${stat.color}-500/30`}>
            <CardContent className="p-3 text-center">
              <stat.icon className={`w-5 h-5 text-${stat.color}-400 mx-auto mb-1`} />
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className={`text-${stat.color}-400 text-xs`}>{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="live" className="data-[state=active]:bg-cyan-500/20">
            <Bell className="w-4 h-4 ml-1" />
            التنبيهات الحية
            {unacknowledgedCount > 0 && <Badge className="mr-1 bg-red-500 text-white text-xs">{unacknowledgedCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="drivers" className="data-[state=active]:bg-green-500/20">
            <Truck className="w-4 h-4 ml-1" />
            حسب السائق
          </TabsTrigger>
          <TabsTrigger value="types" className="data-[state=active]:bg-purple-500/20">
            <Filter className="w-4 h-4 ml-1" />
            حسب النوع
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="all">جميع الأنواع</option>
              {Object.entries(alertTypes).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="all">جميع الأولويات</option>
              <option value="critical">حرج</option>
              <option value="high">عالي</option>
              <option value="medium">متوسط</option>
              <option value="low">منخفض</option>
            </select>
          </div>

          <ScrollArea className="h-[450px]">
            <div className="space-y-2">
              {filteredAlerts.map(alert => {
                const config = alertTypes[alert.type];
                const Icon = config?.icon || Bell;
                return (
                  <Card key={alert.id} className={`${alert.acknowledged ? 'bg-slate-800/30 border-slate-700/50' : `bg-${config?.color || 'slate'}-500/10 border-${config?.color || 'slate'}-500/30`}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-${config?.color || 'slate'}-500/20`}>
                            <Icon className={`w-5 h-5 text-${config?.color || 'slate'}-400`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`bg-${getSeverityColor(alert.severity)}-500/20 text-${getSeverityColor(alert.severity)}-400 text-xs`}>
                                {alert.severity === 'critical' ? 'حرج' : alert.severity === 'high' ? 'عالي' : alert.severity === 'medium' ? 'متوسط' : 'منخفض'}
                              </Badge>
                              <span className="text-white font-medium text-sm">{config?.label}</span>
                              {alert.acknowledged && <CheckCircle className="w-4 h-4 text-green-400" />}
                            </div>
                            <p className="text-white text-sm">{alert.message}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Truck className="w-3 h-3" />
                                {alert.plate} - {alert.driver}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {alert.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {alert.time}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {!alert.acknowledged && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => acknowledgeAlert(alert.id)}>
                              <CheckCircle className="w-3 h-3 ml-1" />
                              تأكيد
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-cyan-400" onClick={() => sendToDriver(alert)}>
                            <Send className="w-3 h-3 ml-1" />
                            إرسال
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSelectedAlert(alert)}>
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="drivers" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {['TRK-001', 'TRK-002', 'TRK-003', 'TRK-004'].map(truckId => {
              const truckAlerts = alerts.filter(a => a.truckId === truckId);
              const unack = truckAlerts.filter(a => !a.acknowledged).length;
              return (
                <Card key={truckId} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-cyan-400" />
                        {truckId}
                      </span>
                      {unack > 0 && <Badge className="bg-amber-500/20 text-amber-400">{unack} جديد</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {truckAlerts.slice(0, 3).map(alert => {
                        const config = alertTypes[alert.type];
                        return (
                          <div key={alert.id} className={`p-2 rounded text-xs ${alert.acknowledged ? 'bg-slate-800/30' : 'bg-slate-800/50'}`}>
                            <div className="flex items-center justify-between">
                              <span className={`text-${config?.color || 'slate'}-400`}>{config?.label}</span>
                              <span className="text-slate-500">{alert.time}</span>
                            </div>
                          </div>
                        );
                      })}
                      {truckAlerts.length > 3 && (
                        <p className="text-slate-500 text-xs text-center">+{truckAlerts.length - 3} تنبيهات أخرى</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="types" className="mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(alertTypes).map(([type, config]) => {
              const count = alerts.filter(a => a.type === type).length;
              const Icon = config.icon;
              return (
                <Card key={type} className={`bg-${config.color}-500/10 border-${config.color}-500/30 cursor-pointer hover:bg-${config.color}-500/20`} onClick={() => setFilterType(type)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-6 h-6 text-${config.color}-400`} />
                        <div>
                          <p className="text-white font-medium">{config.label}</p>
                          <p className="text-slate-400 text-xs">{count} تنبيه</p>
                        </div>
                      </div>
                      <Badge className={`bg-${config.color}-500/20 text-${config.color}-400`}>{count}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              إعدادات الإشعارات المتقدمة
            </DialogTitle>
          </DialogHeader>
          <FleetNotificationSettings />
        </DialogContent>
      </Dialog>

      {/* Alert Details Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">تفاصيل التنبيه</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400 text-xs mb-1">نوع التنبيه</p>
                <p className={`text-${alertTypes[selectedAlert.type]?.color}-400 font-medium`}>
                  {alertTypes[selectedAlert.type]?.label}
                </p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400 text-xs mb-1">الرسالة</p>
                <p className="text-white">{selectedAlert.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">الشاحنة</p>
                  <p className="text-white">{selectedAlert.plate}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">السائق</p>
                  <p className="text-white">{selectedAlert.driver}</p>
                </div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400 text-xs mb-1">الموقع</p>
                <p className="text-white">{selectedAlert.location}</p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={() => sendToDriver(selectedAlert)}>
                  <Send className="w-4 h-4 ml-2" />
                  إرسال للسائق
                </Button>
                {!selectedAlert.acknowledged && (
                  <Button variant="outline" className="flex-1 border-green-500 text-green-400" onClick={() => { acknowledgeAlert(selectedAlert.id); setSelectedAlert(null); }}>
                    <CheckCircle className="w-4 h-4 ml-2" />
                    تأكيد
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}