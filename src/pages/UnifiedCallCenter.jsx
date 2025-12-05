import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Phone, MessageCircle, Mail, Users, Clock, CheckCircle, AlertTriangle,
  TrendingUp, BarChart3, Headphones, PhoneCall, PhoneOff, Send, Paperclip,
  Search, User, Star, MessageSquare, Facebook, Instagram, Twitter, Bot,
  Zap, Volume2, Mic, Video, Play, Pause, RotateCw, PhoneMissed, PhoneIncoming,
  PhoneOutgoing, Timer, DollarSign, Target, Award, FileText, Download,
  Settings, Filter, Plus, Eye, Smile, Frown, Meh, Brain, Sparkles, TrendingDown,
  Archive, Hash, Calendar, Globe, Link2 as Link, ChevronRight, CheckCheck, Share2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'sonner';
import CRMIntegrations from '@/components/callcenter/CRMIntegrations';
import AITrainingSimulator from '@/components/callcenter/AITrainingSimulator';
import UnifiedAgentWorkspace from '@/components/callcenter/UnifiedAgentWorkspace';
import TaskManagementSystem from '@/components/tasks/TaskManagementSystem';
import AgentPerformanceDashboard from '@/components/analytics/AgentPerformanceDashboard';
import AgentWorkspaceCustomizer from '@/components/callcenter/AgentWorkspaceCustomizer';

const COLORS = ['#22d3ee', '#22c55e', '#f59e0b', '#ef4444', '#a855f7'];

// القنوات
const channels = [
  { id: 'voice', name: 'مكالمات صوتية', icon: Phone, color: 'blue', count: 45 },
  { id: 'whatsapp', name: 'واتساب', icon: MessageCircle, color: 'green', count: 32 },
  { id: 'telegram', name: 'تيليجرام', icon: Send, color: 'cyan', count: 18 },
  { id: 'email', name: 'البريد', icon: Mail, color: 'red', count: 25 },
  { id: 'facebook', name: 'فيسبوك', icon: Facebook, color: 'blue', count: 15 },
  { id: 'instagram', name: 'انستغرام', icon: Instagram, color: 'pink', count: 12 },
  { id: 'twitter', name: 'تويتر', icon: Twitter, color: 'cyan', count: 8 },
  { id: 'web', name: 'الموقع', icon: Globe, color: 'purple', count: 22 },
];

// المكالمات/التذاكر
const tickets = [
  { id: 'TKT-001', customer: 'أحمد محمد', channel: 'voice', status: 'active', priority: 'high', subject: 'مشكلة في الصيانة', agent: 'سارة أحمد', duration: '5:30', sentiment: 'negative', created: '10:30', sla: 85 },
  { id: 'TKT-002', customer: 'فاطمة علي', channel: 'whatsapp', status: 'waiting', priority: 'urgent', subject: 'طلب عاجل', agent: null, duration: '0:00', sentiment: 'neutral', created: '10:25', sla: 45 },
  { id: 'TKT-003', customer: 'خالد السعيد', channel: 'email', status: 'resolved', priority: 'medium', subject: 'استفسار عن الفاتورة', agent: 'محمد فهد', duration: '15:20', sentiment: 'positive', created: '09:15', sla: 100 },
  { id: 'TKT-004', customer: 'نورة العتيبي', channel: 'telegram', status: 'pending', priority: 'low', subject: 'سؤال عام', agent: 'سارة أحمد', duration: '2:10', sentiment: 'neutral', created: '10:20', sla: 92 },
  { id: 'TKT-005', customer: 'عبدالله الشمري', channel: 'facebook', status: 'active', priority: 'high', subject: 'شكوى خدمة', agent: 'ليلى حسن', duration: '8:45', sentiment: 'negative', created: '10:00', sla: 70 },
];

