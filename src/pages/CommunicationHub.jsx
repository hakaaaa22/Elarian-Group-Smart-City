import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle, Users, Send, Radio, Search, Phone, Video, Paperclip,
  Hash, AtSign, Bell, Settings, Plus, Check, CheckCheck, Clock, Star,
  Smile, Image, File, Mic, MoreVertical, Pin, Archive, Trash2, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// المحادثات
const conversations = [
  { id: 1, type: 'direct', name: 'محمد أحمد', role: 'فني صيانة', status: 'online', unread: 3, lastMessage: 'تم الوصول للموقع', time: '2 د', pinned: true },
  { id: 2, type: 'direct', name: 'خالد السعيد', role: 'سائق', status: 'online', unread: 0, lastMessage: 'في الطريق', time: '5 د', pinned: false },
  { id: 3, type: 'group', name: 'فريق الصيانة', members: 8, unread: 5, lastMessage: 'اجتماع الساعة 10', time: '10 د', pinned: true },
  { id: 4, type: 'task', name: 'مهمة #1234', taskType: 'صيانة طارئة', unread: 2, lastMessage: 'تم طلب القطع', time: '15 د', pinned: false },
  { id: 5, type: 'group', name: 'السائقين', members: 15, unread: 0, lastMessage: 'تحديث المسارات', time: '30 د', pinned: false },
  { id: 6, type: 'broadcast', name: 'إعلانات عامة', recipients: 50, lastMessage: 'عطلة رسمية غداً', time: '1 س', pinned: false },
];

// الرسائل
const messages = [
  { id: 1, sender: 'محمد أحمد', text: 'السلام عليكم، وصلت للموقع', time: '10:30', status: 'read', isMe: false },
  { id: 2, sender: 'أنا', text: 'تمام، ابدأ بفحص المكيف أولاً', time: '10:31', status: 'read', isMe: true },
  { id: 3, sender: 'محمد أحمد', text: 'حاضر، الجهاز يحتاج تغيير فلتر', time: '10:35', status: 'read', isMe: false },
  { id: 4, sender: 'أنا', text: 'هل الفلتر متوفر معك؟', time: '10:36', status: 'read', isMe: true },
  { id: 5, sender: 'محمد أحمد', text: 'نعم، سأقوم بالتغيير الآن', time: '10:37', status: 'delivered', isMe: false },
  { id: 6, sender: 'محمد أحمد', text: 'تم الوصول للموقع', time: '10:40', status: 'sent', isMe: false, attachment: { type: 'image', name: 'صورة_الجهاز.jpg' } },
];

// المجموعات
const groups = [
  { id: 1, name: 'فريق الصيانة', members: 8, type: 'team' },
  { id: 2, name: 'السائقين', members: 15, type: 'drivers' },
  { id: 3, name: 'المشرفين', members: 5, type: 'supervisors' },
  { id: 4, name: 'الطوارئ', members: 12, type: 'emergency' },
];

