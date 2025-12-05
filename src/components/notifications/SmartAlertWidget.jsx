import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, AlertTriangle, Shield, Wrench, Users, Car, Camera, Zap,
  Check, X, ChevronRight, Volume2, VolumeX, Settings, Eye,
  Ban, Calendar, RefreshCw, Brain, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const ALERT_TYPES = {
  security: { icon: Shield, color: 'red', label: 'أمني' },
  maintenance: { icon: Wrench, color: 'amber', label: 'صيانة' },
  visitor: { icon: Users, color: 'cyan', label: 'زوار' },
  vehicle: { icon: Car, color: 'green', label: 'مركبات' },
  camera: { icon: Camera, color: 'purple', label: 'كاميرات' },
  system: { icon: Zap, color: 'blue', label: 'نظام' },
};

const SEVERITY_LEVELS = {
  critical: { color: 'red', priority: 4, sound: true, visual: true },
  high: { color: 'orange', priority: 3, sound: true, visual: true },
  medium: { color: 'amber', priority: 2, sound: false, visual: true },
  low: { color: 'blue', priority: 1, sound: false, visual: false },
};

const mockAlerts = [
  {
    id: 1,
    type: 'security',
    severity: 'critical',
    title: 'محاولة دخول غير مصرح',
    message: 'تم اكتشاف محاولة دخول من شخص في القائمة السوداء - البوابة الرئيسية',
    timestamp: new Date().toISOString(),
    read: false,
    actions: [
      { id: 'block', label: 'حظر الدخول', icon: Ban, type: 'danger' },
      { id: 'investigate', label: 'فتح تحقيق', icon: Eye, type: 'default' },
    ]
  },
  {
    id: 2,
    type: 'maintenance',
    severity: 'high',
    title: 'صيانة عاجلة مطلوبة',
    message: 'مركبة #12 تحتاج صيانة فورية - تسريب زيت محتمل',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    read: false,
    actions: [
      { id: 'schedule', label: 'جدولة صيانة', icon: Calendar, type: 'primary' },
      { id: 'disable', label: 'إيقاف المركبة', icon: X, type: 'danger' },
    ]
  },
  {
    id: 3,
    type: 'visitor',
    severity: 'medium',
    title: 'تجاوز وقت الزيارة',
    message: '3 زوار تجاوزوا وقت الخروج المسموح به 30 دقيقة',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    read: false,
    actions: [
      { id: 'notify', label: 'إرسال تذكير', icon: Bell, type: 'default' },
      { id: 'extend', label: 'تمديد التصريح', icon: RefreshCw, type: 'primary' },
    ]
  },
  {
    id: 4,
    type: 'camera',
    severity: 'high',
    title: 'كاميرا غير متصلة',
    message: 'كاميرا المدخل الرئيسي C-01 فقدت الاتصال منذ 5 دقائق',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    read: true,
    actions: [
      { id: 'restart', label: 'إعادة تشغيل', icon: RefreshCw, type: 'primary' },
      { id: 'technician', label: 'طلب فني', icon: Wrench, type: 'default' },
    ]
  },
];

