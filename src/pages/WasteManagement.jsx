import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Trash2, Truck, MapPin, AlertTriangle, CheckCircle, Clock, TrendingUp,
  BarChart3, Calendar, Route, Recycle, Leaf, Package, Weight, Gauge,
  Navigation, RefreshCw, Bell, Settings, Play, Pause, Eye, Filter,
  ThermometerSun, Droplets, Wind, Battery, Wifi, Signal, Mountain, Users,
  Layers, Factory, Building2, Wrench, Target, Lightbulb
} from 'lucide-react';
import SmartMunicipalityModule from '@/components/municipality/SmartMunicipalityModule';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'sonner';
import WasteTypesManager from '@/components/waste/WasteTypesManager';
import SmartBinsMonitor from '@/components/waste/SmartBinsMonitor';
import LandfillMonitor from '@/components/waste/LandfillMonitor';
import FleetWasteTracking from '@/components/waste/FleetWasteTracking';
import CitizenWasteApp from '@/components/waste/CitizenWasteApp';
import FleetPredictiveMaintenance from '@/components/waste/FleetPredictiveMaintenance';
import AIWasteRecognition from '@/components/waste/AIWasteRecognition';
import AIRouteOptimizer from '@/components/waste/AIRouteOptimizer';
import SegregationQualityMonitor from '@/components/waste/SegregationQualityMonitor';
import LandfillManagement from '@/components/waste/LandfillManagement';
import WastePredictiveAnalysis from '@/components/waste/WastePredictiveAnalysis';
import DriverAIAssistant from '@/components/driver/DriverAIAssistant';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#a855f7', '#ef4444'];

// أنواع النفايات
const wasteTypes = [
  { id: 'general', name: 'نفايات عامة', icon: Trash2, color: 'slate' },
  { id: 'recyclable', name: 'قابلة للتدوير', icon: Recycle, color: 'green' },
  { id: 'organic', name: 'عضوية', icon: Leaf, color: 'amber' },
  { id: 'hazardous', name: 'خطرة', icon: AlertTriangle, color: 'red' },
  { id: 'electronic', name: 'إلكترونية', icon: Battery, color: 'purple' },
];

// حاويات النفايات الذكية
const smartBins = [
  { 
    id: 1, 
    location: 'شارع الملك فهد - تقاطع 1', 
    type: 'general',
    fillLevel: 85, 
    temperature: 32,
    battery: 78,
    signal: 'good',
    lastCollection: '2024-12-03 08:30',
    status: 'needs_collection',
    lat: 24.7136,
    lng: 46.6753
  },
  { 
    id: 2, 
    location: 'حي الورود - مجمع A', 
    type: 'recyclable',
    fillLevel: 45, 
    temperature: 28,
    battery: 92,
    signal: 'excellent',
    lastCollection: '2024-12-03 14:00',
    status: 'normal',
    lat: 24.7200,
    lng: 46.6800
  },
  { 
    id: 3, 
    location: 'المنطقة الصناعية - بوابة 3', 
    type: 'hazardous',
    fillLevel: 62, 
    temperature: 35,
    battery: 65,
    signal: 'good',
    lastCollection: '2024-12-02 16:00',
    status: 'normal',
    lat: 24.7050,
    lng: 46.6900
  },
  { 
    id: 4, 
    location: 'المنتزه المركزي', 
    type: 'organic',
    fillLevel: 92, 
    temperature: 38,
    battery: 45,
    signal: 'weak',
    lastCollection: '2024-12-03 06:00',
    status: 'alert',
    lat: 24.7180,
    lng: 46.6650
  },
  { 
    id: 5, 
    location: 'مركز التسوق الرئيسي', 
    type: 'general',
    fillLevel: 78, 
    temperature: 30,
    battery: 88,
    signal: 'excellent',
    lastCollection: '2024-12-03 10:00',
    status: 'needs_collection',
    lat: 24.7100,
    lng: 46.6700
  },
  { 
    id: 6, 
    location: 'الحي السكني الشمالي', 
    type: 'recyclable',
    fillLevel: 30, 
    temperature: 26,
    battery: 95,
    signal: 'excellent',
    lastCollection: '2024-12-03 12:00',
    status: 'normal',
    lat: 24.7250,
    lng: 46.6850
  },
];

