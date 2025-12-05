import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Route, Navigation, MapPin, Truck, Clock, DollarSign, Gauge, Play,
  Pause, RefreshCw, AlertTriangle, CheckCircle, Users, Zap, Brain,
  TrendingUp, BarChart3, Calendar, Target, Fuel, Timer, ArrowRight,
  Car, User, Phone, Radio, Wifi, Battery, ThermometerSun, Wind,
  RotateCcw, Send, Eye, Edit, Trash2, Plus, Filter, Search, Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// السائقين المتاحين
const drivers = [
  { id: 1, name: 'محمد أحمد', status: 'available', vehicle: 'شاحنة #12', location: 'المنطقة أ', rating: 4.8, completedTrips: 245, phone: '+966 5XX XXX XXX', skills: ['صيانة', 'توصيل', 'نفايات'] },
  { id: 2, name: 'خالد السعيد', status: 'on_trip', vehicle: 'فان #08', location: 'الطريق السريع', rating: 4.6, completedTrips: 189, phone: '+966 5XX XXX XXX', skills: ['توصيل', 'طوارئ'] },
  { id: 3, name: 'عبدالله فهد', status: 'available', vehicle: 'شاحنة #15', location: 'المنطقة ب', rating: 4.9, completedTrips: 312, phone: '+966 5XX XXX XXX', skills: ['صيانة', 'نفايات', 'معدات ثقيلة'] },
  { id: 4, name: 'فيصل عمر', status: 'break', vehicle: 'سيارة #03', location: 'محطة الراحة', rating: 4.5, completedTrips: 156, phone: '+966 5XX XXX XXX', skills: ['توصيل سريع'] },
  { id: 5, name: 'سعود الشمري', status: 'available', vehicle: 'شاحنة #20', location: 'المنطقة ج', rating: 4.7, completedTrips: 278, phone: '+966 5XX XXX XXX', skills: ['صيانة', 'توصيل'] },
];

// المهام المتاحة
const pendingTasks = [
  { id: 1, type: 'maintenance', title: 'صيانة مكيف - فيلا الورود', location: 'حي الورود، شارع 15', priority: 'high', estimatedTime: '2 ساعة', distance: '8.5 كم', requiredSkills: ['صيانة'], customer: 'أحمد محمد', scheduledTime: '10:00' },
  { id: 2, type: 'delivery', title: 'توصيل قطع غيار', location: 'المنطقة الصناعية', priority: 'medium', estimatedTime: '45 دقيقة', distance: '12.3 كم', requiredSkills: ['توصيل'], customer: 'شركة ABC', scheduledTime: '11:30' },
  { id: 3, type: 'waste', title: 'جمع نفايات - المسار A', location: 'المنطقة التجارية', priority: 'high', estimatedTime: '3 ساعات', distance: '25 كم', requiredSkills: ['نفايات'], customer: 'البلدية', scheduledTime: '06:00' },
  { id: 4, type: 'emergency', title: 'إصلاح طارئ - تسريب مياه', location: 'حي النخيل', priority: 'urgent', estimatedTime: '1 ساعة', distance: '5.2 كم', requiredSkills: ['طوارئ', 'صيانة'], customer: 'نورة العتيبي', scheduledTime: 'فوري' },
  { id: 5, type: 'maintenance', title: 'فحص دوري - مبنى إداري', location: 'وسط المدينة', priority: 'low', estimatedTime: '4 ساعات', distance: '15 كم', requiredSkills: ['صيانة'], customer: 'شركة XYZ', scheduledTime: '14:00' },
];

