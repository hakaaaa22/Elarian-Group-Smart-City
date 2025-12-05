import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Building2, Car, Headphones, Shield, TrendingUp, AlertTriangle,
  Users, Phone, Zap, Thermometer, Trash2, Activity, ChevronLeft, Settings,
  Eye, RefreshCw, GripVertical, X, Plus, BarChart3, Clock, CheckCircle, Brain, Lightbulb, Bell, MousePointer,
  Target, Wand2, Grid3X3, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import AIInsightsHub from '@/components/dashboard/AIInsightsHub';
import AdvancedNotificationCenter from '@/components/notifications/AdvancedNotificationCenter';
import UserBehaviorAnalytics from '@/components/ai/UserBehaviorAnalytics';
import AdvancedTaskManager from '@/components/tasks/AdvancedTaskManager';
import AIReportGenerator from '@/components/reports/AIReportGenerator';
import InteractiveDashboardDesigner from '@/components/dashboard/InteractiveDashboardDesigner';
import SmartRecommendations from '@/components/user/SmartRecommendations';

const moduleWidgets = {
  smartcity: {
    name: 'المدينة الذكية',
    icon: Building2,
    color: 'cyan',
    page: 'SmartCity',
    metrics: [
      { label: 'جودة الهواء', value: 'جيدة', trend: '+5%', status: 'good' },
      { label: 'استهلاك الطاقة', value: '2.4 MW', trend: '-8%', status: 'good' },
      { label: 'حركة المرور', value: 'متوسطة', trend: '+12%', status: 'warning' },
      { label: 'تنبيهات نشطة', value: '3', trend: '0', status: 'alert' },
    ]
  },
  fleet: {
    name: 'إدارة الأسطول',
    icon: Car,
    color: 'green',
    page: 'FleetAdvanced',
    metrics: [
      { label: 'المركبات النشطة', value: '45/52', trend: '+2', status: 'good' },
      { label: 'كفاءة الوقود', value: '8.5 كم/ل', trend: '+3%', status: 'good' },
      { label: 'صيانة متوقعة', value: '3', trend: '+1', status: 'warning' },
      { label: 'تقييم السائقين', value: '82%', trend: '+1%', status: 'good' },
    ]
  },
  callcenter: {
    name: 'مركز الاتصال',
    icon: Headphones,
    color: 'purple',
    page: 'UnifiedCallCenter',
    metrics: [
      { label: 'المكالمات النشطة', value: '12', trend: '+5', status: 'good' },
      { label: 'SLA', value: '94%', trend: '+2%', status: 'good' },
      { label: 'انتظار', value: '8', trend: '-3', status: 'warning' },
      { label: 'CSAT', value: '4.7/5', trend: '+0.1', status: 'good' },
    ]
  },
  compliance: {
    name: 'مركز الامتثال',
    icon: Shield,
    color: 'amber',
    page: 'ComplianceCenter',
    metrics: [
      { label: 'نسبة الامتثال', value: '96%', trend: '+1%', status: 'good' },
      { label: 'مخاطر محتملة', value: '2', trend: '-1', status: 'warning' },
      { label: 'تقارير معلقة', value: '5', trend: '+2', status: 'alert' },
      { label: 'تدقيقات مكتملة', value: '124', trend: '+8', status: 'good' },
    ]
  }
};

const trendData = [
  { time: '08:00', smartcity: 85, fleet: 78, callcenter: 92, compliance: 95 },
  { time: '10:00', smartcity: 88, fleet: 82, callcenter: 88, compliance: 94 },
  { time: '12:00', smartcity: 82, fleet: 85, callcenter: 95, compliance: 96 },
  { time: '14:00', smartcity: 90, fleet: 80, callcenter: 90, compliance: 97 },
  { time: '16:00', smartcity: 87, fleet: 88, callcenter: 93, compliance: 95 },
];

const criticalAlerts = [
  { id: 1, module: 'smartcity', message: 'ارتفاع مستوى التلوث في المنطقة الصناعية', severity: 'high', time: '10:30' },
  { id: 2, module: 'fleet', message: 'مركبة #12 تحتاج صيانة عاجلة', severity: 'critical', time: '10:25' },
  { id: 3, module: 'callcenter', message: '5 مكالمات تجاوزت SLA', severity: 'medium', time: '10:20' },
  { id: 4, module: 'compliance', message: 'انحراف سلوكي محتمل - مستخدم #45', severity: 'high', time: '10:15' },
];

