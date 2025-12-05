import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, TrendingUp, TrendingDown, Zap, AlertTriangle, Wrench, Target,
  Lightbulb, Clock, Calendar, Activity, Thermometer, Loader2, Sparkles,
  CheckCircle, XCircle, ChevronRight, BarChart3, PieChart, ArrowUp, ArrowDown,
  CloudSun, Users, Bell, DollarSign, Settings, FileText, Shield, Eye, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line as RechartsLine, BarChart, Bar
} from 'recharts';
import { toast } from 'sonner';

// Mock historical data with weather integration
const energyForecast = [
  { day: 'اليوم', hour: '6ص', actual: 12, predicted: 12, weather: 28, occupancy: 4, cost: 1.8 },
  { day: 'اليوم', hour: '9ص', actual: 25, predicted: 24, weather: 32, occupancy: 2, cost: 3.6 },
  { day: 'اليوم', hour: '12م', actual: 45, predicted: 48, weather: 38, occupancy: 1, cost: 7.2 },
  { day: 'اليوم', hour: '3م', actual: 52, predicted: 55, weather: 40, occupancy: 1, cost: 8.3 },
  { day: 'اليوم', hour: '6م', actual: 48, predicted: 46, weather: 36, occupancy: 3, cost: 7.0 },
  { day: 'اليوم', hour: '9م', actual: 35, predicted: 33, weather: 30, occupancy: 4, cost: 5.0 },
  { day: 'غداً', hour: '6ص', actual: null, predicted: 14, weather: 29, occupancy: 4, cost: 2.1 },
  { day: 'غداً', hour: '12م', actual: null, predicted: 58, weather: 42, occupancy: 0, cost: 8.7 },
  { day: 'غداً', hour: '6م', actual: null, predicted: 42, weather: 35, occupancy: 4, cost: 6.3 },
];

// Occupancy Schedule
const defaultOccupancySchedule = [
  { day: 'السبت', periods: [{ start: '00:00', end: '10:00', count: 4 }, { start: '10:00', end: '18:00', count: 1 }, { start: '18:00', end: '24:00', count: 4 }] },
  { day: 'الأحد', periods: [{ start: '00:00', end: '08:00', count: 4 }, { start: '08:00', end: '16:00', count: 0 }, { start: '16:00', end: '24:00', count: 4 }] },
  { day: 'الإثنين', periods: [{ start: '00:00', end: '07:00', count: 4 }, { start: '07:00', end: '17:00', count: 0 }, { start: '17:00', end: '24:00', count: 4 }] },
];

// Weather forecast integration
const weatherForecast = [
  { day: 'اليوم', high: 40, low: 28, condition: 'مشمس', humidity: 35, energyImpact: '+18%' },
  { day: 'غداً', high: 42, low: 30, condition: 'حار جداً', humidity: 30, energyImpact: '+25%' },
  { day: 'الأربعاء', high: 38, low: 27, condition: 'غائم جزئياً', humidity: 45, energyImpact: '+10%' },
  { day: 'الخميس', high: 35, low: 25, condition: 'غائم', humidity: 50, energyImpact: '+5%' },
];

