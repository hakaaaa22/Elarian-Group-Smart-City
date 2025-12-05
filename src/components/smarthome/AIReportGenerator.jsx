import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  FileText, Calendar, Download, Send, Loader2, Brain, Sparkles,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap, Shield,
  Activity, Clock, BarChart3, PieChart, Eye, RefreshCw, Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const reportTypes = [
  { id: 'daily', name: 'تقرير يومي', icon: Calendar, color: 'cyan', schedule: 'يومياً الساعة 8 صباحاً' },
  { id: 'weekly', name: 'تقرير أسبوعي', icon: BarChart3, color: 'purple', schedule: 'كل يوم سبت' },
  { id: 'monthly', name: 'تقرير شهري', icon: PieChart, color: 'amber', schedule: 'اليوم الأول من كل شهر' },
];

const mockReports = [
  { id: 1, type: 'daily', date: '2024-12-04', status: 'generated', size: '245 KB' },
  { id: 2, type: 'weekly', date: '2024-12-01', status: 'generated', size: '1.2 MB' },
  { id: 3, type: 'monthly', date: '2024-11-01', status: 'generated', size: '3.8 MB' },
];

export default function AIReportGenerator({ devices = [], automations = [] }) {
  const [reportConfig, setReportConfig] = useState({
    type: 'daily',
    includeSecurity: true,
    includeEnergy: true,
    includeDevices: true,
    includeAutomation: true,
    autoSend: false,
    recipients: []
  });
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [savedReports, setSavedReports] = useState(mockReports);

  const generateReportMutation = useMutation({
    mutationFn: async (config) => {
      const deviceList = devices.map(d => `${d.name} (${d.category}, ${d.status})`).join('\n');
      const automationList = automations.map(a => `${a.name} (${a.status})`).join('\n');
      
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت محلل ذكي للمنزل الذكي. قم بإنشاء تقرير ${config.type === 'daily' ? 'يومي' : config.type === 'weekly' ? 'أسبوعي' : 'شهري'} شامل.

الأجهزة:
${deviceList || 'مكيف، إضاءة، قفل ذكي، كاميرا'}

الأتمتة:
${automationList || 'إطفاء الأضواء ليلاً، تشغيل المكيف قبل الوصول'}

قم بإنشاء تقرير يشمل:
1. ملخص تنفيذي (أهم 3 نقاط)
2. تحليل الأمان (الأحداث، التنبيهات، الحالة العامة)
3. تحليل استهلاك الطاقة (الاستهلاك، التوفير، المقارنة بالفترة السابقة)
4. استخدام الأجهزة (الأكثر استخداماً، المشاكل، الأجهزة غير المتصلة)
5. أداء الأتمتة (التنفيذات، النجاح، التوصيات)
6. توصيات قابلة للتنفيذ (3-5 توصيات)
7. التنبؤات للفترة القادمة`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            period: { type: 'string' },
            summary: {
              type: 'object',
              properties: {
                highlights: { type: 'array', items: { type: 'string' } },
                overallScore: { type: 'number' },
                trend: { type: 'string' }
              }
            },
            security: {
              type: 'object',
              properties: {
                eventsCount: { type: 'number' },
                criticalAlerts: { type: 'number' },
                status: { type: 'string' },
                incidents: { type: 'array', items: { type: 'string' } },
                recommendations: { type: 'array', items: { type: 'string' } }
              }
            },
            energy: {
              type: 'object',
              properties: {
                totalConsumption: { type: 'number' },
                cost: { type: 'number' },
                savings: { type: 'number' },
                comparison: { type: 'string' },
                topConsumers: { type: 'array', items: { type: 'string' } },
                recommendations: { type: 'array', items: { type: 'string' } }
              }
            },
            devices: {
              type: 'object',
              properties: {
                totalDevices: { type: 'number' },
                online: { type: 'number' },
                offline: { type: 'number' },
                errors: { type: 'number' },
                mostUsed: { type: 'array', items: { type: 'string' } },
                issues: { type: 'array', items: { type: 'string' } }
              }
            },
            automation: {
              type: 'object',
              properties: {
                totalRules: { type: 'number' },
                executions: { type: 'number' },
                successRate: { type: 'number' },
                energySaved: { type: 'number' },
                topPerformers: { type: 'array', items: { type: 'string' } },
                recommendations: { type: 'array', items: { type: 'string' } }
              }
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  priority: { type: 'string' },
                  impact: { type: 'string' },
                  action: { type: 'string' }
                }
              }
            },
            predictions: {
              type: 'object',
              properties: {
                nextPeriod: { type: 'string' },
                energyForecast: { type: 'string' },
                costForecast: { type: 'string' },
                alerts: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      });
    },
    onSuccess: (data) => {
      setGeneratedReport(data);
      setShowReportDialog(true);
      setSavedReports([{ id: Date.now(), type: reportConfig.type, date: new Date().toISOString().split('T')[0], status: 'generated', size: '1.5 MB' }, ...savedReports]);
      toast.success('تم إنشاء التقرير بنجاح');
    },
    onError: () => toast.error('فشل في إنشاء التقرير')
  });

  const downloadReport = () => {
    if (!generatedReport) return;
    const reportText = JSON.stringify(generatedReport, null, 2);
    const blob = new Blob([reportText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-home-report-${reportConfig.type}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('تم تنزيل التقرير');
  };

  const sendReport = () => {
    toast.success('تم إرسال التقرير بالبريد الإلكتروني');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            مولّد التقارير الذكي
          </h3>
          <p className="text-slate-400 text-sm">تقارير دورية شاملة مع تحليلات AI</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-600" onClick={() => setShowConfigDialog(true)}>
            <Calendar className="w-4 h-4 ml-2" />
            جدولة تلقائية
          </Button>
          <Button 
            className="bg-cyan-600 hover:bg-cyan-700"
            onClick={() => generateReportMutation.mutate(reportConfig)}
            disabled={generateReportMutation.isPending}
          >
            {generateReportMutation.isPending ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
            إنشاء تقرير
          </Button>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid md:grid-cols-3 gap-4">
        {reportTypes.map(type => (
          <Card 
            key={type.id}
            className={`glass-card cursor-pointer transition-all ${
              reportConfig.type === type.id 
                ? `border-${type.color}-500/50 bg-${type.color}-500/10 ring-1 ring-${type.color}-500/30`
                : 'border-indigo-500/20 bg-[#0f1629]/80 hover:border-slate-600'
            }`}
            onClick={() => setReportConfig({ ...reportConfig, type: type.id })}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-lg bg-${type.color}-500/20`}>
                  <type.icon className={`w-6 h-6 text-${type.color}-400`} />
                </div>
                {reportConfig.type === type.id && <CheckCircle className="w-5 h-5 text-green-400" />}
              </div>
              <h4 className="text-white font-bold mb-1">{type.name}</h4>
              <p className="text-slate-400 text-xs">{type.schedule}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Configuration */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader>
          <CardTitle className="text-white text-sm">محتوى التقرير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { key: 'includeSecurity', label: 'تحليل الأمان', icon: Shield },
              { key: 'includeEnergy', label: 'استهلاك الطاقة', icon: Zap },
              { key: 'includeDevices', label: 'استخدام الأجهزة', icon: Activity },
              { key: 'includeAutomation', label: 'أداء الأتمتة', icon: Clock },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-slate-400" />
                  <span className="text-white text-sm">{item.label}</span>
                </div>
                <Switch 
                  checked={reportConfig[item.key]}
                  onCheckedChange={(checked) => setReportConfig({ ...reportConfig, [item.key]: checked })}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader>
          <CardTitle className="text-white text-sm">التقارير المحفوظة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {savedReports.map(report => {
              const type = reportTypes.find(t => t.id === report.type);
              return (
                <div key={report.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${type?.color}-500/20`}>
                      <type.icon className={`w-4 h-4 text-${type?.color}-400`} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{type?.name}</p>
                      <p className="text-slate-400 text-xs">{report.date} - {report.size}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-slate-600">
                      <Eye className="w-3 h-3 ml-1" />
                      عرض
                    </Button>
                    <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-400">
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Generated Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              {generatedReport?.title}
            </DialogTitle>
          </DialogHeader>
          {generatedReport && (
            <div className="space-y-6 mt-4">
              {/* Summary */}
              <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-bold">الملخص التنفيذي</h4>
                  <div className="flex items-center gap-2">
                    <Badge className={`${
                      generatedReport.summary.trend === 'improving' ? 'bg-green-500/20 text-green-400' :
                      generatedReport.summary.trend === 'stable' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {generatedReport.summary.trend === 'improving' ? 'تحسّن' : generatedReport.summary.trend === 'stable' ? 'مستقر' : 'يحتاج انتباه'}
                    </Badge>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-cyan-400">{generatedReport.summary.overallScore}/100</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {generatedReport.summary.highlights.map((highlight, i) => (
                    <div key={i} className="flex items-center gap-2 text-white text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      {highlight}
                    </div>
                  ))}
                </div>
              </div>

              <Tabs defaultValue="security" className="w-full">
                <TabsList className="bg-slate-800/50 border border-slate-700 p-1 w-full">
                  {reportConfig.includeSecurity && <TabsTrigger value="security">الأمان</TabsTrigger>}
                  {reportConfig.includeEnergy && <TabsTrigger value="energy">الطاقة</TabsTrigger>}
                  {reportConfig.includeDevices && <TabsTrigger value="devices">الأجهزة</TabsTrigger>}
                  {reportConfig.includeAutomation && <TabsTrigger value="automation">الأتمتة</TabsTrigger>}
                  <TabsTrigger value="recommendations">التوصيات</TabsTrigger>
                </TabsList>

                {/* Security Tab */}
                {reportConfig.includeSecurity && generatedReport.security && (
                  <TabsContent value="security" className="space-y-4 mt-4">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-white">{generatedReport.security.eventsCount}</p>
                        <p className="text-slate-400 text-xs">أحداث أمنية</p>
                      </div>
                      <div className="p-3 bg-red-500/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-red-400">{generatedReport.security.criticalAlerts}</p>
                        <p className="text-slate-400 text-xs">تنبيهات حرجة</p>
                      </div>
                      <div className="p-3 bg-slate-800/50 rounded-lg text-center col-span-2">
                        <p className="text-sm text-slate-400 mb-1">الحالة العامة</p>
                        <Badge className={`${
                          generatedReport.security.status === 'excellent' ? 'bg-green-500/20 text-green-400' :
                          generatedReport.security.status === 'good' ? 'bg-cyan-500/20 text-cyan-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {generatedReport.security.status}
                        </Badge>
                      </div>
                    </div>
                    {generatedReport.security.incidents?.length > 0 && (
                      <div>
                        <h5 className="text-slate-300 text-sm font-medium mb-2">أهم الأحداث</h5>
                        <div className="space-y-2">
                          {generatedReport.security.incidents.map((incident, i) => (
                            <div key={i} className="p-2 bg-slate-800/50 rounded text-white text-sm">• {incident}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                )}

                {/* Energy Tab */}
                {reportConfig.includeEnergy && generatedReport.energy && (
                  <TabsContent value="energy" className="space-y-4 mt-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-amber-500/10 rounded-lg text-center">
                        <Zap className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-white">{generatedReport.energy.totalConsumption} kWh</p>
                        <p className="text-slate-400 text-xs">الاستهلاك</p>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded-lg text-center">
                        <TrendingDown className="w-5 h-5 text-green-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-green-400">{generatedReport.energy.savings} kWh</p>
                        <p className="text-slate-400 text-xs">التوفير</p>
                      </div>
                      <div className="p-3 bg-cyan-500/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-cyan-400">{generatedReport.energy.cost} ر.س</p>
                        <p className="text-slate-400 text-xs">التكلفة</p>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-slate-400 text-xs mb-1">المقارنة</p>
                      <p className="text-white text-sm">{generatedReport.energy.comparison}</p>
                    </div>
                    {generatedReport.energy.topConsumers?.length > 0 && (
                      <div>
                        <h5 className="text-slate-300 text-sm font-medium mb-2">أعلى المستهلكين</h5>
                        <div className="space-y-1">
                          {generatedReport.energy.topConsumers.map((consumer, i) => (
                            <div key={i} className="p-2 bg-slate-800/50 rounded text-white text-sm">• {consumer}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                )}

                {/* Devices Tab */}
                {reportConfig.includeDevices && generatedReport.devices && (
                  <TabsContent value="devices" className="space-y-4 mt-4">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-white">{generatedReport.devices.totalDevices}</p>
                        <p className="text-slate-400 text-xs">إجمالي</p>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-400">{generatedReport.devices.online}</p>
                        <p className="text-slate-400 text-xs">متصل</p>
                      </div>
                      <div className="p-3 bg-red-500/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-red-400">{generatedReport.devices.offline}</p>
                        <p className="text-slate-400 text-xs">غير متصل</p>
                      </div>
                      <div className="p-3 bg-amber-500/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-amber-400">{generatedReport.devices.errors}</p>
                        <p className="text-slate-400 text-xs">أخطاء</p>
                      </div>
                    </div>
                    {generatedReport.devices.issues?.length > 0 && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <h5 className="text-red-300 text-sm font-medium mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          المشاكل المكتشفة
                        </h5>
                        <div className="space-y-1">
                          {generatedReport.devices.issues.map((issue, i) => (
                            <p key={i} className="text-white text-xs">• {issue}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                )}

                {/* Automation Tab */}
                {reportConfig.includeAutomation && generatedReport.automation && (
                  <TabsContent value="automation" className="space-y-4 mt-4">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="p-3 bg-purple-500/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-purple-400">{generatedReport.automation.totalRules}</p>
                        <p className="text-slate-400 text-xs">قواعد</p>
                      </div>
                      <div className="p-3 bg-cyan-500/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-cyan-400">{generatedReport.automation.executions}</p>
                        <p className="text-slate-400 text-xs">تنفيذات</p>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-400">{generatedReport.automation.successRate}%</p>
                        <p className="text-slate-400 text-xs">نجاح</p>
                      </div>
                      <div className="p-3 bg-amber-500/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-amber-400">{generatedReport.automation.energySaved} kWh</p>
                        <p className="text-slate-400 text-xs">وفّرت</p>
                      </div>
                    </div>
                  </TabsContent>
                )}

                {/* Recommendations Tab */}
                <TabsContent value="recommendations" className="space-y-3 mt-4">
                  {generatedReport.recommendations?.map((rec, i) => (
                    <Card key={i} className={`glass-card ${
                      rec.priority === 'high' ? 'border-red-500/30 bg-red-500/5' :
                      rec.priority === 'medium' ? 'border-amber-500/30 bg-amber-500/5' :
                      'border-green-500/30 bg-green-500/5'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white font-medium">{rec.title}</h4>
                          <Badge className={`text-xs ${
                            rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            rec.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {rec.priority === 'high' ? 'عالي' : rec.priority === 'medium' ? 'متوسط' : 'منخفض'}
                          </Badge>
                        </div>
                        <p className="text-slate-300 text-sm mb-2">{rec.action}</p>
                        <p className="text-green-400 text-xs">التأثير المتوقع: {rec.impact}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 border-slate-600" onClick={downloadReport}>
                  <Download className="w-4 h-4 ml-2" />
                  تنزيل
                </Button>
                <Button variant="outline" className="flex-1 border-cyan-500/50 text-cyan-400" onClick={sendReport}>
                  <Mail className="w-4 h-4 ml-2" />
                  إرسال
                </Button>
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => setShowReportDialog(false)}>
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Auto Schedule Config Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">جدولة التقارير التلقائية</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
              <span className="text-white text-sm">إرسال تلقائي بالبريد</span>
              <Switch 
                checked={reportConfig.autoSend}
                onCheckedChange={(checked) => setReportConfig({ ...reportConfig, autoSend: checked })}
              />
            </div>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={() => { setShowConfigDialog(false); toast.success('تم حفظ الإعدادات'); }}>
              <CheckCircle className="w-4 h-4 ml-2" />
              حفظ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}