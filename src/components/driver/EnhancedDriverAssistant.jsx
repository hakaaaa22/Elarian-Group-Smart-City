import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Mic, MicOff, Navigation, AlertTriangle, Truck, Fuel, Gauge, Battery,
  Thermometer, Clock, MapPin, CheckCircle, Send, RefreshCw, Volume2, VolumeX,
  Route, Wrench, Bell, Radio, Phone, Eye, TrendingUp, Zap, Activity,
  AlertOctagon, Settings, Play, Pause, ChevronRight, MessageSquare, Award,
  GraduationCap, BarChart3, Target, Brain, History, Star, Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// حالة الشاحنة الحالية
const currentTruckStatus = {
  id: 'TRK-001',
  plate: 'أ ب ج 1234',
  driver: 'محمد أحمد',
  status: 'collecting',
  speed: 45,
  fuel: 72,
  capacity: 65,
  route: 'المسار A - المنطقة التجارية',
  completedStops: 8,
  totalStops: 15,
  eta: '14:30',
  location: 'شارع الملك فهد',
  health: { engine: 92, tires: 85, brakes: 88, battery: 95, oil: 78 },
  canbus: { rpm: 1800, engineTemp: 88, oilPressure: 42, batteryVoltage: 13.8 }
};

// بيانات القيادة التاريخية
const drivingHistory = {
  totalTrips: 245,
  totalDistance: 18500,
  avgSpeed: 42,
  fuelEfficiency: 8.2,
  safetyScore: 87,
  onTimeDelivery: 94,
  customerRating: 4.6,
  incidents: 2,
  violations: { speeding: 3, harshBraking: 8, harshAcceleration: 5 },
  monthlyPerformance: [
    { month: 'سبتمبر', score: 82, trips: 38, fuel: 8.5 },
    { month: 'أكتوبر', score: 85, trips: 42, fuel: 8.3 },
    { month: 'نوفمبر', score: 87, trips: 45, fuel: 8.1 },
    { month: 'ديسمبر', score: 89, trips: 40, fuel: 8.0 },
  ]
};

// برامج التدريب المقترحة
const trainingPrograms = [
  { id: 1, title: 'القيادة الاقتصادية', duration: '2 ساعة', priority: 'high', reason: 'تحسين كفاءة الوقود', progress: 0 },
  { id: 2, title: 'السلامة على الطريق', duration: '1.5 ساعة', priority: 'medium', reason: 'تقليل الفرملة القوية', progress: 45 },
  { id: 3, title: 'خدمة العملاء', duration: '1 ساعة', priority: 'low', reason: 'رفع تقييم العملاء', progress: 100 },
];

// تنبيهات الصيانة التنبؤية
const predictiveAlerts = [
  { id: 1, type: 'engine', severity: 'warning', title: 'حرارة المحرك مرتفعة', description: 'درجة الحرارة أعلى من المعتاد بـ 8%', action: 'تقليل السرعة والتوقف عند أقرب محطة', eta: '2 ساعة' },
  { id: 2, type: 'tires', severity: 'info', title: 'ضغط الإطارات', description: 'الإطار الأمامي الأيمن يحتاج فحص', action: 'فحص الإطار عند التوقف القادم', eta: '24 ساعة' },
  { id: 3, type: 'fuel', severity: 'warning', title: 'مستوى الوقود', description: 'الوقود سينفد خلال 45 دقيقة', action: 'التزود من أقرب محطة', eta: '45 دقيقة' },
];

// تحديثات المرور
const trafficUpdates = [
  { id: 1, location: 'تقاطع العليا', status: 'congested', delay: '15 دقيقة', suggestion: 'استخدم طريق الملك عبدالله البديل' },
  { id: 2, location: 'الدائري الشرقي', status: 'accident', delay: '25 دقيقة', suggestion: 'تجنب المنطقة - حادث مروري' },
];

// إعدادات التعرف الصوتي المتقدمة
const voiceSettings = {
  dialects: ['سعودي', 'مصري', 'شامي', 'خليجي'],
  noiseReduction: true,
  sensitivity: 75,
  confirmCommands: true
};

