import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Zap, Battery, BatteryCharging, TrendingDown, TrendingUp, DollarSign,
  Clock, AlertTriangle, Check, Target, Lightbulb, Thermometer, Tv,
  Settings, Play, Pause, RefreshCw, Download, BarChart3, PieChart,
  Sun, Moon, Calendar, ArrowDown, ArrowUp, Loader2, Brain, Leaf,
  Bell, BellRing, Activity, Sparkles, Calculator, Edit, Plus, Trash2,
  CloudSun, Wind, Droplets, Eye, ChevronRight, Info
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { toast } from 'sonner';

// Top Energy Consumers
const topConsumers = [
  { id: 1, name: 'المكيف', consumption: 4.5, percentage: 35, trend: 'up', icon: Thermometer, color: 'cyan' },
  { id: 2, name: 'السخان', consumption: 2.8, percentage: 22, trend: 'stable', icon: Zap, color: 'red' },
  { id: 3, name: 'الثلاجة', consumption: 1.5, percentage: 12, trend: 'down', icon: Zap, color: 'blue' },
  { id: 4, name: 'التلفاز', consumption: 1.2, percentage: 9, trend: 'up', icon: Tv, color: 'purple' },
  { id: 5, name: 'الإضاءة', consumption: 0.8, percentage: 6, trend: 'down', icon: Lightbulb, color: 'amber' },
];

// Battery Data
const batteryData = {
  level: 78,
  status: 'charging',
  capacity: 13.5,
  current: 10.5,
  chargingPower: 3.2,
  dischargingRate: 0,
  timeToFull: '2.5 ساعة',
  cycleCount: 245,
  health: 94,
  temperature: 28,
};

// Real-time Cost Data
const realTimeCost = [
  { time: '00:00', cost: 0.15, rate: 'منخفض' },
  { time: '04:00', cost: 0.12, rate: 'منخفض' },
  { time: '08:00', cost: 0.25, rate: 'عادي' },
  { time: '12:00', cost: 0.35, rate: 'مرتفع' },
  { time: '16:00', cost: 0.40, rate: 'ذروة' },
  { time: '20:00', cost: 0.35, rate: 'مرتفع' },
  { time: '23:00', cost: 0.20, rate: 'عادي' },
];

// Saving Plans
const savingPlans = [
  { id: 'eco', name: 'الوضع الاقتصادي', savings: '25%', impact: 'منخفض', active: true },
  { id: 'smart', name: 'التوفير الذكي', savings: '35%', impact: 'متوسط', active: false },
  { id: 'aggressive', name: 'التوفير المكثف', savings: '50%', impact: 'مرتفع', active: false },
];

// Forecast Data
const forecastData = [
  { time: '00:00', actual: 1.2, forecast: 1.3, historical: 1.4 },
  { time: '04:00', actual: 0.8, forecast: 0.9, historical: 1.0 },
  { time: '08:00', actual: 2.5, forecast: 2.8, historical: 2.6 },
  { time: '12:00', actual: 3.2, forecast: 3.5, historical: 3.4 },
  { time: '16:00', actual: 4.1, forecast: 4.8, historical: 4.3 },
  { time: '20:00', actual: 5.5, forecast: 5.2, historical: 5.8 },
  { time: '24:00', actual: null, forecast: 2.0, historical: 2.3 },
  { time: '28:00', actual: null, forecast: 1.5, historical: 1.8 },
  { time: '32:00', actual: null, forecast: 3.2, historical: 3.0 },
  { time: '36:00', actual: null, forecast: 4.5, historical: 4.2 },
  { time: '40:00', actual: null, forecast: 5.8, historical: 5.5 },
  { time: '44:00', actual: null, forecast: 3.0, historical: 3.2 },
];

// What-if scenarios - Enhanced
const whatIfScenarios = [
  { id: 's1', name: 'إيقاف المكيف ساعتين يومياً', savings: '18%', reduction: '2.8 kWh', feasibility: 'سهل', monthlySavings: '84 kWh', costSavings: '29.4 ر.س', comfortImpact: 'منخفض', automationRule: 'إيقاف المكيف 2-4 م', applied: false },
  { id: 's2', name: 'خفض درجة الحرارة 2°C', savings: '12%', reduction: '1.9 kWh', feasibility: 'سهل', monthlySavings: '57 kWh', costSavings: '19.95 ر.س', comfortImpact: 'منخفض', automationRule: 'ضبط المكيف على 24°C', applied: false },
  { id: 's3', name: 'تشغيل الغسالة ليلاً', savings: '8%', reduction: '0.6 kWh', feasibility: 'متوسط', monthlySavings: '18 kWh', costSavings: '6.3 ر.س', comfortImpact: 'لا يوجد', automationRule: 'تأخير الغسالة للساعة 11 م', applied: false },
  { id: 's4', name: 'استخدام الإضاءة الذكية', savings: '15%', reduction: '1.2 kWh', feasibility: 'سهل', monthlySavings: '36 kWh', costSavings: '12.6 ر.س', comfortImpact: 'لا يوجد', automationRule: 'خفض السطوع 30% ليلاً', applied: true },
  { id: 's5', name: 'إيقاف الأجهزة في وضع الاستعداد', savings: '5%', reduction: '0.4 kWh', feasibility: 'سهل', monthlySavings: '12 kWh', costSavings: '4.2 ر.س', comfortImpact: 'لا يوجد', automationRule: 'إيقاف الأجهزة عند عدم الاستخدام', applied: false },
  { id: 's6', name: 'تأخير السخان لأوقات منخفضة التعرفة', savings: '10%', reduction: '1.5 kWh', feasibility: 'متوسط', monthlySavings: '45 kWh', costSavings: '15.75 ر.س', comfortImpact: 'منخفض', automationRule: 'تشغيل السخان 5-7 ص', applied: false },
];