const deviceHealthPredictions = [
  { 
    id: 1, name: 'مكيف غرفة النوم', health: 72, riskLevel: 'medium', 
    predictedIssue: 'تآكل فلتر الهواء', daysToFailure: 15, 
    recommendation: 'تنظيف أو استبدال الفلتر',
    errorHistory: ['ارتفاع استهلاك الطاقة 3 مرات', 'تراجع كفاءة التبريد'],
    usagePattern: 'استخدام مكثف 12+ ساعة يومياً',
    maintenanceHistory: [{ date: '2024-09-15', action: 'تنظيف فلتر' }],
    replacementCost: 150,
    repairCost: 50,
    confidence: 85,
    failureProbability: 68,
    impactLevel: 'medium',
    impactDescription: 'تراجع كفاءة التبريد بنسبة 25% وزيادة استهلاك الطاقة',
    proactiveMaintenance: {
      schedule: '2024-12-15',
      actions: ['تنظيف الفلتر', 'فحص مستوى الفريون', 'تنظيف المبخر'],
      estimatedTime: '45 دقيقة',
      technicianRequired: false
    },
    costAnalysis: {
      doNothing: { cost: 450, risk: 'high', description: 'فشل محتمل خلال 15 يوم مع تكلفة إصلاح أعلى' },
      repair: { cost: 50, risk: 'low', description: 'تنظيف الفلتر يمدد العمر 6 أشهر' },
      replace: { cost: 150, risk: 'none', description: 'استبدال الفلتر بالكامل - ضمان سنة' }
    },
    linkedActions: [
      { id: 'clean', label: 'جدولة تنظيف', type: 'maintenance' },
      { id: 'order', label: 'طلب قطع غيار', type: 'order' },
      { id: 'tech', label: 'استدعاء فني', type: 'service' }
    ]
  },
  { 
    id: 2, name: 'قفل الباب الذكي', health: 45, riskLevel: 'high', 
    predictedIssue: 'ضعف البطارية + تآكل آلية القفل', daysToFailure: 5, 
    recommendation: 'استبدال البطارية فوراً - فحص آلية القفل',
    errorHistory: ['فشل الفتح 5 مرات', 'استجابة بطيئة 12 مرة', 'انقطاع اتصال متكرر'],
    usagePattern: '45 عملية قفل/فتح يومياً',
    maintenanceHistory: [{ date: '2024-06-01', action: 'استبدال بطارية' }],
    replacementCost: 500,
    repairCost: 80,
    confidence: 92,
    failureProbability: 89,
    impactLevel: 'critical',
    impactDescription: 'خطر أمني - احتمال عدم القدرة على قفل/فتح الباب',
    proactiveMaintenance: {
      schedule: 'فوري',
      actions: ['استبدال البطارية', 'تشحيم آلية القفل', 'إعادة معايرة المستشعر'],
      estimatedTime: '30 دقيقة',
      technicianRequired: false
    },
    costAnalysis: {
      doNothing: { cost: 500, risk: 'critical', description: 'احتمال 89% فشل كامل - استبدال ضروري' },
      repair: { cost: 80, risk: 'medium', description: 'استبدال بطارية وصيانة - يمدد العمر 3 أشهر' },
      replace: { cost: 500, risk: 'none', description: 'قفل جديد مع ضمان 2 سنة وميزات محسنة' }
    },
    linkedActions: [
      { id: 'battery', label: 'استبدال البطارية الآن', type: 'urgent' },
      { id: 'backup', label: 'تفعيل وضع الطوارئ', type: 'security' },
      { id: 'replace', label: 'طلب قفل جديد', type: 'order' }
    ]
  },
  { 
    id: 3, name: 'كاميرا المدخل', health: 88, riskLevel: 'low', 
    predictedIssue: 'لا توجد مشاكل متوقعة', daysToFailure: null, 
    recommendation: 'الحفاظ على الصيانة الدورية - تنظيف العدسة شهرياً',
    errorHistory: [],
    usagePattern: 'تشغيل مستمر 24/7',
    maintenanceHistory: [{ date: '2024-11-01', action: 'تنظيف عدسة' }],
    replacementCost: 400,
    repairCost: 0,
    confidence: 95,
    failureProbability: 5,
    impactLevel: 'low',
    impactDescription: 'لا تأثير متوقع - الجهاز يعمل بكفاءة عالية',
    proactiveMaintenance: {
      schedule: '2025-01-01',
      actions: ['تنظيف العدسة', 'تحديث البرنامج الثابت'],
      estimatedTime: '15 دقيقة',
      technicianRequired: false
    },
    costAnalysis: {
      doNothing: { cost: 0, risk: 'low', description: 'لا حاجة لإجراء فوري' },
      repair: { cost: 0, risk: 'none', description: 'صيانة وقائية فقط' },
      replace: { cost: 400, risk: 'none', description: 'غير ضروري حالياً' }
    },
    linkedActions: [
      { id: 'schedule', label: 'جدولة صيانة دورية', type: 'maintenance' }
    ]
  },
  { 
    id: 4, name: 'مستشعر الحركة', health: 65, riskLevel: 'medium', 
    predictedIssue: 'تراجع دقة الاستشعار - إنذارات كاذبة محتملة', daysToFailure: 25, 
    recommendation: 'إعادة معايرة الجهاز - تنظيف العدسة',
    errorHistory: ['إنذار كاذب 8 مرات', 'عدم اكتشاف حركة 3 مرات'],
    usagePattern: 'نشط في الممر - حركة متوسطة',
    maintenanceHistory: [],
    replacementCost: 120,
    repairCost: 30,
    confidence: 78,
    failureProbability: 55,
    impactLevel: 'medium',
    impactDescription: 'إنذارات كاذبة مزعجة وفقدان محتمل لاكتشاف الحركة الفعلية',
    proactiveMaintenance: {
      schedule: '2024-12-20',
      actions: ['إعادة المعايرة', 'تنظيف المستشعر', 'تعديل الحساسية'],
      estimatedTime: '20 دقيقة',
      technicianRequired: false
    },
    costAnalysis: {
      doNothing: { cost: 120, risk: 'medium', description: 'تفاقم المشكلة واستبدال مطلوب' },
      repair: { cost: 30, risk: 'low', description: 'إعادة معايرة تحل 90% من المشاكل' },
      replace: { cost: 120, risk: 'none', description: 'مستشعر جديد بتقنية محسنة' }
    },
    linkedActions: [
      { id: 'calibrate', label: 'إعادة المعايرة', type: 'maintenance' },
      { id: 'sensitivity', label: 'ضبط الحساسية', type: 'settings' }
    ]
  },
];

