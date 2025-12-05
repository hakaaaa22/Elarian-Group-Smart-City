import React, { useState, useEffect, useCallback } from 'react';
import {
  Phone, MessageCircle, Mail, Facebook, Instagram, Send, User, Clock,
  Keyboard, Volume2, VolumeX, Bell, BellOff, ArrowLeftRight, X, CheckCircle,
  Mic, Video, Paperclip, Smile, MoreVertical, History, BarChart3, Users, Brain,
  Bot, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import AIKnowledgeBase from './AIKnowledgeBase';
import AgentCollaboration from './AgentCollaboration';
import AgentKPIDashboard from './AgentKPIDashboard';
import CustomerPredictiveAnalytics from './CustomerPredictiveAnalytics';
import AICustomerProfileIntegration from '@/components/crm/AICustomerProfileIntegration';
import EnhancedAgentCoaching from '@/components/training/EnhancedAgentCoaching';
import LiveSentimentAnalysis from './LiveSentimentAnalysis';
import PostCallAutomation from './PostCallAutomation';
import CaseEscalation from './CaseEscalation';
import CallSummarization from './CallSummarization';
import AIAgentAssistantChatbot from './AIAgentAssistantChatbot';
import OmnichannelAIRouter from './OmnichannelAIRouter';
import OmnichannelPostInteractionAutomation from './OmnichannelPostInteractionAutomation';
import BidirectionalCRMIntegration from '@/components/crm/BidirectionalCRMIntegration';
import AIUpsellCrossSellIdentifier from '@/components/crm/AIUpsellCrossSellIdentifier';
import CustomAutomationRulesBuilder from '@/components/automation/CustomAutomationRulesBuilder';
import PersonalizedAgentDashboard from './PersonalizedAgentDashboard';
import RealtimeAgentCoaching from './RealtimeAgentCoaching';

const customerInteractions = [
  { id: 1, channel: 'voice', message: 'مكالمة واردة - استفسار عن الصيانة', time: '10:30', direction: 'in', timestamp: new Date('2024-12-04T10:30:00') },
  { id: 2, channel: 'whatsapp', message: 'مرحباً، أريد متابعة طلبي رقم 12345', time: '10:25', direction: 'in', timestamp: new Date('2024-12-04T10:25:00') },
  { id: 3, channel: 'whatsapp', message: 'تم استلام طلبك، سيتم التواصل معك قريباً', time: '10:26', direction: 'out', timestamp: new Date('2024-12-04T10:26:00') },
  { id: 4, channel: 'email', message: 'شكوى رسمية بخصوص تأخر الخدمة', time: '09:15', direction: 'in', timestamp: new Date('2024-12-04T09:15:00') },
  { id: 5, channel: 'facebook', message: 'هل يمكنني معرفة مواعيد العمل؟', time: '09:00', direction: 'in', timestamp: new Date('2024-12-04T09:00:00') },
  { id: 6, channel: 'telegram', message: 'أحتاج مساعدة عاجلة', time: '08:45', direction: 'in', timestamp: new Date('2024-12-04T08:45:00') },
  { id: 7, channel: 'sms', message: 'تم تأكيد موعدك غداً الساعة 10 صباحاً', time: '08:30', direction: 'out', timestamp: new Date('2024-12-04T08:30:00') },
];

const shortcuts = [
  { key: 'R', action: 'رد سريع', handler: 'reply', icon: '💬' },
  { key: 'T', action: 'تحويل', handler: 'transfer', icon: '↔️' },
  { key: 'H', action: 'تعليق', handler: 'hold', icon: '⏸️' },
  { key: 'C', action: 'إغلاق', handler: 'close', icon: '✅' },
  { key: 'N', action: 'ملاحظة', handler: 'note', icon: '📝' },
  { key: 'E', action: 'تصعيد', handler: 'escalate', icon: '⬆️' },
  { key: 'K', action: 'قاعدة المعرفة', handler: 'knowledge', icon: '📚' },
  { key: 'M', action: 'كتم الصوت', handler: 'mute', icon: '🔇' },
  { key: 'S', action: 'حفظ', handler: 'save', icon: '💾' },
];

const channelIcons = {
  voice: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  facebook: Facebook,
  instagram: Instagram,
  telegram: Send,
  sms: MessageCircle,
  chat: MessageCircle,
};

const channelColors = {
  voice: 'blue',
  whatsapp: 'green',
  email: 'red',
  facebook: 'blue',
  instagram: 'pink',
  telegram: 'cyan',
  sms: 'purple',
  chat: 'amber',
};

const notificationSounds = {
  call: '/sounds/call.mp3',
  message: '/sounds/message.mp3',
  alert: '/sounds/alert.mp3',
};

export default function UnifiedAgentWorkspace({ customer }) {
  const [messageInput, setMessageInput] = useState('');
  const [interactions, setInteractions] = useState(
    [...customerInteractions].sort((a, b) => a.timestamp - b.timestamp)
  );
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('conversation');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [notifications, setNotifications] = useState({
    sound: true,
    visual: true,
    desktop: true,
    vibrate: true,
    highPriority: true,
    ticketUpdates: true,
    inactivityAlerts: true,
    newMessages: true,
    escalations: true,
    callSound: 'bell',
    messageSound: 'chime',
    alertSound: 'urgent',
  });
  const [suggestedResponses, setSuggestedResponses] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const [ticketUpdates, setTicketUpdates] = useState([]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callSummary, setCallSummary] = useState('');
  const [customerIntent, setCustomerIntent] = useState('استفسار');
  const [churnRisk, setChurnRisk] = useState(25);
  const [automatedTasks, setAutomatedTasks] = useState([]);

  // Keyboard Shortcuts Handler
  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      const shortcut = shortcuts.find(s => s.key.toLowerCase() === e.key.toLowerCase());
      if (shortcut) {
        e.preventDefault();
        executeAction(shortcut.handler);
      }
    }
    if (e.key === '?' && e.shiftKey) {
      setShowShortcuts(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Simulate incoming call
  useEffect(() => {
    const timer = setTimeout(() => {
      if (notifications.sound || notifications.visual) {
        setIncomingCall({ id: 'CALL-001', customer: 'عبدالله الشمري', channel: 'voice' });
        if (notifications.sound) {
          // Play sound (placeholder)
          toast.info('🔔 مكالمة واردة!', { duration: 5000 });
        }
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const executeAction = (action) => {
    switch (action) {
      case 'reply':
        document.getElementById('message-input')?.focus();
        break;
      case 'transfer':
        toast.info('جاري فتح نافذة التحويل...');
        break;
      case 'hold':
        toast.success('تم وضع المحادثة في الانتظار');
        break;
      case 'close':
        toast.success('تم إغلاق المحادثة');
        addTicketUpdate('تم إغلاق التذكرة');
        break;
      case 'note':
        setShowNoteDialog(true);
        break;
      case 'escalate':
        toast.warning('جاري التصعيد للمشرف...');
        addTicketUpdate('تم تصعيد التذكرة');
        break;
      case 'knowledge':
        setShowKnowledgeBase(!showKnowledgeBase);
        break;
      case 'mute':
        setNotifications(prev => ({ ...prev, sound: !prev.sound }));
        toast.info(notifications.sound ? 'تم كتم الصوت' : 'تم تفعيل الصوت');
        break;
      case 'save':
        toast.success('تم حفظ المحادثة');
        break;
      default:
        break;
    }
  };

  const addTicketUpdate = (update) => {
    setTicketUpdates(prev => [...prev, { id: Date.now(), text: update, time: new Date() }]);
    if (notifications.visual) {
      toast.info(`📋 ${update}`);
    }
  };

  const saveNote = () => {
    if (noteText.trim()) {
      toast.success('تم حفظ الملاحظة');
      setInteractions(prev => [...prev, {
        id: Date.now(),
        channel: 'note',
        message: `📝 ملاحظة: ${noteText}`,
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        direction: 'out',
        timestamp: new Date(),
        isNote: true,
      }]);
      setNoteText('');
      setShowNoteDialog(false);
    }
  };

  const filteredInteractions = channelFilter === 'all' 
    ? interactions 
    : interactions.filter(i => i.channel === channelFilter);

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    setInteractions(prev => [...prev, {
      id: Date.now(),
      channel: 'whatsapp',
      message: messageInput,
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      direction: 'out'
    }]);
    setMessageInput('');
  };

  const acceptCall = () => {
    toast.success('تم قبول المكالمة');
    setIncomingCall(null);
    setIsCallActive(true);
  };

  const rejectCall = () => {
    toast.error('تم رفض المكالمة');
    setIncomingCall(null);
  };

  const endCall = () => {
    setIsCallActive(false);
    toast.info('تم إنهاء المكالمة');
  };

  const getChannelIcon = (channel) => {
    const Icon = channelIcons[channel] || MessageCircle;
    return Icon;
  };

  return (
    <TooltipProvider>
      <div className="space-y-4" dir="rtl">
        {/* Incoming Call Notification */}
        {incomingCall && notifications.visual && (
          <Card className="bg-green-500/20 border-green-500/50 animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/30 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-green-400 animate-bounce" />
                  </div>
                  <div>
                    <p className="text-white font-bold">مكالمة واردة</p>
                    <p className="text-green-400">{incomingCall.customer}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="bg-green-600 hover:bg-green-700" onClick={acceptCall}>
                    <Phone className="w-4 h-4 ml-1" />
                    قبول
                  </Button>
                  <Button variant="destructive" onClick={rejectCall}>
                    <X className="w-4 h-4 ml-1" />
                    رفض
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header with Shortcuts */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            مساحة عمل الوكيل الموحدة
            {isScreenSharing && (
              <Badge className="bg-red-500/20 text-red-400 animate-pulse">
                <Video className="w-3 h-3 ml-1" />
                مشاركة نشطة
              </Badge>
            )}
          </h3>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" className="border-slate-600" onClick={() => setShowShortcuts(true)}>
                  <Keyboard className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>اختصارات لوحة المفاتيح (Shift+?)</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
            <TabsTrigger value="conversation" className="data-[state=active]:bg-cyan-500/20 text-xs">
              <MessageCircle className="w-3 h-3 ml-1" />
              المحادثة
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="data-[state=active]:bg-purple-500/20 text-xs">
              <Users className="w-3 h-3 ml-1" />
              التعاون
            </TabsTrigger>
            <TabsTrigger value="kpi" className="data-[state=active]:bg-green-500/20 text-xs">
              <BarChart3 className="w-3 h-3 ml-1" />
              مؤشرات الأداء
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-500/20 text-xs">
              <Brain className="w-3 h-3 ml-1" />
              تحليلات AI
            </TabsTrigger>
            <TabsTrigger value="coaching" className="data-[state=active]:bg-green-500/20 text-xs">
              <Brain className="w-3 h-3 ml-1" />
              التدريب
            </TabsTrigger>
            <TabsTrigger value="automation" className="data-[state=active]:bg-purple-500/20 text-xs">
              <Brain className="w-3 h-3 ml-1" />
              الأتمتة
            </TabsTrigger>
            <TabsTrigger value="assistant" className="data-[state=active]:bg-pink-500/20 text-xs">
              <MessageCircle className="w-3 h-3 ml-1" />
              المساعد
            </TabsTrigger>
            <TabsTrigger value="routing" className="data-[state=active]:bg-blue-500/20 text-xs">
              <Bot className="w-3 h-3 ml-1" />
              التوجيه الذكي
            </TabsTrigger>
            <TabsTrigger value="crm-deep" className="data-[state=active]:bg-indigo-500/20 text-xs">
              <Users className="w-3 h-3 ml-1" />
              CRM متقدم
            </TabsTrigger>
            <TabsTrigger value="upsell" className="data-[state=active]:bg-emerald-500/20 text-xs">
              <Zap className="w-3 h-3 ml-1" />
              فرص البيع
            </TabsTrigger>
            <TabsTrigger value="rules" className="data-[state=active]:bg-orange-500/20 text-xs">
              <Brain className="w-3 h-3 ml-1" />
              قواعد مخصصة
            </TabsTrigger>
            <TabsTrigger value="personal" className="data-[state=active]:bg-cyan-500/20 text-xs">
              <BarChart3 className="w-3 h-3 ml-1" />
              لوحتي
            </TabsTrigger>
            <TabsTrigger value="live-coaching" className="data-[state=active]:bg-rose-500/20 text-xs">
              <Brain className="w-3 h-3 ml-1" />
              تدريب مباشر
            </TabsTrigger>
            </TabsList>

          <TabsContent value="conversation" className="mt-4 space-y-4">

        {/* Customer Context */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-lg">أم</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-white font-bold text-lg">أحمد محمد</p>
                <p className="text-slate-400 text-sm">عميل VIP • آخر تواصل: قبل 2 ساعة</p>
                <div className="flex gap-2 mt-2">
                  <Badge className="bg-green-500/20 text-green-400">5 تفاعلات</Badge>
                  <Badge className="bg-amber-500/20 text-amber-400">تذكرة مفتوحة</Badge>
                </div>
              </div>
              <Button variant="outline" className="border-slate-600">
                <History className="w-4 h-4 ml-1" />
                السجل الكامل
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Unified Conversation View */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm">المحادثة الموحدة (جميع القنوات)</CardTitle>
              <div className="flex gap-1">
                <Button size="sm" variant={channelFilter === 'all' ? 'default' : 'ghost'} className="h-6 text-xs" onClick={() => setChannelFilter('all')}>الكل</Button>
                {Object.keys(channelIcons).slice(0, 5).map(ch => {
                  const Icon = channelIcons[ch];
                  return (
                    <Button key={ch} size="sm" variant={channelFilter === ch ? 'default' : 'ghost'} className="h-6 w-6 p-0" onClick={() => setChannelFilter(ch)}>
                      <Icon className="w-3 h-3" />
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 pr-4">
              <div className="space-y-3">
                {filteredInteractions.map(interaction => {
                  const Icon = getChannelIcon(interaction.channel);
                  const color = channelColors[interaction.channel];
                  const isOut = interaction.direction === 'out';
                  
                  return (
                    <div key={interaction.id} className={`flex ${isOut ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${isOut ? 'bg-cyan-500/20 border border-cyan-500/30' : 'bg-slate-700/50'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`bg-${color}-500/20 text-${color}-400 text-xs`}>
                            <Icon className="w-3 h-3 ml-1" />
                            {interaction.channel}
                          </Badge>
                          <span className="text-slate-500 text-xs">{interaction.time}</span>
                        </div>
                        <p className="text-white text-sm">{interaction.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="mt-4 flex gap-2">
              <div className="flex-1 relative">
                <Input
                  id="message-input"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="اكتب رسالتك..."
                  className="bg-slate-800/50 border-slate-700 text-white pr-10"
                />
                <Button size="icon" variant="ghost" className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7">
                  <Smile className="w-4 h-4 text-slate-400" />
                </Button>
              </div>
              <Button size="icon" variant="ghost" className="border border-slate-700">
                <Paperclip className="w-4 h-4 text-slate-400" />
              </Button>
              <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={sendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {shortcuts.slice(0, 4).map(shortcut => (
                <Tooltip key={shortcut.key}>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" className="border-slate-600 h-7" onClick={() => executeAction(shortcut.handler)}>
                      <kbd className="bg-slate-700 px-1 rounded text-xs ml-1">Ctrl+{shortcut.key}</kbd>
                      {shortcut.action}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{shortcut.action}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Notification Settings */}
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              إعدادات الإشعارات المتقدمة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* General Settings */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                <Label className="text-slate-300 text-xs flex items-center gap-1">
                  {notifications.sound ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                  صوت
                </Label>
                <Switch checked={notifications.sound} onCheckedChange={(v) => setNotifications({...notifications, sound: v})} />
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                <Label className="text-slate-300 text-xs">مرئي</Label>
                <Switch checked={notifications.visual} onCheckedChange={(v) => setNotifications({...notifications, visual: v})} />
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                <Label className="text-slate-300 text-xs">سطح المكتب</Label>
                <Switch checked={notifications.desktop} onCheckedChange={(v) => setNotifications({...notifications, desktop: v})} />
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                <Label className="text-slate-300 text-xs">اهتزاز</Label>
                <Switch checked={notifications.vibrate} onCheckedChange={(v) => setNotifications({...notifications, vibrate: v})} />
              </div>
            </div>

            {/* Notification Types */}
            <div className="p-3 bg-slate-800/30 rounded-lg">
              <p className="text-slate-400 text-xs mb-2">أنواع الإشعارات</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[
                  { key: 'highPriority', label: 'أولوية عالية', color: 'red' },
                  { key: 'ticketUpdates', label: 'تحديثات التذاكر', color: 'blue' },
                  { key: 'inactivityAlerts', label: 'تنبيه الخمول', color: 'amber' },
                  { key: 'newMessages', label: 'رسائل جديدة', color: 'green' },
                  { key: 'escalations', label: 'التصعيدات', color: 'purple' },
                ].map(type => (
                  <div key={type.key} className={`flex items-center justify-between p-2 rounded border ${notifications[type.key] ? `bg-${type.color}-500/10 border-${type.color}-500/30` : 'bg-slate-800/50 border-slate-700'}`}>
                    <Label className="text-slate-300 text-xs">{type.label}</Label>
                    <Switch checked={notifications[type.key]} onCheckedChange={(v) => setNotifications({...notifications, [type.key]: v})} />
                  </div>
                ))}
              </div>
            </div>

            {/* Sound Preferences */}
            {notifications.sound && (
              <div className="p-3 bg-slate-800/30 rounded-lg">
                <p className="text-slate-400 text-xs mb-2">أصوات الإشعارات</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'callSound', label: 'المكالمات' },
                    { key: 'messageSound', label: 'الرسائل' },
                    { key: 'alertSound', label: 'التنبيهات' },
                  ].map(sound => (
                    <div key={sound.key}>
                      <Label className="text-slate-400 text-xs mb-1 block">{sound.label}</Label>
                      <select 
                        value={notifications[sound.key]} 
                        onChange={(e) => setNotifications({...notifications, [sound.key]: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                      >
                        <option value="bell">جرس</option>
                        <option value="chime">رنين</option>
                        <option value="urgent">عاجل</option>
                        <option value="soft">هادئ</option>
                        <option value="none">بدون صوت</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Knowledge Base - Collapsible */}
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowKnowledgeBase(!showKnowledgeBase)}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                📚 قاعدة المعرفة الذكية
                <kbd className="bg-slate-700 px-1 rounded text-xs text-cyan-400">Ctrl+K</kbd>
                {suggestedResponses.length > 0 && (
                  <Badge className="bg-green-500/20 text-green-400 animate-pulse">{suggestedResponses.length} اقتراح</Badge>
                )}
              </CardTitle>
              <Badge className={showKnowledgeBase ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}>
                {showKnowledgeBase ? 'مفتوح' : 'مغلق'}
              </Badge>
            </div>
          </CardHeader>
          {/* Quick Suggested Responses */}
          {suggestedResponses.length > 0 && !showKnowledgeBase && (
            <CardContent className="pt-0">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {suggestedResponses.slice(0, 3).map((resp, i) => (
                  <Button 
                    key={i} 
                    size="sm" 
                    variant="outline" 
                    className="border-green-500/30 text-green-400 text-xs whitespace-nowrap"
                    onClick={() => setMessageInput(resp)}
                  >
                    استخدام الرد {i + 1}
                  </Button>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
        {showKnowledgeBase && (
          <AIKnowledgeBase 
            conversationContext={interactions.map(i => i.message).join(' ')} 
            onSuggestResponse={(responses) => setSuggestedResponses(responses)}
          />
        )}
          </TabsContent>

          <TabsContent value="collaboration" className="mt-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <AgentCollaboration 
                currentCustomer={{ name: 'أحمد محمد', type: 'VIP' }}
                onShareScreen={(sharing) => setIsScreenSharing(sharing)}
              />
              <CaseEscalation
                caseDetails={{ customer: 'أحمد محمد', issue: 'استفسار عن الخدمة' }}
                onEscalate={(data) => {
                  toast.success('تم تصعيد الحالة');
                  addTicketUpdate(`تصعيد إلى: ${data.target}`);
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="kpi" className="mt-4">
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <AgentKPIDashboard agentId="current" />
              </div>
              <div className="space-y-4">
                <LiveSentimentAnalysis
                  isCallActive={isCallActive}
                  onSentimentAlert={(alert) => {
                    addTicketUpdate(`تنبيه مشاعر: ${alert.message}`);
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <CustomerPredictiveAnalytics
                customerData={{ name: 'أحمد محمد', type: 'VIP', interactions: 15 }}
                conversationHistory={interactions.map(i => i.message).join('\n')}
              />
              <AICustomerProfileIntegration
                customerId="CUS-001"
                customerData={{
                  name: 'أحمد محمد',
                  type: 'VIP',
                  interactions: 15,
                  lastContact: new Date().toISOString(),
                  totalValue: 12500
                }}
                onProfileUpdate={(data) => {
                  toast.success('تم تحديث ملف CRM بتحليلات AI');
                  setChurnRisk(data.churn_risk?.score || 25);
                  setCustomerIntent(data.purchase_intent?.reasoning || 'استفسار');
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="coaching" className="mt-4">
            <div className="space-y-4">
              <EnhancedAgentCoaching
                isCallActive={isCallActive}
                conversationTranscript={interactions.map(i => i.message).join('\n')}
                customerData={{ name: 'أحمد محمد', type: 'VIP' }}
                onSuggestionApplied={(suggestion) => {
                  if (suggestion.suggested_phrase) {
                    setMessageInput(suggestion.suggested_phrase);
                  }
                  toast.success('تم تطبيق الاقتراح');
                }}
                agentId="current-agent"
              />
            </div>
          </TabsContent>

          <TabsContent value="automation" className="mt-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <OmnichannelPostInteractionAutomation
                interactionData={{
                  channel: channelFilter !== 'all' ? channelFilter : 'voice',
                  summary: callSummary || interactions.map(i => i.message).join('\n'),
                  sentiment: customerIntent,
                  queryType: customerIntent,
                  resolved: false,
                  customerInfo: 'أحمد محمد - VIP'
                }}
                channel={channelFilter !== 'all' ? channelFilter : 'voice'}
                onAutomationComplete={(data) => {
                  setAutomatedTasks(data.automations || []);
                  toast.success('تم تنفيذ الأتمتة');
                }}
              />
              <div className="space-y-4">
                <PostCallAutomation
                  callSummary={callSummary}
                  customerIntent={customerIntent}
                  churnRisk={churnRisk}
                  onTaskCreated={(data) => {
                    setAutomatedTasks(prev => [...prev, ...(data.tasks || [])]);
                    toast.success(`تم إنشاء ${data.tasks?.length || 0} مهمة`);
                  }}
                />
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      المهام التلقائية النشطة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {automatedTasks.length === 0 ? (
                      <div className="text-center py-6 text-slate-500 text-sm">
                        لا توجد مهام تلقائية بعد
                      </div>
                    ) : (
                      <ScrollArea className="h-[180px]">
                        <div className="space-y-2">
                          {automatedTasks.map((task, i) => (
                            <div key={i} className="p-2 bg-slate-900/50 rounded-lg">
                              <p className="text-white text-sm">{task.title || task.type}</p>
                              <p className="text-slate-400 text-xs">{task.description || task.reason}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assistant" className="mt-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <AIAgentAssistantChatbot
                customerContext={`العميل: أحمد محمد - نوع: VIP`}
                conversationHistory={interactions.map(i => i.message).join('\n')}
                onSuggestResponse={(response) => setMessageInput(response)}
              />
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    ملخص سياق المحادثة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-900/50 rounded-lg">
                      <p className="text-slate-400 text-xs mb-1">العميل</p>
                      <p className="text-white font-medium">أحمد محمد - VIP</p>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-lg">
                      <p className="text-slate-400 text-xs mb-1">الموضوع</p>
                      <p className="text-white">{customerIntent}</p>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-lg">
                      <p className="text-slate-400 text-xs mb-1">خطر المغادرة</p>
                      <div className="flex items-center gap-2">
                        <Progress value={churnRisk} className="flex-1 h-2" />
                        <span className="text-white font-medium">{churnRisk}%</span>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-lg">
                      <p className="text-slate-400 text-xs mb-1">عدد التفاعلات</p>
                      <p className="text-white">{interactions.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="routing" className="mt-4">
            <OmnichannelAIRouter
              onRouteInquiry={(data) => {
                addTicketUpdate(`تم توجيه استفسار إلى ${data.department}`);
              }}
            />
          </TabsContent>

          <TabsContent value="crm-deep" className="mt-4">
            <BidirectionalCRMIntegration
              customerId="CUS-001"
              onCustomerDataFetched={(data) => {
                toast.success('تم تحميل سياق العميل من CRM');
              }}
            />
          </TabsContent>

          <TabsContent value="upsell" className="mt-4">
            <AIUpsellCrossSellIdentifier
              customerData={{
                id: 'CUS-001',
                name: 'أحمد محمد',
                tier: 'VIP',
                lifetime_value: 15000
              }}
              journeyData={{
                stages: ['awareness', 'consideration', 'purchase'],
                currentStage: 'purchase'
              }}
              crmHistory={{
                purchases: 8,
                lastPurchase: '2024-11-20',
                avgOrderValue: 2000
              }}
              onTaskCreate={(task) => {
                setAutomatedTasks(prev => [...prev, task]);
                toast.success(`تم إنشاء مهمة: ${task.title}`);
              }}
            />
          </TabsContent>

          <TabsContent value="rules" className="mt-4">
            <CustomAutomationRulesBuilder
              onRuleSave={(rule) => {
                toast.success(`تم حفظ القاعدة: ${rule.name}`);
              }}
            />
          </TabsContent>

          <TabsContent value="personal" className="mt-4">
            <PersonalizedAgentDashboard agentId="current-agent" />
          </TabsContent>

          <TabsContent value="live-coaching" className="mt-4">
            <RealtimeAgentCoaching
              isCallActive={isCallActive}
              conversationTranscript={interactions.map(i => i.message).join('\n')}
              customerData={{
                name: 'أحمد محمد',
                tier: 'VIP',
                history: 'عميل منذ 3 سنوات'
              }}
              onSuggestionApplied={(suggestion) => {
                if (suggestion.action) {
                  setMessageInput(suggestion.action);
                }
                toast.success('تم تطبيق الاقتراح');
              }}
            />
          </TabsContent>
          </Tabs>

        {/* Shortcuts Dialog */}
        <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
          <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-cyan-400" />
                اختصارات لوحة المفاتيح
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {shortcuts.map(shortcut => (
                <div key={shortcut.key} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                  <span className="text-white text-sm">{shortcut.icon} {shortcut.action}</span>
                  <kbd className="bg-slate-700 px-2 py-1 rounded text-cyan-400 text-xs">Ctrl+{shortcut.key}</kbd>
                </div>
              ))}
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded col-span-2">
                <span className="text-white text-sm">❓ عرض الاختصارات</span>
                <kbd className="bg-slate-700 px-2 py-1 rounded text-cyan-400 text-xs">Shift + ?</kbd>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Note Dialog */}
        <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
          <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                📝 إضافة ملاحظة
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="اكتب ملاحظتك هنا..."
                className="w-full h-32 p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white resize-none"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" className="border-slate-600" onClick={() => setShowNoteDialog(false)}>إلغاء</Button>
                <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={saveNote}>حفظ الملاحظة</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}