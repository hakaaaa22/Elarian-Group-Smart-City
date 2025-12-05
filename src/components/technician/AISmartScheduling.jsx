import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, MapPin, User, Zap, Brain, CheckCircle, AlertTriangle,
  Navigation, Star, Wrench, RefreshCw, Plus, X, Edit, Car, Timer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const technicians = [
  {
    id: 1,
    name: 'محمد أحمد',
    specialty: 'تكييف',
    skills: ['تكييف', 'كهرباء'],
    rating: 4.8,
    tasksToday: 3,
    maxTasks: 5,
    location: { lat: 24.71, lng: 46.67 },
    available: true,
    blockedTimes: [{ from: '12:00', to: '13:00', reason: 'استراحة' }]
  },
  {
    id: 2,
    name: 'خالد العلي',
    specialty: 'كاميرات',
    skills: ['كاميرات', 'شبكات'],
    rating: 4.5,
    tasksToday: 4,
    maxTasks: 5,
    location: { lat: 24.72, lng: 46.68 },
    available: true,
    blockedTimes: []
  },
  {
    id: 3,
    name: 'فهد السعيد',
    specialty: 'أمن',
    skills: ['أمن', 'كهرباء', 'شبكات'],
    rating: 4.9,
    tasksToday: 2,
    maxTasks: 4,
    available: false,
    blockedTimes: [{ from: '09:00', to: '17:00', reason: 'إجازة' }]
  }
];

const pendingTasks = [
  {
    id: 1,
    title: 'صيانة مكيف المكتب',
    device: 'مكيف سبليت LG',
    location: 'فيلا 12، شارع الملك فهد',
    coordinates: { lat: 24.715, lng: 46.675 },
    priority: 'high',
    requiredSkills: ['تكييف'],
    estimatedDuration: 2,
    deadline: '2024-12-04 14:00'
  },
  {
    id: 2,
    title: 'تركيب كاميرا جديدة',
    device: 'كاميرا IP Hikvision',
    location: 'مبنى 5، المنطقة الصناعية',
    coordinates: { lat: 24.725, lng: 46.685 },
    priority: 'medium',
    requiredSkills: ['كاميرات'],
    estimatedDuration: 1.5,
    deadline: '2024-12-05 16:00'
  },
  {
    id: 3,
    title: 'إصلاح حساس حركة',
    device: 'حساس PIR',
    location: 'مكتب 8، برج الأعمال',
    coordinates: { lat: 24.735, lng: 46.695 },
    priority: 'low',
    requiredSkills: ['أمن'],
    estimatedDuration: 1,
    deadline: '2024-12-06 12:00'
  }
];

const calculateDistance = (loc1, loc2) => {
  const R = 6371;
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1);
};

const estimateTravelTime = (distance) => Math.round(distance * 3);

