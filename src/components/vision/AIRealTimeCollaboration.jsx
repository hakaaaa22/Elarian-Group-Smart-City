import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, MessageSquare, Video, Edit3, Eye, Circle, Send, Smile,
  AtSign, Paperclip, MoreHorizontal, X, Maximize2, Minimize2,
  Phone, PhoneOff, Mic, MicOff, Camera, CameraOff, Share2, Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const teamMembers = [
  { id: 1, name: 'أحمد محمد', email: 'ahmed@company.com', status: 'online', color: 'green', editing: 'model_config.json', cursor: { line: 45, col: 12 } },
  { id: 2, name: 'سارة علي', email: 'sara@company.com', status: 'online', color: 'purple', editing: null, cursor: null },
  { id: 3, name: 'خالد العريان', email: 'khaled@company.com', status: 'away', color: 'amber', editing: 'training_params.py', cursor: { line: 128, col: 8 } },
  { id: 4, name: 'نورة أحمد', email: 'noura@company.com', status: 'offline', color: 'slate', editing: null, cursor: null },
];

const chatMessages = [
  { id: 1, user: 'أحمد محمد', message: 'قمت بتحديث معلمات التدريب', time: '10:30', type: 'text' },
  { id: 2, user: 'سارة علي', message: 'ممتاز! سأراجع التغييرات الآن', time: '10:32', type: 'text' },
  { id: 3, user: 'System', message: 'أحمد محمد قام بتعديل model_config.json', time: '10:35', type: 'system' },
];

const annotations = [
  { id: 1, user: 'سارة علي', target: 'model_v2.1', comment: 'يجب زيادة عدد الطبقات للحصول على دقة أعلى', resolved: false },
  { id: 2, user: 'خالد العريان', target: 'dataset_train', comment: 'البيانات تحتاج تنظيف إضافي', resolved: true },
];

