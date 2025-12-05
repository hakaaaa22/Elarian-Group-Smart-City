import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Users, MessageSquare, Share2, Bell, CheckCircle, Clock, User, Send,
  Link2, Copy, Mail, ExternalLink, Plus, X, Edit, Trash2, AlertTriangle,
  FileText, Lightbulb, Target, Calendar, Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

// بيانات التعليقات
const sampleComments = [
  { id: 1, user: 'أحمد محمد', avatar: 'أ', text: 'يجب التحقق من هذا التنبيه فوراً', time: '10:30', alertId: 'ALT001' },
  { id: 2, user: 'سارة خالد', avatar: 'س', text: 'تم التواصل مع الفني المختص', time: '10:45', alertId: 'ALT001' },
  { id: 3, user: 'محمد علي', avatar: 'م', text: 'المشكلة تتكرر كل أسبوع', time: '11:00', alertId: 'ALT001' },
];

// بيانات المهام
const sampleTasks = [
  { id: 1, title: 'فحص مركبة #3', assignee: 'أحمد محمد', status: 'pending', priority: 'high', dueDate: '2024-12-05', relatedAlert: 'ALT001' },
  { id: 2, title: 'مراجعة استهلاك الوقود', assignee: 'سارة خالد', status: 'in_progress', priority: 'medium', dueDate: '2024-12-06', relatedAlert: 'ALT002' },
  { id: 3, title: 'تحديث تقرير الأداء', assignee: 'محمد علي', status: 'completed', priority: 'low', dueDate: '2024-12-04', relatedAlert: null },
];

// التكاملات الخارجية
const integrations = [
  { id: 'slack', name: 'Slack', icon: '💬', status: 'connected', channel: '#alerts' },
  { id: 'teams', name: 'Microsoft Teams', icon: '👥', status: 'disconnected', channel: null },
  { id: 'email', name: 'البريد الإلكتروني', icon: '📧', status: 'connected', channel: 'team@company.com' },
];