export default function AISmartScheduling({ onAssignTask }) {
  const [tasks, setTasks] = useState(pendingTasks);
  const [techs, setTechs] = useState(technicians);
  const [showOptimizeDialog, setShowOptimizeDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showSuggestDialog, setShowSuggestDialog] = useState(false);
  const [selectedTech, setSelectedTech] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [blockTime, setBlockTime] = useState({ from: '', to: '', reason: '' });
  const [scheduleChange, setScheduleChange] = useState({ type: '', reason: '' });

  const optimizeMutation = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `حسّن توزيع المهام التالية على الفنيين:

المهام المعلقة:
${tasks.map(t => `- ${t.title} (${t.requiredSkills.join(', ')}) - أولوية: ${t.priority} - المدة: ${t.estimatedDuration}h`).join('\n')}

الفنيون المتاحون:
${techs.filter(t => t.available).map(t => `- ${t.name} (${t.skills.join(', ')}) - التقييم: ${t.rating} - المهام: ${t.tasksToday}/${t.maxTasks}`).join('\n')}

قدم توزيعاً أمثل يراعي:
1. مهارات الفني
2. المسافة ووقت التنقل
3. عبء العمل الحالي
4. أولوية المهام`,
        response_json_schema: {
          type: "object",
          properties: {
            assignments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  taskId: { type: "number" },
                  technicianId: { type: "number" },
                  scheduledTime: { type: "string" },
                  reason: { type: "string" },
                  estimatedArrival: { type: "string" }
                }
              }
            },
            optimization: { type: "string" },
            savings: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAiSuggestions(data);
      setShowOptimizeDialog(true);
    },
    onError: () => toast.error('فشل التحسين')
  });

  const applyOptimization = () => {
    if (aiSuggestions?.assignments) {
      aiSuggestions.assignments.forEach(assignment => {
        const task = tasks.find(t => t.id === assignment.taskId);
        const tech = techs.find(t => t.id === assignment.technicianId);
        if (task && tech) {
          toast.success(`تم تعيين "${task.title}" لـ ${tech.name}`);
        }
      });
    }
    setShowOptimizeDialog(false);
    setAiSuggestions(null);
  };

  const addBlockedTime = () => {
    if (!blockTime.from || !blockTime.to) {
      toast.error('يرجى تحديد الوقت');
      return;
    }
    setTechs(techs.map(t => 
      t.id === selectedTech.id 
        ? { ...t, blockedTimes: [...t.blockedTimes, blockTime] }
        : t
    ));
    setShowBlockDialog(false);
    setBlockTime({ from: '', to: '', reason: '' });
    toast.success('تم حجز الوقت');
  };

  const submitScheduleChange = () => {
    toast.success('تم إرسال طلب تغيير الجدول للمراجعة');
    setShowSuggestDialog(false);
    setScheduleChange({ type: '', reason: '' });
  };

  const getBestTechForTask = (task) => {
    const available = techs.filter(t => 
      t.available && 
      t.tasksToday < t.maxTasks &&
      task.requiredSkills.some(s => t.skills.includes(s))
    );
    
    if (available.length === 0) return null;
    
    return available.sort((a, b) => {
      const distA = calculateDistance(a.location, task.coordinates);
      const distB = calculateDistance(b.location, task.coordinates);
      const scoreA = (a.rating * 10) - (distA * 2) - (a.tasksToday * 5);
      const scoreB = (b.rating * 10) - (distB * 2) - (b.tasksToday * 5);
      return scoreB - scoreA;
    })[0];
  };

  const priorityColors = {
    low: 'bg-blue-500/20 text-blue-400',
    medium: 'bg-amber-500/20 text-amber-400',
    high: 'bg-red-500/20 text-red-400'
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            الجدولة الذكية
          </h2>
          <p className="text-slate-400 text-sm">تحسين توزيع المهام بالذكاء الاصطناعي</p>
        </div>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => optimizeMutation.mutate()}
          disabled={optimizeMutation.isPending}
        >
          {optimizeMutation.isPending ? (
            <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
          ) : (
            <Zap className="w-4 h-4 ml-2" />
          )}
          تحسين AI
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Technicians */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              الفنيون
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {techs.map((tech) => (
              <div
                key={tech.id}
                className={`p-3 rounded-lg ${tech.available ? 'bg-slate-800/50' : 'bg-slate-800/30 opacity-60'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={tech.available ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-600'}>
                        {tech.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{tech.name}</p>
                        {!tech.available && <Badge className="bg-red-500/20 text-red-400 text-xs">غير متاح</Badge>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{tech.specialty}</span>
                        <span>•</span>
                        <Star className="w-3 h-3 text-amber-400" />
                        <span>{tech.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-cyan-400 font-bold">{tech.tasksToday}/{tech.maxTasks}</p>
                    <p className="text-slate-500 text-xs">مهام</p>
                  </div>
                </div>
                
                {/* Skills */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {tech.skills.map(skill => (
                    <Badge key={skill} variant="outline" className="border-slate-600 text-xs">{skill}</Badge>
                  ))}
                </div>
                
                {/* Blocked Times */}
                {tech.blockedTimes.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {tech.blockedTimes.map((bt, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 p-1 rounded">
                        <Clock className="w-3 h-3" />
                        <span>{bt.from} - {bt.to}: {bt.reason}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-slate-600 text-xs"
                    onClick={() => { setSelectedTech(tech); setShowBlockDialog(true); }}
                  >
                    <Calendar className="w-3 h-3 ml-1" />
                    حجز وقت
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-slate-600 text-xs"
                    onClick={() => { setSelectedTech(tech); setShowSuggestDialog(true); }}
                  >
                    <Edit className="w-3 h-3 ml-1" />
                    اقتراح تغيير
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              المهام المعلقة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.map((task) => {
              const bestTech = getBestTechForTask(task);
              const distance = bestTech ? calculateDistance(bestTech.location, task.coordinates) : null;
              const travelTime = distance ? estimateTravelTime(distance) : null;
              
              return (
                <div key={task.id} className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-medium">{task.title}</h4>
                        <Badge className={priorityColors[task.priority]}>
                          {task.priority === 'high' ? 'عالي' : task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-xs">{task.device}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-slate-300 text-xs">{task.estimatedDuration}h</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {task.location.split('،')[0]}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.deadline.split(' ')[1]}
                    </span>
                  </div>
                  
                  {/* AI Suggestion */}
                  {bestTech && (
                    <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg mb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-xs">اقتراح AI: {bestTech.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Car className="w-3 h-3" />
                          <span>{distance} كم</span>
                          <Timer className="w-3 h-3" />
                          <span>{travelTime} د</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    size="sm"
                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                    onClick={() => {
                      if (bestTech) {
                        toast.success(`تم تعيين المهمة لـ ${bestTech.name}`);
                        onAssignTask?.({ task, technician: bestTech });
                      }
                    }}
                    disabled={!bestTech}
                  >
                    <CheckCircle className="w-3 h-3 ml-1" />
                    تعيين
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* AI Optimization Dialog */}
      <Dialog open={showOptimizeDialog} onOpenChange={setShowOptimizeDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              نتائج التحسين AI
            </DialogTitle>
          </DialogHeader>
          {aiSuggestions && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <p className="text-slate-300 text-sm">{aiSuggestions.optimization}</p>
                {aiSuggestions.savings && (
                  <p className="text-green-400 text-xs mt-2">
                    <Zap className="w-3 h-3 inline ml-1" />
                    {aiSuggestions.savings}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-slate-400 text-sm">التوزيع المقترح:</p>
                {aiSuggestions.assignments?.map((a, i) => {
                  const task = tasks.find(t => t.id === a.taskId);
                  const tech = techs.find(t => t.id === a.technicianId);
                  return (
                    <div key={i} className="p-2 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">{task?.title}</span>
                        <span className="text-cyan-400 text-sm">{tech?.name}</span>
                      </div>
                      <p className="text-slate-500 text-xs">{a.reason}</p>
                      <p className="text-green-400 text-xs">الوصول: {a.estimatedArrival}</p>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex gap-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={applyOptimization}>
                  <CheckCircle className="w-4 h-4 ml-2" />
                  تطبيق
                </Button>
                <Button variant="outline" className="flex-1 border-slate-600" onClick={() => setShowOptimizeDialog(false)}>
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Block Time Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">حجز وقت - {selectedTech?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300">من</Label>
                <Input
                  type="time"
                  value={blockTime.from}
                  onChange={(e) => setBlockTime({ ...blockTime, from: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300">إلى</Label>
                <Input
                  type="time"
                  value={blockTime.to}
                  onChange={(e) => setBlockTime({ ...blockTime, to: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-300">السبب</Label>
              <Input
                value={blockTime.reason}
                onChange={(e) => setBlockTime({ ...blockTime, reason: e.target.value })}
                placeholder="استراحة، اجتماع، إلخ..."
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
              />
            </div>
            <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={addBlockedTime}>
              <Calendar className="w-4 h-4 ml-2" />
              حجز
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suggest Change Dialog */}
      <Dialog open={showSuggestDialog} onOpenChange={setShowSuggestDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">اقتراح تغيير الجدول</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">نوع التغيير</Label>
              <Select value={scheduleChange.type} onValueChange={(v) => setScheduleChange({ ...scheduleChange, type: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="reschedule">إعادة جدولة مهمة</SelectItem>
                  <SelectItem value="swap">تبديل مع فني آخر</SelectItem>
                  <SelectItem value="cancel">إلغاء مهمة</SelectItem>
                  <SelectItem value="priority">تغيير الأولوية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">السبب</Label>
              <Textarea
                value={scheduleChange.reason}
                onChange={(e) => setScheduleChange({ ...scheduleChange, reason: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white mt-1"
                rows={3}
              />
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={submitScheduleChange}>
              <Edit className="w-4 h-4 ml-2" />
              إرسال الاقتراح
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}