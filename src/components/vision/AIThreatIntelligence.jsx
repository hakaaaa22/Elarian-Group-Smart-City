import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Shield, AlertTriangle, Eye, Globe, Lock, Loader2, RefreshCw, Download,
  Bell, Target, Zap, AlertOctagon, TrendingUp, Activity, Radio, Skull,
  FileText, Search, Filter, Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { toast } from 'sonner';
import AIAutomatedThreatResponse from './AIAutomatedThreatResponse';

const threatTrendData = [
  { date: 'الأحد', threats: 12, mitigated: 10, critical: 2 },
  { date: 'الإثنين', threats: 18, mitigated: 15, critical: 3 },
  { date: 'الثلاثاء', threats: 8, mitigated: 8, critical: 0 },
  { date: 'الأربعاء', threats: 25, mitigated: 20, critical: 5 },
  { date: 'الخميس', threats: 15, mitigated: 14, critical: 1 },
  { date: 'الجمعة', threats: 10, mitigated: 9, critical: 1 },
  { date: 'السبت', threats: 5, mitigated: 5, critical: 0 },
];

export default function AIThreatIntelligence() {
  const [intelligence, setIntelligence] = useState(null);
  const [activeTab, setActiveTab] = useState('realtime');
  const [autoMonitoring, setAutoMonitoring] = useState(true);
  const [alerts, setAlerts] = useState([]);

  // تحليل استخبارات التهديدات
  const analyzeThreatsMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل شامل لاستخبارات التهديدات لنماذج الذكاء الاصطناعي وتقديم:

1. التهديدات في الوقت الفعلي:
   - تهديدات من مصادر خارجية
   - نقاط ضعف مكتشفة
   - محاولات هجوم

2. مراقبة الويب المظلم:
   - تسريبات بيانات محتملة
   - نماذج مسروقة أو مقرصنة
   - مناقشات حول ثغرات

3. التنبؤ بالتهديدات:
   - تهديدات ناشئة
   - اتجاهات الهجمات
   - توقعات الخطورة

4. استراتيجيات التخفيف:
   - إجراءات فورية
   - تدابير وقائية
   - خطط الاستجابة`,
        response_json_schema: {
          type: "object",
          properties: {
            realtime_threats: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  threat_id: { type: "string" },
                  name: { type: "string" },
                  type: { type: "string" },
                  severity: { type: "string" },
                  source: { type: "string" },
                  affected_models: { type: "array", items: { type: "string" } },
                  description: { type: "string" },
                  status: { type: "string" }
                }
              }
            },
            dark_web_monitoring: {
              type: "object",
              properties: {
                data_leaks: { type: "array", items: { type: "string" } },
                stolen_models: { type: "array", items: { type: "string" } },
                vulnerability_discussions: { type: "array", items: { type: "string" } },
                risk_level: { type: "string" }
              }
            },
            threat_predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  threat_type: { type: "string" },
                  probability: { type: "number" },
                  timeframe: { type: "string" },
                  impact: { type: "string" },
                  indicators: { type: "array", items: { type: "string" } }
                }
              }
            },
            mitigation_strategies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  threat: { type: "string" },
                  immediate_actions: { type: "array", items: { type: "string" } },
                  preventive_measures: { type: "array", items: { type: "string" } },
                  priority: { type: "string" }
                }
              }
            },
            threat_assessment_report: {
              type: "object",
              properties: {
                overall_risk_level: { type: "string" },
                total_threats: { type: "number" },
                critical_threats: { type: "number" },
                mitigated_threats: { type: "number" },
                summary: { type: "string" }
              }
            }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setIntelligence(data);
      const criticalThreats = data.realtime_threats?.filter(t => t.severity === 'critical') || [];
      if (criticalThreats.length > 0) {
        setAlerts(criticalThreats);
        toast.error(`تحذير: ${criticalThreats.length} تهديد حرج مكتشف!`);
      } else {
        toast.success('تم تحديث استخبارات التهديدات');
      }
    },
    onError: () => {
      toast.error('حدث خطأ في التحليل');
    }
  });

  useEffect(() => {
    analyzeThreatsMutation.mutate();
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'amber';
      case 'low': return 'green';
      default: return 'slate';
    }
  };

  const stats = {
    total: intelligence?.threat_assessment_report?.total_threats || 0,
    critical: intelligence?.threat_assessment_report?.critical_threats || 0,
    mitigated: intelligence?.threat_assessment_report?.mitigated_threats || 0,
    riskLevel: intelligence?.threat_assessment_report?.overall_risk_level || 'N/A'
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 10px rgba(239, 68, 68, 0.3)',
                '0 0 20px rgba(239, 68, 68, 0.6)',
                '0 0 10px rgba(239, 68, 68, 0.3)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20"
          >
            <Shield className="w-6 h-6 text-red-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold text-lg">استخبارات التهديدات AI</h4>
            <p className="text-slate-400 text-xs">الوقت الفعلي • الويب المظلم • التنبؤات • التخفيف</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-lg">
            <Label className="text-slate-300 text-xs">مراقبة تلقائية</Label>
            <Switch checked={autoMonitoring} onCheckedChange={setAutoMonitoring} />
          </div>
          <Button
            variant="outline"
            className="border-red-500/50"
            onClick={() => analyzeThreatsMutation.mutate()}
            disabled={analyzeThreatsMutation.isPending}
          >
            {analyzeThreatsMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><RefreshCw className="w-4 h-4 ml-1" /> تحديث</>
            )}
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {alerts.length > 0 && (
        <Card className="bg-red-500/10 border-red-500/30 animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertOctagon className="w-8 h-8 text-red-400" />
              <div className="flex-1">
                <p className="text-red-400 font-bold">تهديدات حرجة نشطة!</p>
                <p className="text-slate-300 text-sm">{alerts.length} تهديد يتطلب اهتمام فوري</p>
              </div>
              <Button className="bg-red-600 hover:bg-red-700">
                عرض التفاصيل
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {analyzeThreatsMutation.isPending && !intelligence && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-10 h-10 text-red-400 mx-auto mb-4 animate-spin" />
            <p className="text-white">جاري تحليل استخبارات التهديدات...</p>
          </CardContent>
        </Card>
      )}

      {intelligence && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-3 text-center">
                <Target className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{stats.total}</p>
                <p className="text-slate-400 text-xs">إجمالي التهديدات</p>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-3 text-center">
                <AlertOctagon className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{stats.critical}</p>
                <p className="text-slate-400 text-xs">تهديدات حرجة</p>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-3 text-center">
                <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{stats.mitigated}</p>
                <p className="text-slate-400 text-xs">تم التخفيف</p>
              </CardContent>
            </Card>
            <Card className={`bg-${getSeverityColor(stats.riskLevel.toLowerCase())}-500/10 border-${getSeverityColor(stats.riskLevel.toLowerCase())}-500/30`}>
              <CardContent className="p-3 text-center">
                <Activity className={`w-5 h-5 text-${getSeverityColor(stats.riskLevel.toLowerCase())}-400 mx-auto mb-1`} />
                <p className="text-lg font-bold text-white">{stats.riskLevel}</p>
                <p className="text-slate-400 text-xs">مستوى الخطر</p>
              </CardContent>
            </Card>
          </div>

          {/* Threat Trend Chart */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">اتجاه التهديدات (آخر 7 أيام)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={threatTrendData}>
                    <defs>
                      <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
                    <Area type="monotone" dataKey="threats" stroke="#ef4444" fill="url(#threatGradient)" strokeWidth={2} name="التهديدات" />
                    <Area type="monotone" dataKey="mitigated" stroke="#22c55e" fill="transparent" strokeWidth={2} name="تم التخفيف" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
              <TabsTrigger value="realtime" className="data-[state=active]:bg-red-500/20">
                <Radio className="w-3 h-3 ml-1" />
                الوقت الفعلي
              </TabsTrigger>
              <TabsTrigger value="darkweb" className="data-[state=active]:bg-purple-500/20">
                <Skull className="w-3 h-3 ml-1" />
                الويب المظلم
              </TabsTrigger>
              <TabsTrigger value="predictions" className="data-[state=active]:bg-amber-500/20">
                <TrendingUp className="w-3 h-3 ml-1" />
                التنبؤات
              </TabsTrigger>
              <TabsTrigger value="mitigation" className="data-[state=active]:bg-green-500/20">
                <Shield className="w-3 h-3 ml-1" />
                التخفيف
              </TabsTrigger>
              <TabsTrigger value="auto-response" className="data-[state=active]:bg-purple-500/20">
                <Zap className="w-3 h-3 ml-1" />
                استجابة تلقائية
              </TabsTrigger>
            </TabsList>

            {/* Realtime Tab */}
            <TabsContent value="realtime" className="mt-4">
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                    التهديدات النشطة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {intelligence.realtime_threats?.map((threat, i) => (
                        <div key={i} className={`p-4 rounded-lg border ${
                          threat.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                          threat.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                          'bg-slate-900/50 border-slate-700/50'
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={`bg-${getSeverityColor(threat.severity)}-500/20 text-${getSeverityColor(threat.severity)}-400`}>
                                {threat.severity}
                              </Badge>
                              <span className="text-white font-bold">{threat.name}</span>
                            </div>
                            <Badge className={threat.status === 'active' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                              {threat.status}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm mb-2">{threat.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">المصدر: {threat.source}</span>
                            <div className="flex gap-1">
                              {threat.affected_models?.slice(0, 2).map((model, j) => (
                                <Badge key={j} variant="outline" className="border-slate-600 text-xs">{model}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Dark Web Tab */}
            <TabsContent value="darkweb" className="mt-4">
              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Skull className="w-4 h-4 text-purple-400" />
                    مراقبة الويب المظلم
                    <Badge className={`bg-${getSeverityColor(intelligence.dark_web_monitoring?.risk_level?.toLowerCase())}-500/20 text-${getSeverityColor(intelligence.dark_web_monitoring?.risk_level?.toLowerCase())}-400`}>
                      خطر {intelligence.dark_web_monitoring?.risk_level}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {intelligence.dark_web_monitoring?.data_leaks?.length > 0 && (
                    <div>
                      <p className="text-red-400 text-sm font-medium mb-2">تسريبات بيانات محتملة:</p>
                      <div className="space-y-1">
                        {intelligence.dark_web_monitoring.data_leaks.map((leak, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                            <AlertCircle className="w-3 h-3 text-red-400" />
                            {leak}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {intelligence.dark_web_monitoring?.vulnerability_discussions?.length > 0 && (
                    <div>
                      <p className="text-amber-400 text-sm font-medium mb-2">مناقشات الثغرات:</p>
                      <div className="space-y-1">
                        {intelligence.dark_web_monitoring.vulnerability_discussions.map((disc, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                            <Eye className="w-3 h-3 text-amber-400" />
                            {disc}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Predictions Tab */}
            <TabsContent value="predictions" className="mt-4">
              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    التنبؤ بالتهديدات الناشئة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {intelligence.threat_predictions?.map((pred, i) => (
                        <div key={i} className="p-4 bg-slate-900/50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-white font-bold">{pred.threat_type}</span>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-amber-500/20 text-amber-400">
                                احتمالية {pred.probability}%
                              </Badge>
                              <Badge variant="outline" className="border-slate-600">
                                {pred.timeframe}
                              </Badge>
                            </div>
                          </div>
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                              <span>احتمالية الحدوث</span>
                              <span>{pred.probability}%</span>
                            </div>
                            <Progress value={pred.probability} className="h-2" />
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`text-xs ${
                              pred.impact === 'critical' ? 'bg-red-500/20 text-red-400' :
                              pred.impact === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              تأثير: {pred.impact}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs mb-1">المؤشرات:</p>
                            <div className="flex flex-wrap gap-1">
                              {pred.indicators?.map((ind, j) => (
                                <Badge key={j} variant="outline" className="text-xs border-slate-600">{ind}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Mitigation Tab */}
            <TabsContent value="mitigation" className="mt-4">
              <Card className="bg-green-500/10 border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    استراتيجيات التخفيف
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {intelligence.mitigation_strategies?.map((strategy, i) => (
                        <div key={i} className="p-4 bg-slate-900/50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-white font-bold">{strategy.threat}</span>
                            <Badge className={`text-xs ${
                              strategy.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                              strategy.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {strategy.priority}
                            </Badge>
                          </div>
                          <div className="mb-3">
                            <p className="text-red-400 text-xs font-medium mb-1">إجراءات فورية:</p>
                            <ul className="space-y-1">
                              {strategy.immediate_actions?.map((action, j) => (
                                <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                                  <Zap className="w-3 h-3 text-red-400" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-green-400 text-xs font-medium mb-1">تدابير وقائية:</p>
                            <ul className="space-y-1">
                              {strategy.preventive_measures?.map((measure, j) => (
                                <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                                  <CheckCircle className="w-3 h-3 text-green-400" />
                                  {measure}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Auto Response Tab */}
            <TabsContent value="auto-response" className="mt-4">
              <AIAutomatedThreatResponse threat={intelligence.realtime_threats?.[0]} />
            </TabsContent>
          </Tabs>

          {/* Assessment Report */}
          <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-400" />
                  ملخص تقييم التهديدات
                </CardTitle>
                <Button size="sm" variant="outline" className="border-red-500/50 h-7">
                  <Download className="w-3 h-3 ml-1" />
                  تصدير التقرير
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">{intelligence.threat_assessment_report?.summary}</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}