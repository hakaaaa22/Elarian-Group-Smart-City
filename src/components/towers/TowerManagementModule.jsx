import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Radio, AlertTriangle, Activity, Zap, Wind, ThermometerSun, Gauge, 
  CheckCircle, XCircle, Clock, Calendar, Camera, FileText, Upload,
  TrendingUp, TrendingDown, Eye, Settings, RefreshCw, MapPin, Signal,
  Battery, Wifi, AlertCircle, Wrench, BarChart3, LineChart as LineChartIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import TowerComparison from './TowerComparison';
import TowerMaintenanceLog from './TowerMaintenanceLog';
import TowerAlertConfig from './TowerAlertConfig';

// بيانات الأبراج
const towersData = [
  {
    id: 'TWR-001',
    name: 'برج الاتصالات المركزي',
    type: 'communication',
    location: { lat: 24.7136, lng: 46.6753, zone: 'المنطقة المركزية' },
    height: 120,
    status: 'operational',
    sensors: { wind_speed: 15, structural_integrity: 98, vibration: 0.02, temperature: 32, tilt_angle: 0.1 },
    performance: { signal_strength: 95, uptime: 99.8, energy_consumption: 450, connected_devices: 12500 },
    maintenance: { last_inspection: '2024-11-15', next_inspection: '2025-02-15', score: 94 },
    alerts: []
  },
  {
    id: 'TWR-002',
    name: 'برج المنطقة الشرقية',
    type: 'communication',
    location: { lat: 24.7200, lng: 46.6900, zone: 'المنطقة الشرقية' },
    height: 85,
    status: 'warning',
    sensors: { wind_speed: 28, structural_integrity: 87, vibration: 0.08, temperature: 38, tilt_angle: 0.4 },
    performance: { signal_strength: 82, uptime: 97.2, energy_consumption: 380, connected_devices: 8900 },
    maintenance: { last_inspection: '2024-10-20', next_inspection: '2025-01-20', score: 78 },
    alerts: [{ type: 'wind', severity: 'medium', message: 'سرعة رياح عالية' }]
  },
  {
    id: 'TWR-003',
    name: 'برج المراقبة الجنوبي',
    type: 'surveillance',
    location: { lat: 24.7000, lng: 46.6600, zone: 'المنطقة الجنوبية' },
    height: 65,
    status: 'critical',
    sensors: { wind_speed: 12, structural_integrity: 72, vibration: 0.15, temperature: 35, tilt_angle: 0.8 },
    performance: { signal_strength: 68, uptime: 92.5, energy_consumption: 290, connected_devices: 45 },
    maintenance: { last_inspection: '2024-09-01', next_inspection: '2024-12-01', score: 62 },
    alerts: [
      { type: 'structural', severity: 'high', message: 'تدهور هيكلي محتمل' },
      { type: 'tilt', severity: 'medium', message: 'زاوية ميل غير طبيعية' }
    ]
  },
  {
    id: 'TWR-004',
    name: 'برج البث الإذاعي',
    type: 'broadcast',
    location: { lat: 24.7300, lng: 46.6800, zone: 'المنطقة الشمالية' },
    height: 150,
    status: 'operational',
    sensors: { wind_speed: 18, structural_integrity: 96, vibration: 0.03, temperature: 30, tilt_angle: 0.05 },
    performance: { signal_strength: 98, uptime: 99.9, energy_consumption: 680, connected_devices: 0 },
    maintenance: { last_inspection: '2024-11-01', next_inspection: '2025-02-01', score: 92 },
    alerts: []
  }
];

// بيانات الأداء التاريخية
const performanceHistory = [
  { time: '00:00', signal: 94, uptime: 99.5, energy: 420 },
  { time: '04:00', signal: 95, uptime: 99.7, energy: 380 },
  { time: '08:00', signal: 92, uptime: 99.3, energy: 450 },
  { time: '12:00', signal: 88, uptime: 98.8, energy: 520 },
  { time: '16:00', signal: 91, uptime: 99.1, energy: 480 },
  { time: '20:00', signal: 93, uptime: 99.4, energy: 440 },
];

