import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Phone, MessageCircle, Mail, Users, Clock, CheckCircle, AlertTriangle,
  TrendingUp, BarChart3, Headphones, PhoneCall, PhoneOff, PhoneMissed,
  Send, Paperclip, Search, Filter, User, Calendar, Star, MessageSquare,
  Facebook, Instagram, Twitter, Linkedin, Globe, Bot, Zap, RefreshCw,
  Play, Pause, Volume2, VolumeX, Mic, MicOff, Video, VideoOff, Check, Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import AICallAnalyzer from '@/components/callcenter/AICallAnalyzer';

// قنوات التواصل
const channels = [
  { id: 'whatsapp', name: 'واتساب', icon: MessageCircle, color: 'green', connected: true },
  { id: 'phone', name: 'هاتف', icon: Phone, color: 'blue', connected: true },
  { id: 'sms', name: 'رسائل SMS', icon: MessageSquare, color: 'purple', connected: true },
  { id: 'email', name: 'بريد إلكتروني', icon: Mail, color: 'red', connected: true },
  { id: 'facebook', name: 'فيسبوك', icon: Facebook, color: 'blue', connected: true },
  { id: 'instagram', name: 'انستغرام', icon: Instagram, color: 'pink', connected: false },
  { id: 'twitter', name: 'تويتر', icon: Twitter, color: 'cyan', connected: true },
  { id: 'linkedin', name: 'لينكد إن', icon: Linkedin, color: 'blue', connected: false },
  { id: 'website', name: 'الموقع', icon: Globe, color: 'purple', connected: true },
  { id: 'slack', name: 'Slack', icon: MessageSquare, color: 'amber', connected: true },
  { id: 'teams', name: 'MS Teams', icon: Users, color: 'indigo', connected: false },
];

// محادثات نموذجية
const mockConversations = [
  { 
    id: 1, 
    customer: 'أحمد محمد', 
    channel: 'whatsapp', 
    status: 'active',
    lastMessage: 'أحتاج مساعدة في طلب الصيانة',
    time: '2 دقيقة',
    unread: 3,
    priority: 'high',
    agent: 'سارة أحمد'
  },
  { 
    id: 2, 
    customer: 'فاطمة علي', 
    channel: 'phone', 
    status: 'waiting',
    lastMessage: 'مكالمة واردة...',
    time: '1 دقيقة',
    unread: 0,
    priority: 'urgent',
    agent: null
  },
  { 
    id: 3, 
    customer: 'خالد السعيد', 
    channel: 'email', 
    status: 'resolved',
    lastMessage: 'شكراً لحل المشكلة',
    time: '15 دقيقة',
    unread: 0,
    priority: 'low',
    agent: 'محمد فهد'
  },
  { 
    id: 4, 
    customer: 'نورة العتيبي', 
    channel: 'facebook', 
    status: 'active',
    lastMessage: 'متى يمكنني استلام الطلب؟',
    time: '5 دقائق',
    unread: 1,
    priority: 'medium',
    agent: 'سارة أحمد'
  },
  { 
    id: 5, 
    customer: 'عبدالله الشمري', 
    channel: 'twitter', 
    status: 'waiting',
    lastMessage: '@support أحتاج رد عاجل',
    time: '8 دقائق',
    unread: 2,
    priority: 'high',
    agent: null
  },
];

// رسائل المحادثة
const mockMessages = [
  { id: 1, sender: 'customer', text: 'السلام عليكم، أحتاج مساعدة', time: '10:30' },
  { id: 2, sender: 'agent', text: 'وعليكم السلام، كيف يمكنني مساعدتك؟', time: '10:31' },
  { id: 3, sender: 'customer', text: 'لدي مشكلة في جهاز التكييف', time: '10:32' },
  { id: 4, sender: 'agent', text: 'هل يمكنك وصف المشكلة بالتفصيل؟', time: '10:33' },
  { id: 5, sender: 'customer', text: 'الجهاز لا يبرد بشكل جيد', time: '10:34' },
];

