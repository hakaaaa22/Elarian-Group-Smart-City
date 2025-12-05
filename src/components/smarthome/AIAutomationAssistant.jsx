import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, Sparkles, Lightbulb, AlertTriangle, Check, X, Play, Pause,
  MessageSquare, Send, Loader2, Clock, Zap, RefreshCw, Eye, Settings,
  TrendingUp, Target, Wand2, ChevronRight, BarChart3, Trash2, Merge,
  ArrowUpDown, ThumbsUp, ThumbsDown, Activity, Battery, Thermometer,
  DollarSign, Droplets, Wind, Home, Lock, Cpu, Info, Calculator,
  LineChart, PieChart, History, GitBranch, Workflow, Layers
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const mockSuggestions = [
  {
    id: 1,
    title: 'إطفاء الأضواء تلقائياً',
    description: 'لاحظنا أن الأضواء تبقى مشغلة بعد منتصف الليل. نقترح إطفاءها تلقائياً الساعة 11 مساءً.',
    type: 'energy_saving',
    confidence: 92,
    basedOn: ['استخدام الأضواء', 'أوقات النوم'],
    impact: 'توفير 15% من استهلاك الإضاءة',
    status: 'pending'
  },
  {
    id: 2,
    title: 'تشغيل المكيف قبل الوصول',
    description: 'بناءً على نمط وصولك للمنزل، نقترح تشغيل المكيف الساعة 5:30 مساءً.',
    type: 'comfort',
    confidence: 88,
    basedOn: ['موقعك', 'جدول العمل'],
    impact: 'منزل بارد عند الوصول',
    status: 'pending'
  },
  {
    id: 3,
    title: 'قفل الأبواب تلقائياً',
    description: 'نسيت قفل الباب 3 مرات هذا الأسبوع. نقترح قفله تلقائياً بعد 10 دقائق من الإغلاق.',
    type: 'security',
    confidence: 95,
    basedOn: ['سجل الأبواب', 'أنماط الأمان'],
    impact: 'أمان محسّن',
    status: 'pending'
  }
];

const mockConflicts = [
  {
    id: 1,
    rules: ['إطفاء الأضواء الساعة 11', 'تشغيل إضاءة الممر عند الحركة'],
    conflict: 'قد تضيء أضواء الممر بعد الإطفاء التلقائي',
    severity: 'low',
    suggestion: 'إضافة شرط: فقط قبل الساعة 11 مساءً'
  },
  {
    id: 2,
    rules: ['تشغيل المكيف الساعة 5:30', 'إطفاء جميع الأجهزة عند المغادرة'],
    conflict: 'إذا غادرت متأخراً، قد يشتغل المكيف ثم يطفأ',
    severity: 'medium',
    suggestion: 'إضافة شرط: فقط إذا لم تكن في المنزل'
  }
];

// Automation performance data
const mockAutomationPerformance = [
  { id: 1, name: 'إطفاء الأضواء تلقائياً', executions: 145, successRate: 98, avgTime: '0.3s', energySaved: '12 kWh', status: 'active', lastRun: '2 ساعة', trend: 'up' },
  { id: 2, name: 'تشغيل المكيف قبل الوصول', executions: 28, successRate: 92, avgTime: '1.2s', energySaved: '5 kWh', status: 'active', lastRun: '5 ساعات', trend: 'stable' },
  { id: 3, name: 'قفل الأبواب ليلاً', executions: 30, successRate: 100, avgTime: '0.5s', energySaved: '0 kWh', status: 'active', lastRun: '8 ساعات', trend: 'up' },
  { id: 4, name: 'تشغيل الإضاءة صباحاً', executions: 5, successRate: 80, avgTime: '0.8s', energySaved: '0 kWh', status: 'inactive', lastRun: '3 أيام', trend: 'down' },
  { id: 5, name: 'إشعار عند فتح الباب', executions: 2, successRate: 100, avgTime: '0.2s', energySaved: '0 kWh', status: 'active', lastRun: '1 أسبوع', trend: 'down' },
];

// Underutilized automations
const mockUnderutilized = [
  { id: 4, name: 'تشغيل الإضاءة صباحاً', reason: 'تنفيذ 5 مرات فقط خلال شهر', suggestion: 'حذف أو تعديل الشروط' },
  { id: 5, name: 'إشعار عند فتح الباب', reason: 'تنفيذ مرتين فقط خلال شهر', suggestion: 'دمج مع أتمتة أخرى' },
];

// Redundant automations
const mockRedundant = [
  { id: 1, rules: ['إطفاء الأضواء الساعة 11', 'إطفاء كل شيء عند النوم'], overlap: '85%', suggestion: 'دمج في أتمتة واحدة' },
];

