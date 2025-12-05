import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Phone, MessageCircle, Mail, Facebook, Instagram, Send, Bot,
  ArrowRight, Zap, Brain, CheckCircle, Clock, AlertTriangle, Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const channels = [
  { id: 'voice', name: 'مكالمات', icon: Phone, color: 'blue' },
  { id: 'whatsapp', name: 'واتساب', icon: MessageCircle, color: 'green' },
  { id: 'email', name: 'بريد إلكتروني', icon: Mail, color: 'red' },
  { id: 'chat', name: 'دردشة', icon: MessageCircle, color: 'cyan' },
  { id: 'facebook', name: 'فيسبوك', icon: Facebook, color: 'blue' },
  { id: 'telegram', name: 'تيليجرام', icon: Send, color: 'sky' },
];

const mockInquiries = [
  { id: 1, channel: 'whatsapp', message: 'أريد إلغاء اشتراكي', sentiment: 'negative', intent: 'cancellation', priority: 'high' },
  { id: 2, channel: 'email', message: 'استفسار عن أسعار الباقات', sentiment: 'neutral', intent: 'pricing', priority: 'medium' },
  { id: 3, channel: 'chat', message: 'شكراً على الخدمة الممتازة', sentiment: 'positive', intent: 'feedback', priority: 'low' },
];

export default function OmnichannelAIRouter({ onRouteInquiry }) {
  const [settings, setSettings] = useState({
    autoRoute: true,
    prioritizeNegative: true,
    autoRespond: false,
    postTaskAutomation: true
  });
  const [pendingInquiries, setPendingInquiries] = useState(mockInquiries);
  const [routingLog, setRoutingLog] = useState([]);

  const analyzeAndRouteMutation = useMutation({
    mutationFn: async (inquiry) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل الرسالة التالية وحدد:
القناة: ${inquiry.channel}
الرسالة: ${inquiry.message}

حدد: المشاعر، النية، الأولوية، القسم المناسب، والإجراء المقترح بعد التفاعل.`,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment: { type: "string" },
            intent: { type: "string" },
            priority: { type: "string" },
            department: { type: "string" },
            suggested_response: { type: "string" },
            post_interaction_tasks: { type: "array", items: { type: "string" } },
            routing_reason: { type: "string" }
          }
        }
      });
      return { ...result, inquiry };
    },
    onSuccess: (data) => {
      setRoutingLog(prev => [{
        id: Date.now(),
        inquiry: data.inquiry,
        routing: data,
        time: new Date()
      }, ...prev]);
      setPendingInquiries(prev => prev.filter(i => i.id !== data.inquiry.id));
      toast.success(`تم توجيه الاستفسار إلى ${data.department}`);
      onRouteInquiry?.(data);
    }
  });

  const routeInquiry = (inquiry) => {
    analyzeAndRouteMutation.mutate(inquiry);
  };

  const routeAll = () => {
    pendingInquiries.forEach(inquiry => routeInquiry(inquiry));
  };

  const getChannelConfig = (channelId) => {
    return channels.find(c => c.id === channelId) || channels[0];
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20"
          >
            <Bot className="w-5 h-5 text-cyan-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">توجيه AI متعدد القنوات</h4>
            <p className="text-slate-400 text-xs">Omnichannel AI Router</p>
          </div>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={routeAll} disabled={pendingInquiries.length === 0}>
          <Zap className="w-4 h-4 ml-2" />
          توجيه الكل
        </Button>
      </div>

      {/* Settings */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'autoRoute', label: 'توجيه تلقائي' },
              { key: 'prioritizeNegative', label: 'أولوية السلبي' },
              { key: 'autoRespond', label: 'رد تلقائي' },
              { key: 'postTaskAutomation', label: 'أتمتة ما بعد' }
            ].map(setting => (
              <div key={setting.key} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                <Label className="text-slate-300 text-xs">{setting.label}</Label>
                <Switch
                  checked={settings[setting.key]}
                  onCheckedChange={(v) => setSettings(prev => ({ ...prev, [setting.key]: v }))}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Channel Stats */}
      <div className="grid grid-cols-6 gap-2">
        {channels.map(channel => {
          const count = pendingInquiries.filter(i => i.channel === channel.id).length;
          return (
            <Card key={channel.id} className={`bg-${channel.color}-500/10 border-${channel.color}-500/30`}>
              <CardContent className="p-2 text-center">
                <channel.icon className={`w-4 h-4 text-${channel.color}-400 mx-auto`} />
                <p className="text-white font-bold text-sm mt-1">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Pending Inquiries */}
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              استفسارات في الانتظار
              <Badge className="bg-amber-500/20 text-amber-400">{pendingInquiries.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {pendingInquiries.map(inquiry => {
                  const channel = getChannelConfig(inquiry.channel);
                  return (
                    <div key={inquiry.id} className="p-3 bg-slate-900/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <channel.icon className={`w-4 h-4 text-${channel.color}-400`} />
                          <Badge className={`text-xs ${
                            inquiry.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                            inquiry.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                            'bg-slate-600'
                          }`}>
                            {inquiry.sentiment === 'negative' ? 'سلبي' : inquiry.sentiment === 'positive' ? 'إيجابي' : 'محايد'}
                          </Badge>
                        </div>
                        <Button size="sm" className="h-6 bg-cyan-600" onClick={() => routeInquiry(inquiry)}>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-slate-300 text-xs">{inquiry.message}</p>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Routing Log */}
        <Card className="bg-green-500/10 border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              سجل التوجيه
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {routingLog.map(log => (
                  <div key={log.id} className="p-2 bg-slate-900/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm font-medium">{log.routing.department}</span>
                      <span className="text-slate-500 text-xs">{log.time.toLocaleTimeString('ar-SA')}</span>
                    </div>
                    <p className="text-slate-400 text-xs">{log.routing.routing_reason}</p>
                    {log.routing.post_interaction_tasks?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {log.routing.post_interaction_tasks.map((task, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-green-500/30 text-green-400">
                            {task}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}