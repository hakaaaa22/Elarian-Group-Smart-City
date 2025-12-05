import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone, Wifi, WifiOff, MapPin, Clock, CheckCircle, Play,
  Pause, Camera, Upload, FileText, Navigation, Battery, Signal,
  User, Calendar, Wrench, Package, AlertTriangle, ChevronRight,
  Image, Mic, Send, RefreshCw, Check, X, Map, Phone, Star, File,
  Book, Bell, ExternalLink, History, BarChart3
} from 'lucide-react';
import TaskMap from '@/components/technician/TaskMap';
import CustomerRating from '@/components/technician/CustomerRating';
import KnowledgeBase from '@/components/technician/KnowledgeBase';
import TechnicianDashboard from '@/components/technician/TechnicianDashboard';
import DeviceMaintenanceHistory from '@/components/technician/DeviceMaintenanceHistory';
import AISmartScheduling from '@/components/technician/AISmartScheduling';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// محاكاة مهام الفني
const mockTasks = [
  {
    id: 1,
    title: 'صيانة مكيف غرفة المعيشة',
    device: 'مكيف سبليت LG',
    location: 'فيلا 12، شارع الملك فهد',
    coordinates: { lat: 24.7136, lng: 46.6753 },
    priority: 'high',
    status: 'in_progress',
    scheduledTime: '09:00',
    estimatedDuration: 2,
    customer: 'أحمد محمد',
    customerPhone: '+966 5XX XXX XXX',
    parts: [
      { name: 'فلتر مكيف', quantity: 1, available: true },
      { name: 'غاز فريون', quantity: 1, available: true }
    ],
    notes: 'الوحدة الخارجية تحتاج تنظيف',
    distance: '2.5 كم',
    eta: '10 دقائق'
  },
  {
    id: 2,
    title: 'إصلاح كاميرا المدخل',
    device: 'كاميرا IP Hikvision',
    location: 'مبنى 5، المنطقة الصناعية',
    coordinates: { lat: 24.7236, lng: 46.6853 },
    priority: 'medium',
    status: 'pending',
    scheduledTime: '11:30',
    estimatedDuration: 1,
    customer: 'شركة التقنية',
    customerPhone: '+966 5XX XXX XXX',
    parts: [
      { name: 'كابل شبكة', quantity: 5, available: true },
      { name: 'موصل RJ45', quantity: 4, available: true }
    ],
    notes: '',
    distance: '5.8 كم',
    eta: '20 دقيقة'
  },
  {
    id: 3,
    title: 'تركيب حساس حركة',
    device: 'حساس PIR',
    location: 'مكتب 8، برج الأعمال',
    coordinates: { lat: 24.7336, lng: 46.6953 },
    priority: 'low',
    status: 'pending',
    scheduledTime: '14:00',
    estimatedDuration: 1.5,
    customer: 'مؤسسة النور',
    customerPhone: '+966 5XX XXX XXX',
    parts: [
      { name: 'حساس حركة', quantity: 2, available: false }
    ],
    notes: 'انتظار وصول القطع',
    distance: '8.2 كم',
    eta: '25 دقيقة'
  }
];

