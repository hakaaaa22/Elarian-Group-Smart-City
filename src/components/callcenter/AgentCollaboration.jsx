import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Video, Monitor, Phone, MessageSquare, Share2, Mic, MicOff,
  VideoOff, Settings, X, Maximize2, Minimize2, Send, UserPlus, Shield,
  ScreenShare, ScreenShareOff, Volume2, VolumeX, Grid, Hand
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import AdvancedScreenShare from './AdvancedScreenShare';
import AgentConferenceSystem from './AgentConferenceSystem';

const onlineAgents = [
  { id: 1, name: 'محمد السعيد', status: 'available', department: 'الدعم الفني', avatar: 'م س' },
  { id: 2, name: 'سارة أحمد', status: 'busy', department: 'المبيعات', avatar: 'س أ' },
  { id: 3, name: 'خالد العتيبي', status: 'available', department: 'الدعم الفني', avatar: 'خ ع' },
  { id: 4, name: 'فاطمة الزهراء', status: 'in_call', department: 'خدمة العملاء', avatar: 'ف ز' },
  { id: 5, name: 'أحمد محمود', status: 'available', department: 'المشرفين', avatar: 'أ م' },
];

const statusConfig = {
  available: { color: 'green', label: 'متاح' },
  busy: { color: 'red', label: 'مشغول' },
  in_call: { color: 'amber', label: 'في مكالمة' },
  away: { color: 'slate', label: 'بعيد' },
};

