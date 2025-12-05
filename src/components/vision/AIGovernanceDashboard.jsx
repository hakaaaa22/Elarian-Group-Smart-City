import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Shield, Scale, Eye, AlertTriangle, FileText, CheckCircle, Brain,
  TrendingUp, TrendingDown, Clock, Loader2, RefreshCw, Download, Bell,
  BarChart3, Target, Zap, AlertOctagon, History, Users, Lock, Gavel,
  Activity, Filter, Calendar, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar
} from 'recharts';
import { toast } from 'sonner';

const biasHistoryData = [
  { date: 'يناير', bias_score: 15, fairness: 85, compliance: 92 },
  { date: 'فبراير', bias_score: 12, fairness: 88, compliance: 94 },
  { date: 'مارس', bias_score: 18, fairness: 82, compliance: 91 },
  { date: 'أبريل', bias_score: 10, fairness: 90, compliance: 96 },
  { date: 'مايو', bias_score: 8, fairness: 92, compliance: 97 },
  { date: 'يونيو', bias_score: 6, fairness: 94, compliance: 98 },
];

const auditTrail = [
  { id: 1, action: 'تحديث سياسة التحيز', user: 'أحمد محمد', timestamp: '2024-12-05 10:30', type: 'policy', status: 'approved' },
  { id: 2, action: 'مراجعة امتثال GDPR', user: 'سارة علي', timestamp: '2024-12-05 09:15', type: 'compliance', status: 'completed' },
  { id: 3, action: 'تنبيه انحراف نموذج', user: 'النظام', timestamp: '2024-12-04 23:45', type: 'alert', status: 'resolved' },
  { id: 4, action: 'تقرير عدالة شهري', user: 'محمد أحمد', timestamp: '2024-12-04 14:00', type: 'report', status: 'generated' },
  { id: 5, action: 'تصحيح تحيز مكتشف', user: 'ليلى حسن', timestamp: '2024-12-03 16:30', type: 'correction', status: 'implemented' },
];

export default function AIGovernanceDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('6m');
  const [deviations, setDeviations] = useState([]);

  // تحليل مقاييس الحوكمة
  const analyzeGovernanceMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل شامل لمقاييس حوكمة نماذج الذكاء الاصطناعي وتقديم:

1. مقاييس الحوكمة الرئيسية:
   - درجة التحيز الإجمالية
   - مؤشر العدالة
   - نسبة الامتثال
   - درجة الشفافية
   - مؤشر المساءلة

2. الانحرافات عن السياسات:
   - الانحرافات المكتشفة
   - مستوى الخطورة
   - الإجراءات التصحيحية المقترحة

3. تحليل الاتجاهات:
   - تطور التحيز
   - تحسن العدالة
   - حالة الامتثال