export default function TechnicianMobileApp() {
  const [isOnline, setIsOnline] = useState(true);
  const [tasks, setTasks] = useState(mockTasks);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [locationTracking, setLocationTracking] = useState(true);
  const [currentLocation, setCurrentLocation] = useState({ lat: 24.7136, lng: 46.6753 });
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [signalStrength, setSignalStrength] = useState(4);

  const [fieldReport, setFieldReport] = useState({
    workDone: '',
    partsUsed: [],
    photos: [],
    documents: [],
    signature: '',
    notes: '',
    status: 'completed'
  });
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [completedTaskForRating, setCompletedTaskForRating] = useState(null);

  // محاكاة تحديث الموقع
  useEffect(() => {
    if (locationTracking) {
      const interval = setInterval(() => {
        setCurrentLocation(prev => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001
        }));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [locationTracking]);

  // تحديث حالة المهمة
  const updateTaskStatus = (taskId, newStatus) => {
    if (!isOnline) {
      setOfflineQueue([...offlineQueue, { taskId, status: newStatus, timestamp: new Date() }]);
      toast.info('تم حفظ التحديث للمزامنة لاحقاً');
    }
    
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ));
    
    if (newStatus === 'in_progress') {
      toast.success('تم بدء المهمة');
    } else if (newStatus === 'completed') {
      toast.success('تم إكمال المهمة');
    }
  };

  // مزامنة البيانات
  const syncData = () => {
    if (offlineQueue.length > 0) {
      toast.success(`تم مزامنة ${offlineQueue.length} تحديثات`);
      setOfflineQueue([]);
    } else {
      toast.info('لا توجد تحديثات للمزامنة');
    }
  };

  // إرسال التقرير الميداني
  const submitReport = () => {
    if (!fieldReport.workDone) {
      toast.error('يرجى وصف العمل المنجز');
      return;
    }
    
    const task = selectedTask;
    updateTaskStatus(selectedTask.id, fieldReport.status);
    setShowReportDialog(false);
    setFieldReport({
      workDone: '', partsUsed: [], photos: [], documents: [], signature: '', notes: '', status: 'completed'
    });
    toast.success('تم إرسال التقرير الميداني');
    
    // فتح نافذة التقييم
    if (fieldReport.status === 'completed') {
      setCompletedTaskForRating(task);
      setShowRatingDialog(true);
    }
  };

  const handleRatingSubmit = (ratingData) => {
    console.log('Rating submitted:', ratingData);
    setShowRatingDialog(false);
    setCompletedTaskForRating(null);
  };

  const priorityColors = {
    low: 'bg-blue-500/20 text-blue-400',
    medium: 'bg-amber-500/20 text-amber-400',
    high: 'bg-red-500/20 text-red-400'
  };

  const statusColors = {
    pending: 'bg-slate-500/20 text-slate-400',
    in_progress: 'bg-amber-500/20 text-amber-400',
    completed: 'bg-green-500/20 text-green-400'
  };

  const statusLabels = {
    pending: 'قيد الانتظار',
    in_progress: 'جاري العمل',
    completed: 'مكتملة'
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* محاكاة واجهة الهاتف */}
      <div className="max-w-md mx-auto">
        {/* شريط الحالة */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 mb-4">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-bold">تطبيق الفني</span>
              </div>
              <div className="flex items-center gap-3">
                {/* حالة الاتصال */}
                <div 
                  className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                    isOnline ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}
                  onClick={() => setIsOnline(!isOnline)}
                >
                  {isOnline ? (
                    <Wifi className="w-3 h-3 text-green-400" />
                  ) : (
                    <WifiOff className="w-3 h-3 text-red-400" />
                  )}
                  <span className={`text-xs ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                    {isOnline ? 'متصل' : 'غير متصل'}
                  </span>
                </div>
                
                {/* البطارية */}
                <div className="flex items-center gap-1">
                  <Battery className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400 text-xs">{batteryLevel}%</span>
                </div>
                
                {/* الإشارة */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4].map(i => (
                    <div 
                      key={i}
                      className={`w-1 rounded-full ${
                        i <= signalStrength ? 'bg-green-400' : 'bg-slate-600'
                      }`}
                      style={{ height: `${i * 3 + 4}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* قائمة انتظار غير متصل */}
            {offlineQueue.length > 0 && (
              <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between">
                <span className="text-amber-400 text-xs">
                  {offlineQueue.length} تحديثات بانتظار المزامنة
                </span>
                <Button size="sm" variant="ghost" className="h-6 text-amber-400" onClick={syncData}>
                  <RefreshCw className="w-3 h-3 ml-1" />
                  مزامنة
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* التنقل */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="w-full bg-slate-800/50 border border-slate-700 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="dashboard" className="flex-1 data-[state=active]:bg-purple-500/20">
              <BarChart3 className="w-4 h-4 ml-1" />
              لوحتي
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex-1 data-[state=active]:bg-cyan-500/20">
              <Wrench className="w-4 h-4 ml-1" />
              المهام
            </TabsTrigger>
            <TabsTrigger value="map" className="flex-1 data-[state=active]:bg-cyan-500/20">
              <Map className="w-4 h-4 ml-1" />
              الخريطة
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 data-[state=active]:bg-amber-500/20">
              <History className="w-4 h-4 ml-1" />
              السجلات
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex-1 data-[state=active]:bg-green-500/20">
              <Book className="w-4 h-4 ml-1" />
              المعرفة
            </TabsTrigger>
            <TabsTrigger value="scheduling" className="flex-1 data-[state=active]:bg-purple-500/20">
              <Calendar className="w-4 h-4 ml-1" />
              الجدولة
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 data-[state=active]:bg-slate-500/20">
              <User className="w-4 h-4 ml-1" />
              حسابي
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <TechnicianDashboard technicianName="محمد أحمد" />
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              {/* ملخص اليوم */}
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-bold">مهام اليوم</h3>
                    <Badge className="bg-cyan-500/20 text-cyan-400">
                      {tasks.filter(t => t.status !== 'completed').length} متبقية
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-slate-800/50 rounded text-center">
                      <p className="text-2xl font-bold text-white">{tasks.length}</p>
                      <p className="text-slate-400 text-xs">إجمالي</p>
                    </div>
                    <div className="p-2 bg-amber-500/10 rounded text-center">
                      <p className="text-2xl font-bold text-amber-400">
                        {tasks.filter(t => t.status === 'in_progress').length}
                      </p>
                      <p className="text-slate-400 text-xs">جارية</p>
                    </div>
                    <div className="p-2 bg-green-500/10 rounded text-center">
                      <p className="text-2xl font-bold text-green-400">
                        {tasks.filter(t => t.status === 'completed').length}
                      </p>
                      <p className="text-slate-400 text-xs">مكتملة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* قائمة المهام */}
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card 
                    className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 cursor-pointer ${
                      task.status === 'in_progress' ? 'ring-2 ring-amber-500/50' : ''
                    }`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-white font-bold">{task.title}</h4>
                          <p className="text-slate-400 text-sm">{task.device}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={priorityColors[task.priority]}>
                            {task.priority === 'high' ? 'عالي' : task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                          </Badge>
                          <Badge className={statusColors[task.status]}>
                            {statusLabels[task.status]}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{task.scheduledTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{task.distance}
                        </span>
                        <span className="flex items-center gap-1">
                          <Navigation className="w-3 h-3" />{task.eta}
                        </span>
                      </div>

                      {/* أزرار الإجراءات السريعة */}
                      <div className="flex gap-2">
                        {task.status === 'pending' && (
                          <Button
                            size="sm"
                            className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskStatus(task.id, 'in_progress');
                            }}
                          >
                            <Play className="w-3 h-3 ml-1" />
                            بدء
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTask(task);
                              setShowReportDialog(true);
                            }}
                          >
                            <Check className="w-3 h-3 ml-1" />
                            إنهاء
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            // فتح خرائط جوجل للتوجيه
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${task.coordinates.lat},${task.coordinates.lng}`;
                            window.open(url, '_blank');
                            toast.success('جاري فتح خرائط جوجل...');
                          }}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success('جاري الاتصال...');
                          }}
                        >
                          <Phone className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'map' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-[500px]"
            >
              <TaskMap
                tasks={tasks}
                currentLocation={currentLocation}
                onSelectTask={(task) => setSelectedTask(task)}
                onNavigate={(task) => toast.success(`جاري التوجيه إلى ${task.location}`)}
              />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DeviceMaintenanceHistory 
                onSelectRecord={(record) => {
                  toast.success(`تم تحميل سجل: ${record.date}`);
                }}
              />
            </motion.div>
          )}

          {activeTab === 'knowledge' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <KnowledgeBase 
                onSelectSolution={(solution) => {
                  toast.success(`تم تطبيق حل: ${solution.title}`);
                }}
              />
            </motion.div>
          )}

          {activeTab === 'scheduling' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <AISmartScheduling
                onAssignTask={(data) => {
                  toast.success(`تم تعيين: ${data.task.title}`);
                }}
              />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">تتبع الموقع</p>
                      <p className="text-slate-400 text-xs">مشاركة موقعك مع المشرف</p>
                    </div>
                    <Switch checked={locationTracking} onCheckedChange={setLocationTracking} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">وضع عدم الاتصال</p>
                      <p className="text-slate-400 text-xs">حفظ البيانات محلياً</p>
                    </div>
                    <Switch checked={!isOnline} onCheckedChange={(v) => setIsOnline(!v)} />
                  </div>

                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold">محمد أحمد</p>
                        <p className="text-slate-400 text-sm">فني تكييف</p>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full border-slate-600" onClick={syncData}>
                    <RefreshCw className="w-4 h-4 ml-2" />
                    مزامنة البيانات
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* نافذة تفاصيل المهمة */}
      <Dialog open={!!selectedTask && !showReportDialog} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">تفاصيل المهمة</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <h3 className="text-white font-bold">{selectedTask.title}</h3>
                <p className="text-cyan-400 text-sm">{selectedTask.device}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">الموقع</p>
                  <p className="text-white text-sm">{selectedTask.location}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">الوقت</p>
                  <p className="text-white text-sm">{selectedTask.scheduledTime}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400 text-xs mb-1">العميل</p>
                <p className="text-white">{selectedTask.customer}</p>
                <p className="text-cyan-400 text-sm">{selectedTask.customerPhone}</p>
              </div>

              {/* القطع المطلوبة */}
              <div>
                <h4 className="text-slate-300 text-sm mb-2">القطع المطلوبة</h4>
                <div className="space-y-2">
                  {selectedTask.parts.map((part, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                      <span className="text-white text-sm">{part.name} × {part.quantity}</span>
                      <Badge className={part.available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {part.available ? 'متوفر' : 'غير متوفر'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {selectedTask.notes && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-400 text-sm">{selectedTask.notes}</p>
                </div>
              )}

              <div className="flex gap-2">
                {selectedTask.status === 'pending' && (
                  <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={() => updateTaskStatus(selectedTask.id, 'in_progress')}>
                    <Play className="w-4 h-4 ml-2" />
                    بدء المهمة
                  </Button>
                )}
                {selectedTask.status === 'in_progress' && (
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => setShowReportDialog(true)}>
                    <FileText className="w-4 h-4 ml-2" />
                    إنهاء وتقرير
                  </Button>
                )}
                <Button variant="outline" className="border-slate-600" onClick={() => toast.success('جاري فتح التنقل')}>
                  <Navigation className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة تقييم العميل */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              تقييم الخدمة
            </DialogTitle>
          </DialogHeader>
          {completedTaskForRating && (
            <CustomerRating
              task={completedTaskForRating}
              onSubmit={handleRatingSubmit}
              onSkip={() => {
                setShowRatingDialog(false);
                setCompletedTaskForRating(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة التقرير الميداني */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-400" />
              التقرير الميداني
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">وصف العمل المنجز *</Label>
              <Textarea
                value={fieldReport.workDone}
                onChange={(e) => setFieldReport({...fieldReport, workDone: e.target.value})}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                rows={3}
                placeholder="صف العمل الذي تم إنجازه..."
              />
            </div>

            <div>
              <Label className="text-slate-300">حالة المهمة</Label>
              <Select 
                value={fieldReport.status} 
                onValueChange={(v) => setFieldReport({...fieldReport, status: v})}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="completed">مكتملة</SelectItem>
                  <SelectItem value="pending_parts">بانتظار قطع</SelectItem>
                  <SelectItem value="requires_followup">تحتاج متابعة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300 mb-2 block">إرفاق صور</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="h-20 border-dashed border-slate-600 flex-col">
                  <Camera className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-400">كاميرا</span>
                </Button>
                <Button variant="outline" className="h-20 border-dashed border-slate-600 flex-col">
                  <Image className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-400">معرض</span>
                </Button>
                <Button variant="outline" className="h-20 border-dashed border-slate-600 flex-col">
                  <Mic className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-400">صوت</span>
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-slate-300 mb-2 block">إرفاق مستندات</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-16 border-dashed border-slate-600 flex-col">
                  <File className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-400">شهادة إتمام</span>
                </Button>
                <Button variant="outline" className="h-16 border-dashed border-slate-600 flex-col">
                  <FileText className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-400">فاتورة</span>
                </Button>
              </div>
              {fieldReport.documents.length > 0 && (
                <div className="mt-2 space-y-1">
                  {fieldReport.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-green-500/10 rounded text-xs text-green-400">
                      <Check className="w-3 h-3" />
                      {doc.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-slate-300">ملاحظات إضافية</Label>
              <Textarea
                value={fieldReport.notes}
                onChange={(e) => setFieldReport({...fieldReport, notes: e.target.value})}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                rows={2}
              />
            </div>

            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={submitReport}>
              <Send className="w-4 h-4 ml-2" />
              إرسال التقرير
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}