// الوكلاء
const agents = [
  { id: 1, name: 'سارة أحمد', status: 'online', activeChats: 3, calls: 45, avgHandleTime: '4:30', fcr: 92, csat: 4.8, qScore: 95, productivity: 88 },
  { id: 2, name: 'محمد فهد', status: 'on_call', activeChats: 1, calls: 38, avgHandleTime: '5:15', fcr: 88, csat: 4.6, qScore: 90, productivity: 85 },
  { id: 3, name: 'ليلى حسن', status: 'online', activeChats: 4, calls: 52, avgHandleTime: '4:00', fcr: 95, csat: 4.9, qScore: 98, productivity: 92 },
  { id: 4, name: 'عمر خالد', status: 'break', activeChats: 0, calls: 30, avgHandleTime: '6:00', fcr: 85, csat: 4.5, qScore: 87, productivity: 80 },
];

// IVR القوائم
const ivrMenus = [
  { id: 1, name: 'القائمة الرئيسية', language: 'ar', options: ['الصيانة - 1', 'الفواتير - 2', 'الدعم الفني - 3', 'موظف - 0'] },
  { id: 2, name: 'قائمة الصيانة', language: 'ar', options: ['صيانة طارئة - 1', 'صيانة دورية - 2', 'استفسار - 3'] },
];

// KPIs
const kpiData = {
  aht: '4:45', // Average Handle Time
  fcr: 91, // First Call Resolution
  sla: 94, // Service Level Agreement
  abandonRate: 3.2,
  nps: 72, // Net Promoter Score
  csat: 4.7, // Customer Satisfaction
  qScore: 93, // Quality Score
  occupancy: 82,
};

// بيانات الأداء
const performanceData = [
  { time: '08:00', calls: 12, resolved: 10, waiting: 5 },
  { time: '09:00', calls: 25, resolved: 22, waiting: 8 },
  { time: '10:00', calls: 35, resolved: 30, waiting: 12 },
  { time: '11:00', calls: 42, resolved: 38, waiting: 15 },
  { time: '12:00', calls: 28, resolved: 25, waiting: 10 },
  { time: '13:00', calls: 30, resolved: 28, waiting: 8 },
];

// توزيع القنوات
const channelDistribution = channels.map(c => ({ name: c.name, value: c.count }));

