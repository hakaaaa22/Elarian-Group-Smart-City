import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import {
  Brain, Sparkles, AlertTriangle, TrendingUp, Target, Clock,
  Shield, Wrench, Users, Car, Camera, Zap, Building2, Activity,
  Check, X, ChevronRight, BarChart3, LineChart, Bell, Eye,
  ThumbsUp, ThumbsDown, RefreshCw, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';

const IMPACT_LEVELS = {
  critical: { label: 'تأثير حرج', color: 'red', priority: 4, cityImpact: 'تأثير واسع على المدينة' },
  high: { label: 'تأثير عالي', color: 'orange', priority: 3, cityImpact: 'تأثير على منطقة واسعة' },
  medium: { label: 'تأثير متوسط', color: 'amber', priority: 2, cityImpact: 'تأثير محلي محدود' },
  low: { label: 'تأثير منخفض', color: 'blue', priority: 1, cityImpact: 'تأثير ضئيل' },
};

const ALERT_CATEGORIES = {
  infrastructure: { icon: Building2, color: '#8B5CF6', label: 'البنية التحتية' },
  traffic: { icon: Car, color: '#EF4444', label: 'المرور' },
  security: { icon: Shield, color: '#EC4899', label: 'الأمن' },
  maintenance: { icon: Wrench, color: '#F59E0B', label: 'الصيانة' },
  environment: { icon: Zap, color: '#22C55E', label: 'البيئة' },
};

// بيانات التنبؤات
const mockPredictions = [
  {
    id: 1,
    category: 'traffic',
    title: 'ازدحام مروري متوقع',
    description: 'تحليل الأنماط التاريخية يشير إلى ازدحام في تقاطع الملك فهد خلال الساعتين القادمتين',
    predictedTime: '2 ساعة',
    confidence: 87,
    impact: 'high',
    historicalPattern: 'يتكرر كل يوم أحد بين 4-6 مساءً',
    affectedArea: 'المنطقة الشرقية',
    recommendation: 'تفعيل خطة المسارات البديلة وإرسال إشعارات للسائقين',
    actions: [
      { id: 'activate_plan', label: 'تفعيل الخطة البديلة', type: 'primary' },
      { id: 'send_alert', label: 'إرسال تنبيه', type: 'default' },
    ],
    trend: [
      { time: '12:00', value: 30 }, { time: '14:00', value: 45 },
      { time: '16:00', value: 75 }, { time: '18:00', value: 85 },
      { time: '20:00', value: 50 },
    ]
  },
  {
    id: 2,
    category: 'maintenance',
    title: 'عطل متوقع في مضخة المياه',
    description: 'بناءً على تحليل بيانات المستشعرات، محطة المياه M-3 تظهر علامات تدهور',
    predictedTime: '48 ساعة',
    confidence: 92,
    impact: 'critical',
    historicalPattern: 'نمط مشابه لعطل سابق قبل 3 أشهر',
    affectedArea: 'الحي الغربي - 5000 منزل',
    recommendation: 'جدولة صيانة وقائية فورية وتجهيز مضخة احتياطية',
    actions: [
      { id: 'schedule_maintenance', label: 'جدولة صيانة', type: 'primary' },
      { id: 'prepare_backup', label: 'تجهيز احتياطي', type: 'default' },
    ],
    trend: [
      { time: 'يوم 1', value: 95 }, { time: 'يوم 2', value: 88 },
      { time: 'يوم 3', value: 82 }, { time: 'يوم 4', value: 75 },
      { time: 'يوم 5', value: 68 },
    ]
  },
  {
    id: 3,
    category: 'security',
    title: 'نشاط غير اعتيادي متوقع',
    description: 'تحليل السلوك يشير إلى احتمال زيادة الحركة في المنطقة الصناعية ليلاً',
    predictedTime: '6 ساعات',
    confidence: 78,
    impact: 'medium',
    historicalPattern: 'لوحظ نمط مشابه في نهاية كل شهر',
    affectedArea: 'المنطقة الصناعية',
    recommendation: 'زيادة الدوريات الأمنية وتفعيل الكاميرات الإضافية',
    actions: [
      { id: 'increase_patrol', label: 'زيادة الدوريات', type: 'primary' },
      { id: 'activate_cameras', label: 'تفعيل كاميرات', type: 'default' },
    ],
    trend: [
      { time: '20:00', value: 20 }, { time: '22:00', value: 35 },
      { time: '00:00', value: 55 }, { time: '02:00', value: 45 },
      { time: '04:00', value: 25 },
    ]
  },
];

// التنبيهات الحالية مع تصنيف AI
const mockCurrentAlerts = [
  {
    id: 1,
    category: 'infrastructure',
    title: 'انخفاض ضغط المياه',
    message: 'محطة M-5 تسجل ضغط أقل من المعدل الطبيعي',
    timestamp: new Date().toISOString(),
    impact: 'medium',
    aiClassification: { category: 'maintenance', confidence: 94 },
    aiRecommendation: 'فحص الصمامات الرئيسية والتأكد من عدم وجود تسريب',
    contextFactors: ['درجة الحرارة مرتفعة اليوم', 'زيادة الاستهلاك بنسبة 15%', 'صيانة قريبة مجدولة'],
  },
  {
    id: 2,
    category: 'traffic',
    title: 'حادث مروري',
    message: 'تم رصد حادث في طريق الملك عبدالله',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    impact: 'high',
    aiClassification: { category: 'traffic', confidence: 98 },
    aiRecommendation: 'تحويل حركة المرور عبر الطريق البديل وإرسال فرق الطوارئ',
    contextFactors: ['ساعة ذروة', 'طريق رئيسي', 'مستشفى قريب'],
  },
];

export default function PredictiveAlertSystem() {
  const [activeTab, setActiveTab] = useState('predictions');
  const [predictions, setPredictions] = useState(mockPredictions);
  const [currentAlerts, setCurrentAlerts] = useState(mockCurrentAlerts);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // AI Analysis Mutation
  const aiAnalysisMutation = useMutation({
    mutationFn: async (alertData) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل التنبيه التالي وقدم توصيات مخصصة بناءً على السياق:
        
        التنبيه: ${alertData.title}
        الوصف: ${alertData.message}
        الفئة: ${alertData.category}
        التأثير: ${alertData.impact}
        العوامل السياقية: ${alertData.contextFactors?.join(', ')}
        
        قدم:
        1. تحليل شامل للموقف
        2. توصيات محددة للإجراءات
        3. تقييم المخاطر المحتملة
        4. خطوات الوقاية المستقبلية`,
        response_json_schema: {
          type: "object",
          properties: {
            analysis: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } },
            riskLevel: { type: "string" },
            preventionSteps: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      toast.success('تم تحليل التنبيه بنجاح');
    }
  });

  const executeAction = (prediction, action) => {
    toast.success(`تم تنفيذ: ${action.label}`);
  };

  const provideFeedback = (predictionId, isPositive) => {
    toast.success(isPositive ? 'شكراً على التقييم الإيجابي' : 'شكراً على الملاحظات');
  };

  const stats = {
    totalPredictions: predictions.length,
    highConfidence: predictions.filter(p => p.confidence >= 85).length,
    criticalImpact: predictions.filter(p => p.impact === 'critical').length,
    accuracy: 89, // نسبة دقة التنبؤات السابقة
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ boxShadow: ['0 0 0 rgba(139, 92, 246, 0.4)', '0 0 20px rgba(139, 92, 246, 0.6)', '0 0 0 rgba(139, 92, 246, 0.4)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20"
          >
            <Brain className="w-6 h-6 text-purple-400" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              نظام التنبيهات التنبؤي
              <Badge className="bg-purple-500/20 text-purple-400">
                <Sparkles className="w-3 h-3 ml-1" />
                AI
              </Badge>
            </h3>
            <p className="text-slate-400 text-xs">تحليل الأنماط والتنبؤ بالمشاكل المحتملة</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500/20 text-green-400">
            دقة التنبؤات: {stats.accuracy}%
          </Badge>
          <Button variant="outline" className="border-slate-700">
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث التحليل
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'تنبؤات نشطة', value: stats.totalPredictions, icon: Target, color: 'cyan' },
          { label: 'ثقة عالية', value: stats.highConfidence, icon: TrendingUp, color: 'green' },
          { label: 'تأثير حرج', value: stats.criticalImpact, icon: AlertTriangle, color: 'red' },
          { label: 'دقة النظام', value: `${stats.accuracy}%`, icon: Brain, color: 'purple' },
        ].map((stat, i) => (
          <Card key={i} className={`bg-${stat.color}-500/10 border-${stat.color}-500/30`}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              </div>
              <div>
                <p className={`text-xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                <p className="text-slate-400 text-xs">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="predictions" className="data-[state=active]:bg-purple-500/20">
            <Target className="w-4 h-4 ml-1" />
            التنبؤات
          </TabsTrigger>
          <TabsTrigger value="current" className="data-[state=active]:bg-cyan-500/20">
            <Bell className="w-4 h-4 ml-1" />
            التنبيهات الحالية
          </TabsTrigger>
          <TabsTrigger value="patterns" className="data-[state=active]:bg-green-500/20">
            <BarChart3 className="w-4 h-4 ml-1" />
            الأنماط
          </TabsTrigger>
        </TabsList>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="mt-4 space-y-3">
          {predictions.map((prediction, i) => {
            const category = ALERT_CATEGORIES[prediction.category];
            const impact = IMPACT_LEVELS[prediction.impact];
            const CategoryIcon = category.icon;

            return (
              <motion.div
                key={prediction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`bg-${impact.color}-500/5 border-${impact.color}-500/30 hover:border-${impact.color}-500/50 transition-all cursor-pointer`}
                  onClick={() => setSelectedPrediction(selectedPrediction?.id === prediction.id ? null : prediction)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg" style={{ background: `${category.color}20` }}>
                          <CategoryIcon className="w-5 h-5" style={{ color: category.color }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-medium">{prediction.title}</h4>
                            <Badge className={`bg-${impact.color}-500/20 text-${impact.color}-400`}>
                              {impact.label}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm">{prediction.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              متوقع خلال: {prediction.predictedTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              المنطقة: {prediction.affectedArea}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-slate-400 text-xs">الثقة</span>
                          <span className={`font-bold ${prediction.confidence >= 85 ? 'text-green-400' : prediction.confidence >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                            {prediction.confidence}%
                          </span>
                        </div>
                        <Progress value={prediction.confidence} className="w-24 h-2" />
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {selectedPrediction?.id === prediction.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-slate-700/50"
                        >
                          <div className="grid lg:grid-cols-2 gap-4">
                            {/* Trend Chart */}
                            <div>
                              <p className="text-slate-400 text-sm mb-2">اتجاه التنبؤ</p>
                              <div className="h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={prediction.trend}>
                                    <defs>
                                      <linearGradient id={`gradient-${prediction.id}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={category.color} stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor={category.color} stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                                    <YAxis stroke="#94a3b8" fontSize={10} />
                                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                                    <Area type="monotone" dataKey="value" stroke={category.color} fill={`url(#gradient-${prediction.id})`} />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-3">
                              <div className="p-3 bg-slate-800/50 rounded-lg">
                                <p className="text-slate-400 text-xs mb-1">النمط التاريخي</p>
                                <p className="text-white text-sm">{prediction.historicalPattern}</p>
                              </div>
                              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <Brain className="w-4 h-4 text-purple-400" />
                                  <span className="text-purple-400 text-sm font-medium">توصية AI</span>
                                </div>
                                <p className="text-white text-sm">{prediction.recommendation}</p>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                            <div className="flex gap-2">
                              {prediction.actions.map(action => (
                                <Button
                                  key={action.id}
                                  size="sm"
                                  className={action.type === 'primary' ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-slate-700 hover:bg-slate-600'}
                                  onClick={(e) => { e.stopPropagation(); executeAction(prediction, action); }}
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 text-xs">هل كان التنبؤ مفيداً؟</span>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); provideFeedback(prediction.id, true); }}>
                                <ThumbsUp className="w-4 h-4 text-green-400" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); provideFeedback(prediction.id, false); }}>
                                <ThumbsDown className="w-4 h-4 text-red-400" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

        {/* Current Alerts Tab */}
        <TabsContent value="current" className="mt-4 space-y-3">
          {currentAlerts.map((alert, i) => {
            const category = ALERT_CATEGORIES[alert.category];
            const impact = IMPACT_LEVELS[alert.impact];
            const CategoryIcon = category.icon;

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`bg-${impact.color}-500/10 border-${impact.color}-500/30`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 rounded-lg" style={{ background: `${category.color}20` }}>
                        <CategoryIcon className="w-5 h-5" style={{ color: category.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-medium">{alert.title}</h4>
                          <Badge className={`bg-${impact.color}-500/20 text-${impact.color}-400`}>
                            {impact.label}
                          </Badge>
                          <Badge className="bg-purple-500/20 text-purple-400">
                            <Brain className="w-3 h-3 ml-1" />
                            AI: {alert.aiClassification.confidence}%
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm">{alert.message}</p>
                      </div>
                    </div>

                    {/* AI Analysis */}
                    <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 text-sm font-medium">توصية AI المخصصة</span>
                      </div>
                      <p className="text-white text-sm">{alert.aiRecommendation}</p>
                    </div>

                    {/* Context Factors */}
                    <div>
                      <p className="text-slate-500 text-xs mb-2">العوامل السياقية:</p>
                      <div className="flex flex-wrap gap-2">
                        {alert.contextFactors.map((factor, idx) => (
                          <Badge key={idx} variant="outline" className="border-slate-600 text-slate-400 text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="mt-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">الأنماط المكتشفة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { pattern: 'ازدحام مروري أيام الأحد 4-6 مساءً', frequency: 'أسبوعي', confidence: 92 },
                { pattern: 'زيادة استهلاك المياه أيام الجمعة', frequency: 'أسبوعي', confidence: 88 },
                { pattern: 'أعطال الكاميرات بعد الأمطار', frequency: 'موسمي', confidence: 85 },
                { pattern: 'ذروة طلبات الصيانة نهاية الشهر', frequency: 'شهري', confidence: 90 },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-slate-800/50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm">{item.pattern}</p>
                    <Badge className="bg-slate-700 text-slate-300 text-xs mt-1">{item.frequency}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={item.confidence} className="w-20 h-2" />
                    <span className="text-green-400 font-bold text-sm">{item.confidence}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}