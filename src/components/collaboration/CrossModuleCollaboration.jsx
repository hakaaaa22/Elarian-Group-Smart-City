import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Users, MessageSquare, AtSign, Target, Bell, Share2, CheckCircle, Clock,
  AlertTriangle, Lightbulb, Send, Plus, X, Edit, Trash2, Link2, ExternalLink,
  User, Calendar, Tag, Filter, Search, ChevronDown, Check, Zap
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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from '@/components/ui/command';
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// المستخدمين والفرق
const users = [
  { id: 'u1', name: 'أحمد محمد', email: 'ahmed@company.com', avatar: 'أ', role: 'مدير الأسطول', team: 'الأسطول' },
  { id: 'u2', name: 'سارة خالد', email: 'sara@company.com', avatar: 'س', role: 'محلل بيانات', team: 'التحليلات' },
  { id: 'u3', name: 'محمد علي', email: 'mohammed@company.com', avatar: 'م', role: 'فني صيانة', team: 'الصيانة' },
  { id: 'u4', name: 'فاطمة أحمد', email: 'fatima@company.com', avatar: 'ف', role: 'مشرف النفايات', team: 'النفايات' },
];

const teams = [
  { id: 't1', name: 'فريق الأسطول', members: 5, color: 'cyan' },
  { id: 't2', name: 'فريق الصيانة', members: 8, color: 'amber' },
  { id: 't3', name: 'فريق التحليلات', members: 3, color: 'purple' },
  { id: 't4', name: 'فريق النفايات', members: 6, color: 'green' },
];

// التنبيهات والرؤى
const alertsAndInsights = [
  { id: 'a1', type: 'alert', title: 'ارتفاع حرارة المحرك - مركبة V002', severity: 'high', module: 'fleet', timestamp: '10:30', comments: 3, assigned: null },
  { id: 'a2', type: 'insight', title: 'فرصة تحسين مسارات الجمع بنسبة 15%', severity: 'medium', module: 'waste', timestamp: '09:45', comments: 5, assigned: 'u2' },
  { id: 'a3', type: 'recommendation', title: 'توصية بجدولة صيانة وقائية لـ 3 مركبات', severity: 'low', module: 'maintenance', timestamp: '08:00', comments: 2, assigned: 'u3' },
];

// التعليقات
const sampleComments = [
  { id: 'c1', alertId: 'a1', user: users[0], text: 'تم إرسال فني للفحص @محمد علي', time: '10:35', mentions: ['u3'] },
  { id: 'c2', alertId: 'a1', user: users[2], text: 'في الطريق، أتوقع الوصول خلال 30 دقيقة', time: '10:40', mentions: [] },
  { id: 'c3', alertId: 'a1', user: users[1], text: 'بناءً على البيانات، المشكلة قد تكون في مضخة المياه @فريق الصيانة', time: '10:45', mentions: ['t2'] },
];

