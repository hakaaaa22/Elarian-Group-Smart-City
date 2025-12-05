import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Clock, Calendar, MapPin, CheckCircle, AlertTriangle, FileText,
  User, Phone, Mail, Star, TrendingUp, ClipboardList, Wrench, Target,
  Play, Pause, Timer, Award, BarChart3, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

// الموظفين
const employees = [
  { id: 1, name: 'محمد أحمد', role: 'فني صيانة', status: 'working', location: 'موقع A', checkIn: '08:00', phone: '+966 5XX XXX', rating: 4.8, tasksCompleted: 12, tasksTotal: 15 },
  { id: 2, name: 'خالد السعيد', role: 'سائق', status: 'working', location: 'الطريق', checkIn: '07:30', phone: '+966 5XX XXX', rating: 4.5, tasksCompleted: 8, tasksTotal: 10 },
  { id: 3, name: 'عبدالله فهد', role: 'فني صيانة', status: 'break', location: 'استراحة', checkIn: '08:15', phone: '+966 5XX XXX', rating: 4.9, tasksCompleted: 15, tasksTotal: 15 },
  { id: 4, name: 'فيصل عمر', role: 'مشرف', status: 'working', location: 'المكتب', checkIn: '07:45', phone: '+966 5XX XXX', rating: 4.7, tasksCompleted: 6, tasksTotal: 8 },
  { id: 5, name: 'سعود الشمري', role: 'فني صيانة', status: 'absent', location: '-', checkIn: '-', phone: '+966 5XX XXX', rating: 4.2, tasksCompleted: 0, tasksTotal: 5 },
];

// أوامر العمل
const workOrders = [
  { id: 'WO-001', title: 'صيانة مكيف - فيلا الورود', assignee: 'محمد أحمد', priority: 'high', status: 'in_progress', estimatedTime: '2 ساعة', location: 'حي الورود' },
  { id: 'WO-002', title: 'فحص دوري - المبنى الإداري', assignee: 'عبدالله فهد', priority: 'medium', status: 'completed', estimatedTime: '3 ساعات', location: 'وسط المدينة' },
  { id: 'WO-003', title: 'إصلاح طارئ - تسريب مياه', assignee: null, priority: 'urgent', status: 'pending', estimatedTime: '1 ساعة', location: 'حي النخيل' },
  { id: 'WO-004', title: 'تركيب كاميرا جديدة', assignee: 'محمد أحمد', priority: 'low', status: 'scheduled', estimatedTime: '1.5 ساعة', location: 'المستودع' },
];

// قائمة المهام (Checklist)
const jobChecklist = [
  { id: 1, task: 'فحص الفلاتر', completed: true },
  { id: 2, task: 'قياس درجة الحرارة', completed: true },
  { id: 3, task: 'فحص مستوى الفريون', completed: false },
  { id: 4, task: 'تنظيف المبادل الحراري', completed: false },
  { id: 5, task: 'اختبار التشغيل', completed: false },
  { id: 6, task: 'توثيق الصور', completed: false },
];

