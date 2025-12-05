import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, User, Clock, MapPin, Wrench, ChevronRight, ChevronLeft,
  Plus, Filter, Search, Phone, Mail, Star, CheckCircle, AlertTriangle,
  Settings, RefreshCw, Eye, Edit, Trash2, Users, Zap, TrendingUp
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// بيانات الفنيين
const initialTechnicians = [
  {
    id: 1,
    name: 'محمد أحمد',
    specialty: 'تكييف وتبريد',
    phone: '+966 5XX XXX 001',
    email: 'mohammad@example.com',
    location: 'المنطقة الشرقية',
    rating: 4.8,
    completedTasks: 156,
    status: 'available',
    workload: 60,
    avatar: 'م'
  },
  {
    id: 2,
    name: 'خالد العلي',
    specialty: 'كاميرات ومراقبة',
    phone: '+966 5XX XXX 002',
    email: 'khaled@example.com',
    location: 'المنطقة الغربية',
    rating: 4.5,
    completedTasks: 98,
    status: 'busy',
    workload: 85,
    avatar: 'خ'
  },
  {
    id: 3,
    name: 'فهد السعيد',
    specialty: 'أقفال ذكية',
    phone: '+966 5XX XXX 003',
    email: 'fahad@example.com',
    location: 'المنطقة الوسطى',
    rating: 4.9,
    completedTasks: 203,
    status: 'available',
    workload: 40,
    avatar: 'ف'
  },
  {
    id: 4,
    name: 'عبدالله محمد',
    specialty: 'مركبات وأسطول',
    phone: '+966 5XX XXX 004',
    email: 'abdullah@example.com',
    location: 'المنطقة الشمالية',
    rating: 4.6,
    completedTasks: 87,
    status: 'off',
    workload: 0,
    avatar: 'ع'
  },
  {
    id: 5,
    name: 'سعد الغامدي',
    specialty: 'كهرباء',
    phone: '+966 5XX XXX 005',
    email: 'saad@example.com',
    location: 'المنطقة الشرقية',
    rating: 4.7,
    completedTasks: 134,
    status: 'available',
    workload: 30,
    avatar: 'س'
  }
];

// بيانات المهام
const initialTasks = [
  {
    id: 1,
    title: 'صيانة مكيف غرفة المعيشة',
    device: 'مكيف سبليت',
    location: 'فيلا 12، المنطقة الشرقية',
    priority: 'high',
    type: 'corrective',
    estimatedDuration: 2,
    scheduledDate: '2024-12-04',
    scheduledTime: '09:00',
    technicianId: 1,
    status: 'scheduled'
  },
  {
    id: 2,
    title: 'فحص كاميرا المدخل',
    device: 'كاميرا IP',
    location: 'مبنى 5، المنطقة الغربية',
    priority: 'medium',
    type: 'inspection',
    estimatedDuration: 1,
    scheduledDate: '2024-12-04',
    scheduledTime: '11:00',
    technicianId: 2,
    status: 'in_progress'
  },
  {
    id: 3,
    title: 'إصلاح قفل ذكي',
    device: 'قفل باب',
    location: 'مكتب 8، المنطقة الوسطى',
    priority: 'critical',
    type: 'emergency',
    estimatedDuration: 1.5,
    scheduledDate: '2024-12-04',
    scheduledTime: '14:00',
    technicianId: null,
    status: 'pending'
  },
  {
    id: 4,
    title: 'صيانة دورية للمركبة',
    device: 'سيارة نقل #3',
    location: 'ورشة المنطقة الشمالية',
    priority: 'low',
    type: 'preventive',
    estimatedDuration: 3,
    scheduledDate: '2024-12-05',
    scheduledTime: '08:00',
    technicianId: 4,
    status: 'scheduled'
  },
  {
    id: 5,
    title: 'تركيب نظام إضاءة ذكي',
    device: 'إضاءة LED',
    location: 'صالة 3، المنطقة الشرقية',
    priority: 'medium',
    type: 'installation',
    estimatedDuration: 4,
    scheduledDate: '2024-12-05',
    scheduledTime: '10:00',
    technicianId: null,
    status: 'pending'
  }
];