export default function UnifiedCallCenter() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [showIVRBuilder, setShowIVRBuilder] = useState(false);
  const [agentNotifications, setAgentNotifications] = useState({
    highPriority: true,
    emailInactive: true,
    ticketUpdates: true,
    sound: true,
  });
  const [showCustomizer, setShowCustomizer] = useState(false);

  // AI Call Analysis
  const aiAnalysisMutation = useMutation({
    mutationFn: async (ticket) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل محادثة مركز الاتصال التالية:

التذكرة: ${ticket.id}
العميل: ${ticket.customer}
الموضوع: ${ticket.subject}
القناة: ${ticket.channel}
المدة: ${ticket.duration}

قم بتقديم:
1. ملخص شامل للمحادثة
2. التفاصيل المهمة (رقم التذكرة، طلبات المتابعة، مواعيد)
3. تقييم رضا العميل (1-5) بناءً على النبرة والمحتوى
4. اقتراحات لردود مناسبة للوكيل
5. خطوات المتابعة الموصى بها`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            keyDetails: {
              type: "object",
              properties: {
                ticketNumber: { type: "string" },
                followUps: { type: "array", items: { type: "string" } },
                appointments: { type: "array", items: { type: "string" } },
                issues: { type: "array", items: { type: "string" } }
              }
            },
            sentimentScore: { type: "number" },
            sentimentLabel: { type: "string", enum: ["positive", "neutral", "negative"] },
            satisfactionScore: { type: "number" },
            suggestedResponses: { type: "array", items: { type: "string" } },
            nextSteps: { type: "array", items: { type: "string" } },
            urgencyLevel: { type: "string" },
            tags: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAiAnalysis(data);
      setIsAnalyzing(false);
      toast.success('تم تحليل المحادثة بنجاح');
    },
  });

  const analyzeConversation = (ticket) => {
    setSelectedTicket(ticket);
    setIsAnalyzing(true);
    setShowAIAnalysis(true);
    aiAnalysisMutation.mutate(ticket);
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <Smile className="w-4 h-4 text-green-400" />;
      case 'negative': return <Frown className="w-4 h-4 text-red-400" />;
      default: return <Meh className="w-4 h-4 text-amber-400" />;
    }
  };

  const exportReport = (format) => {
    toast.success(`جاري تصدير التقرير بصيغة ${format}...`);
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Headphones className="w-8 h-8 text-green-400" />
              مركز الاتصال الموحد المتقدم
            </h1>
            <p className="text-slate-400 mt-1">Voice/IP • WhatsApp • Telegram • Email • Social • AI Analytics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-purple-500/50 text-purple-400" onClick={() => setShowIVRBuilder(true)}>
              <Phone className="w-4 h-4 ml-2" />
              IVR Builder
            </Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Download className="w-4 h-4 ml-2" />
              تقرير شامل
            </Button>
          </div>
        </div>
      </motion.div>

      {/* KPIs Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {[
          { label: 'AHT', value: kpiData.aht, icon: Timer, color: 'cyan', tooltip: 'Average Handle Time' },
          { label: 'FCR', value: `${kpiData.fcr}%`, icon: CheckCircle, color: 'green', tooltip: 'First Call Resolution' },
          { label: 'SLA', value: `${kpiData.sla}%`, icon: Target, color: 'blue', tooltip: 'Service Level Agreement' },
          { label: 'Abandon', value: `${kpiData.abandonRate}%`, icon: PhoneMissed, color: 'red', tooltip: 'Abandon Rate' },
          { label: 'NPS', value: kpiData.nps, icon: Award, color: 'purple', tooltip: 'Net Promoter Score' },
          { label: 'CSAT', value: kpiData.csat, icon: Star, color: 'amber', tooltip: 'Customer Satisfaction' },
          { label: 'QA Score', value: `${kpiData.qScore}%`, icon: CheckCircle, color: 'green', tooltip: 'Quality Score' },
          { label: 'Occupancy', value: `${kpiData.occupancy}%`, icon: Users, color: 'cyan', tooltip: 'Agent Occupancy' },
        ].map((kpi, i) => (
          <Card key={kpi.label} className="glass-card border-indigo-500/20 bg-[#0f1629]/80" title={kpi.tooltip}>
            <CardContent className="p-3 text-center">
              <kpi.icon className={`w-4 h-4 text-${kpi.color}-400 mx-auto mb-1`} />
              <p className="text-lg font-bold text-white">{kpi.value}</p>
              <p className="text-[10px] text-slate-400">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-cyan-500/20">
            <BarChart3 className="w-4 h-4 ml-1" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="tickets" className="data-[state=active]:bg-green-500/20">
            <FileText className="w-4 h-4 ml-1" />
            Tickets
          </TabsTrigger>
          <TabsTrigger value="agents" className="data-[state=active]:bg-purple-500/20">
            <Users className="w-4 h-4 ml-1" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-500/20">
            <TrendingUp className="w-4 h-4 ml-1" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-pink-500/20">
            <Brain className="w-4 h-4 ml-1" />
            AI Layer
          </TabsTrigger>
          <TabsTrigger value="qa" className="data-[state=active]:bg-blue-500/20">
            <Award className="w-4 h-4 ml-1" />
            QA
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Link className="w-4 h-4 ml-1" />
            التكاملات
          </TabsTrigger>
          <TabsTrigger value="training" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Target className="w-4 h-4 ml-1" />
            التدريب
          </TabsTrigger>
          <TabsTrigger value="workspace" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
            <User className="w-4 h-4 ml-1" />
            مساحة الوكيل
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <FileText className="w-4 h-4 ml-1" />
            المهام
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <BarChart3 className="w-4 h-4 ml-1" />
            أداء الوكلاء
          </TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-6 mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Real-Time Activity */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">النشاط في الزمن الحقيقي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Legend />
                      <Line type="monotone" dataKey="calls" stroke="#22d3ee" strokeWidth={2} name="المكالمات" />
                      <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} name="المحلولة" />
                      <Line type="monotone" dataKey="waiting" stroke="#f59e0b" strokeWidth={2} name="الانتظار" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Channel Distribution */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">توزيع القنوات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={channelDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {channelDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Channel Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {channels.map(channel => {
              const Icon = channel.icon;
              return (
                <Card key={channel.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-3 text-center">
                    <Icon className={`w-5 h-5 text-${channel.color}-400 mx-auto mb-1`} />
                    <p className="text-xl font-bold text-white">{channel.count}</p>
                    <p className="text-[10px] text-slate-400 truncate">{channel.name}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Tickets */}
        <TabsContent value="tickets" className="space-y-4 mt-4">
          <div className="space-y-3">
            {tickets.map(ticket => {
              const channel = channels.find(c => c.id === ticket.channel);
              const ChannelIcon = channel?.icon || Phone;
              
              return (
                <Card key={ticket.id} className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 ${ticket.priority === 'urgent' ? 'border-red-500/50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${channel?.color}-500/20`}>
                          <ChannelIcon className={`w-5 h-5 text-${channel?.color}-400`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-bold">{ticket.id}</p>
                            <Badge className={
                              ticket.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                              ticket.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                              ticket.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-slate-500/20 text-slate-400'
                            }>
                              {ticket.priority === 'urgent' ? 'عاجل' : ticket.priority === 'high' ? 'عالي' : ticket.priority === 'medium' ? 'متوسط' : 'منخفض'}
                            </Badge>
                            <Badge className={
                              ticket.status === 'active' ? 'bg-green-500/20 text-green-400' :
                              ticket.status === 'waiting' ? 'bg-amber-500/20 text-amber-400' :
                              ticket.status === 'pending' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-slate-500/20 text-slate-400'
                            }>
                              {ticket.status === 'active' ? 'نشط' : ticket.status === 'waiting' ? 'انتظار' : ticket.status === 'pending' ? 'معلق' : 'محلول'}
                            </Badge>
                            {getSentimentIcon(ticket.sentiment)}
                          </div>
                          <p className="text-white">{ticket.customer} - {ticket.subject}</p>
                          <p className="text-slate-400 text-sm">الوكيل: {ticket.agent || 'غير معين'}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-slate-500 text-xs">{ticket.created}</p>
                        <p className="text-slate-400 text-sm">المدة: {ticket.duration}</p>
                        <div className="mt-1">
                          <Progress value={ticket.sla} className="h-2 w-20" />
                          <p className="text-xs text-slate-500">SLA {ticket.sla}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-slate-600">
                        <Eye className="w-3 h-3 ml-1" />
                        عرض
                      </Button>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => analyzeConversation(ticket)}>
                        <Brain className="w-3 h-3 ml-1" />
                        تحليل AI
                      </Button>
                      {ticket.channel === 'voice' && (
                        <Button size="sm" variant="outline" className="border-green-500/50 text-green-400">
                          <Play className="w-3 h-3 ml-1" />
                          استماع
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Agents */}
        <TabsContent value="agents" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {agents.map(agent => (
              <Card key={agent.id} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={`${
                        agent.status === 'online' ? 'bg-green-500/20 text-green-400' :
                        agent.status === 'on_call' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {agent.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{agent.name}</p>
                      <Badge className={`text-xs ${
                        agent.status === 'online' ? 'bg-green-500/20 text-green-400' :
                        agent.status === 'on_call' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {agent.status === 'online' ? 'متاح' : agent.status === 'on_call' ? 'في مكالمة' : 'استراحة'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2 bg-slate-800/50 rounded text-center">
                      <p className="text-cyan-400 font-bold">{agent.calls}</p>
                      <p className="text-slate-500 text-xs">مكالمات</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded text-center">
                      <p className="text-green-400 font-bold">{agent.avgHandleTime}</p>
                      <p className="text-slate-500 text-xs">AHT</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded text-center">
                      <p className="text-purple-400 font-bold">{agent.fcr}%</p>
                      <p className="text-slate-500 text-xs">FCR</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded text-center">
                      <p className="text-amber-400 font-bold flex items-center justify-center gap-1">
                        <Star className="w-3 h-3" />{agent.csat}
                      </p>
                      <p className="text-slate-500 text-xs">CSAT</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">QA Score</span>
                      <span className="text-white">{agent.qScore}%</span>
                    </div>
                    <Progress value={agent.qScore} className="h-2" />
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Productivity</span>
                      <span className="text-white">{agent.productivity}%</span>
                    </div>
                    <Progress value={agent.productivity} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6 mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Performance Trend */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm">اتجاهات الأداء</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-slate-600 h-7" onClick={() => exportReport('PDF')}>
                      <Download className="w-3 h-3 ml-1" />
                      PDF
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-600 h-7" onClick={() => exportReport('Excel')}>
                      <Download className="w-3 h-3 ml-1" />
                      Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="calls" fill="#22d3ee" name="إجمالي" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="resolved" fill="#22c55e" name="محلولة" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Analysis */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader>
                <CardTitle className="text-white text-sm">تحليل المشاعر</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-6 w-full">
                    <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                      <Smile className="w-12 h-12 text-green-400 mx-auto mb-2" />
                      <p className="text-3xl font-bold text-white">65%</p>
                      <p className="text-slate-400 text-sm">إيجابي</p>
                    </div>
                    <div className="text-center p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                      <Meh className="w-12 h-12 text-amber-400 mx-auto mb-2" />
                      <p className="text-3xl font-bold text-white">25%</p>
                      <p className="text-slate-400 text-sm">محايد</p>
                    </div>
                    <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <Frown className="w-12 h-12 text-red-400 mx-auto mb-2" />
                      <p className="text-3xl font-bold text-white">10%</p>
                      <p className="text-slate-400 text-sm">سلبي</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Layer */}
        <TabsContent value="ai" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'تلخيص المكالمات', value: '1,245', subtitle: 'ملخص تلقائي', icon: FileText, color: 'cyan' },
              { label: 'تحليل المشاعر', value: '98.5%', subtitle: 'دقة التحليل', icon: Smile, color: 'green' },
              { label: 'كشف النية', value: '94%', subtitle: 'Intent Detection', icon: Target, color: 'purple' },
              { label: 'ردود ذكية', value: '856', subtitle: 'اقتراحات AI', icon: Sparkles, color: 'amber' },
              { label: 'تصعيد تلقائي', value: '23', subtitle: 'قضايا حرجة', icon: AlertTriangle, color: 'red' },
              { label: 'قاعدة المعرفة', value: '452', subtitle: 'مقالة', icon: FileText, color: 'blue' },
            ].map(item => (
              <Card key={item.label} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <item.icon className={`w-6 h-6 text-${item.color}-400`} />
                    <div>
                      <p className="text-2xl font-bold text-white">{item.value}</p>
                      <p className="text-slate-400 text-xs">{item.label}</p>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm">{item.subtitle}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Features */}
          <Card className="glass-card border-purple-500/30 bg-purple-500/5">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                ميزات الذكاء الاصطناعي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: 'Speech-to-Text', desc: 'تحويل صوتي تلقائي بدقة 98%', active: true },
                  { title: 'Voice Sentiment', desc: 'تحليل نبرة الصوت والمشاعر', active: true },
                  { title: 'Intent Recognition', desc: 'كشف نية العميل تلقائياً', active: true },
                  { title: 'Auto-Summarization', desc: 'ملخص تلقائي بعد كل مكالمة', active: true },
                  { title: 'Smart Routing', desc: 'توجيه ذكي للوكيل المناسب', active: true },
                  { title: 'Predictive Analytics', desc: 'توقع حجم المكالمات والتوظيف', active: true },
                ].map(feature => (
                  <div key={feature.title} className="p-3 bg-slate-800/30 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{feature.title}</p>
                      <p className="text-slate-400 text-sm">{feature.desc}</p>
                    </div>
                    <Badge className={feature.active ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
                      {feature.active ? 'مفعل' : 'معطل'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* QA */}
        <TabsContent value="qa" className="space-y-4 mt-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white text-sm">مراجعة الجودة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.filter(t => t.status === 'resolved').map(ticket => (
                  <div key={ticket.id} className="p-4 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-white font-medium">{ticket.id} - {ticket.customer}</p>
                        <p className="text-slate-400 text-sm">الوكيل: {ticket.agent}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-amber-400 font-bold flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {(Math.random() * 2 + 3).toFixed(1)}
                        </p>
                        <p className="text-slate-500 text-xs">QA Score</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div>
                        <p className="text-green-400 font-bold">95%</p>
                        <p className="text-slate-500">الاحترافية</p>
                      </div>
                      <div>
                        <p className="text-cyan-400 font-bold">92%</p>
                        <p className="text-slate-500">الدقة</p>
                      </div>
                      <div>
                        <p className="text-purple-400 font-bold">88%</p>
                        <p className="text-slate-500">الحل</p>
                      </div>
                      <div>
                        <p className="text-amber-400 font-bold">90%</p>
                        <p className="text-slate-500">الامتثال</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="mt-4">
          <CRMIntegrations />
        </TabsContent>

        {/* Training */}
        <TabsContent value="training" className="mt-4">
          <AITrainingSimulator />
        </TabsContent>

        {/* Agent Workspace */}
        <TabsContent value="workspace" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button variant="outline" className="border-slate-600" onClick={() => setShowCustomizer(true)}>
              <Settings className="w-4 h-4 ml-1" />
              تخصيص الواجهة
            </Button>
          </div>
          <UnifiedAgentWorkspace />
        </TabsContent>

        {/* Tasks */}
        <TabsContent value="tasks" className="mt-4">
          <TaskManagementSystem />
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="mt-4">
          <AgentPerformanceDashboard />
        </TabsContent>
      </Tabs>

      {/* Workspace Customizer */}
      <AgentWorkspaceCustomizer open={showCustomizer} onOpenChange={setShowCustomizer} />

      {/* AI Analysis Dialog */}
      <Dialog open={showAIAnalysis} onOpenChange={setShowAIAnalysis}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              تحليل AI للمحادثة - {selectedTicket?.id}
            </DialogTitle>
          </DialogHeader>

          {isAnalyzing ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RotateCw className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
                <p className="text-white">جاري تحليل المحادثة...</p>
              </div>
            </div>
          ) : aiAnalysis && (
            <div className="space-y-4 mt-4">
              {/* Summary */}
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <h4 className="text-purple-400 font-medium mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  ملخص المحادثة
                </h4>
                <p className="text-white text-sm">{aiAnalysis.summary}</p>
              </div>

              {/* Sentiment & Satisfaction */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg text-center ${
                  aiAnalysis.sentimentLabel === 'positive' ? 'bg-green-500/10 border border-green-500/30' :
                  aiAnalysis.sentimentLabel === 'negative' ? 'bg-red-500/10 border border-red-500/30' :
                  'bg-amber-500/10 border border-amber-500/30'
                }`}>
                  {aiAnalysis.sentimentLabel === 'positive' ? <Smile className="w-8 h-8 text-green-400 mx-auto mb-2" /> :
                   aiAnalysis.sentimentLabel === 'negative' ? <Frown className="w-8 h-8 text-red-400 mx-auto mb-2" /> :
                   <Meh className="w-8 h-8 text-amber-400 mx-auto mb-2" />}
                  <p className="text-2xl font-bold text-white">{aiAnalysis.sentimentScore}/5</p>
                  <p className="text-slate-400 text-sm">تحليل المشاعر</p>
                </div>
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-center">
                  <Star className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{aiAnalysis.satisfactionScore}/5</p>
                  <p className="text-slate-400 text-sm">رضا العميل المتوقع</p>
                </div>
              </div>

              {/* Key Details */}
              {aiAnalysis.keyDetails && (
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="text-cyan-400 font-medium mb-3">التفاصيل المهمة</h4>
                  {aiAnalysis.keyDetails.issues?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-slate-400 text-sm mb-1">المشاكل المطروحة:</p>
                      <ul className="space-y-1">
                        {aiAnalysis.keyDetails.issues.map((issue, i) => (
                          <li key={i} className="text-white text-sm flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-red-400 mt-0.5" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiAnalysis.keyDetails.followUps?.length > 0 && (
                    <div>
                      <p className="text-slate-400 text-sm mb-1">المتابعات المطلوبة:</p>
                      <ul className="space-y-1">
                        {aiAnalysis.keyDetails.followUps.map((followUp, i) => (
                          <li key={i} className="text-white text-sm flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                            {followUp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Suggested Responses */}
              {aiAnalysis.suggestedResponses?.length > 0 && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <h4 className="text-green-400 font-medium mb-3">ردود مقترحة للوكيل</h4>
                  <div className="space-y-2">
                    {aiAnalysis.suggestedResponses.map((response, i) => (
                      <div key={i} className="p-2 bg-slate-800/50 rounded flex items-center justify-between">
                        <p className="text-white text-sm flex-1">{response}</p>
                        <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(response); toast.success('تم النسخ'); }}>
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              {aiAnalysis.nextSteps?.length > 0 && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <h4 className="text-amber-400 font-medium mb-2">الخطوات التالية</h4>
                  <ul className="space-y-1">
                    {aiAnalysis.nextSteps.map((step, i) => (
                      <li key={i} className="text-white text-sm flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-amber-400 mt-0.5" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {aiAnalysis.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {aiAnalysis.tags.map(tag => (
                    <Badge key={tag} className="bg-slate-700 text-slate-300">
                      <Hash className="w-3 h-3 ml-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* IVR Builder Dialog */}
      <Dialog open={showIVRBuilder} onOpenChange={setShowIVRBuilder}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-purple-400" />
              IVR Menu Builder
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {ivrMenus.map(menu => (
              <div key={menu.id} className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-white font-medium mb-2">{menu.name}</p>
                <div className="space-y-1">
                  {menu.options.map((opt, i) => (
                    <p key={i} className="text-slate-400 text-sm">{opt}</p>
                  ))}
                </div>
                <Button size="sm" variant="outline" className="border-slate-600 mt-2">
                  <Settings className="w-3 h-3 ml-1" />
                  تعديل
                </Button>
              </div>
            ))}
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 ml-2" />
              إنشاء قائمة جديدة
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Agent Notification Settings (Floating) */}
      <div className="fixed bottom-6 left-6 z-40">
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/95 w-72">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              إعدادات الإشعارات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">أولوية عالية</Label>
              <Switch checked={agentNotifications.highPriority} onCheckedChange={(v) => setAgentNotifications({...agentNotifications, highPriority: v})} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">بريد للخاملة</Label>
              <Switch checked={agentNotifications.emailInactive} onCheckedChange={(v) => setAgentNotifications({...agentNotifications, emailInactive: v})} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">تحديثات التذاكر</Label>
              <Switch checked={agentNotifications.ticketUpdates} onCheckedChange={(v) => setAgentNotifications({...agentNotifications, ticketUpdates: v})} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">الأصوات</Label>
              <Switch checked={agentNotifications.sound} onCheckedChange={(v) => setAgentNotifications({...agentNotifications, sound: v})} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}