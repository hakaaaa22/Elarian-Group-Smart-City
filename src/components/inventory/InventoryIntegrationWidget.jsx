import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Package, AlertTriangle, TrendingUp, TrendingDown, ShoppingCart, Wrench,
  Car, FileText, Bell, Calendar, Check, Clock, ChevronRight, Plus, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

// تنبيهات ذكية بناءً على أنماط الاستخدام
const generateSmartAlerts = (items, usagePatterns) => {
  const alerts = [];
  
  items.forEach(item => {
    // تنبيه نفاد متوقع
    if (item.avg_monthly_usage > 0) {
      const monthsUntilEmpty = item.quantity / item.avg_monthly_usage;
      if (monthsUntilEmpty < 2) {
        alerts.push({
          id: `depletion-${item.id}`,
          type: 'depletion',
          severity: monthsUntilEmpty < 1 ? 'critical' : 'warning',
          item: item,
          message: `سينفد خلال ${Math.round(monthsUntilEmpty * 30)} يوم`,
          recommendation: `طلب ${item.min_quantity * 2} وحدة الآن`
        });
      }
    }
    
    // تنبيه زيادة الاستخدام قبل فترة الصيانة الدورية
    if (item.usage_trend === 'increasing') {
      alerts.push({
        id: `trend-${item.id}`,
        type: 'trend',
        severity: 'info',
        item: item,
        message: `الاستخدام يتزايد - توقع حاجة أكبر قريباً`,
        recommendation: `زيادة الحد الأدنى إلى ${item.min_quantity * 1.5}`
      });
    }
  });
  
  return alerts;
};