// Energy impact predictions
const mockEnergyImpact = [
  { hour: '6ص', baseline: 2.1, withRule: 1.8, savings: 14 },
  { hour: '9ص', baseline: 3.5, withRule: 2.9, savings: 17 },
  { hour: '12م', baseline: 4.2, withRule: 3.5, savings: 17 },
  { hour: '3م', baseline: 4.8, withRule: 3.8, savings: 21 },
  { hour: '6م', baseline: 5.2, withRule: 4.1, savings: 21 },
  { hour: '9م', baseline: 4.5, withRule: 3.6, savings: 20 },
  { hour: '12ص', baseline: 2.0, withRule: 1.5, savings: 25 },
];

// Pattern analysis categories
const patternCategories = [
  { id: 'usage', name: 'أنماط الاستخدام', icon: Activity, color: 'cyan' },
  { id: 'time', name: 'أنماط زمنية', icon: Clock, color: 'purple' },
  { id: 'energy', name: 'أنماط الطاقة', icon: Zap, color: 'amber' },
  { id: 'comfort', name: 'أنماط الراحة', icon: Thermometer, color: 'green' },
];

// Complex automation templates
const complexTemplates = [
  {
    id: 't1',
    name: 'سيناريو متعدد الشروط',
    description: 'إذا كانت الحرارة > 30 وأنت في المنزل والوقت بين 12-6، شغّل المكيف',
    triggers: ['درجة الحرارة', 'الموقع', 'الوقت'],
    actions: ['تشغيل المكيف', 'ضبط الستائر'],
    complexity: 'عالي'
  },
  {
    id: 't2', 
    name: 'سلسلة إجراءات متتابعة',
    description: 'عند المغادرة: انتظر 5 دقائق، أطفئ الأجهزة، اقفل الأبواب، فعّل الإنذار',
    triggers: ['المغادرة'],
    actions: ['تأخير', 'إطفاء الأجهزة', 'قفل الأبواب', 'تفعيل الإنذار'],
    complexity: 'متوسط'
  },
  {
    id: 't3',
    name: 'أتمتة تعلّمية',
    description: 'تعلّم من سلوكي واضبط الإضاءة والحرارة تلقائياً',
    triggers: ['تعلم آلي'],
    actions: ['ضبط تلقائي'],
    complexity: 'عالي جداً'
  }
];

export default function AIAutomationAssistant({ devices = [], automations = [] }) {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [suggestions, setSuggestions] = useState(mockSuggestions);
  const [conflicts, setConflicts] = useState(mockConflicts);
  const [automationPerformance, setAutomationPerformance] = useState(mockAutomationPerformance);
  const [underutilized, setUnderutilized] = useState(mockUnderutilized);
  const [redundant, setRedundant] = useState(mockRedundant);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [showOptimizeDialog, setShowOptimizeDialog] = useState(false);
  const [showImpactDialog, setShowImpactDialog] = useState(false);
  const [showPatternDialog, setShowPatternDialog] = useState(false);
  const [showComplexDialog, setShowComplexDialog] = useState(false);
  const [generatedRule, setGeneratedRule] = useState(null);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState([]);
  const [selectedImpactRule, setSelectedImpactRule] = useState(null);
  const [analyzedPatterns, setAnalyzedPatterns] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const generateSuggestionsMutation = useMutation({
    mutationFn: async () => {
      const deviceList = devices.map(d => `${d.name} (${d.category}, ${d.room})`).join('\n');
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مساعد ذكي للمنزل الذكي. قم بتحليل أنماط الاستخدام واقترح أتمتة جديدة.
        
الأجهزة المتاحة:
${deviceList || 'إضاءة غرفة المعيشة، مكيف غرفة النوم، قفل الباب، كاميرا المدخل'}

اقترح 3 قواعد أتمتة جديدة بناءً على أنماط استخدام شائعة.`,
        response_json_schema: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  type: { type: 'string' },
                  confidence: { type: 'number' },
                  impact: { type: 'string' },
                  trigger: { type: 'string' },
                  actions: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      });
    },
    onSuccess: (data) => {
      if (data.suggestions) {
        setSuggestions(prev => [...prev, ...data.suggestions.map((s, i) => ({ ...s, id: Date.now() + i, status: 'pending', basedOn: ['تحليل AI'] }))]);
        toast.success('تم إنشاء اقتراحات جديدة');
      }
    },
    onError: () => toast.error('فشل في إنشاء الاقتراحات')
  });

  const naturalLanguageMutation = useMutation({
    mutationFn: async (input) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مساعد ذكي للمنزل الذكي. المستخدم يريد إنشاء أتمتة بناءً على الوصف التالي:

"${input}"

قم بتحليل الطلب وإنشاء قاعدة أتمتة مفصلة.`,
        response_json_schema: {
          type: 'object',
          properties: {
            understood: { type: 'boolean' },
            ruleName: { type: 'string' },
            description: { type: 'string' },
            trigger: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                condition: { type: 'string' },
                time: { type: 'string' }
              }
            },
            actions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  device: { type: 'string' },
                  action: { type: 'string' },
                  value: { type: 'string' }
                }
              }
            },
            conditions: { type: 'array', items: { type: 'string' } },
            explanation: { type: 'string' }
          }
        }
      });
    },
    onSuccess: (data) => {
      if (data.understood) {
        setGeneratedRule(data);
        setShowResultDialog(true);
      } else {
        toast.error('لم أفهم الطلب، يرجى إعادة الصياغة');
      }
    },
    onError: () => toast.error('فشل في معالجة الطلب')
  });

  const detectConflictsMutation = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل قواعد الأتمتة التالية واكتشف أي تعارضات محتملة:

${automations.length > 0 ? automations.map(a => a.name).join('\n') : 'إطفاء الأضواء الساعة 11، تشغيل إضاءة الممر عند الحركة، تشغيل المكيف قبل الوصول'}

اكتشف التعارضات واقترح حلولاً.`,
        response_json_schema: {
          type: 'object',
          properties: {
            conflicts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  rules: { type: 'array', items: { type: 'string' } },
                  conflict: { type: 'string' },
                  severity: { type: 'string' },
                  suggestion: { type: 'string' }
                }
              }
            }
          }
        }
      });
    },
    onSuccess: (data) => {
      if (data.conflicts) {
        setConflicts(data.conflicts.map((c, i) => ({ ...c, id: Date.now() + i })));
        toast.success('تم تحليل التعارضات');
      }
    },
    onError: () => toast.error('فشل في تحليل التعارضات')
  });

  const analyzePerformanceMutation = useMutation({
    mutationFn: async () => {
      const perfData = automationPerformance.map(a => `${a.name}: ${a.executions} تنفيذ، نجاح ${a.successRate}%`).join('\n');
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت محلل أتمتة ذكي. قم بتحليل أداء الأتمتة التالية واقترح تحسينات:

${perfData}

قدم:
1. تحليل كفاءة كل أتمتة
2. اقتراحات لتحسين الأداء
3. أتمتات يُنصح بحذفها أو دمجها`,
        response_json_schema: {
          type: 'object',
          properties: {
            analysis: { type: 'string' },
            optimizations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  automationName: { type: 'string' },
                  issue: { type: 'string' },
                  suggestion: { type: 'string' },
                  priority: { type: 'string' }
                }
              }
            },
            toRemove: { type: 'array', items: { type: 'string' } },
            toMerge: { type: 'array', items: { type: 'string' } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setShowOptimizeDialog(true);
      toast.success('تم تحليل الأداء');
    },
    onError: () => toast.error('فشل في تحليل الأداء')
  });

  // Pattern Analysis Mutation
  const analyzePatternsMutation = useMutation({
    mutationFn: async () => {
      const deviceList = devices.map(d => `${d.name} (${d.category}, ${d.room})`).join('\n');
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت محلل أنماط ذكي للمنزل الذكي. قم بتحليل بيانات الأجهزة التالية واكتشف الأنماط:

الأجهزة:
${deviceList || 'إضاءة غرفة المعيشة، مكيف غرفة النوم، قفل الباب، مستشعر الحركة'}

قم بتحليل:
1. أنماط الاستخدام المتكررة
2. الأوقات الأكثر نشاطاً
3. الارتباطات بين الأجهزة
4. فرص التحسين والأتمتة`,
        response_json_schema: {
          type: 'object',
          properties: {
            patterns: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  confidence: { type: 'number' },
                  devices: { type: 'array', items: { type: 'string' } },
                  suggestedAutomation: { type: 'string' },
                  energyImpact: { type: 'string' }
                }
              }
            },
            insights: { type: 'array', items: { type: 'string' } },
            correlations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  devices: { type: 'array', items: { type: 'string' } },
                  relationship: { type: 'string' }
                }
              }
            }
          }
        }
      });
    },
    onSuccess: (data) => {
      if (data.patterns) {
        setAnalyzedPatterns(data.patterns);
        setShowPatternDialog(true);
      }
      toast.success('تم تحليل الأنماط');
    },
    onError: () => toast.error('فشل في تحليل الأنماط')
  });

  // Impact Prediction Mutation
  const predictImpactMutation = useMutation({
    mutationFn: async (rule) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل التأثير المحتمل لقاعدة الأتمتة التالية:

القاعدة: ${rule.title || rule.ruleName}
الوصف: ${rule.description}

قدم تحليلاً شاملاً يتضمن:
1. التأثير على استهلاك الطاقة (بالنسبة المئوية)
2. التأثير على التكلفة الشهرية
3. التأثير على الراحة
4. المخاطر المحتملة
5. التوقعات على مدار 24 ساعة`,
        response_json_schema: {
          type: 'object',
          properties: {
            energyImpact: {
              type: 'object',
              properties: {
                percentage: { type: 'number' },
                kwhDaily: { type: 'number' },
                direction: { type: 'string' }
              }
            },
            costImpact: {
              type: 'object',
              properties: {
                monthlyChange: { type: 'number' },
                currency: { type: 'string' }
              }
            },
            comfortImpact: { type: 'string' },
            risks: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } },
            hourlyForecast: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  hour: { type: 'string' },
                  baseline: { type: 'number' },
                  withRule: { type: 'number' }
                }
              }
            },
            overallScore: { type: 'number' }
          }
        }
      });
    },
    onSuccess: (data, rule) => {
      setSelectedImpactRule({ ...rule, impact: data });
      setShowImpactDialog(true);
    },
    onError: () => toast.error('فشل في تحليل التأثير')
  });

  // Complex Automation Builder
  const buildComplexAutomationMutation = useMutation({
    mutationFn: async (template) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مساعد متقدم للأتمتة. قم ببناء أتمتة معقدة بناءً على القالب التالي:

القالب: ${template.name}
الوصف: ${template.description}
المشغلات: ${template.triggers.join(', ')}
الإجراءات: ${template.actions.join(', ')}

قم بإنشاء قاعدة أتمتة مفصلة مع جميع الشروط والإجراءات المتسلسلة.`,
        response_json_schema: {
          type: 'object',
          properties: {
            ruleName: { type: 'string' },
            description: { type: 'string' },
            triggers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  operator: { type: 'string' },
                  value: { type: 'string' },
                  logicalOperator: { type: 'string' }
                }
              }
            },
            conditions: { type: 'array', items: { type: 'string' } },
            actions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  order: { type: 'number' },
                  device: { type: 'string' },
                  action: { type: 'string' },
                  delay: { type: 'string' }
                }
              }
            },
            estimatedImpact: { type: 'string' }
          }
        }
      });
    },
    onSuccess: (data) => {
      setGeneratedRule(data);
      setShowResultDialog(true);
      setShowComplexDialog(false);
    },
    onError: () => toast.error('فشل في بناء الأتمتة')
  });

  const acceptSuggestion = (suggestionId) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    setSuggestions(suggestions.map(s => s.id === suggestionId ? { ...s, status: 'accepted' } : s));
    setAcceptedSuggestions([...acceptedSuggestions, suggestion]);
    toast.success('تم قبول الاقتراح وإضافته للأتمتة');
  };

  const rejectSuggestion = (suggestionId) => {
    setSuggestions(suggestions.map(s => s.id === suggestionId ? { ...s, status: 'rejected' } : s));
  };

  const removeAutomation = (id) => {
    setAutomationPerformance(automationPerformance.filter(a => a.id !== id));
    setUnderutilized(underutilized.filter(u => u.id !== id));
    toast.success('تم حذف الأتمتة');
  };

  const mergeAutomations = (ids) => {
    toast.success('تم دمج الأتمتات');
    setRedundant([]);
  };

  const handleNaturalLanguageSubmit = () => {
    if (!naturalLanguageInput.trim()) return;
    naturalLanguageMutation.mutate(naturalLanguageInput);
  };

  const applyGeneratedRule = () => {
    toast.success(`تم إنشاء الأتمتة: ${generatedRule.ruleName}`);
    setShowResultDialog(false);
    setNaturalLanguageInput('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            مساعد الأتمتة الذكي المتقدم
          </h3>
          <p className="text-slate-400 text-sm">AI يحلل الأنماط ويقترح أتمتة ذكية مع تنبؤات التأثير</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="border-cyan-500/50 text-cyan-400" onClick={() => analyzePatternsMutation.mutate()} disabled={analyzePatternsMutation.isPending}>
            {analyzePatternsMutation.isPending ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Activity className="w-4 h-4 ml-2" />}
            تحليل الأنماط
          </Button>
          <Button variant="outline" className="border-slate-600" onClick={() => detectConflictsMutation.mutate()} disabled={detectConflictsMutation.isPending}>
            {detectConflictsMutation.isPending ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <AlertTriangle className="w-4 h-4 ml-2" />}
            كشف التعارضات
          </Button>
          <Button variant="outline" className="border-amber-500/50 text-amber-400" onClick={() => setShowComplexDialog(true)}>
            <Layers className="w-4 h-4 ml-2" />
            أتمتة متقدمة
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => generateSuggestionsMutation.mutate()} disabled={generateSuggestionsMutation.isPending}>
            {generateSuggestionsMutation.isPending ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Sparkles className="w-4 h-4 ml-2" />}
            اقتراحات جديدة
          </Button>
        </div>
      </div>

      {/* Natural Language Input */}
      <Card className="glass-card border-purple-500/30 bg-purple-500/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wand2 className="w-5 h-5 text-purple-400" />
            <h4 className="text-white font-medium">إنشاء أتمتة بالوصف</h4>
          </div>
          <div className="flex gap-2">
            <Textarea
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              placeholder='مثال: "أريد أن يكون المنزل هادئاً في الليل" أو "شغّل المكيف عندما ترتفع الحرارة"'
              className="bg-slate-800/50 border-slate-700 text-white flex-1 min-h-[60px]"
            />
            <Button className="bg-purple-600 hover:bg-purple-700 self-end" onClick={handleNaturalLanguageSubmit} disabled={naturalLanguageMutation.isPending}>
              {naturalLanguageMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {['اجعل المنزل هادئاً ليلاً', 'وفّر الطاقة', 'أمّن المنزل عند المغادرة'].map((example, i) => (
              <Badge key={i} variant="outline" className="border-purple-500/50 text-purple-300 cursor-pointer hover:bg-purple-500/20"
                onClick={() => setNaturalLanguageInput(example)}>
                {example}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap">
          <TabsTrigger value="suggestions">
            اقتراحات AI
            {suggestions.filter(s => s.status === 'pending').length > 0 && (
              <Badge className="bg-purple-500 text-white text-xs mr-2">{suggestions.filter(s => s.status === 'pending').length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="conflicts">
            التعارضات
            {conflicts.length > 0 && <Badge className="bg-amber-500 text-white text-xs mr-2">{conflicts.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="performance">
            <BarChart3 className="w-3 h-3 ml-1" />
            أداء الأتمتة
          </TabsTrigger>
          <TabsTrigger value="optimize">
            <Activity className="w-3 h-3 ml-1" />
            التحسين
          </TabsTrigger>
          <TabsTrigger value="patterns">
            <GitBranch className="w-3 h-3 ml-1" />
            تحليل الأنماط
          </TabsTrigger>
          <TabsTrigger value="impact">
            <Calculator className="w-3 h-3 ml-1" />
            تنبؤ التأثير
          </TabsTrigger>
          <TabsTrigger value="insights">رؤى وتحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-3 mt-4">
          {suggestions.filter(s => s.status === 'pending').map((suggestion, i) => (
            <motion.div key={suggestion.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-5 h-5 text-amber-400" />
                        <h4 className="text-white font-medium">{suggestion.title}</h4>
                        <Badge className={`text-xs ${
                          suggestion.type === 'energy_saving' ? 'bg-green-500/20 text-green-400' :
                          suggestion.type === 'comfort' ? 'bg-cyan-500/20 text-cyan-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {suggestion.type === 'energy_saving' ? 'توفير طاقة' : suggestion.type === 'comfort' ? 'راحة' : 'أمان'}
                        </Badge>
                        <Badge className="bg-purple-500/20 text-purple-400 text-xs">{suggestion.confidence}% ثقة</Badge>
                      </div>
                      <p className="text-slate-300 text-sm mb-2">{suggestion.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>بناءً على: {suggestion.basedOn?.join(', ')}</span>
                        <span className="text-green-400">التأثير: {suggestion.impact}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mr-4">
                      <Button size="sm" variant="outline" className="border-amber-500/50 text-amber-400" onClick={() => predictImpactMutation.mutate(suggestion)} disabled={predictImpactMutation.isPending}>
                        {predictImpactMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Calculator className="w-3 h-3 ml-1" />}
                        التأثير
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => acceptSuggestion(suggestion.id)}>
                        <Check className="w-3 h-3 ml-1" />
                        قبول
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-600" onClick={() => rejectSuggestion(suggestion.id)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {suggestions.filter(s => s.status === 'pending').length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <p className="text-slate-400">لا توجد اقتراحات جديدة</p>
              <Button className="mt-3 bg-purple-600" onClick={() => generateSuggestionsMutation.mutate()}>إنشاء اقتراحات</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-3 mt-4">
          {conflicts.map((conflict, i) => (
            <Card key={conflict.id} className={`glass-card ${conflict.severity === 'high' ? 'border-red-500/30 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 ${conflict.severity === 'high' ? 'text-red-400' : 'text-amber-400'}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-white font-medium">تعارض محتمل</h4>
                      <Badge className={`text-xs ${conflict.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {conflict.severity === 'high' ? 'عالي' : conflict.severity === 'medium' ? 'متوسط' : 'منخفض'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {conflict.rules.map((rule, ri) => (
                        <Badge key={ri} variant="outline" className="border-slate-600 text-slate-300 text-xs">{rule}</Badge>
                      ))}
                    </div>
                    <p className="text-slate-300 text-sm mb-2">{conflict.conflict}</p>
                    <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-green-300 text-sm"><Check className="w-3 h-3 inline ml-1" /> الحل المقترح: {conflict.suggestion}</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">تطبيق</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-medium">أداء قواعد الأتمتة</h4>
            <Button variant="outline" className="border-purple-500/50 text-purple-400" onClick={() => analyzePerformanceMutation.mutate()} disabled={analyzePerformanceMutation.isPending}>
              {analyzePerformanceMutation.isPending ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
              تحليل ذكي
            </Button>
          </div>
          <div className="space-y-3">
            {automationPerformance.map((auto, i) => (
              <Card key={auto.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${auto.status === 'active' ? 'bg-green-500/20' : 'bg-slate-500/20'}`}>
                        <Zap className={`w-5 h-5 ${auto.status === 'active' ? 'text-green-400' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-medium">{auto.name}</h4>
                          <Badge className={`text-xs ${auto.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
                            {auto.status === 'active' ? 'نشط' : 'غير نشط'}
                          </Badge>
                          {auto.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
                          {auto.trend === 'down' && <ArrowUpDown className="w-3 h-3 text-red-400" />}
                        </div>
                        <p className="text-slate-400 text-xs">آخر تشغيل: {auto.lastRun}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-center">
                      <div>
                        <p className="text-white font-bold">{auto.executions}</p>
                        <p className="text-slate-500 text-xs">تنفيذ</p>
                      </div>
                      <div>
                        <p className={`font-bold ${auto.successRate >= 95 ? 'text-green-400' : auto.successRate >= 80 ? 'text-amber-400' : 'text-red-400'}`}>{auto.successRate}%</p>
                        <p className="text-slate-500 text-xs">نجاح</p>
                      </div>
                      <div>
                        <p className="text-cyan-400 font-bold">{auto.avgTime}</p>
                        <p className="text-slate-500 text-xs">الوقت</p>
                      </div>
                      {auto.energySaved !== '0 kWh' && (
                        <div>
                          <p className="text-amber-400 font-bold">{auto.energySaved}</p>
                          <p className="text-slate-500 text-xs">وفّر</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Optimize Tab */}
        <TabsContent value="optimize" className="space-y-4 mt-4">
          {/* Underutilized */}
          {underutilized.length > 0 && (
            <Card className="glass-card border-amber-500/30 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="text-amber-300 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  أتمتات قليلة الاستخدام
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {underutilized.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">{item.name}</h4>
                      <p className="text-slate-400 text-xs">{item.reason}</p>
                      <p className="text-amber-400 text-xs mt-1">الاقتراح: {item.suggestion}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-slate-600">
                        <Settings className="w-3 h-3 ml-1" />
                        تعديل
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-500/50 text-red-400" onClick={() => removeAutomation(item.id)}>
                        <Trash2 className="w-3 h-3 ml-1" />
                        حذف
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Redundant */}
          {redundant.length > 0 && (
            <Card className="glass-card border-purple-500/30 bg-purple-500/5">
              <CardHeader>
                <CardTitle className="text-purple-300 text-sm flex items-center gap-2">
                  <Merge className="w-4 h-4" />
                  أتمتات متكررة (يمكن دمجها)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {redundant.map((item, i) => (
                  <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-wrap gap-2">
                        {item.rules.map((rule, ri) => (
                          <Badge key={ri} variant="outline" className="border-purple-500/50 text-purple-300 text-xs">{rule}</Badge>
                        ))}
                      </div>
                      <Badge className="bg-purple-500/20 text-purple-400">{item.overlap} تكرار</Badge>
                    </div>
                    <p className="text-slate-400 text-xs mb-2">الاقتراح: {item.suggestion}</p>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => mergeAutomations(item.rules)}>
                      <Merge className="w-3 h-3 ml-1" />
                      دمج
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Learning from accepted suggestions */}
          {acceptedSuggestions.length > 0 && (
            <Card className="glass-card border-green-500/30 bg-green-500/5">
              <CardHeader>
                <CardTitle className="text-green-300 text-sm flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4" />
                  الاقتراحات المقبولة (للتعلم)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-3">AI يتعلم من اختياراتك لتحسين الاقتراحات المستقبلية</p>
                <div className="flex flex-wrap gap-2">
                  {acceptedSuggestions.map((s, i) => (
                    <Badge key={i} className="bg-green-500/20 text-green-400">{s?.title}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {underutilized.length === 0 && redundant.length === 0 && (
            <div className="text-center py-8">
              <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-slate-400">جميع الأتمتات محسّنة!</p>
            </div>
          )}
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4 mt-4">
          <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <h4 className="text-white font-medium">تحليل أنماط الاستخدام</h4>
                </div>
                <Button 
                  className="bg-cyan-600 hover:bg-cyan-700"
                  onClick={() => analyzePatternsMutation.mutate()}
                  disabled={analyzePatternsMutation.isPending}
                >
                  {analyzePatternsMutation.isPending ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
                  تحليل الآن
                </Button>
              </div>
              <p className="text-slate-400 text-sm mb-4">AI يحلل بيانات أجهزتك لاكتشاف الأنماط والتوصية بقواعد أتمتة جديدة</p>
              
              <div className="grid md:grid-cols-4 gap-3">
                {patternCategories.map(cat => (
                  <div key={cat.id} className={`p-3 bg-${cat.color}-500/10 border border-${cat.color}-500/30 rounded-lg text-center`}>
                    <cat.icon className={`w-6 h-6 text-${cat.color}-400 mx-auto mb-2`} />
                    <p className="text-white text-sm font-medium">{cat.name}</p>
                  </div>
                ))}
              </div>

              {analyzedPatterns.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h5 className="text-slate-300 text-sm font-medium">الأنماط المكتشفة:</h5>
                  {analyzedPatterns.map((pattern, i) => (
                    <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h6 className="text-white font-medium">{pattern.name}</h6>
                        <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">{pattern.confidence}% ثقة</Badge>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{pattern.description}</p>
                      {pattern.suggestedAutomation && (
                        <div className="p-2 bg-green-500/10 border border-green-500/30 rounded">
                          <p className="text-green-300 text-xs">الأتمتة المقترحة: {pattern.suggestedAutomation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Impact Prediction Tab */}
        <TabsContent value="impact" className="space-y-4 mt-4">
          <Card className="glass-card border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                تنبؤ التأثير على استهلاك الطاقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockEnergyImpact}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="baseline" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} name="بدون الأتمتة" />
                    <Area type="monotone" dataKey="withRule" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="مع الأتمتة" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-indigo-500" />
                  <span className="text-slate-400 text-xs">بدون الأتمتة</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span className="text-slate-400 text-xs">مع الأتمتة</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="p-3 bg-green-500/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-400">-19%</p>
                  <p className="text-slate-400 text-xs">توفير الطاقة</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-400">-45 ر.س</p>
                  <p className="text-slate-400 text-xs">توفير شهري</p>
                </div>
                <div className="p-3 bg-cyan-500/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-cyan-400">92%</p>
                  <p className="text-slate-400 text-xs">دقة التنبؤ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">تحليل تأثير الاقتراحات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suggestions.filter(s => s.status === 'pending').map(suggestion => (
                  <div key={suggestion.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium text-sm">{suggestion.title}</h4>
                      <p className="text-green-400 text-xs">{suggestion.impact}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-amber-500/50 text-amber-400"
                      onClick={() => predictImpactMutation.mutate(suggestion)}
                      disabled={predictImpactMutation.isPending}
                    >
                      {predictImpactMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Calculator className="w-3 h-3 ml-1" />}
                      تحليل مفصل
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'كفاءة الأتمتة', value: '87%', trend: '+5%', icon: TrendingUp, color: 'green' },
              { title: 'توفير الطاقة', value: '23%', trend: '+8%', icon: Zap, color: 'amber' },
              { title: 'دقة التنبؤ', value: '91%', trend: '+2%', icon: Target, color: 'purple' }
            ].map((stat, i) => (
              <Card key={i} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4 text-center">
                  <stat.icon className={`w-8 h-8 text-${stat.color}-400 mx-auto mb-2`} />
                  <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                  <p className="text-slate-400 text-xs">{stat.title}</p>
                  <Badge className="bg-green-500/20 text-green-400 text-xs mt-2">{stat.trend}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Generated Rule Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              الأتمتة المُنشأة
            </DialogTitle>
          </DialogHeader>
          {generatedRule && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <h4 className="text-white font-bold mb-2">{generatedRule.ruleName}</h4>
                <p className="text-slate-300 text-sm">{generatedRule.description}</p>
              </div>
              
              {generatedRule.triggers && (
                <div>
                  <h5 className="text-slate-300 text-sm mb-2">المشغّلات ({generatedRule.triggers.length}):</h5>
                  <div className="space-y-2">
                    {generatedRule.triggers.map((trigger, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-cyan-500/10 rounded">
                        <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">{trigger.logicalOperator || 'و'}</Badge>
                        <span className="text-white text-sm">{trigger.type} {trigger.operator} {trigger.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {generatedRule.trigger && !generatedRule.triggers && (
                <div>
                  <h5 className="text-slate-300 text-sm mb-2">المشغّل:</h5>
                  <div className="p-2 bg-slate-800/50 rounded">
                    <p className="text-white text-sm">{generatedRule.trigger?.condition}</p>
                    {generatedRule.trigger?.time && <p className="text-slate-400 text-xs">الوقت: {generatedRule.trigger.time}</p>}
                  </div>
                </div>
              )}

              <div>
                <h5 className="text-slate-300 text-sm mb-2">الإجراءات ({generatedRule.actions?.length || 0}):</h5>
                <div className="space-y-2">
                  {generatedRule.actions?.map((action, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
                      <Badge className="bg-purple-500/20 text-purple-400 text-xs">{action.order || i + 1}</Badge>
                      <span className="text-white text-sm">{action.device}: {action.action}</span>
                      {action.delay && <Badge className="bg-amber-500/20 text-amber-400 text-xs">تأخير: {action.delay}</Badge>}
                    </div>
                  ))}
                </div>
              </div>

              {generatedRule.estimatedImpact && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-green-400" />
                    <span className="text-green-300 text-sm font-medium">التأثير المتوقع</span>
                  </div>
                  <p className="text-white text-sm">{generatedRule.estimatedImpact}</p>
                </div>
              )}

              {generatedRule.explanation && (
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-300 text-sm">{generatedRule.explanation}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="border-amber-500/50 text-amber-400"
                  onClick={() => predictImpactMutation.mutate(generatedRule)}
                  disabled={predictImpactMutation.isPending}
                >
                  {predictImpactMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4 ml-2" />}
                  تنبؤ التأثير
                </Button>
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={applyGeneratedRule}>
                  <Check className="w-4 h-4 ml-2" />
                  تطبيق الأتمتة
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Impact Prediction Dialog */}
      <Dialog open={showImpactDialog} onOpenChange={setShowImpactDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              تحليل التأثير المتوقع
            </DialogTitle>
          </DialogHeader>
          {selectedImpactRule && selectedImpactRule.impact && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <h4 className="text-white font-bold mb-1">{selectedImpactRule.title || selectedImpactRule.ruleName}</h4>
                <p className="text-slate-400 text-sm">{selectedImpactRule.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                  <Zap className="w-6 h-6 text-green-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-400">
                    {selectedImpactRule.impact.energyImpact?.direction === 'decrease' ? '-' : '+'}
                    {selectedImpactRule.impact.energyImpact?.percentage}%
                  </p>
                  <p className="text-slate-400 text-xs">استهلاك الطاقة</p>
                </div>
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-center">
                  <DollarSign className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-cyan-400">
                    {selectedImpactRule.impact.costImpact?.monthlyChange} {selectedImpactRule.impact.costImpact?.currency || 'ر.س'}
                  </p>
                  <p className="text-slate-400 text-xs">التوفير الشهري</p>
                </div>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-lg">
                <h5 className="text-slate-300 text-sm font-medium mb-1">التأثير على الراحة</h5>
                <p className="text-white text-sm">{selectedImpactRule.impact.comfortImpact}</p>
              </div>

              {selectedImpactRule.impact.risks?.length > 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <h5 className="text-red-300 text-sm font-medium mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    المخاطر المحتملة
                  </h5>
                  <ul className="space-y-1">
                    {selectedImpactRule.impact.risks.map((risk, i) => (
                      <li key={i} className="text-white text-xs">• {risk}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedImpactRule.impact.recommendations?.length > 0 && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <h5 className="text-purple-300 text-sm font-medium mb-2">التوصيات</h5>
                  <ul className="space-y-1">
                    {selectedImpactRule.impact.recommendations.map((rec, i) => (
                      <li key={i} className="text-white text-xs flex items-center gap-1">
                        <Check className="w-3 h-3 text-green-400" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                <p className="text-slate-400 text-xs mb-1">التقييم العام</p>
                <p className="text-3xl font-bold text-green-400">{selectedImpactRule.impact.overallScore}/100</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Complex Automation Dialog */}
      <Dialog open={showComplexDialog} onOpenChange={setShowComplexDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              إنشاء أتمتة متقدمة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-slate-400 text-sm">اختر قالب لإنشاء أتمتة معقدة متعددة الشروط والإجراءات</p>
            
            <div className="space-y-3">
              {complexTemplates.map(template => (
                <Card 
                  key={template.id}
                  className={`glass-card cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id 
                      ? 'border-amber-500/50 bg-amber-500/10' 
                      : 'border-indigo-500/20 bg-[#0f1629]/80 hover:border-slate-600'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium">{template.name}</h4>
                      <Badge className={`text-xs ${
                        template.complexity === 'عالي جداً' ? 'bg-red-500/20 text-red-400' :
                        template.complexity === 'عالي' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {template.complexity}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.triggers.map((t, i) => (
                        <Badge key={i} variant="outline" className="border-cyan-500/50 text-cyan-400 text-xs">{t}</Badge>
                      ))}
                      <span className="text-slate-500 text-xs mx-1">→</span>
                      {template.actions.slice(0, 2).map((a, i) => (
                        <Badge key={i} variant="outline" className="border-purple-500/50 text-purple-400 text-xs">{a}</Badge>
                      ))}
                      {template.actions.length > 2 && (
                        <Badge variant="outline" className="border-slate-500/50 text-slate-400 text-xs">+{template.actions.length - 2}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button 
              className="w-full bg-amber-600 hover:bg-amber-700"
              onClick={() => selectedTemplate && buildComplexAutomationMutation.mutate(selectedTemplate)}
              disabled={!selectedTemplate || buildComplexAutomationMutation.isPending}
            >
              {buildComplexAutomationMutation.isPending ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Wand2 className="w-4 h-4 ml-2" />}
              بناء الأتمتة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}