// شاحنات الجمع
const collectionTrucks = [
  { id: 1, plate: 'أ ب ج 1234', driver: 'محمد أحمد', status: 'collecting', route: 'المسار A', progress: 65, bins: 12, capacity: 85 },
  { id: 2, plate: 'د هـ و 5678', driver: 'خالد سعيد', status: 'en_route', route: 'المسار B', progress: 30, bins: 5, capacity: 45 },
  { id: 3, plate: 'ز ح ط 9012', driver: 'عبدالله فهد', status: 'completed', route: 'المسار C', progress: 100, bins: 18, capacity: 95 },
  { id: 4, plate: 'ي ك ل 3456', driver: 'فيصل عمر', status: 'idle', route: '-', progress: 0, bins: 0, capacity: 0 },
];

// بيانات الجمع اليومية
const dailyCollectionData = [
  { day: 'السبت', general: 450, recyclable: 180, organic: 120 },
  { day: 'الأحد', general: 520, recyclable: 200, organic: 150 },
  { day: 'الإثنين', general: 480, recyclable: 190, organic: 130 },
  { day: 'الثلاثاء', general: 550, recyclable: 220, organic: 160 },
  { day: 'الأربعاء', general: 490, recyclable: 210, organic: 140 },
  { day: 'الخميس', general: 420, recyclable: 170, organic: 110 },
  { day: 'الجمعة', general: 380, recyclable: 150, organic: 100 },
];

// مسارات الجمع المحسنة
const optimizedRoutes = [
  { id: 1, name: 'المسار A - المنطقة التجارية', bins: 15, distance: '12.5 كم', estimatedTime: '2.5 ساعة', priority: 'high' },
  { id: 2, name: 'المسار B - الحي السكني', bins: 22, distance: '18.2 كم', estimatedTime: '3.5 ساعة', priority: 'medium' },
  { id: 3, name: 'المسار C - المنطقة الصناعية', bins: 8, distance: '8.7 كم', estimatedTime: '1.5 ساعة', priority: 'high' },
  { id: 4, name: 'المسار D - المنتزهات', bins: 12, distance: '15.3 كم', estimatedTime: '2 ساعة', priority: 'low' },
];

