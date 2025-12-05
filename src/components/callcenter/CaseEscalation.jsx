import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Users, Shield, MessageSquare, Send, Phone, Video,
  Clock, CheckCircle, ArrowUp, User, Loader2, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const supervisors = [
  { id: 1, name: 'محمد الأحمد', role: 'مشرف الدعم الفني', status: 'available', avatar: 'م أ' },
  { id: 2, name: 'سارة العلي', role: 'مديرة خدمة العملاء', status: 'busy', avatar: 'س ع' },
  { id: 3, name: 'خالد الشمري', role: 'مشرف المبيعات', status: 'available', avatar: 'خ ش' },
];

const specializedTeams = [
  { id: 'tech', name: 'الفريق التقني', icon: '🔧', members: 5 },
  { id: 'billing', name: 'فريق الفواتير', icon: '💳', members: 3 },
  { id: 'retention', name: 'فريق الاحتفاظ', icon: '🤝', members: 4 },
  { id: 'vip', name: 'فريق VIP', icon: '👑', members: 2 },
];

export default function CaseEscalation({ caseDetails, onEscalate }) {
  const [showEscalationDialog, setShowEscalationDialog] = useState(false);
  const [showQuickChat, setShowQuickChat] = useState(false);
  const [escalationType, setEscalationType] = useState('supervisor');
  const [selectedTarget, setSelectedTarget] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);

  const handleEscalate = async () => {
    if (!selectedTarget || !escalationReason) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    
    setIsEscalating(true);
    
    // Simulate escalation
    await new Promise(r => setTimeout(r, 1500));
    
    setIsEscalating(false);
    setShowEscalationDialog(false);
    
    onEscalate?.({
      type: escalationType,
      target: selectedTarget,
      reason: escalationReason,
      time: new Date()
    });
    
    toast.success('تم تصعيد الحالة بنجاح');
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
    
    // Simulate response
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'المشرف',
        message: 'تم استلام رسالتك، سأراجع الحالة فوراً',
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 2000);
  };

  return (
    <div className="space-y-3" dir="rtl">
      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-red-500/10 to-amber-500/10 border-red-500/30">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-white font-medium text-sm">تصعيد الحالة</span>
            </div>
            <Badge className="bg-amber-500/20 text-amber-400 text-xs">
              حالة معقدة
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-xs"
              onClick={() => setShowEscalationDialog(true)}
            >
              <ArrowUp className="w-3 h-3 ml-1" />
              تصعيد للمشرف
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-amber-500/50 text-amber-400 text-xs"
              onClick={() => setShowQuickChat(true)}
            >
              <MessageSquare className="w-3 h-3 ml-1" />
              استشارة سريعة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Supervisors */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-xs flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            المشرفون المتاحون
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {supervisors.map(sup => (
              <div
                key={sup.id}
                className="p-2 bg-slate-900/50 rounded-lg flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
                onClick={() => {
                  setSelectedTarget(sup.name);
                  setEscalationType('supervisor');
                  setShowEscalationDialog(true);
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-slate-700 text-white text-xs">
                        {sup.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${sup.status === 'available' ? 'bg-green-500' : 'bg-amber-500'} border border-slate-900`} />
                  </div>
                  <div>
                    <p className="text-white text-xs font-medium">{sup.name}</p>
                    <p className="text-slate-400 text-xs">{sup.role}</p>
                  </div>
                </div>
                <Badge className={`${sup.status === 'available' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'} text-xs`}>
                  {sup.status === 'available' ? 'متاح' : 'مشغول'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Specialized Teams */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-xs flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            الفرق المتخصصة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {specializedTeams.map(team => (
              <div
                key={team.id}
                className="p-2 bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors"
                onClick={() => {
                  setSelectedTarget(team.name);
                  setEscalationType('team');
                  setShowEscalationDialog(true);
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{team.icon}</span>
                  <div>
                    <p className="text-white text-xs font-medium">{team.name}</p>
                    <p className="text-slate-400 text-xs">{team.members} أعضاء</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Escalation Dialog */}
      <Dialog open={showEscalationDialog} onOpenChange={setShowEscalationDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ArrowUp className="w-5 h-5 text-red-400" />
              تصعيد الحالة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-slate-300 text-sm mb-1 block">نوع التصعيد</label>
              <Select value={escalationType} onValueChange={setEscalationType}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="supervisor">مشرف</SelectItem>
                  <SelectItem value="team">فريق متخصص</SelectItem>
                  <SelectItem value="manager">مدير</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-slate-300 text-sm mb-1 block">الجهة المستهدفة</label>
              <Input
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="اختر أو اكتب..."
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm mb-1 block">سبب التصعيد</label>
              <Textarea
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white h-24"
                placeholder="اشرح سبب التصعيد..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleEscalate}
                disabled={isEscalating}
              >
                {isEscalating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <><ArrowUp className="w-4 h-4 ml-2" /> تصعيد الحالة</>
                )}
              </Button>
              <Button variant="outline" className="border-slate-600" onClick={() => setShowEscalationDialog(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Chat Dialog */}
      <Dialog open={showQuickChat} onOpenChange={setShowQuickChat}>
        <DialogContent className="bg-[#0f1629] border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              استشارة سريعة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <ScrollArea className="h-[200px] bg-slate-900/50 rounded-lg p-3">
              {chatMessages.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  ابدأ المحادثة للاستشارة
                </div>
              ) : (
                <div className="space-y-2">
                  {chatMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-2 rounded-lg ${msg.sender === 'أنت' ? 'bg-cyan-500/20 ml-8' : 'bg-slate-800 mr-8'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${msg.sender === 'أنت' ? 'text-cyan-400' : 'text-purple-400'}`}>
                          {msg.sender}
                        </span>
                        <span className="text-slate-500 text-xs">{msg.time}</span>
                      </div>
                      <p className="text-white text-sm">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="اكتب رسالتك..."
              />
              <Button onClick={sendChatMessage} className="bg-cyan-600 hover:bg-cyan-700">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}