export default function HRWorkforce() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [checklist, setChecklist] = useState(jobChecklist);

  const stats = {
    totalEmployees: employees.length,
    present: employees.filter(e => e.status !== 'absent').length,
    onTask: employees.filter(e => e.status === 'working').length,
    pendingOrders: workOrders.filter(w => w.status === 'pending').length,
  };

  const toggleCheckItem = (id) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'working': return { label: 'يعمل', color: 'green' };
      case 'break': return { label: 'استراحة', color: 'amber' };
      case 'absent': return { label: 'غائب', color: 'red' };
      default: return { label: status, color: 'slate' };
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
              <Users className="w-8 h-8 text-purple-400" />
              إدارة القوى العاملة
            </h1>
            <p className="text-slate-400 mt-1">الحضور والمهام وأوامر العمل</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'إجمالي الموظفين', value: stats.totalEmployees, icon: Users, color: 'cyan' },
          { label: 'الحاضرين', value: stats.present, icon: CheckCircle, color: 'green' },
          { label: 'في مهمة', value: stats.onTask, icon: Wrench, color: 'amber' },
          { label: 'أوامر معلقة', value: stats.pendingOrders, icon: ClipboardList, color: 'red' },
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
          <TabsTrigger value="attendance" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Clock className="w-4 h-4 ml-1" />
            الحضور
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Target className="w-4 h-4 ml-1" />
            تعيين المهام
          </TabsTrigger>
          <TabsTrigger value="workorders" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <ClipboardList className="w-4 h-4 ml-1" />
            أوامر العمل
          </TabsTrigger>
          <TabsTrigger value="tracking" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <MapPin className="w-4 h-4 ml-1" />
            التتبع
          </TabsTrigger>
          <TabsTrigger value="checklist" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <FileText className="w-4 h-4 ml-1" />
            قوائم الفحص
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map(emp => {
              const statusConfig = getStatusConfig(emp.status);
              return (
                <Card key={emp.id} className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 ${emp.status === 'absent' ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className={`bg-${statusConfig.color}-500/20 text-${statusConfig.color}-400`}>
                          {emp.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-white font-bold">{emp.name}</p>
                        <p className="text-slate-400 text-sm">{emp.role}</p>
                      </div>
                      <Badge className={`bg-${statusConfig.color}-500/20 text-${statusConfig.color}-400`}>
                        {statusConfig.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                      <div className="p-2 bg-slate-800/50 rounded">
                        <Clock className="w-4 h-4 text-cyan-400 mx-auto" />
                        <p className="text-white text-sm">{emp.checkIn}</p>
                        <p className="text-slate-500 text-[10px]">دخول</p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded">
                        <MapPin className="w-4 h-4 text-green-400 mx-auto" />
                        <p className="text-white text-sm truncate">{emp.location}</p>
                        <p className="text-slate-500 text-[10px]">الموقع</p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded">
                        <Star className="w-4 h-4 text-amber-400 mx-auto" />
                        <p className="text-white text-sm">{emp.rating}</p>
                        <p className="text-slate-500 text-[10px]">التقييم</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400 text-sm">المهام المكتملة</span>
                        <span className="text-white text-sm">{emp.tasksCompleted}/{emp.tasksTotal}</span>
                      </div>
                      <Progress value={(emp.tasksCompleted / emp.tasksTotal) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="workorders" className="space-y-4 mt-4">
          <div className="space-y-3">
            {workOrders.map(order => {
              const priorityConfig = getPriorityConfig(order.priority);
              return (
                <Card key={order.id} className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 ${order.priority === 'urgent' ? 'border-red-500/50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${priorityConfig.color}-500/20`}>
                          <ClipboardList className={`w-5 h-5 text-${priorityConfig.color}-400`} />
                        </div>
                        <div>
                          <p className="text-white font-bold">{order.id}</p>
                          <p className="text-slate-400 text-sm">{order.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`bg-${priorityConfig.color}-500/20 text-${priorityConfig.color}-400`}>
                          {priorityConfig.label}
                        </Badge>
                        <Badge className={
                          order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          order.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                          order.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-slate-500/20 text-slate-400'
                        }>
                          {order.status === 'completed' ? 'مكتمل' : order.status === 'in_progress' ? 'قيد التنفيذ' : order.status === 'pending' ? 'معلق' : 'مجدول'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-slate-400">
                        <span><User className="w-3 h-3 inline ml-1" />{order.assignee || 'غير معين'}</span>
                        <span><MapPin className="w-3 h-3 inline ml-1" />{order.location}</span>
                        <span><Timer className="w-3 h-3 inline ml-1" />{order.estimatedTime}</span>
                      </div>
                      {!order.assignee && (
                        <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                          تعيين
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                قائمة فحص صيانة المكيف
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checklist.map(item => (
                  <div 
                    key={item.id} 
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      item.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800/30 border-slate-700 hover:border-cyan-500/50'
                    }`}
                    onClick={() => toggleCheckItem(item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox checked={item.completed} />
                      <span className={item.completed ? 'text-green-400 line-through' : 'text-white'}>
                        {item.task}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">التقدم</span>
                  <span className="text-white">{checklist.filter(i => i.completed).length}/{checklist.length}</span>
                </div>
                <Progress value={(checklist.filter(i => i.completed).length / checklist.length) * 100} className="h-3" />
              </div>
              <Button className="w-full mt-4 bg-green-600 hover:bg-green-700" disabled={checklist.some(i => !i.completed)}>
                <CheckCircle className="w-4 h-4 ml-2" />
                إكمال وإرسال التقرير
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-6">
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-white text-lg mb-2">تتبع الفنيين في الوقت الحقيقي</p>
                <p className="text-slate-400">عرض مواقع الفنيين على الخريطة</p>
                <Button className="mt-4 bg-cyan-600 hover:bg-cyan-700">
                  فتح الخريطة
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">تعيين المهام للموظفين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {employees.filter(e => e.status !== 'absent').map(emp => (
                  <div key={emp.id} className="p-4 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-cyan-500/20 text-cyan-400">{emp.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium">{emp.name}</p>
                          <p className="text-slate-400 text-sm">{emp.role}</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Target className="w-3 h-3 ml-1" />
                        تعيين
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>المهام الحالية: {emp.tasksTotal - emp.tasksCompleted}</span>
                      <span>التحميل: {Math.round(((emp.tasksTotal - emp.tasksCompleted) / 5) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}