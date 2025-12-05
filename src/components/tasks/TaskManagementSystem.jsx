import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  ClipboardList, Plus, Calendar, User, Users, Clock, CheckCircle, XCircle,
  AlertTriangle, Filter, Search, MoreVertical, Edit, Trash2, Link
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const teams = ['الدعم الفني', 'خدمة العملاء', 'المبيعات', 'الصيانة', 'الجودة'];
const agents = ['أحمد محمد', 'سارة علي', 'خالد السعيد', 'فاطمة أحمد', 'عبدالله فهد'];

export default function TaskManagementSystem({ ticketId, customerName }) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assigned_to: '',
    assigned_team: '',
    due_date: '',
    category: 'support',
    related_ticket_id: ticketId || '',
    related_customer: customerName || '',
  });

  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-created_date', 100),
  });

  const createTask = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowCreateDialog(false);
      setNewTask({ title: '', description: '', priority: 'medium', assigned_to: '', assigned_team: '', due_date: '', category: 'support', related_ticket_id: '', related_customer: '' });
      toast.success('تم إنشاء المهمة بنجاح');
    }
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('تم تحديث المهمة');
    }
  });

  const deleteTask = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('تم حذف المهمة');
    }
  });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesTab = activeTab === 'all' || task.status === activeTab;
    return matchesSearch && matchesPriority && matchesTab;
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length,
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400';
      case 'high': return 'bg-amber-500/20 text-amber-400';
      case 'medium': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-green-500/20 text-green-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400';
      case 'cancelled': return 'bg-slate-500/20 text-slate-400';
      default: return 'bg-amber-500/20 text-amber-400';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-cyan-400" />
          إدارة المهام
        </h3>
        <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 ml-1" />
          مهمة جديدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { label: 'الكل', value: stats.total, color: 'cyan' },
          { label: 'معلقة', value: stats.pending, color: 'amber' },
          { label: 'قيد التنفيذ', value: stats.inProgress, color: 'blue' },
          { label: 'مكتملة', value: stats.completed, color: 'green' },
          { label: 'متأخرة', value: stats.overdue, color: 'red' },
        ].map(stat => (
          <Card key={stat.label} className={`bg-${stat.color}-500/10 border-${stat.color}-500/30`}>
            <CardContent className="p-3 text-center">
              <p className={`text-xl font-bold text-${stat.color}-400`}>{stat.value}</p>
              <p className="text-slate-400 text-xs">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في المهام..."
            className="pr-10 bg-slate-800/50 border-slate-700 text-white"
          />
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="الأولوية" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="urgent">عاجل</SelectItem>
            <SelectItem value="high">عالي</SelectItem>
            <SelectItem value="medium">متوسط</SelectItem>
            <SelectItem value="low">منخفض</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="pending">معلقة</TabsTrigger>
          <TabsTrigger value="in_progress">قيد التنفيذ</TabsTrigger>
          <TabsTrigger value="completed">مكتملة</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {filteredTasks.map(task => (
                <Card key={task.id} className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-medium">{task.title}</p>
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status === 'completed' ? 'مكتمل' : task.status === 'in_progress' ? 'قيد التنفيذ' : 'معلق'}
                          </Badge>
                        </div>
                        {task.description && <p className="text-slate-400 text-sm">{task.description}</p>}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-slate-800 border-slate-700">
                          <DropdownMenuItem onClick={() => updateTask.mutate({ id: task.id, data: { status: 'in_progress' } })}>
                            بدء التنفيذ
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateTask.mutate({ id: task.id, data: { status: 'completed', completion_date: new Date().toISOString() } })}>
                            <CheckCircle className="w-4 h-4 ml-1 text-green-400" />
                            إكمال
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteTask.mutate(task.id)} className="text-red-400">
                            <Trash2 className="w-4 h-4 ml-1" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      {task.assigned_to && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {task.assigned_to}
                        </span>
                      )}
                      {task.assigned_team && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {task.assigned_team}
                        </span>
                      )}
                      {task.due_date && (
                        <span className={`flex items-center gap-1 ${new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'text-red-400' : ''}`}>
                          <Calendar className="w-3 h-3" />
                          {new Date(task.due_date).toLocaleDateString('ar-SA')}
                        </span>
                      )}
                      {task.related_ticket_id && (
                        <span className="flex items-center gap-1 text-cyan-400">
                          <Link className="w-3 h-3" />
                          تذكرة #{task.related_ticket_id}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredTasks.length === 0 && (
                <p className="text-slate-400 text-center py-8">لا توجد مهام</p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">إنشاء مهمة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="عنوان المهمة"
              className="bg-slate-800/50 border-slate-700 text-white"
            />
            <Textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="وصف المهمة"
              className="bg-slate-800/50 border-slate-700 text-white h-20"
            />
            <div className="grid grid-cols-2 gap-2">
              <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="الأولوية" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="low">منخفض</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="high">عالي</SelectItem>
                  <SelectItem value="urgent">عاجل</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newTask.category} onValueChange={(v) => setNewTask({ ...newTask, category: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="التصنيف" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="support">دعم</SelectItem>
                  <SelectItem value="maintenance">صيانة</SelectItem>
                  <SelectItem value="follow_up">متابعة</SelectItem>
                  <SelectItem value="escalation">تصعيد</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={newTask.assigned_to} onValueChange={(v) => setNewTask({ ...newTask, assigned_to: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="الوكيل" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {agents.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={newTask.assigned_team} onValueChange={(v) => setNewTask({ ...newTask, assigned_team: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="الفريق" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {teams.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Input
              type="datetime-local"
              value={newTask.due_date}
              onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              className="bg-slate-800/50 border-slate-700 text-white"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={newTask.related_ticket_id}
                onChange={(e) => setNewTask({ ...newTask, related_ticket_id: e.target.value })}
                placeholder="رقم التذكرة (اختياري)"
                className="bg-slate-800/50 border-slate-700 text-white"
              />
              <Input
                value={newTask.related_customer}
                onChange={(e) => setNewTask({ ...newTask, related_customer: e.target.value })}
                placeholder="اسم العميل (اختياري)"
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={() => createTask.mutate(newTask)} disabled={!newTask.title || createTask.isPending}>
              {createTask.isPending ? 'جاري الإنشاء...' : 'إنشاء المهمة'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}