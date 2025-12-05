import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Plus, Download, Mail, Calendar, Clock, BarChart3, PieChart,
  LineChart, Table, Filter, Settings, Save, Play, Trash2, Edit, Copy,
  Check, Eye, Send, Zap, Car, Camera, AlertTriangle, Users, Wrench,
  Shield, Thermometer, Droplets, Activity, TrendingUp, Building2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  BarChart, Bar, LineChart as ReLineChart, Line, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { toast } from 'sonner';

const dataSources = [
  { id: 'energy', name: 'استهلاك الطاقة', icon: Zap, color: 'amber', fields: ['consumption', 'cost', 'savings', 'peak_hours'] },
  { id: 'devices', name: 'حالة الأجهزة', icon: Activity, color: 'cyan', fields: ['status', 'uptime', 'errors', 'health'] },
  { id: 'fleet', name: 'الأسطول', icon: Car, color: 'green', fields: ['trips', 'fuel', 'maintenance', 'driver_behavior'] },
  { id: 'cameras', name: 'الكاميرات', icon: Camera, color: 'purple', fields: ['recordings', 'alerts', 'storage', 'uptime'] },
  { id: 'incidents', name: 'الحوادث', icon: AlertTriangle, color: 'red', fields: ['count', 'severity', 'resolution_time', 'categories'] },
  { id: 'visitors', name: 'الزوار والتصاريح', icon: Users, color: 'pink', fields: ['permits', 'check_ins', 'types', 'duration'] },
  { id: 'maintenance', name: 'الصيانة', icon: Wrench, color: 'orange', fields: ['scheduled', 'completed', 'costs', 'parts'] },
  { id: 'security', name: 'الأمان', icon: Shield, color: 'indigo', fields: ['access_logs', 'alerts', 'threats', 'compliance'] },
  { id: 'weather', name: 'الطقس', icon: Thermometer, color: 'blue', fields: ['temperature', 'humidity', 'impact'] },
];

const visualizationTypes = [
  { id: 'table', name: 'جدول', icon: Table },
  { id: 'bar_chart', name: 'رسم أعمدة', icon: BarChart3 },
  { id: 'line_chart', name: 'رسم خطي', icon: LineChart },
  { id: 'pie_chart', name: 'رسم دائري', icon: PieChart },
  { id: 'area_chart', name: 'رسم مساحي', icon: TrendingUp },
];

const scheduleOptions = [
  { id: 'daily', name: 'يومي' },
  { id: 'weekly', name: 'أسبوعي' },
  { id: 'monthly', name: 'شهري' },
  { id: 'quarterly', name: 'ربع سنوي' },
  { id: 'custom', name: 'مخصص' },
];

const mockReports = [
  { id: 1, name: 'تقرير الطاقة الأسبوعي', type: 'energy', schedule: 'weekly', last_run: '2024-12-01', status: 'active', recipients: ['admin@example.com'] },
  { id: 2, name: 'ملخص حالة الأجهزة', type: 'devices', schedule: 'daily', last_run: '2024-12-04', status: 'active', recipients: ['tech@example.com'] },
  { id: 3, name: 'تقرير الأسطول الشهري', type: 'fleet', schedule: 'monthly', last_run: '2024-11-30', status: 'active', recipients: ['fleet@example.com'] },
];

const sampleChartData = [
  { name: 'السبت', value: 120, value2: 80 },
  { name: 'الأحد', value: 150, value2: 95 },
  { name: 'الإثنين', value: 180, value2: 110 },
  { name: 'الثلاثاء', value: 140, value2: 85 },
  { name: 'الأربعاء', value: 200, value2: 120 },
  { name: 'الخميس', value: 170, value2: 100 },
  { name: 'الجمعة', value: 90, value2: 60 },
];

const COLORS = ['#22d3ee', '#a855f7', '#f59e0b', '#10b981', '#ef4444', '#6366f1'];

