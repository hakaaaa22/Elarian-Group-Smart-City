import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Shield, FileText, AlertTriangle, CheckCircle, Brain, TrendingUp,
  Clock, Calendar, Download, RefreshCw, Loader2, Eye, ChevronRight,
  Sparkles, BarChart3, Target, Zap, XCircle, AlertOctagon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const reportTypeLabels = {
  regulatory: 'تنظيمي',
  audit: 'تدقيق',
  security: 'أمني',
  safety: 'سلامة',
  environmental: 'بيئي',
  data_privacy: 'خصوصية البيانات',
  operational: 'تشغيلي'
};

const severityColors = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#22c55e'
};

const COLORS = ['#22d3ee', '#a855f7', '#f59e0b', '#ef4444', '#22c55e', '#3b82f6'];

export default function AIComplianceReportGenerator() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [newReport, setNewReport] = useState({
    report_name: '',
    report_type: 'regulatory',
    policy_name: '',
    period_start: '',
    period_end: ''
  });
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['compliance-reports'],
    queryFn: () => base44.entities.ComplianceReport.list('-created_date', 50)
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 100)
  });

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      // Analyze audit logs with AI
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير في الامتثال والتدقيق. قم بتحليل البيانات التالية وإنشاء تقرير امتثال شامل:

نوع التقرير: ${reportTypeLabels[newReport.report_type]}
اسم السياسة: ${newReport.policy_name || 'سياسة عامة'}
الفترة: ${newReport.period_start} إلى ${newReport.period_end}

عدد سجلات التدقيق: ${auditLogs.length}