export default function CommunicationHub() {
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState(conversations[0]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastGroups, setBroadcastGroups] = useState([]);

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    toast.success('تم إرسال الرسالة');
    setMessageInput('');
  };

  const sendBroadcast = () => {
    if (!broadcastMessage.trim() || broadcastGroups.length === 0) {
      toast.error('يرجى كتابة رسالة واختيار مجموعة');
      return;
    }
    toast.success(`تم إرسال البث لـ ${broadcastGroups.length} مجموعات`);
    setShowBroadcast(false);
    setBroadcastMessage('');
    setBroadcastGroups([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-amber-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-cyan-400" />
              مركز التواصل
            </h1>
            <p className="text-slate-400 mt-1">التواصل الداخلي وإدارة الرسائل</p>
          </div>
          <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowBroadcast(true)}>
            <Radio className="w-4 h-4 ml-2" />
            بث جماعي
          </Button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full bg-slate-800/50">
                  <TabsTrigger value="chats" className="flex-1">الكل</TabsTrigger>
                  <TabsTrigger value="direct" className="flex-1">مباشر</TabsTrigger>
                  <TabsTrigger value="groups" className="flex-1">مجموعات</TabsTrigger>
                  <TabsTrigger value="tasks" className="flex-1">مهام</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="relative mt-2">
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="بحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8 bg-slate-800/50 border-slate-700 text-white h-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-2">
            <ScrollArea className="h-[calc(100vh-380px)]">
              <div className="space-y-1">
                {conversations
                  .filter(c => activeTab === 'chats' || c.type === activeTab || (activeTab === 'groups' && c.type === 'broadcast'))
                  .filter(c => c.name.includes(searchQuery))
                  .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
                  .map(conv => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedChat(conv)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedChat?.id === conv.id ? 'bg-cyan-500/20 border border-cyan-500/30' : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className={`${
                              conv.type === 'group' ? 'bg-purple-500/20 text-purple-400' :
                              conv.type === 'task' ? 'bg-amber-500/20 text-amber-400' :
                              conv.type === 'broadcast' ? 'bg-green-500/20 text-green-400' :
                              'bg-cyan-500/20 text-cyan-400'
                            }`}>
                              {conv.type === 'group' ? <Users className="w-5 h-5" /> :
                               conv.type === 'task' ? <Hash className="w-5 h-5" /> :
                               conv.type === 'broadcast' ? <Radio className="w-5 h-5" /> :
                               conv.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {conv.status && <span className={`absolute bottom-0 left-0 w-3 h-3 rounded-full border-2 border-[#0f1629] ${getStatusColor(conv.status)}`} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {conv.pinned && <Pin className="w-3 h-3 text-amber-400" />}
                              <p className="text-white font-medium text-sm truncate">{conv.name}</p>
                            </div>
                            <span className="text-slate-500 text-xs">{conv.time}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-slate-400 text-xs truncate">{conv.lastMessage}</p>
                            {conv.unread > 0 && (
                              <Badge className="bg-cyan-500 text-white text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">
                                {conv.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 h-full flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-cyan-500/20 text-cyan-400">
                          {selectedChat.type === 'group' ? <Users className="w-5 h-5" /> : selectedChat.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-medium">{selectedChat.name}</p>
                        <p className="text-slate-400 text-sm">
                          {selectedChat.type === 'direct' ? (selectedChat.status === 'online' ? 'متصل الآن' : 'غير متصل') :
                           selectedChat.type === 'group' ? `${selectedChat.members} أعضاء` :
                           selectedChat.type === 'task' ? selectedChat.taskType : `${selectedChat.recipients} مستلم`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost"><Phone className="w-4 h-4 text-slate-400" /></Button>
                      <Button size="icon" variant="ghost"><Video className="w-4 h-4 text-slate-400" /></Button>
                      <Button size="icon" variant="ghost"><MoreVertical className="w-4 h-4 text-slate-400" /></Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.isMe ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[70%] ${msg.isMe ? 'order-2' : ''}`}>
                          <div className={`p-3 rounded-2xl ${
                            msg.isMe ? 'bg-cyan-500/20 text-white rounded-tr-none' : 'bg-slate-800/50 text-white rounded-tl-none'
                          }`}>
                            {msg.attachment && (
                              <div className="flex items-center gap-2 p-2 bg-slate-700/50 rounded mb-2">
                                <Image className="w-4 h-4 text-cyan-400" />
                                <span className="text-sm">{msg.attachment.name}</span>
                              </div>
                            )}
                            <p className="text-sm">{msg.text}</p>
                          </div>
                          <div className={`flex items-center gap-1 mt-1 ${msg.isMe ? 'justify-start' : 'justify-end'}`}>
                            <span className="text-slate-500 text-xs">{msg.time}</span>
                            {msg.isMe && (
                              msg.status === 'read' ? <CheckCheck className="w-3 h-3 text-cyan-400" /> :
                              msg.status === 'delivered' ? <CheckCheck className="w-3 h-3 text-slate-400" /> :
                              <Check className="w-3 h-3 text-slate-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t border-slate-700/50">
                  <div className="flex gap-2 items-end">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost"><Paperclip className="w-4 h-4 text-slate-400" /></Button>
                      <Button size="icon" variant="ghost"><Image className="w-4 h-4 text-slate-400" /></Button>
                      <Button size="icon" variant="ghost"><Mic className="w-4 h-4 text-slate-400" /></Button>
                    </div>
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="اكتب رسالتك..."
                      className="flex-1 bg-slate-800/50 border-slate-700 text-white"
                    />
                    <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={sendMessage}>
                      <Send className="w-4 h-4" />
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

      {/* Broadcast Dialog */}
      <Dialog open={showBroadcast} onOpenChange={setShowBroadcast}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-green-400" />
              بث جماعي
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-slate-300 text-sm mb-2 block">اختر المجموعات</label>
              <div className="grid grid-cols-2 gap-2">
                {groups.map(group => (
                  <Button
                    key={group.id}
                    variant={broadcastGroups.includes(group.id) ? 'default' : 'outline'}
                    className={broadcastGroups.includes(group.id) ? 'bg-cyan-600' : 'border-slate-600'}
                    onClick={() => {
                      if (broadcastGroups.includes(group.id)) {
                        setBroadcastGroups(broadcastGroups.filter(g => g !== group.id));
                      } else {
                        setBroadcastGroups([...broadcastGroups, group.id]);
                      }
                    }}
                  >
                    {group.name} ({group.members})
                  </Button>
                ))}
              </div>
            </div>
            <Textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="اكتب رسالة البث..."
              className="bg-slate-800/50 border-slate-700 text-white min-h-[100px]"
            />
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={sendBroadcast}>
              <Send className="w-4 h-4 ml-2" />
              إرسال البث
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}