import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Scale, Shield, FileText, AlertTriangle, CheckCircle, Loader2, Eye,
  Users, Gavel, Bell, TrendingUp, Brain, Target, Activity, Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function AIAdvancedGovernance() {
  const [governance, setGovernance] = useState(null);
  const [activeTab, setActiveTab] = useState('fairness');
  const [selectedRegulation, setSelectedRegulation] = useState('gdpr');

  const analyzeGovernanceMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل حوكمة نماذج AI بشكل شامل:

1. العدالة والمساءلة:
   - كشف التحيز الاستباقي
   - تحليل العدالة عبر الفئات
   - مؤشرات المساءلة

2. الامتثال التنظيمي:
   - GDPR, AI Act, HIPAA
   - تقارير تلقائية
   - فجوات الامتثال

3. مراقبة سوء الاستخدام:
   - أنماط استخدام مشبوهة
   - تنبيهات تلقائية
   - إجراءات وقائية`,
        response_json_schema: {
          type: "object",
          properties: {
            fairness_analysis: {
              type: "object",
              properties: {
                overall_score: { type: "number" },
                bias_detected: { type: "array", items: { type: "object", properties: { type: { type: "string" }, affected_group: { type: "string" }, severity: { type: "string" }, mitigation: { type: "string" } } } },
                fairness_metrics: { type: "array", items: { type: "object", properties: { metric: { type: "string" }, value: { type: "number" }, threshold: { type: "number" }, status: { type: "string" } } } }
              }
            },
            accountability: {
              type: "object",
              properties: {
                decision_explainability: { type: "number" },
                audit_trail_completeness: { type: "number" },
                human_oversight_score: { type: "number" },
                issues: { type: "array", items: { type: "string" } }
              }
            },
            compliance_reports: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  regulation: { type: "string" },
                  compliance_score: { type: "number" },
                  gaps: { type: "array", items: { type: "string" } },
                  recommendations: { type: "array", items: { type: "string" } },
                  last_audit: { type: "string" }
                }
              }
            },
            misuse_monitoring: {
              type: "object",
              properties: {
                alerts: { type: "array", items: { type: "object", properties: { type: { type: "string" }, description: { type: "string" }, severity: { type: "string" }, timestamp: { type: "string" }, action_taken: { type: "string" } } } },
                suspicious_patterns: { type: "array", items: { type: "string" } },
                blocked_requests: { type: "number" }
              }
            }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setGovernance(data);
      toast.success('تم تحليل الحوكمة');
    }
  });

  useEffect(() => {
    analyzeGovernanceMutation.mutate();
  }, []);

  const generateReport = (regulation) => {
    toast.success(`جاري إنشاء تقرير ${regulation}...`);
  };

  const getScoreColor = (score) => score >= 80 ? 'green' : score >= 60 ? 'amber' : 'red';

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20">
            <Scale className="w-5 h-5 text-violet-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">الحوكمة المتقدمة</h4>
            <p className="text-slate-400 text-xs">العدالة • الامتثال • مراقبة الاستخدام</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => analyzeGovernanceMutation.mutate()} disabled={analyzeGovernanceMutation.isPending}>
          {analyzeGovernanceMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
        </Button>
      </div>

      {governance && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className={`bg-${getScoreColor(governance.fairness_analysis?.overall_score)}-500/10 border-${getScoreColor(governance.fairness_analysis?.overall_score)}-500/30`}>
              <CardContent className="p-3 text-center">
                <Scale className={`w-5 h-5 text-${getScoreColor(governance.fairness_analysis?.overall_score)}-400 mx-auto mb-1`} />
                <p className="text-xl font-bold text-white">{governance.fairness_analysis?.overall_score}%</p>
                <p className="text-slate-400 text-xs">العدالة</p>
              </CardContent>
            </Card>
            <Card className={`bg-${getScoreColor(governance.accountability?.decision_explainability)}-500/10 border-${getScoreColor(governance.accountability?.decision_explainability)}-500/30`}>
              <CardContent className="p-3 text-center">
                <Brain className={`w-5 h-5 text-${getScoreColor(governance.accountability?.decision_explainability)}-400 mx-auto mb-1`} />
                <p className="text-xl font-bold text-white">{governance.accountability?.decision_explainability}%</p>
                <p className="text-slate-400 text-xs">قابلية التفسير</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-3 text-center">
                <Gavel className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{governance.compliance_reports?.length}</p>
                <p className="text-slate-400 text-xs">تقارير امتثال</p>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-3 text-center">
                <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{governance.misuse_monitoring?.blocked_requests}</p>
                <p className="text-slate-400 text-xs">طلبات محظورة</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
              <TabsTrigger value="fairness" className="data-[state=active]:bg-violet-500/20">
                <Scale className="w-3 h-3 ml-1" />
                العدالة
              </TabsTrigger>
              <TabsTrigger value="compliance" className="data-[state=active]:bg-purple-500/20">
                <Gavel className="w-3 h-3 ml-1" />
                الامتثال
              </TabsTrigger>
              <TabsTrigger value="misuse" className="data-[state=active]:bg-red-500/20">
                <Shield className="w-3 h-3 ml-1" />
                المراقبة
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fairness" className="mt-4 space-y-4">
              {governance.fairness_analysis?.bias_detected?.length > 0 && (
                <Card className="bg-amber-500/10 border-amber-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      تحيزات مكتشفة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[150px]">
                      <div className="space-y-2">
                        {governance.fairness_analysis.bias_detected.map((bias, i) => (
                          <div key={i} className="p-2 bg-slate-900/50 rounded">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white text-sm">{bias.type}</span>
                              <Badge className={bias.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}>{bias.severity}</Badge>
                            </div>
                            <p className="text-slate-400 text-xs">الفئة: {bias.affected_group}</p>
                            <p className="text-green-400 text-xs">الحل: {bias.mitigation}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">مقاييس العدالة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {governance.fairness_analysis?.fairness_metrics?.map((metric, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-300 text-sm">{metric.metric}</span>
                          <span className={`text-sm ${metric.status === 'pass' ? 'text-green-400' : 'text-red-400'}`}>{metric.value}%</span>
                        </div>
                        <Progress value={metric.value} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="mt-4">
              <div className="flex gap-2 mb-4">
                <Select value={selectedRegulation} onValueChange={setSelectedRegulation}>
                  <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="gdpr">GDPR</SelectItem>
                    <SelectItem value="ai_act">AI Act</SelectItem>
                    <SelectItem value="hipaa">HIPAA</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => generateReport(selectedRegulation)}>
                  <Download className="w-4 h-4 ml-1" />
                  تقرير
                </Button>
              </div>

              <ScrollArea className="h-[250px]">
                <div className="space-y-3">
                  {governance.compliance_reports?.map((report, i) => (
                    <Card key={i} className={`border-${getScoreColor(report.compliance_score)}-500/30`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-bold">{report.regulation}</span>
                          <Badge className={`bg-${getScoreColor(report.compliance_score)}-500/20 text-${getScoreColor(report.compliance_score)}-400`}>{report.compliance_score}%</Badge>
                        </div>
                        {report.gaps?.length > 0 && (
                          <div className="mb-2">
                            <p className="text-red-400 text-xs mb-1">الفجوات:</p>
                            {report.gaps.slice(0, 2).map((gap, j) => (
                              <p key={j} className="text-slate-400 text-xs">• {gap}</p>
                            ))}
                          </div>
                        )}
                        <p className="text-slate-500 text-xs">آخر تدقيق: {report.last_audit}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="misuse" className="mt-4">
              <ScrollArea className="h-[280px]">
                <div className="space-y-3">
                  {governance.misuse_monitoring?.alerts?.map((alert, i) => (
                    <Card key={i} className={`border-${alert.severity === 'high' ? 'red' : 'amber'}-500/30 bg-${alert.severity === 'high' ? 'red' : 'amber'}-500/10`}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">{alert.type}</Badge>
                          <Badge className={alert.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}>{alert.severity}</Badge>
                        </div>
                        <p className="text-white text-sm mb-1">{alert.description}</p>
                        <p className="text-green-400 text-xs">الإجراء: {alert.action_taken}</p>
                        <p className="text-slate-500 text-xs mt-1">{alert.timestamp}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}