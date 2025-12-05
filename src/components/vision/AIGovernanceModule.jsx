import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Shield, Scale, Eye, AlertTriangle, FileText, CheckCircle, Brain,
  TrendingUp, Users, Lock, Loader2, RefreshCw, Download, Bell,
  BarChart3, Target, Zap, AlertOctagon, FileCheck, Gavel
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function AIGovernanceModule({ modelId, modelName }) {
  const [governance, setGovernance] = useState(null);
  const [activeTab, setActiveTab] = useState('ethics');
  const [showComplianceReport, setShowComplianceReport] = useState(false);
  const [selectedRegulation, setSelectedRegulation] = useState('gdpr');
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [alerts, setAlerts] = useState([]);

  const regulations = [
    { value: 'gdpr', label: 'GDPR - الاتحاد الأوروبي' },
    { value: 'hipaa', label: 'HIPAA - الرعاية الصحية' },
    { value: 'sox', label: 'SOX - المالية' },
    { value: 'iso27001', label: 'ISO 27001 - أمن المعلومات' },
    { value: 'pci_dss', label: 'PCI DSS - بطاقات الدفع' },
    { value: 'ai_act', label: 'AI Act - الاتحاد الأوروبي' }
  ];

  // تحليل الحوكمة الشامل
  const analyzeGovernanceMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل شامل لحوكمة نموذج الذكاء الاصطناعي وتقديم:

1. تحليل المخاطر الأخلاقية:
   - التحيز في التنبؤات
   - قضايا العدالة والإنصاف
   - المساءلة والشفافية
   - الخصوصية وحماية البيانات
   - التأثير الاجتماعي

2. بطاقة النموذج (Model Card):
   - الغرض والاستخدام المقصود
   - القيود والاعتبارات الأخلاقية
   - مقاييس الأداء والعدالة
   - بيانات التدريب

3. مراقبة السلوك في الإنتاج:
   - انحراف النموذج
   - تحيز متطور
   - سوء الاستخدام المحتمل
   - حالات شاذة

4. توصيات التحسين:
   - تخفيف التحيز
   - تحسين الشفافية
   - ضمان المساءلة`,
        response_json_schema: {
          type: "object",
          properties: {
            ethical_risks: {
              type: "object",
              properties: {
                overall_risk_score: { type: "number" },
                bias_analysis: {
                  type: "object",
                  properties: {
                    detected: { type: "boolean" },
                    types: { type: "array", items: { type: "string" } },
                    affected_groups: { type: "array", items: { type: "string" } },
                    severity: { type: "string" },
                    mitigation_suggestions: { type: "array", items: { type: "string" } }
                  }
                },
                fairness_issues: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      issue: { type: "string" },
                      description: { type: "string" },
                      impact: { type: "string" },
                      recommendation: { type: "string" }
                    }
                  }
                },
                accountability_gaps: { type: "array", items: { type: "string" } },
                transparency_score: { type: "number" },
                privacy_risks: { type: "array", items: { type: "string" } },
                social_impact: { type: "string" }
              }
            },
            model_card: {
              type: "object",
              properties: {
                purpose: { type: "string" },
                intended_use: { type: "string" },
                out_of_scope_use: { type: "string" },
                limitations: { type: "array", items: { type: "string" } },
                ethical_considerations: { type: "array", items: { type: "string" } },
                performance_metrics: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      metric: { type: "string" },
                      value: { type: "string" },
                      benchmark: { type: "string" }
                    }
                  }
                },
                fairness_metrics: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      metric: { type: "string" },
                      value: { type: "number" },
                      threshold: { type: "number" },
                      status: { type: "string" }
                    }
                  }
                },
                training_data_summary: { type: "string" }
              }
            },
            production_monitoring: {
              type: "object",
              properties: {
                drift_detected: { type: "boolean" },
                drift_severity: { type: "string" },
                drift_details: { type: "string" },
                bias_evolution: { type: "string" },
                misuse_indicators: { type: "array", items: { type: "string" } },
                anomalies: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      description: { type: "string" },
                      timestamp: { type: "string" },
                      severity: { type: "string" }
                    }
                  }
                }
              }
            },
            improvement_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  recommendation: { type: "string" },
                  priority: { type: "string" },
                  expected_impact: { type: "string" }
                }
              }
            }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setGovernance(data);
      // Generate alerts based on findings
      const newAlerts = [];
      if (data.ethical_risks?.bias_analysis?.detected) {
        newAlerts.push({ type: 'bias', severity: 'high', message: 'تم اكتشاف تحيز في النموذج' });
      }
      if (data.production_monitoring?.drift_detected) {
        newAlerts.push({ type: 'drift', severity: 'medium', message: 'تم اكتشاف انحراف في سلوك النموذج' });
      }
      if (data.production_monitoring?.misuse_indicators?.length > 0) {
        newAlerts.push({ type: 'misuse', severity: 'critical', message: 'مؤشرات سوء استخدام محتملة' });
      }
      setAlerts(newAlerts);
      toast.success('تم تحليل حوكمة النموذج');
    },
    onError: () => {
      toast.error('حدث خطأ في التحليل');
    }
  });

  // توليد تقرير الامتثال
  const generateComplianceReportMutation = useMutation({
    mutationFn: async (regulation) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بإنشاء تقرير امتثال شامل للائحة ${regulation} لنموذج الذكاء الاصطناعي.
        
يجب أن يتضمن التقرير:
1. ملخص تنفيذي
2. متطلبات اللائحة ومدى الامتثال
3. الفجوات المحددة
4. خطة العمل المقترحة
5. التوصيات`,
        response_json_schema: {
          type: "object",
          properties: {
            regulation_name: { type: "string" },
            compliance_score: { type: "number" },
            executive_summary: { type: "string" },
            requirements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  requirement: { type: "string" },
                  status: { type: "string" },
                  details: { type: "string" },
                  evidence: { type: "string" }
                }
              }
            },
            gaps: { type: "array", items: { type: "string" } },
            action_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  deadline: { type: "string" },
                  responsible: { type: "string" }
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
      toast.success('تم إنشاء تقرير الامتثال');
    }
  });

  useEffect(() => {
    analyzeGovernanceMutation.mutate();
  }, []);

  const getRiskColor = (score) => {
    if (score >= 70) return 'red';
    if (score >= 40) return 'amber';
    return 'green';
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20"
          >
            <Shield className="w-5 h-5 text-purple-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">حوكمة نماذج AI المتقدمة</h4>
            <p className="text-slate-400 text-xs">الأخلاقيات • الامتثال • المراقبة • الشفافية</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {alerts.length > 0 && (
            <Badge className="bg-red-500/20 text-red-400 animate-pulse">
              <Bell className="w-3 h-3 ml-1" />
              {alerts.length} تنبيه
            </Badge>
          )}
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-lg">
            <Label className="text-slate-300 text-xs">مراقبة مستمرة</Label>
            <Switch checked={monitoringEnabled} onCheckedChange={setMonitoringEnabled} />
          </div>
          <Button
            variant="outline"
            className="border-purple-500/50"
            onClick={() => analyzeGovernanceMutation.mutate()}
            disabled={analyzeGovernanceMutation.isPending}
          >
            {analyzeGovernanceMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><RefreshCw className="w-4 h-4 ml-1" /> تحليل</>
            )}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <Card key={i} className={`bg-${alert.severity === 'critical' ? 'red' : alert.severity === 'high' ? 'orange' : 'amber'}-500/10 border-${alert.severity === 'critical' ? 'red' : alert.severity === 'high' ? 'orange' : 'amber'}-500/30`}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertOctagon className={`w-5 h-5 text-${alert.severity === 'critical' ? 'red' : alert.severity === 'high' ? 'orange' : 'amber'}-400`} />
                  <span className="text-white">{alert.message}</span>
                </div>
                <Button size="sm" variant="outline" className="h-7">معالجة</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {analyzeGovernanceMutation.isPending && !governance && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-10 h-10 text-purple-400 mx-auto mb-4 animate-spin" />
            <p className="text-white">جاري تحليل حوكمة النموذج...</p>
          </CardContent>
        </Card>
      )}

      {governance && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className={`bg-${getRiskColor(governance.ethical_risks?.overall_risk_score || 0)}-500/10 border-${getRiskColor(governance.ethical_risks?.overall_risk_score || 0)}-500/30`}>
              <CardContent className="p-3 text-center">
                <AlertTriangle className={`w-5 h-5 text-${getRiskColor(governance.ethical_risks?.overall_risk_score || 0)}-400 mx-auto mb-1`} />
                <p className="text-2xl font-bold text-white">{governance.ethical_risks?.overall_risk_score || 0}%</p>
                <p className="text-slate-400 text-xs">مخاطر أخلاقية</p>
              </CardContent>
            </Card>
            <Card className={`bg-${governance.ethical_risks?.transparency_score >= 70 ? 'green' : 'amber'}-500/10 border-${governance.ethical_risks?.transparency_score >= 70 ? 'green' : 'amber'}-500/30`}>
              <CardContent className="p-3 text-center">
                <Eye className={`w-5 h-5 text-${governance.ethical_risks?.transparency_score >= 70 ? 'green' : 'amber'}-400 mx-auto mb-1`} />
                <p className="text-2xl font-bold text-white">{governance.ethical_risks?.transparency_score || 0}%</p>
                <p className="text-slate-400 text-xs">الشفافية</p>
              </CardContent>
            </Card>
            <Card className={`bg-${governance.ethical_risks?.bias_analysis?.detected ? 'red' : 'green'}-500/10 border-${governance.ethical_risks?.bias_analysis?.detected ? 'red' : 'green'}-500/30`}>
              <CardContent className="p-3 text-center">
                <Scale className={`w-5 h-5 text-${governance.ethical_risks?.bias_analysis?.detected ? 'red' : 'green'}-400 mx-auto mb-1`} />
                <p className="text-lg font-bold text-white">{governance.ethical_risks?.bias_analysis?.detected ? 'مكتشف' : 'لا يوجد'}</p>
                <p className="text-slate-400 text-xs">التحيز</p>
              </CardContent>
            </Card>
            <Card className={`bg-${governance.production_monitoring?.drift_detected ? 'amber' : 'green'}-500/10 border-${governance.production_monitoring?.drift_detected ? 'amber' : 'green'}-500/30`}>
              <CardContent className="p-3 text-center">
                <TrendingUp className={`w-5 h-5 text-${governance.production_monitoring?.drift_detected ? 'amber' : 'green'}-400 mx-auto mb-1`} />
                <p className="text-lg font-bold text-white">{governance.production_monitoring?.drift_detected ? 'انحراف' : 'مستقر'}</p>
                <p className="text-slate-400 text-xs">سلوك النموذج</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
              <TabsTrigger value="ethics" className="data-[state=active]:bg-purple-500/20">
                <Scale className="w-3 h-3 ml-1" />
                الأخلاقيات والعدالة
              </TabsTrigger>
              <TabsTrigger value="modelcard" className="data-[state=active]:bg-cyan-500/20">
                <FileText className="w-3 h-3 ml-1" />
                بطاقة النموذج
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="data-[state=active]:bg-amber-500/20">
                <Eye className="w-3 h-3 ml-1" />
                المراقبة
              </TabsTrigger>
              <TabsTrigger value="compliance" className="data-[state=active]:bg-green-500/20">
                <Gavel className="w-3 h-3 ml-1" />
                الامتثال
              </TabsTrigger>
            </TabsList>

            {/* Ethics Tab */}
            <TabsContent value="ethics" className="mt-4 space-y-4">
              {/* Bias Analysis */}
              {governance.ethical_risks?.bias_analysis && (
                <Card className={`bg-${governance.ethical_risks.bias_analysis.detected ? 'red' : 'green'}-500/10 border-${governance.ethical_risks.bias_analysis.detected ? 'red' : 'green'}-500/30`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Scale className="w-4 h-4" />
                      تحليل التحيز
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {governance.ethical_risks.bias_analysis.detected ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-500/20 text-red-400">{governance.ethical_risks.bias_analysis.severity}</Badge>
                          <span className="text-slate-300">تحيز مكتشف</span>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs mb-1">أنواع التحيز:</p>
                          <div className="flex flex-wrap gap-1">
                            {governance.ethical_risks.bias_analysis.types?.map((type, i) => (
                              <Badge key={i} variant="outline" className="border-red-500/50 text-red-400">{type}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs mb-1">المجموعات المتأثرة:</p>
                          <div className="flex flex-wrap gap-1">
                            {governance.ethical_risks.bias_analysis.affected_groups?.map((group, i) => (
                              <Badge key={i} variant="outline" className="border-amber-500/50 text-amber-400">{group}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs mb-1">اقتراحات التخفيف:</p>
                          <ul className="space-y-1">
                            {governance.ethical_risks.bias_analysis.mitigation_suggestions?.map((sug, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                                <span className="text-slate-300">{sug}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-400">لم يتم اكتشاف تحيز كبير</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Fairness Issues */}
              {governance.ethical_risks?.fairness_issues?.length > 0 && (
                <Card className="bg-amber-500/10 border-amber-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-400" />
                      قضايا العدالة والإنصاف
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-3">
                        {governance.ethical_risks.fairness_issues.map((issue, i) => (
                          <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium">{issue.issue}</span>
                              <Badge className="bg-amber-500/20 text-amber-400 text-xs">{issue.impact}</Badge>
                            </div>
                            <p className="text-slate-400 text-xs mb-2">{issue.description}</p>
                            <p className="text-cyan-400 text-xs">التوصية: {issue.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {governance.improvement_recommendations?.length > 0 && (
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-400" />
                      توصيات التحسين
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {governance.improvement_recommendations.map((rec, i) => (
                        <div key={i} className="p-3 bg-slate-900/50 rounded-lg flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="border-slate-600 text-xs">{rec.category}</Badge>
                              <Badge className={`text-xs ${
                                rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                rec.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>{rec.priority}</Badge>
                            </div>
                            <p className="text-white text-sm">{rec.recommendation}</p>
                            <p className="text-slate-400 text-xs mt-1">التأثير المتوقع: {rec.expected_impact}</p>
                          </div>
                          <Button size="sm" variant="outline" className="border-green-500/50 h-7">تطبيق</Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Model Card Tab */}
            <TabsContent value="modelcard" className="mt-4">
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      بطاقة النموذج (Model Card)
                    </CardTitle>
                    <Button size="sm" variant="outline" className="border-cyan-500/50 h-7">
                      <Download className="w-3 h-3 ml-1" />
                      تصدير
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      <div className="p-3 bg-slate-900/50 rounded-lg">
                        <p className="text-slate-400 text-xs mb-1">الغرض</p>
                        <p className="text-white">{governance.model_card?.purpose}</p>
                      </div>
                      <div className="p-3 bg-slate-900/50 rounded-lg">
                        <p className="text-slate-400 text-xs mb-1">الاستخدام المقصود</p>
                        <p className="text-white">{governance.model_card?.intended_use}</p>
                      </div>
                      <div className="p-3 bg-slate-900/50 rounded-lg">
                        <p className="text-slate-400 text-xs mb-1">الاستخدامات خارج النطاق</p>
                        <p className="text-white">{governance.model_card?.out_of_scope_use}</p>
                      </div>
                      <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                        <p className="text-slate-400 text-xs mb-2">القيود</p>
                        <ul className="space-y-1">
                          {governance.model_card?.limitations?.map((lim, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <AlertTriangle className="w-3 h-3 text-red-400 mt-1 flex-shrink-0" />
                              <span className="text-slate-300">{lim}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                        <p className="text-slate-400 text-xs mb-2">الاعتبارات الأخلاقية</p>
                        <ul className="space-y-1">
                          {governance.model_card?.ethical_considerations?.map((eth, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Scale className="w-3 h-3 text-amber-400 mt-1 flex-shrink-0" />
                              <span className="text-slate-300">{eth}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Performance Metrics */}
                      <div className="p-3 bg-slate-900/50 rounded-lg">
                        <p className="text-slate-400 text-xs mb-2">مقاييس الأداء</p>
                        <div className="grid grid-cols-3 gap-2">
                          {governance.model_card?.performance_metrics?.map((metric, i) => (
                            <div key={i} className="p-2 bg-slate-800/50 rounded text-center">
                              <p className="text-white font-bold">{metric.value}</p>
                              <p className="text-slate-400 text-xs">{metric.metric}</p>
                              <p className="text-cyan-400 text-xs">({metric.benchmark})</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Fairness Metrics */}
                      <div className="p-3 bg-slate-900/50 rounded-lg">
                        <p className="text-slate-400 text-xs mb-2">مقاييس العدالة</p>
                        <div className="space-y-2">
                          {governance.model_card?.fairness_metrics?.map((metric, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-slate-300 text-sm">{metric.metric}</span>
                              <div className="flex items-center gap-2">
                                <Progress value={(metric.value / metric.threshold) * 100} className="w-24 h-2" />
                                <Badge className={metric.status === 'pass' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                  {metric.value}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Monitoring Tab */}
            <TabsContent value="monitoring" className="mt-4 space-y-4">
              {/* Drift Status */}
              <Card className={`bg-${governance.production_monitoring?.drift_detected ? 'amber' : 'green'}-500/10 border-${governance.production_monitoring?.drift_detected ? 'amber' : 'green'}-500/30`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    حالة انحراف النموذج
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {governance.production_monitoring?.drift_detected ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        <span className="text-amber-400 font-medium">تم اكتشاف انحراف</span>
                        <Badge className="bg-amber-500/20 text-amber-400">{governance.production_monitoring.drift_severity}</Badge>
                      </div>
                      <p className="text-slate-300 text-sm">{governance.production_monitoring.drift_details}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400">النموذج مستقر - لا يوجد انحراف</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Misuse Indicators */}
              {governance.production_monitoring?.misuse_indicators?.length > 0 && (
                <Card className="bg-red-500/10 border-red-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <AlertOctagon className="w-4 h-4 text-red-400" />
                      مؤشرات سوء الاستخدام المحتمل
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {governance.production_monitoring.misuse_indicators.map((indicator, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-300 text-sm">{indicator}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Anomalies */}
              {governance.production_monitoring?.anomalies?.length > 0 && (
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">الحالات الشاذة المكتشفة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {governance.production_monitoring.anomalies.map((anomaly, i) => (
                          <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white font-medium">{anomaly.type}</span>
                              <Badge className={`text-xs ${
                                anomaly.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                                anomaly.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>{anomaly.severity}</Badge>
                            </div>
                            <p className="text-slate-400 text-xs">{anomaly.description}</p>
                            <p className="text-slate-500 text-xs mt-1">{anomaly.timestamp}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Compliance Tab */}
            <TabsContent value="compliance" className="mt-4">
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-green-400" />
                    تقارير الامتثال التنظيمي
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Select value={selectedRegulation} onValueChange={setSelectedRegulation}>
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-white w-64">
                        <SelectValue placeholder="اختر اللائحة" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {regulations.map(reg => (
                          <SelectItem key={reg.value} value={reg.value}>{reg.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        generateComplianceReportMutation.mutate(selectedRegulation);
                        setShowComplianceReport(true);
                      }}
                      disabled={generateComplianceReportMutation.isPending}
                    >
                      {generateComplianceReportMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <><FileCheck className="w-4 h-4 ml-1" /> إنشاء تقرير</>
                      )}
                    </Button>
                  </div>

                  {generateComplianceReportMutation.data && (
                    <div className="p-4 bg-slate-900/50 rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="text-white font-bold">{generateComplianceReportMutation.data.regulation_name}</h5>
                        <Badge className={generateComplianceReportMutation.data.compliance_score >= 80 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                          {generateComplianceReportMutation.data.compliance_score}% امتثال
                        </Badge>
                      </div>
                      <p className="text-slate-300 text-sm">{generateComplianceReportMutation.data.executive_summary}</p>
                      
                      {/* Requirements */}
                      <div>
                        <p className="text-slate-400 text-xs mb-2">متطلبات الامتثال:</p>
                        <div className="space-y-2">
                          {generateComplianceReportMutation.data.requirements?.slice(0, 5).map((req, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                              <span className="text-slate-300 text-sm">{req.requirement}</span>
                              <Badge className={req.status === 'compliant' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                {req.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button variant="outline" className="w-full border-slate-600">
                        <Download className="w-4 h-4 ml-1" />
                        تحميل التقرير الكامل (PDF)
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}