export default function AIRealTimeCollaboration() {
  const [activeTab, setActiveTab] = useState('presence');
  const [chatOpen, setChatOpen] = useState(false);
  const [videoCall, setVideoCall] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(chatMessages);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages([...messages, { id: Date.now(), user: 'أنت', message, time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }), type: 'text' }]);
    setMessage('');
  };

  const addAnnotation = () => {
    if (!newAnnotation.trim()) return;
    toast.success('تم إضافة التعليق');
    setNewAnnotation('');
  };

  const startVideoCall = () => {
    setVideoCall(true);
    toast.success('جاري بدء المكالمة...');
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20"
          >
            <Users className="w-5 h-5 text-blue-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">التعاون في الوقت الفعلي</h4>
            <p className="text-slate-400 text-xs">التحرير المشترك • الدردشة • مكالمات الفيديو</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="border-blue-500/50" onClick={() => setChatOpen(!chatOpen)}>
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={startVideoCall}>
            <Video className="w-4 h-4 ml-1" />
            مكالمة
          </Button>
        </div>
      </div>

      {/* Online Team Members */}
      <div className="flex items-center gap-2 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
        <span className="text-slate-400 text-sm">متصل الآن:</span>
        <div className="flex -space-x-2 space-x-reverse">
          {teamMembers.filter(m => m.status === 'online').map((member) => (
            <motion.div key={member.id} whileHover={{ scale: 1.1, zIndex: 10 }} className="relative">
              <Avatar className={`w-8 h-8 border-2 border-${member.color}-500 cursor-pointer`}>
                <AvatarFallback className={`bg-${member.color}-500/20 text-${member.color}-400 text-xs`}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-800" />
            </motion.div>
          ))}
        </div>
        <Badge className="bg-green-500/20 text-green-400 mr-2">{teamMembers.filter(m => m.status === 'online').length} متصل</Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="presence" className="data-[state=active]:bg-blue-500/20">
            <Eye className="w-3 h-3 ml-1" />
            الحضور
          </TabsTrigger>
          <TabsTrigger value="editing" className="data-[state=active]:bg-purple-500/20">
            <Edit3 className="w-3 h-3 ml-1" />
            التحرير المشترك
          </TabsTrigger>
          <TabsTrigger value="annotations" className="data-[state=active]:bg-amber-500/20">
            <MessageSquare className="w-3 h-3 ml-1" />
            التعليقات
          </TabsTrigger>
        </TabsList>

        {/* Presence Tab */}
        <TabsContent value="presence" className="mt-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">أعضاء الفريق</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className={`bg-${member.color}-500/20 text-${member.color}-400`}>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800 ${
                          member.status === 'online' ? 'bg-green-500' :
                          member.status === 'away' ? 'bg-amber-500' : 'bg-slate-500'
                        }`} />
                      </div>
                      <div>
                        <p className="text-white font-medium">{member.name}</p>
                        <p className="text-slate-400 text-xs">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.editing && (
                        <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                          <Edit3 className="w-3 h-3 ml-1" />
                          {member.editing}
                        </Badge>
                      )}
                      <Badge className={`text-xs ${
                        member.status === 'online' ? 'bg-green-500/20 text-green-400' :
                        member.status === 'away' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-slate-600 text-slate-400'
                      }`}>
                        {member.status === 'online' ? 'متصل' : member.status === 'away' ? 'بعيد' : 'غير متصل'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Co-editing Tab */}
        <TabsContent value="editing" className="mt-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-400" />
                التحرير المباشر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700">
                  <span className="text-slate-400">model_config.json</span>
                  <div className="flex -space-x-1 space-x-reverse mr-auto">
                    {teamMembers.filter(m => m.editing === 'model_config.json').map(m => (
                      <Avatar key={m.id} className="w-5 h-5">
                        <AvatarFallback className={`text-[8px] bg-${m.color}-500/30 text-${m.color}-400`}>
                          {m.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
                <div className="space-y-1 text-slate-300">
                  <div className="flex"><span className="text-slate-500 w-8">1</span><span className="text-purple-400">{"{"}</span></div>
                  <div className="flex"><span className="text-slate-500 w-8">2</span><span className="text-cyan-400 mr-4">"model_name"</span>: <span className="text-green-400">"weapon_detection_v2"</span>,</div>
                  <div className="flex relative">
                    <span className="text-slate-500 w-8">3</span>
                    <span className="text-cyan-400 mr-4">"learning_rate"</span>: <span className="text-amber-400">0.001</span>,
                    <motion.div 
                      animate={{ opacity: [1, 0, 1] }} 
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute right-20 w-0.5 h-4 bg-green-400"
                    />
                    <Badge className="absolute right-0 bg-green-500/20 text-green-400 text-[8px]">أحمد</Badge>
                  </div>
                  <div className="flex"><span className="text-slate-500 w-8">4</span><span className="text-cyan-400 mr-4">"epochs"</span>: <span className="text-amber-400">50</span>,</div>
                  <div className="flex"><span className="text-slate-500 w-8">5</span><span className="text-purple-400">{"}"}</span></div>
                </div>
              </div>
              <p className="text-slate-400 text-xs mt-2 text-center">يمكنك رؤية مؤشرات الفريق أثناء التحرير المباشر</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Annotations Tab */}
        <TabsContent value="annotations" className="mt-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">التعليقات والملاحظات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {annotations.map((ann) => (
                <div key={ann.id} className={`p-3 rounded-lg border ${ann.resolved ? 'bg-green-500/5 border-green-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-[10px]">{ann.user[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-white text-sm font-medium">{ann.user}</span>
                    </div>
                    <Badge className={ann.resolved ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                      {ann.resolved ? 'تم الحل' : 'مفتوح'}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-xs mb-1">على: {ann.target}</p>
                  <p className="text-slate-300 text-sm">{ann.comment}</p>
                </div>
              ))}
              <div className="flex gap-2 mt-4">
                <Input
                  value={newAnnotation}
                  onChange={(e) => setNewAnnotation(e.target.value)}
                  placeholder="أضف تعليقاً..."
                  className="bg-slate-900 border-slate-700 text-white"
                />
                <Button onClick={addAnnotation} className="bg-amber-600 hover:bg-amber-700">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Chat Panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-4 w-80 z-50"
          >
            <Card className="bg-slate-900 border-slate-700 shadow-2xl">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-white text-sm">دردشة الفريق</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setChatOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-64 p-3">
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`${msg.type === 'system' ? 'text-center' : ''}`}>
                        {msg.type === 'system' ? (
                          <span className="text-slate-500 text-xs">{msg.message}</span>
                        ) : (
                          <div className={`p-2 rounded-lg ${msg.user === 'أنت' ? 'bg-blue-500/20 mr-4' : 'bg-slate-800 ml-4'}`}>
                            <p className="text-xs text-slate-400 mb-1">{msg.user} • {msg.time}</p>
                            <p className="text-white text-sm">{msg.message}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-3 border-t border-slate-700 flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="اكتب رسالة..."
                    className="bg-slate-800 border-slate-700 text-white text-sm"
                  />
                  <Button size="sm" onClick={sendMessage} className="bg-blue-600">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Call Panel */}
      <AnimatePresence>
        {videoCall && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-4 z-50 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h4 className="text-white font-bold">مكالمة الفريق</h4>
              <Button size="sm" variant="ghost" onClick={() => setVideoCall(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4 p-4">
              {teamMembers.filter(m => m.status === 'online').slice(0, 4).map((member) => (
                <div key={member.id} className="relative bg-slate-800 rounded-xl flex items-center justify-center">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className={`text-2xl bg-${member.color}-500/20 text-${member.color}-400`}>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-2 right-2 text-white text-sm bg-slate-900/80 px-2 py-1 rounded">{member.name}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 p-4 border-t border-slate-700">
              <Button size="lg" variant={isMuted ? 'destructive' : 'outline'} className="rounded-full w-12 h-12" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              <Button size="lg" variant={!isCameraOn ? 'destructive' : 'outline'} className="rounded-full w-12 h-12" onClick={() => setIsCameraOn(!isCameraOn)}>
                {isCameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
              </Button>
              <Button size="lg" variant="destructive" className="rounded-full w-12 h-12" onClick={() => setVideoCall(false)}>
                <PhoneOff className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full w-12 h-12">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}