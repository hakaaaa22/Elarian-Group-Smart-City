import React, { useState } from 'react';
import {
  Truck, MapPin, Navigation, Gauge, Weight, Clock, User, CheckCircle, AlertTriangle,
  Play, Pause, Camera, Fuel, Activity, Route, QrCode, RefreshCw, Wrench, Zap, TrendingUp,
  AlertOctagon, Battery, ThermometerSun, Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import FleetNotificationSystem from './FleetNotificationSystem';
import DriverPerformanceReports from './DriverPerformanceReports';

const wasteFleet = [
  { 
    id: 'TRK-001', 
    plate: 'أ ب ج 1234', 
    driver: 'محمد أحمد', 
    type: 'compactor',
    status: 'collecting', 
    route: 'المسار A - المنطقة التجارية',
    routeProgress: 65,
    binsCollected: 12,
    totalBins: 18,
    currentLoad: 8.5, // طن
    maxLoad: 12,
    fuel: 72,
    speed: 35,
    location: 'شارع الملك فهد',
    lastPickup: '10:45',
    driverScore: 92,
    canBus: { rpm: 1200, engineTemp: 85, hydraulicPressure: 180 },
    gps: { lat: 24.7136, lng: 46.6753 },
    dashcam: true,
  },
  { 
    id: 'TRK-002', 
    plate: 'د هـ و 5678', 
    driver: 'خالد سعيد', 
    type: 'rear_loader',
    status: 'en_route', 
    route: 'المسار B - الحي السكني',
    routeProgress: 30,
    binsCollected: 5,
    totalBins: 22,
    currentLoad: 3.2,
    maxLoad: 10,
    fuel: 58,
    speed: 45,
    location: 'حي الورود',
    lastPickup: '09:30',
    driverScore: 88,
    canBus: { rpm: 1500, engineTemp: 82, hydraulicPressure: 175 },
    gps: { lat: 24.7200, lng: 46.6800 },
    dashcam: true,
  },
  { 
    id: 'TRK-003', 
    plate: 'ز ح ط 9012', 
    driver: 'عبدالله فهد', 
    type: 'hazardous',
    status: 'completed', 
    route: 'المسار C - المنطقة الصناعية',
    routeProgress: 100,
    binsCollected: 8,
    totalBins: 8,
    currentLoad: 4.8,
    maxLoad: 6,
    fuel: 45,
    speed: 0,
    location: 'مركز المعالجة',
    lastPickup: '11:15',
    driverScore: 95,
    canBus: { rpm: 0, engineTemp: 65, hydraulicPressure: 0 },
    gps: { lat: 24.7050, lng: 46.6900 },
    dashcam: true,
  },
  { 
    id: 'TRK-004', 
    plate: 'ي ك ل 3456', 
    driver: 'فيصل عمر', 
    type: 'tanker',
    status: 'idle', 
    route: '-',
    routeProgress: 0,
    binsCollected: 0,
    totalBins: 0,
    currentLoad: 0,
    maxLoad: 15,
    fuel: 85,
    speed: 0,
    location: 'المستودع الرئيسي',
    lastPickup: '-',
    driverScore: 90,
    canBus: { rpm: 0, engineTemp: 40, hydraulicPressure: 0 },
    gps: { lat: 24.7180, lng: 46.6650 },
    dashcam: false,
  },
];

const recentPickups = [
  { id: 1, truckId: 'TRK-001', binId: 'BIN-005', time: '10:45', weight: 0.8, verified: true, photo: true },
  { id: 2, truckId: 'TRK-001', binId: 'BIN-012', time: '10:32', weight: 0.6, verified: true, photo: true },
  { id: 3, truckId: 'TRK-002', binId: 'BIN-008', time: '10:15', weight: 0.9, verified: true, photo: false },
  { id: 4, truckId: 'TRK-001', binId: 'BIN-003', time: '10:05', weight: 0.7, verified: false, photo: true },
];

const truckTypes = {
  compactor: { name: 'ضاغطة', color: 'green' },
  rear_loader: { name: 'تحميل خلفي', color: 'blue' },
  hazardous: { name: 'نفايات خطرة', color: 'red' },
  tanker: { name: 'صهريج', color: 'cyan' },
};

// تنبيهات الصيانة التنبؤية
const maintenanceAlerts = [
  { id: 1, truckId: 'TRK-003', plate: 'ز ح ط 9012', issue: 'حرارة المحرك مرتفعة', severity: 'critical', prediction: 'عطل محتمل خلال 48 ساعة' },
  { id: 2, truckId: 'TRK-001', plate: 'أ ب ج 1234', issue: 'ضغط هيدروليكي غير طبيعي', severity: 'warning', prediction: 'يحتاج فحص خلال أسبوع' },
  { id: 3, truckId: 'TRK-004', plate: 'ي ك ل 3456', issue: 'صحة البطارية منخفضة', severity: 'info', prediction: 'استبدال خلال شهر' },
];

export default function FleetWasteTracking() {
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [showTruckDialog, setShowTruckDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('tracking');

  const stats = {
    totalTrucks: wasteFleet.length,
    active: wasteFleet.filter(t => t.status === 'collecting' || t.status === 'en_route').length,
    completed: wasteFleet.filter(t => t.status === 'completed').length,
    idle: wasteFleet.filter(t => t.status === 'idle').length,
    avgLoad: Math.round(wasteFleet.reduce((s, t) => s + (t.currentLoad / t.maxLoad * 100), 0) / wasteFleet.length),
    totalCollected: wasteFleet.reduce((s, t) => s + t.currentLoad, 0).toFixed(1),
    avgFuel: Math.round(wasteFleet.reduce((s, t) => s + t.fuel, 0) / wasteFleet.length),
    avgDriverScore: Math.round(wasteFleet.reduce((s, t) => s + t.driverScore, 0) / wasteFleet.length),
    criticalAlerts: maintenanceAlerts.filter(a => a.severity === 'critical').length,
  };

  const operationalEfficiency = Math.round((stats.active / stats.totalTrucks) * 100);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'collecting': return { label: 'يجمع', color: 'green', icon: Truck };
      case 'en_route': return { label: 'في الطريق', color: 'cyan', icon: Navigation };
      case 'completed': return { label: 'اكتمل', color: 'blue', icon: CheckCircle };
      case 'idle': return { label: 'متوقف', color: 'slate', icon: Pause };
      default: return { label: status, color: 'slate', icon: Truck };
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Fleet Status Dashboard */}
      <Card className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-green-500/10 border-cyan-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              ملخص حالة الأسطول
            </h3>
            <div className="flex items-center gap-2">
              <Badge className={`${operationalEfficiency >= 70 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                <TrendingUp className="w-3 h-3 ml-1" />
                كفاءة التشغيل: {operationalEfficiency}%
              </Badge>
              {stats.criticalAlerts > 0 && (
                <Badge className="bg-red-500/20 text-red-400 animate-pulse">
                  <AlertOctagon className="w-3 h-3 ml-1" />
                  {stats.criticalAlerts} تنبيه حرج
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
              <Truck className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{stats.active}</p>
              <p className="text-green-400 text-xs">نشطة</p>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
              <CheckCircle className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{stats.completed}</p>
              <p className="text-blue-400 text-xs">مكتملة</p>
            </div>
            <div className="p-3 bg-slate-500/10 border border-slate-500/30 rounded-lg text-center">
              <Pause className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{stats.idle}</p>
              <p className="text-slate-400 text-xs">متوقفة</p>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center">
              <Weight className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{stats.avgLoad}%</p>
              <p className="text-amber-400 text-xs">متوسط الحمولة</p>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
              <Gauge className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{stats.totalCollected}t</p>
              <p className="text-purple-400 text-xs">إجمالي الجمع</p>
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
              <Fuel className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{stats.avgFuel}%</p>
              <p className="text-green-400 text-xs">متوسط الوقود</p>
            </div>
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-center">
              <User className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{stats.avgDriverScore}</p>
              <p className="text-cyan-400 text-xs">تقييم السائقين</p>
            </div>
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
              <Wrench className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{maintenanceAlerts.length}</p>
              <p className="text-red-400 text-xs">تنبيهات صيانة</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="tracking" className="data-[state=active]:bg-cyan-500/20">
            <Truck className="w-4 h-4 ml-1" />
            تتبع الأسطول
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-amber-500/20">
            <Bell className="w-4 h-4 ml-1" />
            نظام الإشعارات
          </TabsTrigger>
          <TabsTrigger value="drivers" className="data-[state=active]:bg-green-500/20">
            <User className="w-4 h-4 ml-1" />
            أداء السائقين
          </TabsTrigger>
          </TabsList>

        <TabsContent value="tracking" className="mt-4">
          {/* Maintenance Alerts from Predictive System */}
          {maintenanceAlerts.length > 0 && (
            <Card className="bg-amber-500/5 border-amber-500/30 mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  تنبيهات الصيانة التنبؤية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-2">
                  {maintenanceAlerts.map(alert => (
                    <div key={alert.id} className={`p-3 rounded-lg ${alert.severity === 'critical' ? 'bg-red-500/10 border border-red-500/30' : alert.severity === 'warning' ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-blue-500/10 border border-blue-500/30'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm font-medium">{alert.plate}</span>
                        <Badge className={`text-xs ${alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' : alert.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {alert.severity === 'critical' ? 'حرج' : alert.severity === 'warning' ? 'تحذير' : 'معلومة'}
                        </Badge>
                      </div>
                      <p className={`text-sm ${alert.severity === 'critical' ? 'text-red-400' : alert.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'}`}>{alert.issue}</p>
                      <p className="text-slate-500 text-xs mt-1">{alert.prediction}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-3 gap-4">
        {/* Trucks List */}
        <div className="lg:col-span-2">
          <ScrollArea className="h-[450px]">
            <div className="space-y-3">
              {wasteFleet.map(truck => {
                const statusConfig = getStatusConfig(truck.status);
                const typeConfig = truckTypes[truck.type];
                const StatusIcon = statusConfig.icon;
                
                return (
                  <Card key={truck.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl bg-${statusConfig.color}-500/20`}>
                            <StatusIcon className={`w-6 h-6 text-${statusConfig.color}-400`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-white font-bold">{truck.plate}</p>
                              <Badge className={`bg-${typeConfig.color}-500/20 text-${typeConfig.color}-400 text-xs`}>
                                {typeConfig.name}
                              </Badge>
                            </div>
                            <p className="text-slate-400 text-sm flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {truck.driver}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`bg-${statusConfig.color}-500/20 text-${statusConfig.color}-400`}>
                            {statusConfig.label}
                          </Badge>
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedTruck(truck); setShowTruckDialog(true); }}>
                            <Activity className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {truck.route !== '-' && (
                        <div className="mb-3">
                          <p className="text-slate-400 text-xs mb-1">{truck.route}</p>
                          <div className="flex items-center gap-2">
                            <Progress value={truck.routeProgress} className="flex-1 h-2" />
                            <span className="text-slate-400 text-xs">{truck.binsCollected}/{truck.totalBins}</span>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-5 gap-2 text-center">
                        <div className="p-1.5 bg-slate-800/50 rounded">
                          <Weight className="w-3 h-3 mx-auto text-amber-400" />
                          <p className="text-white text-xs">{truck.currentLoad}t</p>
                        </div>
                        <div className="p-1.5 bg-slate-800/50 rounded">
                          <Fuel className="w-3 h-3 mx-auto text-green-400" />
                          <p className="text-white text-xs">{truck.fuel}%</p>
                        </div>
                        <div className="p-1.5 bg-slate-800/50 rounded">
                          <Gauge className="w-3 h-3 mx-auto text-cyan-400" />
                          <p className="text-white text-xs">{truck.speed}km</p>
                        </div>
                        <div className="p-1.5 bg-slate-800/50 rounded">
                          <Activity className="w-3 h-3 mx-auto text-purple-400" />
                          <p className="text-white text-xs">{truck.driverScore}</p>
                        </div>
                        <div className="p-1.5 bg-slate-800/50 rounded">
                          <Camera className={`w-3 h-3 mx-auto ${truck.dashcam ? 'text-green-400' : 'text-slate-600'}`} />
                          <p className="text-white text-xs">{truck.dashcam ? '●' : '○'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
                        <p className="text-slate-500 text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {truck.location}
                        </p>
                        {truck.lastPickup !== '-' && (
                          <p className="text-slate-500 text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            آخر جمع: {truck.lastPickup}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Recent Pickups */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              عمليات الجمع الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[380px]">
              <div className="space-y-2">
                {recentPickups.map(pickup => (
                  <div key={pickup.id} className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-cyan-400" />
                        <span className="text-white text-sm">{pickup.binId}</span>
                      </div>
                      <span className="text-slate-500 text-xs">{pickup.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs">{pickup.truckId}</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-slate-700 text-slate-300 text-xs">{pickup.weight} طن</Badge>
                        {pickup.verified ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        )}
                        {pickup.photo && <Camera className="w-4 h-4 text-blue-400" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <FleetNotificationSystem />
        </TabsContent>

        <TabsContent value="drivers" className="mt-4">
          <DriverPerformanceReports />
        </TabsContent>
      </Tabs>

      {/* Truck Details Dialog */}
      <Dialog open={showTruckDialog} onOpenChange={setShowTruckDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-green-400" />
              تفاصيل الشاحنة {selectedTruck?.plate}
            </DialogTitle>
          </DialogHeader>
          {selectedTruck && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-white font-medium">{selectedTruck.driver}</p>
                <p className="text-slate-400 text-sm">{selectedTruck.route}</p>
              </div>
              
              {/* CAN Bus Data */}
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <p className="text-cyan-400 text-xs mb-2">بيانات CAN Bus</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-white font-bold">{selectedTruck.canBus.rpm}</p>
                    <p className="text-slate-500 text-xs">RPM</p>
                  </div>
                  <div>
                    <p className="text-white font-bold">{selectedTruck.canBus.engineTemp}°</p>
                    <p className="text-slate-500 text-xs">حرارة المحرك</p>
                  </div>
                  <div>
                    <p className="text-white font-bold">{selectedTruck.canBus.hydraulicPressure}</p>
                    <p className="text-slate-500 text-xs">الضغط الهيدروليكي</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 bg-slate-800/30 rounded text-center">
                  <p className="text-xl font-bold text-white">{selectedTruck.currentLoad}/{selectedTruck.maxLoad}</p>
                  <p className="text-slate-500 text-xs">الحمولة (طن)</p>
                </div>
                <div className="p-2 bg-slate-800/30 rounded text-center">
                  <p className="text-xl font-bold text-green-400">{selectedTruck.driverScore}</p>
                  <p className="text-slate-500 text-xs">نقاط السائق</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                  <Navigation className="w-4 h-4 ml-2" />
                  تتبع مباشر
                </Button>
                {selectedTruck.dashcam && (
                  <Button variant="outline" className="border-slate-600">
                    <Camera className="w-4 h-4" />
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