// المسارات النشطة
const activeRoutes = [
  { 
    id: 1, 
    name: 'مسار الصيانة الصباحي', 
    driver: 'محمد أحمد',
    vehicle: 'شاحنة #12',
    status: 'in_progress',
    stops: 5,
    completedStops: 2,
    totalDistance: '45 كم',
    remainingDistance: '28 كم',
    estimatedCompletion: '13:30',
    startTime: '08:00',
    fuelUsed: 12,
    currentLocation: { lat: 24.7136, lng: 46.6753 }
  },
  { 
    id: 2, 
    name: 'توصيلات المنطقة الشرقية', 
    driver: 'خالد السعيد',
    vehicle: 'فان #08',
    status: 'in_progress',
    stops: 8,
    completedStops: 5,
    totalDistance: '62 كم',
    remainingDistance: '18 كم',
    estimatedCompletion: '12:00',
    startTime: '07:30',
    fuelUsed: 8,
    currentLocation: { lat: 24.7200, lng: 46.6800 }
  },
  { 
    id: 3, 
    name: 'جمع النفايات - المسار C', 
    driver: 'عبدالله فهد',
    vehicle: 'شاحنة #15',
    status: 'completed',
    stops: 12,
    completedStops: 12,
    totalDistance: '38 كم',
    remainingDistance: '0 كم',
    estimatedCompletion: '10:00',
    startTime: '06:00',
    fuelUsed: 18,
    currentLocation: { lat: 24.7050, lng: 46.6900 }
  },
];

// بيانات الأداء
const performanceData = [
  { day: 'السبت', trips: 45, distance: 520, fuel: 85, onTime: 42 },
  { day: 'الأحد', trips: 52, distance: 610, fuel: 95, onTime: 48 },
  { day: 'الإثنين', trips: 48, distance: 580, fuel: 90, onTime: 45 },
  { day: 'الثلاثاء', trips: 55, distance: 650, fuel: 102, onTime: 52 },
  { day: 'الأربعاء', trips: 50, distance: 600, fuel: 92, onTime: 47 },
  { day: 'الخميس', trips: 42, distance: 490, fuel: 78, onTime: 40 },
  { day: 'الجمعة', trips: 35, distance: 380, fuel: 62, onTime: 34 },
];

