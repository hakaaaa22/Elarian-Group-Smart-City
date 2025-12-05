import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Route, MapPin, Clock, Fuel, Truck, AlertTriangle, Play, RefreshCw,
  Navigation, Package, Timer, TrendingDown, CheckCircle, Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const vehicles = [
  { id: 'V-12', name: 'شاحنة التوصيل #12', capacity: 80, currentLoad: 65, status: 'available', maintenanceAlert: false },
  { id: 'V-08', name: 'فان #08', capacity: 40, currentLoad: 35, status: 'available', maintenanceAlert: true },
  { id: 'V-15', name: 'شاحنة كبيرة #15', capacity: 120, currentLoad: 0, status: 'available', maintenanceAlert: false },
  { id: 'V-03', name: 'سيدان #03', capacity: 20, currentLoad: 15, status: 'on_route', maintenanceAlert: false },
];

const deliveries = [
  { id: 'D-001', destination: 'حي الورود', priority: 'high', timeWindow: '10:00 - 12:00', weight: 25 },
  { id: 'D-002', destination: 'المنطقة الصناعية', priority: 'medium', timeWindow: '11:00 - 14:00', weight: 45 },
  { id: 'D-003', destination: 'شارع العليا', priority: 'urgent', timeWindow: '09:00 - 10:30', weight: 15 },
  { id: 'D-004', destination: 'حي النزهة', priority: 'low', timeWindow: '14:00 - 18:00', weight: 30 },
  { id: 'D-005', destination: 'الطريق الدائري', priority: 'medium', timeWindow: '12:00 - 15:00', weight: 20 },
];

const trafficConditions = {
  'حي الورود': { congestion: 'low', estimatedDelay: 5 },
  'المنطقة الصناعية': { congestion: 'high', estimatedDelay: 25 },
  'شارع العليا': { congestion: 'medium', estimatedDelay: 15 },
  'حي النزهة': { congestion: 'low', estimatedDelay: 5 },
  'الطريق الدائري': { congestion: 'high', estimatedDelay: 30 },
};

