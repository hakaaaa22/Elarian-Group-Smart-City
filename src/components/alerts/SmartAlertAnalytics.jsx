import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, TrendingUp, AlertTriangle, Target, Lightbulb, History,
  BarChart3, Clock, Zap, Shield, Activity, RefreshCw, ChevronDown,
  CheckCircle, XCircle, ArrowUpRight, ArrowDownRight, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';

const historicalPatterns = [
  { period: 'صباحاً (6-12)', avgAlerts: 45, peakHour: '09:00', trend: 'up' },
  { period: 'ظهراً (12-18)', avgAlerts: 78, peakHour: '14:00', trend: 'stable' },
  { period: 'مساءً (18-24)', avgAlerts: 32, peakHour: '20:00', trend: 'down' },
  { period: 'ليلاً (0-6)', avgAlerts: 15, peakHour: '02:00', trend: 'down' },
];

const trendData = [
  { day: 'السبت', alerts: 45, predicted: 48 },
  { day: 'الأحد', alerts: 52, predicted: 55 },
  { day: 'الاثنين', alerts: 78, predicted: 75 },
  { day: 'الثلاثاء', alerts: 65, predicted: 68 },
  { day: 'الأربعاء', alerts: 58, predicted: 60 },
  { day: 'الخميس', alerts: 42, predicted: 45 },
  { day: 'الجمعة', alerts: 28, predicted: 30 },
];

const impactCategories = [
  { level: 'critical', label: 'تأثير حرج', description: 'يؤثر على خدمات المدينة الأساسية', count: 3, color: 'red' },
  { level: 'high', label: 'تأثير عالي', description: 'يؤثر على قطاع أو منطقة كاملة', count: 12, color: 'amber' },
  { level: 'medium', label: 'تأثير متوسط', description: 'يؤثر على خدمة أو مبنى واحد', count: 45, color: 'blue' },
  { level: 'low', label: 'تأثير منخفض', description: 'تأثير محدود على العمليات', count: 89, color: 'green' },
];

const activeAlerts = [
  {
    id: 'A-001',
    title: 'ازدحام مروري شديد - طريق الملك فهد',
    type: 'traffic',
    impact: 'high',
    confidence: 92,
    prediction: 'متوقع استمرار الازدحام لمدة 45 دقيقة',
    recommendation: 'تفعيل الإشارات الذكية وتحويل حركة المرور للطرق البديلة',
    timestamp: '2025-01-15 10:30'
  },
  {
    id: 'A-002',
    title: 'ارتفاع استهلاك الطاقة - المنطقة الشرقية',
    type: 'energy',
    impact: 'medium',
    confidence: 87,
    prediction: 'احتمال وصول للحد الأقصى خلال ساعتين',
    recommendation: 'تقليل الأحمال غير الضرورية وتفعيل وضع التوفير',
    timestamp: '2025-01-15 10:25'
  },
  {
    id: 'A-003',
    title: 'تسرب مياه محتمل - شارع العليا',
    type: 'utilities',
    impact: 'high',
    confidence: 78,
    prediction: 'تأثير على 500 وحدة سكنية في حال التأكد',
    recommendation: 'إرسال فريق فحص فوري والتنسيق مع شركة المياه',
    timestamp: '2025-01-15 10:20'
  },
];