export default function AgentCollaboration({ currentCustomer, onShareScreen }) {
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showScreenShare, setShowScreenShare] = useState(false);
  const [showConference, setShowConference] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [conferenceParticipants, setConferenceParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [selectedAgents, setSelectedAgents] = useState([]);

  const startScreenShare = () => {
    setIsScreenSharing(true);
    setShowScreenShare(true);
    toast.success('بدأت مشاركة الشاشة مع العميل');
    onShareScreen?.(true);
  };

  const stopScreenShare = () => {
    setIsScreenSharing(false);
    setShowScreenShare(false);
    toast.info('تم إيقاف مشاركة الشاشة');
    onShareScreen?.(false);
  };

  const startConference = () => {
    if (selectedAgents.length === 0) {
      toast.error('اختر وكلاء للمؤتمر');
      return;
    }
    setConferenceParticipants(selectedAgents.map(id => onlineAgents.find(a => a.id === id)));
    setShowConference(true);
    toast.success('بدأ المؤتمر بنجاح');
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'أنت',
      message: chatInput,
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    }]);
    setChatInput('');
  };

  const toggleAgentSelection = (agentId) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const [activeTab, setActiveTab] = useState('agents');

  return (
    <div className="space-y-4" dir="rtl">
      {/* Quick Actions Bar */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h4 className="text-white font-medium flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              أدوات التعاون المتقدمة
            </h4>
            <div className="flex gap-2">
              <Button
                size="sm"
                className={`${isScreenSharing ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
                onClick={isScreenSharing ? stopScreenShare : startScreenShare}
              >
                {isScreenSharing ? (
                  <><ScreenShareOff className="w-4 h-4 ml-1" /> إيقاف المشاركة</>
                ) : (
                  <><ScreenShare className="w-4 h-4 ml-1" /> مشاركة الشاشة</>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-purple-500/50 text-purple-400"
                onClick={() => setShowVideoCall(true)}
              >
                <Video className="w-4 h-4 ml-1" />
                مكالمة فيديو
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-green-500/50 text-green-400"
                onClick={() => setShowConference(true)}
              >
                <Grid className="w-4 h-4 ml-1" />
                مؤتمر
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Screen Share Active Indicator */}
      {isScreenSharing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-cyan-500/20 border border-cyan-500/30 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white font-medium">مشاركة الشاشة نشطة</span>
              <span className="text-cyan-400 text-sm">العميل يمكنه رؤية شاشتك</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-green-400" />}
              </Button>
              <Button size="sm" variant="destructive" onClick={stopScreenShare}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs for different collaboration modes */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="agents" className="data-[state=active]:bg-purple-500/20 text-xs">
            <Users className="w-3 h-3 ml-1" />
            الوكلاء
          </TabsTrigger>
          <TabsTrigger value="screen" className="data-[state=active]:bg-cyan-500/20 text-xs">
            <Monitor className="w-3 h-3 ml-1" />
            مشاركة الشاشة
          </TabsTrigger>
          <TabsTrigger value="conference" className="data-[state=active]:bg-green-500/20 text-xs">
            <Video className="w-3 h-3 ml-1" />
            المؤتمرات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="mt-4">
      {/* Online Agents */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-400" />
              الوكلاء المتصلون
            </span>
            <Badge className="bg-green-500/20 text-green-400">
              {onlineAgents.filter(a => a.status === 'available').length} متاح
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {onlineAgents.map(agent => {
              const status = statusConfig[agent.status];
              const isSelected = selectedAgents.includes(agent.id);
              return (
                <div
                  key={agent.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-purple-500/20 border border-purple-500/30' 
                      : 'bg-slate-900/50 hover:bg-slate-800/50'
                  }`}
                  onClick={() => toggleAgentSelection(agent.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-slate-700 text-white text-sm">
                          {agent.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-${status.color}-500 border-2 border-slate-900`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{agent.name}</p>
                      <p className="text-slate-400 text-xs">{agent.department}</p>
                    </div>
                    <Badge className={`bg-${status.color}-500/20 text-${status.color}-400 text-xs`}>
                      {status.label}
                    </Badge>
                    {isSelected && <Shield className="w-4 h-4 text-purple-400" />}
                  </div>
                </div>
              );
            })}
          </div>
          {selectedAgents.length > 0 && (
            <Button className="w-full mt-3 bg-purple-600 hover:bg-purple-700" onClick={startConference}>
              <Video className="w-4 h-4 ml-2" />
              بدء مؤتمر مع {selectedAgents.length} وكيل
            </Button>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="screen" className="mt-4">
          <AdvancedScreenShare
            customerData={currentCustomer}
            onShareChange={(sharing) => {
              setIsScreenSharing(sharing);
              onShareScreen?.(sharing);
            }}
          />
        </TabsContent>

        <TabsContent value="conference" className="mt-4">
          <AgentConferenceSystem
            currentCase={{ customer: currentCustomer?.name }}
            onConferenceChange={(active) => setShowConference(active)}
          />
        </TabsContent>
      </Tabs>

      {/* Conference Dialog */}
      <Dialog open={showConference} onOpenChange={setShowConference}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-400" />
              مؤتمر الوكلاء
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {/* Video Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Self View */}
              <div className="aspect-video bg-slate-800 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-purple-500/20 text-purple-400 text-2xl">أنت</AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <Badge className="bg-slate-900/80 text-white text-xs">أنت (المضيف)</Badge>
                  <div className="flex gap-1">
                    {!isMuted && <Mic className="w-3 h-3 text-green-400" />}
                    {isVideoOn && <Video className="w-3 h-3 text-green-400" />}
                  </div>
                </div>
              </div>
              {/* Participants */}
              {conferenceParticipants.map(participant => (
                <div key={participant.id} className="aspect-video bg-slate-800 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-xl">
                        {participant.avatar}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <Badge className="bg-slate-900/80 text-white text-xs">{participant.name}</Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-700">
              <Button
                size="lg"
                variant="outline"
                className={`rounded-full w-12 h-12 ${isMuted ? 'bg-red-500/20 border-red-500' : 'border-slate-600'}`}
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="w-5 h-5 text-red-400" /> : <Mic className="w-5 h-5 text-white" />}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className={`rounded-full w-12 h-12 ${!isVideoOn ? 'bg-red-500/20 border-red-500' : 'border-slate-600'}`}
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                {isVideoOn ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-red-400" />}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className={`rounded-full w-12 h-12 ${isScreenSharing ? 'bg-cyan-500/20 border-cyan-500' : 'border-slate-600'}`}
                onClick={() => setIsScreenSharing(!isScreenSharing)}
              >
                <Monitor className="w-5 h-5 text-cyan-400" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full w-12 h-12 border-slate-600"
              >
                <Hand className="w-5 h-5 text-amber-400" />
              </Button>
              <Button
                size="lg"
                variant="destructive"
                className="rounded-full w-14 h-14"
                onClick={() => setShowConference(false)}
              >
                <Phone className="w-5 h-5 rotate-[135deg]" />
              </Button>
            </div>

            {/* Chat */}
            <div className="border-t border-slate-700 pt-4">
              <div className="flex gap-2">
                <ScrollArea className="flex-1 h-20 bg-slate-900/50 rounded-lg p-2">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className="text-xs mb-1">
                      <span className="text-cyan-400">{msg.sender}:</span>
                      <span className="text-white mr-1">{msg.message}</span>
                    </div>
                  ))}
                </ScrollArea>
                <div className="flex gap-1">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="اكتب رسالة..."
                    className="w-40 h-8 bg-slate-800 border-slate-700 text-white text-xs"
                  />
                  <Button size="sm" className="h-8" onClick={sendChatMessage}>
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}