export default function AIRouteOptimization() {
  const [optimizedRoutes, setOptimizedRoutes] = useState(null);
  const [settings, setSettings] = useState({
    considerTraffic: true,
    considerMaintenance: true,
    prioritizeFuel: true,
    respectTimeWindows: true,
  });

  const optimizeRoutes = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في تحسين مسارات الأسطول، قم بتحليل البيانات التالية وإنشاء مسارات محسنة:

المركبات المتاحة:
${vehicles.filter(v => v.status === 'available').map(v => `- ${v.id}: سعة ${v.capacity}، حمولة حالية ${v.currentLoad}، تنبيه صيانة: ${v.maintenanceAlert}`).join('\n')}

التوصيلات المطلوبة:
${deliveries.map(d => `- ${d.id}: ${d.destination}، أولوية: ${d.priority}، نافذة زمنية: ${d.timeWindow}، وزن: ${d.weight}كج`).join('\n')}

حالة المرور:
${Object.entries(trafficConditions).map(([loc, cond]) => `- ${loc}: ازدحام ${cond.congestion}، تأخير متوقع: ${cond.estimatedDelay} دقيقة`).join('\n')}

الإعدادات:
- مراعاة حركة المرور: ${settings.considerTraffic}
- مراعاة حالة الصيانة: ${settings.considerMaintenance}
- أولوية توفير الوقود: ${settings.prioritizeFuel}
- احترام النوافذ الزمنية: ${settings.respectTimeWindows}

قدم:
1. تخصيص المركبات للتوصيلات
2. ترتيب المسار الأمثل لكل مركبة
3. الوقت المتوقع لكل توصيل
4. التوفير المتوقع في الوقود والوقت`,
        response_json_schema: {
          type: "object",
          properties: {
            routes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  vehicleId: { type: "string" },
                  deliveries: { type: "array", items: { type: "string" } },
                  totalDistance: { type: "number" },
                  estimatedTime: { type: "string" },
                  fuelEstimate: { type: "number" },
                  stops: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        deliveryId: { type: "string" },
                        destination: { type: "string" },
                        arrivalTime: { type: "string" },
                        trafficStatus: { type: "string" }
                      }
                    }
                  }
                }
              }
            },
            totalSavings: {
              type: "object",
              properties: {
                fuelSaved: { type: "number" },
                timeSaved: { type: "number" },
                costSaved: { type: "number" }
              }
            },
            warnings: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setOptimizedRoutes(data);
      toast.success('تم تحسين المسارات بنجاح');
    }
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400';
      case 'high': return 'bg-amber-500/20 text-amber-400';
      case 'medium': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-green-500/20 text-green-400';
    }
  };

  const getTrafficColor = (congestion) => {
    switch (congestion) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-amber-400';
      default: return 'text-green-400';
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Route className="w-5 h-5 text-green-400" />
          تحسين المسارات بالذكاء الاصطناعي
        </h3>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => optimizeRoutes.mutate()} disabled={optimizeRoutes.isPending}>
          {optimizeRoutes.isPending ? <RefreshCw className="w-4 h-4 ml-1 animate-spin" /> : <Play className="w-4 h-4 ml-1" />}
          تحسين المسارات
        </Button>
      </div>

      {/* Settings */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            إعدادات التحسين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">حركة المرور</Label>
              <Switch checked={settings.considerTraffic} onCheckedChange={(v) => setSettings({...settings, considerTraffic: v})} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">حالة الصيانة</Label>
              <Switch checked={settings.considerMaintenance} onCheckedChange={(v) => setSettings({...settings, considerMaintenance: v})} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">توفير الوقود</Label>
              <Switch checked={settings.prioritizeFuel} onCheckedChange={(v) => setSettings({...settings, prioritizeFuel: v})} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">النوافذ الزمنية</Label>
              <Switch checked={settings.respectTimeWindows} onCheckedChange={(v) => setSettings({...settings, respectTimeWindows: v})} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Vehicles & Deliveries */}
        <div className="space-y-4">
          {/* Vehicles */}
          <Card className="bg-cyan-500/10 border-cyan-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-400" />
                المركبات المتاحة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {vehicles.map(v => (
                  <div key={v.id} className={`p-3 rounded-lg ${v.maintenanceAlert ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-800/50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{v.name}</span>
                        {v.maintenanceAlert && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                      </div>
                      <Badge className={v.status === 'available' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}>
                        {v.status === 'available' ? 'متاح' : 'في مهمة'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs">السعة:</span>
                      <Progress value={(v.currentLoad / v.capacity) * 100} className="flex-1 h-2" />
                      <span className="text-slate-300 text-xs">{v.currentLoad}/{v.capacity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deliveries */}
          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-400" />
                التوصيلات المطلوبة ({deliveries.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {deliveries.map(d => (
                    <div key={d.id} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm">{d.destination}</span>
                        <Badge className={getPriorityColor(d.priority)}>{d.priority}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{d.timeWindow}</span>
                        <span className={getTrafficColor(trafficConditions[d.destination]?.congestion)}>
                          {trafficConditions[d.destination]?.congestion === 'high' ? '🔴' : trafficConditions[d.destination]?.congestion === 'medium' ? '🟡' : '🟢'}
                          +{trafficConditions[d.destination]?.estimatedDelay}د
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Optimized Routes */}
        <Card className="glass-card border-green-500/30 bg-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Navigation className="w-4 h-4 text-green-400" />
              المسارات المحسنة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {optimizedRoutes ? (
              <div className="space-y-4">
                {/* Savings Summary */}
                {optimizedRoutes.totalSavings && (
                  <div className="grid grid-cols-3 gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="text-center">
                      <p className="text-green-400 font-bold">{optimizedRoutes.totalSavings.fuelSaved} لتر</p>
                      <p className="text-slate-400 text-xs">توفير وقود</p>
                    </div>
                    <div className="text-center">
                      <p className="text-cyan-400 font-bold">{optimizedRoutes.totalSavings.timeSaved} د</p>
                      <p className="text-slate-400 text-xs">توفير وقت</p>
                    </div>
                    <div className="text-center">
                      <p className="text-amber-400 font-bold">{optimizedRoutes.totalSavings.costSaved} ر.س</p>
                      <p className="text-slate-400 text-xs">توفير تكلفة</p>
                    </div>
                  </div>
                )}

                {/* Routes */}
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {optimizedRoutes.routes?.map((route, i) => {
                      const vehicle = vehicles.find(v => v.id === route.vehicleId);
                      return (
                        <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{vehicle?.name || route.vehicleId}</span>
                            <Badge className="bg-cyan-500/20 text-cyan-400">{route.estimatedTime}</Badge>
                          </div>
                          <div className="space-y-1">
                            {route.stops?.map((stop, j) => (
                              <div key={j} className="flex items-center gap-2 text-sm">
                                <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs">{j + 1}</span>
                                <span className="text-slate-300">{stop.destination}</span>
                                <span className="text-slate-500 text-xs">{stop.arrivalTime}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                            <span><Fuel className="w-3 h-3 inline ml-1" />{route.fuelEstimate} لتر</span>
                            <span><MapPin className="w-3 h-3 inline ml-1" />{route.totalDistance} كم</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                {/* Warnings */}
                {optimizedRoutes.warnings?.length > 0 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-amber-400 text-sm font-medium mb-1">تحذيرات:</p>
                    <ul className="space-y-1">
                      {optimizedRoutes.warnings.map((w, i) => (
                        <li key={i} className="text-white text-xs flex items-start gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Route className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">اضغط "تحسين المسارات" لإنشاء مسارات محسنة</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}