// Smart Goals
const defaultGoals = [
  { id: 'g1', name: 'هدف الاستهلاك اليومي', target: 15, unit: 'kWh', current: 12.5, type: 'daily', alertThreshold: 80, alertEnabled: true, alertTriggered: false },
  { id: 'g2', name: 'هدف التكلفة الشهرية', target: 500, unit: 'ر.س', current: 385, type: 'monthly', alertThreshold: 90, alertEnabled: true, alertTriggered: false },
  { id: 'g3', name: 'هدف التوفير الأسبوعي', target: 20, unit: '%', current: 18, type: 'weekly', alertThreshold: 50, alertEnabled: false, alertTriggered: false },
];

// Weather forecast for energy prediction
const weatherForecast = [
  { time: 'الآن', temp: 35, humidity: 45, condition: 'مشمس', icon: Sun },
  { time: '6 م', temp: 38, humidity: 40, condition: 'حار', icon: Sun },
  { time: '12 م غداً', temp: 40, humidity: 35, condition: 'حار جداً', icon: Sun },
  { time: '6 م غداً', temp: 36, humidity: 50, condition: 'مشمس', icon: CloudSun },
];

// Real-time consumption simulation
const generateRealtimeData = () => {
  const baseConsumption = 2.5;
  const variation = (Math.random() - 0.5) * 0.8;
  return Math.max(0.5, baseConsumption + variation);
};

