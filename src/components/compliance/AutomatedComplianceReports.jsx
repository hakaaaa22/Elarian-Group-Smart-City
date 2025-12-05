import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  FileText, Calendar, Download, Clock, AlertTriangle, CheckCircle,
  TrendingUp, Shield, Settings, Bell, Mail, Filter, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const reportTypes = [
  { id: 'daily', name: 'يومي', icon: Clock, color: 'cyan' },
  { id: 'weekly', name: 'أسبوعي', icon: Calendar, color: 'green' },
  { id: 'monthly', name: 'شهري', icon: BarChart3, color: 'purple' },
];

const mockScheduledReports = [
  { id: 1, name: 'تقرير الامتثال اليومي', frequency: 'daily', time: '08:00', recipients: ['admin@company.com'], active: true, lastRun: '2024-12-04 08:00' },
  { id: 2, name: 'ملخص المخالفات الأسبوعي', frequency: 'weekly', day: 'sunday', time: '09:00', recipients: ['manager@company.com'], active: true, lastRun: '2024-12-01 09:00' },
  { id: 3, name: 'تقرير الأمان الشهري', frequency: 'monthly', day: '1', time: '10:00', recipients: ['security@company.com'], active: false, lastRun: '2024-11-01 10:00' },
];

const mockComplianceData = {
  overallScore: 87,
  totalChecks: 245,
  passed: 213,
  failed: 18,
  warnings: 14,
  criticalIssues: 3,
  deviations: [
    { id: 1, type: 'access', description: 'محاولة وصول غير مصرح بها', severity: 'high', date: '2024-12-04 10:30' },
    { id: 2, type: 'data', description: 'تصدير بيانات بكمية كبيرة', severity: 'medium', date: '2024-12-04 09:15' },
    { id: 3, type: 'policy', description: 'انتهاك سياسة كلمة المرور', severity: 'low', date: '2024-12-03 14:20' },
  ],
  riskIndicators: [
    { name: 'مخاطر الوصول', score: 25, trend: 'down' },
    { name: 'مخاطر البيانات', score: 42, trend: 'up' },
    { name: 'مخاطر الامتثال', score: 18, trend: 'stable' },
  ]
};