4. المخاطر الأخلاقية:
   - قضايا العدالة
   - مشاكل المساءلة
   - التأثيرات المجتمعية`,
        response_json_schema: {
          type: "object",
          properties: {
            key_metrics: {
              type: "object",
              properties: {
                overall_bias_score: { type: "number" },
                fairness_index: { type: "number" },
                compliance_rate: { type: "number" },
                transparency_score: { type: "number" },
                accountability_index: { type: "number" }
              }
            },
            deviations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  policy: { type: "string" },
                  deviation_type: { type: "string" },
                  severity: { type: "string" },
                  description: { type: "string" },
                  corrective_action: { type: "string" },
                  deadline: { type: "string" }
                }
              }
            },
            trends: {
              type: "object",
              properties: {
                bias_trend: { type: "string" },
                fairness_trend: { type: "string" },
                compliance_trend: { type: "string" }
              }
            },
            ethical_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk_type: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string" },
                  mitigation: { type: "string" }
                }
              }
            },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setMetrics(data);
      setDeviations(data.deviations || []);
      if (data.deviations?.length > 0) {
        toast.warning(`تم اكتشاف ${data.deviations.length} انحراف عن السياسات`);
      }
    },
    onError: () => {
      toast.error('حدث خطأ في التحليل');
    }
  });

  useEffect(() => {
    analyzeGovernanceMutation.mutate();
  }, []);

  const getScoreColor = (score, inverse = false) => {
    if (inverse) {
      if (score <= 10) return 'green';
      if (score <= 20) return 'amber';
      return 'red';
    }
    if (score >= 90) return 'green';
    if (score >= 70) return 'amber';
    return 'red';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'improving' || trend === 'تحسن') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'declining' || trend === 'تراجع') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Activity className="w-4 h-4 text-amber-400" />;
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-amber-500/20"
          >
            <Gavel className="w-6 h-6 text-purple-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold text-lg">لوحة حوكمة AI المركزية</h4>
            <p className="text-slate-400 text-xs">المقاييس • سجل التدقيق • الانحرافات • التصحيحات</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="1m">شهر</SelectItem>
              <SelectItem value="3m">3 أشهر</SelectItem>
              <SelectItem value="6m">6 أشهر</SelectItem>
              <SelectItem value="1y">سنة</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="border-purple-500/50"
            onClick={() => analyzeGovernanceMutation.mutate()}
            disabled={analyzeGovernanceMutation.isPending}
          >
            {analyzeGovernanceMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Download className="w-4 h-4 ml-1" />
            تصدير تقرير
          </Button>
        </div>
      </div>

      {analyzeGovernanceMutation.isPending && !metrics && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-10 h-10 text-purple-400 mx-auto mb-4 animate-spin" />
            <p className="text-white">جاري تحليل مقاييس الحوكمة...</p>
          </CardContent>
        </Card>
      )}

      {metrics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className={`bg-${getScoreColor(metrics.key_metrics?.overall_bias_score || 0, true)}-500/10 border-${getScoreColor(metrics.key_metrics?.overall_bias_score || 0, true)}-500/30`}>
              <CardContent className="p-3 text-center">
                <Scale className={`w-5 h-5 text-${getScoreColor(metrics.key_metrics?.overall_bias_score || 0, true)}-400 mx-auto mb-1`} />
                <p className="text-xl font-bold text-white">{metrics.key_metrics?.overall_bias_score || 0}%</p>
                <p className="text-slate-400 text-xs">درجة التحيز</p>
                <div className="flex justify-center mt-1">{getTrendIcon(metrics.trends?.bias_trend)}</div>
              </CardContent>
            </Card>
            <Card className={`bg-${getScoreColor(metrics.key_metrics?.fairness_index || 0)}-500/10 border-${getScoreColor(metrics.key_metrics?.fairness_index || 0)}-500/30`}>
              <CardContent className="p-3 text-center">
                <Users className={`w-5 h-5 text-${getScoreColor(metrics.key_metrics?.fairness_index || 0)}-400 mx-auto mb-1`} />
                <p className="text-xl font-bold text-white">{metrics.key_metrics?.fairness_index || 0}%</p>
                <p className="text-slate-400 text-xs">مؤشر العدالة</p>
                <div className="flex justify-center mt-1">{getTrendIcon(metrics.trends?.fairness_trend)}</div>
              </CardContent>
            </Card>
            <Card className={`bg-${getScoreColor(metrics.key_metrics?.compliance_rate || 0)}-500/10 border-${getScoreColor(metrics.key_metrics?.compliance_rate || 0)}-500/30`}>
              <CardContent className="p-3 text-center">
                <CheckCircle className={`w-5 h-5 text-${getScoreColor(metrics.key_metrics?.compliance_rate || 0)}-400 mx-auto mb-1`} />
                <p className="text-xl font-bold text-white">{metrics.key_metrics?.compliance_rate || 0}%</p>
                <p className="text-slate-400 text-xs">نسبة الامتثال</p>
                <div className="flex justify-center mt-1">{getTrendIcon(metrics.trends?.compliance_trend)}</div>
              </CardContent>
            </Card>
            <Card className={`bg-${getScoreColor(metrics.key_metrics?.transparency_score || 0)}-500/10 border-${getScoreColor(metrics.key_metrics?.transparency_score || 0)}-500/30`}>
              <CardContent className="p-3 text-center">
                <Eye className={`w-5 h-5 text-${getScoreColor(metrics.key_metrics?.transparency_score || 0)}-400 mx-auto mb-1`} />
                <p className="text-xl font-bold text-white">{metrics.key_metrics?.transparency_score || 0}%</p>
                <p className="text-slate-400 text-xs">الشفافية</p>
              </CardContent>
            </Card>
            <Card className={`bg-${getScoreColor(metrics.key_metrics?.accountability_index || 0)}-500/10 border-${getScoreColor(metrics.key_metrics?.accountability_index || 0)}-500/30`}>
              <CardContent className="p-3 text-center">
                <Lock className={`w-5 h-5 text-${getScoreColor(metrics.key_metrics?.accountability_index || 0)}-400 mx-auto mb-1`} />
                <p className="text-xl font-bold text-white">{metrics.key_metrics?.accountability_index || 0}%</p>
                <p className="text-slate-400 text-xs">المساءلة</p>
              </CardContent>
            </Card>
          </div>

          {/* Deviations Alert */}
          {deviations.length > 0 && (
            <Card className="bg-red-500/10 border-red-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-red-400" />
                  انحرافات مكتشفة عن السياسات ({deviations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px]">
                  <div className="space-y-2">
                    {deviations.map((dev, i) => (
                      <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{dev.policy}</span>
                          <Badge className={`text-xs ${
                            dev.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            dev.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>{dev.severity}</Badge>
                        </div>
                        <p className="text-slate-400 text-xs mb-2">{dev.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-green-400 text-xs">الإجراء: {dev.corrective_action}</span>
                          <span className="text-slate-500 text-xs">الموعد: {dev.deadline}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500/20">
                <BarChart3 className="w-3 h-3 ml-1" />
                نظرة عامة
              </TabsTrigger>
              <TabsTrigger value="audit" className="data-[state=active]:bg-cyan-500/20">
                <History className="w-3 h-3 ml-1" />
                سجل التدقيق
              </TabsTrigger>
              <TabsTrigger value="risks" className="data-[state=active]:bg-red-500/20">
                <AlertTriangle className="w-3 h-3 ml-1" />
                المخاطر الأخلاقية
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-green-500/20">
                <Zap className="w-3 h-3 ml-1" />
                التوصيات
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-4">
              <div className="grid lg:grid-cols-2 gap-4">
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">تطور مقاييس الحوكمة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={biasHistoryData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                          <YAxis stroke="#94a3b8" fontSize={10} />
                          <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
                          <Line type="monotone" dataKey="bias_score" stroke="#ef4444" strokeWidth={2} name="التحيز" />
                          <Line type="monotone" dataKey="fairness" stroke="#22c55e" strokeWidth={2} name="العدالة" />
                          <Line type="monotone" dataKey="compliance" stroke="#3b82f6" strokeWidth={2} name="الامتثال" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">توزيع الامتثال حسب اللائحة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'GDPR', compliance: 95 },
                          { name: 'AI Act', compliance: 88 },
                          { name: 'HIPAA', compliance: 92 },
                          { name: 'SOX', compliance: 85 },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                          <YAxis stroke="#94a3b8" fontSize={10} />
                          <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
                          <Bar dataKey="compliance" fill="#a855f7" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Audit Trail Tab */}
            <TabsContent value="audit" className="mt-4">
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <History className="w-4 h-4 text-cyan-400" />
                      سجل التدقيق الكامل
                    </CardTitle>
                    <Button size="sm" variant="outline" className="border-slate-600 h-7">
                      <Filter className="w-3 h-3 ml-1" />
                      تصفية
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-3">
                      {auditTrail.map((item) => (
                        <div key={item.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${
                                item.type === 'policy' ? 'bg-purple-500/20 text-purple-400' :
                                item.type === 'compliance' ? 'bg-blue-500/20 text-blue-400' :
                                item.type === 'alert' ? 'bg-red-500/20 text-red-400' :
                                item.type === 'report' ? 'bg-green-500/20 text-green-400' :
                                'bg-amber-500/20 text-amber-400'
                              }`}>{item.type}</Badge>
                              <span className="text-white font-medium">{item.action}</span>
                            </div>
                            <Badge className={`text-xs ${
                              item.status === 'approved' || item.status === 'completed' || item.status === 'resolved' || item.status === 'implemented' ? 'bg-green-500/20 text-green-400' :
                              item.status === 'generated' ? 'bg-cyan-500/20 text-cyan-400' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>{item.status}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>بواسطة: {item.user}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.timestamp}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ethical Risks Tab */}
            <TabsContent value="risks" className="mt-4">
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    المخاطر الأخلاقية المحددة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {metrics.ethical_risks?.map((risk, i) => (
                        <div key={i} className="p-4 bg-red-500/5 rounded-lg border border-red-500/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-bold">{risk.risk_type}</span>
                            <Badge className="bg-red-500/20 text-red-400">{risk.impact}</Badge>
                          </div>
                          <p className="text-slate-300 text-sm mb-3">{risk.description}</p>
                          <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
                            <p className="text-green-400 text-xs flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              التخفيف: {risk.mitigation}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="mt-4">
              <Card className="bg-green-500/10 border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-400" />
                    توصيات AI للتحسين
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {metrics.recommendations?.map((rec, i) => (
                      <div key={i} className="p-3 bg-slate-900/50 rounded-lg flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-300 text-sm">{rec}</p>
                        </div>
                        <Button size="sm" variant="outline" className="border-green-500/50 h-7 text-green-400">
                          تطبيق
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}