export default function ReportBuilder() {
  const [reports, setReports] = useState(mockReports);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('saved');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [newReport, setNewReport] = useState({
    name: '',
    description: '',
    data_sources: [],
    selected_fields: {},
    visualization_type: 'table',
    date_range: 'week',
    custom_start: '',
    custom_end: '',
    filters: {},
    schedule: '',
    schedule_time: '08:00',
    schedule_day: 'sunday',
    recipients: [],
    export_format: 'pdf',
    is_scheduled: false
  });

  const [recipientEmail, setRecipientEmail] = useState('');

  const toggleDataSource = (sourceId) => {
    const sources = newReport.data_sources.includes(sourceId)
      ? newReport.data_sources.filter(s => s !== sourceId)
      : [...newReport.data_sources, sourceId];
    setNewReport({ ...newReport, data_sources: sources });
  };

  const toggleField = (sourceId, field) => {
    const sourceFields = newReport.selected_fields[sourceId] || [];
    const fields = sourceFields.includes(field)
      ? sourceFields.filter(f => f !== field)
      : [...sourceFields, field];
    setNewReport({
      ...newReport,
      selected_fields: { ...newReport.selected_fields, [sourceId]: fields }
    });
  };

  const addRecipient = () => {
    if (recipientEmail && !newReport.recipients.includes(recipientEmail)) {
      setNewReport({ ...newReport, recipients: [...newReport.recipients, recipientEmail] });
      setRecipientEmail('');
    }
  };

  const removeRecipient = (email) => {
    setNewReport({ ...newReport, recipients: newReport.recipients.filter(r => r !== email) });
  };

  const generateReport = async () => {
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsGenerating(false);
    toast.success('تم إنشاء التقرير بنجاح');
    setShowPreviewDialog(true);
  };

  const saveReport = () => {
    if (!newReport.name) {
      toast.error('يرجى إدخال اسم التقرير');
      return;
    }
    const report = {
      ...newReport,
      id: Date.now(),
      status: 'active',
      last_run: null
    };
    setReports([report, ...reports]);
    setShowCreateDialog(false);
    resetForm();
    toast.success('تم حفظ التقرير');
  };

  const exportReport = (format) => {
    toast.success(`جاري تصدير التقرير بصيغة ${format.toUpperCase()}`);
  };

  const sendReportByEmail = () => {
    toast.success('تم إرسال التقرير عبر البريد الإلكتروني');
  };

  const deleteReport = (id) => {
    setReports(reports.filter(r => r.id !== id));
    toast.success('تم حذف التقرير');
  };

  const resetForm = () => {
    setNewReport({
      name: '', description: '', data_sources: [], selected_fields: {},
      visualization_type: 'table', date_range: 'week', custom_start: '', custom_end: '',
      filters: {}, schedule: '', schedule_time: '08:00', schedule_day: 'sunday',
      recipients: [], export_format: 'pdf', is_scheduled: false
    });
  };

  const renderVisualization = () => {
    switch (newReport.visualization_type) {
      case 'bar_chart':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sampleChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
              <Legend />
              <Bar dataKey="value" fill="#22d3ee" name="القيمة 1" />
              <Bar dataKey="value2" fill="#a855f7" name="القيمة 2" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line_chart':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ReLineChart data={sampleChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#22d3ee" name="القيمة 1" />
              <Line type="monotone" dataKey="value2" stroke="#a855f7" name="القيمة 2" />
            </ReLineChart>
          </ResponsiveContainer>
        );
      case 'pie_chart':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie data={sampleChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {sampleChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
              <Legend />
            </RePieChart>
          </ResponsiveContainer>
        );
      case 'area_chart':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sampleChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
              <Area type="monotone" dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-right text-slate-400 p-3">اليوم</th>
                  <th className="text-right text-slate-400 p-3">القيمة 1</th>
                  <th className="text-right text-slate-400 p-3">القيمة 2</th>
                </tr>
              </thead>
              <tbody>
                {sampleChartData.map((row, i) => (
                  <tr key={i} className="border-b border-slate-800">
                    <td className="text-white p-3">{row.name}</td>
                    <td className="text-cyan-400 p-3">{row.value}</td>
                    <td className="text-purple-400 p-3">{row.value2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-cyan-400" />
              منشئ التقارير
            </h1>
            <p className="text-slate-400 mt-1">إنشاء وتخصيص وجدولة التقارير</p>
          </div>
          <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 ml-2" />
            تقرير جديد
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'التقارير المحفوظة', value: reports.length, icon: FileText, color: 'cyan' },
          { label: 'التقارير المجدولة', value: reports.filter(r => r.schedule).length, icon: Calendar, color: 'purple' },
          { label: 'تم التشغيل اليوم', value: 5, icon: Play, color: 'green' },
          { label: 'المستلمون', value: 12, icon: Mail, color: 'amber' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-500/20`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Reports List */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="border-b border-slate-700/50">
          <CardTitle className="text-white">التقارير المحفوظة</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {reports.map((report, i) => {
              const source = dataSources.find(s => s.id === report.type);
              const Icon = source?.icon || FileText;
              return (
                <motion.div key={report.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800/70 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-${source?.color || 'cyan'}-500/20`}>
                        <Icon className={`w-5 h-5 text-${source?.color || 'cyan'}-400`} />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{report.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-slate-700 text-slate-300 text-xs">{source?.name}</Badge>
                          <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                            {scheduleOptions.find(s => s.id === report.schedule)?.name}
                          </Badge>
                          {report.last_run && (
                            <span className="text-slate-500 text-xs">آخر تشغيل: {report.last_run}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="text-cyan-400" onClick={() => { setSelectedReport(report); setShowPreviewDialog(true); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-green-400" onClick={() => generateReport()}>
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-amber-400" onClick={() => exportReport('pdf')}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-purple-400" onClick={() => sendReportByEmail()}>
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-400" onClick={() => deleteReport(report.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Create Report Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              إنشاء تقرير جديد
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="data" className="mt-4">
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1 mb-4">
              <TabsTrigger value="data">مصادر البيانات</TabsTrigger>
              <TabsTrigger value="visualization">العرض البصري</TabsTrigger>
              <TabsTrigger value="schedule">الجدولة</TabsTrigger>
              <TabsTrigger value="preview">معاينة</TabsTrigger>
            </TabsList>

            <TabsContent value="data" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">اسم التقرير *</Label>
                  <Input value={newReport.name} onChange={(e) => setNewReport({ ...newReport, name: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="تقرير الطاقة الأسبوعي" />
                </div>
                <div>
                  <Label className="text-slate-300">الفترة الزمنية</Label>
                  <Select value={newReport.date_range} onValueChange={(v) => setNewReport({ ...newReport, date_range: v })}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="today">اليوم</SelectItem>
                      <SelectItem value="week">الأسبوع الماضي</SelectItem>
                      <SelectItem value="month">الشهر الماضي</SelectItem>
                      <SelectItem value="quarter">الربع الماضي</SelectItem>
                      <SelectItem value="year">السنة الماضية</SelectItem>
                      <SelectItem value="custom">مخصص</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newReport.date_range === 'custom' && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">من تاريخ</Label>
                    <Input type="date" value={newReport.custom_start} onChange={(e) => setNewReport({ ...newReport, custom_start: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-slate-300">إلى تاريخ</Label>
                    <Input type="date" value={newReport.custom_end} onChange={(e) => setNewReport({ ...newReport, custom_end: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
                  </div>
                </div>
              )}

              <div>
                <Label className="text-slate-300 mb-3 block">اختر مصادر البيانات</Label>
                <div className="grid md:grid-cols-3 gap-3">
                  {dataSources.map(source => {
                    const Icon = source.icon;
                    const isSelected = newReport.data_sources.includes(source.id);
                    return (
                      <div key={source.id} className={`p-4 rounded-xl cursor-pointer transition-all border ${isSelected ? `bg-${source.color}-500/20 border-${source.color}-500/50` : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}`} onClick={() => toggleDataSource(source.id)}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg bg-${source.color}-500/20`}>
                            <Icon className={`w-5 h-5 text-${source.color}-400`} />
                          </div>
                          <span className="text-white font-medium">{source.name}</span>
                        </div>
                        {isSelected && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {source.fields.map(field => (
                              <Badge key={field} variant="outline" className={`cursor-pointer text-xs ${newReport.selected_fields[source.id]?.includes(field) ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400' : 'border-slate-600 text-slate-400'}`} onClick={(e) => { e.stopPropagation(); toggleField(source.id, field); }}>
                                {field}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="visualization" className="space-y-4">
              <div>
                <Label className="text-slate-300 mb-3 block">نوع العرض</Label>
                <div className="grid grid-cols-5 gap-3">
                  {visualizationTypes.map(viz => {
                    const Icon = viz.icon;
                    return (
                      <button key={viz.id} onClick={() => setNewReport({ ...newReport, visualization_type: viz.id })} className={`p-4 rounded-xl text-center transition-all border ${newReport.visualization_type === viz.id ? 'bg-cyan-500/20 border-cyan-500/50' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}`}>
                        <Icon className={`w-8 h-8 mx-auto mb-2 ${newReport.visualization_type === viz.id ? 'text-cyan-400' : 'text-slate-400'}`} />
                        <span className={`text-sm ${newReport.visualization_type === viz.id ? 'text-white' : 'text-slate-400'}`}>{viz.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-xl">
                <h4 className="text-white font-medium mb-4">معاينة العرض</h4>
                {renderVisualization()}
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                <div>
                  <p className="text-white font-medium">تفعيل الجدولة التلقائية</p>
                  <p className="text-slate-400 text-sm">إرسال التقرير تلقائياً حسب الجدول</p>
                </div>
                <Switch checked={newReport.is_scheduled} onCheckedChange={(v) => setNewReport({ ...newReport, is_scheduled: v })} />
              </div>

              {newReport.is_scheduled && (
                <>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-300">التكرار</Label>
                      <Select value={newReport.schedule} onValueChange={(v) => setNewReport({ ...newReport, schedule: v })}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1"><SelectValue placeholder="اختر" /></SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {scheduleOptions.map(opt => <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-300">الوقت</Label>
                      <Input type="time" value={newReport.schedule_time} onChange={(e) => setNewReport({ ...newReport, schedule_time: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-1" />
                    </div>
                    <div>
                      <Label className="text-slate-300">صيغة التصدير</Label>
                      <Select value={newReport.export_format} onValueChange={(v) => setNewReport({ ...newReport, export_format: v })}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="both">PDF + CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300 mb-2 block">المستلمون</Label>
                    <div className="flex gap-2 mb-2">
                      <Input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className="bg-slate-800/50 border-slate-700 text-white" placeholder="email@example.com" />
                      <Button onClick={addRecipient}><Plus className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newReport.recipients.map(email => (
                        <Badge key={email} className="bg-slate-700 text-slate-300">
                          {email}
                          <button onClick={() => removeRecipient(email)} className="mr-2 text-red-400 hover:text-red-300">×</button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <h4 className="text-white font-medium mb-4">ملخص التقرير</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-400">الاسم:</span> <span className="text-white mr-2">{newReport.name || '-'}</span></div>
                  <div><span className="text-slate-400">الفترة:</span> <span className="text-white mr-2">{newReport.date_range}</span></div>
                  <div><span className="text-slate-400">مصادر البيانات:</span> <span className="text-white mr-2">{newReport.data_sources.length} مصدر</span></div>
                  <div><span className="text-slate-400">العرض:</span> <span className="text-white mr-2">{visualizationTypes.find(v => v.id === newReport.visualization_type)?.name}</span></div>
                </div>
              </div>
              {renderVisualization()}
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 mt-6 pt-4 border-t border-slate-700">
            <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={saveReport}>
              <Save className="w-4 h-4 ml-2" />
              حفظ التقرير
            </Button>
            <Button variant="outline" className="border-green-500/50 text-green-400" onClick={generateReport} disabled={isGenerating}>
              {isGenerating ? <Activity className="w-4 h-4 ml-2 animate-spin" /> : <Play className="w-4 h-4 ml-2" />}
              تشغيل الآن
            </Button>
            <Button variant="outline" className="border-slate-600" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">معاينة التقرير</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {renderVisualization()}
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => exportReport('pdf')}>
                <Download className="w-4 h-4 ml-2" />
                تصدير PDF
              </Button>
              <Button variant="outline" className="flex-1 border-slate-600" onClick={() => exportReport('csv')}>
                <Download className="w-4 h-4 ml-2" />
                تصدير CSV
              </Button>
              <Button variant="outline" className="border-purple-500/50 text-purple-400" onClick={sendReportByEmail}>
                <Mail className="w-4 h-4 ml-2" />
                إرسال
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}