export default function AutomatedComplianceReports() {
  const [scheduledReports, setScheduledReports] = useState(mockScheduledReports);
  const [showNewReport, setShowNewReport] = useState(false);
  const [newReport, setNewReport] = useState({
    name: '', frequency: 'daily', time: '08:00', recipients: '', sections: []
  });

  const generateReport = useMutation({
    mutationFn: async (type) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتوليد تقرير امتثال ${type === 'daily' ? 'يومي' : type === 'weekly' ? 'أسبوعي' : 'شهري'} شامل يتضمن:
        
بيانات الامتثال الحالية:
${JSON.stringify(mockComplianceData, null, 2)}

أنشئ تقريراً يتضمن:
1. ملخص تنفيذي
2. حالة الامتثال العامة
3. الانحرافات المكتشفة مع التفاصيل
4. مؤشرات المخاطر وتحليلها
5. التوصيات والإجراءات المطلوبة
6. المقارنة مع الفترة السابقة`,
        response_json_schema: {
          type: "object",
          properties: {
            executiveSummary: { type: "string" },
            complianceStatus: { type: "string" },
            deviationsAnalysis: { type: "array", items: { type: "string" } },
            riskAnalysis: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            comparison: { type: "string" }
          }
        }
      });
    },
    onSuccess: () => {
      toast.success('تم توليد التقرير بنجاح');
    }
  });

  const exportReport = (format) => {
    toast.success(`جاري تصدير التقرير بصيغة ${format}...`);
  };

  const toggleReport = (id) => {
    setScheduledReports(reports => 
      reports.map(r => r.id === id ? { ...r, active: !r.active } : r)
    );
    toast.success('تم تحديث حالة التقرير');
  };

  const createScheduledReport = () => {
    if (!newReport.name) {
      toast.error('يرجى إدخال اسم التقرير');
      return;
    }
    const report = {
      ...newReport,
      id: Date.now(),
      recipients: newReport.recipients.split(',').map(e => e.trim()),
      active: true,
      lastRun: null
    };
    setScheduledReports([...scheduledReports, report]);
    setShowNewReport(false);
    setNewReport({ name: '', frequency: 'daily', time: '08:00', recipients: '', sections: [] });
    toast.success('تم إنشاء التقرير المجدول');
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" />
          التقارير الآلية
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" className="border-green-500/50 text-green-400" onClick={() => exportReport('PDF')}>
            <Download className="w-4 h-4 ml-2" />
            PDF
          </Button>
          <Button variant="outline" className="border-cyan-500/50 text-cyan-400" onClick={() => exportReport('Excel')}>
            <Download className="w-4 h-4 ml-2" />
            Excel
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowNewReport(true)}>
            <Calendar className="w-4 h-4 ml-2" />
            جدولة تقرير
          </Button>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{mockComplianceData.overallScore}%</p>
            <p className="text-slate-400 text-sm">نسبة الامتثال</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-4 text-center">
            <Shield className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{mockComplianceData.passed}/{mockComplianceData.totalChecks}</p>
            <p className="text-slate-400 text-sm">فحوصات ناجحة</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{mockComplianceData.warnings}</p>
            <p className="text-slate-400 text-sm">تحذيرات</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{mockComplianceData.criticalIssues}</p>
            <p className="text-slate-400 text-sm">مشاكل حرجة</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generate">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="generate">توليد تقرير</TabsTrigger>
          <TabsTrigger value="scheduled">التقارير المجدولة</TabsTrigger>
          <TabsTrigger value="deviations">الانحرافات</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            {reportTypes.map(type => (
              <Card key={type.id} className={`bg-${type.color}-500/10 border-${type.color}-500/30 cursor-pointer hover:bg-${type.color}-500/20 transition-all`}>
                <CardContent className="p-6 text-center">
                  <type.icon className={`w-12 h-12 text-${type.color}-400 mx-auto mb-4`} />
                  <h4 className="text-white font-bold mb-2">تقرير {type.name}</h4>
                  <Button 
                    className={`bg-${type.color}-600 hover:bg-${type.color}-700`}
                    onClick={() => generateReport.mutate(type.id)}
                    disabled={generateReport.isPending}
                  >
                    {generateReport.isPending ? 'جاري التوليد...' : 'توليد الآن'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {generateReport.data && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">نتائج التقرير</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <h4 className="text-purple-400 font-medium mb-2">الملخص التنفيذي</h4>
                  <p className="text-white text-sm">{generateReport.data.executiveSummary}</p>
                </div>
                {generateReport.data.recommendations?.length > 0 && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <h4 className="text-green-400 font-medium mb-2">التوصيات</h4>
                    <ul className="space-y-1">
                      {generateReport.data.recommendations.map((rec, i) => (
                        <li key={i} className="text-white text-sm flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-green-400 mt-1" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4 mt-4">
          {scheduledReports.map(report => (
            <Card key={report.id} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${report.active ? 'bg-green-500/20' : 'bg-slate-700'}`}>
                      <FileText className={`w-5 h-5 ${report.active ? 'text-green-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <p className="text-white font-medium">{report.name}</p>
                      <p className="text-slate-400 text-sm">
                        {report.frequency === 'daily' ? 'يومي' : report.frequency === 'weekly' ? 'أسبوعي' : 'شهري'} • {report.time}
                      </p>
                      <p className="text-slate-500 text-xs">آخر تشغيل: {report.lastRun || 'لم يتم'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-400 text-sm">{report.recipients.length}</span>
                    </div>
                    <Switch checked={report.active} onCheckedChange={() => toggleReport(report.id)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="deviations" className="space-y-4 mt-4">
          {mockComplianceData.deviations.map(dev => (
            <Card key={dev.id} className={`${
              dev.severity === 'high' ? 'bg-red-500/10 border-red-500/30' :
              dev.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
              'bg-blue-500/10 border-blue-500/30'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className={
                      dev.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                      dev.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-blue-500/20 text-blue-400'
                    }>
                      {dev.severity === 'high' ? 'عالي' : dev.severity === 'medium' ? 'متوسط' : 'منخفض'}
                    </Badge>
                    <p className="text-white mt-2">{dev.description}</p>
                    <p className="text-slate-500 text-sm">{dev.date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* New Report Modal */}
      {showNewReport && (
        <Card className="fixed inset-x-4 top-1/4 mx-auto max-w-lg bg-[#0f1629] border-slate-700 z-50">
          <CardHeader>
            <CardTitle className="text-white">جدولة تقرير جديد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-300">اسم التقرير</Label>
              <Input value={newReport.name} onChange={(e) => setNewReport({...newReport, name: e.target.value})} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">التكرار</Label>
                <Select value={newReport.frequency} onValueChange={(v) => setNewReport({...newReport, frequency: v})}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="daily">يومي</SelectItem>
                    <SelectItem value="weekly">أسبوعي</SelectItem>
                    <SelectItem value="monthly">شهري</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">الوقت</Label>
                <Input type="time" value={newReport.time} onChange={(e) => setNewReport({...newReport, time: e.target.value})} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-slate-300">المستلمون (مفصولين بفاصلة)</Label>
              <Input value={newReport.recipients} onChange={(e) => setNewReport({...newReport, recipients: e.target.value})} placeholder="email1@company.com, email2@company.com" className="bg-slate-800/50 border-slate-700 text-white mt-1" />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={createScheduledReport}>إنشاء</Button>
              <Button variant="outline" className="border-slate-600" onClick={() => setShowNewReport(false)}>إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}