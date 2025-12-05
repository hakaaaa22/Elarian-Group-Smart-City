import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Users, Plus, Phone, Video, MoreVertical,
  Pin, Trash2, Reply, Forward, Star, File, Image, Link2, Search,
  Bell, CheckCheck, Check, Clock, AlertTriangle, Shield, Brain,
  Zap, Settings, Hash, Lock, ChevronRight, Upload, Loader2, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const channelTypeConfig = {
  department: { icon: Hash, color: 'cyan', label: 'قسم' },
  task: { icon: Zap, color: 'amber', label: 'مهمة' },
  project: { icon: Hash, color: 'purple', label: 'مشروع' },
  incident: { icon: AlertTriangle, color: 'red', label: 'حادث' },
  general: { icon: Users, color: 'green', label: 'عام' },
  announcement: { icon: Bell, color: 'pink', label: 'إعلان' }
};

const quickActions = [
  { id: 'create_task', label: 'إنشاء مهمة', icon: Zap, color: 'amber' },
  { id: 'create_alert', label: 'إنشاء تنبيه', icon: AlertTriangle, color: 'red' },
  { id: 'share_document', label: 'مشاركة مستند', icon: File, color: 'cyan' },
  { id: 'schedule_meeting', label: 'جدولة اجتماع', icon: Video, color: 'purple' }
];