const priorityColors = {
  low: 'bg-blue-500/20 text-blue-400',
  medium: 'bg-amber-500/20 text-amber-400',
  high: 'bg-orange-500/20 text-orange-400',
  critical: 'bg-red-500/20 text-red-400'
};

const statusColors = {
  available: 'bg-green-500/20 text-green-400',
  busy: 'bg-amber-500/20 text-amber-400',
  off: 'bg-slate-500/20 text-slate-400'
};

const taskStatusColors = {
  pending: 'bg-slate-500/20 text-slate-400',
  scheduled: 'bg-blue-500/20 text-blue-400',
  in_progress: 'bg-amber-500/20 text-amber-400',
  completed: 'bg-green-500/20 text-green-400'
};

export default function TechnicianScheduling() {
  const [technicians, setTechnicians] = useState(initialTechnicians);
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTechnicianDialog, setShowTechnicianDialog] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);

  // تصفية الفنيين
  const filteredTechnicians = useMemo(() => {
    return technicians.filter(tech => {
      const matchesSearch = tech.name.includes(searchQuery) || tech.specialty.includes(searchQuery);
      const matchesSpecialty = filterSpecialty === 'all' || tech.specialty.includes(filterSpecialty);
      return matchesSearch && matchesSpecialty;
    });
  }, [technicians, searchQuery, filterSpecialty]);

  // المهام حسب التاريخ
  const tasksByDate = useMemo(() => {
    return tasks.filter(task => task.scheduledDate === selectedDate);
  }, [tasks, selectedDate]);

  // المهام غير المعينة
  const unassignedTasks = useMemo(() => {
    return tasks.filter(task => !task.technicianId);
  }, [tasks]);

  // اقتراح الفني الأمثل
  const suggestTechnician = (task) => {
    const available = technicians.filter(t => t.status === 'available');
    
    // ترتيب حسب التخصص والموقع والحمل
    const scored = available.map(tech => {
      let score = 0;
      // مطابقة التخصص
      if (task.device?.includes('مكيف') && tech.specialty.includes('تكييف')) score += 30;
      if (task.device?.includes('كاميرا') && tech.specialty.includes('كاميرا')) score += 30;
      if (task.device?.includes('قفل') && tech.specialty.includes('أقفال')) score += 30;
      if (task.device?.includes('سيارة') && tech.specialty.includes('مركبات')) score += 30;
      
      // الموقع
      if (task.location?.includes(tech.location)) score += 20;
      
      // الحمل (أقل أفضل)
      score += (100 - tech.workload) * 0.3;
      
      // التقييم
      score += tech.rating * 5;
      
      return { ...tech, score };
    });

    return scored.sort((a, b) => b.score - a.score);
  };

  // تعيين مهمة لفني
  const assignTask = (taskId, technicianId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, technicianId, status: 'scheduled' }
        : task
    ));
    
    // تحديث حمل الفني
    setTechnicians(technicians.map(tech =>
      tech.id === technicianId
        ? { ...tech, workload: Math.min(100, tech.workload + 15) }
        : tech
    ));
    
    toast.success('تم تعيين المهمة');
    setShowAssignDialog(false);
  };

  // السحب والإفلات
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const taskId = parseInt(draggableId.replace('task-', ''));
    
    // إذا تم السحب إلى فني
    if (destination.droppableId.startsWith('tech-')) {
      const techId = parseInt(destination.droppableId.replace('tech-', ''));
      assignTask(taskId, techId);
    }
  };

  // تغيير التاريخ
  const changeDate = (days) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const openAssignDialog = (task) => {
    setSelectedTask(task);
    setShowAssignDialog(true);
  };

  const specialties = [...new Set(technicians.map(t => t.specialty))];

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Calendar className="w-8 h-8 text-green-400" />
              جدولة الفنيين
            </h1>
            <p className="text-slate-400 mt-1">إدارة المهام وتعيين الفنيين</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-600">
              <RefreshCw className="w-4 h-4 ml-2" />
              تحديث
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 ml-2" />
              مهمة جديدة
            </Button>
          </div>
        </div>
      </motion.div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'الفنيون المتاحون', value: technicians.filter(t => t.status === 'available').length, icon: Users, color: 'green' },
          { label: 'المهام المعلقة', value: unassignedTasks.length, icon: AlertTriangle, color: 'amber' },
          { label: 'مهام اليوم', value: tasksByDate.length, icon: Calendar, color: 'cyan' },
          { label: 'معدل الإنجاز', value: '87%', icon: TrendingUp, color: 'purple' },
        ].map((stat, i) => (
          <Card key={i} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
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
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="calendar" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Calendar className="w-4 h-4 ml-2" />
            التقويم
          </TabsTrigger>
          <TabsTrigger value="technicians" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Users className="w-4 h-4 ml-2" />
            الفنيون
          </TabsTrigger>
          <TabsTrigger value="unassigned" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <AlertTriangle className="w-4 h-4 ml-2" />
            غير معينة ({unassignedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid lg:grid-cols-4 gap-4">
              {/* قائمة المهام غير المعينة */}
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    مهام بانتظار التعيين
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Droppable droppableId="unassigned">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-2 min-h-[200px]"
                      >
                        {unassignedTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={`task-${task.id}`} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-3 rounded-lg border ${
                                  snapshot.isDragging 
                                    ? 'border-cyan-500 bg-cyan-500/20' 
                                    : 'border-slate-700 bg-slate-800/50'
                                } cursor-grab`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-white text-sm font-medium truncate">{task.title}</span>
                                  <Badge className={priorityColors[task.priority]}>
                                    {task.priority === 'critical' ? 'حرج' : task.priority === 'high' ? 'عالي' : task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                                  </Badge>
                                </div>
                                <p className="text-slate-400 text-xs truncate">{task.location}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  <span className="text-slate-500 text-xs">{task.estimatedDuration} ساعة</span>
                                </div>
                                <Button
                                  size="sm"
                                  className="w-full mt-2 bg-cyan-600 hover:bg-cyan-700 h-7 text-xs"
                                  onClick={() => openAssignDialog(task)}
                                >
                                  <Zap className="w-3 h-3 ml-1" />
                                  تعيين تلقائي
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {unassignedTasks.length === 0 && (
                          <div className="text-center py-8 text-slate-500">
                            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                            <p className="text-sm">جميع المهام معينة</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>

              {/* التقويم والفنيين */}
              <div className="lg:col-span-3 space-y-4">
                {/* التاريخ */}
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="icon" onClick={() => changeDate(-1)}>
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                      <div className="text-center">
                        <p className="text-white text-lg font-bold">
                          {new Date(selectedDate).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-slate-400 text-sm">{tasksByDate.length} مهام مجدولة</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => changeDate(1)}>
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* الفنيون ومهامهم */}
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredTechnicians.map((tech) => {
                    const techTasks = tasksByDate.filter(t => t.technicianId === tech.id);
                    
                    return (
                      <Droppable key={tech.id} droppableId={`tech-${tech.id}`}>
                        {(provided, snapshot) => (
                          <Card 
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 transition-all ${
                              snapshot.isDraggingOver ? 'border-cyan-500 ring-2 ring-cyan-500/20' : ''
                            }`}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className={`${statusColors[tech.status].replace('bg-', 'bg-').replace('/20', '/40')} text-white`}>
                                      {tech.avatar}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="text-white font-bold">{tech.name}</h3>
                                    <p className="text-slate-400 text-xs">{tech.specialty}</p>
                                  </div>
                                </div>
                                <Badge className={statusColors[tech.status]}>
                                  {tech.status === 'available' ? 'متاح' : tech.status === 'busy' ? 'مشغول' : 'غير متاح'}
                                </Badge>
                              </div>
                              <div className="mt-2">
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                  <span>حمل العمل</span>
                                  <span>{tech.workload}%</span>
                                </div>
                                <Progress value={tech.workload} className="h-1" />
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-2 min-h-[100px]">
                              {techTasks.map((task) => (
                                <div key={task.id} className="p-2 bg-slate-800/50 rounded-lg border border-slate-700">
                                  <div className="flex items-center justify-between">
                                    <span className="text-white text-sm">{task.title}</span>
                                    <Badge className={taskStatusColors[task.status]}>
                                      {task.scheduledTime}
                                    </Badge>
                                  </div>
                                  <p className="text-slate-400 text-xs mt-1">{task.location}</p>
                                </div>
                              ))}
                              {techTasks.length === 0 && (
                                <p className="text-slate-500 text-center text-sm py-4">
                                  لا توجد مهام
                                </p>
                              )}
                              {provided.placeholder}
                            </CardContent>
                          </Card>
                        )}
                      </Droppable>
                    );
                  })}
                </div>
              </div>
            </div>
          </DragDropContext>
        </TabsContent>

        <TabsContent value="technicians" className="mt-4">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="بحث بالاسم أو التخصص..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
              <SelectTrigger className="w-48 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="التخصص" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">جميع التخصصات</SelectItem>
                {specialties.map(spec => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTechnicians.map((tech) => (
              <motion.div key={tech.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className={`${statusColors[tech.status].replace('bg-', 'bg-').replace('/20', '/40')} text-white text-lg`}>
                          {tech.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-bold">{tech.name}</h3>
                          <Badge className={statusColors[tech.status]}>
                            {tech.status === 'available' ? 'متاح' : tech.status === 'busy' ? 'مشغول' : 'غير متاح'}
                          </Badge>
                        </div>
                        <p className="text-cyan-400 text-sm">{tech.specialty}</p>
                        <p className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {tech.location}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-700">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 text-amber-400" />
                          <span className="text-white font-bold">{tech.rating}</span>
                        </div>
                        <p className="text-slate-400 text-xs">التقييم</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold">{tech.completedTasks}</p>
                        <p className="text-slate-400 text-xs">مهمة مكتملة</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold">{tech.workload}%</p>
                        <p className="text-slate-400 text-xs">الحمل</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1 border-slate-600">
                        <Phone className="w-3 h-3 ml-1" />
                        اتصال
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 border-slate-600">
                        <Eye className="w-3 h-3 ml-1" />
                        المهام
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="unassigned" className="mt-4">
          <div className="space-y-3">
            {unassignedTasks.map((task) => {
              const suggestions = suggestTechnician(task);
              
              return (
                <Card key={task.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-bold">{task.title}</h3>
                          <Badge className={priorityColors[task.priority]}>
                            {task.priority === 'critical' ? 'حرج' : task.priority === 'high' ? 'عالي' : task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm">{task.device}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{task.location}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{task.estimatedDuration} ساعة</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{task.scheduledDate}</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <p className="text-slate-400 text-xs mb-2">اقتراحات AI:</p>
                        <div className="flex gap-2">
                          {suggestions.slice(0, 2).map((tech) => (
                            <Button
                              key={tech.id}
                              size="sm"
                              variant="outline"
                              className="border-cyan-500/50 text-cyan-400"
                              onClick={() => assignTask(task.id, tech.id)}
                            >
                              <Avatar className="w-5 h-5 ml-1">
                                <AvatarFallback className="text-[10px] bg-cyan-500/20">{tech.avatar}</AvatarFallback>
                              </Avatar>
                              {tech.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {unassignedTasks.length === 0 && (
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-bold mb-2">ممتاز!</h3>
                  <p className="text-slate-400">جميع المهام تم تعيينها للفنيين</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* نافذة التعيين */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              تعيين فني للمهمة
            </DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <h4 className="text-white font-medium">{selectedTask.title}</h4>
                <p className="text-slate-400 text-sm">{selectedTask.location}</p>
              </div>

              <div>
                <Label className="text-slate-300 mb-2 block">الفنيون المقترحون (حسب AI)</Label>
                <div className="space-y-2">
                  {suggestTechnician(selectedTask).map((tech, idx) => (
                    <div
                      key={tech.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        idx === 0 
                          ? 'border-cyan-500/50 bg-cyan-500/10' 
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                      onClick={() => assignTask(selectedTask.id, tech.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-cyan-500/20 text-cyan-400">{tech.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-medium">{tech.name}</p>
                            <p className="text-slate-400 text-xs">{tech.specialty}</p>
                          </div>
                        </div>
                        {idx === 0 && (
                          <Badge className="bg-cyan-500/20 text-cyan-400">الأفضل</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400" />{tech.rating}
                        </span>
                        <span>حمل: {tech.workload}%</span>
                        <Badge className={statusColors[tech.status]}>{tech.status === 'available' ? 'متاح' : 'مشغول'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}