export default function CollaborationHub({ contextType = 'alert', contextId = null, contextData = null }) {
  const [activeTab, setActiveTab] = useState('comments');
  const [newComment, setNewComment] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [comments, setComments] = useState(sampleComments);
  const [tasks, setTasks] = useState(sampleTasks);
  const [shareSettings, setShareSettings] = useState({ users: [], link: false, expiry: '7days' });
  const [newTask, setNewTask] = useState({ title: '', assignee: '', priority: 'medium', dueDate: '' });

  const queryClient = useQueryClient();

  // إضافة تعليق
  const addComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now(),
      user: 'المستخدم الحالي',
      avatar: 'م',
      text: newComment,
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      alertId: contextId
    };
    
    setComments(prev => [...prev, comment]);
    setNewComment('');
    toast.success('تم إضافة التعليق');
  };

  // إنشاء مهمة
  const createTask = () => {
    if (!newTask.title || !newTask.assignee) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const task = {
      id: Date.now(),
      ...newTask,
      status: 'pending',
      relatedAlert: contextId
    };

    setTasks(prev => [...prev, task]);
    setShowTaskDialog(false);
    setNewTask({ title: '', assignee: '', priority: 'medium', dueDate: '' });
    toast.success('تم إنشاء المهمة');

    // إرسال إشعار
    sendNotification('task', newTask.assignee, `تم تعيين مهمة جديدة: ${newTask.title}`);
  };

  // تحديث حالة المهمة
  const updateTaskStatus = (taskId, status) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    toast.success('تم تحديث حالة المهمة');
  };

  // مشاركة
  const shareContent = async () => {
    const shareLink = `${window.location.origin}/shared/${contextType}/${contextId}`;
    
    if (shareSettings.link) {
      await navigator.clipboard.writeText(shareLink);
      toast.success('تم نسخ رابط المشاركة');
    }

    if (shareSettings.users.length > 0) {
      // إرسال إشعارات للمستخدمين المحددين
      shareSettings.users.forEach(user => {
        sendNotification('share', user, `تمت مشاركة ${contextType === 'alert' ? 'تنبيه' : 'تقرير'} معك`);
      });
      toast.success(`تمت المشاركة مع ${shareSettings.users.length} مستخدم`);
    }

    setShowShareDialog(false);
  };

  // إرسال إشعار للتكاملات الخارجية
  const sendToIntegration = async (integrationId) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration || integration.status !== 'connected') {
      toast.error('التكامل غير متصل');
      return;
    }

    toast.success(`تم الإرسال إلى ${integration.name}`);
  };

  // دالة إرسال الإشعارات (محاكاة)
  const sendNotification = (type, recipient, message) => {
    console.log(`Notification [${type}] to ${recipient}: ${message}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'amber';
      case 'pending': return 'slate';
      default: return 'slate';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'amber';
      case 'low': return 'slate';
      default: return 'slate';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          مركز التعاون
        </h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="border-purple-500 text-purple-400" onClick={() => setShowShareDialog(true)}>
            <Share2 className="w-4 h-4 ml-1" />
            مشاركة
          </Button>
          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowTaskDialog(true)}>
            <Plus className="w-4 h-4 ml-1" />
            مهمة جديدة
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="comments" className="data-[state=active]:bg-cyan-500/20">
            <MessageSquare className="w-4 h-4 ml-1" />
            التعليقات ({comments.length})
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-purple-500/20">
            <Target className="w-4 h-4 ml-1" />
            المهام ({tasks.filter(t => t.status !== 'completed').length})
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-green-500/20">
            <Link2 className="w-4 h-4 ml-1" />
            التكاملات
          </TabsTrigger>
        </TabsList>

        {/* Comments Tab */}
        <TabsContent value="comments" className="mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4">
              <ScrollArea className="h-64 mb-4">
                <div className="space-y-3 pr-2">
                  <AnimatePresence>
                    {comments.map(comment => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex gap-3 p-3 bg-slate-800/50 rounded-lg"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-sm">
                            {comment.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium text-sm">{comment.user}</span>
                            <span className="text-slate-500 text-xs">{comment.time}</span>
                          </div>
                          <p className="text-slate-300 text-sm mt-1">{comment.text}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="أضف تعليقاً..."
                  className="bg-slate-800/50 border-slate-700 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && addComment()}
                />
                <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={addComment}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="mt-4">
          <div className="space-y-3">
            <AnimatePresence>
              {tasks.map(task => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className={`glass-card border-${getStatusColor(task.status)}-500/30 bg-[#0f1629]/80`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                            className={`mt-1 p-1 rounded-full ${task.status === 'completed' ? 'bg-green-500/20' : 'bg-slate-700'}`}
                          >
                            <Check className={`w-4 h-4 ${task.status === 'completed' ? 'text-green-400' : 'text-slate-500'}`} />
                          </button>
                          <div>
                            <p className={`text-white font-medium ${task.status === 'completed' ? 'line-through opacity-50' : ''}`}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`bg-${getPriorityColor(task.priority)}-500/20 text-${getPriorityColor(task.priority)}-400`}>
                                {task.priority === 'high' ? 'عالي' : task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                              </Badge>
                              <span className="text-slate-400 text-xs flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {task.assignee}
                              </span>
                              {task.dueDate && (
                                <span className="text-slate-400 text-xs flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {task.dueDate}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Select
                          value={task.status}
                          onValueChange={(v) => updateTaskStatus(task.id, v)}
                        >
                          <SelectTrigger className="w-28 h-8 bg-slate-800/50 border-slate-700 text-white text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">قيد الانتظار</SelectItem>
                            <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                            <SelectItem value="completed">مكتمل</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="mt-4">
          <div className="space-y-3">
            {integrations.map(integration => (
              <Card key={integration.id} className={`glass-card border-${integration.status === 'connected' ? 'green' : 'slate'}-500/30 bg-[#0f1629]/80`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <p className="text-white font-medium">{integration.name}</p>
                        {integration.channel && (
                          <p className="text-slate-400 text-sm">{integration.channel}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={integration.status === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}>
                        {integration.status === 'connected' ? 'متصل' : 'غير متصل'}
                      </Badge>
                      {integration.status === 'connected' ? (
                        <Button size="sm" variant="outline" className="border-cyan-500 text-cyan-400" onClick={() => sendToIntegration(integration.id)}>
                          <Send className="w-3 h-3 ml-1" />
                          إرسال
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="border-green-500 text-green-400">
                          <Link2 className="w-3 h-3 ml-1" />
                          اتصال
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-purple-400" />
              مشاركة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-400">مشاركة مع مستخدمين</Label>
              <Input
                placeholder="البريد الإلكتروني..."
                className="bg-slate-800/50 border-slate-700 text-white mt-2"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    setShareSettings(prev => ({ ...prev, users: [...prev.users, e.target.value] }));
                    e.target.value = '';
                  }
                }}
              />
              {shareSettings.users.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {shareSettings.users.map((user, i) => (
                    <Badge key={i} className="bg-cyan-500/20 text-cyan-400">
                      {user}
                      <X className="w-3 h-3 mr-1 cursor-pointer" onClick={() => setShareSettings(prev => ({ ...prev, users: prev.users.filter((_, idx) => idx !== i) }))} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <Label className="text-slate-400">إنشاء رابط مشاركة</Label>
              <Switch checked={shareSettings.link} onCheckedChange={(v) => setShareSettings(prev => ({ ...prev, link: v }))} />
            </div>

            {shareSettings.link && (
              <div>
                <Label className="text-slate-400">انتهاء الصلاحية</Label>
                <Select value={shareSettings.expiry} onValueChange={(v) => setShareSettings(prev => ({ ...prev, expiry: v }))}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1day">يوم واحد</SelectItem>
                    <SelectItem value="7days">أسبوع</SelectItem>
                    <SelectItem value="30days">شهر</SelectItem>
                    <SelectItem value="never">بدون انتهاء</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="border-slate-600 text-slate-400" onClick={() => setShowShareDialog(false)}>إلغاء</Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={shareContent}>
              <Share2 className="w-4 h-4 ml-2" />
              مشاركة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              مهمة جديدة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-400">عنوان المهمة</Label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                className="bg-slate-800/50 border-slate-700 text-white mt-2"
                placeholder="مثال: فحص المركبة"
              />
            </div>
            <div>
              <Label className="text-slate-400">تعيين إلى</Label>
              <Select value={newTask.assignee} onValueChange={(v) => setNewTask(prev => ({ ...prev, assignee: v }))}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                  <SelectValue placeholder="اختر مستخدم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="أحمد محمد">أحمد محمد</SelectItem>
                  <SelectItem value="سارة خالد">سارة خالد</SelectItem>
                  <SelectItem value="محمد علي">محمد علي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400">الأولوية</Label>
                <Select value={newTask.priority} onValueChange={(v) => setNewTask(prev => ({ ...prev, priority: v }))}>
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
              <div>
                <Label className="text-slate-400">تاريخ الاستحقاق</Label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="bg-slate-800/50 border-slate-700 text-white mt-2"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="border-slate-600 text-slate-400" onClick={() => setShowTaskDialog(false)}>إلغاء</Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={createTask}>
              <Plus className="w-4 h-4 ml-2" />
              إنشاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}