export default function SmartRouting() {
  const [activeTab, setActiveTab] = useState('dispatch');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showOptimizeDialog, setShowOptimizeDialog] = useState(false);
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [autoAssign, setAutoAssign] = useState(true);
  const [optimizationResults, setOptimizationResults] = useState(null);

  // إحصائيات
  const stats = useMemo(() => ({
    availableDrivers: drivers.filter(d => d.status === 'available').length,
    activeTrips: activeRoutes.filter(r => r.status === 'in_progress').length,
    pendingTasks: pendingTasks.length,
    urgentTasks: pendingTasks.filter(t => t.priority === 'urgent').length,
    completedToday: 23,
    avgDeliveryTime: '45 دقيقة',
    fuelSaved: '15%',
    onTimeRate: 94,
  }), []);

  // AI Route Optimization
  const optimizeRoutesMutation = useMutation({
    mutationFn: async (tasks) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير في تحسين مسارات الأسطول والتوجيه الذكي. 
        
المهام المطلوبة:
${JSON.stringify(tasks, null, 2)}

السائقين المتاحين:
${JSON.stringify(drivers.filter(d => d.status === 'available'), null, 2)}

قم بتحليل وتحسين توزيع المهام على السائقين بناءً على:
1. القرب الجغرافي
2. المهارات المطلوبة
3. الأولوية والإلحاح
4. تقليل المسافة والوقت
5. توازن العمل بين السائقين

قدم خطة توزيع مثالية مع تقدير التوفير`,
        response_json_schema: {
          type: "object",
          properties: {
            assignments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  taskId: { type: "number" },
                  taskTitle: { type: "string" },
                  driverId: { type: "number" },
                  driverName: { type: "string" },
                  reason: { type: "string" },
                  estimatedArrival: { type: "string" },
                  optimizedRoute: { type: "string" }
                }
              }
            },
            optimizedRoutes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  driverId: { type: "number" },
                  driverName: { type: "string" },
                  stops: { type: "array", items: { type: "string" } },
                  totalDistance: { type: "string" },
                  totalTime: { type: "string" },
                  fuelEstimate: { type: "string" }
                }
              }
            },
            savings: {
              type: "object",
              properties: {
                distanceSaved: { type: "string" },
                timeSaved: { type: "string" },
                fuelSaved: { type: "string" },
                costSaved: { type: "string" }
              }
            },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setOptimizationResults(data);
      setShowOptimizeDialog(true);
      setIsOptimizing(false);
      toast.success('تم تحسين المسارات بنجاح!');
    },
    onError: () => {
      toast.error('حدث خطأ في التحسين');
      setIsOptimizing(false);
    }
  });

  const runOptimization = () => {
    setIsOptimizing(true);
    optimizeRoutesMutation.mutate(pendingTasks);
  };

  const assignTask = (task, driver) => {
    toast.success(`تم تعيين "${task.title}" للسائق ${driver.name}`);
    setShowAssignDialog(false);
  };

  const autoAssignTasks = () => {
    toast.success('جاري التوزيع التلقائي للمهام...');
    setTimeout(() => toast.success('تم توزيع 5 مهام على 3 سائقين'), 1500);
  };

  const rerouteDriver = (route) => {
    toast.success(`جاري إعادة توجيه ${route.driver}...`);
    setTimeout(() => toast.success('تم تحديث المسار بنجاح'), 1000);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'available': return { label: 'متاح', color: 'green', icon: CheckCircle };
      case 'on_trip': return { label: 'في رحلة', color: 'blue', icon: Truck };
      case 'break': return { label: 'استراحة', color: 'amber', icon: Clock };
      case 'offline': return { label: 'غير متصل', color: 'slate', icon: Radio };
      default: return { label: status, color: 'slate', icon: User };
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'urgent': return { label: 'عاجل', color: 'red' };
      case 'high': return { label: 'عالي', color: 'amber' };
      case 'medium': return { label: 'متوسط', color: 'blue' };
      case 'low': return { label: 'منخفض', color: 'slate' };
      default: return { label: priority, color: 'slate' };
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Route className="w-8 h-8 text-cyan-400" />
              إدارة المسارات والتشغيل الذكي
            </h1>
            <p className="text-slate-400 mt-1">تخطيط وتحسين المسارات بالذكاء الاصطناعي</p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg">
              <Label className="text-slate-400 text-sm">توزيع تلقائي</Label>
              <Switch checked={autoAssign} onCheckedChange={setAutoAssign} />
            </div>
            <Button variant="outline" className="border-purple-500/50 text-purple-400" onClick={runOptimization} disabled={isOptimizing}>
              {isOptimizing ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
              تحسين AI
            </Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={autoAssignTasks}>
              <Zap className="w-4 h-4 ml-2" />
              توزيع المهام
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Urgent Alert */}
      {stats.urgentTasks > 0 && (
        <Card className="glass-card border-red-500/30 bg-red-500/5 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
              <div>
                <p className="text-red-300 font-medium">{stats.urgentTasks} مهمة عاجلة تحتاج تعيين فوري</p>
                <p className="text-red-400/70 text-sm">يجب توزيعها على السائقين المتاحين</p>
              </div>
              <Button size="sm" className="mr-auto bg-red-600 hover:bg-red-700" onClick={() => setActiveTab('dispatch')}>
                عرض المهام
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {[
          { label: 'سائقين متاحين', value: stats.availableDrivers, icon: Users, color: 'green' },
          { label: 'رحلات نشطة', value: stats.activeTrips, icon: Truck, color: 'cyan' },
          { label: 'مهام معلقة', value: stats.pendingTasks, icon: Target, color: 'amber' },
          { label: 'عاجل', value: stats.urgentTasks, icon: AlertTriangle, color: 'red' },
          { label: 'مكتملة اليوم', value: stats.completedToday, icon: CheckCircle, color: 'blue' },
          { label: 'متوسط التوصيل', value: stats.avgDeliveryTime, icon: Timer, color: 'purple' },
          { label: 'توفير الوقود', value: stats.fuelSaved, icon: Fuel, color: 'green' },
          { label: 'الالتزام بالوقت', value: `${stats.onTimeRate}%`, icon: Clock, color: 'cyan' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap">
          <TabsTrigger value="dispatch" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Send className="w-4 h-4 ml-1" />
            الإرسال الذكي
          </TabsTrigger>
          <TabsTrigger value="routes" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Route className="w-4 h-4 ml-1" />
            المسارات النشطة
          </TabsTrigger>
          <TabsTrigger value="drivers" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Users className="w-4 h-4 ml-1" />
            السائقين
          </TabsTrigger>
          <TabsTrigger value="planning" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Calendar className="w-4 h-4 ml-1" />
            التخطيط
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <BarChart3 className="w-4 h-4 ml-1" />
            التحليلات
          </TabsTrigger>
        </TabsList>

        {/* Smart Dispatch Tab */}
        <TabsContent value="dispatch" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Pending Tasks */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-400" />
                    المهام المعلقة ({pendingTasks.length})
                  </CardTitle>
                  <Badge className="bg-red-500/20 text-red-400">{stats.urgentTasks} عاجل</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[450px]">
                  <div className="space-y-3">
                    {pendingTasks.sort((a, b) => {
                      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
                      return priorityOrder[a.priority] - priorityOrder[b.priority];
                    }).map(task => {
                      const priorityConfig = getPriorityConfig(task.priority);
                      return (
                        <div 
                          key={task.id} 
                          className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-cyan-500/50 ${
                            task.priority === 'urgent' ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800/30 border-slate-700/50'
                          } ${selectedTask?.id === task.id ? 'border-cyan-500' : ''}`}
                          onClick={() => setSelectedTask(task)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-white font-medium text-sm">{task.title}</p>
                              <p className="text-slate-400 text-xs flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {task.location}
                              </p>
                            </div>
                            <Badge className={`bg-${priorityConfig.color}-500/20 text-${priorityConfig.color}-400`}>
                              {priorityConfig.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span><Clock className="w-3 h-3 inline ml-1" />{task.estimatedTime}</span>
                            <span><Navigation className="w-3 h-3 inline ml-1" />{task.distance}</span>
                            <span><Calendar className="w-3 h-3 inline ml-1" />{task.scheduledTime}</span>
                          </div>
                          <div className="flex gap-1 mt-2">
                            {task.requiredSkills.map(skill => (
                              <Badge key={skill} variant="outline" className="text-xs border-slate-600">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Available Drivers */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-400" />
                    السائقين المتاحين ({stats.availableDrivers})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[450px]">
                  <div className="space-y-3">
                    {drivers.map(driver => {
                      const statusConfig = getStatusConfig(driver.status);
                      const StatusIcon = statusConfig.icon;
                      const isMatch = selectedTask && driver.skills.some(s => selectedTask.requiredSkills.includes(s));
                      
                      return (
                        <div 
                          key={driver.id} 
                          className={`p-3 rounded-lg border transition-all ${
                            driver.status === 'available' ? 'bg-slate-800/30 border-slate-700/50 hover:border-green-500/50' : 'bg-slate-800/20 border-slate-700/30'
                          } ${isMatch ? 'border-green-500/50 bg-green-500/5' : ''} ${selectedDriver?.id === driver.id ? 'border-cyan-500' : ''}`}
                          onClick={() => driver.status === 'available' && setSelectedDriver(driver)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className={`bg-${statusConfig.color}-500/20 text-${statusConfig.color}-400`}>
                                  {driver.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-white font-medium">{driver.name}</p>
                                <p className="text-slate-400 text-xs">{driver.vehicle} • {driver.location}</p>
                              </div>
                            </div>
                            <Badge className={`bg-${statusConfig.color}-500/20 text-${statusConfig.color}-400`}>
                              <StatusIcon className="w-3 h-3 ml-1" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                            <span>⭐ {driver.rating}</span>
                            <span>{driver.completedTrips} رحلة</span>
                          </div>
                          <div className="flex gap-1">
                            {driver.skills.map(skill => (
                              <Badge 
                                key={skill} 
                                variant="outline" 
                                className={`text-xs ${isMatch && selectedTask?.requiredSkills.includes(skill) ? 'border-green-500 text-green-400' : 'border-slate-600'}`}
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          {driver.status === 'available' && selectedTask && isMatch && (
                            <Button 
                              size="sm" 
                              className="w-full mt-2 bg-green-600 hover:bg-green-700"
                              onClick={(e) => { e.stopPropagation(); assignTask(selectedTask, driver); }}
                            >
                              <Send className="w-3 h-3 ml-1" />
                              تعيين المهمة
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Active Routes Tab */}
        <TabsContent value="routes" className="space-y-4 mt-4">
          <div className="space-y-4">
            {activeRoutes.map(route => (
              <Card key={route.id} className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 ${route.status === 'completed' ? 'opacity-70' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        route.status === 'in_progress' ? 'bg-green-500/20' : 'bg-blue-500/20'
                      }`}>
                        <Truck className={`w-6 h-6 ${route.status === 'in_progress' ? 'text-green-400' : 'text-blue-400'}`} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{route.name}</h3>
                        <p className="text-slate-400 text-sm">{route.driver} • {route.vehicle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={route.status === 'in_progress' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}>
                        {route.status === 'in_progress' ? 'قيد التنفيذ' : 'مكتمل'}
                      </Badge>
                      {route.status === 'in_progress' && (
                        <Button size="sm" variant="outline" className="border-amber-500/50 text-amber-400" onClick={() => rerouteDriver(route)}>
                          <RotateCcw className="w-3 h-3 ml-1" />
                          إعادة توجيه
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400 text-sm">التقدم: {route.completedStops}/{route.stops} محطات</span>
                      <span className="text-white font-medium">{Math.round((route.completedStops / route.stops) * 100)}%</span>
                    </div>
                    <Progress value={(route.completedStops / route.stops) * 100} className="h-3" />
                  </div>

                  {/* Route Details */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="p-2 bg-slate-800/50 rounded text-center">
                      <p className="text-cyan-400 font-bold">{route.totalDistance}</p>
                      <p className="text-slate-500 text-xs">المسافة الكلية</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded text-center">
                      <p className="text-amber-400 font-bold">{route.remainingDistance}</p>
                      <p className="text-slate-500 text-xs">المتبقي</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded text-center">
                      <p className="text-green-400 font-bold">{route.startTime}</p>
                      <p className="text-slate-500 text-xs">البداية</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded text-center">
                      <p className="text-purple-400 font-bold">{route.estimatedCompletion}</p>
                      <p className="text-slate-500 text-xs">الوصول المتوقع</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded text-center">
                      <p className="text-red-400 font-bold">{route.fuelUsed} لتر</p>
                      <p className="text-slate-500 text-xs">الوقود المستخدم</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Drivers Tab */}
        <TabsContent value="drivers" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map(driver => {
              const statusConfig = getStatusConfig(driver.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <Card key={driver.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className={`bg-${statusConfig.color}-500/20 text-${statusConfig.color}-400 text-xl`}>
                          {driver.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-white font-bold">{driver.name}</p>
                        <p className="text-slate-400 text-sm">{driver.vehicle}</p>
                        <Badge className={`bg-${statusConfig.color}-500/20 text-${statusConfig.color}-400 mt-1`}>
                          <StatusIcon className="w-3 h-3 ml-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                      <div className="p-2 bg-slate-800/50 rounded">
                        <p className="text-amber-400 font-bold">⭐ {driver.rating}</p>
                        <p className="text-slate-500 text-xs">التقييم</p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded">
                        <p className="text-cyan-400 font-bold">{driver.completedTrips}</p>
                        <p className="text-slate-500 text-xs">رحلات</p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded">
                        <p className="text-green-400 font-bold flex items-center justify-center">
                          <MapPin className="w-3 h-3 ml-1" />
                        </p>
                        <p className="text-slate-500 text-xs">{driver.location}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {driver.skills.map(skill => (
                        <Badge key={skill} variant="outline" className="text-xs border-slate-600">{skill}</Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 border-slate-600">
                        <Phone className="w-3 h-3 ml-1" />
                        اتصال
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 border-slate-600">
                        <Eye className="w-3 h-3 ml-1" />
                        تتبع
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Planning Tab */}
        <TabsContent value="planning" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm">تخطيط المسارات المجدولة</CardTitle>
                <Button className="bg-purple-600 hover:bg-purple-700" onClick={runOptimization}>
                  <Brain className="w-4 h-4 ml-2" />
                  تحسين بالذكاء الاصطناعي
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: 'مسار الصيانة الصباحي', time: '08:00', stops: 6, distance: '45 كم', driver: 'محمد أحمد', status: 'scheduled' },
                  { name: 'توصيلات المنطقة الشرقية', time: '09:00', stops: 8, distance: '55 كم', driver: 'خالد السعيد', status: 'scheduled' },
                  { name: 'جمع النفايات - المسار A', time: '06:00', stops: 15, distance: '38 كم', driver: 'عبدالله فهد', status: 'scheduled' },
                  { name: 'صيانة طارئة', time: 'عند الطلب', stops: '-', distance: '-', driver: 'غير محدد', status: 'standby' },
                ].map((route, i) => (
                  <div key={i} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">{route.name}</h4>
                      <Badge className={route.status === 'scheduled' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                        {route.status === 'scheduled' ? 'مجدول' : 'احتياطي'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-4 h-4" />
                        {route.time}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-4 h-4" />
                        {route.stops} محطة
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Navigation className="w-4 h-4" />
                        {route.distance}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <User className="w-4 h-4" />
                        {route.driver}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6 mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">أداء الأسبوع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="trips" fill="#22d3ee" name="الرحلات" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="onTime" fill="#22c55e" name="في الوقت" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">استهلاك الوقود والمسافة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Legend />
                      <Line type="monotone" dataKey="distance" stroke="#a855f7" name="المسافة (كم)" strokeWidth={2} />
                      <Line type="monotone" dataKey="fuel" stroke="#f59e0b" name="الوقود (لتر)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* KPIs */}
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: 'متوسط وقت التوصيل', value: '42 دقيقة', change: '-8%', positive: true },
              { label: 'معدل الالتزام بالوقت', value: '94%', change: '+3%', positive: true },
              { label: 'كفاءة استهلاك الوقود', value: '8.5 كم/لتر', change: '+5%', positive: true },
              { label: 'تكلفة الرحلة', value: '45 ر.س', change: '-12%', positive: true },
            ].map(kpi => (
              <Card key={kpi.label} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-white">{kpi.value}</p>
                  <p className="text-slate-400 text-sm">{kpi.label}</p>
                  <Badge className={`mt-2 ${kpi.positive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {kpi.change}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Optimization Results Dialog */}
      <Dialog open={showOptimizeDialog} onOpenChange={setShowOptimizeDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              نتائج تحسين المسارات
            </DialogTitle>
          </DialogHeader>
          
          {optimizationResults && (
            <div className="space-y-6 mt-4">
              {/* Savings */}
              {optimizationResults.savings && (
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'توفير المسافة', value: optimizationResults.savings.distanceSaved, color: 'cyan' },
                    { label: 'توفير الوقت', value: optimizationResults.savings.timeSaved, color: 'green' },
                    { label: 'توفير الوقود', value: optimizationResults.savings.fuelSaved, color: 'amber' },
                    { label: 'توفير التكلفة', value: optimizationResults.savings.costSaved, color: 'purple' },
                  ].map(item => (
                    <div key={item.label} className={`p-3 bg-${item.color}-500/10 border border-${item.color}-500/30 rounded-lg text-center`}>
                      <p className={`text-${item.color}-400 font-bold`}>{item.value}</p>
                      <p className="text-slate-400 text-xs">{item.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Assignments */}
              {optimizationResults.assignments?.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3">توزيع المهام المقترح</h4>
                  <div className="space-y-2">
                    {optimizationResults.assignments.map((assignment, i) => (
                      <div key={i} className="p-3 bg-slate-800/50 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-white">{assignment.taskTitle}</p>
                          <p className="text-slate-400 text-sm">{assignment.reason}</p>
                        </div>
                        <div className="text-left">
                          <p className="text-cyan-400 font-medium">{assignment.driverName}</p>
                          <p className="text-slate-500 text-xs">وصول: {assignment.estimatedArrival}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {optimizationResults.recommendations?.length > 0 && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <h4 className="text-purple-400 font-medium mb-2">توصيات إضافية</h4>
                  <ul className="space-y-1">
                    {optimizationResults.recommendations.map((rec, i) => (
                      <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => { toast.success('تم تطبيق التحسينات'); setShowOptimizeDialog(false); }}>
                <CheckCircle className="w-4 h-4 ml-2" />
                تطبيق التحسينات
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}