export default function EnergyManagement({ devices = [] }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activePlan, setActivePlan] = useState('eco');
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [batteryMode, setBatteryMode] = useState('auto');
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showNewGoalDialog, setShowNewGoalDialog] = useState(false);
  const [showScenarioDialog, setShowScenarioDialog] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [goals, setGoals] = useState(defaultGoals);
  const [scenarios, setScenarios] = useState(whatIfScenarios);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({ name: '', target: 10, unit: 'kWh', type: 'daily', alertThreshold: 80, alertEnabled: true });
  
  // Real-time consumption
  const [realtimeConsumption, setRealtimeConsumption] = useState(2.8);
  const [consumptionHistory, setConsumptionHistory] = useState([]);

  const currentRate = 0.35;
  const currentCost = currentRate * realtimeConsumption;

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newConsumption = generateRealtimeData();
      setRealtimeConsumption(newConsumption);
      setConsumptionHistory(prev => {
        const newHistory = [...prev, { time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }), value: newConsumption }];
        return newHistory.slice(-20);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Check goal alerts
  useEffect(() => {
    setGoals(prev => prev.map(goal => {
      const progress = (goal.current / goal.target) * 100;
      if (goal.alertEnabled && progress >= goal.alertThreshold && !goal.alertTriggered) {
        toast.warning(`تنبيه: اقتربت من تجاوز ${goal.name}`);
        return { ...goal, alertTriggered: true };
      }
      return goal;
    }));
  }, []);

  // Calculate total potential savings from scenarios
  const potentialSavings = useMemo(() => {
    const unapplied = scenarios.filter(s => !s.applied);
    return {
      monthly: unapplied.reduce((sum, s) => sum + parseFloat(s.monthlySavings), 0),
      cost: unapplied.reduce((sum, s) => sum + parseFloat(s.costSavings), 0)
    };
  }, [scenarios]);

  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `بناءً على بيانات استهلاك الطاقة التالية:
        - أعلى المستهلكين: المكيف (35%), السخان (22%), الثلاجة (12%)
        - ساعات الذروة: 4-8 مساءً
        - متوسط الاستهلاك: 15.5 kWh/يوم
        - تكلفة الكهرباء: 0.35 ر.س/kWh
        
        اقترح خطة توفير طاقة مخصصة مع إجراءات محددة والتوفير المتوقع.`,
        response_json_schema: {
          type: 'object',
          properties: {
            planName: { type: 'string' },
            expectedSavings: { type: 'string' },
            actions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  device: { type: 'string' },
                  action: { type: 'string' },
                  timing: { type: 'string' },
                  savings: { type: 'string' }
                }
              }
            },
            tips: { type: 'array', items: { type: 'string' } }
          }
        }
      });
    },
    onSuccess: (data) => {
      toast.success('تم إنشاء خطة التوفير');
    },
    onError: () => toast.error('فشل في إنشاء الخطة')
  });

  const activatePlan = (planId) => {
    setActivePlan(planId);
    toast.success(`تم تفعيل ${savingPlans.find(p => p.id === planId)?.name}`);
  };

  const addGoal = () => {
    if (!newGoal.name || !newGoal.target) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    setGoals([...goals, { ...newGoal, id: `g${Date.now()}`, current: 0, alertTriggered: false }]);
    setShowNewGoalDialog(false);
    setNewGoal({ name: '', target: 10, unit: 'kWh', type: 'daily', alertThreshold: 80, alertEnabled: true });
    toast.success('تم إضافة الهدف');
  };

  const updateGoal = (goalId, updates) => {
    setGoals(goals.map(g => g.id === goalId ? { ...g, ...updates } : g));
    toast.success('تم تحديث الهدف');
  };

  const deleteGoal = (goalId) => {
    setGoals(goals.filter(g => g.id !== goalId));
    toast.success('تم حذف الهدف');
  };

  const applyScenario = (scenarioId) => {
    setScenarios(scenarios.map(s => s.id === scenarioId ? { ...s, applied: true } : s));
    toast.success('تم تطبيق السيناريو وإنشاء قاعدة الأتمتة');
  };

  const analyzeScenarioMutation = useMutation({
    mutationFn: async (scenario) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل سيناريو توفير الطاقة التالي بالتفصيل:
        
السيناريو: ${scenario.name}
التوفير المتوقع: ${scenario.savings}
التأثير على الراحة: ${scenario.comfortImpact}

قدم:
1. تحليل مفصل للتوفير الفعلي
2. الظروف المثالية لتطبيق السيناريو
3. المخاطر المحتملة
4. بدائل أفضل إن وجدت
5. تأثير الطقس على فعالية السيناريو`,
        response_json_schema: {
          type: 'object',
          properties: {
            detailedAnalysis: { type: 'string' },
            optimalConditions: { type: 'array', items: { type: 'string' } },
            risks: { type: 'array', items: { type: 'string' } },
            alternatives: { type: 'array', items: { type: 'string' } },
            weatherImpact: { type: 'string' },
            recommendedSchedule: { type: 'string' },
            actualSavingsRange: { type: 'string' }
          }
        }
      });
    },
    onSuccess: (data, scenario) => {
      setSelectedScenario({ ...scenario, analysis: data });
      setShowScenarioDialog(true);
    },
    onError: () => toast.error('فشل تحليل السيناريو')
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            إدارة الطاقة المتقدمة
          </h3>
          <p className="text-slate-400 text-sm">مراقبة وتحسين استهلاك الطاقة</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-slate-600"
            onClick={() => generatePlanMutation.mutate()}
            disabled={generatePlanMutation.isPending}
          >
            {generatePlanMutation.isPending ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
            خطة ذكية
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Leaf className="w-4 h-4 ml-2" />
            وضع التوفير
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <Badge className="bg-amber-500/20 text-amber-400 text-xs">مباشر</Badge>
            </div>
            <p className="text-2xl font-bold text-white">{currentConsumption} kW</p>
            <p className="text-slate-400 text-xs">الاستهلاك الحالي</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-green-500/30 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <Badge className={`text-xs ${currentRate > 0.30 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                {currentRate > 0.30 ? 'ذروة' : 'عادي'}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-white">{currentCost.toFixed(2)} ر.س</p>
            <p className="text-slate-400 text-xs">التكلفة/ساعة</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <BatteryCharging className="w-5 h-5 text-cyan-400" />
              <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">{batteryData.status === 'charging' ? 'شحن' : 'تفريغ'}</Badge>
            </div>
            <p className="text-2xl font-bold text-white">{batteryData.level}%</p>
            <p className="text-slate-400 text-xs">مستوى البطارية</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-500/30 bg-purple-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-5 h-5 text-purple-400" />
              <Badge className="bg-green-500/20 text-green-400 text-xs">-12%</Badge>
            </div>
            <p className="text-2xl font-bold text-white">18.5 ر.س</p>
            <p className="text-slate-400 text-xs">التوفير اليوم</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Activity className="w-3 h-3 ml-1" />
            لوحة التحكم
          </TabsTrigger>
          <TabsTrigger value="goals" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <Target className="w-3 h-3 ml-1" />
            الأهداف الذكية
          </TabsTrigger>
          <TabsTrigger value="forecast" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <TrendingUp className="w-3 h-3 ml-1" />
            التنبؤ
          </TabsTrigger>
          <TabsTrigger value="whatif" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
            <Calculator className="w-3 h-3 ml-1" />
            سيناريوهات ماذا لو
          </TabsTrigger>
          <TabsTrigger value="consumers" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
            المستهلكون
          </TabsTrigger>
          <TabsTrigger value="battery" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            البطارية
          </TabsTrigger>
          <TabsTrigger value="plans" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            خطط التوفير
          </TabsTrigger>
        </TabsList>

        {/* Interactive Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4 mt-4">
          {/* Real-time Consumption vs Forecast */}
          <Card className="glass-card border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  الاستهلاك في الوقت الفعلي مقارنة بالتنبؤ
                </div>
                <Badge className="bg-green-500/20 text-green-400 animate-pulse">مباشر</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                  <p className="text-slate-400 text-xs mb-1">الاستهلاك الحالي</p>
                  <p className="text-3xl font-bold text-amber-400">{realtimeConsumption.toFixed(2)} kW</p>
                  <p className="text-xs text-slate-500 mt-1">التكلفة: {currentCost.toFixed(2)} ر.س/ساعة</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                  <p className="text-slate-400 text-xs mb-1">المتوقع لهذه الساعة</p>
                  <p className="text-3xl font-bold text-blue-400">2.8 kW</p>
                  <div className={`text-xs mt-1 ${realtimeConsumption > 2.8 ? 'text-red-400' : 'text-green-400'}`}>
                    {realtimeConsumption > 2.8 ? `+${((realtimeConsumption - 2.8) / 2.8 * 100).toFixed(0)}% أعلى` : `${((2.8 - realtimeConsumption) / 2.8 * 100).toFixed(0)}% أقل`}
                  </div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                  <p className="text-slate-400 text-xs mb-1">المتوقع نهاية اليوم</p>
                  <p className="text-3xl font-bold text-purple-400">15.5 kWh</p>
                  <p className="text-xs text-green-400 mt-1">ضمن الهدف ✓</p>
                </div>
              </div>

              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={consumptionHistory.length > 0 ? consumptionHistory : [{ time: 'بداية', value: 2.5 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 5]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={false} name="الاستهلاك" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weather Impact */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <CloudSun className="w-4 h-4 text-cyan-400" />
                تأثير الطقس على الاستهلاك
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {weatherForecast.map((w, i) => (
                  <div key={i} className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <w.icon className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                    <p className="text-white font-medium">{w.temp}°C</p>
                    <p className="text-slate-400 text-xs">{w.time}</p>
                    <p className="text-slate-500 text-xs">{w.condition}</p>
                    <p className="text-cyan-400 text-xs mt-1">رطوبة: {w.humidity}%</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300 text-sm font-medium">تنبيه الطقس</span>
                </div>
                <p className="text-slate-400 text-xs">درجات الحرارة المرتفعة المتوقعة غداً قد تزيد استهلاك المكيف بنسبة 25-30%</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Goals Overview */}
          <div className="grid md:grid-cols-3 gap-4">
            {goals.slice(0, 3).map(goal => {
              const progress = (goal.current / goal.target) * 100;
              return (
                <Card key={goal.id} className={`glass-card ${
                  progress >= 100 ? 'border-red-500/50 bg-red-500/5' :
                  progress >= goal.alertThreshold ? 'border-amber-500/50 bg-amber-500/5' :
                  'border-green-500/30 bg-green-500/5'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300 text-sm">{goal.name}</span>
                      {goal.alertEnabled && <Bell className={`w-3 h-3 ${progress >= goal.alertThreshold ? 'text-amber-400' : 'text-slate-500'}`} />}
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold text-white">{goal.current}</span>
                      <span className="text-slate-400 text-sm">/ {goal.target} {goal.unit}</span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2" />
                    <p className={`text-xs mt-1 ${progress >= 100 ? 'text-red-400' : progress >= goal.alertThreshold ? 'text-amber-400' : 'text-green-400'}`}>
                      {progress.toFixed(0)}% {progress >= 100 ? '⚠️ تم التجاوز' : progress >= goal.alertThreshold ? '⚡ اقتراب' : '✓ جيد'}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Smart Goals Tab */}
        <TabsContent value="goals" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-medium">الأهداف الذكية</h4>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowNewGoalDialog(true)}>
              <Plus className="w-4 h-4 ml-2" />
              هدف جديد
            </Button>
          </div>

          <div className="space-y-4">
            {goals.map(goal => {
              const progress = (goal.current / goal.target) * 100;
              const isOverThreshold = progress >= goal.alertThreshold;
              const isExceeded = progress >= 100;

              return (
                <Card key={goal.id} className={`glass-card ${
                  isExceeded ? 'border-red-500/50 bg-red-500/5' :
                  isOverThreshold ? 'border-amber-500/50 bg-amber-500/5' :
                  'border-indigo-500/20 bg-[#0f1629]/80'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-medium">{goal.name}</h4>
                          <Badge className={`text-xs ${
                            goal.type === 'daily' ? 'bg-blue-500/20 text-blue-400' :
                            goal.type === 'weekly' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {goal.type === 'daily' ? 'يومي' : goal.type === 'weekly' ? 'أسبوعي' : 'شهري'}
                          </Badge>
                          {isExceeded && <Badge className="bg-red-500/20 text-red-400 text-xs">تم التجاوز!</Badge>}
                        </div>
                        <p className="text-slate-400 text-sm">
                          {goal.current} من {goal.target} {goal.unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8"
                          onClick={() => { setEditingGoal(goal); setShowGoalDialog(true); }}
                        >
                          <Edit className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8"
                          onClick={() => deleteGoal(goal.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">التقدم</span>
                        <span className={isExceeded ? 'text-red-400' : isOverThreshold ? 'text-amber-400' : 'text-green-400'}>
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="relative">
                        <Progress value={Math.min(progress, 100)} className="h-3" />
                        {/* Alert threshold marker */}
                        <div 
                          className="absolute top-0 h-full w-0.5 bg-amber-400"
                          style={{ left: `${goal.alertThreshold}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>0</span>
                        <span className="text-amber-400">تنبيه: {goal.alertThreshold}%</span>
                        <span>{goal.target} {goal.unit}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={goal.alertEnabled}
                          onCheckedChange={(checked) => updateGoal(goal.id, { alertEnabled: checked })}
                        />
                        <span className="text-slate-400 text-xs">تنبيهات</span>
                      </div>
                      {goal.alertEnabled && (
                        <div className="flex items-center gap-1 text-xs">
                          <BellRing className={`w-3 h-3 ${isOverThreshold ? 'text-amber-400' : 'text-slate-500'}`} />
                          <span className="text-slate-400">عند {goal.alertThreshold}%</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Top Consumers Tab */}
        <TabsContent value="consumers" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topConsumers.map((consumer, i) => (
              <motion.div
                key={consumer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-xl bg-${consumer.color}-500/20`}>
                        <consumer.icon className={`w-6 h-6 text-${consumer.color}-400`} />
                      </div>
                      <Badge className={`text-xs ${
                        consumer.trend === 'up' ? 'bg-red-500/20 text-red-400' :
                        consumer.trend === 'down' ? 'bg-green-500/20 text-green-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {consumer.trend === 'up' ? <ArrowUp className="w-3 h-3" /> :
                         consumer.trend === 'down' ? <ArrowDown className="w-3 h-3" /> : '—'}
                      </Badge>
                    </div>
                    <h4 className="text-white font-medium mb-1">{consumer.name}</h4>
                    <p className="text-2xl font-bold text-white">{consumer.consumption} kWh</p>
                    <p className="text-slate-400 text-xs">{consumer.percentage}% من الإجمالي</p>
                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                      <Button size="sm" variant="outline" className="w-full border-slate-600 text-xs">
                        <Settings className="w-3 h-3 ml-1" />
                        تحسين الاستهلاك
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Battery Tab */}
        <TabsContent value="battery" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Battery className="w-4 h-4 text-cyan-400" />
                  حالة البطارية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="#334155" strokeWidth="8" fill="none" />
                      <circle 
                        cx="64" cy="64" r="56" 
                        stroke={batteryData.level > 20 ? '#22d3ee' : '#ef4444'}
                        strokeWidth="8" fill="none"
                        strokeDasharray={`${batteryData.level * 3.52} 352`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-white">{batteryData.level}%</span>
                      <span className="text-cyan-400 text-xs">{batteryData.status === 'charging' ? 'شحن' : 'تفريغ'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <p className="text-slate-400 text-xs">السعة</p>
                    <p className="text-white font-bold">{batteryData.current}/{batteryData.capacity} kWh</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <p className="text-slate-400 text-xs">صحة البطارية</p>
                    <p className="text-green-400 font-bold">{batteryData.health}%</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <p className="text-slate-400 text-xs">قوة الشحن</p>
                    <p className="text-cyan-400 font-bold">{batteryData.chargingPower} kW</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <p className="text-slate-400 text-xs">وقت الامتلاء</p>
                    <p className="text-white font-bold">{batteryData.timeToFull}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">إعدادات البطارية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-slate-300 text-sm mb-2 block">وضع التشغيل</label>
                  <Select value={batteryMode} onValueChange={setBatteryMode}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="auto">تلقائي</SelectItem>
                      <SelectItem value="backup">احتياطي فقط</SelectItem>
                      <SelectItem value="self_consumption">استهلاك ذاتي</SelectItem>
                      <SelectItem value="time_of_use">حسب التعرفة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300">حد الشحن الأقصى</span>
                    <span className="text-white">90%</span>
                  </div>
                  <Slider defaultValue={[90]} max={100} step={5} />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300">حد التفريغ الأدنى</span>
                    <span className="text-white">20%</span>
                  </div>
                  <Slider defaultValue={[20]} max={50} step={5} />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-white text-sm">الشحن في أوقات الذروة المنخفضة</span>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Saving Plans Tab */}
        <TabsContent value="plans" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            {savingPlans.map((plan, i) => (
              <Card 
                key={plan.id}
                className={`glass-card transition-all cursor-pointer ${
                  activePlan === plan.id 
                    ? 'border-green-500/50 bg-green-500/10 ring-2 ring-green-500/30'
                    : 'border-indigo-500/20 bg-[#0f1629]/80 hover:border-slate-600'
                }`}
                onClick={() => activatePlan(plan.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`${
                      plan.impact === 'منخفض' ? 'bg-green-500/20 text-green-400' :
                      plan.impact === 'متوسط' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      تأثير {plan.impact}
                    </Badge>
                    {activePlan === plan.id && <Check className="w-5 h-5 text-green-400" />}
                  </div>
                  <h4 className="text-white font-bold text-lg mb-2">{plan.name}</h4>
                  <p className="text-3xl font-bold text-green-400 mb-3">{plan.savings}</p>
                  <p className="text-slate-400 text-xs">توفير متوقع</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {generatePlanMutation.data && (
            <Card className="glass-card border-purple-500/30 bg-purple-500/10">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  خطة مخصصة بالذكاء الاصطناعي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-400 font-bold mb-3">توفير متوقع: {generatePlanMutation.data.expectedSavings}</p>
                <div className="space-y-2">
                  {generatePlanMutation.data.actions?.map((action, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="text-white text-sm">{action.device}: {action.action}</p>
                        <p className="text-slate-500 text-xs">{action.timing}</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 text-xs">{action.savings}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">تعرفة الكهرباء في الوقت الفعلي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={realTimeCost}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                    <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                      {realTimeCost.map((entry, index) => (
                        <Cell key={index} fill={
                          entry.rate === 'ذروة' ? '#ef4444' :
                          entry.rate === 'مرتفع' ? '#f59e0b' :
                          entry.rate === 'عادي' ? '#22d3ee' : '#10b981'
                        } />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {[
                  { label: 'منخفض', color: 'green' },
                  { label: 'عادي', color: 'cyan' },
                  { label: 'مرتفع', color: 'amber' },
                  { label: 'ذروة', color: 'red' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded bg-${item.color}-500`} />
                    <span className="text-slate-400 text-xs">{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forecast Tab */}
        <TabsContent value="forecast" className="space-y-4 mt-4">
          {/* Consumption Goal */}
          <Card className="glass-card border-blue-500/30 bg-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">هدف الاستهلاك اليومي</h4>
                  <p className="text-slate-400 text-sm">سيتم إشعارك عند تجاوز الهدف</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-blue-400">{consumptionGoal} kWh</span>
                  <Button size="sm" variant="outline" className="border-blue-500/50" onClick={() => setShowGoalDialog(true)}>
                    تعديل
                  </Button>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">التقدم اليومي</span>
                  <span className={`${(12.5 / consumptionGoal * 100) > 80 ? 'text-amber-400' : 'text-green-400'}`}>
                    12.5 / {consumptionGoal} kWh
                  </span>
                </div>
                <Progress value={(12.5 / consumptionGoal) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Forecast Chart */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                توقعات الاستهلاك (48 ساعة)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="historical" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeDasharray="5 5" name="تاريخي" />
                    <Area type="monotone" dataKey="forecast" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="متوقع" />
                    <Area type="monotone" dataKey="actual" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="فعلي" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span className="text-slate-400 text-xs">فعلي</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <span className="text-slate-400 text-xs">متوقع</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-indigo-500" />
                  <span className="text-slate-400 text-xs">تاريخي</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Peak Times */}
          <Card className="glass-card border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                أوقات الذروة المتوقعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { time: 'اليوم 4-6 م', consumption: '5.8 kWh', status: 'high' },
                  { time: 'اليوم 8-10 م', consumption: '5.2 kWh', status: 'high' },
                  { time: 'غداً 4-6 م', consumption: '5.5 kWh', status: 'medium' },
                  { time: 'غداً 8-10 م', consumption: '4.8 kWh', status: 'medium' },
                ].map((peak, i) => (
                  <div key={i} className={`p-3 rounded-lg ${
                    peak.status === 'high' ? 'bg-red-500/10 border border-red-500/30' : 'bg-amber-500/10 border border-amber-500/30'
                  }`}>
                    <p className="text-white font-medium text-sm">{peak.time}</p>
                    <p className={`text-lg font-bold ${peak.status === 'high' ? 'text-red-400' : 'text-amber-400'}`}>{peak.consumption}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced What-If Tab */}
        <TabsContent value="whatif" className="space-y-4 mt-4">
          {/* Potential Savings Summary */}
          <Card className="glass-card border-green-500/30 bg-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium mb-1">إمكانية التوفير غير المستغلة</h4>
                  <p className="text-slate-400 text-sm">بتطبيق جميع السيناريوهات المتاحة</p>
                </div>
                <div className="text-left">
                  <p className="text-3xl font-bold text-green-400">{potentialSavings.monthly.toFixed(0)} kWh</p>
                  <p className="text-green-300 text-sm">{potentialSavings.cost.toFixed(2)} ر.س شهرياً</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {scenarios.map((scenario, i) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`glass-card transition-all ${
                  scenario.applied 
                    ? 'border-green-500/50 bg-green-500/5 ring-1 ring-green-500/30' 
                    : 'border-indigo-500/20 bg-[#0f1629]/80 hover:border-pink-500/50'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-medium">{scenario.name}</h4>
                        {scenario.applied && <Check className="w-4 h-4 text-green-400" />}
                      </div>
                      <div className="flex gap-1">
                        <Badge className={`text-xs ${
                          scenario.feasibility === 'سهل' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {scenario.feasibility}
                        </Badge>
                        <Badge className={`text-xs ${
                          scenario.comfortImpact === 'لا يوجد' ? 'bg-slate-500/20 text-slate-400' :
                          scenario.comfortImpact === 'منخفض' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          راحة: {scenario.comfortImpact}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="p-2 bg-green-500/10 rounded-lg text-center">
                        <p className="text-green-400 font-bold">{scenario.savings}</p>
                        <p className="text-slate-500 text-[10px]">توفير</p>
                      </div>
                      <div className="p-2 bg-cyan-500/10 rounded-lg text-center">
                        <p className="text-cyan-400 font-bold">{scenario.monthlySavings}</p>
                        <p className="text-slate-500 text-[10px]">شهرياً</p>
                      </div>
                      <div className="p-2 bg-amber-500/10 rounded-lg text-center">
                        <p className="text-amber-400 font-bold">{scenario.costSavings}</p>
                        <p className="text-slate-500 text-[10px]">ر.س/شهر</p>
                      </div>
                    </div>

                    <div className="p-2 bg-slate-800/50 rounded-lg mb-3">
                      <p className="text-slate-400 text-xs">قاعدة الأتمتة:</p>
                      <p className="text-white text-sm">{scenario.automationRule}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 border-slate-600"
                        onClick={() => analyzeScenarioMutation.mutate(scenario)}
                        disabled={analyzeScenarioMutation.isPending}
                      >
                        {analyzeScenarioMutation.isPending ? <Loader2 className="w-3 h-3 ml-1 animate-spin" /> : <Brain className="w-3 h-3 ml-1" />}
                        تحليل ذكي
                      </Button>
                      {!scenario.applied ? (
                        <Button 
                          className="flex-1 bg-pink-600 hover:bg-pink-700"
                          onClick={() => applyScenario(scenario.id)}
                        >
                          <Play className="w-3 h-3 ml-1" />
                          تطبيق
                        </Button>
                      ) : (
                        <Button variant="outline" className="flex-1 border-green-500/50 text-green-400" disabled>
                          <Check className="w-3 h-3 ml-1" />
                          مُطبّق
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Impact Comparison */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                مقارنة تأثير السيناريوهات على الأتمتة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scenarios.map(s => ({ name: s.name.slice(0, 20), savings: parseInt(s.savings), monthly: parseFloat(s.monthlySavings) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                    <Bar dataKey="savings" fill="#ec4899" name="نسبة التوفير %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Goal Dialog */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">تعديل الهدف</DialogTitle>
          </DialogHeader>
          {editingGoal && (
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-slate-300">القيمة المستهدفة</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider 
                    value={[editingGoal.target]} 
                    onValueChange={([v]) => setEditingGoal({ ...editingGoal, target: v })}
                    max={editingGoal.unit === 'ر.س' ? 1000 : editingGoal.unit === '%' ? 100 : 50}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-white font-bold w-16">{editingGoal.target} {editingGoal.unit}</span>
                </div>
              </div>
              <div>
                <Label className="text-slate-300">حد التنبيه (%)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider 
                    value={[editingGoal.alertThreshold]} 
                    onValueChange={([v]) => setEditingGoal({ ...editingGoal, alertThreshold: v })}
                    max={100}
                    min={50}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-white font-bold w-12">{editingGoal.alertThreshold}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <span className="text-white text-sm">تفعيل التنبيهات</span>
                <Switch 
                  checked={editingGoal.alertEnabled}
                  onCheckedChange={(checked) => setEditingGoal({ ...editingGoal, alertEnabled: checked })}
                />
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => { updateGoal(editingGoal.id, editingGoal); setShowGoalDialog(false); }}>
                <Check className="w-4 h-4 ml-2" />
                حفظ التغييرات
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Goal Dialog */}
      <Dialog open={showNewGoalDialog} onOpenChange={setShowNewGoalDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">إضافة هدف جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">اسم الهدف</Label>
              <Input 
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="مثال: هدف استهلاك المكيف"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300">النوع</Label>
                <Select value={newGoal.type} onValueChange={(v) => setNewGoal({ ...newGoal, type: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="daily">يومي</SelectItem>
                    <SelectItem value="weekly">أسبوعي</SelectItem>
                    <SelectItem value="monthly">شهري</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">الوحدة</Label>
                <Select value={newGoal.unit} onValueChange={(v) => setNewGoal({ ...newGoal, unit: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="kWh">kWh</SelectItem>
                    <SelectItem value="ر.س">ر.س</SelectItem>
                    <SelectItem value="%">%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-slate-300">القيمة المستهدفة</Label>
              <Input 
                type="number"
                value={newGoal.target}
                onChange={(e) => setNewGoal({ ...newGoal, target: parseFloat(e.target.value) })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">حد التنبيه (%)</Label>
              <Slider 
                value={[newGoal.alertThreshold]} 
                onValueChange={([v]) => setNewGoal({ ...newGoal, alertThreshold: v })}
                max={100}
                min={50}
                step={5}
                className="mt-2"
              />
              <p className="text-slate-400 text-xs mt-1">التنبيه عند {newGoal.alertThreshold}% من الهدف</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
              <span className="text-white text-sm">تفعيل التنبيهات</span>
              <Switch 
                checked={newGoal.alertEnabled}
                onCheckedChange={(checked) => setNewGoal({ ...newGoal, alertEnabled: checked })}
              />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={addGoal}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة الهدف
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scenario Analysis Dialog */}
      <Dialog open={showScenarioDialog} onOpenChange={setShowScenarioDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              تحليل السيناريو
            </DialogTitle>
          </DialogHeader>
          {selectedScenario && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-lg">
                <h4 className="text-white font-bold mb-2">{selectedScenario.name}</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-green-400 font-bold">{selectedScenario.savings}</p>
                    <p className="text-slate-400 text-xs">توفير</p>
                  </div>
                  <div className="text-center">
                    <p className="text-cyan-400 font-bold">{selectedScenario.monthlySavings}</p>
                    <p className="text-slate-400 text-xs">شهرياً</p>
                  </div>
                  <div className="text-center">
                    <p className="text-amber-400 font-bold">{selectedScenario.costSavings}</p>
                    <p className="text-slate-400 text-xs">ر.س</p>
                  </div>
                </div>
              </div>

              {selectedScenario.analysis && (
                <>
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <h5 className="text-slate-300 text-sm font-medium mb-2">التحليل المفصل</h5>
                    <p className="text-white text-sm">{selectedScenario.analysis.detailedAnalysis}</p>
                  </div>

                  {selectedScenario.analysis.actualSavingsRange && (
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <h5 className="text-green-300 text-sm font-medium mb-1">نطاق التوفير الفعلي</h5>
                      <p className="text-white text-sm">{selectedScenario.analysis.actualSavingsRange}</p>
                    </div>
                  )}

                  {selectedScenario.analysis.optimalConditions?.length > 0 && (
                    <div>
                      <h5 className="text-slate-300 text-sm font-medium mb-2">الظروف المثالية</h5>
                      <div className="space-y-1">
                        {selectedScenario.analysis.optimalConditions.map((c, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/30 rounded">
                            <Check className="w-3 h-3 text-green-400" />
                            <span className="text-white text-sm">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedScenario.analysis.risks?.length > 0 && (
                    <div>
                      <h5 className="text-slate-300 text-sm font-medium mb-2">المخاطر المحتملة</h5>
                      <div className="space-y-1">
                        {selectedScenario.analysis.risks.map((r, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-red-500/10 rounded">
                            <AlertTriangle className="w-3 h-3 text-red-400" />
                            <span className="text-white text-sm">{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedScenario.analysis.weatherImpact && (
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CloudSun className="w-4 h-4 text-cyan-400" />
                        <h5 className="text-cyan-300 text-sm font-medium">تأثير الطقس</h5>
                      </div>
                      <p className="text-white text-sm">{selectedScenario.analysis.weatherImpact}</p>
                    </div>
                  )}

                  {selectedScenario.analysis.recommendedSchedule && (
                    <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <h5 className="text-purple-300 text-sm font-medium mb-1">الجدول الموصى به</h5>
                      <p className="text-white text-sm">{selectedScenario.analysis.recommendedSchedule}</p>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-2">
                {!selectedScenario.applied && (
                  <Button className="flex-1 bg-pink-600 hover:bg-pink-700" onClick={() => { applyScenario(selectedScenario.id); setShowScenarioDialog(false); }}>
                    <Play className="w-4 h-4 ml-2" />
                    تطبيق السيناريو
                  </Button>
                )}
                <Button variant="outline" className="flex-1 border-slate-600" onClick={() => setShowScenarioDialog(false)}>
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}