export default function SmartAlertWidget({ expanded = false, onAlertAction }) {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [severitySettings, setSeveritySettings] = useState({
    critical: { sound: true, visual: true, email: true },
    high: { sound: true, visual: true, email: false },
    medium: { sound: false, visual: true, email: false },
    low: { sound: false, visual: false, email: false },
  });
  const audioRef = useRef(null);

  const unreadCount = alerts.filter(a => !a.read).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.read).length;

  // تشغيل صوت للتنبيهات الحرجة
  useEffect(() => {
    if (criticalCount > 0 && soundEnabled && severitySettings.critical.sound) {
      // يمكن إضافة صوت تنبيه هنا
      // audioRef.current?.play();
    }
  }, [criticalCount, soundEnabled]);

  const markAsRead = (alertId) => {
    setAlerts(alerts.map(a => a.id === alertId ? { ...a, read: true } : a));
  };

  const dismissAlert = (alertId) => {
    setAlerts(alerts.filter(a => a.id !== alertId));
    toast.success('تم حذف التنبيه');
  };

  const executeAction = (alert, action) => {
    // تنفيذ الإجراء
    toast.success(`تم تنفيذ: ${action.label}`);
    markAsRead(alert.id);
    setSelectedAlert(null);
    
    if (onAlertAction) {
      onAlertAction(alert, action);
    }
  };

  const getTimeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${Math.floor(hours / 24)} يوم`;
  };

  return (
    <>
      <Card className={`bg-slate-800/30 border-slate-700/50 ${criticalCount > 0 ? 'ring-2 ring-red-500/50 animate-pulse' : ''}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className={`w-4 h-4 ${criticalCount > 0 ? 'text-red-400 animate-bounce' : 'text-cyan-400'}`} />
              التنبيهات الذكية
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white text-xs">{unreadCount}</Badge>
              )}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-green-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-4 h-4 text-slate-400" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {alerts.slice(0, expanded ? undefined : 4).map((alert, i) => {
              const typeConfig = ALERT_TYPES[alert.type];
              const TypeIcon = typeConfig.icon;
              const severityConfig = SEVERITY_LEVELS[alert.severity];

              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    !alert.read ? `bg-${severityConfig.color}-500/10 border border-${severityConfig.color}-500/30` : 'bg-slate-800/50'
                  } ${alert.severity === 'critical' && !alert.read ? 'animate-pulse' : ''}`}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-${typeConfig.color}-500/20 ${
                      alert.severity === 'critical' && !alert.read ? 'animate-bounce' : ''
                    }`}>
                      <TypeIcon className={`w-4 h-4 text-${typeConfig.color}-400`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white text-sm font-medium truncate">{alert.title}</span>
                        <Badge className={`text-xs bg-${severityConfig.color}-500/20 text-${severityConfig.color}-400`}>
                          {alert.severity === 'critical' ? 'حرج' :
                           alert.severity === 'high' ? 'عالي' :
                           alert.severity === 'medium' ? 'متوسط' : 'منخفض'}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-xs truncate">{alert.message}</p>
                      <p className="text-slate-500 text-xs mt-1">{getTimeAgo(alert.timestamp)}</p>
                    </div>
                    {!alert.read && (
                      <span className={`w-2 h-2 rounded-full bg-${severityConfig.color}-500`} />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {alerts.length === 0 && (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500">لا توجد تنبيهات</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Details Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {selectedAlert && (
                <>
                  {React.createElement(ALERT_TYPES[selectedAlert.type].icon, {
                    className: `w-5 h-5 text-${ALERT_TYPES[selectedAlert.type].color}-400`
                  })}
                  تفاصيل التنبيه
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4 mt-4">
              <div className={`p-4 rounded-lg bg-${SEVERITY_LEVELS[selectedAlert.severity].color}-500/10 border border-${SEVERITY_LEVELS[selectedAlert.severity].color}-500/30`}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`bg-${SEVERITY_LEVELS[selectedAlert.severity].color}-500/20 text-${SEVERITY_LEVELS[selectedAlert.severity].color}-400`}>
                    {selectedAlert.severity === 'critical' ? 'حرج' :
                     selectedAlert.severity === 'high' ? 'عالي' :
                     selectedAlert.severity === 'medium' ? 'متوسط' : 'منخفض'}
                  </Badge>
                  <Badge className="bg-slate-700 text-slate-300">{ALERT_TYPES[selectedAlert.type].label}</Badge>
                </div>
                <h4 className="text-white font-medium mb-2">{selectedAlert.title}</h4>
                <p className="text-slate-300 text-sm">{selectedAlert.message}</p>
                <p className="text-slate-500 text-xs mt-2">{getTimeAgo(selectedAlert.timestamp)}</p>
              </div>

              {/* AI Recommendation */}
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 text-sm font-medium">توصية AI</span>
                  <Sparkles className="w-3 h-3 text-purple-400" />
                </div>
                <p className="text-slate-300 text-sm">
                  {selectedAlert.severity === 'critical' ? 'يُنصح باتخاذ إجراء فوري لمنع أي مخاطر محتملة.' :
                   selectedAlert.severity === 'high' ? 'يُنصح بالتحقق والمتابعة خلال الساعة القادمة.' :
                   'يمكن المتابعة خلال الفترة المحددة دون استعجال.'}
                </p>
              </div>

              {/* Quick Actions */}
              <div>
                <p className="text-slate-400 text-sm mb-2">إجراءات سريعة:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAlert.actions.map(action => (
                    <Button
                      key={action.id}
                      size="sm"
                      className={
                        action.type === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                        action.type === 'primary' ? 'bg-cyan-600 hover:bg-cyan-700' :
                        'bg-slate-700 hover:bg-slate-600'
                      }
                      onClick={() => executeAction(selectedAlert, action)}
                    >
                      {React.createElement(action.icon, { className: 'w-4 h-4 ml-1' })}
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-600"
                  onClick={() => { markAsRead(selectedAlert.id); setSelectedAlert(null); }}
                >
                  <Check className="w-4 h-4 ml-1" />
                  تم القراءة
                </Button>
                <Button
                  variant="outline"
                  className="border-red-500/50 text-red-400"
                  onClick={() => { dismissAlert(selectedAlert.id); setSelectedAlert(null); }}
                >
                  <X className="w-4 h-4 ml-1" />
                  حذف
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              إعدادات التنبيهات
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {Object.entries(SEVERITY_LEVELS).map(([level, config]) => (
              <div key={level} className={`p-3 bg-${config.color}-500/10 border border-${config.color}-500/30 rounded-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-${config.color}-400 font-medium`}>
                    {level === 'critical' ? 'تنبيهات حرجة' :
                     level === 'high' ? 'تنبيهات عالية' :
                     level === 'medium' ? 'تنبيهات متوسطة' : 'تنبيهات منخفضة'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">صوت</span>
                    <Switch
                      checked={severitySettings[level].sound}
                      onCheckedChange={(v) => setSeveritySettings({
                        ...severitySettings,
                        [level]: { ...severitySettings[level], sound: v }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">بصري</span>
                    <Switch
                      checked={severitySettings[level].visual}
                      onCheckedChange={(v) => setSeveritySettings({
                        ...severitySettings,
                        [level]: { ...severitySettings[level], visual: v }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">بريد</span>
                    <Switch
                      checked={severitySettings[level].email}
                      onCheckedChange={(v) => setSeveritySettings({
                        ...severitySettings,
                        [level]: { ...severitySettings[level], email: v }
                      })}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowSettings(false)}>
              حفظ الإعدادات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}