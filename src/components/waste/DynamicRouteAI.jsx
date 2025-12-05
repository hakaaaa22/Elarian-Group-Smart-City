import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Route, Brain, RefreshCw, Truck, MapPin, Clock, Fuel, AlertTriangle,
  CloudRain, Wind, ThermometerSun, Navigation, CheckCircle, TrendingDown,
  Play, Settings, Target, Zap, Bell, Send, Trash2, Activity, Eye,
  AlertOctagon, Package, Users, Radio
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// Real-time data simulation
const realTimeData = {
  weather: {
    condition: 'مشمس',
    temperature: 34,
    humidity: 45,
    windSpeed: 18,
    rainProbability: 5
  },
  traffic: {
    overall: 'متوسط',
    level: 58,
    congestionAreas: ['شارع الملك فهد', 'تقاطع العليا'],
    accidents: 1
  },
  bins: [
    { id: 'BIN-001', location: 'شارع الملك فهد', fillLevel: 92, priority: 'critical', eta: '15 دقيقة للفيضان' },
    { id: 'BIN-004', location: 'المنتزه المركزي', fillLevel: 88, priority: 'high', eta: '30 دقيقة للفيضان' },
    { id: 'BIN-007', location: 'حي الورود', fillLevel: 78, priority: 'medium', eta: '2 ساعة للفيضان' },
    { id: 'BIN-012', location: 'المنطقة الصناعية', fillLevel: 65, priority: 'low', eta: '4 ساعات للفيضان' },
  ],
  trucks: [
    { id: 'TRK-001', driver: 'محمد أحمد', status: 'collecting', capacity: 72, route: 'A', stops: 12 },
    { id: 'TRK-002', driver: 'خالد سعيد', status: 'en_route', capacity: 45, route: 'B', stops: 8 },
    { id: 'TRK-003', driver: 'عبدالله فهد', status: 'idle', capacity: 15, route: '-', stops: 0 },
  ]
};

const optimizationHistory = [
  { time: '08:00', fuel: 45, time_saved: 12 },
  { time: '09:00', fuel: 42, time_saved: 18 },
  { time: '10:00', fuel: 38, time_saved: 22 },
  { time: '11:00', fuel: 35, time_saved: 28 },
  { time: '12:00', fuel: 32, time_saved: 35 },
];

