import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, Shield, AlertTriangle, Eye, Camera, User, Clock, TrendingUp,
  Activity, Zap, Target, Link2, Video, MapPin, Bell, ChevronRight,
  RefreshCw, Loader2, AlertOctagon, CheckCircle, XCircle, Sparkles,
  FileText, History, Play, Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';

const behaviorPatterns = [
  { pattern: 'مدة زيارة طويلة غير معتادة', count: 8, severity: 'medium', trend: 'up' },
  { pattern: 'تردد على مناطق حساسة', count: 3, severity: 'high', trend: 'stable' },
  { pattern: 'محاولات دخول خارج أوقات العمل', count: 5, severity: 'critical', trend: 'up' },
  { pattern: 'تغيير مفاجئ في نمط الحركة', count: 12, severity: 'low', trend: 'down' },
];

const correlatedAlerts = [
  {
    id: 1,
    alert: 'تجاوز وقت الخروج المسموح',
    severity: 'high',
    timestamp: '2025-01-15 14:30',
    visitor: { name: 'سارة خالد', id: 'V-4521', permit: 'P-2024-089' },
    linkedData: {
      cameras: ['كاميرا البوابة الرئيسية', 'كاميرا الممر A'],
      zones: ['منطقة الاستقبال', 'المكاتب الإدارية'],
      duration: '2:30 ساعة تجاوز'
    },
    aiInsight: 'نمط متكرر - 3 تجاوزات في آخر شهر',
    confidence: 94
  },
  {
    id: 2,
    alert: 'كشف وجه غير مطابق',
    severity: 'critical',
    timestamp: '2025-01-15 13:45',
    visitor: { name: 'زائر غير معروف', id: 'UNKNOWN', permit: '-' },
    linkedData: {
      cameras: ['كاميرا المستودع'],
      zones: ['منطقة المستودعات'],
      duration: '5 دقائق'
    },
    aiInsight: 'تطابق 23% فقط مع قاعدة البيانات - يتطلب تحقق فوري',
    confidence: 98
  },
];

const predictiveRisks = [
  { risk: 'ذروة ازدحام متوقعة', probability: 85, timeframe: 'خلال ساعتين', impact: 'medium', action: 'تعزيز نقاط الأمان' },
  { risk: 'تصاريح منتهية قيد الاستخدام', probability: 72, timeframe: 'اليوم', impact: 'high', action: 'إرسال تنبيهات' },
  { risk: 'محاولة دخول غير مصرح', probability: 45, timeframe: 'هذا الأسبوع', impact: 'critical', action: 'مراقبة مكثفة' },
];

const trendData = [
  { hour: '06:00', anomalies: 2, threats: 0, predictions: 1 },
  { hour: '08:00', anomalies: 8, threats: 2, predictions: 5 },
  { hour: '10:00', anomalies: 15, threats: 4, predictions: 8 },
  { hour: '12:00', anomalies: 12, threats: 3, predictions: 6 },
  { hour: '14:00', anomalies: 20, threats: 6, predictions: 12 },
  { hour: '16:00', anomalies: 18, threats: 5, predictions: 10 },
  { hour: '18:00', anomalies: 8, threats: 2, predictions: 4 },
];

const radarData = [
  { metric: 'سلوك الزوار', value: 75, fullMark: 100 },
  { metric: 'أنماط الوصول', value: 60, fullMark: 100 },
  { metric: 'تهديدات خارجية', value: 40, fullMark: 100 },
  { metric: 'انتهاكات داخلية', value: 55, fullMark: 100 },
  { metric: 'أمان الكاميرات', value: 85, fullMark: 100 },
  { metric: 'سلامة البوابات', value: 90, fullMark: 100 },
];

