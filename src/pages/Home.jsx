import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  LayoutDashboard, Sparkles, Settings, TrendingUp, TrendingDown, Users, Car,
  Building2, Shield, Camera, Brain, Activity, Bell, Eye, Zap, Target,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Clock, Calendar,
  Cpu, Heart, Package, Phone, AlertTriangle, CheckCircle, Plus, Map, Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import ProactiveAIAssistant from '@/components/ai/ProactiveAIAssistant';
import DepartmentDashboards from '@/components/dashboard/DepartmentDashboards';
import RealTimeDataVisualizer from '@/components/dashboard/RealTimeDataVisualizer';
import AIUserBehaviorAnalytics from '@/components/analytics/AIUserBehaviorAnalytics';
import AISentimentAnalyzer from '@/components/ai/AISentimentAnalyzer';
import AIReportSummarizer from '@/components/ai/AIReportSummarizer';
import AIIoTTrendPredictor from '@/components/ai/AIIoTTrendPredictor';
import AIProactiveAnomalyDetector from '@/components/ai/AIProactiveAnomalyDetector';

// ألوان اللوجو الموحدة - أكواد الألوان
const BRAND_COLORS = {
  primary: '#8B5CF6',      // بنفسجي فاتح
  secondary: '#06B6D4',    // سماوي
  accent: '#EC4899',       // وردي
  purple: { 500: '#8B5CF6', 600: '#7C3AED' },
  cyan: { 500: '#06B6D4', 600: '#0891B2' },
  pink: { 500: '#EC4899', 600: '#DB2777' },
};

// بيانات الرسوم البيانية
const performanceData = [
  { name: 'يناير', value: 4000, value2: 2400 },
  { name: 'فبراير', value: 3000, value2: 1398 },
  { name: 'مارس', value: 2000, value2: 9800 },
  { name: 'أبريل', value: 2780, value2: 3908 },
  { name: 'مايو', value: 1890, value2: 4800 },
  { name: 'يونيو', value: 2390, value2: 3800 },
];

const activityData = [
  { time: '00:00', users: 120, alerts: 5 },
  { time: '04:00', users: 80, alerts: 2 },
  { time: '08:00', users: 450, alerts: 12 },
  { time: '12:00', users: 680, alerts: 18 },
  { time: '16:00', users: 520, alerts: 8 },
  { time: '20:00', users: 340, alerts: 6 },
];

const moduleStats = [
  { name: 'الأسطول', value: 35, color: '#22c55e' },
  { name: 'الكاميرات', value: 25, color: '#22d3ee' },
  { name: 'النفايات', value: 20, color: '#f59e0b' },
  { name: 'الطاقة', value: 20, color: '#a855f7' },
];

const quickModules = [
  { name: 'المدينة الذكية', icon: Building2, color: 'cyan', page: 'SmartCity', value: '98%', label: 'صحة النظام' },
  { name: 'إدارة الأسطول', icon: Car, color: 'green', page: 'FleetAdvanced', value: '45', label: 'مركبة نشطة' },
  { name: 'AI Vision', icon: Eye, color: 'purple', page: 'AIVisionHub', value: '200+', label: 'نموذج AI' },
  { name: 'السلامة العامة', icon: Shield, color: 'red', page: 'SmartPublicSafety', value: '3', label: 'تنبيهات' },
  { name: 'مركز الاتصال', icon: Phone, color: 'blue', page: 'UnifiedCallCenter', value: '12', label: 'مكالمة نشطة' },
  { name: 'المستشفى الذكي', icon: Heart, color: 'pink', page: 'HospitalCommandCenter', value: '352', label: 'مريض' },
];

const recentAlerts = [
  { id: 1, type: 'warning', message: 'ازدحام مروري متوقع - المنطقة الشرقية', time: '5 دقائق', module: 'المرور' },
  { id: 2, type: 'critical', message: 'مركبة #12 تحتاج صيانة عاجلة', time: '10 دقائق', module: 'الأسطول' },
  { id: 3, type: 'info', message: 'تم تحديث نماذج AI بنجاح', time: '15 دقيقة', module: 'AI Vision' },
  { id: 4, type: 'success', message: 'اكتمال جولة جمع النفايات - المسار A', time: '20 دقيقة', module: 'النفايات' },
];

const topUsers = [
  { name: 'أحمد محمد', role: 'مدير العمليات', activity: 95, avatar: 'أ' },
  { name: 'سارة خالد', role: 'محلل بيانات', activity: 88, avatar: 'س' },
  { name: 'خالد العلي', role: 'فني ميداني', activity: 82, avatar: 'خ' },
];