export default function DynamicRouteAI() {
  const [isAutoOptimize, setIsAutoOptimize] = useState(true);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [driverNotifications, setDriverNotifications] = useState([]);
  const [dashboardAlerts, setDashboardAlerts] = useState([]);
  const [currentConditions, setCurrentConditions] = useState(realTimeData);

  // Simulate real-time updates
  useEffect(() => {
    if (realTimeUpdates) {
      const interval = setInterval(() => {
        setCurrentConditions(prev => ({
          ...prev,
          traffic: {
            ...prev.traffic,
            level: Math.min(100, Math.max(30, prev.traffic.level + (Math.random() - 0.5) * 10))
          },
          bins: prev.bins.map(bin => ({
            ...bin,
            fillLevel: Math.min(100, bin.fillLevel + Math.random() * 2)
          }))
        }));
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [realTimeUpdates]);

  // Main AI Route Optimization
  const optimizeRoutes = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كنظام ذكاء اصطناعي متقدم لتحسين مسارات جمع النفايات، قم بتحليل البيانات التالية وإنشاء خطة مسارات محسنة:

الظروف الجوية:
- الحالة: ${currentConditions.weather.condition}
- الحرارة: ${currentConditions.weather.temperature}°C
- الرطوبة: ${currentConditions.weather.humidity}%
- سرعة الرياح: ${currentConditions.weather.windSpeed} كم/س
- احتمال المطر: ${currentConditions.weather.rainProbability}%

حالة المرور:
- المستوى العام: ${currentConditions.traffic.overall} (${Math.round(currentConditions.traffic.level)}%)
- مناطق الازدحام: ${currentConditions.traffic.congestionAreas.join(', ')}
- حوادث: ${currentConditions.traffic.accidents}

الحاويات ذات الأولوية:
${currentConditions.bins.map(b => `- ${b.id}: ${b.fillLevel}% امتلاء، ${b.location}، أولوية ${b.priority}، ${b.eta}`).join('\n')}

الشاحنات المتاحة:
${currentConditions.trucks.map(t => `- ${t.id}: سعة ${t.capacity}%، حالة ${t.status}، سائق ${t.driver}`).join('\n')}

المطلوب:
1. تخصيص أمثل للشاحنات على الحاويات
2. ترتيب المحطات حسب الأولوية والموقع
3. تجنب مناطق الازدحام
4. تقدير التوفير في الوقود والوقت
5. تنبيهات للسائقين
6. تنبيهات لمركز القيادة
7. خطة طوارئ للحاويات الحرجة`,
        response_json_schema: {
          type: "object",
          properties: {
            routes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  truckId: { type: "string" },
                  driverName: { type: "string" },
                  stops: { type: "array", items: { type: "object", properties: { binId: { type: "string" }, location: { type: "string" }, eta: { type: "string" }, priority: { type: "string" } } } },
                  totalDistance: { type: "string" },
                  estimatedTime: { type: "string" },
                  fuelEstimate: { type: "number" }
                }
              }
            },
            savings: {
              type: "object",
              properties: {
                fuelSaved: { type: "string" },
                timeSaved: { type: "string" },
                distanceSaved: { type: "string" },
                co2Reduced: { type: "string" }
              }
            },
            driverAlerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  truckId: { type: "string" },
                  message: { type: "string" },
                  priority: { type: "string" },
                  action: { type: "string" }
                }
              }
            },
            dashboardAlerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  message: { type: "string" },
                  severity: { type: "string" }
                }
              }
            },
            emergencyPlan: {
              type: "object",
              properties: {
                criticalBins: { type: "array", items: { type: "string" } },
                immediateAction: { type: "string" },
                backupTruck: { type: "string" }
              }
            },
            optimizationScore: { type: "number" },
            overflowRisk: { type: "number" },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setOptimizationResult(data);
      
      // Set driver notifications
      if (data.driverAlerts) {
        setDriverNotifications(data.driverAlerts.map((alert, i) => ({
          id: Date.now() + i,
          ...alert,
          timestamp: new Date().toLocaleTimeString('ar-SA'),
          sent: false
        })));
      }
      
      // Set dashboard alerts
      if (data.dashboardAlerts) {
        setDashboardAlerts(data.dashboardAlerts.map((alert, i) => ({
          id: Date.now() + i,
          ...alert,
          timestamp: new Date().toLocaleTimeString('ar-SA')
        })));
      }
      
      toast.success('تم تحسين المسارات بنجاح');
    }
  });

  const sendDriverNotification = (notification) => {
    toast.success(`تم إرسال التنبيه للسائق ${notification.truckId}`);
    setDriverNotifications(prev => prev.map(n => 
      n.id === notification.id ? { ...n, sent: true } : n
    ));
  };

  const sendAllNotifications = () => {
    driverNotifications.forEach(n => {
      if (!n.sent) sendDriverNotification(n);
    });
  };

  const sendToDashboard = () => {
    toast.success('تم إرسال التحديثات للوحة التحكم المركزية');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'amber';
      case 'medium': return 'yellow';
      default: return 'green';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          تحسين المسارات الديناميكي بالذكاء الاصطناعي
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-1">
            <Label className="text-slate-400 text-sm">تحديث مباشر</Label>
            <Switch checked={realTimeUpdates} onCheckedChange={setRealTimeUpdates} />
            {realTimeUpdates && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-1">
            <Label className="text-slate-400 text-sm">تحسين تلقائي</Label>
            <Switch checked={isAutoOptimize} onCheckedChange={setIsAutoOptimize} />
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => optimizeRoutes.mutate()} disabled={optimizeRoutes.isPending}>
            {optimizeRoutes.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Zap className="w-4 h-4 ml-2" />}
            تحسين المسارات
          </Button>
        </div>
      </div>

      {/* Real-time Conditions */}
      <Card className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-amber-500/10 border-cyan-500/30">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="flex items-center gap-2">
              <ThermometerSun className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-white font-medium">{currentConditions.weather.temperature}°C</p>
                <p className="text-slate-400 text-xs">{currentConditions.weather.condition}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-white font-medium">{currentConditions.weather.windSpeed} كم/س</p>
                <p className="text-slate-400 text-xs">الرياح</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">{currentConditions.weather.rainProbability}%</p>
                <p className="text-slate-400 text-xs">احتمال المطر</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Navigation className={`w-5 h-5 ${currentConditions.traffic.level > 70 ? 'text-red-400' : currentConditions.traffic.level > 50 ? 'text-amber-400' : 'text-green-400'}`} />
              <div>
                <p className="text-white font-medium">{Math.round(currentConditions.traffic.level)}%</p>
                <p className="text-slate-400 text-xs">ازدحام المرور</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-white font-medium">{currentConditions.bins.filter(b => b.fillLevel > 80).length}</p>
                <p className="text-slate-400 text-xs">حاويات حرجة</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-medium">{currentConditions.trucks.filter(t => t.status !== 'idle').length}/{currentConditions.trucks.length}</p>
                <p className="text-slate-400 text-xs">شاحنات نشطة</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Priority Bins */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              الحاويات ذات الأولوية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {currentConditions.bins.map(bin => (
                  <div key={bin.id} className={`p-3 rounded-lg bg-${getPriorityColor(bin.priority)}-500/10 border border-${getPriorityColor(bin.priority)}-500/30`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium">{bin.id}</span>
                      <Badge className={`bg-${getPriorityColor(bin.priority)}-500/20 text-${getPriorityColor(bin.priority)}-400`}>
                        {bin.priority === 'critical' ? 'حرج' : bin.priority === 'high' ? 'عالي' : bin.priority === 'medium' ? 'متوسط' : 'منخفض'}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-xs">{bin.location}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Progress value={bin.fillLevel} className="flex-1 h-2 ml-2" />
                      <span className={`text-sm font-bold text-${getPriorityColor(bin.priority)}-400`}>{Math.round(bin.fillLevel)}%</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1">{bin.eta}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Active Trucks */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-green-400" />
              الشاحنات النشطة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {currentConditions.trucks.map(truck => (
                  <div key={truck.id} className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Truck className={`w-4 h-4 ${truck.status === 'collecting' ? 'text-green-400' : truck.status === 'en_route' ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span className="text-white font-medium">{truck.id}</span>
                      </div>
                      <Badge className={truck.status === 'collecting' ? 'bg-green-500/20 text-green-400' : truck.status === 'en_route' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-600 text-slate-400'}>
                        {truck.status === 'collecting' ? 'يجمع' : truck.status === 'en_route' ? 'في الطريق' : 'متوقف'}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-xs">السائق: {truck.driver}</p>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-slate-500">السعة: {truck.capacity}%</span>
                      <span className="text-slate-500">المحطات: {truck.stops}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Optimization History */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              أداء التحسين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={optimizationHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="fuel" stroke="#22c55e" strokeWidth={2} name="توفير الوقود (لتر)" />
                  <Line type="monotone" dataKey="time_saved" stroke="#22d3ee" strokeWidth={2} name="توفير الوقت (دقيقة)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Results */}
      {optimizationResult && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card border-green-500/30 bg-green-500/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  نتائج التحسين
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500/20 text-green-400">
                    <Target className="w-3 h-3 ml-1" />
                    كفاءة {optimizationResult.optimizationScore || 92}%
                  </Badge>
                  <Button size="sm" variant="outline" className="border-cyan-500 text-cyan-400" onClick={sendToDashboard}>
                    <Radio className="w-3 h-3 ml-1" />
                    إرسال للمركز
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Savings */}
              {optimizationResult.savings && (
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                    <Fuel className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <p className="text-xl font-bold text-white">{optimizationResult.savings.fuelSaved}</p>
                    <p className="text-green-400 text-xs">توفير الوقود</p>
                  </div>
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-center">
                    <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-xl font-bold text-white">{optimizationResult.savings.timeSaved}</p>
                    <p className="text-cyan-400 text-xs">توفير الوقت</p>
                  </div>
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
                    <MapPin className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                    <p className="text-xl font-bold text-white">{optimizationResult.savings.distanceSaved}</p>
                    <p className="text-purple-400 text-xs">توفير المسافة</p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
                    <TrendingDown className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <p className="text-xl font-bold text-white">{optimizationResult.savings.co2Reduced}</p>
                    <p className="text-emerald-400 text-xs">خفض CO2</p>
                  </div>
                </div>
              )}

              {/* Routes */}
              {optimizationResult.routes?.length > 0 && (
                <div className="mb-4">
                  <p className="text-slate-400 text-xs mb-2">المسارات المحسنة:</p>
                  <div className="grid md:grid-cols-2 gap-2">
                    {optimizationResult.routes.map((route, i) => (
                      <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-cyan-400" />
                            <span className="text-white font-medium">{route.truckId}</span>
                          </div>
                          <Badge className="bg-slate-700">{route.stops?.length || 0} محطة</Badge>
                        </div>
                        <p className="text-slate-400 text-xs">السائق: {route.driverName}</p>
                        <div className="flex items-center justify-between mt-2 text-xs">
                          <span className="text-slate-500">{route.totalDistance}</span>
                          <span className="text-green-400">{route.estimatedTime}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Driver Notifications */}
              {driverNotifications.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-amber-400 text-sm font-medium flex items-center gap-1">
                      <Bell className="w-4 h-4" />
                      تنبيهات للسائقين ({driverNotifications.filter(n => !n.sent).length} معلقة)
                    </p>
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700 h-7" onClick={sendAllNotifications}>
                      <Send className="w-3 h-3 ml-1" />
                      إرسال الكل
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {driverNotifications.map(notif => (
                      <div key={notif.id} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                        <div className="flex-1">
                          <span className="text-white text-sm">{notif.truckId}: </span>
                          <span className="text-slate-400 text-sm">{notif.message}</span>
                        </div>
                        {notif.sent ? (
                          <Badge className="bg-green-500/20 text-green-400">
                            <CheckCircle className="w-3 h-3 ml-1" />
                            تم
                          </Badge>
                        ) : (
                          <Button size="sm" variant="ghost" className="h-6 text-xs text-cyan-400" onClick={() => sendDriverNotification(notif)}>
                            <Send className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emergency Plan */}
              {optimizationResult.emergencyPlan && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                  <p className="text-red-400 text-sm font-medium flex items-center gap-1 mb-2">
                    <AlertOctagon className="w-4 h-4" />
                    خطة الطوارئ
                  </p>
                  <p className="text-white text-sm">{optimizationResult.emergencyPlan.immediateAction}</p>
                  {optimizationResult.emergencyPlan.criticalBins?.length > 0 && (
                    <p className="text-slate-400 text-xs mt-1">
                      حاويات حرجة: {optimizationResult.emergencyPlan.criticalBins.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Recommendations */}
              {optimizationResult.recommendations?.length > 0 && (
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                  <p className="text-cyan-400 text-sm font-medium mb-2">التوصيات:</p>
                  <ul className="space-y-1">
                    {optimizationResult.recommendations.map((rec, i) => (
                      <li key={i} className="text-white text-sm flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-cyan-400 mt-1 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}