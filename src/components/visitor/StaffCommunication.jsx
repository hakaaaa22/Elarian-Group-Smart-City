import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Users, Shield, Bell, CheckCheck, Check,
  Clock, AlertTriangle, Search, Plus, Phone, Video, MoreVertical,
  Pin, Trash2, Reply, Forward, Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const staffMembers = [
  { id: 1, name: 'أحمد السعيد', role: 'مشرف الأمن', status: 'online', avatar: 'أ' },
  { id: 2, name: 'محمد الفهد', role: 'حارس البوابة', status: 'online', avatar: 'م' },
  { id: 3, name: 'سارة خالد', role: 'موظفة الاستقبال', status: 'away', avatar: 'س' },
  { id: 4, name: 'خالد العريان', role: 'مدير الأمن', status: 'online', avatar: 'خ' },
  { id: 5, name: 'فاطمة أحمد', role: 'موظفة التصاريح', status: 'offline', avatar: 'ف' },
];

const quickAlerts = [
  { id: 1, text: 'زائر وصل للبوابة', type: 'info' },
  { id: 2, text: 'تنبيه أمني - يرجى الانتباه', type: 'warning' },
  { id: 3, text: 'زائر VIP قادم', type: 'vip' },
  { id: 4, text: 'طلب دعم فوري', type: 'urgent' },
];

const mockMessages = [
  { id: 1, sender: 1, text: 'الزائر أحمد محمد وصل للبوابة الرئيسية', time: '10:30', read: true, readBy: [2, 3] },
  { id: 2, sender: 2, text: 'تم التحقق من هويته، جاري الإدخال', time: '10:31', read: true, readBy: [1, 3] },
  { id: 3, sender: 3, text: 'المضيف في طريقه للاستقبال', time: '10:32', read: true, readBy: [1, 2] },
  { id: 4, sender: 4, text: 'ممتاز، شكراً للجميع على التنسيق', time: '10:33', read: false, readBy: [] },
];

export default function StaffCommunication() {
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState('group');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const msg = {
      id: Date.now(),
      sender: 4, // Current user
      text: newMessage,
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      readBy: []
    };
    setMessages([...messages, msg]);
    setNewMessage('');
    toast.success('تم إرسال الرسالة');
  };

  const sendQuickAlert = (alert) => {
    const msg = {
      id: Date.now(),
      sender: 4,
      text: `⚡ ${alert.text}`,
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      readBy: [],
      isAlert: true,
      alertType: alert.type
    };
    setMessages([...messages, msg]);
    toast.success('تم إرسال التنبيه السريع');
  };

  const getStatusColor = (status) => {
    return status === 'online' ? 'bg-green-500' : status === 'away' ? 'bg-amber-500' : 'bg-slate-500';
  };

  const getSender = (id) => staffMembers.find(s => s.id === id);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
            <MessageSquare className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">التواصل الداخلي</h3>
            <p className="text-slate-500 text-sm">تواصل فوري بين فريق الأمن والاستقبال</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {staffMembers.filter(s => s.status === 'online').length} متصل
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Staff List */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              الفريق
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
            
            <div
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selectedChat === 'group' ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-slate-900/50 hover:bg-slate-800/50'
              }`}
              onClick={() => setSelectedChat('group')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">المجموعة العامة</p>
                  <p className="text-slate-500 text-xs">{staffMembers.length} أعضاء</p>
                </div>
              </div>
            </div>

            {staffMembers.map(member => (
              <div
                key={member.id}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedChat === member.id ? 'bg-cyan-500/20 border border-cyan-500/50' : 'bg-slate-900/50 hover:bg-slate-800/50'
                }`}
                onClick={() => setSelectedChat(member.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-cyan-500/20 text-cyan-400">{member.avatar}</AvatarFallback>
                    </Avatar>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800 ${getStatusColor(member.status)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{member.name}</p>
                    <p className="text-slate-500 text-xs truncate">{member.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-3 bg-slate-800/30 border-slate-700/50 flex flex-col h-[600px]">
          {/* Chat Header */}
          <CardHeader className="pb-2 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">المجموعة العامة</p>
                  <p className="text-slate-500 text-xs">{staffMembers.filter(s => s.status === 'online').length} متصل الآن</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" className="h-9 w-9">
                  <Phone className="w-4 h-4 text-slate-400" />
                </Button>
                <Button size="icon" variant="ghost" className="h-9 w-9">
                  <Video className="w-4 h-4 text-slate-400" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map(msg => {
                const sender = getSender(msg.sender);
                const isMe = msg.sender === 4;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`flex items-end gap-2 max-w-[70%] ${isMe ? 'flex-row' : 'flex-row-reverse'}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-xs">{sender?.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        {!isMe && <p className="text-slate-500 text-xs mb-1">{sender?.name}</p>}
                        <div className={`p-3 rounded-xl ${
                          msg.isAlert 
                            ? msg.alertType === 'urgent' ? 'bg-red-500/20 border border-red-500/50' 
                            : msg.alertType === 'warning' ? 'bg-amber-500/20 border border-amber-500/50'
                            : msg.alertType === 'vip' ? 'bg-purple-500/20 border border-purple-500/50'
                            : 'bg-cyan-500/20 border border-cyan-500/50'
                            : isMe ? 'bg-blue-600' : 'bg-slate-700'
                        }`}>
                          <p className="text-white text-sm">{msg.text}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 ${isMe ? '' : 'justify-end'}`}>
                          <span className="text-slate-500 text-xs">{msg.time}</span>
                          {isMe && (
                            msg.read ? <CheckCheck className="w-3 h-3 text-blue-400" /> : <Check className="w-3 h-3 text-slate-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Alerts */}
          <div className="px-4 py-2 border-t border-slate-700/50">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {quickAlerts.map(alert => (
                <Button
                  key={alert.id}
                  size="sm"
                  variant="outline"
                  className={`whitespace-nowrap h-8 ${
                    alert.type === 'urgent' ? 'border-red-500/50 text-red-400' :
                    alert.type === 'warning' ? 'border-amber-500/50 text-amber-400' :
                    alert.type === 'vip' ? 'border-purple-500/50 text-purple-400' :
                    'border-cyan-500/50 text-cyan-400'
                  }`}
                  onClick={() => sendQuickAlert(alert)}
                >
                  <Bell className="w-3 h-3 ml-1" />
                  {alert.text}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex gap-2">
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
        </Card>
      </div>
    </div>
  );
}