export default function WasteManagement() {
  const [activeTab, setActiveTab] = useState('bins');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBin, setSelectedBin] = useState(null);
  const [showBinDialog, setShowBinDialog] = useState(false);
  const [showRouteDialog, setShowRouteDialog] = useState(false);

  // إحصائيات
  const stats = useMemo(() => ({
    totalBins: smartBins.length,
    needsCollection: smartBins.filter(b => b.fillLevel >= 75).length,
    alerts: smartBins.filter(b => b.status === 'alert').length,
    avgFillLevel: Math.round(smartBins.reduce((s, b) => s + b.fillLevel, 0) / smartBins.length),
    activeTrucks: collectionTrucks.filter(t => t.status !== 'idle').length,
    todayCollection: dailyCollectionData[dailyCollectionData.length - 1],
    recyclingRate: 32,
  }), []);

  // فلترة الحاويات
  const filteredBins = useMemo(() => {
    return smartBins.filter(bin => {
      const matchesSearch = bin.location.includes(searchQuery);
      const matchesType = filterType === 'all' || bin.type === filterType;
      const matchesStatus = filterStatus === 'all' || bin.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchQuery, filterType, filterStatus]);

  const getTypeConfig = (typeId) => wasteTypes.find(t => t.id === typeId) || wasteTypes[0];
  
  const getStatusConfig = (status) => {
    switch (status) {
      case 'alert': return { label: 'تنبيه', color: 'red' };
      case 'needs_collection': return { label: 'يحتاج جمع', color: 'amber' };
      case 'normal': return { label: 'طبيعي', color: 'green' };
      default: return { label: status, color: 'slate' };
    }
  };

  const scheduleCollection = (bin) => {
    toast.success(`تم جدولة جمع النفايات من: ${bin.location}`);
  };

  const optimizeRoutes = () => {
    toast.success('جاري تحسين المسارات بالذكاء الاصطناعي...');
    setTimeout(() => toast.success('تم تحسين المسارات بنجاح!'), 2000);
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Recycle className="w-8 h-8 text-green-400" />
              إدارة النفايات الذكية
            </h1>
            <p className="text-slate-400 mt-1">مراقبة وتحسين عمليات جمع النفايات</p>
          </div>
          <div className="flex gap-2">
            <Link to={createPageUrl('CitizenWasteReports')}>
              <Button variant="outline" className="border-purple-500/50 text-purple-400">
                <Users className="w-4 h-4 ml-2" />
                بلاغات المواطنين
              </Button>
            </Link>
            <Button variant="outline" className="border-cyan-500/50 text-cyan-400" onClick={optimizeRoutes}>
              <Route className="w-4 h-4 ml-2" />
              تحسين المسارات AI
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowRouteDialog(true)}>
              <Truck className="w-4 h-4 ml-2" />
              جدولة الجمع
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        {[
          { label: 'إجمالي الحاويات', value: stats.totalBins, icon: Trash2, color: 'cyan' },
          { label: 'تحتاج جمع', value: stats.needsCollection, icon: AlertTriangle, color: 'amber' },
          { label: 'تنبيهات', value: stats.alerts, icon: Bell, color: 'red' },
          { label: 'متوسط الامتلاء', value: `${stats.avgFillLevel}%`, icon: Gauge, color: 'blue' },
          { label: 'شاحنات نشطة', value: stats.activeTrucks, icon: Truck, color: 'green' },
          { label: 'جمع اليوم', value: `${stats.todayCollection?.general || 0} طن`, icon: Weight, color: 'purple' },
          { label: 'معدل التدوير', value: `${stats.recyclingRate}%`, icon: Recycle, color: 'green' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-3 text-center">
                <stat.icon className={`w-5 h-5 text-${stat.color}-400 mx-auto mb-1`} />
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-slate-400">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      {stats.alerts > 0 && (
        <Card className="glass-card border-red-500/30 bg-red-500/5 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
              <div>
                <p className="text-red-300 font-medium">{stats.alerts} حاوية تحتاج اهتمام فوري</p>
                <p className="text-red-400/70 text-sm">حاويات ممتلئة أو بها مشاكل في الاستشعار</p>
              </div>
              <Button size="sm" className="mr-auto bg-red-600 hover:bg-red-700">عرض التفاصيل</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap">
          <TabsTrigger value="bins" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Trash2 className="w-4 h-4 ml-1" />
            الحاويات الذكية
          </TabsTrigger>
          <TabsTrigger value="types" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Layers className="w-4 h-4 ml-1" />
            أنواع النفايات
          </TabsTrigger>
          <TabsTrigger value="trucks" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Truck className="w-4 h-4 ml-1" />
            الأسطول
          </TabsTrigger>
          <TabsTrigger value="routes" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <Route className="w-4 h-4 ml-1" />
            المسارات
          </TabsTrigger>
          <TabsTrigger value="landfill" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Mountain className="w-4 h-4 ml-1" />
            المكبات
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
            <BarChart3 className="w-4 h-4 ml-1" />
            التحليلات
          </TabsTrigger>
          <TabsTrigger value="recycling" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Recycle className="w-4 h-4 ml-1" />
            إعادة التدوير
          </TabsTrigger>
          <TabsTrigger value="citizen" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Users className="w-4 h-4 ml-1" />
            تطبيق المواطن
          </TabsTrigger>
          <TabsTrigger value="ai-routes" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Route className="w-4 h-4 ml-1" />
            تحسين المسارات AI
          </TabsTrigger>
          <TabsTrigger value="ai-recognition" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Eye className="w-4 h-4 ml-1" />
            التعرف الذكي
          </TabsTrigger>
          <TabsTrigger value="predictive" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Wrench className="w-4 h-4 ml-1" />
            الصيانة التنبؤية
          </TabsTrigger>
          <TabsTrigger value="quality" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <CheckCircle className="w-4 h-4 ml-1" />
            جودة الفرز
          </TabsTrigger>
          <TabsTrigger value="predictive" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <TrendingUp className="w-4 h-4 ml-1" />
            التحليل التنبؤي
          </TabsTrigger>
          <TabsTrigger value="driver-assist" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Navigation className="w-4 h-4 ml-1" />
            مساعد السائق
          </TabsTrigger>
          <TabsTrigger value="municipality" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Lightbulb className="w-4 h-4 ml-1" />
            عمليات البلدية
          </TabsTrigger>
          </TabsList>

        <TabsContent value="bins" className="mt-4">
          <SmartBinsMonitor />
        </TabsContent>

        <TabsContent value="types" className="mt-4">
          <WasteTypesManager />
        </TabsContent>

        <TabsContent value="trucks" className="mt-4">
          <FleetWasteTracking />
        </TabsContent>

        <TabsContent value="routes" className="space-y-4 mt-4">
          <div className="space-y-3">
            {optimizedRoutes.map(route => (
              <Card key={route.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${route.priority === 'high' ? 'bg-red-500/20' : route.priority === 'medium' ? 'bg-amber-500/20' : 'bg-green-500/20'}`}>
                        <Route className={`w-6 h-6 ${route.priority === 'high' ? 'text-red-400' : route.priority === 'medium' ? 'text-amber-400' : 'text-green-400'}`} />
                      </div>
                      <div>
                        <p className="text-white font-bold">{route.name}</p>
                        <div className="flex gap-4 text-slate-400 text-sm mt-1">
                          <span><Trash2 className="w-3 h-3 inline ml-1" />{route.bins} حاوية</span>
                          <span><MapPin className="w-3 h-3 inline ml-1" />{route.distance}</span>
                          <span><Clock className="w-3 h-3 inline ml-1" />{route.estimatedTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        route.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        route.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-green-500/20 text-green-400'
                      }>
                        {route.priority === 'high' ? 'عالي' : route.priority === 'medium' ? 'متوسط' : 'منخفض'}
                      </Badge>
                      <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                        <Play className="w-4 h-4 ml-1" />
                        بدء
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">جمع النفايات الأسبوعي (طن)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyCollectionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="general" fill="#64748b" name="عامة" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="recyclable" fill="#22c55e" name="قابلة للتدوير" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="organic" fill="#f59e0b" name="عضوية" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">توزيع أنواع النفايات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'عامة', value: 55 },
                          { name: 'قابلة للتدوير', value: 25 },
                          { name: 'عضوية', value: 15 },
                          { name: 'خطرة', value: 3 },
                          { name: 'إلكترونية', value: 2 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="landfill" className="mt-4">
          <LandfillManagement />
        </TabsContent>

        <TabsContent value="recycling" className="space-y-6 mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="glass-card border-green-500/30 bg-green-500/5">
              <CardContent className="p-6 text-center">
                <Recycle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-4xl font-bold text-white mb-2">32%</p>
                <p className="text-slate-400">معدل إعادة التدوير</p>
                <Badge className="mt-2 bg-green-500/20 text-green-400">+5% من الشهر الماضي</Badge>
              </CardContent>
            </Card>
            <Card className="glass-card border-cyan-500/30 bg-cyan-500/5">
              <CardContent className="p-6 text-center">
                <Weight className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <p className="text-4xl font-bold text-white mb-2">2,450</p>
                <p className="text-slate-400">طن تم تدويره هذا الشهر</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-6 text-center">
                <Leaf className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <p className="text-4xl font-bold text-white mb-2">1,200</p>
                <p className="text-slate-400">طن CO2 تم توفيره</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="citizen" className="mt-4">
          <CitizenWasteApp />
        </TabsContent>

        <TabsContent value="ai-routes" className="mt-4">
          <AIRouteOptimizer />
        </TabsContent>

        <TabsContent value="ai-recognition" className="mt-4">
          <AIWasteRecognition />
        </TabsContent>

        <TabsContent value="predictive" className="mt-4">
          <FleetPredictiveMaintenance />
        </TabsContent>

        <TabsContent value="quality" className="mt-4">
          <SegregationQualityMonitor />
        </TabsContent>

        <TabsContent value="predictive" className="mt-4">
          <WastePredictiveAnalysis />
        </TabsContent>

        <TabsContent value="driver-assist" className="mt-4">
          <DriverAIAssistant />
        </TabsContent>

        <TabsContent value="municipality" className="mt-4">
          <SmartMunicipalityModule />
        </TabsContent>
        </Tabs>

      {/* Bin Detail Dialog */}
      <Dialog open={showBinDialog} onOpenChange={setShowBinDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-green-400" />
              تفاصيل الحاوية
            </DialogTitle>
          </DialogHeader>
          {selectedBin && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-white font-medium">{selectedBin.location}</p>
                <p className="text-slate-400 text-sm">{getTypeConfig(selectedBin.type).name}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/30 rounded text-center">
                  <p className="text-2xl font-bold text-white">{selectedBin.fillLevel}%</p>
                  <p className="text-slate-500 text-xs">الامتلاء</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded text-center">
                  <p className="text-2xl font-bold text-white">{selectedBin.temperature}°C</p>
                  <p className="text-slate-500 text-xs">الحرارة</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded text-center">
                  <p className="text-2xl font-bold text-white">{selectedBin.battery}%</p>
                  <p className="text-slate-500 text-xs">البطارية</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded text-center">
                  <p className="text-2xl font-bold text-white">{selectedBin.signal === 'excellent' ? 'ممتاز' : selectedBin.signal === 'good' ? 'جيد' : 'ضعيف'}</p>
                  <p className="text-slate-500 text-xs">الإشارة</p>
                </div>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => { scheduleCollection(selectedBin); setShowBinDialog(false); }}>
                <Truck className="w-4 h-4 ml-2" />
                جدولة جمع
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}