export default function InventoryIntegrationWidget({ 
  items = [], 
  onOrderPart, 
  onLinkToMaintenance,
  onLinkToVehicle,
  maintenanceRecords = [],
  vehicleExpenses = []
}) {
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [linkType, setLinkType] = useState('maintenance');
  const [linkReference, setLinkReference] = useState('');

  // تنبيهات ذكية
  const smartAlerts = useMemo(() => generateSmartAlerts(items, {}), [items]);
  
  // إحصائيات الاستخدام
  const usageStats = useMemo(() => {
    const maintenanceUsage = items.reduce((sum, item) => {
      const usage = maintenanceRecords.filter(r => 
        r.parts_used?.some(p => p.part_name === item.name)
      ).reduce((s, r) => s + (r.parts_used?.find(p => p.part_name === item.name)?.quantity || 0), 0);
      return sum + usage;
    }, 0);

    const vehicleUsage = items.reduce((sum, item) => {
      const usage = vehicleExpenses.filter(e => 
        e.parts_from_inventory?.some(p => p.item_name === item.name)
      ).reduce((s, e) => s + (e.parts_from_inventory?.find(p => p.item_name === item.name)?.quantity || 0), 0);
      return sum + usage;
    }, 0);

    return { maintenanceUsage, vehicleUsage, total: maintenanceUsage + vehicleUsage };
  }, [items, maintenanceRecords, vehicleExpenses]);

  const handleQuickOrder = (item) => {
    setSelectedItem(item);
    setOrderQuantity(item.min_quantity * 2);
    setShowOrderDialog(true);
  };

  const handleLinkPart = (item) => {
    setSelectedItem(item);
    setShowLinkDialog(true);
  };

  const confirmOrder = () => {
    if (onOrderPart) {
      onOrderPart({
        item_id: selectedItem.id,
        item_name: selectedItem.name,
        quantity: orderQuantity,
        unit_cost: selectedItem.unit_cost,
        priority: selectedItem.status === 'out_of_stock' ? 'urgent' : 'high'
      });
    }
    toast.success(`تم إنشاء طلب لـ ${orderQuantity} ${selectedItem.unit} من ${selectedItem.name}`);
    setShowOrderDialog(false);
  };

  const confirmLink = () => {
    if (linkType === 'maintenance' && onLinkToMaintenance) {
      onLinkToMaintenance({
        item_id: selectedItem.id,
        item_name: selectedItem.name,
        quantity: 1,
        reference: linkReference
      });
    } else if (linkType === 'vehicle' && onLinkToVehicle) {
      onLinkToVehicle({
        item_id: selectedItem.id,
        item_name: selectedItem.name,
        quantity: 1,
        reference: linkReference
      });
    }
    toast.success(`تم ربط ${selectedItem.name} بـ ${linkReference}`);
    setShowLinkDialog(false);
  };

  const criticalItems = items.filter(i => i.status === 'out_of_stock' || i.status === 'low_stock');

  return (
    <div className="space-y-4">
      {/* Smart Alerts */}
      {smartAlerts.length > 0 && (
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              تنبيهات ذكية للمخزون ({smartAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {smartAlerts.slice(0, 3).map(alert => (
              <div key={alert.id} className={`p-3 rounded-lg border ${
                alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                alert.severity === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                'bg-blue-500/10 border-blue-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium text-sm">{alert.item.name}</span>
                      <Badge className={`text-xs ${
                        alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        alert.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {alert.type === 'depletion' ? 'نفاد متوقع' : 'اتجاه'}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-xs">{alert.message}</p>
                    <p className="text-cyan-400 text-xs mt-1">💡 {alert.recommendation}</p>
                  </div>
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 h-7" onClick={() => handleQuickOrder(alert.item)}>
                    <ShoppingCart className="w-3 h-3 ml-1" />
                    طلب
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Usage Statistics */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="glass-card border-amber-500/20 bg-[#0f1629]/80">
          <CardContent className="p-3 text-center">
            <Wrench className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{usageStats.maintenanceUsage}</p>
            <p className="text-slate-400 text-xs">للصيانة</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-cyan-500/20 bg-[#0f1629]/80">
          <CardContent className="p-3 text-center">
            <Car className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{usageStats.vehicleUsage}</p>
            <p className="text-slate-400 text-xs">للمركبات</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-green-500/20 bg-[#0f1629]/80">
          <CardContent className="p-3 text-center">
            <Package className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{usageStats.total}</p>
            <p className="text-slate-400 text-xs">إجمالي الاستخدام</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Items */}
      {criticalItems.length > 0 && (
        <Card className="glass-card border-red-500/30 bg-red-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              قطع تحتاج إعادة طلب ({criticalItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalItems.slice(0, 5).map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={`${item.status === 'out_of_stock' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {item.status === 'out_of_stock' ? 'نفذ' : 'منخفض'}
                    </Badge>
                    <div>
                      <p className="text-white text-sm">{item.name}</p>
                      <p className="text-slate-500 text-xs">{item.quantity}/{item.min_quantity}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => handleLinkPart(item)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 h-7" onClick={() => handleQuickOrder(item)}>
                      <ShoppingCart className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Order Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-400" />
              طلب سريع
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="text-white font-bold">{selectedItem.name}</h4>
                <p className="text-slate-400 text-sm">{selectedItem.sku}</p>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-slate-400">المتوفر:</span>
                  <span className="text-white">{selectedItem.quantity} {selectedItem.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">سعر الوحدة:</span>
                  <span className="text-cyan-400">{selectedItem.unit_cost} ر.س</span>
                </div>
              </div>

              <div>
                <Label className="text-slate-300">الكمية المطلوبة</Label>
                <Input 
                  type="number" 
                  min="1" 
                  value={orderQuantity} 
                  onChange={(e) => setOrderQuantity(Number(e.target.value))}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                />
              </div>

              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-slate-400">الإجمالي:</span>
                  <span className="text-green-400 font-bold">{orderQuantity * selectedItem.unit_cost} ر.س</span>
                </div>
              </div>

              <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={confirmOrder}>
                <Check className="w-4 h-4 ml-2" />
                تأكيد الطلب
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              ربط قطعة غيار
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-white font-medium">{selectedItem.name}</p>
                <p className="text-slate-400 text-xs">{selectedItem.quantity} متوفر</p>
              </div>

              <div>
                <Label className="text-slate-300">نوع الربط</Label>
                <Select value={linkType} onValueChange={setLinkType}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="maintenance">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-amber-400" />
                        صيانة
                      </div>
                    </SelectItem>
                    <SelectItem value="vehicle">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-cyan-400" />
                        مركبة
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">مرجع الربط</Label>
                <Input 
                  value={linkReference}
                  onChange={(e) => setLinkReference(e.target.value)}
                  placeholder={linkType === 'maintenance' ? 'رقم طلب الصيانة' : 'لوحة المركبة'}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                />
              </div>

              <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={confirmLink}>
                <Check className="w-4 h-4 ml-2" />
                تأكيد الربط
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}