// التنبؤات
const predictions = [
  { tower: 'TWR-002', issue: 'تآكل الهيكل', probability: 78, daysToFailure: 45, recommendation: 'فحص هيكلي عاجل' },
  { tower: 'TWR-003', issue: 'عطل في نظام التبريد', probability: 85, daysToFailure: 12, recommendation: 'استبدال وحدة التبريد' },
  { tower: 'TWR-001', issue: 'تدهور الكابلات', probability: 45, daysToFailure: 90, recommendation: 'فحص الكابلات الدوري' },
];

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7'];

export default function TowerManagementModule() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTower, setSelectedTower] = useState(null);
  const [showInspectionDialog, setShowInspectionDialog] = useState(false);
  const [showAIAnalysisDialog, setShowAIAnalysisDialog] = useState(false);
  const [inspectionImages, setInspectionImages] = useState([]);
  const [aiAnalysisResult, setAIAnalysisResult] = useState(null);

  // AI Analysis Mutation
  const aiAnalysisMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير في تحليل صور فحص الأبراج. قم بتحليل الوصف التالي للصور وتقديم تقرير مفصل:
        
برج: ${data.towerName}
نوع الفحص: ${data.inspectionType}
الملاحظات: ${data.notes}

قدم تحليلاً شاملاً يتضمن:
1. المشاكل الهيكلية المحتملة
2. علامات التآكل أو الصدأ
3. حالة المعدات
4. توصيات الصيانة
5. مستوى الخطورة (1-10)
6. الإجراءات المطلوبة`,
        response_json_schema: {
          type: 'object',
          properties: {
            structural_issues: { type: 'array', items: { type: 'string' } },
            corrosion_level: { type: 'string' },
            equipment_status: { type: 'string' },
            recommendations: { type: 'array', items: { type: 'string' } },
            risk_level: { type: 'number' },
            required_actions: { type: 'array', items: { type: 'string' } },
            estimated_cost: { type: 'string' },
            priority: { type: 'string' }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAIAnalysisResult(data);
      toast.success('تم تحليل الفحص بنجاح');
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'green';
      case 'warning': return 'amber';
      case 'critical': return 'red';
      case 'maintenance': return 'blue';
      default: return 'slate';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'operational': return 'تشغيلي';
      case 'warning': return 'تحذير';
      case 'critical': return 'حرج';
      case 'maintenance': return 'صيانة';
      default: return status;
    }
  };

  const stats = {
    total: towersData.length,
    operational: towersData.filter(t => t.status === 'operational').length,
    warning: towersData.filter(t => t.status === 'warning').length,
    critical: towersData.filter(t => t.status === 'critical').length,
    avgUptime: (towersData.reduce((s, t) => s + t.performance.uptime, 0) / towersData.length).toFixed(1),
    totalDevices: towersData.reduce((s, t) => s + t.performance.connected_devices, 0)
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Radio className="w-7 h-7 text-cyan-400" />
            إدارة الأبراج
          </h2>
          <p className="text-slate-400">مراقبة وصيانة الأبراج بالذكاء الاصطناعي</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-cyan-500/50 text-cyan-400">
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowInspectionDialog(true)}>
            <Calendar className="w-4 h-4 ml-2" />
            جدولة فحص
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: 'إجمالي الأبراج', value: stats.total, icon: Radio, color: 'cyan' },
          { label: 'تشغيلي', value: stats.operational, icon: CheckCircle, color: 'green' },
          { label: 'تحذير', value: stats.warning, icon: AlertTriangle, color: 'amber' },
          { label: 'حرج', value: stats.critical, icon: XCircle, color: 'red' },
          { label: 'متوسط التشغيل', value: `${stats.avgUptime}%`, icon: Activity, color: 'purple' },
          { label: 'الأجهزة المتصلة', value: stats.totalDevices.toLocaleString(), icon: Wifi, color: 'blue' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-6 h-6 text-${stat.color}-400 mx-auto mb-2`} />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Critical Alerts */}
      {stats.critical > 0 && (
        <Card className="glass-card border-red-500/30 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
              <div>
                <p className="text-red-300 font-medium">{stats.critical} برج يحتاج اهتمام فوري</p>
                <p className="text-red-400/70 text-sm">تم اكتشاف مشاكل هيكلية أو تشغيلية حرجة</p>
              </div>
              <Button size="sm" className="mr-auto bg-red-600 hover:bg-red-700">عرض التفاصيل</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 flex-wrap">
          <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20">
            <Radio className="w-4 h-4 ml-1" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-green-500/20">
            <BarChart3 className="w-4 h-4 ml-1" />
            الأداء
          </TabsTrigger>
          <TabsTrigger value="comparison" className="data-[state=active]:bg-blue-500/20">
            <LineChartIcon className="w-4 h-4 ml-1" />
            مقارنة الأبراج
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="data-[state=active]:bg-pink-500/20">
            <Wrench className="w-4 h-4 ml-1" />
            سجلات الصيانة
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-red-500/20">
            <AlertCircle className="w-4 h-4 ml-1" />
            تنبيهات مخصصة
          </TabsTrigger>
          <TabsTrigger value="predictive" className="data-[state=active]:bg-purple-500/20">
            <TrendingUp className="w-4 h-4 ml-1" />
            الصيانة التنبؤية
          </TabsTrigger>
          <TabsTrigger value="inspections" className="data-[state=active]:bg-amber-500/20">
            <FileText className="w-4 h-4 ml-1" />
            الفحوصات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {towersData.map(tower => (
              <Card key={tower.id} className={`glass-card border-${getStatusColor(tower.status)}-500/30 bg-${getStatusColor(tower.status)}-500/5 cursor-pointer hover:scale-[1.02] transition-transform`}
                    onClick={() => setSelectedTower(tower)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Radio className={`w-4 h-4 text-${getStatusColor(tower.status)}-400`} />
                      {tower.name}
                    </CardTitle>
                    <Badge className={`bg-${getStatusColor(tower.status)}-500/20 text-${getStatusColor(tower.status)}-400`}>
                      {getStatusText(tower.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Signal className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-400">الإشارة:</span>
                      <span className="text-white font-medium">{tower.performance.signal_strength}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-400">الرياح:</span>
                      <span className="text-white font-medium">{tower.sensors.wind_speed} كم/س</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-400" />
                      <span className="text-slate-400">التشغيل:</span>
                      <span className="text-white font-medium">{tower.performance.uptime}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-purple-400" />
                      <span className="text-slate-400">الهيكل:</span>
                      <span className="text-white font-medium">{tower.sensors.structural_integrity}%</span>
                    </div>
                  </div>
                  {tower.alerts.length > 0 && (
                    <div className="mt-3 p-2 bg-red-500/10 rounded-lg">
                      <p className="text-red-400 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {tower.alerts.length} تنبيهات نشطة
                      </p>
                    </div>
                  )}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>صحة الصيانة</span>
                      <span>{tower.maintenance.score}%</span>
                    </div>
                    <Progress value={tower.maintenance.score} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-4 space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Signal className="w-4 h-4 text-cyan-400" />
                  قوة الإشارة والتشغيل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="signal" stroke="#22d3ee" strokeWidth={2} name="قوة الإشارة" />
                      <Line type="monotone" dataKey="uptime" stroke="#22c55e" strokeWidth={2} name="وقت التشغيل" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  استهلاك الطاقة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="energy" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} name="kWh" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tower Performance Comparison */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">مقارنة أداء الأبراج</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={towersData.map(t => ({
                    name: t.name.substring(0, 15),
                    signal: t.performance.signal_strength,
                    uptime: t.performance.uptime,
                    health: t.sensors.structural_integrity
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Bar dataKey="signal" fill="#22d3ee" name="الإشارة" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="uptime" fill="#22c55e" name="التشغيل" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="health" fill="#a855f7" name="الصحة الهيكلية" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-4">
          <TowerComparison />
        </TabsContent>

        <TabsContent value="maintenance" className="mt-4">
          <TowerMaintenanceLog />
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <TowerAlertConfig />
        </TabsContent>

        <TabsContent value="predictive" className="mt-4 space-y-4">
          <Card className="glass-card border-purple-500/30 bg-purple-500/5">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                تنبيهات الصيانة التنبؤية AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions.map((pred, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${pred.probability >= 80 ? 'bg-red-500/10 border-red-500/30' : pred.probability >= 60 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-medium">{pred.issue}</p>
                        <p className="text-slate-400 text-sm">البرج: {pred.tower}</p>
                        <p className="text-slate-400 text-sm mt-1">{pred.recommendation}</p>
                      </div>
                      <div className="text-left">
                        <Badge className={pred.probability >= 80 ? 'bg-red-500/20 text-red-400' : pred.probability >= 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}>
                          {pred.probability}% احتمالية
                        </Badge>
                        <p className="text-slate-400 text-xs mt-2">
                          <Clock className="w-3 h-3 inline ml-1" />
                          {pred.daysToFailure} يوم للعطل المتوقع
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Wrench className="w-3 h-3 ml-1" />
                        جدولة صيانة
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-600">
                        <Eye className="w-3 h-3 ml-1" />
                        تفاصيل
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspections" className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  الفحوصات القادمة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {towersData.map(tower => (
                    <div key={tower.id} className="p-3 bg-slate-800/50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm">{tower.name}</p>
                        <p className="text-slate-400 text-xs">آخر فحص: {tower.maintenance.last_inspection}</p>
                      </div>
                      <div className="text-left">
                        <Badge className="bg-amber-500/20 text-amber-400">
                          {tower.maintenance.next_inspection}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  تحليل الفحص بـ AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">ارفع صور/فيديو الفحص للتحليل الذكي</p>
                  <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowAIAnalysisDialog(true)}>
                    <Camera className="w-4 h-4 ml-2" />
                    بدء التحليل
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Tower Details Dialog */}
      <Dialog open={!!selectedTower} onOpenChange={() => setSelectedTower(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-cyan-400" />
              {selectedTower?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedTower && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">حالة البرج</p>
                  <Badge className={`bg-${getStatusColor(selectedTower.status)}-500/20 text-${getStatusColor(selectedTower.status)}-400`}>
                    {getStatusText(selectedTower.status)}
                  </Badge>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">الارتفاع</p>
                  <p className="text-white font-bold">{selectedTower.height} متر</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-cyan-500/10 rounded-lg text-center">
                  <Signal className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{selectedTower.performance.signal_strength}%</p>
                  <p className="text-xs text-slate-400">قوة الإشارة</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg text-center">
                  <Activity className="w-5 h-5 text-green-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{selectedTower.performance.uptime}%</p>
                  <p className="text-xs text-slate-400">وقت التشغيل</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg text-center">
                  <Zap className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{selectedTower.performance.energy_consumption}</p>
                  <p className="text-xs text-slate-400">kWh</p>
                </div>
              </div>

              <div className="p-4 bg-slate-800/30 rounded-lg">
                <p className="text-white font-medium mb-3">بيانات المستشعرات</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">سرعة الرياح:</span>
                    <span className="text-white">{selectedTower.sensors.wind_speed} كم/س</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الاهتزاز:</span>
                    <span className="text-white">{selectedTower.sensors.vibration} mm/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">درجة الحرارة:</span>
                    <span className="text-white">{selectedTower.sensors.temperature}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">زاوية الميل:</span>
                    <span className="text-white">{selectedTower.sensors.tilt_angle}°</span>
                  </div>
                </div>
              </div>

              {selectedTower.alerts.length > 0 && (
                <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                  <p className="text-red-400 font-medium mb-2">التنبيهات النشطة</p>
                  {selectedTower.alerts.map((alert, i) => (
                    <p key={i} className="text-red-300 text-sm">• {alert.message}</p>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                  <Wrench className="w-4 h-4 ml-2" />
                  جدولة صيانة
                </Button>
                <Button variant="outline" className="border-slate-600">
                  <FileText className="w-4 h-4 ml-2" />
                  تقرير مفصل
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Analysis Dialog */}
      <Dialog open={showAIAnalysisDialog} onOpenChange={setShowAIAnalysisDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-cyan-400" />
              تحليل فحص البرج بـ AI
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-slate-400 text-sm">اختر البرج</label>
              <Select>
                <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
                  <SelectValue placeholder="اختر البرج" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {towersData.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-slate-400 text-sm">نوع الفحص</label>
              <Select>
                <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
                  <SelectValue placeholder="نوع الفحص" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="routine">فحص روتيني</SelectItem>
                  <SelectItem value="structural">فحص هيكلي</SelectItem>
                  <SelectItem value="electrical">فحص كهربائي</SelectItem>
                  <SelectItem value="comprehensive">فحص شامل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-slate-400 text-sm">ملاحظات الفحص</label>
              <Textarea className="bg-slate-800 border-slate-700 mt-1" placeholder="أدخل ملاحظاتك..." rows={4} />
            </div>
            <Button 
              className="w-full bg-cyan-600 hover:bg-cyan-700"
              onClick={() => {
                aiAnalysisMutation.mutate({
                  towerName: 'برج الاتصالات المركزي',
                  inspectionType: 'شامل',
                  notes: 'فحص دوري'
                });
              }}
              disabled={aiAnalysisMutation.isPending}
            >
              {aiAnalysisMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                  جاري التحليل...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 ml-2" />
                  بدء التحليل بـ AI
                </>
              )}
            </Button>

            {aiAnalysisResult && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 font-medium mb-2">نتائج التحليل</p>
                <div className="text-sm space-y-2">
                  <p className="text-white">مستوى الخطورة: <Badge className={aiAnalysisResult.risk_level > 7 ? 'bg-red-500/20 text-red-400' : aiAnalysisResult.risk_level > 4 ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}>{aiAnalysisResult.risk_level}/10</Badge></p>
                  <p className="text-white">الأولوية: <span className="text-cyan-400">{aiAnalysisResult.priority}</span></p>
                  <p className="text-slate-400 mt-2">التوصيات:</p>
                  <ul className="list-disc list-inside text-slate-300">
                    {aiAnalysisResult.recommendations?.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Inspection Scheduling Dialog */}
      <Dialog open={showInspectionDialog} onOpenChange={setShowInspectionDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              جدولة فحص جديد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-slate-400 text-sm">البرج</label>
              <Select>
                <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
                  <SelectValue placeholder="اختر البرج" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {towersData.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-slate-400 text-sm">نوع الفحص</label>
              <Select>
                <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
                  <SelectValue placeholder="نوع الفحص" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="routine">فحص روتيني</SelectItem>
                  <SelectItem value="structural">فحص هيكلي</SelectItem>
                  <SelectItem value="electrical">فحص كهربائي</SelectItem>
                  <SelectItem value="comprehensive">فحص شامل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-slate-400 text-sm">تاريخ الفحص</label>
              <Input type="date" className="bg-slate-800 border-slate-700 mt-1" />
            </div>
            <div>
              <label className="text-slate-400 text-sm">المفتش</label>
              <Input className="bg-slate-800 border-slate-700 mt-1" placeholder="اسم المفتش" />
            </div>
            <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => {
              toast.success('تم جدولة الفحص بنجاح');
              setShowInspectionDialog(false);
            }}>
              <Calendar className="w-4 h-4 ml-2" />
              جدولة الفحص
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}