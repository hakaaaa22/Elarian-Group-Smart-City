import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Mic, MicOff, Volume2, VolumeX, Send, X, MessageSquare, Loader2,
  Lightbulb, Thermometer, Lock, Camera, Play, Pause, Settings,
  Check, AlertCircle, Brain, Zap, Clock, Home, Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const commandExamples = [
  { text: 'شغّل أضواء غرفة المعيشة', icon: Lightbulb, category: 'إضاءة' },
  { text: 'اضبط المكيف على 22 درجة', icon: Thermometer, category: 'تكييف' },
  { text: 'أغلق جميع الأبواب', icon: Lock, category: 'أمان' },
  { text: 'شغّل وضع السينما', icon: Play, category: 'مشاهد' },
  { text: 'ما حالة البطارية للأجهزة؟', icon: Zap, category: 'حالة' },
  { text: 'أنشئ أتمتة لإطفاء الأضواء الساعة 11', icon: Clock, category: 'أتمتة' },
  { text: 'كم استهلاك الطاقة اليوم؟', icon: Zap, category: 'طاقة' },
  { text: 'فعّل وضع توفير الطاقة', icon: Zap, category: 'طاقة' },
  { text: 'ما درجة حرارة المنزل؟', icon: Thermometer, category: 'حالة' },
];

// Advanced automation voice commands
const automationCommands = [
  { text: 'عندما أغادر المنزل، أطفئ كل الأجهزة واقفل الأبواب', type: 'complex' },
  { text: 'إذا ارتفعت الحرارة عن 28، شغّل المكيف تلقائياً', type: 'conditional' },
  { text: 'كل يوم الساعة 7 صباحاً، افتح الستائر وشغّل القهوة', type: 'scheduled' },
  { text: 'عند اكتشاف حركة بعد منتصف الليل، أرسل لي إشعار', type: 'security' },
  { text: 'في ساعات الذروة، خفض استهلاك الطاقة', type: 'energy' },
  { text: 'عندما تنخفض البطارية عن 20%، أوقف الأجهزة غير الضرورية', type: 'battery' },
];

const voiceWaveColors = ['#22d3ee', '#a855f7', '#6366f1', '#22d3ee', '#a855f7'];