قم بتحليل وتقديم:
1. درجة الامتثال (0-100)
2. الانتهاكات المكتشفة (قائمة تفصيلية مع الخطورة)
3. تقييم المخاطر
4. الأنماط المحددة
5. الأسباب الجذرية المحتملة
6. الإجراءات المقترحة مع الأولوية والمسؤول والموعد النهائي
7. ملخص تنفيذي احترافي`,
        response_json_schema: {
          type: "object",
          properties: {
            compliance_score: { type: "number" },
            violations: { type: "array", items: { type: "object", properties: {
              violation_id: { type: "string" },
              rule: { type: "string" },
              severity: { type: "string" },
              description: { type: "string" },
              occurrence_count: { type: "number" }
            }}},
            risk_assessment: { type: "string" },
            patterns: { type: "array", items: { type: "string" } },
            root_causes: { type: "array", items: { type: "string" } },
            suggested_actions: { type: "array", items: { type: "object", properties: {
              action: { type: "string" },
              priority: { type: "string" },
              responsible_party: { type: "string" },
              deadline: { type: "string" }
            }}},
            executive_summary: { type: "string" }
          }
        }
      });

      const report = {
        report_number: `CR-${Date.now().toString().slice(-6)}`,
        report_name: newReport.report_name,
        report_type: newReport.report_type,
        policy_name: newReport.policy_name,
        report_period: {
          start_date: newReport.period_start,
          end_date: newReport.period_end
        },
        compliance_score: analysis.compliance_score,
        violations_detected: analysis.violations,
        ai_analysis: {
          risk_assessment: analysis.risk_assessment,
          patterns_identified: analysis.patterns,
          root_causes: analysis.root_causes
        },
        ai_suggested_actions: analysis.suggested_actions,
        executive_summary: analysis.executive_summary,
        status: 'generated'
      };

      await base44.entities.ComplianceReport.create(report);
      return report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-reports'] });
      setShowGenerateDialog(false);
      setNewReport({ report_name: '', report_type: 'regulatory', policy_name: '', period_start: '', period_end: '' });
      toast.success('تم إنشاء تقرير الامتثال بنجاح');
    }
  });

  const approveReportMutation = useMutation({
    mutationFn: async (reportId) => {
      await base44.entities.ComplianceReport.update(reportId, { status: 'approved' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-reports'] });
      toast.success('تم اعتماد التقرير');
    }
  });

  // Stats
  const avgComplianceScore = reports.length > 0
    ? Math.round(reports.reduce((sum, r) => sum + (r.compliance_score || 0), 0) / reports.length)
    : 0;
  const totalViolations = reports.reduce((sum, r) => sum + (r.violations_detected?.length || 0), 0);
  const criticalViolations = reports.reduce((sum, r) => 
    sum + (r.violations_detected?.filter(v => v.severity === 'critical').length || 0), 0);

  // Chart data
  const violationsBySeverity = reports.reduce((acc, r) => {
    (r.violations_detected || []).forEach(v => {
      acc[v.severity] = (acc[v.severity] || 0) + 1;
    });
    return acc;
  }, {});

  const severityChartData = Object.entries(violationsBySeverity).map(([key, value]) => ({
    name: key === 'critical' ? 'حرج' : key === 'high' ? 'عالي' : key === 'medium' ? 'متوسط' : 'منخفض',
    value,
    color: severityColors[key]
  }));

  const reportsByType = reports.reduce((acc, r) => {
    acc[r.report_type] = (acc[r.report_type] || 0) + 1;
    return acc;
  }, {});

  const typeChartData = Object.entries(reportsByType).map(([key, value]) => ({
    name: reportTypeLabels[key] || key,
    count: value
  }));

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              boxShadow: ['0 0 20px rgba(34, 211, 238, 0.4)', '0 0 40px rgba(168, 85, 247, 0.4)', '0 0 20px rgba(34, 211, 238, 0.4)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
          >
            <Shield className="w-7 h-7 text-cyan-400" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              مولد تقارير الامتثال بالذكاء الاصطناعي
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h3>
            <p className="text-slate-500 text-sm">تحليل تلقائي • كشف الانتهاكات • توصيات ذكية</p>
          </div>
        </div>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => setShowGenerateDialog(true)}
        >
          <FileText className="w-4 h-4 ml-2" />
          إنشاء تقرير
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-cyan-400" />
              <div>
                <p className="text-2xl font-bold text-white">{reports.length}</p>
                <p className="text-slate-500 text-xs">إجمالي التقارير</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${avgComplianceScore >= 80 ? 'bg-green-500/10 border-green-500/30' : avgComplianceScore >= 60 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className={`w-8 h-8 ${avgComplianceScore >= 80 ? 'text-green-400' : avgComplianceScore >= 60 ? 'text-amber-400' : 'text-red-400'}`} />
              <div>
                <p className={`text-2xl font-bold ${avgComplianceScore >= 80 ? 'text-green-400' : avgComplianceScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                  {avgComplianceScore}%
                </p>
                <p className="text-slate-500 text-xs">متوسط الامتثال</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-orange-400">{totalViolations}</p>
                <p className="text-slate-500 text-xs">إجمالي الانتهاكات</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertOctagon className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-red-400">{criticalViolations}</p>
                <p className="text-slate-500 text-xs">انتهاكات حرجة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="reports">التقارير</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="actions">الإجراءات</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {reports.map((report, index) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 cursor-pointer hover:border-cyan-500/50 transition-all"
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-white font-medium">{report.report_name || report.report_number}</span>
                            <Badge className={`${
                              report.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                              report.status === 'generated' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>
                              {report.status === 'approved' ? 'معتمد' : report.status === 'generated' ? 'جديد' : report.status}
                            </Badge>
                            <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                              {reportTypeLabels[report.report_type]}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm mb-2">{report.policy_name}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {report.report_period?.start_date} - {report.report_period?.end_date}
                            </span>
                            <span className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {report.violations_detected?.length || 0} انتهاك
                            </span>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${
                            report.compliance_score >= 80 ? 'text-green-400' :
                            report.compliance_score >= 60 ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {report.compliance_score}%
                          </div>
                          <p className="text-slate-500 text-xs">الامتثال</p>
                        </div>
                      </div>
                      {report.executive_summary && (
                        <div className="mt-3 p-2 bg-purple-500/10 rounded border border-purple-500/20">
                          <p className="text-purple-400 text-xs line-clamp-2">
                            <Brain className="w-3 h-3 inline ml-1" />
                            {report.executive_summary}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">توزيع الانتهاكات حسب الخطورة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {severityChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">التقارير حسب النوع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={typeChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actions">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                الإجراءات التصحيحية المقترحة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {reports.filter(r => r.ai_suggested_actions?.length > 0).flatMap(r => 
                    r.ai_suggested_actions.map((action, i) => ({
                      ...action,
                      reportName: r.report_name || r.report_number,
                      key: `${r.id}-${i}`
                    }))
                  ).map((action, index) => (
                    <motion.div
                      key={action.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`p-4 rounded-lg border ${
                        action.priority === 'critical' ? 'bg-red-500/5 border-red-500/30' :
                        action.priority === 'high' ? 'bg-orange-500/5 border-orange-500/30' :
                        action.priority === 'medium' ? 'bg-amber-500/5 border-amber-500/30' :
                        'bg-green-500/5 border-green-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-white font-medium mb-1">{action.action}</p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge className={`${
                              action.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                              action.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              action.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {action.priority === 'critical' ? 'حرج' : action.priority === 'high' ? 'عالي' : action.priority === 'medium' ? 'متوسط' : 'منخفض'}
                            </Badge>
                            {action.responsible_party && (
                              <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                                {action.responsible_party}
                              </Badge>
                            )}
                            {action.deadline && (
                              <Badge variant="outline" className="border-slate-500/50 text-slate-400">
                                <Clock className="w-3 h-3 ml-1" />
                                {action.deadline}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="border-slate-600">
                          <CheckCircle className="w-3 h-3 ml-1" />
                          تنفيذ
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Report Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              إنشاء تقرير امتثال جديد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">اسم التقرير</Label>
              <Input
                value={newReport.report_name}
                onChange={(e) => setNewReport({ ...newReport, report_name: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="مثال: تقرير الامتثال الشهري"
              />
            </div>
            <div>
              <Label className="text-slate-300">نوع التقرير</Label>
              <Select value={newReport.report_type} onValueChange={(v) => setNewReport({ ...newReport, report_type: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.entries(reportTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">اسم السياسة</Label>
              <Input
                value={newReport.policy_name}
                onChange={(e) => setNewReport({ ...newReport, policy_name: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="مثال: سياسة أمن المعلومات"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">من تاريخ</Label>
                <Input
                  type="date"
                  value={newReport.period_start}
                  onChange={(e) => setNewReport({ ...newReport, period_start: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300">إلى تاريخ</Label>
                <Input
                  type="date"
                  value={newReport.period_end}
                  onChange={(e) => setNewReport({ ...newReport, period_end: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                />
              </div>
            </div>
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => generateReportMutation.mutate()}
              disabled={generateReportMutation.isPending || !newReport.report_name}
            >
              {generateReportMutation.isPending ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <Brain className="w-4 h-4 ml-2" />
              )}
              إنشاء التقرير بالذكاء الاصطناعي
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              {selectedReport?.report_name || selectedReport?.report_number}
            </DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4 mt-4">
              {/* Score */}
              <div className="text-center p-6 bg-slate-800/50 rounded-lg">
                <div className={`text-5xl font-bold ${
                  selectedReport.compliance_score >= 80 ? 'text-green-400' :
                  selectedReport.compliance_score >= 60 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {selectedReport.compliance_score}%
                </div>
                <p className="text-slate-400 mt-1">درجة الامتثال</p>
              </div>

              {/* Executive Summary */}
              {selectedReport.executive_summary && (
                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <h4 className="text-purple-400 font-medium mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    الملخص التنفيذي
                  </h4>
                  <p className="text-slate-300 text-sm">{selectedReport.executive_summary}</p>
                </div>
              )}

              {/* Violations */}
              {selectedReport.violations_detected?.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    الانتهاكات المكتشفة ({selectedReport.violations_detected.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedReport.violations_detected.map((violation, i) => (
                      <div key={i} className={`p-3 rounded-lg border ${
                        violation.severity === 'critical' ? 'bg-red-500/5 border-red-500/30' :
                        violation.severity === 'high' ? 'bg-orange-500/5 border-orange-500/30' :
                        'bg-amber-500/5 border-amber-500/30'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-medium text-sm">{violation.rule}</span>
                          <Badge className={`${
                            violation.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            violation.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {violation.severity}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-xs">{violation.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {selectedReport.status === 'generated' && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      approveReportMutation.mutate(selectedReport.id);
                      setSelectedReport(null);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 ml-2" />
                    اعتماد التقرير
                  </Button>
                )}
                <Button variant="outline" className="flex-1 border-slate-600">
                  <Download className="w-4 h-4 ml-2" />
                  تصدير PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}