export default function CrossModuleCollaboration({ contextType = 'alert', contextId = null }) {
  const [activeTab, setActiveTab] = useState('discussions');
  const [comments, setComments] = useState(sampleComments);
  const [newComment, setNewComment] = useState('');
  const [showMentionPopover, setShowMentionPopover] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', assignee: '', team: '', priority: 'medium', dueDate: '', fromRecommendation: false });

  // إضافة تعليق مع ذكر
  const addComment = () => {
    if (!newComment.trim()) return;
    
    // استخراج الإشارات
    const mentionPattern = /@(\S+)/g;
    const mentions = [...newComment.matchAll(mentionPattern)].map(m => m[1]);
    
    const comment = {
      id: `c${Date.now()}`,
      alertId: selectedAlert?.id || 'a1',
      user: users[0],
      text: newComment,
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      mentions
    };
    
    setComments(prev => [...prev, comment]);
    setNewComment('');
    
    // إرسال إشعارات للمذكورين
    if (mentions.length > 0) {
      toast.success(`تم إشعار ${mentions.length} مستخدم/فريق`);
    }
  };

  // إدراج ذكر
  const insertMention = (item) => {
    const mentionText = item.name ? `@${item.name}` : `@${item.name}`;
    setNewComment(prev => prev + mentionText + ' ');
    setShowMentionPopover(false);
  };

  // إنشاء مهمة من توصية AI
  const createTaskFromRecommendation = (alert) => {
    setNewTask({
      title: alert.title,
      assignee: '',
      team: '',
      priority: alert.severity === 'high' ? 'urgent' : alert.severity === 'medium' ? 'high' : 'medium',
      dueDate: '',
      fromRecommendation: true,
      sourceId: alert.id
    });
    setShowTaskDialog(true);
  };

  // حفظ المهمة
  const saveTask = () => {
    if (!newTask.title || (!newTask.assignee && !newTask.team)) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const task = {
      id: `task${Date.now()}`,
      ...newTask,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [...prev, task]);
    setShowTaskDialog(false);
    setNewTask({ title: '', assignee: '', team: '', priority: 'medium', dueDate: '', fromRecommendation: false });
    
    toast.success('تم إنشاء المهمة وإرسال الإشعارات');
  };

  // تعيين تنبيه لمستخدم
  const assignAlert = (alertId, userId) => {
    toast.success('تم تعيين التنبيه');
    setShowAssignDialog(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'red';
      case 'medium': return 'amber';
      default: return 'green';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'alert': return AlertTriangle;
      case 'insight': return Lightbulb;
      case 'recommendation': return Zap;
      default: return Bell;
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          التعاون عبر الوحدات
        </h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="border-purple-500 text-purple-400" onClick={() => setShowTaskDialog(true)}>
            <Plus className="w-4 h-4 ml-1" />
            مهمة جديدة
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="discussions" className="data-[state=active]:bg-cyan-500/20">
            <MessageSquare className="w-4 h-4 ml-1" />
            المناقشات
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-red-500/20">
            <AlertTriangle className="w-4 h-4 ml-1" />
            التنبيهات والرؤى
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-purple-500/20">
            <Target className="w-4 h-4 ml-1" />
            المهام
          </TabsTrigger>
          <TabsTrigger value="teams" className="data-[state=active]:bg-green-500/20">
            <Users className="w-4 h-4 ml-1" />
            الفرق
          </TabsTrigger>
        </TabsList>

        {/* Discussions Tab */}
        <TabsContent value="discussions" className="mt-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Alerts List */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">التنبيهات النشطة</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {alertsAndInsights.map(alert => {
                      const TypeIcon = getTypeIcon(alert.type);
                      return (
                        <div
                          key={alert.id}
                          onClick={() => setSelectedAlert(alert)}
                          className={`p-3 rounded-lg cursor-pointer transition-all ${selectedAlert?.id === alert.id ? 'bg-cyan-500/20 border border-cyan-500/50' : 'bg-slate-800/50 hover:bg-slate-800'}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <TypeIcon className={`w-4 h-4 text-${getSeverityColor(alert.severity)}-400`} />
                            <span className="text-white text-sm font-medium truncate">{alert.title}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <Badge className="bg-slate-700 text-slate-300">{alert.module}</Badge>
                            <span className="text-slate-500 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {alert.comments}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="lg:col-span-2 glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm">
                    {selectedAlert ? selectedAlert.title : 'اختر تنبيهاً للمناقشة'}
                  </CardTitle>
                  {selectedAlert && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-cyan-500 text-cyan-400 h-7" onClick={() => setShowAssignDialog(true)}>
                        <User className="w-3 h-3 ml-1" />
                        تعيين
                      </Button>
                      {selectedAlert.type === 'recommendation' && (
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 h-7" onClick={() => createTaskFromRecommendation(selectedAlert)}>
                          <Target className="w-3 h-3 ml-1" />
                          إنشاء مهمة
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedAlert ? (
                  <>
                    <ScrollArea className="h-[280px] mb-4">
                      <div className="space-y-3 pr-2">
                        <AnimatePresence>
                          {comments.filter(c => c.alertId === selectedAlert.id).map(comment => (
                            <motion.div
                              key={comment.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex gap-3"
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-sm">
                                  {comment.user.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 p-3 bg-slate-800/50 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-white font-medium text-sm">{comment.user.name}</span>
                                  <span className="text-slate-500 text-xs">{comment.time}</span>
                                </div>
                                <p className="text-slate-300 text-sm">
                                  {comment.text.split(/(@\S+)/g).map((part, i) => 
                                    part.startsWith('@') ? (
                                      <span key={i} className="text-cyan-400 cursor-pointer hover:underline">{part}</span>
                                    ) : part
                                  )}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </ScrollArea>

                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          value={newComment}
                          onChange={(e) => {
                            setNewComment(e.target.value);
                            if (e.target.value.endsWith('@')) {
                              setShowMentionPopover(true);
                            }
                          }}
                          placeholder="أضف تعليقاً... اكتب @ للإشارة"
                          className="bg-slate-800/50 border-slate-700 text-white"
                          onKeyPress={(e) => e.key === 'Enter' && addComment()}
                        />
                        
                        <Popover open={showMentionPopover} onOpenChange={setShowMentionPopover}>
                          <PopoverTrigger asChild>
                            <span />
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-0 bg-[#0f1629] border-slate-700" align="start">
                            <Command>
                              <CommandInput placeholder="ابحث عن مستخدم أو فريق..." />
                              <CommandList>
                                <CommandEmpty>لا توجد نتائج</CommandEmpty>
                                <CommandGroup heading="المستخدمين">
                                  {users.map(user => (
                                    <CommandItem key={user.id} onSelect={() => insertMention(user)}>
                                      <Avatar className="h-6 w-6 mr-2">
                                        <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-xs">{user.avatar}</AvatarFallback>
                                      </Avatar>
                                      <span className="text-white">{user.name}</span>
                                      <span className="text-slate-500 text-xs mr-auto">{user.role}</span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                                <CommandGroup heading="الفرق">
                                  {teams.map(team => (
                                    <CommandItem key={team.id} onSelect={() => insertMention(team)}>
                                      <Users className={`w-4 h-4 mr-2 text-${team.color}-400`} />
                                      <span className="text-white">{team.name}</span>
                                      <span className="text-slate-500 text-xs mr-auto">{team.members} أعضاء</span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={addComment}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-slate-500">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>اختر تنبيهاً لعرض المناقشات</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="mt-4">
          <div className="space-y-3">
            {alertsAndInsights.map(alert => {
              const TypeIcon = getTypeIcon(alert.type);
              return (
                <Card key={alert.id} className={`glass-card border-${getSeverityColor(alert.severity)}-500/30 bg-[#0f1629]/80`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-${getSeverityColor(alert.severity)}-500/20`}>
                          <TypeIcon className={`w-5 h-5 text-${getSeverityColor(alert.severity)}-400`} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{alert.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-slate-700 text-slate-300">{alert.module}</Badge>
                            <span className="text-slate-500 text-xs">{alert.timestamp}</span>
                            <span className="text-slate-500 text-xs flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {alert.comments} تعليقات
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {alert.assigned ? (
                          <Badge className="bg-green-500/20 text-green-400">
                            معين لـ {users.find(u => u.id === alert.assigned)?.name}
                          </Badge>
                        ) : (
                          <Button size="sm" variant="outline" className="border-slate-600 text-slate-400 h-7">
                            <User className="w-3 h-3 ml-1" />
                            تعيين
                          </Button>
                        )}
                        {alert.type === 'recommendation' && (
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 h-7" onClick={() => createTaskFromRecommendation(alert)}>
                            <Target className="w-3 h-3 ml-1" />
                            إنشاء مهمة
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="mt-4">
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500 bg-slate-800/30 rounded-lg">
                <Target className="w-12 h-12 mb-3 opacity-50" />
                <p>لا توجد مهام بعد</p>
                <Button size="sm" variant="outline" className="mt-3 border-slate-600" onClick={() => setShowTaskDialog(true)}>
                  <Plus className="w-4 h-4 ml-1" />
                  إنشاء مهمة
                </Button>
              </div>
            ) : (
              tasks.map(task => (
                <Card key={task.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className={`w-5 h-5 ${task.status === 'completed' ? 'text-green-400' : 'text-slate-500'}`} />
                        <div>
                          <p className="text-white font-medium">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`bg-${task.priority === 'urgent' ? 'red' : task.priority === 'high' ? 'amber' : 'slate'}-500/20 text-${task.priority === 'urgent' ? 'red' : task.priority === 'high' ? 'amber' : 'slate'}-400`}>
                              {task.priority === 'urgent' ? 'عاجل' : task.priority === 'high' ? 'عالي' : 'متوسط'}
                            </Badge>
                            {task.fromRecommendation && (
                              <Badge className="bg-purple-500/20 text-purple-400">
                                <Zap className="w-3 h-3 ml-1" />
                                من توصية AI
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-xs">
                            {users.find(u => u.id === task.assignee)?.avatar || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-slate-400 text-sm">{task.dueDate}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams" className="mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teams.map(team => (
              <Card key={team.id} className={`glass-card border-${team.color}-500/30 bg-[#0f1629]/80`}>
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-full bg-${team.color}-500/20 flex items-center justify-center mx-auto mb-3`}>
                    <Users className={`w-6 h-6 text-${team.color}-400`} />
                  </div>
                  <p className="text-white font-medium">{team.name}</p>
                  <p className="text-slate-400 text-sm">{team.members} أعضاء</p>
                  <Button size="sm" variant="outline" className={`mt-3 border-${team.color}-500 text-${team.color}-400`}>
                    عرض الفريق
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              {newTask.fromRecommendation ? 'إنشاء مهمة من توصية AI' : 'مهمة جديدة'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-400">عنوان المهمة</Label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-2"
              />
            </div>
            <div>
              <Label className="text-slate-400">تعيين لمستخدم</Label>
              <Select value={newTask.assignee} onValueChange={(v) => setNewTask({ ...newTask, assignee: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                  <SelectValue placeholder="اختر مستخدم" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name} - {user.role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-400">أو تعيين لفريق</Label>
              <Select value={newTask.team} onValueChange={(v) => setNewTask({ ...newTask, team: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                  <SelectValue placeholder="اختر فريق" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400">الأولوية</Label>
                <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">عاجل</SelectItem>
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
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white mt-2"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="border-slate-600 text-slate-400" onClick={() => setShowTaskDialog(false)}>إلغاء</Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={saveTask}>إنشاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">تعيين التنبيه</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            {users.map(user => (
              <div
                key={user.id}
                onClick={() => assignAlert(selectedAlert?.id, user.id)}
                className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-cyan-500/20 text-cyan-400">{user.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white">{user.name}</p>
                  <p className="text-slate-400 text-xs">{user.role}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}