export default function AdvancedAISecurityModule() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [aiStatus, setAiStatus] = useState('active');
  const [aiRecommendation, setAiRecommendation] = useState(null);

  const proactiveAnalysisMutation = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت محلل أمني ذكي. قم بتحليل البيانات الأمنية التالية وقدم توصيات استباقية:
        
        أنماط السلوك المكتشفة:
        ${behaviorPatterns.map(p => `- ${p.pattern}: ${p.count} حالة (${p.severity})`).join('\n')}
        
        التنبيهات النشطة:
        ${correlatedAlerts.map(a => `- ${a.alert}: ${a.severity} - ${a.aiInsight}`).join('\n')}
        
        المخاطر المتوقعة:
        ${predictiveRisks.map(r => `- ${r.risk}: ${r.probability}% احتمال`).join('\n')}
        
        قدم تحليلاً شاملاً مع:
        1. أهم 3 مخاطر يجب التركيز عليها
        2. إجراءات وقائية مقترحة
        3. توقعات للـ 24 ساعة القادمة`,
        response_json_schema: {
          type: "object",
          properties: {
            top_risks: { type: "array", items: { type: "string" } },
            preventive_actions: { type: "array", items: { type: "string" } },
            predictions_24h: { type: "string" },
            overall_risk_level: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAiRecommendation(data);
      toast.success('تم تحديث التحليل الاستباقي بنجاح');
    }
  });

  const runProactiveAnalysis = async () => {
    setIsAnalyzing(true);
    await proactiveAnalysisMutation.mutateAsync();
    setIsAnalyzing(false);
  };

  const getSeverityConfig = (severity) => {
    const config = {
      low: { color: 'green', label: 'منخفض' },
      medium: { color: 'amber', label: 'متوسط' },
      high: { color: 'orange', label: 'عالي' },
      critical: { color: 'red', label: 'حرج' },
    };
    return config[severity] || config.low;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              boxShadow: ['0 0 20px rgba(139, 92, 246, 0.4)', '0 0 40px rgba(236, 72, 153, 0.4)', '0 0 20px rgba(139, 92, 246, 0.4)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20"
          >
            <Brain className="w-7 h-7 text-purple-400" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              وحدة الأمان الذكية المتقدمة
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h3>
            <p className="text-slate-500 text-sm">تحليل استباقي • ربط تلقائي • تنبؤات ذكية</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
            <Activity className="w-4 h-4 text-green-400 animate-pulse" />
            <span className="text-green-400 text-sm">AI نشط</span>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={runProactiveAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Zap className="w-4 h-4 ml-2" />}
            تحليل استباقي
          </Button>
        </div>
      </div>

      {/* Proactive Behavior Analysis */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            تحليل السلوك الاستباقي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {behaviorPatterns.map((pattern, i) => {
              const severityConfig = getSeverityConfig(pattern.severity);
              return (
                <motion.div
                  key={pattern.pattern}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-4 rounded-lg border bg-${severityConfig.color}-500/5 border-${severityConfig.color}-500/30`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`bg-${severityConfig.color}-500/20 text-${severityConfig.color}-400`}>
                      {severityConfig.label}
                    </Badge>
                    <span className={`text-xs ${pattern.trend === 'up' ? 'text-red-400' : pattern.trend === 'down' ? 'text-green-400' : 'text-slate-400'}`}>
                      {pattern.trend === 'up' ? '↑' : pattern.trend === 'down' ? '↓' : '―'}
                    </span>
                  </div>
                  <p className="text-white font-medium text-sm mb-1">{pattern.pattern}</p>
                  <p className={`text-2xl font-bold text-${severityConfig.color}-400`}>{pattern.count}</p>
                  <p className="text-slate-500 text-xs">حالة مكتشفة</p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Correlated Alerts */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Link2 className="w-4 h-4 text-pink-400" />
              التنبيهات المترابطة تلقائياً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {correlatedAlerts.map(alert => {
                  const severityConfig = getSeverityConfig(alert.severity);
                  return (
                    <motion.div
                      key={alert.id}
                      whileHover={{ scale: 1.01 }}
                      className={`p-4 rounded-lg border cursor-pointer bg-${severityConfig.color}-500/5 border-${severityConfig.color}-500/30`}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-4 h-4 text-${severityConfig.color}-400`} />
                          <span className="text-white font-medium text-sm">{alert.alert}</span>
                        </div>
                        <Badge className={`bg-${severityConfig.color}-500/20 text-${severityConfig.color}-400`}>
                          {severityConfig.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                        <span><User className="w-3 h-3 inline ml-1" />{alert.visitor.name}</span>
                        <span><Clock className="w-3 h-3 inline ml-1" />{alert.timestamp}</span>
                      </div>

                      {/* Linked Data */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {alert.linkedData.cameras.map(cam => (
                          <Badge key={cam} variant="outline" className="border-pink-500/50 text-pink-400 text-xs">
                            <Camera className="w-3 h-3 ml-1" />{cam}
                          </Badge>
                        ))}
                      </div>

                      {/* AI Insight */}
                      <div className="p-2 bg-purple-500/10 rounded border border-purple-500/20 mt-2">
                        <p className="text-purple-400 text-xs flex items-center gap-1">
                          <Brain className="w-3 h-3" />
                          {alert.aiInsight}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={alert.confidence} className="h-1 flex-1" />
                          <span className="text-purple-400 text-xs">{alert.confidence}%</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Predictive Analytics */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              التحليلات التنبؤية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictiveRisks.map((risk, i) => {
                const impactConfig = getSeverityConfig(risk.impact);
                return (
                  <motion.div
                    key={risk.risk}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{risk.risk}</span>
                      <Badge className={`bg-${impactConfig.color}-500/20 text-${impactConfig.color}-400`}>
                        {risk.probability}% احتمال
                      </Badge>
                    </div>
                    <Progress value={risk.probability} className="h-2 mb-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500"><Clock className="w-3 h-3 inline ml-1" />{risk.timeframe}</span>
                      <span className="text-cyan-400"><Zap className="w-3 h-3 inline ml-1" />{risk.action}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations Panel */}
      {aiRecommendation && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                توصيات الذكاء الاصطناعي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-900/50 rounded-lg">
                  <h4 className="text-red-400 font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    أهم المخاطر
                  </h4>
                  <ul className="space-y-1">
                    {aiRecommendation.top_risks?.map((risk, i) => (
                      <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                        <span className="text-red-400">•</span>{risk}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-lg">
                  <h4 className="text-green-400 font-medium mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    إجراءات وقائية
                  </h4>
                  <ul className="space-y-1">
                    {aiRecommendation.preventive_actions?.map((action, i) => (
                      <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                        <span className="text-green-400">✓</span>{action}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-lg">
                  <h4 className="text-cyan-400 font-medium mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    توقعات 24 ساعة
                  </h4>
                  <p className="text-slate-300 text-sm">{aiRecommendation.predictions_24h}</p>
                  <Badge className={`mt-2 ${
                    aiRecommendation.overall_risk_level === 'critical' ? 'bg-red-500/20 text-red-400' :
                    aiRecommendation.overall_risk_level === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    aiRecommendation.overall_risk_level === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    مستوى الخطر: {aiRecommendation.overall_risk_level}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Alert Detail Dialog */}
      <AnimatePresence>
        {selectedAlert && (
          <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
            <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  تفاصيل التنبيه المترابط
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="text-white font-medium mb-2">{selectedAlert.alert}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-slate-500">الزائر:</span> <span className="text-white">{selectedAlert.visitor.name}</span></div>
                    <div><span className="text-slate-500">التصريح:</span> <span className="text-white">{selectedAlert.visitor.permit}</span></div>
                    <div><span className="text-slate-500">المدة:</span> <span className="text-white">{selectedAlert.linkedData.duration}</span></div>
                    <div><span className="text-slate-500">الثقة:</span> <span className="text-purple-400">{selectedAlert.confidence}%</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2"><Camera className="w-4 h-4 text-pink-400" />الكاميرات المرتبطة</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAlert.linkedData.cameras.map(cam => (
                      <Badge key={cam} className="bg-pink-500/20 text-pink-400">{cam}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-cyan-400" />المناطق</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAlert.linkedData.zones.map(zone => (
                      <Badge key={zone} variant="outline" className="border-cyan-500/50 text-cyan-400">{zone}</Badge>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <p className="text-purple-400 text-sm flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    {selectedAlert.aiInsight}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                    <Play className="w-4 h-4 ml-2" />عرض التسجيل
                  </Button>
                  <Button variant="outline" className="flex-1 border-slate-600">
                    <FileText className="w-4 h-4 ml-2" />عرض التصريح
                  </Button>
                  <Button variant="outline" className="flex-1 border-slate-600">
                    <History className="w-4 h-4 ml-2" />سجل الزيارات
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trend Analysis */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              تحليل الاتجاهات (اليوم)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="anomalyG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="threatG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="anomalies" stroke="#f59e0b" fill="url(#anomalyG)" name="شذوذات" />
                  <Area type="monotone" dataKey="threats" stroke="#ef4444" fill="url(#threatG)" name="تهديدات" />
                  <Line type="monotone" dataKey="predictions" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" name="تنبؤات" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Security Radar */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              رادار الأمان الشامل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={10} />
                  <PolarRadiusAxis stroke="#334155" />
                  <Radar name="مستوى الأمان" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}