export default function EnhancedDriverAssistant() {
  const [activeTab, setActiveTab] = useState('assistant');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'مرحباً! أنا مساعدك الذكي. يمكنني مساعدتك في تحسين المسار، تنبيهات الصيانة، وأي استفسارات أخرى. استخدم الأوامر الصوتية أو اكتب رسالتك.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [truckStatus, setTruckStatus] = useState(currentTruckStatus);
  const [routeOptimization, setRouteOptimization] = useState(null);
  const [dashboardConnected, setDashboardConnected] = useState(true);
  const [autoRouteUpdate, setAutoRouteUpdate] = useState(true);
  const [selectedDialect, setSelectedDialect] = useState('سعودي');
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [driverAnalysis, setDriverAnalysis] = useState(null);
  const [dashboardAlerts, setDashboardAlerts] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // محاكاة تحديثات الوقت الفعلي
  useEffect(() => {
    const interval = setInterval(() => {
      setTruckStatus(prev => ({
        ...prev,
        speed: Math.max(0, Math.min(80, prev.speed + (Math.random() - 0.5) * 10)),
        canbus: {
          ...prev.canbus,
          rpm: Math.max(800, Math.min(3000, prev.canbus.rpm + (Math.random() - 0.5) * 200)),
          engineTemp: Math.max(70, Math.min(100, prev.canbus.engineTemp + (Math.random() - 0.5) * 2))
        }
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // تحليل بيانات القيادة التاريخية
  const analyzeDriverPerformance = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في تقييم أداء السائقين وتطوير مهاراتهم، قم بتحليل البيانات التالية:

بيانات السائق: ${truckStatus.driver}
- إجمالي الرحلات: ${drivingHistory.totalTrips}
- المسافة الإجمالية: ${drivingHistory.totalDistance} كم
- متوسط السرعة: ${drivingHistory.avgSpeed} كم/س
- كفاءة الوقود: ${drivingHistory.fuelEfficiency} كم/لتر
- درجة السلامة: ${drivingHistory.safetyScore}%
- نسبة التسليم في الوقت: ${drivingHistory.onTimeDelivery}%
- تقييم العملاء: ${drivingHistory.customerRating}/5
- الحوادث: ${drivingHistory.incidents}
- مخالفات السرعة: ${drivingHistory.violations.speeding}
- الفرملة القوية: ${drivingHistory.violations.harshBraking}
- التسارع القوي: ${drivingHistory.violations.harshAcceleration}

الأداء الشهري:
${drivingHistory.monthlyPerformance.map(m => `${m.month}: درجة ${m.score}, رحلات ${m.trips}, وقود ${m.fuel}`).join('\n')}

قدم:
1. تقييم شامل للسائق (درجة من 100)
2. نقاط القوة
3. نقاط التحسين
4. برامج تدريب مخصصة مع الأولوية
5. أهداف قابلة للقياس للشهر القادم
6. مقارنة بمتوسط السائقين`,
        response_json_schema: {
          type: "object",
          properties: {
            overallScore: { type: "number" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            trainingPrograms: { type: "array", items: { type: "object", properties: { title: { type: "string" }, duration: { type: "string" }, priority: { type: "string" }, reason: { type: "string" } } } },
            monthlyGoals: { type: "array", items: { type: "object", properties: { goal: { type: "string" }, target: { type: "string" }, metric: { type: "string" } } } },
            comparison: { type: "object", properties: { vsAverage: { type: "string" }, percentile: { type: "number" }, rank: { type: "string" } } },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setDriverAnalysis(data);
      toast.success('تم تحليل أداء السائق');
    }
  });

  // معالجة الأوامر الصوتية المتقدمة
  const processVoiceCommand = useMutation({
    mutationFn: async (command) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كمساعد ذكي لسائق شاحنة جمع النفايات مع دعم لهجات متعددة وتصفية الضوضاء:

الأمر الصوتي: "${command}"
اللهجة المحددة: ${selectedDialect}
تصفية الضوضاء: ${noiseReduction ? 'مفعّلة' : 'معطلة'}

حالة الشاحنة:
- السرعة: ${truckStatus.speed} كم/س
- الوقود: ${truckStatus.fuel}%
- السعة: ${truckStatus.capacity}%
- المحطات: ${truckStatus.completedStops}/${truckStatus.totalStops}
- الموقع: ${truckStatus.location}

تحديثات المرور:
${trafficUpdates.map(t => `- ${t.location}: ${t.status} (تأخير ${t.delay})`).join('\n')}

تنبيهات الصيانة:
${predictiveAlerts.map(a => `- ${a.title}: ${a.description}`).join('\n')}

قم بـ:
1. فهم الأمر حتى لو كان بلهجة مختلفة أو مع ضوضاء
2. تقديم رد مختصر ومفيد
3. اقتراح إجراء إن وجد
4. تحديد ما إذا كان يجب إرسال تنبيه للوحة التحكم المركزية
5. تحديد مستوى الثقة في فهم الأمر`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            action: { type: "string" },
            confidence: { type: "number" },
            detectedDialect: { type: "string" },
            routeChange: { type: "object", properties: { needed: { type: "boolean" }, newRoute: { type: "string" }, reason: { type: "string" }, savedTime: { type: "string" } } },
            dashboardAlert: { type: "object", properties: { send: { type: "boolean" }, message: { type: "string" }, priority: { type: "string" }, category: { type: "string" } } },
            voiceResponse: { type: "string" },
            alternativeInterpretations: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data, variables) => {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: variables },
        { role: 'assistant', content: data.response, routeChange: data.routeChange, action: data.action, confidence: data.confidence }
      ]);
      
      // إرسال للوحة التحكم المركزية
      if (data.dashboardAlert?.send && dashboardConnected) {
        const newAlert = {
          id: Date.now(),
          ...data.dashboardAlert,
          time: new Date().toLocaleTimeString('ar-SA'),
          driver: truckStatus.driver,
          truck: truckStatus.id
        };
        setDashboardAlerts(prev => [newAlert, ...prev]);
        toast.success(`تم إرسال تنبيه للمركز: ${data.dashboardAlert.message}`);
      }
      
      if (data.routeChange?.needed && autoRouteUpdate) {
        setRouteOptimization(data.routeChange);
        toast.info(`تم تحديث المسار: ${data.routeChange.reason}`);
      }

      if (isSpeaking && data.voiceResponse) {
        speakResponse(data.voiceResponse);
      }
    }
  });

  // تحسين المسار الذكي
  const optimizeRoute = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كنظام تحسين مسارات ذكي مع إرسال تحديثات للوحة التحكم المركزية:

حالة الشاحنة:
- الموقع: ${truckStatus.location}
- المحطات المتبقية: ${truckStatus.totalStops - truckStatus.completedStops}
- السعة: ${truckStatus.capacity}%
- الوقود: ${truckStatus.fuel}%

حالة المرور:
${trafficUpdates.map(t => `- ${t.location}: ${t.status}`).join('\n')}

المطلوب:
1. ترتيب المحطات الأمثل
2. تجنب مناطق الازدحام
3. تقدير الوقت الموفر
4. توصيات للسائق
5. تنبيه للوحة التحكم المركزية بالتغييرات`,
        response_json_schema: {
          type: "object",
          properties: {
            optimizedStops: { type: "array", items: { type: "object", properties: { order: { type: "number" }, location: { type: "string" }, eta: { type: "string" }, priority: { type: "string" } } } },
            avoidedAreas: { type: "array", items: { type: "string" } },
            timeSaved: { type: "string" },
            fuelSaved: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } },
            newETA: { type: "string" },
            dashboardNotification: { type: "object", properties: { message: { type: "string" }, changes: { type: "array", items: { type: "string" } } } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setRouteOptimization(data);
      toast.success(`تم تحسين المسار - توفير ${data.timeSaved || '15 دقيقة'}`);
      
      if (data.dashboardNotification && dashboardConnected) {
        const newAlert = {
          id: Date.now(),
          message: data.dashboardNotification.message,
          priority: 'info',
          category: 'route_optimization',
          time: new Date().toLocaleTimeString('ar-SA'),
          driver: truckStatus.driver,
          truck: truckStatus.id
        };
        setDashboardAlerts(prev => [newAlert, ...prev]);
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `تم تحسين المسار! التوفير المتوقع: ${data.timeSaved || '15 دقيقة'} وقت، ${data.fuelSaved || '3 لتر'} وقود. الوصول المتوقع: ${data.newETA || '14:15'}`,
        routeChange: { needed: true, savedTime: data.timeSaved }
      }]);
    }
  });

  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      toast.info('تم إيقاف الاستماع');
    } else {
      setIsListening(true);
      toast.success(`جاري الاستماع (${selectedDialect})... تحدث الآن`);
      setTimeout(() => {
        const sampleCommands = ['تحديث المسار', 'حالة الشاحنة', 'أقرب محطة وقود', 'إبلاغ عن مشكلة'];
        const randomCommand = sampleCommands[Math.floor(Math.random() * sampleCommands.length)];
        processVoiceCommand.mutate(randomCommand);
        setIsListening(false);
      }, 3000);
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    processVoiceCommand.mutate(inputText);
    setInputText('');
  };

  const sendToDashboard = (message, priority = 'medium') => {
    const newAlert = {
      id: Date.now(),
      message,
      priority,
      category: 'manual',
      time: new Date().toLocaleTimeString('ar-SA'),
      driver: truckStatus.driver,
      truck: truckStatus.id
    };
    setDashboardAlerts(prev => [newAlert, ...prev]);
    toast.success(`تم إرسال للمركز: ${message}`);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'warning': return 'amber';
      default: return 'blue';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Navigation className="w-5 h-5 text-cyan-400" />
          مساعد السائق الذكي المتقدم
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-1">
            <div className={`w-2 h-2 rounded-full ${dashboardConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-slate-400 text-sm">المركز</span>
          </div>
          <Badge className="bg-purple-500/20 text-purple-400">{dashboardAlerts.length} تنبيه</Badge>
          <Button variant="outline" className={`border-slate-600 ${isSpeaking ? 'text-cyan-400' : 'text-slate-500'}`} size="sm" onClick={() => setIsSpeaking(!isSpeaking)}>
            {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button className={`${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'}`} onClick={toggleVoice}>
            {isListening ? <MicOff className="w-4 h-4 ml-2" /> : <Mic className="w-4 h-4 ml-2" />}
            {isListening ? 'إيقاف' : 'صوتي'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="assistant" className="data-[state=active]:bg-cyan-500/20">
            <MessageSquare className="w-4 h-4 ml-1" />
            المساعد
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-purple-500/20">
            <BarChart3 className="w-4 h-4 ml-1" />
            الأداء
          </TabsTrigger>
          <TabsTrigger value="training" className="data-[state=active]:bg-green-500/20">
            <GraduationCap className="w-4 h-4 ml-1" />
            التدريب
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-amber-500/20">
            <Settings className="w-4 h-4 ml-1" />
            الإعدادات
          </TabsTrigger>
        </TabsList>

        {/* Assistant Tab */}
        <TabsContent value="assistant" className="mt-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Truck Status Panel */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4 text-green-400" />
                  حالة الشاحنة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-slate-800/50 rounded text-center">
                      <Gauge className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-white">{Math.round(truckStatus.speed)}</p>
                      <p className="text-slate-500 text-xs">كم/س</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded text-center">
                      <Fuel className={`w-4 h-4 mx-auto mb-1 ${truckStatus.fuel < 30 ? 'text-red-400' : 'text-amber-400'}`} />
                      <p className="text-lg font-bold text-white">{truckStatus.fuel}%</p>
                      <p className="text-slate-500 text-xs">وقود</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded text-center">
                      <Activity className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-white">{truckStatus.capacity}%</p>
                      <p className="text-slate-500 text-xs">السعة</p>
                    </div>
                  </div>

                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-cyan-400 text-sm">{truckStatus.route}</span>
                      <span className="text-white text-sm">{truckStatus.completedStops}/{truckStatus.totalStops}</span>
                    </div>
                    <Progress value={(truckStatus.completedStops / truckStatus.totalStops) * 100} className="h-2" />
                    <p className="text-slate-400 text-xs mt-1">الوصول المتوقع: {truckStatus.eta}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-slate-400 text-xs">صحة المركبة</p>
                    {Object.entries(truckStatus.health).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs w-16">{key === 'engine' ? 'المحرك' : key === 'tires' ? 'الإطارات' : key === 'brakes' ? 'الفرامل' : key === 'battery' ? 'البطارية' : 'الزيت'}</span>
                        <Progress value={value} className="flex-1 h-1.5" />
                        <span className={`text-xs ${value > 80 ? 'text-green-400' : value > 60 ? 'text-amber-400' : 'text-red-400'}`}>{value}%</span>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700" size="sm" onClick={() => optimizeRoute.mutate()} disabled={optimizeRoute.isPending}>
                    {optimizeRoute.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Route className="w-4 h-4 ml-2" />}
                    تحسين المسار
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <Card className="lg:col-span-2 glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    المحادثة الذكية
                  </CardTitle>
                  {isListening && (
                    <Badge className="bg-red-500/20 text-red-400 animate-pulse">
                      <Mic className="w-3 h-3 ml-1" />
                      جاري الاستماع ({selectedDialect})...
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] mb-3" ref={scrollRef}>
                  <div className="space-y-3 pr-2">
                    <AnimatePresence>
                      {messages.map((msg, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-cyan-500/20 text-white' : 'bg-slate-800/50 text-slate-300'}`}>
                            <p className="text-sm">{msg.content}</p>
                            {msg.confidence && <p className="text-slate-500 text-xs mt-1">دقة الفهم: {msg.confidence}%</p>}
                            {msg.routeChange?.needed && (
                              <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded">
                                <p className="text-green-400 text-xs flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  تم تحديث المسار - توفير {msg.routeChange.savedTime}
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {processVoiceCommand.isPending && (
                      <div className="flex justify-start">
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="اكتب أمراً أو سؤالاً..." className="bg-slate-800/50 border-slate-700 text-white" />
                  <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={handleSend} disabled={processVoiceCommand.isPending}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {['تحديث المسار', 'حالة الشاحنة', 'أقرب محطة وقود', 'إبلاغ عن مشكلة'].map(cmd => (
                    <Button key={cmd} size="sm" variant="outline" className="border-slate-600 text-slate-400 text-xs h-7" onClick={() => processVoiceCommand.mutate(cmd)}>
                      {cmd}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts Row */}
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass-card border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  تنبيهات الصيانة التنبؤية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {predictiveAlerts.map(alert => (
                    <div key={alert.id} className={`p-3 rounded-lg bg-${getSeverityColor(alert.severity)}-500/10 border border-${getSeverityColor(alert.severity)}-500/30`}>
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-4 h-4 text-${getSeverityColor(alert.severity)}-400`} />
                          <span className="text-white text-sm font-medium">{alert.title}</span>
                        </div>
                        <Badge className={`bg-${getSeverityColor(alert.severity)}-500/20 text-${getSeverityColor(alert.severity)}-400 text-xs`}>{alert.eta}</Badge>
                      </div>
                      <p className="text-slate-400 text-xs mb-2">{alert.description}</p>
                      <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded">
                        <ChevronRight className="w-3 h-3 text-cyan-400" />
                        <span className="text-cyan-400 text-xs">{alert.action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dashboard Connection */}
            <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Radio className="w-4 h-4 text-green-400" />
                  اتصال لوحة التحكم المركزية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white font-medium">{dashboardConnected ? 'متصل' : 'غير متصل'}</p>
                    <p className="text-slate-400 text-xs">{dashboardAlerts.length} تنبيهات مُرسلة</p>
                  </div>
                  <Switch checked={dashboardConnected} onCheckedChange={setDashboardConnected} />
                </div>
                
                {dashboardAlerts.length > 0 && (
                  <ScrollArea className="h-[100px]">
                    <div className="space-y-2">
                      {dashboardAlerts.slice(0, 3).map(alert => (
                        <div key={alert.id} className="p-2 bg-slate-800/50 rounded flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-white text-xs">{alert.message}</p>
                            <p className="text-slate-500 text-xs">{alert.time}</p>
                          </div>
                          <Badge className={`text-xs ${alert.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                            {alert.priority === 'high' ? 'عالي' : 'معلومات'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}

                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-slate-400" onClick={() => sendToDashboard('طلب مساعدة', 'high')}>
                    <Phone className="w-4 h-4 ml-1" />
                    طلب مساعدة
                  </Button>
                  <Button size="sm" className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={() => sendToDashboard('تقرير حالة الشاحنة', 'low')}>
                    <Send className="w-4 h-4 ml-1" />
                    إرسال تقرير
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="mt-4">
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm">ملخص الأداء</CardTitle>
                  <Button size="sm" variant="outline" className="border-purple-500 text-purple-400" onClick={() => analyzeDriverPerformance.mutate()} disabled={analyzeDriverPerformance.isPending}>
                    {analyzeDriverPerformance.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="w-24 h-24 mx-auto rounded-full border-4 border-green-500 flex items-center justify-center mb-2">
                    <span className="text-3xl font-bold text-green-400">{driverAnalysis?.overallScore || drivingHistory.safetyScore}</span>
                  </div>
                  <p className="text-white font-medium">{truckStatus.driver}</p>
                  <p className="text-slate-400 text-xs">درجة الأداء الإجمالية</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-slate-800/50 rounded text-center">
                    <p className="text-lg font-bold text-cyan-400">{drivingHistory.totalTrips}</p>
                    <p className="text-slate-500 text-xs">رحلة</p>
                  </div>
                  <div className="p-2 bg-slate-800/50 rounded text-center">
                    <p className="text-lg font-bold text-green-400">{drivingHistory.onTimeDelivery}%</p>
                    <p className="text-slate-500 text-xs">في الوقت</p>
                  </div>
                  <div className="p-2 bg-slate-800/50 rounded text-center">
                    <p className="text-lg font-bold text-amber-400">{drivingHistory.fuelEfficiency}</p>
                    <p className="text-slate-500 text-xs">كم/لتر</p>
                  </div>
                  <div className="p-2 bg-slate-800/50 rounded text-center">
                    <p className="text-lg font-bold text-purple-400">{drivingHistory.customerRating}</p>
                    <p className="text-slate-500 text-xs">تقييم</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">تحليل AI للأداء</CardTitle>
              </CardHeader>
              <CardContent>
                {driverAnalysis ? (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-green-400 text-sm font-medium mb-2">نقاط القوة</p>
                        <ul className="space-y-1">
                          {driverAnalysis.strengths?.slice(0, 3).map((s, i) => (
                            <li key={i} className="text-white text-xs flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <p className="text-amber-400 text-sm font-medium mb-2">نقاط التحسين</p>
                        <ul className="space-y-1">
                          {driverAnalysis.improvements?.slice(0, 3).map((s, i) => (
                            <li key={i} className="text-white text-xs flex items-center gap-1">
                              <Target className="w-3 h-3 text-amber-400" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {driverAnalysis.comparison && (
                      <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <p className="text-purple-400 text-sm font-medium mb-2">مقارنة بالسائقين الآخرين</p>
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm">{driverAnalysis.comparison.vsAverage}</span>
                          <Badge className="bg-purple-500/20 text-purple-400">أفضل من {driverAnalysis.comparison.percentile}%</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">اضغط على زر التحليل الذكي للحصول على تقييم شامل</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-green-400" />
                  برامج التدريب المقترحة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(driverAnalysis?.trainingPrograms || trainingPrograms).map((program, i) => (
                    <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-white font-medium">{program.title}</p>
                          <p className="text-slate-400 text-xs">{program.duration} - {program.reason}</p>
                        </div>
                        <Badge className={program.priority === 'high' ? 'bg-red-500/20 text-red-400' : program.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}>
                          {program.priority === 'high' ? 'عالي' : program.priority === 'medium' ? 'متوسط' : 'منخفض'}
                        </Badge>
                      </div>
                      <Progress value={program.progress || 0} className="h-2" />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-slate-500 text-xs">{program.progress || 0}% مكتمل</span>
                        <Button size="sm" variant="ghost" className="h-6 text-cyan-400 text-xs">
                          {program.progress === 100 ? 'مكتمل' : program.progress > 0 ? 'متابعة' : 'بدء'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  أهداف الشهر القادم
                </CardTitle>
              </CardHeader>
              <CardContent>
                {driverAnalysis?.monthlyGoals ? (
                  <div className="space-y-3">
                    {driverAnalysis.monthlyGoals.map((goal, i) => (
                      <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-white font-medium">{goal.goal}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-slate-400 text-xs">{goal.metric}</span>
                          <Badge className="bg-cyan-500/20 text-cyan-400">{goal.target}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      { goal: 'تحسين كفاءة الوقود', target: '8.5 كم/لتر', current: '8.2' },
                      { goal: 'تقليل الفرملة القوية', target: '< 5 مرات/أسبوع', current: '8' },
                      { goal: 'رفع تقييم العملاء', target: '4.8/5', current: '4.6' },
                    ].map((goal, i) => (
                      <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-white font-medium">{goal.goal}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-slate-400 text-xs">الحالي: {goal.current}</span>
                          <Badge className="bg-cyan-500/20 text-cyan-400">الهدف: {goal.target}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Mic className="w-4 h-4 text-cyan-400" />
                  إعدادات التعرف الصوتي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-400 text-sm">اللهجة المفضلة</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {voiceSettings.dialects.map(dialect => (
                      <Button key={dialect} size="sm" variant={selectedDialect === dialect ? 'default' : 'outline'} className={selectedDialect === dialect ? 'bg-cyan-600' : 'border-slate-600 text-slate-400'} onClick={() => setSelectedDialect(dialect)}>
                        {dialect}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-white">تصفية الضوضاء</p>
                    <p className="text-slate-500 text-xs">تحسين التعرف في البيئات الصاخبة</p>
                  </div>
                  <Switch checked={noiseReduction} onCheckedChange={setNoiseReduction} />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-white">تأكيد الأوامر</p>
                    <p className="text-slate-500 text-xs">طلب تأكيد قبل تنفيذ الأوامر</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-white">الردود الصوتية</p>
                    <p className="text-slate-500 text-xs">تشغيل الردود بالصوت</p>
                  </div>
                  <Switch checked={isSpeaking} onCheckedChange={setIsSpeaking} />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Radio className="w-4 h-4 text-green-400" />
                  إعدادات الاتصال
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-white">الاتصال بلوحة التحكم</p>
                    <p className="text-slate-500 text-xs">إرسال التحديثات تلقائياً</p>
                  </div>
                  <Switch checked={dashboardConnected} onCheckedChange={setDashboardConnected} />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-white">تحديث المسار التلقائي</p>
                    <p className="text-slate-500 text-xs">تطبيق تحسينات المسار تلقائياً</p>
                  </div>
                  <Switch checked={autoRouteUpdate} onCheckedChange={setAutoRouteUpdate} />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-white">إشعارات الطوارئ</p>
                    <p className="text-slate-500 text-xs">استلام تنبيهات عاجلة من المركز</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <p className="text-green-400 font-medium">حالة الاتصال</p>
                  </div>
                  <p className="text-white text-sm">متصل بالمركز - زمن الاستجابة: 45ms</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}