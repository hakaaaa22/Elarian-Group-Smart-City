import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Target, Plus, CheckCircle, Clock, AlertTriangle, Users, Calendar,
  ChevronDown, ChevronRight, Link2, Bell, Edit, Trash2, Filter,
  BarChart3, TrendingUp, User, Flag, GitBranch, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// بيانات المهام
const initialTasks = [
  {
    id: 't1', title: 'فحص مركبات الأسطول', status: 'in_progress', priority: 'high',
    assignee: { id: 'u1', name: 'أحمد محمد', avatar: 'أ' },
    dueDate: '2024-12-06', progress: 60, module: 'fleet',
    subtasks: [
      { id: 'st1', title: 'فحص المحركات', status: 'completed', assignee: 'أحمد' },
      { id: 'st2', title: 'فحص الإطارات', status: 'in_progress', assignee: 'محمد' },
      { id: 'st3', title: 'فحص الفرامل', status: 'pending', assignee: 'خالد' },
    ],
    dependencies: [],
  },
  {
    id: 't2', title: 'تحديث تقرير النفايات', status: 'pending', priority: 'medium',
    assignee: { id: 'u2', name: 'سارة خالد', avatar: 'س' },
    dueDate: '2024-12-08', progress: 0, module: 'waste',
    subtasks: [],
    dependencies: ['t1'],
  },
  {
    id: 't3', title: 'صيانة الحساسات', status: 'completed', priority: 'low',
    assignee: { id: 'u3', name: 'محمد علي', avatar: 'م' },
    dueDate: '2024-12-04', progress: 100, module: 'devices',
    subtasks: [],
    dependencies: [],
  },
];

const users = [
  { id: 'u1', name: 'أحمد محمد', avatar: 'أ' },
  { id: 'u2', name: 'سارة خالد', avatar: 'س' },
  { id: 'u3', name: 'محمد علي', avatar: 'م' },
];