export default function AdvancedStaffCommunication() {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newChannel, setNewChannel] = useState({
    channel_name: '',
    channel_type: 'general',
    description: '',
    is_private: false
  });
  const [newTask, setNewTask] = useState({
    title: '',
    assigned_to: '',
    due_date: ''
  });
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: channels = [], isLoading } = useQuery({
    queryKey: ['communication-channels'],
    queryFn: () => base44.entities.CommunicationChannel.list('-last_activity', 50)
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const createChannelMutation = useMutation({
    mutationFn: async () => {
      const channel = {
        ...newChannel,
        members: [],
        admins: [],
        shared_files: [],
        tasks: [],
        status: 'active',
        last_activity: new Date().toISOString()
      };
      return await base44.entities.CommunicationChannel.create(channel);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-channels'] });
      setShowCreateChannel(false);
      setNewChannel({ channel_name: '', channel_type: 'general', description: '', is_private: false });
      toast.success('تم إنشاء القناة بنجاح');
    }
  });

  const analyzeMessageMutation = useMutation({
    mutationFn: async (messageContent) => {
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل الرسالة التالية واقترح إجراءات سريعة مناسبة:
        
الرسالة: "${messageContent}"

قدم:
1. هل تتطلب إنشاء مهمة؟
2. هل تتضمن تنبيه أمني؟
3. هل تحتاج متابعة؟
4. الإجراءات المقترحة`,
        response_json_schema: {
          type: "object",
          properties: {
            requires_task: { type: "boolean" },
            is_security_alert: { type: "boolean" },
            needs_followup: { type: "boolean" },
            suggested_actions: { type: "array", items: { type: "string" } },
            priority: { type: "string" }
          }
        }
      });
      return analysis;
    }
  });

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel) return;

    const msg = {
      id: Date.now(),
      sender: 'current_user',
      sender_name: 'أنت',
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
      ai_analyzed: false
    };

    setMessages([...messages, msg]);

    // Analyze message with AI
    try {
      const analysis = await analyzeMessageMutation.mutateAsync(newMessage);
      if (analysis.requires_task || analysis.is_security_alert) {
        msg.ai_suggestions = analysis;
        msg.ai_analyzed = true;
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, ai_suggestions: analysis, ai_analyzed: true } : m));
      }
    } catch (e) {
      // Ignore AI analysis errors
    }

    setNewMessage('');
    toast.success('تم إرسال الرسالة');
  };

  const handleQuickAction = (action, message) => {
    if (action === 'create_task') {
      setNewTask({ title: message?.content?.slice(0, 50) || '', assigned_to: '', due_date: '' });
      setShowCreateTask(true);
    } else if (action === 'create_alert') {
      toast.success('تم إنشاء تنبيه جديد');
    }
  };

  const createTaskFromChat = async () => {
    if (!newTask.title) return;
    
    try {
      await base44.entities.Task.create({
        title: newTask.title,
        assigned_to: newTask.assigned_to,
        due_date: newTask.due_date,
        status: 'pending',
        category: 'support'
      });
      
      if (selectedChannel) {
        const updatedTasks = [...(selectedChannel.tasks || []), {
          task_id: Date.now().toString(),
          title: newTask.title,
          assigned_to: newTask.assigned_to,
          status: 'pending',
          due_date: newTask.due_date
        }];
        await base44.entities.CommunicationChannel.update(selectedChannel.id, { tasks: updatedTasks });
        queryClient.invalidateQueries({ queryKey: ['communication-channels'] });
      }
      
      setShowCreateTask(false);
      setNewTask({ title: '', assigned_to: '', due_date: '' });
      toast.success('تم إنشاء المهمة بنجاح');
    } catch (e) {
      toast.error('فشل في إنشاء المهمة');
    }
  };

  const filteredChannels = channels.filter(c =>
    c.channel_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <MessageSquare className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">التواصل الداخلي المتقدم</h3>
            <p className="text-slate-500 text-sm">قنوات مخصصة • مهام سريعة • تحليل ذكي</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowCreateChannel(true)}>
          <Plus className="w-4 h-4 ml-2" />
          قناة جديدة
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 h-[600px]">
        {/* Channels List */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Hash className="w-4 h-4 text-cyan-400" />
              القنوات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="relative mb-3">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="بحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 bg-slate-900/50 border-slate-700 text-white h-9 text-sm"
              />
            </div>

            <ScrollArea className="h-[450px]">
              <div className="space-y-1">
                {filteredChannels.map(channel => {
                  const config = channelTypeConfig[channel.channel_type] || channelTypeConfig.general;
                  const Icon = config.icon;
                  const isSelected = selectedChannel?.id === channel.id;
                  return (
                    <div
                      key={channel.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        isSelected ? `bg-${config.color}-500/20 border border-${config.color}-500/50` : 'bg-slate-900/50 hover:bg-slate-800/50'
                      }`}
                      onClick={() => setSelectedChannel(channel)}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 text-${config.color}-400`} />
                        <span className="text-white font-medium text-sm truncate">{channel.channel_name}</span>
                        {channel.is_private && <Lock className="w-3 h-3 text-slate-500" />}
                      </div>
                      {channel.tasks?.length > 0 && (
                        <Badge className="mt-1 bg-amber-500/20 text-amber-400 text-xs">
                          {channel.tasks.length} مهام
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 bg-slate-800/30 border-slate-700/50 flex flex-col">
          {selectedChannel ? (
            <>
              {/* Channel Header */}
              <CardHeader className="pb-2 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const config = channelTypeConfig[selectedChannel.channel_type] || channelTypeConfig.general;
                      const Icon = config.icon;
                      return (
                        <>
                          <div className={`p-2 rounded-lg bg-${config.color}-500/20`}>
                            <Icon className={`w-5 h-5 text-${config.color}-400`} />
                          </div>
                          <div>
                            <p className="text-white font-medium">{selectedChannel.channel_name}</p>
                            <p className="text-slate-500 text-xs">{selectedChannel.description}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Phone className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Video className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Settings className="w-4 h-4 text-slate-400" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map(msg => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'current_user' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[70%] ${msg.sender === 'current_user' ? '' : 'text-right'}`}>
                        <div className={`p-3 rounded-xl ${
                          msg.sender === 'current_user' ? 'bg-blue-600' : 'bg-slate-700'
                        }`}>
                          <p className="text-white text-sm">{msg.content}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                          <span>{new Date(msg.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                          {msg.sender === 'current_user' && (
                            msg.read ? <CheckCheck className="w-3 h-3 text-blue-400" /> : <Check className="w-3 h-3" />
                          )}
                        </div>
                        
                        {/* AI Suggestions */}
                        {msg.ai_suggestions && (
                          <div className="mt-2 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <p className="text-purple-400 text-xs flex items-center gap-1 mb-2">
                              <Brain className="w-3 h-3" />
                              اقتراحات ذكية
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {msg.ai_suggestions.requires_task && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs border-amber-500/50 text-amber-400"
                                  onClick={() => handleQuickAction('create_task', msg)}
                                >
                                  <Zap className="w-3 h-3 ml-1" />
                                  إنشاء مهمة
                                </Button>
                              )}
                              {msg.ai_suggestions.is_security_alert && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs border-red-500/50 text-red-400"
                                  onClick={() => handleQuickAction('create_alert', msg)}
                                >
                                  <AlertTriangle className="w-3 h-3 ml-1" />
                                  تنبيه أمني
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Quick Actions */}
              <div className="px-4 py-2 border-t border-slate-700/50">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {quickActions.map(action => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={action.id}
                        size="sm"
                        variant="outline"
                        className={`whitespace-nowrap h-8 border-${action.color}-500/50 text-${action.color}-400`}
                        onClick={() => handleQuickAction(action.id)}
                      >
                        <Icon className="w-3 h-3 ml-1" />
                        {action.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-700/50">
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" className="h-10 w-10">
                    <Upload className="w-4 h-4 text-slate-400" />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="اكتب رسالتك..."
                    className="flex-1 bg-slate-900/50 border-slate-700 text-white"
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={sendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>اختر قناة للبدء</p>
              </div>
            </div>
          )}
        </Card>

        {/* Channel Tasks & Files */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">المهام والملفات</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedChannel ? (
              <div className="space-y-4">
                {/* Tasks */}
                <div>
                  <h4 className="text-slate-400 text-xs mb-2 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    المهام ({selectedChannel.tasks?.length || 0})
                  </h4>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {(selectedChannel.tasks || []).map((task, i) => (
                        <div key={i} className="p-2 bg-slate-900/50 rounded-lg">
                          <p className="text-white text-sm">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <Badge className={`${
                              task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {task.status}
                            </Badge>
                            {task.due_date && (
                              <span className="text-slate-500">
                                <Clock className="w-3 h-3 inline ml-1" />
                                {task.due_date}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Files */}
                <div>
                  <h4 className="text-slate-400 text-xs mb-2 flex items-center gap-1">
                    <File className="w-3 h-3" />
                    الملفات ({selectedChannel.shared_files?.length || 0})
                  </h4>
                  <ScrollArea className="h-[150px]">
                    <div className="space-y-2">
                      {(selectedChannel.shared_files || []).map((file, i) => (
                        <div key={i} className="p-2 bg-slate-900/50 rounded-lg flex items-center gap-2">
                          <File className="w-4 h-4 text-cyan-400" />
                          <span className="text-white text-sm truncate">{file.file_name}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">اختر قناة لعرض التفاصيل</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Channel Dialog */}
      <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Hash className="w-5 h-5 text-cyan-400" />
              إنشاء قناة جديدة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">اسم القناة</Label>
              <Input
                value={newChannel.channel_name}
                onChange={(e) => setNewChannel({ ...newChannel, channel_name: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="مثال: فريق-الأمن"
              />
            </div>
            <div>
              <Label className="text-slate-300">نوع القناة</Label>
              <Select value={newChannel.channel_type} onValueChange={(v) => setNewChannel({ ...newChannel, channel_type: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.entries(channelTypeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">الوصف</Label>
              <Textarea
                value={newChannel.description}
                onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                placeholder="وصف مختصر للقناة..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={newChannel.is_private}
                onCheckedChange={(v) => setNewChannel({ ...newChannel, is_private: v })}
              />
              <Label className="text-slate-300">قناة خاصة</Label>
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => createChannelMutation.mutate()}
              disabled={createChannelMutation.isPending || !newChannel.channel_name}
            >
              {createChannelMutation.isPending ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 ml-2" />
              )}
              إنشاء القناة
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              إنشاء مهمة جديدة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">عنوان المهمة</Label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">تعيين إلى</Label>
              <Select value={newTask.assigned_to} onValueChange={(v) => setNewTask({ ...newTask, assigned_to: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                  <SelectValue placeholder="اختر موظفًا" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.email}>{user.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">تاريخ الاستحقاق</Label>
              <Input
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
              />
            </div>
            <Button
              className="w-full bg-amber-600 hover:bg-amber-700"
              onClick={createTaskFromChat}
              disabled={!newTask.title}
            >
              <Zap className="w-4 h-4 ml-2" />
              إنشاء المهمة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}