export default function Home() {
  const [liveTime, setLiveTime] = useState(new Date());
  const [activeView, setActiveView] = useState('overview');
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Animated Background with Brand Colors */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full blur-3xl animate-pulse" style={{ background: `${BRAND_COLORS.primary}15` }} />
        <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: `${BRAND_COLORS.secondary}15`, animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl animate-pulse" style={{ background: `${BRAND_COLORS.accent}10`, animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <motion.div 
        className="relative z-10 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <motion.div 
                className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <LayoutDashboard className="w-7 h-7 text-cyan-400" />
              </motion.div>
              لوحة التحكم الرئيسية
            </h1>
            <p className="text-slate-400 mt-1">مرحباً بك في منصة الحكومة الذكية</p>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.secondary})`,
                boxShadow: `0 0 20px ${BRAND_COLORS.primary}40`
              }}
            >
              <Brain className="w-5 h-5" />
              <span className="font-medium">المساعد الذكي</span>
              <Lightbulb className="w-4 h-4 animate-pulse" />
            </motion.button>
            <div className="text-left">
              <p className="text-2xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(90deg, ${BRAND_COLORS.secondary}, ${BRAND_COLORS.primary})` }}>
                {liveTime.toLocaleTimeString('ar-SA')}
              </p>
              <p className="text-slate-500 text-sm">{liveTime.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm font-medium">مباشر</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Stats */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'إجمالي المستخدمين', value: '2,456', change: '+12%', up: true, icon: Users, color: 'cyan' },
          { label: 'الأجهزة النشطة', value: '1,234', change: '+8%', up: true, icon: Cpu, color: 'green' },
          { label: 'التنبيهات اليوم', value: '23', change: '-15%', up: false, icon: Bell, color: 'amber' },
          { label: 'كفاءة النظام', value: '98.5%', change: '+2%', up: true, icon: Activity, color: 'purple' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-card border-indigo-500/20 bg-gradient-to-br from-[#0f1629]/90 to-[#0f1629]/50 backdrop-blur-xl overflow-hidden group hover:border-cyan-500/30 transition-all">
              <CardContent className="p-4 relative">
                {/* Glow Effect */}
                <div className={`absolute top-0 right-0 w-20 h-20 bg-${stat.color}-500/10 rounded-full blur-2xl group-hover:bg-${stat.color}-500/20 transition-all`} />
                
                <div className="flex items-start justify-between relative">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</p>
                    <div className={`flex items-center gap-1 mt-1 ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      <span className="text-sm font-medium">{stat.change}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}-500/20 group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {showAIAssistant && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-10 mb-6"
          >
            <Card className="border-purple-500/30" style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.primary}10, ${BRAND_COLORS.secondary}05)` }}>
              <CardContent className="p-4">
                <ProactiveAIAssistant onClose={() => setShowAIAssistant(false)} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Tabs */}
      <div className="relative z-10 mb-6">
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500/20" style={{ '--tw-ring-color': BRAND_COLORS.primary }}>
              <LayoutDashboard className="w-4 h-4 ml-1" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="departments" className="data-[state=active]:bg-cyan-500/20">
              <Building2 className="w-4 h-4 ml-1" />
              الأقسام
            </TabsTrigger>
            <TabsTrigger value="realtime" className="data-[state=active]:bg-pink-500/20">
              <Map className="w-4 h-4 ml-1" />
              البيانات الحية
            </TabsTrigger>
            <TabsTrigger value="user-analytics" className="data-[state=active]:bg-purple-500/20">
              <Users className="w-4 h-4 ml-1" />
              تحليلات المستخدمين
            </TabsTrigger>
            <TabsTrigger value="ai-tools" className="data-[state=active]:bg-pink-500/20">
              <Brain className="w-4 h-4 ml-1" />
              أدوات AI
            </TabsTrigger>
            <TabsTrigger value="anomaly-detection" className="data-[state=active]:bg-red-500/20">
              <AlertTriangle className="w-4 h-4 ml-1" />
              كشف الشذوذات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="departments" className="mt-4">
            <DepartmentDashboards />
          </TabsContent>

          <TabsContent value="realtime" className="mt-4">
            <RealTimeDataVisualizer />
          </TabsContent>

          <TabsContent value="user-analytics" className="mt-4">
            <AIUserBehaviorAnalytics />
          </TabsContent>

          <TabsContent value="ai-tools" className="mt-4">
            <div className="grid lg:grid-cols-2 gap-6">
              <AISentimentAnalyzer />
              <AIReportSummarizer />
            </div>
            <div className="mt-6">
              <AIIoTTrendPredictor />
            </div>
          </TabsContent>

          <TabsContent value="anomaly-detection" className="mt-4">
            <AIProactiveAnomalyDetector />
          </TabsContent>

          <TabsContent value="overview" className="mt-4">
      {/* Quick Access Modules */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: BRAND_COLORS.accent }} />
            الوصول السريع
          </h2>
          <Link to={createPageUrl('CentralDashboard')}>
            <Button variant="ghost" size="sm" style={{ color: BRAND_COLORS.secondary }}>
              عرض الكل
              <ArrowUpRight className="w-4 h-4 mr-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickModules.map((module, i) => (
            <motion.div
              key={module.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Link to={createPageUrl(module.page)}>
                <Card className={`glass-card border-${module.color}-500/30 bg-gradient-to-br from-${module.color}-500/10 to-transparent cursor-pointer hover:border-${module.color}-500/50 transition-all group`}>
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-${module.color}-500/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <module.icon className={`w-6 h-6 text-${module.color}-400`} />
                    </div>
                    <p className="text-white font-medium text-sm">{module.name}</p>
                    <p className={`text-${module.color}-400 font-bold text-lg mt-1`}>{module.value}</p>
                    <p className="text-slate-500 text-xs">{module.label}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Charts Section */}
      <div className="relative z-10 grid lg:grid-cols-3 gap-6 mb-6">
        {/* Main Chart */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  نشاط النظام (24 ساعة)
                </CardTitle>
                <div className="flex gap-2">
                  {['المستخدمين', 'التنبيهات'].map((label, i) => (
                    <Badge key={label} className={`${i === 0 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400'}`}>
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="users" stroke="#22d3ee" fill="url(#colorUsers)" strokeWidth={2} />
                    <Area type="monotone" dataKey="alerts" stroke="#a855f7" fill="url(#colorAlerts)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-400" />
                توزيع النشاط
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={moduleStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {moduleStats.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {moduleStats.map(stat => (
                  <div key={stat.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }} />
                    <span className="text-slate-400 text-xs">{stat.name}</span>
                    <span className="text-white text-xs font-bold mr-auto">{stat.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 grid lg:grid-cols-3 gap-6">
        {/* Recent Alerts */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  آخر التنبيهات
                </CardTitle>
                <Link to={createPageUrl('Notifications')}>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white h-7">
                    عرض الكل
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentAlerts.map((alert, i) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + i * 0.1 }}
                    className={`p-3 rounded-lg flex items-center justify-between ${
                      alert.type === 'critical' ? 'bg-red-500/10 border border-red-500/30' :
                      alert.type === 'warning' ? 'bg-amber-500/10 border border-amber-500/30' :
                      alert.type === 'success' ? 'bg-green-500/10 border border-green-500/30' :
                      'bg-blue-500/10 border border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        alert.type === 'critical' ? 'bg-red-500/20' :
                        alert.type === 'warning' ? 'bg-amber-500/20' :
                        alert.type === 'success' ? 'bg-green-500/20' :
                        'bg-blue-500/20'
                      }`}>
                        {alert.type === 'critical' ? <AlertTriangle className="w-4 h-4 text-red-400" /> :
                         alert.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-400" /> :
                         alert.type === 'success' ? <CheckCircle className="w-4 h-4 text-green-400" /> :
                         <Bell className="w-4 h-4 text-blue-400" />}
                      </div>
                      <div>
                        <p className="text-white text-sm">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-slate-700 text-slate-300 text-xs">{alert.module}</Badge>
                          <span className="text-slate-500 text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />{alert.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-slate-400 h-7">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-green-400" />
                أكثر المستخدمين نشاطاً
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topUsers.map((user, i) => (
                  <motion.div
                    key={user.name}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + i * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg"
                  >
                    <Avatar className="h-10 w-10 bg-gradient-to-br from-cyan-500 to-purple-500">
                      <AvatarFallback className="bg-transparent text-white font-bold">{user.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{user.name}</p>
                      <p className="text-slate-500 text-xs">{user.role}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-green-400 font-bold">{user.activity}%</p>
                      <Progress value={user.activity} className="h-1 w-12" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}