export default function AdvancedTaskManager() {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTab, setActiveTab] = useState('list');
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showSubtaskDialog, setShowSubtaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState(['t1']);
  const [filter, setFilter] = useState({ status: 'all', priority: 'all' });
  const [newTask, setNewTask] = useState({
    title: '', assignee: '', priority: 'medium', dueDate: '', dependencies: [], module: 'general'
  });
  const [newSubtask, setNewSubtask] = useState({ title: '', assignee: '' });

  // إحصائيات سريعة
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length,
  };

  const toggleExpand = (taskId) => {
    setExpandedTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const updateTaskStatus = (taskId, status) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const progress = status === 'completed' ? 100 : status === 'in_progress' ? 50 : 0;
        return { ...t, status, progress };
      }
      return t;
    }));
    toast.success('تم تحديث حالة المهمة');
    
    // إشعار بتحديث الحالة
    sendNotification('status_update', taskId);
  };

  const updateSubtaskStatus = (taskId, subtaskId, status) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const subtasks = t.subtasks.map(st => st.id === subtaskId ? { ...st, status } : st);
        const completedCount = subtasks.filter(st => st.status === 'completed').length;
        const progress = Math.round((completedCount / subtasks.length) * 100);
        return { ...t, subtasks, progress };
      }
      return t;
    }));
  };

  const addTask = () => {
    if (!newTask.title) {
      toast.error('يرجى إدخال عنوان المهمة');
      return;
    }
    const task = {
      id: `t${Date.now()}`,
      ...newTask,
      status: 'pending',
      progress: 0,
      subtasks: [],
      assignee: users.find(u => u.id === newTask.assignee) || null,
    };
    setTasks(prev => [...prev, task]);
    setShowTaskDialog(false);
    setNewTask({ title: '', assignee: '', priority: 'medium', dueDate: '', dependencies: [], module: 'general' });
    toast.success('تم إنشاء المهمة');
  };

  const addSubtask = () => {
    if (!newSubtask.title || !selectedTask) return;
    setTasks(prev => prev.map(t => {
      if (t.id === selectedTask.id) {
        return {
          ...t,
          subtasks: [...t.subtasks, { id: `st${Date.now()}`, ...newSubtask, status: 'pending' }]
        };
      }
      return t;
    }));
    setShowSubtaskDialog(false);
    setNewSubtask({ title: '', assignee: '' });
    toast.success('تم إضافة المهمة الفرعية');
  };

  const sendNotification = (type, taskId) => {
    // محاكاة إرسال إشعار
    console.log(`Notification: ${type} for task ${taskId}`);
  };

  const checkDueDateAlerts = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    tasks.forEach(task => {
      if (task.status !== 'completed') {
        const dueDate = new Date(task.dueDate);
        if (dueDate <= tomorrow) {
          toast.warning(`تنبيه: موعد استحقاق "${task.title}" قريب!`);
        }
      }
    });
  };

  const filteredTasks = tasks.filter(t => {
    if (filter.status !== 'all' && t.status !== filter.status) return false;
    if (filter.priority !== 'all' && t.priority !== filter.priority) return false;
    return true;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'amber';
      default: return 'slate';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'cyan';
      default: return 'slate';
    }
  };

  const canStartTask = (task) => {
    if (task.dependencies.length === 0) return true;
    return task.dependencies.every(depId => {
      const dep = tasks.find(t => t.id === depId);
      return dep?.status === 'completed';
    });
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          إدارة المهام المتقدمة
        </h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="border-amber-500 text-amber-400" onClick={checkDueDateAlerts}>
            <Bell className="w-4 h-4 ml-1" />
            فحص التنبيهات
          </Button>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowTaskDialog(true)}>
            <Plus className="w-4 h-4 ml-1" />
            مهمة جديدة
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-3 text-center">
            <Target className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.total}</p>
            <p className="text-slate-400 text-xs">إجمالي المهام</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.completed}</p>
            <p className="text-green-400 text-xs">مكتملة</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.inProgress}</p>
            <p className="text-cyan-400 text-xs">قيد التنفيذ</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.overdue}</p>
            <p className="text-red-400 text-xs">متأخرة</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Select value={filter.status} onValueChange={(v) => setFilter(prev => ({ ...prev, status: v }))}>
          <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white h-8">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="pending">قيد الانتظار</SelectItem>
            <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
            <SelectItem value="completed">مكتملة</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filter.priority} onValueChange={(v) => setFilter(prev => ({ ...prev, priority: v }))}>
          <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white h-8">
            <SelectValue placeholder="الأولوية" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأولويات</SelectItem>
            <SelectItem value="high">عالي</SelectItem>
            <SelectItem value="medium">متوسط</SelectItem>
            <SelectItem value="low">منخفض</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="list" className="data-[state=active]:bg-purple-500/20">
            <Target className="w-4 h-4 ml-1" />
            قائمة المهام
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-cyan-500/20">
            <BarChart3 className="w-4 h-4 ml-1" />
            لوحة التتبع
          </TabsTrigger>
          <TabsTrigger value="dependencies" className="data-[state=active]:bg-amber-500/20">
            <GitBranch className="w-4 h-4 ml-1" />
            التبعيات
          </TabsTrigger>
        </TabsList>

        {/* Task List Tab */}
        <TabsContent value="list" className="mt-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-3 pr-2">
              <AnimatePresence>
                {filteredTasks.map(task => (
                  <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className={`glass-card border-${getStatusColor(task.status)}-500/30 bg-[#0f1629]/80`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <button onClick={() => task.subtasks.length > 0 && toggleExpand(task.id)} className="mt-1">
                              {task.subtasks.length > 0 ? (
                                expandedTasks.includes(task.id) ? 
                                  <ChevronDown className="w-4 h-4 text-slate-400" /> : 
                                  <ChevronRight className="w-4 h-4 text-slate-400" />
                              ) : <div className="w-4" />}
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className={`text-white font-medium ${task.status === 'completed' ? 'line-through opacity-50' : ''}`}>
                                  {task.title}
                                </p>
                                {!canStartTask(task) && (
                                  <Badge className="bg-amber-500/20 text-amber-400 text-xs">
                                    <Link2 className="w-3 h-3 ml-1" />
                                    يعتمد على مهام أخرى
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`bg-${getPriorityColor(task.priority)}-500/20 text-${getPriorityColor(task.priority)}-400`}>
                                  {task.priority === 'high' ? 'عالي' : task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                                </Badge>
                                <Badge className="bg-slate-700 text-slate-300">{task.module}</Badge>
                                {task.assignee && (
                                  <span className="text-slate-400 text-xs flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {task.assignee.name}
                                  </span>
                                )}
                                <span className="text-slate-500 text-xs flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {task.dueDate}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select value={task.status} onValueChange={(v) => updateTaskStatus(task.id, v)}>
                              <SelectTrigger className={`w-28 h-7 bg-${getStatusColor(task.status)}-500/20 border-${getStatusColor(task.status)}-500/30 text-${getStatusColor(task.status)}-400 text-xs`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">قيد الانتظار</SelectItem>
                                <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                                <SelectItem value="completed">مكتمل</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-400" onClick={() => { setSelectedTask(task); setShowSubtaskDialog(true); }}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="flex items-center gap-2 mb-2">
                          <Progress value={task.progress} className="h-2 flex-1" />
                          <span className="text-slate-400 text-xs">{task.progress}%</span>
                        </div>

                        {/* Subtasks */}
                        {expandedTasks.includes(task.id) && task.subtasks.length > 0 && (
                          <div className="mr-6 mt-3 pt-3 border-t border-slate-700/50 space-y-2">
                            {task.subtasks.map(subtask => (
                              <div key={subtask.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                                <div className="flex items-center gap-2">
                                  <button onClick={() => updateSubtaskStatus(task.id, subtask.id, subtask.status === 'completed' ? 'pending' : 'completed')}>
                                    <CheckCircle className={`w-4 h-4 ${subtask.status === 'completed' ? 'text-green-400' : 'text-slate-500'}`} />
                                  </button>
                                  <span className={`text-sm ${subtask.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>
                                    {subtask.title}
                                  </span>
                                </div>
                                <span className="text-slate-500 text-xs">{subtask.assignee}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            {['pending', 'in_progress', 'completed'].map(status => (
              <Card key={status} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader className="pb-2">
                  <CardTitle className={`text-sm text-${getStatusColor(status)}-400`}>
                    {status === 'pending' ? 'قيد الانتظار' : status === 'in_progress' ? 'قيد التنفيذ' : 'مكتملة'}
                    <Badge className="mr-2 bg-slate-700 text-slate-300">{tasks.filter(t => t.status === status).length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tasks.filter(t => t.status === status).map(task => (
                      <div key={task.id} className="p-2 bg-slate-800/50 rounded">
                        <p className="text-white text-sm">{task.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <Badge className={`bg-${getPriorityColor(task.priority)}-500/20 text-${getPriorityColor(task.priority)}-400 text-xs`}>
                            {task.priority}
                          </Badge>
                          {task.assignee && (
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-xs">{task.assignee.avatar}</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Dependencies Tab */}
        <TabsContent value="dependencies" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4">
              <div className="space-y-3">
                {tasks.filter(t => t.dependencies.length > 0).map(task => (
                  <div key={task.id} className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <GitBranch className="w-4 h-4 text-amber-400" />
                      <span className="text-white font-medium">{task.title}</span>
                    </div>
                    <div className="mr-6 space-y-1">
                      <p className="text-slate-500 text-xs">يعتمد على:</p>
                      {task.dependencies.map(depId => {
                        const dep = tasks.find(t => t.id === depId);
                        return (
                          <div key={depId} className="flex items-center gap-2">
                            <CheckCircle className={`w-3 h-3 ${dep?.status === 'completed' ? 'text-green-400' : 'text-slate-500'}`} />
                            <span className={`text-sm ${dep?.status === 'completed' ? 'text-green-400' : 'text-slate-400'}`}>
                              {dep?.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {tasks.filter(t => t.dependencies.length > 0).length === 0 && (
                  <p className="text-slate-500 text-center py-8">لا توجد تبعيات بين المهام</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">مهمة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-400">العنوان</Label>
              <Input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400">تعيين لـ</Label>
                <Select value={newTask.assignee} onValueChange={(v) => setNewTask({ ...newTask, assignee: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                    <SelectValue placeholder="اختر" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-400">الأولوية</Label>
                <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">عالي</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="low">منخفض</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-slate-400">تاريخ الاستحقاق</Label>
              <Input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-2" />
            </div>
            <div>
              <Label className="text-slate-400">يعتمد على (اختياري)</Label>
              <Select value="" onValueChange={(v) => setNewTask({ ...newTask, dependencies: [...newTask.dependencies, v] })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                  <SelectValue placeholder="اختر مهمة" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.filter(t => !newTask.dependencies.includes(t.id)).map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newTask.dependencies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newTask.dependencies.map(depId => (
                    <Badge key={depId} className="bg-amber-500/20 text-amber-400">
                      {tasks.find(t => t.id === depId)?.title}
                      <button onClick={() => setNewTask({ ...newTask, dependencies: newTask.dependencies.filter(d => d !== depId) })} className="mr-1">×</button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="border-slate-600 text-slate-400" onClick={() => setShowTaskDialog(false)}>إلغاء</Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={addTask}>إنشاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subtask Dialog */}
      <Dialog open={showSubtaskDialog} onOpenChange={setShowSubtaskDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">إضافة مهمة فرعية</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-400">العنوان</Label>
              <Input value={newSubtask.title} onChange={(e) => setNewSubtask({ ...newSubtask, title: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-2" />
            </div>
            <div>
              <Label className="text-slate-400">المسؤول</Label>
              <Input value={newSubtask.assignee} onChange={(e) => setNewSubtask({ ...newSubtask, assignee: e.target.value })} className="bg-slate-800/50 border-slate-700 text-white mt-2" />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="border-slate-600 text-slate-400" onClick={() => setShowSubtaskDialog(false)}>إلغاء</Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={addSubtask}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}