const savingScenarios = [
  { 
    id: 1, name: 'وضع الذروة الذكي', 
    description: 'تقليل استهلاك الأجهزة خلال ساعات الذروة بناءً على أسعار الكهرباء', 
    savings: 22, monthlySavings: 85, impact: 'متوسط', 
    devices: ['مكيف', 'غسالة', 'سخان'], schedule: '12م - 6م',
    weatherBased: true, occupancyBased: true,
    triggers: ['سعر كهرباء مرتفع', 'درجة حرارة < 38°'],
    billImpact: { current: 450, projected: 365 }
  },
  { 
    id: 2, name: 'النوم العميق', 
    description: 'إطفاء تلقائي للأجهزة غير الضرورية ليلاً مع الحفاظ على الأمان', 
    savings: 15, monthlySavings: 55, impact: 'منخفض', 
    devices: ['إضاءة', 'تلفاز', 'سماعات'], schedule: '11م - 6ص',
    weatherBased: false, occupancyBased: true,
    triggers: ['وقت النوم', 'عدم حركة لـ30 دقيقة'],
    billImpact: { current: 450, projected: 395 }
  },
  { 
    id: 3, name: 'وضع المغادرة الذكي', 
    description: 'تحسين استهلاك الطاقة تلقائياً عند مغادرة الجميع بناءً على الموقع', 
    savings: 35, monthlySavings: 130, impact: 'عالي', 
    devices: ['جميع الأجهزة'], schedule: 'عند المغادرة',
    weatherBased: true, occupancyBased: true,
    triggers: ['مغادرة آخر شخص', 'عدم حركة لـ1 ساعة'],
    billImpact: { current: 450, projected: 320 }
  },
  { 
    id: 4, name: 'التبريد المسبق الذكي', 
    description: 'تشغيل المكيف قبل ذروة الحرارة للاستفادة من أسعار الكهرباء المنخفضة', 
    savings: 18, monthlySavings: 70, impact: 'متوسط', 
    devices: ['مكيف'], schedule: 'قبل الذروة بساعتين',
    weatherBased: true, occupancyBased: true,
    triggers: ['توقع حرارة > 35°', 'شخص في المنزل خلال ساعتين'],
    billImpact: { current: 450, projected: 380 }
  },
  { 
    id: 5, name: 'وضع الطقس البارد', 
    description: 'استغلال الطقس المعتدل لتقليل استخدام المكيف', 
    savings: 40, monthlySavings: 150, impact: 'عالي', 
    devices: ['مكيف', 'مروحة'], schedule: 'عند الطقس المعتدل',
    weatherBased: true, occupancyBased: false,
    triggers: ['درجة حرارة < 30°', 'رطوبة < 60%'],
    billImpact: { current: 450, projected: 300 }
  },
];

