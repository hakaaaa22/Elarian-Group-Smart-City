import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu, Wrench, Package, Zap, AlertTriangle, CheckCircle, TrendingUp,
  TrendingDown, Activity, Battery, Signal, Clock, DollarSign, Bell,
  ChevronRight, Eye, Calendar, Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// بيانات تجريبية
const mockSystemData = {
  devices: {
    total: 156,
    online: 142,
    offline: 8,
    warning: 6,
    needsMaintenance: 12,
    lowBattery: 4,
    weakSignal: 3
  },
  inventory: {
    totalItems: 245,
    lowStock: 8,
    outOfStock: 3,
    totalValue: 125000,
    pendingOrders: 5
  },
  energy: {
    todayConsumption: 285,
    predictedConsumption: 310,
    savedToday: 25,
    trend: -8.5,
    monthlyBill: 850,
    targetSaving: 100
  },
  maintenance: {
    scheduled: 8,
    inProgress: 3,
    overdue: 2,
    completedThisMonth: 24,
    predictiveAlerts: 5
  }
};

const predictiveMaintenanceAlerts = [
  { id: 1, device: 'مكيف غرفة النوم', health: 45, issue: 'ضعف كفاءة الفلتر', daysToFailure: 7, priority: 'high' },
  { id: 2, device: 'قفل الباب الذكي', health: 32, issue: 'بطارية منخفضة', daysToFailure: 3, priority: 'critical' },
  { id: 3, device: 'كاميرا الحديقة', health: 68, issue: 'تراجع جودة الصورة', daysToFailure: 15, priority: 'medium' },
  { id: 4, device: 'حساس الدخان', health: 55, issue: 'يحتاج معايرة', daysToFailure: 10, priority: 'medium' },
];

const criticalInventoryItems = [
  { name: 'بطاريات كاميرا', current: 2, min: 10, lastOrder: '2024-11-20' },
  { name: 'فلتر مكيف', current: 1, min: 5, lastOrder: '2024-10-15' },
  { name: 'حساس حركة', current: 0, min: 3, lastOrder: '2024-11-01' },
];

