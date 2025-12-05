import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, History, Users, Camera, Lock, FileText, Search, Filter,
  Download, Eye, AlertTriangle, CheckCircle, Clock, Activity, Database,
  Server, Globe, Key, UserCheck, Settings, Calendar, BarChart3, Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import AutomatedComplianceReports from '@/components/compliance/AutomatedComplianceReports';
import AdvancedPredictiveAnalytics from '@/components/predictive/AdvancedPredictiveAnalytics';
import UserBehaviorRiskAnalysis from '@/components/compliance/UserBehaviorRiskAnalysis';
import AIComplianceReportGenerator from '@/components/compliance/AIComplianceReportGenerator';

// سجل النشاطات
const auditLogs = [
  { id: 1, user: 'أحمد محمد', action: 'تسجيل دخول', module: 'المصادقة', ip: '192.168.1.100', time: '10:30', status: 'success', details: 'تسجيل دخول ناجح' },
  { id: 2, user: 'سارة علي', action: 'تعديل مستخدم', module: 'إدارة المستخدمين', ip: '192.168.1.101', time: '10:25', status: 'success', details: 'تعديل صلاحيات المستخدم خالد' },
  { id: 3, user: 'نظام', action: 'نسخ احتياطي', module: 'النظام', ip: '127.0.0.1', time: '10:00', status: 'success', details: 'نسخ احتياطي تلقائي' },
  { id: 4, user: 'مجهول', action: 'محاولة دخول', module: 'المصادقة', ip: '203.0.113.50', time: '09:45', status: 'failed', details: 'كلمة مرور خاطئة - 3 محاولات' },
  { id: 5, user: 'خالد السعيد', action: 'تصدير بيانات', module: 'التقارير', ip: '192.168.1.102', time: '09:30', status: 'success', details: 'تصدير تقرير الصيانة' },
  { id: 6, user: 'فاطمة أحمد', action: 'حذف سجل', module: 'الصيانة', ip: '192.168.1.103', time: '09:15', status: 'warning', details: 'حذف سجل صيانة قديم' },
];

// سلوك المستخدمين
const userBehavior = [
  { user: 'أحمد محمد', sessions: 45, avgTime: '2.5 ساعة', pages: 156, actions: 234, riskScore: 5 },
  { user: 'سارة علي', sessions: 38, avgTime: '3 ساعات', pages: 189, actions: 312, riskScore: 8 },
  { user: 'خالد السعيد', sessions: 52, avgTime: '1.5 ساعة', pages: 98, actions: 145, riskScore: 3 },
  { user: 'فاطمة أحمد', sessions: 41, avgTime: '2 ساعة', pages: 134, actions: 198, riskScore: 12 },
];

// قواعد الاحتفاظ بالبيانات
const retentionRules = [
  { id: 1, dataType: 'سجلات الدخول', retention: '90 يوم', status: 'active', lastCleanup: '2024-12-01', records: 15420 },
  { id: 2, dataType: 'تسجيلات الكاميرات', retention: '30 يوم', status: 'active', lastCleanup: '2024-12-03', records: 8500 },
  { id: 3, dataType: 'سجلات الصيانة', retention: '5 سنوات', status: 'active', lastCleanup: '2024-11-01', records: 45000 },
  { id: 4, dataType: 'بيانات المستخدمين', retention: 'دائم', status: 'active', lastCleanup: '-', records: 250 },
  { id: 5, dataType: 'التقارير المؤرشفة', retention: '2 سنة', status: 'active', lastCleanup: '2024-10-15', records: 1200 },
];

// بيانات الامتثال
const complianceData = [
  { month: 'يناير', compliance: 95, incidents: 2 },
  { month: 'فبراير', compliance: 97, incidents: 1 },
  { month: 'مارس', compliance: 94, incidents: 3 },
  { month: 'أبريل', compliance: 98, incidents: 1 },
  { month: 'مايو', compliance: 96, incidents: 2 },
  { month: 'يونيو', compliance: 99, incidents: 0 },
];