export default function VoiceAssistant({ devices, onCommand }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'مرحباً! أنا مساعدك الذكي للمنزل. كيف يمكنني مساعدتك اليوم؟', timestamp: new Date() }
  ]);
  const [waveAmplitudes, setWaveAmplitudes] = useState([0.3, 0.5, 0.4, 0.6, 0.3]);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const processCommandMutation = useMutation({
    mutationFn: async (command) => {
      const deviceList = devices?.map(d => `${d.name} (${d.category || d.type}, ${d.room}, حالة: ${d.state?.on ? 'مشغّل' : 'مطفأ'}, بروتوكول: ${d.protocol || 'غير محدد'})`).join('\n') || 'لا توجد أجهزة';
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مساعد ذكي متقدم للمنزل الذكي مع دعم كامل لـ Matter و Thread و Wi-Fi.

المستخدم أعطاك الأمر التالي: "${command}"

الأجهزة المتاحة:
${deviceList}

أنت تدعم:
1. التحكم بالأجهزة (تشغيل/إيقاف/ضبط القيم)
2. إنشاء أتمتة معقدة متعددة الشروط
3. أتمتة صوتية متقدمة (IFTTT style)
4. استعلامات عن حالة الأجهزة والنظام
5. تشغيل السيناريوهات
6. إنشاء جداول زمنية
7. إدارة الطاقة (استعلام الاستهلاك، تفعيل وضع التوفير)
8. التحكم بالبطارية (حالة الشحن، وضع التشغيل)
9. تقارير التكلفة والاستهلاك

قم بتحليل الأمر بعمق وأعد JSON بالتنسيق التالي:
{
  "understood": true/false,
  "action_type": "control_device" | "create_automation" | "create_workflow" | "query_status" | "scene_activation" | "schedule_action" | "general_question",
  "target_devices": ["أسماء الأجهزة المستهدفة"],
  "action": "on" | "off" | "set_temperature" | "set_brightness" | "lock" | "unlock" | etc,
  "value": "القيمة إن وجدت",
  "response": "الرد على المستخدم باللغة العربية بشكل ودود ومفصل",
  "automation_details": {
    "name": "اسم الأتمتة المقترح",
    "trigger_type": "time" | "device_state" | "location" | "sensor" | "manual",
    "trigger": "وصف المشغّل",
    "conditions": ["الشروط إن وجدت"],
    "actions": ["قائمة الإجراءات"],
    "schedule": "الجدول الزمني إن وجد"
  },
  "workflow_steps": [
    {"step": 1, "type": "trigger", "description": "الوصف"},
    {"step": 2, "type": "condition", "description": "الوصف"},
    {"step": 3, "type": "action", "description": "الوصف"}
  ],
  "confidence": 0.95,
  "suggestions": ["اقتراحات إضافية للمستخدم"]
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            understood: { type: 'boolean' },
            action_type: { type: 'string' },
            target_devices: { type: 'array', items: { type: 'string' } },
            action: { type: 'string' },
            value: { type: 'string' },
            response: { type: 'string' },
            automation_details: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                trigger_type: { type: 'string' },
                trigger: { type: 'string' },
                conditions: { type: 'array', items: { type: 'string' } },
                actions: { type: 'array', items: { type: 'string' } },
                schedule: { type: 'string' }
              }
            },
            workflow_steps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  step: { type: 'number' },
                  type: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            },
            confidence: { type: 'number' },
            suggestions: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      return response;
    },
    onSuccess: (result, command) => {
      const assistantMessage = {
        role: 'assistant',
        content: result.response,
        action: result,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      if (result.understood && onCommand) {
        onCommand(result);
      }
      
      // Simulate speaking
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 2000);
    },
    onError: () => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.',
        timestamp: new Date()
      }]);
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setWaveAmplitudes(prev => prev.map(() => 0.2 + Math.random() * 0.8));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isListening]);

  const startListening = () => {
    setIsListening(true);
    // Simulate speech recognition
    setTimeout(() => {
      const simulatedCommands = [
        'شغّل أضواء غرفة المعيشة',
        'اضبط درجة حرارة المكيف على 24',
        'ما حالة الأجهزة الآن؟'
      ];
      const randomCommand = simulatedCommands[Math.floor(Math.random() * simulatedCommands.length)];
      setInputText(randomCommand);
      setIsListening(false);
      handleSend(randomCommand);
    }, 2000);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const handleSend = (text = inputText) => {
    if (!text.trim()) return;
    
    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    processCommandMutation.mutate(text);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const executeQuickCommand = (command) => {
    setInputText(command);
    handleSend(command);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg shadow-cyan-500/30 flex items-center justify-center"
      >
        <Mic className="w-6 h-6 text-white" />
      </motion.button>

      {/* Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 left-6 z-50 w-96 max-w-[calc(100vw-48px)]"
          >
            <Card className="glass-card border-indigo-500/30 bg-[#0f1629]/95 backdrop-blur-xl shadow-2xl">
              {/* Header */}
              <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">المساعد الذكي</h3>
                    <p className="text-slate-400 text-xs">
                      {isListening ? 'جاري الاستماع...' : isSpeaking ? 'جاري التحدث...' : 'جاهز للمساعدة'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Voice Wave Animation */}
              <AnimatePresence>
                {(isListening || isSpeaking) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 py-6 border-b border-slate-700/50 flex items-center justify-center gap-1"
                  >
                    {waveAmplitudes.map((amp, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: amp * 40 }}
                        transition={{ duration: 0.1 }}
                        className="w-2 rounded-full"
                        style={{ backgroundColor: voiceWaveColors[i] }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <div className="h-64 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-cyan-500/20 text-white rounded-br-none' 
                        : 'bg-slate-700/50 text-white rounded-bl-none'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      {msg.action?.target_devices?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {msg.action.target_devices.map((device, di) => (
                            <Badge key={di} className="bg-green-500/20 text-green-400 text-xs">
                              <Check className="w-3 h-3 ml-1" />
                              {device}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {msg.action?.automation_details?.name && (
                        <div className="mt-2 p-2 bg-purple-500/10 rounded-lg border border-purple-500/30">
                          <p className="text-purple-300 text-xs font-medium mb-1">أتمتة جديدة:</p>
                          <p className="text-white text-xs">{msg.action.automation_details.name}</p>
                          {msg.action.automation_details.actions?.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {msg.action.automation_details.actions.map((a, ai) => (
                                <Badge key={ai} variant="outline" className="border-purple-500/50 text-purple-300 text-[10px]">{a}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {msg.action?.workflow_steps?.length > 0 && (
                        <div className="mt-2 p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                          <p className="text-cyan-300 text-xs font-medium mb-1">خطوات العمل:</p>
                          {msg.action.workflow_steps.map((step, si) => (
                            <div key={si} className="flex items-center gap-2 text-[10px] text-white">
                              <span className="w-4 h-4 rounded-full bg-cyan-500/30 flex items-center justify-center">{step.step}</span>
                              {step.description}
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.action?.suggestions?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-slate-400 text-[10px] mb-1">اقتراحات:</p>
                          <div className="flex flex-wrap gap-1">
                            {msg.action.suggestions.slice(0, 2).map((s, si) => (
                              <button
                                key={si}
                                onClick={() => executeQuickCommand(s)}
                                className="text-[10px] px-2 py-0.5 bg-slate-700/50 rounded-full text-cyan-300 hover:bg-slate-600/50"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-slate-500 text-[10px] mt-1">
                        {msg.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {processCommandMutation.isPending && (
                  <div className="flex justify-end">
                    <div className="bg-slate-700/50 p-3 rounded-2xl rounded-bl-none">
                      <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Commands */}
              <div className="px-4 pb-2">
                <p className="text-slate-500 text-xs mb-2">أوامر سريعة:</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {commandExamples.slice(0, 3).map((cmd, i) => (
                    <button
                      key={i}
                      onClick={() => executeQuickCommand(cmd.text)}
                      className="flex-shrink-0 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-full text-xs text-slate-300 transition-colors"
                    >
                      {cmd.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-700/50">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={isListening ? stopListening : startListening}
                    className={`border-slate-600 ${isListening ? 'bg-red-500/20 border-red-500/50 text-red-400' : ''}`}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="اكتب أمرك هنا..."
                    className="bg-slate-800/50 border-slate-700 text-white flex-1"
                    dir="rtl"
                  />
                  <Button
                    onClick={() => handleSend()}
                    disabled={!inputText.trim() || processCommandMutation.isPending}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}