export default function CentralDashboard() {
  const [activeModules, setActiveModules] = useState(['smartcity', 'fleet', 'callcenter', 'compliance']);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const toggleModule = (id) => {
    if (activeModules.includes(id)) {
      setActiveModules(prev => prev.filter(m => m !== id));
    } else {
      setActiveModules(prev => [...prev, id]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-400';
      case 'warning': return 'text-amber-400';
      case 'alert': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-cyan-400" />
              لوحة التحكم المركزية
            </h1>
            <p className="text-slate-400 mt-1">نظرة شاملة على جميع الأنظمة</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="border-slate-600" onClick={() => setEditMode(!editMode)}>
              <Settings className="w-4 h-4 ml-1" />
              {editMode ? 'حفظ' : 'تخصيص'}
            </Button>
            <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-400">
              <RefreshCw className="w-4 h-4 ml-1" />
              تحديث
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20">
            <LayoutDashboard className="w-4 h-4 ml-1" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="data-[state=active]:bg-purple-500/20">
            <Lightbulb className="w-4 h-4 ml-1" />
            رؤى AI
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-amber-500/20">
            <Bell className="w-4 h-4 ml-1" />
            الإشعارات
          </TabsTrigger>
          <TabsTrigger value="user-behavior" className="data-[state=active]:bg-pink-500/20">
            <MousePointer className="w-4 h-4 ml-1" />
            سلوك المستخدمين
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-green-500/20">
            <Target className="w-4 h-4 ml-1" />
            المهام
          </TabsTrigger>
          <TabsTrigger value="ai-reports" className="data-[state=active]:bg-cyan-500/20">
            <Wand2 className="w-4 h-4 ml-1" />
            تقارير AI
          </TabsTrigger>
          <TabsTrigger value="designer" className="data-[state=active]:bg-indigo-500/20">
            <Grid3X3 className="w-4 h-4 ml-1" />
            مصمم اللوحات
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-amber-500/20">
            <Sparkles className="w-4 h-4 ml-1" />
            توصيات ذكية
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-insights" className="mt-4">
          <AIInsightsHub />
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <AdvancedNotificationCenter />
        </TabsContent>

        <TabsContent value="user-behavior" className="mt-4">
          <UserBehaviorAnalytics />
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <AdvancedTaskManager />
        </TabsContent>

        <TabsContent value="ai-reports" className="mt-4">
          <AIReportGenerator />
        </TabsContent>

        <TabsContent value="designer" className="mt-4">
          <InteractiveDashboardDesigner />
        </TabsContent>

        <TabsContent value="recommendations" className="mt-4">
          <SmartRecommendations />
        </TabsContent>

        <TabsContent value="overview" className="mt-4">

      {/* Module Selector */}
      {editMode && (
        <Card className="glass-card border-purple-500/30 bg-purple-500/5 mb-6">
          <CardContent className="p-4">
            <p className="text-purple-400 text-sm mb-3">اختر الوحدات لعرضها:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(moduleWidgets).map(([id, module]) => (
                <Badge
                  key={id}
                  className={`cursor-pointer ${activeModules.includes(id) ? `bg-${module.color}-500/20 text-${module.color}-400` : 'bg-slate-700 text-slate-400'}`}
                  onClick={() => toggleModule(id)}
                >
                  {activeModules.includes(id) && <X className="w-3 h-3 ml-1" />}
                  {module.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">98.5%</p>
            <p className="text-slate-400 text-sm">صحة النظام</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{criticalAlerts.length}</p>
            <p className="text-slate-400 text-sm">تنبيهات نشطة</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">24</p>
            <p className="text-slate-400 text-sm">مستخدمون نشطون</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <Activity className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">1,245</p>
            <p className="text-slate-400 text-sm">عمليات اليوم</p>
          </CardContent>
        </Card>
      </div>

      {/* Module Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {Object.entries(moduleWidgets)
          .filter(([id]) => activeModules.includes(id))
          .map(([id, module]) => {
            const Icon = module.icon;
            return (
              <motion.div key={id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className={`glass-card border-${module.color}-500/30 bg-${module.color}-500/5`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Icon className={`w-5 h-5 text-${module.color}-400`} />
                        {module.name}
                      </CardTitle>
                      <Link to={createPageUrl(module.page)}>
                        <Button size="sm" variant="ghost" className={`text-${module.color}-400 h-7`}>
                          <Eye className="w-3 h-3 ml-1" />
                          عرض التفاصيل
                          <ChevronLeft className="w-3 h-3 mr-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {module.metrics.map((metric, i) => (
                        <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-400 text-xs mb-1">{metric.label}</p>
                          <div className="flex items-center justify-between">
                            <p className={`text-lg font-bold ${getStatusColor(metric.status)}`}>{metric.value}</p>
                            <Badge className={metric.trend.startsWith('+') ? 'bg-green-500/20 text-green-400' : metric.trend.startsWith('-') ? 'bg-red-500/20 text-red-400' : 'bg-slate-600 text-slate-400'}>
                              {metric.trend}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
      </div>

      {/* Performance Trend & Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              أداء الأنظمة (اليوم)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="smartcity" stroke="#22d3ee" strokeWidth={2} name="المدينة الذكية" />
                  <Line type="monotone" dataKey="fleet" stroke="#22c55e" strokeWidth={2} name="الأسطول" />
                  <Line type="monotone" dataKey="callcenter" stroke="#a855f7" strokeWidth={2} name="مركز الاتصال" />
                  <Line type="monotone" dataKey="compliance" stroke="#f59e0b" strokeWidth={2} name="الامتثال" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Critical Alerts */}
        <Card className="glass-card border-red-500/30 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              التنبيهات الحرجة
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {criticalAlerts.map(alert => {
                const module = moduleWidgets[alert.module];
                const Icon = module?.icon || AlertTriangle;
                return (
                  <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                    <div className="flex items-start gap-3">
                      <Icon className="w-4 h-4 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-white text-sm">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-slate-700 text-slate-300 text-xs">{module?.name}</Badge>
                          <span className="text-slate-500 text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />{alert.time}
                          </span>
                        </div>
                      </div>
                      <Link to={createPageUrl(module?.page || 'Home')}>
                        <Button size="sm" variant="ghost" className="h-6 px-2">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}