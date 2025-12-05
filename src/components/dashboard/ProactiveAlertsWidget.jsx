import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, AlertTriangle, Package, Wrench, TrendingDown, Clock,
  ChevronRight, X, CheckCircle, Calendar, Settings, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function ProactiveAlertsWidget({
  predictions = [],
  inventoryAlerts = [],
  maintenanceAlerts = [],
  onScheduleMaintenance,
  onOrderParts,
  onDismiss
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState('all');
  const [settings, setSettings] = useState({
    showMaintenance: true,
    showInventory: true,
    showPredictions: true,
    criticalOnly: false,
    soundEnabled: true
  });

  // دمج جميع التنبيهات
  const allAlerts = React.useMemo(() => {
    const alerts = [];

    // تنبيهات الصيانة التنبؤية
    if (settings.showPredictions) {
      predictions.forEach(pred => {
        if (!settings.criticalOnly || pred.urgency === 'critical' || pred.urgency === 'high') {
          alerts.push({
            id: `pred-${pred.id}`,
            type: 'prediction',
            severity: pred.urgency,
            title: pred.device_name,
            message: pred.issue || pred.recommendation,
            action: 'schedule',
            data: pred,
            timestamp: new Date()
          });
        }
      });
    }

    // تنبيهات المخزون
    if (settings.showInventory) {
      inventoryAlerts.forEach(item => {
        const isOutOfStock = item.quantity === 0;
        const isLowStock = item.quantity <= (item.min_quantity || 5);
        if (isOutOfStock || isLowStock) {
          if (!settings.criticalOnly || isOutOfStock) {
            alerts.push({
              id: `inv-${item.id}`,
              type: 'inventory',
              severity: isOutOfStock ? 'critical' : 'high',
              title: item.name,
              message: isOutOfStock ? 'نفذ من المخزون' : `المخزون منخفض (${item.quantity} متبقي)`,
              action: 'order',
              data: item,
              timestamp: new Date()
            });
          }
        }
      });
    }

    // تنبيهات الصيانة المعلقة
    if (settings.showMaintenance) {
      maintenanceAlerts.forEach(maint => {
        if (maint.priority === 'critical' || maint.priority === 'high') {
          if (!settings.criticalOnly || maint.priority === 'critical') {
            alerts.push({
              id: `maint-${maint.id}`,
              type: 'maintenance',
              severity: maint.priority,
              title: maint.device_name,
              message: maint.description || 'صيانة معلقة',
              action: 'view',
              data: maint,
              timestamp: new Date(maint.scheduled_date)
            });
          }
        }
      });
    }

    // ترتيب حسب الأولوية
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }, [predictions, inventoryAlerts, maintenanceAlerts, settings]);

  const filteredAlerts = allAlerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.type === filter;
  });

  const handleAction = (alert) => {
    switch (alert.action) {
      case 'schedule':
        onScheduleMaintenance?.(alert.data);
        break;
      case 'order':
        onOrderParts?.(alert.data);
        break;
      default:
        break;
    }
  };

  const handleDismiss = (alertId) => {
    onDismiss?.(alertId);
    toast.success('تم إخفاء التنبيه');
  };

  const severityStyles = {
    critical: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      icon: 'text-red-400',
      badge: 'bg-red-500/20 text-red-400'
    },
    high: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      icon: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-400'
    },
    medium: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      icon: 'text-yellow-400',
      badge: 'bg-yellow-500/20 text-yellow-400'
    },
    low: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      icon: 'text-blue-400',
      badge: 'bg-blue-500/20 text-blue-400'
    }
  };

  const typeIcons = {
    prediction: AlertTriangle,
    inventory: Package,
    maintenance: Wrench
  };

  const typeLabels = {
    prediction: 'تنبؤي',
    inventory: 'مخزون',
    maintenance: 'صيانة'
  };

  return (
    <>
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              التنبيهات الاستباقية
              {filteredAlerts.length > 0 && (
                <Badge className="bg-red-500/20 text-red-400">{filteredAlerts.length}</Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-28 h-8 bg-slate-800/50 border-slate-700 text-white">
                  <Filter className="w-3 h-3 ml-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="prediction">تنبؤي</SelectItem>
                  <SelectItem value="inventory">مخزون</SelectItem>
                  <SelectItem value="maintenance">صيانة</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setShowSettings(true)}
                className="text-slate-400 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
              <p className="text-slate-400">لا توجد تنبيهات نشطة</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              <AnimatePresence>
                {filteredAlerts.slice(0, 10).map((alert, idx) => {
                  const style = severityStyles[alert.severity];
                  const Icon = typeIcons[alert.type];
                  
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-3 rounded-lg border ${style.bg} ${style.border}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${style.bg}`}>
                          <Icon className={`w-4 h-4 ${style.icon}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-medium text-sm truncate">{alert.title}</h4>
                            <Badge className={`text-[10px] ${style.badge}`}>
                              {typeLabels[alert.type]}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-xs">{alert.message}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-cyan-400 hover:text-cyan-300"
                            onClick={() => handleAction(alert)}
                          >
                            {alert.action === 'schedule' ? (
                              <><Calendar className="w-3 h-3 ml-1" />جدولة</>
                            ) : alert.action === 'order' ? (
                              <><Package className="w-3 h-3 ml-1" />طلب</>
                            ) : (
                              <><ChevronRight className="w-3 h-3" /></>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-slate-500 hover:text-red-400"
                            onClick={() => handleDismiss(alert.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {filteredAlerts.length > 10 && (
            <p className="text-center text-slate-400 text-xs mt-3">
              +{filteredAlerts.length - 10} تنبيهات أخرى
            </p>
          )}
        </CardContent>
      </Card>

      {/* إعدادات التنبيهات */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" />
              إعدادات التنبيهات
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300">تنبيهات الصيانة</Label>
              <Switch 
                checked={settings.showMaintenance}
                onCheckedChange={(v) => setSettings({...settings, showMaintenance: v})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300">تنبيهات المخزون</Label>
              <Switch 
                checked={settings.showInventory}
                onCheckedChange={(v) => setSettings({...settings, showInventory: v})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300">التنبيهات التنبؤية</Label>
              <Switch 
                checked={settings.showPredictions}
                onCheckedChange={(v) => setSettings({...settings, showPredictions: v})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300">الحرجة فقط</Label>
              <Switch 
                checked={settings.criticalOnly}
                onCheckedChange={(v) => setSettings({...settings, criticalOnly: v})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300">تفعيل الصوت</Label>
              <Switch 
                checked={settings.soundEnabled}
                onCheckedChange={(v) => setSettings({...settings, soundEnabled: v})}
              />
            </div>
            <Button 
              className="w-full bg-amber-600 hover:bg-amber-700"
              onClick={() => {
                setShowSettings(false);
                toast.success('تم حفظ الإعدادات');
              }}
            >
              حفظ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}