export default function ComplianceCenter() {
  const [activeTab, setActiveTab] = useState('audit');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterModule, setFilterModule] = useState('all');

  const stats = {
    totalLogs: auditLogs.length * 100,
    failedAttempts: 23,
    complianceScore: 97,
    dataRetained: '2.4 TB',
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.includes(searchQuery) || log.action.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchesModule = filterModule === 'all' || log.module === filterModule;
    return matchesSearch && matchesStatus && matchesModule;
  });

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-400" />
              مركز الامتثال والتدقيق
            </h1>
            <p className="text-slate-400 mt-1">مراقبة الأمان والامتثال للأنظمة السعودية</p>
          </div>
          <Button className="bg-red-600 hover:bg-red-700">
            <Download className="w-4 h-4 ml-2" />
            تصدير تقرير الامتثال
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'إجمالي السجلات', value: stats.totalLogs.toLocaleString(), icon: History, color: 'cyan' },
          { label: 'محاولات فاشلة', value: stats.failedAttempts, icon: AlertTriangle, color: 'red' },
          { label: 'درجة الامتثال', value: `${stats.complianceScore}%`, icon: CheckCircle, color: 'green' },
          { label: 'البيانات المحفوظة', value: stats.dataRetained, icon: Database, color: 'purple' },
        ].map((stat, i) => (
          <Card key={stat.label} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
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
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap">
          <TabsTrigger value="audit" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <History className="w-4 h-4 ml-1" />
            سجل التدقيق
          </TabsTrigger>
          <TabsTrigger value="behavior" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Users className="w-4 h-4 ml-1" />
            سلوك المستخدمين
          </TabsTrigger>
          <TabsTrigger value="cctv" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Camera className="w-4 h-4 ml-1" />
            امتثال الكاميرات
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
            <Lock className="w-4 h-4 ml-1" />
            الأمن السيبراني
          </TabsTrigger>
          <TabsTrigger value="retention" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Database className="w-4 h-4 ml-1" />
            الاحتفاظ بالبيانات
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <FileText className="w-4 h-4 ml-1" />
            التقارير الآلية
          </TabsTrigger>
          <TabsTrigger value="predictive" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
            <Brain className="w-4 h-4 ml-1" />
            التنبؤات
          </TabsTrigger>
          <TabsTrigger value="behavior" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Users className="w-4 h-4 ml-1" />
            تحليل السلوك
          </TabsTrigger>
          <TabsTrigger value="ai_reports" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Brain className="w-4 h-4 ml-1" />
            تقارير AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="بحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="success">ناجح</SelectItem>
                <SelectItem value="failed">فاشل</SelectItem>
                <SelectItem value="warning">تحذير</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="الموديول" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="المصادقة">المصادقة</SelectItem>
                <SelectItem value="إدارة المستخدمين">إدارة المستخدمين</SelectItem>
                <SelectItem value="النظام">النظام</SelectItem>
                <SelectItem value="التقارير">التقارير</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logs Table */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-right p-3 text-slate-400 text-sm">الوقت</th>
                      <th className="text-right p-3 text-slate-400 text-sm">المستخدم</th>
                      <th className="text-right p-3 text-slate-400 text-sm">الإجراء</th>
                      <th className="text-right p-3 text-slate-400 text-sm">الموديول</th>
                      <th className="text-right p-3 text-slate-400 text-sm">IP</th>
                      <th className="text-right p-3 text-slate-400 text-sm">الحالة</th>
                      <th className="text-right p-3 text-slate-400 text-sm">التفاصيل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                        <td className="p-3 text-slate-300 text-sm">{log.time}</td>
                        <td className="p-3 text-white text-sm">{log.user}</td>
                        <td className="p-3 text-slate-300 text-sm">{log.action}</td>
                        <td className="p-3 text-slate-300 text-sm">{log.module}</td>
                        <td className="p-3 text-slate-400 text-sm font-mono">{log.ip}</td>
                        <td className="p-3">
                          <Badge className={`${
                            log.status === 'success' ? 'bg-green-500/20 text-green-400' :
                            log.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {log.status === 'success' ? 'ناجح' : log.status === 'failed' ? 'فاشل' : 'تحذير'}
                          </Badge>
                        </td>
                        <td className="p-3 text-slate-400 text-sm">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {userBehavior.map(user => (
              <Card key={user.user} className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 ${user.riskScore > 10 ? 'border-red-500/50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold">{user.user}</h3>
                    <Badge className={user.riskScore > 10 ? 'bg-red-500/20 text-red-400' : user.riskScore > 5 ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}>
                      خطورة: {user.riskScore}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 bg-slate-800/50 rounded">
                      <p className="text-cyan-400 font-bold">{user.sessions}</p>
                      <p className="text-slate-500 text-xs">جلسات</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded">
                      <p className="text-green-400 font-bold">{user.avgTime}</p>
                      <p className="text-slate-500 text-xs">متوسط</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded">
                      <p className="text-purple-400 font-bold">{user.pages}</p>
                      <p className="text-slate-500 text-xs">صفحات</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded">
                      <p className="text-amber-400 font-bold">{user.actions}</p>
                      <p className="text-slate-500 text-xs">إجراءات</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">قواعد الاحتفاظ بالبيانات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {retentionRules.map(rule => (
                  <div key={rule.id} className="p-4 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{rule.dataType}</h4>
                      <Badge className="bg-green-500/20 text-green-400">{rule.status === 'active' ? 'نشط' : 'معطل'}</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">مدة الاحتفاظ</p>
                        <p className="text-white">{rule.retention}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">آخر تنظيف</p>
                        <p className="text-white">{rule.lastCleanup}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">السجلات</p>
                        <p className="text-cyan-400">{rule.records.toLocaleString()}</p>
                      </div>
                      <div className="text-left">
                        <Button size="sm" variant="outline" className="border-slate-600">
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cctv" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                  <Camera className="w-10 h-10 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">98%</p>
                  <p className="text-slate-400">امتثال CCTV</p>
                </div>
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-center">
                  <Eye className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">2,100</p>
                  <p className="text-slate-400">كاميرا نشطة</p>
                </div>
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                  <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">5</p>
                  <p className="text-slate-400">تحتاج مراجعة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">مستوى الامتثال الشهري</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={complianceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="compliance" stroke="#22d3ee" strokeWidth={2} name="الامتثال %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">تقييم الأمن السيبراني</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'حماية الشبكة', value: 95 },
                    { label: 'التشفير', value: 100 },
                    { label: 'إدارة الوصول', value: 88 },
                    { label: 'النسخ الاحتياطي', value: 92 },
                    { label: 'مراقبة التهديدات', value: 97 },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400 text-sm">{item.label}</span>
                        <span className={`text-sm ${item.value >= 90 ? 'text-green-400' : item.value >= 70 ? 'text-amber-400' : 'text-red-400'}`}>{item.value}%</span>
                      </div>
                      <Progress value={item.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <AutomatedComplianceReports />
        </TabsContent>

        <TabsContent value="predictive" className="mt-4">
          <AdvancedPredictiveAnalytics module="compliance" />
        </TabsContent>

        <TabsContent value="behavior" className="mt-4">
          <UserBehaviorRiskAnalysis />
        </TabsContent>

        <TabsContent value="ai_reports" className="mt-4">
          <AIComplianceReportGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}