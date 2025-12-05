import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Mic, MicOff, Volume2, VolumeX, Navigation, AlertTriangle, Truck,
  Wrench, CheckCircle, MapPin, Fuel, Clock, Send, RefreshCw,
  Radio, Phone, Bell, Route, Thermometer, Battery
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const truckStatus = {
  id: 'TRK-001',
  plate: 'أ ب ج 1234',
  driver: 'محمد أحمد',
  fuel: 72,
  engine_temp: 85,
  oil_pressure: 42,
  battery: 95,
  mileage: 45230,
  currentLoad: 65,
  maxLoad: 100,
  currentRoute: 'المسار A',
  nextStop: 'حاوية BIN-005 - شارع الملك فهد',
  eta: '8 دقائق',
  binsCollected: 8,
  totalBins: 15,
};

const maintenanceAlerts = [
  { id: 1, type: 'warning', message: 'تغيير زيت المحرك مستحق خلال 500 كم', priority: 'medium' },
  { id: 2, type: 'info', message: 'فحص الإطارات الأمامية موصى به', priority: 'low' },
];

const trafficAlerts = [
  { id: 1, type: 'delay', location: 'شارع الملك فهد', delay: 12, alternative: 'شارع العليا' },
];

export default function DriverAIAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'مرحباً! أنا مساعدك الذكي. يمكنني مساعدتك في الملاحة، تحديثات الحالة، وتنبيهات الصيانة. كيف يمكنني مساعدتك؟' }
  ]);
  const [inputText, setInputText] = useState('');
  const [routeStatus, setRouteStatus] = useState(truckStatus);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRouteStatus(prev => ({
        ...prev,
        fuel: Math.max(0, prev.fuel - 0.1),
        engine_temp: 85 + (Math.random() - 0.5) * 4,
        currentLoad: Math.min(100, prev.currentLoad + (Math.random() > 0.7 ? 5 : 0))
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const processCommand = useMutation({
    mutationFn: async (command) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مساعد AI ذكي للسائقين في نظام إدارة النفايات. قم بالرد على الأمر التالي بشكل مختصر ومفيد:

الأمر: "${command}"

حالة الشاحنة الحالية:
- الوقود: ${routeStatus.fuel}%
- حرارة المحرك: ${routeStatus.engine_temp}°C
- الحمولة: ${routeStatus.currentLoad}%
- المسار الحالي: ${routeStatus.currentRoute}
- الحاويات المجموعة: ${routeStatus.binsCollected}/${routeStatus.totalBins}
- المحطة التالية: ${routeStatus.nextStop}
- الوقت المتوقع: ${routeStatus.eta}

تنبيهات الصيانة: ${maintenanceAlerts.map(a => a.message).join(', ')}
تنبيهات المرور: ${trafficAlerts.map(a => `تأخير ${a.delay} دقيقة في ${a.location}`).join(', ')}

أجب بشكل مختصر ومفيد. إذا كان الأمر متعلقاً بالملاحة، قدم توجيهات واضحة. إذا كان متعلقاً بالحالة، قدم المعلومات المطلوبة.`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            action: { type: "string" },
            alertType: { type: "string" },
            routeUpdate: {
              type: "object",
              properties: {
                newRoute: { type: "string" },
                reason: { type: "string" },
                timeSaved: { type: "number" }
              }
            },
            sendToDashboard: { type: "boolean" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      
      if (data.sendToDashboard) {
        toast.info('تم إرسال التحديث للوحة التحكم المركزية');
      }
      
      if (data.routeUpdate?.newRoute) {
        toast.success(`تم تحديث المسار: ${data.routeUpdate.newRoute}`);
      }
    }
  });

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: inputText }]);
    processCommand.mutate(inputText);
    setInputText('');
  };

  const quickCommands = [
    { label: 'حالة الشاحنة', command: 'ما حالة الشاحنة الآن؟' },
    { label: 'المحطة التالية', command: 'ما هي المحطة التالية؟' },
    { label: 'تحديث المسار', command: 'هل يوجد طريق أسرع؟' },
    { label: 'إبلاغ عن مشكلة', command: 'أريد الإبلاغ عن مشكلة في الشاحنة' },
  ];

  const sendStatusUpdate = () => {
    toast.success('تم إرسال تحديث الحالة للوحة التحكم');
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Truck Status Header */}
      <Card className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-green-500/10 border-cyan-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20">
                <Truck className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-white font-bold">{routeStatus.plate}</p>
                <p className="text-slate-400 text-sm">{routeStatus.driver}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="border-green-500 text-green-400" onClick={sendStatusUpdate}>
                <Radio className="w-4 h-4 ml-1" />
                إرسال تحديث
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="p-2 bg-slate-800/50 rounded-lg text-center">
              <Fuel className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <p className="text-white font-bold">{routeStatus.fuel.toFixed(0)}%</p>
              <Progress value={routeStatus.fuel} className="h-1 mt-1" />
            </div>
            <div className="p-2 bg-slate-800/50 rounded-lg text-center">
              <Thermometer className={`w-4 h-4 mx-auto mb-1 ${routeStatus.engine_temp > 90 ? 'text-red-400' : 'text-green-400'}`} />
              <p className="text-white font-bold">{routeStatus.engine_temp.toFixed(0)}°C</p>
              <p className="text-slate-500 text-[10px]">المحرك</p>
            </div>
            <div className="p-2 bg-slate-800/50 rounded-lg text-center">
              <Battery className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <p className="text-white font-bold">{routeStatus.battery}%</p>
              <p className="text-slate-500 text-[10px]">البطارية</p>
            </div>
            <div className="p-2 bg-slate-800/50 rounded-lg text-center">
              <Route className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <p className="text-white font-bold">{routeStatus.binsCollected}/{routeStatus.totalBins}</p>
              <p className="text-slate-500 text-[10px]">الحاويات</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Route Info */}
      <Card className="glass-card border-green-500/30 bg-green-500/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Navigation className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-medium">المحطة التالية</p>
                <p className="text-green-400 text-sm">{routeStatus.nextStop}</p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400">
              <Clock className="w-3 h-3 ml-1" />
              {routeStatus.eta}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {(maintenanceAlerts.length > 0 || trafficAlerts.length > 0) && (
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              التنبيهات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {trafficAlerts.map(alert => (
              <div key={alert.id} className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">⚠️ تأخير {alert.delay} دقيقة - {alert.location}</p>
                <p className="text-slate-400 text-xs">البديل: {alert.alternative}</p>
              </div>
            ))}
            {maintenanceAlerts.map(alert => (
              <div key={alert.id} className={`p-2 rounded-lg ${alert.priority === 'medium' ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-blue-500/10 border border-blue-500/30'}`}>
                <p className={`text-sm ${alert.priority === 'medium' ? 'text-amber-400' : 'text-blue-400'}`}>
                  {alert.type === 'warning' ? '⚠️' : 'ℹ️'} {alert.message}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AI Chat */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Mic className="w-4 h-4 text-cyan-400" />
            المساعد الذكي
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Quick Commands */}
          <div className="flex flex-wrap gap-2 mb-3">
            {quickCommands.map((cmd, i) => (
              <Button
                key={i}
                size="sm"
                variant="outline"
                className="border-slate-600 text-slate-300 text-xs h-7"
                onClick={() => {
                  setMessages(prev => [...prev, { role: 'user', content: cmd.command }]);
                  processCommand.mutate(cmd.command);
                }}
              >
                {cmd.label}
              </Button>
            ))}
          </div>

          {/* Messages */}
          <ScrollArea className="h-48 mb-3">
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-cyan-500/20 mr-8'
                      : 'bg-slate-800/50 ml-8'
                  }`}
                >
                  <p className={`text-sm ${msg.role === 'user' ? 'text-cyan-300' : 'text-white'}`}>
                    {msg.content}
                  </p>
                </div>
              ))}
              {processCommand.isPending && (
                <div className="p-3 bg-slate-800/50 ml-8 rounded-lg">
                  <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اكتب أمرك أو سؤالك..."
              className="bg-slate-800/50 border-slate-700 text-white"
            />
            <Button
              onClick={handleSend}
              disabled={processCommand.isPending}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Send className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className={`border-slate-600 ${isListening ? 'bg-red-500/20 border-red-500' : ''}`}
              onClick={() => setIsListening(!isListening)}
            >
              {isListening ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}