export default function SystemOverviewWidget({ compact = false }) {
  const [data, setData] = useState(mockSystemData);
  const [expandedSection, setExpandedSection] = useState(null);

  const systemHealth = Math.round(
    ((data.devices.online / data.devices.total) * 40) +
    ((1 - (data.inventory.lowStock + data.inventory.outOfStock) / data.inventory.totalItems) * 20) +
    ((1 - data.maintenance.overdue / (data.maintenance.scheduled + data.maintenance.inProgress)) * 20) +
    ((data.energy.savedToday / data.energy.targetSaving) * 20)
  );

  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Devices */}
        <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400 text-xs">الأجهزة</span>
            </div>
            <p className="text-xl font-bold text-white">{data.devices.online}/{data.devices.total}</p>
            {data.devices.needsMaintenance > 0 && (
              <Badge className="bg-amber-500/20 text-amber-400 text-xs mt-1">
                {data.devices.needsMaintenance} تحتاج صيانة
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card className="glass-card border-purple-500/30 bg-purple-500/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-purple-400" />
              <span className="text-slate-400 text-xs">المخزون</span>
            </div>
            <p className="text-xl font-bold text-white">{data.inventory.totalItems}</p>
            {data.inventory.outOfStock > 0 && (
              <Badge className="bg-red-500/20 text-red-400 text-xs mt-1">
                {data.inventory.outOfStock} نفذ
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Energy */}
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400 text-xs">الطاقة</span>
            </div>
            <p className="text-xl font-bold text-white">{data.energy.todayConsumption} kWh</p>
            <Badge className={`${data.energy.trend < 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} text-xs mt-1`}>
              {data.energy.trend < 0 ? <TrendingDown className="w-3 h-3 inline" /> : <TrendingUp className="w-3 h-3 inline" />}
              {Math.abs(data.energy.trend)}%
            </Badge>
          </CardContent>
        </Card>

        {/* Maintenance */}
        <Card className="glass-card border-green-500/30 bg-green-500/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-4 h-4 text-green-400" />
              <span className="text-slate-400 text-xs">الصيانة</span>
            </div>
            <p className="text-xl font-bold text-white">{data.maintenance.predictiveAlerts}</p>
            <span className="text-slate-500 text-xs">تنبيهات تنبؤية</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Overall Health */}
        <Card className={`glass-card ${systemHealth > 80 ? 'border-green-500/30 bg-green-500/5' : systemHealth > 60 ? 'border-amber-500/30 bg-amber-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
          <CardContent className="p-4 text-center">
            <Shield className={`w-8 h-8 mx-auto mb-2 ${systemHealth > 80 ? 'text-green-400' : systemHealth > 60 ? 'text-amber-400' : 'text-red-400'}`} />
            <p className="text-3xl font-bold text-white">{systemHealth}%</p>
            <p className="text-slate-400 text-xs">صحة النظام</p>
            <Progress value={systemHealth} className="h-2 mt-2" />
          </CardContent>
        </Card>

        {/* Devices Status */}
        <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <Badge className="bg-cyan-500/20 text-cyan-400">{data.devices.total}</Badge>
            </div>
            <p className="text-white font-bold">الأجهزة</p>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-green-400">متصل</span>
                <span className="text-white">{data.devices.online}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-400">غير متصل</span>
                <span className="text-white">{data.devices.offline}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-400">تحذير</span>
                <span className="text-white">{data.devices.warning}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Status */}
        <Card className="glass-card border-purple-500/30 bg-purple-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-purple-400" />
              <Badge className="bg-purple-500/20 text-purple-400">{data.inventory.totalItems}</Badge>
            </div>
            <p className="text-white font-bold">المخزون</p>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-amber-400">منخفض</span>
                <span className="text-white">{data.inventory.lowStock}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-400">نفذ</span>
                <span className="text-white">{data.inventory.outOfStock}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-400">طلبات معلقة</span>
                <span className="text-white">{data.inventory.pendingOrders}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Energy Status */}
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <Badge className={`${data.energy.trend < 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {data.energy.trend < 0 ? '-' : '+'}{Math.abs(data.energy.trend)}%
              </Badge>
            </div>
            <p className="text-white font-bold">الطاقة</p>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">اليوم</span>
                <span className="text-white">{data.energy.todayConsumption} kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">متوقع</span>
                <span className="text-cyan-400">{data.energy.predictedConsumption} kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">توفير</span>
                <span className="text-green-400">{data.energy.savedToday} kWh</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Status */}
        <Card className="glass-card border-green-500/30 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Wrench className="w-5 h-5 text-green-400" />
              <Badge className={`${data.maintenance.overdue > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                {data.maintenance.overdue > 0 ? `${data.maintenance.overdue} متأخر` : 'منتظم'}
              </Badge>
            </div>
            <p className="text-white font-bold">الصيانة</p>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">مجدولة</span>
                <span className="text-white">{data.maintenance.scheduled}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-400">قيد التنفيذ</span>
                <span className="text-white">{data.maintenance.inProgress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-400">تنبؤية</span>
                <span className="text-white">{data.maintenance.predictiveAlerts}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictive Maintenance Alerts */}
      <Card className="glass-card border-red-500/30 bg-red-500/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              تنبيهات الصيانة التنبؤية ({predictiveMaintenanceAlerts.length})
            </CardTitle>
            <Link to={createPageUrl('MaintenanceTracker')}>
              <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 h-7">
                <Eye className="w-3 h-3 ml-1" />
                عرض الكل
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {predictiveMaintenanceAlerts.map(alert => (
              <div key={alert.id} className={`p-3 rounded-lg border ${
                alert.priority === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                alert.priority === 'high' ? 'bg-amber-500/10 border-amber-500/30' :
                'bg-yellow-500/10 border-yellow-500/30'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium text-sm">{alert.device}</span>
                  <Badge className={`text-xs ${
                    alert.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                    alert.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {alert.priority === 'critical' ? 'حرج' : alert.priority === 'high' ? 'عالي' : 'متوسط'}
                  </Badge>
                </div>
                <p className="text-slate-400 text-xs mb-2">{alert.issue}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Progress value={alert.health} className="w-16 h-2" />
                    <span className={`text-xs ${alert.health < 40 ? 'text-red-400' : alert.health < 70 ? 'text-amber-400' : 'text-green-400'}`}>
                      {alert.health}%
                    </span>
                  </div>
                  <span className="text-slate-500 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {alert.daysToFailure} يوم
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical Inventory */}
      <Card className="glass-card border-amber-500/30 bg-amber-500/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              مخزون حرج ({criticalInventoryItems.length})
            </CardTitle>
            <Link to={createPageUrl('InventoryManagement')}>
              <Button size="sm" variant="outline" className="border-amber-500/50 text-amber-400 h-7">
                <Eye className="w-3 h-3 ml-1" />
                إدارة المخزون
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {criticalInventoryItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={`${item.current === 0 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {item.current === 0 ? 'نفذ' : 'منخفض'}
                  </Badge>
                  <div>
                    <p className="text-white text-sm">{item.name}</p>
                    <p className="text-slate-500 text-xs">آخر طلب: {item.lastOrder}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className={`font-bold ${item.current === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                    {item.current}/{item.min}
                  </p>
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 h-6 text-xs mt-1">
                    طلب
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to={createPageUrl('DeviceManagement')}>
          <Button variant="outline" className="w-full border-cyan-500/50 text-cyan-400 justify-start">
            <Cpu className="w-4 h-4 ml-2" />
            إدارة الأجهزة
            <ChevronRight className="w-4 h-4 mr-auto" />
          </Button>
        </Link>
        <Link to={createPageUrl('MaintenanceTracker')}>
          <Button variant="outline" className="w-full border-amber-500/50 text-amber-400 justify-start">
            <Wrench className="w-4 h-4 ml-2" />
            الصيانة التنبؤية
            <ChevronRight className="w-4 h-4 mr-auto" />
          </Button>
        </Link>
        <Link to={createPageUrl('InventoryManagement')}>
          <Button variant="outline" className="w-full border-purple-500/50 text-purple-400 justify-start">
            <Package className="w-4 h-4 ml-2" />
            المخزون
            <ChevronRight className="w-4 h-4 mr-auto" />
          </Button>
        </Link>
        <Link to={createPageUrl('SmartHome')}>
          <Button variant="outline" className="w-full border-green-500/50 text-green-400 justify-start">
            <Zap className="w-4 h-4 ml-2" />
            تحليل الطاقة
            <ChevronRight className="w-4 h-4 mr-auto" />
          </Button>
        </Link>
      </div>
    </div>
  );
}