// إحصائيات الوكلاء
const agents = [
  { id: 1, name: 'سارة أحمد', status: 'online', calls: 45, resolved: 42, rating: 4.8, activeChats: 3 },
  { id: 2, name: 'محمد فهد', status: 'online', calls: 38, resolved: 35, rating: 4.6, activeChats: 2 },
  { id: 3, name: 'ليلى حسن', status: 'busy', calls: 52, resolved: 48, rating: 4.9, activeChats: 5 },
  { id: 4, name: 'عمر خالد', status: 'offline', calls: 30, resolved: 28, rating: 4.5, activeChats: 0 },
];

export default function CallCenter() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showAIAnalyzer, setShowAIAnalyzer] = useState(false);

  const stats = {
    totalToday: 156,
    waiting: mockConversations.filter(c => c.status === 'waiting').length,
    active: mockConversations.filter(c => c.status === 'active').length,
    resolved: mockConversations.filter(c => c.status === 'resolved').length,
    avgResponseTime: '2.5 دقيقة',
    satisfaction: 94,
  };

  const filteredConversations = useMemo(() => {
    return mockConversations.filter(conv => {
      const matchesSearch = conv.customer.includes(searchQuery) || conv.lastMessage.includes(searchQuery);
      const matchesChannel = filterChannel === 'all' || conv.channel === filterChannel;
      const matchesStatus = filterStatus === 'all' || conv.status === filterStatus;
      return matchesSearch && matchesChannel && matchesStatus;
    });
  }, [searchQuery, filterChannel, filterStatus]);

  const getChannelConfig = (channelId) => channels.find(c => c.id === channelId) || channels[0];

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    toast.success('تم إرسال الرسالة');
    setMessageInput('');
  };

  const startCall = () => {
    setIsInCall(true);
    toast.success('جاري الاتصال...');
  };

  const endCall = () => {
    setIsInCall(false);
    toast.info('تم إنهاء المكالمة');
  };

  const assignToMe = (conv) => {
    toast.success(`تم تعيين المحادثة مع ${conv.customer} إليك`);
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Headphones className="w-8 h-8 text-green-400" />
              مركز الاتصال الموحد
            </h1>
            <p className="text-slate-400 mt-1">إدارة جميع قنوات التواصل في مكان واحد</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-green-500/50 text-green-400" onClick={() => setShowConnectDialog(true)}>
              <Zap className="w-4 h-4 ml-2" />
              ربط قناة جديدة
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[
          { label: 'اليوم', value: stats.totalToday, icon: BarChart3, color: 'cyan' },
          { label: 'في الانتظار', value: stats.waiting, icon: Clock, color: 'amber' },
          { label: 'نشطة', value: stats.active, icon: MessageCircle, color: 'green' },
          { label: 'محلولة', value: stats.resolved, icon: CheckCircle, color: 'blue' },
          { label: 'متوسط الرد', value: stats.avgResponseTime, icon: TrendingUp, color: 'purple' },
          { label: 'الرضا', value: `${stats.satisfaction}%`, icon: Star, color: 'amber' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-5 h-5 text-${stat.color}-400 mx-auto mb-1`} />
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Connected Channels */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 mb-6">
        <CardContent className="p-4">
          <h3 className="text-white font-medium mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            القنوات المتصلة
          </h3>
          <div className="flex flex-wrap gap-3">
            {channels.map(channel => {
              const Icon = channel.icon;
              return (
                <div 
                  key={channel.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                    channel.connected 
                      ? `bg-${channel.color}-500/10 border-${channel.color}-500/30` 
                      : 'bg-slate-800/50 border-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${channel.connected ? `text-${channel.color}-400` : 'text-slate-500'}`} />
                  <span className={channel.connected ? 'text-white' : 'text-slate-500'}>{channel.name}</span>
                  {channel.connected ? (
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                  ) : (
                    <Badge className="bg-slate-700 text-slate-400 text-xs">غير متصل</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 h-[600px]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm">المحادثات</CardTitle>
                <Badge className="bg-amber-500/20 text-amber-400">{stats.waiting} انتظار</Badge>
              </div>
              <div className="flex gap-2 mt-2">
                <div className="relative flex-1">
                  <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="بحث..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-8 bg-slate-800/50 border-slate-700 text-white h-8 text-sm"
                  />
                </div>
                <Select value={filterChannel} onValueChange={setFilterChannel}>
                  <SelectTrigger className="w-24 bg-slate-800/50 border-slate-700 text-white h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">الكل</SelectItem>
                    {channels.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[480px]">
                <div className="space-y-2">
                  {filteredConversations.map(conv => {
                    const channel = getChannelConfig(conv.channel);
                    const ChannelIcon = channel.icon;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedConversation?.id === conv.id 
                            ? 'bg-cyan-500/20 border border-cyan-500/30' 
                            : 'bg-slate-800/30 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-slate-700 text-white text-xs">
                                {conv.customer.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white text-sm font-medium">{conv.customer}</p>
                              <div className="flex items-center gap-1">
                                <ChannelIcon className={`w-3 h-3 text-${channel.color}-400`} />
                                <span className="text-slate-500 text-xs">{channel.name}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-left">
                            <span className="text-slate-500 text-xs">{conv.time}</span>
                            {conv.unread > 0 && (
                              <Badge className="bg-red-500 text-white text-xs mr-1">{conv.unread}</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-400 text-xs truncate">{conv.lastMessage}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge className={`text-xs ${
                            conv.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            conv.status === 'waiting' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {conv.status === 'active' ? 'نشط' : conv.status === 'waiting' ? 'انتظار' : 'محلول'}
                          </Badge>
                          {conv.status === 'waiting' && !conv.agent && (
                            <Button size="sm" variant="ghost" className="h-6 text-xs text-cyan-400" onClick={() => assignToMe(conv)}>
                              تعيين لي
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 h-[600px] flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-cyan-500/20 text-cyan-400">
                          {selectedConversation.customer.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-medium">{selectedConversation.customer}</p>
                        <p className="text-slate-400 text-sm">
                          {getChannelConfig(selectedConversation.channel).name} • {selectedConversation.status === 'active' ? 'متصل الآن' : 'غير متصل'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {selectedConversation.channel === 'phone' || selectedConversation.channel === 'whatsapp' ? (
                        isInCall ? (
                          <>
                            <Button size="sm" variant="outline" className={`border-slate-600 ${isMuted ? 'bg-red-500/20' : ''}`} onClick={() => setIsMuted(!isMuted)}>
                              {isMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" />}
                            </Button>
                            <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={endCall}>
                              <PhoneOff className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={startCall}>
                            <Phone className="w-4 h-4 ml-1" />
                            اتصال
                          </Button>
                        )
                      ) : null}
                      <Button size="sm" variant="outline" className="border-slate-600">
                        <User className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {mockMessages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.sender === 'agent' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[70%] p-3 rounded-2xl ${
                          msg.sender === 'agent' 
                            ? 'bg-slate-800/50 text-white rounded-tr-none' 
                            : 'bg-cyan-500/20 text-white rounded-tl-none'
                        }`}>
                          <p className="text-sm">{msg.text}</p>
                          <p className="text-[10px] text-slate-500 mt-1">{msg.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t border-slate-700/50">
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" className="border-slate-600">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="اكتب رسالتك..."
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                    <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={sendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Button size="sm" variant="ghost" className="text-purple-400 text-xs" onClick={() => setShowAIAnalyzer(true)}>
                      <Bot className="w-3 h-3 ml-1" />
                      تحليل AI
                    </Button>
                    <Button size="sm" variant="ghost" className="text-slate-400 text-xs">
                      📝 قوالب
                    </Button>
                    <Button size="sm" variant="ghost" className="text-purple-400 text-xs" onClick={() => toast.success('جاري إرسال SMS...')}>
                      <MessageSquare className="w-3 h-3 ml-1" />
                      SMS
                    </Button>
                    <Button size="sm" variant="ghost" className="text-amber-400 text-xs" onClick={() => toast.success('تم إرسال إلى Slack')}>
                      💬 Slack
                    </Button>
                    <Button size="sm" variant="ghost" className="text-indigo-400 text-xs" onClick={() => toast.success('تم التصعيد إلى Teams')}>
                      👥 Teams
                    </Button>
                    <Button size="sm" variant="ghost" className="text-slate-400 text-xs">
                      ✅ إغلاق
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">اختر محادثة للبدء</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Post-Call Actions */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 mt-6">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            إجراءات ما بعد التواصل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Post Call */}
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                بعد المكالمة
              </h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> رسالة شكر تلقائية</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> ملخص المكالمة</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> رقم التذكرة</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> رابط التقييم</li>
              </ul>
            </div>
            
            {/* Post Chat */}
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-400 font-medium mb-3 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                بعد المحادثة النصية
              </h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-cyan-400" /> تأكيد استلام الطلب</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-cyan-400" /> رقم المرجع</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-cyan-400" /> الخطوات التالية</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-cyan-400" /> رابط تتبع الحالة</li>
              </ul>
            </div>

            {/* Ticket Updates */}
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <h4 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                تحديثات التذكرة
              </h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-purple-400" /> تغيير حالة التذكرة</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-purple-400" /> تعيين موظف جديد</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-purple-400" /> إشعار بالحل</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-purple-400" /> إغلاق التذكرة</li>
              </ul>
            </div>

            {/* Reminders */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <h4 className="text-amber-400 font-medium mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                التذكيرات
              </h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-amber-400" /> تذكير بالمواعيد</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-amber-400" /> تذكير بالدفع</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-amber-400" /> متابعة الطلبات</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-amber-400" /> رسائل دورية</li>
              </ul>
            </div>

            {/* Critical Alerts */}
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <h4 className="text-red-400 font-medium mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                التنبيهات الحرجة
              </h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-red-400" /> تنبيهات الأمان</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-red-400" /> تغيير كلمة المرور</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-red-400" /> نشاط غير عادي</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-red-400" /> مشاكل فنية</li>
              </ul>
            </div>

            {/* Marketing */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                الحملات التسويقية
              </h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-blue-400" /> عروض خاصة</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-blue-400" /> منتجات جديدة</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-blue-400" /> برامج الولاء</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-blue-400" /> استطلاعات الرأي</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agents Status */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 mt-6">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            فريق الدعم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {agents.map(agent => (
              <div key={agent.id} className="p-3 bg-slate-800/30 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-cyan-500/20 text-cyan-400">{agent.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">{agent.name}</p>
                    <Badge className={`text-xs ${
                      agent.status === 'online' ? 'bg-green-500/20 text-green-400' :
                      agent.status === 'busy' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {agent.status === 'online' ? 'متاح' : agent.status === 'busy' ? 'مشغول' : 'غير متصل'}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-cyan-400 font-bold">{agent.calls}</p>
                    <p className="text-slate-500 text-xs">مكالمات</p>
                  </div>
                  <div>
                    <p className="text-green-400 font-bold">{agent.resolved}</p>
                    <p className="text-slate-500 text-xs">محلولة</p>
                  </div>
                  <div>
                    <p className="text-amber-400 font-bold flex items-center justify-center gap-1">
                      <Star className="w-3 h-3" />{agent.rating}
                    </p>
                    <p className="text-slate-500 text-xs">التقييم</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connect Channel Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-400" />
              ربط قناة جديدة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              {channels.filter(c => !c.connected).map(channel => {
                const Icon = channel.icon;
                return (
                  <Button
                    key={channel.id}
                    variant="outline"
                    className={`border-${channel.color}-500/50 text-${channel.color}-400 h-20 flex-col`}
                    onClick={() => {
                      toast.success(`جاري ربط ${channel.name}...`);
                      setShowConnectDialog(false);
                    }}
                  >
                    <Icon className="w-6 h-6 mb-2" />
                    {channel.name}
                  </Button>
                );
              })}
            </div>
            <p className="text-slate-400 text-sm text-center">
              اختر القناة التي تريد ربطها بمركز الاتصال
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Call Analyzer */}
      <AICallAnalyzer 
        conversation={selectedConversation}
        messages={mockMessages}
        isOpen={showAIAnalyzer}
        onClose={() => setShowAIAnalyzer(false)}
      />
    </div>
  );
}