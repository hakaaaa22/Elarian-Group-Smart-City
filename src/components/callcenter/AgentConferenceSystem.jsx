import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Plus,
  Settings, MessageSquare, Hand, Crown, UserPlus, X, Volume2,
  VolumeX, ScreenShare, StopCircle, Circle, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const availableAgents = [
  { id: 1, name: 'سارة أحمد', department: 'الدعم الفني', status: 'available', avatar: 'س' },
  { id: 2, name: 'محمد علي', department: 'المبيعات', status: 'available', avatar: 'م' },
  { id: 3, name: 'فاطمة خالد', department: 'خدمة العملاء', status: 'busy', avatar: 'ف' },
  { id: 4, name: 'أحمد حسن', department: 'الدعم الفني', status: 'available', avatar: 'أ' },
  { id: 5, name: 'نورة سعيد', department: 'المشرفين', status: 'available', avatar: 'ن' },
];

export default function AgentConferenceSystem({ currentCase, onConferenceChange }) {
  const [isInConference, setIsInConference] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [conferenceType, setConferenceType] = useState('audio'); // audio, video
  const [controls, setControls] = useState({
    muted: false,
    videoOff: false,
    screenShare: false,
    recording: false,
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [duration, setDuration] = useState(0);

  // Start duration timer when conference is active
  React.useEffect(() => {
    let interval;
    if (isInConference) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInConference]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startConference = () => {
    setIsInConference(true);
    setDuration(0);
    onConferenceChange?.(true);
    toast.success('تم بدء المؤتمر');
  };

  const endConference = () => {
    setIsInConference(false);
    setParticipants([]);
    onConferenceChange?.(false);
    toast.info('تم إنهاء المؤتمر');
  };

  const inviteAgent = (agent) => {
    if (!participants.find(p => p.id === agent.id)) {
      setParticipants(prev => [...prev, { ...agent, muted: false, videoOff: false }]);
      toast.success(`تم دعوة ${agent.name}`);
    }
    setShowInviteDialog(false);
  };

  const removeParticipant = (agentId) => {
    setParticipants(prev => prev.filter(p => p.id !== agentId));
    toast.info('تم إزالة المشارك');
  };

  const toggleParticipantMute = (agentId) => {
    setParticipants(prev => prev.map(p => 
      p.id === agentId ? { ...p, muted: !p.muted } : p
    ));
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

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={isInConference ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`p-2 rounded-xl ${isInConference ? 'bg-purple-500/20' : 'bg-slate-700/50'}`}
          >
            <Users className={`w-5 h-5 ${isInConference ? 'text-purple-400' : 'text-slate-400'}`} />
          </motion.div>
          <div>
            <h4 className="text-white font-bold flex items-center gap-2">
              مؤتمر الوكلاء
              {isInConference && (
                <Badge className="bg-purple-500/20 text-purple-400 animate-pulse">
                  <Circle className="w-2 h-2 ml-1 fill-purple-400" />
                  {formatDuration(duration)}
                </Badge>
              )}
            </h4>
            <p className="text-slate-400 text-xs">Agent Conference System</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isInConference && (
            <Button
              size="sm"
              variant="outline"
              className="border-purple-500/50"
              onClick={() => setShowInviteDialog(true)}
            >
              <UserPlus className="w-4 h-4 ml-1" />
              دعوة
            </Button>
          )}
          <Button
            className={isInConference ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}
            onClick={isInConference ? endConference : startConference}
          >
            {isInConference ? (
              <><PhoneOff className="w-4 h-4 ml-2" /> إنهاء</>
            ) : (
              <><Phone className="w-4 h-4 ml-2" /> بدء مؤتمر</>
            )}
          </Button>
        </div>
      </div>

      {/* Conference Type Selection */}
      {!isInConference && (
        <div className="flex gap-2">
          <Button
            className={`flex-1 ${conferenceType === 'audio' ? 'bg-purple-600' : 'bg-slate-700'}`}
            onClick={() => setConferenceType('audio')}
          >
            <Phone className="w-4 h-4 ml-2" />
            مكالمة صوتية
          </Button>
          <Button
            className={`flex-1 ${conferenceType === 'video' ? 'bg-purple-600' : 'bg-slate-700'}`}
            onClick={() => setConferenceType('video')}
          >
            <Video className="w-4 h-4 ml-2" />
            مكالمة فيديو
          </Button>
        </div>
      )}

      {isInConference && (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Video/Audio Grid */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* Self */}
                  <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center relative">
                    {conferenceType === 'video' && !controls.videoOff ? (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-lg" />
                    ) : null}
                    <div className="text-center z-10">
                      <Avatar className="h-16 w-16 mx-auto mb-2">
                        <AvatarFallback className="bg-purple-500/20 text-purple-400 text-2xl">أ</AvatarFallback>
                      </Avatar>
                      <p className="text-white text-sm">أنت</p>
                    </div>
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      {controls.muted && <Badge className="bg-red-500/20 text-red-400"><MicOff className="w-3 h-3" /></Badge>}
                      {controls.videoOff && <Badge className="bg-slate-600"><VideoOff className="w-3 h-3" /></Badge>}
                    </div>
                    <Badge className="absolute top-2 right-2 bg-purple-500/20 text-purple-400">
                      <Crown className="w-3 h-3 ml-1" />
                      المضيف
                    </Badge>
                  </div>

                  {/* Participants */}
                  {participants.map(participant => (
                    <div key={participant.id} className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center relative">
                      <div className="text-center">
                        <Avatar className="h-16 w-16 mx-auto mb-2">
                          <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-2xl">
                            {participant.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-white text-sm">{participant.name}</p>
                        <p className="text-slate-500 text-xs">{participant.department}</p>
                      </div>
                      <div className="absolute bottom-2 left-2 flex gap-1">
                        {participant.muted && <Badge className="bg-red-500/20 text-red-400"><MicOff className="w-3 h-3" /></Badge>}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 left-2 h-6 w-6"
                        onClick={() => removeParticipant(participant.id)}
                      >
                        <X className="w-3 h-3 text-red-400" />
                      </Button>
                    </div>
                  ))}

                  {/* Empty slots */}
                  {participants.length < 3 && (
                    <div 
                      className="aspect-video bg-slate-900/50 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-700 cursor-pointer hover:border-purple-500/50 transition-colors"
                      onClick={() => setShowInviteDialog(true)}
                    >
                      <div className="text-center">
                        <UserPlus className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">دعوة مشارك</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-3">
                <div className="flex items-center justify-center gap-3">
                  <Button
                    size="icon"
                    variant={controls.muted ? 'destructive' : 'outline'}
                    className="h-12 w-12 rounded-full"
                    onClick={() => setControls(prev => ({ ...prev, muted: !prev.muted }))}
                  >
                    {controls.muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>
                  {conferenceType === 'video' && (
                    <Button
                      size="icon"
                      variant={controls.videoOff ? 'destructive' : 'outline'}
                      className="h-12 w-12 rounded-full"
                      onClick={() => setControls(prev => ({ ...prev, videoOff: !prev.videoOff }))}
                    >
                      {controls.videoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant={controls.screenShare ? 'default' : 'outline'}
                    className={`h-12 w-12 rounded-full ${controls.screenShare ? 'bg-green-600' : ''}`}
                    onClick={() => setControls(prev => ({ ...prev, screenShare: !prev.screenShare }))}
                  >
                    <ScreenShare className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant={controls.recording ? 'destructive' : 'outline'}
                    className="h-12 w-12 rounded-full"
                    onClick={() => setControls(prev => ({ ...prev, recording: !prev.recording }))}
                  >
                    {controls.recording ? <StopCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-12 w-12 rounded-full"
                    onClick={endConference}
                  >
                    <PhoneOff className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Sidebar */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                محادثة المؤتمر
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <ScrollArea className="h-[250px] mb-3">
                <div className="space-y-2">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className="p-2 bg-slate-900/50 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-cyan-400 text-xs font-medium">{msg.sender}</span>
                        <span className="text-slate-500 text-xs">{msg.time}</span>
                      </div>
                      <p className="text-slate-300 text-sm">{msg.message}</p>
                    </div>
                  ))}
                  {chatMessages.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      لا توجد رسائل بعد
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="اكتب رسالة..."
                  className="bg-slate-900 border-slate-700 text-white text-sm"
                />
                <Button size="sm" onClick={sendChatMessage}>إرسال</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-400" />
              دعوة وكيل للمؤتمر
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px] mt-4">
            <div className="space-y-2">
              {availableAgents.filter(a => !participants.find(p => p.id === a.id)).map(agent => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 cursor-pointer"
                  onClick={() => agent.status === 'available' && inviteAgent(agent)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-purple-500/20 text-purple-400">
                        {agent.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">{agent.name}</p>
                      <p className="text-slate-400 text-xs">{agent.department}</p>
                    </div>
                  </div>
                  <Badge className={agent.status === 'available' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                    {agent.status === 'available' ? 'متاح' : 'مشغول'}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}