export default function PredictiveAnalytics({ devices = [], weatherData = null }) {
  const [activeTab, setActiveTab] = useState('energy');
  const [forecastPeriod, setForecastPeriod] = useState('hourly');
  const [occupancySchedule, setOccupancySchedule] = useState(defaultOccupancySchedule);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showBillImpact, setShowBillImpact] = useState(false);
  const [appliedScenarios, setAppliedScenarios] = useState([]);
  const [predictions, setPredictions] = useState({
    energy: energyForecast,
    devices: deviceHealthPredictions,
    scenarios: savingScenarios,
    weather: weatherForecast
  });

  // Generate proactive alerts with detailed explanations
  const [alerts, setAlerts] = useState([
    { 
      id: 1, 
      type: 'device', 
      severity: 'high', 
      title: 'قفل الباب يحتاج صيانة عاجلة', 
      device: 'قفل الباب الذكي', 
      message: 'احتمال فشل 89% خلال 5 أيام بناءً على تحليل 17 حدث خطأ',
      detailedExplanation: 'تم تسجيل 5 حالات فشل فتح و12 استجابة بطيئة خلال الأسبوعين الماضيين. نمط الاستخدام العالي (45 عملية/يوم) يسرّع تآكل البطارية. آخر استبدال للبطارية كان قبل 6 أشهر.',
      expectedImpact: 'خطر أمني - قد لا يعمل القفل عند الحاجة، مما يترك المنزل عرضة للخطر أو يمنع الوصول',
      action: 'استبدال البطارية فوراً وفحص آلية القفل',
      solutions: [
        { id: 'battery', label: 'استبدال البطارية الآن', priority: 'urgent', estimatedTime: '10 دقائق' },
        { id: 'backup', label: 'تفعيل وضع الطوارئ', priority: 'high', estimatedTime: 'فوري' },
        { id: 'tech', label: 'استدعاء فني للفحص', priority: 'medium', estimatedTime: 'يوم واحد' }
      ],
      time: 'منذ ساعة',
      actionLink: 'device-maintenance'
    },
    { 
      id: 2, 
      type: 'energy', 
      severity: 'medium', 
      title: 'ارتفاع متوقع في الاستهلاك غداً', 
      device: null, 
      message: 'درجة حرارة 42° متوقعة - زيادة 25% في استهلاك المكيف',
      detailedExplanation: 'بناءً على تنبؤات الطقس، ستصل درجة الحرارة إلى 42° غداً. تحليل البيانات التاريخية يُظهر أن كل زيادة 2° فوق 35° ترفع استهلاك المكيف بنسبة 8%. جدول التواجد يُظهر وجود 4 أشخاص بين 3-9 مساءً.',
      expectedImpact: 'زيادة متوقعة في فاتورة الكهرباء بمقدار 35-45 ر.س لهذا اليوم، إجهاد إضافي على نظام التبريد',
      action: 'تفعيل وضع التبريد المسبق',
      solutions: [
        { id: 'precool', label: 'تفعيل التبريد المسبق (الساعة 10 صباحاً)', priority: 'recommended', estimatedTime: 'تلقائي' },
        { id: 'schedule', label: 'ضبط جدول المكيف الذكي', priority: 'medium', estimatedTime: '5 دقائق' },
        { id: 'curtains', label: 'إغلاق الستائر تلقائياً قبل الظهر', priority: 'low', estimatedTime: 'تلقائي' }
      ],
      time: 'منذ 2 ساعة',
      actionLink: 'energy-scenarios'
    },
    { 
      id: 3, 
      type: 'device', 
      severity: 'medium', 
      title: 'مكيف غرفة النوم يحتاج صيانة', 
      device: 'مكيف غرفة النوم', 
      message: 'فلتر الهواء يحتاج تنظيف - تراجع الكفاءة 15%',
      detailedExplanation: 'تحليل استهلاك الطاقة يُظهر زيادة 15% عن المعدل الطبيعي. وقت التبريد للوصول لدرجة الحرارة المطلوبة زاد بنسبة 22%. آخر تنظيف للفلتر كان قبل 75 يوماً (المعدل الموصى به: 30 يوم).',
      expectedImpact: 'زيادة 18 ر.س في تكلفة الطاقة الشهرية، تراجع جودة الهواء، إجهاد إضافي على الضاغط',
      action: 'تنظيف أو استبدال الفلتر خلال أسبوع',
      solutions: [
        { id: 'clean', label: 'تنظيف الفلتر (يدوي)', priority: 'recommended', estimatedTime: '15 دقيقة' },
        { id: 'replace', label: 'طلب فلتر جديد', priority: 'medium', estimatedTime: 'يومين للتوصيل' },
        { id: 'schedule', label: 'جدولة صيانة شاملة', priority: 'low', estimatedTime: 'ساعة واحدة' }
      ],
      time: 'منذ 3 ساعات',
      actionLink: 'device-maintenance'
    },
  ]);

  const generatePredictionsMutation = useMutation({
    mutationFn: async (type) => {
      const deviceList = devices.map(d => `${d.name} (${d.category}, عمر: ${d.age || '1 سنة'})`).join('\n');
      
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت محلل تنبؤي للمنزل الذكي. قم بتحليل البيانات وتقديم تنبؤات ${
          type === 'energy' ? 'استهلاك الطاقة للأسبوع القادم' :
          type === 'devices' ? 'صحة الأجهزة والأعطال المحتملة' :
          'سيناريوهات توفير الطاقة المخصصة'
        }.

الأجهزة:
${deviceList || 'مكيف، إضاءة، قفل ذكي، كاميرا، مستشعرات'}

الطقس الحالي: ${weatherData?.current?.temp || 35}°C

قدم تحليلاً تنبؤياً مفصلاً.`,
        response_json_schema: type === 'energy' ? {
          type: 'object',
          properties: {
            forecast: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'string' },
                  predicted: { type: 'number' },
                  confidence: { type: 'number' },
                  factors: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            weeklyTotal: { type: 'number' },
            trend: { type: 'string' },
            recommendations: { type: 'array', items: { type: 'string' } }
          }
        } : type === 'devices' ? {
          type: 'object',
          properties: {
            predictions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  deviceName: { type: 'string' },
                  healthScore: { type: 'number' },
                  riskLevel: { type: 'string' },
                  predictedIssue: { type: 'string' },
                  daysToFailure: { type: 'number' },
                  recommendation: { type: 'string' },
                  confidence: { type: 'number' }
                }
              }
            },
            overallHealth: { type: 'number' },
            criticalAlerts: { type: 'number' }
          }
        } : {
          type: 'object',
          properties: {
            scenarios: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  savingsPercent: { type: 'number' },
                  monthlySavings: { type: 'number' },
                  devices: { type: 'array', items: { type: 'string' } },
                  schedule: { type: 'string' },
                  difficulty: { type: 'string' }
                }
              }
            },
            totalPotentialSavings: { type: 'number' },
            bestScenario: { type: 'string' }
          }
        }
      });
    },
    onSuccess: (data, type) => {
      if (type === 'energy' && data.forecast) {
        setPredictions(prev => ({ ...prev, energy: data.forecast }));
      } else if (type === 'devices' && data.predictions) {
        setPredictions(prev => ({ ...prev, devices: data.predictions.map((p, i) => ({ ...p, id: i + 1, name: p.deviceName, health: p.healthScore })) }));
      } else if (type === 'scenarios' && data.scenarios) {
        setPredictions(prev => ({ ...prev, scenarios: data.scenarios.map((s, i) => ({ ...s, id: i + 1, savings: s.savingsPercent })) }));
      }
      toast.success('تم تحديث التنبؤات');
    },
    onError: () => toast.error('فشل في إنشاء التنبؤات')
  });

  const applyScenario = (scenario) => {
    if (appliedScenarios.includes(scenario.id)) {
      setAppliedScenarios(appliedScenarios.filter(id => id !== scenario.id));
      toast.success(`تم إلغاء سيناريو "${scenario.name}"`);
    } else {
      setAppliedScenarios([...appliedScenarios, scenario.id]);
      toast.success(`تم تفعيل سيناريو "${scenario.name}"`);
    }
  };

  const dismissAlert = (alertId) => {
    setAlerts(alerts.filter(a => a.id !== alertId));
    toast.success('تم تجاهل التنبيه');
  };

  const handleAlertAction = (alert) => {
    setSelectedAlert(alert);
    setShowAlertDialog(true);
  };

  const totalProjectedSavings = appliedScenarios.reduce((sum, id) => {
    const scenario = predictions.scenarios.find(s => s.id === id);
    return sum + (scenario?.monthlySavings || 0);
  }, 0);

  const projectedBill = 450 - totalProjectedSavings;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            التحليلات التنبؤية المتقدمة
          </h3>
          <p className="text-slate-400 text-sm">AI يتنبأ بالاستهلاك والأعطال ويقترح حلول توفير</p>
        </div>
        <Button 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => generatePredictionsMutation.mutate(activeTab)}
          disabled={generatePredictionsMutation.isPending}
        >
          {generatePredictionsMutation.isPending ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Sparkles className="w-4 h-4 ml-2" />}
          تحديث التنبؤات
        </Button>
      </div>

      {/* Proactive Alerts */}
      {alerts.length > 0 && (
        <Card className="glass-card border-red-500/30 bg-red-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-red-400" />
              تنبيهات تنبؤية ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map(alert => (
              <div key={alert.id} className={`p-3 rounded-lg border ${
                alert.severity === 'high' ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`text-xs ${alert.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {alert.severity === 'high' ? 'عاجل' : 'تحذير'}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                        {alert.type === 'device' ? 'جهاز' : 'طاقة'}
                      </Badge>
                      <span className="text-slate-500 text-xs">{alert.time}</span>
                    </div>
                    <h4 className="text-white font-medium text-sm">{alert.title}</h4>
                    <p className="text-slate-400 text-xs mt-1">{alert.message}</p>
                    {/* Quick Action Buttons */}
                    {alert.solutions && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {alert.solutions.slice(0, 2).map(solution => (
                          <Button 
                            key={solution.id} 
                            size="sm" 
                            className={`h-6 text-xs ${
                              solution.priority === 'urgent' ? 'bg-red-600 hover:bg-red-700' :
                              solution.priority === 'recommended' ? 'bg-green-600 hover:bg-green-700' :
                              'bg-slate-600 hover:bg-slate-700'
                            }`}
                            onClick={() => { toast.success(`جاري تنفيذ: ${solution.label}`); }}
                          >
                            {solution.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 border-slate-600" onClick={() => handleAlertAction(alert)}>
                      <Eye className="w-3 h-3 ml-1" />
                      التفاصيل
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-slate-400" onClick={() => dismissAlert(alert.id)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
          <CardContent className="p-4 text-center">
            <Zap className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">285 kWh</p>
            <p className="text-slate-400 text-xs">استهلاك متوقع (أسبوع)</p>
            <Badge className="bg-green-500/20 text-green-400 text-xs mt-1">
              <ArrowDown className="w-3 h-3 ml-1" />-8%
            </Badge>
          </CardContent>
        </Card>
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{predictions.devices.filter(d => d.riskLevel !== 'low').length}</p>
            <p className="text-slate-400 text-xs">أجهزة تحتاج انتباه</p>
            <Badge className="bg-red-500/20 text-red-400 text-xs mt-1">خلال 15 يوم</Badge>
          </CardContent>
        </Card>
        <Card className="glass-card border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{totalProjectedSavings || 340} ر.س</p>
            <p className="text-slate-400 text-xs">توفير محتمل (شهرياً)</p>
            <Badge className="bg-green-500/20 text-green-400 text-xs mt-1">{appliedScenarios.length} مفعّل</Badge>
          </CardContent>
        </Card>
        <Card className="glass-card border-purple-500/30 bg-purple-500/5">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{projectedBill} ر.س</p>
            <p className="text-slate-400 text-xs">فاتورة متوقعة</p>
            <Badge className="bg-purple-500/20 text-purple-400 text-xs mt-1">الشهر القادم</Badge>
          </CardContent>
        </Card>
        <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
          <CardContent className="p-4 text-center">
            <CloudSun className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{predictions.weather[1]?.high || 42}°</p>
            <p className="text-slate-400 text-xs">حرارة الغد</p>
            <Badge className="bg-red-500/20 text-red-400 text-xs mt-1">+25% طاقة</Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap">
          <TabsTrigger value="energy" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Zap className="w-3 h-3 ml-1" />
            تنبؤ الطاقة
          </TabsTrigger>
          <TabsTrigger value="devices" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Wrench className="w-3 h-3 ml-1" />
            صحة الأجهزة
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Lightbulb className="w-3 h-3 ml-1" />
            سيناريوهات التوفير
          </TabsTrigger>
          <TabsTrigger value="weather" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <CloudSun className="w-3 h-3 ml-1" />
            تأثير الطقس
          </TabsTrigger>
          <TabsTrigger value="occupancy" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Users className="w-3 h-3 ml-1" />
            جدول التواجد
          </TabsTrigger>
        </TabsList>

        {/* Energy Forecast Tab */}
        <TabsContent value="energy" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm">تنبؤ الاستهلاك مع الطقس والتواجد</CardTitle>
                <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                  <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="hourly">بالساعة</SelectItem>
                    <SelectItem value="daily">يومي</SelectItem>
                    <SelectItem value="weekly">أسبوعي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={predictions.energy}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                    <YAxis yAxisId="left" stroke="#94a3b8" fontSize={10} />
                    <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                    <Area yAxisId="left" type="monotone" dataKey="predicted" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} name="الاستهلاك المتوقع (kWh)" />
                    <Area yAxisId="left" type="monotone" dataKey="actual" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="الاستهلاك الفعلي (kWh)" />
                    <RechartsLine yAxisId="right" type="monotone" dataKey="weather" stroke="#f59e0b" strokeDasharray="5 5" name="الحرارة °C" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                  <CloudSun className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <p className="text-white font-bold">{predictions.weather[0]?.high || 40}°</p>
                  <p className="text-slate-500 text-xs">أعلى حرارة</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                  <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                  <p className="text-white font-bold">4</p>
                  <p className="text-slate-500 text-xs">أشخاص متوقعون</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                  <DollarSign className="w-5 h-5 text-green-400 mx-auto mb-1" />
                  <p className="text-white font-bold">45 ر.س</p>
                  <p className="text-slate-500 text-xs">تكلفة اليوم</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                  <Activity className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                  <p className="text-white font-bold">94%</p>
                  <p className="text-slate-500 text-xs">دقة التنبؤ</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <h5 className="text-amber-300 text-sm font-medium mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  تنبيه: ذروة استهلاك متوقعة
                </h5>
                <p className="text-white text-xs">الساعة 3 مساءً - درجة الحرارة 40° - استهلاك متوقع 55 kWh</p>
                <p className="text-green-400 text-xs mt-1">💡 تفعيل "التبريد المسبق" يوفر 18% من الاستهلاك</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Device Health Tab */}
        <TabsContent value="devices" className="space-y-4 mt-4">
          <div className="space-y-3">
            {predictions.devices.map((device, i) => (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`glass-card ${
                  device.riskLevel === 'high' ? 'border-red-500/30 bg-red-500/5' :
                  device.riskLevel === 'medium' ? 'border-amber-500/30 bg-amber-500/5' :
                  'border-green-500/30 bg-green-500/5'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${
                          device.riskLevel === 'high' ? 'bg-red-500/20' :
                          device.riskLevel === 'medium' ? 'bg-amber-500/20' : 'bg-green-500/20'
                        }`}>
                          {device.riskLevel === 'high' ? <AlertTriangle className="w-6 h-6 text-red-400" /> :
                           device.riskLevel === 'medium' ? <Wrench className="w-6 h-6 text-amber-400" /> :
                           <CheckCircle className="w-6 h-6 text-green-400" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-medium">{device.name}</h4>
                            <Badge className={`text-xs ${
                              device.confidence >= 90 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              ثقة {device.confidence}%
                            </Badge>
                          </div>
                          <p className="text-slate-300 text-sm mb-2">{device.predictedIssue}</p>
                          
                          {/* Error History */}
                          {device.errorHistory?.length > 0 && (
                            <div className="mb-2">
                              <p className="text-slate-500 text-xs mb-1">سجل الأخطاء:</p>
                              <div className="flex flex-wrap gap-1">
                                {device.errorHistory.map((err, ei) => (
                                  <Badge key={ei} variant="outline" className="border-red-500/30 text-red-400 text-xs">{err}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Usage Pattern */}
                          <p className="text-slate-400 text-xs mb-2">
                            <Activity className="w-3 h-3 inline ml-1" />
                            {device.usagePattern}
                          </p>

                          {device.daysToFailure && (
                            <Badge className={`text-xs ${
                              device.daysToFailure < 10 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              <Clock className="w-3 h-3 ml-1" />
                              فشل متوقع خلال {device.daysToFailure} يوم
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-left min-w-[120px]">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-slate-400 text-xs">صحة الجهاز</span>
                          <span className={`font-bold ${
                            device.health > 80 ? 'text-green-400' :
                            device.health > 50 ? 'text-amber-400' : 'text-red-400'
                          }`}>{device.health}%</span>
                        </div>
                        <Progress value={device.health} className="h-2 mb-3" />
                        
                        {/* Cost Analysis */}
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">تكلفة الإصلاح:</span>
                            <span className="text-amber-400">{device.repairCost} ر.س</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">تكلفة الاستبدال:</span>
                            <span className="text-red-400">{device.replacementCost} ر.س</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recommendation */}
                    {device.recommendation && (
                      <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white text-sm font-medium">
                            <Lightbulb className="w-4 h-4 inline ml-1 text-amber-400" />
                            التوصية
                          </p>
                          <Badge className={`text-xs ${
                            device.riskLevel === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {device.riskLevel === 'high' ? 'إجراء فوري' : 'صيانة وقائية'}
                          </Badge>
                        </div>
                        <p className="text-slate-300 text-sm mb-2">{device.recommendation}</p>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 h-7">
                            <CheckCircle className="w-3 h-3 ml-1" />
                            جدولة صيانة
                          </Button>
                          <Button size="sm" variant="outline" className="border-slate-600 h-7">
                            <FileText className="w-3 h-3 ml-1" />
                            تقرير مفصل
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Last Maintenance */}
                    {device.maintenanceHistory?.length > 0 && (
                      <div className="mt-2 text-xs text-slate-500">
                        آخر صيانة: {device.maintenanceHistory[0].date} - {device.maintenanceHistory[0].action}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Saving Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4 mt-4">
          {/* Bill Impact Summary */}
          <Card className="glass-card border-green-500/30 bg-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h4 className="text-white font-medium mb-1">تأثير السيناريوهات على الفاتورة</h4>
                  <p className="text-slate-400 text-sm">{appliedScenarios.length} سيناريو مفعّل من {predictions.scenarios.length}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-slate-400 text-xs">الفاتورة الحالية</p>
                    <p className="text-2xl font-bold text-white">450 ر.س</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-green-400" />
                  <div className="text-center">
                    <p className="text-slate-400 text-xs">الفاتورة المتوقعة</p>
                    <p className="text-2xl font-bold text-green-400">{projectedBill} ر.س</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">
                    توفير {totalProjectedSavings || 0} ر.س
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {predictions.scenarios.map((scenario, i) => {
              const isApplied = appliedScenarios.includes(scenario.id);
              return (
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className={`glass-card transition-all ${
                    isApplied ? 'border-green-500/50 bg-green-500/10' : 'border-indigo-500/20 bg-[#0f1629]/80 hover:border-green-500/30'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-bold">{scenario.name}</h4>
                            {isApplied && <CheckCircle className="w-4 h-4 text-green-400" />}
                          </div>
                          <p className="text-slate-400 text-sm">{scenario.description}</p>
                        </div>
                        <div className="text-left">
                          <Badge className="bg-green-500/20 text-green-400 mb-1">
                            -{scenario.savings}%
                          </Badge>
                          <p className="text-green-400 font-bold text-sm">{scenario.monthlySavings} ر.س/شهر</p>
                        </div>
                      </div>
                      
                      {/* Triggers */}
                      <div className="mb-3">
                        <p className="text-slate-500 text-xs mb-1">شروط التفعيل:</p>
                        <div className="flex flex-wrap gap-1">
                          {scenario.triggers.map((trigger, ti) => (
                            <Badge key={ti} variant="outline" className="border-cyan-500/50 text-cyan-400 text-xs">
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Weather/Occupancy Badges */}
                      <div className="flex items-center gap-2 mb-3">
                        {scenario.weatherBased && (
                          <Badge variant="outline" className="border-amber-500/50 text-amber-400 text-xs">
                            <CloudSun className="w-3 h-3 ml-1" />
                            يعتمد على الطقس
                          </Badge>
                        )}
                        {scenario.occupancyBased && (
                          <Badge variant="outline" className="border-purple-500/50 text-purple-400 text-xs">
                            <Users className="w-3 h-3 ml-1" />
                            يعتمد على التواجد
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {scenario.devices.map((device, di) => (
                          <Badge key={di} variant="outline" className="border-slate-600 text-slate-300 text-xs">
                            {device}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                        <span><Clock className="w-3 h-3 inline ml-1" />{scenario.schedule}</span>
                        <span>التأثير: {scenario.impact}</span>
                      </div>
                      
                      <Button 
                        className={`w-full ${isApplied ? 'bg-slate-600 hover:bg-slate-700' : 'bg-green-600 hover:bg-green-700'}`}
                        size="sm"
                        onClick={() => applyScenario(scenario)}
                      >
                        {isApplied ? (
                          <><X className="w-3 h-3 ml-1" />إلغاء التفعيل</>
                        ) : (
                          <><CheckCircle className="w-3 h-3 ml-1" />تفعيل السيناريو</>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Weather Impact Tab */}
        <TabsContent value="weather" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <CloudSun className="w-4 h-4 text-cyan-400" />
                تأثير الطقس على استهلاك الطاقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-3 mb-4">
                {predictions.weather.map((day, i) => (
                  <div key={i} className={`p-3 rounded-lg ${
                    day.energyImpact.includes('+2') ? 'bg-red-500/10 border border-red-500/30' :
                    day.energyImpact.includes('+1') ? 'bg-amber-500/10 border border-amber-500/30' :
                    'bg-green-500/10 border border-green-500/30'
                  }`}>
                    <p className="text-white font-medium mb-1">{day.day}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl">{day.condition === 'حار جداً' ? '🔥' : day.condition === 'مشمس' ? '☀️' : '⛅'}</span>
                      <div className="text-left">
                        <p className="text-red-400 font-bold">{day.high}°</p>
                        <p className="text-cyan-400">{day.low}°</p>
                      </div>
                    </div>
                    <p className="text-slate-400 text-xs">رطوبة: {day.humidity}%</p>
                    <Badge className={`mt-2 text-xs ${
                      day.energyImpact.includes('+2') ? 'bg-red-500/20 text-red-400' :
                      day.energyImpact.includes('+1') ? 'bg-amber-500/20 text-amber-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      <Zap className="w-3 h-3 ml-1" />
                      {day.energyImpact} طاقة
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <h5 className="text-amber-300 font-medium mb-2">توصيات بناءً على الطقس</h5>
                <ul className="space-y-1 text-white text-sm">
                  <li>• غداً حار جداً (42°) - فعّل التبريد المسبق لتوفير 18%</li>
                  <li>• الخميس معتدل (35°) - أوقف المكيف واستخدم التهوية الطبيعية</li>
                  <li>• رطوبة منخفضة - لا حاجة لمزيل الرطوبة</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Occupancy Schedule Tab */}
        <TabsContent value="occupancy" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  جدول التواجد المنزلي
                </CardTitle>
                <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-400">
                  <Settings className="w-3 h-3 ml-1" />
                  تعديل الجدول
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {occupancySchedule.map((day, i) => (
                  <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-white font-medium mb-2">{day.day}</p>
                    <div className="flex gap-1">
                      {Array.from({ length: 24 }, (_, h) => {
                        const period = day.periods.find(p => {
                          const start = parseInt(p.start.split(':')[0]);
                          const end = parseInt(p.end.split(':')[0]) || 24;
                          return h >= start && h < end;
                        });
                        const count = period?.count || 0;
                        return (
                          <div
                            key={h}
                            className={`flex-1 h-6 rounded-sm ${
                              count === 0 ? 'bg-slate-700' :
                              count <= 2 ? 'bg-purple-500/30' :
                              'bg-purple-500/60'
                            }`}
                            title={`${h}:00 - ${count} أشخاص`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-slate-500">
                      <span>12ص</span>
                      <span>6ص</span>
                      <span>12م</span>
                      <span>6م</span>
                      <span>12ص</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-slate-700" />
                  <span className="text-slate-400">لا أحد</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-purple-500/30" />
                  <span className="text-slate-400">1-2 أشخاص</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-purple-500/60" />
                  <span className="text-slate-400">3+ أشخاص</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alert Detail Dialog - Enhanced */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${selectedAlert?.severity === 'high' ? 'text-red-400' : 'text-amber-400'}`} />
              تفاصيل التنبيه الذكي
            </DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4 mt-4">
              {/* Alert Header */}
              <div className={`p-4 rounded-lg ${
                selectedAlert.severity === 'high' ? 'bg-red-500/10 border border-red-500/30' : 'bg-amber-500/10 border border-amber-500/30'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${selectedAlert.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {selectedAlert.severity === 'high' ? 'عاجل' : 'تحذير'}
                  </Badge>
                  {selectedAlert.device && (
                    <Badge variant="outline" className="border-slate-600 text-slate-300">{selectedAlert.device}</Badge>
                  )}
                </div>
                <h4 className="text-white font-bold mb-2">{selectedAlert.title}</h4>
                <p className="text-slate-300 text-sm">{selectedAlert.message}</p>
              </div>

              {/* Detailed Explanation */}
              {selectedAlert.detailedExplanation && (
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-cyan-400 text-xs font-medium mb-2 flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    تحليل AI المفصل
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed">{selectedAlert.detailedExplanation}</p>
                </div>
              )}

              {/* Expected Impact */}
              {selectedAlert.expectedImpact && (
                <div className={`p-3 rounded-lg ${
                  selectedAlert.severity === 'high' ? 'bg-red-500/5 border border-red-500/20' : 'bg-amber-500/5 border border-amber-500/20'
                }`}>
                  <p className="text-amber-400 text-xs font-medium mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    التأثير المتوقع
                  </p>
                  <p className="text-white text-sm">{selectedAlert.expectedImpact}</p>
                </div>
              )}

              {/* Solutions */}
              {selectedAlert.solutions && (
                <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 text-xs font-medium mb-3 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    الحلول الموصى بها
                  </p>
                  <div className="space-y-2">
                    {selectedAlert.solutions.map((solution, i) => (
                      <div 
                        key={solution.id} 
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all hover:bg-slate-700/50 ${
                          solution.priority === 'urgent' ? 'bg-red-500/10 border border-red-500/30' :
                          solution.priority === 'recommended' ? 'bg-green-500/10 border border-green-500/30' :
                          'bg-slate-800/50 border border-slate-700'
                        }`}
                        onClick={() => { toast.success(`جاري تنفيذ: ${solution.label}`); setShowAlertDialog(false); }}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            solution.priority === 'urgent' ? 'bg-red-500 text-white' :
                            solution.priority === 'recommended' ? 'bg-green-500 text-white' :
                            'bg-slate-600 text-white'
                          }`}>
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{solution.label}</p>
                            <p className="text-slate-500 text-xs">الوقت: {solution.estimatedTime}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700" 
                  onClick={() => { 
                    setShowAlertDialog(false); 
                    toast.success('تم جدولة الإجراء الموصى به'); 
                  }}
                >
                  <CheckCircle className="w-4 h-4 ml-2" />
                  تنفيذ الإجراء الأول
                </Button>
                <Button variant="outline" className="border-slate-600" onClick={() => setShowAlertDialog(false)}>
                  لاحقاً
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}