export default function SmartAlertAnalytics() {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [generatingRecommendation, setGeneratingRecommendation] = useState(false);

  const generateAIRecommendation = useMutation({
    mutationFn: async (alert) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          أنت خبير في إدارة المدن الذكية. لديك التنبيه التالي:
          العنوان: ${alert.title}
          النوع: ${alert.type}
          مستوى التأثير: ${alert.impact}
          التنبؤ: ${alert.prediction}
          
          قدم توصيات مفصلة وعملية للتعامل مع هذا التنبيه تشمل:
          1. الإجراءات الفورية المطلوبة
          2. الجهات التي يجب إشراكها
          3. الجدول الزمني المقترح
          4. البدائل في حال فشل الحل الأساسي
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            immediate_actions: { type: 'array', items: { type: 'string' } },
            stakeholders: { type: 'array', items: { type: 'string' } },
            timeline: { type: 'string' },
            alternatives: { type: 'array', items: { type: 'string' } },
            risk_assessment: { type: 'string' }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      toast.success('تم توليد التوصيات بنجاح');
    }
  });

  const getImpactBadge = (impact) => {
    const config = impactCategories.find(c => c.level === impact);
    if (!config) return null;
    return (
      <Badge className={`bg-${config.color}-500/20 text-${config.color}-400`}>
        {config.label}
      </Badge>
    );
  };

  const stats = {
    totalAlerts: impactCategories.reduce((acc, c) => acc + c.count, 0),
    predictedToday: 68,
    accuracy: 94.5,
    avgResponseTime: '12 دقيقة'
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <AlertTriangle className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalAlerts}</p>
              <p className="text-purple-400 text-sm">التنبيهات النشطة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Brain className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.predictedToday}</p>
              <p className="text-cyan-400 text-sm">متوقع اليوم</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Target className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.accuracy}%</p>
              <p className="text-green-400 text-sm">دقة التنبؤ</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.avgResponseTime}</p>
              <p className="text-amber-400 text-sm">متوسط الاستجابة</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Impact Classification */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              تصنيف التأثير على المدينة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {impactCategories.map(category => (
              <div key={category.level} className={`p-3 rounded-lg bg-${category.color}-500/5 border border-${category.color}-500/20`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-${category.color}-400 font-bold`}>{category.label}</span>
                  <Badge className={`bg-${category.color}-500/20 text-${category.color}-400`}>
                    {category.count}
                  </Badge>
                </div>
                <p className="text-slate-500 text-xs">{category.description}</p>
                <Progress 
                  value={(category.count / stats.totalAlerts) * 100} 
                  className="h-1 mt-2" 
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card className="lg:col-span-2 bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              تحليل الأنماط التاريخية والتنبؤات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="alerts" stroke="#8B5CF6" fill="url(#colorAlerts)" strokeWidth={2} name="فعلي" />
                  <Area type="monotone" dataKey="predicted" stroke="#06B6D4" fill="url(#colorPredicted)" strokeWidth={2} strokeDasharray="5 5" name="متوقع" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-slate-400 text-sm">التنبيهات الفعلية</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500" />
                <span className="text-slate-400 text-sm">التنبؤات</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts with AI Recommendations */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            التنبيهات النشطة مع توصيات AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeAlerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-cyan-400 font-mono text-sm">{alert.id}</span>
                    {getImpactBadge(alert.impact)}
                    <Badge className="bg-purple-500/20 text-purple-400">
                      {alert.confidence}% ثقة
                    </Badge>
                  </div>
                  <h3 className="text-white font-bold">{alert.title}</h3>
                  <p className="text-slate-500 text-xs mt-1">{alert.timestamp}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-cyan-500/50 text-cyan-400"
                  onClick={() => generateAIRecommendation.mutate(alert)}
                  disabled={generateAIRecommendation.isPending}
                >
                  {generateAIRecommendation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Brain className="w-4 h-4 ml-1" />
                      توصية AI
                    </>
                  )}
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 text-sm font-medium">التنبؤ</span>
                  </div>
                  <p className="text-slate-300 text-sm">{alert.prediction}</p>
                </div>
                <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-400 text-sm font-medium">التوصية</span>
                  </div>
                  <p className="text-slate-300 text-sm">{alert.recommendation}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Historical Patterns */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-green-400" />
            أنماط التنبيهات حسب الفترة الزمنية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {historicalPatterns.map((pattern, i) => (
              <div key={i} className="p-4 bg-slate-900/50 rounded-lg text-center">
                <p className="text-slate-400 text-sm mb-2">{pattern.period}</p>
                <p className="text-3xl font-bold text-white mb-1">{pattern.avgAlerts}</p>
                <p className="text-slate-500 text-xs mb-2">متوسط التنبيهات</p>
                <div className="flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span className="text-cyan-400 text-xs">ذروة: {pattern.peakHour}</span>
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {pattern.trend === 'up' ? (
                    <ArrowUpRight className="w-3 h-3 text-red-400" />
                  ) : pattern.trend === 'down' ? (
                    <ArrowDownRight className="w-3 h-3 text-green-400" />
                  ) : (
                    <Activity className="w-3 h-3 text-amber-400" />
                  )}
                  <span className={`text-xs ${
                    pattern.trend === 'up' ? 'text-red-400' : 
                    pattern.trend === 'down' ? 'text-green-400' : 'text-amber-400'
                  }`}>
                    {pattern.trend === 'up' ? 'متزايد' : pattern.trend === 'down' ? 'متناقص' : 'مستقر'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}