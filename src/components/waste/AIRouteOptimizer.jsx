import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Route, Brain, RefreshCw, Truck, MapPin, Clock, Fuel, AlertTriangle,
  CloudRain, Wind, ThermometerSun, Navigation, CheckCircle, TrendingDown,
  Play, Pause, Settings, Target, Zap, BarChart3, Package, FileText, Users,
  Bell, Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';

// Real-time conditions simulation (would connect to actual APIs)
const useRealTimeConditions = () => {
  const [conditions, setConditions] = useState({
    traffic: 'متوسط',
    trafficLevel: 55,
    weather: 'مشمس',
    temperature: 32,
    windSpeed: 15,
    rainProbability: 10,
    lastUpdated: new Date().toLocaleTimeString('ar-SA')
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time traffic changes
      setConditions(prev => ({
        ...prev,
        trafficLevel: Math.min(100, Math.max(20, prev.trafficLevel + (Math.random() - 0.5) * 10)),
        traffic: prev.trafficLevel > 70 ? 'مزدحم' : prev.trafficLevel > 40 ? 'متوسط' : 'خفيف',
        lastUpdated: new Date().toLocaleTimeString('ar-SA')
      }));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return conditions;
};

const currentConditions = {
  traffic: 'متوسط',
  trafficLevel: 55,
  weather: 'مشمس',
  temperature: 32,
  windSpeed: 15,
  rainProbability: 10,
};

const activeTrucks = [
  { id: 'TRK-001', plate: 'أ ب ج 1234', capacity: 85, location: 'شارع الملك فهد', bins: 12, route: 'A' },
  { id: 'TRK-002', plate: 'د هـ و 5678', capacity: 45, location: 'حي الورود', bins: 5, route: 'B' },
  { id: 'TRK-003', plate: 'ز ح ط 9012', capacity: 30, location: 'المنطقة الصناعية', bins: 8, route: 'C' },
];

const priorityBins = [
  { id: 'BIN-004', location: 'المنتزه المركزي', fillLevel: 92, type: 'organic', priority: 'critical', timeToOverflow: '2 ساعة' },
  { id: 'BIN-001', location: 'شارع الملك فهد', fillLevel: 85, type: 'general', priority: 'high', timeToOverflow: '4 ساعات' },
  { id: 'BIN-008', location: 'محطة الوقود', fillLevel: 78, type: 'hazardous', priority: 'high', timeToOverflow: '6 ساعات' },
  { id: 'BIN-005', location: 'مركز التسوق', fillLevel: 75, type: 'general', priority: 'medium', timeToOverflow: '8 ساعات' },
];

// طلبات الجمع والإبلاغ
const citizenRequests = [
  { id: 'REQ-001', type: 'bulk', location: 'حي الصفا - شارع 15', description: 'أثاث قديم للتخلص', status: 'pending', priority: 'medium', reportedAt: '09:30' },
  { id: 'REQ-002', type: 'report', location: 'المنتزه الشرقي', description: 'حاوية مكسورة وممتلئة', status: 'pending', priority: 'high', reportedAt: '08:45' },
  { id: 'REQ-003', type: 'bulk', location: 'حي الربوة', description: 'مخلفات بناء صغيرة', status: 'assigned', priority: 'low', reportedAt: '10:15' },
  { id: 'REQ-004', type: 'report', location: 'شارع الأمير سلطان', description: 'رائحة كريهة من الحاوية', status: 'pending', priority: 'high', reportedAt: '07:00' },
];

const fuelSavingsHistory = [
  { day: 'السبت', original: 120, optimized: 95 },
  { day: 'الأحد', original: 135, optimized: 102 },
  { day: 'الإثنين', original: 128, optimized: 98 },
  { day: 'الثلاثاء', original: 142, optimized: 108 },
  { day: 'الأربعاء', original: 130, optimized: 100 },
];

export default function AIRouteOptimizer() {
  const realTimeConditions = useRealTimeConditions();
  const [optimizationSettings, setOptimizationSettings] = useState({
    considerTraffic: true,
    considerWeather: true,
    prioritizeFull: true,
    minimizeFuel: true,
    avoidRestrictedZones: true,
    dynamicRerouting: true,
    balanceLoad: true,
    useHistoricalData: true,
    autoDispatch: false,
  });
  const [optimizedRoutes, setOptimizedRoutes] = useState(null);
  const [isRealtime, setIsRealtime] = useState(false);
  const [fuelPriority, setFuelPriority] = useState([70]);
  const [dispatchedTrucks, setDispatchedTrucks] = useState([]);
  const [realTimeAlerts, setRealTimeAlerts] = useState([]);
  const [citizenRequestsState, setCitizenRequestsState] = useState(citizenRequests);
  const [includeRequests, setIncludeRequests] = useState(true);
  const [aiLearningStats, setAiLearningStats] = useState({
    dataPoints: 15420,
    accuracy: 94.5,
    lastTrained: '2024-12-03',
    improvements: '+3.2%'
  });

  const [proactiveAnalysis, setProactiveAnalysis] = useState(null);
  const [driverNotifications, setDriverNotifications] = useState([]);

  // تحليل استباقي AI للبلاغات والطلبات
  const analyzeRequestsProactively = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في تحليل بلاغات النفايات وتحسين المسارات، قم بتحليل البلاغات والطلبات الجديدة:

البلاغات وطلبات الجمع الجديدة:
${citizenRequestsState.filter(r => r.status === 'pending').map(r => `- ${r.id}: ${r.type === 'bulk' ? 'جمع ضخم' : 'بلاغ'} - ${r.location} - أولوية ${r.priority} - ${r.description}`).join('\n')}

الشاحنات النشطة حالياً:
${activeTrucks.map(t => `- ${t.id}: موقع ${t.location}، سعة متبقية ${100-t.capacity}%، في المسار ${t.route}`).join('\n')}

الحاويات ذات الأولوية:
${priorityBins.map(b => `- ${b.id}: ${b.fillLevel}%، ${b.location}`).join('\n')}

قم بـ:
1. تقييم أولوية كل طلب بناءً على الخطورة والموقع
2. تحديد أقرب شاحنة لكل طلب
3. اقتراح تعديلات فورية على المسارات لدمج الطلبات
4. تقدير التأثير على أوقات الإكمال الحالية
5. إنشاء تنبيهات للسائقين والمديرين`,
        response_json_schema: {
          type: "object",
          properties: {
            requestPriorities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  requestId: { type: "string" },
                  calculatedPriority: { type: "string" },
                  priorityScore: { type: "number" },
                  reason: { type: "string" },
                  urgency: { type: "string" }
                }
              }
            },
            routeModifications: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  truckId: { type: "string" },
                  requestId: { type: "string" },
                  action: { type: "string" },
                  newStopOrder: { type: "number" },
                  additionalTime: { type: "string" },
                  additionalDistance: { type: "string" }
                }
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
            managerAlerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  severity: { type: "string" },
                  recommendation: { type: "string" }
                }
              }
            },
            impactAnalysis: {
              type: "object",
              properties: {
                totalAdditionalTime: { type: "string" },
                affectedRoutes: { type: "number" },
                efficiencyImpact: { type: "string" }
              }
            },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setProactiveAnalysis(data);
      if (data.driverAlerts) {
        setDriverNotifications(data.driverAlerts);
        data.driverAlerts.forEach(alert => {
          toast.warning(`تنبيه للسائق ${alert.truckId}: ${alert.message}`, { duration: 8000 });
        });
      }
      toast.success('تم تحليل الطلبات واقتراح تعديلات المسارات');
    }
  });

  const sendDriverNotification = (alert) => {
    toast.success(`تم إرسال التنبيه للسائق ${alert.truckId}`);
  };

  const optimizeRoutes = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في تحسين مسارات جمع النفايات بالذكاء الاصطناعي، قم بإنشاء خطة مسارات محسنة:

الظروف الحالية:
- حركة المرور: ${currentConditions.traffic} (${currentConditions.trafficLevel}%)
- الطقس: ${currentConditions.weather}، ${currentConditions.temperature}°C
- سرعة الرياح: ${currentConditions.windSpeed} كم/س
- احتمالية المطر: ${currentConditions.rainProbability}%

الشاحنات المتاحة:
${activeTrucks.map(t => `- ${t.id}: سعة ${t.capacity}%, موقع: ${t.location}`).join('\n')}

الحاويات ذات الأولوية:
${priorityBins.map(b => `- ${b.id}: ${b.fillLevel}% امتلاء، ${b.location}, ${b.priority}`).join('\n')}

طلبات المواطنين (${includeRequests ? 'مُدمجة' : 'مستبعدة'}):
${includeRequests ? citizenRequestsState.filter(r => r.status === 'pending').map(r => `- ${r.id}: ${r.type === 'bulk' ? 'جمع ضخم' : 'بلاغ'} - ${r.location} - أولوية ${r.priority}`).join('\n') : 'لا توجد طلبات مدمجة'}

إعدادات التحسين:
- مراعاة المرور: ${optimizationSettings.considerTraffic}
- مراعاة الطقس: ${optimizationSettings.considerWeather}
- أولوية الممتلئة: ${optimizationSettings.prioritizeFull}
- تقليل الوقود: ${optimizationSettings.minimizeFuel} (أولوية: ${fuelPriority[0]}%)
- استخدام البيانات التاريخية: ${optimizationSettings.useHistoricalData}
- الإرسال التلقائي: ${optimizationSettings.autoDispatch}

البيانات التاريخية للتعلم:
- عدد نقاط البيانات: 15,420
- دقة النموذج: 94.5%
- أنماط الازدحام المتعلمة: أوقات الذروة 7-9 صباحاً و4-7 مساءً
- أنماط الامتلاء المتعلمة: الحاويات التجارية تمتلئ أسرع في عطلة نهاية الأسبوع

قدم:
1. مسارات محسنة لكل شاحنة
2. ترتيب الحاويات حسب الأولوية
3. الوقت المتوقع للإكمال
4. توفير الوقود المتوقع
5. تنبيهات وتوصيات
6. توقعات التأخير المحتملة
7. تسلسل الجمع الأمثل بناءً على التعلم التاريخي
8. دمج طلبات المواطنين في المسارات`,
        response_json_schema: {
          type: "object",
          properties: {
            routes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  truckId: { type: "string" },
                  stops: { type: "array", items: { type: "object", properties: { binId: { type: "string" }, location: { type: "string" }, eta: { type: "string" }, priority: { type: "string" } } } },
                  totalDistance: { type: "number" },
                  estimatedTime: { type: "string" },
                  fuelEstimate: { type: "number" }
                }
              }
            },
            totalSavings: { type: "object", properties: { fuel: { type: "number" }, time: { type: "string" }, distance: { type: "number" } } },
            alerts: { type: "array", items: { type: "object", properties: { type: { type: "string" }, message: { type: "string" }, affectedRoute: { type: "string" } } } },
            recommendations: { type: "array", items: { type: "string" } },
            optimizationScore: { type: "number" },
            predictedDelays: { type: "array", items: { type: "object", properties: { location: { type: "string" }, delayMinutes: { type: "number" }, reason: { type: "string" } } } },
            learningInsights: { type: "array", items: { type: "string" } },
            integratedRequests: { type: "array", items: { type: "object", properties: { requestId: { type: "string" }, assignedTruck: { type: "string" }, eta: { type: "string" } } } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setOptimizedRoutes(data);
      toast.success('تم تحسين المسارات بنجاح');
    }
  });

  // Real-time route refinement with AI
  useEffect(() => {
    if (isRealtime) {
      const interval = setInterval(() => {
        // Simulate real-time condition changes
        const newAlert = {
          id: Date.now(),
          type: Math.random() > 0.7 ? 'delay' : 'update',
          message: Math.random() > 0.5 ? 'تغير في حركة المرور - شارع الملك فهد' : 'حاوية BIN-004 وصلت 95%',
          time: new Date().toLocaleTimeString('ar-SA'),
          severity: Math.random() > 0.8 ? 'high' : 'medium'
        };
        setRealTimeAlerts(prev => [newAlert, ...prev].slice(0, 5));
        
        if (optimizedRoutes && optimizationSettings.dynamicRerouting) {
          toast.info('تحديث تلقائي للمسارات...', { duration: 1500 });
        }
      }, 20000);
      return () => clearInterval(interval);
    }
  }, [isRealtime, optimizedRoutes, optimizationSettings.dynamicRerouting]);

  // Auto dispatch when routes are optimized
  useEffect(() => {
    if (optimizationSettings.autoDispatch && optimizedRoutes?.routes) {
      const autoDispatch = setTimeout(() => {
        const newDispatches = optimizedRoutes.routes.map(r => ({
          ...r,
          dispatchTime: new Date().toLocaleTimeString('ar-SA'),
          status: 'dispatched'
        }));
        setDispatchedTrucks(newDispatches);
        toast.success(`تم إرسال ${newDispatches.length} شاحنات تلقائياً`);
      }, 2000);
      return () => clearTimeout(autoDispatch);
    }
  }, [optimizedRoutes, optimizationSettings.autoDispatch]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'amber';
      default: return 'green';
    }
  };

  const totalFuelSaved = fuelSavingsHistory.reduce((s, d) => s + (d.original - d.optimized), 0);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Route className="w-5 h-5 text-cyan-400" />
          تحسين المسارات الذكي
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-1">
            <Label className="text-slate-400 text-sm">تحديث مباشر</Label>
            <Switch checked={isRealtime} onCheckedChange={setIsRealtime} />
            {isRealtime && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          </div>
          <Button variant="outline" className="border-purple-500 text-purple-400" onClick={() => analyzeRequestsProactively.mutate()} disabled={analyzeRequestsProactively.isPending}>
            {analyzeRequestsProactively.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Bell className="w-4 h-4 ml-2" />}
            تحليل استباقي
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => optimizeRoutes.mutate()} disabled={optimizeRoutes.isPending}>
            {optimizeRoutes.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
            تحسين المسارات
          </Button>
        </div>
      </div>

      {/* Current Conditions - Real-time */}
      <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Navigation className={`w-5 h-5 ${realTimeConditions.trafficLevel > 70 ? 'text-red-400' : realTimeConditions.trafficLevel > 40 ? 'text-amber-400' : 'text-green-400'}`} />
                <div>
                  <p className="text-white font-medium">المرور</p>
                  <p className="text-slate-400 text-sm">{realTimeConditions.traffic} ({Math.round(realTimeConditions.trafficLevel)}%)</p>
                  <Progress value={realTimeConditions.trafficLevel} className="h-1 w-20 mt-1" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThermometerSun className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-white font-medium">{realTimeConditions.temperature}°C</p>
                  <p className="text-slate-400 text-sm">{realTimeConditions.weather}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-white font-medium">{realTimeConditions.windSpeed} كم/س</p>
                  <p className="text-slate-400 text-sm">الرياح</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-white font-medium">{realTimeConditions.rainProbability}%</p>
                  <p className="text-slate-400 text-sm">احتمال المطر</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-slate-500 text-xs">تحديث: {realTimeConditions.lastUpdated}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Optimization Settings */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-400" />
              إعدادات التحسين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { key: 'considerTraffic', label: 'مراعاة حركة المرور', icon: Navigation },
                { key: 'considerWeather', label: 'مراعاة الطقس', icon: CloudRain },
                { key: 'prioritizeFull', label: 'أولوية الحاويات الممتلئة', icon: AlertTriangle },
                { key: 'minimizeFuel', label: 'تقليل استهلاك الوقود', icon: Fuel },
                { key: 'dynamicRerouting', label: 'إعادة توجيه ديناميكي', icon: Route },
                { key: 'balanceLoad', label: 'توازن الحمولة', icon: Truck },
                { key: 'useHistoricalData', label: 'التعلم من البيانات', icon: Brain },
                { key: 'autoDispatch', label: 'إرسال تلقائي', icon: Zap },
              ].map(setting => (
                <div key={setting.key} className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                  <Label className="text-slate-300 text-sm flex items-center gap-2">
                    <setting.icon className="w-4 h-4 text-slate-500" />
                    {setting.label}
                  </Label>
                  <Switch
                    checked={optimizationSettings[setting.key]}
                    onCheckedChange={(v) => setOptimizationSettings({ ...optimizationSettings, [setting.key]: v })}
                  />
                </div>
              ))}
              
              <div className="p-3 bg-slate-800/30 rounded">
                <Label className="text-slate-400 text-xs mb-2 block">أولوية توفير الوقود: {fuelPriority[0]}%</Label>
                <Slider value={fuelPriority} onValueChange={setFuelPriority} max={100} step={10} className="mt-2" />
              </div>

              {/* AI Learning Stats */}
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-purple-400 text-xs font-medium mb-2 flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  إحصائيات التعلم الآلي
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-slate-500">نقاط البيانات:</span> <span className="text-white">{aiLearningStats.dataPoints.toLocaleString()}</span></div>
                  <div><span className="text-slate-500">الدقة:</span> <span className="text-green-400">{aiLearningStats.accuracy}%</span></div>
                  <div><span className="text-slate-500">آخر تدريب:</span> <span className="text-white">{aiLearningStats.lastTrained}</span></div>
                  <div><span className="text-slate-500">تحسن:</span> <span className="text-cyan-400">{aiLearningStats.improvements}</span></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority Bins & Citizen Requests */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                الحاويات والطلبات
              </CardTitle>
              <div className="flex items-center gap-2">
                <Label className="text-slate-400 text-xs">دمج الطلبات</Label>
                <Switch checked={includeRequests} onCheckedChange={setIncludeRequests} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              <div className="space-y-2">
                {/* Priority Bins */}
                {priorityBins.map(bin => (
                  <div key={bin.id} className={`p-3 rounded-lg bg-${getPriorityColor(bin.priority)}-500/10 border border-${getPriorityColor(bin.priority)}-500/30`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-white font-medium text-sm">{bin.id}</p>
                        <p className="text-slate-400 text-xs">{bin.location}</p>
                      </div>
                      <Badge className={`bg-${getPriorityColor(bin.priority)}-500/20 text-${getPriorityColor(bin.priority)}-400`}>
                        {bin.priority === 'critical' ? 'حرج' : bin.priority === 'high' ? 'عالي' : 'متوسط'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Progress value={bin.fillLevel} className="flex-1 h-2 ml-2" />
                      <span className={`text-sm font-bold text-${getPriorityColor(bin.priority)}-400`}>{bin.fillLevel}%</span>
                    </div>
                  </div>
                ))}

                {/* Citizen Requests */}
                {includeRequests && citizenRequestsState.filter(r => r.status === 'pending').map(req => (
                  <div key={req.id} className={`p-3 rounded-lg ${req.type === 'bulk' ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-cyan-500/10 border border-cyan-500/30'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {req.type === 'bulk' ? <Package className="w-4 h-4 text-purple-400" /> : <FileText className="w-4 h-4 text-cyan-400" />}
                        <p className="text-white font-medium text-sm">{req.id}</p>
                      </div>
                      <Badge className={req.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-slate-600 text-slate-300'}>
                        {req.type === 'bulk' ? 'جمع ضخم' : 'بلاغ'}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-xs">{req.location}</p>
                    <p className="text-slate-500 text-xs">{req.description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Fuel Savings */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Fuel className="w-4 h-4 text-green-400" />
              توفير الوقود
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-green-400">{totalFuelSaved}</p>
              <p className="text-slate-400 text-sm">لتر تم توفيره هذا الأسبوع</p>
              <Badge className="mt-2 bg-green-500/20 text-green-400">
                <TrendingDown className="w-3 h-3 ml-1" />
                -23% من الاستهلاك
              </Badge>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fuelSavingsHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="original" stroke="#ef4444" strokeWidth={2} name="قبل التحسين" />
                  <Line type="monotone" dataKey="optimized" stroke="#22c55e" strokeWidth={2} name="بعد التحسين" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimized Routes Result */}
      {optimizedRoutes && (
        <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                المسارات المحسنة
              </CardTitle>
              <Badge className="bg-cyan-500/20 text-cyan-400">
                <Target className="w-3 h-3 ml-1" />
                كفاءة {optimizedRoutes.optimizationScore || 92}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Savings Summary */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                <Fuel className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{optimizedRoutes.totalSavings?.fuel || 25} لتر</p>
                <p className="text-green-400 text-xs">توفير الوقود</p>
              </div>
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-center">
                <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{optimizedRoutes.totalSavings?.time || '45 دقيقة'}</p>
                <p className="text-cyan-400 text-xs">توفير الوقت</p>
              </div>
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
                <MapPin className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{optimizedRoutes.totalSavings?.distance || 12} كم</p>
                <p className="text-purple-400 text-xs">توفير المسافة</p>
              </div>
            </div>

            {/* Routes */}
            <div className="space-y-3">
              {optimizedRoutes.routes?.map((route, i) => (
                <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-cyan-400" />
                      <p className="text-white font-medium">{route.truckId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-slate-700">{route.stops?.length || 0} محطة</Badge>
                      <Badge className="bg-green-500/20 text-green-400">{route.estimatedTime}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {route.stops?.slice(0, 5).map((stop, j) => (
                      <div key={j} className="flex items-center">
                        <div className={`px-2 py-1 rounded text-xs ${stop.priority === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                          {stop.binId}
                        </div>
                        {j < (route.stops?.length || 0) - 1 && <span className="text-slate-600 mx-1">→</span>}
                      </div>
                    ))}
                    {(route.stops?.length || 0) > 5 && <span className="text-slate-500">+{(route.stops?.length || 0) - 5}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Alerts */}
            {optimizedRoutes.alerts?.length > 0 && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-amber-400 font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  تنبيهات
                </p>
                {optimizedRoutes.alerts.map((alert, i) => (
                  <p key={i} className="text-white text-sm">• {alert.message}</p>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {optimizedRoutes.recommendations?.length > 0 && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 font-medium mb-2">التوصيات</p>
                <ul className="space-y-1">
                  {optimizedRoutes.recommendations.map((rec, i) => (
                    <li key={i} className="text-white text-sm flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Predicted Delays */}
            {optimizedRoutes.predictedDelays?.length > 0 && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  تأخيرات متوقعة
                </p>
                {optimizedRoutes.predictedDelays.map((delay, i) => (
                  <div key={i} className="flex items-center justify-between text-sm mb-1">
                    <span className="text-white">{delay.location}</span>
                    <span className="text-red-400">+{delay.delayMinutes} دقيقة</span>
                  </div>
                ))}
              </div>
            )}

            {/* Auto Dispatch */}
            {dispatchedTrucks.length > 0 && (
              <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <p className="text-cyan-400 font-medium mb-2 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  الشاحنات المُرسلة
                </p>
                <div className="space-y-2">
                  {dispatchedTrucks.map((truck, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded p-2">
                      <span className="text-white text-sm">{truck.truckId}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs">{truck.dispatchTime}</span>
                        <Badge className="bg-green-500/20 text-green-400 text-xs">مُرسل</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Proactive Analysis Results */}
      {proactiveAnalysis && (
        <Card className="glass-card border-purple-500/30 bg-purple-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              نتائج التحليل الاستباقي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Request Priorities */}
              {proactiveAnalysis.requestPriorities?.length > 0 && (
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-2">أولويات الطلبات المحسوبة</p>
                  <div className="space-y-2">
                    {proactiveAnalysis.requestPriorities.map((req, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                        <span className="text-white text-sm">{req.requestId}</span>
                        <div className="flex items-center gap-2">
                          <Badge className={req.calculatedPriority === 'critical' ? 'bg-red-500/20 text-red-400' : req.calculatedPriority === 'high' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}>
                            {req.calculatedPriority === 'critical' ? 'حرج' : req.calculatedPriority === 'high' ? 'عالي' : 'متوسط'}
                          </Badge>
                          <span className="text-cyan-400 text-xs">{req.priorityScore}/100</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Route Modifications */}
              {proactiveAnalysis.routeModifications?.length > 0 && (
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                  <p className="text-cyan-400 text-xs mb-2">تعديلات المسارات المقترحة</p>
                  <div className="space-y-2">
                    {proactiveAnalysis.routeModifications.map((mod, i) => (
                      <div key={i} className="p-2 bg-slate-900/50 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-sm">{mod.truckId}</span>
                          <Badge className="bg-purple-500/20 text-purple-400">{mod.requestId}</Badge>
                        </div>
                        <p className="text-slate-400 text-xs">{mod.action}</p>
                        <p className="text-slate-500 text-xs">+{mod.additionalTime} | +{mod.additionalDistance}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Driver Alerts */}
            {proactiveAnalysis.driverAlerts?.length > 0 && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-amber-400 text-xs mb-2 flex items-center gap-1">
                  <Bell className="w-3 h-3" />
                  تنبيهات للسائقين
                </p>
                <div className="space-y-2">
                  {proactiveAnalysis.driverAlerts.map((alert, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                      <div className="flex-1">
                        <span className="text-white text-sm">{alert.truckId}: </span>
                        <span className="text-slate-400 text-sm">{alert.message}</span>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-cyan-400" onClick={() => sendDriverNotification(alert)}>
                        <Send className="w-3 h-3 ml-1" />
                        إرسال
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Impact Analysis */}
            {proactiveAnalysis.impactAnalysis && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="p-2 bg-slate-800/50 rounded text-center">
                  <p className="text-white font-bold">{proactiveAnalysis.impactAnalysis.totalAdditionalTime}</p>
                  <p className="text-slate-500 text-xs">الوقت الإضافي</p>
                </div>
                <div className="p-2 bg-slate-800/50 rounded text-center">
                  <p className="text-white font-bold">{proactiveAnalysis.impactAnalysis.affectedRoutes}</p>
                  <p className="text-slate-500 text-xs">مسارات متأثرة</p>
                </div>
                <div className="p-2 bg-slate-800/50 rounded text-center">
                  <p className="text-white font-bold">{proactiveAnalysis.impactAnalysis.efficiencyImpact}</p>
                  <p className="text-slate-500 text-xs">تأثير الكفاءة</p>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {proactiveAnalysis.recommendations?.length > 0 && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 text-xs mb-2">التوصيات</p>
                <ul className="space-y-1">
                  {proactiveAnalysis.recommendations.map((rec, i) => (
                    <li key={i} className="text-white text-sm flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Real-Time Alerts */}
      {isRealtime && realTimeAlerts.length > 0 && (
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
              تنبيهات الوقت الحقيقي
              <Badge className="bg-amber-500/20 text-amber-400">{realTimeAlerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {realTimeAlerts.map((alert) => (
                  <div key={alert.id} className={`p-2 rounded-lg flex items-center justify-between ${alert.severity === 'high' ? 'bg-red-500/10 border border-red-500/30' : 'bg-slate-800/50'}`}>
                    <div className="flex items-center gap-2">
                      {alert.type === 'delay' ? <Clock className="w-4 h-4 text-red-400" /> : <RefreshCw className="w-4 h-4 text-cyan-400" />}
                      <span className="text-white text-sm">{alert.message}</span>
                    </div>
                    <span className="text-slate-500 text-xs">{alert.time}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}